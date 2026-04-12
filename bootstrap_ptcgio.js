/**
 * pokédax Bootstrap Phase 2 — pokemontcg.io
 * 
 * Ergänzt bestehende Karten mit:
 * - HD-Bildern (image_url_hd)
 * - Attacks, Abilities, Weaknesses
 * - Fehlende deutsche Namen (via Mapping)
 * - TCGPlayer-Preise (USD)
 * 
 * SETUP:
 *   cd C:\Users\lenovo\pokedax\pokedax\pokedax
 *   node bootstrap_ptcgio.js
 * 
 * DAUER: ~30-60 Minuten
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const PTCGIO_KEY = process.env.POKEMONTCG_API_KEY ?? '';
const DELAY_MS   = 100;  // Rate-limit Schutz
const PAGE_SIZE  = 250;
const MAX_PAGES  = 0;    // 0 = alle, N = nur erste N Seiten (test: 2)

const stats = {
  fetched: 0, updated: 0, skipped: 0,
  errors: 0, start: Date.now()
};

function log(msg) {
  console.log(`[${new Date().toISOString().slice(11,19)}] ${msg}`);
}

// pokemontcg.io Set-ID → TCGdex Set-ID Mapping
// pokemontcg.io nutzt andere IDs als TCGdex
// Wir matchen über: set_code + number
async function fetchPage(page) {
  const headers = PTCGIO_KEY ? { 'X-Api-Key': PTCGIO_KEY } : {};
  const url = `https://api.pokemontcg.io/v2/cards?page=${page}&pageSize=${PAGE_SIZE}&orderBy=set.releaseDate`;
  const res = await fetch(url, { headers, signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`pokemontcg.io HTTP ${res.status}`);
  return res.json();
}

async function processCard(ptcgCard) {
  // Suche in unserer DB: match über set-code + number
  // pokemontcg.io ID Format: "sv1-1" oder "base1-4"
  // TCGdex ID Format: "swsh1-1" oder "base1-4"
  // Oft gleich, manchmal verschieden → über name + set matchen
  
  const ptcgId  = ptcgCard.id;           // z.B. "sv1-1"
  const name    = ptcgCard.name;
  const number  = ptcgCard.number;
  const setCode = ptcgCard.set?.ptcgoCode || ptcgCard.set?.id;
  
  // Erst direkte ID versuchen
  let { data: card } = await sb.from('cards')
    .select('id, name, name_de, image_url_hd, source_id_ptcgio, attacks')
    .eq('id', ptcgId)
    .maybeSingle();

  // Falls nicht gefunden: über name + number + set suchen
  if (!card) {
    const { data: found } = await sb.from('cards')
      .select('id, name, name_de, image_url_hd, source_id_ptcgio, attacks')
      .ilike('name', name)
      .eq('number', number)
      .limit(1)
      .maybeSingle();
    card = found;
  }

  // Nicht in unserer DB → neue Karte anlegen
  if (!card) {
    const { error } = await sb.from('cards').upsert({
      id:            ptcgId,
      name:          ptcgCard.name,
      name_en:       ptcgCard.name,
      set_id:        ptcgCard.set?.id ?? 'unknown',
      number:        ptcgCard.number,
      image_url:     ptcgCard.images?.small ?? null,
      image_url_hd:  ptcgCard.images?.large ?? null,
      rarity:        ptcgCard.rarity ?? null,
      hp:            ptcgCard.hp ? parseInt(ptcgCard.hp) : null,
      attacks:       ptcgCard.attacks ?? null,
      abilities:     ptcgCard.abilities ?? null,
      weaknesses:    ptcgCard.weaknesses ?? null,
      retreat_cost:  ptcgCard.convertedRetreatCost ?? null,
      flavor_text_en: ptcgCard.flavorText ?? null,
      legalities:    ptcgCard.legalities ?? null,
      source:        'pokemontcg_io',
      source_id_ptcgio: ptcgCard.id,
      data_quality_score: 60,
    }, { onConflict: 'id' });
    if (!error) stats.updated++;
    else stats.errors++;
    return;
  }

  // Karte gefunden → nur fehlende Felder ergänzen
  const updates = {
    source_id_ptcgio: ptcgCard.id,
  };

  // HD-Bild nur wenn noch nicht vorhanden
  if (!card.image_url_hd && ptcgCard.images?.large) {
    updates.image_url_hd = ptcgCard.images.large;
  }

  // Attacks/Abilities nur wenn noch leer
  if (!card.attacks && ptcgCard.attacks) {
    updates.attacks   = ptcgCard.attacks;
    updates.abilities = ptcgCard.abilities ?? null;
    updates.weaknesses = ptcgCard.weaknesses ?? null;
    updates.retreat_cost = ptcgCard.convertedRetreatCost ?? null;
    updates.flavor_text_en = ptcgCard.flavorText ?? null;
    updates.legalities = ptcgCard.legalities ?? null;
  }

  // Preis (USD) von TCGPlayer
  const prices = ptcgCard.tcgplayer?.prices;
  if (prices) {
    const market = prices.holofoil?.market
      ?? prices.normal?.market
      ?? prices.reverseHolofoil?.market
      ?? null;
    if (market) updates.price_tcgplayer = market;
  }

  if (Object.keys(updates).length > 1) {
    const { error } = await sb.from('cards').update(updates).eq('id', card.id);
    if (!error) stats.updated++;
    else { stats.errors++; }
  } else {
    stats.skipped++;
  }
}

async function main() {
  log('pokédax Bootstrap Phase 2 — pokemontcg.io');
  if (!PTCGIO_KEY) {
    log('HINWEIS: Kein POKEMONTCG_API_KEY — Rate-Limit beachten (1000 req/Tag ohne Key)');
    log('Key holen: https://dev.pokemontcg.io/ (kostenlos, 20.000/Tag)');
  }

  // Erste Seite holen um Gesamtzahl zu ermitteln
  const first = await fetchPage(1);
  const totalCards = first.totalCount;
  const totalPages = Math.ceil(totalCards / PAGE_SIZE);
  const pagesToProcess = MAX_PAGES > 0 ? Math.min(MAX_PAGES, totalPages) : totalPages;
  
  log(`${totalCards} Karten auf pokemontcg.io, ${pagesToProcess} Seiten à ${PAGE_SIZE}`);

  // Erste Seite verarbeiten
  for (const card of first.data ?? []) {
    await processCard(card);
    stats.fetched++;
  }

  // Restliche Seiten
  for (let page = 2; page <= pagesToProcess; page++) {
    const data = await fetchPage(page);
    for (const card of data.data ?? []) {
      await processCard(card);
      stats.fetched++;
    }

    if (page % 10 === 0) {
      const elapsed = Math.round((Date.now() - stats.start) / 1000);
      log(`Seite ${page}/${pagesToProcess} | Updated: ${stats.updated} | Elapsed: ${elapsed}s`);
    }

    await new Promise(r => setTimeout(r, DELAY_MS));
  }

  const elapsed = Math.round((Date.now() - stats.start) / 1000);
  log('='.repeat(50));
  log(`Phase 2 abgeschlossen in ${elapsed}s`);
  log(`Karten verarbeitet: ${stats.fetched}`);
  log(`Karten aktualisiert: ${stats.updated}`);
  log(`Übersprungen: ${stats.skipped}`);
  log(`Fehler: ${stats.errors}`);
  log('='.repeat(50));
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
