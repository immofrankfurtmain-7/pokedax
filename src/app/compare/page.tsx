"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const G="#C9A66B",G18="rgba(201,166,107,0.18)",G08="rgba(201,166,107,0.08)";
const BG1="#16161A",BG2="#1C1C21",BR1="rgba(255,255,255,0.045)",BR2="rgba(255,255,255,0.085)";
const TX1="#F8F6F2",TX2="#BEB9B0",TX3="#6E6B66",GREEN="#3db87a",RED="#dc4a5a";

const SB = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function StatRow({label, a, b, higherIsBetter=true}: {label:string; a:any; b:any; higherIsBetter?:boolean}) {
  const aNum = parseFloat(a) || 0;
  const bNum = parseFloat(b) || 0;
  const aWins = higherIsBetter ? aNum > bNum : aNum < bNum;
  const bWins = higherIsBetter ? bNum > aNum : bNum < aNum;
  return (
    <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:8,alignItems:"center",
      padding:"10px 0",borderBottom:`0.5px solid ${BR1}`}}>
      <div style={{textAlign:"right",fontSize:13,fontFamily:"var(--font-mono)",fontWeight:300,
        color:aWins?G:TX2}}>{a ?? "—"}</div>
      <div style={{fontSize:10,color:TX3,textAlign:"center",width:120,flexShrink:0}}>{label}</div>
      <div style={{textAlign:"left",fontSize:13,fontFamily:"var(--font-mono)",fontWeight:300,
        color:bWins?G:TX2}}>{b ?? "—"}</div>
    </div>
  );
}

