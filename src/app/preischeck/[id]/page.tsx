"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const G="#D4A843",G25="rgba(212,168,67,0.25)",G18="rgba(212,168,67,0.18)",G08="rgba(212,168,67,0.08)";
const BG1="#111114",BG2="#18181c",BR1="rgba(255,255,255,0.045)",BR2="rgba(255,255,255,0.085)";
const TX1="#ededf2",TX2="#a4a4b4",TX3="#62626f",GREEN="#3db87a",RED="#dc4a5a";

const TYPE_COLOR: Record<string,string> = {
  Fire:"#F97316",Water:"#38BDF8",Grass:"#4ADE80",Lightning:"#D4A843",
  Psychic:"#A855F7",Fighting:"#EF4444",Darkness:"#6B7280",Metal:"#9CA3AF",
  Dragon:"#7C3AED",Colorless:"#CBD5E1",
};
const TYPE_DE: Record<string,string> = {
  Fire:"Feuer",Water:"Wasser",Grass:"Pflanze",Lightning:"Elektro",
  Psychic:"Psycho",Fighting:"Kampf",Darkness:"Finsternis",Metal:"Metall",
  Dragon:"Drache",Colorless:"Farblos",
};

interface Card {
  id:string; name:string; name_de:string|null; set_id:string; number:string;
  types:string[]|null; rarity:string|null; image_url:string|null;
  price_market:number|null; price_low:number|null;
  price_avg7:number|null; price_avg30:number|null;
  hp:string|null; category:string|null; stage:string|null;
  illustrator:string|null; regulation_mark:string|null;
  is_holo:boolean|null; is_reverse_holo:boolean|null;
}

