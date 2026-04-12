/**
 * pokédax Bootstrap Script — lokal ausführen
 * 
 * SETUP:
 *   cd C:\Users\lenovo\pokedax\pokedax\pokedax
 *   npm install sharp @supabase/supabase-js dotenv
 *   node bootstrap_local.js
 * 
 * OPTIONEN (am Ende der Datei konfigurieren):
 *   LANGUAGES: ['en', 'de', 'ja'] — welche Sprachen
 *   BATCH_SIZE: 5 — Sets parallel verarbeiten
 *   HASH_IMAGES: true — pHash berechnen (langsamer)
 *   DRY_RUN: false — nur loggen, nichts speichern
 * 
 * DAUER: ~2-4 Stunden für alle 22k+ Karten mit Hashes
 */

const sharp = require("sharp");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

// ── Konfiguration ──────────────────────────────────────────
const CONFIG = {
  LANGUAGES: ["en", "de", "ja"],
  BATCH_SIZE: 3,        // Sets parallel (zu hoch = Rate-Limit)
  HASH_IMAGES: true,    // pHash berechnen? (false = viel schneller)
  DELAY_MS: 200,        // Pause zwischen Batches (Rate-Limit-Schutz)
  DRY_RUN: false,       // true = nur loggen
  SKIP_EXISTING: true,  // Bereits vorhandene Karten überspringen
  MAX_SETS: 0,          // 0 = alle Sets, N = nur erste N Sets (zum Testen)
};

// ── Supabase ──────────────────────────────────────────────
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ── Stats ─────────────────────────────────────────────────
const stats = {
  sets_total: 0, sets_done: 0,
  cards_inserted: 0, cards_updated: 0, cards_skipped: 0,
  hashes_computed: 0, hash_errors: 0,
  errors: 0, start: Date.now(),
};

// ── Logging ───────────────────────────────────────────────
function log(msg) { console.log(`[${new Date().toISOString().slice(11,19)}] ${msg}`); }
function progress() {
  const elapsed = Math.round((Date.now() - stats.start) / 1000);
  const rate = stats.cards_inserted / Math.max(elapsed, 1);
  log(`Sets: ${stats.sets_done}/${stats.sets_total} | Cards: +${stats.cards_inserted} | Hashes: ${stats.hashes_computed} | ${rate.toFixed(1)}/s | ${elapsed}s elapsed`);
}

// ── pHash berechnen ────────────────────────────────────────
async function computePhash(imageUrl) {
  try {
    const res = await fetch(imageUrl, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());

    // Vorverarbeiten: 32x32 Graustufen normalisiert
    const { data } = await sharp(buf)
      .resize(32, 32, { fit: "fill" })
      .grayscale()
      .normalise()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const pixels = Array.from(data);

    // DCT 2D
    const SIZE = 32, KEEP = 8;
    const dct = Array.from({ length: SIZE }, () => new Array(SIZE).fill(0));
    for (let u = 0; u < SIZE; u++) {
      for (let v = 0; v < SIZE; v++) {
        let sum = 0;
        for (let x = 0; x < SIZE; x++) {
          for (let y = 0; y < SIZE; y++) {
            sum += pixels[x * SIZE + y]
              * Math.cos(((2*x+1)*u*Math.PI)/(2*SIZE))
              * Math.cos(((2*y+1)*v*Math.PI)/(2*SIZE));
          }
        }
        const cu = u===0 ? 1/Math.sqrt(2) : 1;
        const cv = v===0 ? 1/Math.sqrt(2) : 1;
        dct[u][v] = (2/SIZE)*cu*cv*sum;
      }
    }

    // Top-left 8x8 → Median → Bits
    const lf = [];
    for (let u = 0; u < KEEP; u++)
      for (let v = 0; v < KEEP; v++)
        if (!(u===0&&v===0)) lf.push(dct[u][v]);
    const median = [...lf].sort((a,b)=>a-b)[Math.floor(lf.length/2)];
    return lf.map(v => v > median ? "1" : "0").join("");
  } catch(e) {
    return null;
  }
}

async function computeDhash(imageUrl) {
  try {
    const res = await fetch(imageUrl, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    const { data } = await sharp(buf).resize(9,8,{fit:"fill"}).grayscale().raw().toBuffer({ resolveWithObject: true });
    const px = Array.from(data);
    let hash = "";
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++)
        hash += px[r*9+c] > px[r*9+c+1] ? "1" : "0";
    return hash;
  } catch(e) { return null; }
}

// ── Duplikat-Check via Hash ────────────────────────────────
async function isDuplicate(phash) {
  if (!phash) return false;
  const { data } = await sb.rpc("hamming_distance_check", { 
    query_hash: phash, 
    max_dist: 5 
  }).limit(1);
  return data && data.length > 0;
}

