"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const G="#C9A66B",G18="rgba(201,166,107,0.18)",G08="rgba(201,166,107,0.08)";
const BG1="#16161A",BG2="#1C1C21",BR1="rgba(255,255,255,0.045)",BR2="rgba(255,255,255,0.085)";
const TX1="#F8F6F2",TX2="#BEB9B0",TX3="#6E6B66",GREEN="#3db87a";

const FEATURES = [
  "Marktplatz: Kaufen, Verkaufen, Inserieren",
  "KI-Scanner unlimitiert (Free: 5/Tag)",
  "Wishlist-Matching mit E-Mail-Benachrichtigung",
  "Portfolio-Analytics & Preistrends",
  "Niedrigere Marktplatz-Provision (3% statt 5%)",
  "Premium-Badge auf deinem Profil",
  "Früher Zugang zu neuen Features",
];

export default function PremiumPage() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  async function subscribe() {
    setLoading(true);
    setError("");
    const sb = createClient();
    const { data: { session } } = await sb.auth.getSession();
    if (!session) { window.location.href = "/auth/login?redirect=/dashboard/premium"; return; }
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}` },
      body: JSON.stringify({ plan: "premium" }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else { setError(data.error ?? "Fehler beim Checkout."); setLoading(false); }
  }

  return (
    <div style={{ color: TX1, minHeight: "80vh" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "clamp(52px,7vw,80px) clamp(16px,3vw,28px)" }}>
        <div style={{ marginBottom: "clamp(32px,5vw,52px)", textAlign: "center" }}>
          <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: G, marginBottom: 16 }}>✦ Premium</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px,5vw,52px)", fontWeight: 200, letterSpacing: "-.055em", marginBottom: 12 }}>
            Für ernsthafte Sammler.
          </h1>
          <p style={{ fontSize: 14, color: TX3, lineHeight: 1.7 }}>Alles was du brauchst um deine Sammlung professionell zu verwalten und zu handeln.</p>
        </div>

        <div style={{ background: `linear-gradient(135deg,rgba(201,166,107,0.08),${BG1})`, border: `0.5px solid ${G18}`, borderRadius: 22, padding: "32px", marginBottom: 14, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 0.5, background: `linear-gradient(90deg,transparent,${G},transparent)` }}/>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 24 }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 48, fontWeight: 200, letterSpacing: "-.06em", color: G, lineHeight: 1 }}>6,99</div>
            <div style={{ fontSize: 16, color: TX3 }}>€ / Monat</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
            {FEATURES.map(f => (
              <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ color: GREEN, fontSize: 12, marginTop: 1, flexShrink: 0 }}>✓</span>
                <span style={{ fontSize: 13, color: TX2 }}>{f}</span>
              </div>
            ))}
          </div>
          {error && <div style={{ fontSize: 12, color: "#dc4a5a", marginBottom: 12 }}>{error}</div>}
          <button onClick={subscribe} disabled={loading} style={{ width: "100%", padding: "14px", borderRadius: 14, background: G, color: "#0A0A0C", fontSize: 15, fontWeight: 400, border: "none", cursor: loading ? "wait" : "pointer", boxShadow: `0 4px 24px rgba(201,166,107,0.25)`, opacity: loading ? 0.7 : 1 }}>
            {loading ? "Weiterleitung…" : "Jetzt Premium werden ✦"}
          </button>
          <div style={{ fontSize: 11, color: TX3, textAlign: "center", marginTop: 12 }}>Jederzeit kündbar · Sichere Zahlung via Stripe</div>
        </div>

        <div style={{ background: BG1, border: `0.5px solid ${BR2}`, borderRadius: 14, padding: "16px", textAlign: "center" }}>
          <div style={{ fontSize: 12, color: TX3, marginBottom: 6 }}>Du hast bereits Premium?</div>
          <Link href="/dashboard" style={{ fontSize: 13, color: G, textDecoration: "none" }}>Zum Dashboard →</Link>
        </div>
      </div>
    </div>
  );
}