function PriceChart({avg7, avg30, market, history}: {avg7:number|null; avg30:number|null; market:number|null; history?:{price_market:number;recorded_at:string}[]}) {
  if (!market) return null;

  // Use real history if available, else interpolate from averages
  let pts: number[];
  if (history && history.length >= 3) {
    pts = history.map(h => h.price_market).reverse();
  } else {
    const p30 = avg30 ?? market * 0.88;
    const p7  = avg7  ?? market * 0.96;
    const now = market;
    pts = [
      p30, p30*1.02, p30*0.98, p30*1.04, p30*1.01,
      p7*0.97, p7, p7*1.02, p7*0.99, p7*1.01,
      now*0.98, now*1.01, now*0.99, now,
    ];
  }

  const min = Math.min(...pts) * 0.97;
  const max = Math.max(...pts) * 1.03;
  const range = max - min;

  const W = 600, H = 80;
  const xStep = W / (pts.length - 1);
  const toY = (v: number) => H - ((v - min) / range) * H;

  const pathD = pts.map((v,i) => `${i===0?"M":"L"}${i*xStep},${toY(v)}`).join(" ");
  const fillD = pathD + ` L${(pts.length-1)*xStep},${H} L0,${H}Z`;

  const trend7  = avg7  ? ((market - avg7)  / avg7  * 100) : null;
  const trend30 = avg30 ? ((market - avg30) / avg30 * 100) : null;

  return (
    <div style={{background:BG1,border:`1px solid ${BR2}`,borderRadius:18,padding:"20px",marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:16}}>
        <div style={{fontSize:11,fontWeight:500,color:TX2}}>Preisverlauf</div>
        <div style={{display:"flex",gap:16}}>
          {trend7!==null&&(
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:9,color:TX3,marginBottom:2}}>7 Tage</div>
              <div style={{fontSize:12,fontWeight:500,color:trend7>=0?GREEN:RED}}>
                {trend7>=0?"+":""}{trend7.toFixed(1)}%
              </div>
            </div>
          )}
          {trend30!==null&&(
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:9,color:TX3,marginBottom:2}}>30 Tage</div>
              <div style={{fontSize:12,fontWeight:500,color:trend30>=0?GREEN:RED}}>
                {trend30>=0?"+":""}{trend30.toFixed(1)}%
              </div>
            </div>
          )}
        </div>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H+4}`} preserveAspectRatio="none" style={{display:"block",height:70}}>
        <defs>
          <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={G} stopOpacity=".25"/>
            <stop offset="100%" stopColor={G} stopOpacity="0"/>
          </linearGradient>
        </defs>
        <path d={fillD} fill="url(#cg)"/>
        <path d={pathD} fill="none" stroke={G} strokeWidth="1.8" opacity=".8"/>
        {/* Current price dot */}
        <circle cx={(pts.length-1)*xStep} cy={toY(now)} r="3" fill={G}/>
      </svg>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:8,fontSize:9,color:TX3}}>
        <span>vor 30 Tagen</span>
        <span>vor 7 Tagen</span>
        <span>Heute</span>
      </div>
    </div>
  );
}

export default function CardDetailPage() {
  const params = useParams();
  const cardId = params.id as string;
  const [card,    setCard]    = useState<Card|null>(null);
  const [loading, setLoading] = useState(true);
  const [inColl,  setInColl]  = useState(false);
  const [inWish,  setInWish]  = useState(false);
  const [user,    setUser]    = useState<any>(null);
  const [adding,  setAdding]  = useState(false);

  const [priceHistory, setPriceHistory] = useState<{price_market:number;recorded_at:string}[]>([]);

  useEffect(() => {
    const sb = createClient();
    // Load price history
    sb.from("price_history")
      .select("price_market, recorded_at")
      .eq("card_id", cardId)
      .order("recorded_at", { ascending: false })
      .limit(30)
      .then(({ data }) => setPriceHistory(data ?? []));
    // Load card
    sb.from("cards")
      .select("id,name,name_de,set_id,number,types,rarity,image_url,price_market,price_low,price_avg7,price_avg30,hp,category,stage,illustrator,regulation_mark,is_holo,is_reverse_holo")
      .eq("id", cardId)
      .single()
      .then(({data}) => {
        setCard(data as Card);
        setLoading(false);
      });

    // Check user + collection status
    sb.auth.getUser().then(async ({data:{user}}) => {
      if (!user) return;
      setUser(user);
      const [col, wish] = await Promise.all([
        sb.from("user_collection").select("id").eq("user_id",user.id).eq("card_id",cardId).maybeSingle(),
        sb.from("user_wishlist").select("id").eq("user_id",user.id).eq("card_id",cardId).maybeSingle(),
      ]);
      setInColl(!!col.data);
      setInWish(!!wish.data);
    });
  }, [cardId]);

  async function toggleCollection() {
    if (!user || !card) return;
    setAdding(true);
    const sb = createClient();
    if (inColl) {
      await sb.from("user_collection").delete().eq("user_id",user.id).eq("card_id",cardId);
      setInColl(false);
    } else {
      await sb.from("user_collection").insert({user_id:user.id,card_id:cardId,quantity:1,condition:"NM"});
      setInColl(true);
    }
    setAdding(false);
  }

  async function toggleWishlist() {
    if (!user || !card) return;
    setAdding(true);
    const sb = createClient();
    if (inWish) {
      await sb.from("user_wishlist").delete().eq("user_id",user.id).eq("card_id",cardId);
      setInWish(false);
    } else {
      await sb.from("user_wishlist").insert({user_id:user.id,card_id:cardId});
      setInWish(true);
    }
    setAdding(false);
  }

  if (loading) return (
    <div style={{color:TX1,minHeight:"80vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{fontSize:14,color:TX3}}>Lädt…</div>
    </div>
  );

  if (!card) return (
    <div style={{color:TX1,minHeight:"80vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:14,color:TX3,marginBottom:12}}>Karte nicht gefunden.</div>
        <Link href="/preischeck" style={{fontSize:13,color:G,textDecoration:"none"}}>← Zurück zum Preischeck</Link>
      </div>
    </div>
  );

  const type     = card.types?.[0];
  const typeColor = type ? (TYPE_COLOR[type]??TX3) : TX3;
  const priceFmt = card.price_market?.toLocaleString("de-DE",{minimumFractionDigits:2}) + " €";
  const trend7   = card.price_avg7 && card.price_market ? ((card.price_market-card.price_avg7)/card.price_avg7*100) : null;

  return (
    <div style={{color:TX1,minHeight:"80vh"}}>
      <div style={{maxWidth:1000,margin:"0 auto",padding:"clamp(40px,6vw,72px) clamp(16px,3vw,28px)"}}>

        {/* Back */}
        <Link href="/preischeck" style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:12,color:TX3,textDecoration:"none",marginBottom:32}}>
          ← Zurück
        </Link>

        <div style={{display:"grid",gridTemplateColumns:"280px 1fr",gap:24,alignItems:"start"}}>

          {/* Left: Card image */}
          <div>
            <div style={{
              background:BG2,borderRadius:20,overflow:"hidden",
              border:`1px solid ${BR2}`,aspectRatio:"2/3",
              display:"flex",alignItems:"center",justifyContent:"center",
              position:"relative",
            }}>
              {card.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={card.image_url} alt={card.name_de??card.name}
                  style={{width:"100%",height:"100%",objectFit:"contain",padding:12}}/>
              ) : (
                <div style={{fontSize:48,opacity:.1}}>◈</div>
              )}
              {(card.is_holo||card.is_reverse_holo)&&(
                <div style={{position:"absolute",top:10,right:10,padding:"2px 8px",borderRadius:5,background:G08,color:G,fontSize:9,fontWeight:600}}>
                  {card.is_reverse_holo?"REV. HOLO":"HOLO"}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div style={{display:"flex",gap:8,marginTop:12}}>
              <button onClick={toggleCollection} disabled={!user||adding} style={{
                flex:1,padding:"10px",borderRadius:12,fontSize:12,fontWeight:400,border:"none",cursor:user?"pointer":"default",
                background:inColl?G08:"rgba(255,255,255,0.04)",
                color:inColl?G:TX3,
                outline:`1px solid ${inColl?G18:BR1}`,
                transition:"all .2s",
              }}>
                {inColl?"✓ In Sammlung":"+ Sammlung"}
              </button>
              <button onClick={toggleWishlist} disabled={!user||adding} style={{
                flex:1,padding:"10px",borderRadius:12,fontSize:12,fontWeight:400,border:"none",cursor:user?"pointer":"default",
                background:inWish?"rgba(220,74,90,0.08)":"rgba(255,255,255,0.04)",
                color:inWish?RED:TX3,
                outline:`1px solid ${inWish?"rgba(220,74,90,0.2)":BR1}`,
                transition:"all .2s",
              }}>
                {inWish?"♥ Wunschliste":"♡ Wunschliste"}
              </button>
            </div>
            {!user&&<div style={{fontSize:10,color:TX3,textAlign:"center",marginTop:8}}>
              <Link href="/auth/login" style={{color:G,textDecoration:"none"}}>Anmelden</Link> zum Sammeln
            </div>}
          </div>

          {/* Right: Details */}
          <div>
            {/* Type badge */}
            {type&&(
              <div style={{display:"inline-flex",alignItems:"center",gap:6,marginBottom:12,padding:"4px 12px",borderRadius:8,background:`${typeColor}12`,border:`0.5px solid ${typeColor}25`}}>
                <div style={{width:7,height:7,borderRadius:"50%",background:typeColor}}/>
                <span style={{fontSize:11,fontWeight:500,color:typeColor}}>{TYPE_DE[type]??type}</span>
              </div>
            )}

            {/* Name */}
            <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(24px,4vw,40px)",fontWeight:200,letterSpacing:"-.04em",marginBottom:6,lineHeight:1.1}}>
              {card.name_de||card.name}
            </h1>
            {card.name_de&&card.name_de!==card.name&&(
              <div style={{fontSize:13,color:TX3,marginBottom:16}}>{card.name}</div>
            )}

            {/* Set info */}
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:24}}>
              <span style={{fontSize:11,color:TX3,fontFamily:"var(--font-mono)"}}>{card.set_id.toUpperCase()}</span>
              <span style={{color:TX3,fontSize:11}}>·</span>
              <span style={{fontSize:11,color:TX3}}>#{card.number}</span>
              {card.rarity&&<><span style={{color:TX3}}>·</span><span style={{fontSize:11,color:TX2}}>{card.rarity}</span></>}
              {card.regulation_mark&&<><span style={{color:TX3}}>·</span><span style={{fontSize:11,color:TX3}}>{card.regulation_mark}</span></>}
            </div>

            {/* Price block */}
            <div style={{background:BG1,border:`1px solid ${BR2}`,borderRadius:18,padding:"18px 20px",marginBottom:14}}>
              <div style={{fontSize:9,color:TX3,textTransform:"uppercase",letterSpacing:".1em",marginBottom:6}}>Marktpreis</div>
              <div style={{display:"flex",alignItems:"baseline",gap:12,flexWrap:"wrap"}}>
                <div style={{fontFamily:"var(--font-mono)",fontSize:"clamp(32px,5vw,52px)",fontWeight:300,color:G,letterSpacing:"-.05em",lineHeight:1}}>
                  {priceFmt}
                </div>
                {trend7!==null&&(
                  <div style={{fontSize:13,fontWeight:500,color:trend7>=0?GREEN:RED}}>
                    {trend7>=0?"▲":"▼"} {Math.abs(trend7).toFixed(1)}% (7T)
                  </div>
                )}
              </div>
              {(card.price_low||card.price_avg30)&&(
                <div style={{display:"flex",gap:16,marginTop:12,flexWrap:"wrap"}}>
                  {card.price_low&&(
                    <div>
                      <div style={{fontSize:9,color:TX3,marginBottom:2}}>Niedrigster</div>
                      <div style={{fontSize:13,fontFamily:"var(--font-mono)",color:TX2}}>{card.price_low.toLocaleString("de-DE",{minimumFractionDigits:2})} €</div>
                    </div>
                  )}
                  {card.price_avg30&&(
                    <div>
                      <div style={{fontSize:9,color:TX3,marginBottom:2}}>30T-Schnitt</div>
                      <div style={{fontSize:13,fontFamily:"var(--font-mono)",color:TX2}}>{card.price_avg30.toLocaleString("de-DE",{minimumFractionDigits:2})} €</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Price chart */}
            <PriceChart avg7={card.price_avg7} avg30={card.price_avg30} market={card.price_market} history={priceHistory}/>

            {/* Card stats */}
            <div style={{background:BG1,border:`1px solid ${BR2}`,borderRadius:18,overflow:"hidden",marginBottom:14}}>
              <div style={{padding:"12px 16px",borderBottom:`1px solid ${BR1}`,fontSize:10,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:TX3}}>Details</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:0}}>
                {[
                  ["Typ",        card.types?.map(t=>TYPE_DE[t]??t).join(", ") ?? "—"],
                  ["KP",         card.hp ?? "—"],
                  ["Kategorie",  card.category ?? "—"],
                  ["Stage",      card.stage ?? "—"],
                  ["Illustrator",card.illustrator ?? "—"],
                  ["Regulation", card.regulation_mark ?? "—"],
                ].map(([l,v],i)=>(
                  <div key={l} style={{padding:"11px 16px",borderBottom:`1px solid ${BR1}`,borderRight:i%2===0?`1px solid ${BR1}`:undefined}}>
                    <div style={{fontSize:9,color:TX3,textTransform:"uppercase",letterSpacing:".08em",marginBottom:3}}>{l}</div>
                    <div style={{fontSize:12,color:TX1}}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Marketplace shortcut */}
            <Link href={`/marketplace?card=${encodeURIComponent(card.id)}`} style={{
              display:"block",padding:"12px 16px",borderRadius:14,
              background:`${G08}`,border:`1px solid ${G18}`,
              color:TX1,textDecoration:"none",fontSize:13,
              transition:"all .2s",
            }}>
              <span style={{color:G}}>◈</span> Kauf- & Tauschangebote ansehen →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
