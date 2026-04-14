const fs = require('fs'), path = require('path');
const root = "C:\\Users\\lenovo\\pokedax\\pokedax\\pokedax";
const files = [
  ["src/app/globals.css", "/mnt/user-data/outputs/obsidian_globals.css"],
  ["src/components/Navbar.tsx", "/mnt/user-data/outputs/obsidian_Navbar.tsx"],
  ["src/app/page.tsx", "/mnt/user-data/outputs/obsidian_page_home.tsx"],
  ["src/app/scanner/page.tsx", "/mnt/user-data/outputs/obsidian_page_scanner.tsx"],
  ["src/app/preischeck/page.tsx", "/mnt/user-data/outputs/obsidian_page_preischeck.tsx"],
  ["src/app/dashboard/portfolio/page.tsx", "/mnt/user-data/outputs/obsidian_page_portfolio.tsx"],
  ["src/app/marketplace/page.tsx", "/mnt/user-data/outputs/obsidian_page_marketplace.tsx"],
  ["src/app/preischeck/[id]/page.tsx", "/mnt/user-data/outputs/obsidian_card_detail_page.tsx"],
  ["src/app/profil/[username]/page.tsx", "/mnt/user-data/outputs/obsidian_profil_page.tsx"],
  ["src/app/sets/page.tsx", "/mnt/user-data/outputs/obsidian_page_sets.tsx"],
  ["src/app/sets/[id]/page.tsx", "/mnt/user-data/outputs/obsidian_set_detail_page.tsx"],
  ["src/app/api/scanner/scan/route.ts", "/mnt/user-data/outputs/obsidian_scanner_v2_route.ts"],
];
console.log('pokEdax — Obsidian Heritage v8.9');
for (const [rel, fp] of files) {
  const content = fs.readFileSync(fp, 'utf8');
  const f = path.join(root, rel);
  fs.mkdirSync(path.dirname(f), {recursive:true});
  fs.writeFileSync(f, content, 'utf8');
  console.log('OK  ' + rel);
}
console.log('Fertig! npx vercel deploy --prod');