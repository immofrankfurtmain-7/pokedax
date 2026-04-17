"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const GOLD = "#C9A66B";
const BG   = "#0A0A0A";
const TX   = "#EDE9E0";
const TX2  = "rgba(237,233,224,0.7)";
const GD2  = "rgba(201,166,107,0.7)";

const SB = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function RegisterPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [done,     setDone]     = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    const { data, error: e1 } = await SB.auth.signUp({
      email, password,
      options: { data: { username } }
    });
    if (e1) { setError(e1.message); setLoading(false); return; }
    if (data.user) {
      try {
        await SB.from("profiles").upsert({
          id: data.user.id,
          username: username || email.split("@")[0],
        });
      } catch {}
    }
    setDone(true); setLoading(false);
  }

  if (done) return (
    <div style={{ background: BG, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;700&display=swap'); .ph{font-family:'Playfair Display',serif;letter-spacing:-0.05em;}`}</style>
      <div style={{ textAlign: "center", maxWidth: 440 }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(201,166,107,0.1)", border: "2px solid rgba(201,166,107,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 32px", fontSize: 32 }}>✦</div>
        <h1 className="ph" style={{ fontSize: 40, fontWeight: 500, color: TX, marginBottom: 16 }}>Fast fertig!</h1>
        <p style={{ fontSize: 16, color: TX2, lineHeight: 1.8, marginBottom: 32 }}>
          Bitte bestätige deine E-Mail-Adresse.<br/>Dann kannst du dich anmelden.
        </p>
        <Link href="/auth/login" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 32px", background: GOLD, color: BG, borderRadius: 100, fontSize: 15, fontWeight: 600, textDecoration: "none" }}>
          Zur Anmeldung →
        </Link>
      </div>
    </div>
  );

  return (
    <div style={{ background: BG, minHeight: "100vh", color: TX, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;700&family=Instrument+Sans:wght@400;500;600&display=swap');
        .ph { font-family:'Playfair Display',serif; letter-spacing:-0.05em; }
        .inp { width:100%; padding:16px 20px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:100px; color:#EDE9E0; font-size:15px; outline:none; font-family:inherit; transition:border-color 0.2s; }
        .inp:focus { border-color:rgba(201,166,107,0.5); }
        .inp::placeholder { color:rgba(237,233,224,0.3); }
        .btn-gold { width:100%; padding:16px; background:#C9A66B; color:#0A0A0A; border-radius:100px; border:none; font-size:15px; font-weight:700; cursor:pointer; transition:transform 0.2s,box-shadow 0.2s; }
        .btn-gold:hover { transform:scale(1.02); box-shadow:0 8px 32px rgba(201,166,107,0.3); }
        .btn-gold:disabled { opacity:0.5; cursor:not-allowed; transform:none; }
      `}</style>

      <div style={{ width: "100%", maxWidth: 440 }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <Link href="/" style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 500, letterSpacing: "-1.5px", color: TX, textDecoration: "none" }}>pokédax</Link>
        </div>

        <div style={{ background: "#111111", borderRadius: 24, padding: "40px 36px", border: "1px solid rgba(201,166,107,0.15)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: "20%", right: "20%", height: 1, background: "linear-gradient(90deg,transparent,rgba(201,166,107,0.4),transparent)" }}/>

          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: GD2, marginBottom: 12 }}>Kostenlos starten</div>
          <h1 className="ph" style={{ fontSize: 36, fontWeight: 500, marginBottom: 32, color: TX }}>Konto erstellen</h1>

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input className="inp" type="text" required minLength={3} maxLength={20}
              value={username} onChange={e => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
              placeholder="Benutzername" autoComplete="username"/>
            <input className="inp" type="email" required autoComplete="email"
              value={email} onChange={e => setEmail(e.target.value)}
              placeholder="E-Mail Adresse"/>
            <input className="inp" type="password" required minLength={8} autoComplete="new-password"
              value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Passwort (min. 8 Zeichen)"/>

            {error && (
              <div style={{ padding: "12px 16px", background: "rgba(220,74,90,0.08)", border: "1px solid rgba(220,74,90,0.2)", borderRadius: 12, fontSize: 13, color: "#dc4a5a" }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn-gold" disabled={loading} style={{ marginTop: 8 }}>
              {loading ? "Erstelle Konto…" : "Kostenlos registrieren ✦"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "rgba(237,233,224,0.5)" }}>
            Bereits registriert?{" "}
            <Link href="/auth/login" style={{ color: GOLD, textDecoration: "none", fontWeight: 600 }}>Anmelden</Link>
          </div>

          <div style={{ marginTop: 20, padding: "14px", background: "rgba(255,255,255,0.03)", borderRadius: 12, fontSize: 12, color: "rgba(237,233,224,0.3)", textAlign: "center", lineHeight: 1.6 }}>
            Kostenlos: 5 Scans/Tag · Marktplatz · Forum<br/>
            Premium ab 6,99 €/Monat für unlimitierte Scans ✦
          </div>
        </div>
      </div>
    </div>
  );
}
