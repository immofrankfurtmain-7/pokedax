"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const GOLD = "#C9A66B";
const BG   = "#0A0A0A";
const BG2  = "#111111";
const BG3  = "#1A1A1A";
const TX   = "#EDE9E0";
const TX2  = "rgba(237,233,224,0.7)";
const GD2  = "rgba(201,166,107,0.7)";

const SB = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SetDetailPage() {
  const { id } = useParams();
  const [cards,   setCards]   = useState<any[]>([]);
  const [setInfo, setSetInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sort,    setSort]    = useState<"number"|"price_desc"|"price_asc">("number");
  const [query,   setQuery]   = useState("");

  useEffect(() => {
    if (!id) return;
    loadSet();
  }, [id, sort]);

  async function loadSet() {
    setLoading(true);
    const [{ data: setData }, { data: cardsData }] = await Promise.all([
      SB.from("sets").select("id,name,name_de,series,card_count,release_date").eq("id", id as string).single(),
      SB.from("cards").select("id,name,name_de,number,image_url,price_market,price_avg7,rarity,types,is_holo").eq("set_id", id as string).limit(500),
    ]);
    if (setData) setSetInfo(setData);
    let sorted = cardsData || [];
    if (sort === "number") sorted = [...sorted].sort((a,b) => (parseInt(a.number)||0) - (parseInt(b.number)||0));
    else if (sort === "price_desc") sorted = [...sorted].sort((a,b) => (b.price_market||0) - (a.price_market||0));
    else sorted = [...sorted].sort((a,b) => (a.price_market||0) - (b.price_market||0));
    setCards(sorted);
    setLoading(false);
  }

  const filtered = query ? cards.filter(c => (c.name_de||c.name).toLowerCase().includes(query.toLowerCase()) || c.number.includes(query)) : cards;

  return (
    <div style={{ background: BG, minHeight: "100vh", color: TX }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;700&display=swap');
        .ph { font-family:'Playfair Display',serif; letter-spacing:-0.05em; }
        .card-tile { background:#111111; border:1px solid rgba(255,255,255,0.06); border-radius:20px; overflow:hidden; text-decoration:none; display:block; transition:transform 0.25s cubic-bezier(0.22,1,0.36,1),border-color 0.2s,box-shadow 0.25s; }
        .card-tile:hover { transform:translateY(-6px) scale(1.02); border-color:rgba(201,166,107,0.3); box-shadow:0 20px 50px rgba(0,0,0,0.5); }
        .sort-btn { padding:9px 18px; border-radius:100px; border:1px solid transparent; font-size:12px; cursor:pointer; transition:all 0.15s; background:transparent; }
        .sort-btn.active { background:rgba(201,166,107,0.1); border-color:rgba(201,166,107,0.3); color:#C9A66B; font-weight:600; }
        .sort-btn:not(.active) { color:rgba(237,233,224,0.5); }
        @keyframes skeleton { 0%,100%{opacity:.3} 50%{opacity:.6} }
        .skel { animation:skeleton 1.5s ease-in-out infinite; border-radius:20px; background:#111; }
      `}</style>

      <div style={{ maxWidth: 1600, margin: "0 auto", padding: "clamp(60px,8vw,100px) clamp(20px,4vw,48px)" }}>

        {/* Breadcrumb */}
        <div style={{ marginBottom: 40, display: "flex", gap: 8, alignItems: "center", fontSize: 13, color: "rgba(237,233,224,0.4)" }}>
          <Link href="/sets" style={{ color: "rgba(237,233,224,0.4)", textDecoration: "none" }}>← Alle Sets</Link>
        </div>

        {/* Header */}
        <div style={{ marginBottom: 48, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: GD2, marginBottom: 12 }}>
              {setInfo?.series || "Set"} · {(id as string)?.toUpperCase()}
            </div>
            <h1 className="ph" style={{ fontSize: "clamp(36px,5vw,72px)", fontWeight: 500, color: TX, lineHeight: 1 }}>
              {setInfo?.name_de || setInfo?.name || id}
            </h1>
            {!loading && (
              <div style={{ fontSize: 14, color: TX2, marginTop: 10 }}>
                {filtered.length} Karten{setInfo?.card_count ? ` von ${setInfo.card_count}` : ""}
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {/* Filter */}
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Karte filtern…"
              style={{ padding: "10px 18px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 100, color: TX, fontSize: 13, outline: "none", fontFamily: "inherit", width: 180 }}/>
            {/* Sort */}
            {(["number","price_desc","price_asc"] as const).map(v => (
              <button key={v} className={`sort-btn${sort===v?" active":""}`} onClick={() => setSort(v)}>
                {v==="number"?"Nr. ↑":v==="price_desc"?"Preis ↓":"Preis ↑"}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))", gap: 18 }}>
          {loading ? (
            Array.from({ length: 20 }).map((_,i) => (
              <div key={i} className="skel" style={{ aspectRatio: "3/5" }}/>
            ))
          ) : filtered.length === 0 ? (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px 0", color: TX2 }}>Keine Karten gefunden</div>
          ) : (
            filtered.map(card => {
              const imgSrc = card.image_url ? (card.image_url.includes(".") ? card.image_url : card.image_url + "/low.webp") : null;
              return (
                <Link key={card.id} href={`/preischeck/${card.id}`} className="card-tile">
                  <div style={{ padding: "8px 8px 0", background: BG3 }}>
                    <div style={{ aspectRatio: "3/4", borderRadius: 12, overflow: "hidden", background: "#0D0D0D", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                      {imgSrc ? (
                        <img src={imgSrc} alt={card.name_de||card.name} loading="lazy"
                          style={{ width: "100%", height: "100%", objectFit: "contain" }}
                          onError={e => { (e.target as HTMLImageElement).style.display="none"; }}/>
                      ) : (
                        <div style={{ fontSize: 28, opacity: 0.1 }}>◎</div>
                      )}
                      <div style={{ position: "absolute", bottom: 5, right: 7, fontSize: 9, color: "rgba(237,233,224,0.25)", background: "rgba(0,0,0,0.5)", padding: "1px 5px", borderRadius: 4 }}>#{card.number}</div>
                    </div>
                  </div>
                  <div style={{ padding: "10px 12px 14px" }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: TX, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 3 }}>{card.name_de || card.name}</div>
                    <div style={{ fontSize: 10, color: "rgba(237,233,224,0.3)", marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{card.rarity || "–"}</div>
                    <div style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 600, color: card.price_market ? GOLD : "rgba(237,233,224,0.25)" }}>
                      {card.price_market ? card.price_market.toLocaleString("de-DE", { minimumFractionDigits: 2 }) + " €" : "–"}
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
