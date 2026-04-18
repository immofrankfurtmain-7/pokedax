const fs = require('fs'), path = require('path');
const f = path.join('C:\\Users\\lenovo\\pokedax\\pokedax\\pokedax', 'src/app/forum/page.tsx');
let c = fs.readFileSync(f, 'utf8');

// Fix type back to string|null for the page-level catId
c = c.replace(
  'const [catId,   setCatId]   = useState<string>("einsteiger");',
  'const [catId,   setCatId]   = useState<string|null>(null);'
);

// Fix modal catId type too
c = c.replace(
  'useState<string>("einsteiger")',
  'useState<string>("einsteiger")'
);

fs.writeFileSync(f, c, 'utf8');
console.log('Fixed type error');
console.log('Page catId type:', c.includes('useState<string|null>(null)'));
