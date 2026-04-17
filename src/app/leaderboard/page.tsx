"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const G="#C9A66B",G18="rgba(201,166,107,0.18)",G08="rgba(201,166,107,0.08)";
const BG1="#16161A",BG2="#1C1C21",BR1="rgba(255,255,255,0.045)",BR2="rgba(255,255,255,0.085)";
const TX1="#F8F6F2",TX2="#BEB9B0",TX3="#6E6B66",GREEN="#3db87a";

const BADGE_COLORS = ["#C9A66B","#9CA3AF","#CD7F32"];
const BADGE_ICONS  = ["✦✦✦","✦✦","✦"];

function MedalIcon({rank}:{rank:number}) {
  const color = rank===1?"#C9A66B":rank===2?"#9CA3AF":"#CD7F32";
  return (
    <div style={{width:32,height:32,borderRadius:"50%",background:`${color}15`,
      border:`0.5px solid ${color}30`,display:"flex",alignItems:"center",
      justifyContent:"center",fontSize:13,color,fontWeight:600,flexShrink:0}}>
      {rank}
    </div>
  );
}

function Avatar({username,size=32}:{username:string;size?:number}) {
  const colors=["#C9A66B","#60A5FA","#34D399","#A78BFA","#F472B6","#FB923C"];
  const c=colors[username.charCodeAt(0)%colors.length];
  return (
    <div style={{width:size,height:size,borderRadius:"50%",background:`${c}15`,
      border:`0.5px solid ${c}30`,display:"flex",alignItems:"center",
      justifyContent:"center",fontSize:size*.38,color:c,fontWeight:500,flexShrink:0}}>
      {username[0].toUpperCase()}
    </div>
  );
}

interface PortfolioEntry { rank:number; username:string; is_premium:boolean; total_value:number; member_since:string|null; }
interface FantasyEntry   { rank:number; username:string; is_premium:boolean; total_value:number; team_name:string; }

