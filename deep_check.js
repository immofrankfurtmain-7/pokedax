const fs = require('fs'), path = require('path');
const root = 'C:\\Users\\lenovo\\pokedax\\pokedax\\pokedax';

// Card detail - find the inserted useEffects
const card = fs.readFileSync(path.join(root,'src/app/preischeck/[id]/page.tsx'),'utf8');
const lines = card.split('\n');

// Find useEffect lines
lines.forEach((l,i) => {
  if (l.includes('useEffect') || l.includes('document.createElement')) {
    console.log(`${i+1}: ${l}`);
  }
});

// Also show lines 55-80 (where new effects were inserted)
console.log('\n=== Lines 55-90 ===');
for (let i=54; i<90; i++) console.log(`${i+1}: ${lines[i]||''}`);

// Homepage - show what the header contains
const home = fs.readFileSync(path.join(root,'src/app/page.tsx'),'utf8');
const homeLines = home.split('\n');
const headerStart = home.indexOf('<header');
if (headerStart > 0) {
  const headerEnd = home.indexOf('</header>', headerStart) + 9;
  const headerBlock = home.slice(headerStart, headerEnd);
  console.log('\n=== Homepage header block (first 300 chars) ===');
  console.log(headerBlock.slice(0,300));
  console.log('Length:', headerBlock.length, '| Has pokédax logo:', headerBlock.includes('pokédax'));
}
