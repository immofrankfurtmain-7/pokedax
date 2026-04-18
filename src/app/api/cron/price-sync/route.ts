"use server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get("secret") !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  let synced = 0, errors = 0;
  const today = new Date().toISOString().split("T")[0];
  let from = 0;
  while (true) {
    const { data: cards, error } = await supabase
      .from("cards").select("id,price_market,price_low,price_avg7")
      .not("price_market","is",null).range(from, from + 499);
    if (error || !cards?.length) break;
    const rows = cards.map(c => ({
      card_id: c.id, recorded_at: today,
      price: c.price_market, price_low: c.price_low,
      price_avg: c.price_avg7, source: "cardmarket",
    }));
    const { error: e2 } = await supabase.from("price_history")
      .upsert(rows, { onConflict: "card_id,recorded_at", ignoreDuplicates: true });
    if (e2) { errors++; console.error(e2.message); }
    else synced += rows.length;
    if (cards.length < 500) break;
    from += 500;
  }
  return NextResponse.json({ synced, errors, date: today });
}