// ── Set verarbeiten ────────────────────────────────────────
async function processSet(setId, langData) {
  // langData = { en: setData, de: setData, ja: setData }
  // Nutze EN als Basis, merge DE + JA
  const base = langData.en || langData.de || langData.ja;
  if (!base) return;

  // Set upserten
  if (!CONFIG.DRY_RUN) {
    await sb.from("sets").upsert({
      id:           base.id,
      name:         langData.en?.name || base.name,
      name_de:      langData.de?.name || null,
      name_ja:      langData.ja?.name || null,
      series:       base.serie?.name || null,
      total:        base.cardCount?.total || base.total || null,
      release_date: base.releaseDate || null,
      symbol_url:   base.symbol || null,
      logo_url:     base.logo || null,
    }, { onConflict: "id" });
  }

  // Karten verarbeiten
  const cards = base.cards || [];
  for (const card of cards) {
    // Card-ID: set.id-localId (z.B. "sv1-001")
    const cardId = `${setId}-${card.localId}`;

    // Skip wenn bereits vorhanden + kein Update nötig
    if (CONFIG.SKIP_EXISTING) {
      const { data: existing } = await sb.from("cards")
        .select("id, phash")
        .eq("id", cardId)
        .maybeSingle();
      if (existing?.phash && CONFIG.HASH_IMAGES) {
        stats.cards_skipped++;
        continue;
      }
    }

    // Bild-URL
    const imageUrl = card.image ? `${card.image}/high.webp` : null;

    // Hashes berechnen (wenn gewünscht)
    let phash = null, dhash = null;
    if (CONFIG.HASH_IMAGES && imageUrl) {
      [phash, dhash] = await Promise.all([
        computePhash(imageUrl),
        computeDhash(imageUrl),
      ]);
      if (phash) stats.hashes_computed++;
      else stats.hash_errors++;
    }

    // Karte upserten
    if (!CONFIG.DRY_RUN) {
      const { error } = await sb.from("cards").upsert({
        id:              cardId,
        // Namen aus allen Sprachen
        name:            langData.en?.cards?.find(c => c.localId===card.localId)?.name || card.name,
        name_de:         langData.de?.cards?.find(c => c.localId===card.localId)?.name || null,
        name_ja:         langData.ja?.cards?.find(c => c.localId===card.localId)?.name || null,
        name_en:         langData.en?.cards?.find(c => c.localId===card.localId)?.name || card.name,
        set_id:          setId,
        number:          card.localId,
        image_url:       imageUrl,
        rarity:          card.rarity || null,
        types:           card.types || null,
        hp:              card.hp ? parseInt(card.hp) : null,
        category:        card.category || null,
        illustrator:     card.illustrator || null,
        phash,
        dhash,
        data_quality_score: phash ? 70 : 50,
        last_verified_at: new Date().toISOString(),
        source:          "bootstrap_tcgdex",
      }, { onConflict: "id" });

      if (error) {
        stats.errors++;
        if (CONFIG.DRY_RUN || stats.errors < 5) log(`ERROR card ${cardId}: ${error.message}`);
      } else {
        stats.cards_inserted++;
      }
    } else {
      log(`DRY_RUN: would upsert ${cardId} (${card.name})`);
      stats.cards_inserted++;
    }
  }
}

// ── Hilfsfunktion: Set in einer Sprache laden ─────────────
async function fetchSetInLang(setId, lang) {
  try {
    const res = await fetch(`https://api.tcgdex.net/v2/${lang}/sets/${setId}`);
    if (!res.ok) return null;
    return await res.json();
  } catch(e) { return null; }
}

// ── Haupt-Bootstrap-Funktion ───────────────────────────────
async function main() {
  log("pokédax Bootstrap gestartet");
  log(`Konfiguration: Sprachen=${CONFIG.LANGUAGES.join(",")} | Hashing=${CONFIG.HASH_IMAGES} | DryRun=${CONFIG.DRY_RUN}`);

  // Env prüfen
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    log("ERROR: NEXT_PUBLIC_SUPABASE_URL oder SUPABASE_SERVICE_ROLE_KEY fehlt in .env.local");
    process.exit(1);
  }

  // Alle Sets holen (aus EN)
  log("Lade Sets-Liste von TCGdex...");
  const setsRes = await fetch("https://api.tcgdex.net/v2/en/sets");
  if (!setsRes.ok) { log("ERROR: Sets-Liste konnte nicht geladen werden"); process.exit(1); }
  let allSets = await setsRes.json();

  if (CONFIG.MAX_SETS > 0) {
    allSets = allSets.slice(0, CONFIG.MAX_SETS);
    log(`DEBUG: Verarbeite nur erste ${CONFIG.MAX_SETS} Sets`);
  }

  stats.sets_total = allSets.length;
  log(`${allSets.length} Sets gefunden`);

  // Sets in Batches verarbeiten
  for (let i = 0; i < allSets.length; i += CONFIG.BATCH_SIZE) {
    const batch = allSets.slice(i, i + CONFIG.BATCH_SIZE);

    await Promise.all(batch.map(async (set) => {
      const setId = set.id;
      const langData = {};

      // Parallel in allen Sprachen laden
      await Promise.all(CONFIG.LANGUAGES.map(async (lang) => {
        const data = await fetchSetInLang(setId, lang);
        if (data) langData[lang] = data;
      }));

      await processSet(setId, langData);
      stats.sets_done++;
    }));

    // Fortschritt + Pause
    if (i % (CONFIG.BATCH_SIZE * 5) === 0) progress();
    if (CONFIG.DELAY_MS > 0) await new Promise(r => setTimeout(r, CONFIG.DELAY_MS));
  }

  // Abschlussbericht
  const elapsed = Math.round((Date.now() - stats.start) / 1000);
  log("=".repeat(50));
  log(`Bootstrap abgeschlossen in ${elapsed}s`);
  log(`Sets verarbeitet:    ${stats.sets_done}`);
  log(`Karten eingefügt:    ${stats.cards_inserted}`);
  log(`Karten übersprungen: ${stats.cards_skipped}`);
  log(`Hashes berechnet:    ${stats.hashes_computed}`);
  log(`Hash-Fehler:         ${stats.hash_errors}`);
  log(`Fehler gesamt:       ${stats.errors}`);
  log("=".repeat(50));

  if (!CONFIG.DRY_RUN) {
    log("Nächster Schritt: node bootstrap_local.js mit HASH_IMAGES=true für Hashes");
    log("Oder: Guardian Cron berechnet täglich 200 Hashes automatisch");
  }
}

main().catch(e => { console.error("FATAL:", e); process.exit(1); });
