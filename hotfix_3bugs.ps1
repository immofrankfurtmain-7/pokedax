# Hotfix: Kartendetail + Sets-Filter + Profil + Leaderboard
$root = "C:\Users\lenovo\pokedax\pokedax\pokedax"
$enc  = New-Object System.Text.UTF8Encoding $true

Write-Host ""
Write-Host "Hotfix: 3 Bugs + Leaderboard" -ForegroundColor Yellow
Write-Host "=============================" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Kartendetailseite: korrekte Ordner-Erstellung mit cmd" -ForegroundColor Green
Write-Host "  Sets-Filter: URL-Params + setId useEffect fix" -ForegroundColor Green
Write-Host "  Profil: async params Next.js 15" -ForegroundColor Green
Write-Host "  Leaderboard: echte DB-Daten" -ForegroundColor Green
Write-Host ""

# Kartendetail - MUSS mit cmd /c erstellt werden (PowerShell kann [id] nicht!)
Write-Host "Erstelle [id] Ordner..." -ForegroundColor DarkGray
cmd /c mkdir "$root\src\app\preischeck\[id]" 2>$null

$card = @'
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

  useEffect(()=>{
    const sb=createClient();
    sb.from("cards").select("id,name,name_de,set_id,number,types,rarity,image_url,price_market,price_low,price_avg7,price_avg30,hp,category,stage,illustrator,regulation_mark,is_holo,is_reverse_holo").eq("id",id).single().then(({data})=>{setCard(data);setLoading(false);});
    sb.from("price_history").select("price_market,recorded_at").eq("card_id",id).order("recorded_at",{ascending:false}).limit(30).then(({data})=>setPriceHistory(data??[]));
    sb.from("forum_posts").select("id,title,upvotes,created_at,profiles(username)").eq("card_id",id).eq("is_deleted",false).order("created_at",{ascending:false}).limit(5).then(({data})=>setForumPosts((data??[]).map((p:any)=>({...p,profiles:Array.isArray(p.profiles)?p.profiles[0]:p.profiles}))));
    sb.auth.getSession().then(async({data:{session}})=>{
      if(!session?.user) return;
      setUser(session.user);
      const [col,wish]=await Promise.all([
        sb.from("user_collection").select("id").eq("user_id",session.user.id).eq("card_id",id).maybeSingle(),
        sb.from("user_wishlist").select("id").eq("user_id",session.user.id).eq("card_id",id).maybeSingle(),
      ]);
      setInColl(!!col.data);
      setInWish(!!wish.data);
    });
  },[id]);

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
          </div>
          <div>
            {type&&<div style={{display:"inline-flex",alignItems:"center",gap:6,marginBottom:12,padding:"4px 12px",borderRadius:8,background:`${typeColor}12`,border:`0.5px solid ${typeColor}25`}}><div style={{width:7,height:7,borderRadius:"50%",background:typeColor}}/><span style={{fontSize:11,fontWeight:500,color:typeColor}}>{TYPE_DE[type]??type}</span></div>}
            <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(22px,4vw,38px)",fontWeight:200,letterSpacing:"-.04em",marginBottom:6,lineHeight:1.1}}>{card.name_de||card.name}</h1>
            {card.name_de&&card.name_de!==card.name&&<div style={{fontSize:13,color:TX3,marginBottom:14}}>{card.name}</div>}
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:20}}>
              <span style={{fontSize:11,color:TX3,fontFamily:"var(--font-mono)"}}>{card.set_id.toUpperCase()}</span>
              <span style={{color:TX3}}>·</span><span style={{fontSize:11,color:TX3}}>#{card.number}</span>
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

'@
# Schreibe mit cmd /c echo (umgeht PowerShell-Problem mit eckigen Klammern)
[System.IO.File]::WriteAllText("$root\src\app\preischeck\[id]\page.tsx", $card, $enc)
Write-Host "  OK  preischeck/[id]/page.tsx" -ForegroundColor Green

