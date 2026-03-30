"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";

interface StatsData {
  cards_count: number;
  users_count: number;
  scans_today: number;
  forum_posts: number;
}

function useCountUp(target: number, duration = 1400) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target) return;
    const start = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(ease * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return val;
}

function StatCell({ label, value }: { label: string; value: number }) {
  const v = useCountUp(value);
  return (
    <div style={{ padding: "18px 24px", borderRight: "1px solid var(--br-1)", textAlign: "left" }}>
      <div style={{ fontSize: 22, fontWeight: 550, letterSpacing: "-.035em", color: "var(--tx-1)", lineHeight: 1 }}>
        {v.toLocaleString("de-DE")}
      </div>
      <div style={{ fontSize: 10, color: "var(--tx-3)", marginTop: 4 }}>{label}</div>
    </div>
  );
}

interface TrendCard {
  id: string; name: string; name_de?: string; set_id: string; number: string;
  image_url?: string; price_market?: number; price_low?: number;
  rarity?: string; types?: string[];
}

const TYPE_COLORS: Record<string, string> = {
  Fire: "#F97316", Water: "#38BDF8", Grass: "#4ADE80",
  Lightning: "#E9A84B", Psychic: "#A855F7", Fighting: "#EF4444",
  Darkness: "#6B7280", Metal: "#9CA3AF", Dragon: "#7C3AED", Colorless: "#CBD5E1",
};

