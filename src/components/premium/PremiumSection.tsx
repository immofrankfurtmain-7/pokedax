"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X, Crown, Zap, TrendingUp, Shield, Bell, Star } from "lucide-react";

const PLANS = [
  {
    id: "free", name: "Free Trainer",
    rarity: "Common", raritySymbol: "●", hp: 40, type: "Colorless",
    price: "0€", period: "für immer",
    gradient: "linear-gradient(160deg, #1a1a1a 0%, #222 100%)",
    border: "rgba(156,163,175,0.25)", glow: "rgba(156,163,175,0.1)", typeColor: "#9CA3AF",
    features: [
      { ok:true,  text:"5 Scans pro Tag"      },
      { ok:true,  text:"Basis-Preischeck"      },
      { ok:true,  text:"Forum lesen"           },
      { ok:false, text:"Unlimitierter Scanner" },
      { ok:false, text:"Portfolio-Tracker"     },
      { ok:false, text:"Preis-Alerts"          },
    ],
    cta:"Kostenlos starten", ctaHref:"/auth/register", ctaStyle:"gray", dots:1,
  },
  {
    id: "premium", name: "Premium Trainer",
    rarity: "Illustration Rare", raritySymbol: "✦", hp: 180, type: "Psychic",
    badge: "BELIEBTESTE WAHL",
    price: "6,99€", period: "pro Monat",
    gradient: "linear-gradient(160deg, #0d0a2e 0%, #1a1040 50%, #0d0820 100%)",
    border: "rgba(168,85,247,0.5)", glow: "rgba(168,85,247,0.2)", typeColor: "#A855F7",
    features: [
      { ok:true, text:"Unlimitierter Pro-Scanner" },
      { ok:true, text:"Portfolio + Live-Charts"   },
      { ok:true, text:"Set-Tracker"               },
      { ok:true, text:"Interner Marktplatz"       },
      { ok:true, text:"Realtime Preis-Alerts"     },
      { ok:true, text:"Exklusive Forum-Channels"  },
      { ok:true, text:"2× Grading-Beratung/Mo"    },
      { ok:true, text:"Ad-free"                   },
    ],
    cta:"Illustration Rare ziehen ✦", ctaHref:"/dashboard/premium", ctaStyle:"purple", dots:4,
  },
  {
    id: "dealer", name: "Ultra Händler",
    rarity: "Hyper Rare", raritySymbol: "✦✦✦", hp: 340, type: "Dragon",
    price: "19,99€", period: "pro Monat",
    gradient: "linear-gradient(160deg, #1a1000 0%, #2d1f00 40%, #1a0d00 100%)",
    border: "rgba(250,204,21,0.6)", glow: "rgba(250,204,21,0.25)", typeColor: "#FACC15",
    features: [
      { ok:true, text:"Alles aus Premium"             },
      { ok:true, text:"Verified Seller Badge ✅"      },
      { ok:true, text:"Eigene Shop-Seite"             },
      { ok:true, text:"Top-Platzierung Marktplatz"    },
      { ok:true, text:"Monatliche Marktanalyse"       },
      { ok:true, text:"Priority Support 24/7"         },
      { ok:true, text:"API-Zugang (Beta)"             },
      { ok:true, text:"Unlimitierte Grading-Beratung" },
    ],
    cta:"Hyper Rare sichern ✦✦✦", ctaHref:"/dashboard/premium?plan=dealer", ctaStyle:"gold", dots:6,
  },
] as const;

const FEATURES = [
  { icon:<Zap size={15}/>,        label:"Pro-Scanner",      color:"#F97316" },
  { icon:<TrendingUp size={15}/>, label:"Portfolio",        color:"#22C55E" },
  { icon:<Shield size={15}/>,     label:"Set-Tracker",      color:"#00E5FF" },
  { icon:<Bell size={15}/>,       label:"Preis-Alerts",     color:"#A855F7" },
  { icon:<Star size={15}/>,       label:"Exklusiv-Forum",   color:"#FACC15" },
  { icon:<Crown size={15}/>,      label:"Grading-Beratung", color:"#EE1515" },
];

