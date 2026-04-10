"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

const G="#D4A843",G25="rgba(212,168,67,0.25)",G15="rgba(212,168,67,0.15)",G08="rgba(212,168,67,0.08)",G04="rgba(212,168,67,0.04)";
const TX1="#ededf2",TX2="#a4a4b4",TX3="#62626f";
const BG1="#111114",BG2="#18181c",BR1="rgba(255,255,255,0.045)",BR2="rgba(255,255,255,0.085)";

const STATS = [
  {n:"22.400+", l:"Karten in der Datenbank"},
  {n:"214",     l:"Sets & Serien"},
  {n:"Live",    l:"Cardmarket-Preise"},
  {n:"KI",      l:"Scanner mit Gemini"},
];

export default function HomePage() {
  const [tick, setTick] = useState(0);
  useEffect(()=>{const i=setInterval(()=>setTick(t=>t+1),3000);return()=>clearInterval(i);},[]);

  return (
    <div style={{color:TX1}}>
      {/* HERO */}
      <section style={{
        maxWidth:1000,margin:"0 auto",
        padding:"clamp(120px,16vw,220px) clamp(16px,3vw,32px) clamp(100px,12vw,180px)",
        textAlign:"center",
      }}>
        <div style={{
          display:"inline-flex",alignItems:"center",gap:8,
          padding:"7px 20px",borderRadius:40,
          border:`1px solid ${G15}`,background:G04,
          fontSize:11,fontWeight:500,color:G,
          letterSpacing:".14em",textTransform:"uppercase",
          marginBottom:52,
        }}>
          <span style={{width:5,height:5,borderRadius:"50%",background:G,display:"inline-block"}}/>
          Live · Cardmarket Deutschland
        </div>

        <h1 style={{
          fontFamily:"var(--font-display)",
          fontSize:"clamp(36px,7vw,88px)",
          fontWeight:200, letterSpacing:"-.07em",
          lineHeight:0.95, color:TX1,
          marginBottom:28,
        }}>
          Deine Karten.<br/>
          Ihr wahrer{" "}
          <span style={{color:G}}>Wert.</span>
        </h1>

        <p style={{
          fontSize:"clamp(15px,1.8vw,19px)",
          color:TX3, maxWidth:520, margin:"0 auto 48px",
          lineHeight:1.7, fontWeight:300,
        }}>
          Für Sammler, die ihre Karten ernst nehmen.<br/>
          Präzise. Zeitlos. Respektvoll.
        </p>

        <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
          <Link href="/preischeck" style={{
            padding:"clamp(12px,1.5vw,16px) clamp(24px,3vw,36px)",
            borderRadius:16, background:G, color:"#09090b",
            fontSize:"clamp(13px,1.4vw,15px)", fontWeight:400,
            textDecoration:"none",
            boxShadow:`0 4px 24px ${G25}`,
          }}>Preis checken</Link>
          <Link href="/scanner" style={{
            padding:"clamp(12px,1.5vw,16px) clamp(24px,3vw,36px)",
            borderRadius:16, background:"transparent", color:TX2,
            fontSize:"clamp(13px,1.4vw,15px)", fontWeight:400,
            textDecoration:"none",
            border:`0.5px solid ${BR2}`,
          }}>Karte scannen</Link>
        </div>
      </section>

      {/* STATS */}
      <section style={{
        maxWidth:1100, margin:"0 auto",
        padding:"0 clamp(16px,3vw,32px) clamp(80px,10vw,140px)",
      }}>
        <div style={{
          display:"grid",
          gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",
          gap:1, border:`0.5px solid ${BR1}`, borderRadius:20, overflow:"hidden",
        }}>
          {STATS.map(({n,l},i)=>(
            <div key={l} style={{
              padding:"clamp(20px,3vw,32px)", background:BG1,
              borderRight:i<STATS.length-1?`0.5px solid ${BR1}`:undefined,
            }}>
              <div style={{
                fontFamily:"var(--font-display)",
                fontSize:"clamp(28px,4vw,48px)",
                fontWeight:200, letterSpacing:"-.04em",
                color:G, marginBottom:8, lineHeight:1,
              }}>{n}</div>
              <div style={{fontSize:12,color:TX3,fontWeight:300}}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{
        maxWidth:1100, margin:"0 auto",
        padding:"0 clamp(16px,3vw,32px) clamp(80px,10vw,140px)",
      }}>
        <div style={{marginBottom:48,textAlign:"center"}}>
          <div style={{fontSize:9,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:TX3,marginBottom:16}}>Features</div>
          <h2 style={{fontFamily:"var(--font-display)",fontSize:"clamp(24px,4vw,44px)",fontWeight:200,letterSpacing:"-.05em"}}>
            Alles was du brauchst.
          </h2>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:10}}>
          {[
            {icon:"◈", title:"Preischeck",      desc:"Echte Cardmarket-Preise für 22.400+ Karten. Live-Daten, Preistrend, 7/30-Tage-Chart.",       href:"/preischeck"},
            {icon:"⊙", title:"KI-Scanner",      desc:"Karte fotografieren — pokédax erkennt sie sofort per Gemini AI und zeigt den Marktwert.",    href:"/scanner"},
            {icon:"◇", title:"Portfolio",       desc:"Sammlung verwalten, Gesamtwert berechnen, Preisentwicklung verfolgen.",                        href:"/portfolio"},
            {icon:"◈", title:"Marktplatz",      desc:"Karten kaufen und verkaufen. Sicher via Escrow. Nur für Premium-Mitglieder.",                  href:"/marketplace"},
            {icon:"◉", title:"Wishlist",        desc:"Karten merken — automatisch benachrichtigt wenn sie verfügbar sind.",                           href:"/matches"},
            {icon:"◫", title:"Forum",           desc:"Community für ernsthafte Sammler. Diskussionen, Bewertungen, Neuigkeiten.",                     href:"/forum"},
          ].map(({icon,title,desc,href})=>(
            <Link key={href} href={href} style={{
              background:BG1, border:`0.5px solid ${BR2}`, borderRadius:18,
              padding:"clamp(20px,3vw,28px)", textDecoration:"none",
              display:"block", transition:"border-color .2s,background .2s",
            }}
            onMouseEnter={e=>{(e.currentTarget as any).style.borderColor="rgba(212,168,67,0.2)";(e.currentTarget as any).style.background=BG2;}}
            onMouseLeave={e=>{(e.currentTarget as any).style.borderColor="rgba(255,255,255,0.085)";(e.currentTarget as any).style.background=BG1;}}>
              <div style={{fontSize:22,color:G,marginBottom:12,opacity:.7}}>{icon}</div>
              <div style={{fontSize:15,fontWeight:400,color:TX1,marginBottom:8}}>{title}</div>
              <div style={{fontSize:12,color:TX3,lineHeight:1.7}}>{desc}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        maxWidth:700, margin:"0 auto",
        padding:"0 clamp(16px,3vw,32px) clamp(100px,12vw,180px)",
        textAlign:"center",
      }}>
        <div style={{
          background:`linear-gradient(135deg,rgba(212,168,67,0.08),${BG1})`,
          border:`0.5px solid ${G15}`, borderRadius:24,
          padding:"clamp(36px,5vw,56px) clamp(24px,4vw,48px)",
          position:"relative", overflow:"hidden",
        }}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:0.5,
            background:`linear-gradient(90deg,transparent,${G},transparent)`}}/>
          <div style={{fontSize:9,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:G,marginBottom:16}}>Premium</div>
          <h2 style={{fontFamily:"var(--font-display)",fontSize:"clamp(22px,4vw,38px)",fontWeight:200,letterSpacing:"-.04em",marginBottom:12}}>
            Für ernsthafte Sammler.
          </h2>
          <p style={{fontSize:13,color:TX3,marginBottom:28,lineHeight:1.7}}>
            Marktplatz · Unlimitierter Scanner · Wishlist-Matching · Portfolio-Analytics
          </p>
          <Link href="/dashboard/premium" style={{
            display:"inline-flex",alignItems:"center",gap:8,
            padding:"12px 28px",borderRadius:14,
            background:G,color:"#09090b",
            fontSize:14,fontWeight:400,textDecoration:"none",
            boxShadow:`0 4px 24px ${G25}`,
          }}>
            Premium werden ✦
          </Link>
          <div style={{marginTop:16,fontSize:11,color:TX3}}>6,99 € / Monat · Jederzeit kündbar</div>
        </div>
      </section>
    </div>
  );
}
