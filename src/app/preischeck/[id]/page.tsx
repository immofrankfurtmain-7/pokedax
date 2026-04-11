"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const G="#D4A843",G18="rgba(212,168,67,0.18)",G08="rgba(212,168,67,0.08)";
const BG1="#111114",BG2="#18181c",BR1="rgba(255,255,255,0.045)",BR2="rgba(255,255,255,0.085)";
const TX1="#ededf2",TX2="#a4a4b4",TX3="#62626f",GREEN="#3db87a",RED="#dc4a5a";

const TYPE_COLOR:Record<string,string>={Fire:"#F97316",Water:"#38BDF8",Grass:"#4ADE80",Lightning:"#D4A843",Psychic:"#A855F7",Fighting:"#EF4444",Darkness:"#6B7280",Metal:"#9CA3AF",Dragon:"#7C3AED",Colorless:"#CBD5E1"};
const TYPE_DE:Record<string,string>={Fire:"Feuer",Water:"Wasser",Grass:"Pflanze",Lightning:"Elektro",Psychic:"Psycho",Fighting:"Kampf",Darkness:"Finsternis",Metal:"Metall",Dragon:"Drache",Colorless:"Farblos"};

function PriceChart({avg7,avg30,market,history}:{avg7:number|null;avg30:number|null;market:number|null;history?:{price_market:number;recorded_at:string}[]}) {
  if (!market) return null;
  let pts:number[];
  if (history && history.length>=3) {
    pts = history.map(h=>h.price_market).reverse();
  } else {
    const now=market;
    const p30=avg30??market*0.88, p7=avg7??market*0.96;
    pts=[p30,p30*1.02,p30*0.98,p30*1.04,p30*1.01,p7*0.97,p7,p7*1.02,p7*0.99,p7*1.01,now*0.98,now*1.01,now*0.99,now];
  }
  const min=Math.min(...pts)*0.97, max=Math.max(...pts)*1.03, range=max-min;
  const W=600, H=80;
  const xStep=W/(pts.length-1);
  const toY=(v:number)=>H-((v-min)/range)*H;
  const pathD=pts.map((v,i)=>`${i===0?"M":"L"}${i*xStep},${toY(v)}`).join(" ");
  const trend7=avg7?((market-avg7)/avg7*100):null;
  const trend30=avg30?((market-avg30)/avg30*100):null;
  return (
    <div style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:18,padding:"18px",marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:14}}>
        <div style={{fontSize:10,fontWeight:500,color:TX3,textTransform:"uppercase",letterSpacing:".08em"}}>Preisverlauf</div>
        <div style={{display:"flex",gap:16}}>
          {trend7!==null&&<div style={{textAlign:"right"}}><div style={{fontSize:9,color:TX3,marginBottom:2}}>7 Tage</div><div style={{fontSize:12,fontWeight:500,color:trend7>=0?GREEN:RED}}>{trend7>=0?"+":""}{trend7.toFixed(1)}%</div></div>}
          {trend30!==null&&<div style={{textAlign:"right"}}><div style={{fontSize:9,color:TX3,marginBottom:2}}>30 Tage</div><div style={{fontSize:12,fontWeight:500,color:trend30>=0?GREEN:RED}}>{trend30>=0?"+":""}{trend30.toFixed(1)}%</div></div>}
        </div>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{display:"block",height:64}}>
        <defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={G} stopOpacity=".2"/><stop offset="100%" stopColor={G} stopOpacity="0"/></linearGradient></defs>
        <path d={pathD+` L${(pts.length-1)*xStep},${H} L0,${H}Z`} fill="url(#cg)"/>
        <path d={pathD} fill="none" stroke={G} strokeWidth="1.8" opacity=".8"/>
        <circle cx={(pts.length-1)*xStep} cy={toY(market)} r="3" fill={G}/>
      </svg>
    </div>
  );
}

