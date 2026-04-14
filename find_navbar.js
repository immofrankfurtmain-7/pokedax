const fs = require('fs'), path = require('path');
const root = 'C:\\Users\\lenovo\\pokedax\\pokedax\\pokedax';

// Search for all Navbar files
function findFiles(dir, name, results = []) {
  try {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      if (item === 'node_modules' || item === '.next') continue;
      const full = path.join(dir, item);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) findFiles(full, name, results);
      else if (item.toLowerCase().includes(name.toLowerCase())) results.push(full);
    }
  } catch {}
  return results;
}

const navbars = findFiles(root, 'navbar');
console.log('All Navbar files:');
navbars.forEach(f => {
  const c = fs.readFileSync(f, 'utf8');
  console.log(`  ${f.replace(root, '')}`);
  console.log(`  teal: ${c.includes('#00B8A8')} | size: ${c.length}`);
});
