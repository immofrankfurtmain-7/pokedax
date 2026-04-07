"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const G="#D4A843",G18="rgba(212,168,67,0.18)",G08="rgba(212,168,67,0.08)";
const BG1="#111114",BG2="#18181c",BR1="rgba(255,255,255,0.045)",BR2="rgba(255,255,255,0.085)";
const TX1="#ededf2",TX2="#a4a4b4",TX3="#62626f",GREEN="#3db87a",RED="#dc4a5a";

const RANK_MEDAL: Record<number,string> = {1:"✦",2:"✧",3:"◇"};
const RANK_COLOR: Record<number,string> = {1:G,2:"#c0c0c8",3:"#a08860"};

function getCurrentSeason() {
  const now = new Date();
  return `${now.getFullYear()}-Q${Math.ceil((now.getMonth()+1)/3)}`;
}

export default function LeaderboardPage() {
  const [tab,       setTab]     = useState<"portfolio"|"fantasy">("portfolio");
  const [data,      setData]    = useState<any[]>([]);
  const [loading,   setLoading] = useState(true);
  const season = getCurrentSeason();

  useEffect(() => { load(tab); }, [tab]);

  async function load(t: string) {
    setLoading(true);
    try {
      const url = t === "portfolio"
        ? "/api/leaderboard/portfolio"
        : "/api/fantasy/leaderboard";
      const res  = await fetch(url);
      const json = await res.json();
      setData(t === "portfolio" ? (json.leaderboard ?? []) : (json.leaderboard ?? []));
    } catch { setData([]); }
    setLoading(false);
  }

  return (
    <div style={{color:TX1,minHeight:"80vh"}}>
      <div style={{maxWidth:900,margin:"0 auto",padding:"clamp(52px,7vw,80px) clamp(16px,3vw,28px)"}}>

        {/* Header */}
        <div style={{marginBottom:"clamp(32px,5vw,52px)"}}>
          <div style={{fontSize:9,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:TX3,marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
            <span style={{width:16,height:0.5,background:TX3,display:"inline-block"}}/>Community
          </div>
          <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(28px,5vw,52px)",fontWeight:200,letterSpacing:"-.055em",marginBottom:8}}>
            Leaderboard
          </h1>
          <p style={{fontSize:13,color:TX3,fontWeight:300}}>
            {tab==="portfolio" ? "Größte Sammlungen nach Marktwert." : `Beste Fantasy-Teams · Saison ${season}.`}
          </p>
        </div>

        {/* Tabs */}
        <div style={{display:"flex",gap:2,marginBottom:24,background:BG1,borderRadius:14,padding:4,border:`1px solid ${BR1}`,width:"fit-content"}}>
          {([
            ["portfolio","Portfolio-Wert"],
            ["fantasy",`Fantasy · ${season}`],
          ] as const).map(([t,l])=>(
            <button key={t} onClick={()=>setTab(t)} style={{
              padding:"8px 22px",borderRadius:10,fontSize:13,fontWeight:400,
              border:"none",cursor:"pointer",transition:"all .2s",
              background:tab===t?BG2:"transparent",
              color:tab===t?TX1:TX3,
            }}>{l}</button>
          ))}
        </div>

        {/* Top 3 podium */}
        {!loading && data.length >= 3 && (
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:20}}>
            {[data[1], data[0], data[2]].map((entry, i) => {
              const actualRank = i===0?2:i===1?1:3;
              const isFirst    = actualRank===1;
              return (
                <div key={entry.user_id ?? entry.id} style={{
                  background:isFirst?`linear-gradient(165deg,${G08},${BG1})`:BG1,
                  border:`1px solid ${isFirst?G18:BR2}`,
                  borderRadius:20,padding:"20px 16px",
                  textAlign:"center",
                  boxShadow:isFirst?`0 0 40px rgba(212,168,67,0.06)`:undefined,
                  transform:isFirst?"translateY(-6px)":"none",
                  position:"relative",overflow:"hidden",
                }}>
                  {isFirst&&<div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${G},transparent)`}}/>}
                  <div style={{fontSize:22,marginBottom:8}}>{RANK_MEDAL[actualRank]}</div>
                  <div style={{
                    width:48,height:48,borderRadius:"50%",
                    background:isFirst?G08:BG2,
                    border:`1px solid ${isFirst?G18:BR1}`,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:18,color:isFirst?G:TX2,margin:"0 auto 10px",fontWeight:300,
                  }}>
                    {(entry.username?.[0]??"?").toUpperCase()}
                  </div>
                  <div style={{fontSize:13,fontWeight:400,color:isFirst?TX1:TX2,marginBottom:4,letterSpacing:"-.01em"}}>
                    @{entry.username}
                    {entry.is_premium&&<span style={{fontSize:9,color:G,marginLeft:6}}>✦</span>}
                  </div>
                  <div style={{
                    fontSize:tab==="portfolio"?15:14,
                    fontFamily:"var(--font-mono)",fontWeight:300,letterSpacing:"-.03em",
                    color:isFirst?G:TX2,
                  }}>
                    {tab==="portfolio"
                      ? `${entry.total_value?.toLocaleString("de-DE",{minimumFractionDigits:0})} €`
                      : `${entry.score>=0?"+":""}${entry.score}%`
                    }
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Full table */}
        <div style={{background:BG1,border:`1px solid ${BR2}`,borderRadius:22,overflow:"hidden"}}>
          <div style={{padding:"13px 20px",borderBottom:`1px solid ${BR1}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{fontSize:12,fontWeight:500,color:TX1}}>
              {tab==="portfolio"?"Top Sammler — Gesamtwert":`Fantasy · Saison ${season}`}
            </div>
            <div style={{fontSize:11,color:TX3}}>{data.length} Einträge</div>
          </div>

          {loading ? (
            <div style={{padding:"48px",textAlign:"center",fontSize:14,color:TX3}}>Lädt…</div>
          ) : data.length === 0 ? (
            <div style={{padding:"48px",textAlign:"center"}}>
              <div style={{fontSize:13,color:TX3,marginBottom:14}}>
                {tab==="portfolio"
                  ? "Noch keine Sammlungen erfasst. Füge Karten zu deinem Portfolio hinzu."
                  : "Noch keine Fantasy-Teams diese Saison."
                }
              </div>
              <Link href={tab==="portfolio"?"/portfolio":"/fantasy"} style={{fontSize:13,color:G,textDecoration:"none"}}>
                {tab==="portfolio"?"Portfolio aufbauen →":"Team erstellen →"}
              </Link>
            </div>
          ) : data.map((entry:any, i:number) => {
            const rank = i + 1;
            return (
              <div key={entry.user_id ?? entry.id} style={{
                display:"flex",alignItems:"center",gap:14,
                padding:"13px 20px",
                borderBottom:i<data.length-1?`1px solid ${BR1}`:undefined,
                background:rank===1?"rgba(212,168,67,0.025)":undefined,
              }}>
                {/* Rank */}
                <div style={{
                  width:32,fontSize:rank<=3?16:12,flexShrink:0,textAlign:"center",
                  fontFamily:"var(--font-mono)",fontWeight:300,lineHeight:1,
                  color:RANK_COLOR[rank]??TX3,
                }}>
                  {RANK_MEDAL[rank]??String(rank).padStart(2,"0")}
                </div>

                {/* Avatar */}
                <div style={{
                  width:36,height:36,borderRadius:"50%",flexShrink:0,
                  background:rank===1?G08:BG2,
                  border:`1px solid ${rank===1?G18:BR1}`,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:14,color:rank===1?G:TX3,fontWeight:300,
                }}>
                  {(entry.username?.[0]??"?").toUpperCase()}
                </div>

                {/* Name */}
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:400,color:TX1,display:"flex",alignItems:"center",gap:6}}>
                    @{entry.username ?? "Anonym"}
                    {entry.is_premium&&<span style={{fontSize:9,color:G}}>✦ Premium</span>}
                  </div>
                  {tab==="fantasy"&&(
                    <div style={{fontSize:10,color:TX3,marginTop:1}}>
                      {entry.picks_count} Karten · {entry.current_value?.toFixed(2)} €
                    </div>
                  )}
                  {tab==="portfolio"&&entry.member_since&&(
                    <div style={{fontSize:10,color:TX3,marginTop:1}}>
                      Seit {new Date(entry.member_since).getFullYear()}
                    </div>
                  )}
                </div>

                {/* Value */}
                <div style={{
                  fontSize:16,fontFamily:"var(--font-mono)",fontWeight:300,
                  letterSpacing:"-.03em",flexShrink:0,
                  color:tab==="portfolio"
                    ? (rank===1?G:TX1)
                    : (entry.score>=0?GREEN:RED),
                }}>
                  {tab==="portfolio"
                    ? `${entry.total_value?.toLocaleString("de-DE",{minimumFractionDigits:0})} €`
                    : `${entry.score>=0?"+":""}${entry.score}%`
                  }
                </div>
              </div>
            );
          })}
        </div>

        <div style={{marginTop:14,textAlign:"center",fontSize:12,color:TX3}}>
          {tab==="portfolio"
            ? <><Link href="/portfolio" style={{color:TX3,textDecoration:"none"}}>Portfolio aufbauen →</Link></>
            : <><Link href="/fantasy" style={{color:TX3,textDecoration:"none"}}>Fantasy Team aufbauen →</Link></>
          }
        </div>
      </div>
    </div>
  );
}
