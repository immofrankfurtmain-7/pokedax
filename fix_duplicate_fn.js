const fs = require('fs');
const file = 'C:\\Users\\lenovo\\pokedax\\pokedax\\pokedax\\src\\app\\scanner\\page.tsx';
let c = fs.readFileSync(file, 'utf8');

// Find all occurrences of addToPortfolio function definition
const fnDef = `  async function addToPortfolio(cardId: string, cardName: string) {`;
const count = (c.match(/async function addToPortfolio/g)||[]).length;
console.log('addToPortfolio definitions found:', count);

if (count > 1) {
  // Find second occurrence and remove that whole function block
  const first = c.indexOf(fnDef);
  const second = c.indexOf(fnDef, first + 1);
  
  // Find end of second function (closing brace)
  let depth = 0, pos = second, started = false;
  while (pos < c.length) {
    if (c[pos] === '{') { depth++; started = true; }
    else if (c[pos] === '}') { depth--; if (started && depth === 0) { pos++; break; } }
    pos++;
  }
  // Remove second occurrence including trailing newline
  c = c.slice(0, second) + c.slice(pos).replace(/^\n/, '');
  console.log('Removed second occurrence');
}

fs.writeFileSync(file, c, 'utf8');
console.log('addToPortfolio definitions now:', (c.match(/async function addToPortfolio/g)||[]).length);
console.log('Done - npx vercel deploy --prod');
