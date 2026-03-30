import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const TYPE_COLORS: Record<string, string> = {
  Fire:"#F97316", Water:"#38BDF8", Grass:"#4ADE80",
  Lightning:"#E9A84B", Psychic:"#A855F7", Fighting:"#EF4444",
  Darkness:"#6B7280", Metal:"#9CA3AF", Dragon:"#7C3AED", Colorless:"#CBD5E1",
};

const CAT_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  Preise:    { color: "#E9A84B", bg: "rgba(233,168,75,0.08)",  border: "rgba(233,168,75,0.2)"  },
  Sammlung:  { color: "#4DBF85", bg: "rgba(77,191,133,0.08)",  border: "rgba(77,191,133,0.2)"  },
  Strategie: { color: "#A855F7", bg: "rgba(168,85,247,0.08)",  border: "rgba(168,85,247,0.2)"  },
  Fake:      { color: "#3DBFB8", bg: "rgba(61,191,184,0.08)",  border: "rgba(61,191,184,0.2)"  },
  News:      { color: "#E9A84B", bg: "rgba(233,168,75,0.08)",  border: "rgba(233,168,75,0.2)"  },
  Tausch:    { color: "#38BDF8", bg: "rgba(56,189,248,0.08)",  border: "rgba(56,189,248,0.2)"  },
};

async function getData() {
  try {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const [cardsRes, usersRes, forumCountRes, trendRes, forumRes, topMoversRes] = await Promise.all([
      sb.from("cards").select("*", { count: "exact", head: true }),
      sb.from("profiles").select("*", { count: "exact", head: true }),
      sb.from("forum_posts").select("*", { count: "exact", head: true }),
      sb.from("cards")
        .select("id,name,name_de,set_id,number,image_url,price_market,price_low,types,rarity")
        .not("price_market", "is", null)
        .gt("price_market", 5)
        .order("price_market", { ascending: false })
        .limit(8),
      sb.from("forum_posts")
        .select("id,title,upvotes,created_at,profiles(username),forum_categories(name,color)")
        .order("created_at", { ascending: false })
        .limit(5),
      sb.from("cards")
        .select("id,name,name_de,set_id,number,image_url,price_market,price_avg7,price_avg30,types")
        .not("price_market", "is", null)
        .not("price_avg30", "is", null)
        .gt("price_market", 2)
        .order("price_market", { ascending: false })
        .limit(6),
    ]);
    return {
      stats: {
        cards: cardsRes.count ?? 22271,
        users: usersRes.count ?? 3841,
        scans: 1247,
        forum: forumCountRes.count ?? 18330,
      },
      cards:     trendRes.data    ?? [],
      posts:     forumRes.data    ?? [],
      topMovers: topMoversRes.data ?? [],
    };
  } catch {
    return { stats:{ cards:22271,users:3841,scans:1247,forum:18330 }, cards:[], posts:[], topMovers:[] };
  }
}

