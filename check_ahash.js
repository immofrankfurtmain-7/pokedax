require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
async function main() {
  // Check ahash column exists and has data
  const { count: withAhash } = await sb.from('cards')
    .select('id', { count: 'exact', head: true })
    .not('ahash', 'is', null);
  console.log('Karten mit ahash:', withAhash);

  // Check Lapras ex specifically
  const { data: lapras } = await sb.from('cards')
    .select('id,name,name_de,ahash,dhash,phash')
    .ilike('name', '%lapras%')
    .limit(5);
  lapras?.forEach(c => console.log(
    `${c.id}: "${c.name_de || c.name}" | ahash: ${c.ahash ? c.ahash.slice(0,16)+'...' : 'NULL'}`
  ));

  // Test the RPC function
  const testHash = '00001000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';
  const { data: rpc, error } = await sb.rpc('find_card_by_ahash', {
    query_hash: testHash, max_distance: 100, result_limit: 3
  });
  console.log('\nRPC find_card_by_ahash exists:', !error);
  if (error) console.log('RPC error:', error.message);
}
main().catch(console.error);
