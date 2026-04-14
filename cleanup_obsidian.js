const fs = require('fs');
const path = require('path');
const root = 'C:\\Users\\lenovo\\pokedax\\pokedax\\pokedax';

// Delete all obsidian_*.tsx/ts/css files from root (they were extracted from ZIP)
const rootFiles = fs.readdirSync(root);
let deleted = 0;
for (const f of rootFiles) {
  if (f.startsWith('obsidian_') || f === 'deploy_obsidian.js') {
    fs.unlinkSync(path.join(root, f));
    console.log('Deleted: ' + f);
    deleted++;
  }
}
console.log(`Deleted ${deleted} files`);

// Also fix duplicate addToPortfolio in scanner
const scannerFile = path.join(root, 'src/app/scanner/page.tsx');
let c = fs.readFileSync(scannerFile, 'utf8');
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
  fs.writeFileSync(scannerFile, c, 'utf8');
  console.log('Fixed! Remaining:', (c.match(/async function addToPortfolio/g)||[]).length);
}
