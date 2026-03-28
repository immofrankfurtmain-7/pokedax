# PokeDax – Stripe Premium-Gating
$root = "C:\Users\lenovo\pokedax\pokedax\pokedax"
$enc  = New-Object System.Text.UTF8Encoding $true
Write-Host "PokeDax Stripe Gating..." -ForegroundColor Cyan

$dirs = @(
  "$root\src\app\api\webhooks\stripe",
  "$root\src\app\api\stripe\checkout",
  "$root\src\app\dashboard\premium",
  "$root\src\hooks",
  "$root\src\components\ui"
)
foreach ($d in $dirs) {
  if (-not (Test-Path -LiteralPath $d)) { New-Item -ItemType Directory -Path $d -Force | Out-Null }
}


$webhookRoute = @'
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

// Supabase Admin Client (Service Role - bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const body      = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook signature failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {

      // ── Zahlung erfolgreich → Premium aktivieren ──
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const userId     = session.metadata?.user_id;

        if (userId) {
          // Abo-Ende ermitteln
          let premiumUntil: string | null = null;
          if (session.subscription) {
            const sub = await stripe.subscriptions.retrieve(
              session.subscription as string
            );
            premiumUntil = new Date(
              sub.current_period_end * 1000
            ).toISOString();
          }

          await supabase.from("profiles").update({
            is_premium:          true,
            premium_until:       premiumUntil,
            stripe_customer_id:  customerId,
          }).eq("id", userId);

          console.log(`✓ Premium aktiviert für User ${userId}`);
        }
        break;
      }

      // ── Abo erneuert → Datum verlängern ──
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        if (invoice.subscription) {
          const sub = await stripe.subscriptions.retrieve(
            invoice.subscription as string
          );
          const premiumUntil = new Date(
            sub.current_period_end * 1000
          ).toISOString();

          await supabase.from("profiles").update({
            is_premium:    true,
            premium_until: premiumUntil,
          }).eq("stripe_customer_id", customerId);

          console.log(`✓ Premium verlängert für Customer ${customerId}`);
        }
        break;
      }

      // ── Zahlung fehlgeschlagen ──
      case "invoice.payment_failed": {
        const invoice    = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // Noch nicht sofort deaktivieren — Stripe versucht es mehrmals
        console.log(`⚠ Zahlung fehlgeschlagen für Customer ${customerId}`);
        break;
      }

      // ── Abo gekündigt / abgelaufen → Premium deaktivieren ──
      case "customer.subscription.deleted": {
        const sub        = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        await supabase.from("profiles").update({
          is_premium:    false,
          premium_until: null,
        }).eq("stripe_customer_id", customerId);

        console.log(`✓ Premium deaktiviert für Customer ${customerId}`);
        break;
      }

      // ── Abo pausiert ──
      case "customer.subscription.paused": {
        const sub        = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        await supabase.from("profiles").update({
          is_premium: false,
        }).eq("stripe_customer_id", customerId);
        break;
      }

      default:
        console.log(`Unhandled event: ${event.type}`);
    }
  } catch (err: any) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

'@
[System.IO.File]::WriteAllText("$root\src\app\api\webhooks\stripe\route.ts", $webhookRoute, $enc)
Write-Host "  OK: route.ts" -ForegroundColor Green

$checkoutRoute = @'
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