function HoloCard({ plan }: { plan: typeof PLANS[number] }) {
  const [hover, setHover] = useState(false);
  const [upgrading, setUpgrading] = useState(false);

  async function handleUpgrade() {
    if (plan.id === "free") return;
    setUpgrading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ plan: plan.id }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally { setUpgrading(false); }
  }

  const isGold   = plan.id === "dealer";
  const isPurple = plan.id === "premium";

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position:"relative", borderRadius:20, overflow:"hidden",
        background: plan.gradient,
        border: `1px solid ${plan.border}`,
        boxShadow: hover
          ? `0 24px 60px ${plan.glow}, 0 0 0 1px ${plan.border}`
          : `0 4px 24px ${plan.glow}`,
        transition:"transform .25s, box-shadow .25s",
        transform: hover ? "translateY(-8px)" : "translateY(0)",
      }}
    >
      {/* Badge */}
      {"badge" in plan && (plan as any).badge && (
        <div style={{
          position:"absolute", top:0, left:"50%", transform:"translateX(-50%)",
          padding:"4px 16px", borderRadius:"0 0 10px 10px",
          background: plan.typeColor, color:"#000",
          fontSize:9, fontWeight:800, letterSpacing:"0.08em", zIndex:3, whiteSpace:"nowrap",
        }}>{(plan as any).badge}</div>
      )}

      {/* Shimmer */}
      <div style={{
        position:"absolute", inset:0, zIndex:1, pointerEvents:"none",
        background: hover
          ? `linear-gradient(125deg, transparent 20%, rgba(255,255,255,0.06) 45%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.06) 55%, transparent 80%)`
          : "transparent",
        transition:"background .3s",
      }} />

      {/* Texture for special cards */}
      {(isGold || isPurple) && (
        <div style={{
          position:"absolute", inset:0, zIndex:1, pointerEvents:"none",
          backgroundImage: isGold
            ? `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(250,204,21,0.025) 10px, rgba(250,204,21,0.025) 20px)`
            : `repeating-linear-gradient(135deg, transparent, transparent 8px, rgba(168,85,247,0.03) 8px, rgba(168,85,247,0.03) 16px)`,
        }} />
      )}

      <div style={{ position:"relative", zIndex:2, padding:"badge" in plan && (plan as any).badge ? "36px 22px 22px" : "22px" }}>

        {/* Top bar */}
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
          <div style={{ display:"flex", alignItems:"center", gap:5 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:plan.typeColor, boxShadow:`0 0 6px ${plan.glow}` }} />
            <span style={{ fontSize:9, fontWeight:700, color:plan.typeColor, letterSpacing:"0.1em" }}>{plan.type}</span>
          </div>
          <span style={{ fontSize:9, fontWeight:600, color:"rgba(255,255,255,0.35)" }}>HP {plan.hp}</span>
        </div>

        {/* Name */}
        <h3 style={{
          fontFamily:"Poppins, sans-serif", fontWeight:900, fontSize:19,
          letterSpacing:"-0.01em", lineHeight:1.1, marginBottom:4,
          background: isGold ? "linear-gradient(135deg,#FACC15,#f59e0b)" : isPurple ? "linear-gradient(135deg,#C084FC,#A855F7)" : undefined,
          WebkitBackgroundClip: (isGold||isPurple) ? "text" : undefined,
          WebkitTextFillColor: (isGold||isPurple) ? "transparent" : "rgba(255,255,255,0.85)",
        }}>{plan.name}</h3>
        <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:16 }}>
          <span style={{ fontSize:12, color:plan.typeColor, fontWeight:800 }}>{plan.raritySymbol}</span>
          <span style={{ fontSize:9, color:"rgba(255,255,255,0.25)" }}>{plan.rarity}</span>
        </div>

        {/* Divider */}
        <div style={{ height:1, background:`linear-gradient(90deg,transparent,${plan.border},transparent)`, marginBottom:14 }} />

        {/* Price */}
        <div style={{ marginBottom:18 }}>
          <span style={{ fontFamily:"Poppins,sans-serif", fontWeight:900, fontSize:34, color:"white", letterSpacing:"-0.03em" }}>{plan.price}</span>
          <span style={{ fontSize:12, color:"rgba(255,255,255,0.3)", marginLeft:6 }}>/ {plan.period}</span>
        </div>

        {/* Features */}
        <ul style={{ listStyle:"none", marginBottom:20, display:"flex", flexDirection:"column", gap:7 }}>
          {plan.features.map((f,i) => (
            <li key={i} style={{ display:"flex", alignItems:"center", gap:7, fontSize:12, color:f.ok?"rgba(255,255,255,0.8)":"rgba(255,255,255,0.2)" }}>
              {f.ok ? <Check size={12} style={{color:"#22C55E",flexShrink:0}}/> : <X size={12} style={{color:"rgba(255,255,255,0.15)",flexShrink:0}}/>}
              <span style={{ textDecoration:f.ok?"none":"line-through" }}>{f.text}</span>
            </li>
          ))}
        </ul>

        {/* Divider + Rarity dots */}
        <div style={{ height:1, background:`linear-gradient(90deg,transparent,${plan.border},transparent)`, marginBottom:10 }} />
        <div style={{ display:"flex", justifyContent:"center", gap:4, marginBottom:14 }}>
          {Array.from({ length: plan.dots }).map((_,i) => (
            <div key={i} style={{
              width: i >= plan.dots-2 ? 7 : 5,
              height: i >= plan.dots-2 ? 7 : 5,
              borderRadius:"50%", background:plan.typeColor,
              boxShadow: i >= plan.dots-2 ? `0 0 6px ${plan.glow}` : "none",
              opacity: i >= plan.dots-2 ? 1 : 0.45,
            }} />
          ))}
        </div>

        {/* CTA */}
        {plan.id === "free" ? (
          <Link href={plan.ctaHref} style={{
            display:"block", textAlign:"center", padding:"11px 0", borderRadius:12,
            background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)",
            color:"rgba(255,255,255,0.55)", textDecoration:"none",
            fontFamily:"Poppins,sans-serif", fontWeight:700, fontSize:13,
          }}>{plan.cta}</Link>
        ) : (
          <button onClick={handleUpgrade} disabled={upgrading} style={{
            width:"100%", padding:"12px 0", borderRadius:12, border:"none",
            background: isGold
              ? "linear-gradient(135deg,#FACC15,#f59e0b,#d97706)"
              : "linear-gradient(135deg,#A855F7,#7C3AED)",
            color: isGold ? "#000" : "white",
            fontFamily:"Poppins,sans-serif", fontWeight:800, fontSize:12,
            cursor: upgrading ? "not-allowed" : "pointer",
            opacity: upgrading ? 0.7 : 1,
            letterSpacing:"0.02em",
            boxShadow: isGold ? "0 4px 20px rgba(250,204,21,0.35)" : "0 4px 20px rgba(168,85,247,0.35)",
          }}>{upgrading ? "Wird geladen..." : plan.cta}</button>
        )}
      </div>
    </div>
  );
}

