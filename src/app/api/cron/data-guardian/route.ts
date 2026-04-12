/**
 * pokédax Data Guardian
 * GET /api/cron/data-guardian
 *
 * Täglicher Cron der die Datenbankqualität überwacht und verbessert:
 * 1. Karten ohne Hash → Hash berechnen
 * 2. Duplikat-Kandidaten finden (gleicher Name, ähnlicher Hash)
 * 3. Quality-Scores aktualisieren
 * 4. Externe Preisquellen abgleichen (pokemontcg.io)
 * 5. Report in data_guardian_log speichern
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { computePhash, computeDhash, imageQualityScore, hammingDistance } from "@/lib/phash";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const report = {
    run_at: new Date().toISOString(),
    cards_checked: 0,
    hashes_updated: 0,
    duplicates_found: 0,
    quality_improved: 0,
    prices_updated: 0,
    errors: 0,
  };

  // ── Task 1: Hashes für Karten ohne Hash berechnen ─────────
  const { data: unhashed } = await sb
    .from("cards")
    .select("id, image_url, data_quality_score")
    .is("phash", null)
    .not("image_url", "is", null)
    .limit(200); // 200 pro Tag = ~100 Tage für kompletten Bootstrap

  for (const card of unhashed ?? []) {
    try {
      const res = await fetch(card.image_url, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) { report.errors++; continue; }
      const buf = Buffer.from(await res.arrayBuffer());

      const [phash, dhash, quality] = await Promise.all([
        computePhash(buf),
        computeDhash(buf),
        imageQualityScore(buf),
      ]);

      await sb.from("cards").update({
        phash, dhash,
        data_quality_score: quality,
        last_verified_at: new Date().toISOString(),
      }).eq("id", card.id);

      report.hashes_updated++;
    } catch(e) { report.errors++; }
    report.cards_checked++;
  }

  // ── Task 2: Duplikat-Kandidaten finden ────────────────────
  // Karten mit gleichem Namen aber verschiedenen Set-IDs
  const { data: potentialDups } = await sb
    .from("cards")
    .select("id, name, set_id, phash, data_quality_score")
    .not("phash", "is", null)
    .order("name", { ascending: true })
    .limit(500);

  const nameGroups: Record<string, typeof potentialDups> = {};
  for (const card of potentialDups ?? []) {
    if (!nameGroups[card.name]) nameGroups[card.name] = [];
    nameGroups[card.name]!.push(card);
  }

  for (const [name, cards] of Object.entries(nameGroups)) {
    if ((cards?.length ?? 0) < 2) continue;
    // Compare hashes within group
    for (let i = 0; i < (cards?.length ?? 0); i++) {
      for (let j = i + 1; j < (cards?.length ?? 0); j++) {
        const dist = hammingDistance(cards![i].phash, cards![j].phash);
        if (dist <= 8) {
          // Very similar — likely variant
          await sb.from("card_variants").upsert({
            base_card_id:    cards![i].id,
            variant_card_id: cards![j].id,
            variant_type:    "auto_detected",
            confidence:      100 - (dist / 64 * 100),
          }, { onConflict: "base_card_id,variant_card_id", ignoreDuplicates: true });
          report.duplicates_found++;
        }
      }
    }
  }

  // ── Task 3: Quality-Scores für viel-gescannte Karten ──────
  const { data: popular } = await sb
    .from("cards")
    .select("id, scan_count, marketplace_trade_count, data_quality_score")
    .or("scan_count.gt.5,marketplace_trade_count.gt.0")
    .limit(100);

  for (const card of popular ?? []) {
    const scanBonus = Math.min(20, (card.scan_count ?? 0) * 2);
    const tradeBonus = Math.min(15, (card.marketplace_trade_count ?? 0) * 5);
    const newScore = Math.min(100, (card.data_quality_score ?? 50) + scanBonus + tradeBonus);

    if (newScore > card.data_quality_score) {
      await sb.from("cards").update({ data_quality_score: newScore }).eq("id", card.id);
      report.quality_improved++;
    }
  }

  // ── Task 4: Externe Preise von pokemontcg.io updaten ──────
  // Nur die 50 meistgescannten Karten täglich updaten
  const { data: topCards } = await sb
    .from("cards")
    .select("id, source_id, name")
    .not("source_id", "is", null)
    .order("scan_count", { ascending: false })
    .limit(50);

  for (const card of topCards ?? []) {
    try {
      const r = await fetch(`https://api.pokemontcg.io/v2/cards/${card.source_id}`, {
        headers: process.env.POKEMONTCG_API_KEY
          ? { "X-Api-Key": process.env.POKEMONTCG_API_KEY }
          : {},
      });
      if (!r.ok) continue;
      const data = await r.json();
      const prices = data.data?.tcgplayer?.prices;
      if (prices?.normal?.market || prices?.holofoil?.market) {
        const price = prices.holofoil?.market ?? prices.normal?.market;
        await sb.from("cards").update({ price_tcgplayer: price }).eq("id", card.id);
        await sb.from("external_price_feeds").insert({
          card_id: card.id,
          source: "tcgplayer",
          price: price,
          currency: "USD",
        });
        report.prices_updated++;
      }
    } catch(e) { /* continue */ }
  }

  // ── Log schreiben ─────────────────────────────────────────
  await sb.from("data_guardian_log").insert({
    ...report,
    report: report,
  });

  return NextResponse.json({
    success: true,
    ...report,
    message: `Guardian complete. ${report.hashes_updated} hashes, ${report.duplicates_found} variants, ${report.quality_improved} quality updates.`,
  });
}
