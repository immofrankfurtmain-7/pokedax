const fs = require('fs'), path = require('path');
const f = path.join('C:\\Users\\lenovo\\pokedax\\pokedax\\pokedax', 'src/app/preischeck/[id]/page.tsx');
const c = fs.readFileSync(f, 'utf8');
const lines = c.split('\n');

// Print lines 80-98
console.log('=== Lines 80-98 ===');
for (let i = 79; i < 98; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}

// Count open/close parens in the return statement area
let depth = 0;
for (let i = 0; i < 94; i++) {
  const line = lines[i];
  for (const ch of line) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
  }
}
console.log('\nParen depth at line 94:', depth);

// Print lines 1-30 to see early structure
console.log('\n=== Lines 1-30 ===');
for (let i = 0; i < 30; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}
