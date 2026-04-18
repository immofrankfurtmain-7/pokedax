"use server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  let synced = 0, errors = 0;

  // Get all cards with prices
  const { data: cards } = await supabase
    .from("cards")
    .select("id, price_market, price_low, price_avg7")
    .not("price_market", "is", null)
    .limit(5000);

  if (!cards?.length) return NextResponse.json({ synced: 0 });

  // Insert today's prices into price_history
  const today = new Date().toISOString().split("T")[0];
  const rows = cards.map(c => ({
    card_id:   c.id,
    date:      today,
    price:     c.price_market,
    price_low: c.price_low,
    price_avg: c.price_avg7,
    source:    "cardmarket",
  }));

  // Batch insert in chunks of 500
  for (let i = 0; i < rows.length; i += 500) {
    const chunk = rows.slice(i, i + 500);
    const { error } = await supabase
      .from("price_history")
      .upsert(chunk, { onConflict: "card_id,date" });
    if (error) { errors++; console.error("Price sync error:", error.message); }
    else synced += chunk.length;
  }

  return NextResponse.json({ synced, errors, date: today });
}
