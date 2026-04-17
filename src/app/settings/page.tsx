"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const GOLD = "#C9A66B";
const BG   = "#0A0A0A";
const BG2  = "#111111";
const TX   = "#EDE9E0";
const TX2  = "rgba(237,233,224,0.7)";
const GD2  = "rgba(201,166,107,0.7)";

const SB = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SettingsPage() {
  const router = useRouter();
  const [user,        setUser]        = useState<any>(null);
  const [username,    setUsername]    = useState("");
  const [email,       setEmail]       = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading,     setLoading]     = useState(false);
  const [msg,         setMsg]         = useState("");
  const [tab,         setTab]         = useState<"profile"|"security"|"notifications">("profile");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await SB.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      setUser(user);
      setEmail(user.email ?? "");
      const { data: profile } = await SB.from("profiles").select("username").eq("id", user.id).single();
      if (profile) setUsername(profile.username ?? "");
    }
    load();
  }, []);

  async function saveProfile() {
    setLoading(true); setMsg("");
    try {
      await SB.from("profiles").update({ username }).eq("id", user.id);
      setMsg("✓ Profil gespeichert");
    } catch (e: any) { setMsg("Fehler: " + e.message); }
    setLoading(false);
  }

  async function changePassword() {
    if (!newPassword || newPassword.length < 8) { setMsg("Passwort muss min. 8 Zeichen haben."); return; }
    setLoading(true); setMsg("");
    const { error } = await SB.auth.updateUser({ password: newPassword });
    if (error) setMsg("Fehler: " + error.message);
    else { setMsg("✓ Passwort geändert"); setNewPassword(""); }
    setLoading(false);
  }

  async function signOut() {
    await SB.auth.signOut();
    router.push("/");
  }

  return (
    <div style={{ background: BG, minHeight: "100vh", color: TX }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;700&family=Instrument+Sans:wght@400;500;600&display=swap');
        .ph { font-family:'Playfair Display',serif; letter-spacing:-0.05em; }
        .inp { width:100%; padding:14px 18px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:12px; color:#EDE9E0; font-size:15px; outline:none; font-family:inherit; transition:border-color 0.2s; }
        .inp:focus { border-color:rgba(201,166,107,0.4); }
        .inp::placeholder { color:rgba(237,233,224,0.3); }
        .tab-btn { padding:10px 22px; border-radius:100px; border:1px solid transparent; font-size:13px; cursor:pointer; transition:all 0.2s; background:transparent; }
        .tab-btn.active { background:rgba(201,166,107,0.1); border-color:rgba(201,166,107,0.3); color:#C9A66B; font-weight:600; }
        .tab-btn:not(.active) { color:rgba(237,233,224,0.5); }
        .btn-gold { padding:13px 28px; background:#C9A66B; color:#0A0A0A; border-radius:100px; border:none; font-size:14px; font-weight:600; cursor:pointer; transition:transform 0.2s; }
        .btn-gold:hover { transform:scale(1.02); }
        .btn-gold:disabled { opacity:0.5; cursor:not-allowed; }
        .section { background:#111111; border:1px solid rgba(255,255,255,0.07); border-radius:20px; padding:28px; margin-bottom:16px; }
        .danger-btn { padding:12px 24px; background:transparent; border:1px solid rgba(220,74,90,0.3); color:#dc4a5a; border-radius:100px; font-size:13px; cursor:pointer; transition:all 0.2s; }
        .danger-btn:hover { background:rgba(220,74,90,0.08); border-color:rgba(220,74,90,0.5); }
      `}</style>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "clamp(60px,8vw,100px) clamp(20px,4vw,48px)" }}>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: GD2, marginBottom: 16 }}>Account</div>
          <h1 className="ph" style={{ fontSize: "clamp(36px,5vw,60px)", fontWeight: 500, color: TX, lineHeight: 1 }}>
            Einstellungen
          </h1>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
          {(["profile","security","notifications"] as const).map(t => (
            <button key={t} className={`tab-btn${tab===t?" active":""}`} onClick={() => { setTab(t); setMsg(""); }}>
              {t==="profile"?"Profil":t==="security"?"Sicherheit":"Benachrichtigungen"}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {tab === "profile" && (
          <>
            <div className="section">
              <div style={{ fontSize: 14, fontWeight: 600, color: TX, marginBottom: 20 }}>Profil-Informationen</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: GD2, marginBottom: 8 }}>Benutzername</label>
                  <input className="inp" value={username} onChange={e => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))} placeholder="benutzername"/>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: GD2, marginBottom: 8 }}>E-Mail</label>
                  <input className="inp" value={email} disabled style={{ opacity: 0.5, cursor: "not-allowed" }}/>
                  <div style={{ fontSize: 11, color: "rgba(237,233,224,0.3)", marginTop: 4 }}>E-Mail kann nicht geändert werden.</div>
                </div>
              </div>
              <div style={{ marginTop: 20 }}>
                <button className="btn-gold" onClick={saveProfile} disabled={loading}>{loading ? "Speichere…" : "Änderungen speichern"}</button>
              </div>
            </div>

            {msg && <div style={{ padding: "12px 16px", borderRadius: 12, background: msg.startsWith("✓") ? "rgba(61,184,122,0.08)" : "rgba(220,74,90,0.08)", border: `1px solid ${msg.startsWith("✓") ? "rgba(61,184,122,0.2)" : "rgba(220,74,90,0.2)"}`, fontSize: 13, color: msg.startsWith("✓") ? "#3db87a" : "#dc4a5a", marginBottom: 16 }}>{msg}</div>}

            <div className="section">
              <div style={{ fontSize: 14, fontWeight: 600, color: TX, marginBottom: 8 }}>Account löschen</div>
              <div style={{ fontSize: 13, color: TX2, marginBottom: 16, lineHeight: 1.6 }}>Alle deine Daten werden unwiderruflich gelöscht.</div>
              <button className="danger-btn">Account löschen</button>
            </div>
          </>
        )}

        {/* Security Tab */}
        {tab === "security" && (
          <>
            <div className="section">
              <div style={{ fontSize: 14, fontWeight: 600, color: TX, marginBottom: 20 }}>Passwort ändern</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: GD2, marginBottom: 8 }}>Neues Passwort</label>
                  <input className="inp" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min. 8 Zeichen" autoComplete="new-password"/>
                </div>
              </div>
              <div style={{ marginTop: 20 }}>
                <button className="btn-gold" onClick={changePassword} disabled={loading}>{loading ? "Speichere…" : "Passwort ändern"}</button>
              </div>
            </div>

            {msg && <div style={{ padding: "12px 16px", borderRadius: 12, background: msg.startsWith("✓") ? "rgba(61,184,122,0.08)" : "rgba(220,74,90,0.08)", border: `1px solid ${msg.startsWith("✓") ? "rgba(61,184,122,0.2)" : "rgba(220,74,90,0.2)"}`, fontSize: 13, color: msg.startsWith("✓") ? "#3db87a" : "#dc4a5a", marginBottom: 16 }}>{msg}</div>}

            <div className="section">
              <div style={{ fontSize: 14, fontWeight: 600, color: TX, marginBottom: 8 }}>Sitzung</div>
              <div style={{ fontSize: 13, color: TX2, marginBottom: 16 }}>Auf allen Geräten abmelden.</div>
              <button className="danger-btn" onClick={signOut}>Abmelden</button>
            </div>
          </>
        )}

        {/* Notifications Tab */}
        {tab === "notifications" && (
          <div className="section">
            <div style={{ fontSize: 14, fontWeight: 600, color: TX, marginBottom: 20 }}>E-Mail-Benachrichtigungen</div>
            {[
              { label: "Wishlist-Matches", desc: "Wenn eine Wunschkarte verfügbar wird", enabled: true },
              { label: "Preisalarme",      desc: "Wenn eine Karte deinen Zielpreis erreicht", enabled: true },
              { label: "Marktplatz",       desc: "Käufer-/Verkäufer-Benachrichtigungen", enabled: true },
              { label: "Newsletter",       desc: "Wöchentliche Trending-Karten Zusammenfassung", enabled: false },
            ].map(({ label, desc, enabled }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: TX, marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 12, color: "rgba(237,233,224,0.4)" }}>{desc}</div>
                </div>
                <div style={{ width: 44, height: 24, borderRadius: 100, background: enabled ? "rgba(201,166,107,0.2)" : "rgba(255,255,255,0.08)", border: `1px solid ${enabled ? "rgba(201,166,107,0.4)" : "rgba(255,255,255,0.1)"}`, cursor: "pointer", position: "relative", transition: "all 0.2s", flexShrink: 0 }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: enabled ? GOLD : "rgba(255,255,255,0.3)", position: "absolute", top: 2, left: enabled ? 22 : 3, transition: "all 0.2s" }}/>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
