"use client";

import { useState } from "react";
import Link from "next/link";
import { Crown, Check, X, Zap, Shield, TrendingUp, Bell, Star } from "lucide-react";

const PLANS = [
  {
    id: "free", name: "Free", price: "0€", period: "für immer",
    features: [
      { ok: true,  text: "5 Scans pro Tag"      },
      { ok: true,  text: "Basis-Preischeck"      },
      { ok: true,  text: "Forum lesen"           },
      { ok: false, text: "Unlimitierter Scanner" },
      { ok: false, text: "Portfolio-Tracker"     },
      { ok: false, text: "Preis-Alerts"          },
    ],
    cta: "Kostenlos starten", ctaHref: "/auth/register", featured: false,
  },
  {
    id: "premium", name: "Premium", price: "6,99€", period: "pro Monat",
    badge: "BELIEBTESTE WAHL",
    features: [
      { ok: true, text: "Unlimitierter Pro-Scanner" },
      { ok: true, text: "Portfolio + Live-Charts"   },
      { ok: true, text: "Set-Tracker"               },
      { ok: true, text: "Interner Marktplatz"       },
      { ok: true, text: "Realtime Preis-Alerts"     },
      { ok: true, text: "Exklusive Forum-Channels"  },
      { ok: true, text: "2× Grading-Beratung/Mo"    },
      { ok: true, text: "Ad-free"                   },
    ],
    cta: "Premium werden", ctaHref: "/dashboard/premium", featured: true,
  },
  {
    id: "dealer", name: "Händler", price: "19,99€", period: "pro Monat",
    features: [
      { ok: true, text: "Alles aus Premium"             },
      { ok: true, text: "Verified Seller Badge"         },
      { ok: true, text: "Eigene Shop-Seite"             },
      { ok: true, text: "Top-Platzierung Marktplatz"    },
      { ok: true, text: "Monatliche Marktanalyse"       },
      { ok: true, text: "Priority Support 24/7"         },
      { ok: true, text: "API-Zugang (Beta)"             },
      { ok: true, text: "Unlimitierte Grading-Beratung" },
    ],
    cta: "Händler werden", ctaHref: "/dashboard/premium?plan=dealer", featured: false,
  },
];

const FEATURES = [
  { icon: <Zap size={18}/>,       label: "Pro-Scanner",       color: "#F97316" },
  { icon: <TrendingUp size={18}/>, label: "Portfolio-Tracker", color: "#22C55E" },
  { icon: <Shield size={18}/>,    label: "Set-Tracker",       color: "#00E5FF" },
  { icon: <Bell size={18}/>,      label: "Preis-Alerts",      color: "#A855F7" },
  { icon: <Star size={18}/>,      label: "Exklusiv-Forum",    color: "#FACC15" },
  { icon: <Crown size={18}/>,     label: "Grading-Beratung",  color: "#EE1515" },
];

export default function PremiumSection() {
  const [upgrading, setUpgrading] = useState<string | null>(null);

  async function handleUpgrade(planId: string) {
    setUpgrading(planId);
    try {
      const res  = await fetch("/api/stripe/checkout", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setUpgrading(null);
    }
  }

  return (
    <section style={{ padding: "56px 20px 64px" }}>
      <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(250,204,21,0.4), transparent)", marginBottom: 48 }} />

      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 14px", borderRadius: 20, marginBottom: 16, background: "rgba(250,204,21,0.1)", border: "1px solid rgba(250,204,21,0.3)" }}>
            <Crown size={12} style={{ color: "#FACC15" }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#FACC15", letterSpacing: "0.1em" }}>ELITE TRAINER LOUNGE</span>
          </div>
          <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 900, fontSize: "clamp(24px, 4vw, 38px)", letterSpacing: "-0.02em", color: "white", marginBottom: 10 }}>
            Hole das Maximum aus deiner Sammlung
          </h2>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 15, maxWidth: 480, margin: "0 auto" }}>
            Premium-Mitglieder steigern den Wert ihrer Sammlung im Schnitt um 18% im ersten Monat.
          </p>
        </div>

        {/* Feature icons */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 40 }}>
          {FEATURES.map(f => (
            <div key={f.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: `${f.color}15`, border: `1px solid ${f.color}30`, display: "flex", alignItems: "center", justifyContent: "center", color: f.color }}>{f.icon}</div>
              <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.65)" }}>{f.label}</span>
            </div>
          ))}
        </div>

        {/* Pricing cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, alignItems: "start" }}>
          {PLANS.map(plan => (
            <div key={plan.id} style={{
              background: plan.featured ? "linear-gradient(135deg, rgba(250,204,21,0.08), rgba(255,255,255,0.03))" : "rgba(255,255,255,0.03)",
              border: `1px solid ${plan.featured ? "rgba(250,204,21,0.35)" : plan.id === "dealer" ? "rgba(238,21,21,0.25)" : "rgba(255,255,255,0.08)"}`,
              borderRadius: 20,
              padding: plan.badge ? "44px 24px 28px" : "28px 24px",
              position: "relative",
            }}>
              {/* Badge at top center - OUTSIDE card padding flow */}
              {plan.badge && (
                <div style={{
                  position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
                  padding: "5px 18px", borderRadius: "0 0 10px 10px",
                  background: "#FACC15", color: "#000",
                  fontSize: 9, fontWeight: 800, letterSpacing: "0.06em",
                  whiteSpace: "nowrap",
                }}>{plan.badge}</div>
              )}

              <p style={{
                fontFamily: "Poppins, sans-serif", fontWeight: 800, fontSize: 18,
                color: plan.featured ? "#FACC15" : plan.id === "dealer" ? "#EE1515" : "white",
                marginBottom: 8,
              }}>{plan.name}</p>

              <div style={{ marginBottom: 24 }}>
                <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 900, fontSize: 40, color: "white", letterSpacing: "-0.02em" }}>{plan.price}</span>
                <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, marginLeft: 6 }}>/ {plan.period}</span>
              </div>

              <ul style={{ listStyle: "none", marginBottom: 28, display: "flex", flexDirection: "column", gap: 9 }}>
                {plan.features.map(f => (
                  <li key={f.text} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: f.ok ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.2)" }}>
                    {f.ok ? <Check size={14} style={{ color: "#22C55E", flexShrink: 0 }} /> : <X size={14} style={{ color: "rgba(255,255,255,0.15)", flexShrink: 0 }} />}
                    <span style={{ textDecoration: f.ok ? "none" : "line-through" }}>{f.text}</span>
                  </li>
                ))}
              </ul>

              {plan.id === "free" ? (
                <Link href={plan.ctaHref} style={{ display: "block", textAlign: "center", padding: "12px 0", borderRadius: 12, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.6)", fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
                  {plan.cta}
                </Link>
              ) : (
                <button onClick={() => handleUpgrade(plan.id)} disabled={upgrading === plan.id} style={{ width: "100%", padding: "13px 0", borderRadius: 12, background: plan.featured ? "linear-gradient(135deg, #FACC15, #f59e0b)" : "#EE1515", border: "none", cursor: "pointer", fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: 14, color: plan.featured ? "#000" : "white", opacity: upgrading === plan.id ? 0.7 : 1 }}>
                  {upgrading === plan.id ? "Wird geladen..." : plan.cta}
                </button>
              )}
            </div>
          ))}
        </div>

        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 12, marginTop: 20 }}>
          Alle Preise inkl. MwSt. · Monatlich kündbar · Sichere Zahlung via Stripe
        </p>
      </div>
    </section>
  );
}
