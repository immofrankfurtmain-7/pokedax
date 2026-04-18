const fs = require('fs'), path = require('path');
const f = path.join('C:\\Users\\lenovo\\pokedax\\pokedax\\pokedax', 'src/app/preischeck/[id]/page.tsx');
let c = fs.readFileSync(f, 'utf8');

// Remove the problematic <link> tag completely
c = c.replace(/<link rel="stylesheet"[^>]*\/>\n?/g, '');

// Remove the <style dangerouslySetInnerHTML...> block completely  
c = c.replace(/<style dangerouslySetInnerHTML=\{\{__html:"[\s\S]*?"\}\}\/>\n?/g, '');

// Now the return starts clean with just the div
// Add font via useEffect instead - safe approach
const fontEffect = `
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;700&family=Instrument+Sans:wght@400;500;600&display=swap';
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);
`;

// Add CSS via useEffect too
const cssEffect = `
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = [
      ".ph{font-family:'Playfair Display',serif;letter-spacing:-0.05em}",
      ".btn-gold{display:inline-flex;align-items:center;gap:8px;padding:14px 28px;background:#C9A66B;color:#0A0A0A;border-radius:100px;border:none;font-size:14px;font-weight:600;cursor:pointer;text-decoration:none;transition:transform 0.2s;width:100%;justify-content:center}",
      ".btn-gold:hover{transform:scale(1.02)}",
      ".btn-outline{display:inline-flex;align-items:center;gap:8px;padding:13px 24px;border:1px solid rgba(201,166,107,0.3);color:#C9A66B;border-radius:100px;background:transparent;font-size:14px;cursor:pointer;text-decoration:none;transition:all 0.2s;width:100%;justify-content:center}",
      ".btn-outline:hover{background:#C9A66B;color:#0A0A0A}",
      ".listing-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 18px;background:#1A1A1A;border-bottom:1px solid rgba(255,255,255,0.05);transition:background 0.15s}",
      ".listing-row:hover{background:#1F1F1F}",
      ".listing-row:last-child{border-bottom:none}",
      ".sim-card{background:#111111;border:1px solid rgba(255,255,255,0.06);border-radius:16px;overflow:hidden;text-decoration:none;display:block;transition:transform 0.2s,border-color 0.2s}",
      ".sim-card:hover{transform:translateY(-4px);border-color:rgba(201,166,107,0.25)}",
      ".attack-row{padding:16px 18px;background:#1A1A1A;border-bottom:1px solid rgba(255,255,255,0.05)}",
      ".attack-row:last-child{border-bottom:none}",
      ".stat-cell{padding:16px;background:#111111;border-right:1px solid rgba(255,255,255,0.05);border-bottom:1px solid rgba(255,255,255,0.05)}",
      ".breadcrumb-link{color:rgba(237,233,224,0.4);text-decoration:none;font-size:13px;transition:color 0.15s}",
      ".breadcrumb-link:hover{color:#C9A66B}",
    ].join(' ');
    style.id = 'card-detail-styles';
    if (!document.getElementById('card-detail-styles')) document.head.appendChild(style);
    return () => { const s = document.getElementById('card-detail-styles'); if(s) s.remove(); };
  }, []);
`;

// Insert both effects after the sales useEffect
// Find a good insertion point - after the last useEffect closing
const insertAfter = '    setLoading(false);\n    }\n    load();\n  }, [id]);';
c = c.replace(insertAfter, insertAfter + '\n' + fontEffect + cssEffect);

fs.writeFileSync(f, c, 'utf8');
console.log('Fixed permanently!');
console.log('Has <link tag:', c.includes('<link rel='));
console.log('Has <style dangerously:', c.includes('dangerouslySetInnerHTML'));
console.log('Has useEffect fonts:', c.includes('googleapis'));
console.log('File size:', c.length);

// Check lines 94-100
const lines = c.split('\n');
console.log('\nLines 92-100:');
for (let i = 91; i < 100; i++) console.log(`${i+1}: ${lines[i]}`);
