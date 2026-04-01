"use client";
import { useState, useEffect, useCallback } from "react";
import CardDetail from "@/components/ui/CardDetail";

// ── Design tokens (hardcoded for reliability) ─────────
const B0="#07070F",B1="#0C0C1A",B2="#101020",B3="#161628",B4="#1E1E38";
const BR1="rgba(255,255,255,0.048)",BR2="rgba(255,255,255,0.080)",BR3="rgba(255,255,255,0.125)";
const T1="#EDEAF6",T2="#8A89A8",T3="#454462";
const G="#E9A84B",G18="rgba(233,168,75,0.18)",G06="rgba(233,168,75,0.06)";
const GREEN="#4BBF82",RED="#E04558";

// ── Types ─────────────────────────────────────────────
interface Card {
  id:string; name:string; name_de?:string|null; set_id:string; number:string;
  rarity:string|null; types:string[]|null; image_url:string|null;
  price_market:number|null; price_low:number|null; price_avg7:number|null; price_avg30:number|null;
  hp?:number|null; category?:string|null; stage?:string|null; illustrator?:string|null;
  is_holo?:boolean|null; is_reverse_holo?:boolean|null;
}
interface CardSet { id:string; name:string; name_de?:string|null; }

// ── Constants ─────────────────────────────────────────
const TYPE_COLORS:Record<string,string> = {
  Fire:"#F97316",Water:"#38BDF8",Grass:"#4ADE80",Lightning:"#E9A84B",
  Psychic:"#A855F7",Fighting:"#EF4444",Darkness:"#6B7280",Metal:"#9CA3AF",
  Dragon:"#7C3AED",Colorless:"#CBD5E1",
};
const TYPES=[
  {id:"Fire",label:"Feuer",color:"#F97316"},{id:"Water",label:"Wasser",color:"#38BDF8"},
  {id:"Grass",label:"Pflanze",color:"#4ADE80"},{id:"Lightning",label:"Elektro",color:"#E9A84B"},
  {id:"Psychic",label:"Psycho",color:"#A855F7"},{id:"Fighting",label:"Kampf",color:"#EF4444"},
];
const CATS=[{id:"Pokemon",label:"Pokémon"},{id:"Trainer",label:"Trainer"},{id:"Energy",label:"Energie"}];
const RARITY_DOTS:Record<string,number>={
  "Common":1,"Uncommon":2,"Rare":3,"Rare Holo":4,"Rare Holo EX":5,
  "Ultra Rare":5,"Hyper Rare":6,"Secret Rare":6,"Illustration Rare":5,"Special Illustration Rare":6,
};