export default function PremiumSection() {
  return (
    <section style={{ padding:"56px 20px 64px" }}>
      <div style={{ height:1, background:"linear-gradient(90deg,transparent,rgba(250,204,21,0.4),transparent)", marginBottom:48 }} />
      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"5px 14px", borderRadius:20, marginBottom:14, background:"rgba(250,204,21,0.1)", border:"1px solid rgba(250,204,21,0.3)" }}>
            <Crown size={12} style={{color:"#FACC15"}} />
            <span style={{ fontSize:11, fontWeight:700, color:"#FACC15", letterSpacing:"0.1em" }}>ELITE TRAINER LOUNGE</span>
          </div>
          <h2 style={{ fontFamily:"Poppins,sans-serif", fontWeight:900, fontSize:"clamp(24px,4vw,36px)", letterSpacing:"-0.02em", color:"white", marginBottom:10 }}>
            Hole das Maximum aus deiner Sammlung
          </h2>
          <p style={{ color:"rgba(255,255,255,0.4)", fontSize:14, maxWidth:440, margin:"0 auto" }}>
            Wähle deine Seltenheit — von Common bis Hyper Rare ✦✦✦
          </p>
        </div>

        <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap", marginBottom:36 }}>
          {FEATURES.map(f=>(
            <div key={f.label} style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 12px", borderRadius:20, background:`${f.color}10`, border:`1px solid ${f.color}22`, color:f.color, fontSize:11, fontWeight:600 }}>
              {f.icon} {f.label}
            </div>
          ))}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:20, alignItems:"start" }}>
          {PLANS.map(plan => <HoloCard key={plan.id} plan={plan} />)}
        </div>

        <p style={{ textAlign:"center", color:"rgba(255,255,255,0.18)", fontSize:12, marginTop:24 }}>
          Alle Preise inkl. MwSt. · Monatlich kündbar · Sichere Zahlung via Stripe
        </p>
      </div>
    </section>
  );
}
