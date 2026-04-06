import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const season = getCurrentSeason();

  const selectTeams = "id, name, season, user_id, profiles!fantasy_teams_user_id_fkey(username, avatar_url), fantasy_picks(bought_at_price, quantity, cards!fantasy_picks_card_id_fkey(price_market))";

  const { data: teams } = await supabase
    .from("fantasy_teams")
    .select(selectTeams)
    .eq("season", season)
    .limit(50);

  const scored = (teams ?? []).map((t: any) => {
    const picks = t.fantasy_picks ?? [];
    let score = 0;
    let currentValue = 0;
    let boughtValue = 0;

    for (const p of picks) {
      const current = p.cards?.price_market ?? p.bought_at_price;
      const bought  = p.bought_at_price;
      const qty     = p.quantity ?? 1;
      currentValue += current * qty;
      boughtValue  += bought  * qty;
      if (bought > 0) score += ((current - bought) / bought) * 100;
    }

    return {
      id:            t.id,
      name:          t.name,
      username:      t.profiles?.username ?? "Anonym",
      avatar_url:    t.profiles?.avatar_url,
      picks_count:   picks.length,
      current_value: Math.round(currentValue * 100) / 100,
      bought_value:  Math.round(boughtValue * 100) / 100,
      score:         Math.round(score * 10) / 10,
    };
  }).sort((a: any, b: any) => b.score - a.score);

  return NextResponse.json({ leaderboard: scored, season });
}

function getCurrentSeason(): string {
  const now = new Date();
  const q = Math.ceil((now.getMonth() + 1) / 3);
  return now.getFullYear() + "-Q" + q;
}
