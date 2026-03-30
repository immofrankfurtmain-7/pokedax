"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

function CountUp({ target, duration = 1400 }: { target: number; duration?: number }) {
  const [val, setVal] = useState(target); // start at target — no flash on SSR
  useEffect(() => {
    if (!target) return;
    const start = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(ease * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    setVal(0);
    requestAnimationFrame(tick);
  }, [target, duration]);
  return <>{val.toLocaleString("de-DE")}</>;
}

interface Props {
  cardsCount: number;
  usersCount: number;
  forumPosts: number;
}

export default function HeroClient({ cardsCount, usersCount, forumPosts }: Props) {
  return (
    <section style={{
      maxWidth: 900, margin: "0 auto", padding: "72px 24px 60px",
      textAlign: "center",
      background: "radial-gradient(ellipse 65% 45% at 50% 0%, rgba(233,168,75,0.055), transparent 70%)",
    }}>
      {/* Eyebrow */}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "4px 12px", borderRadius: 20, marginBottom: 28,
        border: "1px solid rgba(233,168,75,0.18)", background: "rgba(233,168,75,0.06)",
        fontSize: 10, fontWeight: 500, color: "var(--gold)", letterSpacing: ".04em",
      }}>
        <span style={{
          width: 4, height: 4, borderRadius: "50%", background: "var(--gold)",
          animation: "blink 2s ease-in-out infinite", display: "inline-block",
        }} />
        Live Cardmarket EUR · Deutschland
      </div>

      {/* Headline */}
      <h1 style={{
        fontSize: "clamp(36px,5.5vw,54px)", fontWeight: 300,
        letterSpacing: "-.04em", lineHeight: 1.05, marginBottom: 18,
      }}>
        Deine Karten.<br />
        <strong style={{ fontWeight: 550 }}>Ihr wahrer Wert.</strong><br />
        <span style={{ color: "var(--tx-3)" }}>Jeden Tag.</span>
      </h1>

      {/* Subline */}
      <p style={{
        fontSize: 14, fontWeight: 400, color: "var(--tx-2)",
        maxWidth: 380, margin: "0 auto 36px", lineHeight: 1.7, letterSpacing: "-.003em",
      }}>
        Live-Preise von Cardmarket, KI-Scanner und Portfolio-Tracking.
        Präzise, schnell und immer aktuell.
      </p>

      {/* CTAs */}
      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 52 }}>
        <Link href="/preischeck" style={{
          padding: "11px 24px", borderRadius: 10, fontSize: 13, fontWeight: 600,
          letterSpacing: "-.015em", background: "var(--gold)", color: "#09070E",
          textDecoration: "none",
          boxShadow: "0 0 0 1px rgba(233,168,75,0.3), 0 4px 20px rgba(233,168,75,0.18)",
        }}>Preis checken</Link>
        <Link href="/scanner" style={{
          padding: "11px 24px", borderRadius: 10, fontSize: 13, fontWeight: 400,
          color: "var(--tx-2)", border: "1px solid var(--br-3)",
          background: "transparent", textDecoration: "none",
        }}>Karte scannen →</Link>
      </div>

      {/* Stats strip */}
      <div style={{
        display: "inline-grid", gridTemplateColumns: "repeat(4,1fr)",
        background: "var(--bg-2)", border: "1px solid var(--br-2)",
        borderRadius: 14, overflow: "hidden",
      }}>
        {[
          { label: "Karten",      value: cardsCount },
          { label: "Nutzer",      value: usersCount },
          { label: "Scans heute", value: 1247       },
          { label: "Forum-Posts", value: forumPosts },
        ].map((s, i, arr) => (
          <div key={s.label} style={{
            padding: "18px 24px", textAlign: "left",
            borderRight: i < arr.length - 1 ? "1px solid var(--br-1)" : "none",
          }}>
            <div style={{ fontSize: 22, fontWeight: 550, letterSpacing: "-.035em", color: "var(--tx-1)", lineHeight: 1 }}>
              <CountUp target={s.value} />
            </div>
            <div style={{ fontSize: 10, color: "var(--tx-3)", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
