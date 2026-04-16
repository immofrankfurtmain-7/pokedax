const fs=require('fs'),path=require('path');
const root='C:\\Users\\lenovo\\pokedax\\pokedax\\pokedax';

// Fix double navbar pages
const pages=['src/app/dashboard/wishlist/page.tsx','src/app/forum/mod/page.tsx'];
for(const rel of pages){
  const f=path.join(root,rel);
  if(!fs.existsSync(f)) continue;
  let c=fs.readFileSync(f,'utf8');
  c=c.replace(/import Navbar from ['"]@\/components\/Navbar['"];?\n?/g,'');
  c=c.replace(/import Navbar from ['"]@\/components\/layout\/Navbar['"];?\n?/g,'');
  c=c.replace(/\s*<Navbar\s*\/>/g,'');
  fs.writeFileSync(f,c,'utf8');
  console.log('Fixed double navbar:',rel);
}

// Fix homepage fantasy section
const hp=path.join(root,'src/app/page.tsx');
let hc=fs.readFileSync(hp,'utf8');
const FANTASY_FIX="\n      <section style={{maxWidth:1600,margin:\"0 auto\",padding:\"clamp(60px,8vw,112px) clamp(20px,4vw,40px)\"}}>\n        <div style={{background:\"#111111\",borderRadius:32,padding:\"clamp(48px,6vw,80px)\",textAlign:\"center\",border:\"1px solid rgba(201,166,107,0.25)\",boxShadow:\"0 40px 80px -30px rgba(201,166,107,0.2)\",position:\"relative\",overflow:\"hidden\"}}>\n          <div style={{position:\"absolute\",top:0,left:\"15%\",right:\"15%\",height:1,background:\"linear-gradient(90deg,transparent,rgba(201,166,107,0.5),transparent)\"}}/>\n          <div style={{display:\"inline-flex\",alignItems:\"center\",gap:8,padding:\"8px 20px\",background:\"rgba(201,166,107,0.1)\",color:\"#C9A66B\",borderRadius:100,fontSize:13,fontWeight:600,marginBottom:24,border:\"1px solid rgba(201,166,107,0.2)\"}}>\n            <span>\ud83c\udfc6</span> \u2726 COMING SOON\n          </div>\n          <h2 style={{fontFamily:\"'Playfair Display',serif\",fontSize:\"clamp(36px,5vw,64px)\",lineHeight:1,marginBottom:24,color:\"#EDE9E0\",letterSpacing:\"-0.04em\"}}>Fantasy League</h2>\n          <p style={{fontSize:\"clamp(15px,1.5vw,20px)\",color:\"rgba(237,233,224,0.7)\",maxWidth:440,margin:\"0 auto 48px\",lineHeight:1.7}}>\n            Bilde dein Traum-Team aus seltenen Pok\u00e9mon TCG Karten.<br/>Tritt gegen andere Sammler an und gewinne Preise.\n          </p>\n          <div style={{maxWidth:480,margin:\"0 auto\"}}>\n            <div style={{display:\"flex\",gap:10,flexWrap:\"wrap\"}}>\n              <input type=\"email\" placeholder=\"Deine E-Mail-Adresse\" style={{flex:1,minWidth:220,background:\"rgba(255,255,255,0.04)\",border:\"1px solid rgba(201,166,107,0.3)\",borderRadius:100,padding:\"18px 28px\",color:\"#EDE9E0\",fontSize:15,outline:\"none\",fontFamily:\"inherit\"}}/>\n              <button style={{padding:\"18px 32px\",background:\"#C9A66B\",color:\"#0A0A0A\",borderRadius:100,border:\"none\",fontSize:14,fontWeight:600,cursor:\"pointer\",whiteSpace:\"nowrap\"}}>Early Access \u2726</button>\n            </div>\n            <p style={{fontSize:12,color:\"rgba(201,166,107,0.5)\",marginTop:14}}>Erhalte Early Access und exklusive Infos zur Fantasy League</p>\n          </div>\n        </div>\n      </section>\n";

// Find fantasy/CTA section to insert before
const markers=['Fantasy League','fantasy'];
let inserted=false;
for(const m of markers){
  const idx=hc.indexOf(m);
  if(idx>0){
    // Find the enclosing section start
    const secStart=hc.lastIndexOf('<section',idx);
    const secEnd=hc.indexOf('</section>',idx)+10;
    if(secStart>0&&secEnd>10){
      hc=hc.slice(0,secStart)+FANTASY_FIX+hc.slice(secEnd);
      console.log('Fantasy section replaced');
      inserted=true;
      break;
    }
  }
}
if(!inserted){
  // Insert before closing </div> of main wrapper
  const lastDiv=hc.lastIndexOf('      {/* ── CTA');
  if(lastDiv>0){
    hc=hc.slice(0,lastDiv)+FANTASY_FIX+'\n      '+hc.slice(lastDiv);
    console.log('Fantasy section inserted before CTA');
  }
}

fs.writeFileSync(hp,hc,'utf8');
console.log('OK — all fixes applied');