export default function LeaderboardPage() {
  const [tab,     setTab]     = useState<"portfolio"|"fantasy">("portfolio");
  const [portfolio, setPortfolio] = useState<PortfolioEntry[]>([]);
  const [fantasy,   setFantasy]   = useState<FantasyEntry[]>([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [pRes, fRes] = await Promise.all([
        fetch("/api/leaderboard/portfolio"),
        fetch("/api/fantasy/leaderboard"),
      ]);
      const [pData, fData] = await Promise.all([pRes.json(), fRes.json()]);
      setPortfolio(pData.leaderboard ?? []);
      setFantasy(fData.leaderboard ?? []);
    } catch(e) { console.error(e); }
    setLoading(false);
  }

  const podium = (tab==="portfolio" ? portfolio : fantasy).slice(0,3);
  const rest   = (tab==="portfolio" ? portfolio : fantasy).slice(3);

  return (
    <div style={{color:TX1,minHeight:"80vh"}}>
      <div style={{maxWidth:800,margin:"0 auto",padding:"clamp(52px,7vw,80px) clamp(16px,3vw,28px)"}}>

        {/* Header */}
        <div style={{marginBottom:"clamp(28px,4vw,44px)"}}>
          <div style={{fontSize:9,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:TX3,marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
            <span style={{width:16,height:0.5,background:TX3,display:"inline-block"}}/>Leaderboard
          </div>
          <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(26px,4.5vw,48px)",fontWeight:200,letterSpacing:"-.055em",marginBottom:6,lineHeight:1.05}}>
            Die besten<br/><span style={{color:G}}>Sammler.</span>
          </h1>
        </div>

        {/* Tab */}
        <div style={{display:"flex",gap:2,background:BG1,borderRadius:12,padding:3,border:`0.5px solid ${BR2}`,marginBottom:20,width:"fit-content"}}>
          {([["portfolio","◈ Portfolio-Wert"],["fantasy","◇ Fantasy League"]] as const).map(([t,l])=>(
            <button key={t} onClick={()=>setTab(t)} style={{
              padding:"7px 20px",borderRadius:9,fontSize:13,fontWeight:400,border:"none",cursor:"pointer",
              background:tab===t?BG2:"transparent",color:tab===t?TX1:TX3,transition:"all .15s",
            }}>{l}</button>
          ))}
        </div>

        {loading ? (
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {Array.from({length:10}).map((_,i)=>(
              <div key={i} style={{height:60,background:BG1,border:`0.5px solid ${BR1}`,borderRadius:14,opacity:.3,animation:"pulse 1.5s ease-in-out infinite"}}/>
            ))}
          </div>
        ) : (portfolio.length===0 && tab==="portfolio") || (fantasy.length===0 && tab==="fantasy") ? (
          <div style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:20,padding:"60px",textAlign:"center"}}>
            <div style={{fontSize:32,opacity:.2,marginBottom:16}}>◈</div>
            <div style={{fontSize:14,color:TX3,marginBottom:8}}>Noch keine Daten.</div>
            <div style={{fontSize:12,color:TX3}}>
              {tab==="portfolio"?"Füge Karten zu deiner Sammlung hinzu um hier zu erscheinen.":"Erstelle ein Fantasy-Team um hier zu erscheinen."}
            </div>
          </div>
        ) : (
          <>
            {/* Podium — top 3 */}
            {podium.length>=3 && (
              <div style={{display:"grid",gridTemplateColumns:"1fr 1.15fr 1fr",gap:10,marginBottom:14,alignItems:"end"}}>
                {[podium[1],podium[0],podium[2]].map((entry,visualIdx)=>{
                  const realRank = visualIdx===0?2:visualIdx===1?1:3;
                  const color = BADGE_COLORS[realRank-1];
                  const isFirst = realRank===1;
                  return (
                    <div key={entry.username} style={{
                      background:`linear-gradient(180deg,${color}08,${BG1})`,
                      border:`0.5px solid ${color}25`,
                      borderRadius:16,padding:"20px 14px",textAlign:"center",
                      position:"relative",overflow:"hidden",
                    }}>
                      {isFirst&&<div style={{position:"absolute",top:0,left:0,right:0,height:0.5,background:`linear-gradient(90deg,transparent,${color},transparent)`}}/>}
                      <div style={{fontSize:10,fontWeight:600,letterSpacing:".08em",color,marginBottom:12}}>{BADGE_ICONS[realRank-1]}</div>
                      <Avatar username={entry.username} size={40}/>
                      <div style={{fontSize:13,fontWeight:400,color:TX1,marginTop:10,marginBottom:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                        @{entry.username}
                        {entry.is_premium&&<span style={{marginLeft:5,fontSize:8,color:G}}>✦</span>}
                      </div>
                      <div style={{fontFamily:"var(--font-mono)",fontSize:isFirst?20:16,fontWeight:300,color,letterSpacing:"-.03em"}}>
                        {tab==="portfolio"
                          ? `${Math.round((entry as PortfolioEntry).total_value).toLocaleString("de-DE")} €`
                          : `${Math.round((entry as FantasyEntry).total_value).toLocaleString("de-DE")} €`
                        }
                      </div>
                      {tab==="fantasy" && (entry as FantasyEntry).team_name && (
                        <div style={{fontSize:9,color:TX3,marginTop:3}}>{(entry as FantasyEntry).team_name}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Ranks 4+ */}
            {rest.length > 0 && (
              <div style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:18,overflow:"hidden"}}>
                {rest.map((entry,i)=>(
                  <div key={entry.username} style={{
                    display:"flex",alignItems:"center",gap:12,
                    padding:"12px 16px",
                    borderBottom:i<rest.length-1?`0.5px solid ${BR1}`:undefined,
                    transition:"background .12s",
                  }}
                  onMouseEnter={e=>(e.currentTarget.style.background=BG2)}
                  onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                    <div style={{width:24,textAlign:"right",fontSize:13,color:TX3,fontFamily:"var(--font-mono)",flexShrink:0}}>{entry.rank}</div>
                    <Avatar username={entry.username} size={28}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,color:TX1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                        @{entry.username}
                        {entry.is_premium&&<span style={{marginLeft:5,fontSize:8,color:G}}>✦</span>}
                      </div>
                      {tab==="fantasy"&&(entry as FantasyEntry).team_name&&(
                        <div style={{fontSize:10,color:TX3}}>{(entry as FantasyEntry).team_name}</div>
                      )}
                    </div>
                    <div style={{fontFamily:"var(--font-mono)",fontSize:15,fontWeight:300,color:TX1,flexShrink:0}}>
                      {Math.round(entry.total_value).toLocaleString("de-DE")} €
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <div style={{marginTop:20,textAlign:"center",fontSize:12,color:TX3}}>
          Aktualisiert täglich ·{" "}
          <Link href="/portfolio" style={{color:G,textDecoration:"none"}}>Mein Portfolio →</Link>
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:.3}50%{opacity:.5}}`}</style>
    </div>
  );
}
