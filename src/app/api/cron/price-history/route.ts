import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
export const dynamic = "force-dynamic";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: cards, error } = await supabase
    .from("cards").select("id, price_market, price_low")
    .not("price_market", "is", null).order("price_market", { ascending: false }).limit(200);
  if (error || !cards?.length) return NextResponse.json({ error: "No cards" }, { status: 500 });
  const today = new Date().toISOString().split("T")[0];
  const rows = cards.map(c => ({ card_id: c.id, price_market: c.price_market, price_low: c.price_low, recorded_at: today }));
  const { error: insertErr } = await supabase.from("price_history")
    .upsert(rows, { onConflict: "card_id,recorded_at", ignoreDuplicates: true });
  if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 });
  return NextResponse.json({ recorded: rows.length, date: today });
}
