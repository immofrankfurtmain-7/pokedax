import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

// ── Design tokens ──────────────────────────────────────
const G   = "#D4A843";
const G25 = "rgba(212,168,67,0.25)";
const G15 = "rgba(212,168,67,0.15)";
const G08 = "rgba(212,168,67,0.08)";
const G04 = "rgba(212,168,67,0.04)";
const BG1 = "#111114";
const BG2 = "#18181c";
const BR1 = "rgba(255,255,255,0.045)";
const BR2 = "rgba(255,255,255,0.085)";
const TX1 = "#ededf2";
const TX2 = "#a4a4b4";
const TX3 = "#62626f";
const GREEN = "#3db87a";
const RED   = "#dc4a5a";

const TYPE_COLOR: Record<string,string> = {
  Fire:"#e8734a",Water:"#4a9eda",Grass:"#5ab86a",Lightning:"#D4A843",
  Psychic:"#b87ad4",Fighting:"#d4644a",Darkness:"#7a7a8a",
  Metal:"#8a9ab4",Dragon:"#7a5ad4",Colorless:"#9a9aaa",
};
const TYPE_DE: Record<string,string> = {
  Fire:"Feuer",Water:"Wasser",Grass:"Pflanze",Lightning:"Elektro",
  Psychic:"Psycho",Fighting:"Kampf",Darkness:"Finsternis",
  Metal:"Metall",Dragon:"Drache",Colorless:"Farblos",
};

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
      sb.from("cards")
        .select("id,name,name_de,set_id,number,image_url,price_market,price_avg30,types,rarity")
        .not("price_market","is",null).gt("price_market",5)
        .order("price_market",{ascending:false}).limit(5),
      sb.from("forum_posts")
        .select("id,title,upvotes,created_at,profiles(username),forum_categories(name)")
        .order("created_at",{ascending:false}).limit(3),
    ]);
    return {
      stats: {
        cards: Math.max(cR.count??0, 22271),
        users: Math.max(uR.count??0, 3841),
        forum: Math.max(fR.count??0, 18330),
      },
      cards: tR.data??[],
      posts: pR.data??[],
    };
  } catch {
    return { stats:{cards:22271,users:3841,forum:18330}, cards:[], posts:[] };
  }
}

function Divider() {
  return (
    <div style={{
      maxWidth:1240,margin:"0 auto",
      padding:"0 clamp(16px,3vw,32px)",
    }}>
      <div style={{height:1,background:`linear-gradient(90deg,transparent,${BR2},transparent)`}}/>
    </div>
  );
}

function Label({ children }: { children: string }) {
  return (
    <div style={{
      fontSize:10,fontWeight:600,
      letterSpacing:".16em",textTransform:"uppercase",
      color:TX3,marginBottom:20,
    }}>{children}</div>
  );
}

