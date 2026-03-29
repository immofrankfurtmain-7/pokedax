import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const EN = "https://api.tcgdex.net/v2/en";
const DE = "https://api.tcgdex.net/v2/de";

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-admin-secret");
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [enSets, deSets] = await Promise.all([
    fetch(`${EN}/sets`).then(r => r.ok ? r.json() : []),
    fetch(`${DE}/sets`).then(r => r.ok ? r.json() : []),
  ]);

  if (!enSets?.length) {
    return NextResponse.json({ error: "TCGdex nicht erreichbar" }, { status: 500 });
  }

  // DE lookup by id
  const deMap: Record<string, string> = {};
  for (const s of (deSets || [])) {
    if (s.id) deMap[s.id] = s.name;
  }

  let inserted = 0, failed = 0;
  const log: string[] = [];

  for (const set of enSets) {
    if (!set.id) continue;

    // Fetch full details for logo/symbol/release date
    let details: any = {};
    try {
      const r = await fetch(`${EN}/sets/${set.id}`, { next: { revalidate: 86400 } });
      if (r.ok) details = await r.json();
    } catch { /* ignore */ }

    // Map to actual column names in Supabase
    const row = {
      id:                   set.id,
      name:                 set.name || details.name || set.id,
      name_de:              deMap[set.id] || null,
      series:               details.serie?.name || set.serie?.name || null,
      serie_en:             details.serie?.name || set.serie?.name || null,
      serie_de:             null, // DE series not easily available
      total:                details.cardCount?.total || set.cardCount || null,
      card_count:           details.cardCount?.total || set.cardCount || null,
      card_count_official:  details.cardCount?.official || null,
      release_date:         details.releaseDate || null,
      logo_url:             details.logo ? `${details.logo}.png` : null,
      symbol_url:           details.symbol ? `${details.symbol}.png` : null,
      regulation_mark:      details.regulationMark || null,
    };

    const { error } = await supabase
      .from("sets")
      .upsert(row, { onConflict: "id" });

    if (error) {
      failed++;
      log.push(`✗ ${set.id}: ${error.message}`);
    } else {
      inserted++;
      log.push(`✓ ${set.id}: ${row.name}${row.name_de ? ` / ${row.name_de}` : ""}`);
    }

    await new Promise(r => setTimeout(r, 50));
  }

  return NextResponse.json({
    total: enSets.length,
    inserted,
    failed,
    deAvailable: Object.keys(deMap).length,
    log: log.slice(0, 50),
  });
}

export async function GET(request: NextRequest) {
  const secret = request.headers.get("x-admin-secret");
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [total, missingDe] = await Promise.all([
    supabase.from("sets").select("*", { count: "exact", head: true }),
    supabase.from("sets").select("*", { count: "exact", head: true }).is("name_de", null),
  ]);

  const { data: sample } = await supabase
    .from("sets")
    .select("id, name, name_de, series, total, release_date")
    .order("release_date", { ascending: false })
    .limit(10);

  return NextResponse.json({ total: total.count, missingDe: missingDe.count, sample });
}
