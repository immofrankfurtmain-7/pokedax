const fs = require('fs');
const path = require('path');
const root = 'C:\\Users\\lenovo\\pokedax\\pokedax\\pokedax';

const check = [
  'src/app/page.tsx',
  'src/app/layout.tsx', 
  'src/app/manifest.ts',
  'src/app/compare/page.tsx',
  'src/app/admin/page.tsx',
  'src/app/leaderboard/page.tsx',
  'public/favicon.svg',
  'public/icon-192.svg',
];

console.log('Checking files in:', root);
console.log('');

let outdated = 0;
for (const rel of check) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) {
    console.log('MISSING  ' + rel);
    outdated++;
    continue;
  }
  const content = fs.readFileSync(full, 'utf8');
  const size = content.length;
  // Check for new content markers
  const isNew = {
    'src/app/page.tsx':       content.includes('TrendCard') || content.includes('trending'),
    'src/app/layout.tsx':     content.includes('manifest') || content.includes('appleWebApp'),
    'src/app/manifest.ts':    content.includes('manifest'),
    'src/app/compare/page.tsx':  content.includes('StatRow'),
    'src/app/admin/page.tsx': content.includes('cronLog'),
    'src/app/leaderboard/page.tsx': content.includes('podium'),
    'public/favicon.svg':     true,
    'public/icon-192.svg':    true,
  };
  const status = isNew[rel] ? 'OK ' : 'OLD';
  if (status === 'OLD') outdated++;
  console.log(status + '  ' + rel + ' (' + size + ' chars)');
}

console.log('');
if (outdated > 0) {
  console.log('PROBLEM: ' + outdated + ' Dateien fehlen oder sind veraltet!');
  console.log('Loesung: deploy_v85.js nochmal ausfuehren, dann in GitHub Desktop committen');
} else {
  console.log('Alle Dateien aktuell - Problem liegt bei GitHub Desktop (commit vergessen?)');
}
