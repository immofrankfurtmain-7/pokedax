export const dynamic = "force-dynamic";
import Link from "next/link";
const G="#E9A84B";
const BG1="#111113",BR2="rgba(255,255,255,0.10)";
const TX1="#f0f0f5",TX2="#a8a8b8",TX3="#6b6b7a";
export default function RegisterPage() {
  return (
    <div style={{minHeight:"80vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"40px 24px"}}>
      <div style={{width:"100%",maxWidth:440}}>
        <div style={{textAlign:"center",marginBottom:48}}>
          <div style={{fontFamily:"var(--font-display)",fontSize:28,fontWeight:300,letterSpacing:"-.09em",color:TX1,marginBottom:10}}>pokédax</div>
          <p style={{fontSize:15,color:TX2}}>Bereits <strong style={{color:TX1,fontWeight:500}}>3.841 Sammler</strong> dabei</p>
        </div>
        <div style={{background:BG1,border:`1px solid ${BR2}`,borderRadius:28,padding:40}}>
          {[{l:"Benutzername",t:"text",p:"DeinSammlername"},{l:"E-Mail",t:"email",p:"deine@email.de"},{l:"Passwort",t:"password",p:"Min. 8 Zeichen"}].map(f=>(
            <div key={f.l} style={{marginBottom:18}}>
              <label style={{fontSize:12,fontWeight:500,color:TX2,display:"block",marginBottom:8,letterSpacing:".04em"}}>{f.l}</label>
              <input type={f.t} placeholder={f.p} style={{width:"100%",padding:"14px 18px",borderRadius:16,background:"#0d0d0d",border:`1px solid ${BR2}`,color:TX1,fontSize:15,outline:"none"}}/>
            </div>
          ))}
          <button className="gold-glow" style={{width:"100%",padding:"16px",borderRadius:20,background:G,color:"#0a0808",fontSize:15,fontWeight:600,border:"none",cursor:"pointer",marginTop:8,marginBottom:20}}>Kostenlos registrieren</button>
          <p style={{fontSize:11,color:TX3,textAlign:"center",lineHeight:1.65}}>
            Mit Registrierung stimmst du den <a href="/agb" style={{color:TX2}}>AGB</a> und <a href="/datenschutz" style={{color:TX2}}>Datenschutzrichtlinien</a> zu.
          </p>
          <p style={{textAlign:"center",marginTop:20,fontSize:13.5,color:TX3}}>
            Bereits registriert? <Link href="/auth/login" style={{color:G,textDecoration:"none"}}>Anmelden</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
