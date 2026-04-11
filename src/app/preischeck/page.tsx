"use client";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const G="#E9A84B",G18="rgba(233,168,75,0.18)",G08="rgba(233,168,75,0.08)";
const BG1="#111113",BR1="rgba(255,255,255,0.06)",BR2="rgba(255,255,255,0.10)";
const TX1="#f0f0f5",TX2="#a8a8b8",TX3="#6b6b7a";
const GREEN="#4BBF82",RED="#E04558";

const TYPE_COLOR:Record<string,string>={
  Fire:"#F97316",Water:"#38BDF8",Grass:"#4ADE80",Lightning:"#E9A84B",
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
  const searchParamsHook = useSearchParams();
  const [query,  setQuery]  = useState(() => searchParamsHook.get("q") ?? "");
  const [sort,   setSort]   = useState("price_desc");
  const [setId,  setSetId]  = useState(() => searchParamsHook.get("set") ?? "");
  const [setSearch, setSetSearch] = useState(() => { const s = searchParamsHook.get("set"); return s ?? ""; });
  const [sets,   setSets]   = useState<{id:string;name:string}[]>([]);
  const [holoOnly, setHoloOnly] = useState(false);
  const [cards,  setCards]  = useState<Card[]>([]);
  const [loading,setLoading]= useState(true);
  const [total,  setTotal]  = useState(0);

  const load = useCallback(async (q:string, s:string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ q, sort:s, limit:"24" });
      if (setId) params.set("set", setId);
      if (holoOnly) params.set("holo", "1");
      const r = await fetch(`/api/cards/search?${params}`);
      const d = await r.json();
      setCards(d.cards ?? []);
      setTotal(d.total ?? d.cards?.length ?? 0);
    } catch { setCards([]); }
    setLoading(false);
  }, [setId, holoOnly]);

  useEffect(() => { load(query, sort); }, [load]);
  // Re-run when set filter or holo changes
  useEffect(() => { load(query, sort); }, [setId, holoOnly]);

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
                  background:sort===s.v?G08:"transparent",
                  color:sort===s.v?G:TX3,
                  outline:sort===s.v?`1px solid ${G18}`:"none",
                }}>{s.l}</button>
              ))}
            </div>
            <button type="submit" className="gold-glow" style={{
              padding:"14px 28px",borderRadius:16,
              background:G,color:"#0a0808",
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
              <div key={i} style={{background:BG1,border:`1px solid ${BR1}`,borderRadius:24,overflow:"hidden",aspectRatio:"3/5",
                animation:"pulse 1.5s ease-in-out infinite",opacity:.5}}/>
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
                <Link key={card.id} href={`/preischeck?q=${encodeURIComponent(card.name)}`}
                  className="card-hover"
                  style={{background:BG1,border:`1px solid ${BR1}`,borderRadius:24,overflow:"hidden",textDecoration:"none",display:"block",position:"relative"}}>
                  {/* Image */}
                  <div style={{aspectRatio:"3/4",background:"#080808",position:"relative",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <div style={{position:"absolute",inset:0,background:`radial-gradient(circle at 50% 30%,${tc}18,transparent 65%)`}}/>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={name} style={{width:"100%",height:"100%",objectFit:"contain",padding:6,position:"relative",zIndex:1}}/>
                    <div style={{position:"absolute",bottom:0,left:0,right:0,height:"50%",background:`linear-gradient(transparent,${BG1})`,zIndex:2}}/>
                    {card.types?.[0]&&(
                      <div style={{position:"absolute",top:10,left:10,zIndex:3,padding:"2px 8px",borderRadius:8,fontSize:9,fontWeight:600,letterSpacing:".04em",background:`${tc}18`,color:tc,border:`1px solid ${tc}28`,backdropFilter:"blur(8px)"}}>
                        {TYPE_DE[card.types[0]]??card.types[0]}
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div style={{padding:"14px 16px 18px",position:"relative",zIndex:1}}>
                    <div style={{fontSize:14,fontWeight:500,color:TX1,marginBottom:3,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",letterSpacing:"-.01em"}}>{name}</div>
                    <div style={{fontSize:10,color:TX3,marginBottom:12,letterSpacing:".02em"}}>{String(card.set_id).toUpperCase()} · #{card.number}</div>
                    <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between"}}>
                      <span style={{fontSize:"clamp(16px,1.5vw,20px)",fontWeight:400,fontFamily:"'DM Mono',monospace",color:G,letterSpacing:"-.02em"}}>{price}</span>
                      {pctCapped!==null&&(
                        <span style={{fontSize:10.5,fontWeight:600,color:pctCapped>=0?GREEN:RED}}>
                          {pctCapped>=0?"▲":"▼"}{Math.abs(pctCapped).toLocaleString("de-DE",{maximumFractionDigits:1})} %
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
