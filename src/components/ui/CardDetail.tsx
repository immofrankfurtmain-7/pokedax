"use client";

import { useEffect } from "react";
import { X, ExternalLink, Star, Shield, Zap } from "lucide-react";

interface Card {
  id: string; name: string; name_de?: string | null; set_id: string; number: string;
  rarity: string | null; rarity_id?: string | null;
  types: string[] | null; image_url: string | null;
  price_market: number | null; price_low: number | null;
  price_avg7: number | null; price_avg30: number | null;
  hp?: number | null; category?: string | null; stage?: string | null;
  illustrator?: string | null; regulation_mark?: string | null;
  is_holo?: boolean | null; is_reverse_holo?: boolean | null;
}

const TYPE_COLORS: Record<string,string> = {
  Fire:"#F97316",Water:"#3B82F6",Grass:"#22C55E",Lightning:"#FACC15",
  Psychic:"#A855F7",Fighting:"#EF4444",Darkness:"#6B7280",Metal:"#9CA3AF",
  Dragon:"#7C3AED",Colorless:"#CBD5E1",
};

const REG_MARK_INFO: Record<string,{label:string;format:string;color:string}> = {
  "A":{label:"A",format:"Standard",  color:"#22C55E"},
  "B":{label:"B",format:"Standard",  color:"#22C55E"},
  "C":{label:"C",format:"Standard",  color:"#22C55E"},
  "D":{label:"D",format:"Standard",  color:"#22C55E"},
  "E":{label:"E",format:"Standard",  color:"#22C55E"},
  "F":{label:"F",format:"Expanded",  color:"#3B82F6"},
  "G":{label:"G",format:"Standard",  color:"#22C55E"},
  "H":{label:"H",format:"Standard",  color:"#22C55E"},
};

const HOLO_PRICES: Record<string, number> = {
  // Estimated holo premium ~15-40%
};

interface Props {
  card: Card;
  onClose: () => void;
}

