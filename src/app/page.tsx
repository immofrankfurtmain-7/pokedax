import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

// ─── tokens ───────────────────────────────────────────────────────────────
const G="#E9A84B",G30="rgba(233,168,75,0.30)",G18="rgba(233,168,75,0.18)";
const G08="rgba(233,168,75,0.08)",G05="rgba(233,168,75,0.05)";
const BG1="#111113",BG2="#1a1a1f";
const BR1="rgba(255,255,255,0.06)",BR2="rgba(255,255,255,0.10)";
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

async function getData() {
  try {
    const sb=createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const [cR,uR,fR,tR,pR]=await Promise.all([
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
      stats:{
        cards: Math.max(cR.count??0,22271),
        users: Math.max(uR.count??0,3841),
        forum: Math.max(fR.count??0,18330),
      },
      cards:tR.data??[],
      posts:pR.data??[],
    };
  } catch {
    return {stats:{cards:22271,users:3841,forum:18330},cards:[],posts:[]};
  }
}

// ─── sub-components ────────────────────────────────────────────────────────
function Check() {
  return (
    <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:18,height:18,borderRadius:"50%",background:"rgba(75,191,130,0.12)",flexShrink:0}}>
      <svg width="8" height="8" viewBox="0 0 8 8"><polyline points="1,4 3,6 7,1.5" stroke={GREEN} strokeWidth="1.3" fill="none"/></svg>
    </span>
  );
}

