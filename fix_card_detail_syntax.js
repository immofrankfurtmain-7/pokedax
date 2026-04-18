const fs = require('fs'), path = require('path');
const f = path.join('C:\\Users\\lenovo\\pokedax\\pokedax\\pokedax', 'src/app/preischeck/[id]/page.tsx');
let c = fs.readFileSync(f, 'utf8');

// Fix 1: & in Google Fonts URL inside template literal breaks webpack
// Replace the style block with escaped &
c = c.replace(
  `family=Playfair+Display:wght@400;500;700&family=Instrument+Sans:wght@400;500;600`,
  `family=Playfair+Display:wght@400;500;700\\u0026family=Instrument+Sans:wght@400;500;600`
);

// Fix 2: Also escape any other & in style tags
c = c.replace(
  /<style>\{`([\s\S]*?)`\}<\/style>/g,
  (match, inner) => {
    // Only fix & that aren't already escaped and aren't in JSX
    const fixed = inner.replace(/&(?!amp;|lt;|gt;|quot;|#)/g, '\\u0026');
    return `<style>{\`${fixed}\`}</style>`;
  }
);

fs.writeFileSync(f, c, 'utf8');
console.log('Fixed! Size:', c.length);

// Verify no remaining issues
const remaining = (c.match(/fonts\.googleapis.*&family/g) || []).length;
console.log('Remaining unescaped & in font URLs:', remaining);
