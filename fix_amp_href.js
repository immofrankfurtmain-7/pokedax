const fs = require('fs'), path = require('path');
const f = path.join('C:\\Users\\lenovo\\pokedax\\pokedax\\pokedax', 'src/app/preischeck/[id]/page.tsx');
let c = fs.readFileSync(f, 'utf8');

// In JSX, & in href must be &amp; OR use a JS expression
// Replace the link tag with a JS expression for href
c = c.replace(
  `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;700&family=Instrument+Sans:wght@400;500;600&display=swap"/>`,
  `<link rel="stylesheet" href={"https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;700&family=Instrument+Sans:wght@400;500;600&display=swap"}/>`
);

fs.writeFileSync(f, c, 'utf8');
console.log('Fixed! Has &amp; issue:', c.includes('href="https://fonts'));
console.log('Has JS expression:', c.includes('href={"https://fonts'));