// ── Sub-components ────────────────────────────────────
function WishlistBtn({cardId}:{cardId:string}) {
  const [wished,setWished]=useState(false);
  const [loading,setLoading]=useState(false);
  useEffect(()=>{
    import("@/lib/supabase/client").then(({createClient})=>{
      const sb=createClient();
      sb.auth.getUser().then(({data:{user}})=>{
        if(!user)return;
        sb.from("user_wishlist").select("id").eq("user_id",user.id).eq("card_id",cardId).single()
          .then(({data})=>{if(data)setWished(true);});
      });
    });
  },[cardId]);
  async function toggle(e:React.MouseEvent){
    e.stopPropagation();setLoading(true);
    try{
      const {createClient}=await import("@/lib/supabase/client");
      const sb=createClient();
      const {data:{user}}=await sb.auth.getUser();
      if(!user){window.location.href="/auth/login";return;}
      if(wished){await sb.from("user_wishlist").delete().eq("user_id",user.id).eq("card_id",cardId);setWished(false);}
      else{await sb.from("user_wishlist").upsert({user_id:user.id,card_id:cardId});setWished(true);}
    }finally{setLoading(false);}
  }
  return(
    <button onClick={toggle} disabled={loading} title={wished?"Entfernen":"Zur Wunschliste"} style={{
      background:"none",border:"none",cursor:"pointer",padding:2,
      color:wished?"#E04558":"rgba(255,255,255,0.2)",
      transition:"color .2s,transform .15s",
      transform:loading?"scale(0.8)":"scale(1)",
    }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill={wished?"currentColor":"none"} stroke="currentColor" strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    </button>
  );
}

function RarityDots({rarity,typeColor}:{rarity:string|null;typeColor:string}) {
  const count=rarity?RARITY_DOTS[rarity]??1:1;
  return(
    <div style={{display:"flex",gap:3,marginBottom:6}}>
      {Array.from({length:Math.min(count,6)}).map((_,i)=>(
        <div key={i} style={{
          width:4,height:4,borderRadius:"50%",background:typeColor,
          opacity:i>=count-2?1:0.4,
          boxShadow:i>=count-1?`0 0 5px ${typeColor}80`:undefined,
        }}/>
      ))}
    </div>
  );
}

function PokeballLoader() {
  return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"48px"}}>
      <svg width="40" height="40" viewBox="0 0 40 40" style={{animation:"spin 1.2s linear infinite"}}>
        <circle cx="20" cy="20" r="18" fill="#EE1515"/>
        <path d="M2 20 A18 18 0 0 1 38 20 Z" fill="white"/>
        <rect x="2" y="17.5" width="36" height="5" fill="#111"/>
        <circle cx="20" cy="20" r="7" fill="#111"/>
        <circle cx="20" cy="20" r="4" fill="white"/>
      </svg>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function CardGrid({cards,onSelect}:{cards:Card[];onSelect:(c:Card)=>void}) {
  return(
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:9}}>
      {cards.map(card=>{
        const tc=TYPE_COLORS[card.types?.[0]??""]??"#474664";
        const img=card.image_url??`https://assets.tcgdex.net/en/${card.set_id}/${card.number}/low.webp`;
        const name=card.name_de??card.name;
        const price=card.price_market?`${Number(card.price_market).toFixed(2)} €`:card.price_low?`ab ${Number(card.price_low).toFixed(2)} €`:"–";
        const pct=card.price_avg30&&card.price_avg30>0?((card.price_market??0)-card.price_avg30)/card.price_avg30*100:null;
        const isHyper=card.rarity?.includes("Hyper")||card.rarity?.includes("Special");
        return(
          <div key={card.id} onClick={()=>onSelect(card)} style={{
            background:B2,border:`1px solid ${BR1}`,borderRadius:13,overflow:"hidden",
            cursor:"pointer",
            transition:"transform .22s cubic-bezier(.16,1,.3,1),border-color .22s,box-shadow .22s",
          }}
          onMouseEnter={e=>{const d=e.currentTarget;d.style.transform="translateY(-3px)";d.style.borderColor=isHyper?"rgba(233,168,75,0.2)":"rgba(255,255,255,0.1)";d.style.boxShadow=`0 16px 44px rgba(0,0,0,0.5),0 0 24px rgba(233,168,75,0.04)`;}}
          onMouseLeave={e=>{const d=e.currentTarget;d.style.transform="";d.style.borderColor=BR1;d.style.boxShadow="";}}>
            <div style={{aspectRatio:"3/4",background:B1,position:"relative",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <div style={{position:"absolute",inset:0,background:`radial-gradient(circle at 50% 28%,${tc}11,transparent 68%)`}}/>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt={name} style={{width:"100%",height:"100%",objectFit:"contain",padding:4}}/>
              <div style={{position:"absolute",bottom:0,left:0,right:0,height:"52%",background:`linear-gradient(transparent,${B2})`}}/>
              {card.types?.[0]&&(
                <div style={{position:"absolute",top:8,left:8,padding:"2px 7px",borderRadius:5,fontSize:8,fontWeight:600,letterSpacing:".04em",background:`${tc}18`,color:tc,border:`1px solid ${tc}30`,backdropFilter:"blur(8px)"}}>
                  {card.types[0]==="Fire"?"Feuer":card.types[0]==="Water"?"Wasser":card.types[0]==="Grass"?"Pflanze":card.types[0]==="Lightning"?"Elektro":card.types[0]==="Psychic"?"Psycho":card.types[0]==="Fighting"?"Kampf":card.types[0]==="Darkness"?"Finsternis":card.types[0]==="Metal"?"Metall":card.types[0]==="Dragon"?"Drache":card.types[0]}
                </div>
              )}
            </div>
            <div style={{padding:"10px 12px 12px"}}>
              <RarityDots rarity={card.rarity} typeColor={isHyper?G:tc}/>
              <div style={{fontSize:12,fontWeight:500,color:T1,marginBottom:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",letterSpacing:"-.01em"}}>{name}</div>
              <div style={{fontSize:9,color:T3,marginBottom:7,letterSpacing:".01em"}}>{card.set_id.toUpperCase()} · #{card.number}</div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <span style={{fontSize:14,fontWeight:550,fontFamily:"'DM Mono',monospace",color:isHyper?G:G,letterSpacing:"-.02em"}}>{price}</span>
                <div style={{display:"flex",alignItems:"center",gap:4}}>
                  {pct!==null&&<span style={{fontSize:9,fontWeight:600,color:pct>=0?GREEN:RED}}>{pct>=0?"▲":"▼"}{Math.abs(pct).toFixed(1)}%</span>}
                  <WishlistBtn cardId={card.id}/>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────
export default function PreischeckPage() {
  const [query,setQuery]=useState("");
  const [cards,setCards]=useState<Card[]>([]);
  const [sets,setSets]=useState<CardSet[]>([]);
  const [selectedSet,setSelectedSet]=useState("");
  const [selectedType,setSelectedType]=useState("");
  const [selectedCat,setSelectedCat]=useState("");
  const [sortBy,setSortBy]=useState("price_desc");
  const [loading,setLoading]=useState(false);
  const [searched,setSearched]=useState(false);
  const [selected,setSelected]=useState<Card|null>(null);
  const [debouncedQ,setDebouncedQ]=useState("");

  useEffect(()=>{fetch("/api/cards/sets").then(r=>r.json()).then(d=>setSets(d.sets??[]));},[]);
  useEffect(()=>{
    const t=setTimeout(()=>setDebouncedQ(query),380);
    return()=>clearTimeout(t);
  },[query]);

  const search=useCallback(async(q:string,set:string,type:string,cat:string,sort:string)=>{
    setLoading(true);setSearched(true);
    const params=new URLSearchParams();
    if(q)params.set("q",q);if(set)params.set("set_id",set);
    if(type)params.set("type",type);if(cat)params.set("category",cat);
    params.set("sort",sort);params.set("limit","48");
    try{
      const r=await fetch(`/api/cards/search?${params}`);
      const d=await r.json();
      setCards(d.cards??[]);
    }finally{setLoading(false);}
  },[]);

  useEffect(()=>{
    if(debouncedQ||selectedSet||selectedType||selectedCat){
      search(debouncedQ,selectedSet,selectedType,selectedCat,sortBy);
    }
  },[debouncedQ,selectedSet,selectedType,selectedCat,sortBy,search]);

  return(
    <div style={{minHeight:"80vh",color:T1}}>
      <div style={{maxWidth:1100,margin:"0 auto",padding:"32px 24px"}}>

        {/* Header */}
        <div style={{marginBottom:28}}>
          <h1 style={{fontSize:22,fontWeight:500,letterSpacing:"-.03em",color:T1,marginBottom:4}}>Preischeck</h1>
          <p style={{fontSize:12,color:T3}}>Live Cardmarket EUR · Täglich aktualisiert</p>
        </div>

        {/* Search + Filters */}
        <div style={{background:B2,border:`1px solid ${BR2}`,borderRadius:16,padding:"16px 18px",marginBottom:20}}>
          {/* Search input */}
          <div style={{position:"relative",marginBottom:14}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T3} strokeWidth="2" style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              value={query} onChange={e=>setQuery(e.target.value)}
              placeholder="Karte auf Deutsch oder Englisch suchen…"
              style={{
                width:"100%",padding:"10px 10px 10px 36px",borderRadius:9,
                background:B3,border:`1px solid ${BR2}`,
                color:T1,fontSize:13,outline:"none",
                transition:"border-color .15s",
              }}
              onFocus={e=>{e.target.style.borderColor=G18;}}
              onBlur={e=>{e.target.style.borderColor=BR2;}}
            />
            {query&&<button onClick={()=>setQuery("")} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:T3,padding:2}}>✕</button>}
          </div>

          {/* Filters row */}
          <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
            {/* Set filter */}
            <select value={selectedSet} onChange={e=>setSelectedSet(e.target.value)} style={{
              padding:"6px 10px",borderRadius:7,background:B3,border:`1px solid ${BR1}`,
              color:selectedSet?T1:T3,fontSize:11,cursor:"pointer",outline:"none",
            }}>
              <option value="">Alle Sets</option>
              {sets.map(s=><option key={s.id} value={s.id}>{s.name_de??s.name}</option>)}
            </select>

            {/* Sort */}
            <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{
              padding:"6px 10px",borderRadius:7,background:B3,border:`1px solid ${BR1}`,
              color:T1,fontSize:11,cursor:"pointer",outline:"none",
            }}>
              <option value="price_desc">Preis ↓</option>
              <option value="price_asc">Preis ↑</option>
              <option value="name_asc">Name A→Z</option>
              <option value="trend_up">Trend ↑</option>
            </select>

            {/* Category pills */}
            {CATS.map(c=>(
              <button key={c.id} onClick={()=>setSelectedCat(selectedCat===c.id?"":c.id)} style={{
                padding:"5px 12px",borderRadius:7,fontSize:11,fontWeight:500,cursor:"pointer",border:"1px solid",
                background:selectedCat===c.id?G06:"transparent",
                color:selectedCat===c.id?G:T3,
                borderColor:selectedCat===c.id?G18:BR1,
                transition:"all .12s",
              }}>{c.label}</button>
            ))}

            {/* Type pills */}
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
              {TYPES.map(t=>(
                <button key={t.id} onClick={()=>setSelectedType(selectedType===t.id?"":t.id)} style={{
                  padding:"4px 10px",borderRadius:6,fontSize:10,fontWeight:500,cursor:"pointer",
                  background:selectedType===t.id?`${t.color}18`:"transparent",
                  color:selectedType===t.id?t.color:T3,
                  border:`1px solid ${selectedType===t.id?t.color+"30":BR1}`,
                  transition:"all .12s",
                }}>{t.label}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        {loading&&<PokeballLoader/>}
        {!loading&&searched&&cards.length===0&&(
          <div style={{textAlign:"center",padding:"64px 24px"}}>
            <div style={{fontSize:32,marginBottom:12,opacity:.3}}>🔍</div>
            <div style={{fontSize:14,color:T3,marginBottom:6}}>Keine Karten gefunden</div>
            <div style={{fontSize:12,color:T3,opacity:.6}}>Probiere einen anderen Suchbegriff oder entferne Filter</div>
          </div>
        )}
        {!loading&&!searched&&(
          <div style={{textAlign:"center",padding:"64px 24px",color:T3}}>
            <div style={{fontSize:13}}>Name eingeben, Set wählen oder Typ filtern</div>
          </div>
        )}
        {!loading&&cards.length>0&&(
          <>
            <div style={{fontSize:11,color:T3,marginBottom:14}}>{cards.length} Karten gefunden</div>
            <CardGrid cards={cards} onSelect={setSelected}/>
          </>
        )}
      </div>

      {/* Card Detail Modal */}
      {selected&&<CardDetail card={selected} onClose={()=>setSelected(null)}/>}
    </div>
  );
}
