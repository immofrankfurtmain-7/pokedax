"use client";

import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const G="#E9A84B",G18="rgba(233,168,75,0.18)",G06="rgba(233,168,75,0.06)";
const B2="#101020",B1="#0C0C1A",B3="#161628";
const T1="#EDEAF6",T2="#8A89A8",T3="#454462";
const BR1="rgba(255,255,255,0.048)",BR2="rgba(255,255,255,0.080)";

const TYPE_COLOR: Record<string,string> = {
  Fire:"#F97316",Water:"#38BDF8",Grass:"#4ADE80",Lightning:"#E9A84B",
  Psychic:"#A855F7",Fighting:"#EF4444",Darkness:"#6B7280",Metal:"#9CA3AF",
  Dragon:"#7C3AED",Colorless:"#CBD5E1",
};

const CAT_STYLE: Record<string,{c:string,bg:string,br:string}> = {
  Preise:    {c:G,      bg:"rgba(233,168,75,0.07)",  br:G18},
  Sammlung:  {c:"#4BBF82",bg:"rgba(75,191,130,0.07)",br:"rgba(75,191,130,0.15)"},
  Strategie: {c:"#A855F7",bg:"rgba(168,85,247,0.07)",br:"rgba(168,85,247,0.15)"},
  News:      {c:G,      bg:"rgba(233,168,75,0.07)",  br:G18},
  Tausch:    {c:"#38BDF8",bg:"rgba(56,189,248,0.07)",br:"rgba(56,189,248,0.15)"},
  "Fake-Check":{c:"#3BBDB6",bg:"rgba(59,189,182,0.07)",br:"rgba(59,189,182,0.15)"},
};

function Divider() {
  return <div style={{ height:1, background:BR1, margin:"0 24px" }}/>;
}

