"use client";

import { useState, useEffect } from "react";
import { Search, X, TrendingUp, TrendingDown, ExternalLink } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import CardDetail from "@/components/ui/CardDetail";

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

const CATEGORIES = [
  { id:"Pokemon", label:"Pokémon", emoji:"⚡" },
  { id:"Trainer", label:"Trainer", emoji:"🎴" },
  { id:"Energy",  label:"Energie", emoji:"✨" },
];

const RARITY_DOTS: Record<string,number> = {
  "Common":1,"Uncommon":2,"Rare":3,"Rare Holo":4,"Rare Holo EX":5,
  "Ultra Rare":5,"Hyper Rare":6,"Secret Rare":6,"Illustration Rare":5,
  "Special Illustration Rare":6,
};

const REG_MARKS: Record<string,{label:string;color:string}> = {
  "A":{label:"Standard A",color:"#22C55E"},
  "B":{label:"Standard B",color:"#22C55E"},
  "C":{label:"Standard C",color:"#22C55E"},
  "D":{label:"Standard D",color:"#22C55E"},
  "E":{label:"Standard E",color:"#22C55E"},
  "F":{label:"Expanded F", color:"#3B82F6"},
  "G":{label:"Standard G", color:"#22C55E"},
  "H":{label:"Standard H", color:"#22C55E"},
};

function WishlistBtn({ cardId }: { cardId: string }) {
  const [wished,  setWished]  = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    import("@/lib/supabase/client").then(({ createClient }) => {
      const sb = createClient();
      sb.auth.getUser().then(({ data: { user } }) => {
        if (!user) return;
        sb.from("user_wishlist")
          .select("id").eq("user_id", user.id).eq("card_id", cardId).single()
          .then(({ data }) => { if (data) setWished(true); });
      });
    });
  }, [cardId]);

  async function toggle(e: React.MouseEvent) {
    e.stopPropagation();
    setLoading(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { window.location.href = "/auth/login"; return; }
      if (wished) {
        await sb.from("user_wishlist").delete().eq("user_id", user.id).eq("card_id", cardId);
        setWished(false);
      } else {
        await sb.from("user_wishlist").upsert({ user_id: user.id, card_id: cardId });
        setWished(true);
      }
    } finally { setLoading(false); }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={wished ? "Von Wunschliste entfernen" : "Zur Wunschliste"}
      style={{
        background: "none", border: "none", cursor: "pointer", padding: 2,
        color: wished ? "#E84560" : "rgba(255,255,255,0.25)",
        transition: "color .2s, transform .15s",
        transform: loading ? "scale(0.8)" : "scale(1)",
      }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24"
        fill={wished ? "currentColor" : "none"}
        stroke="currentColor" strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    </button>
  );
}

