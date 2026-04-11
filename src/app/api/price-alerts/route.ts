import { NextRequest, NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/server";

// GET /api/price-alerts?card_id=xxx — check if user has alert for card
export async function GET(request: NextRequest) {
  const supabase = await createRouteClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ alert: null });

  const card_id = new URL(request.url).searchParams.get("card_id");
  if (!card_id) return NextResponse.json({ alerts: [] });

  const { data } = await supabase.from("price_alerts")
    .select("id, target_price, is_active, notified")
    .eq("user_id", user.id)
    .eq("card_id", card_id)
    .eq("is_active", true)
    .single();

  return NextResponse.json({ alert: data ?? null });
}

// POST /api/price-alerts
export async function POST(request: NextRequest) {
  const supabase = await createRouteClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const { card_id, target_price } = await request.json();
  if (!card_id || !target_price) return NextResponse.json({ error: "Pflichtfelder fehlen" }, { status: 400 });

  // Upsert alert
  const { data, error } = await supabase.from("price_alerts")
    .upsert({ user_id: user.id, card_id, target_price, is_active: true, notified: false },
             { onConflict: "user_id,card_id" })
    .select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ alert: data });
}

// DELETE /api/price-alerts?card_id=xxx
export async function DELETE(request: NextRequest) {
  const supabase = await createRouteClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const card_id = new URL(request.url).searchParams.get("card_id");
  await supabase.from("price_alerts").delete().eq("user_id", user.id).eq("card_id", card_id ?? "");
  return NextResponse.json({ ok: true });
}
