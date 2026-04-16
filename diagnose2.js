const fs = require('fs'), path = require('path');
const root = 'C:\\Users\\lenovo\\pokedax\\pokedax\\pokedax';

// Find all Navbar files
function walk(dir, results = []) {
  try {
    for (const item of fs.readdirSync(dir)) {
      if (item === 'node_modules' || item === '.next') continue;
      const full = path.join(dir, item);
      if (fs.statSync(full).isDirectory()) walk(full, results);
      else if (item.toLowerCase().includes('navbar')) results.push(full);
    }
  } catch {}
  return results;
}

const navbars = walk(root);
console.log('=== Navbar files ===');
navbars.forEach(f => {
  const c = fs.readFileSync(f, 'utf8');
  console.log(f.replace(root, ''));
  console.log('  size:', c.length, '| teal:', c.includes('#00B8A8'), '| gold D4A843:', c.includes('#D4A843'));
  console.log('  first line:', c.split('\n')[0]);
});

// Check layout.tsx imports
const layout = fs.readFileSync(path.join(root, 'src/app/layout.tsx'), 'utf8');
console.log('\n=== layout.tsx Navbar import ===');
const lines = layout.split('\n').filter(l => l.includes('Navbar') || l.includes('navbar'));
lines.forEach(l => console.log(' ', l.trim()));

// Check globals.css for teal
const globals = fs.readFileSync(path.join(root, 'src/app/globals.css'), 'utf8');
const tealLines = globals.split('\n').filter(l => l.includes('#00B8A8') || l.includes('00B8A8') || l.includes('00b8a8'));
console.log('\n=== globals.css teal occurrences:', tealLines.length, '===');
tealLines.slice(0, 5).forEach(l => console.log(' ', l.trim()));
