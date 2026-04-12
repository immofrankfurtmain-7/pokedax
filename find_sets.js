require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
async function main() {
  const { data: lapras } = await sb.from('cards')
    .select('id, name, set_id, number')
    .ilike('name', '%lapras ex%')
    .limit(10);
  console.log('Lapras ex:', lapras?.map(c => c.set_id + '-' + c.number + ': ' + c.name));

  const { data: sets } = await sb.from('sets')
    .select('id, name, name_de')
    .or('name.ilike.%paldean%,name.ilike.%glanz%,id.ilike.%sv4%')
    .limit(10);
  console.log('Matching sets:', sets?.map(s => s.id + ': ' + (s.name_de || s.name)));

  const { data: sample } = await sb.from('cards')
    .select('set_id').limit(20);
  const ids = [...new Set(sample?.map(c => c.set_id))];
  console.log('Sample set_ids in DB:', ids);
}
main().catch(console.error);
