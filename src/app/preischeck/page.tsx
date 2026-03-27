"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, SlidersHorizontal, X, TrendingUp, TrendingDown, Minus } from "lucide-react";
import WishlistButton from "@/components/ui/WishlistButton";
import { useDebounce } from "@/hooks/useDebounce";

interface Card {
  id: string;
  name: string;
  set_id: string;
  number: string;
  rarity: string | null;
  types: string[] | null;
  image_url: string | null;
  price_market: number | null;
  price_low: number | null;
  price_avg7: number | null;
  price_avg30: number | null;
}

interface CardSet {
  id: string;
  name: string;
}

const TYPE_COLORS: Record<string, string> = {
  Fire: "#ff6b35", Water: "#4fc3f7", Grass: "#66bb6a",
  Lightning: "#ffee58", Psychic: "#ab47bc", Fighting: "#ef5350",
  Darkness: "#5c5c5c", Metal: "#90a4ae", Dragon: "#7e57c2",
  Fairy: "#f48fb1", Colorless: "#bdbdbd", Normal: "#bdbdbd",
};

function PriceTrend({ avg7, avg30 }: { avg7?: number | null; avg30?: number | null }) {
  if (!avg7 || !avg30 || avg30 === 0) return null;
  const pct = ((avg7 - avg30) / avg30) * 100;
  if (Math.abs(pct) < 1) return <Minus size={11} style={{ color: "rgba(255,255,255,0.3)" }} />;
  if (pct > 0) return (
    <span className="flex items-center gap-0.5" style={{ color: "#00ff96", fontSize: 10, fontWeight: 700 }}>
      <TrendingUp size={10} />+{pct.toFixed(0)}%
    </span>
  );
  return (
    <span className="flex items-center gap-0.5" style={{ color: "#ff4444", fontSize: 10, fontWeight: 700 }}>
      <TrendingDown size={10} />{pct.toFixed(0)}%
    </span>
  );
}

function CardItem({ card }: { card: Card }) {
  const typeColor = card.types?.[0] ? (TYPE_COLORS[card.types[0]] || "#c864ff") : "#c864ff";
  const imgUrl = card.image_url || `https://assets.tcgdex.net/en/${card.set_id}/${card.number}/low.webp`;

  return (
    <div
      className="group relative overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1.5"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
        border: `1px solid ${typeColor}25`,
        boxShadow: `0 0 20px ${typeColor}10`,
      }}
    >
      {/* Holo shimmer */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10"
        style={{
          background: "linear-gradient(125deg, transparent 20%, rgba(255,255,255,0.06) 45%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.06) 55%, transparent 80%)",
        }}
      />

      {/* Card image */}
      <div className="relative" style={{ aspectRatio: "2.5/3.5", background: "rgba(0,0,0,0.3)" }}>
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={card.name}
            className="w-full h-full object-contain p-2"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ color: "rgba(255,255,255,0.1)", fontSize: 40 }}>
            ◎
          </div>
        )}

        {/* Type glow at bottom of image */}
        <div
          className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none"
          style={{ background: `linear-gradient(0deg, ${typeColor}20, transparent)` }}
        />

        {/* Wishlist button - top right corner overlay */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <WishlistButton cardId={card.id} />
        </div>

        {/* Rarity badge */}
        {card.rarity && (
          <div
            className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md"
            style={{
              background: "rgba(0,0,0,0.7)",
              border: `1px solid ${typeColor}40`,
              color: typeColor,
              fontSize: 9,
              fontWeight: 700,
              backdropFilter: "blur(4px)",
            }}
          >
            {card.rarity}
          </div>
        )}
      </div>

      {/* Card info */}
      <div className="p-3">
        {/* Type pill */}
        {card.types?.[0] && (
          <div className="flex items-center gap-1 mb-1.5">
            <span
              className="px-2 py-0.5 rounded-full text-white"
              style={{ background: `${typeColor}30`, border: `1px solid ${typeColor}50`, fontSize: 9, fontWeight: 700 }}
            >
              {card.types[0]}
            </span>
          </div>
        )}

        <p className="font-bold text-white mb-0.5 leading-tight" style={{ fontSize: 13 }}>
          {card.name}
        </p>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, marginBottom: 8 }}>
          {card.set_id?.toUpperCase()} · #{card.number}
        </p>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div>
            {card.price_market ? (
              <>
                <p className="font-black" style={{ color: "#00ffff", fontSize: 16, lineHeight: 1 }}>
                  {card.price_market.toFixed(2)}€
                </p>
                <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 9, marginTop: 1 }}>Marktpreis</p>
              </>
            ) : card.price_low ? (
              <>
                <p className="font-black" style={{ color: "#00ff96", fontSize: 16, lineHeight: 1 }}>
                  ab {card.price_low.toFixed(2)}€
                </p>
                <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 9, marginTop: 1 }}>Mindestpreis</p>
              </>
            ) : (
              <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 12 }}>Kein Preis</p>
            )}
          </div>
          <PriceTrend avg7={card.price_avg7} avg30={card.price_avg30} />
        </div>
      </div>
    </div>
  );
}

