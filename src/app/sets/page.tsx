"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const G="#D4A843",G18="rgba(212,168,67,0.18)",G08="rgba(212,168,67,0.08)";
const BG1="#111114",BG2="#18181c",BR1="rgba(255,255,255,0.045)",BR2="rgba(255,255,255,0.085)";
const TX1="#ededf2",TX2="#a4a4b4",TX3="#62626f";

interface CardSet {
  id:string; name:string; name_de:string|null; series:string|null;
  total:number|null; release_date:string|null; symbol_url:string|null; logo_url:string|null;
}

const SERIES_ORDER = ["Scarlet & Violet","Sword & Shield","Sun & Moon","XY","Black & White","HeartGold & SoulSilver","Diamond & Pearl","EX","e-Card","Neo","Gym","Base"];

export default function SetsPage() {
  const [sets,    setSets]    = useState<CardSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [series,  setSeries]  = useState("alle");

  useEffect(() => {
    fetch("/api/cards/sets")
      .then(r=>r.json())
      .then(d=>{ setSets(d.sets??[]); setLoading(false); })
      .catch(()=>setLoading(false));
  }, []);

  const allSeries = ["alle", ...Array.from(new Set(sets.map(s=>s.series).filter(Boolean))) as string[]];

  const filtered = sets.filter(s => {
    const matchSearch = !search || 
      (s.name_de??s.name).toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase());
    const matchSeries = series==="alle" || s.series===series;
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
    const ia = SERIES_ORDER.indexOf(a);
    const ib = SERIES_ORDER.indexOf(b);
    if (ia>=0&&ib>=0) return ia-ib;
    if (ia>=0) return -1;
    if (ib>=0) return 1;
    return a.localeCompare(b);
  });

  return (
    <div style={{color:TX1,minHeight:"80vh"}}>
      <div style={{maxWidth:1160,margin:"0 auto",padding:"clamp(52px,7vw,80px) clamp(16px,3vw,28px)"}}>

        {/* Header */}
        <div style={{marginBottom:"clamp(32px,5vw,52px)"}}>
          <div style={{fontSize:9,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:TX3,marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
            <span style={{width:16,height:0.5,background:TX3}}/>Sets & Serien
          </div>
          <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(28px,5vw,52px)",fontWeight:200,letterSpacing:"-.055em",marginBottom:8}}>
            Alle Sets
          </h1>
          <p style={{fontSize:13,color:TX3}}>
            {loading?"Lädt…":`${sets.length} Sets · Klicken für alle Karten`}
          </p>
        </div>

        {/* Search + Series filter */}
        <div style={{display:"flex",gap:10,marginBottom:20,flexWrap:"wrap",alignItems:"center"}}>
          <div style={{position:"relative",flex:1,minWidth:200,maxWidth:320}}>
            <svg style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",opacity:.3}} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Set suchen…"
              style={{width:"100%",padding:"9px 9px 9px 30px",borderRadius:11,background:BG1,border:`1px solid ${BR2}`,color:TX1,fontSize:13,outline:"none"}}/>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {allSeries.slice(0,8).map(s=>(
              <button key={s} onClick={()=>setSeries(s)} style={{
                padding:"6px 14px",borderRadius:8,fontSize:11,fontWeight:400,border:"none",cursor:"pointer",
                background:series===s?G08:"transparent",color:series===s?G:TX3,
                outline:`1px solid ${series===s?G18:BR1}`,transition:"all .15s",
              }}>{s==="alle"?"Alle":s}</button>
            ))}
          </div>
        </div>

        {/* Sets grouped by series */}
        {loading ? (
          <div style={{padding:"48px",textAlign:"center",fontSize:14,color:TX3}}>Lädt Sets…</div>
        ) : filtered.length===0 ? (
          <div style={{padding:"48px",textAlign:"center",fontSize:14,color:TX3}}>Keine Sets gefunden.</div>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:28}}>
            {sortedSeries.map(seriesName=>(
              <div key={seriesName}>
                {series==="alle"&&(
                  <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                    <div style={{fontSize:10,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:TX3}}>{seriesName}</div>
                    <div style={{flex:1,height:0.5,background:BR1}}/>
                    <div style={{fontSize:10,color:TX3}}>{grouped[seriesName].length}</div>
                  </div>
                )}
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:8}}>
                  {grouped[seriesName].map(s=>(
                    <Link key={s.id} href={`/preischeck?set=${s.id}`} style={{
                      background:BG1,border:`1px solid ${BR1}`,borderRadius:14,
                      padding:"16px 18px",textDecoration:"none",
                      display:"flex",flexDirection:"column",gap:8,
                      transition:"border-color .2s,background .2s",
                    }}
                    onMouseEnter={e=>{(e.currentTarget as any).style.borderColor="rgba(255,255,255,0.085)";(e.currentTarget as any).style.background=BG2;}}
                    onMouseLeave={e=>{(e.currentTarget as any).style.borderColor="rgba(255,255,255,0.045)";(e.currentTarget as any).style.background=BG1;}}>
                      {s.logo_url&&(
                        <img src={s.logo_url} alt={s.name} style={{height:28,objectFit:"contain",objectPosition:"left",opacity:.8}}/>
                      )}
                      <div>
                        <div style={{fontSize:13,fontWeight:400,color:TX1,lineHeight:1.3,marginBottom:3}}>
                          {s.name_de||s.name}
                        </div>
                        <div style={{fontSize:10,color:TX3}}>
                          {s.id.toUpperCase()}
                          {s.total&&<span style={{marginLeft:8}}>{s.total} Karten</span>}
                          {s.release_date&&<span style={{marginLeft:8}}>{s.release_date.slice(0,4)}</span>}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