function Check() {
  return (
    <div style={{ width:14,height:14,borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(75,191,130,0.12)" }}>
      <svg width="7" height="7" viewBox="0 0 8 8"><polyline points="1,4 3,6 7,1.5" stroke="#4BBF82" strokeWidth="1.3" fill="none"/></svg>
    </div>
  );
}

async function getData() {
  try {
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
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
      stats:{cards:cR.count??22271,users:uR.count??3841,scans:1247,forum:fR.count??18330},
      cards:tR.data??[],posts:pR.data??[],
    };
  } catch {
    return {stats:{cards:22271,users:3841,scans:1247,forum:18330},cards:[],posts:[]};
  }
}

export default async function HomePage() {
  const {stats,cards,posts} = await getData();

  return (
    <div style={{color:T1,maxWidth:1100,margin:"0 auto"}}>

      {/* ── HERO ─────────────────────────────────────── */}
      <section style={{
        padding:"92px 28px 76px",textAlign:"center",
        background:`radial-gradient(ellipse 58% 42% at 50% -6%,rgba(233,168,75,0.055),transparent 60%)`,
      }}>
        <div style={{display:"inline-flex",alignItems:"center",gap:6,padding:"4px 14px",borderRadius:20,marginBottom:32,border:`1px solid ${G18}`,background:G06,fontSize:10,fontWeight:500,color:G,letterSpacing:".05em"}}>
          <span style={{width:5,height:5,borderRadius:"50%",background:G,display:"inline-block",animation:"blink 2s ease-in-out infinite"}}/>
          Live Cardmarket EUR · Deutschland
        </div>
        <h1 style={{fontSize:"clamp(38px,5.8vw,58px)",fontWeight:300,letterSpacing:"-.045em",lineHeight:1.04,color:T1,margin:"0 0 20px"}}>
          Dein wahrer<br/>
          <span style={{fontWeight:560}}>Sammlungswert.</span><br/>
          <span style={{color:T3,fontWeight:300}}>Jeden Tag.</span>
        </h1>
        <p style={{fontSize:15,fontWeight:400,color:T2,maxWidth:390,margin:"0 auto 44px",lineHeight:1.72,letterSpacing:"-.003em"}}>
          Live-Preise von Cardmarket, KI-Scanner und Portfolio-Tracking — präzise, schnell, in Echtzeit.
        </p>
        <div style={{display:"flex",gap:10,justifyContent:"center",marginBottom:60}}>
          <Link href="/preischeck" style={{padding:"13px 30px",borderRadius:12,fontSize:14,fontWeight:600,letterSpacing:"-.015em",background:G,color:"#09070E",textDecoration:"none",boxShadow:`0 0 0 1px rgba(233,168,75,0.3),0 4px 28px rgba(233,168,75,0.2)`}}>Preis checken</Link>
          <Link href="/scanner" style={{padding:"13px 30px",borderRadius:12,fontSize:14,fontWeight:400,color:T2,border:`1px solid rgba(255,255,255,0.125)`,background:"transparent",textDecoration:"none"}}>Karte scannen →</Link>
        </div>
        <div style={{display:"inline-grid",gridTemplateColumns:"repeat(4,1fr)",background:B2,border:`1px solid ${BR2}`,borderRadius:14,overflow:"hidden"}}>
          {[
            {n:stats.cards.toLocaleString("de-DE"),l:"Karten"},
            {n:"200",l:"Sets"},
            {n:stats.users.toLocaleString("de-DE"),l:"Nutzer"},
            {n:stats.forum.toLocaleString("de-DE"),l:"Forum-Posts"},
          ].map((s,i,a)=>(
            <div key={s.l} style={{padding:"18px 26px",textAlign:"left",borderRight:i<a.length-1?`1px solid ${BR1}`:"none"}}>
              <div style={{fontSize:23,fontWeight:550,letterSpacing:"-.035em",color:T1,lineHeight:1}}>{s.n}</div>
              <div style={{fontSize:10,color:T3,marginTop:5}}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      <Divider/>

      {/* ── TRENDING CARDS ───────────────────────────── */}
      {cards.length>0 && (
        <section style={{padding:"40px 24px"}}>
          <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:20}}>
            <h2 style={{fontSize:15,fontWeight:500,letterSpacing:"-.02em",color:T1,margin:0}}>Meistgesucht</h2>
            <Link href="/preischeck" style={{fontSize:12,color:T3,textDecoration:"none"}}>Alle ansehen →</Link>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(118px,1fr))",gap:8}}>
            {(cards as any[]).map(card=>{
              const tc=TYPE_COLOR[card.types?.[0]??""]??"#474664";
              const img=card.image_url??`https://assets.tcgdex.net/en/${card.set_id}/${card.number}/low.webp`;
              const name=card.name_de??card.name;
              const price=card.price_market?`${Number(card.price_market).toFixed(2)}€`:card.price_low?`ab ${Number(card.price_low).toFixed(2)}€`:"—";
              const pct=card.price_avg30&&card.price_avg30>0?((card.price_market-card.price_avg30)/card.price_avg30*100):null;
              const isHyper=card.rarity?.includes("Hyper");
              const isIllus=card.rarity?.includes("Illus");
              const dotCount=isHyper?6:isIllus?4:card.rarity?.includes("Holo")?3:2;
              return (
                <Link key={card.id} href={`/preischeck?q=${encodeURIComponent(card.name)}`} style={{textDecoration:"none"}}>
                  <div style={{background:B2,border:`1px solid ${BR1}`,borderRadius:13,overflow:"hidden",transition:"transform .24s cubic-bezier(.16,1,.3,1),border-color .24s,box-shadow .24s"}}
                    onMouseEnter={e=>{const d=e.currentTarget as HTMLDivElement;d.style.transform="translateY(-3px)";d.style.borderColor="rgba(233,168,75,0.16)";d.style.boxShadow="0 16px 44px rgba(0,0,0,0.55),0 0 28px rgba(233,168,75,0.05)";}}
                    onMouseLeave={e=>{const d=e.currentTarget as HTMLDivElement;d.style.transform="translateY(0)";d.style.borderColor=BR1;d.style.boxShadow="none";}}>
                    <div style={{aspectRatio:"3/4",background:B1,position:"relative",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <div style={{position:"absolute",inset:0,background:`radial-gradient(circle at 50% 28%,${tc}11,transparent 68%)`}}/>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt={name} style={{width:"100%",height:"100%",objectFit:"contain",padding:4}}/>
                      <div style={{position:"absolute",bottom:0,left:0,right:0,height:"52%",background:`linear-gradient(transparent,${B2})`}}/>
                    </div>
                    <div style={{padding:"11px 12px 13px"}}>
                      <div style={{display:"flex",gap:3,marginBottom:6}}>
                        {Array.from({length:dotCount}).map((_,i)=>(
                          <div key={i} style={{width:4,height:4,borderRadius:"50%",background:tc,opacity:i>=dotCount-2?1:0.4,boxShadow:i>=dotCount-2?`0 0 5px ${tc}80`:undefined}}/>
                        ))}
                      </div>
                      <div style={{fontSize:12,fontWeight:500,color:T1,marginBottom:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",letterSpacing:"-.01em"}}>{name}</div>
                      <div style={{fontSize:9,color:T3,marginBottom:7,letterSpacing:".01em"}}>{String(card.set_id).toUpperCase()} · #{card.number}</div>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                        <span style={{fontSize:14.5,fontWeight:550,fontFamily:"'DM Mono',monospace",color:G,letterSpacing:"-.02em"}}>{price}</span>
                        {pct!==null&&<span style={{fontSize:9.5,fontWeight:600,color:pct>=0?"#4BBF82":"#E04558"}}>{pct>=0?"▲":"▼"}{Math.abs(pct).toFixed(1)}%</span>}
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

      {/* ── SCANNER + PORTFOLIO ──────────────────────── */}
      <section style={{padding:"40px 24px"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>

          {/* Scanner */}
          <div style={{background:B2,border:`1px solid ${BR2}`,borderRadius:20,padding:"26px 26px",display:"grid",gridTemplateColumns:"1fr 118px",gap:20,alignItems:"center",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,rgba(233,168,75,0.35),transparent)`}}/>
            <div>
              <div style={{fontSize:9,fontWeight:600,letterSpacing:".13em",textTransform:"uppercase",color:T3,marginBottom:9}}>KI-Scanner · Gemini Flash</div>
              <div style={{fontSize:20,fontWeight:400,letterSpacing:"-.03em",lineHeight:1.22,marginBottom:9,color:T1}}>Foto machen.<br/>Preis wissen.</div>
              <div style={{fontSize:12,color:T2,lineHeight:1.65,marginBottom:15}}>KI erkennt deine Karte in Sekunden und zeigt den aktuellen Cardmarket-Wert.</div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{padding:"3px 10px",borderRadius:5,fontSize:10,fontWeight:500,background:G06,color:G,border:`1px solid ${G18}`}}>5 / Tag Free</span>
                <span style={{fontSize:10,color:T3}}>Unlimitiert mit Premium ✦</span>
              </div>
            </div>
            <div>
              <Link href="/scanner" style={{
                display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
                gap:9,aspectRatio:"1",borderRadius:14,
                background:B1,border:"1px dashed rgba(233,168,75,0.16)",
                textDecoration:"none",
                transition:"border-color .22s cubic-bezier(.16,1,.3,1),background .22s,transform .22s",
              }}
              onMouseEnter={e=>{const d=e.currentTarget as HTMLElement;d.style.borderColor="rgba(233,168,75,0.28)";d.style.background="rgba(233,168,75,0.04)";d.style.transform="scale(1.012)";}}
              onMouseLeave={e=>{const d=e.currentTarget as HTMLElement;d.style.borderColor="rgba(233,168,75,0.16)";d.style.background=B1;d.style.transform="scale(1)";}}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={T3} strokeWidth="1.5" style={{opacity:.5}}>
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
                </svg>
                <span style={{fontSize:9.5,color:T3,textAlign:"center",lineHeight:1.5}}>Foto ablegen<br/>oder klicken</span>
              </Link>
              <Link href="/scanner" style={{
                display:"block",textAlign:"center",padding:"11px",borderRadius:10,
                background:G,color:"#09070E",fontSize:12.5,fontWeight:600,
                letterSpacing:"-.01em",textDecoration:"none",marginTop:9,
                boxShadow:"0 2px 16px rgba(233,168,75,0.2)",
                transition:"box-shadow .2s,transform .2s",
              }}
              onMouseEnter={e=>{const d=e.currentTarget as HTMLElement;d.style.boxShadow="0 4px 26px rgba(233,168,75,0.35)";d.style.transform="translateY(-1px)";}}
              onMouseLeave={e=>{const d=e.currentTarget as HTMLElement;d.style.boxShadow="0 2px 16px rgba(233,168,75,0.2)";d.style.transform="translateY(0)";}}>
                Jetzt scannen
              </Link>
            </div>
          </div>

          {/* Portfolio */}
          <div style={{background:B2,border:`1px solid ${BR2}`,borderRadius:20,padding:22,position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,rgba(233,168,75,0.3),transparent)`}}/>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
              <div>
                <div style={{fontSize:10,color:T3,marginBottom:5}}>Gesamtwert Portfolio</div>
                <div style={{fontSize:42,fontWeight:550,letterSpacing:"-.05em",color:T1,lineHeight:1}}>2.847€</div>
                <div style={{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 10px",borderRadius:5,marginTop:7,fontSize:11,fontWeight:500,color:"#4BBF82",background:"rgba(75,191,130,0.08)",border:"1px solid rgba(75,191,130,0.15)"}}>▲ +18,4% · 30 Tage</div>
              </div>
              <div style={{display:"flex",gap:2}}>
                {["7T","30T","90T"].map((t,i)=>(
                  <div key={t} style={{padding:"3px 9px",borderRadius:5,fontSize:10.5,fontWeight:500,color:i===1?T1:T3,background:i===1?"#1E1E38":"transparent",cursor:"pointer"}}>{t}</div>
                ))}
              </div>
            </div>
            <svg width="100%" height="56" viewBox="0 0 600 56" preserveAspectRatio="none" style={{margin:"16px 0 0",display:"block"}}>
              <defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#E9A84B" stopOpacity=".22"/><stop offset="100%" stopColor="#E9A84B" stopOpacity="0"/></linearGradient></defs>
              <path d="M0 43 C55 41,85 38,125 33 S180 24,220 19 S278 14,318 12 S372 8,412 6 S465 3,505 2 S562 1,600 0 L600 56 L0 56Z" fill="url(#sg)"/>
              <path d="M0 43 C55 41,85 38,125 33 S180 24,220 19 S278 14,318 12 S372 8,412 6 S465 3,505 2 S562 1,600 0" fill="none" stroke="#E9A84B" strokeWidth="1.5" opacity=".7"/>
            </svg>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:7,marginTop:12}}>
              {[{l:"Karten",v:"47"},{l:"Bester Gewinn",v:"+340€",c:"#4BBF82"},{l:"Wunschliste",v:"12"}].map(s=>(
                <div key={s.l} style={{background:B1,border:`1px solid ${BR1}`,borderRadius:10,padding:"11px 13px"}}>
                  <div style={{fontSize:9.5,color:T3,marginBottom:4}}>{s.l}</div>
                  <div style={{fontSize:15,fontWeight:550,letterSpacing:"-.02em",color:s.c??T1}}>{s.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Divider/>

      {/* ── FORUM ────────────────────────────────────── */}
      <section style={{padding:"40px 24px"}}>
        <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:16}}>
          <h2 style={{fontSize:15,fontWeight:500,letterSpacing:"-.02em",color:T1,margin:0}}>Forum</h2>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <span style={{fontSize:10,color:T3}}>{stats.forum.toLocaleString("de-DE")} Beiträge</span>
            <Link href="/forum/new" style={{padding:"4px 12px",borderRadius:6,fontSize:11,fontWeight:500,background:G06,color:G,border:`1px solid ${G18}`,textDecoration:"none"}}>+ Beitrag</Link>
          </div>
        </div>
        <div style={{background:B2,border:`1px solid ${BR2}`,borderRadius:20,overflow:"hidden"}}>
          {posts.length>0?(posts as any[]).map((post:any,i:number)=>{
            const cat=post.forum_categories?.name??"Allgemein";
            const cs=CAT_STYLE[cat]??{c:T2,bg:"rgba(255,255,255,0.05)",br:"rgba(255,255,255,0.1)"};
            const author=post.profiles?.username??"Anonym";
            const diff=Date.now()-new Date(post.created_at).getTime();
            const h=Math.floor(diff/3600000);
            const ago=h<1?"Gerade eben":h<24?`vor ${h} Std.`:`vor ${Math.floor(h/24)} Tagen`;
            return (
              <Link key={post.id} href={`/forum/post/${post.id}`} style={{textDecoration:"none"}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:14,padding:"18px 24px",borderBottom:i<posts.length-1?"1px solid rgba(255,255,255,0.038)":"none",transition:"background .1s",cursor:"pointer"}}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background="rgba(255,255,255,0.015)";}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="transparent";}}>
                  <div style={{width:32,height:32,borderRadius:9,background:"#1E1E38",border:"1px solid rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:600,color:T2,flexShrink:0,marginTop:1}}>
                    {author[0]?.toUpperCase()}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:5,flexWrap:"wrap"}}>
                      <span style={{fontSize:12,fontWeight:500,color:T1}}>{author}</span>
                      <span style={{fontSize:9,fontWeight:600,padding:"1px 7px",borderRadius:4,background:cs.bg,color:cs.c,border:`1px solid ${cs.br}`,letterSpacing:".04em"}}>{cat}</span>
                      <span style={{fontSize:10,color:T3,marginLeft:"auto"}}>{ago}</span>
                    </div>
                    <div style={{fontSize:13.5,fontWeight:500,color:T1,marginBottom:4,letterSpacing:"-.013em",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{post.title}</div>
                    <div style={{display:"flex",gap:12,marginTop:2}}>
                      <span style={{fontSize:10,color:T3}}>
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2" style={{verticalAlign:"middle",marginRight:3}}><path d="M10 2H2C1.4 2 1 2.4 1 3v5c0 .6.4 1 1 1h1l1.5 1.5L6 9h4c.6 0 1-.4 1-1V3c0-.6-.4-1-1-1z"/></svg>
                        {post.upvotes??0} Upvotes
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          }):(
            <div style={{padding:"32px",textAlign:"center"}}>
              <div style={{fontSize:13,color:T3,marginBottom:10}}>Noch keine Beiträge</div>
              <Link href="/forum" style={{fontSize:12,color:G,textDecoration:"none"}}>Forum öffnen →</Link>
            </div>
          )}
          <div style={{padding:"13px 24px",borderTop:`1px solid ${BR1}`}}>
            <Link href="/forum" style={{fontSize:12,color:T3,textDecoration:"none"}}>Alle Beiträge ansehen →</Link>
          </div>
        </div>
      </section>

      <Divider/>

      {/* ── PRICING ──────────────────────────────────── */}
      <section style={{padding:"40px 24px"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <h2 style={{fontSize:15,fontWeight:500,letterSpacing:"-.02em",color:T1,margin:"0 0 6px"}}>Mitgliedschaft wählen</h2>
          <p style={{fontSize:12,color:T3}}>Von Common bis Hyper Rare ✦✦✦</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>

          {/* Free */}
          <div style={{background:B2,border:`1px solid ${BR2}`,borderRadius:20,padding:22}}>
            <div style={{fontSize:9,fontWeight:600,letterSpacing:".08em",color:T3,marginBottom:11}}>COMMON ●</div>
            <div style={{fontSize:18,fontWeight:550,letterSpacing:"-.022em",color:T2,marginBottom:4}}>Free</div>
            <div style={{fontSize:32,fontWeight:550,letterSpacing:"-.04em",lineHeight:1,color:T1}}>0€</div>
            <div style={{fontSize:11,color:T3,marginBottom:15}}>für immer</div>
            <hr style={{border:"none",borderTop:`1px solid ${BR1}`,margin:"15px 0"}}/>
            <div style={{display:"flex",justifyContent:"center",gap:4,marginBottom:15}}>
              <div style={{width:4,height:4,borderRadius:"50%",background:G}}/>
              {[1,2,3,4].map(i=><div key={i} style={{width:4,height:4,borderRadius:"50%",background:BR1+"ff"}}/>)}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:20}}>
              {[["5 Scans/Tag"],["Basis-Preischeck"],["Forum lesen"]].map(([t])=>(
                <div key={t} style={{display:"flex",alignItems:"center",gap:8,fontSize:11.5,color:T2}}><Check/>{t}</div>
              ))}
              {[["Portfolio-Tracker"],["Preis-Alerts"]].map(([t])=>(
                <div key={t} style={{display:"flex",alignItems:"center",gap:8,fontSize:11.5,color:T3,textDecoration:"line-through"}}>
                  <div style={{width:14,height:14,borderRadius:"50%",flexShrink:0,background:B1}}/>
                  {t}
                </div>
              ))}
            </div>
            <Link href="/auth/register" style={{display:"block",textAlign:"center",padding:"10.5px",borderRadius:10,background:B3,color:T2,fontSize:12.5,fontWeight:600,textDecoration:"none"}}>Kostenlos starten</Link>
          </div>

          {/* Premium */}
          <div style={{
            background:`radial-gradient(ellipse 80% 50% at 50% 0%,rgba(233,168,75,0.06),transparent 60%),${B2}`,
            border:"1px solid rgba(233,168,75,0.2)",borderRadius:20,padding:22,position:"relative",
          }}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,rgba(233,168,75,0.45),transparent)`,borderRadius:"20px 20px 0 0"}}/>
            <div style={{position:"absolute",top:-1,left:"50%",transform:"translateX(-50%)",padding:"3px 14px",background:G,color:"#09070E",fontSize:8,fontWeight:700,letterSpacing:".08em",borderRadius:"0 0 7px 7px",whiteSpace:"nowrap"}}>BELIEBTESTE WAHL</div>
            <div style={{fontSize:9,fontWeight:600,letterSpacing:".08em",color:G,marginBottom:11,marginTop:8}}>ILLUSTRATION RARE ✦</div>
            <div style={{fontSize:18,fontWeight:550,letterSpacing:"-.022em",color:G,marginBottom:4}}>Premium</div>
            <div style={{fontSize:32,fontWeight:550,letterSpacing:"-.04em",lineHeight:1,color:G}}>6,99€</div>
            <div style={{fontSize:11,color:T3,marginBottom:15}}>pro Monat · jederzeit kündbar</div>
            <hr style={{border:"none",borderTop:`1px solid rgba(233,168,75,0.1)`,margin:"15px 0"}}/>
            <div style={{display:"flex",justifyContent:"center",gap:4,marginBottom:15}}>
              {[0,1,2,3].map(i=><div key={i} style={{width:4,height:4,borderRadius:"50%",background:G,opacity:i===3?1:0.5,boxShadow:i===3?"0 0 7px rgba(233,168,75,0.4)":undefined}}/>)}
              <div style={{width:4,height:4,borderRadius:"50%",background:BR1+"ff"}}/>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:20}}>
              {["Unlimitierter Scanner","Portfolio + Charts","Realtime Preis-Alerts","Exklusiv-Forum ✦","Grading-Beratung 2×/Mo"].map(t=>(
                <div key={t} style={{display:"flex",alignItems:"center",gap:8,fontSize:11.5,color:T2}}><Check/>{t}</div>
              ))}
            </div>
            <Link href="/dashboard/premium" style={{display:"block",textAlign:"center",padding:"10.5px",borderRadius:10,background:G,color:"#09070E",fontSize:12.5,fontWeight:700,textDecoration:"none",boxShadow:"0 3px 16px rgba(233,168,75,0.22)"}}>Premium werden ✦</Link>
          </div>

          {/* Dealer */}
          <div style={{background:B2,border:"1px solid rgba(233,168,75,0.12)",borderRadius:20,padding:22,position:"relative"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,rgba(233,168,75,0.2),transparent)`,borderRadius:"20px 20px 0 0"}}/>
            <div style={{fontSize:9,fontWeight:600,letterSpacing:".08em",color:G,marginBottom:11}}>HYPER RARE ✦✦✦</div>
            <div style={{fontSize:18,fontWeight:550,letterSpacing:"-.022em",color:T1,marginBottom:4}}>Händler</div>
            <div style={{fontSize:32,fontWeight:550,letterSpacing:"-.04em",lineHeight:1,color:T1}}>19,99€</div>
            <div style={{fontSize:11,color:T3,marginBottom:15}}>pro Monat</div>
            <hr style={{border:"none",borderTop:"1px solid rgba(233,168,75,0.07)",margin:"15px 0"}}/>
            <div style={{display:"flex",justifyContent:"center",gap:4,marginBottom:15}}>
              {[0,1,2,3,4,5].map(i=><div key={i} style={{width:4,height:4,borderRadius:"50%",background:G,opacity:i>=4?1:0.4,boxShadow:i>=4?"0 0 7px rgba(233,168,75,0.4)":undefined}}/>)}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:20}}>
              {["Alles aus Premium","Verified Seller Badge ✅","Eigene Shop-Seite","API-Zugang (Beta)","Priority Support 24/7"].map(t=>(
                <div key={t} style={{display:"flex",alignItems:"center",gap:8,fontSize:11.5,color:T2}}><Check/>{t}</div>
              ))}
            </div>
            <Link href="/dashboard/premium?plan=dealer" style={{display:"block",textAlign:"center",padding:"10.5px",borderRadius:10,background:"transparent",color:G,fontSize:12.5,fontWeight:600,textDecoration:"none",border:"1px solid rgba(233,168,75,0.18)"}}>Händler werden ✦✦✦</Link>
          </div>
        </div>
        <p style={{textAlign:"center",color:T3,fontSize:11,marginTop:16}}>Alle Preise inkl. MwSt. · Monatlich kündbar · Sichere Zahlung via Stripe</p>
      </section>

    </div>
  );
}
