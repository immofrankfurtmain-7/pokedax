"use client";

import { useState, useEffect } from "react";
import { Search, X, TrendingUp, TrendingDown } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

interface Card {
  id: string; name: string; set_id: string; number: string;
  rarity: string | null; types: string[] | null; image_url: string | null;
  price_market: number | null; price_low: number | null;
  price_avg7: number | null; price_avg30: number | null;
}
interface CardSet { id: string; name: string; }

const TYPES = [
  { id:"Fire",      label:"Feuer",      emoji:"🔥", color:"#F97316", glow:"rgba(249,115,22,0.3)"  },
  { id:"Water",     label:"Wasser",     emoji:"💧", color:"#3B82F6", glow:"rgba(59,130,246,0.3)"  },
  { id:"Grass",     label:"Pflanze",    emoji:"🌿", color:"#22C55E", glow:"rgba(34,197,94,0.3)"   },
  { id:"Lightning", label:"Elektro",    emoji:"⚡", color:"#FACC15", glow:"rgba(250,204,21,0.3)"  },
  { id:"Psychic",   label:"Psycho",     emoji:"🔮", color:"#A855F7", glow:"rgba(168,85,247,0.3)"  },
  { id:"Fighting",  label:"Kampf",      emoji:"👊", color:"#EF4444", glow:"rgba(239,68,68,0.3)"   },
  { id:"Darkness",  label:"Finsternis", emoji:"🌑", color:"#6B7280", glow:"rgba(107,114,128,0.3)" },
  { id:"Metal",     label:"Metall",     emoji:"⚙️", color:"#9CA3AF", glow:"rgba(156,163,175,0.3)" },
  { id:"Dragon",    label:"Drache",     emoji:"🐉", color:"#7C3AED", glow:"rgba(124,58,237,0.3)"  },
  { id:"Colorless", label:"Farblos",    emoji:"⭐", color:"#CBD5E1", glow:"rgba(203,213,225,0.3)" },
];

const RARITY_DOTS: Record<string,number> = {
  "Common":1,"Uncommon":2,"Rare":3,"Rare Holo":4,"Rare Holo EX":5,"Ultra Rare":6,"Secret Rare":6,
};

function RarityDots({ rarity }: { rarity: string | null }) {
  if (!rarity) return null;
  const dots = RARITY_DOTS[rarity] ?? (rarity.includes("Rare") ? 3 : 1);
  const max  = 5;
  return (
    <div style={{ display:"flex", gap:2 }}>
      {Array.from({ length: max }).map((_, i) => (
        <div key={i} style={{
          width: i < dots ? 5 : 4, height: i < dots ? 5 : 4, borderRadius:"50%",
          background: i < dots ? "#FACC15" : "rgba(255,255,255,0.12)",
          boxShadow: i < dots ? "0 0 3px rgba(250,204,21,0.5)" : "none",
        }} />
      ))}
    </div>
  );
}

function PokeballLoader() {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:14, padding:"64px 0" }}>
      <div style={{ animation:"pb-spin 1s linear infinite", filter:"drop-shadow(0 0 12px rgba(238,21,21,0.5))" }}>
        <svg width="52" height="52" viewBox="0 0 52 52">
          <circle cx="26" cy="26" r="24" fill="#EE1515"/>
          <path d="M 2 26 A 24 24 0 0 1 50 26 Z" fill="white"/>
          <rect x="2" y="23.5" width="48" height="5" fill="#111"/>
          <circle cx="26" cy="26" r="8" fill="#111"/>
          <circle cx="26" cy="26" r="5" fill="white"/>
          <circle cx="26" cy="26" r="2.5" fill="#eee" style={{ animation:"pb-pulse 1s ease-in-out infinite" }}/>
        </svg>
      </div>
      <p style={{ color:"rgba(255,255,255,0.35)", fontSize:13 }}>Karten werden geladen...</p>
      <style>{`@keyframes pb-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}@keyframes pb-pulse{0%,100%{opacity:1}50%{opacity:0.2}}`}</style>
    </div>
  );
}

