import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const G="#E9A84B",G18="rgba(233,168,75,0.18)",G08="rgba(233,168,75,0.08)",G05="rgba(233,168,75,0.05)";
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

async function getData() {
  try {
    const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const [cR,uR,fR,tR,pR]=await Promise.all([
      sb.from("cards").select("*",{count:"exact",head:true}),
      sb.from("profiles").select("*",{count:"exact",head:true}),
      sb.from("forum_posts").select("*",{count:"exact",head:true}),
      sb.from("cards").select("id,name,name_de,set_id,number,image_url,price_market,price_avg30,types,rarity")
        .not("price_market","is",null).gt("price_market",5)
        .order("price_market",{ascending:false}).limit(5),
      sb.from("forum_posts")
        .select("id,title,upvotes,created_at,profiles(username),forum_categories(name)")
        .order("created_at",{ascending:false}).limit(3),
    ]);
    return {
      stats:{
        cards:Math.max(cR.count??0,22271),
        users:Math.max(uR.count??0,3841),
        forum:Math.max(fR.count??0,18330),
      },
      cards:tR.data??[],
      posts:pR.data??[],
    };
  } catch {
    return {stats:{cards:22271,users:3841,forum:18330},cards:[],posts:[]};
  }
}

function Check() {
  return (
    <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:20,height:20,borderRadius:"50%",background:"rgba(75,191,130,0.12)",flexShrink:0}}>
      <svg width="8" height="8" viewBox="0 0 8 8"><polyline points="1,4 3,6 7,1.5" stroke={GREEN} strokeWidth="1.4" fill="none"/></svg>
    </span>
  );
}

