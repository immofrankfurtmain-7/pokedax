"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

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

const FEATURES = [
  { icon: "⊙", title: "Unlimitierter KI-Scanner",   desc: "Scanne so viele Karten wie du willst. Free: 5/Tag.",     premium: true  },
  { icon: "◈", title: "Portfolio ROI-Tracking",      desc: "Gewinn/Verlust und ROI pro Karte in Echtzeit.",          premium: true  },
  { icon: "◉", title: "Wishlist-Alerts per E-Mail",  desc: "Sofort benachrichtigt wenn deine Wunschkarte verfügbar.", premium: true  },
  { icon: "⇄", title: "3 % statt 5 % Provision",    desc: "Spare bei jedem Verkauf auf dem Marktplatz.",             premium: true  },
  { icon: "▲", title: "Preisalarme",                 desc: "Alert wenn eine Karte deinen Zielpreis erreicht.",        premium: true  },
  { icon: "◎", title: "Preistrends & Insights",      desc: "Top Gewinner/Verlierer der Woche. Advanced Charts.",      premium: true  },
  { icon: "◫", title: "Preischeck",                  desc: "23.000+ Karten mit Live-Preisen.",                       premium: false },
  { icon: "◇", title: "Marktplatz",                  desc: "Kaufen & Verkaufen via Escrow.",                         premium: false },
  { icon: "◉", title: "Community Forum",             desc: "Diskussionen, Tipps und Trades.",                        premium: false },
  { icon: "◈", title: "Basis-Portfolio",             desc: "Sammlung verwalten und Wert berechnen.",                 premium: false },
];

