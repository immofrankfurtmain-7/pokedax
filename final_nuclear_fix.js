const fs = require('fs'), path = require('path');
const root = 'C:\\Users\\lenovo\\pokedax\\pokedax\\pokedax';

// ── 1. CARD DETAIL: Find exact error by counting JSX tags ──
const cardPath = path.join(root, 'src/app/preischeck/[id]/page.tsx');
const card = fs.readFileSync(cardPath, 'utf8');
const lines = card.split('\n');

// Show lines 95-105 (around the reported error)
console.log('=== Lines 95-130 ===');
for (let i = 94; i < 130; i++) {
  console.log(`${i+1}: ${(lines[i]||'').slice(0,120)}`);
}

// Show what's at the very end of the file
console.log('\n=== Last 20 lines ===');
for (let i = Math.max(0, lines.length-20); i < lines.length; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}

// ── 2. HOMEPAGE: Find ALL navbars ──
const homePath = path.join(root, 'src/app/page.tsx');
const home = fs.readFileSync(homePath, 'utf8');
const homeLines = home.split('\n');

// Find lines with 'fixed' positioning
console.log('\n=== Homepage lines with "fixed" ===');
homeLines.forEach((l, i) => {
  if (l.includes('fixed')) console.log(`${i+1}: ${l.slice(0,120)}`);
});

// Find lines with pokédax (logo - indicates navbar)
console.log('\n=== Homepage lines with pokédax ===');
homeLines.forEach((l, i) => {
  if (l.includes('pokédax') || l.includes('pok')) console.log(`${i+1}: ${l.slice(0,120)}`);
});
