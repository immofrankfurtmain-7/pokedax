"use client";

import { useEffect, useState, useRef } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface TickerCard {
  name:    string;
  price:   number;
  change:  number; // % change
  set:     string;
}

// Fallback data while loading
const FALLBACK: TickerCard[] = [
  { name: "Charizard ex",    price: 189.90, change: +12.4, set: "SV1"    },
  { name: "Umbreon ex",      price: 134.50, change: +8.2,  set: "SV08.5" },
  { name: "Pikachu ex",      price: 67.20,  change: -3.1,  set: "SV9"    },
  { name: "Mewtwo ex",       price: 245.00, change: +5.7,  set: "MEW"    },
  { name: "Lugia ex",        price: 312.00, change: +18.3, set: "SV4"    },
  { name: "Rayquaza ex",     price: 98.40,  change: -1.8,  set: "SV7"    },
  { name: "Blastoise ex",    price: 89.90,  change: +3.2,  set: "MEW"    },
  { name: "Gardevoir ex",    price: 54.60,  change: +6.9,  set: "SV2"    },
  { name: "Giratina VSTAR",  price: 76.30,  change: -2.4,  set: "SV0"    },
  { name: "Mew ex",          price: 156.80, change: +11.1, set: "MEW"    },
];

function TickerItem({ card }: { card: TickerCard }) {
  const pos = card.change >= 0;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "0 20px", borderRight: "1px solid rgba(255,255,255,0.08)",
      whiteSpace: "nowrap", flexShrink: 0,
    }}>
      {/* Name */}
      <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: 11, color: "rgba(255,255,255,0.85)" }}>
        {card.name}
      </span>
      {/* Set tag */}
      <span style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: "0.05em" }}>
        {card.set}
      </span>
      {/* Price */}
      <span style={{ fontSize: 11, fontWeight: 700, color: "#00E5FF", fontFamily: "Poppins, sans-serif" }}>
        {card.price.toFixed(2)}€
      </span>
      {/* Change */}
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 2,
        fontSize: 10, fontWeight: 700,
        color: pos ? "#22C55E" : "#EE1515",
      }}>
        {pos ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
        {pos ? "+" : ""}{card.change.toFixed(1)}%
      </span>
    </span>
  );
}

export default function PriceTicker() {
  const [cards, setCards]     = useState<TickerCard[]>(FALLBACK);
  const [paused, setPaused]   = useState(false);
  const [loaded, setLoaded]   = useState(false);

  useEffect(() => {
    fetch("/api/stats/ticker")
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.cards?.length) {
          setCards(d.cards);
          setLoaded(true);
        }
      })
      .catch(() => {});
  }, []);

  // Duplicate cards for seamless loop
  const items = [...cards, ...cards, ...cards];

  return (
    <div
      style={{
        position: "sticky",
        top: 100, // below navbar
        zIndex: 39,
        height: 32,
        background: "rgba(8, 6, 18, 0.96)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(238,21,21,0.12)",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Left label */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, zIndex: 2,
        display: "flex", alignItems: "center", padding: "0 12px",
        background: "linear-gradient(90deg, rgba(238,21,21,0.15), rgba(8,6,18,0.96) 80%)",
        gap: 5, flexShrink: 0,
      }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#EE1515", animation: "pulse-dot 1.5s ease-in-out infinite" }} />
        <span style={{ fontSize: 9, fontWeight: 800, color: "#EE1515", letterSpacing: "0.15em", textTransform: "uppercase" }}>
          LIVE
        </span>
        <span style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em" }}>
          CARDMARKET
        </span>
      </div>

      {/* Scrolling content */}
      <div style={{
        display: "flex",
        alignItems: "center",
        animation: paused ? "none" : "ticker-scroll 60s linear infinite",
        paddingLeft: 100,
        willChange: "transform",
      }}>
        {items.map((card, i) => (
          <TickerItem key={`${card.name}-${i}`} card={card} />
        ))}
      </div>

      {/* Right fade */}
      <div style={{
        position: "absolute", right: 0, top: 0, bottom: 0, width: 60,
        background: "linear-gradient(90deg, transparent, rgba(8,6,18,0.96))",
        pointerEvents: "none",
      }} />

      <style>{`
        @keyframes ticker-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-33.333%); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
