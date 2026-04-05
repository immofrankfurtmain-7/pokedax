"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export const dynamic = "force-dynamic";

const G="#E9A84B",G18="rgba(233,168,75,0.18)";
const BG1="#111113",BR2="rgba(255,255,255,0.10)";
const TX1="#f0f0f5",TX2="#a8a8b8",TX3="#6b6b7a",RED="#E04558",GREEN="#4BBF82";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState(false);

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
        options: {
          data: { username },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        if (error.message.includes("already registered")) {
          setError("Diese E-Mail ist bereits registriert. Bitte melde dich an.");
        } else {
          setError(error.message);
        }
      } else {
        // Insert username into profiles if user created
        if (data.user) {
          await sb.from("profiles").upsert({ id: data.user.id, username }, { onConflict: "id" });
        }
        setSuccess(true);
      }
    } catch {
      setError("Verbindungsfehler. Bitte versuche es erneut.");
    }
    setLoading(false);
  }

  async function handleGoogle() {
    const { createClient } = await import("@/lib/supabase/client");
    const sb = createClient();
    await sb.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  if (success) return (
    <div style={{minHeight:"80vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"40px 20px"}}>
      <div style={{width:"100%",maxWidth:460,textAlign:"center"}}>
        <div style={{fontSize:48,marginBottom:20}}>✉️</div>
        <h2 style={{fontFamily:"var(--font-display)",fontSize:28,fontWeight:300,letterSpacing:"-.04em",color:TX1,marginBottom:12}}>Fast geschafft!</h2>
        <p style={{fontSize:16,color:TX2,lineHeight:1.75,marginBottom:28}}>
          Wir haben dir eine Bestätigungs-E-Mail an <strong style={{color:TX1}}>{email}</strong> geschickt.<br/>
          Klicke auf den Link um deinen Account zu aktivieren.
        </p>
        <Link href="/auth/login" className="gold-glow" style={{display:"inline-block",padding:"14px 32px",borderRadius:20,background:G,color:"#0a0808",fontSize:14,fontWeight:600,textDecoration:"none"}}>Zur Anmeldung</Link>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"80vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"40px 20px"}}>
      <div style={{width:"100%",maxWidth:460}}>
        <div style={{textAlign:"center",marginBottom:52}}>
          <div style={{fontFamily:"var(--font-display)",fontSize:32,fontWeight:300,letterSpacing:"-.09em",color:TX1,marginBottom:10}}>pokédax</div>
          <p style={{fontSize:16,color:TX2}}>Bereits <strong style={{color:TX1,fontWeight:500}}>3.841 Sammler</strong> dabei</p>
        </div>

        <div style={{background:BG1,border:`1px solid ${BR2}`,borderRadius:32,padding:"clamp(28px,5vw,48px)",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,rgba(233,168,75,0.3),transparent)`}}/>

          {/* Social proof */}
          <div style={{display:"flex",gap:8,marginBottom:24,flexWrap:"wrap"}}>
            {["✓ Kostenlos","✓ Sofort aktiv","✓ Kein Abo"].map(t=>(
              <span key={t} style={{fontSize:11.5,color:GREEN,background:"rgba(75,191,130,0.08)",border:"1px solid rgba(75,191,130,0.15)",padding:"4px 12px",borderRadius:8}}>{t}</span>
            ))}
          </div>

          <form onSubmit={handleRegister}>
            {error && (
              <div style={{background:"rgba(224,69,88,0.08)",border:"1px solid rgba(224,69,88,0.2)",borderRadius:14,padding:"12px 16px",marginBottom:20,fontSize:13.5,color:RED}}>{error}</div>
            )}
            {[
              {l:"Benutzername",t:"text",p:"DeinSammlername",v:username,set:setUsername,ac:"username"},
              {l:"E-Mail",t:"email",p:"deine@email.de",v:email,set:setEmail,ac:"email"},
              {l:"Passwort",t:"password",p:"Min. 8 Zeichen",v:password,set:setPassword,ac:"new-password"},
            ].map(f=>(
              <div key={f.l} style={{marginBottom:18}}>
                <label style={{fontSize:12,fontWeight:500,color:TX2,display:"block",marginBottom:8,letterSpacing:".04em"}}>{f.l}</label>
                <input type={f.t} placeholder={f.p} value={f.v} onChange={e=>f.set(e.target.value)} required autoComplete={f.ac}
                  style={{width:"100%",padding:"15px 20px",borderRadius:18,background:"rgba(0,0,0,0.3)",border:`1px solid ${BR2}`,color:TX1,fontSize:15,outline:"none"}}/>
              </div>
            ))}
            <button type="submit" disabled={loading} className="gold-glow" style={{
              width:"100%",padding:"17px",borderRadius:22,
              background:loading?"rgba(233,168,75,0.3)":G,
              color:loading?G:"#0a0808",
              fontSize:16,fontWeight:600,border:loading?`1px solid ${G18}`:"none",
              cursor:loading?"wait":"pointer",marginTop:4,marginBottom:16,
            }}>
              {loading ? "Registriere…" : "Kostenlos registrieren"}
            </button>
          </form>

          <div style={{display:"flex",alignItems:"center",gap:12,margin:"16px 0"}}>
            <div style={{flex:1,height:1,background:"rgba(255,255,255,0.06)"}}/><span style={{fontSize:12,color:TX3}}>oder</span><div style={{flex:1,height:1,background:"rgba(255,255,255,0.06)"}}/>
          </div>

          <button onClick={handleGoogle} style={{width:"100%",padding:"15px",borderRadius:18,background:"rgba(255,255,255,0.03)",border:`1px solid rgba(255,255,255,0.08)`,color:TX2,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Mit Google registrieren
          </button>

          <p style={{fontSize:11.5,color:TX3,textAlign:"center",marginTop:18,lineHeight:1.7}}>
            Mit der Registrierung stimmst du den <Link href="/agb" style={{color:TX2}}>AGB</Link> und der <Link href="/datenschutz" style={{color:TX2}}>Datenschutzerklärung</Link> zu.
          </p>
          <p style={{textAlign:"center",marginTop:14,fontSize:14,color:TX3}}>
            Bereits registriert? <Link href="/auth/login" style={{color:G,textDecoration:"none",fontWeight:500}}>Anmelden</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
