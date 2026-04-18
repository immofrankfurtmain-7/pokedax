const fs = require('fs'), path = require('path');
const f = path.join('C:\\Users\\lenovo\\pokedax\\pokedax\\pokedax', 'src/app/preischeck/[id]/page.tsx');
let c = fs.readFileSync(f, 'utf8');

console.log('File size:', c.length);
console.log('Line 96:', c.split('\n')[95]);
console.log('Line 97:', c.split('\n')[96]);

// The error is at line 96 in <style>{`...`}</style>
// Move Google Fonts to a const OUTSIDE the JSX return
// Find the style block with @import
const styleStart = c.indexOf('<style>{`');
const styleEnd = c.indexOf('`}</style>', styleStart) + '`}</style>'.length;
const styleContent = c.slice(styleStart + '<style>{`'.length, styleEnd - '`}</style>'.length);

console.log('\nStyle content first 100:', styleContent.slice(0, 100));

// Check for backtick inside the style content
const innerBackticks = styleContent.split('`').length - 1;
console.log('Inner backticks:', innerBackticks);

// Solution: replace the @import line with a Link tag approach
// Move fonts to a const before return
const fontsConst = `
  const FONTS_URL = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;700&family=Instrument+Sans:wght@400;500;600&display=swap";
`;

// Replace @import in style with just CSS, add link tag separately
const newStyleContent = styleContent.replace(
  /\s*@import url\([^)]+\);\s*/,
  '\n        '
);

const newStyleBlock = '<style>{`' + newStyleContent + '`}</style>';

// Add link tag before style tag
const linkTag = '{/* eslint-disable-next-line */}\n      <link rel="preconnect" href="https://fonts.googleapis.com"/>\n      <link href={"https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;700&family=Instrument+Sans:wght@400;500;600&display=swap"} rel="stylesheet"/>\n      ';

c = c.slice(0, styleStart) + linkTag + newStyleBlock + c.slice(styleEnd);

fs.writeFileSync(f, c, 'utf8');
console.log('\nFixed! New size:', c.length);
console.log('Has @import:', c.includes('@import'));
console.log('Has link tag:', c.includes('preconnect'));
