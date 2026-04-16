const fs = require('fs'), path = require('path');
const root = 'C:\\Users\\lenovo\\pokedax\\pokedax\\pokedax';

let fixed = 0;
function walk(dir) {
  try {
    for (const item of fs.readdirSync(dir)) {
      if (item === 'node_modules' || item === '.next') continue;
      const full = path.join(dir, item);
      if (fs.statSync(full).isDirectory()) { walk(full); continue; }
      if (!item.endsWith('.tsx') && !item.endsWith('.ts')) continue;
      let c = fs.readFileSync(full, 'utf8');
      if (c.includes('@/components/layout/Navbar')) {
        c = c.replace(/from "@\/components\/layout\/Navbar"/g, 'from "@/components/Navbar"');
        c = c.replace(/from '@\/components\/layout\/Navbar'/g, "from '@/components/Navbar'");
        fs.writeFileSync(full, c, 'utf8');
        console.log('Fixed: ' + full.replace(root, ''));
        fixed++;
      }
    }
  } catch(e) { console.log('Error:', e.message); }
}
walk(root);
console.log('\nTotal fixed:', fixed);
