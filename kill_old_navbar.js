const fs = require('fs'), path = require('path');
const root = 'C:\\Users\\lenovo\\pokedax\\pokedax\\pokedax';

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

let fixed = 0;

for (const f of walk(root)) {
  const c = fs.readFileSync(f, 'utf8');

  // Find files that have their OWN navbar (position:fixed header, not just imports)
  if (
    (c.includes('<Navbar') || c.includes('position.*fixed') || c.includes("position: 'fixed'") || c.includes('position:"fixed"')) &&
    !f.includes('Navbar.tsx') && !f.includes('layout.tsx')
  ) {
    const hasNavbarImport = c.includes("import Navbar from");
    const hasOwnHeader = c.includes("position: 'fixed'") || c.includes('position:"fixed"') || c.includes('position: "fixed"');
    if (hasNavbarImport || hasOwnHeader) {
      console.log(f.replace(root, ''));
      console.log('  hasNavbarImport:', hasNavbarImport);
      console.log('  hasOwnFixedHeader:', hasOwnHeader);
      if (hasNavbarImport) {
        const lines = c.split('\n').filter(l => l.includes('Navbar'));
        lines.forEach(l => console.log('   ', l.trim()));
      }
    }
  }
}

// Also show all tsx files with position:fixed that aren't Navbar.tsx
console.log('\n=== All files with position:fixed ===');
for (const f of walk(root)) {
  const c = fs.readFileSync(f, 'utf8');
  if (!f.includes('Navbar.tsx') && !f.includes('layout.tsx') &&
      (c.includes("position: 'fixed'") || c.includes('position:"fixed"') || c.includes('position: "fixed"'))) {
    console.log(f.replace(root, ''));
  }
}
