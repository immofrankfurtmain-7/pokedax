import Link from "next/link";
export const dynamic = "force-dynamic";
const G="#E9A84B",G18="rgba(233,168,75,0.18)",G08="rgba(233,168,75,0.08)";
const BG1="#111113",BR1="rgba(255,255,255,0.06)",BR2="rgba(255,255,255,0.10)";
const TX1="#f0f0f5",TX2="#a8a8b8",TX3="#6b6b7a",GREEN="#4BBF82";
function Check(){return(<span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:20,height:20,borderRadius:"50%",background:"rgba(75,191,130,0.12)",flexShrink:0}}><svg width="8" height="8" viewBox="0 0 8 8"><polyline points="1,4 3,6 7,1.5" stroke={GREEN} strokeWidth="1.4" fill="none"/></svg></span>);}
function Cross(){return(<span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:20,height:20,borderRadius:"50%",background:"rgba(255,255,255,0.04)",flexShrink:0}}><svg width="8" height="8" viewBox="0 0 8 8"><line x1="2" y1="2" x2="6" y2="6" stroke="rgba(255,255,255,0.2)" strokeWidth="1.4"/><line x1="6" y1="2" x2="2" y2="6" stroke="rgba(255,255,255,0.2)" strokeWidth="1.4"/></svg></span>);}
const FEATURES=[
  {l:"Scans pro Tag",f:"5",p:"Unlimitiert",d:"Unlimitiert"},
  {l:"Preisverlauf",f:"—",p:"90 Tage",d:"Unbegrenzt"},
  {l:"Portfolio-Tracker",f:"—",p:"✓",d:"✓"},
  {l:"Preis-Alerts",f:"—",p:"✓",d:"✓"},
  {l:"Exklusiv-Forum",f:"—",p:"✓",d:"✓"},
  {l:"Verified Badge",f:"—",p:"—",d:"✓"},
  {l:"Shop-Seite",f:"—",p:"—",d:"✓"},
  {l:"API-Zugang",f:"—",p:"—",d:"Beta"},
];
export default function PremiumPage(){
  return(
    <div style={{color:TX1}}>
      <div style={{maxWidth:1000,margin:"0 auto",padding:"80px 24px"}}>
        {/* Hero */}
        <div style={{textAlign:"center",marginBottom:64}}>
          <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(40px,6vw,68px)",fontWeight:300,letterSpacing:"-.085em",lineHeight:1.0,marginBottom:20}}>
            Das volle Potential<br/><span style={{color:G}}>deiner Sammlung.</span>
          </h1>
          <p style={{fontSize:"clamp(16px,1.8vw,21px)",color:TX2,maxWidth:480,margin:"0 auto"}}>Unlimitierter Scanner, Echtzeit-Alerts und Portfolio-Tracking. Für Sammler, die jeden Euro kennen.</p>
        </div>
        {/* Social proof */}
        <div style={{background:G08,border:`1px solid ${G18}`,borderRadius:20,padding:"16px 28px",display:"flex",alignItems:"center",justifyContent:"center",gap:16,marginBottom:56,flexWrap:"wrap"}}>
          <span style={{fontSize:10,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",padding:"3px 12px",borderRadius:6,background:"rgba(233,168,75,0.12)",color:G,border:`1px solid ${G18}`}}>Live</span>
          <span style={{fontSize:15,color:TX2}}><strong style={{color:TX1,fontWeight:500}}>3.841 Sammler</strong> nutzen PokéDax Premium — durchschnittlich +18 % Portfolio-Wert im ersten Monat.</span>
        </div>
        {/* Plans */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginBottom:48}}>
          {/* Free */}
          <div style={{background:BG1,border:`1px solid ${BR2}`,borderRadius:28,padding:"clamp(28px,4vw,44px)"}}>
            <div style={{fontSize:10,fontWeight:600,letterSpacing:".12em",textTransform:"uppercase",color:TX3,marginBottom:16}}>COMMON ●</div>
            <div style={{fontFamily:"var(--font-display)",fontSize:36,fontWeight:300,letterSpacing:"-.05em",color:TX2,marginBottom:4}}>Free</div>
            <div style={{fontSize:13,color:TX3,marginBottom:32}}>für immer</div>
            <div style={{display:"flex",flexDirection:"column",gap:11,marginBottom:32}}>
              {["5 Scans/Tag","Basis-Preischeck","Forum lesen"].map(t=><div key={t} style={{display:"flex",alignItems:"center",gap:10,fontSize:14,color:TX2}}><Check/>{t}</div>)}
              {["Portfolio","Preis-Alerts"].map(t=><div key={t} style={{display:"flex",alignItems:"center",gap:10,fontSize:14,color:TX3,textDecoration:"line-through"}}><Cross/>{t}</div>)}
            </div>
            <div style={{textAlign:"center",padding:"13px",borderRadius:18,background:"rgba(255,255,255,0.04)",color:TX2,fontSize:14}}>Aktueller Plan</div>
          </div>
          {/* Premium */}
          <div className="gold-glow" style={{background:`radial-gradient(ellipse 80% 55% at 50% 0%,rgba(233,168,75,0.07),transparent 55%),${BG1}`,border:"1px solid rgba(233,168,75,0.25)",borderRadius:28,padding:"clamp(28px,4vw,44px)",position:"relative"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,rgba(233,168,75,0.5),transparent)`,borderRadius:"28px 28px 0 0"}}/>
            <div style={{position:"absolute",top:-1,left:"50%",transform:"translateX(-50%)",padding:"4px 18px",background:G,color:"#0a0808",fontSize:9,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",borderRadius:"0 0 10px 10px",whiteSpace:"nowrap"}}>BELIEBTESTE WAHL</div>
            <div style={{fontSize:10,fontWeight:600,letterSpacing:".12em",textTransform:"uppercase",color:G,marginBottom:16,marginTop:12}}>ILLUSTRATION RARE ✦</div>
            <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:4}}>
              <span style={{fontFamily:"'DM Mono',monospace",fontSize:44,fontWeight:400,color:G,letterSpacing:"-.04em"}}>6,99</span>
              <span style={{fontSize:16,color:G}}>€ / Mo</span>
            </div>
            <div style={{fontSize:13,color:TX3,marginBottom:32}}>jederzeit kündbar</div>
            <div style={{display:"flex",flexDirection:"column",gap:11,marginBottom:32}}>
              {["Unlimitierter Scanner","Portfolio + Charts","Realtime Preis-Alerts","Preisverlauf 90 Tage","Exklusiv-Forum ✦","Grading-Beratung 2×/Mo"].map(t=><div key={t} style={{display:"flex",alignItems:"center",gap:10,fontSize:14,color:TX2}}><Check/>{t}</div>)}
            </div>
            <Link href="#stripe" style={{display:"block",textAlign:"center",padding:"15px",borderRadius:18,background:G,color:"#0a0808",fontSize:15,fontWeight:700,textDecoration:"none",letterSpacing:"-.01em"}}>Jetzt Premium werden ✦</Link>
            <p style={{textAlign:"center",fontSize:12,color:TX3,marginTop:10}}>Weniger als eine Karte pro Monat</p>
          </div>
          {/* Dealer */}
          <div style={{background:BG1,border:"1px solid rgba(233,168,75,0.14)",borderRadius:28,padding:"clamp(28px,4vw,44px)",position:"relative"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,rgba(233,168,75,0.22),transparent)`,borderRadius:"28px 28px 0 0"}}/>
            <div style={{fontSize:10,fontWeight:600,letterSpacing:".12em",textTransform:"uppercase",color:G,marginBottom:16}}>HYPER RARE ✦✦✦</div>
            <div style={{fontFamily:"var(--font-display)",fontSize:36,fontWeight:300,letterSpacing:"-.05em",color:TX1,marginBottom:4}}>19,99 €</div>
            <div style={{fontSize:13,color:TX3,marginBottom:32}}>pro Monat</div>
            <div style={{display:"flex",flexDirection:"column",gap:11,marginBottom:32}}>
              {["Alles aus Premium","Verified Seller Badge ✅","Eigene Shop-Seite","API-Zugang (Beta)","Priority Support 24/7","Monatliche Marktanalyse"].map(t=><div key={t} style={{display:"flex",alignItems:"center",gap:10,fontSize:14,color:TX2}}><Check/>{t}</div>)}
            </div>
            <Link href="#stripe?plan=dealer" className="gold-glow" style={{display:"block",textAlign:"center",padding:"13px",borderRadius:18,background:"transparent",color:G,fontSize:14,fontWeight:500,textDecoration:"none",border:"1px solid rgba(233,168,75,0.22)"}}>Händler werden ✦✦✦</Link>
          </div>
        </div>
        {/* Trust */}
        <div style={{display:"flex",justifyContent:"center",gap:36,marginBottom:64,flexWrap:"wrap",fontSize:14,color:TX3}}>
          {["🔒 Sicher via Stripe","↩ Jederzeit kündbar","✓ Keine Mindestlaufzeit","⚡ Sofort aktiv","🇩🇪 DSGVO-konform"].map(t=><span key={t}>{t}</span>)}
        </div>
        {/* Feature table */}
        <div style={{background:BG1,border:`1px solid ${BR1}`,borderRadius:24,overflow:"hidden",marginBottom:56}}>
          <div style={{padding:"20px 28px",borderBottom:`1px solid ${BR1}`,fontSize:16,fontWeight:500,color:TX1}}>Vollständiger Vergleich</div>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr>{["Feature","Free","Premium ✦","Händler ✦✦✦"].map((h,i)=><th key={h} style={{padding:"12px 20px",fontSize:10,fontWeight:600,letterSpacing:".08em",textTransform:"uppercase",color:i>0?G:TX3,textAlign:i===0?"left":"center",borderBottom:`1px solid ${BR1}`}}>{h}</th>)}</tr></thead>
            <tbody>{FEATURES.map((f,i)=><tr key={f.l}><td style={{padding:"13px 20px",fontSize:13.5,fontWeight:500,color:TX1,borderBottom:i<FEATURES.length-1?`1px solid rgba(255,255,255,0.035)`:undefined}}>{f.l}</td>{[f.f,f.p,f.d].map((v,vi)=><td key={vi} style={{padding:"13px 20px",fontSize:13.5,textAlign:"center",color:v==="—"?"rgba(255,255,255,0.18)":vi>0?G:TX2,borderBottom:i<FEATURES.length-1?`1px solid rgba(255,255,255,0.035)`:undefined}}>{v}</td>)}</tr>)}</tbody>
          </table>
        </div>
        {/* FAQ */}
        <div style={{marginBottom:64}}>
          <h2 style={{fontFamily:"var(--font-display)",fontSize:"clamp(24px,3vw,36px)",fontWeight:300,letterSpacing:"-.04em",color:TX1,marginBottom:24}}>Häufige Fragen</h2>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {[
              {q:"Kann ich jederzeit kündigen?",a:"Ja, jederzeit ohne Angabe von Gründen. Kündigung gilt zum Ende des Abrechnungszeitraums."},
              {q:"Wie sicher ist die Zahlung?",a:"Alle Zahlungen über Stripe. PokéDax speichert keine Kreditkartendaten."},
              {q:"Lohnt sich Premium für mich?",a:"Wenn du mehr als 5 Karten täglich scannst oder dein Portfolio überwachen möchtest — ja. 6,99 € ist weniger als eine Holo-Karte."},
              {q:"Was unterscheidet Premium und Händler?",a:"Händler eignet sich für professionelle Verkäufer mit eigenem Shop, Verified-Badge und API-Zugang."},
            ].map(faq=>(
              <div key={faq.q} style={{background:BG1,border:`1px solid ${BR1}`,borderRadius:18,padding:"20px 26px"}}>
                <div style={{fontSize:15.5,fontWeight:500,color:TX1,marginBottom:8}}>{faq.q}</div>
                <div style={{fontSize:14,color:TX2,lineHeight:1.72}}>{faq.a}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Final CTA */}
        <div style={{background:`radial-gradient(ellipse 70% 55% at 50% 50%,rgba(233,168,75,0.07),transparent 60%),${BG1}`,border:"1px solid rgba(233,168,75,0.22)",borderRadius:32,padding:"clamp(48px,6vw,72px)",textAlign:"center",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,rgba(233,168,75,0.5),transparent)`}}/>
          <div style={{fontFamily:"var(--font-display)",fontSize:"clamp(28px,4vw,48px)",fontWeight:300,letterSpacing:"-.05em",marginBottom:16,color:TX1}}>Nur 6,99 € pro Monat.</div>
          <p style={{fontSize:16,color:TX2,marginBottom:36,lineHeight:1.72}}>Weniger als eine Karte — und du kennst den Wert jeder Karte deiner Sammlung.</p>
          <Link href="#stripe" className="gold-glow" style={{display:"inline-block",padding:"clamp(14px,2vw,20px) clamp(36px,4vw,56px)",borderRadius:30,background:G,color:"#0a0808",fontSize:"clamp(15px,1.5vw,18px)",fontWeight:600,textDecoration:"none",letterSpacing:"-.015em"}}>Jetzt Premium werden ✦</Link>
          <div style={{fontSize:12.5,color:TX3,marginTop:14}}>Sofort aktiv · Jederzeit kündbar · Stripe gesichert</div>
        </div>
      </div>
    </div>
  );
}
