"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const G="#D4A843",G18="rgba(212,168,67,0.18)",G08="rgba(212,168,67,0.08)";
const BG1="#111114",BG2="#18181c",BR1="rgba(255,255,255,0.045)",BR2="rgba(255,255,255,0.085)";
const TX1="#ededf2",TX2="#a4a4b4",TX3="#62626f",GREEN="#3db87a";

interface CardSet {
  id:string; name:string; name_de:string|null; series:string|null;
  total:number|null; release_date:string|null; symbol_url:string|null; logo_url:string|null;
}

const SERIES_ORDER = [
  "Scarlet & Violet","Sword & Shield","Sun & Moon","XY",
  "Black & White","HeartGold & SoulSilver","Diamond & Pearl",
  "EX","e-Card","Neo","Gym","Base","Sonstige"
];

function ProgressBar({pct}:{pct:number}) {
  const color = pct>=100?G:pct>=50?"#60A5FA":pct>=25?TX2:TX3;
  return (
    <div style={{height:3,background:BR1,borderRadius:2,overflow:"hidden",marginTop:8}}>
      <div style={{height:"100%",width:`${Math.min(100,pct)}%`,background:color,borderRadius:2,transition:"width .6s"}}/>
    </div>
  );
}

export default function SetsPage() {
  const [sets,      setSets]      = useState<CardSet[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [series,    setSeries]    = useState("alle");
  const [owned,     setOwned]     = useState<Record<string,number>>({}); // setId -> owned count

  useEffect(() => {
    // Load sets
    fetch("/api/cards/sets")
      .then(r=>r.json())
      .then(d=>{ setSets(d.sets??[]); setLoading(false); })
      .catch(()=>setLoading(false));

    // Load user's collection to compute owned per set
    const sb = createClient();
    sb.auth.getUser().then(async ({data:{user}}) => {
      if (!user) return;
      const { data } = await sb
        .from("user_collection")
        .select("cards!user_collection_card_id_fkey(set_id)")
        .eq("user_id", user.id);
      
      const counts: Record<string,number> = {};
      for (const e of data ?? []) {
        const setId = (e as any).cards?.set_id;
        if (setId) counts[setId] = (counts[setId]??0) + 1;
      }
      setOwned(counts);
    });
  }, []);

  const allSeries = Array.from(new Set(sets.map(s=>s.series??'Sonstige'))).sort((a,b) => {
    const ia = SERIES_ORDER.indexOf(a), ib = SERIES_ORDER.indexOf(b);
    return (ia<0?99:ia) - (ib<0?99:ib);
  });

  const filtered = sets.filter(s => {
    const matchSearch = !search ||
      (s.name_de??s.name).toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase());
    const matchSeries = series==="alle" || (s.series??'Sonstige')===series;
    return matchSearch && matchSeries;
  });

  // Group by series
  const grouped: Record<string, CardSet[]> = {};
  for (const s of filtered) {
    const key = s.series ?? "Sonstige";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(s);
  }

  const sortedSeries = Object.keys(grouped).sort((a,b) => {
    const ia = SERIES_ORDER.indexOf(a), ib = SERIES_ORDER.indexOf(b);
    return (ia<0?99:ia) - (ib<0?99:ib);
  });

  const totalOwned = Object.values(owned).reduce((s,n)=>s+n,0);
  const hasOwned = totalOwned > 0;

  return (
    <div style={{color:TX1,minHeight:"80vh"}}>
      <div style={{maxWidth:1160,margin:"0 auto",padding:"clamp(52px,7vw,80px) clamp(16px,3vw,28px)"}}>

        {/* Header */}
        <div style={{marginBottom:"clamp(32px,5vw,48px)"}}>
          <div style={{fontSize:9,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:TX3,marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
            <span style={{width:16,height:0.5,background:TX3,display:"inline-block"}}/>Sets & Serien
          </div>
          <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(26px,5vw,52px)",fontWeight:200,letterSpacing:"-.055em",marginBottom:8}}>Alle Sets</h1>
          <p style={{fontSize:12,color:TX3}}>
            {loading?"Lädt…":`${sets.length} Sets`}
            {hasOwned && <span style={{color:G,marginLeft:10}}>· {totalOwned} Karten in deiner Sammlung</span>}
          </p>
        </div>

        {/* Search + Series filter */}
        <div style={{display:"flex",gap:10,marginBottom:20,flexWrap:"wrap",alignItems:"center"}}>
          <div style={{position:"relative",flex:1,minWidth:180,maxWidth:300}}>
            <svg style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",opacity:.3}} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Set suchen…"
              style={{width:"100%",padding:"9px 9px 9px 28px",borderRadius:11,background:BG1,border:`1px solid ${BR2}`,color:TX1,fontSize:12,outline:"none"}}/>
          </div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            <button onClick={()=>setSeries("alle")} style={{
              padding:"5px 14px",borderRadius:8,fontSize:11,border:"none",cursor:"pointer",
              background:series==="alle"?G08:"transparent",color:series==="alle"?G:TX3,
              outline:`1px solid ${series==="alle"?G18:BR1}`,transition:"all .15s",
            }}>Alle</button>
            {allSeries.slice(0,7).map(s=>(
              <button key={s} onClick={()=>setSeries(s)} style={{
                padding:"5px 14px",borderRadius:8,fontSize:11,border:"none",cursor:"pointer",
                background:series===s?G08:"transparent",color:series===s?G:TX3,
                outline:`1px solid ${series===s?G18:BR1}`,transition:"all .15s",
              }}>{s}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{padding:"48px",textAlign:"center",fontSize:14,color:TX3}}>Lädt Sets…</div>
        ) : filtered.length===0 ? (
          <div style={{padding:"48px",textAlign:"center",fontSize:14,color:TX3}}>Keine Sets gefunden.</div>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:32}}>
            {sortedSeries.map(seriesName=>{
              const seriesSets = grouped[seriesName];
              const seriesOwned = seriesSets.reduce((s,set)=>s+(owned[set.id]??0),0);
              const seriesTotal = seriesSets.reduce((s,set)=>s+(set.total??0),0);
              return (
                <div key={seriesName}>
                  {/* Series header */}
                  <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                    <div style={{fontSize:10,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:TX3}}>{seriesName}</div>
                    <div style={{flex:1,height:0.5,background:BR1}}/>
                    <div style={{fontSize:10,color:TX3}}>{seriesSets.length} Sets</div>
                    {hasOwned&&seriesTotal>0&&(
                      <div style={{fontSize:10,color:G}}>{seriesOwned}/{seriesTotal}</div>
                    )}
                  </div>

                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))",gap:8}}>
                    {seriesSets.map(s=>{
                      const ownedCount = owned[s.id] ?? 0;
                      const pct        = s.total ? Math.round(ownedCount/s.total*100) : 0;
                      const hasProgress = hasOwned && s.total;

                      return (
                        <Link key={s.id} href={`/preischeck?set=${encodeURIComponent(s.id)}`} style={{
                          background:BG1,border:`1px solid ${ownedCount>0?G18:BR1}`,
                          borderRadius:14,padding:"14px 16px",textDecoration:"none",
                          display:"flex",flexDirection:"column",gap:6,
                          transition:"border-color .2s,background .2s",
                          position:"relative",overflow:"hidden",
                        }}
                        onMouseEnter={e=>{(e.currentTarget as any).style.borderColor=ownedCount>0?G18:BR2;(e.currentTarget as any).style.background=BG2;}}
                        onMouseLeave={e=>{(e.currentTarget as any).style.borderColor=ownedCount>0?G18:BR1;(e.currentTarget as any).style.background=BG1;}}>

                          {/* Logo / Symbol */}
                          {s.logo_url ? (
                            <img src={s.logo_url} alt={s.name}
                              style={{height:30,objectFit:"contain",objectPosition:"left",opacity:.85,marginBottom:4}}
                              onError={e=>{(e.target as any).style.display="none";}}/>
                          ) : s.symbol_url ? (
                            <img src={s.symbol_url} alt=""
                              style={{height:24,width:24,objectFit:"contain",opacity:.6,marginBottom:4}}
                              onError={e=>{(e.target as any).style.display="none";}}/>
                          ) : (
                            <div style={{height:30,display:"flex",alignItems:"center"}}>
                              <div style={{fontSize:18,color:TX3,opacity:.3}}>◈</div>
                            </div>
                          )}

                          {/* Name */}
                          <div style={{fontSize:12.5,fontWeight:400,color:TX1,lineHeight:1.3}}>
                            {s.name_de||s.name}
                          </div>

                          {/* Meta */}
                          <div style={{fontSize:10,color:TX3,display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                            <span style={{fontFamily:"var(--font-mono)",letterSpacing:".02em"}}>{s.id.toUpperCase()}</span>
                            {s.total&&<span>· {s.total} Karten</span>}
                            {s.release_date&&<span>· {s.release_date.slice(0,4)}</span>}
                          </div>

                          {/* Completion bar */}
                          {hasProgress&&(
                            <div>
                              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:4}}>
                                <span style={{fontSize:9,color:pct>=100?G:TX3}}>{ownedCount}/{s.total}</span>
                                <span style={{fontSize:9,fontWeight:600,color:pct>=100?G:pct>=50?"#60A5FA":TX3}}>{pct}%</span>
                              </div>
                              <ProgressBar pct={pct}/>
                            </div>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
