const fs = require('fs');
const file = 'C:\\Users\\lenovo\\pokedax\\pokedax\\pokedax\\src\\app\\scanner\\page.tsx';
let c = fs.readFileSync(file, 'utf8');

const count = (c.match(/async function addToPortfolio/g)||[]).length;
console.log('addToPortfolio count:', count);

if (count > 1) {
  const fn = `  async function addToPortfolio(cardId: string, cardName: string) {`;
  const first = c.indexOf(fn);
  const second = c.indexOf(fn, first + 1);
  let depth = 0, pos = second, started = false;
  while (pos < c.length) {
    if (c[pos] === '{') { depth++; started = true; }
    else if (c[pos] === '}') { if (--depth === 0 && started) { pos++; break; } }
    pos++;
  }
  c = c.slice(0, second) + c.slice(pos).replace(/^\n/, '');
  fs.writeFileSync(file, c, 'utf8');
  console.log('Fixed! Remaining:', (c.match(/async function addToPortfolio/g)||[]).length);
}
