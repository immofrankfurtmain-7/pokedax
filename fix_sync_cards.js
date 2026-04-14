const fs = require('fs'), path = require('path');
const root = 'C:\\Users\\lenovo\\pokedax\\pokedax\\pokedax';
const file = path.join(root, 'src/app/api/admin/sync-cards/route.ts');

let c = fs.readFileSync(file, 'utf8');

// Remove BOM
if (c.charCodeAt(0) === 0xFEFF) {
  c = c.slice(1);
  fs.writeFileSync(file, c, 'utf8');
  console.log('✓ BOM removed');
} else {
  console.log('No BOM found - checking for other issues');
}

console.log('First 50 chars now:', JSON.stringify(c.slice(0, 50)));
