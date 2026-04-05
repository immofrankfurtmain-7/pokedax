"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export const dynamic = "force-dynamic";

const G = "#D4A843", G15="rgba(212,168,67,0.15)", G08="rgba(212,168,67,0.08)";
const BG1="#111114", BR2="rgba(255,255,255,0.085)";
const TX1="#ededf2", TX2="#a4a4b4", TX3="#62626f";
const RED="#dc4a5a", GREEN="#3db87a";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [done,     setDone]     = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Passwort muss mindestens 8 Zeichen lang sein."); return; }
    if (username.length < 3) { setError("Benutzername muss mindestens 3 Zeichen lang sein."); return; }
    setLoading(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const sb = createClient();
      const { data, error } = await sb.auth.signUp({
        email, password,
        options: { data: { username }, emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) {
        setError(error.message.includes("already registered")
          ? "Diese E-Mail ist bereits registriert."
          : error.message);
      } else {
        if (data.user) {
          await sb.from("profiles").upsert({ id: data.user.id, username }, { onConflict: "id" });
        }
        setDone(true);
      }
    } catch { setError("Verbindungsfehler. Bitte erneut versuchen."); }
    setLoading(false);
  }

  async function handleGoogle() {
    const { createClient } = await import("@/lib/supabase/client");
    await createClient().auth.signInWithOAuth({
      provider:"google",
      options:{ redirectTo:`${window.location.origin}/auth/callback` },
    });
  }

  if (done) return (
    <div style={{minHeight:"80vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"40px 20px"}}>
      <div style={{maxWidth:480,width:"100%",textAlign:"center"}}>
        <div style={{fontSize:56,marginBottom:24}}>✉️</div>
        <h2 style={{fontFamily:"var(--font-display)",fontSize:30,fontWeight:300,letterSpacing:"-.05em",color:TX1,marginBottom:12}}>Fast geschafft!</h2>
        <p style={{fontSize:16,color:TX2,lineHeight:1.75,marginBottom:32}}>
          Wir haben dir eine Bestätigungs-E-Mail an{" "}
          <strong style={{color:TX1}}>{email}</strong> geschickt.
          Klicke auf den Link um deinen Account zu aktivieren.
        </p>
        <Link href="/auth/login" className="gold-glow" style={{display:"inline-block",padding:"14px 32px",borderRadius:22,background:G,color:"#080608",fontSize:14,fontWeight:600,textDecoration:"none",letterSpacing:".03em",textTransform:"uppercase"}}>Zur Anmeldung</Link>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"80vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"clamp(40px,8vw,80px) clamp(16px,4vw,24px)",position:"relative"}}>
      <div style={{position:"absolute",top:"30%",left:"50%",transform:"translateX(-50%)",width:600,height:400,background:"radial-gradient(ellipse at center,rgba(212,168,67,0.07) 0%,transparent 70%)",pointerEvents:"none",zIndex:0}}/>
      <div style={{width:"100%",maxWidth:480,position:"relative",zIndex:1}}>
        <div style={{textAlign:"center",marginBottom:48}}>
          <Link href="/" style={{fontFamily:"var(--font-display)",fontSize:28,fontWeight:300,letterSpacing:"-.08em",color:G,textDecoration:"none",display:"block",marginBottom:16}}>pokédax</Link>
          <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(24px,3vw,32px)",fontWeight:300,letterSpacing:"-.05em",color:TX1,marginBottom:8}}>Konto erstellen</h1>
          <p style={{fontSize:15,color:TX3}}>Bereits <strong style={{color:TX1,fontWeight:500}}>3.841 Sammler</strong> dabei</p>
        </div>
        <div style={{background:BG1,border:`1px solid rgba(212,168,67,0.12)`,borderRadius:32,padding:"clamp(32px,5vw,52px)",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,rgba(212,168,67,0.4),transparent)`}}/>
          {/* Proof */}
          <div style={{display:"flex",gap:8,marginBottom:28,flexWrap:"wrap"}}>
            {["✓ Kostenlos","✓ Sofort aktiv","✓ Kein Abo"].map(t=>(
              <span key={t} style={{fontSize:11.5,color:GREEN,background:"rgba(61,184,122,0.08)",border:"1px solid rgba(61,184,122,0.15)",padding:"4px 12px",borderRadius:8}}>{t}</span>
            ))}
          </div>
          <form onSubmit={handleRegister}>
            {error && <div style={{background:"rgba(220,74,90,0.08)",border:"1px solid rgba(220,74,90,0.2)",borderRadius:14,padding:"12px 16px",marginBottom:20,fontSize:13.5,color:RED}}>{error}</div>}
            {[
              {l:"Benutzername",t:"text",  p:"DeinSammlername",v:username,set:setUsername,ac:"username"},
              {l:"E-Mail",      t:"email", p:"deine@email.de", v:email,   set:setEmail,   ac:"email"},
              {l:"Passwort",    t:"password",p:"Min. 8 Zeichen",v:password,set:setPassword,ac:"new-password"},
            ].map(f=>(
              <div key={f.l} style={{marginBottom:16}}>
                <label style={{fontSize:11.5,fontWeight:500,color:TX3,display:"block",marginBottom:8,letterSpacing:".06em",textTransform:"uppercase"}}>{f.l}</label>
                <input type={f.t} placeholder={f.p} value={f.v} onChange={e=>f.set(e.target.value)} required autoComplete={f.ac}
                  style={{width:"100%",padding:"14px 18px",borderRadius:16,background:"rgba(0,0,0,0.25)",border:`1px solid ${BR2}`,color:TX1,fontSize:15,outline:"none",transition:"border-color .2s",fontFamily:"var(--font-body)"}}
                  onFocus={e=>{e.target.style.borderColor="rgba(212,168,67,0.35)";}}
                  onBlur={e=>{e.target.style.borderColor=BR2;}}
                />
              </div>
            ))}
            <button type="submit" disabled={loading} className="gold-glow" style={{width:"100%",padding:"16px",borderRadius:22,background:loading?G08:G,color:loading?G:"#080608",fontSize:15,fontWeight:600,border:loading?`1px solid ${G15}`:"none",cursor:loading?"wait":"pointer",letterSpacing:".03em",textTransform:"uppercase",marginTop:8,marginBottom:16}}>
              {loading?"Registriere…":"Kostenlos registrieren"}
            </button>
          </form>
          <div style={{display:"flex",alignItems:"center",gap:12,margin:"16px 0"}}>
            <div style={{flex:1,height:1,background:"rgba(255,255,255,0.05)"}}/><span style={{fontSize:12,color:TX3,letterSpacing:".04em"}}>oder</span><div style={{flex:1,height:1,background:"rgba(255,255,255,0.05)"}}/>
          </div>
          <button onClick={handleGoogle} style={{width:"100%",padding:"14px",borderRadius:18,background:"rgba(255,255,255,0.03)",border:`1px solid rgba(255,255,255,0.07)`,color:TX2,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10,fontFamily:"var(--font-body)"}}>
            <svg width="18" height="18" viewBox="0 0 24 24" style={{flexShrink:0}}>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Mit Google registrieren
          </button>
          <p style={{fontSize:11.5,color:TX3,textAlign:"center",marginTop:20,lineHeight:1.7}}>
            Mit Registrierung stimmst du den <Link href="/agb" style={{color:TX2}}>AGB</Link> und der <Link href="/datenschutz" style={{color:TX2}}>Datenschutzerklärung</Link> zu.
          </p>
          <p style={{textAlign:"center",marginTop:14,fontSize:14,color:TX3}}>
            Bereits registriert? <Link href="/auth/login" style={{color:G,textDecoration:"none",fontWeight:500}}>Anmelden</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
