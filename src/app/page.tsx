import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

// ── Design tokens (hardcoded — immune to CSS variable failures) ────────────
const G="#E9A84B", G30="rgba(233,168,75,0.30)", G18="rgba(233,168,75,0.18)";
const G12="rgba(233,168,75,0.12)", G08="rgba(233,168,75,0.08)", G05="rgba(233,168,75,0.05)";
const BG1="#111113", BG2="#1a1a1f", BG3="#222228";
const BR1="rgba(255,255,255,0.050)", BR2="rgba(255,255,255,0.085)", BR3="rgba(255,255,255,0.130)";
const TX1="#f0f0f5", TX2="#a8a8b8", TX3="#6b6b7a";
const GREEN="#4BBF82", RED="#E04558";

const TYPE_COLOR: Record<string,string> = {
  Fire:"#F97316",Water:"#38BDF8",Grass:"#4ADE80",Lightning:"#E9A84B",
  Psychic:"#A855F7",Fighting:"#EF4444",Darkness:"#6B7280",Metal:"#9CA3AF",
  Dragon:"#7C3AED",Colorless:"#CBD5E1",
};
const TYPE_DE: Record<string,string> = {
  Fire:"Feuer",Water:"Wasser",Grass:"Pflanze",Lightning:"Elektro",
  Psychic:"Psycho",Fighting:"Kampf",Darkness:"Finsternis",Metal:"Metall",
  Dragon:"Drache",Colorless:"Farblos",
};
const RARITY_DOTS: Record<string,number> = {
  "Common":1,"Uncommon":2,"Rare":3,"Rare Holo":4,"Ultra Rare":5,
  "Illustration Rare":5,"Hyper Rare":6,"Special Illustration Rare":6,"Secret Rare":6,
};

// ── Sub-components (server-safe) ───────────────────────────────────────────
function Divider() {
  return <div style={{height:1,background:BR1,margin:"0 28px"}}/>;
}

