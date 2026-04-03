"use client";
import { useState } from "react";
const G="#E9A84B",G18="rgba(233,168,75,0.18)",G08="rgba(233,168,75,0.08)";
const BG1="#111113",BG2="#1a1a1f";
const BR2="rgba(255,255,255,0.085)";
const TX1="#f0f0f5",TX2="#a8a8b8",TX3="#6b6b7a";
export default function FantasyPage() {
  const [email,setEmail]=useState("");
  const [done,setDone]=useState(false);
  return (
    <div style={{minHeight:"80vh",display:"flex",alignItems:"center",justifyContent:"center",color:TX1}}>
      <div style={{maxWidth:580,margin:"0 auto",padding:"80px 28px",textAlign:"center"}}>
        <div style={{display:"inline-block",padding:"4px 16px",borderRadius:20,fontSize:10,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",background:G08,color:G,border:`1px solid ${G18}`,marginBottom:28}}>Bald verfügbar</div>
        <h1 style={{fontSize:"clamp(34px,5vw,54px)",fontWeight:300,letterSpacing:"-.045em",lineHeight:1.04,marginBottom:18,fontFamily:"var(--font-display)"}}>Fantasy<br/><span style={{fontWeight:500}}>League.</span></h1>
        <p style={{fontSize:14.5,color:TX2,lineHeight:1.78,marginBottom:36}}>Stelle dein Dream-Team aus den wertvollsten Karten zusammen und tritt gegen andere Sammler an. Wöchentliche Ranglisten. Echte Preise.</p>
        {!done?(
          <div style={{display:"flex",gap:8,maxWidth:380,margin:"0 auto 32px"}}>
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="deine@email.de" type="email" style={{flex:1,padding:"12px 16px",borderRadius:11,background:BG1,border:`1px solid ${BR2}`,color:TX1,fontSize:13,outline:"none"}}/>
            <button onClick={()=>setDone(true)} style={{padding:"12px 22px",borderRadius:11,background:G,color:"#0a0808",fontSize:13,fontWeight:600,border:"none",cursor:"pointer",whiteSpace:"nowrap"}}>Benachrichtigen</button>
          </div>
        ):(
          <div style={{background:G08,border:`1px solid ${G18}`,borderRadius:14,padding:"16px 24px",marginBottom:32,fontSize:13,color:G}}>✓ Du wirst benachrichtigt sobald Fantasy League startet!</div>
        )}
        <div style={{display:"flex",gap:40,justifyContent:"center"}}>
          {[{n:"847",l:"Auf der Warteliste"},{n:"Q3",l:"Geplanter Start"},{n:"2026",l:"Jahr"}].map(s=>(
            <div key={s.l} style={{textAlign:"center"}}>
              <div style={{fontSize:28,fontWeight:300,letterSpacing:"-.04em",color:s.l==="Auf der Warteliste"?G:TX1,fontFamily:"'DM Mono',monospace",lineHeight:1}}>{s.n}</div>
              <div style={{fontSize:10.5,color:TX3,marginTop:4}}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