export default function PremiumPage() {
  const [loading, setLoading] = useState(false);
  const [annual,  setAnnual]  = useState(false);

  async function checkout() {
    setLoading(true);
    try {
      const { data: { session } } = await SB.auth.getSession();
      if (!session) { window.location.href = "/auth/login"; return; }
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}` },
        body: JSON.stringify({ plan: annual ? "annual" : "monthly" }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {}
    setLoading(false);
  }

  return (
    <div style={{ background: BG, minHeight: "100vh", color: TX }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;700&family=Instrument+Sans:wght@400;500;600&display=swap');
        .ph { font-family:'Playfair Display',serif; letter-spacing:-0.05em; }
        .feat-row { display:flex; gap:14px; align-items:flex-start; padding:16px 0; border-bottom:1px solid rgba(255,255,255,0.05); }
        .feat-row:last-child { border-bottom:none; }
        .btn-gold { display:inline-flex; align-items:center; gap:8px; padding:18px 40px; background:#C9A66B; color:#0A0A0A; border-radius:100px; border:none; font-size:16px; font-weight:700; cursor:pointer; transition:transform 0.2s,box-shadow 0.2s; width:100%; justify-content:center; }
        .btn-gold:hover { transform:scale(1.02); box-shadow:0 12px 40px rgba(201,166,107,0.35); }
        .btn-gold:disabled { opacity:0.6; cursor:not-allowed; transform:none; }
        .toggle-bg { background:rgba(255,255,255,0.06); border-radius:100px; padding:4px; display:inline-flex; cursor:pointer; }
        .toggle-opt { padding:8px 20px; border-radius:100px; font-size:13px; font-weight:500; transition:all 0.2s; }
        .toggle-opt.active { background:#C9A66B; color:#0A0A0A; font-weight:700; }
        .toggle-opt:not(.active) { color:rgba(237,233,224,0.5); }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation:fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) both; }
      `}</style>

      {/* Hero */}
      <div style={{ textAlign: "center", padding: "clamp(80px,12vw,140px) clamp(20px,4vw,48px) clamp(60px,8vw,100px)", position: "relative", overflow: "hidden" }}>
        {/* Background glow */}
        <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: 600, height: 300, background: "radial-gradient(ellipse,rgba(201,166,107,0.08),transparent 70%)", pointerEvents: "none" }}/>

        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 20px", background: "rgba(201,166,107,0.1)", border: "1px solid rgba(201,166,107,0.25)", borderRadius: 100, fontSize: 12, fontWeight: 600, color: GOLD, marginBottom: 24, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          ✦ Premium Plan
        </div>

        <h1 className="ph fade-up" style={{ fontSize: "clamp(48px,7vw,96px)", fontWeight: 500, color: TX, lineHeight: 1, marginBottom: 24 }}>
          Für ernsthafte<br/>Sammler.
        </h1>

        <p style={{ fontSize: "clamp(16px,1.8vw,20px)", color: TX2, maxWidth: 480, margin: "0 auto 48px", lineHeight: 1.8 }}>
          Unlimitierter Scanner. Portfolio ROI. Preisalarme.<br/>
          Alles was du brauchst um deine Sammlung zu maximieren.
        </p>

        {/* Billing toggle */}
        <div style={{ marginBottom: 48 }}>
          <div className="toggle-bg" onClick={() => setAnnual(!annual)}>
            <div className={`toggle-opt${!annual ? " active" : ""}`}>Monatlich</div>
            <div className={`toggle-opt${annual ? " active" : ""}`}>
              Jährlich <span style={{ fontSize: 10, marginLeft: 4, background: "#3db87a", color: "white", padding: "1px 6px", borderRadius: 4 }}>-20%</span>
            </div>
          </div>
        </div>

        {/* Price card */}
        <div style={{ maxWidth: 420, margin: "0 auto", background: BG2, borderRadius: 32, padding: "40px 36px", border: "1px solid rgba(201,166,107,0.25)", position: "relative", overflow: "hidden", boxShadow: "0 40px 80px rgba(0,0,0,0.5)" }}>
          <div style={{ position: "absolute", top: 0, left: "15%", right: "15%", height: 1, background: "linear-gradient(90deg,transparent,rgba(201,166,107,0.5),transparent)" }}/>

          <div className="ph" style={{ fontSize: 72, fontWeight: 500, color: GOLD, lineHeight: 1, marginBottom: 4 }}>
            {annual ? "5,59" : "6,99"}
          </div>
          <div style={{ fontSize: 14, color: TX2, marginBottom: 8 }}>€ / Monat{annual ? " · Jährlich abgerechnet" : ""}</div>
          {annual && <div style={{ fontSize: 12, color: "#3db87a", marginBottom: 24 }}>Du sparst 16,80 € / Jahr</div>}

          <button onClick={checkout} disabled={loading} className="btn-gold" style={{ marginBottom: 16 }}>
            {loading ? "Weiterleitung…" : "Premium werden ✦"}
          </button>
          <div style={{ fontSize: 12, color: "rgba(237,233,224,0.35)", textAlign: "center" }}>
            Jederzeit kündbar · Keine versteckten Kosten
          </div>
        </div>
      </div>

      {/* Feature comparison */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 clamp(20px,4vw,48px) clamp(80px,10vw,140px)" }}>
        <div style={{ width: "100%", height: 1, background: "linear-gradient(90deg,transparent,rgba(201,166,107,0.2),transparent)", marginBottom: 64 }}/>

        <h2 className="ph" style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 500, textAlign: "center", marginBottom: 8 }}>Was du bekommst</h2>
        <p style={{ textAlign: "center", color: TX2, fontSize: 15, marginBottom: 48 }}>Premium Features sind mit ✦ markiert.</p>

        <div style={{ background: BG2, borderRadius: 24, overflow: "hidden", border: "1px solid rgba(201,166,107,0.15)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", padding: "12px 24px", background: "rgba(201,166,107,0.05)", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: GD2 }}>
            <div>Feature</div>
            <div style={{ textAlign: "center", width: 80 }}>Free</div>
            <div style={{ textAlign: "center", width: 80, color: GOLD }}>Premium</div>
          </div>
          {FEATURES.map(({ icon, title, desc, premium }) => (
            <div key={title} className="feat-row" style={{ padding: "0 24px", alignItems: "center" }}>
              <div style={{ flex: 1, display: "flex", gap: 12, alignItems: "center", padding: "14px 0" }}>
                <span style={{ fontSize: 16, color: premium ? GOLD : "rgba(201,166,107,0.3)", width: 20, flexShrink: 0 }}>{icon}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: TX, marginBottom: 2 }}>{title}</div>
                  <div style={{ fontSize: 12, color: "rgba(237,233,224,0.4)" }}>{desc}</div>
                </div>
              </div>
              <div style={{ textAlign: "center", width: 80, fontSize: 16, color: premium ? "rgba(237,233,224,0.2)" : "#3db87a" }}>
                {premium ? "–" : "✓"}
              </div>
              <div style={{ textAlign: "center", width: 80, fontSize: 16, color: "#3db87a" }}>✓</div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div style={{ marginTop: 64 }}>
          <h2 className="ph" style={{ fontSize: 32, fontWeight: 500, textAlign: "center", marginBottom: 40 }}>Häufige Fragen</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {[
              { q: "Kann ich jederzeit kündigen?", a: "Ja, jederzeit. Nach der Kündigung behältst du Premium bis zum Ende des Abrechnungszeitraums." },
              { q: "Welche Zahlungsmethoden gibt es?", a: "Kreditkarte, PayPal und SEPA-Lastschrift via Stripe. Sicher und verschlüsselt." },
              { q: "Gibt es eine Testphase?", a: "Kostenlose Nutzung mit 5 Scans/Tag. Premium schaltet alles frei." },
              { q: "Wie funktioniert das Escrow?", a: "Dein Geld wird von pokédax treuhänderisch gehalten und erst freigegeben wenn du den Kartenerhalt bestätigst." },
            ].map(({ q, a }) => (
              <div key={q} style={{ background: BG2, border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "20px 24px" }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: TX, marginBottom: 8 }}>{q}</div>
                <div style={{ fontSize: 14, color: TX2, lineHeight: 1.7 }}>{a}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div style={{ marginTop: 64, textAlign: "center" }}>
          <button onClick={checkout} disabled={loading} className="btn-gold" style={{ maxWidth: 400 }}>
            {loading ? "Weiterleitung…" : "Jetzt Premium werden ✦"}
          </button>
          <div style={{ marginTop: 12, fontSize: 13, color: "rgba(237,233,224,0.3)" }}>
            {annual ? "5,59 € / Monat · 67,08 € / Jahr" : "6,99 € / Monat"} · Jederzeit kündbar
          </div>
        </div>
      </div>
    </div>
  );
}
