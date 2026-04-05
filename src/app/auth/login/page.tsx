"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export const dynamic = "force-dynamic";

const G="#E9A84B",G18="rgba(233,168,75,0.18)";
const BG1="#111113",BR2="rgba(255,255,255,0.10)";
const TX1="#f0f0f5",TX2="#a8a8b8",TX3="#6b6b7a",RED="#E04558",GREEN="#4BBF82";

export default function LoginPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const sb = createClient();
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.includes("Invalid login")) {
          setError("E-Mail oder Passwort falsch. Bitte erneut versuchen.");
        } else if (error.message.includes("Email not confirmed")) {
          setError("Bitte bestätige zuerst deine E-Mail-Adresse.");
        } else {
          setError(error.message);
        }
      } else {
        router.push("/portfolio");
        router.refresh();
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

  return (
    <div style={{
      minHeight:"80vh",display:"flex",alignItems:"center",
      justifyContent:"center",padding:"40px 20px",
    }}>
      <div style={{width:"100%",maxWidth:460}}>

        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:52}}>
          <div style={{
            fontFamily:"var(--font-display)",fontSize:32,fontWeight:300,
            letterSpacing:"-.09em",color:TX1,marginBottom:10,
          }}>pokédax</div>
          <p style={{fontSize:16,color:TX2}}>Willkommen zurück</p>
        </div>

        {/* Card */}
        <div style={{
          background:BG1,border:`1px solid ${BR2}`,
          borderRadius:32,padding:"clamp(28px,5vw,48px)",
          position:"relative",overflow:"hidden",
        }}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,rgba(233,168,75,0.3),transparent)`}}/>

          <form onSubmit={handleLogin}>
            {/* Error */}
            {error && (
              <div style={{
                background:"rgba(224,69,88,0.08)",border:"1px solid rgba(224,69,88,0.2)",
                borderRadius:14,padding:"12px 16px",marginBottom:20,
                fontSize:13.5,color:RED,
              }}>{error}</div>
            )}

            {/* Email */}
            <div style={{marginBottom:18}}>
              <label style={{fontSize:12,fontWeight:500,color:TX2,display:"block",marginBottom:8,letterSpacing:".04em"}}>E-Mail</label>
              <input
                type="email" value={email} onChange={e=>setEmail(e.target.value)}
                placeholder="deine@email.de" required autoComplete="email"
                style={{width:"100%",padding:"15px 20px",borderRadius:18,background:"rgba(0,0,0,0.3)",border:`1px solid ${BR2}`,color:TX1,fontSize:15,outline:"none"}}
              />
            </div>

            {/* Password */}
            <div style={{marginBottom:10}}>
              <label style={{fontSize:12,fontWeight:500,color:TX2,display:"block",marginBottom:8,letterSpacing:".04em"}}>Passwort</label>
              <input
                type="password" value={password} onChange={e=>setPassword(e.target.value)}
                placeholder="••••••••" required autoComplete="current-password"
                style={{width:"100%",padding:"15px 20px",borderRadius:18,background:"rgba(0,0,0,0.3)",border:`1px solid ${BR2}`,color:TX1,fontSize:15,outline:"none"}}
              />
            </div>

            <div style={{textAlign:"right",marginBottom:24}}>
              <Link href="/auth/reset" style={{fontSize:13,color:TX3,textDecoration:"none"}}>Passwort vergessen?</Link>
            </div>

            <button type="submit" disabled={loading} className="gold-glow" style={{
              width:"100%",padding:"17px",borderRadius:22,
              background:loading?"rgba(233,168,75,0.3)":G,
              color:loading?G:"#0a0808",
              fontSize:16,fontWeight:600,border:loading?`1px solid ${G18}`:"none",
              cursor:loading?"wait":"pointer",
              transition:"all .2s",
            }}>
              {loading ? "Anmelden…" : "Anmelden"}
            </button>
          </form>

          <div style={{display:"flex",alignItems:"center",gap:12,margin:"20px 0"}}>
            <div style={{flex:1,height:1,background:"rgba(255,255,255,0.06)"}}/>
            <span style={{fontSize:12,color:TX3}}>oder</span>
            <div style={{flex:1,height:1,background:"rgba(255,255,255,0.06)"}}/>
          </div>

          <button onClick={handleGoogle} style={{
            width:"100%",padding:"15px",borderRadius:18,
            background:"rgba(255,255,255,0.03)",
            border:`1px solid rgba(255,255,255,0.08)`,
            color:TX2,fontSize:14,cursor:"pointer",
            display:"flex",alignItems:"center",justifyContent:"center",gap:10,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Mit Google anmelden
          </button>

          <p style={{textAlign:"center",marginTop:24,fontSize:14,color:TX3}}>
            Noch kein Account? <Link href="/auth/register" style={{color:G,textDecoration:"none",fontWeight:500}}>Registrieren</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
