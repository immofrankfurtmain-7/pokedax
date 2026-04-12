require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
async function main() {
  // Get all sets from DB
  const { data: sets } = await sb.from('sets')
    .select('id, name, name_de')
    .order('id')
    .limit(30);
  console.log('Sets in DB:');
  sets?.forEach(s => console.log(`  "${s.id}": ${s.name_de || s.name}`));

  // Count cards per set for first 5 sets
  console.log('\nCards per set (sample):');
  for (const s of (sets || []).slice(0, 5)) {
    const { count } = await sb.from('cards')
      .select('id', { count: 'exact', head: true })
      .eq('set_id', s.id);
    console.log(`  ${s.id}: ${count} Karten`);
  }

  // What does sv07 look like?
  const { data: sv07 } = await sb.from('cards')
    .select('id, number, name')
    .eq('set_id', 'sv07')
    .order('number')
    .limit(5);
  console.log('\nsv07 sample:', sv07?.map(c => c.number + ': ' + c.name));
}
main().catch(console.error);
