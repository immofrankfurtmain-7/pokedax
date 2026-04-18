const fs = require('fs'), path = require('path');
const root = 'C:\\Users\\lenovo\\pokedax\\pokedax\\pokedax';

// 1. Check layout.tsx
const layout = fs.readFileSync(path.join(root, 'src/app/layout.tsx'), 'utf8');
console.log('=== layout.tsx navbar import ===');
layout.split('\n').filter(l => l.includes('Navbar') || l.includes('navbar')).forEach(l => console.log(' ', l.trim()));

// 2. Check if layout/Navbar still exists
const oldNav = path.join(root, 'src/components/layout/Navbar.tsx');
console.log('\n=== Old layout/Navbar.tsx exists:', fs.existsSync(oldNav));
if (fs.existsSync(oldNav)) {
  const c = fs.readFileSync(oldNav, 'utf8');
  console.log('  size:', c.length, '| first line:', c.split('\n')[0]);
}

// 3. Check new Navbar
const newNav = path.join(root, 'src/components/Navbar.tsx');
console.log('\n=== New Navbar.tsx exists:', fs.existsSync(newNav));
if (fs.existsSync(newNav)) {
  const c = fs.readFileSync(newNav, 'utf8');
  console.log('  size:', c.length, '| has Playfair:', c.includes('Playfair'));
}

// 4. Check forum page
const forumPath = path.join(root, 'src/app/forum/page.tsx');
const forum = fs.readFileSync(forumPath, 'utf8');
console.log('\n=== Forum page ===');
console.log('  size:', forum.length, '| Playfair:', forum.includes('Playfair'));
console.log('  has user_id in insert:', forum.includes('user_id'));
const insertIdx = forum.indexOf('.insert({');
if (insertIdx > 0) console.log('  insert block:', forum.slice(insertIdx, insertIdx + 200));

// 5. Check marketplace
const mpPath = path.join(root, 'src/app/marketplace/page.tsx');
const mp = fs.readFileSync(mpPath, 'utf8');
console.log('\n=== Marketplace ===');
console.log('  size:', mp.length, '| has createModal:', mp.includes('CreateModal'));
console.log('  has card search results:', mp.includes('setResults'));

// 6. Check sets
const setsPath = path.join(root, 'src/app/sets/page.tsx');
const sets = fs.readFileSync(setsPath, 'utf8');
console.log('\n=== Sets page ===');
console.log('  has logo_url:', sets.includes('logo_url'));
console.log('  has image:', sets.includes('img') || sets.includes('image'));
