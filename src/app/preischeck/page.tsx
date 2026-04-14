"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const T  = "#00B8A8";   // Teal accent
const TL = "rgba(0,184,168,0.15)";
const T8 = "rgba(0,184,168,0.08)";
const GH = "#EFD7A8";   // Champagne — prices
const BG1 = "#16161A";
const B2  = "#1C1C21";
const B3  = "#222228";
const BR1 = "rgba(255,255,255,0.04)";
const BR2 = "rgba(255,255,255,0.08)";
const TX1 = "#F8F6F2";
const TX2 = "#BEB9B0";
const TX3 = "#6E6B66";
const GREEN = "#3db87a";
const RED   = "#dc4a5a";
// Legacy alias
const G = T; const G18 = TL; const G08 = T8;

const TYPE_COLOR:Record<string,string>={
  Fire:"#F97316",Water:"#38BDF8",Grass:"#4ADE80",Lightning:"#00B8A8",
  Psychic:"#A855F7",Fighting:"#EF4444",Darkness:"#888",Metal:"#9CA3AF",
  Dragon:"#7C3AED",Colorless:"#CBD5E1",
};
const TYPE_DE:Record<string,string>={
  Fire:"Feuer",Water:"Wasser",Grass:"Pflanze",Lightning:"Elektro",
  Psychic:"Psycho",Fighting:"Kampf",Darkness:"Finsternis",Metal:"Metall",
  Dragon:"Drache",Colorless:"Farblos",
};

interface Card {
  id:string;name:string;name_de?:string;set_id:string;number:string;
  image_url?:string;price_market?:number;price_low?:number;price_avg30?:number;
  types?:string[];rarity?:string;
}

