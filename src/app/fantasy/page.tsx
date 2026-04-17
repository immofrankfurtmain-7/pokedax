"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const G="#C9A66B",G25="rgba(201,166,107,0.25)",G18="rgba(201,166,107,0.18)",G12="rgba(212,168,67,0.12)",G08="rgba(201,166,107,0.08)",G04="rgba(201,166,107,0.04)";
const BG1="#16161A",BG2="#1C1C21",BR1="rgba(255,255,255,0.045)",BR2="rgba(255,255,255,0.085)";
const TX1="#F8F6F2",TX2="#BEB9B0",TX3="#6E6B66",GREEN="#3db87a",RED="#dc4a5a";

interface Pick {
  id: string;
  bought_at_price: number;
  current_price: number;
  gain_pct: number;
  cards: { id:string; name:string; name_de:string; set_id:string; number:string; price_market:number; image_url:string|null; types:string[]|null };
}
interface Team { id:string; name:string; season:string; score:number }
interface LeaderEntry { id:string; name:string; username:string; picks_count:number; current_value:number; bought_value:number; score:number }

function getCurrentSeason() {
  const now = new Date();
  const q = Math.ceil((now.getMonth() + 1) / 3);
  return `${now.getFullYear()}-Q${q}`;
}

function ScoreBar({pct,max}:{pct:number;max:number}) {
  const w = Math.min(100, Math.abs(pct)/Math.max(Math.abs(max),1)*100);
  return (
    <div style={{height:3,background:BR1,borderRadius:2,overflow:"hidden",flex:1}}>
      <div style={{height:"100%",width:`${w}%`,background:pct>=0?GREEN:RED,borderRadius:2,transition:"width .6s"}}/>
    </div>
  );
}

function TeamBuilder({onAdded}:{onAdded:()=>void}) {
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding]   = useState<string|null>(null);
  const [msg, setMsg]         = useState<string|null>(null);

  async function search(q:string) {
    setQuery(q);
    if (q.length < 2) { setResults([]); return; }
    setLoading(true);
    const res = await fetch(`/api/cards/search?q=${encodeURIComponent(q)}&limit=6`);
    const data = await res.json();
    setResults(data.cards ?? []);
    setLoading(false);
  }

  async function addCard(card:any) {
    setAdding(card.id);
    setMsg(null);
    const res = await fetch("/api/fantasy/team", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ card_id: card.id }),
    });
    const data = await res.json();
    if (!res.ok) {
      if (data.error === "MAX_PICKS") setMsg("Maximal 5 Karten pro Team.");
      else if (data.error === "BUDGET_EXCEEDED") setMsg(`Budget überschritten. Verbleibend: ${(1000-data.spent).toFixed(2)} €`);
      else if (data.error === "Nicht angemeldet") setMsg("Bitte zuerst anmelden.");
      else setMsg(data.message ?? "Fehler.");
    } else {
      setMsg(`✓ ${card.name_de||card.name} hinzugefügt!`);
      onAdded();
    }
    setAdding(null);
  }

  return (
    <div style={{background:BG1,border:`1px solid ${BR2}`,borderRadius:22,padding:24,marginBottom:16}}>
      <div style={{fontSize:12,fontWeight:500,color:TX1,marginBottom:14}}>Karte zum Team hinzufügen</div>
      <div style={{position:"relative",marginBottom:msg?10:0}}>
        <svg style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",opacity:.3}} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input value={query} onChange={e=>search(e.target.value)} placeholder="Karte suchen… (z.B. Glurak ex)"
          style={{width:"100%",padding:"10px 10px 10px 36px",borderRadius:12,background:"rgba(0,0,0,0.3)",border:`1px solid ${BR2}`,color:TX1,fontSize:13,outline:"none"}}/>
      </div>
      {msg&&<div style={{fontSize:12,color:msg.startsWith("✓")?GREEN:RED,marginTop:8}}>{msg}</div>}
      {results.length>0&&(
        <div style={{marginTop:10,display:"flex",flexDirection:"column",gap:6}}>
          {results.map((c:any)=>(
            <div key={c.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:BG2,borderRadius:12,border:`1px solid ${BR1}`}}>
              {c.image_url&&<img src={c.image_url} alt="" style={{width:28,height:40,objectFit:"contain",borderRadius:4,opacity:.85}}/>}
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,color:TX1,fontWeight:400,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name_de||c.name}</div>
                <div style={{fontSize:10,color:TX3}}>{c.set_id?.toUpperCase()} · #{c.number}</div>
              </div>
              <div style={{fontSize:13,fontFamily:"var(--font-mono)",color:G,flexShrink:0}}>
                {c.price_market?.toLocaleString("de-DE",{minimumFractionDigits:2})} €
              </div>
              <button onClick={()=>addCard(c)} disabled={!!adding} style={{
                padding:"6px 14px",borderRadius:8,background:G,color:"#0a0808",
                fontSize:12,fontWeight:400,border:"none",cursor:"pointer",flexShrink:0,
              }}>{adding===c.id?"…":"+"}</button>
            </div>
          ))}
        </div>
      )}
      {loading&&<div style={{fontSize:12,color:TX3,marginTop:10,textAlign:"center"}}>Suche…</div>}
    </div>
  );
}

