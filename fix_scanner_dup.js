const fs = require('fs'), path = require('path');
const file = path.join('C:\\Users\\lenovo\\pokedax\\pokedax\\pokedax', 'src/app/scanner/page.tsx');
let c = fs.readFileSync(file, 'utf8');

const fn = `  async function addToPortfolio(cardId: string, cardName: string) {`;
const first  = c.indexOf(fn);
const second = c.indexOf(fn, first + 1);

if (second === -1) { console.log('No duplicate found'); process.exit(0); }

// Remove second occurrence including its body
let depth = 0, pos = second, started = false;
while (pos < c.length) {
  if (c[pos] === '{') { depth++; started = true; }
  else if (c[pos] === '}') { if (--depth === 0 && started) { pos++; break; } }
  pos++;
}
c = c.slice(0, second) + c.slice(pos).replace(/^\n/, '');
fs.writeFileSync(file, c, 'utf8');
console.log('Fixed! Remaining:', (c.match(/async function addToPortfolio/g)||[]).length);
