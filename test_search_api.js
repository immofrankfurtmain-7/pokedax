require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
async function main() {
  // Simulate exactly what the search API does
  const set = 'sv07';
  const q = '';
  
  let query = sb.from('cards').select('id,name,set_id,number');
  if (q)   query = query.or(`name.ilike.%${q}%,name_de.ilike.%${q}%`);
  if (set) query = query.eq('set_id', set);
  // This is the key line from our search route:
  if (!set && !q) query = query.not('price_market', 'is', null);
  query = query.limit(10);
  
  const { data, error } = await query;
  console.log('With set filter:', data?.length, 'cards');
  console.log('All from sv07:', data?.every(c => c.set_id === 'sv07'));
  console.log('Sample:', data?.slice(0,3).map(c => c.set_id + '-' + c.number + ': ' + c.name));
  if (error) console.log('ERROR:', error.message);

  // Now test WITHOUT set filter (what happens if setId is empty)
  const { data: noFilter } = await sb.from('cards')
    .select('id,name,set_id,number')
    .not('price_market', 'is', null)
    .limit(5);
  console.log('\nWithout filter (350 random):', noFilter?.map(c => c.set_id));
}
main().catch(console.error);
