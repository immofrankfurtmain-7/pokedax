const fs = require('fs'), path = require('path');
const root = 'C:\\Users\\lenovo\\pokedax\\pokedax\\pokedax';

// 1. Fix marketplace - remove its own fixed header
const mpFile = path.join(root, 'src/app/marketplace/page.tsx');
let mp = fs.readFileSync(mpFile, 'utf8');

// Find and remove the fixed header block
// It starts with <header or <nav with position:fixed and ends with </header> or </nav>
const fixedPatterns = [
  // Remove <header style={{...position:'fixed'...}}>...</header>
  /<header[^>]*position[^>]*fixed[\s\S]*?<\/header>/g,
  /<nav[^>]*position[^>]*fixed[\s\S]*?<\/nav>/g,
  // Also remove any standalone fixed div that acts as navbar
  /<div[^>]*position:\s*["']fixed["'][^>]*>[\s\S]*?(?:Navbar|nav-link|pokédax)[\s\S]*?<\/div>/g,
];

const mpBefore = mp.length;
for (const pattern of fixedPatterns) {
  mp = mp.replace(pattern, '');
}

// Also remove any paddingTop that compensates for the removed navbar
mp = mp.replace(/paddingTop:\s*["']?(?:60|64|70|72|80|88)px["']?,?\s*/g, '');

fs.writeFileSync(mpFile, mp, 'utf8');
console.log('marketplace fixed:', mpBefore, '->', mp.length, 'chars');
console.log('Still has fixed:', mp.includes("position: 'fixed'") || mp.includes('position:"fixed"') || mp.includes('position: "fixed"'));

// 2. Fix page.tsx (homepage) - it has the new Navbar inline which is correct
// BUT it also has the fantasy league section TWICE
// Remove the OLD one (without gold border) and keep the new one (with gold border)
const hpFile = path.join(root, 'src/app/page.tsx');
let hp = fs.readFileSync(hpFile, 'utf8');

// Find all fantasy league sections
const fantasyIdx1 = hp.indexOf('Fantasy League');
const fantasyIdx2 = hp.indexOf('Fantasy League', fantasyIdx1 + 1);

console.log('\nFantasy occurrences:', fantasyIdx1, fantasyIdx2);

if (fantasyIdx2 > 0) {
  // Keep the one with gold border (has rgba(201,166,107,0.25))
  // Remove the one without
  const sec1Start = hp.lastIndexOf('<section', fantasyIdx1);
  const sec1End   = hp.indexOf('</section>', fantasyIdx1) + 10;
  const sec2Start = hp.lastIndexOf('<section', fantasyIdx2);
  const sec2End   = hp.indexOf('</section>', fantasyIdx2) + 10;

  const sec1 = hp.slice(sec1Start, sec1End);
  const sec2 = hp.slice(sec2Start, sec2End);

  console.log('Section 1 has gold border:', sec1.includes('rgba(201,166,107,0.25)'));
  console.log('Section 2 has gold border:', sec2.includes('rgba(201,166,107,0.25)'));

  // Remove the one WITHOUT gold border
  if (!sec1.includes('rgba(201,166,107,0.25)') && sec2.includes('rgba(201,166,107,0.25)')) {
    hp = hp.slice(0, sec1Start) + hp.slice(sec1End);
    console.log('Removed section 1 (old, no gold border)');
  } else if (sec1.includes('rgba(201,166,107,0.25)') && !sec2.includes('rgba(201,166,107,0.25)')) {
    hp = hp.slice(0, sec2Start) + hp.slice(sec2End);
    console.log('Removed section 2 (old, no gold border)');
  } else {
    // Both or neither have gold - remove the first one
    hp = hp.slice(0, sec1Start) + hp.slice(sec1End);
    console.log('Removed section 1 (default)');
  }

  fs.writeFileSync(hpFile, hp, 'utf8');
  console.log('Homepage fantasy deduped');

  // Verify
  const remaining = (hp.match(/Fantasy League/g)||[]).length;
  console.log('Fantasy League occurrences remaining:', remaining);
}

console.log('\nDone!');