# Preischeck - Sets-Filter Fix
$preischeck = @'
"use client";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const G="#E9A84B",G18="rgba(233,168,75,0.18)",G08="rgba(233,168,75,0.08)";
const BG1="#111113",BR1="rgba(255,255,255,0.06)",BR2="rgba(255,255,255,0.10)";
const TX1="#f0f0f5",TX2="#a8a8b8",TX3="#6b6b7a";
const GREEN="#4BBF82",RED="#E04558";

const TYPE_COLOR:Record<string,string>={
  Fire:"#F97316",Water:"#38BDF8",Grass:"#4ADE80",Lightning:"#E9A84B",
  Psychic:"#A855F7",Fighting:"#EF4444",Darkness:"#888",Metal:"#9CA3AF",
  Dragon:"#7C3AED",Colorless:"#CBD5E1",
};
const TYPE_DE:Record<string,string>={
  Fire:"Feuer",Water:"Wasser",Grass:"Pflanze",Lightning:"Elektro",
  Psychic:"Psycho",Fighting:"Kampf",Darkness:"Finsternis",Metal:"Metall",
  Dragon:"Drache",Colorless:"Farblos",
};

interface Card {
  id:string;name:string;name_de?:string;set_id:string;number:string;
  image_url?:string;price_market?:number;price_low?:number;price_avg30?:number;
  types?:string[];rarity?:string;
}

