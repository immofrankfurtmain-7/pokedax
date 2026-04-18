const fs = require('fs'), path = require('path');
const root = 'C:\\Users\\lenovo\\pokedax\\pokedax\\pokedax';

// ── 1. FORUM: Fix is_deleted filter ──
const forumPath = path.join(root, 'src/app/forum/page.tsx');
let forum = fs.readFileSync(forumPath, 'utf8');

// is_deleted might be NULL not false in DB - use neq instead
forum = forum.replace(
  '.eq("is_deleted", false)',
  '.neq("is_deleted", true)'
);

// Also fix onCreated - reload posts after insert
forum = forum.replace(
  'onCreated();',
  'onCreated(); // triggers loadPosts in parent'
);

fs.writeFileSync(forumPath, forum, 'utf8');
console.log('Forum: is_deleted fix:', forum.includes('.neq("is_deleted", true)'));

// ── 2. MARKETPLACE: Fix search - add debug + fallback ──
const mpPath = path.join(root, 'src/app/marketplace/page.tsx');
let mp = fs.readFileSync(mpPath, 'utf8');

// Replace the searchCards function with a more robust version
const oldSearch = `  async function searchCards(q: string) {
    setSearch(q);
    if (q.length < 2) { setResults([]); return; }
    const res = await fetch(\`/api/cards/search?q=\${encodeURIComponent(q)}&limit=6\`);
    const data = await res.json();
    setResults(data.cards ?? []);
  }`;

const newSearch = `  async function searchCards(q: string) {
    setSearch(q);
    if (q.length < 2) { setResults([]); return; }
    try {
      const url = "/api/cards/search?q=" + encodeURIComponent(q) + "&limit=6";
      const res = await fetch(url);
      if (!res.ok) { console.error("Search failed:", res.status); return; }
      const data = await res.json();
      console.log("Search results:", data);
      setResults(data.cards ?? []);
    } catch(err) {
      console.error("Search error:", err);
      // Fallback: search directly in Supabase
      const { data } = await SB.from("cards")
        .select("id,name,name_de,set_id,number,image_url,price_market")
        .or("name.ilike.*" + q + "*,name_de.ilike.*" + q + "*")
        .limit(6);
      setResults(data ?? []);
    }
  }`;

mp = mp.replace(oldSearch, newSearch);

// Make sure SB is imported in marketplace
if (!mp.includes('const SB')) {
  mp = mp.replace(
    'const SB = createClient(',
    'const SB = createClient('
  );
  // Add SB to CreateModal scope by passing it or using module-level
  if (!mp.includes('createClient') || !mp.includes('const SB')) {
    mp = 'import { createClient } from "@supabase/supabase-js";\n' + mp;
    mp = mp.replace(
      'import { createClient } from "@supabase/supabase-js";\nimport { createClient }',
      'import { createClient }'
    );
  }
}

// Check if SB is accessible in CreateModal (it should be module-level)
const sbIdx = mp.indexOf('const SB =');
console.log('SB defined at position:', sbIdx, sbIdx < 500 ? '(module level ✓)' : '(inside component!)');

fs.writeFileSync(mpPath, mp, 'utf8');
console.log('Marketplace: search with fallback:', mp.includes('Fallback: search directly'));
