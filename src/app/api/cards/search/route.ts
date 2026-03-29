import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 0;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q        = searchParams.get("q")        || "";
  const set      = searchParams.get("set")       || "";
  const type     = searchParams.get("type")      || "";
  const category = searchParams.get("category")  || "";
  const sort     = searchParams.get("sort")      || "price_desc";
  const limit    = Math.min(parseInt(searchParams.get("limit") || "48"), 100);

  // All columns including new ones
  const SELECT = `
    id, name, name_de, set_id, number,
    rarity, rarity_id, types, image_url,
    price_market, price_low, price_avg7, price_avg30,
    hp, category, stage, illustrator,
    regulation_mark, is_holo, is_reverse_holo
  `.replace(/\s+/g, " ").trim();

  let query = supabase.from("cards").select(SELECT);

  // Search in both EN and DE name
  if (q) {
    query = query.or(`name.ilike.%${q}%,name_de.ilike.%${q}%`);
  }

  // Filters
  if (set)      query = query.eq("set_id", set);
  if (type)     query = query.contains("types", [type]);
  if (category) query = query.eq("category", category);

  // Only cards with a price
  query = query.not("price_market", "is", null);

  // Sort
  switch (sort) {
    case "price_asc":   query = query.order("price_market", { ascending: true });  break;
    case "name_asc":    query = query.order("name",         { ascending: true });  break;
    case "trend_desc":  query = query.order("price_avg7",   { ascending: false }); break;
    default:            query = query.order("price_market", { ascending: false }); break;
  }

  query = query.limit(limit);

  const { data, error } = await query;

  if (error) {
    console.error("Cards search error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ cards: data || [] });
}
