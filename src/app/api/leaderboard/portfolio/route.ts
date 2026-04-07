import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 300;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Get all collection entries with card prices
    const { data: entries, error } = await supabase
      .from("user_collection")
      .select("user_id, quantity, cards!user_collection_card_id_fkey(price_market)")
      .not("cards", "is", null);

    if (error) throw error;

    // Aggregate per user
    const byUser: Record<string, number> = {};
    for (const e of (entries ?? [])) {
      if (!e.user_id) continue;
      const price = (e as any).cards?.price_market ?? 0;
      const qty   = e.quantity ?? 1;
      byUser[e.user_id] = (byUser[e.user_id] ?? 0) + price * qty;
    }

    if (Object.keys(byUser).length === 0) {
      return NextResponse.json({ leaderboard: [] });
    }

    // Fetch profiles for top users
    const topUserIds = Object.entries(byUser)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 25)
      .map(([id]) => id);

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username, avatar_url, is_premium, created_at")
      .in("id", topUserIds);

    const profileMap: Record<string, any> = {};
    for (const p of profiles ?? []) profileMap[p.id] = p;

    // Build leaderboard
    const leaderboard = topUserIds.map((userId, rank) => {
      const p = profileMap[userId];
      const totalValue = byUser[userId] ?? 0;
      return {
        rank:        rank + 1,
        user_id:     userId,
        username:    p?.username ?? "Anonym",
        avatar_url:  p?.avatar_url ?? null,
        is_premium:  p?.is_premium ?? false,
        total_value: Math.round(totalValue * 100) / 100,
        member_since: p?.created_at ?? null,
      };
    });

    return NextResponse.json({ leaderboard });
  } catch (err) {
    console.error("Portfolio leaderboard error:", err);
    return NextResponse.json({ leaderboard: [] });
  }
}
