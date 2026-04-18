const fs = require('fs'), path = require('path');
const f = path.join('C:\\Users\\lenovo\\pokedax\\pokedax\\pokedax', 'src/app/api/cron/price-sync/route.ts');
let c = fs.readFileSync(f, 'utf8');

// Fix: only use columns that exist in DB
// price_history has: id, card_id, price_market, price_low, recorded_at
c = c.replace(
  `const rows = cards.map(c => ({
      card_id: c.id, recorded_at: today,
      price: c.price_market, price_low: c.price_low,
      price_avg: c.price_avg7, source: "cardmarket",
    }));`,
  `const rows = cards.map(c => ({
      card_id:      c.id,
      recorded_at:  today,
      price_market: c.price_market,
      price_low:    c.price_low ?? null,
    }));`
);

fs.writeFileSync(f, c, 'utf8');
console.log('Fixed cron columns');
console.log('Has price_market:', c.includes('price_market: c.price_market'));
