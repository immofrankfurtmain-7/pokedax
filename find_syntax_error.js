const fs = require('fs');
const path = require('path');
const root = 'C:\\Users\\lenovo\\pokedax\\pokedax\\pokedax';
const content = fs.readFileSync(path.join(root, 'src/app/scanner/page.tsx'), 'utf8');
const lines = content.split('\n');

console.log('=== Lines 1-20 ===');
lines.slice(0, 20).forEach((l, i) => console.log(String(i+1).padStart(3) + ': ' + l));

console.log('\n=== Lines 390-414 ===');
lines.slice(389).forEach((l, i) => console.log(String(390+i).padStart(3) + ': ' + l));

// Count braces/parens balance
let braces = 0, parens = 0;
let firstImbalance = -1;
lines.forEach((l, i) => {
  for (const ch of l) {
    if (ch === '{') braces++;
    else if (ch === '}') braces--;
    else if (ch === '(') parens++;
    else if (ch === ')') parens--;
  }
  if ((braces < 0 || parens < 0) && firstImbalance === -1) {
    firstImbalance = i + 1;
    console.log(`\nIMBALANCE at line ${i+1}: braces=${braces} parens=${parens}`);
    console.log(l);
  }
});
console.log(`\nFinal: braces=${braces} parens=${parens}`);
