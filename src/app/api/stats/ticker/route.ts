export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 300; // 5 Minuten Cache

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data } = await supabase
      .from("cards")
      .select("name, set_id, price_market, price_avg7, price_avg30")
      .not("price_market", "is", null)
      .not("price_avg7",   "is", null)
      .gt("price_market", 5)
      .order("price_market", { ascending: false })
      .limit(30);

    if (!data?.length) {
      return NextResponse.json({ cards: [] });
    }

    const cards = data
      .filter(c => c.price_avg7 && c.price_avg30 && c.price_avg30 > 0)
      .map(c => ({
        name:   c.name,
        set:    c.set_id?.toUpperCase() || "TCG",
        price:  c.price_market,
        change: ((c.price_avg7 - c.price_avg30) / c.price_avg30) * 100,
      }))
      .slice(0, 20);

    return NextResponse.json({ cards });
  } catch {
    return NextResponse.json({ cards: [] });
  }
}
