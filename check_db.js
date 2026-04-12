require('dotenv').config({path: process.argv[2] || '.env.local'});
const { createClient } = require('@supabase/supabase-js');

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  // Gesamtzahlen
  const { count: total }   = await sb.from('cards').select('id', {count:'exact',head:true});
  const { count: withHash } = await sb.from('cards').select('id', {count:'exact',head:true}).not('phash','is',null);
  const { count: withDe }   = await sb.from('cards').select('id', {count:'exact',head:true}).not('name_de','is',null);
  const { count: withJa }   = await sb.from('cards').select('id', {count:'exact',head:true}).not('name_ja','is',null);
  const { count: withImg }  = await sb.from('cards').select('id', {count:'exact',head:true}).not('image_url','is',null);

  console.log('=== Datenbank-Status ===');
  console.log(`Karten gesamt:       ${total}`);
  console.log(`Mit pHash:           ${withHash} (${Math.round(withHash/total*100)}%)`);
  console.log(`Mit deutschem Namen: ${withDe} (${Math.round(withDe/total*100)}%)`);
  console.log(`Mit japan. Namen:    ${withJa} (${Math.round(withJa/total*100)}%)`);
  console.log(`Mit Bild-URL:        ${withImg} (${Math.round(withImg/total*100)}%)`);

  // Beispiel-Karten mit JP-Namen
  const { data: jpSample } = await sb.from('cards')
    .select('id,name,name_de,name_ja,set_id')
    .not('name_ja','is',null)
    .limit(5);
  console.log('\n=== Beispiel: Karten mit JP-Namen ===');
  jpSample?.forEach(c => console.log(`  ${c.id}: EN="${c.name}" DE="${c.name_de}" JA="${c.name_ja}"`));

  // Sets Liste
  const { count: sets } = await sb.from('sets').select('id',{count:'exact',head:true});
  console.log(`\nSets gesamt: ${sets}`);
}

main().catch(console.error);
