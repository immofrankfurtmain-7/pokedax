"use client";
import { useState } from "react";
import Link from "next/link";
const G="#E9A84B",G18="rgba(233,168,75,0.18)",G08="rgba(233,168,75,0.08)";
const BG1="#111113",BG2="#1a1a1f",BR2="rgba(255,255,255,0.10)";
const TX1="#f0f0f5",TX2="#a8a8b8",TX3="#6b6b7a";
export default function ScannerPage() {
  const [dragging,setDragging]=useState(false);
  return (
    <div style={{minHeight:"80vh",color:TX1}}>
      <div style={{maxWidth:720,margin:"0 auto",padding:"72px 28px"}}>
        <div style={{textAlign:"center",marginBottom:52}}>
          <div style={{fontSize:10,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:G,marginBottom:18}}>KI-Scanner · Gemini Flash</div>
          <h1 style={{fontSize:"clamp(36px,5.5vw,60px)",fontWeight:300,letterSpacing:"-.05em",lineHeight:1.05,marginBottom:18,fontFamily:"var(--font-display)"}}>
            Foto machen.<br/><span style={{color:G}}>Preis wissen.</span>
          </h1>
          <p style={{fontSize:16,color:TX2,lineHeight:1.75,maxWidth:420,margin:"0 auto"}}>
            Halte deine Karte in die Kamera. Die KI erkennt sie in Sekunden und zeigt den Cardmarket-Wert.
          </p>
        </div>
        <div style={{background:BG1,border:`1px solid ${BR2}`,borderRadius:32,padding:40,position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:"linear-gradient(90deg,transparent,rgba(233,168,75,0.35),transparent)"}}/>
          <div
            onDragOver={e=>{e.preventDefault();setDragging(true);}}
            onDragLeave={()=>setDragging(false)}
            onDrop={e=>{e.preventDefault();setDragging(false);}}
            style={{
              maxWidth:440,margin:"0 auto 28px",
              aspectRatio:"4/3",borderRadius:22,
              background:dragging?"rgba(233,168,75,0.04)":BG2,
              border:`1.5px dashed ${dragging?"rgba(233,168,75,0.4)":"rgba(233,168,75,0.18)"}`,
              display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16,
              cursor:"pointer",transition:"all .3s",
            }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={TX3} strokeWidth="1.2" style={{opacity:.4}}>
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:15,color:TX2,marginBottom:4}}>Foto hier ablegen</div>
              <div style={{fontSize:12,color:TX3}}>oder klicken zum Hochladen · JPG, PNG, WEBP</div>
            </div>
          </div>
          <button style={{
            display:"block",width:"100%",maxWidth:440,margin:"0 auto",
            padding:"16px",borderRadius:20,
            background:G,color:"#0a0808",fontSize:15,fontWeight:600,
            border:"none",cursor:"pointer",letterSpacing:"-.01em",
          }}>Jetzt scannen</button>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginTop:18,fontSize:13,color:TX3}}>
            <span>5 / 5 Scans heute</span>
            <span>·</span>
            <Link href="/dashboard/premium" style={{color:G,textDecoration:"none"}}>Unlimitiert mit Premium ✦</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
