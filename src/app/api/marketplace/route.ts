import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/marketplace?card_id=xxx&type=offer|want
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const card_id = searchParams.get("card_id");
  const type    = searchParams.get("type"); // "offer" | "want" | null (both)

  if (!card_id) {
    return NextResponse.json({ error: "card_id required" }, { status: 400 });
  }

  const supabase = await createClient();

  let query = supabase
    .from("marketplace_listings")
    .select(`
      id, type, price, condition, note, created_at,
      user_id,
      profiles!marketplace_listings_user_id_fkey(username, avatar_url)
    `)
    .eq("card_id", card_id)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(20);

  if (type) query = query.eq("type", type);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ listings: data ?? [] });
}

// POST /api/marketplace — create listing
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const body = await request.json();
  const { card_id, type, price, condition = "NM", note = "" } = body;

  if (!card_id || !type || !["offer","want"].includes(type)) {
    return NextResponse.json({ error: "Ungültige Daten" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("marketplace_listings")
    .insert({ user_id: user.id, card_id, type, price, condition, note })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ listing: data });
}

// DELETE /api/marketplace?id=xxx
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await supabase
    .from("marketplace_listings")
    .update({ is_active: false })
    .eq("id", id)
    .eq("user_id", user.id);

  return NextResponse.json({ ok: true });
}
