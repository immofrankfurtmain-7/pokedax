// src/app/portfolio/page.tsx
"use client";

import { useState } from "react";

export default function PortfolioPage() {
  const [timeframe, setTimeframe] = useState<"7" | "30" | "90">("30");

  const portfolioValue = 2847.60;
  const valueChange = 18.4;

  const cards = [
    { name: "Gardevoir ex", set: "SV2", number: "245", price: 189.90, count: 1 },
    { name: "Charizard ex", set: "SV1", number: "234", price: 312.80, count: 1 },
    { name: "Pikachu VMAX Rainbow", set: "SV9", number: "188", price: 142.80, count: 2 },
    { name: "Umbreon ex", set: "SV08", number: "215", price: 134.50, count: 1 },
  ];

  return (
    <div className="bg-[var(--bg-base)] text-[var(--tx-1)] min-h-screen pb-20">
      <div className="max-w-screen-2xl mx-auto px-10 pt-12">

        {/* Header */}
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-5xl font-light tracking-[-2px]">Mein Portfolio</h1>
            <p className="text-[var(--tx-2)] mt-2">Übersicht deiner Sammlung und Wertentwicklung</p>
          </div>
          <div className="text-right">
            <div className="text-6xl font-light tracking-tighter">{portfolioValue.toFixed(2)} €</div>
            <div className={`text-sm mt-1 ${valueChange >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              ▲ +{valueChange}% · letzte 30 Tage
            </div>
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="flex gap-2 mb-10">
          {["7", "30", "90"].map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t as "7" | "30" | "90")}
              className={`px-6 py-2.5 rounded-2xl text-sm font-medium transition-all ${
                timeframe === t 
                  ? "bg-[var(--g)] text-black" 
                  : "bg-[var(--bg-1)] border border-[var(--br-2)] hover:border-[var(--g18)]"
              }`}
            >
              {t} Tage
            </button>
          ))}
        </div>

        {/* Portfolio Value Chart Placeholder */}
        <div className="bg-[var(--bg-1)] border border-[var(--br-2)] rounded-3xl p-10 mb-12">
          <div className="h-80 flex items-end justify-center text-[var(--tx-3)]">
            <div className="text-center">
              <div className="text-sm mb-2">Wertentwicklung</div>
              <div className="text-4xl font-light tracking-tight text-[var(--g)]">+18,4 %</div>
              <div className="text-xs mt-8">Sparkline wird hier später mit echten Daten angezeigt</div>
            </div>
          </div>
        </div>

        {/* Meine Karten */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-light">Meine Karten ({cards.length})</h2>
            <span className="text-sm text-[var(--tx-3)]">Gesamtwert: {portfolioValue.toFixed(2)} €</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card, i) => (
              <div key={i} className="bg-[var(--bg-1)] border border-[var(--br-2)] rounded-3xl overflow-hidden group hover:border-[var(--g18)] transition-all">
                <div className="aspect-[3/4] bg-[var(--bg-2)] flex items-center justify-center p-8">
                  <div className="w-full h-full bg-black/30 rounded-2xl"></div>
                </div>
                <div className="px-6 py-7">
                  <div className="font-medium">{card.name}</div>
                  <div className="text-xs text-[var(--tx-3)] mt-px">{card.set} • #{card.number}</div>
                  <div className="flex justify-between mt-6">
                    <div>
                      <div className="text-xs text-[var(--tx-3)]">Anzahl</div>
                      <div className="font-medium">{card.count}x</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-[var(--tx-3)]">Aktueller Wert</div>
                      <div className="price">{(card.price * card.count).toFixed(2)} €</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}