"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Crown, Check, X, Zap, Shield, TrendingUp, Bell, Star } from "lucide-react";
import { usePremium } from "@/hooks/usePremium";

const PLANS = [
  {
    id:       "free",
    name:     "Free",
    price:    "0€",
    period:   "für immer",
    color:    "rgba(255,255,255,0.1)",
    features: [
      { text: "5 Scans pro Tag",      ok: true  },
      { text: "Basis-Preischeck",     ok: true  },
      { text: "Forum lesen",          ok: true  },
      { text: "Unlimitierter Scanner",ok: false },
      { text: "Portfolio-Tracker",    ok: false },
      { text: "Preis-Alerts",         ok: false },
      { text: "Grading-Beratung",     ok: false },
    ],
    cta:      "Kostenlos starten",
    ctaStyle: "outline" as const,
  },
  {
    id:       "premium",
    name:     "Premium",
    price:    "7,99€",
    period:   "pro Monat",
    color:    "#FACC15",
    badge:    "BELIEBTESTE WAHL",
    features: [
      { text: "Unlimitierter Pro-Scanner", ok: true },
      { text: "Portfolio + Live-Charts",   ok: true },
      { text: "Set-Tracker",               ok: true },
      { text: "Interner Marktplatz",       ok: true },
      { text: "Realtime Preis-Alerts",     ok: true },
      { text: "Exklusive Forum-Channels",  ok: true },
      { text: "2× Grading-Beratung/Mo",    ok: true },
      { text: "Ad-free",                   ok: true },
    ],
    cta:      "Premium werden",
    ctaStyle: "gold" as const,
  },
  {
    id:       "dealer",
    name:     "Händler",
    price:    "19,99€",
    period:   "pro Monat",
    color:    "#EE1515",
    features: [
      { text: "Alles aus Premium",          ok: true },
      { text: "Verified Seller Badge",      ok: true },
      { text: "Eigene Shop-Seite",          ok: true },
      { text: "Top-Platzierung Marktplatz", ok: true },
      { text: "Monatliche Marktanalyse",    ok: true },
      { text: "Priority Support 24/7",      ok: true },
      { text: "API-Zugang (Beta)",          ok: true },
      { text: "Unlimitierte Grading-Beratung", ok: true },
    ],
    cta:      "Händler werden",
    ctaStyle: "red" as const,
  },
];

const FEATURES = [
  { icon: <Zap size={20} />,       title: "Pro-Scanner",        desc: "Unlimitiertes Scannen mit Condition-Erkennung und Alt-Art-Detection." },
  { icon: <TrendingUp size={20} />,title: "Portfolio-Tracker",  desc: "Live-Charts und Gewinn-/Verlustanalyse für deine gesamte Sammlung." },
  { icon: <Shield size={20} />,    title: "Set-Tracker",        desc: "Alle TCG Sets im Blick – fehlende Karten, Wert pro Set." },
  { icon: <Bell size={20} />,      title: "Preis-Alerts",       desc: "Echtzeit-Benachrichtigung wenn eine Karte deinen Zielpreis erreicht." },
  { icon: <Star size={20} />,      title: "Exklusiv-Forum",     desc: "Zugang zu Premium-Channels mit Insider-Infos und Deals." },
  { icon: <Crown size={20} />,     title: "Grading-Beratung",   desc: "KI-gestützte PSA/BGS-Empfehlung – lohnt sich das Grading?" },
];

