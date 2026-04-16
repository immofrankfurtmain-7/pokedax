"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare, ArrowRight } from "lucide-react";

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  post_count: number;
}

const CAT = {
  marktplatz:   { gradient: "linear-gradient(135deg, #1a0533 0%, #2d0a52 50%, #1a0533 100%)", border: "rgba(168,85,247,0.6)",  glow: "rgba(168,85,247,0.25)", type: "Psychic",   rarity: "Rare Holo",    dots: 4 },
  preise:       { gradient: "linear-gradient(135deg, #001a2e 0%, #003366 50%, #001a2e 100%)", border: "rgba(0,229,255,0.6)",   glow: "rgba(0,229,255,0.25)",  type: "Water",     rarity: "Uncommon",     dots: 2 },
  "fake-check": { gradient: "linear-gradient(135deg, #1a0a00 0%, #3d1a00 50%, #1a0a00 100%)", border: "rgba(249,115,22,0.6)",  glow: "rgba(249,115,22,0.25)", type: "Fire",      rarity: "Rare",         dots: 3 },
  news:         { gradient: "linear-gradient(135deg, #00150a 0%, #003320 50%, #00150a 100%)", border: "rgba(34,197,94,0.6)",   glow: "rgba(34,197,94,0.25)",  type: "Grass",     rarity: "Common",       dots: 1 },
  einsteiger:   { gradient: "linear-gradient(135deg, #1a1a00 0%, #333300 50%, #1a1a00 100%)", border: "rgba(250,204,21,0.6)",  glow: "rgba(250,204,21,0.25)", type: "Lightning", rarity: "Common",       dots: 1 },
  turniere:     { gradient: "linear-gradient(135deg, #1a0000 0%, #330000 50%, #1a0000 100%)", border: "rgba(238,21,21,0.6)",   glow: "rgba(238,21,21,0.25)",  type: "Fighting",  rarity: "Rare Holo EX", dots: 5 },
  premium:      { gradient: "linear-gradient(135deg, #0a0014 0%, #1a003d 50%, #0a0014 100%)", border: "rgba(250,204,21,0.8)",  glow: "rgba(250,204,21,0.3)",  type: "Dragon",    rarity: "Ultra Rare",   dots: 6 },
};

// 8th card: CTA
const CTA_CARD = { id: "new", name: "Beitrag erstellen", icon: "+", post_count: 0 };

export default function ForumSection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/forum/categories")
      .then(r => r.json())
      .then(c => { setCategories(c.categories || []); setLoading(false); });
  }, []);

  const displayCards = [...categories.slice(0, 7), CTA_CARD];

  return (
    <section style={{ padding: "0 20px 56px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#EE1515", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>Community</div>
            <h2 style={{ fontFamily: "Poppins, sans-serif", fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 800, color: "#F8FAFC", letterSpacing: "-0.02em" }}>
              Forum
            </h2>
          </div>
          <Link href="/forum" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "#475569", textDecoration: "none" }}>
            Alle Kategorien <ArrowRight size={14} />
          </Link>
        </div>

        {/* 8 Holo-Karten in 2 Reihen à 4 */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 14,
        }}>
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{ borderRadius: 12, background: "rgba(255,255,255,0.04)", aspectRatio: "2.5/3.5", animation: "pulse 1.5s infinite" }} />
              ))
            : displayCards.map(cat => {
                const isCta = cat.id === "new";
                const s = CAT[cat.id as keyof typeof CAT] || CAT.news;

                if (isCta) {
                  return (
                    <Link key="new" href="/forum/new" style={{ display: "block", textDecoration: "none" }}>
                      <div style={{
                        border: "1px dashed rgba(255,255,255,0.15)", borderRadius: 12,
                        aspectRatio: "2.5/3.5", display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center", gap: 8,
                        background: "rgba(255,255,255,0.01)", transition: "border-color .2s, transform .2s",
                        cursor: "pointer",
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(238,21,21,0.4)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.15)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}
                      >
                        <div style={{ fontSize: 28, color: "rgba(255,255,255,0.2)" }}>+</div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", textAlign: "center", lineHeight: 1.4 }}>Beitrag<br/>erstellen</div>
                      </div>
                    </Link>
                  );
                }

                return (
                  <Link key={cat.id} href={`/forum?category=${cat.id}`} style={{ display: "block", textDecoration: "none" }}>
                    <div
                      className="holo-card"
                      style={{
                        background: s.gradient,
                        border: `1px solid ${s.border}`,
                        borderRadius: 12,
                        boxShadow: `0 0 20px ${s.glow}, inset 0 0 40px rgba(0,0,0,0.3)`,
                        aspectRatio: "2.5/3.5",
                        display: "flex", flexDirection: "column",
                        position: "relative", overflow: "hidden",
                        cursor: "pointer",
                      }}>
                      <div className="holo-shimmer" />

                      {/* Top bar */}
                      <div style={{ padding: "6px 8px 4px", borderBottom: `1px solid ${s.border}40`, display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: s.border, fontSize: 8, fontWeight: 700 }}>{s.type}</span>
                        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 8 }}>HP {Math.floor((cat.post_count || 0) / 10) + 60}</span>
                      </div>

                      {/* Icon */}
                      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div style={{
                          width: 52, height: 52, borderRadius: "50%",
                          background: `radial-gradient(circle, ${s.glow} 0%, transparent 70%)`,
                          border: `1px solid ${s.border}50`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 24,
                        }}>{cat.icon}</div>
                      </div>

                      {/* Name */}
                      <div style={{ padding: "0 6px 4px", textAlign: "center" }}>
                        <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: 10, color: "white", letterSpacing: "0.03em" }}>
                          {cat.name}
                        </p>
                      </div>

                      <div style={{ margin: "0 6px", height: 1, background: `${s.border}40` }} />

                      {/* Posts count */}
                      <div style={{ padding: "4px 8px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(0,0,0,0.3)", padding: "3px 6px", borderRadius: 4 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                            <MessageSquare size={8} style={{ color: s.border }} />
                            <span style={{ color: s.border, fontSize: 8, fontWeight: 700 }}>{(cat.post_count || 0).toLocaleString()}</span>
                          </div>
                          <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 8 }}>Posts</span>
                        </div>
                      </div>

                      {/* Rarity dots */}
                      <div style={{ display: "flex", justifyContent: "center", gap: 3, paddingBottom: 6 }}>
                        {Array.from({ length: s.dots }).map((_, i) => (
                          <div key={i} style={{
                            width: i === s.dots - 1 ? 6 : 4, height: i === s.dots - 1 ? 6 : 4,
                            borderRadius: "50%",
                            background: i === s.dots - 1 ? s.border : `${s.border}60`,
                            boxShadow: i === s.dots - 1 ? `0 0 4px ${s.glow}` : "none",
                          }} />
                        ))}
                      </div>

                      <div style={{ position: "absolute", bottom: 4, left: 0, right: 0, textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 7 }}>
                        {s.rarity}
                      </div>
                    </div>
                  </Link>
                );
              })}
        </div>

        {/* Mobile: 2 columns */}
        <style>{`
          @media (max-width: 640px) {
            .forum-grid { grid-template-columns: repeat(2, 1fr) !important; }
          }
          @media (min-width: 641px) and (max-width: 900px) {
            .forum-grid { grid-template-columns: repeat(4, 1fr) !important; }
          }
        `}</style>
      </div>
    </section>
  );
}