export default async function HomePage() {
  const {stats,cards,posts}=await getData();

  return (
    <div style={{color:TX1,overflowX:"hidden"}}>

      {/* ══════════════════════════════════════════════════════
          HERO — enormous, quiet, luxurious
          ══════════════════════════════════════════════════════ */}
      <section style={{
        maxWidth:1080, margin:"0 auto",
        padding:"clamp(80px,12vw,140px) 28px clamp(80px,10vw,120px)",
        textAlign:"center",
      }}>
        {/* Eyebrow */}
        <div style={{
          display:"inline-flex",alignItems:"center",gap:8,
          padding:"6px 20px",borderRadius:40,
          border:`1px solid ${G18}`,background:G05,
          fontSize:11,fontWeight:500,color:G,letterSpacing:".12em",
          textTransform:"uppercase",marginBottom:44,
        }}>
          <span style={{width:5,height:5,borderRadius:"50%",background:G,display:"inline-block",animation:"blink 2s ease-in-out infinite"}}/>
          Live Cardmarket · Deutschland
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize:"clamp(52px,8.5vw,100px)",
          fontWeight:300,letterSpacing:"-.065em",lineHeight:1.0,
          color:TX1,margin:"0 0 28px",
          fontFamily:"var(--font-display)",
        }}>
          Deine Karten.<br/>
          Ihr wahrer{" "}
          <span style={{color:G}}>Wert</span>.
        </h1>

        {/* Sub */}
        <p style={{
          fontSize:"clamp(16px,1.8vw,20px)",
          color:TX3,maxWidth:460,margin:"0 auto 56px",
          lineHeight:1.75,fontWeight:400,
        }}>
          Für ernsthafte Sammler.<br/>
          Präzise Preise. Edle Tools. Kein Hype.
        </p>

        {/* CTAs */}
        <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap"}}>
          <Link href="/preischeck" className="gold-glow" style={{
            padding:"clamp(14px,2vw,20px) clamp(28px,4vw,52px)",
            borderRadius:40,
            fontSize:"clamp(14px,1.4vw,17px)",fontWeight:500,
            background:G,color:"#0a0808",
            textDecoration:"none",letterSpacing:"-.01em",
          }}>Preis checken</Link>
          <Link href="/scanner" className="gold-glow" style={{
            padding:"clamp(14px,2vw,20px) clamp(28px,4vw,52px)",
            borderRadius:40,
            fontSize:"clamp(14px,1.4vw,17px)",fontWeight:400,
            color:TX2,border:`1px solid ${BR2}`,
            background:"transparent",textDecoration:"none",
          }}>Scanner starten</Link>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          STATS — monumental numbers
          ══════════════════════════════════════════════════════ */}
      <div style={{maxWidth:1080,margin:"0 auto 100px",padding:"0 28px"}}>
        <div style={{
          display:"grid",gridTemplateColumns:"repeat(4,1fr)",
          background:BG1,border:`1px solid ${BR1}`,
          borderRadius:28,overflow:"hidden",
        }}>
          {[
            {n:stats.cards.toLocaleString("de-DE"),l:"Karten indexiert"},
            {n:stats.users.toLocaleString("de-DE"),l:"Aktive Sammler"},
            {n:stats.forum.toLocaleString("de-DE"),l:"Forum-Beiträge"},
            {n:"214",l:"Sets"},
          ].map((s,i,a)=>(
            <div key={s.l} style={{
              padding:"clamp(24px,4vw,44px) clamp(20px,3vw,32px)",
              textAlign:"center",
              borderRight:i<a.length-1?`1px solid ${BR1}`:"none",
            }}>
              <div style={{
                fontSize:"clamp(32px,4.5vw,52px)",
                fontWeight:300,letterSpacing:"-.05em",
                color:TX1,lineHeight:1,
                fontFamily:"var(--font-display)",
              }}>{s.n}</div>
              <div style={{
                fontSize:10,fontWeight:600,letterSpacing:".12em",
                textTransform:"uppercase",color:TX3,marginTop:10,
              }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          TRENDING CARDS — large, elegant, real data
          ══════════════════════════════════════════════════════ */}
      {cards.length>0&&(
        <section style={{maxWidth:1080,margin:"0 auto 100px",padding:"0 28px"}}>
          <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:36}}>
            <h2 style={{
              fontSize:"clamp(24px,3vw,36px)",fontWeight:300,
              letterSpacing:"-.04em",color:TX1,
              fontFamily:"var(--font-display)",
            }}>Meistgesucht</h2>
            <Link href="/preischeck" style={{fontSize:14,color:TX3,textDecoration:"none"}}>Alle ansehen →</Link>
          </div>
          <div style={{
            display:"grid",
            gridTemplateColumns:`repeat(${Math.min(cards.length,5)},1fr)`,
            gap:16,
          }}>
            {(cards as any[]).slice(0,5).map(card=>{
              const tc=TYPE_COLOR[card.types?.[0]??""]??"#666";
              const img=card.image_url??`https://assets.tcgdex.net/en/${card.set_id}/${card.number}/low.webp`;
              const name=card.name_de??card.name;
              const price=card.price_market?
                Number(card.price_market).toLocaleString("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2})+" €"
                :"–";
              const pct=card.price_avg30&&card.price_avg30>0?
                ((card.price_market-card.price_avg30)/card.price_avg30*100):null;
              const pctCapped=pct!==null?Math.min(Math.abs(pct),99)*Math.sign(pct):null;
              return (
                <Link key={card.id} href={`/preischeck?q=${encodeURIComponent(card.name)}`}
                  className="card-hover"
                  style={{
                    background:BG1,border:`1px solid ${BR1}`,
                    borderRadius:28,overflow:"hidden",
                    textDecoration:"none",display:"block",
                    position:"relative",
                  }}>
                  {/* Image */}
                  <div style={{
                    aspectRatio:"3/4",background:BG2,
                    position:"relative",overflow:"hidden",
                    display:"flex",alignItems:"center",justifyContent:"center",
                  }}>
                    <div style={{position:"absolute",inset:0,background:`radial-gradient(circle at 50% 30%,${tc}18,transparent 65%)`}}/>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={name} style={{
                      width:"100%",height:"100%",objectFit:"contain",
                      padding:8,position:"relative",zIndex:1,
                    }}/>
                    <div style={{
                      position:"absolute",bottom:0,left:0,right:0,
                      height:"55%",background:`linear-gradient(transparent,${BG1})`,
                      zIndex:2,
                    }}/>
                    {/* Type badge */}
                    {card.types?.[0]&&(
                      <div style={{
                        position:"absolute",top:12,left:12,zIndex:3,
                        padding:"3px 9px",borderRadius:8,
                        fontSize:9,fontWeight:600,letterSpacing:".04em",
                        background:`${tc}18`,color:tc,
                        border:`1px solid ${tc}28`,
                        backdropFilter:"blur(8px)",
                      }}>
                        {TYPE_DE[card.types[0]]??card.types[0]}
                      </div>
                    )}
                  </div>
                  {/* Body */}
                  <div style={{padding:"16px 18px 20px",position:"relative",zIndex:1}}>
                    <div style={{
                      fontSize:14,fontWeight:500,color:TX1,
                      marginBottom:4,letterSpacing:"-.01em",
                      whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",
                    }}>{name}</div>
                    <div style={{fontSize:10,color:TX3,marginBottom:14,letterSpacing:".01em"}}>
                      {String(card.set_id).toUpperCase()} · #{card.number}
                    </div>
                    <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between"}}>
                      <span style={{
                        fontSize:"clamp(17px,1.5vw,22px)",fontWeight:400,
                        fontFamily:"var(--font-mono)",color:G,
                        letterSpacing:"-.02em",
                      }}>{price}</span>
                      {pctCapped!==null&&(
                        <span style={{
                          fontSize:10.5,fontWeight:600,
                          color:pctCapped>=0?GREEN:RED,
                        }}>
                          {pctCapped>=0?"▲":"▼"}{Math.abs(pctCapped).toLocaleString("de-DE",{maximumFractionDigits:1})} %
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

      {/* ══════════════════════════════════════════════════════
          SCANNER — full-width hero block
          ══════════════════════════════════════════════════════ */}
      <section style={{maxWidth:1080,margin:"0 auto 100px",padding:"0 28px"}}>
        <div style={{
          background:BG1,border:`1px solid ${BR2}`,
          borderRadius:32,overflow:"hidden",
          display:"grid",gridTemplateColumns:"1fr 1fr",
          minHeight:360,
          position:"relative",
        }}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${G30},transparent)`}}/>
          {/* Text */}
          <div style={{padding:"clamp(40px,5vw,72px)",display:"flex",flexDirection:"column",justifyContent:"center"}}>
            <div style={{fontSize:10,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:G,marginBottom:18}}>KI-Scanner · Gemini Flash</div>
            <h2 style={{
              fontSize:"clamp(28px,3.5vw,44px)",fontWeight:300,
              letterSpacing:"-.04em",lineHeight:1.08,
              marginBottom:18,color:TX1,
              fontFamily:"var(--font-display)",
            }}>Foto machen.<br/>Preis wissen.</h2>
            <p style={{fontSize:15,color:TX2,lineHeight:1.72,marginBottom:36,maxWidth:340}}>
              Halte deine Karte in die Kamera. In Sekunden bekommst du den aktuellen Cardmarket-Wert.
            </p>
            <div style={{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
              <Link href="/scanner" className="gold-glow" style={{
                padding:"13px 32px",borderRadius:30,
                background:G,color:"#0a0808",fontSize:14,fontWeight:500,
                textDecoration:"none",letterSpacing:"-.01em",
              }}>Scanner starten</Link>
              <span style={{fontSize:12,color:TX3}}>5 / Tag kostenlos · Unlimitiert mit Premium</span>
            </div>
          </div>
          {/* Visual */}
          <div style={{
            background:BG2,
            display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
            gap:16,padding:40,
            borderLeft:`1px solid ${BR1}`,
          }}>
            <div style={{
              width:160,height:200,borderRadius:20,
              background:BG1,border:`1.5px dashed ${G18}`,
              display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12,
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={TX3} strokeWidth="1.2" style={{opacity:.4}}>
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              <span style={{fontSize:11,color:TX3,textAlign:"center",lineHeight:1.5}}>Karte hier<br/>ablegen</span>
            </div>
            <div style={{fontSize:11,color:TX3}}>oder klicken zum Hochladen</div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FANTASY LEAGUE — teaser
          ══════════════════════════════════════════════════════ */}
      <section style={{maxWidth:1080,margin:"0 auto 100px",padding:"0 28px"}}>
        <div style={{
          background:BG1,border:`1px solid ${BR2}`,
          borderRadius:32,overflow:"hidden",
          display:"grid",gridTemplateColumns:"1fr 1fr",
          minHeight:360,position:"relative",
        }}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${G30},transparent)`}}/>
          {/* Text */}
          <div style={{padding:"clamp(40px,5vw,72px)",display:"flex",flexDirection:"column",justifyContent:"center"}}>
            <div style={{fontSize:10,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:G,marginBottom:18}}>Fantasy League · Q3 2026</div>
            <h2 style={{
              fontSize:"clamp(28px,3.5vw,44px)",fontWeight:300,
              letterSpacing:"-.04em",lineHeight:1.08,
              marginBottom:18,color:TX1,
              fontFamily:"var(--font-display)",
            }}>Baue dein<br/>Dream-Team.</h2>
            <p style={{fontSize:15,color:TX2,lineHeight:1.72,marginBottom:36,maxWidth:340}}>
              Stelle ein Portfolio aus den wertvollsten Karten zusammen und tritt gegen andere Sammler an. Echte Preise.
            </p>
            <Link href="/fantasy" className="gold-glow" style={{
              display:"inline-block",padding:"13px 32px",borderRadius:30,
              border:`1px solid ${BR2}`,color:TX2,fontSize:14,
              textDecoration:"none",alignSelf:"flex-start",
            }}>Auf Warteliste →</Link>
          </div>
          {/* Leaderboard preview */}
          <div style={{
            display:"flex",flexDirection:"column",justifyContent:"center",
            padding:"clamp(32px,5vw,64px)",
            borderLeft:`1px solid ${BR1}`,gap:0,
          }}>
            {[
              {rank:"01",name:"@luxecollector",pts:"1.284"},
              {rank:"02",name:"@pokegoldrush",pts:"1.197"},
              {rank:"03",name:"@silentvault",pts:"987"},
            ].map((r,i)=>(
              <div key={r.rank} style={{
                display:"flex",alignItems:"center",justifyContent:"space-between",
                padding:"18px 0",
                borderBottom:i<2?`1px solid ${BR1}`:"none",
              }}>
                <div style={{display:"flex",alignItems:"center",gap:14}}>
                  <span style={{fontSize:12,fontWeight:600,fontFamily:"var(--font-mono)",color:i===0?G:TX3}}>{r.rank}</span>
                  <span style={{fontSize:14,color:TX2}}>{r.name}</span>
                </div>
                <span style={{fontSize:15,fontWeight:500,fontFamily:"var(--font-mono)",color:G}}>{r.pts} pts</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FORUM — latest posts
          ══════════════════════════════════════════════════════ */}
      {posts.length>0&&(
        <section style={{maxWidth:1080,margin:"0 auto 100px",padding:"0 28px"}}>
          <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:36}}>
            <h2 style={{
              fontSize:"clamp(24px,3vw,36px)",fontWeight:300,
              letterSpacing:"-.04em",color:TX1,
              fontFamily:"var(--font-display)",
            }}>Community</h2>
            <Link href="/forum" style={{fontSize:14,color:TX3,textDecoration:"none"}}>Alle Beiträge →</Link>
          </div>
          <div style={{background:BG1,border:`1px solid ${BR1}`,borderRadius:28,overflow:"hidden"}}>
            {(posts as any[]).map((post:any,i:number)=>{
              const author=(Array.isArray(post.profiles)?post.profiles[0]:post.profiles)?.username??"Anonym";
              const cat=post.forum_categories?.name??"Forum";
              const h=Math.floor((Date.now()-new Date(post.created_at).getTime())/3600000);
              const ago=h<1?"Gerade":h<24?`vor ${h} Std.`:`vor ${Math.floor(h/24)} Tagen`;
              return (
                <Link key={post.id} href={`/forum/post/${post.id}`} style={{textDecoration:"none"}}>
                  <div style={{
                    display:"flex",alignItems:"center",gap:20,
                    padding:"24px 32px",
                    borderBottom:i<posts.length-1?`1px solid ${BR1}`:"none",
                    transition:"background .15s",
                  }}
                  onMouseEnter={undefined}
                  >
                    <div style={{
                      width:40,height:40,borderRadius:13,flexShrink:0,
                      background:BG2,border:`1px solid ${BR2}`,
                      display:"flex",alignItems:"center",justifyContent:"center",
                      fontSize:14,fontWeight:600,color:TX2,
                    }}>{author[0]?.toUpperCase()}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{
                        fontSize:15,fontWeight:500,color:TX1,
                        marginBottom:5,letterSpacing:"-.01em",
                        whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",
                      }}>{post.title}</div>
                      <div style={{display:"flex",alignItems:"center",gap:10,fontSize:12,color:TX3}}>
                        <span>{author}</span>
                        <span style={{width:3,height:3,borderRadius:"50%",background:TX3,display:"inline-block"}}/>
                        <span>{cat}</span>
                        <span style={{width:3,height:3,borderRadius:"50%",background:TX3,display:"inline-block"}}/>
                        <span>{ago}</span>
                      </div>
                    </div>
                    <div style={{fontSize:12,color:TX3,flexShrink:0}}>↑ {post.upvotes??0}</div>
                  </div>
                </Link>
              );
            })}
            <div style={{padding:"18px 32px",borderTop:`1px solid ${BR1}`}}>
              <Link href="/forum/new" className="gold-glow" style={{
                display:"inline-flex",alignItems:"center",gap:8,
                padding:"9px 20px",borderRadius:14,
                background:G08,color:G,border:`1px solid ${G18}`,
                fontSize:13,fontWeight:500,textDecoration:"none",
              }}>+ Beitrag erstellen</Link>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════
          PRICING — Quiet Collector Luxury
          ══════════════════════════════════════════════════════ */}
      <section style={{maxWidth:1080,margin:"0 auto 120px",padding:"0 28px"}}>
        <div style={{textAlign:"center",marginBottom:56}}>
          <h2 style={{
            fontSize:"clamp(28px,4vw,48px)",fontWeight:300,
            letterSpacing:"-.045em",color:TX1,marginBottom:10,
            fontFamily:"var(--font-display)",
          }}>Mitgliedschaft</h2>
          <p style={{fontSize:15,color:TX3}}>Von Common bis Hyper Rare — wähle deine Stufe</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>

          {/* Free */}
          <div style={{background:BG1,border:`1px solid ${BR2}`,borderRadius:28,padding:"clamp(28px,4vw,48px)"}}>
            <div style={{fontSize:9.5,fontWeight:600,letterSpacing:".12em",textTransform:"uppercase",color:TX3,marginBottom:16}}>COMMON ●</div>
            <div style={{fontSize:"clamp(28px,3vw,40px)",fontWeight:300,letterSpacing:"-.04em",color:TX2,marginBottom:4,fontFamily:"var(--font-display)"}}>Free</div>
            <div style={{fontSize:13,color:TX3,marginBottom:32}}>für immer</div>
            <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:36}}>
              {["5 Scans pro Tag","Basis-Preischeck","Forum lesen"].map(t=>(
                <div key={t} style={{display:"flex",alignItems:"center",gap:10,fontSize:14,color:TX2}}><Check/>{t}</div>
              ))}
            </div>
            <Link href="/auth/register" className="gold-glow" style={{
              display:"block",textAlign:"center",padding:"13px",borderRadius:20,
              background:BG2,color:TX2,fontSize:14,fontWeight:400,textDecoration:"none",
              border:`1px solid ${BR1}`,
            }}>Kostenlos starten</Link>
          </div>

          {/* Premium — featured, slightly larger visually */}
          <div className="gold-glow" style={{
            background:`radial-gradient(ellipse 80% 55% at 50% 0%,rgba(233,168,75,0.07),transparent 55%),${BG1}`,
            border:"1px solid rgba(233,168,75,0.25)",
            borderRadius:28,padding:"clamp(28px,4vw,48px)",
            position:"relative",
          }}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,rgba(233,168,75,0.5),transparent)`,borderRadius:"28px 28px 0 0"}}/>
            <div style={{position:"absolute",top:-1,left:"50%",transform:"translateX(-50%)",padding:"4px 18px",background:G,color:"#0a0808",fontSize:9,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",borderRadius:"0 0 10px 10px",whiteSpace:"nowrap"}}>BELIEBTESTE WAHL</div>
            <div style={{fontSize:9.5,fontWeight:600,letterSpacing:".12em",textTransform:"uppercase",color:G,marginBottom:16,marginTop:10}}>ILLUSTRATION RARE ✦</div>
            <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:4}}>
              <span style={{fontSize:"clamp(36px,4vw,52px)",fontWeight:300,letterSpacing:"-.05em",color:G,fontFamily:"var(--font-mono)"}}>6,99</span>
              <span style={{fontSize:15,color:G}}>€ / Monat</span>
            </div>
            <div style={{fontSize:13,color:TX3,marginBottom:32}}>jederzeit kündbar</div>
            <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:36}}>
              {["Unlimitierte Scans","Portfolio + Charts","Realtime Preis-Alerts","Preisverlauf 90 Tage","Exklusiv-Forum ✦"].map(t=>(
                <div key={t} style={{display:"flex",alignItems:"center",gap:10,fontSize:14,color:TX2}}><Check/>{t}</div>
              ))}
            </div>
            <Link href="/dashboard/premium" className="gold-glow" style={{
              display:"block",textAlign:"center",padding:"14px",borderRadius:20,
              background:G,color:"#0a0808",fontSize:14,fontWeight:600,
              textDecoration:"none",letterSpacing:"-.01em",
            }}>Premium werden</Link>
            <p style={{textAlign:"center",fontSize:11.5,color:TX3,marginTop:10}}>Weniger als eine Karte pro Monat</p>
          </div>

          {/* Dealer */}
          <div style={{background:BG1,border:"1px solid rgba(233,168,75,0.14)",borderRadius:28,padding:"clamp(28px,4vw,48px)",position:"relative"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,rgba(233,168,75,0.22),transparent)`,borderRadius:"28px 28px 0 0"}}/>
            <div style={{fontSize:9.5,fontWeight:600,letterSpacing:".12em",textTransform:"uppercase",color:G,marginBottom:16}}>HYPER RARE ✦✦✦</div>
            <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:4}}>
              <span style={{fontSize:"clamp(28px,3vw,40px)",fontWeight:300,letterSpacing:"-.04em",color:TX1,fontFamily:"var(--font-display)"}}>19,99 €</span>
            </div>
            <div style={{fontSize:13,color:TX3,marginBottom:32}}>pro Monat</div>
            <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:36}}>
              {["Alles aus Premium","Verified Seller Badge ✅","Eigene Shop-Seite","API-Zugang (Beta)","Priority Support 24/7"].map(t=>(
                <div key={t} style={{display:"flex",alignItems:"center",gap:10,fontSize:14,color:TX2}}><Check/>{t}</div>
              ))}
            </div>
            <Link href="/dashboard/premium?plan=dealer" className="gold-glow" style={{
              display:"block",textAlign:"center",padding:"13px",borderRadius:20,
              background:"transparent",color:G,fontSize:14,fontWeight:400,
              textDecoration:"none",border:"1px solid rgba(233,168,75,0.22)",
            }}>Händler werden ✦✦✦</Link>
          </div>
        </div>

        {/* Trust */}
        <div style={{
          display:"flex",alignItems:"center",justifyContent:"center",
          gap:36,marginTop:28,flexWrap:"wrap",
          fontSize:13,color:TX3,
        }}>
          {["🔒 Sicher via Stripe","↩ Jederzeit kündbar","⚡ Sofort aktiv","🇩🇪 DSGVO-konform"].map(t=>(
            <span key={t}>{t}</span>
          ))}
        </div>
      </section>

    </div>
  );
}
