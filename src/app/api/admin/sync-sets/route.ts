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

  // Fetch all sets from EN + DE in parallel
  const [enRes, deRes] = await Promise.all([
    fetch(`${EN}/sets`).then(r => r.ok ? r.json() : []),
    fetch(`${DE}/sets`).then(r => r.ok ? r.json() : []),
  ]);

  if (!enRes?.length) {
    return NextResponse.json({ error: "TCGdex EN sets not available" }, { status: 500 });
  }

  // Build DE lookup by set ID
  const deMap: Record<string, { name: string; serie?: string }> = {};
  for (const s of (deRes || [])) {
    if (s.id) deMap[s.id] = { name: s.name, serie: s.serie?.name };
  }

  let inserted = 0, updated = 0, failed = 0;
  const log: string[] = [];

  for (const set of enRes) {
    if (!set.id) continue;

    // Fetch full set details for logo/symbol/dates
    let details: Record<string, unknown> = {};
    try {
      const r = await fetch(`${EN}/sets/${set.id}`, { next: { revalidate: 86400 } });
      if (r.ok) details = await r.json();
    } catch { /* ignore */ }

    const deSet = deMap[set.id];

    const row = {
      id:                   set.id,
      name_en:              set.name || details.name,
      name_de:              deSet?.name || null,
      serie_en:             (details.serie as any)?.name || set.serie?.name || null,
      serie_de:             deSet?.serie || null,
      card_count:           (details.cardCount as any)?.total || set.cardCount || null,
      card_count_official:  (details.cardCount as any)?.official || null,
      release_date:         details.releaseDate || null,
      logo_url:             details.logo ? `${details.logo}.png` : null,
      symbol_url:           details.symbol ? `${details.symbol}.png` : null,
      regulation_mark:      details.regulationMark || null,
    };

    const { error } = await supabase.from("sets").upsert(row, { onConflict: "id" });
    if (error) {
      failed++;
      log.push(`✗ ${set.id}: ${error.message}`);
    } else {
      inserted++;
      log.push(`✓ ${set.id}: ${row.name_en}${row.name_de ? ` / ${row.name_de}` : " (kein DE)"}`);
    }

    await new Promise(r => setTimeout(r, 50)); // light rate limiting
  }

  return NextResponse.json({
    total: enRes.length, inserted, failed,
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

  // Sample
  const { data: sample } = await supabase
    .from("sets").select("id, name_en, name_de, serie_en, card_count, release_date")
    .order("release_date", { ascending: false })
    .limit(10);

  return NextResponse.json({
    total: total.count,
    missingDe: missingDe.count,
    sample,
  });
}
