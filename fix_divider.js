const fs = require('fs'), path = require('path');
const f = path.join('C:\\Users\\lenovo\\pokedax\\pokedax\\pokedax', 'src/app/page.tsx');
let c = fs.readFileSync(f, 'utf8');
c = c.replace(
  '<GoldDivider style={{ marginTop:"clamp(48px,6vw,80px)" }} />',
  '<div style={{ marginTop:"clamp(48px,6vw,80px)" }}><GoldDivider /></div>'
);
fs.writeFileSync(f, c, 'utf8');
console.log('Fixed GoldDivider props error');
