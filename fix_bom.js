const fs = require('fs'), path = require('path');
const root = 'C:\\Users\\lenovo\\pokedax\\pokedax\\pokedax';

// Fix BOM in all TS/TSX files
let fixed = 0;
function walk(dir) {
  for (const item of fs.readdirSync(dir)) {
    if (item === 'node_modules' || item === '.next') continue;
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) { walk(full); continue; }
    if (!item.endsWith('.ts') && !item.endsWith('.tsx')) continue;
    const c = fs.readFileSync(full, 'utf8');
    if (c.charCodeAt(0) === 0xFEFF) {
      fs.writeFileSync(full, c.slice(1), 'utf8');
      console.log('Fixed BOM:', full.replace(root, ''));
      fixed++;
    }
  }
}
walk(root);
console.log(`Done — ${fixed} files fixed`);
