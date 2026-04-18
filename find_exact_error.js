const fs = require('fs'), path = require('path');
const f = path.join('C:\\Users\\lenovo\\pokedax\\pokedax\\pokedax', 'src/app/preischeck/[id]/page.tsx');
const c = fs.readFileSync(f, 'utf8');

// Find the style block content
const s1 = c.indexOf('<style>{`') + '<style>{`'.length;
const s2 = c.indexOf('`}</style>', s1);
const styleContent = c.slice(s1, s2);

console.log('Style block length:', styleContent.length);
console.log('\nFull style content:');
console.log(styleContent);
