const fs = require('fs'), path = require('path');
const root = 'C:\\Users\\lenovo\\pokedax\\pokedax\\pokedax';

// 1. Forum - category_id issue
const forum = fs.readFileSync(path.join(root, 'src/app/forum/page.tsx'), 'utf8');
const insertIdx = forum.indexOf('attempts');
console.log('=== FORUM INSERT ===');
console.log(forum.slice(insertIdx, insertIdx + 400));

// 2. Card detail - has price chart?
const card = fs.readFileSync(path.join(root, 'src/app/preischeck/[id]/page.tsx'), 'utf8');
console.log('\n=== CARD DETAIL ===');
console.log('Has PriceChart:', card.includes('PriceChart'));
console.log('Has price_history fetch:', card.includes('price_history'));
console.log('Has history state:', card.includes('setHistory'));

// 3. Sets page
const sets = fs.readFileSync(path.join(root, 'src/app/sets/page.tsx'), 'utf8');
console.log('\n=== SETS PAGE ===');
console.log('Has logo_url select:', sets.includes('logo_url'));
console.log('Has img tag:', sets.includes('<img'));
console.log('Select line:', sets.slice(sets.indexOf('.select('), sets.indexOf('.select(')+80));

// 4. Price sync cron
const cronPath = path.join(root, 'src/app/api/cron/price-sync/route.ts');
console.log('\n=== PRICE SYNC CRON ===');
console.log('File exists:', fs.existsSync(cronPath));
if (fs.existsSync(cronPath)) {
  const cron = fs.readFileSync(cronPath, 'utf8');
  console.log('Has price_history insert:', cron.includes('price_history'));
  console.log('Has upsert:', cron.includes('upsert'));
  console.log('Size:', cron.length);
}

// 5. Vercel.json cron
const vj = path.join(root, 'vercel.json');
console.log('\n=== VERCEL.JSON ===');
if (fs.existsSync(vj)) {
  console.log(fs.readFileSync(vj, 'utf8'));
} else {
  console.log('NOT FOUND');
}

// 6. JP bootstrap
const jpPath = path.join(root, 'src/app/api/bootstrap/jp-cards/route.ts');
console.log('\n=== JP BOOTSTRAP ===');
console.log('File exists:', fs.existsSync(jpPath));
