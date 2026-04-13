require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
async function main() {
  // What does the sets page load?
  const { data: sets } = await sb.from('sets').select('id, name, name_de').limit(5);
  console.log('Sets API sample:', sets);

  // When user clicks sv07, what does preischeck receive?
  // It sends ?set=sv07 → search route does .eq("set_id", "sv07")
  const { data: cards, count } = await sb.from('cards')
    .select('id,name,number,set_id', { count: 'exact' })
    .eq('set_id', 'sv07')
    .limit(5);
  console.log('\nsv07 cards:', count, 'total');
  console.log('Sample:', cards?.map(c => c.number + ': ' + c.name));

  // What set IDs does the sets page show?
  const { data: allSets } = await sb.from('sets').select('id').limit(10);
  console.log('\nAll set IDs (first 10):', allSets?.map(s => s.id));
}
main().catch(console.error);