export default async function HomePage() {
  const { stats, cards, posts } = await getData();

  return (
    <div style={{color:TX1}}>

      {/* ═══════════════════════════════════════════════
          HERO
          ═══════════════════════════════════════════════ */}
      <section style={{
        maxWidth:1000,margin:"0 auto",
        padding:"clamp(100px,14vw,200px) clamp(16px,3vw,32px) clamp(100px,13vw,180px)",
        textAlign:"center",
      }}>
        {/* Eyebrow */}
        <div style={{
          display:"inline-flex",alignItems:"center",gap:8,
          padding:"7px 20px",borderRadius:40,
          border:`1px solid ${G15}`,background:G04,
          fontSize:11,fontWeight:500,color:G,
          letterSpacing:".14em",textTransform:"uppercase",
          marginBottom:52,
        }}>
          <span style={{width:5,height:5,borderRadius:"50%",background:G,display:"inline-block",animation:"blink 2.5s ease-in-out infinite"}}/>
          Live Cardmarket · Deutschland
        </div>

        {/* Headline */}
        <h1 style={{
          fontFamily:"var(--font-display)",
          fontSize:"clamp(48px,8vw,96px)",
          fontWeight:300,
          letterSpacing:"-.09em",
          lineHeight:0.96,
          color:TX1,
          marginBottom:28,
        }}>
          Deine Karten.<br/>
          Ihr wahrer{" "}
          <span style={{
            color:G,
            background:`linear-gradient(135deg,#D4A843,#e8c068,#c49030)`,
            WebkitBackgroundClip:"text",
            WebkitTextFillColor:"transparent",
          }}>Wert</span>.
        </h1>

        {/* Sub */}
        <p style={{
          fontSize:"clamp(16px,1.8vw,19px)",
          color:TX3,
          maxWidth:440,margin:"0 auto",
          lineHeight:1.75,fontWeight:400,
          letterSpacing:"-.005em",
        }}>
          Für Sammler, die ihre Karten ernst nehmen.<br/>
          Präzise. Zeitlos. Respektvoll.
        </p>

        {/* CTAs */}
        <div style={{
          display:"flex",gap:14,justifyContent:"center",
          marginTop:"clamp(52px,8vw,88px)",
          flexWrap:"wrap",
        }}>
          <Link href="/preischeck" className="gold-glow" style={{
            padding:"clamp(15px,1.8vw,20px) clamp(32px,4vw,56px)",
            borderRadius:32,
            fontSize:"clamp(14px,1.3vw,16px)",fontWeight:500,
            background:G,color:"#080608",
            textDecoration:"none",letterSpacing:".01em",
          }}>Preis checken</Link>
          <Link href="/scanner" className="gold-glow" style={{
            padding:"clamp(15px,1.8vw,20px) clamp(32px,4vw,56px)",
            borderRadius:32,
            fontSize:"clamp(14px,1.3vw,16px)",fontWeight:400,
            color:TX2,border:`1px solid ${BR2}`,
            background:"transparent",textDecoration:"none",
          }}>Karte scannen</Link>
        </div>
      </section>

      <Divider/>

      {/* ═══════════════════════════════════════════════
          STATS — frei schwebend, monumental
          ═══════════════════════════════════════════════ */}
      <div style={{
        maxWidth:1240,margin:"0 auto",
        padding:"clamp(80px,12vw,160px) clamp(16px,3vw,32px)",
      }}>
        <div style={{
          display:"flex",flexWrap:"wrap",
          justifyContent:"center",
          columnGap:"clamp(48px,7vw,120px)",
          rowGap:56,
          textAlign:"center",
        }}>
          {[
            {n:stats.cards.toLocaleString("de-DE"), l:"Karten indexiert"},
            {n:stats.users.toLocaleString("de-DE"), l:"Aktive Sammler"},
            {n:stats.forum.toLocaleString("de-DE"), l:"Forum-Beiträge"},
            {n:"214",                               l:"Sets"},
          ].map(s=>(
            <div key={s.l}>
              <div style={{
                fontFamily:"var(--font-display)",
                fontSize:"clamp(44px,6.5vw,80px)",
                fontWeight:300,
                letterSpacing:"-.07em",
                color:TX1,lineHeight:1,
              }}>{s.n}</div>
              <div style={{
                fontSize:9.5,fontWeight:600,
                letterSpacing:".18em",textTransform:"uppercase",
                color:TX3,marginTop:20,
              }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <Divider/>

      {/* ═══════════════════════════════════════════════
          MEISTGESUCHT
          ═══════════════════════════════════════════════ */}
      {cards.length > 0 && (
        <section style={{maxWidth:1240,margin:"0 auto",padding:"clamp(72px,10vw,140px) clamp(16px,3vw,32px)"}}>
          <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:40}}>
            <div>
              <Label>Meistgesucht</Label>
              <h2 style={{fontFamily:"var(--font-display)",fontSize:"clamp(24px,2.8vw,34px)",fontWeight:300,letterSpacing:"-.05em",color:TX1}}>Aktuelle Top-Karten</h2>
            </div>
            <Link href="/preischeck" style={{fontSize:13,color:TX3,textDecoration:"none",letterSpacing:".01em"}}>Alle ansehen →</Link>
          </div>
          <div className="cards-scroll-mobile" style={{display:"grid",gridTemplateColumns:`repeat(${Math.min(cards.length,5)},1fr)`,gap:14}}>
            {(cards as any[]).slice(0,5).map(card=>{
              const tc  = TYPE_COLOR[card.types?.[0]??""]??"#666";
              const img = card.image_url??`https://assets.tcgdex.net/en/${card.set_id}/${card.number}/low.webp`;
              const name = card.name_de??card.name;
              const price = card.price_market
                ? Number(card.price_market).toLocaleString("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2})+" €"
                : "–";
              const pct = card.price_avg30&&card.price_avg30>0
                ? ((card.price_market-card.price_avg30)/card.price_avg30*100) : null;
              const pctC = pct!==null ? Math.min(Math.abs(pct),99)*Math.sign(pct) : null;
              return (
                <Link key={card.id} href={`/preischeck?q=${encodeURIComponent(card.name)}`}
                  className="card-hover" style={{
                    background:BG1,border:`1px solid ${BR1}`,
                    borderRadius:24,overflow:"hidden",
                    textDecoration:"none",display:"block",
                  }}>
                  <div style={{aspectRatio:"3/4",background:"#0a0a0d",position:"relative",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <div style={{position:"absolute",inset:0,background:`radial-gradient(circle at 50% 30%,${tc}14,transparent 65%)`}}/>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={name} style={{width:"100%",height:"100%",objectFit:"contain",padding:8,position:"relative",zIndex:1}}/>
                    <div style={{position:"absolute",bottom:0,left:0,right:0,height:"50%",background:`linear-gradient(transparent,${BG1})`,zIndex:2}}/>
                    {card.types?.[0]&&(
                      <div style={{position:"absolute",top:10,left:10,zIndex:3,padding:"2px 8px",borderRadius:7,fontSize:9,fontWeight:600,letterSpacing:".04em",background:`${tc}14`,color:tc,border:`1px solid ${tc}22`}}>
                        {TYPE_DE[card.types[0]]??card.types[0]}
                      </div>
                    )}
                  </div>
                  <div style={{padding:"14px 16px 18px",position:"relative",zIndex:1}}>
                    <div style={{fontSize:13.5,fontWeight:500,color:TX1,marginBottom:3,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",letterSpacing:"-.01em"}}>{name}</div>
                    <div style={{fontSize:10,color:TX3,marginBottom:12,letterSpacing:".02em"}}>{String(card.set_id).toUpperCase()} · #{card.number}</div>
                    <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between"}}>
                      <span style={{fontFamily:"var(--font-mono)",fontSize:"clamp(15px,1.4vw,19px)",color:G,letterSpacing:"-.02em"}}>{price}</span>
                      {pctC!==null&&(
                        <span style={{fontSize:10,fontWeight:600,color:pctC>=0?GREEN:RED}}>
                          {pctC>=0?"▲":"▼"} {Math.abs(pctC).toLocaleString("de-DE",{maximumFractionDigits:1})} %
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <Divider/>

      {/* ═══════════════════════════════════════════════
          SCANNER
          ═══════════════════════════════════════════════ */}
      <section style={{maxWidth:1240,margin:"0 auto",padding:"clamp(72px,10vw,140px) clamp(16px,3vw,32px)"}}>
        <div style={{
          background:BG1,border:`1px solid ${BR2}`,borderRadius:32,
          overflow:"hidden",position:"relative",}} className="scanner-split" style={{
        }}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${G25},transparent)`}}/>
          <div style={{padding:"clamp(40px,5vw,72px)",display:"flex",flexDirection:"column",justifyContent:"center"}}>
            <Label>KI-Scanner · Gemini Flash</Label>
            <h2 style={{fontFamily:"var(--font-display)",fontSize:"clamp(30px,4vw,52px)",fontWeight:300,letterSpacing:"-.07em",lineHeight:1.05,marginBottom:18,color:TX1}}>
              Foto machen.<br/>Preis wissen.
            </h2>
            <p style={{fontSize:"clamp(14px,1.4vw,17px)",color:TX2,lineHeight:1.75,marginBottom:40,maxWidth:340}}>
              Halte deine Karte in die Kamera. In Sekunden bekommst du den aktuellen Cardmarket-Wert.
            </p>
            <div style={{display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
              <Link href="/scanner" className="gold-glow" style={{
                padding:"13px 28px",borderRadius:24,
                background:G,color:"#080608",fontSize:14,fontWeight:500,
                textDecoration:"none",letterSpacing:".01em",
              }}>Scanner starten</Link>
              <span style={{fontSize:12,color:TX3}}>5 / Tag kostenlos</span>
            </div>
          </div>
          <div style={{
            background:BG2,
            display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
            gap:16,padding:48,borderLeft:`1px solid ${BR1}`,
          }}>
            <div style={{width:140,height:185,borderRadius:18,background:"#0a0a0d",border:`1.5px dashed rgba(212,168,67,0.15)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12}}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={TX3} strokeWidth="1.2" style={{opacity:.3}}>
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              <span style={{fontSize:11,color:TX3,textAlign:"center",lineHeight:1.5}}>Karte hier<br/>ablegen</span>
            </div>
            <div style={{fontSize:11,color:TX3}}>oder klicken zum Hochladen</div>
          </div>
        </div>
      </section>

      <Divider/>

      {/* ═══════════════════════════════════════════════
          FANTASY LEAGUE
          ═══════════════════════════════════════════════ */}
      <section style={{maxWidth:1240,margin:"0 auto",padding:"clamp(72px,10vw,140px) clamp(16px,3vw,32px)"}}>
        <div style={{
          background:BG1,border:`1px solid ${BR2}`,borderRadius:32,
          overflow:"hidden",position:"relative",}} className="fantasy-split" style={{
        }}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${G25},transparent)`}}/>
          <div style={{padding:"clamp(40px,5vw,72px)",display:"flex",flexDirection:"column",justifyContent:"center"}}>
            <Label>Fantasy League</Label>
            <h2 style={{fontFamily:"var(--font-display)",fontSize:"clamp(28px,3.5vw,48px)",fontWeight:300,letterSpacing:"-.07em",lineHeight:1.05,marginBottom:18,color:TX1}}>
              Baue dein 1.000 € Team.<br/>Gewinne mit realen Kursen.
            </h2>
            <p style={{fontSize:"clamp(14px,1.4vw,17px)",color:TX2,lineHeight:1.75,marginBottom:40,maxWidth:360}}>
              Kaufe virtuelle Karten und sammle Punkte durch reale Preisveränderungen. Monatliche Preise und exklusive Trophy Cards.
            </p>
            <Link href="/fantasy" className="gold-glow" style={{
              display:"inline-block",alignSelf:"flex-start",
              padding:"13px 28px",borderRadius:24,
              background:G,color:"#080608",fontSize:14,fontWeight:500,
              textDecoration:"none",letterSpacing:".01em",
            }}>Jetzt Team aufstellen →</Link>
          </div>
          <div style={{display:"flex",flexDirection:"column",justifyContent:"center",padding:"clamp(32px,5vw,64px)",borderLeft:`1px solid ${BR1}`}}>
            {[{n:"@luxecollector",p:"1.284"},{n:"@pokegoldrush",p:"1.197"},{n:"@silentvault",p:"987"}].map((r,i)=>(
              <div key={r.n} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 0",borderBottom:i<2?`1px solid ${BR1}`:"none"}}>
                <div style={{display:"flex",alignItems:"center",gap:14}}>
                  <span style={{fontFamily:"var(--font-mono)",fontSize:11,fontWeight:600,color:i===0?G:TX3,letterSpacing:".04em"}}>0{i+1}</span>
                  <span style={{fontSize:14,color:TX2}}>{r.n}</span>
                </div>
                <span style={{fontFamily:"var(--font-mono)",fontSize:17,color:G}}>{r.p} pts</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Divider/>

      {/* ═══════════════════════════════════════════════
          FORUM
          ═══════════════════════════════════════════════ */}
      {posts.length > 0 && (
        <section style={{maxWidth:1240,margin:"0 auto",padding:"clamp(72px,10vw,140px) clamp(16px,3vw,32px)"}}>
          <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:40}}>
            <div>
              <Label>Community</Label>
              <h2 style={{fontFamily:"var(--font-display)",fontSize:"clamp(24px,2.8vw,34px)",fontWeight:300,letterSpacing:"-.05em",color:TX1}}>
                Was gerade diskutiert wird
              </h2>
            </div>
            <Link href="/forum" style={{fontSize:13,color:TX3,textDecoration:"none"}}>Alle Beiträge →</Link>
          </div>
          <div style={{display:"grid",gap:14}} className="forum-cards-grid">
            {(posts as any[]).map((post:any)=>{
              const cat = post.forum_categories?.name??"Forum";
              const h   = Math.floor((Date.now()-new Date(post.created_at).getTime())/3600000);
              const ago = h<1?"Gerade":h<24?`vor ${h} Std.`:`vor ${Math.floor(h/24)} T.`;
              return (
                <Link key={post.id} href={`/forum/post/${post.id}`} className="card-hover" style={{
                  background:BG1,border:`1px solid ${BR1}`,
                  borderRadius:24,padding:"clamp(22px,2.5vw,32px)",
                  textDecoration:"none",display:"block",
                }}>
                  <div style={{fontSize:10,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:G,marginBottom:14}}>{cat}</div>
                  <div style={{fontSize:"clamp(14px,1.3vw,17px)",fontWeight:400,color:TX1,lineHeight:1.5,marginBottom:24,display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{post.title}</div>
                  <div style={{fontSize:11,color:TX3}}>↑ {post.upvotes??0} · {ago}</div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <Divider/>

      {/* ═══════════════════════════════════════════════
          PORTFOLIO + WELCOME
          ═══════════════════════════════════════════════ */}
      <section style={{maxWidth:1240,margin:"0 auto",padding:"clamp(72px,10vw,140px) clamp(16px,3vw,32px)"}}>
        <div style={{display:"grid",gap:14}} className="portfolio-welcome-grid">
          <div style={{background:BG1,border:`1px solid ${BR2}`,borderRadius:28,padding:"clamp(36px,4vw,56px)"}}>
            <Label>Dein Portfolio</Label>
            <div style={{fontFamily:"var(--font-display)",fontSize:"clamp(40px,5vw,68px)",fontWeight:300,letterSpacing:"-.07em",color:TX1,lineHeight:1,marginBottom:10}}>4.872 €</div>
            <div style={{fontSize:"clamp(14px,1.5vw,18px)",color:GREEN,marginBottom:36}}>+27,3 % diese Saison</div>
            <Link href="/portfolio" className="gold-glow" style={{
              display:"inline-block",
              padding:"12px 24px",borderRadius:20,fontSize:14,fontWeight:400,
              color:TX2,border:`1px solid ${BR2}`,textDecoration:"none",
            }}>Portfolio ansehen</Link>
          </div>
          <div style={{background:`radial-gradient(ellipse 80% 60% at 50% 0%,rgba(212,168,67,0.05),transparent 50%),${BG1}`,border:`1px solid rgba(212,168,67,0.14)`,borderRadius:28,padding:"clamp(36px,4vw,56px)",display:"flex",flexDirection:"column",justifyContent:"center",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,rgba(212,168,67,0.35),transparent)`}}/>
            <Label>Willkommen bei pokédax</Label>
            <h2 style={{fontFamily:"var(--font-display)",fontSize:"clamp(22px,2.8vw,36px)",fontWeight:300,letterSpacing:"-.05em",lineHeight:1.2,color:TX1,marginBottom:18}}>
              Hier sind deine Karten<br/>in guten Händen.
            </h2>
            <p style={{fontSize:"clamp(14px,1.3vw,16px)",color:TX2,lineHeight:1.8,marginBottom:36}}>
              Mit Premium erhältst du unlimitierte Scans, Portfolio-Tracking, Preis-Alerts und exklusiven Zugang zur Sammler-Community.
            </p>
            <Link href="/dashboard/premium" className="gold-glow" style={{
              display:"inline-block",alignSelf:"flex-start",
              padding:"13px 28px",borderRadius:24,
              background:G,color:"#080608",fontSize:14,fontWeight:500,
              textDecoration:"none",letterSpacing:".01em",
            }}>Premium werden</Link>
          </div>
        </div>
      </section>

      <Divider/>

      {/* ═══════════════════════════════════════════════
          PRICING
          ═══════════════════════════════════════════════ */}
      <section style={{maxWidth:1240,margin:"0 auto",padding:"clamp(72px,10vw,140px) clamp(16px,3vw,32px)"}}>
        <div style={{textAlign:"center",marginBottom:56}}>
          <Label>Mitgliedschaft</Label>
          <h2 style={{fontFamily:"var(--font-display)",fontSize:"clamp(28px,4vw,48px)",fontWeight:300,letterSpacing:"-.06em",color:TX1,marginBottom:10}}>
            Von Common bis Hyper Rare.
          </h2>
          <p style={{fontSize:15,color:TX3}}>Wähle deine Stufe. Kündige jederzeit.</p>
        </div>

        <div style={{display:"grid",gap:14,marginBottom:28}} className="pricing-plans-grid" style={{}}>
          {/* Free */}
          <div style={{background:BG1,border:`1px solid ${BR2}`,borderRadius:28,padding:"clamp(28px,3.5vw,44px)"}}>
            <div style={{fontSize:9.5,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:TX3,marginBottom:16}}>COMMON ●</div>
            <div style={{fontFamily:"var(--font-display)",fontSize:"clamp(28px,3vw,38px)",fontWeight:300,letterSpacing:"-.05em",color:TX2,marginBottom:4}}>Free</div>
            <div style={{fontSize:13,color:TX3,marginBottom:32,paddingBottom:32,borderBottom:`1px solid ${BR1}`}}>für immer</div>
            <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:32}}>
              {["5 Scans/Tag","Basis-Preischeck","Forum lesen"].map(t=>(
                <div key={t} style={{display:"flex",alignItems:"center",gap:10,fontSize:14,color:TX2}}>
                  <span style={{width:16,height:16,borderRadius:"50%",background:"rgba(61,184,122,0.1)",border:"1px solid rgba(61,184,122,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <svg width="7" height="7" viewBox="0 0 8 8"><polyline points="1,4 3,6 7,1.5" stroke={GREEN} strokeWidth="1.4" fill="none"/></svg>
                  </span>
                  {t}
                </div>
              ))}
            </div>
            <Link href="/auth/register" className="gold-glow" style={{display:"block",textAlign:"center",padding:"13px",borderRadius:18,background:BG2,color:TX2,fontSize:14,textDecoration:"none",border:`1px solid ${BR1}`}}>
              Kostenlos starten
            </Link>
          </div>

          {/* Premium — featured */}
          <div className="gold-glow" style={{
            background:`radial-gradient(ellipse 100% 60% at 50% 0%,rgba(212,168,67,0.08),transparent 55%),${BG1}`,
            border:`1px solid rgba(212,168,67,0.22)`,
            borderRadius:28,padding:"clamp(28px,3.5vw,44px)",
            position:"relative",
          }}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,rgba(212,168,67,0.55),transparent)`,borderRadius:"28px 28px 0 0"}}/>
            <div style={{position:"absolute",top:-1,left:"50%",transform:"translateX(-50%)",padding:"4px 18px",background:G,color:"#080608",fontSize:9,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",borderRadius:"0 0 12px 12px",whiteSpace:"nowrap"}}>Beliebteste Wahl</div>
            <div style={{fontSize:9.5,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:G,marginBottom:16,marginTop:12}}>ILLUSTRATION RARE ✦</div>
            <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:4}}>
              <span style={{fontFamily:"var(--font-mono)",fontSize:"clamp(36px,4vw,52px)",color:G,letterSpacing:"-.04em"}}>6,99</span>
              <span style={{fontSize:15,color:G}}>€ / Mo</span>
            </div>
            <div style={{fontSize:13,color:TX3,marginBottom:32,paddingBottom:32,borderBottom:`1px solid rgba(212,168,67,0.1)`}}>jederzeit kündbar</div>
            <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:32}}>
              {["Unlimitierter Scanner","Portfolio + Charts","Realtime Preis-Alerts","Preisverlauf 90 Tage","Exklusiv-Forum ✦"].map(t=>(
                <div key={t} style={{display:"flex",alignItems:"center",gap:10,fontSize:14,color:TX1}}>
                  <span style={{width:16,height:16,borderRadius:"50%",background:"rgba(212,168,67,0.12)",border:"1px solid rgba(212,168,67,0.22)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <svg width="7" height="7" viewBox="0 0 8 8"><polyline points="1,4 3,6 7,1.5" stroke={G} strokeWidth="1.4" fill="none"/></svg>
                  </span>
                  {t}
                </div>
              ))}
            </div>
            <Link href="/dashboard/premium" className="gold-glow" style={{
              display:"block",textAlign:"center",
              padding:"15px",borderRadius:20,
              background:G,color:"#080608",fontSize:14,fontWeight:600,
              textDecoration:"none",letterSpacing:".04em",textTransform:"uppercase",
            }}>Premium werden</Link>
            <p style={{textAlign:"center",fontSize:11.5,color:TX3,marginTop:10}}>Weniger als eine Karte / Monat</p>
          </div>

          {/* Dealer */}
          <div style={{background:BG1,border:`1px solid rgba(212,168,67,0.10)`,borderRadius:28,padding:"clamp(28px,3.5vw,44px)",position:"relative"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,rgba(212,168,67,0.18),transparent)`,borderRadius:"28px 28px 0 0"}}/>
            <div style={{fontSize:9.5,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:G,marginBottom:16}}>HYPER RARE ✦✦✦</div>
            <div style={{fontFamily:"var(--font-display)",fontSize:"clamp(28px,3vw,38px)",fontWeight:300,letterSpacing:"-.05em",color:TX1,marginBottom:4}}>19,99 €</div>
            <div style={{fontSize:13,color:TX3,marginBottom:32,paddingBottom:32,borderBottom:`1px solid ${BR1}`}}>pro Monat</div>
            <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:32}}>
              {["Alles aus Premium","Verified Seller Badge ✅","Eigene Shop-Seite","API-Zugang (Beta)","Priority Support 24/7"].map(t=>(
                <div key={t} style={{display:"flex",alignItems:"center",gap:10,fontSize:14,color:TX2}}>
                  <span style={{width:16,height:16,borderRadius:"50%",background:"rgba(212,168,67,0.08)",border:"1px solid rgba(212,168,67,0.14)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <svg width="7" height="7" viewBox="0 0 8 8"><polyline points="1,4 3,6 7,1.5" stroke={G} strokeWidth="1.4" fill="none"/></svg>
                  </span>
                  {t}
                </div>
              ))}
            </div>
            <Link href="/dashboard/premium?plan=dealer" className="gold-glow" style={{display:"block",textAlign:"center",padding:"13px",borderRadius:18,background:"transparent",color:G,fontSize:14,fontWeight:500,textDecoration:"none",border:`1px solid rgba(212,168,67,0.2)`}}>
              Händler werden ✦✦✦
            </Link>
          </div>
        </div>

        {/* Trust bar */}
        <div style={{display:"flex",justifyContent:"center",gap:"clamp(16px,3vw,36px)",flexWrap:"wrap",fontSize:12.5,color:TX3}}>
          {["🔒 Sicher via Stripe","↩ Jederzeit kündbar","⚡ Sofort aktiv","🇩🇪 DSGVO-konform"].map(t=>(
            <span key={t}>{t}</span>
          ))}
        </div>
      </section>

    </div>
  );
}
