"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const B1="#0C0C1A",B2="#101020",B3="#161628";
const BR1="rgba(255,255,255,0.048)",BR2="rgba(255,255,255,0.080)";
const T1="#EDEAF6",T2="#8A89A8",T3="#454462";
const G="#E9A84B";
const GREEN="#4BBF82",RED="#E04558";

interface Card {
  id:string;name:string;name_de?:string|null;set_id:string;number:string;
  image_url:string|null;price_market:number|null;price_avg7:number|null;price_avg30:number|null;
  types?:string[]|null;rarity?:string|null;
}

function Sparkline({pct,up}:{pct:number;up:boolean}) {
  const color=up?GREEN:RED;
  const path=up
    ?"M0 20 C10 18,20 15,30 12 S45 8,60 5"
    :"M0 5 C10 7,20 10,30 14 S45 18,60 20";
  return(
    <svg width="60" height="24" viewBox="0 0 60 24" fill="none">
      <path d={path} stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export default function TopMoversPage() {
  const [cards,setCards]=useState<Card[]>([]);
  const [loading,setLoading]=useState(true);
  const [period,setPeriod]=useState<"7d"|"30d">("7d");

  useEffect(()=>{
    async function load(){
      setLoading(true);
      try{
        const {createClient}=await import("@/lib/supabase/client");
        const sb=createClient();
        const {data}=await sb.from("cards")
          .select("id,name,name_de,set_id,number,image_url,price_market,price_avg7,price_avg30,types,rarity")
          .not("price_market","is",null)
          .gt("price_market",1)
          .order("price_market",{ascending:false})
          .limit(50);
        setCards(data??[]);
      }finally{setLoading(false);}
    }
    load();
  },[]);

  const withPct=cards.map(c=>{
    const base=period==="7d"?c.price_avg7:c.price_avg30;
    const pct=base&&base>0?((c.price_market??0)-base)/base*100:null;
    return{...c,pct};
  }).filter(c=>c.pct!==null).sort((a,b)=>Math.abs(b.pct!)-Math.abs(a.pct!));

  const gainers=withPct.filter(c=>(c.pct??0)>=0).slice(0,15);
  const losers=withPct.filter(c=>(c.pct??0)<0).slice(0,15);

  function CardRow({card}:{card:typeof withPct[0]}) {
    const img=card.image_url??`https://assets.tcgdex.net/en/${card.set_id}/${card.number}/low.webp`;
    const name=card.name_de??card.name;
    const up=(card.pct??0)>=0;
    return(
      <Link href={`/preischeck?q=${encodeURIComponent(card.name)}`} style={{textDecoration:"none"}}>
        <div style={{
          display:"flex",alignItems:"center",gap:12,
          padding:"12px 20px",
          borderBottom:`1px solid rgba(255,255,255,0.038)`,
          transition:"background .1s",cursor:"pointer",
        }}
        onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background="rgba(255,255,255,0.015)";}}
        onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="transparent";}}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img} alt={name} width={36} height={50} style={{objectFit:"contain",borderRadius:4,flexShrink:0}}/>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:12.5,fontWeight:500,color:T1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{name}</div>
            <div style={{fontSize:9.5,color:T3,marginTop:1}}>{card.set_id.toUpperCase()}</div>
          </div>
          <Sparkline pct={card.pct!} up={up}/>
          <div style={{textAlign:"right",minWidth:52}}>
            <div style={{fontSize:11,fontWeight:600,color:up?GREEN:RED}}>{up?"+":""}{card.pct!.toFixed(1)}%</div>
            <div style={{fontSize:11,fontWeight:500,fontFamily:"'DM Mono',monospace",color:G,marginTop:1}}>{Number(card.price_market).toFixed(2)}€</div>
          </div>
        </div>
      </Link>
    );
  }

  return(
    <div style={{minHeight:"80vh",color:T1}}>
      <div style={{maxWidth:1100,margin:"0 auto",padding:"32px 24px"}}>

        {/* Header */}
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:28}}>
          <div>
            <h1 style={{fontSize:22,fontWeight:500,letterSpacing:"-.03em",color:T1,marginBottom:4}}>Top Movers</h1>
            <p style={{fontSize:12,color:T3}}>Größte Preisbewegungen · Cardmarket EUR</p>
          </div>
          <div style={{display:"flex",gap:3,background:B2,border:`1px solid ${BR2}`,borderRadius:9,padding:3}}>
            {(["7d","30d"] as const).map(p=>(
              <button key={p} onClick={()=>setPeriod(p)} style={{
                padding:"5px 14px",borderRadius:6,fontSize:11,fontWeight:500,cursor:"pointer",border:"none",
                background:period===p?B3:B2,color:period===p?T1:T3,
                transition:"all .12s",
              }}>{p==="7d"?"7 Tage":"30 Tage"}</button>
            ))}
          </div>
        </div>

        {loading?(
          <div style={{textAlign:"center",padding:"64px",color:T3}}>Lade Daten…</div>
        ):(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {/* Gainers */}
            <div style={{background:B2,border:`1px solid ${BR2}`,borderRadius:20,overflow:"hidden"}}>
              <div style={{padding:"16px 20px",borderBottom:`1px solid ${BR1}`}}>
                <div style={{fontSize:13,fontWeight:500,color:GREEN}}>▲ Größte Gewinner</div>
                <div style={{fontSize:10,color:T3,marginTop:2}}>{period==="7d"?"7 Tage":"30 Tage"} · {gainers.length} Karten</div>
              </div>
              {gainers.length>0
                ?gainers.map(c=><CardRow key={c.id} card={c}/>)
                :<div style={{padding:"32px",textAlign:"center",color:T3,fontSize:12}}>Keine Daten für diesen Zeitraum</div>}
            </div>
            {/* Losers */}
            <div style={{background:B2,border:`1px solid ${BR2}`,borderRadius:20,overflow:"hidden"}}>
              <div style={{padding:"16px 20px",borderBottom:`1px solid ${BR1}`}}>
                <div style={{fontSize:13,fontWeight:500,color:RED}}>▼ Größte Verlierer</div>
                <div style={{fontSize:10,color:T3,marginTop:2}}>{period==="7d"?"7 Tage":"30 Tage"} · {losers.length} Karten</div>
              </div>
              {losers.length>0
                ?losers.map(c=><CardRow key={c.id} card={c}/>)
                :<div style={{padding:"32px",textAlign:"center",color:T3,fontSize:12}}>Keine Daten für diesen Zeitraum</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
