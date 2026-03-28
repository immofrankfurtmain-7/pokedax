"use client";

import { useState } from "react";
import Link from "next/link";
import { Crown, Lock, Zap } from "lucide-react";
import { usePremium } from "@/hooks/usePremium";

interface Props {
  children:    React.ReactNode;
  feature?:    string;
  freeLimit?:  number; // z.B. 5 für "5 Scans/Tag"
  currentUse?: number;
  fallback?:   React.ReactNode; // Custom fallback statt Standard-Gate
}

export default function PremiumGate({
  children,
  feature    = "dieses Feature",
  freeLimit,
  currentUse = 0,
  fallback,
}: Props) {
  const { isPremium, loading } = usePremium();
  const [upgrading, setUpgrading] = useState(false);

  // Still loading - show children (optimistic)
  if (loading) return <>{children}</>;

  // Has premium - show content
  if (isPremium) return <>{children}</>;

  // Free limit not reached yet - show content
  if (freeLimit !== undefined && currentUse < freeLimit) {
    return <>{children}</>;
  }

  // Custom fallback
  if (fallback) return <>{fallback}</>;

  async function handleUpgrade(plan = "premium") {
    setUpgrading(true);
    try {
      const res  = await fetch("/api/stripe/checkout", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setUpgrading(false);
    }
  }

  return (
    <div
      style={{
        background:   "linear-gradient(135deg, rgba(250,204,21,0.06), rgba(238,21,21,0.04))",
        border:       "1px solid rgba(250,204,21,0.25)",
        borderRadius: 20,
        padding:      "32px 24px",
        textAlign:    "center",
      }}
    >
      {/* Lock icon */}
      <div
        style={{
          width:          56, height: 56, borderRadius: "50%",
          background:     "rgba(250,204,21,0.1)",
          border:         "1px solid rgba(250,204,21,0.3)",
          display:        "flex", alignItems: "center", justifyContent: "center",
          margin:         "0 auto 16px",
        }}
      >
        <Lock size={24} style={{ color: "#FACC15" }} />
      </div>

      <h3
        style={{
          fontFamily:    "Poppins, sans-serif", fontWeight: 800, fontSize: 18,
          color:         "white", marginBottom: 8, letterSpacing: "-0.01em",
        }}
      >
        Premium Feature
      </h3>

      <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, marginBottom: 8, lineHeight: 1.5 }}>
        {freeLimit !== undefined
          ? `Du hast dein tägliches Limit von ${freeLimit} ${feature} erreicht.`
          : `${feature} ist nur für Premium-Mitglieder verfügbar.`}
      </p>

      {freeLimit !== undefined && (
        <div
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: 8, marginBottom: 20,
          }}
        >
          <div
            style={{
              height: 4, borderRadius: 2, flex: 1, maxWidth: 200,
              background: "rgba(255,255,255,0.1)", overflow: "hidden",
            }}
          >
            <div
              style={{
                height:  "100%",
                width:   `${Math.min(100, (currentUse / freeLimit) * 100)}%`,
                background: currentUse >= freeLimit ? "#EE1515" : "#FACC15",
                borderRadius: 2,
              }}
            />
          </div>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
            {currentUse}/{freeLimit}
          </span>
        </div>
      )}

      {/* Upgrade buttons */}
      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
        <button
          onClick={() => handleUpgrade("premium")}
          disabled={upgrading}
          style={{
            display:      "flex", alignItems: "center", gap: 8,
            padding:      "10px 20px", borderRadius: 12,
            background:   "linear-gradient(135deg, #FACC15, #f59e0b)",
            border:       "none", cursor: upgrading ? "not-allowed" : "pointer",
            fontFamily:   "Poppins, sans-serif", fontWeight: 700, fontSize: 14,
            color:        "#000",
            opacity:      upgrading ? 0.7 : 1,
          }}
        >
          <Crown size={16} />
          {upgrading ? "Wird geladen..." : "Premium – 7,99€/Mo"}
        </button>

        <Link
          href="/dashboard/premium"
          style={{
            display:      "flex", alignItems: "center", gap: 6,
            padding:      "10px 16px", borderRadius: 12,
            background:   "rgba(255,255,255,0.05)",
            border:       "1px solid rgba(255,255,255,0.12)",
            color:        "rgba(255,255,255,0.5)", fontSize: 13,
            textDecoration: "none",
          }}
        >
          Alle Pläne ansehen
        </Link>
      </div>

      <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, marginTop: 12 }}>
        Monatlich kündbar · Sichere Zahlung via Stripe
      </p>
    </div>
  );
}
