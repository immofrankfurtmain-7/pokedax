const fs = require('fs'), path = require('path');
const root = 'C:\\Users\\lenovo\\pokedax\\pokedax\\pokedax';

// Forum - check categories display and post select
const forum = fs.readFileSync(path.join(root, 'src/app/forum/page.tsx'), 'utf8');
console.log('=== Forum categories display ===');
const catFilter = forum.indexOf('cats.filter');
console.log(forum.slice(catFilter, catFilter + 200));

console.log('\n=== Forum post select query ===');
const selectIdx = forum.indexOf('.select("id,title');
console.log(forum.slice(selectIdx, selectIdx + 150));

// Marketplace - check card search
const mp = fs.readFileSync(path.join(root, 'src/app/marketplace/page.tsx'), 'utf8');
console.log('\n=== Marketplace card search ===');
const searchIdx = mp.indexOf('searchCards');
console.log(mp.slice(searchIdx, searchIdx + 300));
console.log('\nHas setResults:', mp.includes('setResults'));
console.log('Has results dropdown:', mp.includes('results.length'));