function PremiumPageContent() {
  const searchParams          = useSearchParams();
  const { isPremium, loading } = usePremium();
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [toast, setToast]     = useState<{ type: "success" | "error"; msg: string } | null>(null);

  useEffect(() => {
    if (searchParams.get("success") === "1") {
      setToast({ type: "success", msg: "🎉 Premium aktiviert! Danke für dein Abo." });
      setTimeout(() => setToast(null), 5000);
    }
    if (searchParams.get("canceled") === "1") {
      setToast({ type: "error", msg: "Zahlung abgebrochen. Du kannst jederzeit upgraden." });
      setTimeout(() => setToast(null), 4000);
    }
  }, [searchParams]);

  async function handleUpgrade(planId: string) {
    if (planId === "free") return;
    setUpgrading(planId);
    try {
      const res  = await fetch("/api/stripe/checkout", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ plan: planId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setToast({ type: "error", msg: data.error || "Fehler beim Laden des Checkouts." });
      }
    } catch {
      setToast({ type: "error", msg: "Netzwerkfehler. Bitte erneut versuchen." });
    } finally {
      setUpgrading(null);
    }
  }

  return (
    <div style={{ background: "transparent", minHeight: "100vh", color: "white" }}>
      <div style={{ height: 2, background: "linear-gradient(90deg, transparent, #FACC15 30%, #FACC15 70%, transparent)" }} />

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 80, left: "50%", transform: "translateX(-50%)",
          zIndex: 100, padding: "12px 24px", borderRadius: 12,
          background: toast.type === "success" ? "rgba(34,197,94,0.15)" : "rgba(238,21,21,0.15)",
          border: `1px solid ${toast.type === "success" ? "rgba(34,197,94,0.4)" : "rgba(238,21,21,0.4)"}`,
          color: toast.type === "success" ? "#22C55E" : "#EE1515",
          fontSize: 14, fontWeight: 600, whiteSpace: "nowrap",
        }}>
          {toast.msg}
        </div>
      )}

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 20px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "4px 14px", borderRadius: 20, marginBottom: 16,
            background: "rgba(250,204,21,0.1)", border: "1px solid rgba(250,204,21,0.3)",
          }}>
            <Crown size={12} style={{ color: "#FACC15" }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#FACC15", letterSpacing: "0.1em" }}>
              ELITE TRAINER LOUNGE
            </span>
          </div>
          <h1 style={{
            fontFamily: "Poppins, sans-serif", fontWeight: 900,
            fontSize: "clamp(28px, 5vw, 44px)", letterSpacing: "-0.02em", marginBottom: 12,
          }}>
            Maximiere deine Sammlung
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 15, maxWidth: 480, margin: "0 auto" }}>
            Premium-Mitglieder steigern den Wert ihrer Sammlung im Schnitt um 18% im ersten Monat.
          </p>

          {isPremium && !loading && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8, marginTop: 16,
              padding: "8px 20px", borderRadius: 20,
              background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)",
              color: "#22C55E", fontSize: 14, fontWeight: 600,
            }}>
              <Check size={16} />
              Du bist bereits Premium-Mitglied!
            </div>
          )}
        </div>

        {/* Feature Grid */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 16, marginBottom: 56,
        }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 16, padding: "20px",
              display: "flex", gap: 14, alignItems: "flex-start",
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                background: "rgba(250,204,21,0.1)", border: "1px solid rgba(250,204,21,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#FACC15",
              }}>{f.icon}</div>
              <div>
                <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: 14, color: "white", marginBottom: 4 }}>
                  {f.title}
                </p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing Cards */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 16, marginBottom: 32,
        }}>
          {PLANS.map(plan => (
            <div key={plan.id} style={{
              background: plan.id === "premium"
                ? "linear-gradient(135deg, rgba(250,204,21,0.08), rgba(255,255,255,0.03))"
                : "rgba(255,255,255,0.03)",
              border: `1px solid ${plan.id === "premium" ? "rgba(250,204,21,0.35)" : "rgba(255,255,255,0.08)"}`,
              borderRadius: 20, padding: "28px 24px",
              position: "relative", overflow: "hidden",
            }}>
              {plan.badge && (
                <div style={{
                  position: "absolute", top: 12, right: 12,
                  padding: "3px 10px", borderRadius: 20,
                  background: "#FACC15", color: "#000",
                  fontSize: 9, fontWeight: 800, letterSpacing: "0.05em",
                }}>
                  {plan.badge}
                </div>
              )}

              <p style={{
                fontFamily: "Poppins, sans-serif", fontWeight: 800, fontSize: 20,
                color: plan.color === "rgba(255,255,255,0.1)" ? "white" : plan.color,
                marginBottom: 4,
              }}>{plan.name}</p>

              <div style={{ marginBottom: 20 }}>
                <span style={{
                  fontFamily: "Poppins, sans-serif", fontWeight: 900, fontSize: 36,
                  color: "white",
                }}>{plan.price}</span>
                <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, marginLeft: 6 }}>
                  / {plan.period}
                </span>
              </div>

              <ul style={{ listStyle: "none", marginBottom: 24, display: "flex", flexDirection: "column", gap: 8 }}>
                {plan.features.map(f => (
                  <li key={f.text} style={{
                    display: "flex", alignItems: "center", gap: 8,
                    color: f.ok ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.2)",
                    fontSize: 13,
                  }}>
                    {f.ok
                      ? <Check size={14} style={{ color: "#22C55E", flexShrink: 0 }} />
                      : <X     size={14} style={{ color: "rgba(255,255,255,0.15)", flexShrink: 0 }} />
                    }
                    <span style={{ textDecoration: f.ok ? "none" : "line-through" }}>{f.text}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={upgrading === plan.id || (plan.id !== "free" && isPremium)}
                style={{
                  width: "100%", padding: "12px 0", borderRadius: 12,
                  fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: 14,
                  cursor: plan.id === "free" || (isPremium && plan.id !== "free") ? "not-allowed" : "pointer",
                  opacity: upgrading === plan.id ? 0.7 : 1,
                  background: plan.ctaStyle === "gold"
                    ? "linear-gradient(135deg, #FACC15, #f59e0b)"
                    : plan.ctaStyle === "red"
                    ? "#EE1515"
                    : "rgba(255,255,255,0.06)",
                  border: plan.ctaStyle === "outline"
                    ? "1px solid rgba(255,255,255,0.15)"
                    : "none",
                  color: plan.ctaStyle === "gold" ? "#000" : "white",
                }}
              >
                {upgrading === plan.id
                  ? "Wird geladen..."
                  : isPremium && plan.id !== "free"
                  ? "Bereits aktiv"
                  : plan.cta}
              </button>
            </div>
          ))}
        </div>

        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 12 }}>
          Alle Preise inkl. MwSt. · Monatlich kündbar · Sichere Zahlung via Stripe
        </p>
      </div>
    </div>
  );
}

export default function PremiumPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh" }} />}>
      <PremiumPageContent />
    </Suspense>
  );
}
