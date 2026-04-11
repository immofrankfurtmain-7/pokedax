
"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const G="#D4A843",G25="rgba(212,168,67,0.25)",G18="rgba(212,168,67,0.18)",G10="rgba(212,168,67,0.10)",G05="rgba(212,168,67,0.05)";
const BG1="#111114",BG2="#18181c",BR1="rgba(255,255,255,0.045)",BR2="rgba(255,255,255,0.085)";
const TX1="#ededf2",TX2="#a4a4b4",TX3="#62626f",GREEN="#3db87a",RED="#dc4a5a";

const SB = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface TrendCard { id:string; name:string; name_de:string; set_id:string; price_market:number; price_avg7:number; image_url:string|null; change:number; }

function TrendCard({card}:{card:TrendCard}) {
  const up = card.change >= 0;
  return (
    <Link href={`/preischeck/${card.id}`} style={{textDecoration:"none",display:"flex",
      alignItems:"center",gap:12,padding:"11px 14px",
      background:BG1,border:`0.5px solid ${up?"rgba(61,184,122,0.15)":"rgba(220,74,90,0.12)"}`,
      borderRadius:14,transition:"all .2s",
    }}
    className="card-hover">
      <div style={{width:34,height:46,borderRadius:5,background:BG2,overflow:"hidden",flexShrink:0}}>
        {card.image_url&&<img src={card.image_url} alt="" style={{width:"100%",height:"100%",objectFit:"contain"}}/>}
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:12,fontWeight:400,color:TX1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{card.name_de||card.name}</div>
        <div style={{fontSize:10,color:TX3}}>{card.set_id?.toUpperCase()}</div>
      </div>
      <div style={{textAlign:"right",flexShrink:0}}>
        <div style={{fontSize:14,fontFamily:"var(--font-mono)",fontWeight:300,color:TX1,lineHeight:1}}>{card.price_market.toLocaleString("de-DE",{minimumFractionDigits:2})} €</div>
        <div style={{fontSize:11,fontWeight:600,color:up?GREEN:RED,marginTop:2}}>{up?"+":""}{card.change.toFixed(1)}%</div>
      </div>
    </Link>
  );
}

function LivePost({post}:{post:any}) {
  const cat = post.forum_categories?.name ?? "Forum";
  const ago = () => {
    const m = Math.floor((Date.now()-new Date(post.created_at).getTime())/60000);
    if(m<60) return `${m} Min.`;
    return `${Math.floor(m/60)} Std.`;
  };
  return (
    <Link href={`/forum/post/${post.id}`} style={{textDecoration:"none",display:"flex",
      alignItems:"center",gap:10,padding:"9px 14px",
      borderBottom:`0.5px solid ${BR1}`,
    }}
    onMouseEnter={e=>(e.currentTarget.style.background=BG2)}
    onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
      <div style={{width:6,height:6,borderRadius:"50%",background:G,flexShrink:0,opacity:.6}}/>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:12,color:TX1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{post.title}</div>
        <div style={{fontSize:10,color:TX3}}>{cat} · {ago()}</div>
      </div>
      <div style={{fontSize:10,color:TX3,flexShrink:0}}>↑{post.upvotes??0}</div>
    </Link>
  );
}