function CardItem({ card }: { card: Card }) {
  const typeConf  = TYPES.find(t => t.id === card.types?.[0]);
  const typeColor = typeConf?.color || "#475569";
  const typeGlow  = typeConf?.glow  || "transparent";
  const imgUrl    = card.image_url || `https://assets.tcgdex.net/en/${card.set_id}/${card.number}/low.webp`;
  const change    = card.price_avg7 && card.price_avg30 && card.price_avg30 > 0
    ? ((card.price_avg7 - card.price_avg30) / card.price_avg30) * 100 : null;

  return (
    <div style={{ background:"rgba(255,255,255,0.04)", border:`1px solid ${typeColor}25`, borderRadius:16, overflow:"hidden", cursor:"pointer", position:"relative", transition:"transform .2s, box-shadow .2s" }}
      onMouseEnter={e=>{ (e.currentTarget as HTMLDivElement).style.transform="translateY(-5px)"; (e.currentTarget as HTMLDivElement).style.boxShadow=`0 8px 28px ${typeGlow},0 0 0 1px ${typeColor}40`; }}
      onMouseLeave={e=>{ (e.currentTarget as HTMLDivElement).style.transform="translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow="none"; }}
    >
      {/* Image */}
      <div style={{ background:`linear-gradient(180deg,${typeColor}10,rgba(0,0,0,0.4))`, aspectRatio:"2.5/3.5", position:"relative" }}>
        <img src={imgUrl} alt={card.name} style={{ width:"100%", height:"100%", objectFit:"contain", padding:6 }} loading="lazy"
          onError={e=>{(e.target as HTMLImageElement).style.display="none"}} />
        {typeConf && (
          <div style={{ position:"absolute", top:6, left:6, padding:"2px 7px", borderRadius:6, background:`${typeColor}30`, border:`1px solid ${typeColor}60`, fontSize:9, fontWeight:700, color:typeColor, backdropFilter:"blur(4px)" }}>
            {typeConf.emoji} {typeConf.label}
          </div>
        )}
        {card.rarity && (
          <div style={{ position:"absolute", top:6, right:6, padding:"2px 6px", borderRadius:5, background:"rgba(0,0,0,0.65)", fontSize:8, fontWeight:700, color:"rgba(255,255,255,0.55)" }}>
            {card.rarity}
          </div>
        )}
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:36, background:`linear-gradient(0deg,${typeColor}30,transparent)`, pointerEvents:"none" }} />
      </div>

      {/* Info */}
      <div style={{ padding:"10px 12px" }}>
        <p style={{ fontWeight:700, fontSize:13, color:"white", marginBottom:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{card.name}</p>
        <p style={{ fontSize:10, color:"rgba(255,255,255,0.3)", marginBottom:6 }}>{card.set_id?.toUpperCase()} · #{card.number}</p>
        <div style={{ marginBottom:8 }}><RarityDots rarity={card.rarity} /></div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            {card.price_market
              ? <p style={{ fontFamily:"Poppins,sans-serif", fontWeight:900, fontSize:16, color:"#00E5FF", lineHeight:1 }}>{card.price_market.toFixed(2)}€</p>
              : card.price_low
              ? <p style={{ fontFamily:"Poppins,sans-serif", fontWeight:900, fontSize:14, color:"#22C55E", lineHeight:1 }}>ab {card.price_low.toFixed(2)}€</p>
              : <p style={{ fontSize:11, color:"rgba(255,255,255,0.2)" }}>Kein Preis</p>
            }
          </div>
          {change !== null && (
            <div style={{ display:"flex", alignItems:"center", gap:2, fontSize:10, fontWeight:700, color:change>=0?"#22C55E":"#EE1515" }}>
              {change >= 0 ? <TrendingUp size={10}/> : <TrendingDown size={10}/>}
              {Math.abs(change).toFixed(1)}%
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PreischeckPage() {
  const [query,        setQuery]        = useState("");
  const [cards,        setCards]        = useState<Card[]>([]);
  const [sets,         setSets]         = useState<CardSet[]>([]);
  const [selectedSet,  setSelectedSet]  = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [sortBy,       setSortBy]       = useState("price_desc");
  const [loading,      setLoading]      = useState(false);
  const [searched,     setSearched]     = useState(false);
  const debouncedQuery = useDebounce(query, 350);

  useEffect(() => { fetch("/api/cards/sets").then(r=>r.json()).then(d=>setSets(d.sets||[])); }, []);

  useEffect(() => {
    if (debouncedQuery.length < 2 && !selectedSet && !selectedType) { setCards([]); setSearched(false); return; }
    search();
  }, [debouncedQuery, selectedSet, selectedType, sortBy]);

  async function search() {
    setLoading(true); setSearched(true);
    try {
      const p = new URLSearchParams();
      if (debouncedQuery) p.set("q", debouncedQuery);
      if (selectedSet)    p.set("set", selectedSet);
      if (selectedType)   p.set("type", selectedType);
      p.set("sort", sortBy); p.set("limit", "48");
      const data = await fetch(`/api/cards/search?${p}`).then(r=>r.json());
      setCards(data.cards || []);
    } finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight:"100vh", color:"white" }}>
      {/* Sticky search header */}
      <div style={{ position:"sticky", top:88, zIndex:30, background:"rgba(10,10,10,0.96)", backdropFilter:"blur(20px)", borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ height:1, background:"linear-gradient(90deg,transparent,rgba(0,229,255,0.5),transparent)" }} />
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"14px 20px" }}>
          <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom:12 }}>
            <div>
              <h1 style={{ fontFamily:"Poppins,sans-serif", fontWeight:900, fontSize:22, letterSpacing:"-0.02em", background:"linear-gradient(135deg,#fff,#00E5FF)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Preischeck</h1>
              <p style={{ color:"rgba(255,255,255,0.3)", fontSize:11 }}>{cards.length > 0 ? `${cards.length} Karten` : "22.271 Karten · Live Cardmarket EUR"}</p>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <select value={selectedSet} onChange={e=>setSelectedSet(e.target.value)} style={{ padding:"6px 10px", borderRadius:8, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", color:"white", fontSize:12, cursor:"pointer" }}>
                <option value="">Alle Sets</option>
                {sets.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{ padding:"6px 10px", borderRadius:8, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", color:"white", fontSize:12, cursor:"pointer" }}>
                <option value="price_desc">Preis ↓</option>
                <option value="price_asc">Preis ↑</option>
                <option value="name_asc">Name A→Z</option>
                <option value="trend_desc">Trend ↑</option>
              </select>
            </div>
          </div>

          {/* Search */}
          <div style={{ position:"relative", marginBottom:10 }}>
            <Search size={15} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:"rgba(255,255,255,0.35)", pointerEvents:"none" }} />
            <input type="text" value={query} onChange={e=>setQuery(e.target.value)}
              placeholder="Kartenname… z.B. Charizard, Pikachu, Mewtwo"
              style={{ width:"100%", paddingLeft:40, paddingRight:36, paddingTop:10, paddingBottom:10, borderRadius:10, background:"rgba(255,255,255,0.06)", border:query?"1px solid rgba(0,229,255,0.4)":"1px solid rgba(255,255,255,0.1)", color:"white", fontSize:14, outline:"none" }} />
            {query && <button onClick={()=>setQuery("")} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"rgba(255,255,255,0.3)", cursor:"pointer" }}><X size={13}/></button>}
          </div>

          {/* Type filter chips */}
          <div style={{ display:"flex", gap:5, overflowX:"auto", paddingBottom:2 }}>
            <button onClick={()=>setSelectedType("")} style={{ padding:"4px 12px", borderRadius:20, border:"none", cursor:"pointer", background:!selectedType?"rgba(255,255,255,0.15)":"rgba(255,255,255,0.05)", color:!selectedType?"white":"rgba(255,255,255,0.4)", fontSize:11, fontWeight:600, whiteSpace:"nowrap", flexShrink:0 }}>Alle</button>
            {TYPES.map(t=>(
              <button key={t.id} onClick={()=>setSelectedType(selectedType===t.id?"":t.id)} style={{ padding:"4px 10px", borderRadius:20, cursor:"pointer", whiteSpace:"nowrap", flexShrink:0, background:selectedType===t.id?`${t.color}25`:"rgba(255,255,255,0.04)", border:`1px solid ${selectedType===t.id?t.color+"60":"rgba(255,255,255,0.08)"}`, color:selectedType===t.id?t.color:"rgba(255,255,255,0.4)", fontSize:11, fontWeight:600, boxShadow:selectedType===t.id?`0 0 8px ${t.glow}`:"none" }}>
                {t.emoji} {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"24px 20px" }}>
        {!searched && (
          <div style={{ textAlign:"center", padding:"64px 0" }}>
            <div style={{ fontSize:52, marginBottom:14, filter:"drop-shadow(0 0 20px rgba(0,229,255,0.3))" }}>🔍</div>
            <h2 style={{ fontFamily:"Poppins,sans-serif", fontWeight:800, fontSize:20, color:"white", marginBottom:6 }}>Karte suchen</h2>
            <p style={{ color:"rgba(255,255,255,0.3)", fontSize:14, marginBottom:28 }}>Name eingeben oder Typ wählen</p>
            <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap", maxWidth:500, margin:"0 auto" }}>
              {TYPES.slice(0,6).map(t=>(
                <button key={t.id} onClick={()=>setSelectedType(t.id)} style={{ padding:"9px 16px", borderRadius:12, cursor:"pointer", background:`${t.color}15`, border:`1px solid ${t.color}40`, color:t.color, fontSize:13, fontWeight:600 }}>
                  {t.emoji} {t.label}
                </button>
              ))}
            </div>
          </div>
        )}
        {loading && <PokeballLoader />}
        {!loading && searched && cards.length === 0 && (
          <div style={{ textAlign:"center", padding:"64px 0" }}>
            <div style={{ fontSize:44, marginBottom:12 }}>😕</div>
            <p style={{ fontFamily:"Poppins,sans-serif", fontWeight:700, fontSize:18, color:"white" }}>Keine Karten gefunden</p>
          </div>
        )}
        {!loading && cards.length > 0 && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(148px,1fr))", gap:14 }}>
            {cards.map(card=><CardItem key={card.id} card={card}/>)}
          </div>
        )}
      </div>
    </div>
  );
}
