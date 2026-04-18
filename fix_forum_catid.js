const fs = require('fs'), path = require('path');
const f = path.join('C:\\Users\\lenovo\\pokedax\\pokedax\\pokedax', 'src/app/forum/page.tsx');
let c = fs.readFileSync(f, 'utf8');

// Fix 1: Remove wrong length check - category IDs are slugs like "marktplatz"
c = c.replace(
  'const validCatId = catId && catId.length > 10 ? catId : null;',
  'const validCatId = catId || "einsteiger";'
);

// Fix 2: Default category in modal - preselect first real category
c = c.replace(
  "const [catId,   setCatId]   = useState<string|null>(null);",
  'const [catId,   setCatId]   = useState<string|null>("einsteiger");'
);

fs.writeFileSync(f, c, 'utf8');
console.log('Fixed!');
console.log('Has validCatId fallback:', c.includes('"einsteiger"'));
