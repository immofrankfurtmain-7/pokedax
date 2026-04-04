export const dynamic = "force-dynamic";
import Link from "next/link";
const G="#E9A84B",G18="rgba(233,168,75,0.18)",G08="rgba(233,168,75,0.08)";
const BG1="#111113",BR1="rgba(255,255,255,0.06)",BR2="rgba(255,255,255,0.10)";
const TX1="#f0f0f5",TX2="#a8a8b8",TX3="#6b6b7a";
export default function LoginPage() {
  return (
    <div style={{minHeight:"80vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"40px 24px"}}>
      <div style={{width:"100%",maxWidth:440}}>
        <div style={{textAlign:"center",marginBottom:48}}>
          <div style={{fontFamily:"var(--font-display)",fontSize:28,fontWeight:300,letterSpacing:"-.09em",color:TX1,marginBottom:10}}>pokédax</div>
          <p style={{fontSize:15,color:TX2}}>Willkommen zurück</p>
        </div>
        <div style={{background:BG1,border:`1px solid ${BR2}`,borderRadius:28,padding:40}}>
          <div style={{marginBottom:20}}>
            <label style={{fontSize:12,fontWeight:500,color:TX2,display:"block",marginBottom:8,letterSpacing:".04em"}}>E-Mail</label>
            <input type="email" placeholder="deine@email.de" style={{width:"100%",padding:"14px 18px",borderRadius:16,background:"#0d0d0d",border:`1px solid ${BR2}`,color:TX1,fontSize:15,outline:"none"}}/>
          </div>
          <div style={{marginBottom:10}}>
            <label style={{fontSize:12,fontWeight:500,color:TX2,display:"block",marginBottom:8,letterSpacing:".04em"}}>Passwort</label>
            <input type="password" placeholder="••••••••" style={{width:"100%",padding:"14px 18px",borderRadius:16,background:"#0d0d0d",border:`1px solid ${BR2}`,color:TX1,fontSize:15,outline:"none"}}/>
          </div>
          <div style={{textAlign:"right",marginBottom:28}}>
            <a href="#" style={{fontSize:12.5,color:TX3,textDecoration:"none"}}>Passwort vergessen?</a>
          </div>
          <button className="gold-glow" style={{width:"100%",padding:"16px",borderRadius:20,background:G,color:"#0a0808",fontSize:15,fontWeight:600,border:"none",cursor:"pointer",marginBottom:20}}>Anmelden</button>
          <div style={{display:"flex",alignItems:"center",gap:12,margin:"20px 0"}}>
            <div style={{flex:1,height:1,background:BR1}}/><span style={{fontSize:12,color:TX3}}>oder</span><div style={{flex:1,height:1,background:BR1}}/>
          </div>
          <button style={{width:"100%",padding:"14px",borderRadius:18,background:"#0d0d0d",border:`1px solid ${BR2}`,color:TX2,fontSize:14,cursor:"pointer"}}>Mit Google anmelden</button>
          <p style={{textAlign:"center",marginTop:24,fontSize:13.5,color:TX3}}>
            Noch kein Account? <Link href="/auth/register" style={{color:G,textDecoration:"none"}}>Registrieren</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
