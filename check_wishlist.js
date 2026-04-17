const fs = require('fs'), path = require('path');
const root = 'C:\\Users\\lenovo\\pokedax\\pokedax\\pokedax';

// Find wishlist files
function walk(dir, results = []) {
  try {
    for (const item of fs.readdirSync(dir)) {
      if (item === 'node_modules' || item === '.next') continue;
      const full = path.join(dir, item);
      if (fs.statSync(full).isDirectory()) walk(full, results);
      else if (item === 'page.tsx') results.push(full);
    }
  } catch {}
  return results;
}

for (const f of walk(root)) {
  const c = fs.readFileSync(f, 'utf8');
  if (f.includes('wish') || f.includes('match')) {
    console.log(f.replace(root, ''));
    console.log('  size:', c.length, '| Playfair:', c.includes('Playfair'), '| teal:', c.includes('#00B8A8'), '| gold:', c.includes('C9A66B'));
    console.log('  first line:', c.split('\n')[0]);
  }
}
