const fs = require('fs'), path = require('path');
const root = 'C:\\Users\\lenovo\\pokedax\\pokedax\\pokedax';

// ── 1. FIX CARD DETAIL ──────────────────────────────────────
const cardPath = path.join(root, 'src/app/preischeck/[id]/page.tsx');
let card = fs.readFileSync(cardPath, 'utf8');

// Remove the link tag (causes parse error)
card = card.replace(/<link rel="stylesheet"[^/]*\/>/g, '');

// Replace <style>{`...`}</style> with dangerouslySetInnerHTML
// but only replace the opening - keep the content
while (card.includes('<style>{`')) {
  const s1 = card.indexOf('<style>{`');
  const s2 = card.indexOf('`}</style>', s1);
  if (s2 === -1) break;
  const css = card.slice(s1 + '<style>{`'.length, s2);
  // Build safe replacement using string concat to avoid any parse issues
  const replacement = '<style dangerouslySetInnerHTML={{__html:"' + 
    css.replace(/\\/g,'\\\\').replace(/"/g,'\\"').replace(/\n/g,'\\n').replace(/\r/g,'') + 
    '"}}/>';
  card = card.slice(0, s1) + replacement + card.slice(s2 + '`}</style>'.length);
}

fs.writeFileSync(cardPath, card, 'utf8');
console.log('Card detail - has style backtick:', card.includes('<style>{`'));
console.log('Card detail - has dangerously:', card.includes('dangerouslySetInnerHTML'));
console.log('Card detail size:', card.length);

// ── 2. FIX DOUBLE NAVBAR ────────────────────────────────────
// Find all pages that render their own nav
function walk(dir, results=[]) {
  try {
    for (const item of fs.readdirSync(dir)) {
      if (item==='node_modules'||item==='.next') continue;
      const full = path.join(dir,item);
      if (fs.statSync(full).isDirectory()) walk(full,results);
      else if (item.endsWith('.tsx')) results.push(full);
    }
  } catch {}
  return results;
}

let fixed = 0;
for (const f of walk(path.join(root,'src/app'))) {
  let c = fs.readFileSync(f,'utf8');
  let changed = false;
  
  // Remove own Navbar imports
  if (c.includes("from '@/components/Navbar'") || c.includes('from "@/components/Navbar"')) {
    const before = c.length;
    c = c.replace(/import Navbar from ['"]@\/components\/Navbar['"];?\n?/g,'');
    c = c.replace(/\s*<Navbar\s*\/>/g,'');
    if (c.length !== before) { changed = true; console.log('Removed Navbar from:', f.replace(root,'')); }
  }
  
  // Remove own fixed position nav/header that isn't Navbar.tsx
  if (!f.includes('Navbar') && (c.includes("position: 'fixed'") || c.includes('position:"fixed"') || c.includes('position: "fixed"'))) {
    // Only remove nav elements, not modals/dropdowns
    const navPattern = /<(nav|header)\s[^>]*position[^>]*fixed[^>]*>[\s\S]*?<\/(nav|header)>/g;
    const before = c.length;
    c = c.replace(navPattern, '');
    if (c.length !== before) { changed = true; console.log('Removed fixed nav from:', f.replace(root,'')); }
  }
  
  if (changed) { fs.writeFileSync(f, c, 'utf8'); fixed++; }
}
console.log('\nNavbar fixes applied to', fixed, 'files');
