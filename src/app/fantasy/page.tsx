"use client";
import { useState } from "react";
const G="#E9A84B",G18="rgba(233,168,75,0.18)",G08="rgba(233,168,75,0.08)";
const BG1="#111113",BR1="rgba(255,255,255,0.06)";
const TX1="#f0f0f5",TX2="#a8a8b8",TX3="#6b6b7a";
export default function FantasyPage() {
  const [email,setEmail]=useState("");
  const [done,setDone]=useState(false);
  return (
    <div style={{minHeight:"80vh",display:"flex",alignItems:"center",justifyContent:"center",color:TX1,padding:"80px 24px"}}>
      <div style={{maxWidth:700,width:"100%",textAlign:"center"}}>
        <div style={{display:"inline-block",padding:"6px 20px",borderRadius:30,fontSize:10.5,fontWeight:600,letterSpacing:".12em",textTransform:"uppercase",background:G08,color:G,border:`1px solid ${G18}`,marginBottom:40}}>Bald verfügbar</div>
        <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(48px,7vw,80px)",fontWeight:300,letterSpacing:"-.085em",lineHeight:1.0,marginBottom:24}}>
          Fantasy<br/><span style={{color:G}}>League.</span>
        </h1>
        <p style={{fontSize:"clamp(17px,2vw,23px)",color:TX2,lineHeight:1.65,marginBottom:56,maxWidth:520,margin:"0 auto 56px"}}>
          Stelle dein Dream-Team aus den wertvollsten Karten zusammen und tritt gegen andere Sammler an. Monatliche Preise. Echte Kursgewinne.
        </p>
        {!done?(
          <div style={{display:"flex",gap:10,maxWidth:440,margin:"0 auto 48px"}} className="notify-form-row">
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="deine@email.de" type="email" style={{flex:1,padding:"16px 20px",borderRadius:18,background:BG1,border:`1px solid rgba(255,255,255,0.1)`,color:TX1,fontSize:15,outline:"none"}}/>
            <button onClick={()=>setDone(true)} className="gold-glow" style={{padding:"16px 28px",borderRadius:18,background:G,color:"#0a0808",fontSize:15,fontWeight:600,border:"none",cursor:"pointer",whiteSpace:"nowrap"}}>Benachrichtigen</button>
          </div>
        ):(
          <div style={{background:G08,border:`1px solid ${G18}`,borderRadius:18,padding:"18px 28px",marginBottom:48,fontSize:15,color:G,maxWidth:440,margin:"0 auto 48px"}}>✓ Du wirst als Erstes benachrichtigt!</div>
        )}
        <div style={{display:"flex",gap:64,justifyContent:"center"}}>
          {[{n:"847",l:"Auf der Warteliste"},{n:"Q3",l:"Geplanter Start"},{n:"2026",l:"Jahr"}].map(s=>(
            <div key={s.l}>
              <div style={{fontFamily:"var(--font-display)",fontSize:"clamp(32px,4vw,52px)",fontWeight:300,letterSpacing:"-.06em",color:s.l==="Auf der Warteliste"?G:TX1,lineHeight:1}}>{s.n}</div>
              <div style={{fontSize:10,color:TX3,marginTop:14,letterSpacing:".06em",textTransform:"uppercase"}}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
