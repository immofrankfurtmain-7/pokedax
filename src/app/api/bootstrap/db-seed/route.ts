/**
 * pokédax Database Bootstrap
 * GET /api/bootstrap/db-seed?secret=ADMIN_SECRET&source=tcgdex|pokemontcg|both
 *
 * Einmalig ausführen um die Datenbank mit Karten + Hashes zu befüllen.
 * Lädt von TCGdex + pokemontcg.io, berechnet pHash für jede Karte.
 *
 * WARNUNG: Läuft mehrere Stunden bei vollständigem Seed.
 * Empfehlung: mit &limit=100 testen, dann vollständig laufen lassen.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { computePhash, computeDhash, imageQualityScore } from "@/lib/phash";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 Minuten pro Batch

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ── TCGdex: alle Sets laden ──────────────────────────────────
async function fetchTCGdexSets(): Promise<any[]> {
  const r = await fetch("https://api.tcgdex.net/v2/de/sets");
  return r.json();
}

// ── TCGdex: alle Karten eines Sets ──────────────────────────
async function fetchTCGdexSet(setId: string): Promise<any> {
  const r = await fetch(`https://api.tcgdex.net/v2/de/sets/${setId}`);
  return r.json();
}

// ── pokemontcg.io: Karten mit erweiterten Daten ─────────────
async function fetchPokemonTCG(page: number = 1, pageSize: number = 250): Promise<any> {
  const apiKey = process.env.POKEMONTCG_API_KEY ?? "";
  const headers: Record<string, string> = apiKey ? { "X-Api-Key": apiKey } : {};
  const r = await fetch(
    `https://api.pokemontcg.io/v2/cards?page=${page}&pageSize=${pageSize}&orderBy=set.releaseDate`,
    { headers }
  );
  return r.json();
}

// ── Hash berechnen + in DB speichern ────────────────────────
async function processCardImage(
  cardId: string,
  imageUrl: string,
  forceUpdate: boolean = false
): Promise<{ phash: string; quality: number } | null> {
  try {
    // Skip if already hashed (unless force)
    if (!forceUpdate) {
      const { data } = await sb.from("cards").select("phash").eq("id", cardId).single();
      if (data?.phash) return null;
    }

    const res = await fetch(imageUrl, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());

    const [phash, dhash, quality] = await Promise.all([
      computePhash(buf),
      computeDhash(buf),
      imageQualityScore(buf),
    ]);

    await sb.from("cards").update({
      phash,
      dhash: dhash,
      reference_image_url: imageUrl,
      data_quality_score: quality,
      last_verified_at: new Date().toISOString(),
      source: "bootstrap",
    }).eq("id", cardId);

    return { phash, quality };
  } catch (e) {
    console.error(`Hash failed for ${cardId}:`, e);
    return null;
  }
}

// ── Merge TCGdex + pokemontcg.io Daten ──────────────────────
function mergePokemonTCGData(tcgCard: any): Partial<any> {
  return {
    attacks: tcgCard.attacks ?? null,
    abilities: tcgCard.abilities ?? null,
    weaknesses: tcgCard.weaknesses ?? null,
    retreat_cost: tcgCard.convertedRetreatCost ?? null,
    flavor_text: tcgCard.flavorText ?? null,
    artist: tcgCard.artist ?? null,
    legalities: tcgCard.legalities ?? null,
    hp: tcgCard.hp ? parseInt(tcgCard.hp) : null,
    image_url_hd: tcgCard.images?.large ?? null,
    source_id: tcgCard.id,
  };
}

export async function GET(request: NextRequest) {
  // Auth check
  const secret = new URL(request.url).searchParams.get("secret");
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const source = new URL(request.url).searchParams.get("source") ?? "tcgdex";
  const limit  = parseInt(new URL(request.url).searchParams.get("limit") ?? "0");
  const hashOnly = new URL(request.url).searchParams.get("hash_only") === "1";
  const setId = new URL(request.url).searchParams.get("set");

  const stats = {
    sets_processed: 0,
    cards_upserted: 0,
    hashes_computed: 0,
    errors: 0,
    source,
  };

  // ── MODE 1: Hash only (update existing cards) ─────────────
  if (hashOnly) {
    const { data: cards } = await sb
      .from("cards")
      .select("id, image_url")
      .is("phash", null)
      .not("image_url", "is", null)
      .limit(limit || 100);

    for (const card of cards ?? []) {
      const result = await processCardImage(card.id, card.image_url);
      if (result) stats.hashes_computed++;
      else stats.errors++;
    }
    return NextResponse.json({ ...stats, mode: "hash_only" });
  }

  // ── MODE 2: Bootstrap TCGdex ──────────────────────────────
  if (source === "tcgdex" || source === "both") {
    const sets = setId ? [{ id: setId }] : await fetchTCGdexSets();
    const setsToProcess = limit ? sets.slice(0, limit) : sets;

    for (const set of setsToProcess) {
      try {
        const setData = await fetchTCGdexSet(set.id);

        // Upsert set
        await sb.from("sets").upsert({
          id: setData.id,
          name: setData.name,
          series: setData.serie?.name,
          total: setData.total,
          release_date: setData.releaseDate,
          symbol_url: setData.symbol,
          logo_url: setData.logo,
          card_count_official: setData.total,
        }, { onConflict: "id" });

        // Upsert cards
        const cards = setData.cards ?? [];
        for (const card of cards) {
          const imageUrl = card.image ? `${card.image}/high.webp` : null;
          const cardId = `${set.id}-${card.localId}`;

          await sb.from("cards").upsert({
            id: cardId,
            name: card.name,
            set_id: set.id,
            number: card.localId,
            image_url: imageUrl,
            rarity: card.rarity,
            types: card.types ?? null,
            source: "tcgdex",
          }, { onConflict: "id", ignoreDuplicates: false });

          stats.cards_upserted++;

          // Compute hash if image available
          if (imageUrl) {
            const result = await processCardImage(cardId, imageUrl);
            if (result) stats.hashes_computed++;
          }
        }

        stats.sets_processed++;
      } catch (e) {
        console.error(`Set ${set.id} failed:`, e);
        stats.errors++;
      }
    }
  }

  // ── MODE 3: Bootstrap pokemontcg.io (ergänzend) ───────────
  if (source === "pokemontcg" || source === "both") {
    let page = 1;
    let processed = 0;

    while (true) {
      const data = await fetchPokemonTCG(page, 250);
      if (!data.data?.length) break;

      for (const card of data.data) {
        // Map to our schema
        // Try to find existing card by name + set
        const setId_mapped = card.set.id;
        const cardId = `${setId_mapped}-${card.number}`;

        const merged = mergePokemonTCGData(card);

        await sb.from("cards").upsert({
          id: cardId,
          name: card.name,
          set_id: setId_mapped,
          number: card.number,
          image_url: card.images?.small ?? null,
          image_url_hd: card.images?.large ?? null,
          rarity: card.rarity,
          hp: card.hp ? parseInt(card.hp) : null,
          artist: card.artist,
          source: "pokemontcg_io",
          source_id: card.id,
          ...merged,
        }, { onConflict: "id", ignoreDuplicates: false });

        stats.cards_upserted++;
        processed++;

        if (limit && processed >= limit) break;
      }

      if (limit && processed >= limit) break;
      if (page >= Math.ceil(data.totalCount / 250)) break;
      page++;

      // Rate limit
      await new Promise(r => setTimeout(r, 100));
    }
  }

  return NextResponse.json({
    success: true,
    ...stats,
    message: `Bootstrap complete. ${stats.cards_upserted} cards, ${stats.hashes_computed} hashes.`,
  });
}
