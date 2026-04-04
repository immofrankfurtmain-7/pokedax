export const dynamic = "force-dynamic";
import Link from "next/link";
const G="#E9A84B";
const BG1="#111113",BR2="rgba(255,255,255,0.10)";
const TX1="#f0f0f5",TX2="#a8a8b8",TX3="#6b6b7a",GREEN="#4BBF82";
export default function RegisterPage() {
  return (
    <div style={{minHeight:"80vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"40px 24px"}}>
      <div style={{width:"100%",maxWidth:460}}>
        <div style={{textAlign:"center",marginBottom:52}}>
          <div style={{fontFamily:"var(--font-display)",fontSize:32,fontWeight:300,letterSpacing:"-.09em",color:TX1,marginBottom:10}}>pokédax</div>
          <p style={{fontSize:16,color:TX2}}>Bereits <strong style={{color:TX1,fontWeight:500}}>3.841 Sammler</strong> dabei</p>
        </div>
        <div style={{background:BG1,border:`1px solid ${BR2}`,borderRadius:32,padding:"clamp(32px,5vw,48px)"}}>
          {/* Social proof pills */}
          <div style={{display:"flex",gap:8,marginBottom:28,flexWrap:"wrap"}}>
            {["✓ Kostenlos starten","✓ Sofort aktiv","✓ Kein Abo nötig"].map(t=>(
              <span key={t} style={{fontSize:11.5,color:GREEN,background:"rgba(75,191,130,0.08)",border:"1px solid rgba(75,191,130,0.15)",padding:"4px 12px",borderRadius:8}}>{t}</span>
            ))}
          </div>
          {[{l:"Benutzername",t:"text",p:"DeinSammlername"},{l:"E-Mail",t:"email",p:"deine@email.de"},{l:"Passwort",t:"password",p:"Min. 8 Zeichen"}].map(f=>(
            <div key={f.l} style={{marginBottom:20}}>
              <label style={{fontSize:12,fontWeight:500,color:TX2,display:"block",marginBottom:8,letterSpacing:".04em"}}>{f.l}</label>
              <input type={f.t} placeholder={f.p} style={{width:"100%",padding:"15px 20px",borderRadius:18,background:"rgba(0,0,0,0.3)",border:`1px solid ${BR2}`,color:TX1,fontSize:15,outline:"none"}}/>
            </div>
          ))}
          <button className="gold-glow" style={{width:"100%",padding:"17px",borderRadius:22,background:G,color:"#0a0808",fontSize:16,fontWeight:600,border:"none",cursor:"pointer",marginBottom:16,marginTop:4}}>Kostenlos registrieren</button>
          <div style={{display:"flex",alignItems:"center",gap:12,margin:"16px 0"}}>
            <div style={{flex:1,height:1,background:"rgba(255,255,255,0.06)"}}/><span style={{fontSize:12,color:TX3}}>oder</span><div style={{flex:1,height:1,background:"rgba(255,255,255,0.06)"}}/>
          </div>
          <button style={{width:"100%",padding:"15px",borderRadius:18,background:"rgba(255,255,255,0.03)",border:`1px solid rgba(255,255,255,0.08)`,color:TX2,fontSize:14,cursor:"pointer"}}>Mit Google registrieren</button>
          <p style={{fontSize:11.5,color:TX3,textAlign:"center",marginTop:20,lineHeight:1.7}}>Mit der Registrierung stimmst du den <a href="/agb" style={{color:TX2}}>AGB</a> und der <a href="/datenschutz" style={{color:TX2}}>Datenschutzerklärung</a> zu.</p>
          <p style={{textAlign:"center",marginTop:16,fontSize:14,color:TX3}}>Bereits registriert? <Link href="/auth/login" style={{color:G,textDecoration:"none"}}>Anmelden</Link></p>
        </div>
      </div>
    </div>
  );
}
