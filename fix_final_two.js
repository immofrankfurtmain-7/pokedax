const fs = require('fs'), path = require('path');
const root = 'C:\\Users\\lenovo\\pokedax\\pokedax\\pokedax';

// ── 1. Fix card detail line 427: `color` shorthand → `color: color`
const cardPath = path.join(root, 'src/app/preischeck/[id]/page.tsx');
let card = fs.readFileSync(cardPath, 'utf8');

// Fix shorthand { color } in JSX style prop
card = card.replace(
  '{ fontSize: 12, fontWeight: 600, color }',
  '{ fontSize: 12, fontWeight: 600, color: color }'
);

fs.writeFileSync(cardPath, card, 'utf8');
console.log('Card fixed:', card.includes('color: color'));

// ── 2. Find double navbar source
// Check ALL layout files
const layoutFiles = [
  'src/app/layout.tsx',
  'src/components/layout/index.tsx',
  'src/components/layout/Layout.tsx',
].map(f => path.join(root, f));

for (const f of layoutFiles) {
  if (!fs.existsSync(f)) continue;
  const c = fs.readFileSync(f, 'utf8');
  console.log('\n=== ' + f.replace(root,'') + ' ===');
  c.split('\n').filter(l => l.includes('Navbar') || l.includes('navbar')).forEach(l => console.log(' ', l.trim()));
}

// Check if there's a _app or provider with navbar
const appFiles = [
  'src/app/providers.tsx',
  'src/components/providers.tsx',
  'src/components/layout/Providers.tsx',
].map(f => path.join(root, f));

for (const f of appFiles) {
  if (!fs.existsSync(f)) continue;
  const c = fs.readFileSync(f, 'utf8');
  if (c.includes('Navbar')) {
    console.log('\n=== FOUND NAVBAR IN', f.replace(root,''), '===');
    c.split('\n').filter(l => l.includes('Navbar')).forEach(l => console.log(' ', l.trim()));
  }
}

// Check the actual layout.tsx content fully
const layoutPath = path.join(root, 'src/app/layout.tsx');
const layout = fs.readFileSync(layoutPath, 'utf8');
console.log('\n=== Full layout.tsx ===');
console.log(layout);