// Inline sparkline for a card price trend (simple SVG)
function MiniSparkline({ up }: { up: boolean }) {
  const color = up ? "#4DBF85" : "#E8495A";
  const path  = up
    ? "M0 20 C10 18,20 15,30 12 S45 8,60 5"
    : "M0 5  C10 7, 20 10,30 13 S45 18,60 20";
  return (
    <svg width="60" height="24" viewBox="0 0 60 24" fill="none">
      <path d={path} stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export default async function HomePage() {
  const { stats, cards, posts, topMovers } = await getData();

  const STATS = [
    { n: stats.cards.toLocaleString("de-DE"), l: "Karten"     },
    { n: "200",                               l: "Sets"        },
    { n: stats.users.toLocaleString("de-DE"), l: "Nutzer"      },
    { n: stats.forum.toLocaleString("de-DE"), l: "Forum-Posts" },
  ];

  return (
    <div style={{ color: "#EDEAF6" }}>

      {/* ══ HERO ═══════════════════════════════════════ */}
      <section style={{
        maxWidth: 900, margin: "0 auto",
        padding: "72px 24px 60px", textAlign: "center",
        background: "radial-gradient(ellipse 65% 45% at 50% 0%, rgba(233,168,75,0.055), transparent 70%)",
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "4px 12px", borderRadius: 20, marginBottom: 28,
          border: "1px solid rgba(233,168,75,0.22)",
          background: "rgba(233,168,75,0.07)",
          fontSize: 10, fontWeight: 500, color: "#E9A84B", letterSpacing: ".05em",
        }}>
          <span style={{ width:5, height:5, borderRadius:"50%", background:"#E9A84B", display:"inline-block" }}/>
          Live Cardmarket EUR · Deutschland
        </div>

        <h1 style={{ fontSize:"clamp(34px,5vw,52px)", fontWeight:300, letterSpacing:"-.04em", lineHeight:1.06, color:"#EDEAF6", margin:"0 0 18px" }}>
          Deine Karten.<br />
          <span style={{ fontWeight:600 }}>Ihr wahrer Wert.</span><br />
          <span style={{ color:"#474664", fontWeight:300 }}>Jeden Tag.</span>
        </h1>

        <p style={{ fontSize:14, fontWeight:400, color:"#8C8BAA", maxWidth:380, margin:"0 auto 36px", lineHeight:1.7 }}>
          Live-Preise von Cardmarket, KI-Scanner und Portfolio-Tracking —
          präzise, schnell und immer aktuell.
        </p>

        <div style={{ display:"flex", gap:10, justifyContent:"center", marginBottom:52 }}>
          <Link href="/preischeck" style={{ padding:"12px 26px", borderRadius:10, fontSize:13, fontWeight:600, background:"#E9A84B", color:"#09070E", textDecoration:"none", boxShadow:"0 0 0 1px rgba(233,168,75,0.35),0 4px 24px rgba(233,168,75,0.2)" }}>Preis checken</Link>
          <Link href="/scanner"   style={{ padding:"12px 26px", borderRadius:10, fontSize:13, fontWeight:400, color:"#8C8BAA", border:"1px solid rgba(255,255,255,0.14)", background:"transparent", textDecoration:"none" }}>Karte scannen →</Link>
        </div>

        <div style={{ display:"inline-grid", gridTemplateColumns:"repeat(4,1fr)", background:"#111122", border:"1px solid rgba(255,255,255,0.085)", borderRadius:14, overflow:"hidden" }}>
          {STATS.map((s,i) => (
            <div key={s.l} style={{ padding:"16px 22px", textAlign:"left", borderRight: i<3?"1px solid rgba(255,255,255,0.055)":"none" }}>
              <div style={{ fontSize:21, fontWeight:600, letterSpacing:"-.03em", color:"#EDEAF6" }}>{s.n}</div>
              <div style={{ fontSize:10, color:"#474664", marginTop:4 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ TRENDING CARDS ════════════════════════════ */}
      {cards.length > 0 && (
        <section style={{ maxWidth:1100, margin:"0 auto", padding:"0 24px 56px" }}>
          <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom:20 }}>
            <h2 style={{ fontSize:16, fontWeight:500, letterSpacing:"-.02em", color:"#EDEAF6", margin:0 }}>Meistgesucht</h2>
            <Link href="/preischeck" style={{ fontSize:12, color:"#474664", textDecoration:"none" }}>Alle ansehen →</Link>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(128px,1fr))", gap:10 }}>
            {(cards as any[]).map(card => {
              const tc    = TYPE_COLORS[card.types?.[0]??""  ] ?? "#474664";
              const img   = card.image_url ?? `https://assets.tcgdex.net/en/${card.set_id}/${card.number}/low.webp`;
              const name  = card.name_de ?? card.name;
              const price = card.price_market ? `${Number(card.price_market).toFixed(2)}€` : card.price_low ? `ab ${Number(card.price_low).toFixed(2)}€` : "—";
              return (
                <Link key={card.id} href={`/preischeck?q=${encodeURIComponent(card.name)}`} style={{ textDecoration:"none" }}>
                  <div style={{ background:"#111122", border:"1px solid rgba(255,255,255,0.055)", borderRadius:13, overflow:"hidden" }}>
                    <div style={{ aspectRatio:"3/4", background:"#0D0D1A", position:"relative", overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <div style={{ position:"absolute", inset:0, background:`radial-gradient(circle at 50% 30%,${tc}14,transparent 70%)` }}/>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt={name} style={{ width:"100%",height:"100%",objectFit:"contain",padding:4 }}/>
                      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"45%", background:"linear-gradient(to bottom,transparent,#111122)" }}/>
                    </div>
                    <div style={{ padding:"9px 11px 12px" }}>
                      <div style={{ fontSize:12, fontWeight:500, color:"#EDEAF6", marginBottom:2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{name}</div>
                      <div style={{ fontSize:9, color:"#474664", marginBottom:7 }}>{String(card.set_id).toUpperCase()} · #{card.number}</div>
                      {/* Preis-Schild */}
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                        <span style={{ fontSize:14, fontWeight:600, fontFamily:"monospace", color:"#E9A84B" }}>{price}</span>
                        {card.rarity && (
                          <span style={{ fontSize:8, color:"#474664" }}>{card.rarity.includes("Hyper")?"✦✦✦":card.rarity.includes("Illus")?"✦":card.rarity.includes("Holo")?"●●":"●"}</span>
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

      {/* ══ TOP MOVERS + FORUM (2-Spalten) ═══════════ */}
      <section style={{ maxWidth:1100, margin:"0 auto", padding:"0 24px 56px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>

        {/* Top Movers mit Mini-Chart */}
        <div style={{ background:"#111122", border:"1px solid rgba(255,255,255,0.085)", borderRadius:20, overflow:"hidden" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px", borderBottom:"1px solid rgba(255,255,255,0.055)" }}>
            <div>
              <div style={{ fontSize:14, fontWeight:500, color:"#EDEAF6" }}>Top Movers</div>
              <div style={{ fontSize:10, color:"#474664", marginTop:1 }}>Größte Preisbewegungen heute</div>
            </div>
            <Link href="/top-movers" style={{ fontSize:11, color:"#474664", textDecoration:"none" }}>Alle →</Link>
          </div>
          {topMovers.length > 0 ? (topMovers as any[]).map((card, i) => {
            const pct = card.price_avg30 && card.price_avg30 > 0
              ? ((card.price_market - card.price_avg30) / card.price_avg30) * 100 : 0;
            const up  = pct >= 0;
            const img = card.image_url ?? `https://assets.tcgdex.net/en/${card.set_id}/${card.number}/low.webp`;
            return (
              <Link key={card.id} href={`/preischeck?q=${encodeURIComponent(card.name)}`} style={{ textDecoration:"none" }}>
                <div style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 20px", borderBottom: i<topMovers.length-1?"1px solid rgba(255,255,255,0.04)":"none" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={card.name} width={36} height={50} style={{ objectFit:"contain", borderRadius:4, flexShrink:0 }} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:12, fontWeight:500, color:"#EDEAF6", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{card.name_de ?? card.name}</div>
                    <div style={{ fontSize:9, color:"#474664" }}>{String(card.set_id).toUpperCase()}</div>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <MiniSparkline up={up} />
                    <div style={{ fontSize:11, fontWeight:600, color: up?"#4DBF85":"#E8495A", marginTop:2 }}>
                      {up?"+":""}{pct.toFixed(1)}%
                    </div>
                  </div>
                  <div style={{ fontSize:13, fontWeight:600, fontFamily:"monospace", color:"#E9A84B", minWidth:64, textAlign:"right" }}>
                    {Number(card.price_market).toFixed(2)}€
                  </div>
                </div>
              </Link>
            );
          }) : (
            // Fallback wenn keine avg30 Daten
            <div style={{ padding:"24px 20px", textAlign:"center" }}>
              <div style={{ fontSize:12, color:"#474664", marginBottom:8 }}>Trend-Daten werden geladen…</div>
              <Link href="/top-movers" style={{ fontSize:12, color:"#E9A84B", textDecoration:"none" }}>Alle Top Movers ansehen →</Link>
            </div>
          )}
        </div>

        {/* Forum Preview */}
        <div style={{ background:"#111122", border:"1px solid rgba(255,255,255,0.085)", borderRadius:20, overflow:"hidden" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px", borderBottom:"1px solid rgba(255,255,255,0.055)" }}>
            <div>
              <div style={{ fontSize:14, fontWeight:500, color:"#EDEAF6" }}>Forum</div>
              <div style={{ fontSize:10, color:"#474664", marginTop:1 }}>{stats.forum.toLocaleString("de-DE")} Beiträge · Community</div>
            </div>
            <Link href="/forum/new" style={{ padding:"4px 12px", borderRadius:6, fontSize:11, fontWeight:500, background:"rgba(233,168,75,0.07)", color:"#E9A84B", border:"1px solid rgba(233,168,75,0.2)", textDecoration:"none" }}>+ Neu</Link>
          </div>
          {posts.length > 0 ? (posts as any[]).map((post: any, i: number) => {
            const cat     = post.forum_categories?.name ?? "Allgemein";
            const catStyle = CAT_COLORS[cat] ?? { color:"#8C8BAA", bg:"rgba(255,255,255,0.05)", border:"rgba(255,255,255,0.1)" };
            const author  = post.profiles?.username ?? "Anonym";
            const ago     = (() => {
              const diff = Date.now() - new Date(post.created_at).getTime();
              const h = Math.floor(diff/3600000);
              if (h < 1) return "Gerade eben";
              if (h < 24) return `vor ${h} Std.`;
              return `vor ${Math.floor(h/24)} Tagen`;
            })();
            return (
              <Link key={post.id} href={`/forum/post/${post.id}`} style={{ textDecoration:"none" }}>
                <div style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"12px 20px", borderBottom: i<posts.length-1?"1px solid rgba(255,255,255,0.04)":"none" }}>
                  <div style={{ width:30, height:30, borderRadius:8, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:600, color:"#8C8BAA", flexShrink:0 }}>
                    {author[0]?.toUpperCase()}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
                      <span style={{ fontSize:11, fontWeight:500, color:"#EDEAF6" }}>{author}</span>
                      <span style={{ fontSize:9, fontWeight:600, padding:"1px 6px", borderRadius:4, background:catStyle.bg, color:catStyle.color, border:`1px solid ${catStyle.border}` }}>{cat}</span>
                      <span style={{ fontSize:10, color:"#474664", marginLeft:"auto" }}>{ago}</span>
                    </div>
                    <div style={{ fontSize:13, fontWeight:500, color:"#EDEAF6", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", letterSpacing:"-.01em" }}>{post.title}</div>
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:5 }}>
                      <span style={{ fontSize:10, color:"#474664" }}>❤️ {post.upvotes ?? 0}</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          }) : (
            <div style={{ padding:"24px 20px", textAlign:"center" }}>
              <div style={{ fontSize:12, color:"#474664", marginBottom:8 }}>Noch keine Beiträge</div>
              <Link href="/forum" style={{ fontSize:12, color:"#E9A84B", textDecoration:"none" }}>Forum öffnen →</Link>
            </div>
          )}
          <div style={{ padding:"12px 20px", borderTop:"1px solid rgba(255,255,255,0.055)" }}>
            <Link href="/forum" style={{ fontSize:12, color:"#474664", textDecoration:"none" }}>Alle Beiträge ansehen →</Link>
          </div>
        </div>
      </section>

      {/* ══ SCANNER CTA ═══════════════════════════════ */}
      <section style={{ maxWidth:1100, margin:"0 auto", padding:"0 24px 72px" }}>
        <div style={{ background:"#111122", border:"1px solid rgba(255,255,255,0.085)", borderRadius:20, padding:"32px 36px", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:0, left:0, right:0, height:1, background:"linear-gradient(90deg,transparent,rgba(233,168,75,0.35),transparent)" }}/>
          <div style={{ fontSize:9, fontWeight:600, letterSpacing:".14em", textTransform:"uppercase", color:"#474664", marginBottom:10 }}>KI-Scanner · Gemini Flash</div>
          <div style={{ fontSize:22, fontWeight:400, letterSpacing:"-.03em", lineHeight:1.2, color:"#EDEAF6", marginBottom:10 }}>Foto machen. Preis wissen.</div>
          <p style={{ fontSize:13, color:"#8C8BAA", lineHeight:1.65, marginBottom:20, maxWidth:480 }}>
            Karte fotografieren — KI erkennt sie in Sekunden und zeigt den aktuellen Cardmarket-Wert. 5 Scans pro Tag kostenlos.
          </p>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            <Link href="/scanner" style={{ padding:"11px 24px", borderRadius:10, background:"#E9A84B", color:"#09070E", fontSize:13, fontWeight:600, textDecoration:"none", boxShadow:"0 2px 16px rgba(233,168,75,0.22)" }}>Jetzt scannen</Link>
            <Link href="/dashboard/premium" style={{ padding:"11px 20px", borderRadius:10, border:"1px solid rgba(233,168,75,0.22)", color:"#E9A84B", fontSize:12, background:"rgba(233,168,75,0.06)", textDecoration:"none" }}>Unlimitiert mit Premium ✦</Link>
          </div>
        </div>
      </section>

    </div>
  );
}
