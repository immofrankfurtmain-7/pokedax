export const dynamic = "force-dynamic";
import Link from "next/link";

const G="#E9A84B",G30="rgba(233,168,75,0.30)",G18="rgba(233,168,75,0.18)";
const G12="rgba(233,168,75,0.12)",G08="rgba(233,168,75,0.08)",G05="rgba(233,168,75,0.05)";
const BG1="#111113",BG2="#1a1a1f",BG3="#222228";
const BR1="rgba(255,255,255,0.050)",BR2="rgba(255,255,255,0.085)";
const TX1="#f0f0f5",TX2="#a8a8b8",TX3="#6b6b7a";
const GREEN="#4BBF82",RED="#E04558";

export const metadata = { title:"Premium werden" };

function Check({gold}:{gold?:boolean}) {
  return (
    <div style={{width:15,height:15,borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",background:gold?"rgba(233,168,75,0.1)":"rgba(75,191,130,0.12)"}}>
      <svg width="7" height="7" viewBox="0 0 8 8"><polyline points="1,4 3,6 7,1.5" stroke={gold?G:GREEN} strokeWidth="1.3" fill="none"/></svg>
    </div>
  );
}

function F({text,gold}:{text:string;gold?:boolean}) {
  return <div style={{display:"flex",alignItems:"center",gap:9,fontSize:12,color:TX2}}><Check gold={gold}/>{text}</div>;
}

function Cross() { return <span style={{color:TX3,fontSize:14,lineHeight:1}}>—</span>; }
function Tick({gold}:{gold?:boolean}) { return <span style={{color:gold?G:GREEN,fontSize:14}}>✓</span>; }

export default function PremiumPage() {
  const FEATURES = [
    {label:"Scans pro Tag",            free:"5",          prem:"Unlimitiert",  deal:"Unlimitiert"},
    {label:"Preischeck",               free:"✓",          prem:"✓",            deal:"✓"},
    {label:"Preisverlauf-Chart",        free:"—",          prem:"90 Tage",      deal:"Unbegrenzt"},
    {label:"Portfolio-Tracker",        free:"—",          prem:"✓",            deal:"✓"},
    {label:"Realtime Preis-Alerts",    free:"—",          prem:"✓",            deal:"✓"},
    {label:"Exklusiv-Forum",           free:"—",          prem:"✓",            deal:"✓"},
    {label:"Grading-Beratung",         free:"—",          prem:"2×/Monat",     deal:"Unlimitiert"},
    {label:"Verified Seller Badge",    free:"—",          prem:"—",            deal:"✓"},
    {label:"Eigene Shop-Seite",        free:"—",          prem:"—",            deal:"✓"},
    {label:"API-Zugang",               free:"—",          prem:"—",            deal:"Beta"},
    {label:"Priority Support",         free:"—",          prem:"—",            deal:"24/7"},
    {label:"Monatliche Marktanalyse",  free:"—",          prem:"—",            deal:"✓"},
  ];

  return (
    <div style={{color:TX1}}>
      <div style={{maxWidth:900,margin:"0 auto",padding:"56px 28px"}}>

        {/* Hero */}
        <div style={{textAlign:"center",marginBottom:40,background:`radial-gradient(ellipse 65% 50% at 50% 0%,${G05},transparent 55%)`,padding:"52px 24px 0",borderRadius:28}}>
          <div style={{fontSize:9,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:TX3,marginBottom:14}}>PokéDax Premium</div>
          <h1 style={{fontSize:"clamp(34px,5vw,52px)",fontWeight:300,letterSpacing:"-.045em",lineHeight:1.04,marginBottom:16,fontFamily:"var(--font-display)"}}>
            Das volle Potential<br/><span style={{fontWeight:500}}>deiner Sammlung.</span>
          </h1>
          <p style={{fontSize:14.5,color:TX2,lineHeight:1.78,maxWidth:430,margin:"0 auto 40px"}}>
            Unlimitierter Scanner, Echtzeit-Alerts und Portfolio-Tracking. Für Sammler, die jeden Euro kennen.
          </p>
        </div>

        {/* Social proof banner */}
        <div style={{background:G05,border:`1px solid ${G18}`,borderRadius:14,padding:"14px 24px",display:"flex",alignItems:"center",justifyContent:"center",gap:14,marginBottom:40,flexWrap:"wrap"}}>
          <div style={{fontSize:9,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",padding:"3px 10px",borderRadius:5,background:G12,color:G,border:`1px solid ${G18}`}}>Live</div>
          <div style={{fontSize:13,color:TX2}}>
            <strong style={{color:TX1,fontWeight:500}}>3.841 Sammler</strong> nutzen bereits PokéDax Premium — und steigern ihren Portfolio-Wert im Schnitt um <strong style={{color:TX1,fontWeight:500}}>18 % im ersten Monat.</strong>
          </div>
        </div>

        {/* Pricing cards */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:36}}>

          {/* Free */}
          <div style={{background:BG1,border:`1px solid ${BR2}`,borderRadius:22,padding:24}}>
            <div style={{fontSize:9,fontWeight:600,letterSpacing:".08em",color:TX3,marginBottom:12}}>COMMON ●</div>
            <div style={{fontSize:19,fontWeight:300,letterSpacing:"-.03em",color:TX2,marginBottom:4,fontFamily:"var(--font-display)"}}>Free</div>
            <div style={{fontSize:36,fontWeight:300,letterSpacing:"-.05em",lineHeight:1,color:TX1,fontFamily:"'DM Mono',monospace",marginBottom:4}}>0 €</div>
            <div style={{fontSize:11,color:TX3,marginBottom:16}}>für immer</div>
            <hr style={{border:"none",borderTop:`1px solid ${BR1}`,margin:"16px 0"}}/>
            <div style={{display:"flex",justifyContent:"center",gap:4,marginBottom:16}}>
              <div style={{width:4,height:4,borderRadius:"50%",background:G}}/>
              {[1,2,3,4].map(i=><div key={i} style={{width:4,height:4,borderRadius:"50%",background:"rgba(255,255,255,0.08)"}}/>)}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:22}}>
              <F text="5 Scans/Tag"/><F text="Basis-Preischeck"/><F text="Forum lesen"/>
              {["Portfolio-Tracker","Preis-Alerts","Preisverlauf-Chart"].map(t=>(
                <div key={t} style={{display:"flex",alignItems:"center",gap:9,fontSize:12,color:TX3,textDecoration:"line-through"}}>
                  <div style={{width:15,height:15,borderRadius:"50%",flexShrink:0,background:BG2}}/>
                  {t}
                </div>
              ))}
            </div>
            <div style={{display:"block",textAlign:"center",padding:"11px",borderRadius:11,background:BG2,color:TX2,fontSize:13,fontWeight:500}}>Aktueller Plan</div>
          </div>

          {/* Premium */}
          <div style={{background:`radial-gradient(ellipse 85% 50% at 50% 0%,rgba(233,168,75,0.07),transparent 60%),${BG1}`,border:"1px solid rgba(233,168,75,0.22)",borderRadius:22,padding:24,position:"relative"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,rgba(233,168,75,0.5),transparent)`,borderRadius:"22px 22px 0 0"}}/>
            <div style={{position:"absolute",top:-1,left:"50%",transform:"translateX(-50%)",padding:"3px 14px",background:G,color:"#0a0808",fontSize:8,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",borderRadius:"0 0 8px 8px",whiteSpace:"nowrap"}}>BELIEBTESTE WAHL</div>
            <div style={{fontSize:9,fontWeight:600,letterSpacing:".08em",color:G,marginBottom:12,marginTop:8}}>ILLUSTRATION RARE ✦</div>
            <div style={{fontSize:19,fontWeight:300,letterSpacing:"-.03em",color:G,marginBottom:4,fontFamily:"var(--font-display)"}}>Premium</div>
            <div style={{fontSize:36,fontWeight:300,letterSpacing:"-.05em",lineHeight:1,color:G,fontFamily:"'DM Mono',monospace",marginBottom:4}}>6,99 €</div>
            <div style={{fontSize:11,color:TX3,marginBottom:16}}>pro Monat · jederzeit kündbar</div>
            <hr style={{border:"none",borderTop:"1px solid rgba(233,168,75,0.1)",margin:"16px 0"}}/>
            <div style={{display:"flex",justifyContent:"center",gap:4,marginBottom:16}}>
              {[0,1,2,3].map(i=><div key={i} style={{width:4,height:4,borderRadius:"50%",background:G,opacity:i===3?1:0.45,boxShadow:i===3?`0 0 7px ${G30}`:undefined}}/>)}
              <div style={{width:4,height:4,borderRadius:"50%",background:"rgba(255,255,255,0.08)"}}/>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:22}}>
              {["Unlimitierter Pro-Scanner","Portfolio + Charts","Realtime Preis-Alerts","Preisverlauf 90 Tage","Exklusiv-Forum ✦","Grading-Beratung 2×/Mo"].map(t=><F key={t} text={t} gold/>)}
            </div>
            <Link href="#stripe" style={{display:"block",textAlign:"center",padding:"12px",borderRadius:11,background:G,color:"#0a0808",fontSize:13.5,fontWeight:700,textDecoration:"none",boxShadow:`0 3px 20px rgba(233,168,75,0.28)`}}>Jetzt Premium werden ✦</Link>
            <div style={{textAlign:"center",fontSize:10.5,color:TX3,marginTop:8}}>Weniger als eine Karte pro Monat</div>
          </div>

          {/* Dealer */}
          <div style={{background:BG1,border:"1px solid rgba(233,168,75,0.14)",borderRadius:22,padding:24,position:"relative"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,rgba(233,168,75,0.22),transparent)`,borderRadius:"22px 22px 0 0"}}/>
            <div style={{fontSize:9,fontWeight:600,letterSpacing:".08em",color:G,marginBottom:12}}>HYPER RARE ✦✦✦</div>
            <div style={{fontSize:19,fontWeight:300,letterSpacing:"-.03em",color:TX1,marginBottom:4,fontFamily:"var(--font-display)"}}>Händler</div>
            <div style={{fontSize:36,fontWeight:300,letterSpacing:"-.05em",lineHeight:1,color:TX1,fontFamily:"'DM Mono',monospace",marginBottom:4}}>19,99 €</div>
            <div style={{fontSize:11,color:TX3,marginBottom:16}}>pro Monat</div>
            <hr style={{border:"none",borderTop:"1px solid rgba(233,168,75,0.07)",margin:"16px 0"}}/>
            <div style={{display:"flex",justifyContent:"center",gap:4,marginBottom:16}}>
              {[0,1,2,3,4,5].map(i=><div key={i} style={{width:4,height:4,borderRadius:"50%",background:G,opacity:i>=4?1:0.35,boxShadow:i>=4?`0 0 7px ${G30}`:undefined}}/>)}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:22}}>
              {["Alles aus Premium","Verified Seller Badge ✅","Eigene Shop-Seite","API-Zugang (Beta)","Priority Support 24/7","Monatliche Marktanalyse"].map(t=><F key={t} text={t}/>)}
            </div>
            <Link href="#stripe?plan=dealer" style={{display:"block",textAlign:"center",padding:"11px",borderRadius:11,background:"transparent",color:G,fontSize:13,fontWeight:600,textDecoration:"none",border:"1px solid rgba(233,168,75,0.2)"}}>Händler werden ✦✦✦</Link>
          </div>
        </div>

        {/* Trust */}
        <div style={{background:BG1,border:`1px solid ${BR1}`,borderRadius:14,padding:"14px 24px",display:"flex",justifyContent:"center",gap:32,marginBottom:44,flexWrap:"wrap"}}>
          {["🔒 Sicher via Stripe","↩ Jederzeit kündbar","✓ Keine Mindestlaufzeit","⚡ Sofort aktiv","🇩🇪 DSGVO-konform"].map(t=>(
            <div key={t} style={{fontSize:12,color:TX2}}>{t}</div>
          ))}
        </div>

        {/* Feature table */}
        <div style={{background:BG1,border:`1px solid ${BR1}`,borderRadius:20,overflow:"hidden",marginBottom:40}}>
          <div style={{padding:"18px 24px",borderBottom:`1px solid ${BR1}`}}>
            <div style={{fontSize:14.5,fontWeight:500,color:TX1}}>Vollständiger Feature-Vergleich</div>
          </div>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr>
                {["Feature","Free","Premium ✦","Händler ✦✦✦"].map((h,i)=>(
                  <th key={h} style={{padding:"10px 20px",fontSize:10,fontWeight:600,letterSpacing:".08em",textTransform:"uppercase",color:i>0?G:TX3,textAlign:i===0?"left":"center",borderBottom:`1px solid ${BR1}`}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((f,i)=>(
                <tr key={f.label}>
                  <td style={{padding:"12px 20px",fontSize:12.5,fontWeight:500,color:TX1,borderBottom:i<FEATURES.length-1?`1px solid rgba(255,255,255,0.025)`:undefined}}>{f.label}</td>
                  {[f.free,f.prem,f.deal].map((v,vi)=>(
                    <td key={vi} style={{padding:"12px 20px",fontSize:12.5,textAlign:"center",color:v==="—"?TX3:vi>0?G:TX2,fontFamily:v==="—"||v==="✓"?"inherit":"'DM Mono',monospace",borderBottom:i<FEATURES.length-1?`1px solid rgba(255,255,255,0.025)`:undefined}}>
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FAQ */}
        <div style={{marginBottom:44}}>
          <div style={{fontSize:15,fontWeight:500,color:TX1,marginBottom:16,fontFamily:"var(--font-display)"}}>Häufige Fragen</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {[
              {q:"Kann ich jederzeit kündigen?",a:"Ja, du kannst dein Abo jederzeit ohne Angabe von Gründen kündigen. Die Kündigung gilt zum Ende des aktuellen Abrechnungszeitraums."},
              {q:"Wie sicher ist die Zahlung?",a:"Alle Zahlungen werden sicher über Stripe abgewickelt. PokéDax speichert keine Kreditkartendaten. Stripe ist nach PCI DSS Level 1 zertifiziert."},
              {q:"Lohnt sich Premium für mich?",a:"Wenn du mehr als 5 Karten pro Tag scannst oder dein Portfolio beobachten möchtest, amortisiert sich Premium sofort. 6,99 € ist weniger als eine durchschnittliche Holo-Karte."},
              {q:"Was ist der Unterschied zwischen Premium und Händler?",a:"Händler eignet sich für professionelle Verkäufer, die eine eigene Shop-Seite, den Verified-Badge und API-Zugang benötigen."},
              {q:"Bekomme ich sofort Zugang nach der Zahlung?",a:"Ja, dein Premium-Zugang ist unmittelbar nach der erfolgreichen Zahlung aktiv — kein Warten."},
            ].map(faq=>(
              <div key={faq.q} style={{background:BG1,border:`1px solid ${BR1}`,borderRadius:14,padding:"16px 20px"}}>
                <div style={{fontSize:13.5,fontWeight:500,color:TX1,marginBottom:6}}>{faq.q}</div>
                <div style={{fontSize:12.5,color:TX2,lineHeight:1.72}}>{faq.a}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div style={{background:`radial-gradient(ellipse 75% 55% at 50% 50%,rgba(233,168,75,0.07),transparent 60%),${BG1}`,border:"1px solid rgba(233,168,75,0.22)",borderRadius:24,padding:48,textAlign:"center",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,rgba(233,168,75,0.5),transparent)`}}/>
          <div style={{fontSize:9,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:TX3,marginBottom:14}}>Jetzt starten</div>
          <div style={{fontSize:"clamp(26px,4vw,38px)",fontWeight:300,letterSpacing:"-.04em",marginBottom:12,fontFamily:"var(--font-display)"}}>Nur 6,99 € pro Monat.</div>
          <p style={{fontSize:13.5,color:TX2,marginBottom:28,lineHeight:1.72}}>Weniger als eine Karte — und du kennst den Wert jeder Karte in deiner Sammlung.</p>
          <Link href="#stripe" style={{display:"inline-block",padding:"14px 38px",borderRadius:12,background:G,color:"#0a0808",fontSize:14.5,fontWeight:600,textDecoration:"none",letterSpacing:"-.015em",boxShadow:`0 0 0 1px ${G30},0 6px 32px rgba(233,168,75,0.3)`}}>Jetzt Premium werden ✦</Link>
          <div style={{fontSize:11,color:TX3,marginTop:12}}>Sofort aktiv · Jederzeit kündbar · Stripe gesichert</div>
        </div>

      </div>
    </div>
  );
}
