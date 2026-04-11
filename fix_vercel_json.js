const fs = require('fs');
const path = require('path');
const root = 'C:\\Users\\lenovo\\pokedax\\pokedax\\pokedax';
fs.writeFileSync(path.join(root, 'vercel.json'), "{\n  \"crons\": [\n    {\n      \"path\": \"/api/cron/price-history\",\n      \"schedule\": \"0 2 * * *\"\n    },\n    {\n      \"path\": \"/api/cron/wishlist-notify\",\n      \"schedule\": \"0 9 * * *\"\n    },\n    {\n      \"path\": \"/api/cron/escrow-release\",\n      \"schedule\": \"0 3 * * *\"\n    },\n    {\n      \"path\": \"/api/cron/price-alerts\",\n      \"schedule\": \"0 8 * * *\"\n    },\n    {\n      \"path\": \"/api/cron/fantasy-reset\",\n      \"schedule\": \"0 0 1 1,4,7,10 *\"\n    }\n  ]\n}", 'utf8');
console.log('OK  vercel.json (alle Crons: 1x taeglich)');
console.log('\nJetzt: npx vercel deploy --prod');