const PLANS = {
  premium: {
    name: "PokéDax Premium",
    price: 799, // 7,99€ in Cent
    interval: "month" as const,
  },
  dealer: {
    name: "PokéDax Händler",
    price: 1999, // 19,99€ in Cent
    interval: "month" as const,
  },
};

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });
  }

  const { plan = "premium" } = await request.json();
  const planConfig = PLANS[plan as keyof typeof PLANS] || PLANS.premium;

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id, username, email")
    .eq("id", user.id)
    .single();

  // Create or reuse Stripe customer
  let customerId = profile?.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name:  profile?.username || user.email,
      metadata: { user_id: user.id },
    });
    customerId = customer.id;

    await supabase.from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);
  }

  // Create price on the fly (or use existing Price ID from env)
  const priceId = plan === "dealer"
    ? process.env.STRIPE_PRICE_ID_DEALER
    : process.env.STRIPE_PRICE_ID_PREMIUM;

  let price: Stripe.Price;
  if (priceId) {
    price = await stripe.prices.retrieve(priceId);
  } else {
    // Create inline price (fallback if no Price ID configured)
    price = await stripe.prices.create({
      currency:     "eur",
      unit_amount:  planConfig.price,
      recurring:    { interval: planConfig.interval },
      product_data: { name: planConfig.name },
    });
  }

  const session = await stripe.checkout.sessions.create({
    customer:   customerId,
    mode:       "subscription",
    line_items: [{ price: price.id, quantity: 1 }],
    metadata:   { user_id: user.id },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/premium?success=1`,
    cancel_url:  `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/premium?canceled=1`,
    locale:      "de",
    payment_method_types: ["card", "sepa_debit"],
    subscription_data: {
      metadata: { user_id: user.id },
    },
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: session.url });
}

'@
[System.IO.File]::WriteAllText("$root\src\app\api\stripe\checkout\route.ts", $checkoutRoute, $enc)
Write-Host "  OK: route.ts" -ForegroundColor Green

$usePremium = @'
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface PremiumState {
  isPremium: boolean;
  loading:   boolean;
  userId:    string | null;
}

export function usePremium(): PremiumState {
  const [state, setState] = useState<PremiumState>({
    isPremium: false,
    loading:   true,
    userId:    null,
  });

  useEffect(() => {
    const sb = createClient();
    sb.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        setState({ isPremium: false, loading: false, userId: null });
        return;
      }
      sb.from("profiles")
        .select("is_premium, premium_until")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          // Check if premium_until is in the future
          const until = data?.premium_until
            ? new Date(data.premium_until)
            : null;
          const isPremium =
            data?.is_premium === true &&
            (until === null || until > new Date());

          setState({ isPremium, loading: false, userId: user.id });
        });
    });
  }, []);

  return state;
}

'@
[System.IO.File]::WriteAllText("$root\src\hooks\usePremium.ts", $usePremium, $enc)
Write-Host "  OK: usePremium.ts" -ForegroundColor Green

$premiumGate = @'
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

'@
[System.IO.File]::WriteAllText("$root\src\components\ui\PremiumGate.tsx", $premiumGate, $enc)
Write-Host "  OK: PremiumGate.tsx" -ForegroundColor Green

$premiumPage = @'
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

'@
[System.IO.File]::WriteAllText("$root\src\app\dashboard\premium\page.tsx", $premiumPage, $enc)
Write-Host "  OK: page.tsx" -ForegroundColor Green

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  WICHTIG: Setup-Schritte" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Stripe Dashboard:" -ForegroundColor Yellow
Write-Host "   https://dashboard.stripe.com/webhooks" -ForegroundColor White
Write-Host "   -> 'Add endpoint'" -ForegroundColor White
Write-Host "   -> URL: https://pokedax2.vercel.app/api/webhooks/stripe" -ForegroundColor White
Write-Host "   -> Events auswaehlen:" -ForegroundColor White
Write-Host "      checkout.session.completed" -ForegroundColor Gray
Write-Host "      invoice.payment_succeeded" -ForegroundColor Gray
Write-Host "      invoice.payment_failed" -ForegroundColor Gray
Write-Host "      customer.subscription.deleted" -ForegroundColor Gray
Write-Host "      customer.subscription.paused" -ForegroundColor Gray
Write-Host "   -> Webhook-Secret kopieren" -ForegroundColor White
Write-Host ""
Write-Host "2. Vercel Environment Variables:" -ForegroundColor Yellow
Write-Host "   https://vercel.com/dashboard -> Settings -> Environment Variables" -ForegroundColor White
Write-Host "   STRIPE_WEBHOOK_SECRET=whsec_..." -ForegroundColor Gray
Write-Host "   STRIPE_SECRET_KEY=sk_live_..." -ForegroundColor Gray
Write-Host "   STRIPE_PRICE_ID_PREMIUM=(optional, falls du feste Price-IDs hast)" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Dann: GitHub Desktop -> Commit & Push" -ForegroundColor Yellow
Write-Host ""
Write-Host "PremiumGate verwenden:" -ForegroundColor Cyan
Write-Host "  import PremiumGate from '@/components/ui/PremiumGate'" -ForegroundColor Gray
Write-Host "  <PremiumGate feature='Scanner' freeLimit={5} currentUse={scanCount}>" -ForegroundColor Gray
Write-Host "    <ScannerComponent />" -ForegroundColor Gray
Write-Host "  </PremiumGate>" -ForegroundColor Gray
