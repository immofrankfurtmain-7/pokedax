"use client";
import { useState } from "react";
import Link from "next/link";
export const dynamic = "force-dynamic";
const G="#D4A843",G30="rgba(212,168,67,0.30)",G18="rgba(212,168,67,0.18)",G12="rgba(212,168,67,0.12)",G08="rgba(212,168,67,0.08)",G04="rgba(212,168,67,0.04)";
const BG1="#111113",BR1="rgba(255,255,255,0.06)",BR2="rgba(255,255,255,0.10)";
const TX1="#f0f0f5",TX2="#a8a8b8",TX3="#6b6b7a",GREEN="#4BBF82";
function Check(){return(<span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:20,height:20,borderRadius:"50%",background:"rgba(75,191,130,0.12)",flexShrink:0}}><svg width="8" height="8" viewBox="0 0 8 8"><polyline points="1,4 3,6 7,1.5" stroke={GREEN} strokeWidth="1.4" fill="none"/></svg></span>);}
function Cross(){return(<span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:20,height:20,borderRadius:"50%",background:"rgba(255,255,255,0.04)",flexShrink:0}}><svg width="8" height="8" viewBox="0 0 8 8"><line x1="2" y1="2" x2="6" y2="6" stroke="rgba(255,255,255,0.2)" strokeWidth="1.4"/><line x1="6" y1="2" x2="2" y2="6" stroke="rgba(255,255,255,0.2)" strokeWidth="1.4"/></svg></span>);}

function PlanButton({plan,label,style}:{plan:string,label:string,style:React.CSSProperties}){
  const [loading,setLoading]=useState(false);
  async function handle(){
    setLoading(true);
    try{
      const res=await fetch("/api/stripe/checkout",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({plan})});
      const data=await res.json();
      if(data.url)window.location.href=data.url;
      else if(data.error){
        // Not logged in - redirect to login
        window.location.href="/auth/login?redirect=/dashboard/premium";
      }
    }catch{window.location.href="/auth/login?redirect=/dashboard/premium";}
    finally{setLoading(false);}
  }
  return(
    <button onClick={handle} disabled={loading} style={{...style,opacity:loading?0.7:1,cursor:loading?"wait":"pointer"}}>
      {loading?"Wird geladen…":label}
    </button>
  );
}

