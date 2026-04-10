import { NextRequest, NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  const supabase = await createRouteClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ matches: [] });
  const { data } = await supabase
    .from("wishlist_matches")
    .select(`id, created_at, dismissed, match_score, price_delta_pct, listing_id,
      marketplace_listings!wishlist_matches_listing_id_fkey(
        id, price, condition, note, created_at,
        cards!marketplace_listings_card_id_fkey(id, name, name_de, set_id, number, image_url, price_market),
        profiles!marketplace_listings_user_id_fkey(username, avatar_url)
      )`)
    .eq("wishlist_user_id", user.id).eq("dismissed", false)
    .order("created_at", { ascending: false }).limit(30);
  return NextResponse.json({ matches: data ?? [] });
}
export async function PATCH(request: NextRequest) {
  const supabase = await createRouteClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  const { id } = await request.json();
  await supabase.from("wishlist_matches").update({ dismissed: true })
    .eq("id", id).eq("wishlist_user_id", user.id);
  return NextResponse.json({ ok: true });
}
