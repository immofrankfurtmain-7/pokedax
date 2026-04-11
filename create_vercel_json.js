const fs = require('fs');
const path = require('path');
const root = 'C:\\Users\\lenovo\\pokedax\\pokedax\\pokedax';

const content = "{\n  \"crons\": [\n    {\n      \"path\": \"/api/cron/price-history\",\n      \"schedule\": \"0 2 * * *\"\n    },\n    {\n      \"path\": \"/api/cron/wishlist-notify\",\n      \"schedule\": \"0 9 * * *\"\n    },\n    {\n      \"path\": \"/api/cron/escrow-release\",\n      \"schedule\": \"0 */4 * * *\"\n    },\n    {\n      \"path\": \"/api/cron/price-alerts\",\n      \"schedule\": \"0 8 * * *\"\n    },\n    {\n      \"path\": \"/api/cron/fantasy-reset\",\n      \"schedule\": \"0 0 1 1,4,7,10 *\"\n    }\n  ]\n}";
fs.writeFileSync(path.join(root, 'vercel.json'), content, 'utf8');
console.log('OK  vercel.json');
console.log('');
console.log('Cron-Zeiten:');
console.log('  02:00 Uhr taeglich     - Price History');
console.log('  09:00 Uhr taeglich     - Wishlist E-Mails');
console.log('  alle 4 Stunden         - Escrow Auto-Release');
console.log('  08:00 Uhr taeglich     - Preisalarme pruefen');
console.log('  1. Jan/Apr/Jul/Okt     - Fantasy Saison-Reset');
console.log('');
console.log('GitHub Desktop -> Commit -> Push');
