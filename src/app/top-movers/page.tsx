import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { TrendingUp, TrendingDown, ArrowLeft, Flame, ExternalLink } from "lucide-react";
import type { Metadata } from "next";

export const revalidate = 3600; // stündlich neu

export const metadata: Metadata = {
  title: "Top Movers – Größte Preisbewegungen | PokéDax",
  description: "Pokémon TCG Karten mit den größten Preisveränderungen heute. Live Cardmarket EUR Preise – täglich aktualisiert.",
  openGraph: {
    title:       "Top Movers – Pokémon TCG Preisbewegungen",
    description: "Welche Karten steigen gerade? Live Cardmarket EUR Daten.",
    type:        "website",
  },
};

interface Card {
  id: string; name: string; set_id: string; number: string;
  rarity: string | null; types: string[] | null; image_url: string | null;
  price_market: number | null; price_avg7: number | null; price_avg30: number | null;
}

const TYPE_COLORS: Record<string, string> = {
  Fire:"#F97316", Water:"#3B82F6", Grass:"#22C55E", Lightning:"#FACC15",
  Psychic:"#A855F7", Fighting:"#EF4444", Darkness:"#6B7280", Metal:"#9CA3AF",
  Dragon:"#7C3AED", Colorless:"#CBD5E1",
};

function getPct(avg7: number | null, avg30: number | null): number | null {
  if (!avg7 || !avg30 || avg30 === 0) return null;
  return ((avg7 - avg30) / avg30) * 100;
}

function CardRow({ card, rank }: { card: Card; rank: number }) {
  const pct      = getPct(card.price_avg7, card.price_avg30);
  const positive = (pct ?? 0) >= 0;
  const typeColor = card.types?.[0] ? (TYPE_COLORS[card.types[0]] || "#475569") : "#475569";
  const imgUrl   = card.image_url || `https://assets.tcgdex.net/en/${card.set_id}/${card.number}/low.webp`;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 16, padding: "14px 20px",
      background: "rgba(255,255,255,0.03)", border: `1px solid ${typeColor}18`,
      borderRadius: 14, marginBottom: 8, transition: "all .2s",
    }}
    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLDivElement).style.borderColor = typeColor + "35"; }}
    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.03)"; (e.currentTarget as HTMLDivElement).style.borderColor = typeColor + "18"; }}
    >
      {/* Rank */}
      <div style={{
        width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: rank <= 3 ? "rgba(250,204,21,0.15)" : "rgba(255,255,255,0.05)",
        border: rank <= 3 ? "1px solid rgba(250,204,21,0.3)" : "1px solid rgba(255,255,255,0.08)",
        fontFamily: "Poppins, sans-serif", fontWeight: 800, fontSize: 14,
        color: rank <= 3 ? "#FACC15" : "rgba(255,255,255,0.4)",
      }}>#{rank}</div>

      {/* Image */}
      <div style={{ width: 44, height: 60, borderRadius: 6, overflow: "hidden", flexShrink: 0, background: `${typeColor}15` }}>
        <img src={imgUrl} alt={card.name}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: 15, color: "white", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {card.name}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{card.set_id?.toUpperCase()} · #{card.number}</span>
          {card.rarity && (
            <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 4, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}>
              {card.rarity}
            </span>
          )}
          {card.types?.[0] && (
            <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 4, background: `${typeColor}20`, color: typeColor }}>
              {card.types[0]}
            </span>
          )}
        </div>
      </div>

      {/* Price + Change */}
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 900, fontSize: 18, color: "#00E5FF", lineHeight: 1, marginBottom: 4 }}>
          {card.price_market?.toFixed(2)}€
        </p>
        {pct !== null && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4, fontSize: 13, fontWeight: 700, color: positive ? "#22C55E" : "#EE1515" }}>
            {positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {positive ? "+" : ""}{pct.toFixed(1)}%
          </div>
        )}
        {card.price_avg30 && (
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 2 }}>
            vs. 30T Ø {card.price_avg30.toFixed(2)}€
          </p>
        )}
      </div>

      {/* Cardmarket link */}
      <a
        href={`https://www.cardmarket.com/de/Pokemon/Cards?searchString=${encodeURIComponent(card.name)}`}
        target="_blank" rel="noreferrer"
        style={{ color: "rgba(255,255,255,0.2)", flexShrink: 0, display: "flex" }}
        onClick={e => e.stopPropagation()}
      >
        <ExternalLink size={14} />
      </a>
    </div>
  );
}