export default function PremiumPage() {
  const features=[
    {label:"Scans pro Tag",free:"5",premium:"Unlimitiert",dealer:"Unlimitiert"},
    {label:"Preischeck",free:true,premium:true,dealer:true},
    {label:"Preisverlauf (30 Tage)",free:false,premium:true,dealer:true},
    {label:"Portfolio-Tracker",free:false,premium:true,dealer:true},
    {label:"Realtime Preis-Alerts",free:false,premium:true,dealer:true},
    {label:"KI-Scanner Pro",free:false,premium:true,dealer:true},
    {label:"Exklusiv-Forum ✦",free:false,premium:true,dealer:true},
    {label:"Verified Seller Badge",free:false,premium:false,dealer:true},
    {label:"Eigene Shop-Seite",free:false,premium:false,dealer:true},
    {label:"API-Zugang (Beta)",free:false,premium:false,dealer:true},
  ];
  const faqs=[
    {q:"Kann ich jederzeit kündigen?",a:"Ja, monatlich kündbar ohne Mindestlaufzeit. Kündigung gilt zum Ende des Abrechnungszeitraums."},
    {q:"Wie sicher ist die Zahlung?",a:"Alle Zahlungen laufen über Stripe — PCI DSS compliant. PokéDax speichert keine Kartendaten."},
    {q:"Wann wird Premium aktiviert?",a:"Sofort nach erfolgreicher Zahlung — in Sekunden aktiv."},
    {q:"Lohnt sich Premium für mich?",a:"Wenn du mehr als 5 Karten täglich scannst oder dein Portfolio tracken möchtest, ja. 6,99 € ist weniger als eine Holo-Karte."},
  ];
  return(
    <div style={{color:TX1,minHeight:"80vh"}}>
      <div style={{maxWidth:920,margin:"0 auto",padding:"clamp(40px,6vw,80px) 24px"}}>
        {/* Hero */}
        <div style={{textAlign:"center",marginBottom:"clamp(40px,6vw,72px)",background:`radial-gradient(ellipse 70% 50% at 50% 0%,${G04},transparent 60%)`,borderRadius:28,padding:"clamp(32px,5vw,64px) 24px 0"}}>
          <div style={{fontSize:10,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:G,marginBottom:16}}>Mitgliedschaft · pokédax</div>
          <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(34px,5.5vw,60px)",fontWeight:300,letterSpacing:"-.045em",lineHeight:1.05,marginBottom:16}}>
            Das volle Potential<br/><span style={{color:G}}>deiner Sammlung.</span>
          </h1>
          <p style={{fontSize:"clamp(14px,1.6vw,18px)",color:TX2,maxWidth:460,margin:"0 auto 32px",lineHeight:1.75}}>
            Unlimitierter KI-Scanner, Echtzeit-Alerts und Portfolio-Tracking. Für Sammler, die jeden Euro kennen.
          </p>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"8px 18px",borderRadius:12,background:G08,border:`1px solid ${G18}`,fontSize:13,color:G,marginBottom:8}}>
            ✦ 3.841 Sammler vertrauen pokédax Premium
          </div>
        </div>

        {/* Plans */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:12,marginBottom:40}}>
          {/* Free */}
          <div style={{background:BG1,border:`1px solid ${BR2}`,borderRadius:22,padding:"24px 22px"}}>
            <div style={{fontSize:9,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:TX3,marginBottom:10}}>COMMON ●</div>
            <div style={{fontFamily:"var(--font-display)",fontSize:22,fontWeight:300,letterSpacing:"-.03em",color:TX2,marginBottom:4}}>Free</div>
            <div style={{fontFamily:"var(--font-mono)",fontSize:40,fontWeight:300,letterSpacing:"-.05em",lineHeight:1,marginBottom:4}}>0 €</div>
            <div style={{fontSize:11,color:TX3,marginBottom:20}}>für immer</div>
            <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:24}}>
              {[["5 Scans / Tag"],["Basis-Preischeck"],["Forum lesen"]].map(([t])=>(
                <div key={t} style={{display:"flex",alignItems:"center",gap:9,fontSize:12,color:TX2}}><Check/>{t}</div>
              ))}
              {[["Portfolio-Tracker"],["Preis-Alerts"],["Preisverlauf-Chart"]].map(([t])=>(
                <div key={t} style={{display:"flex",alignItems:"center",gap:9,fontSize:12,color:TX3,textDecoration:"line-through"}}><Cross/>{t}</div>
              ))}
            </div>
            <div style={{width:"100%",padding:"11px",borderRadius:12,background:"rgba(255,255,255,0.04)",color:TX3,fontSize:13,fontWeight:500,textAlign:"center",border:`1px solid ${BR1}`}}>Aktueller Plan</div>
          </div>

          {/* Premium */}
          <div style={{background:`radial-gradient(ellipse 90% 60% at 50% 0%,${G08},transparent 60%),${BG1}`,border:`1px solid rgba(212,168,67,0.28)`,borderRadius:22,padding:"24px 22px",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${G30},transparent)`}}/>
            <div style={{position:"absolute",top:-1,left:"50%",transform:"translateX(-50%)",padding:"3px 16px",background:G,color:"#0a0808",fontSize:8,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",borderRadius:"0 0 8px 8px",whiteSpace:"nowrap"}}>BELIEBTESTE WAHL</div>
            <div style={{fontSize:9,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:G,marginBottom:10,marginTop:8}}>ILLUSTRATION RARE ✦</div>
            <div style={{fontFamily:"var(--font-display)",fontSize:22,fontWeight:300,letterSpacing:"-.03em",color:G,marginBottom:4}}>Premium</div>
            <div style={{fontFamily:"var(--font-mono)",fontSize:40,fontWeight:300,letterSpacing:"-.05em",lineHeight:1,marginBottom:4,color:G}}>6,99 €</div>
            <div style={{fontSize:11,color:TX3,marginBottom:20}}>pro Monat · jederzeit kündbar</div>
            <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:24}}>
              {["Unlimitierter KI-Scanner","Portfolio + Charts","Realtime Preis-Alerts","Preisverlauf 30 Tage","Exklusiv-Forum ✦","Grading-Beratung 2×/Mo"].map(t=>(
                <div key={t} style={{display:"flex",alignItems:"center",gap:9,fontSize:12,color:TX2}}><Check/>{t}</div>
              ))}
            </div>
            <PlanButton plan="premium" label="Jetzt Premium werden ✦" style={{width:"100%",padding:"13px",borderRadius:12,background:G,color:"#0a0808",fontSize:13,fontWeight:600,border:"none",boxShadow:`0 2px 20px rgba(212,168,67,0.25)`}}/>
            <div style={{textAlign:"center",fontSize:10,color:TX3,marginTop:8}}>Weniger als eine Karte · Sofort aktiv</div>
          </div>

          {/* Dealer */}
          <div style={{background:BG1,border:`1px solid rgba(212,168,67,0.16)`,borderRadius:22,padding:"24px 22px",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,rgba(212,168,67,0.25),transparent)`}}/>
            <div style={{fontSize:9,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:G,marginBottom:10}}>HYPER RARE ✦✦✦</div>
            <div style={{fontFamily:"var(--font-display)",fontSize:22,fontWeight:300,letterSpacing:"-.03em",color:TX1,marginBottom:4}}>Händler</div>
            <div style={{fontFamily:"var(--font-mono)",fontSize:40,fontWeight:300,letterSpacing:"-.05em",lineHeight:1,marginBottom:4}}>19,99 €</div>
            <div style={{fontSize:11,color:TX3,marginBottom:20}}>pro Monat</div>
            <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:24}}>
              {["Alles aus Premium","Verified Seller Badge ✅","Eigene Shop-Seite","API-Zugang (Beta)","Priority Support 24/7","Monatliche Marktanalyse"].map(t=>(
                <div key={t} style={{display:"flex",alignItems:"center",gap:9,fontSize:12,color:TX2}}><Check/>{t}</div>
              ))}
            </div>
            <PlanButton plan="dealer" label="Händler werden ✦✦✦" style={{width:"100%",padding:"13px",borderRadius:12,background:"transparent",color:G,fontSize:13,fontWeight:500,border:`1px solid ${G18}`}}/>
          </div>
        </div>

        {/* Trust bar */}
        <div style={{display:"flex",flexWrap:"wrap",alignItems:"center",justifyContent:"center",gap:"8px 24px",padding:"14px 24px",background:BG1,border:`1px solid ${BR1}`,borderRadius:16,marginBottom:40,fontSize:12,color:TX2}}>
          {["🔒 Sicher via Stripe","↩ Jederzeit kündbar","✓ Keine Mindestlaufzeit","⚡ Sofort aktiv","🇩🇪 DSGVO-konform"].map(t=><span key={t}>{t}</span>)}
        </div>

        {/* Feature table */}
        <div style={{background:BG1,border:`1px solid ${BR1}`,borderRadius:18,overflow:"hidden",marginBottom:40}}>
          <div style={{padding:"16px 24px",borderBottom:`1px solid ${BR1}`,fontSize:14,fontWeight:500,color:TX1}}>Vollständiger Feature-Vergleich</div>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr style={{borderBottom:`1px solid ${BR1}`}}>
                {["Feature","Free","Premium ✦","Händler ✦✦✦"].map((h,i)=>(
                  <th key={h} style={{padding:"10px 16px",fontSize:10,fontWeight:600,letterSpacing:".08em",textTransform:"uppercase",color:i>1?G:TX3,textAlign:i===0?"left":"center"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((f,i)=>(
                <tr key={f.label} style={{borderBottom:i<features.length-1?`1px solid rgba(255,255,255,0.03)`:undefined}}>
                  <td style={{padding:"11px 16px",fontSize:12.5,fontWeight:500,color:TX1}}>{f.label}</td>
                  {(["free","premium","dealer"] as const).map(k=>(
                    <td key={k} style={{padding:"11px 16px",textAlign:"center",fontSize:12.5}}>
                      {typeof f[k]==="boolean"
                        ? f[k]
                          ? <span style={{color:GREEN}}>✓</span>
                          : <span style={{color:"rgba(255,255,255,0.15)"}}>—</span>
                        : <span style={{color:k==="free"?TX3:G,fontWeight:500}}>{f[k]}</span>
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FAQ */}
        <div style={{marginBottom:40}}>
          <div style={{fontSize:16,fontWeight:500,color:TX1,marginBottom:16}}>Häufige Fragen</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {faqs.map(f=>(
              <div key={f.q} style={{background:BG1,border:`1px solid ${BR1}`,borderRadius:14,padding:"16px 20px"}}>
                <div style={{fontSize:13.5,fontWeight:500,color:TX1,marginBottom:6}}>{f.q}</div>
                <div style={{fontSize:12,color:TX2,lineHeight:1.7}}>{f.a}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div style={{background:`radial-gradient(ellipse 70% 55% at 50% 50%,${G08},transparent 60%),${BG1}`,border:`1px solid rgba(212,168,67,0.22)`,borderRadius:22,padding:"clamp(28px,4vw,48px)",textAlign:"center",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,rgba(212,168,67,0.5),transparent)`}}/>
          <div style={{fontSize:9,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:TX3,marginBottom:12}}>Bereit für den nächsten Schritt?</div>
          <div style={{fontFamily:"var(--font-display)",fontSize:"clamp(24px,4vw,38px)",fontWeight:300,letterSpacing:"-.04em",marginBottom:10}}>Nur 6,99 € pro Monat.</div>
          <p style={{fontSize:13.5,color:TX2,marginBottom:24}}>Weniger als eine Karte — und du kennst den Wert jeder Karte in deiner Sammlung.</p>
          <PlanButton plan="premium" label="Jetzt Premium werden ✦" style={{display:"inline-block",padding:"clamp(12px,2vw,16px) clamp(32px,4vw,52px)",borderRadius:30,background:G,color:"#0a0808",fontSize:"clamp(14px,1.5vw,17px)",fontWeight:600,border:"none",boxShadow:`0 4px 28px rgba(212,168,67,0.3)`}}/>
          <div style={{fontSize:11,color:TX3,marginTop:12}}>Sofort aktiv · Jederzeit kündbar · Stripe gesichert</div>
        </div>
      </div>
    </div>
  );
}
