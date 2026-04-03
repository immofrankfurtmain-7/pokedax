import Link from "next/link";
export const metadata = { title:"Anmelden" };
const G="#E9A84B",G18="rgba(233,168,75,0.18)",G08="rgba(233,168,75,0.08)";
const BG1="#111113",BG2="#1a1a1f",BR2="rgba(255,255,255,0.085)";
const TX1="#f0f0f5",TX2="#a8a8b8",TX3="#6b6b7a";
export default function LoginPage() {
  return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:`radial-gradient(ellipse 50% 40% at 50% 0%,rgba(233,168,75,0.04),transparent 50%)`}}>
      <div style={{background:BG1,border:`1px solid ${BR2}`,borderRadius:24,padding:"44px 40px",width:400}}>
        <div style={{fontSize:22,fontWeight:300,letterSpacing:"-.04em",color:TX1,textAlign:"center",marginBottom:8,fontFamily:"var(--font-display)"}}>pokédax</div>
        <div style={{fontSize:13,color:TX3,textAlign:"center",marginBottom:32}}>Willkommen zurück</div>
        {[{l:"E-Mail",t:"email",p:"deine@email.de"},{l:"Passwort",t:"password",p:"••••••••"}].map(f=>(
          <div key={f.l} style={{marginBottom:14}}>
            <label style={{fontSize:11.5,fontWeight:500,color:TX2,display:"block",marginBottom:6,letterSpacing:".02em"}}>{f.l}</label>
            <input type={f.t} placeholder={f.p} style={{width:"100%",padding:"12px 16px",borderRadius:11,background:BG2,border:`1px solid ${BR2}`,color:TX1,fontSize:13.5,outline:"none"}}/>
          </div>
        ))}
        <div style={{textAlign:"right",marginBottom:8}}>
          <a href="#" style={{fontSize:11.5,color:TX3,textDecoration:"none"}}>Passwort vergessen?</a>
        </div>
        <button style={{width:"100%",padding:"13px",borderRadius:12,background:G,color:"#0a0808",fontSize:14,fontWeight:600,border:"none",cursor:"pointer",boxShadow:"0 2px 18px rgba(233,168,75,0.22)",marginBottom:16}}>Anmelden</button>
        <div style={{display:"flex",alignItems:"center",gap:12,margin:"18px 0"}}>
          <div style={{flex:1,height:1,background:"rgba(255,255,255,0.05)"}}/>
          <span style={{fontSize:11,color:TX3}}>oder</span>
          <div style={{flex:1,height:1,background:"rgba(255,255,255,0.05)"}}/>
        </div>
        <button style={{width:"100%",padding:"12px",borderRadius:12,background:BG2,border:`1px solid ${BR2}`,color:TX2,fontSize:13,cursor:"pointer"}}>Mit Google anmelden</button>
        <div style={{textAlign:"center",marginTop:20,fontSize:12.5,color:TX3}}>
          Noch kein Account? <Link href="/auth/register" style={{color:G,textDecoration:"none"}}>Registrieren</Link>
        </div>
      </div>
    </div>
  );
}