function RarityDots({ rarity }: { rarity: string | null }) {
  if (!rarity) return null;
  const dots = RARITY_DOTS[rarity] ?? (rarity.includes("Rare") ? 3 : 1);
  return (
    <div style={{ display:"flex", gap:2 }}>
      {Array.from({ length: Math.min(dots, 6) }).map((_, i) => (
        <div key={i} style={{
          width:5, height:5, borderRadius:"50%",
          background:"#FACC15", boxShadow:"0 0 3px rgba(250,204,21,0.5)",
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
        </svg>
      </div>
      <p style={{ color:"rgba(255,255,255,0.35)", fontSize:13 }}>Karten werden geladen...</p>
      <style>{`@keyframes pb-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function CardItem({ card, onClick }: { card: Card; onClick: () => void }) {
  const typeConf  = TYPES.find(t => t.id === card.types?.[0]);
  const typeColor = typeConf?.color || "#475569";
  const typeGlow  = typeConf?.glow  || "transparent";
  const imgUrl    = card.image_url || `https://assets.tcgdex.net/en/${card.set_id}/${card.number}/low.webp`;
  const displayName = card.name_de || card.name;
  const subName     = card.name_de ? card.name : null;
  const change    = card.price_avg7 && card.price_avg30 && card.price_avg30 > 0
    ? ((card.price_avg7 - card.price_avg30) / card.price_avg30) * 100 : null;

  return (
    <div onClick={onClick} style={{
      background:"rgba(255,255,255,0.04)", border:`1px solid ${typeColor}25`,
      borderRadius:16, overflow:"hidden", cursor:"pointer", position:"relative",
      transition:"transform .2s, box-shadow .2s",
    }}
    onMouseEnter={e=>{(e.currentTarget as HTMLDivElement).style.transform="translateY(-5px)";(e.currentTarget as HTMLDivElement).style.boxShadow=`0 8px 28px ${typeGlow},0 0 0 1px ${typeColor}40`;}}
    onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.transform="translateY(0)";(e.currentTarget as HTMLDivElement).style.boxShadow="none";}}
    >
      <div style={{ background:`linear-gradient(180deg,${typeColor}10,rgba(0,0,0,0.4))`, aspectRatio:"2.5/3.5", position:"relative" }}>
        <img src={imgUrl} alt={displayName} style={{ width:"100%", height:"100%", objectFit:"contain", padding:6 }} loading="lazy"
          onError={e=>{(e.target as HTMLImageElement).style.display="none"}} />
        {typeConf && (
          <div style={{ position:"absolute", top:6, left:6, padding:"2px 7px", borderRadius:6, background:`${typeColor}30`, border:`1px solid ${typeColor}60`, fontSize:9, fontWeight:700, color:typeColor }}>
            {typeConf.emoji} {typeConf.label}
          </div>
        )}
        {card.regulation_mark && REG_MARKS[card.regulation_mark] && (
          <div style={{ position:"absolute", top:6, right:6, width:18, height:18, borderRadius:"50%", background:REG_MARKS[card.regulation_mark].color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:900, color:"#000" }}>
            {card.regulation_mark}
          </div>
        )}
        {card.is_holo && (
          <div style={{ position:"absolute", bottom:6, left:6, padding:"1px 5px", borderRadius:4, background:"rgba(250,204,21,0.2)", border:"1px solid rgba(250,204,21,0.4)", fontSize:8, fontWeight:700, color:"#FACC15" }}>HOLO</div>
        )}
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:36, background:`linear-gradient(0deg,${typeColor}30,transparent)`, pointerEvents:"none" }} />
      </div>

      <div style={{ padding:"10px 12px" }}>
        <p style={{ fontWeight:700, fontSize:13, color:"white", marginBottom:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{displayName}</p>
        {subName && <p style={{ fontSize:9, color:"rgba(255,255,255,0.25)", marginBottom:4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{subName}</p>}
        <p style={{ fontSize:10, color:"rgba(255,255,255,0.3)", marginBottom:6 }}>{card.set_id?.toUpperCase()} · #{card.number}{card.hp ? ` · HP ${card.hp}` : ""}</p>
        <div style={{ marginBottom:6 }}><RarityDots rarity={card.rarity} /></div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            {card.price_market
              ? <p style={{ fontFamily:"Poppins,sans-serif", fontWeight:900, fontSize:16, color:"#00E5FF", lineHeight:1 }}>{card.price_market.toFixed(2)}€</p>
              : card.price_low
              ? <p style={{ fontFamily:"Poppins,sans-serif", fontWeight:900, fontSize:14, color:"#22C55E", lineHeight:1 }}>ab {card.price_low.toFixed(2)}€</p>
              : <p style={{ fontSize:11, color:"rgba(255,255,255,0.2)" }}>Kein Preis</p>
            }
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            {change !== null && (
              <div style={{ display:"flex", alignItems:"center", gap:2, fontSize:10, fontWeight:700, color:change>=0?"#22C55E":"#EE1515" }}>
                {change >= 0 ? <TrendingUp size={10}/> : <TrendingDown size={10}/>}
                {Math.abs(change).toFixed(1)}%
              </div>
            )}
            <WishlistBtn cardId={card.id} />
          </div>
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
  const [selectedCat,  setSelectedCat]  = useState("");
  const [sortBy,       setSortBy]       = useState("price_desc");
  const [loading,      setLoading]      = useState(false);
  const [searched,     setSearched]     = useState(false);
  const [selected,     setSelected]     = useState<Card | null>(null);
  const debouncedQuery = useDebounce(query, 350);

  useEffect(() => { fetch("/api/cards/sets").then(r=>r.json()).then(d=>setSets(d.sets||[])); }, []);

  useEffect(() => {
    if (debouncedQuery.length < 2 && !selectedSet && !selectedType && !selectedCat) {
      setCards([]); setSearched(false); return;
    }
    search();
  }, [debouncedQuery, selectedSet, selectedType, selectedCat, sortBy]);

  async function search() {
    setLoading(true); setSearched(true);
    try {
      const p = new URLSearchParams();
      if (debouncedQuery) p.set("q", debouncedQuery);
      if (selectedSet)    p.set("set", selectedSet);
      if (selectedType)   p.set("type", selectedType);
      if (selectedCat)    p.set("category", selectedCat);
      p.set("sort", sortBy); p.set("limit", "48");
      const data = await fetch(`/api/cards/search?${p}`).then(r=>r.json());
      setCards(data.cards || []);
    } finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight:"100vh", color:"white" }}>
      {/* Card Detail Modal */}
      {selected && (
        <CardDetail card={selected} onClose={() => setSelected(null)} />
      )}

      {/* Sticky header */}
      <div style={{ position:"sticky", top:132, zIndex:30, background:"rgba(10,10,10,0.96)", backdropFilter:"blur(20px)", borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ height:1, background:"linear-gradient(90deg,transparent,rgba(0,229,255,0.5),transparent)" }} />
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"14px 20px" }}>
          <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom:12 }}>
            <div>
              <h1 style={{ fontFamily:"Poppins,sans-serif", fontWeight:900, fontSize:22, letterSpacing:"-0.02em", background:"linear-gradient(135deg,#fff,#00E5FF)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Preischeck</h1>
              <p style={{ color:"rgba(255,255,255,0.3)", fontSize:11 }}>{cards.length > 0 ? `${cards.length} Karten` : "Live Cardmarket EUR"}</p>
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
              placeholder="Kartenname auf Deutsch oder Englisch… z.B. Glurak, Charizard"
              style={{ width:"100%", paddingLeft:40, paddingRight:36, paddingTop:10, paddingBottom:10, borderRadius:10, background:"rgba(255,255,255,0.06)", border:query?"1px solid rgba(0,229,255,0.4)":"1px solid rgba(255,255,255,0.1)", color:"white", fontSize:14, outline:"none" }} />
            {query && <button onClick={()=>setQuery("")} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"rgba(255,255,255,0.3)", cursor:"pointer" }}><X size={13}/></button>}
          </div>

          {/* Filters row */}
          <div style={{ display:"flex", gap:5, overflowX:"auto", paddingBottom:2 }}>
            {/* Category filter */}
            <button onClick={()=>setSelectedCat("")} style={{ padding:"4px 10px", borderRadius:20, border:"none", cursor:"pointer", background:!selectedCat?"rgba(255,255,255,0.15)":"rgba(255,255,255,0.04)", color:!selectedCat?"white":"rgba(255,255,255,0.4)", fontSize:11, fontWeight:600, whiteSpace:"nowrap", flexShrink:0 }}>Alle</button>
            {CATEGORIES.map(c=>(
              <button key={c.id} onClick={()=>setSelectedCat(selectedCat===c.id?"":c.id)} style={{ padding:"4px 10px", borderRadius:20, cursor:"pointer", whiteSpace:"nowrap", flexShrink:0, background:selectedCat===c.id?"rgba(255,255,255,0.15)":"rgba(255,255,255,0.04)", border:`1px solid ${selectedCat===c.id?"rgba(255,255,255,0.3)":"rgba(255,255,255,0.08)"}`, color:selectedCat===c.id?"white":"rgba(255,255,255,0.4)", fontSize:11, fontWeight:600 }}>
                {c.emoji} {c.label}
              </button>
            ))}
            <div style={{ width:1, background:"rgba(255,255,255,0.1)", flexShrink:0, margin:"0 4px" }} />
            {/* Type filter */}
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
            <p style={{ color:"rgba(255,255,255,0.3)", fontSize:14, marginBottom:28 }}>Name auf Deutsch oder Englisch eingeben, oder Typ/Kategorie wählen</p>
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
            {cards.map(card=><CardItem key={card.id} card={card} onClick={()=>setSelected(card)}/>)}
          </div>
        )}
      </div>
    </div>
  );
}
