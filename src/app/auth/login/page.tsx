"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    const sb = createClient();
    const { error: e2 } = await sb.auth.signInWithPassword({ email, password });
    if (e2) { setError(e2.message); setLoading(false); return; }
    router.push("/dashboard");
  }

  return (
    <div style={{ background:"#0A0A0A", minHeight:"100vh", color:"#EDE9E0", display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 20px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;700&display=swap');
        .ph { font-family:'Playfair Display',serif; letter-spacing:-0.05em; }
        .input-dark { width:100%; padding:16px 20px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:100px; color:#EDE9E0; font-size:15px; outline:none; transition:border-color 0.2s; font-family:inherit; }
        .input-dark:focus { border-color:rgba(201,166,107,0.5); }
        .input-dark::placeholder { color:rgba(237,233,224,0.3); }
        .btn-gold { width:100%; padding:16px; background:#C9A66B; color:#0A0A0A; border-radius:100px; border:none; font-size:15px; font-weight:600; cursor:pointer; transition:transform 0.2s,box-shadow 0.2s; }
        .btn-gold:hover { transform:scale(1.02); box-shadow:0 8px 32px rgba(201,166,107,0.3); }
        .btn-gold:disabled { opacity:0.5; cursor:not-allowed; transform:none; }
      `}</style>

      <div style={{ width:"100%", maxWidth:420 }}>
        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:48 }}>
          <Link href="/" style={{ fontFamily:"'Playfair Display',serif", fontSize:32, fontWeight:500, letterSpacing:"-1.5px", color:"#EDE9E0", textDecoration:"none" }}>
            pokédax
          </Link>
        </div>

        <div style={{ background:"#111111", borderRadius:24, padding:"40px 36px", border:"1px solid rgba(201,166,107,0.15)", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:0, left:"20%", right:"20%", height:1, background:"linear-gradient(90deg,transparent,rgba(201,166,107,0.4),transparent)" }}/>

          <div style={{ fontSize:11, fontWeight:600, letterSpacing:"0.16em", textTransform:"uppercase", color:"rgba(201,166,107,0.7)", marginBottom:12 }}>Willkommen zurück</div>
          <h1 className="ph" style={{ fontSize:36, fontWeight:500, marginBottom:32, color:"#EDE9E0" }}>Anmelden</h1>

          <form onSubmit={submit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <input className="input-dark" type="email" required autoComplete="email"
              value={email} onChange={e => setEmail(e.target.value)} placeholder="E-Mail Adresse"/>
            <input className="input-dark" type="password" required autoComplete="current-password"
              value={password} onChange={e => setPassword(e.target.value)} placeholder="Passwort"/>

            {error && (
              <div style={{ padding:"12px 16px", background:"rgba(220,74,90,0.08)", border:"1px solid rgba(220,74,90,0.2)", borderRadius:12, fontSize:13, color:"#dc4a5a" }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn-gold" disabled={loading} style={{ marginTop:8 }}>
              {loading ? "Anmelden…" : "Anmelden ✦"}
            </button>
          </form>

          <div style={{ textAlign:"center", marginTop:24, fontSize:14, color:"rgba(237,233,224,0.5)" }}>
            Noch kein Account?{" "}
            <Link href="/auth/register" style={{ color:"#C9A66B", textDecoration:"none", fontWeight:600 }}>
              Kostenlos registrieren
            </Link>
          </div>
        </div>

        <div style={{ textAlign:"center", marginTop:20, fontSize:12, color:"rgba(237,233,224,0.25)" }}>
          Sicher · Verschlüsselt · Keine Werbung
        </div>
      </div>
    </div>
  );
}