export default function HomePage() {
  const [stats, setStats] = useState<StatsData>({ cards_count: 22271, users_count: 3841, scans_today: 1247, forum_posts: 18330 });
  const [trendCards, setTrendCards] = useState<TrendCard[]>([]);

  useEffect(() => {
    fetch("/api/stats").then(r => r.json()).then(d => {
      if (d.cards_count) setStats(d);
    }).catch(() => {});
    fetch("/api/cards/search?sort=price_desc&limit=8").then(r => r.json()).then(d => {
      if (d.cards) setTrendCards(d.cards);
    }).catch(() => {});
  }, []);

  return (
    <div style={{ color: "var(--tx-1)" }}>

      {/* ── HERO ─────────────────────────────── */}
      <section style={{
        maxWidth: 900, margin: "0 auto", padding: "72px 24px 60px",
        textAlign: "center",
        background: "radial-gradient(ellipse 65% 45% at 50% 0%, rgba(233,168,75,0.055), transparent 70%)",
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "4px 12px", borderRadius: 20, marginBottom: 28,
          border: "1px solid var(--gold-18)", background: "var(--gold-06)",
          fontSize: 10, fontWeight: 500, color: "var(--gold)", letterSpacing: ".04em",
        }}>
          <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--gold)", animation: "blink 2s ease-in-out infinite", display: "inline-block" }} />
          Live Cardmarket EUR · Deutschland
        </div>

        <h1 style={{
          fontSize: "clamp(36px,5.5vw,54px)", fontWeight: 300,
          letterSpacing: "-.04em", lineHeight: 1.05, marginBottom: 18,
        }}>
          Deine Karten.<br />
          <strong style={{ fontWeight: 550 }}>Ihr wahrer Wert.</strong><br />
          <span style={{ color: "var(--tx-3)" }}>Jeden Tag.</span>
        </h1>

        <p style={{
          fontSize: 14, fontWeight: 400, color: "var(--tx-2)",
          maxWidth: 380, margin: "0 auto 36px", lineHeight: 1.7, letterSpacing: "-.003em",
        }}>
          Live-Preise von Cardmarket, KI-Scanner und Portfolio-Tracking.
          Präzise, schnell und immer aktuell.
        </p>

        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 52 }}>
          <Link href="/preischeck" style={{
            padding: "11px 24px", borderRadius: 10, fontSize: 13, fontWeight: 600,
            letterSpacing: "-.015em", background: "var(--gold)", color: "#09070E",
            border: "none", textDecoration: "none",
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
          <StatCell label="Karten" value={stats.cards_count} />
          <StatCell label="Nutzer" value={stats.users_count} />
          <StatCell label="Scans heute" value={stats.scans_today} />
          <div style={{ padding: "18px 24px", textAlign: "left" }}>
            <div style={{ fontSize: 22, fontWeight: 550, letterSpacing: "-.035em", color: "var(--tx-1)", lineHeight: 1 }}>
              {stats.forum_posts.toLocaleString("de-DE")}
            </div>
            <div style={{ fontSize: 10, color: "var(--tx-3)", marginTop: 4 }}>Forum-Posts</div>
          </div>
        </div>
      </section>

      {/* ── TRENDING CARDS ───────────────────── */}
      {trendCards.length > 0 && (
        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 56px" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 500, letterSpacing: "-.02em" }}>Meistgesucht</h2>
            <Link href="/preischeck" style={{ fontSize: 12, color: "var(--tx-3)", textDecoration: "none" }}>
              Alle ansehen →
            </Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px,1fr))", gap: 10 }}>
            {trendCards.map(card => {
              const typeColor = TYPE_COLORS[card.types?.[0] || ""] || "#474664";
              const img = card.image_url || `https://assets.tcgdex.net/en/${card.set_id}/${card.number}/low.webp`;
              const name = card.name_de || card.name;
              return (
                <Link key={card.id} href={`/preischeck?q=${encodeURIComponent(card.name)}`} style={{ textDecoration: "none" }}>
                  <div style={{
                    background: "var(--bg-2)", border: "1px solid var(--br-1)",
                    borderRadius: 14, overflow: "hidden",
                    transition: "transform .22s cubic-bezier(.16,1,.3,1), border-color .22s, box-shadow .22s",
                  }}
                  onMouseEnter={e => {
                    const d = e.currentTarget as HTMLDivElement;
                    d.style.transform = "translateY(-4px)";
                    d.style.borderColor = "rgba(233,168,75,0.18)";
                    d.style.boxShadow = "0 20px 50px rgba(0,0,0,0.6), 0 0 30px rgba(233,168,75,0.06)";
                  }}
                  onMouseLeave={e => {
                    const d = e.currentTarget as HTMLDivElement;
                    d.style.transform = "translateY(0)";
                    d.style.borderColor = "var(--br-1)";
                    d.style.boxShadow = "none";
                  }}
                  >
                    <div style={{ aspectRatio: "3/4", background: "var(--bg-1)", position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 30%, ${typeColor}10, transparent 70%)` }} />
                      <img src={img} alt={name} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 4 }}
                        onError={e => { (e.target as HTMLImageElement).style.opacity = ".1"; }} />
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "50%", background: "linear-gradient(to bottom, transparent, var(--bg-2))" }} />
                    </div>
                    <div style={{ padding: "10px 12px 13px" }}>
                      <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--tx-1)", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</div>
                      <div style={{ fontSize: 9.5, color: "var(--tx-3)", marginBottom: 8 }}>{card.set_id?.toUpperCase()} · #{card.number}</div>
                      <div style={{ fontSize: 15, fontWeight: 550, letterSpacing: "-.02em", fontFamily: "DM Mono, monospace", color: "var(--gold)" }}>
                        {card.price_market ? `${card.price_market.toFixed(2)}€` : card.price_low ? `ab ${card.price_low.toFixed(2)}€` : "—"}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ── SCANNER CTA ──────────────────────── */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 56px" }}>
        <div style={{
          background: "var(--bg-2)", border: "1px solid var(--br-2)",
          borderRadius: 20, padding: "28px 32px",
          display: "grid", gridTemplateColumns: "1fr auto", gap: 32,
          alignItems: "center", position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(233,168,75,0.3), transparent)" }} />
          <div>
            <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--tx-3)", marginBottom: 8 }}>KI-Scanner · Gemini Flash</div>
            <div style={{ fontSize: 21, fontWeight: 400, letterSpacing: "-.03em", lineHeight: 1.22, marginBottom: 9 }}>Foto machen.<br />Preis wissen.</div>
            <div style={{ fontSize: 12.5, color: "var(--tx-2)", lineHeight: 1.65, marginBottom: 16 }}>Karte fotografieren — KI erkennt sie in Sekunden und zeigt den aktuellen Cardmarket-Wert.</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ padding: "3px 9px", borderRadius: 5, fontSize: 10, fontWeight: 500, background: "var(--gold-06)", color: "var(--gold)", border: "1px solid var(--gold-18)" }}>5 Scans / Tag</span>
              <span style={{ fontSize: 10, color: "var(--tx-3)" }}>Unlimitiert mit Premium ✦</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Link href="/scanner" style={{
              width: 160, aspectRatio: "1", borderRadius: 14,
              background: "var(--bg-1)", border: "1px dashed rgba(233,168,75,0.18)",
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", gap: 9, textDecoration: "none",
              transition: "all .2s cubic-bezier(.16,1,.3,1)",
            }}
            onMouseEnter={e => {
              const d = e.currentTarget as HTMLAnchorElement;
              d.style.borderColor = "rgba(233,168,75,0.3)";
              d.style.background = "rgba(233,168,75,0.05)";
              d.style.transform = "scale(1.015)";
            }}
            onMouseLeave={e => {
              const d = e.currentTarget as HTMLAnchorElement;
              d.style.borderColor = "rgba(233,168,75,0.18)";
              d.style.background = "var(--bg-1)";
              d.style.transform = "scale(1)";
            }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: .22 }}>
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
              </svg>
              <span style={{ fontSize: 9.5, color: "var(--tx-3)", textAlign: "center", lineHeight: 1.5 }}>Foto hier ablegen<br />oder klicken</span>
            </Link>
            <Link href="/scanner" style={{
              display: "block", textAlign: "center", padding: "11px",
              borderRadius: 10, background: "var(--gold)", color: "#09070E",
              fontSize: 12.5, fontWeight: 600, letterSpacing: "-.01em",
              textDecoration: "none", boxShadow: "0 2px 14px rgba(233,168,75,0.18)",
            }}>Jetzt scannen</Link>
          </div>
        </div>
      </section>

    </div>
  );
}
