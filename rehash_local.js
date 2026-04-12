/**
 * pokédax Re-Hash Script
 * Berechnet Hashes NEU mit Art-Crop + aHash 256-bit
 * 
 * cd C:\Users\lenovo\pokedax\pokedax\pokedax
 * node rehash_local.js
 * 
 * Dauer: ~2-3 Stunden für alle 22k Karten
 */
require('dotenv').config({ path: '.env.local' });
const sharp = require('sharp');
const { createClient } = require('@supabase/supabase-js');

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BATCH = 50;    // Parallel pro Batch
const DELAY = 50;    // ms zwischen Batches

// Art-Crop + aHash 256-bit
// Funktioniert weil TCGdex und User-Fotos beide ähnliche Proportionen haben
async function computeArtHash(imageUrl) {
  try {
    const res = await fetch(imageUrl, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    const meta = await sharp(buf).metadata();
    const w = meta.width || 245;
    const h = meta.height || 342;
    
    // Crop: Art-Bereich = obere 55% der Karte, 90% Breite (Ränder abschneiden)
    const crop = await sharp(buf)
      .extract({
        left:   Math.floor(w * 0.05),
        top:    Math.floor(h * 0.08),
        width:  Math.floor(w * 0.90),
        height: Math.floor(h * 0.50),
      })
      .resize(16, 16, { fit: 'fill' })
      .grayscale()
      .raw()
      .toBuffer({ resolveWithObject: true });
    
    const px = Array.from(crop.data);
    const avg = px.reduce((s,v) => s+v, 0) / px.length;
    return px.map(v => v >= avg ? '1' : '0').join('');
  } catch(e) {
    return null;
  }
}

async function main() {
  console.log('pokédax Re-Hash (Art-Crop aHash 256-bit)');
  console.log('=========================================');
  
  // Alle Karten mit image_url holen
  const { count } = await sb.from('cards')
    .select('id', { count: 'exact', head: true })
    .not('image_url', 'is', null);
  
  console.log(`Karten zu hashen: ${count}`);
  
  let offset = 0;
  let done = 0, errors = 0, nulls = 0;
  const start = Date.now();
  
  while (offset < count) {
    const { data: cards } = await sb.from('cards')
      .select('id, image_url')
      .not('image_url', 'is', null)
      .range(offset, offset + BATCH - 1);
    
    if (!cards?.length) break;
    
    await Promise.all(cards.map(async card => {
      const hash = await computeArtHash(card.image_url);
      if (hash) {
        await sb.from('cards').update({
          ahash: hash,               // 256-bit art hash
          last_verified_at: new Date().toISOString(),
        }).eq('id', card.id);
        done++;
      } else {
        nulls++;
      }
    }));
    
    offset += BATCH;
    
    if (offset % 500 === 0) {
      const elapsed = Math.round((Date.now() - start) / 1000);
      const rate = done / Math.max(elapsed, 1);
      const remaining = Math.round((count - offset) / rate);
      console.log(`${offset}/${count} | Hashes: ${done} | ~${remaining}s verbleibend`);
    }
    
    await new Promise(r => setTimeout(r, DELAY));
  }
  
  const elapsed = Math.round((Date.now() - start) / 1000);
  console.log('=========================================');
  console.log(`Fertig in ${elapsed}s`);
  console.log(`Hashes berechnet: ${done}`);
  console.log(`Fehler/kein Bild: ${nulls}`);
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
