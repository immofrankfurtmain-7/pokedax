export const dynamic = "force-dynamic";
import Link from "next/link";
export const metadata = { title:"Registrieren" };
const G="#E9A84B",BR2="rgba(255,255,255,0.085)";
const BG1="#111113",BG2="#1a1a1f";
const TX1="#f0f0f5",TX2="#a8a8b8",TX3="#6b6b7a";
export default function RegisterPage() {
  return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:`radial-gradient(ellipse 50% 40% at 50% 0%,rgba(233,168,75,0.04),transparent 50%)`}}>
      <div style={{background:BG1,border:`1px solid ${BR2}`,borderRadius:24,padding:"44px 40px",width:400}}>
        <div style={{fontSize:22,fontWeight:300,letterSpacing:"-.04em",color:TX1,textAlign:"center",marginBottom:8,fontFamily:"var(--font-display)"}}>pokédax</div>
        <div style={{fontSize:13,color:TX3,textAlign:"center",marginBottom:32}}>
          Bereits <strong style={{color:TX1,fontWeight:500}}>3.841 Sammler</strong> dabei
        </div>
        {[{l:"Benutzername",t:"text",p:"DeinSammlername"},{l:"E-Mail",t:"email",p:"deine@email.de"},{l:"Passwort",t:"password",p:"Min. 8 Zeichen"}].map(f=>(
          <div key={f.l} style={{marginBottom:14}}>
            <label style={{fontSize:11.5,fontWeight:500,color:TX2,display:"block",marginBottom:6,letterSpacing:".02em"}}>{f.l}</label>
            <input type={f.t} placeholder={f.p} style={{width:"100%",padding:"12px 16px",borderRadius:11,background:BG2,border:`1px solid ${BR2}`,color:TX1,fontSize:13.5,outline:"none"}}/>
          </div>
        ))}
        <button style={{width:"100%",padding:"13px",borderRadius:12,background:G,color:"#0a0808",fontSize:14,fontWeight:600,border:"none",cursor:"pointer",boxShadow:"0 2px 18px rgba(233,168,75,0.22)",marginBottom:16,marginTop:4}}>Kostenlos registrieren</button>
        <div style={{display:"flex",alignItems:"center",gap:12,margin:"18px 0"}}>
          <div style={{flex:1,height:1,background:"rgba(255,255,255,0.05)"}}/>
          <span style={{fontSize:11,color:TX3}}>oder</span>
          <div style={{flex:1,height:1,background:"rgba(255,255,255,0.05)"}}/>
        </div>
        <button style={{width:"100%",padding:"12px",borderRadius:12,background:BG2,border:`1px solid ${BR2}`,color:TX2,fontSize:13,cursor:"pointer"}}>Mit Google registrieren</button>
        <div style={{fontSize:11,color:TX3,textAlign:"center",marginTop:16,lineHeight:1.65}}>
          Mit der Registrierung stimmst du unseren <a href="/agb" style={{color:TX2}}>AGB</a> und der <a href="/datenschutz" style={{color:TX2}}>Datenschutzerklärung</a> zu.
        </div>
        <div style={{textAlign:"center",marginTop:14,fontSize:12.5,color:TX3}}>
          Bereits registriert? <Link href="/auth/login" style={{color:G,textDecoration:"none"}}>Anmelden</Link>
        </div>
      </div>
    </div>
  );
}