export default async function TopMoversPage() {
  const supabase = await createClient();

  // Fetch cards with price data - safe with error handling
  let allCards: Card[] = [];
  try {
    const { data, error } = await supabase
      .from("cards")
      .select("id, name, set_id, number, rarity, types, image_url, price_market, price_avg7, price_avg30")
      .not("price_market", "is", null)
      .gt("price_market", 1)
      .limit(500);
    if (!error && data) allCards = data;
  } catch (e) {
    console.error("Top movers fetch error:", e);
  }

  // Calculate % change and sort - only cards with both price fields
  const withPct = allCards
    .filter(c => c.price_avg7 && c.price_avg30 && c.price_avg30 > 0)
    .map(c => ({ ...c, pct: getPct(c.price_avg7, c.price_avg30) ?? 0 }))
    .filter(c => Math.abs(c.pct) > 0.5);

  const topGainers = [...withPct].sort((a, b) => b.pct - a.pct).slice(0, 20);
  const topLosers  = [...withPct].sort((a, b) => a.pct - b.pct).slice(0, 10);

  return (
    <div style={{ minHeight: "100vh", color: "white" }}>
      {/* Header */}
      <div style={{ background: "rgba(10,10,10,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "20px 20px 16px", position: "sticky", top: 88, zIndex: 30 }}>
        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(34,197,94,0.5), transparent)", marginBottom: 16 }} />
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.3)", fontSize: 13, textDecoration: "none", marginBottom: 12 }}>
            <ArrowLeft size={14} /> Startseite
          </Link>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <Flame size={14} style={{ color: "#EE1515" }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: "#EE1515", letterSpacing: "0.15em", textTransform: "uppercase" }}>Live Cardmarket EUR</span>
              </div>
              <h1 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 900, fontSize: "clamp(24px, 4vw, 36px)", letterSpacing: "-0.02em" }}>
                Top Movers
              </h1>
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, marginTop: 4 }}>
                Größte Preisbewegungen · 7-Tage vs. 30-Tage Durchschnitt
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginBottom: 2 }}>Stündlich aktualisiert</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>{topGainers.length + topLosers.length} Karten analysiert</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px" }}>

        {/* Top Gainers */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div style={{ width: 4, height: 24, borderRadius: 2, background: "#22C55E" }} />
            <div>
              <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 800, fontSize: 20, color: "white" }}>
                🚀 Größte Gewinner
              </h2>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>Stärkste Preissteigerung der letzten 7 Tage</p>
            </div>
          </div>

          {topGainers.length === 0 ? (
            <div style={{ padding: "40px 0", textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 14 }}>
              Noch keine Daten verfügbar
            </div>
          ) : (
            topGainers.map((card, i) => (
              <Link key={card.id} href={`/preischeck?q=${encodeURIComponent(card.name)}`} style={{ display: "block", textDecoration: "none" }}>
                <CardRow card={card} rank={i + 1} />
              </Link>
            ))
          )}
        </div>

        {/* Top Losers */}
        {topLosers.length > 0 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{ width: 4, height: 24, borderRadius: 2, background: "#EE1515" }} />
              <div>
                <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 800, fontSize: 20, color: "white" }}>
                  📉 Stärkste Verlierer
                </h2>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>Stärkster Preisrückgang der letzten 7 Tage</p>
              </div>
            </div>
            {topLosers.map((card, i) => (
              <Link key={card.id} href={`/preischeck?q=${encodeURIComponent(card.name)}`} style={{ display: "block", textDecoration: "none" }}>
                <CardRow card={card} rank={i + 1} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
