"use client";
import Link from "next/link";
const G="#E9A84B",G18="rgba(233,168,75,0.18)",G08="rgba(233,168,75,0.08)",G05="rgba(233,168,75,0.05)";
const BG1="#111113",BG2="#1a1a1f";
const BR2="rgba(255,255,255,0.085)";
const TX1="#f0f0f5",TX2="#a8a8b8",TX3="#6b6b7a";
import { useState } from "react";
export default function ScannerPage() {
  const [dragging,setDragging]=useState(false);
  return (
    <div style={{minHeight:"80vh",color:TX1}}>
      <div style={{maxWidth:700,margin:"0 auto",padding:"52px 28px"}}>
        <div style={{textAlign:"center",marginBottom:44}}>
          <div style={{fontSize:9,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:TX3,marginBottom:14}}>KI-Scanner · Gemini Flash</div>
          <h1 style={{fontSize:"clamp(32px,4.5vw,48px)",fontWeight:300,letterSpacing:"-.045em",lineHeight:1.05,marginBottom:14,fontFamily:"var(--font-display)"}}>Foto machen.<br/><span style={{fontWeight:500}}>Preis wissen.</span></h1>
          <p style={{fontSize:14,color:TX2,lineHeight:1.78,maxWidth:400,margin:"0 auto"}}>KI erkennt deine Karte in Sekunden und zeigt den aktuellen Cardmarket-Wert.</p>
        </div>
        <div style={{background:BG1,border:`1px solid ${BR2}`,borderRadius:24,padding:32,position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,rgba(233,168,75,0.35),transparent)`}}/>
          <div onDragOver={e=>{e.preventDefault();setDragging(true);}} onDragLeave={()=>setDragging(false)} onDrop={e=>{e.preventDefault();setDragging(false);}} style={{
            maxWidth:420,margin:"0 auto 24px",
            aspectRatio:"1",borderRadius:18,
            background:dragging?G05:BG2,
            border:`1.5px dashed ${dragging?"rgba(233,168,75,0.4)":"rgba(233,168,75,0.18)"}`,
            display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:14,
            cursor:"pointer",
            transition:"all .22s var(--ease)",
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={TX3} strokeWidth="1.2" style={{opacity:.5}}>
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
            </svg>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:13.5,color:TX2,marginBottom:4}}>Foto hier ablegen</div>
              <div style={{fontSize:11.5,color:TX3}}>oder klicken zum Hochladen</div>
            </div>
            <div style={{fontSize:10,color:TX3,padding:"3px 12px",borderRadius:6,background:BG1,border:`1px solid rgba(255,255,255,0.055)`}}>JPG, PNG, WEBP · max 10 MB</div>
          </div>
          <button style={{width:"100%",maxWidth:420,display:"block",margin:"0 auto",padding:"13px",borderRadius:12,background:G,color:"#0a0808",fontSize:14,fontWeight:600,border:"none",cursor:"pointer",letterSpacing:"-.01em",boxShadow:"0 2px 18px rgba(233,168,75,0.22)"}}>Jetzt scannen</button>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:9,marginTop:18}}>
            <span style={{padding:"3px 10px",borderRadius:5,fontSize:10,fontWeight:500,background:G08,color:G,border:`1px solid ${G18}`}}>5 / 5 Scans heute</span>
            <span style={{fontSize:11,color:TX3}}>→</span>
            <Link href="/dashboard/premium" style={{fontSize:11,color:G,textDecoration:"none"}}>Unlimitiert mit Premium ✦</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