export default function CardDetailPage() {
  const {id} = useParams() as {id:string};
  const [card, setCard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [inColl, setInColl] = useState(false);
  const [inWish, setInWish] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [adding, setAdding] = useState(false);
  const [priceHistory,  setPriceHistory]  = useState<any[]>([]);
  const [forumPosts,    setForumPosts]    = useState<any[]>([]);
  const [alert,         setAlert]         = useState<any>(null);
  const [alertPrice,    setAlertPrice]    = useState("");
  const [alertSaved,    setAlertSaved]    = useState(false);
  const [showAlertForm, setShowAlertForm] = useState(false);

  useEffect(()=>{
    let cancelled = false;
    async function load() {
      const sb = createClient();

      // Load card
      const { data: cardData } = await sb.from("cards")
        .select("id,name,name_de,set_id,number,types,rarity,image_url,price_market,price_low,price_avg7,price_avg30,hp,category,stage,illustrator,regulation_mark,is_holo,is_reverse_holo")
        .eq("id", id).single();
      if (cancelled) return;
      setCard(cardData);
      setLoading(false);

      // Load price history
      const { data: hist } = await sb.from("price_history")
        .select("price_market,recorded_at")
        .eq("card_id", id)
        .order("recorded_at", {ascending:false})
        .limit(30);
      if (!cancelled) setPriceHistory(hist ?? []);

      // Load forum posts (needs sprint3.sql card_id column)
      try {
        const { data: posts } = await sb.from("forum_posts")
          .select("id,title,upvotes,created_at,profiles(username)")
          .eq("card_id", id)
          .eq("is_deleted", false)
          .order("created_at", {ascending:false})
          .limit(5);
        if (!cancelled && posts) setForumPosts(posts.map((p:any)=>({
          ...p,
          profiles: Array.isArray(p.profiles) ? p.profiles[0] : p.profiles,
        })));
      } catch(_) {}

      // Load auth + collection/wishlist state
      const { data: { session } } = await sb.auth.getSession();
      if (!session?.user || cancelled) return;
      setUser(session.user);
      // Load price alert for this card
      const alertRes = await fetch(`/api/price-alerts?card_id=${id}`, {
        headers: { "Authorization": `Bearer ${session.access_token}` }
      });
      const alertData = await alertRes.json();
      if (!cancelled && alertData.alert) {
        setAlert(alertData.alert);
        setAlertPrice(alertData.alert.target_price?.toString() ?? "");
      }
      const [col, wish] = await Promise.all([
        sb.from("user_collection").select("id").eq("user_id", session.user.id).eq("card_id", id).maybeSingle(),
        sb.from("user_wishlist").select("id").eq("user_id", session.user.id).eq("card_id", id).maybeSingle(),
      ]);
      if (!cancelled) {
        setInColl(!!col.data);
        setInWish(!!wish.data);
      }
    }
    load();
    return () => { cancelled = true; };
  },[id]);

  async function saveAlert() {
    if (!alertPrice || !user) return;
    const sb = createClient();
    const {data:{session}} = await sb.auth.getSession();
    const h:Record<string,string> = {"Content-Type":"application/json"};
    if (session?.access_token) h["Authorization"] = `Bearer ${session.access_token}`;
    const res = await fetch("/api/price-alerts", {
      method: "POST", headers: h,
      body: JSON.stringify({ card_id: id, target_price: parseFloat(alertPrice) }),
    });
    if (res.ok) {
      const data = await res.json();
      setAlert(data.alert);
      setAlertSaved(true);
      setShowAlertForm(false);
      setTimeout(() => setAlertSaved(false), 3000);
    }
  }

  async function deleteAlert() {
    if (!user) return;
    const sb = createClient();
    const {data:{session}} = await sb.auth.getSession();
    const h:Record<string,string> = {};
    if (session?.access_token) h["Authorization"] = `Bearer ${session.access_token}`;
    await fetch(`/api/price-alerts?card_id=${id}`, { method: "DELETE", headers: h });
    setAlert(null); setAlertPrice(""); setShowAlertForm(false);
  }

  async function toggleCollection(){
    if(!user||!card) return;
    setAdding(true);
    const sb=createClient();
    if(inColl){await sb.from("user_collection").delete().eq("user_id",user.id).eq("card_id",id);setInColl(false);}
    else{await sb.from("user_collection").insert({user_id:user.id,card_id:id,quantity:1,condition:"NM"});setInColl(true);}
    setAdding(false);
  }

  async function toggleWishlist(){
    if(!user||!card) return;
    setAdding(true);
    const sb=createClient();
    if(inWish){await sb.from("user_wishlist").delete().eq("user_id",user.id).eq("card_id",id);setInWish(false);}
    else{await sb.from("user_wishlist").insert({user_id:user.id,card_id:id});setInWish(true);}
    setAdding(false);
  }

  if(loading) return <div style={{color:TX1,minHeight:"80vh",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{fontSize:14,color:TX3}}>Lädt…</div></div>;
  if(!card) return <div style={{color:TX1,minHeight:"80vh",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{textAlign:"center"}}><div style={{fontSize:14,color:TX3,marginBottom:12}}>Karte nicht gefunden.</div><Link href="/preischeck" style={{color:G,textDecoration:"none",fontSize:13}}>← Zurück</Link></div></div>;

  const type=card.types?.[0];
  const typeColor=type?(TYPE_COLOR[type]??TX3):TX3;

  return (
    <div style={{color:TX1,minHeight:"80vh"}}>
      <div style={{maxWidth:1000,margin:"0 auto",padding:"clamp(40px,6vw,72px) clamp(16px,3vw,28px)"}}>
        <Link href="/preischeck" style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:12,color:TX3,textDecoration:"none",marginBottom:28}}>← Zurück</Link>
        <div style={{display:"grid",gridTemplateColumns:"clamp(200px,28vw,280px) 1fr",gap:24,alignItems:"start"}}>
          <div>
            <div style={{background:BG2,borderRadius:18,overflow:"hidden",border:`0.5px solid ${BR2}`,aspectRatio:"2/3",display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
              {card.image_url?<img src={card.image_url} alt={card.name_de??card.name} style={{width:"100%",height:"100%",objectFit:"contain",padding:12}}/>:<div style={{fontSize:48,opacity:.1}}>◈</div>}
              {(card.is_holo||card.is_reverse_holo)&&<div style={{position:"absolute",top:10,right:10,padding:"2px 8px",borderRadius:5,background:G08,color:G,fontSize:9,fontWeight:600}}>{card.is_reverse_holo?"REV. HOLO":"HOLO"}</div>}
            </div>
            <div style={{display:"flex",gap:8,marginTop:12}}>
              <button onClick={toggleCollection} disabled={!user||adding} style={{flex:1,padding:"10px",borderRadius:11,fontSize:12,border:"none",cursor:user?"pointer":"default",background:inColl?G08:"rgba(255,255,255,0.04)",color:inColl?G:TX3,outline:`0.5px solid ${inColl?G18:BR1}`,transition:"all .2s"}}>
                {inColl?"✓ In Sammlung":"+ Sammlung"}
              </button>
              <button onClick={toggleWishlist} disabled={!user||adding} style={{flex:1,padding:"10px",borderRadius:11,fontSize:12,border:"none",cursor:user?"pointer":"default",background:inWish?"rgba(220,74,90,0.08)":"rgba(255,255,255,0.04)",color:inWish?RED:TX3,outline:`0.5px solid ${inWish?"rgba(220,74,90,0.2)":BR1}`,transition:"all .2s"}}>
                {inWish?"♥ Wunschliste":"♡ Wunschliste"}
              </button>
            </div>
            {!user&&<div style={{fontSize:10,color:TX3,textAlign:"center",marginTop:8}}><Link href="/auth/login" style={{color:G,textDecoration:"none"}}>Anmelden</Link> zum Sammeln</div>}

            {/* Preisalarm */}
            {user&&(
              <div style={{marginTop:10}}>
                {alert ? (
                  <div style={{padding:"8px 12px",borderRadius:10,background:"rgba(212,168,67,0.06)",border:"0.5px solid rgba(212,168,67,0.18)",display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:11,color:G,flex:1}}>🔔 Alarm bei {parseFloat(alertPrice).toLocaleString("de-DE",{minimumFractionDigits:2})} €</span>
                    <button onClick={deleteAlert} style={{fontSize:10,color:"#62626f",background:"transparent",border:"none",cursor:"pointer"}}>× entfernen</button>
                  </div>
                ) : showAlertForm ? (
                  <div style={{display:"flex",gap:6}}>
                    <div style={{position:"relative",flex:1}}>
                      <input value={alertPrice} onChange={e=>setAlertPrice(e.target.value)}
                        type="number" placeholder={card?.price_market?.toFixed(2)??"0.00"} min="0" step="0.50"
                        style={{width:"100%",padding:"8px 32px 8px 10px",borderRadius:9,background:"rgba(0,0,0,0.3)",border:"0.5px solid rgba(255,255,255,0.085)",color:TX1,fontSize:12,outline:"none"}}/>
                      <span style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",fontSize:10,color:TX3}}>€</span>
                    </div>
                    <button onClick={saveAlert} disabled={!alertPrice} style={{padding:"8px 12px",borderRadius:9,background:alertPrice?G:"rgba(255,255,255,0.04)",color:alertPrice?"#0a0808":TX3,border:"none",cursor:alertPrice?"pointer":"default",fontSize:11}}>🔔</button>
                    <button onClick={()=>setShowAlertForm(false)} style={{padding:"8px 10px",borderRadius:9,background:"transparent",color:TX3,border:"0.5px solid rgba(255,255,255,0.045)",cursor:"pointer",fontSize:11}}>×</button>
                  </div>
                ) : (
                  <button onClick={()=>{setShowAlertForm(true);if(card?.price_market)setAlertPrice((card.price_market*0.9).toFixed(2));}} style={{width:"100%",padding:"8px",borderRadius:9,background:"transparent",color:TX3,border:"0.5px solid rgba(255,255,255,0.045)",cursor:"pointer",fontSize:11,transition:"all .15s"}}
                  onMouseEnter={e=>{(e.currentTarget as any).style.color=G;(e.currentTarget as any).style.borderColor="rgba(212,168,67,0.18)"}}
                  onMouseLeave={e=>{(e.currentTarget as any).style.color=TX3;(e.currentTarget as any).style.borderColor="rgba(255,255,255,0.045)"}}>
                    🔔 Preisalarm setzen
                  </button>
                )}
                {alertSaved&&<div style={{fontSize:10,color:GREEN,textAlign:"center",marginTop:4}}>✓ Alarm gespeichert</div>}
              </div>
            )}
          </div>
          <div>
            {type&&<div style={{display:"inline-flex",alignItems:"center",gap:6,marginBottom:12,padding:"4px 12px",borderRadius:8,background:`${typeColor}12`,border:`0.5px solid ${typeColor}25`}}><div style={{width:7,height:7,borderRadius:"50%",background:typeColor}}/><span style={{fontSize:11,fontWeight:500,color:typeColor}}>{TYPE_DE[type]??type}</span></div>}
            <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(22px,4vw,38px)",fontWeight:200,letterSpacing:"-.04em",marginBottom:6,lineHeight:1.1}}>{card.name_de||card.name}</h1>
            {card.name_de&&card.name_de!==card.name&&<div style={{fontSize:13,color:TX3,marginBottom:14}}>{card.name}</div>}
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:20}}>
              <span style={{fontSize:11,color:TX3,fontFamily:"var(--font-mono)"}}>{card.set_id?.toUpperCase()}</span>
              <span style={{color:TX3}}>·</span><span style={{fontSize:11,color:TX3}}>#{card.number??"-"}</span>
              {card.rarity&&<><span style={{color:TX3}}>·</span><span style={{fontSize:11,color:TX2}}>{card.rarity}</span></>}
            </div>
            <div style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:16,padding:"16px 18px",marginBottom:12}}>
              <div style={{fontSize:9,color:TX3,textTransform:"uppercase",letterSpacing:".1em",marginBottom:6}}>Marktpreis</div>
              <div style={{display:"flex",alignItems:"baseline",gap:12,flexWrap:"wrap"}}>
                <div style={{fontFamily:"var(--font-mono)",fontSize:"clamp(28px,5vw,48px)",fontWeight:300,color:G,letterSpacing:"-.05em",lineHeight:1}}>
                  {card.price_market?.toLocaleString("de-DE",{minimumFractionDigits:2})} €
                </div>
              </div>
              {(card.price_low||card.price_avg30)&&(
                <div style={{display:"flex",gap:16,marginTop:10,flexWrap:"wrap"}}>
                  {card.price_low&&<div><div style={{fontSize:9,color:TX3,marginBottom:2}}>Niedrigster</div><div style={{fontSize:12,fontFamily:"var(--font-mono)",color:TX2}}>{card.price_low.toLocaleString("de-DE",{minimumFractionDigits:2})} €</div></div>}
                  {card.price_avg30&&<div><div style={{fontSize:9,color:TX3,marginBottom:2}}>30T-Schnitt</div><div style={{fontSize:12,fontFamily:"var(--font-mono)",color:TX2}}>{card.price_avg30.toLocaleString("de-DE",{minimumFractionDigits:2})} €</div></div>}
                </div>
              )}
            </div>
            <PriceChart avg7={card.price_avg7} avg30={card.price_avg30} market={card.price_market} history={priceHistory}/>
            <div style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:16,overflow:"hidden",marginBottom:12}}>
              <div style={{padding:"10px 14px",borderBottom:`0.5px solid ${BR1}`,fontSize:10,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:TX3}}>Details</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:0}}>
                {[["Typ",card.types?.map((t:string)=>TYPE_DE[t]??t).join(", ")??"—"],["KP",card.hp??"—"],["Kategorie",card.category??"—"],["Stage",card.stage??"—"],["Illustrator",card.illustrator??"—"],["Regulation",card.regulation_mark??"—"]].map(([l,v],i)=>(
                  <div key={l} style={{padding:"10px 14px",borderBottom:`0.5px solid ${BR1}`,borderRight:i%2===0?`0.5px solid ${BR1}`:undefined}}>
                    <div style={{fontSize:9,color:TX3,textTransform:"uppercase",letterSpacing:".06em",marginBottom:2}}>{l}</div>
                    <div style={{fontSize:12,color:TX1}}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
            <Link href="/marketplace" style={{display:"block",padding:"11px 14px",borderRadius:12,background:G08,border:`0.5px solid ${G18}`,color:TX1,textDecoration:"none",fontSize:13,transition:"all .2s",marginBottom:10}}>
              <span style={{color:G}}>◈</span> Angebote auf dem Marktplatz →
            </Link>

            {/* Forum discussions */}
            {forumPosts.length > 0 && (
              <div style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:14,overflow:"hidden"}}>
                <div style={{padding:"10px 14px",borderBottom:`0.5px solid ${BR1}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{fontSize:10,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:TX3}}>
                    💬 {forumPosts.length} Diskussion{forumPosts.length!==1?"en":""}
                  </div>
                  <Link href="/forum" style={{fontSize:11,color:TX3,textDecoration:"none"}}>Forum →</Link>
                </div>
                {forumPosts.map((post:any,i:number)=>(
                  <Link key={post.id} href={`/forum/post/${post.id}`} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 14px",borderBottom:i<forumPosts.length-1?`0.5px solid ${BR1}`:undefined,textDecoration:"none"}}>
                    <div style={{flex:1,fontSize:12,color:TX2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{post.title}</div>
                    <div style={{fontSize:10,color:TX3,flexShrink:0}}>↑{post.upvotes}</div>
                  </Link>
                ))}
                <Link href="/forum/new" style={{display:"block",padding:"9px 14px",fontSize:11,color:G,textDecoration:"none",borderTop:`0.5px solid ${BR1}`}}>
                  + Diskussion starten
                </Link>
              </div>
            )}
            {forumPosts.length === 0 && (
              <Link href="/forum/new" style={{display:"block",padding:"10px 14px",borderRadius:12,background:"transparent",border:`0.5px solid ${BR1}`,color:TX3,textDecoration:"none",fontSize:12,textAlign:"center"}}>
                💬 Erste Diskussion starten →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