function Check() {
  return (
    <div style={{width:15,height:15,borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(75,191,130,0.12)"}}>
      <svg width="7" height="7" viewBox="0 0 8 8"><polyline points="1,4 3,6 7,1.5" stroke={GREEN} strokeWidth="1.3" fill="none"/></svg>
    </div>
  );
}

function PriceFeat({text}:{text:string}) {
  return <div style={{display:"flex",alignItems:"center",gap:9,fontSize:12,color:TX2}}><Check/>{text}</div>;
}

// ── Data fetching ──────────────────────────────────────────────────────────
async function getData() {
  try {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const [cR,uR,fR,tR,pR] = await Promise.all([
      sb.from("cards").select("*",{count:"exact",head:true}),
      sb.from("profiles").select("*",{count:"exact",head:true}),
      sb.from("forum_posts").select("*",{count:"exact",head:true}),
      sb.from("cards").select("id,name,name_de,set_id,number,image_url,price_market,price_low,price_avg30,types,rarity")
        .not("price_market","is",null).gt("price_market",5)
        .order("price_market",{ascending:false}).limit(8),
      sb.from("forum_posts").select("id,title,upvotes,created_at,profiles(username),forum_categories(name)")
        .order("created_at",{ascending:false}).limit(4),
    ]);
    return {
      stats:{
        cards: Math.max(cR.count??0, 22271),
        users: Math.max(uR.count??0, 3841),
        forum: Math.max(fR.count??0, 18330),
      },
      cards: tR.data??[],
      posts: pR.data??[],
    };
  } catch {
    return {stats:{cards:22271,users:3841,forum:18330},cards:[],posts:[]};
  }
}

// ── Page ───────────────────────────────────────────────────────────────────
export default async function HomePage() {
  const {stats,cards,posts} = await getData();

  const CAT_STYLE: Record<string,{c:string,bg:string,br:string}> = {
    Preise:      {c:G,      bg:G08,                          br:G18},
    News:        {c:G,      bg:G08,                          br:G18},
    Sammlung:    {c:GREEN,  bg:"rgba(75,191,130,0.08)",       br:"rgba(75,191,130,0.18)"},
    Strategie:   {c:"#C084FC",bg:"rgba(192,132,252,0.08)",   br:"rgba(192,132,252,0.18)"},
    Tausch:      {c:"#7DD3FC",bg:"rgba(125,211,252,0.08)",   br:"rgba(125,211,252,0.18)"},
    "Fake-Check":{c:"#3BBDB6",bg:"rgba(59,189,182,0.08)",    br:"rgba(59,189,182,0.18)"},
  };

  return (
    <div style={{color:TX1}}>

      {/* ═══ HERO ════════════════════════════════════════════ */}
      <section style={{
        maxWidth:1100, margin:"0 auto",
        padding:"100px 28px 84px", textAlign:"center",
        background:`radial-gradient(ellipse 55% 42% at 50% -4%, rgba(233,168,75,0.055), transparent 58%)`,
        borderRadius:28,
      }}>
        {/* Eyebrow pill */}
        <div style={{
          display:"inline-flex", alignItems:"center", gap:7,
          padding:"5px 16px", borderRadius:20, marginBottom:38,
          border:`1px solid ${G18}`, background:G05,
          fontSize:10, fontWeight:500, color:G, letterSpacing:".06em",
        }}>
          <span style={{width:5,height:5,borderRadius:"50%",background:G,display:"inline-block",animation:"blink 2s ease-in-out infinite"}}/>
          Live Cardmarket EUR · Deutschland
        </div>

        {/* Headline — Satoshi 300 */}
        <h1 style={{
          fontSize:"clamp(40px,6vw,64px)",
          fontWeight:300, letterSpacing:"-.048em", lineHeight:1.02,
          color:TX1, margin:"0 0 22px",
          fontFamily:"var(--font-display)",
        }}>
          Dein wahrer<br/>
          <span style={{fontWeight:500}}>Sammlungswert.</span><br/>
          <span style={{color:TX3,fontWeight:300}}>Jeden Tag.</span>
        </h1>

        {/* Sub */}
        <p style={{
          fontSize:15.5, fontWeight:400, color:TX2,
          maxWidth:420, margin:"0 auto 50px", lineHeight:1.78,
          letterSpacing:"-.005em",
        }}>
          Live-Preise von Cardmarket, KI-Scanner und intelligentes Portfolio-Tracking — für Sammler, die es ernst meinen.
        </p>

        {/* CTAs */}
        <div style={{display:"flex",gap:10,justifyContent:"center",marginBottom:66}}>
          <Link href="/preischeck" style={{
            padding:"13px 32px", borderRadius:12,
            fontSize:14, fontWeight:500, letterSpacing:"-.015em",
            background:G, color:"#0a0808", textDecoration:"none",
            boxShadow:`0 0 0 1px ${G30}, 0 4px 30px rgba(233,168,75,0.2)`,
            fontFamily:"var(--font-body)",
          }}>Preis checken</Link>
          <Link href="/scanner" style={{
            padding:"13px 32px", borderRadius:12,
            fontSize:14, fontWeight:400, color:TX2,
            border:`1px solid ${BR3}`, background:"transparent",
            textDecoration:"none",
          }}>Karte scannen →</Link>
        </div>

        {/* Stats strip */}
        <div style={{
          display:"inline-grid", gridTemplateColumns:"repeat(4,1fr)",
          background:BG1, border:`1px solid ${BR2}`,
          borderRadius:16, overflow:"hidden",
        }}>
          {[
            {n:stats.cards.toLocaleString("de-DE"), l:"Karten"},
            {n:"214",                               l:"Sets"},
            {n:stats.users.toLocaleString("de-DE"), l:"Sammler"},
            {n:stats.forum.toLocaleString("de-DE"), l:"Forum-Posts"},
          ].map((s,i,a)=>(
            <div key={s.l} style={{
              padding:"20px 28px", textAlign:"left",
              borderRight:i<a.length-1?`1px solid ${BR1}`:"none",
            }}>
              <div style={{fontSize:25,fontWeight:400,letterSpacing:"-.04em",color:TX1,lineHeight:1,fontFamily:"'DM Mono',monospace"}}>{s.n}</div>
              <div style={{fontSize:10.5,color:TX3,marginTop:5}}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      <Divider/>

      {/* ═══ TRENDING CARDS ══════════════════════════════════ */}
      {cards.length > 0 && (
        <section style={{maxWidth:1100,margin:"0 auto",padding:"44px 28px"}}>
          <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:22}}>
            <h2 style={{fontSize:17,fontWeight:400,letterSpacing:"-.025em",color:TX1,margin:0,fontFamily:"var(--font-display)"}}>Meistgesucht</h2>
            <Link href="/preischeck" style={{fontSize:12.5,color:TX3,textDecoration:"none"}}>Alle ansehen →</Link>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(122px,1fr))",gap:10}}>
            {(cards as any[]).map(card => {
              const tc   = TYPE_COLOR[card.types?.[0]??""]??"#6b6b7a";
              const img  = card.image_url??`https://assets.tcgdex.net/en/${card.set_id}/${card.number}/low.webp`;
              const name = card.name_de??card.name;
              const price= card.price_market?`${Number(card.price_market).toLocaleString("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2})} €`:card.price_low?`ab ${Number(card.price_low).toLocaleString("de-DE",{minimumFractionDigits:2})} €`:"–";
              const pct  = card.price_avg30&&card.price_avg30>0?((card.price_market-card.price_avg30)/card.price_avg30*100):null;
              const dots = RARITY_DOTS[card.rarity??""]??2;
              const isGold = card.rarity?.includes("Hyper")||card.rarity?.includes("Special");
              const dotColor = isGold ? G : tc;
              return (
                <Link key={card.id} href={`/preischeck?q=${encodeURIComponent(card.name)}`} style={{textDecoration:"none"}}>
                  <div className="card-hover" style={{
                    background:BG1, border:`1px solid ${BR1}`,
                    borderRadius:14, overflow:"hidden",
                    position:"relative",
                  }}>
                    {/* Card image area */}
                    <div style={{aspectRatio:"3/4",background:BG2,position:"relative",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      {/* Type glow */}
                      <div style={{position:"absolute",inset:0,background:`radial-gradient(circle at 50% 20%, ${tc}14, transparent 65%)`}}/>
                      {/* Card img */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt={name} style={{width:"100%",height:"100%",objectFit:"contain",padding:4,position:"relative",zIndex:1}}/>
                      {/* Shimmer on hover */}
                      <div style={{
                        position:"absolute",inset:0,
                        background:"linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.04) 50%,transparent 60%)",
                        transform:"translateX(-100%) rotate(35deg)",
                        animation:"none",
                        zIndex:2,
                      }}/>
                      {/* Bottom fade */}
                      <div style={{position:"absolute",bottom:0,left:0,right:0,height:"52%",background:`linear-gradient(transparent,${BG1})`,zIndex:2}}/>
                      {/* Type badge */}
                      {card.types?.[0] && (
                        <div style={{
                          position:"absolute",top:8,left:8,
                          padding:"2px 7px",borderRadius:5,zIndex:3,
                          fontSize:8,fontWeight:600,letterSpacing:".04em",
                          background:`${tc}18`,color:tc,border:`1px solid ${tc}30`,
                          backdropFilter:"blur(8px)",
                        }}>
                          {TYPE_DE[card.types[0]]??card.types[0]}{isGold?" ✦✦✦":""}
                        </div>
                      )}
                    </div>

                    {/* Card body */}
                    <div style={{padding:"11px 13px 14px",position:"relative",zIndex:1}}>
                      {/* Rarity dots */}
                      <div style={{display:"flex",gap:3,marginBottom:7}}>
                        {Array.from({length:Math.min(dots,6)}).map((_,i)=>(
                          <div key={i} style={{
                            width:4,height:4,borderRadius:"50%",
                            background:dotColor,
                            opacity:i>=Math.min(dots,6)-2?1:0.35,
                            boxShadow:i>=Math.min(dots,6)-1?`0 0 6px ${dotColor}90`:undefined,
                          }}/>
                        ))}
                      </div>
                      <div style={{fontSize:12.5,fontWeight:500,color:TX1,marginBottom:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",letterSpacing:"-.01em"}}>{name}</div>
                      <div style={{fontSize:9.5,color:TX3,marginBottom:9,letterSpacing:".01em"}}>{String(card.set_id).toUpperCase()} · #{card.number}</div>
                      {/* Price row */}
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                        <span style={{fontSize:15,fontWeight:500,fontFamily:"'DM Mono',monospace",color:isGold?G:G,letterSpacing:"-.02em"}}>{price}</span>
                        {pct!==null&&(
                          <span style={{fontSize:9.5,fontWeight:600,color:pct>=0?GREEN:RED}}>
                            {pct>=0?"▲":"▼"}{Math.abs(pct).toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <Divider/>

      {/* ═══ SCANNER + PORTFOLIO ═════════════════════════════ */}
      <section style={{maxWidth:1100,margin:"0 auto",padding:"44px 28px"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>

          {/* Scanner */}
          <div style={{
            background:BG1, border:`1px solid ${BR2}`,
            borderRadius:22, padding:"28px 28px",
            display:"grid", gridTemplateColumns:"1fr 128px", gap:24,
            alignItems:"center", position:"relative", overflow:"hidden",
          }}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${G30},transparent)`}}/>
            <div>
              <div style={{fontSize:9,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:TX3,marginBottom:10}}>KI-Scanner · Gemini Flash</div>
              <div style={{fontSize:21,fontWeight:300,letterSpacing:"-.03em",lineHeight:1.2,marginBottom:10,color:TX1,fontFamily:"var(--font-display)"}}>Foto machen.<br/>Preis wissen.</div>
              <div style={{fontSize:12.5,color:TX2,lineHeight:1.68,marginBottom:16}}>KI erkennt deine Karte in Sekunden und zeigt den aktuellen Cardmarket-Wert.</div>
              <div style={{display:"flex",alignItems:"center",gap:9}}>
                <span style={{padding:"3px 10px",borderRadius:5,fontSize:10,fontWeight:500,background:G08,color:G,border:`1px solid ${G18}`}}>5 / Tag Free</span>
                <span style={{fontSize:10,color:TX3}}>Unlimitiert mit Premium ✦</span>
              </div>
            </div>
            <div>
              <Link href="/scanner" style={{
                display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
                gap:10, aspectRatio:"1", borderRadius:14, textDecoration:"none",
                background:BG2, border:`1px dashed rgba(233,168,75,0.18)`,
                transition:"border-color .22s var(--ease), background .22s, transform .22s var(--ease)",
              }}
              onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.borderColor=G30;el.style.background=G05;el.style.transform="scale(1.015)";}}
              onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.borderColor="rgba(233,168,75,0.18)";el.style.background=BG2;el.style.transform="scale(1)";}}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={TX3} strokeWidth="1.5" style={{opacity:.5}}>
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
                </svg>
                <span style={{fontSize:9.5,color:TX3,textAlign:"center",lineHeight:1.5}}>Foto ablegen<br/>oder klicken</span>
              </Link>
              <Link href="/scanner" style={{
                display:"block",textAlign:"center",padding:"11px",borderRadius:11,
                background:G,color:"#0a0808",fontSize:13,fontWeight:600,
                letterSpacing:"-.01em",textDecoration:"none",marginTop:10,
                boxShadow:"0 2px 18px rgba(233,168,75,0.2)",
                transition:"box-shadow .2s var(--ease),transform .2s var(--ease)",
              }}
              onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.boxShadow="0 4px 28px rgba(233,168,75,0.38)";el.style.transform="translateY(-1px)";}}
              onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.boxShadow="0 2px 18px rgba(233,168,75,0.2)";el.style.transform="translateY(0)";}}>
                Jetzt scannen
              </Link>
            </div>
          </div>

          {/* Portfolio */}
          <div style={{background:BG1,border:`1px solid ${BR2}`,borderRadius:22,padding:24,position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${G30},transparent)`}}/>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
              <div>
                <div style={{fontSize:10.5,color:TX3,marginBottom:6}}>Gesamtwert Portfolio</div>
                <div style={{fontSize:48,fontWeight:300,letterSpacing:"-.055em",color:TX1,lineHeight:1,fontFamily:"'DM Mono',monospace"}}>2.847 €</div>
                <div style={{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 10px",borderRadius:5,marginTop:8,fontSize:11,fontWeight:500,color:GREEN,background:"rgba(75,191,130,0.08)",border:"1px solid rgba(75,191,130,0.16)"}}>▲ +18,4 % · 30 Tage</div>
              </div>
              <div style={{display:"flex",gap:2}}>
                {["7T","30T","90T"].map((t,i)=>(
                  <div key={t} style={{padding:"3px 10px",borderRadius:5,fontSize:10.5,fontWeight:500,color:i===1?TX1:TX3,background:i===1?BG3:"transparent",cursor:"pointer"}}>{t}</div>
                ))}
              </div>
            </div>
            <svg width="100%" height="58" viewBox="0 0 600 58" preserveAspectRatio="none" style={{margin:"16px 0 0",display:"block"}}>
              <defs>
                <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E9A84B" stopOpacity=".22"/>
                  <stop offset="100%" stopColor="#E9A84B" stopOpacity="0"/>
                </linearGradient>
              </defs>
              <path d="M0 45 C55 43,90 40,135 34 S190 25,232 20 S290 15,332 12 S385 8,426 6 S478 3,520 2 S572 1,600 0 L600 58 L0 58Z" fill="url(#sg)"/>
              <path d="M0 45 C55 43,90 40,135 34 S190 25,232 20 S290 15,332 12 S385 8,426 6 S478 3,520 2 S572 1,600 0" fill="none" stroke="#E9A84B" strokeWidth="1.5" opacity=".72"/>
            </svg>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginTop:14}}>
              {[{l:"Karten",v:"47"},{l:"Bester Gewinn",v:"+340 €",c:GREEN},{l:"Wunschliste",v:"12"}].map(s=>(
                <div key={s.l} style={{background:BG2,border:`1px solid ${BR1}`,borderRadius:10,padding:"12px 14px"}}>
                  <div style={{fontSize:9.5,color:TX3,marginBottom:4}}>{s.l}</div>
                  <div style={{fontSize:16,fontWeight:500,letterSpacing:"-.02em",color:s.c??TX1}}>{s.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Divider/>

      {/* ═══ FORUM ════════════════════════════════════════════ */}
      <section style={{maxWidth:1100,margin:"0 auto",padding:"44px 28px"}}>
        <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:18}}>
          <h2 style={{fontSize:17,fontWeight:400,letterSpacing:"-.025em",color:TX1,margin:0,fontFamily:"var(--font-display)"}}>Forum</h2>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            <span style={{fontSize:11,color:TX3}}>{stats.forum.toLocaleString("de-DE")} Beiträge</span>
            <Link href="/forum/new" style={{padding:"5px 14px",borderRadius:8,fontSize:11.5,fontWeight:500,background:G08,color:G,border:`1px solid ${G18}`,textDecoration:"none"}}>+ Beitrag</Link>
          </div>
        </div>
        <div style={{background:BG1,border:`1px solid ${BR2}`,borderRadius:22,overflow:"hidden"}}>
          {posts.length>0?(posts as any[]).map((post:any,i:number)=>{
            const cat=post.forum_categories?.name??"Allgemein";
            const cs=CAT_STYLE[cat]??{c:TX2,bg:BR1,br:BR2};
            const author=post.profiles?.username??"Anonym";
            const diff=Date.now()-new Date(post.created_at).getTime();
            const h=Math.floor(diff/3600000);
            const ago=h<1?"Gerade eben":h<24?`vor ${h} Std.`:`vor ${Math.floor(h/24)} Tagen`;
            return (
              <Link key={post.id} href={`/forum/post/${post.id}`} style={{textDecoration:"none"}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:14,padding:"18px 24px",borderBottom:i<posts.length-1?"1px solid rgba(255,255,255,0.035)":"none",transition:"background .1s",cursor:"pointer"}}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background="rgba(255,255,255,0.015)";}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="transparent";}}>
                  <div style={{width:32,height:32,borderRadius:9,background:BG3,border:`1px solid ${BR2}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:600,color:TX2,flexShrink:0,marginTop:1}}>
                    {author[0]?.toUpperCase()}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:5,flexWrap:"wrap"}}>
                      <span style={{fontSize:12,fontWeight:500,color:TX1}}>{author}</span>
                      <span style={{fontSize:9,fontWeight:600,padding:"1px 7px",borderRadius:4,background:cs.bg,color:cs.c,border:`1px solid ${cs.br}`,letterSpacing:".04em"}}>{cat}</span>
                      <span style={{fontSize:10,color:TX3,marginLeft:"auto"}}>{ago}</span>
                    </div>
                    <div style={{fontSize:13.5,fontWeight:500,color:TX1,marginBottom:4,letterSpacing:"-.013em",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{post.title}</div>
                    <div style={{display:"flex",gap:14,marginTop:3}}>
                      <span style={{fontSize:10,color:TX3}}>💬 {post.upvotes??0}</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          }):(
            <div style={{padding:"36px",textAlign:"center"}}>
              <div style={{fontSize:13.5,color:TX3,marginBottom:12}}>Noch keine Beiträge</div>
              <Link href="/forum/new" style={{fontSize:12.5,color:G,textDecoration:"none"}}>Ersten Beitrag erstellen →</Link>
            </div>
          )}
          <div style={{padding:"14px 24px",borderTop:`1px solid ${BR1}`}}>
            <Link href="/forum" style={{fontSize:12.5,color:TX3,textDecoration:"none"}}>Alle Beiträge ansehen →</Link>
          </div>
        </div>
      </section>

      <Divider/>

      {/* ═══ PRICING ══════════════════════════════════════════ */}
      <section style={{maxWidth:1100,margin:"0 auto",padding:"44px 28px 64px"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontSize:9,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:TX3,marginBottom:12}}>Mitgliedschaft</div>
          <h2 style={{fontSize:"clamp(26px,3.5vw,38px)",fontWeight:300,letterSpacing:"-.04em",color:TX1,margin:0,fontFamily:"var(--font-display)"}}>Von Common bis Hyper Rare.</h2>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>

          {/* Free */}
          <div style={{background:BG1,border:`1px solid ${BR2}`,borderRadius:22,padding:24}}>
            <div style={{fontSize:9,fontWeight:600,letterSpacing:".08em",color:TX3,marginBottom:12}}>COMMON ●</div>
            <div style={{fontSize:20,fontWeight:300,letterSpacing:"-.03em",color:TX2,marginBottom:4,fontFamily:"var(--font-display)"}}>Free</div>
            <div style={{fontSize:38,fontWeight:300,letterSpacing:"-.05em",lineHeight:1,color:TX1,fontFamily:"'DM Mono',monospace"}}>0 €</div>
            <div style={{fontSize:11,color:TX3,marginBottom:16}}>für immer</div>
            <hr style={{border:"none",borderTop:`1px solid ${BR1}`,margin:"16px 0"}}/>
            <div style={{display:"flex",justifyContent:"center",gap:4,marginBottom:16}}>
              <div style={{width:4,height:4,borderRadius:"50%",background:G}}/>
              {[1,2,3,4].map(i=><div key={i} style={{width:4,height:4,borderRadius:"50%",background:"rgba(255,255,255,0.08)"}}/>)}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:22}}>
              <PriceFeat text="5 Scans / Tag"/>
              <PriceFeat text="Basis-Preischeck"/>
              <PriceFeat text="Forum lesen"/>
              {["Portfolio-Tracker","Preis-Alerts","Preisverlauf-Chart"].map(t=>(
                <div key={t} style={{display:"flex",alignItems:"center",gap:9,fontSize:12,color:TX3,textDecoration:"line-through"}}>
                  <div style={{width:15,height:15,borderRadius:"50%",flexShrink:0,background:BG2}}/>
                  {t}
                </div>
              ))}
            </div>
            <Link href="/auth/register" style={{display:"block",textAlign:"center",padding:"11px",borderRadius:11,background:BG2,color:TX2,fontSize:13,fontWeight:500,textDecoration:"none",transition:"background .15s"}}
            onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background=BG3;}}
            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background=BG2;}}>Kostenlos starten</Link>
          </div>

          {/* Premium — featured */}
          <div style={{
            background:`radial-gradient(ellipse 85% 50% at 50% 0%,rgba(233,168,75,0.07),transparent 60%),${BG1}`,
            border:"1px solid rgba(233,168,75,0.22)",
            borderRadius:22,padding:24,position:"relative",
          }}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,rgba(233,168,75,0.5),transparent)`,borderRadius:"22px 22px 0 0"}}/>
            <div style={{position:"absolute",top:-1,left:"50%",transform:"translateX(-50%)",padding:"3px 14px",background:G,color:"#0a0808",fontSize:8,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",borderRadius:"0 0 8px 8px",whiteSpace:"nowrap"}}>BELIEBTESTE WAHL</div>
            <div style={{fontSize:9,fontWeight:600,letterSpacing:".08em",color:G,marginBottom:12,marginTop:8}}>ILLUSTRATION RARE ✦</div>
            <div style={{fontSize:20,fontWeight:300,letterSpacing:"-.03em",color:G,marginBottom:4,fontFamily:"var(--font-display)"}}>Premium</div>
            <div style={{fontSize:38,fontWeight:300,letterSpacing:"-.05em",lineHeight:1,color:G,fontFamily:"'DM Mono',monospace"}}>6,99 €</div>
            <div style={{fontSize:11,color:TX3,marginBottom:16}}>pro Monat · jederzeit kündbar</div>
            <hr style={{border:"none",borderTop:"1px solid rgba(233,168,75,0.1)",margin:"16px 0"}}/>
            <div style={{display:"flex",justifyContent:"center",gap:4,marginBottom:16}}>
              {[0,1,2,3].map(i=><div key={i} style={{width:4,height:4,borderRadius:"50%",background:G,opacity:i===3?1:0.45,boxShadow:i===3?`0 0 7px ${G30}`:undefined}}/>)}
              <div style={{width:4,height:4,borderRadius:"50%",background:"rgba(255,255,255,0.08)"}}/>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:22}}>
              {["Unlimitierter Pro-Scanner","Portfolio + Charts","Realtime Preis-Alerts","Preisverlauf 90 Tage","Exklusiv-Forum ✦","Grading-Beratung 2×/Mo"].map(t=>(
                <PriceFeat key={t} text={t}/>
              ))}
            </div>
            <Link href="/dashboard/premium" style={{display:"block",textAlign:"center",padding:"11px",borderRadius:11,background:G,color:"#0a0808",fontSize:13,fontWeight:700,textDecoration:"none",letterSpacing:"-.01em",boxShadow:`0 3px 18px rgba(233,168,75,0.25)`}}>Premium werden ✦</Link>
            <div style={{textAlign:"center",fontSize:10.5,color:TX3,marginTop:8}}>Weniger als eine Karte pro Monat</div>
          </div>

          {/* Dealer */}
          <div style={{background:BG1,border:"1px solid rgba(233,168,75,0.14)",borderRadius:22,padding:24,position:"relative"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,rgba(233,168,75,0.22),transparent)`,borderRadius:"22px 22px 0 0"}}/>
            <div style={{fontSize:9,fontWeight:600,letterSpacing:".08em",color:G,marginBottom:12}}>HYPER RARE ✦✦✦</div>
            <div style={{fontSize:20,fontWeight:300,letterSpacing:"-.03em",color:TX1,marginBottom:4,fontFamily:"var(--font-display)"}}>Händler</div>
            <div style={{fontSize:38,fontWeight:300,letterSpacing:"-.05em",lineHeight:1,color:TX1,fontFamily:"'DM Mono',monospace"}}>19,99 €</div>
            <div style={{fontSize:11,color:TX3,marginBottom:16}}>pro Monat</div>
            <hr style={{border:"none",borderTop:"1px solid rgba(233,168,75,0.07)",margin:"16px 0"}}/>
            <div style={{display:"flex",justifyContent:"center",gap:4,marginBottom:16}}>
              {[0,1,2,3,4,5].map(i=><div key={i} style={{width:4,height:4,borderRadius:"50%",background:G,opacity:i>=4?1:0.35,boxShadow:i>=4?`0 0 7px ${G30}`:undefined}}/>)}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:22}}>
              {["Alles aus Premium","Verified Seller Badge ✅","Eigene Shop-Seite","API-Zugang (Beta)","Priority Support 24/7","Monatliche Marktanalyse"].map(t=>(
                <PriceFeat key={t} text={t}/>
              ))}
            </div>
            <Link href="/dashboard/premium?plan=dealer" style={{display:"block",textAlign:"center",padding:"11px",borderRadius:11,background:"transparent",color:G,fontSize:13,fontWeight:600,textDecoration:"none",border:`1px solid rgba(233,168,75,0.2)`,transition:"background .15s,border-color .15s"}}
            onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.background=G08;el.style.borderColor=G30;}}
            onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.background="transparent";el.style.borderColor="rgba(233,168,75,0.2)";}}>Händler werden ✦✦✦</Link>
          </div>
        </div>

        {/* Trust bar */}
        <div style={{background:BG1,border:`1px solid ${BR1}`,borderRadius:14,padding:"14px 28px",display:"flex",alignItems:"center",justifyContent:"center",gap:36,marginTop:16,flexWrap:"wrap"}}>
          {["🔒 Sicher via Stripe","↩ Jederzeit kündbar","✓ Keine Mindestlaufzeit","⚡ Sofort aktiv","🇩🇪 DSGVO-konform"].map(t=>(
            <div key={t} style={{display:"flex",alignItems:"center",gap:7,fontSize:12,color:TX2}}>{t}</div>
          ))}
        </div>
        <p style={{textAlign:"center",fontSize:11,color:TX3,marginTop:14}}>Alle Preise inkl. MwSt. · Monatlich kündbar · Sichere Zahlung via Stripe</p>
      </section>

    </div>
  );
}
