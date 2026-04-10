import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
export const dynamic = "force-dynamic";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
export async function GET() {
  try {
    const { data: entries } = await supabase
      .from("user_collection")
      .select("user_id, quantity, cards!user_collection_card_id_fkey(price_market)")
      .not("cards", "is", null);
    const byUser: Record<string, number> = {};
    for (const e of (entries ?? [])) {
      if (!e.user_id) continue;
      byUser[e.user_id] = (byUser[e.user_id] ?? 0) + ((e as any).cards?.price_market ?? 0) * (e.quantity ?? 1);
    }
    const topIds = Object.entries(byUser).sort((a,b)=>b[1]-a[1]).slice(0,25).map(([id])=>id);
    if (!topIds.length) return NextResponse.json({ leaderboard: [] });
    const { data: profiles } = await supabase
      .from("profiles").select("id, username, is_premium, created_at").in("id", topIds);
    const pm: Record<string,any> = {};
    for (const p of profiles ?? []) pm[p.id] = p;
    const leaderboard = topIds.map((uid, i) => ({
      rank: i+1, user_id: uid,
      username: pm[uid]?.username ?? "Anonym",
      is_premium: pm[uid]?.is_premium ?? false,
      total_value: Math.round((byUser[uid] ?? 0) * 100) / 100,
      member_since: pm[uid]?.created_at ?? null,
    }));
    return NextResponse.json({ leaderboard });
  } catch { return NextResponse.json({ leaderboard: [] }); }
}