export default function PreischeckPage() {
  const [query, setQuery] = useState("");
  const [cards, setCards] = useState<Card[]>([]);
  const [sets, setSets] = useState<CardSet[]>([]);
  const [selectedSet, setSelectedSet] = useState("");
  const [sortBy, setSortBy] = useState("price_desc");
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searched, setSearched] = useState(false);

  const debouncedQuery = useDebounce(query, 350);

  useEffect(() => {
    fetch("/api/cards/sets").then(r => r.json()).then(d => setSets(d.sets || []));
  }, []);

  useEffect(() => {
    if (debouncedQuery.length < 2 && !selectedSet) {
      setCards([]);
      setSearched(false);
      return;
    }
    search();
  }, [debouncedQuery, selectedSet, sortBy]);

  async function search() {
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams();
      if (debouncedQuery) params.set("q", debouncedQuery);
      if (selectedSet) params.set("set", selectedSet);
      params.set("sort", sortBy);
      params.set("limit", "48");
      const res = await fetch(`/api/cards/search?${params}`);
      const data = await res.json();
      setCards(data.cards || []);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(180deg, #080010 0%, #0d0020 50%, #050010 100%)", color: "white" }}
    >
      {/* Header */}
      <div
        className="sticky top-14 z-30"
        style={{
          background: "rgba(8,0,16,0.95)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(0,255,255,0.5), transparent)" }} />
        <div className="max-w-7xl mx-auto px-4 py-3">
          {/* Title row */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="font-black" style={{
                fontSize: 22, background: "linear-gradient(135deg, #ffffff, #00ffff)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "-0.02em",
              }}>
                Preischeck
              </h1>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>
                {cards.length > 0 ? `${cards.length} Karten gefunden` : "Über 22.000 Karten durchsuchen"}
              </p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all"
              style={{
                background: showFilters ? "rgba(0,255,255,0.1)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${showFilters ? "rgba(0,255,255,0.3)" : "rgba(255,255,255,0.1)"}`,
                color: showFilters ? "#00ffff" : "rgba(255,255,255,0.5)",
                fontSize: 13, cursor: "pointer",
              }}
            >
              <SlidersHorizontal size={14} />
              <span className="hidden sm:inline">Filter</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "rgba(255,255,255,0.35)" }} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Kartenname eingeben... (z.B. Charizard, Pikachu)"
              className="w-full pl-11 pr-10 py-3 rounded-xl focus:outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: query ? "1px solid rgba(0,255,255,0.4)" : "1px solid rgba(255,255,255,0.1)",
                color: "white", fontSize: 14,
                boxShadow: query ? "0 0 16px rgba(0,255,255,0.1)" : "none",
              }}
            />
            {query && (
              <button onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer" }}>
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="flex flex-wrap gap-3 mt-3">
              <select
                value={selectedSet}
                onChange={(e) => setSelectedSet(e.target.value)}
                className="px-3 py-2 rounded-xl focus:outline-none"
                style={{
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "white", fontSize: 13, cursor: "pointer",
                }}
              >
                <option value="">Alle Sets</option>
                {sets.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-xl focus:outline-none"
                style={{
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "white", fontSize: 13, cursor: "pointer",
                }}
              >
                <option value="price_desc">Preis: Hoch → Niedrig</option>
                <option value="price_asc">Preis: Niedrig → Hoch</option>
                <option value="name_asc">Name A → Z</option>
                <option value="trend_desc">Größter Preisanstieg</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Empty state */}
        {!searched && (
          <div className="text-center py-20">
            <div style={{ fontSize: 60, marginBottom: 16, filter: "drop-shadow(0 0 20px rgba(0,255,255,0.3))" }}>🔍</div>
            <h2 className="text-xl font-bold text-white mb-2">Karte suchen</h2>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 14 }}>
              Mindestens 2 Zeichen eingeben oder ein Set auswählen
            </p>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="rounded-2xl animate-pulse"
                style={{ background: "rgba(255,255,255,0.05)", aspectRatio: "2.5/3.5" }} />
            ))}
          </div>
        )}

        {/* Results */}
        {!loading && searched && cards.length === 0 && (
          <div className="text-center py-20">
            <div style={{ fontSize: 50, marginBottom: 16 }}>😕</div>
            <h2 className="text-lg font-bold text-white mb-2">Keine Karten gefunden</h2>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 14 }}>Anderen Suchbegriff oder anderes Set ausprobieren</p>
          </div>
        )}

        {!loading && cards.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {cards.map((card) => (
              <CardItem key={card.id} card={card} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
