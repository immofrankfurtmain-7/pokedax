"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const G="#C9A66B",G18="rgba(201,166,107,0.18)",G08="rgba(201,166,107,0.08)";
const BG1="#16161A",BG2="#1C1C21",BR1="rgba(255,255,255,0.045)",BR2="rgba(255,255,255,0.085)";
const TX1="#F8F6F2",TX2="#BEB9B0",TX3="#6E6B66",GREEN="#3db87a";

const SERIES_ORDER = ["Scarlet & Violet","Sword & Shield","Sun & Moon","XY","Black & White","HeartGold & SoulSilver","Diamond & Pearl","EX","Neo","Gym","Base"];

export default function SetsPage() {
  const [sets,    setSets]    = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [series,  setSeries]  = useState("alle");
  const [owned,   setOwned]   = useState<Record<string,number>>({});

  useEffect(()=>{
    fetch("/api/cards/sets").then(r=>r.json()).then(d=>{setSets(d.sets??[]);setLoading(false);});
    const sb = createClient();
    sb.auth.getSession().then(async({data:{session}})=>{
      if (!session?.user) return;
      const {data} = await sb.from("user_collection")
        .select("cards!user_collection_card_id_fkey(set_id)").eq("user_id",session.user.id);
      const counts:Record<string,number>={};
      for (const e of data??[]) { const s=(e as any).cards?.set_id; if(s) counts[s]=(counts[s]??0)+1; }
      setOwned(counts);
    });
  },[]);

  const allSeries = Array.from(new Set(sets.map(s=>s.series??'Sonstige'))).sort((a,b)=>{
    const ia=SERIES_ORDER.indexOf(a), ib=SERIES_ORDER.indexOf(b);
    return (ia<0?99:ia)-(ib<0?99:ib);
  });

  const filtered = sets.filter(s=>{
    const matchSearch = !search||(s.name_de??s.name??"").toLowerCase().includes(search.toLowerCase())||s.id.toLowerCase().includes(search.toLowerCase());
    const matchSeries = series==="alle"||(s.series??'Sonstige')===series;
    return matchSearch&&matchSeries;
  });

  const grouped:Record<string,any[]>={};
  for (const s of filtered) { const k=s.series??"Sonstige"; if(!grouped[k]) grouped[k]=[]; grouped[k].push(s); }
  const sortedSeries = Object.keys(grouped).sort((a,b)=>{
    const ia=SERIES_ORDER.indexOf(a),ib=SERIES_ORDER.indexOf(b);
    return (ia<0?99:ia)-(ib<0?99:ib);
  });
  const hasOwned = Object.values(owned).some(v=>v>0);

  return (
    <div style={{color:TX1,minHeight:"80vh"}}>
      <div style={{maxWidth:1160,margin:"0 auto",padding:"clamp(52px,7vw,80px) clamp(16px,3vw,28px)"}}>
        <div style={{marginBottom:"clamp(28px,4vw,44px)"}}>
          <div style={{fontSize:9,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:TX3,marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
            <span style={{width:16,height:0.5,background:TX3,display:"inline-block"}}/>Sets & Serien
          </div>
          <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(26px,5vw,52px)",fontWeight:200,letterSpacing:"-.055em",marginBottom:8}}>Alle Sets</h1>
          <p style={{fontSize:12,color:TX3}}>{loading?"Lädt…":`${sets.length} Sets · Klicken für alle Karten`}</p>
        </div>
        <div style={{display:"flex",gap:10,marginBottom:20,flexWrap:"wrap",alignItems:"center"}}>
          <div style={{position:"relative",flex:1,minWidth:180,maxWidth:300}}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Set suchen…"
              style={{width:"100%",padding:"9px 12px",borderRadius:11,background:BG1,border:`0.5px solid ${BR2}`,color:TX1,fontSize:12,outline:"none"}}/>
          </div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            <button onClick={()=>setSeries("alle")} style={{padding:"5px 14px",borderRadius:8,fontSize:11,border:"none",cursor:"pointer",background:series==="alle"?G08:"transparent",color:series==="alle"?G:TX3,outline:`1px solid ${series==="alle"?G18:BR1}`}}>Alle</button>
            {allSeries.slice(0,7).map(s=>(
              <button key={s} onClick={()=>setSeries(s)} style={{padding:"5px 14px",borderRadius:8,fontSize:11,border:"none",cursor:"pointer",background:series===s?G08:"transparent",color:series===s?G:TX3,outline:`1px solid ${series===s?G18:BR1}`}}>{s}</button>
            ))}
          </div>
        </div>
        {loading?<div style={{padding:"48px",textAlign:"center",fontSize:14,color:TX3}}>Lädt…</div>:(
          <div style={{display:"flex",flexDirection:"column",gap:28}}>
            {sortedSeries.map(sname=>(
              <div key={sname}>
                {series==="alle"&&(
                  <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                    <div style={{fontSize:10,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:TX3}}>{sname}</div>
                    <div style={{flex:1,height:0.5,background:BR1}}/>
                    <div style={{fontSize:10,color:TX3}}>{grouped[sname].length}</div>
                  </div>
                )}
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))",gap:8}}>
                  {grouped[sname].map((s:any)=>{
                    const oc=owned[s.id]??0;
                    const pct=s.total?Math.round(oc/s.total*100):0;
                    return (
                      <Link key={s.id} href={`/preischeck?set=${encodeURIComponent(s.id)}`} style={{
                        background:BG1,border:`0.5px solid ${oc>0?G18:BR1}`,borderRadius:14,
                        padding:"14px 16px",textDecoration:"none",display:"flex",flexDirection:"column",gap:6,
                        transition:"border-color .2s,background .2s",
                      }}
                      onMouseEnter={e=>{(e.currentTarget as any).style.background=BG2;}}
                      onMouseLeave={e=>{(e.currentTarget as any).style.background=BG1;}}>
                        {s.logo_url&&<img src={s.logo_url} alt={s.name} style={{height:28,objectFit:"contain",objectPosition:"left",opacity:.8}} onError={e=>{(e.target as any).style.display="none";}}/>}
                        {!s.logo_url&&s.symbol_url&&<img src={s.symbol_url} alt="" style={{height:24,width:24,objectFit:"contain",opacity:.6}} onError={e=>{(e.target as any).style.display="none";}}/>}
                        <div style={{fontSize:12.5,fontWeight:400,color:TX1,lineHeight:1.3}}>{s.name_de||s.name}</div>
                        <div style={{fontSize:10,color:TX3}}>{s.id.toUpperCase()}{s.total&&<span> · {s.total} Karten</span>}{s.release_date&&<span> · {s.release_date.slice(0,4)}</span>}</div>
                        {hasOwned&&s.total&&(
                          <div>
                            <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
                              <span style={{fontSize:9,color:TX3}}>{oc}/{s.total}</span>
                              <span style={{fontSize:9,fontWeight:600,color:pct>=100?G:pct>=50?"#60A5FA":TX3}}>{pct}%</span>
                            </div>
                            <div style={{height:3,background:BR1,borderRadius:2,overflow:"hidden",marginTop:4}}>
                              <div style={{height:"100%",width:`${Math.min(100,pct)}%`,background:pct>=100?G:pct>=50?"#60A5FA":TX3,borderRadius:2}}/>
                            </div>
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
