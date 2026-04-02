// src/app/preischeck/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PreischeckPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("cards")
      .select("id, name, name_de, set_id, number, image_url, price_market")
      .or(`name.ilike.%${query}%,name_de.ilike.%${query}%`)
      .limit(20);

    if (error) {
      console.error(error);
    } else {
      setResults(data || []);
    }
    setLoading(false);
  };

  // Suche bei Enter-Taste
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="bg-[var(--bg-base)] text-[var(--tx-1)] min-h-screen pb-20">
      <div className="max-w-screen-2xl mx-auto px-10 pt-12">

        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h1 className="text-5xl font-light tracking-[-2px] mb-4">Preis checken</h1>
          <p className="text-[var(--tx-2)] text-lg">
            Gib den Namen oder die Kartennummer ein – sofort den aktuellen Wert sehen.
          </p>
        </div>

        {/* Suchfeld */}
        <div className="max-w-2xl mx-auto mb-16">
          <div className="bg-[var(--bg-1)] border border-[var(--br-2)] rounded-3xl p-2 flex items-center">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="z. B. Charizard ex, Pikachu VMAX, Gardevoir ex..."
              className="flex-1 bg-transparent outline-none px-8 py-5 text-lg placeholder-[var(--tx-3)]"
            />
            <button 
              onClick={handleSearch}
              disabled={loading}
              className="bg-[var(--g)] text-black font-medium px-10 py-5 rounded-3xl hover:bg-[#f5c16e] transition-colors disabled:opacity-70"
            >
              {loading ? "Suchen..." : "Suchen"}
            </button>
          </div>
        </div>

        {/* Ergebnisse */}
        <div className="max-w-5xl mx-auto">
          {results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((card) => {
                const name = card.name_de || card.name;
                const price = card.price_market ? `${Number(card.price_market).toFixed(2)} €` : "—";
                return (
                  <Link
                    key={card.id}
                    href={`/preischeck?q=${encodeURIComponent(name)}`}
                    className="group bg-[var(--bg-1)] border border-[var(--br-2)] rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-4 hover:border-[var(--g18)]"
                  >
                    <div className="aspect-[3/4] bg-[var(--bg-2)] flex items-center justify-center p-8">
                      <img 
                        src={card.image_url} 
                        alt={name} 
                        className="w-full h-full object-contain transition-transform group-hover:scale-105" 
                      />
                    </div>
                    <div className="px-6 py-7">
                      <div className="font-medium line-clamp-1">{name}</div>
                      <div className="text-xs text-[var(--tx-3)] mt-px">
                        {String(card.set_id).toUpperCase()} · #{card.number}
                      </div>
                      <div className="price mt-6">{price}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : query.length > 0 && !loading ? (
            <div className="text-center py-20 text-[var(--tx-3)]">
              Keine Karten gefunden für „{query}“
            </div>
          ) : null}
        </div>

      </div>
    </div>
  );
}