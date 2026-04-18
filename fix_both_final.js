const fs = require('fs'), path = require('path');
const root = 'C:\\Users\\lenovo\\pokedax\\pokedax\\pokedax';

// ── 1. CARD DETAIL: Print lines 115-132 to find the bad element
const cardPath = path.join(root, 'src/app/preischeck/[id]/page.tsx');
const card = fs.readFileSync(cardPath, 'utf8');
const cardLines = card.split('\n');
console.log('=== Card Detail Lines 115-135 ===');
for (let i = 114; i < 135; i++) console.log(`${i+1}: ${cardLines[i] || ''}`);

// ── 2. HOMEPAGE: Find and remove own navbar
const homePath = path.join(root, 'src/app/page.tsx');
let home = fs.readFileSync(homePath, 'utf8');

// Find all <header> blocks in homepage
const headerMatches = [...home.matchAll(/<header[\s\S]*?<\/header>/g)];
console.log('\n=== Homepage <header> blocks:', headerMatches.length);
headerMatches.forEach((m, i) => {
  console.log(`  Header ${i}: length=${m[0].length}, has fixed=${m[0].includes('fixed')}, pos=${m.index}`);
});

// Remove headers that have position:fixed (the navbar ones)
let homeFixed = home;
for (const m of headerMatches) {
  if (m[0].includes('fixed')) {
    homeFixed = homeFixed.replace(m[0], '');
    console.log('  → Removed fixed header of length', m[0].length);
  }
}

// Also check for <nav> with fixed
const navMatches = [...homeFixed.matchAll(/<nav[\s\S]*?<\/nav>/g)];
console.log('Homepage <nav> blocks:', navMatches.length);
for (const m of navMatches) {
  if (m[0].includes('fixed')) {
    homeFixed = homeFixed.replace(m[0], '');
    console.log('  → Removed fixed nav');
  }
}

if (homeFixed.length !== home.length) {
  fs.writeFileSync(homePath, homeFixed, 'utf8');
  console.log('\nHomepage fixed:', home.length, '->', homeFixed.length);
} else {
  console.log('\nNo fixed nav found in homepage - checking for inline Navbar component...');
  const navLines = home.split('\n').filter(l => l.includes('Navbar') || l.includes('<nav'));
  navLines.forEach(l => console.log(' ', l.trim().slice(0, 100)));
}
