"use client";

import { useEffect, useState } from "react";

interface TickerCard {
  name: string;
  price: number;
  change: number;
  set: string;
}

const FALLBACK: TickerCard[] = [
  { name: "Charizard ex", price: 312.80, change: 4.2, set: "SV1" },
  { name: "Gardevoir ex", price: 189.90, change: -1.8, set: "SV2" },
  { name: "Pikachu VMAX Rainbow", price: 142.80, change: 12.7, set: "SV9" },
  { name: "Umbreon ex", price: 134.50, change: 8.2, set: "SV08" },
  { name: "Dragonite ex", price: 98.40, change: -0.9, set: "SV7" },
];

export default function PriceTicker() {
  const [cards, setCards] = useState<TickerCard[]>(FALLBACK);
  const [paused, setPaused] = useState(false);

  // Optional: echte Daten später laden
  useEffect(() => {
    // fetch("/api/stats/ticker") ... später
  }, []);

  const items = [...cards, ...cards];

  return (
    <div className="bg-[var(--bg-1)] border-b border-[var(--br-1)] py-2.5 overflow-hidden">
      <div className="max-w-screen-2xl mx-auto px-10 flex items-center gap-10 text-xs text-[var(--g)] whitespace-nowrap overflow-hidden">
        
        <span className="font-medium tracking-[2px] text-[var(--g)]">LIVE</span>

        <div 
          className="flex items-center gap-10 animate-ticker"
          style={{ animationPlayState: paused ? "paused" : "running" }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {items.map((card, i) => (
            <span key={`${card.name}-${i}`} className="flex items-center gap-6 flex-shrink-0">
              <span className="font-medium">{card.name}</span>
              <span className="text-[var(--tx-3)] text-xs">{card.set}</span>
              <span className="price">{card.price.toFixed(2)} €</span>
              <span className={`flex items-center gap-1 text-xs ${card.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {card.change >= 0 ? "▲" : "▼"} {Math.abs(card.change)}%
              </span>
            </span>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes ticker {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-ticker {
          animation: ticker 45s linear infinite;
        }
      `}</style>
    </div>
  );
}