export default function PreischeckPage() {
  const searchParamsHook = useSearchParams();
  const [query,  setQuery]  = useState(() => searchParamsHook.get("q") ?? "");
  const [sort,   setSort]   = useState("price_desc");
  const [setId,  setSetId]  = useState(() => searchParamsHook.get("set") ?? "");
  const [setSearch, setSetSearch] = useState(() => { const s = searchParamsHook.get("set"); return s ?? ""; });
  const [sets,   setSets]   = useState<{id:string;name:string}[]>([]);
  const [holoOnly, setHoloOnly] = useState(false);
  const [cards,  setCards]  = useState<Card[]>([]);
  const [loading,setLoading]= useState(true);
  const [total,  setTotal]  = useState(0);

  const load = useCallback(async (q:string, s:string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ q, sort:s, limit:"24" });
      if (setId) params.set("set", setId);
      if (holoOnly) params.set("holo", "1");
      const r = await fetch(`/api/cards/search?${params}`);
      const d = await r.json();
      setCards(d.cards ?? []);
      setTotal(d.total ?? d.cards?.length ?? 0);
    } catch { setCards([]); }
    setLoading(false);
  }, [setId, holoOnly]);

  useEffect(() => { load(query, sort); }, [load]);
  // Re-run when set filter or holo changes
  useEffect(() => { load(query, sort); }, [setId, holoOnly]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    load(query, sort);
  };

  function fmt(n:number) {
    return n.toLocaleString("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2});
  }

  const SORTS = [
    {v:"price_desc", l:"Preis ↓"},
    {v:"price_asc",  l:"Preis ↑"},
    {v:"name_asc",   l:"Name A–Z"},
    {v:"trend_desc", l:"Trend ↑"},
  ];

  return (
    <div style={{color:TX1,minHeight:"80vh"}}>
      <div style={{maxWidth:1200,margin:"0 auto",padding:"80px 24px"}}>

        {/* Header */}
        <div style={{marginBottom:56}}>
          <h1 style={{
            fontFamily:"var(--font-display)",
            fontSize:"clamp(40px,6vw,68px)",
            fontWeight:300,letterSpacing:"-.085em",
            lineHeight:1.0,color:TX1,marginBottom:12,
          }}>Preischeck</h1>
          <p style={{fontSize:16,color:TX3}}>Live Cardmarket EUR · Täglich aktualisiert</p>
        </div>

        {/* Search + Sort */}
        <form onSubmit={handleSearch} style={{marginBottom:48}}>
          <div style={{
            background:BG1,border:`1px solid ${BR2}`,
            borderRadius:24,padding:24,
            display:"flex",gap:12,alignItems:"center",
            flexWrap:"wrap",
          }}>
            <div style={{flex:1,minWidth:260,position:"relative"}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={TX3} strokeWidth="1.5"
                style={{position:"absolute",left:16,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                value={query}
                onChange={e=>setQuery(e.target.value)}
                placeholder="Karte suchen — Deutsch oder Englisch…"
                style={{
                  width:"100%",padding:"14px 14px 14px 46px",
                  borderRadius:16,background:"rgba(0,0,0,0.3)",
                  border:`1px solid ${BR2}`,color:TX1,fontSize:15,outline:"none",
                }}
              />
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {SORTS.map(s=>(
                <button key={s.v} type="button" onClick={()=>{setSort(s.v);load(query,s.v);}} style={{
                  padding:"10px 18px",borderRadius:14,fontSize:13,fontWeight:500,
                  cursor:"pointer",border:"none",transition:"all .15s",
                  background:sort===s.v?G08:"transparent",
                  color:sort===s.v?G:TX3,
                  outline:sort===s.v?`1px solid ${G18}`:"none",
                }}>{s.l}</button>
              ))}
            </div>
            <button type="submit" className="gold-glow" style={{
              padding:"14px 28px",borderRadius:16,
              background:G,color:"#0a0808",
              fontSize:14,fontWeight:600,border:"none",cursor:"pointer",
              whiteSpace:"nowrap",
            }}>Suchen</button>
          </div>
        </form>

        {/* Count */}
        {!loading && (
          <p style={{fontSize:13,color:TX3,marginBottom:24}}>
            {total > 0 ? `${total.toLocaleString("de-DE")} Karten gefunden` : "Keine Karten gefunden"}
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:16}}>
            {Array.from({length:12}).map((_,i)=>(
              <div key={i} style={{background:BG1,border:`1px solid ${BR1}`,borderRadius:24,overflow:"hidden",aspectRatio:"3/5",
                animation:"pulse 1.5s ease-in-out infinite",opacity:.5}}/>
            ))}
          </div>
        ) : (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:16}}>
            {cards.map(card=>{
              const tc  = TYPE_COLOR[card.types?.[0]??""]??"#666";
              const img = card.image_url??`https://assets.tcgdex.net/en/${card.set_id}/${card.number}/low.webp`;
              const name = card.name_de??card.name;
              const price = card.price_market
                ? fmt(card.price_market)+" €"
                : card.price_low ? "ab "+fmt(card.price_low)+" €" : "–";
              const pct = card.price_avg30&&card.price_avg30>0
                ? ((card.price_market??0)-card.price_avg30)/card.price_avg30*100 : null;
              const pctCapped = pct!==null ? Math.min(Math.abs(pct),99)*Math.sign(pct) : null;
              return (
                <Link key={card.id} href={`/preischeck?q=${encodeURIComponent(card.name)}`}
                  className="card-hover"
                  style={{background:BG1,border:`1px solid ${BR1}`,borderRadius:24,overflow:"hidden",textDecoration:"none",display:"block",position:"relative"}}>
                  {/* Image */}
                  <div style={{aspectRatio:"3/4",background:"#080808",position:"relative",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <div style={{position:"absolute",inset:0,background:`radial-gradient(circle at 50% 30%,${tc}18,transparent 65%)`}}/>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={name} style={{width:"100%",height:"100%",objectFit:"contain",padding:6,position:"relative",zIndex:1}}/>
                    <div style={{position:"absolute",bottom:0,left:0,right:0,height:"50%",background:`linear-gradient(transparent,${BG1})`,zIndex:2}}/>
                    {card.types?.[0]&&(
                      <div style={{position:"absolute",top:10,left:10,zIndex:3,padding:"2px 8px",borderRadius:8,fontSize:9,fontWeight:600,letterSpacing:".04em",background:`${tc}18`,color:tc,border:`1px solid ${tc}28`,backdropFilter:"blur(8px)"}}>
                        {TYPE_DE[card.types[0]]??card.types[0]}
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div style={{padding:"14px 16px 18px",position:"relative",zIndex:1}}>
                    <div style={{fontSize:14,fontWeight:500,color:TX1,marginBottom:3,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",letterSpacing:"-.01em"}}>{name}</div>
                    <div style={{fontSize:10,color:TX3,marginBottom:12,letterSpacing:".02em"}}>{String(card.set_id).toUpperCase()} · #{card.number}</div>
                    <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between"}}>
                      <span style={{fontSize:"clamp(16px,1.5vw,20px)",fontWeight:400,fontFamily:"'DM Mono',monospace",color:G,letterSpacing:"-.02em"}}>{price}</span>
                      {pctCapped!==null&&(
                        <span style={{fontSize:10.5,fontWeight:600,color:pctCapped>=0?GREEN:RED}}>
                          {pctCapped>=0?"▲":"▼"}{Math.abs(pctCapped).toLocaleString("de-DE",{maximumFractionDigits:1})} %
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:.5}50%{opacity:.8}}`}</style>
    </div>
  );
}

'@
[System.IO.File]::WriteAllText("$root\src\app\preischeck\page.tsx", $preischeck, $enc)
Write-Host "  OK  preischeck/page.tsx (Sets-Filter + URL-Params)" -ForegroundColor Green

# Profil - async params
cmd /c mkdir "$root\src\app\profil\[username]" 2>$null
$profil = @'
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props { params: { username: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `${username} – pokédax`,
    description: `Pokémon TCG Profil von ${username} auf pokédax`,
  };
}

const G="#E9A84B",BG1="#111113",BG2="#1a1a1f",BR2="rgba(255,255,255,0.085)";
const TX1="#f0f0f5",TX2="#a8a8b8",TX3="#6b6b7a",GREEN="#4BBF82";

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: profile } = await sb
    .from("profiles")
    .select("id, username, avatar_url, is_premium, created_at")
    .eq("username", username)
    .single();

  if (!profile) notFound();

  const { data: posts } = await sb
    .from("forum_posts")
    .select("id, title, created_at, upvotes")
    .eq("author_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(4);

  // Fetch badges, seller stats, reviews
  const [badgesR, sellerR, reviewsR] = await Promise.all([
    sb.from("user_badges").select("badge_key,label,icon,awarded_at").eq("user_id",profile.id).order("awarded_at",{ascending:false}),
    sb.from("seller_stats").select("avg_rating,rating_count,total_sales,is_verified").eq("user_id",profile.id).single(),
    sb.from("marketplace_reviews").select("rating,comment,role,created_at,profiles!marketplace_reviews_reviewer_id_fkey(username)").eq("reviewed_id",profile.id).order("created_at",{ascending:false}).limit(5),
  ]);
  const badges  = badgesR.data ?? [];
  const seller  = sellerR.data ?? null;
  const reviews = (reviewsR.data??[]).map((r:any)=>({...r,profiles:Array.isArray(r.profiles)?r.profiles[0]:r.profiles}));

  const joined = new Date(profile.created_at).toLocaleDateString("de-DE", {
    month: "long", year: "numeric",
  });
  const initial = profile.username?.[0]?.toUpperCase() ?? "?";
  const isPrem = profile.is_premium;

  return (
    <div style={{ minHeight:"80vh", color:TX1 }}>
      <div style={{ maxWidth:520, margin:"0 auto", padding:"44px 28px" }}>

        {/* Back */}
        <Link href="/" style={{ display:"inline-flex", alignItems:"center", gap:6, color:TX3, fontSize:13, textDecoration:"none", marginBottom:28 }}>
          ← Zurück
        </Link>

        {/* Profile card */}
        <div style={{
          background: isPrem
            ? "linear-gradient(160deg,#0d0a2e,#1a1040,#0d0820)"
            : BG1,
          border: `1px solid ${isPrem ? "rgba(168,85,247,0.4)" : BR2}`,
          borderRadius:24, padding:"28px", marginBottom:16, position:"relative", overflow:"hidden",
        }}>
          {isPrem && (
            <div style={{ position:"absolute", top:0, left:0, right:0, height:1, background:"linear-gradient(90deg,transparent,rgba(168,85,247,0.5),transparent)" }}/>
          )}

          {/* Avatar + name */}
          <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:20 }}>
            <div style={{
              width:56, height:56, borderRadius:16, flexShrink:0,
              background: isPrem ? "rgba(168,85,247,0.15)" : BG2,
              border: `2px solid ${isPrem ? "rgba(168,85,247,0.4)" : BR2}`,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:22, fontWeight:600,
              color: isPrem ? "#C084FC" : TX2,
            }}>
              {initial}
            </div>
            <div>
              <div style={{ fontSize:20, fontWeight:300, letterSpacing:"-.035em", color:TX1, fontFamily:"var(--font-display)" }}>
                {profile.username}
                {isPrem && <span style={{ fontSize:12, color:"#C084FC", marginLeft:8 }}>✦ Premium</span>}
              </div>
              <div style={{ fontSize:12, color:TX3, marginTop:3 }}>Mitglied seit {joined}</div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            <div style={{ background:"rgba(255,255,255,0.03)", border:`1px solid rgba(255,255,255,0.06)`, borderRadius:12, padding:"12px 14px" }}>
              <div style={{ fontSize:9.5, color:TX3, marginBottom:4, textTransform:"uppercase", letterSpacing:".06em", fontWeight:600 }}>Mitgliedschaft</div>
              <div style={{ fontSize:14, fontWeight:500, color: isPrem ? "#C084FC" : TX2 }}>
                {isPrem ? "Premium ✦" : "Free"}
              </div>
            </div>
            <div style={{ background:"rgba(255,255,255,0.03)", border:`1px solid rgba(255,255,255,0.06)`, borderRadius:12, padding:"12px 14px" }}>
              <div style={{ fontSize:9.5, color:TX3, marginBottom:4, textTransform:"uppercase", letterSpacing:".06em", fontWeight:600 }}>Beiträge</div>
              <div style={{ fontSize:14, fontWeight:500, color:TX1 }}>{posts?.length ?? 0}</div>
            </div>
          </div>

          {!isPrem && (
            <Link href="/dashboard/premium" style={{
              display:"flex", alignItems:"center", justifyContent:"center", gap:6,
              padding:"10px", borderRadius:12, marginTop:12,
              background:G, color:"#0a0808",
              textDecoration:"none", fontSize:13, fontWeight:600,
            }}>
              Premium werden ✦
            </Link>
          )}
        </div>

        {/* Recent posts */}
        {posts && posts.length > 0 && (
          <div style={{ background:BG1, border:`1px solid ${BR2}`, borderRadius:18, overflow:"hidden" }}>
            <div style={{ padding:"12px 18px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
              <span style={{ fontSize:10, fontWeight:600, color:TX3, textTransform:"uppercase", letterSpacing:".1em" }}>
                Letzte Beiträge
              </span>
            </div>
            {posts.map((post, i) => (
              <Link key={post.id} href={`/forum/post/${post.id}`} style={{ display:"block", textDecoration:"none" }}>
                <div style={{
                  display:"flex", alignItems:"center", gap:12,
                  padding:"12px 18px",
                  borderBottom: i < posts.length-1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:500, color:TX2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", marginBottom:2 }}>
                      {post.title}
                    </div>
                    <div style={{ fontSize:10, color:TX3 }}>
                      {new Date(post.created_at).toLocaleDateString("de-DE")}
                    </div>
                  </div>
                  <span style={{ fontSize:10, color:TX3, flexShrink:0 }}>↑ {post.upvotes ?? 0}</span>
                </div>
              </Link>
            ))}
          </div>
        )}


        {/* Badges */}
        {badges.length > 0 && (
          <div style={{ marginBottom:24 }}>
            <div style={{ fontSize:10, fontWeight:600, letterSpacing:".1em", textTransform:"uppercase", color:"#62626f", marginBottom:12 }}>Badges</div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {badges.map((b:any)=>(
                <div key={b.badge_key} style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"5px 12px", borderRadius:8, background:"rgba(212,168,67,0.08)", border:"0.5px solid rgba(212,168,67,0.18)" }}>
                  <span style={{ fontSize:13 }}>{b.icon}</span>
                  <span style={{ fontSize:11, color:"#D4A843" }}>{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Seller Stats */}
        {seller && (seller.total_sales > 0 || seller.is_verified) && (
          <div style={{ marginBottom:24, background:"#111114", border:"0.5px solid rgba(255,255,255,0.085)", borderRadius:16, padding:"14px 16px" }}>
            <div style={{ fontSize:10, fontWeight:600, letterSpacing:".1em", textTransform:"uppercase", color:"#62626f", marginBottom:12 }}>Verkäufer-Statistik</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
              {seller.avg_rating > 0 && <div><div style={{ fontSize:9, color:"#62626f", marginBottom:3 }}>Bewertung</div><div style={{ fontSize:18, fontFamily:"var(--font-mono)", fontWeight:300, color:"#D4A843" }}>⭐ {seller.avg_rating?.toFixed(1)}</div><div style={{ fontSize:9, color:"#62626f" }}>{seller.rating_count} Bewertungen</div></div>}
              {seller.total_sales > 0 && <div><div style={{ fontSize:9, color:"#62626f", marginBottom:3 }}>Verkäufe</div><div style={{ fontSize:18, fontFamily:"var(--font-mono)", fontWeight:300, color:"#ededf2" }}>{seller.total_sales}</div></div>}
              {seller.is_verified && <div style={{ display:"flex", alignItems:"center", gap:6 }}><span style={{ fontSize:16, color:"#3db87a" }}>✓</span><span style={{ fontSize:12, color:"#3db87a" }}>Verifiziert</span></div>}
            </div>
          </div>
        )}

        {/* Reviews */}
        {reviews.length > 0 && (
          <div style={{ marginBottom:24 }}>
            <div style={{ fontSize:10, fontWeight:600, letterSpacing:".1em", textTransform:"uppercase", color:"#62626f", marginBottom:12 }}>Bewertungen</div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {reviews.map((r:any, i:number)=>(
                <div key={i} style={{ background:"#111114", border:"0.5px solid rgba(255,255,255,0.085)", borderRadius:12, padding:"12px 14px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                    <div style={{ fontSize:13, color:"#D4A843" }}>{"★".repeat(r.rating)}{"☆".repeat(5-r.rating)}</div>
                    <div style={{ fontSize:11, color:"#62626f" }}>von @{r.profiles?.username??"-"}</div>
                    <div style={{ fontSize:10, color:"#62626f", marginLeft:"auto" }}>{r.role==="buyer"?"Käufer":"Verkäufer"}</div>
                  </div>
                  {r.comment && <div style={{ fontSize:12, color:"#a4a4b4", lineHeight:1.6 }}>{r.comment}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

'@
[System.IO.File]::WriteAllText("$root\src\app\profil\[username]\page.tsx", $profil, $enc)
Write-Host "  OK  profil/[username]/page.tsx (async params)" -ForegroundColor Green

# Leaderboard - echte Daten
$leaderboard = @'
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const G="#D4A843",G18="rgba(212,168,67,0.18)",G08="rgba(212,168,67,0.08)";
const BG1="#111114",BG2="#18181c",BR1="rgba(255,255,255,0.045)",BR2="rgba(255,255,255,0.085)";
const TX1="#ededf2",TX2="#a4a4b4",TX3="#62626f",GREEN="#3db87a";

const BADGE_COLORS = ["#D4A843","#9CA3AF","#CD7F32"];
const BADGE_ICONS  = ["✦✦✦","✦✦","✦"];

function MedalIcon({rank}:{rank:number}) {
  const color = rank===1?"#D4A843":rank===2?"#9CA3AF":"#CD7F32";
  return (
    <div style={{width:32,height:32,borderRadius:"50%",background:`${color}15`,
      border:`0.5px solid ${color}30`,display:"flex",alignItems:"center",
      justifyContent:"center",fontSize:13,color,fontWeight:600,flexShrink:0}}>
      {rank}
    </div>
  );
}

function Avatar({username,size=32}:{username:string;size?:number}) {
  const colors=["#D4A843","#60A5FA","#34D399","#A78BFA","#F472B6","#FB923C"];
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

'@
[System.IO.File]::WriteAllText("$root\src\app\leaderboard\page.tsx", $leaderboard, $enc)
Write-Host "  OK  leaderboard/page.tsx" -ForegroundColor Green

# Fantasy LB Route - shape fix
$fantasyLb = @'
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const season = getCurrentSeason();

  const selectTeams = "id, name, season, user_id, profiles!fantasy_teams_user_id_fkey(username, avatar_url), fantasy_picks(bought_at_price, quantity, cards!fantasy_picks_card_id_fkey(price_market))";

  const { data: teams } = await supabase
    .from("fantasy_teams")
    .select(selectTeams)
    .eq("season", season)
    .limit(50);

  const scored = (teams ?? []).map((t: any) => {
    const picks = t.fantasy_picks ?? [];
    let score = 0;
    let currentValue = 0;
    let boughtValue = 0;

    for (const p of picks) {
      const current = p.cards?.price_market ?? p.bought_at_price;
      const bought  = p.bought_at_price;
      const qty     = p.quantity ?? 1;
      currentValue += current * qty;
      boughtValue  += bought  * qty;
      if (bought > 0) score += ((current - bought) / bought) * 100;
    }

    return {
      id:            t.id,
      team_name:     t.name,
      username:      t.profiles?.username ?? "Anonym",
      is_premium:    t.profiles?.is_premium ?? false,
      avatar_url:    t.profiles?.avatar_url,
      picks_count:   picks.length,
      total_value:   Math.round(currentValue * 100) / 100,
      bought_value:  Math.round(boughtValue * 100) / 100,
      score:         Math.round(score * 10) / 10,
    };
  }).sort((a: any, b: any) => b.score - a.score);

  const ranked = scored
    .sort((a: any, b: any) => b.total_value - a.total_value)
    .map((e: any, i: number) => ({ ...e, rank: i + 1 }));
  return NextResponse.json({ leaderboard: ranked, season });
}

function getCurrentSeason(): string {
  const now = new Date();
  const q = Math.ceil((now.getMonth() + 1) / 3);
  return now.getFullYear() + "-Q" + q;
}

'@
[System.IO.File]::WriteAllText("$root\src\app\api\fantasy\leaderboard\route.ts", $fantasyLb, $enc)
Write-Host "  OK  api/fantasy/leaderboard/route.ts" -ForegroundColor Green

Write-Host ""
Write-Host "=============================" -ForegroundColor Yellow
Write-Host "Fertig!" -ForegroundColor Yellow
Write-Host "=============================" -ForegroundColor Yellow
Write-Host ""
Write-Host "# STRIPE HINWEIS:
# Test-Keys funktionieren fuer den Onboarding-Flow NICHT vollstaendig.
# Stripe Connect Express braucht einen Live-Key fuer echtes KYC.
# Fuer Tests: nutze den Stripe Dashboard Sandbox Mode.
# Vercel Env Var pruefen: STRIPE_SECRET_KEY = sk_live_... (nicht sk_test_...)" -ForegroundColor Cyan
Write-Host ""
Write-Host "GitHub Desktop -> Commit -> Push" -ForegroundColor Yellow
