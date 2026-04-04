"use client";
import { useState } from "react";
const G="#E9A84B",G18="rgba(233,168,75,0.18)",G08="rgba(233,168,75,0.08)";
const BG1="#111113",BR2="rgba(255,255,255,0.10)";
const TX1="#f0f0f5",TX2="#a8a8b8",TX3="#6b6b7a";
export default function FantasyPage() {
  const [email,setEmail]=useState("");
  const [done,setDone]=useState(false);
  return (
    <div style={{minHeight:"80vh",display:"flex",alignItems:"center",justifyContent:"center",color:TX1}}>
      <div style={{maxWidth:600,margin:"0 auto",padding:"100px 28px",textAlign:"center"}}>
        <div style={{display:"inline-block",padding:"5px 18px",borderRadius:30,fontSize:10.5,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",background:G08,color:G,border:`1px solid ${G18}`,marginBottom:32}}>Bald verfügbar</div>
        <h1 style={{fontSize:"clamp(40px,6vw,64px)",fontWeight:300,letterSpacing:"-.055em",lineHeight:1.0,marginBottom:20,fontFamily:"var(--font-display)"}}>
          Fantasy<br/><span style={{color:G}}>League.</span>
        </h1>
        <p style={{fontSize:17,color:TX2,lineHeight:1.78,marginBottom:44}}>
          Stelle dein Dream-Team aus den wertvollsten Karten zusammen und tritt gegen andere Sammler an. Monatliche Preise. Echte Kursgewinne.
        </p>
        {!done?(
          <div style={{display:"flex",gap:8,maxWidth:400,margin:"0 auto 36px"}}>
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="deine@email.de" type="email" style={{flex:1,padding:"14px 18px",borderRadius:16,background:BG1,border:`1px solid ${BR2}`,color:TX1,fontSize:14,outline:"none"}}/>
            <button onClick={()=>done||setDone(true)} style={{padding:"14px 24px",borderRadius:16,background:G,color:"#0a0808",fontSize:14,fontWeight:600,border:"none",cursor:"pointer",whiteSpace:"nowrap"}}>Benachrichtigen</button>
          </div>
        ):(
          <div style={{background:G08,border:`1px solid ${G18}`,borderRadius:16,padding:"16px 24px",marginBottom:36,fontSize:14,color:G}}>✓ Du wirst benachrichtigt sobald Fantasy League startet!</div>
        )}
        <div style={{display:"flex",gap:48,justifyContent:"center"}}>
          {[{n:"847",l:"Auf der Warteliste"},{n:"Q3",l:"Geplanter Start"},{n:"2026",l:"Jahr"}].map(s=>(
            <div key={s.l} style={{textAlign:"center"}}>
              <div style={{fontSize:32,fontWeight:300,letterSpacing:"-.04em",color:s.l==="Auf der Warteliste"?G:TX1,lineHeight:1,fontFamily:"var(--font-display)"}}>{s.n}</div>
              <div style={{fontSize:11,color:TX3,marginTop:6,letterSpacing:".04em"}}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
