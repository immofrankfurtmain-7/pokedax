"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const GOLD = "#C9A66B";
const BG   = "#0A0A0A";
const BG2  = "#111111";
const BG3  = "#1A1A1A";
const TX   = "#EDE9E0";
const TX2  = "rgba(237,233,224,0.7)";
const GD2  = "rgba(201,166,107,0.7)";

const TYPE_COLOR: Record<string,string> = {
  Fire:"#F97316", Water:"#38BDF8", Grass:"#4ADE80", Lightning:"#FBBF24",
  Psychic:"#A855F7", Fighting:"#EF4444", Darkness:"#888", Metal:"#9CA3AF",
  Dragon:"#7C3AED", Colorless:"#CBD5E1",
};
const TYPE_DE: Record<string,string> = {
  Fire:"Feuer", Water:"Wasser", Grass:"Pflanze", Lightning:"Elektro",
  Psychic:"Psycho", Fighting:"Kampf", Darkness:"Finsternis", Metal:"Metall",
  Dragon:"Drache", Colorless:"Farblos",
};

interface Card {
  id:string; name:string; name_de?:string; set_id:string; number:string;
  image_url?:string; price_market?:number; price_low?:number; price_avg30?:number;
  types?:string[]; rarity?:string;
}

export default function PreischeckPage() {
  const [query,   setQuery]   = useState("");
  const [sort,    setSort]    = useState("price_desc");
  const [setId,   setSetId]   = useState("");
  const [cards,   setCards]   = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [total,   setTotal]   = useState(0);

  const load = useCallback(async (q: string, s: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ q, sort: s, limit: "48" });
      if (setId) params.set("set", setId);
      const r = await fetch(`/api/cards/search?${params}`);
      const d = await r.json();
      setCards(d.cards ?? []);
      setTotal(d.total ?? d.cards?.length ?? 0);
    } catch { setCards([]); }
    setLoading(false);
  }, [setId]);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const urlSet = p.get("set") ?? "";
    const urlQ   = p.get("q") ?? "";
    if (urlQ) setQuery(urlQ);
    setSetId(urlSet);
  }, []);

  useEffect(() => { load(query, sort); }, [setId, load]);

  function fmt(n: number) {
    return n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  const SORTS = [
    { v: "price_desc", l: "Preis ↓" },
    { v: "price_asc",  l: "Preis ↑" },
    { v: "name_asc",   l: "Name A–Z" },
    { v: "trend_desc", l: "Trend ↑"  },
  ];

  return (
    <div style={{ background: BG, minHeight: "100vh", color: TX }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;700&family=Instrument+Sans:wght@400;500;600&display=swap');
        .ph { font-family:'Playfair Display',serif; letter-spacing:-0.05em; }
        .card-tile { background:#111111; border:1px solid rgba(255,255,255,0.06); border-radius:20px; overflow:hidden; text-decoration:none; display:block; transition:transform 0.25s cubic-bezier(0.22,1,0.36,1),border-color 0.2s,box-shadow 0.25s; }
        .card-tile:hover { transform:translateY(-6px) scale(1.02); border-color:rgba(201,166,107,0.3); box-shadow:0 20px 50px rgba(0,0,0,0.5),0 0 0 1px rgba(201,166,107,0.1); }
        .sort-btn { padding:9px 18px; border-radius:100px; border:1px solid transparent; font-size:12px; cursor:pointer; transition:all 0.15s; background:transparent; }
        .sort-btn.active { background:rgba(201,166,107,0.1); border-color:rgba(201,166,107,0.3); color:#C9A66B; font-weight:600; }
        .sort-btn:not(.active) { color:rgba(237,233,224,0.5); }
        .sort-btn:not(.active):hover { color:#EDE9E0; }
        .search-wrap { position:relative; flex:1; }
        .search-input { width:100%; padding:16px 20px 16px 52px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:100px; color:#EDE9E0; font-size:15px; outline:none; font-family:inherit; transition:border-color 0.2s; }
        .search-input:focus { border-color:rgba(201,166,107,0.4); }
        .search-input::placeholder { color:rgba(237,233,224,0.3); }
        .btn-gold { padding:14px 28px; background:#C9A66B; color:#0A0A0A; border-radius:100px; border:none; font-size:14px; font-weight:600; cursor:pointer; transition:transform 0.2s; white-space:nowrap; }
        .btn-gold:hover { transform:scale(1.03); }
        @keyframes skeleton { 0%,100%{opacity:.3} 50%{opacity:.6} }
        .skel { animation:skeleton 1.5s ease-in-out infinite; }
      `}</style>

      <div style={{ maxWidth: 1600, margin: "0 auto", padding: "clamp(60px,8vw,100px) clamp(20px,4vw,48px)" }}>

        {/* Header */}
        <div style={{ marginBottom: 56 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: GD2, marginBottom: 16 }}>Live Cardmarket EUR</div>
          <h1 className="ph" style={{ fontSize: "clamp(40px,6vw,80px)", fontWeight: 500, color: TX, lineHeight: 1 }}>
            Preischeck
          </h1>
        </div>

        {/* Search bar */}
        <div style={{ background: BG2, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "20px 24px", marginBottom: 40, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div className="search-wrap">
            <span style={{ position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: "rgba(237,233,224,0.25)" }}>◎</span>
            <input className="search-input" value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && load(query, sort)}
              placeholder="Karte suchen — Deutsch oder Englisch…"/>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {SORTS.map(s => (
              <button key={s.v} className={`sort-btn${sort===s.v?" active":""}`}
                onClick={() => { setSort(s.v); load(query, s.v); }}>
                {s.l}
              </button>
            ))}
          </div>
          <button className="btn-gold" onClick={() => load(query, sort)}>Suchen</button>
        </div>

        {/* Count */}
        {!loading && (
          <div style={{ fontSize: 12, color: "rgba(237,233,224,0.35)", marginBottom: 28, letterSpacing: "0.06em" }}>
            {total > 0 ? `${total.toLocaleString("de-DE")} Karten` : "Keine Karten gefunden"}
          </div>
        )}

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 20 }}>
          {loading ? (
            Array.from({ length: 12 }).map((_,i) => (
              <div key={i} className="skel" style={{ background: BG2, borderRadius: 20, aspectRatio: "3/5" }}/>
            ))
          ) : cards.map(card => {
            const tc  = TYPE_COLOR[card.types?.[0] ?? ""] ?? "rgba(201,166,107,0.3)";
            const img = card.image_url ?? `https://assets.tcgdex.net/en/${card.set_id}/${card.number}/low.webp`;
            const name = card.name_de ?? card.name;
            const price = card.price_market ? fmt(card.price_market) + " €"
              : card.price_low ? "ab " + fmt(card.price_low) + " €" : "–";
            const pct = card.price_avg30 && card.price_avg30 > 0
              ? ((card.price_market ?? 0) - card.price_avg30) / card.price_avg30 * 100 : null;
            const up = pct !== null && pct >= 0;

            return (
              <Link key={card.id} href={`/preischeck/${card.id}`} className="card-tile">
                {/* Image */}
                <div style={{ aspectRatio: "3/4", background: BG3, position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 30%,${tc}20,transparent 65%)` }}/>
                  <img src={img} alt={name} loading="lazy"
                    style={{ width: "85%", height: "85%", objectFit: "contain", position: "relative", zIndex: 1 }}
                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}/>
                  {/* Type badge */}
                  {card.types?.[0] && (
                    <div style={{ position: "absolute", top: 10, left: 10, zIndex: 3, padding: "3px 10px", borderRadius: 100, fontSize: 9, fontWeight: 700, background: `${tc}25`, color: tc, border: `1px solid ${tc}35` }}>
                      {TYPE_DE[card.types[0]] ?? card.types[0]}
                    </div>
                  )}
                  {/* Trend */}
                  {pct !== null && (
                    <div style={{ position: "absolute", top: 10, right: 10, zIndex: 3, padding: "3px 8px", borderRadius: 100, fontSize: 9, fontWeight: 700, background: up ? "rgba(61,184,122,0.15)" : "rgba(220,74,90,0.12)", color: up ? "#3db87a" : "#dc4a5a" }}>
                      {up ? "▲" : "▼"} {Math.abs(pct).toFixed(1)}%
                    </div>
                  )}
                  {/* Bottom fade */}
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "40%", background: `linear-gradient(transparent,${BG2})`, zIndex: 2 }}/>
                </div>
                {/* Info */}
                <div style={{ padding: "14px 16px 18px" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: TX, marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</div>
                  <div style={{ fontSize: 10, color: "rgba(237,233,224,0.3)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {card.set_id?.toUpperCase()} · #{card.number}
                  </div>
                  <div style={{ fontFamily: "monospace", fontSize: 18, fontWeight: 600, color: card.price_market ? GOLD : "rgba(237,233,224,0.3)" }}>
                    {price}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
