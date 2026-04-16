import { NextRequest, NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/server";

// POST /api/marketplace/reviews
export async function POST(request: NextRequest) {
  const supabase = await createRouteClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const { escrow_id, rating, comment } = await request.json();

  if (!escrow_id || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Ungültige Daten" }, { status: 400 });
  }

  const { data: escrow } = await supabase
    .from("escrow_transactions")
    .select("buyer_id, seller_id, status")
    .eq("id", escrow_id)
    .single();

  if (!escrow) return NextResponse.json({ error: "Transaktion nicht gefunden" }, { status: 404 });
  if (escrow.status !== "released") return NextResponse.json({ error: "Transaktion noch nicht abgeschlossen" }, { status: 400 });

  const isBuyer  = escrow.buyer_id  === user.id;
  const isSeller = escrow.seller_id === user.id;
  if (!isBuyer && !isSeller) return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });

  const reviewed_id = isBuyer ? escrow.seller_id : escrow.buyer_id;

  const { data, error } = await supabase
    .from("marketplace_reviews")
    .insert({
      escrow_id,
      reviewer_id: user.id,
      reviewed_id,
      role: isBuyer ? "buyer" : "seller",
      rating,
      comment: comment?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "Bereits bewertet" }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Update avg_rating in seller_stats for the reviewed user
  const { data: allReviews } = await supabase
    .from("marketplace_reviews")
    .select("rating")
    .eq("reviewed_id", reviewed_id);

  if (allReviews?.length) {
    const avg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
    await supabase.from("seller_stats").upsert({
      user_id: reviewed_id,
      avg_rating: Math.round(avg * 100) / 100,
      rating_count: allReviews.length,
    });
  }

  return NextResponse.json({ review: data });
}

// GET /api/marketplace/reviews?user_id=xxx
export async function GET(request: NextRequest) {
  const supabase = await createRouteClient(request);
  const user_id = new URL(request.url).searchParams.get("user_id");
  if (!user_id) return NextResponse.json({ reviews: [] });

  const { data } = await supabase
    .from("marketplace_reviews")
    .select(`
      id, rating, comment, role, created_at,
      profiles!marketplace_reviews_reviewer_id_fkey(username)
    `)
    .eq("reviewed_id", user_id)
    .order("created_at", { ascending: false })
    .limit(20);

  const normalized = (data ?? []).map((r: any) => ({
    ...r,
    profiles: Array.isArray(r.profiles) ? r.profiles[0] : r.profiles,
  }));

  return NextResponse.json({ reviews: normalized });
}
