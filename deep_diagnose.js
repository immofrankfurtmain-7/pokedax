const fs = require('fs'), path = require('path');
const root = 'C:\\Users\\lenovo\\pokedax\\pokedax\\pokedax';

// Find every file that renders a Navbar
function walk(dir, results = []) {
  try {
    for (const item of fs.readdirSync(dir)) {
      if (item === 'node_modules' || item === '.next') continue;
      const full = path.join(dir, item);
      if (fs.statSync(full).isDirectory()) walk(full, results);
      else if (item.endsWith('.tsx') || item.endsWith('.ts')) results.push(full);
    }
  } catch {}
  return results;
}

console.log('=== Files importing ANY Navbar ===');
for (const f of walk(root)) {
  const c = fs.readFileSync(f, 'utf8');
  if (c.includes('Navbar')) {
    console.log(f.replace(root,''));
    const lines = c.split('\n').filter(l => l.includes('Navbar'));
    lines.forEach(l => console.log('  ', l.trim()));
  }
}
