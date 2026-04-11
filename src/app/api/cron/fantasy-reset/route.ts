import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function getSeason(date = new Date()) {
  const q = Math.ceil((date.getMonth() + 1) / 3);
  return `${date.getFullYear()}-Q${q}`;
}
function getPrevSeason() {
  const now = new Date();
  now.setMonth(now.getMonth() - 3);
  return getSeason(now);
}

// GET /api/cron/fantasy-reset — runs on 1st of each quarter
export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const prevSeason = getPrevSeason();
  const newSeason  = getSeason();

  // 1. Get all teams from previous season + their scores
  const { data: teams } = await sb
    .from("fantasy_teams")
    .select(`id, user_id, name,
      fantasy_picks(bought_at_price, quantity,
        cards!fantasy_picks_card_id_fkey(price_market))`)
    .eq("season", prevSeason);

  if (!teams?.length) {
    return NextResponse.json({ message: "No teams to reset", season: prevSeason });
  }

  // 2. Calculate final scores
  const scored = teams.map((t: any) => {
    const picks = t.fantasy_picks ?? [];
    const current = picks.reduce((s: number, p: any) =>
      s + (p.cards?.price_market ?? p.bought_at_price) * (p.quantity ?? 1), 0);
    const bought = picks.reduce((s: number, p: any) =>
      s + p.bought_at_price * (p.quantity ?? 1), 0);
    return { ...t, score: bought > 0 ? ((current - bought) / bought * 100) : 0, current };
  }).sort((a: any, b: any) => b.score - a.score);

  const winner = scored[0];

  // 3. Award Champion badge to winner
  if (winner) {
    await sb.from("user_badges").upsert({
      user_id:    winner.user_id,
      badge_key:  `champion_${prevSeason}`,
      label:      `Fantasy Champion ${prevSeason}`,
      icon:       "🏆",
      awarded_at: new Date().toISOString(),
    }, { onConflict: "user_id,badge_key" });
  }

  // 4. Archive: mark old picks as archived (don't delete for history)
  await sb.from("fantasy_teams")
    .update({ archived: true } as any)
    .eq("season", prevSeason);

  return NextResponse.json({
    reset: true,
    prev_season: prevSeason,
    new_season: newSeason,
    teams_processed: teams.length,
    winner: winner ? {
      username: winner.user_id,
      score: winner.score.toFixed(2),
    } : null,
  });
}
