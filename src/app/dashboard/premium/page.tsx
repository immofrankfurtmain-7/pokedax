import Link from "next/link";
export const dynamic = "force-dynamic";
const G="#E9A84B",G30="rgba(233,168,75,0.30)",G18="rgba(233,168,75,0.18)",G08="rgba(233,168,75,0.08)";
const BG1="#111113",BG2="#1a1a1f",BR1="rgba(255,255,255,0.06)",BR2="rgba(255,255,255,0.10)";
const TX1="#f0f0f5",TX2="#a8a8b8",TX3="#6b6b7a",GREEN="#4BBF82";
function Check() { return (<span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:18,height:18,borderRadius:"50%",background:"rgba(75,191,130,0.12)",flexShrink:0}}><svg width="8" height="8" viewBox="0 0 8 8"><polyline points="1,4 3,6 7,1.5" stroke={GREEN} strokeWidth="1.3" fill="none"/></svg></span>); }
const FEATURES=[
  {label:"Scans pro Tag",free:"5",prem:"Unlimitiert",deal:"Unlimitiert"},
  {label:"Preisverlauf-Chart",free:"—",prem:"90 Tage",deal:"Unbegrenzt"},
  {label:"Portfolio-Tracker",free:"—",prem:"✓",deal:"✓"},
  {label:"Realtime Preis-Alerts",free:"—",prem:"✓",deal:"✓"},
  {label:"Exklusiv-Forum",free:"—",prem:"✓",deal:"✓"},
  {label:"Verified Seller Badge",free:"—",prem:"—",deal:"✓"},
  {label:"Eigene Shop-Seite",free:"—",prem:"—",deal:"✓"},
  {label:"API-Zugang",free:"—",prem:"—",deal:"Beta"},
];
export default function PremiumPage() {
  return (
    <div style={{color:TX1}}>
      <div style={{maxWidth:960,margin:"0 auto",padding:"72px 28px"}}>
        {/* Hero */}
        <div style={{textAlign:"center",marginBottom:52,background:`radial-gradient(ellipse 60% 45% at 50% 0%,rgba(233,168,75,0.05),transparent 55%)`,padding:"60px 24px 0",borderRadius:32}}>
          <div style={{fontSize:10,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:TX3,marginBottom:16}}>PokéDax Premium</div>
          <h1 style={{fontSize:"clamp(36px,5vw,56px)",fontWeight:300,letterSpacing:"-.05em",lineHeight:1.04,marginBottom:18,fontFamily:"var(--font-display)"}}>Das volle Potential<br/><span style={{color:G}}>deiner Sammlung.</span></h1>
          <p style={{fontSize:16,color:TX2,lineHeight:1.78,maxWidth:440,margin:"0 auto 44px"}}>Unlimitierter Scanner, Echtzeit-Alerts und Portfolio-Tracking. Für Sammler, die jeden Euro kennen.</p>
        </div>
        {/* Social proof */}
        <div style={{background:G08,border:`1px solid ${G18}`,borderRadius:18,padding:"16px 28px",display:"flex",alignItems:"center",justifyContent:"center",gap:16,marginBottom:44,flexWrap:"wrap"}}>
          <div style={{fontSize:9.5,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",padding:"3px 12px",borderRadius:6,background:"rgba(233,168,75,0.12)",color:G,border:`1px solid ${G18}`}}>Live</div>
          <div style={{fontSize:14,color:TX2}}><strong style={{color:TX1,fontWeight:500}}>3.841 Sammler</strong> nutzen PokéDax Premium — Portfolio-Wert +18 % im ersten Monat.</div>
        </div>
        {/* Pricing */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:40}}>
          <div style={{background:BG1,border:`1px solid ${BR2}`,borderRadius:28,padding:36}}>
            <div style={{fontSize:9.5,fontWeight:600,letterSpacing:".12em",textTransform:"uppercase",color:TX3,marginBottom:14}}>COMMON ●</div>
            <div style={{fontSize:34,fontWeight:300,letterSpacing:"-.04em",color:TX2,marginBottom:4,fontFamily:"var(--font-display)"}}>Free</div>
            <div style={{fontSize:13,color:TX3,marginBottom:28}}>für immer</div>
            <div style={{display:"flex",flexDirection:"column",gap:11,marginBottom:28}}>
              {["5 Scans/Tag","Basis-Preischeck","Forum lesen"].map(t=><div key={t} style={{display:"flex",alignItems:"center",gap:10,fontSize:13.5,color:TX2}}><Check/>{t}</div>)}
              {["Portfolio","Preis-Alerts"].map(t=><div key={t} style={{display:"flex",alignItems:"center",gap:10,fontSize:13.5,color:TX3,textDecoration:"line-through"}}><span style={{width:18,height:18,borderRadius:"50%",background:BG2,flexShrink:0,display:"inline-block"}}/>{t}</div>)}
            </div>
            <div style={{textAlign:"center",padding:12,borderRadius:16,background:BG2,color:TX2,fontSize:13}}>Aktueller Plan</div>
          </div>
          <div className="gold-glow" style={{background:`radial-gradient(ellipse 80% 50% at 50% 0%,rgba(233,168,75,0.07),transparent 55%),${BG1}`,border:"1px solid rgba(233,168,75,0.25)",borderRadius:28,padding:36,position:"relative"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,rgba(233,168,75,0.5),transparent)`,borderRadius:"28px 28px 0 0"}}/>
            <div style={{position:"absolute",top:-1,left:"50%",transform:"translateX(-50%)",padding:"4px 16px",background:G,color:"#0a0808",fontSize:9,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",borderRadius:"0 0 10px 10px",whiteSpace:"nowrap"}}>BELIEBTESTE WAHL</div>
            <div style={{fontSize:9.5,fontWeight:600,letterSpacing:".12em",textTransform:"uppercase",color:G,marginBottom:14,marginTop:10}}>ILLUSTRATION RARE ✦</div>
            <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:4}}>
              <span style={{fontSize:42,fontWeight:300,letterSpacing:"-.05em",color:G,fontFamily:"'DM Mono',monospace"}}>6,99</span>
              <span style={{fontSize:15,color:G}}>€ / Mo</span>
            </div>
            <div style={{fontSize:13,color:TX3,marginBottom:28}}>jederzeit kündbar</div>
            <div style={{display:"flex",flexDirection:"column",gap:11,marginBottom:28}}>
              {["Unlimitierter Scanner","Portfolio + Charts","Realtime Preis-Alerts","Preisverlauf 90 Tage","Exklusiv-Forum ✦","Grading-Beratung 2×/Mo"].map(t=><div key={t} style={{display:"flex",alignItems:"center",gap:10,fontSize:13.5,color:TX2}}><Check/>{t}</div>)}
            </div>
            <Link href="#stripe" style={{display:"block",textAlign:"center",padding:"14px",borderRadius:16,background:G,color:"#0a0808",fontSize:14,fontWeight:600,textDecoration:"none",letterSpacing:"-.01em"}}>Jetzt Premium werden ✦</Link>
            <p style={{textAlign:"center",fontSize:11.5,color:TX3,marginTop:8}}>Weniger als eine Karte pro Monat</p>
          </div>
          <div style={{background:BG1,border:"1px solid rgba(233,168,75,0.14)",borderRadius:28,padding:36,position:"relative"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,rgba(233,168,75,0.22),transparent)`,borderRadius:"28px 28px 0 0"}}/>
            <div style={{fontSize:9.5,fontWeight:600,letterSpacing:".12em",textTransform:"uppercase",color:G,marginBottom:14}}>HYPER RARE ✦✦✦</div>
            <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:4}}>
              <span style={{fontSize:34,fontWeight:300,letterSpacing:"-.04em",color:TX1,fontFamily:"var(--font-display)"}}>19,99 €</span>
            </div>
            <div style={{fontSize:13,color:TX3,marginBottom:28}}>pro Monat</div>
            <div style={{display:"flex",flexDirection:"column",gap:11,marginBottom:28}}>
              {["Alles aus Premium","Verified Seller Badge ✅","Eigene Shop-Seite","API-Zugang (Beta)","Priority Support 24/7","Monatliche Marktanalyse"].map(t=><div key={t} style={{display:"flex",alignItems:"center",gap:10,fontSize:13.5,color:TX2}}><Check/>{t}</div>)}
            </div>
            <Link href="#stripe?plan=dealer" style={{display:"block",textAlign:"center",padding:"13px",borderRadius:16,background:"transparent",color:G,fontSize:14,fontWeight:500,textDecoration:"none",border:"1px solid rgba(233,168,75,0.22)"}}>Händler werden ✦✦✦</Link>
          </div>
        </div>
        {/* Trust */}
        <div style={{display:"flex",justifyContent:"center",gap:32,marginBottom:48,flexWrap:"wrap",fontSize:13,color:TX3}}>
          {["🔒 Sicher via Stripe","↩ Jederzeit kündbar","✓ Keine Mindestlaufzeit","⚡ Sofort aktiv","🇩🇪 DSGVO-konform"].map(t=><span key={t}>{t}</span>)}
        </div>
        {/* Feature table */}
        <div style={{background:BG1,border:`1px solid ${BR1}`,borderRadius:24,overflow:"hidden",marginBottom:44}}>
          <div style={{padding:"18px 28px",borderBottom:`1px solid ${BR1}`,fontSize:15,fontWeight:500,color:TX1}}>Vollständiger Vergleich</div>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr>{["Feature","Free","Premium ✦","Händler ✦✦✦"].map((h,i)=><th key={h} style={{padding:"12px 20px",fontSize:10,fontWeight:600,letterSpacing:".08em",textTransform:"uppercase",color:i>0?G:TX3,textAlign:i===0?"left":"center",borderBottom:`1px solid ${BR1}`}}>{h}</th>)}</tr></thead>
            <tbody>{FEATURES.map((f,i)=><tr key={f.label}><td style={{padding:"12px 20px",fontSize:13,fontWeight:500,color:TX1,borderBottom:i<FEATURES.length-1?`1px solid rgba(255,255,255,0.03)`:undefined}}>{f.label}</td>{[f.free,f.prem,f.deal].map((v,vi)=><td key={vi} style={{padding:"12px 20px",fontSize:13,textAlign:"center",color:v==="—"?TX3:vi>0?G:TX2,borderBottom:i<FEATURES.length-1?`1px solid rgba(255,255,255,0.03)`:undefined}}>{v}</td>)}</tr>)}</tbody>
          </table>
        </div>
        {/* FAQ */}
        <div style={{marginBottom:52}}>
          <div style={{fontSize:22,fontWeight:300,letterSpacing:"-.03em",color:TX1,marginBottom:20,fontFamily:"var(--font-display)"}}>Häufige Fragen</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {[
              {q:"Kann ich jederzeit kündigen?",a:"Ja, jederzeit ohne Angabe von Gründen. Kündigung gilt zum Ende des Abrechnungszeitraums."},
              {q:"Wie sicher ist die Zahlung?",a:"Alle Zahlungen über Stripe. PokéDax speichert keine Kreditkartendaten."},
              {q:"Lohnt sich Premium für mich?",a:"Wenn du mehr als 5 Karten täglich scannst oder dein Portfolio überwachen möchtest — ja. 6,99 € ist weniger als eine Holo-Karte."},
              {q:"Was unterscheidet Premium und Händler?",a:"Händler eignet sich für professionelle Verkäufer mit eigenem Shop, Verified-Badge und API-Zugang."},
            ].map(faq=>(
              <div key={faq.q} style={{background:BG1,border:`1px solid ${BR1}`,borderRadius:16,padding:"18px 22px"}}>
                <div style={{fontSize:14.5,fontWeight:500,color:TX1,marginBottom:7}}>{faq.q}</div>
                <div style={{fontSize:13.5,color:TX2,lineHeight:1.72}}>{faq.a}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Final CTA */}
        <div style={{background:`radial-gradient(ellipse 70% 55% at 50% 50%,rgba(233,168,75,0.07),transparent 60%),${BG1}`,border:"1px solid rgba(233,168,75,0.22)",borderRadius:28,padding:56,textAlign:"center",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,rgba(233,168,75,0.5),transparent)`}}/>
          <div style={{fontSize:10,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:TX3,marginBottom:16}}>Jetzt starten</div>
          <div style={{fontSize:"clamp(28px,4vw,42px)",fontWeight:300,letterSpacing:"-.04em",marginBottom:12,fontFamily:"var(--font-display)"}}>Nur 6,99 € pro Monat.</div>
          <p style={{fontSize:15,color:TX2,marginBottom:32,lineHeight:1.72}}>Weniger als eine Karte — und du kennst den Wert jeder Karte deiner Sammlung.</p>
          <Link href="#stripe" className="gold-glow" style={{display:"inline-block",padding:"16px 44px",borderRadius:30,background:G,color:"#0a0808",fontSize:15,fontWeight:600,textDecoration:"none",letterSpacing:"-.015em"}}>Jetzt Premium werden ✦</Link>
          <div style={{fontSize:12,color:TX3,marginTop:14}}>Sofort aktiv · Jederzeit kündbar · Stripe gesichert</div>
        </div>
      </div>
    </div>
  );
}