function LiveListing({listing}:{listing:any}) {
  const card = listing.cards;
  const seller = listing.profiles?.username ?? "Anonym";
  const isDeal = listing.price && card?.price_market && listing.price < card.price_market * 0.95;
  return (
    <Link href="/marketplace" style={{textDecoration:"none",display:"flex",
      alignItems:"center",gap:10,padding:"9px 14px",
      borderBottom:`0.5px solid ${BR1}`,
    }}
    onMouseEnter={e=>(e.currentTarget.style.background=BG2)}
    onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
      <div style={{width:28,height:38,borderRadius:4,background:BG2,overflow:"hidden",flexShrink:0}}>
        {card?.image_url&&<img src={card.image_url} alt="" style={{width:"100%",height:"100%",objectFit:"contain"}}/>}
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:12,color:TX1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{card?.name_de||card?.name}</div>
        <div style={{fontSize:10,color:TX3}}>@{seller}</div>
      </div>
      <div style={{textAlign:"right",flexShrink:0}}>
        {isDeal&&<div style={{fontSize:8,fontWeight:700,color:G,marginBottom:2}}>DEAL</div>}
        <div style={{fontSize:13,fontFamily:"var(--font-mono)",fontWeight:300,color:isDeal?G:TX1}}>{listing.price?.toFixed(2)} €</div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const [trending,  setTrending]  = useState<{gainers:TrendCard[];losers:TrendCard[]}>({gainers:[],losers:[]});
  const [posts,     setPosts]     = useState<any[]>([]);
  const [listings,  setListings]  = useState<any[]>([]);
  const [stats,     setStats]     = useState({cards:22400,sets:214,users:0});
  const [topCard,   setTopCard]   = useState<any>(null);
  const [loaded,    setLoaded]    = useState(false);

  useEffect(()=>{
    async function load() {
      // Trending cards
      const {data:cards} = await SB.from("cards")
        .select("id,name,name_de,set_id,price_market,price_avg7,image_url")
        .not("price_market","is",null)
        .not("price_avg7","is",null)
        .gt("price_market",2)
        .order("price_market",{ascending:false})
        .limit(100);

      if (cards?.length) {
        const withChange = cards.map((c:any)=>({
          ...c,
          change: ((c.price_market - c.price_avg7) / c.price_avg7 * 100)
        }));
        const sorted = [...withChange].sort((a,b)=>b.change-a.change);
        setTrending({
          gainers: sorted.filter(c=>c.change>0).slice(0,4),
          losers:  sorted.filter(c=>c.change<0).slice(-4).reverse(),
        });
        setTopCard(sorted.find(c=>c.change>0) ?? cards[0]);
      }

      // Recent forum posts
      const {data:fp} = await SB.from("forum_posts")
        .select("id,title,upvotes,created_at,forum_categories(name)")
        .eq("is_deleted",false)
        .order("created_at",{ascending:false})
        .limit(5);
      setPosts((fp??[]).map((p:any)=>({...p,forum_categories:Array.isArray(p.forum_categories)?p.forum_categories[0]:p.forum_categories})));

      // Recent listings
      const {data:ml} = await SB.from("marketplace_listings")
        .select(`price,created_at,
          cards!marketplace_listings_card_id_fkey(name,name_de,image_url,price_market),
          profiles!marketplace_listings_user_id_fkey(username)`)
        .eq("is_active",true)
        .eq("type","offer")
        .order("created_at",{ascending:false})
        .limit(5);
      setListings((ml??[]).map((l:any)=>({...l,
        cards:Array.isArray(l.cards)?l.cards[0]:l.cards,
        profiles:Array.isArray(l.profiles)?l.profiles[0]:l.profiles,
      })));

      // Stats
      const {count:uc} = await SB.from("profiles").select("id",{count:"exact",head:true});
      const {count:cc} = await SB.from("cards").select("id",{count:"exact",head:true});
      const {count:sc} = await SB.from("sets").select("id",{count:"exact",head:true});
      setStats({cards:cc??22400, sets:sc??214, users:uc??0});
      setLoaded(true);
    }
    load();
  },[]);

  return (
    <div style={{color:TX1}}>
      {/* ── HERO ── */}
      <section style={{
        maxWidth:1100,margin:"0 auto",
        padding:"clamp(100px,14vw,180px) clamp(16px,3vw,32px) clamp(60px,8vw,100px)",
      }}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:48,alignItems:"center"}}>
          {/* Left */}
          <div>
            <div style={{
              display:"inline-flex",alignItems:"center",gap:8,
              padding:"6px 16px",borderRadius:40,
              border:`1px solid ${G18}`,background:G05,
              fontSize:11,fontWeight:500,color:G,
              letterSpacing:".1em",textTransform:"uppercase",marginBottom:32,
            }}>
              <span style={{width:5,height:5,borderRadius:"50%",background:G,display:"inline-block",animation:"pulse 2s ease-in-out infinite"}}/>
              Live · Cardmarket Deutschland
            </div>

            <h1 style={{
              fontFamily:"var(--font-display)",
              fontSize:"clamp(36px,5.5vw,72px)",
              fontWeight:200,letterSpacing:"-.07em",
              lineHeight:0.95,marginBottom:24,
            }}>
              Deine Karten.<br/>
              Ihr wahrer<br/>
              <span style={{color:G}}>Wert.</span>
            </h1>

            <p style={{fontSize:"clamp(14px,1.6vw,17px)",color:TX3,maxWidth:420,lineHeight:1.8,fontWeight:300,marginBottom:36}}>
              Preise. Scanner. Marktplatz. Community.<br/>
              Für Sammler die es ernst meinen.
            </p>

            <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
              <Link href="/scanner" style={{
                padding:"clamp(11px,1.4vw,14px) clamp(22px,2.5vw,32px)",
                borderRadius:14,background:G,color:"#09090b",
                fontSize:"clamp(13px,1.3vw,15px)",fontWeight:400,
                textDecoration:"none",boxShadow:`0 4px 24px ${G25}`,
                transition:"all .2s",
              }}>⊙ Karte scannen</Link>
              <Link href="/preischeck" style={{
                padding:"clamp(11px,1.4vw,14px) clamp(22px,2.5vw,32px)",
                borderRadius:14,background:"transparent",color:TX2,
                fontSize:"clamp(13px,1.3vw,15px)",fontWeight:400,
                textDecoration:"none",border:`0.5px solid ${BR2}`,
                transition:"all .2s",
              }}>◈ Preischeck</Link>
            </div>

            {/* Live top card */}
            {topCard && (
              <div style={{marginTop:32,display:"inline-flex",alignItems:"center",gap:12,
                padding:"10px 16px",borderRadius:14,
                background:G05,border:`0.5px solid ${G18}`,
              }}>
                {topCard.image_url&&<img src={topCard.image_url} alt="" style={{width:28,height:38,objectFit:"contain",borderRadius:4}}/>}
                <div>
                  <div style={{fontSize:10,color:TX3,marginBottom:2}}>🔥 Heute im Trend</div>
                  <div style={{fontSize:13,color:TX1}}>{topCard.name_de||topCard.name}</div>
                </div>
                <div style={{marginLeft:8}}>
                  <div style={{fontSize:15,fontFamily:"var(--font-mono)",fontWeight:300,color:G}}>{topCard.price_market?.toLocaleString("de-DE",{minimumFractionDigits:2})} €</div>
                  <div style={{fontSize:10,color:GREEN,textAlign:"right"}}>+{topCard.change?.toFixed(1)}%</div>
                </div>
              </div>
            )}
          </div>

          {/* Right — Trending */}
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
              <div style={{fontSize:10,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:TX3}}>Heute im Trend</div>
              <Link href="/preischeck" style={{fontSize:11,color:TX3,textDecoration:"none"}}>Alle →</Link>
            </div>

            {trending.gainers.length > 0 ? (
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {trending.gainers.map(c=><TrendCard key={c.id} card={c}/>)}
              </div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {Array.from({length:4}).map((_,i)=>(
                  <div key={i} style={{height:68,borderRadius:14,background:BG1,border:`0.5px solid ${BR1}`,opacity:.3,animation:"skeleton-pulse 1.5s ease-in-out infinite"}}/>
                ))}
              </div>
            )}

            {trending.losers.length > 0 && (
              <>
                <div style={{fontSize:10,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:TX3,marginTop:8}}>Im Rückgang</div>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {trending.losers.slice(0,2).map(c=><TrendCard key={c.id} card={c}/>)}
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section style={{maxWidth:1100,margin:"0 auto",padding:"0 clamp(16px,3vw,32px) clamp(48px,6vw,72px)"}}>
        <div style={{
          display:"grid",gridTemplateColumns:"repeat(3,1fr)",
          gap:1,border:`0.5px solid ${BR1}`,borderRadius:20,overflow:"hidden",
        }}>
          {[
            {n:loaded?(stats.cards.toLocaleString("de-DE")+"+"):"…", l:"Karten in der Datenbank"},
            {n:loaded?String(stats.sets):"…",                         l:"Sets & Serien"},
            {n:loaded&&stats.users>0?(stats.users.toLocaleString("de-DE")+"+"):"Live", l:loaded&&stats.users>0?"Registrierte Sammler":"Cardmarket-Preise"},
          ].map(({n,l},i)=>(
            <div key={l} style={{padding:"clamp(18px,2.5vw,28px)",background:BG1,
              borderRight:i<2?`0.5px solid ${BR1}`:undefined}}>
              <div style={{fontFamily:"var(--font-display)",fontSize:"clamp(28px,3.5vw,44px)",
                fontWeight:200,letterSpacing:"-.04em",color:G,marginBottom:6,lineHeight:1}}>{n}</div>
              <div style={{fontSize:12,color:TX3}}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── LIVE ACTIVITY ── */}
      <section style={{maxWidth:1100,margin:"0 auto",padding:"0 clamp(16px,3vw,32px) clamp(48px,6vw,72px)"}}>
        <div style={{marginBottom:20,display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:GREEN,animation:"pulse 2s ease-in-out infinite"}}/>
          <div style={{fontSize:10,fontWeight:600,letterSpacing:".12em",textTransform:"uppercase",color:TX3}}>Live-Aktivität</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>

          {/* Forum */}
          <div style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:18,overflow:"hidden"}}>
            <div style={{padding:"12px 14px",borderBottom:`0.5px solid ${BR1}`,
              display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{fontSize:12,fontWeight:500,color:TX1}}>Community</div>
              <Link href="/forum" style={{fontSize:11,color:TX3,textDecoration:"none"}}>Forum →</Link>
            </div>
            {posts.length>0 ? posts.map(p=><LivePost key={p.id} post={p}/>)
            : Array.from({length:4}).map((_,i)=>(
              <div key={i} style={{height:52,borderBottom:`0.5px solid ${BR1}`,opacity:.2,
                background:`linear-gradient(90deg,${BG1},${BG2},${BG1})`,backgroundSize:"200% 100%",
                animation:"skeleton-pulse 1.5s ease-in-out infinite"}}/>
            ))}
            <Link href="/forum/new" style={{display:"block",padding:"10px 14px",
              fontSize:11,color:G,textDecoration:"none",textAlign:"center",
              borderTop:`0.5px solid ${BR1}`}}>
              + Beitrag erstellen
            </Link>
          </div>

          {/* Marketplace */}
          <div style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:18,overflow:"hidden"}}>
            <div style={{padding:"12px 14px",borderBottom:`0.5px solid ${BR1}`,
              display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{fontSize:12,fontWeight:500,color:TX1}}>Neueste Angebote</div>
              <Link href="/marketplace" style={{fontSize:11,color:TX3,textDecoration:"none"}}>Marktplatz →</Link>
            </div>
            {listings.length>0 ? listings.map((l,i)=><LiveListing key={i} listing={l}/>)
            : Array.from({length:4}).map((_,i)=>(
              <div key={i} style={{height:57,borderBottom:`0.5px solid ${BR1}`,opacity:.2,animation:"skeleton-pulse 1.5s ease-in-out infinite"}}/>
            ))}
            <Link href="/marketplace" style={{display:"block",padding:"10px 14px",
              fontSize:11,color:G,textDecoration:"none",textAlign:"center",
              borderTop:`0.5px solid ${BR1}`}}>
              + Karte inserieren
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{maxWidth:1100,margin:"0 auto",padding:"0 clamp(16px,3vw,32px) clamp(48px,6vw,72px)"}}>
        <div style={{marginBottom:32,textAlign:"center"}}>
          <div style={{fontSize:9,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:TX3,marginBottom:12}}>Was pokédax kann</div>
          <h2 style={{fontFamily:"var(--font-display)",fontSize:"clamp(22px,3.5vw,40px)",fontWeight:200,letterSpacing:"-.05em"}}>Alles für ernsthafte Sammler.</h2>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:10}}>
          {[
            {icon:"⊙", title:"KI-Scanner",        desc:"Karte fotografieren — pokédax erkennt sie sofort und zeigt den Marktwert. Powered by Gemini AI.",           href:"/scanner",     hot:true},
            {icon:"◈", title:"Echtzeit-Preise",    desc:"Live-Daten von Cardmarket Deutschland. 22.400+ Karten, 7/30-Tage-Trend, Preis-Charts.",                    href:"/preischeck",  hot:false},
            {icon:"◎", title:"Escrow-Marktplatz",  desc:"Sicher handeln via Escrow. Geld wird erst freigegeben wenn du die Karte erhalten hast.",                   href:"/marketplace", hot:true},
            {icon:"◇", title:"Portfolio",          desc:"Sammlung verwalten, Gesamtwert live berechnen, Preisentwicklung verfolgen. CSV-Export.",                    href:"/portfolio",   hot:false},
            {icon:"◉", title:"Wishlist-Matching",  desc:"Karte merken — automatisch benachrichtigt wenn sie zum Wunschpreis verfügbar ist.",                         href:"/matches",     hot:false},
            {icon:"⇄", title:"Karten-Vergleich",   desc:"Zwei Karten direkt nebeneinander vergleichen — Preis, Trend, KP, Typ, Rarity.",                            href:"/compare",     hot:false},
          ].map(({icon,title,desc,href,hot})=>(
            <Link key={href} href={href} style={{
              background:BG1,border:`0.5px solid ${BR2}`,borderRadius:18,
              padding:"clamp(18px,2.5vw,24px)",textDecoration:"none",
              display:"block",transition:"border-color .2s,background .2s",
              position:"relative",overflow:"hidden",
            }}
            className="card-hover"
            onMouseEnter={e=>{(e.currentTarget as any).style.borderColor=G18;(e.currentTarget as any).style.background=BG2;}}
            onMouseLeave={e=>{(e.currentTarget as any).style.borderColor="rgba(255,255,255,0.085)";(e.currentTarget as any).style.background=BG1;}}>
              {hot&&<div style={{position:"absolute",top:12,right:12,fontSize:8,fontWeight:700,
                padding:"2px 7px",borderRadius:4,background:G10,color:G,border:`0.5px solid ${G18}`}}>NEU</div>}
              <div style={{fontSize:22,color:G,marginBottom:12,opacity:.8}}>{icon}</div>
              <div style={{fontSize:15,fontWeight:400,color:TX1,marginBottom:6}}>{title}</div>
              <div style={{fontSize:12,color:TX3,lineHeight:1.7}}>{desc}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{maxWidth:700,margin:"0 auto",padding:"0 clamp(16px,3vw,32px) clamp(80px,10vw,140px)"}}>
        <div style={{
          background:`linear-gradient(135deg,rgba(212,168,67,0.10),${BG1})`,
          border:`0.5px solid ${G18}`,borderRadius:24,
          padding:"clamp(32px,4vw,52px) clamp(24px,4vw,48px)",
          position:"relative",overflow:"hidden",textAlign:"center",
        }}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:0.5,
            background:`linear-gradient(90deg,transparent,${G},transparent)`}}/>
          <div style={{fontSize:9,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:G,marginBottom:14}}>✦ Premium</div>
          <h2 style={{fontFamily:"var(--font-display)",fontSize:"clamp(20px,3.5vw,36px)",fontWeight:200,letterSpacing:"-.04em",marginBottom:10}}>
            Für ernsthafte Sammler.
          </h2>
          <p style={{fontSize:13,color:TX3,marginBottom:28,lineHeight:1.8,maxWidth:440,margin:"0 auto 28px"}}>
            Unlimitierter Scanner · Marktplatz · Wishlist-E-Mails<br/>Preisalarme · 3% statt 5% Provision
          </p>
          <Link href="/dashboard/premium" style={{
            display:"inline-flex",alignItems:"center",gap:8,
            padding:"12px 28px",borderRadius:14,
            background:G,color:"#09090b",
            fontSize:14,fontWeight:400,textDecoration:"none",
            boxShadow:`0 4px 24px ${G25}`,
          }}>Premium werden ✦</Link>
          <div style={{marginTop:14,fontSize:11,color:TX3}}>6,99 € / Monat · Jederzeit kündbar</div>
        </div>
      </section>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
        @keyframes skeleton-pulse { 0%,100%{opacity:.2} 50%{opacity:.4} }
        @media(max-width:680px) {
          .home-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