function CardSearch({onSelect,placeholder}:{onSelect:(c:any)=>void;placeholder:string}) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<any[]>([]);

  async function search(val: string) {
    setQ(val);
    if (val.length < 2) { setResults([]); return; }
    const r = await fetch(`/api/cards/search?q=${encodeURIComponent(val)}&limit=5`);
    const d = await r.json();
    setResults(d.cards ?? []);
  }

  return (
    <div style={{position:"relative"}}>
      <input value={q} onChange={e=>search(e.target.value)} placeholder={placeholder}
        style={{width:"100%",padding:"10px 14px",borderRadius:12,background:"rgba(0,0,0,0.3)",
          border:`0.5px solid ${BR2}`,color:TX1,fontSize:13,outline:"none"}}/>
      {results.length>0&&(
        <div style={{position:"absolute",top:"calc(100%+4px)",left:0,right:0,
          background:BG1,border:`0.5px solid ${BR2}`,borderRadius:12,
          zIndex:50,overflow:"hidden",boxShadow:"0 8px 32px rgba(0,0,0,0.5)"}}>
          {results.map((c:any)=>(
            <div key={c.id} onClick={()=>{onSelect(c);setQ(c.name_de||c.name);setResults([]);}}
              style={{display:"flex",alignItems:"center",gap:10,padding:"9px 14px",
                cursor:"pointer",transition:"background .1s"}}
              onMouseEnter={e=>(e.currentTarget.style.background=BG2)}
              onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
              {c.image_url&&<img src={c.image_url} alt="" style={{width:20,height:28,objectFit:"contain"}}/>}
              <div style={{flex:1,fontSize:12,color:TX1}}>{c.name_de||c.name}</div>
              <div style={{fontSize:11,fontFamily:"var(--font-mono)",color:G}}>{c.price_market?.toFixed(2)} €</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ComparePage() {
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const [cardA, setCardA] = useState<any>(null);
  const [cardB, setCardB] = useState<any>(null);

  useEffect(()=>{
    const p = new URLSearchParams(window.location.search);
    const a = p.get("a"), b = p.get("b");
    if (a) SB.from("cards").select("*").eq("id",a).single().then(({data})=>setCardA(data));
    if (b) SB.from("cards").select("*").eq("id",b).single().then(({data})=>setCardB(data));
  },[]);

  const TYPE_DE:Record<string,string>={Fire:"Feuer",Water:"Wasser",Grass:"Pflanze",
    Lightning:"Elektro",Psychic:"Psycho",Fighting:"Kampf",Darkness:"Finsternis",
    Metal:"Metall",Dragon:"Drache",Colorless:"Farblos"};

  return (
    <div style={{color:TX1,minHeight:"80vh"}}>
      <div style={{maxWidth:900,margin:"0 auto",padding:"clamp(52px,7vw,80px) clamp(16px,3vw,28px)"}}>

        {/* Header */}
        <div style={{marginBottom:32}}>
          <div style={{fontSize:9,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",
            color:TX3,marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
            <span style={{width:16,height:0.5,background:TX3,display:"inline-block"}}/>Vergleich
          </div>
          <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(26px,4vw,44px)",
            fontWeight:200,letterSpacing:"-.055em"}}>
            Karten<span style={{color:G}}>vergleich</span>
          </h1>
        </div>

        {/* Search boxes */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 40px 1fr",gap:12,alignItems:"center",marginBottom:24}}>
          <CardSearch onSelect={setCardA} placeholder="Erste Karte suchen…"/>
          <div style={{textAlign:"center",fontSize:16,color:TX3}}>vs</div>
          <CardSearch onSelect={setCardB} placeholder="Zweite Karte suchen…"/>
        </div>

        {/* Cards display */}
        {(cardA || cardB) && (
          <>
            {/* Card images */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:24}}>
              {[cardA, cardB].map((card, i) => (
                <div key={i} style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:18,
                  padding:20,textAlign:"center"}}>
                  {card ? (
                    <>
                      <div style={{width:120,height:168,margin:"0 auto 14px",borderRadius:10,
                        overflow:"hidden",background:BG2}}>
                        {card.image_url&&<img src={card.image_url} alt="" style={{width:"100%",height:"100%",objectFit:"contain"}}/>}
                      </div>
                      <div style={{fontSize:15,fontWeight:400,color:TX1,marginBottom:4}}>{card.name_de||card.name}</div>
                      <div style={{fontSize:11,color:TX3}}>{card.set_id?.toUpperCase()} · #{card.number}</div>
                      <div style={{fontSize:20,fontFamily:"var(--font-mono)",fontWeight:300,color:G,marginTop:10}}>
                        {card.price_market?.toLocaleString("de-DE",{minimumFractionDigits:2})} €
                      </div>
                    </>
                  ) : (
                    <div style={{height:168,display:"flex",alignItems:"center",justifyContent:"center",color:TX3,fontSize:12}}>
                      Karte wählen
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Stats comparison */}
            {cardA && cardB && (
              <div style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:18,padding:"8px 20px"}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:8,padding:"10px 0",
                  borderBottom:`0.5px solid ${BR1}`,marginBottom:4}}>
                  <div style={{textAlign:"right",fontSize:10,color:TX3,fontWeight:600,letterSpacing:".08em",textTransform:"uppercase"}}>
                    {cardA.name_de||cardA.name}
                  </div>
                  <div style={{width:120,textAlign:"center"}}/>
                  <div style={{textAlign:"left",fontSize:10,color:TX3,fontWeight:600,letterSpacing:".08em",textTransform:"uppercase"}}>
                    {cardB.name_de||cardB.name}
                  </div>
                </div>
                <StatRow label="Marktpreis"
                  a={`${cardA.price_market?.toLocaleString("de-DE",{minimumFractionDigits:2})} €`}
                  b={`${cardB.price_market?.toLocaleString("de-DE",{minimumFractionDigits:2})} €`}
                  higherIsBetter={false}/>
                <StatRow label="Niedrigster Preis"
                  a={cardA.price_low?`${cardA.price_low?.toFixed(2)} €`:"—"}
                  b={cardB.price_low?`${cardB.price_low?.toFixed(2)} €`:"—"}
                  higherIsBetter={false}/>
                <StatRow label="7T-Trend"
                  a={cardA.price_avg7?`${((cardA.price_market-cardA.price_avg7)/cardA.price_avg7*100).toFixed(1)}%`:"—"}
                  b={cardB.price_avg7?`${((cardB.price_market-cardB.price_avg7)/cardB.price_avg7*100).toFixed(1)}%`:"—"}/>
                <StatRow label="KP" a={cardA.hp??"—"} b={cardB.hp??"—"}/>
                <StatRow label="Typ"
                  a={cardA.types?.map((t:string)=>TYPE_DE[t]??t).join(", ")??"—"}
                  b={cardB.types?.map((t:string)=>TYPE_DE[t]??t).join(", ")??"—"}
                  higherIsBetter={true}/>
                <StatRow label="Rarity" a={cardA.rarity??"—"} b={cardB.rarity??"—"} higherIsBetter={true}/>
                <StatRow label="Set" a={cardA.set_id?.toUpperCase()??"—"} b={cardB.set_id?.toUpperCase()??"—"} higherIsBetter={true}/>
              </div>
            )}

            {/* Links */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:16}}>
              {[cardA,cardB].map((card,i)=>card&&(
                <Link key={i} href={`/preischeck/${card.id}`} style={{
                  display:"block",padding:"10px",borderRadius:12,textAlign:"center",
                  background:G08,border:`0.5px solid ${G18}`,color:G,
                  textDecoration:"none",fontSize:13,
                }}>Details: {card.name_de||card.name} →</Link>
              ))}
            </div>
          </>
        )}

        {!cardA && !cardB && (
          <div style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:20,
            padding:"60px",textAlign:"center"}}>
            <div style={{fontSize:32,opacity:.2,marginBottom:16}}>◈ vs ◈</div>
            <div style={{fontSize:14,color:TX3}}>Zwei Karten wählen um sie zu vergleichen.</div>
          </div>
        )}
      </div>
    </div>
  );
}
