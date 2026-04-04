"use client";
import { useState } from "react";
import Link from "next/link";
const G="#E9A84B",G18="rgba(233,168,75,0.18)",G08="rgba(233,168,75,0.08)";
const BG1="#111113",BR1="rgba(255,255,255,0.06)",BR2="rgba(255,255,255,0.10)";
const TX1="#f0f0f5",TX2="#a8a8b8",TX3="#6b6b7a",GREEN="#4BBF82";
export default function ScannerPage() {
  const [dragging,setDragging]=useState(false);
  const [result,setResult]=useState<string|null>(null);
  return (
    <div style={{minHeight:"80vh",color:TX1}}>
      <div style={{maxWidth:1000,margin:"0 auto",padding:"80px 24px"}}>
        <div style={{textAlign:"center",marginBottom:64}}>
          <div style={{fontSize:10,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:G,marginBottom:24}}>KI-Scanner</div>
          <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(40px,6vw,72px)",fontWeight:300,letterSpacing:"-.085em",lineHeight:1.0,marginBottom:20}}>
            Foto machen.<br/><span style={{color:G}}>Preis wissen.</span>
          </h1>
          <p style={{fontSize:"clamp(16px,1.8vw,22px)",color:TX2,maxWidth:480,margin:"0 auto",lineHeight:1.65}}>
            Halte deine Karte vor die Kamera. In Sekunden erhältst du den aktuellen Marktwert von Cardmarket.
          </p>
        </div>
        <div style={{background:BG1,border:`1px solid ${BR2}`,borderRadius:32,overflow:"hidden",display:"grid",gridTemplateColumns:"1fr 1fr",gap:0,minHeight:400}}>
          <div style={{padding:"clamp(32px,4vw,56px)",display:"flex",flexDirection:"column",justifyContent:"center",borderRight:`1px solid ${BR1}`}}>
            <div
              onDragOver={e=>{e.preventDefault();setDragging(true);}}
              onDragLeave={()=>setDragging(false)}
              onDrop={e=>{e.preventDefault();setDragging(false);setResult("Glurak ex · Obsidian Flames · 184,50 €");}}
              style={{
                aspectRatio:"1",borderRadius:20,
                background:dragging?"rgba(233,168,75,0.04)":"#050505",
                border:`1.5px dashed ${dragging?"rgba(233,168,75,0.5)":BR2}`,
                display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16,
                cursor:"pointer",transition:"all .3s",marginBottom:20,
              }}>
              <div style={{fontSize:40}}>📸</div>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:15,color:TX2,marginBottom:4}}>Karte hier ablegen</div>
                <div style={{fontSize:12,color:TX3}}>oder klicken · JPG, PNG, WEBP</div>
              </div>
            </div>
            <button className="gold-glow" style={{width:"100%",padding:"16px",borderRadius:20,background:G,color:"#0a0808",fontSize:16,fontWeight:600,border:"none",cursor:"pointer"}}>Jetzt scannen</button>
            <div style={{textAlign:"center",marginTop:16,fontSize:12.5,color:TX3}}>
              5 / 5 Scans heute · <Link href="/dashboard/premium" style={{color:G,textDecoration:"none"}}>Unlimitiert mit Premium</Link>
            </div>
          </div>
          <div style={{padding:"clamp(32px,4vw,56px)",display:"flex",flexDirection:"column",justifyContent:"center"}}>
            {result?(
              <div>
                <div style={{fontSize:10,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:GREEN,marginBottom:20}}>Erkannt</div>
                <div style={{fontFamily:"var(--font-display)",fontSize:"clamp(24px,3vw,36px)",fontWeight:300,letterSpacing:"-.04em",color:TX1,marginBottom:12}}>{result.split("·")[0]}</div>
                <div style={{fontSize:14,color:TX2,marginBottom:24}}>{result.split("·")[1]?.trim()}</div>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:"clamp(32px,4vw,52px)",fontWeight:400,color:G,letterSpacing:"-.03em"}}>{result.split("·")[2]?.trim()}</div>
              </div>
            ):(
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:10,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:TX3,marginBottom:16}}>Ergebnis</div>
                <div style={{fontSize:16,color:TX3,lineHeight:1.7}}>Lade eine Karte hoch<br/>um den Preis zu sehen</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
