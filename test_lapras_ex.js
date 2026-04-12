require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const sharp = require('sharp');
const fs = require('fs');

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function computeArtHash(buffer) {
  const meta = await sharp(buffer).metadata();
  const w = meta.width ?? 800;
  const h = meta.height ?? 1100;
  const { data } = await sharp(buffer)
    .extract({
      left:   Math.floor(w * 0.06),
      top:    Math.floor(h * 0.08),
      width:  Math.floor(w * 0.88),
      height: Math.floor(h * 0.50),
    })
    .resize(16, 16, { fit: 'fill' })
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const px = Array.from(data);
  const avg = px.reduce((s,v) => s+v, 0) / px.length;
  return px.map(v => v >= avg ? '1' : '0').join('');
}

function hammingDistance(h1, h2) {
  if (!h1 || !h2 || h1.length !== h2.length) return 999;
  let d = 0;
  for (let i = 0; i < h1.length; i++) if (h1[i] !== h2[i]) d++;
  return d;
}

async function main() {
  // 1. Find Lapras ex in DB
  const { data: cards } = await sb.from('cards')
    .select('id,name,name_de,ahash,set_id,number,image_url')
    .ilike('name', '%lapras ex%')
    .limit(10);
  
  console.log('=== Lapras ex in DB ===');
  cards?.forEach(c => console.log(
    `  ${c.id}: "${c.name_de||c.name}" | ahash: ${c.ahash ? c.ahash.slice(0,20)+'...' : 'NULL'}`
  ));

  // 2. Compute hash of user photo
  const buf = fs.readFileSync('/mnt/user-data/uploads/IMG_20260412_135550.jpg');
  const userHash = await computeArtHash(buf);
  console.log('\nUser photo hash:', userHash.slice(0,32)+'...');

  // 3. Compare against all Lapras ex cards
  console.log('\n=== Hamming Distance zu Lapras ex ===');
  cards?.forEach(c => {
    if (c.ahash) {
      const dist = hammingDistance(userHash, c.ahash);
      console.log(`  ${c.id}: dist=${dist}/256 = ${Math.round((1-dist/256)*100)}% match`);
    } else {
      console.log(`  ${c.id}: kein ahash`);
    }
  });

  // 4. RPC test with real hash
  const { data: rpcResult, error } = await sb.rpc('find_card_by_ahash', {
    query_hash: userHash,
    max_distance: 60,
    result_limit: 5,
  });
  console.log('\n=== RPC Ergebnis ===');
  if (error) console.log('Fehler:', error.message);
  else rpcResult?.forEach(r => console.log(`  ${r.card_id}: ${r.card_name_de||r.card_name} dist=${r.distance} conf=${r.confidence}%`));
}
main().catch(console.error);
