const fs = require('fs'), path = require('path');
const root = 'C:\\Users\\lenovo\\pokedax\\pokedax\\pokedax';

// Find ALL files with position:fixed that aren't Navbar
function walk(dir, results = []) {
  try {
    for (const f of fs.readdirSync(dir)) {
      if (f === 'node_modules' || f === '.next') continue;
      const full = path.join(dir, f);
      if (fs.statSync(full).isDirectory()) walk(full, results);
      else if (f.endsWith('.tsx')) results.push(full);
    }
  } catch {}
  return results;
}

console.log('=== Files with own fixed header (not Navbar.tsx) ===');
for (const f of walk(root)) {
  if (f.includes('Navbar.tsx')) continue;
  const c = fs.readFileSync(f, 'utf8');
  if ((c.includes("position: 'fixed'") || c.includes('position:"fixed"') || c.includes('position: "fixed"')) &&
      (c.includes('<nav') || c.includes('<header'))) {
    console.log(f.replace(root, ''));
  }
}

// Check forum insert fields exactly
const forum = fs.readFileSync(path.join(root, 'src/app/forum/page.tsx'), 'utf8');
const idx = forum.indexOf('.insert(');
if (idx > 0) {
  console.log('\n=== Forum insert block ===');
  console.log(forum.slice(idx, idx + 300));
}

// Check marketplace CreateModal - does it show results dropdown?
const mp = fs.readFileSync(path.join(root, 'src/app/marketplace/page.tsx'), 'utf8');
const dropIdx = mp.indexOf('results.length');
console.log('\n=== Marketplace dropdown visible:', dropIdx > 0);
if (dropIdx > 0) console.log(mp.slice(dropIdx, dropIdx + 150));

// Check sets - what image fields exist
const sets = fs.readFileSync(path.join(root, 'src/app/sets/page.tsx'), 'utf8');
console.log('\n=== Sets selects:', sets.slice(sets.indexOf('.select('), sets.indexOf('.select(') + 100));
