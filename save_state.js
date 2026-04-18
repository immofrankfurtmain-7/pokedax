const fs = require('fs'), path = require('path');
const root = 'C:\\Users\\lenovo\\pokedax\\pokedax\\pokedax';

const filesToSave = [
  ['Navbar.tsx',           'src/components/Navbar.tsx'],
  ['layout.tsx',           'src/app/layout.tsx'],
  ['page_home.tsx',        'src/app/page.tsx'],
  ['page_preischeck.tsx',  'src/app/preischeck/page.tsx'],
  ['card_detail_page.tsx', 'src/app/preischeck/[id]/page.tsx'],
  ['page_scanner.tsx',     'src/app/scanner/page.tsx'],
  ['page_forum.tsx',       'src/app/forum/page.tsx'],
  ['page_marketplace.tsx', 'src/app/marketplace/page.tsx'],
  ['page_portfolio.tsx',   'src/app/dashboard/portfolio/page.tsx'],
  ['page_dashboard.tsx',   'src/app/dashboard/page.tsx'],
  ['page_premium.tsx',     'src/app/dashboard/premium/page.tsx'],
  ['page_sets.tsx',        'src/app/sets/page.tsx'],
  ['set_detail_page.tsx',  'src/app/sets/[id]/page.tsx'],
  ['page_leaderboard.tsx', 'src/app/leaderboard/page.tsx'],
  ['page_login.tsx',       'src/app/auth/login/page.tsx'],
  ['page_register.tsx',    'src/app/auth/register/page.tsx'],
  ['page_fantasy.tsx',     'src/app/fantasy/page.tsx'],
  ['page_compare.tsx',     'src/app/compare/page.tsx'],
  ['page_settings.tsx',    'src/app/settings/page.tsx'],
  ['page_matches.tsx',     'src/app/matches/page.tsx'],
  ['page_wishlist.tsx',    'src/app/dashboard/wishlist/page.tsx'],
  ['profil_page.tsx',      'src/app/profil/[username]/page.tsx'],
  ['page_admin.tsx',       'src/app/admin/page.tsx'],
  ['globals.css',          'src/app/globals.css'],
  ['price_sync_cron.ts',   'src/app/api/cron/price-sync/route.ts'],
  ['jp_bootstrap.ts',      'src/app/api/bootstrap/jp-cards/route.ts'],
];

const state = JSON.parse(fs.readFileSync('/mnt/user-data/outputs/pokedax_state.json', 'utf8'));
let saved = 0, missing = 0;

for (const [key, rel] of filesToSave) {
  const full = path.join(root, rel);
  if (fs.existsSync(full)) {
    state.files[key] = fs.readFileSync(full, 'utf8');
    saved++;
    console.log('✓', key, '—', state.files[key].length, 'chars');
  } else {
    missing++;
    console.log('✗ MISSING:', rel);
  }
}

state.version = 'v9.2';
state.last_saved = new Date().toISOString();
state.notes = 'Sprint 6 complete — all 20 pages luxury gold design, price chart, JP bootstrap, cron';

fs.writeFileSync('/mnt/user-data/outputs/pokedax_state.json', JSON.stringify(state, null, 2), 'utf8');
console.log('\nState saved:', saved, 'files |', missing, 'missing');
console.log('Version:', state.version);
