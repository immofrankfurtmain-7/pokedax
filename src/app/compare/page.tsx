"use client";
import { useState, useCallback } from "react";
import Link from "next/link";

const GOLD = "#C9A66B";
const BG   = "#0A0A0A";
const BG2  = "#111111";
const BG3  = "#1A1A1A";
const TX   = "#EDE9E0";
const TX2  = "rgba(237,233,224,0.7)";
const GD2  = "rgba(201,166,107,0.7)";

const TYPE_COLOR: Record<string,string> = {
  Fire:"#F97316",Water:"#38BDF8",Grass:"#4ADE80",Lightning:"#FBBF24",
  Psychic:"#A855F7",Fighting:"#EF4444",Darkness:"#888",Metal:"#9CA3AF",Dragon:"#7C3AED",
};

export default function ComparePage() {
  const [card1, setCard1] = useState<any>(null);
  const [card2, setCard2] = useState<any>(null);

  return (
    <div style={{ background: BG, minHeight: "100vh", color: TX }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;700&family=Instrument+Sans:wght@400;500;600&display=swap');
        .ph { font-family:'Playfair Display',serif; letter-spacing:-0.05em; }
        .card-frame { background:#111111; border:1px solid rgba(255,255,255,0.07); border-radius:24px; overflow:hidden; transition:border-color 0.2s; }
        .card-frame:hover { border-color:rgba(201,166,107,0.2); }
        .stat-row { display:grid; grid-template-columns:1fr 160px 1fr; gap:8px; padding:12px 0; border-bottom:1px solid rgba(255,255,255,0.05); align-items:center; }
        .stat-row:last-child { border-bottom:none; }
        .stat-val { font-family:monospace; font-size:14px; font-weight:600; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation:fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) both; }
      `}</style>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(60px,8vw,100px) clamp(20px,4vw,48px)" }}>

        {/* Header */}
        <div style={{ marginBottom: 56, textAlign: "center" }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: GD2, marginBottom: 16 }}>Side by Side</div>
          <h1 className="ph" style={{ fontSize: "clamp(40px,6vw,80px)", fontWeight: 500, color: TX, lineHeight: 1 }}>
            Karten<br/><span style={{ color: GOLD }}>vergleichen</span>
          </h1>
        </div>

        {/* Two columns */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 48 }}>
          <CardSlot card={card1} onSelect={setCard1} label="Karte 1" />
          <CardSlot card={card2} onSelect={setCard2} label="Karte 2" />
        </div>

        {/* Comparison table */}
        {card1 && card2 && (
          <div className="fade-up" style={{ background: BG2, borderRadius: 24, overflow: "hidden", border: "1px solid rgba(201,166,107,0.15)" }}>
            <div style={{ height: 1, background: "linear-gradient(90deg,transparent,rgba(201,166,107,0.4),transparent)" }}/>
            <div style={{ padding: "28px 32px" }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: GD2, marginBottom: 20 }}>Vergleich</div>

              {/* Header row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 160px 1fr", gap: 8, marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: TX }}>{card1.name_de || card1.name}</div>
                <div style={{ textAlign: "center", fontSize: 11, color: GD2, textTransform: "uppercase", letterSpacing: "0.1em" }}>Wert</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: TX, textAlign: "right" }}>{card2.name_de || card2.name}</div>
              </div>

              {[
                { label: "Marktwert", v1: card1.price_market ? card1.price_market.toFixed(2) + " €" : "–", v2: card2.price_market ? card2.price_market.toFixed(2) + " €" : "–", compare: true, n1: card1.price_market, n2: card2.price_market },
                { label: "7-Tage-Ø",  v1: card1.price_avg7 ? card1.price_avg7.toFixed(2) + " €" : "–",  v2: card2.price_avg7 ? card2.price_avg7.toFixed(2) + " €" : "–",  compare: true, n1: card1.price_avg7, n2: card2.price_avg7 },
                { label: "Ab-Preis",   v1: card1.price_low ? card1.price_low.toFixed(2) + " €" : "–",   v2: card2.price_low ? card2.price_low.toFixed(2) + " €" : "–",   compare: false },
                { label: "HP",         v1: card1.hp || "–",                                               v2: card2.hp || "–",                                               compare: true, n1: parseInt(card1.hp), n2: parseInt(card2.hp) },
                { label: "Seltenheit", v1: card1.rarity || "–",                                           v2: card2.rarity || "–",                                           compare: false },
                { label: "Set",        v1: card1.set_id?.toUpperCase() || "–",                             v2: card2.set_id?.toUpperCase() || "–",                             compare: false },
                { label: "Typ",        v1: card1.types?.join(", ") || "–",                                 v2: card2.types?.join(", ") || "–",                                 compare: false },
                { label: "Scans",      v1: (card1.scan_count || 0).toString(),                             v2: (card2.scan_count || 0).toString(),                             compare: true, n1: card1.scan_count, n2: card2.scan_count },
              ].map(({ label, v1, v2, compare, n1, n2 }: any) => {
                const winner1 = compare && n1 != null && n2 != null && n1 > n2;
                const winner2 = compare && n1 != null && n2 != null && n2 > n1;
                return (
                  <div key={label} className="stat-row">
                    <div style={{ textAlign: "left" }}>
                      <span className="stat-val" style={{ color: winner1 ? GOLD : TX }}>{v1}</span>
                      {winner1 && <span style={{ marginLeft: 6, fontSize: 11, color: GOLD }}>✦</span>}
                    </div>
                    <div style={{ textAlign: "center", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: GD2 }}>{label}</div>
                    <div style={{ textAlign: "right" }}>
                      {winner2 && <span style={{ marginRight: 6, fontSize: 11, color: GOLD }}>✦</span>}
                      <span className="stat-val" style={{ color: winner2 ? GOLD : TX }}>{v2}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Price difference */}
            {card1.price_market && card2.price_market && (
              <div style={{ padding: "20px 32px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "center", gap: 32 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: GD2, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.1em" }}>Preisdifferenz</div>
                  <div className="ph" style={{ fontSize: 28, fontWeight: 500, color: GOLD }}>
                    {Math.abs(card1.price_market - card2.price_market).toFixed(2)} €
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: GD2, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.1em" }}>Günstiger</div>
                  <div style={{ fontSize: 18, fontWeight: 600, color: TX }}>
                    {(Math.abs(card1.price_market - card2.price_market) / Math.max(card1.price_market, card2.price_market) * 100).toFixed(0)}% günstiger
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function CardSlot({ card, onSelect, label }: { card: any; onSelect: (c: any) => void; label: string }) {
  const [search,  setSearch]  = useState("");
  const [results, setResults] = useState<any[]>([]);

  const searchCards = useCallback(async (q: string) => {
    setSearch(q);
    if (q.length < 2) { setResults([]); return; }
    const res = await fetch(`/api/cards/search?q=${encodeURIComponent(q)}&limit=6`);
    const data = await res.json();
    setResults(data.cards ?? []);
  }, []);

  const imgSrc = card?.image_url ? (card.image_url.includes(".") ? card.image_url : card.image_url + "/high.webp") : null;
  const tc = TYPE_COLOR[card?.types?.[0] ?? ""] ?? "rgba(201,166,107,0.2)";

  return (
    <div className="card-frame">
      {/* Image */}
      <div style={{ aspectRatio: "3/4", background: BG3, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
        {imgSrc ? (
          <img src={imgSrc} alt={card?.name} style={{ width: "80%", height: "80%", objectFit: "contain" }}/>
        ) : (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, opacity: 0.1, marginBottom: 12, color: GOLD }}>◎</div>
            <div style={{ fontSize: 13, color: "rgba(237,233,224,0.3)" }}>{label}</div>
          </div>
        )}
        {card && (
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 80%,${tc}15,transparent 60%)`, pointerEvents: "none" }}/>
        )}
      </div>

      {/* Search */}
      <div style={{ padding: "16px", position: "relative" }}>
        {card ? (
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: TX, marginBottom: 4 }}>{card.name_de || card.name}</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
              <div style={{ fontFamily: "monospace", fontSize: 18, fontWeight: 600, color: GOLD }}>{card.price_market?.toFixed(2)} €</div>
              <div style={{ fontSize: 10, color: "rgba(237,233,224,0.35)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{card.set_id} · #{card.number}</div>
            </div>
            <button onClick={() => { onSelect(null); setSearch(""); setResults([]); }} style={{ width: "100%", padding: "10px", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 100, color: "rgba(237,233,224,0.4)", fontSize: 12, cursor: "pointer" }}>
              Andere Karte wählen
            </button>
          </div>
        ) : (
          <div style={{ position: "relative" }}>
            <input value={search} onChange={e => searchCards(e.target.value)}
              placeholder="Karte suchen…"
              style={{ width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 100, color: TX, fontSize: 13, outline: "none", fontFamily: "inherit" }}/>
            {results.length > 0 && (
              <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 10, background: "#111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0 0 12px 12px", boxShadow: "0 16px 40px rgba(0,0,0,0.6)", marginTop: 2 }}>
                {results.map((r: any) => (
                  <button key={r.id} onClick={() => { onSelect(r); setSearch(""); setResults([]); }} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    width: "100%", padding: "10px 14px", background: "none", border: "none",
                    cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.05)", transition: "background 0.1s",
                  }}
                  onMouseEnter={e => (e.currentTarget as any).style.background = "rgba(255,255,255,0.04)"}
                  onMouseLeave={e => (e.currentTarget as any).style.background = "none"}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: TX }}>{r.name_de || r.name}</span>
                    <span style={{ fontSize: 11, color: GD2 }}>{r.price_market?.toFixed(2)} €</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