export default async function HomePage() {
  const {stats,cards,posts}=await getData();

  return (
    <div style={{color:TX1}}>

      {/* ══ HERO ═══════════════════════════════════════════════════ */}
      <section style={{
        paddingTop:"clamp(96px,12vw,192px)",
        paddingBottom:"clamp(96px,14vw,224px)",
        textAlign:"center",
        maxWidth:1000,
        margin:"0 auto",
        padding:"clamp(96px,12vw,192px) 24px clamp(96px,14vw,224px)",
      }}>
        {/* Eyebrow */}
        <div style={{
          display:"inline-flex",alignItems:"center",gap:8,
          padding:"8px 24px",borderRadius:40,
          border:`1px solid rgba(233,168,75,0.15)`,
          background:"rgba(233,168,75,0.05)",
          fontSize:11,fontWeight:500,color:G,
          letterSpacing:".14em",textTransform:"uppercase",
          marginBottom:64,
        }}>
          Live Cardmarket · Deutschland
        </div>

        {/* Headline — exact reference sizing */}
        <h1 style={{
          fontFamily:"var(--font-display)",
          fontSize:"clamp(56px,9vw,109px)",
          fontWeight:300,
          letterSpacing:"-.115em",
          lineHeight:1.0,
          color:TX1,
          marginBottom:32,
        }}>
          Deine Karten.<br/>
          Ihr wahrer <span style={{color:G}}>Wert</span>.
        </h1>

        {/* Sub */}
        <p style={{
          fontSize:"clamp(18px,2.2vw,23px)",
          color:"#a0a0b0",
          maxWidth:600,
          margin:"0 auto",
          lineHeight:1.4,
        }}>
          Für Sammler, die ihre Karten ernst nehmen.<br/>
          Präzise. Zeitlos. Respektvoll.
        </p>

        {/* CTAs — exact reference: px-16 py-8 text-2xl */}
        <div style={{
          display:"flex",gap:24,justifyContent:"center",
          marginTop:"clamp(64px,9vw,112px)",
          flexWrap:"wrap",
        }}>
          <Link href="/preischeck" className="gold-glow" style={{
            padding:"clamp(16px,2vw,32px) clamp(36px,5vw,64px)",
            borderRadius:30,
            fontSize:"clamp(16px,1.8vw,24px)",fontWeight:600,
            background:G,color:"#0a0808",
            textDecoration:"none",letterSpacing:"-.01em",
          }}>Preis checken</Link>
          <Link href="/scanner" className="gold-glow" style={{
            padding:"clamp(16px,2vw,32px) clamp(36px,5vw,64px)",
            borderRadius:30,
            fontSize:"clamp(16px,1.8vw,24px)",fontWeight:500,
            color:TX1,border:"1px solid rgba(255,255,255,0.3)",
            background:"transparent",textDecoration:"none",
          }}>Karte scannen</Link>
        </div>
      </section>

      {/* ══ STATS — free-floating, monumental ══════════════════════ */}
      <div style={{
        maxWidth:1200,margin:"0 auto 208px",
        padding:"0 24px",
      }}>
        <div style={{
          display:"flex",flexWrap:"wrap",
          justifyContent:"center",
          gap:"clamp(40px,5vw,112px)",
          rowGap:64,
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
                fontSize:"clamp(48px,7vw,84px)",
                fontWeight:300,
                letterSpacing:"-.07em",
                color:TX1,
                lineHeight:1,
              }}>{s.n}</div>
              <div style={{
                fontSize:10,fontWeight:600,
                letterSpacing:"3.5px",
                textTransform:"uppercase",
                color:TX3,
                marginTop:32,
              }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ SCANNER ════════════════════════════════════════════════ */}
      <section style={{maxWidth:1200,margin:"0 auto 160px",padding:"0 24px"}}>
        <div style={{
          background:BG1,border:`1px solid ${BR1}`,
          borderRadius:32,
          padding:"clamp(48px,6vw,80px)",
          display:"flex",alignItems:"center",
          gap:"clamp(40px,6vw,80px)",
          flexWrap:"wrap",
        }}>
          <div style={{flex:1,minWidth:280}}>
            <div style={{fontSize:10,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:G,marginBottom:32}}>KI-Scanner</div>
            <h2 style={{
              fontFamily:"var(--font-display)",
              fontSize:"clamp(36px,5vw,64px)",
              fontWeight:300,letterSpacing:"-.085em",
              lineHeight:1.05,
              marginBottom:40,color:TX1,
            }}>Foto machen.<br/>Preis wissen.</h2>
            <p style={{fontSize:"clamp(16px,1.6vw,22px)",color:TX2,maxWidth:400,lineHeight:1.6,marginBottom:64}}>
              Halte deine Karte vor die Kamera. In Sekunden erhältst du den aktuellen Marktwert.
            </p>
            <Link href="/scanner" className="gold-glow" style={{
              display:"inline-block",
              padding:"clamp(14px,1.8vw,28px) clamp(28px,3.5vw,56px)",
              borderRadius:30,fontSize:"clamp(15px,1.5vw,22px)",fontWeight:500,
              color:TX1,border:"1px solid rgba(255,255,255,0.3)",
              textDecoration:"none",
            }}>Scanner starten</Link>
          </div>
          <div style={{
            flex:1,minWidth:280,
            background:"#050505",
            border:`1px solid ${BR1}`,
            borderRadius:24,
            aspectRatio:"16/10",
            display:"flex",alignItems:"center",justifyContent:"center",
          }}>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:56,marginBottom:16}}>📸</div>
              <div style={{fontSize:16,color:TX2,marginBottom:12}}>Karte wird erkannt...</div>
              <div style={{fontSize:14,color:GREEN,fontWeight:500}}>Glurak ex erkannt · 189,90 €</div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FANTASY LEAGUE ═════════════════════════════════════════ */}
      <section style={{maxWidth:1200,margin:"0 auto 160px",padding:"0 24px"}}>
        <div style={{
          background:BG1,border:`1px solid ${BR1}`,
          borderRadius:32,
          padding:"clamp(48px,6vw,80px)",
        }}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"clamp(40px,6vw,80px)",alignItems:"center"}}>
            <div>
              <div style={{fontSize:10,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:G,marginBottom:32}}>Fantasy League</div>
              <h2 style={{
                fontFamily:"var(--font-display)",
                fontSize:"clamp(32px,4.5vw,60px)",
                fontWeight:300,letterSpacing:"-.085em",
                lineHeight:1.05,marginBottom:40,color:TX1,
              }}>Baue dein 1.000 € Team.<br/>Gewinne mit realen Kursen.</h2>
              <p style={{fontSize:"clamp(15px,1.5vw,22px)",color:TX2,maxWidth:420,lineHeight:1.65,marginBottom:64}}>
                Kaufe virtuelle Karten und sammle Punkte durch reale Preisveränderungen. Monatliche Preise und exklusive Trophy Cards.
              </p>
              <Link href="/fantasy" className="gold-glow" style={{
                display:"inline-block",
                padding:"clamp(14px,1.8vw,28px) clamp(28px,3.5vw,56px)",
                borderRadius:30,fontSize:"clamp(15px,1.5vw,22px)",fontWeight:600,
                background:G,color:"#0a0808",textDecoration:"none",
              }}>Jetzt Team aufstellen →</Link>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:0}}>
              {[
                {name:"@luxecollector",pts:"1.284"},
                {name:"@pokegoldrush",pts:"1.197"},
                {name:"@silentvault",  pts:"987"},
              ].map((r,i)=>(
                <div key={r.name} style={{
                  display:"flex",alignItems:"center",justifyContent:"space-between",
                  padding:"24px 0",
                  borderBottom:i<2?`1px solid ${BR1}`:"none",
                }}>
                  <div style={{fontSize:"clamp(15px,1.4vw,20px)",fontWeight:500,color:TX1}}>{r.name}</div>
                  <div style={{fontFamily:"var(--font-mono)",fontSize:"clamp(18px,2vw,30px)",color:G}}>{r.pts} pts</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ FORUM TEASER ═══════════════════════════════════════════ */}
      <section style={{maxWidth:1200,margin:"0 auto 160px",padding:"0 24px"}}>
        <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:40}}>
          <h2 style={{
            fontFamily:"var(--font-display)",
            fontSize:"clamp(24px,3vw,38px)",
            fontWeight:300,letterSpacing:"-.04em",color:TX1,
          }}>Was die Community gerade diskutiert</h2>
          <Link href="/forum" style={{fontSize:14,color:TX2,textDecoration:"none"}}>Alle Beiträge →</Link>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20}}>
          {posts.length>0
            ?(posts as any[]).map((post:any)=>{
              const cat=(post.forum_categories?.name??"Forum") as string;
              const h=Math.floor((Date.now()-new Date(post.created_at).getTime())/3600000);
              const ago=h<1?"Gerade":h<24?`vor ${h} Std.`:`vor ${Math.floor(h/24)} T.`;
              return (
                <Link key={post.id} href={`/forum/post/${post.id}`} className="card-hover" style={{
                  background:BG1,border:`1px solid ${BR1}`,
                  borderRadius:28,padding:32,
                  textDecoration:"none",display:"block",
                }}>
                  <div style={{fontSize:10.5,fontWeight:600,letterSpacing:".06em",textTransform:"uppercase",color:G,marginBottom:16}}>{cat}</div>
                  <div style={{fontSize:"clamp(15px,1.3vw,18px)",color:TX1,lineHeight:1.45,marginBottom:32}}>{post.title}</div>
                  <div style={{fontSize:11,color:TX3}}>↑ {post.upvotes??0} · {ago}</div>
                </Link>
              );
            })
            :[
              {cat:"Preise",     title:"Ist der Preis von Moonbreon schon überhitzt oder lohnt sich noch ein Einstieg?", meta:"↑ 142 · vor 2 Std."},
              {cat:"Sammlung",   title:"Welche Karten aus Scarlet & Violet sind langfristig die besten Investments?",    meta:"↑ 89 · vor 5 Std."},
              {cat:"Strategie",  title:"Wie baut man ein starkes Fantasy League Team für die kommende Saison?",          meta:"↑ 67 · vor 11 Std."},
            ].map(p=>(
              <Link key={p.cat} href="/forum" className="card-hover" style={{
                background:BG1,border:`1px solid ${BR1}`,
                borderRadius:28,padding:32,textDecoration:"none",display:"block",
              }}>
                <div style={{fontSize:10.5,fontWeight:600,letterSpacing:".06em",textTransform:"uppercase",color:G,marginBottom:16}}>{p.cat}</div>
                <div style={{fontSize:18,color:TX1,lineHeight:1.45,marginBottom:32}}>{p.title}</div>
                <div style={{fontSize:11,color:TX3}}>{p.meta}</div>
              </Link>
            ))
          }
        </div>
      </section>

      {/* ══ PORTFOLIO + WELCOME ════════════════════════════════════ */}
      <section style={{maxWidth:1200,margin:"0 auto 160px",padding:"0 24px"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
          {/* Portfolio */}
          <div style={{background:BG1,border:`1px solid ${BR1}`,borderRadius:32,padding:"clamp(40px,5vw,64px)"}}>
            <div style={{fontSize:10,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:TX3,marginBottom:24}}>Dein Portfolio</div>
            <div style={{fontFamily:"var(--font-display)",fontSize:"clamp(42px,5.5vw,72px)",fontWeight:300,letterSpacing:"-.07em",color:TX1,lineHeight:1}}>4.872 €</div>
            <div style={{fontSize:"clamp(16px,1.8vw,24px)",color:GREEN,marginTop:8}}>+27,3 % diese Saison</div>
            <Link href="/portfolio" className="gold-glow" style={{
              display:"inline-block",marginTop:48,
              padding:"clamp(12px,1.5vw,20px) clamp(24px,3vw,40px)",
              borderRadius:26,fontSize:"clamp(14px,1.3vw,18px)",fontWeight:500,
              color:TX1,border:"1px solid rgba(255,255,255,0.3)",
              textDecoration:"none",
            }}>Portfolio ansehen</Link>
          </div>
          {/* Welcome / Premium CTA */}
          <div style={{background:BG1,border:`1px solid ${BR1}`,borderRadius:32,padding:"clamp(40px,5vw,64px)",display:"flex",flexDirection:"column",justifyContent:"center"}}>
            <div style={{fontSize:10,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:G,marginBottom:32}}>Willkommen bei pokédax</div>
            <h2 style={{
              fontFamily:"var(--font-display)",
              fontSize:"clamp(24px,3vw,44px)",
              fontWeight:300,letterSpacing:"-.08em",
              color:TX1,marginBottom:24,lineHeight:1.1,
            }}>Hier sind deine Karten in guten Händen.</h2>
            <p style={{fontSize:"clamp(15px,1.4vw,20px)",color:TX2,lineHeight:1.7,marginBottom:48}}>
              Mit Premium erhältst du unlimitierte Scans, vollständiges Portfolio-Tracking, Preis-Alerts und exklusiven Zugang zur Community der ernsthaften Sammler.
            </p>
            <Link href="/dashboard/premium" className="gold-glow" style={{
              display:"inline-block",alignSelf:"flex-start",
              padding:"clamp(12px,1.5vw,20px) clamp(24px,3vw,40px)",
              borderRadius:26,fontSize:"clamp(14px,1.3vw,18px)",fontWeight:600,
              background:G,color:"#0a0808",textDecoration:"none",
            }}>Premium werden</Link>
          </div>
        </div>
      </section>

    </div>
  );
}