export default function CardDetail({ card, onClose }: Props) {
  const typeColor = card.types?.[0] ? (TYPE_COLORS[card.types[0]] || "#475569") : "#475569";
  const imgUrl    = card.image_url || `https://assets.tcgdex.net/en/${card.set_id}/${card.number}/low.webp`;
  const displayName = card.name_de || card.name;
  const regInfo   = card.regulation_mark ? REG_MARK_INFO[card.regulation_mark] : null;

  const change = card.price_avg7 && card.price_avg30 && card.price_avg30 > 0
    ? ((card.price_avg7 - card.price_avg30) / card.price_avg30) * 100 : null;

  // Estimated holo price (market + ~25%)
  const holoPrice = card.price_market ? card.price_market * 1.25 : null;
  const reversePrice = card.price_market ? card.price_market * 1.15 : null;

  // Close on escape
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "linear-gradient(135deg, #0d0a1a, #111)",
          border: `1px solid ${typeColor}35`,
          borderRadius: 24, overflow: "hidden",
          maxWidth: 680, width: "100%",
          maxHeight: "90vh", overflowY: "auto",
          boxShadow: `0 0 60px ${typeColor}20, 0 40px 80px rgba(0,0,0,0.8)`,
        }}
      >
        {/* Top accent */}
        <div style={{ height: 3, background: `linear-gradient(90deg, transparent, ${typeColor}, transparent)` }} />

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px" }}>
          <div>
            <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 900, fontSize: 22, color: "white", letterSpacing: "-0.02em" }}>
              {displayName}
            </h2>
            {card.name_de && card.name !== displayName && (
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{card.name}</p>
            )}
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "rgba(255,255,255,0.6)", cursor: "pointer", display: "flex", padding: 8 }}>
            <X size={18} />
          </button>
        </div>

        {/* Main content */}
        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 24, padding: "0 20px 24px" }}>

          {/* Card image */}
          <div style={{ flexShrink: 0 }}>
            <div style={{
              borderRadius: 14, overflow: "hidden",
              background: `linear-gradient(180deg, ${typeColor}15, rgba(0,0,0,0.5))`,
              border: `1px solid ${typeColor}30`,
              aspectRatio: "2.5/3.5",
              boxShadow: `0 0 30px ${typeColor}25`,
            }}>
              <img src={imgUrl} alt={displayName}
                style={{ width: "100%", height: "100%", objectFit: "contain", padding: 8 }}
                onError={e => { (e.target as HTMLImageElement).style.opacity = "0.2"; }}
              />
            </div>

            {/* Cardmarket link */}
            <a
              href={`https://www.cardmarket.com/de/Pokemon/Products/Search?searchString=${encodeURIComponent(card.name)}`}
              target="_blank" rel="noreferrer"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                marginTop: 10, padding: "8px 0", borderRadius: 10,
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 600, textDecoration: "none",
              }}
            >
              <ExternalLink size={11} /> Cardmarket
            </a>
          </div>

          {/* Details */}
          <div>
            {/* Badges row */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
              {card.types?.map(t => (
                <span key={t} style={{
                  padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                  background: `${TYPE_COLORS[t] || "#475569"}20`,
                  border: `1px solid ${TYPE_COLORS[t] || "#475569"}50`,
                  color: TYPE_COLORS[t] || "#475569",
                }}>{t}</span>
              ))}
              {card.category && (
                <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)" }}>
                  {card.category}
                </span>
              )}
              {card.stage && (
                <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)" }}>
                  {card.stage}
                </span>
              )}
              {regInfo && (
                <span style={{
                  display: "flex", alignItems: "center", gap: 4,
                  padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                  background: `${regInfo.color}15`, border: `1px solid ${regInfo.color}40`, color: regInfo.color,
                }}>
                  <Shield size={10} /> {regInfo.format} {regInfo.label}
                </span>
              )}
              {card.is_holo && (
                <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: "rgba(250,204,21,0.15)", border: "1px solid rgba(250,204,21,0.35)", color: "#FACC15" }}>
                  ✨ Holo
                </span>
              )}
            </div>

            {/* Stats grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
              <StatBox label="Set" value={card.set_id?.toUpperCase()} />
              <StatBox label="Nummer" value={`#${card.number}`} />
              {card.hp && <StatBox label="HP" value={`${card.hp} KP`} highlight />}
              {card.rarity && <StatBox label="Seltenheit" value={card.rarity} />}
              {card.illustrator && <StatBox label="Illustrator" value={card.illustrator} small />}
            </div>

            {/* Price variants */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "14px 16px", marginBottom: 12 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
                Preise (Cardmarket EUR)
              </p>

              <PriceRow label="Normal" price={card.price_market} color="#00E5FF" main />
              {card.price_low && <PriceRow label="Niedrigster Preis" price={card.price_low} color="#22C55E" />}
              {card.is_holo && holoPrice && <PriceRow label="Holo (ca.)" price={holoPrice} color="#FACC15" estimated />}
              {card.is_reverse_holo && reversePrice && <PriceRow label="Reverse Holo (ca.)" price={reversePrice} color="#A855F7" estimated />}

              {/* Trend */}
              {change !== null && (
                <div style={{ marginTop: 10, padding: "6px 10px", borderRadius: 8, background: change >= 0 ? "rgba(34,197,94,0.08)" : "rgba(238,21,21,0.08)", border: `1px solid ${change >= 0 ? "rgba(34,197,94,0.2)" : "rgba(238,21,21,0.2)"}` }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: change >= 0 ? "#22C55E" : "#EE1515" }}>
                    {change >= 0 ? "▲" : "▼"} {Math.abs(change).toFixed(1)}% vs. 30-Tage Ø
                  </span>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginLeft: 8 }}>
                    (Ø {card.price_avg30?.toFixed(2)}€)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, highlight, small }: { label: string; value?: string | null; highlight?: boolean; small?: boolean }) {
  if (!value) return null;
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "8px 12px" }}>
      <p style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>{label}</p>
      <p style={{ fontSize: small ? 11 : 14, fontWeight: 700, color: highlight ? "#00E5FF" : "white", lineHeight: 1.2 }}>{value}</p>
    </div>
  );
}

function PriceRow({ label, price, color, main, estimated }: { label: string; price: number | null; color: string; main?: boolean; estimated?: boolean }) {
  if (!price) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
        {label}{estimated && <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginLeft: 4 }}>*geschätzt</span>}
      </span>
      <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: main ? 900 : 700, fontSize: main ? 18 : 14, color }}>
        {price.toFixed(2)}€
      </span>
    </div>
  );
}