export default function FantasyPage() {
  const [tab, setTab]                 = useState<"team"|"leaderboard">("team");
  const [team, setTeam]               = useState<Team|null>(null);
  const [picks, setPicks]             = useState<Pick[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderEntry[]>([]);
  const [loading, setLoading]         = useState(true);
  const [removing, setRemoving]       = useState<string|null>(null);
  const season = getCurrentSeason();

  async function loadTeam() {
    setLoading(true);
    const res = await fetch("/api/fantasy/team");
    const data = await res.json();
    setTeam(data.team);
    setPicks(data.picks ?? []);
    setLoading(false);
  }

  async function loadLeaderboard() {
    const res = await fetch("/api/fantasy/leaderboard");
    const data = await res.json();
    setLeaderboard(data.leaderboard ?? []);
  }

  useEffect(() => { loadTeam(); loadLeaderboard(); }, []);

  async function removePick(pickId:string) {
    setRemoving(pickId);
    await fetch(`/api/fantasy/team?pick_id=${pickId}`, { method:"DELETE" });
    await loadTeam();
    setRemoving(null);
  }

  const totalBought  = picks.reduce((s,p)=>s+p.bought_at_price,0);
  const totalCurrent = picks.reduce((s,p)=>s+p.current_price,0);
  const totalGain    = totalBought>0 ? ((totalCurrent-totalBought)/totalBought*100) : 0;
  const budgetLeft   = 1000 - totalBought;
  const maxGain      = picks.length>0 ? Math.max(...picks.map(p=>Math.abs(p.gain_pct)),1) : 1;

  return (
    <div style={{color:TX1,minHeight:"80vh"}}>
      <div style={{maxWidth:1100,margin:"0 auto",padding:"clamp(52px,7vw,80px) clamp(16px,3vw,28px)"}}>

        {/* Hero */}
        <div style={{marginBottom:"clamp(40px,6vw,64px)"}}>
          <div style={{fontSize:9,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:TX3,marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
            <span style={{width:16,height:0.5,background:TX3,display:"inline-block"}}/>Fantasy League · {season}
          </div>
          <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(32px,5vw,60px)",fontWeight:200,letterSpacing:"-.055em",lineHeight:1.0,marginBottom:16}}>
            Baue dein<br/><span style={{color:G}}>1.000 € Team.</span>
          </h1>
          <p style={{fontSize:"clamp(14px,1.5vw,17px)",color:TX2,maxWidth:480,lineHeight:1.8,fontWeight:300}}>
            Wähle bis zu 5 Karten mit einem Budget von 1.000 €. Punkte basieren auf echten Preisveränderungen. Monatlicher Reset.
          </p>
        </div>

        {/* Tabs */}
        <div style={{display:"flex",gap:2,marginBottom:24,background:BG1,borderRadius:14,padding:4,border:`1px solid ${BR1}`,width:"fit-content"}}>
          {([["team","Mein Team"],["leaderboard","Leaderboard"]] as const).map(([t,l])=>(
            <button key={t} onClick={()=>setTab(t)} style={{
              padding:"8px 20px",borderRadius:10,fontSize:13,fontWeight:400,border:"none",cursor:"pointer",
              background:tab===t?BG2:"transparent",color:tab===t?TX1:TX3,
              transition:"all .2s",
            }}>{l}</button>
          ))}
        </div>

        {tab==="team" && (
          <div style={{display:"grid",gridTemplateColumns:"1fr 320px",gap:16,alignItems:"start"}}>
            {/* Left: picks */}
            <div>
              {/* Stats bar */}
              {picks.length>0&&(
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
                  {[
                    {l:"Eingekauft",v:`${totalBought.toLocaleString("de-DE",{minimumFractionDigits:2})} €`,c:TX2},
                    {l:"Aktuell",v:`${totalCurrent.toLocaleString("de-DE",{minimumFractionDigits:2})} €`,c:TX1},
                    {l:"Performance",v:`${totalGain>=0?"+":""}${totalGain.toFixed(1)} %`,c:totalGain>=0?GREEN:RED},
                  ].map(s=>(
                    <div key={s.l} style={{background:BG1,border:`1px solid ${BR1}`,borderRadius:14,padding:"14px 16px"}}>
                      <div style={{fontSize:9,color:TX3,textTransform:"uppercase",letterSpacing:".08em",marginBottom:6}}>{s.l}</div>
                      <div style={{fontSize:18,fontWeight:300,fontFamily:"var(--font-mono)",color:s.c,letterSpacing:"-.03em"}}>{s.v}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pick list */}
              {loading ? (
                <div style={{padding:"48px",textAlign:"center",fontSize:14,color:TX3}}>Lädt…</div>
              ) : picks.length===0 ? (
                <div style={{background:BG1,border:`1px solid ${BR2}`,borderRadius:22,padding:"48px 24px",textAlign:"center"}}>
                  <div style={{fontSize:13,color:TX3,lineHeight:1.7,marginBottom:20}}>
                    Dein Team ist leer.<br/>Füge bis zu 5 Karten mit max. 1.000 € Budget hinzu.
                  </div>
                </div>
              ) : (
                <div style={{background:BG1,border:`1px solid ${BR2}`,borderRadius:22,overflow:"hidden"}}>
                  <div style={{padding:"16px 20px",borderBottom:`1px solid ${BR1}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <div style={{fontSize:13,fontWeight:500,color:TX1}}>{picks.length}/5 Karten · {budgetLeft.toFixed(2)} € übrig</div>
                    <div style={{fontSize:11,color:TX3}}>Saison {season}</div>
                  </div>
                  {picks.map((p,i)=>(
                    <div key={p.id} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 20px",borderBottom:i<picks.length-1?`1px solid ${BR1}`:undefined}}>
                      {p.cards?.image_url&&<img src={p.cards.image_url} alt="" style={{width:32,height:44,objectFit:"contain",borderRadius:4,opacity:.85}}/>}
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,color:TX1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.cards?.name_de||p.cards?.name}</div>
                        <div style={{fontSize:10,color:TX3}}>{p.cards?.set_id?.toUpperCase()} · #{p.cards?.number}</div>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                        <ScoreBar pct={p.gain_pct} max={maxGain}/>
                        <div style={{fontSize:12,fontFamily:"var(--font-mono)",color:p.gain_pct>=0?GREEN:RED,minWidth:52,textAlign:"right"}}>
                          {p.gain_pct>=0?"+":""}{p.gain_pct}%
                        </div>
                      </div>
                      <div style={{fontSize:14,fontFamily:"var(--font-mono)",color:G,flexShrink:0,minWidth:72,textAlign:"right"}}>
                        {p.current_price.toLocaleString("de-DE",{minimumFractionDigits:2})} €
                      </div>
                      <button onClick={()=>removePick(p.id)} disabled={removing===p.id} style={{
                        width:28,height:28,borderRadius:"50%",background:"transparent",
                        border:`1px solid ${BR2}`,color:TX3,fontSize:14,cursor:"pointer",flexShrink:0,
                        display:"flex",alignItems:"center",justifyContent:"center",
                      }}>{removing===p.id?"…":"×"}</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Team builder */}
            <div>
              <TeamBuilder onAdded={loadTeam}/>
              <div style={{background:BG1,border:`1px solid ${BR1}`,borderRadius:16,padding:"14px 16px"}}>
                <div style={{fontSize:11,color:TX3,lineHeight:1.7}}>
                  <div style={{fontWeight:500,color:TX2,marginBottom:6}}>Spielregeln</div>
                  Max. 5 Karten · Budget 1.000 € · Punkte = Preisänderung in % · Reset am 1. des Monats · Bester Score gewinnt Trophy Card ✦
                </div>
              </div>
            </div>
          </div>
        )}

        {tab==="leaderboard" && (
          <div>
            <div style={{background:BG1,border:`1px solid ${BR2}`,borderRadius:22,overflow:"hidden"}}>
              <div style={{padding:"16px 20px",borderBottom:`1px solid ${BR1}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{fontSize:13,fontWeight:500,color:TX1}}>Top-Teams · Saison {season}</div>
                <div style={{fontSize:11,color:TX3}}>{leaderboard.length} Teams</div>
              </div>
              {leaderboard.length===0 ? (
                <div style={{padding:"48px",textAlign:"center",fontSize:13,color:TX3}}>
                  Noch keine Teams diese Saison. Sei der Erste!
                </div>
              ) : leaderboard.map((t,i)=>(
                <div key={t.id} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 20px",borderBottom:i<leaderboard.length-1?`1px solid ${BR1}`:undefined}}>
                  <div style={{
                    width:28,fontSize:12,fontFamily:"var(--font-mono)",fontWeight:400,flexShrink:0,textAlign:"center",
                    color:i===0?G:i===1?"#BEB9B0":i===2?"#8a7a5a":TX3,
                  }}>
                    {String(i+1).padStart(2,"0")}
                  </div>
                  <div style={{width:32,height:32,borderRadius:"50%",background:BG2,border:`1px solid ${BR1}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:G,flexShrink:0}}>
                    {t.username[0]?.toUpperCase()??"?"}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,color:TX1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>@{t.username}</div>
                    <div style={{fontSize:10,color:TX3}}>{t.picks_count} Karten · {t.current_value.toFixed(2)} €</div>
                  </div>
                  <div style={{fontSize:16,fontFamily:"var(--font-mono)",fontWeight:300,color:t.score>=0?GREEN:RED,flexShrink:0}}>
                    {t.score>=0?"+":""}{t.score}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
