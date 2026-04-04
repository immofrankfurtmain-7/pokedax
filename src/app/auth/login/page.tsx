export const dynamic = "force-dynamic";
import Link from "next/link";
const G="#E9A84B";
const BG1="#111113",BR2="rgba(255,255,255,0.10)";
const TX1="#f0f0f5",TX2="#a8a8b8",TX3="#6b6b7a";
export default function LoginPage() {
  return (
    <div style={{minHeight:"80vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"40px 24px"}}>
      <div style={{width:"100%",maxWidth:460}}>
        <div style={{textAlign:"center",marginBottom:52}}>
          <div style={{fontFamily:"var(--font-display)",fontSize:32,fontWeight:300,letterSpacing:"-.09em",color:TX1,marginBottom:10}}>pokédax</div>
          <p style={{fontSize:16,color:TX2}}>Willkommen zurück</p>
        </div>
        <div style={{background:BG1,border:`1px solid ${BR2}`,borderRadius:32,padding:"clamp(32px,5vw,48px)"}}>
          {[{l:"E-Mail",t:"email",p:"deine@email.de"},{l:"Passwort",t:"password",p:"••••••••"}].map(f=>(
            <div key={f.l} style={{marginBottom:20}}>
              <label style={{fontSize:12,fontWeight:500,color:TX2,display:"block",marginBottom:8,letterSpacing:".04em"}}>{f.l}</label>
              <input type={f.t} placeholder={f.p} style={{width:"100%",padding:"15px 20px",borderRadius:18,background:"rgba(0,0,0,0.3)",border:`1px solid ${BR2}`,color:TX1,fontSize:15,outline:"none"}}/>
            </div>
          ))}
          <div style={{textAlign:"right",marginBottom:28}}>
            <a href="#" style={{fontSize:13,color:TX3,textDecoration:"none"}}>Passwort vergessen?</a>
          </div>
          <button className="gold-glow" style={{width:"100%",padding:"17px",borderRadius:22,background:G,color:"#0a0808",fontSize:16,fontWeight:600,border:"none",cursor:"pointer",marginBottom:20}}>Anmelden</button>
          <div style={{display:"flex",alignItems:"center",gap:12,margin:"20px 0"}}>
            <div style={{flex:1,height:1,background:"rgba(255,255,255,0.06)"}}/><span style={{fontSize:12,color:TX3}}>oder</span><div style={{flex:1,height:1,background:"rgba(255,255,255,0.06)"}}/>
          </div>
          <button style={{width:"100%",padding:"15px",borderRadius:18,background:"rgba(255,255,255,0.03)",border:`1px solid rgba(255,255,255,0.08)`,color:TX2,fontSize:14,cursor:"pointer"}}>Mit Google anmelden</button>
          <p style={{textAlign:"center",marginTop:28,fontSize:14,color:TX3}}>Noch kein Account? <Link href="/auth/register" style={{color:G,textDecoration:"none"}}>Registrieren</Link></p>
        </div>
      </div>
    </div>
  );
}
