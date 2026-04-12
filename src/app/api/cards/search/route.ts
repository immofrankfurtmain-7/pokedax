import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 0;
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q     = searchParams.get("q")    || "";
  const set   = searchParams.get("set")  || "";
  const sort  = searchParams.get("sort") || "number_asc";
  const limit = Math.min(parseInt(searchParams.get("limit") || "48"), 500);

  const SELECT = "id,name,name_de,set_id,number,rarity,types,image_url,price_market,price_low,price_avg7,price_avg30,hp,category,stage,is_holo,is_reverse_holo";
  let query = supabase.from("cards").select(SELECT);

  if (q)   query = query.or(`name.ilike.%${q}%,name_de.ilike.%${q}%`);
  if (set) query = query.eq("set_id", set);

  const holo = searchParams.get("holo");
  if (holo === "1") query = query.eq("is_holo", true);

  // Only filter by price when NOT browsing a specific set
  if (!set && !q) query = query.not("price_market", "is", null);

  // Sort: when browsing a set, sort by card number by default
  switch (sort) {
    case "number_asc":  query = query.order("number",       { ascending: true });  break;
    case "price_asc":   query = query.order("price_market", { ascending: true });  break;
    case "price_desc":  query = query.order("price_market", { ascending: false }); break;
    case "name_asc":    query = query.order("name",         { ascending: true });  break;
    case "trend_desc":  query = query.order("price_avg7",   { ascending: false }); break;
    default:            query = query.order("number",       { ascending: true });  break;
  }
  query = query.limit(limit);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ cards: data || [], total: data?.length || 0 });
}
