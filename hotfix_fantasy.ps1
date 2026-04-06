# PokéDax — Hotfix fantasy routes (backtick escape fix)
$root = "C:\Users\lenovo\pokedax\pokedax\pokedax"
$enc  = New-Object System.Text.UTF8Encoding $true

$fantasyTeam = @'
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ team: null, picks: [] });

  const season = getCurrentSeason();

  const { data: team } = await supabase
    .from("fantasy_teams")
    .select("*")
    .eq("user_id", user.id)
    .eq("season", season)
    .single();

  if (!team) return NextResponse.json({ team: null, picks: [] });

  const selectPicks = "id, bought_at_price, quantity, picked_at, cards!fantasy_picks_card_id_fkey(id, name, name_de, set_id, number, price_market, image_url, types)";

  const { data: picks } = await supabase
    .from("fantasy_picks")
    .select(selectPicks)
    .eq("team_id", team.id);

  let score = 0;
  const enrichedPicks = (picks ?? []).map((p: any) => {
    const current = p.cards?.price_market ?? p.bought_at_price;
    const gain    = ((current - p.bought_at_price) / p.bought_at_price) * 100;
    score += gain;
    return { ...p, current_price: current, gain_pct: Math.round(gain * 10) / 10 };
  });

  return NextResponse.json({ team: { ...team, score: Math.round(score * 10) / 10 }, picks: enrichedPicks });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const body = await request.json();
  const { card_id } = body;
  if (!card_id) return NextResponse.json({ error: "card_id required" }, { status: 400 });

  const season = getCurrentSeason();

  let { data: team } = await supabase
    .from("fantasy_teams")
    .select("id")
    .eq("user_id", user.id)
    .eq("season", season)
    .single();

  if (!team) {
    const { data: newTeam } = await supabase
      .from("fantasy_teams")
      .insert({ user_id: user.id, season, name: "Mein Team" })
      .select()
      .single();
    team = newTeam;
  }

  if (!team) return NextResponse.json({ error: "Team-Fehler" }, { status: 500 });

  const { count } = await supabase
    .from("fantasy_picks")
    .select("*", { count: "exact", head: true })
    .eq("team_id", team.id);

  if ((count ?? 0) >= 5) {
    return NextResponse.json({ error: "MAX_PICKS", message: "Maximal 5 Karten pro Team" }, { status: 400 });
  }

  const { data: card } = await supabase
    .from("cards")
    .select("id, price_market")
    .eq("id", card_id)
    .single();

  if (!card?.price_market) {
    return NextResponse.json({ error: "Karte nicht gefunden" }, { status: 404 });
  }

  const { data: existing } = await supabase
    .from("fantasy_picks")
    .select("bought_at_price, quantity")
    .eq("team_id", team.id);

  const spent = (existing ?? []).reduce((s: number, p: any) => s + (p.bought_at_price * p.quantity), 0);
  if (spent + card.price_market > 1000) {
    return NextResponse.json({ error: "BUDGET_EXCEEDED", spent, budget: 1000 }, { status: 400 });
  }

  const { data: pick, error } = await supabase
    .from("fantasy_picks")
    .insert({ team_id: team.id, card_id, bought_at_price: card.price_market })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ pick, spent: spent + card.price_market });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const pick_id = new URL(request.url).searchParams.get("pick_id");
  if (!pick_id) return NextResponse.json({ error: "pick_id required" }, { status: 400 });

  const { data: userTeams } = await supabase
    .from("fantasy_teams")
    .select("id")
    .eq("user_id", user.id);

  const teamIds = (userTeams ?? []).map((t: any) => t.id);
  if (teamIds.length === 0) return NextResponse.json({ ok: true });

  await supabase
    .from("fantasy_picks")
    .delete()
    .eq("id", pick_id)
    .in("team_id", teamIds);

  return NextResponse.json({ ok: true });
}

function getCurrentSeason(): string {
  const now = new Date();
  const q = Math.ceil((now.getMonth() + 1) / 3);
  return now.getFullYear() + "-Q" + q;
}

'@
[System.IO.File]::WriteAllText("$root\src\app\api\fantasy\team\route.ts", $fantasyTeam, $enc)
Write-Host "  OK  fantasy/team/route.ts" -ForegroundColor Green

$fantasyLB = @'
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

'@
[System.IO.File]::WriteAllText("$root\src\app\api\fantasy\leaderboard\route.ts", $fantasyLB, $enc)
Write-Host "  OK  fantasy/leaderboard/route.ts" -ForegroundColor Green

Write-Host ""
Write-Host "Hotfix fertig! GitHub Desktop -> Commit 'hotfix: fantasy routes' -> Push" -ForegroundColor Yellow
