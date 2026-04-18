const fs = require('fs'), path = require('path');
const f = path.join('C:\\Users\\lenovo\\pokedax\\pokedax\\pokedax', 'src/app/preischeck/[id]/page.tsx');
let c = fs.readFileSync(f, 'utf8');

// Extract style content
const s1 = c.indexOf('<style>{`') + '<style>{`'.length;
const s2 = c.indexOf('`}</style>', s1);
const css = c.slice(s1, s2);

// Replace entire style block with dangerouslySetInnerHTML approach
const oldBlock = '<style>{`' + css + '`}</style>';
const newBlock = '<style dangerouslySetInnerHTML={{__html: ' + JSON.stringify(css) + '}} />';

c = c.replace(oldBlock, newBlock);

fs.writeFileSync(f, c, 'utf8');
console.log('Fixed!');
console.log('Has old style block:', c.includes('<style>{`'));
console.log('Has new style block:', c.includes('dangerouslySetInnerHTML'));