export default function PreischeckPage() {
  const [query,  setQuery]  = useState("");
  const [sort,   setSort]   = useState("price_desc");
  const [setId,     setSetId]     = useState("");
  const [setSearch, setSetSearch] = useState("");
  const [sets,   setSets]   = useState<{id:string;name:string}[]>([]);
  const [holoOnly, setHoloOnly] = useState(false);
  const [cards,  setCards]  = useState<Card[]>([]);
  const [loading,setLoading]= useState(true);
  const [total,  setTotal]  = useState(0);

  const load = useCallback(async (q:string, s:string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ q, sort: setId ? (s === "price_desc" ? "number_asc" : s) : s, limit:"350" });
      if (setId) params.set("set", setId);
      if (holoOnly) params.set("holo", "1");
      const r = await fetch(`/api/cards/search?${params}`);
      const d = await r.json();
      setCards(d.cards ?? []);
      setTotal(d.total ?? d.cards?.length ?? 0);
    } catch { setCards([]); }
    setLoading(false);
  }, [setId, holoOnly]);

  // Read URL params on mount (no Suspense needed with this approach)
  // Read URL params on mount and set state
  // Mount: read URL params
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const urlSet = p.get("set") ?? "";
    const urlQ   = p.get("q")   ?? "";
    if (urlQ) setQuery(urlQ);
    // setId triggers load via the effect below
    setSetId(urlSet); // always set (even empty string triggers initial load)
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update display name when sets are loaded
  useEffect(() => {
    if (setId && sets.length > 0) {
      const found = sets.find((s:any) => s.id === setId);
      if (found) setSetSearch(found.name || found.id);
    }
  }, [sets, setId]);

  // Load cards when setId or holoOnly changes
  useEffect(() => {
    load(query, sort);
  }, [setId, holoOnly, load]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    load(query, sort);
  };

  function fmt(n:number) {
    return n.toLocaleString("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2});
  }

  const SORTS = [
    {v:"price_desc", l:"Preis ↓"},
    {v:"price_asc",  l:"Preis ↑"},
    {v:"name_asc",   l:"Name A–Z"},
    {v:"trend_desc", l:"Trend ↑"},
  ];

  return (
    <div style={{color:TX1,minHeight:"80vh"}}>
      <div style={{maxWidth:1200,margin:"0 auto",padding:"80px 24px"}}>

        {/* Header */}
        <div style={{marginBottom:56}}>
          <h1 style={{
            fontFamily:"var(--font-display)",
            fontSize:"clamp(40px,6vw,68px)",
            fontWeight:300,letterSpacing:"-.085em",
            lineHeight:1.0,color:TX1,marginBottom:12,
          }}>Preischeck</h1>
          <p style={{fontSize:16,color:TX3}}>Live Cardmarket EUR · Täglich aktualisiert</p>
        </div>

        {/* Search + Sort */}
        <form onSubmit={handleSearch} style={{marginBottom:48}}>
          <div style={{
            background:BG1,border:`1px solid ${BR2}`,
            borderRadius:24,padding:24,
            display:"flex",gap:12,alignItems:"center",
            flexWrap:"wrap",
          }}>
            <div style={{flex:1,minWidth:260,position:"relative"}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={TX3} strokeWidth="1.5"
                style={{position:"absolute",left:16,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                value={query}
                onChange={e=>setQuery(e.target.value)}
                placeholder="Karte suchen — Deutsch oder Englisch…"
                style={{
                  width:"100%",padding:"14px 14px 14px 46px",
                  borderRadius:16,background:"rgba(0,0,0,0.3)",
                  border:`1px solid ${BR2}`,color:TX1,fontSize:15,outline:"none",
                }}
              />
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {SORTS.map(s=>(
                <button key={s.v} type="button" onClick={()=>{setSort(s.v);load(query,s.v);}} style={{
                  padding:"10px 18px",borderRadius:14,fontSize:13,fontWeight:500,
                  cursor:"pointer",border:"none",transition:"all .15s",
                  background:sort===s.v?T8:"transparent",
                  color:sort===s.v?T:TX3,
                  outline:sort===s.v?`1px solid ${TL}`:"none",
                }}>{s.l}</button>
              ))}
            </div>
            <button type="submit" className="gold-glow" style={{
              padding:"14px 28px",borderRadius:16,
              background:T,color:"#0A0A0C",
              fontSize:14,fontWeight:600,border:"none",cursor:"pointer",
              whiteSpace:"nowrap",
            }}>Suchen</button>
          </div>
        </form>

        {/* Count */}
        {!loading && (
          <p style={{fontSize:13,color:TX3,marginBottom:24}}>
            {total > 0 ? `${total.toLocaleString("de-DE")} Karten gefunden` : "Keine Karten gefunden"}
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:16}}>
            {Array.from({length:12}).map((_,i)=>(
              <div key={i} style={{background:BG1,border:`1px solid ${BR1}`,borderRadius:18,overflow:"hidden",aspectRatio:"3/5",
                animation:"pulse 1.5s ease-in-out infinite",opacity:.4}}/>
            ))}
          </div>
        ) : (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:16}}>
            {cards.map(card=>{
              const tc  = TYPE_COLOR[card.types?.[0]??""]??"#666";
              const img = card.image_url??`https://assets.tcgdex.net/en/${card.set_id}/${card.number}/low.webp`;
              const name = card.name_de??card.name;
              const price = card.price_market
                ? fmt(card.price_market)+" €"
                : card.price_low ? "ab "+fmt(card.price_low)+" €" : "–";
              const pct = card.price_avg30&&card.price_avg30>0
                ? ((card.price_market??0)-card.price_avg30)/card.price_avg30*100 : null;
              const pctCapped = pct!==null ? Math.min(Math.abs(pct),99)*Math.sign(pct) : null;
              return (
                <Link key={card.id} href={`/preischeck/${card.id}`}
                  style={{
                    textDecoration:"none", display:"block",
                    background: BG1,
                    border: `1px solid ${card.price_market ? TL : BR1}`,
                    borderRadius: 18,
                    overflow: "hidden",
                    transition: "transform .2s, border-color .2s, box-shadow .2s",
                    position: "relative",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,184,168,0.35)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(0,184,168,0.12)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                    (e.currentTarget as HTMLElement).style.borderColor = card.price_market ? TL : BR1;
                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  }}>

                  {/* Image area — padded */}
                  <div style={{ padding: "8px 8px 0", background: B2 }}>
                    <div style={{
                      aspectRatio: "3/4", borderRadius: 11,
                      background: B3, overflow: "hidden",
                      position: "relative",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {/* Type glow */}
                      <div style={{ position:"absolute", inset:0, background:`radial-gradient(circle at 50% 40%,${tc}14,transparent 70%)` }}/>
                      {/* Card image */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt={name}
                        style={{ width:"90%", height:"90%", objectFit:"contain", position:"relative", zIndex:1 }}
                        onError={e => { (e.target as HTMLImageElement).style.display="none"; }}
                      />
                      {/* Type badge */}
                      {card.types?.[0] && (
                        <div style={{
                          position:"absolute", top:7, left:7, zIndex:3,
                          padding:"2px 7px", borderRadius:6,
                          fontSize:9, fontWeight:600, letterSpacing:".04em",
                          background:`${tc}20`, color:tc, border:`0.5px solid ${tc}35`,
                        }}>
                          {TYPE_DE[card.types[0]] ?? card.types[0]}
                        </div>
                      )}
                      {/* Price dot — green if has price */}
                      <div style={{
                        position:"absolute", top:7, right:7, zIndex:3,
                        width:7, height:7, borderRadius:"50%",
                        background: card.price_market ? GREEN : TX3,
                        boxShadow: card.price_market ? `0 0 6px ${GREEN}` : "none",
                      }}/>
                      {/* Number */}
                      <div style={{
                        position:"absolute", bottom:6, right:7, zIndex:3,
                        fontSize:9, color:TX3,
                        background:"rgba(0,0,0,0.5)", padding:"1px 5px", borderRadius:4,
                      }}>#{card.number}</div>
                    </div>
                  </div>

                  {/* Info */}
                  <div style={{ padding:"9px 11px 12px" }}>
                    <div style={{ fontSize:12, fontWeight:500, color:TX1, marginBottom:2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                      {name}
                    </div>
                    <div style={{ fontSize:9, color:TX3, marginBottom:7, textTransform:"uppercase", letterSpacing:".05em" }}>
                      {String(card.set_id).toUpperCase()}
                    </div>
                    <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", gap:4 }}>
                      <span style={{
                        fontSize:14, fontFamily:"var(--font-mono)", fontWeight:400,
                        color: card.price_market ? GH : TX3,
                        letterSpacing:"-.02em",
                      }}>{price}</span>
                      {pctCapped !== null && (
                        <span style={{ fontSize:10, fontWeight:600, color: pctCapped >= 0 ? GREEN : RED, flexShrink:0 }}>
                          {pctCapped >= 0 ? "▲" : "▼"}{Math.abs(pctCapped).toLocaleString("de-DE",{maximumFractionDigits:1})}%
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:.5}50%{opacity:.8}}`}</style>
    </div>
  );
}
