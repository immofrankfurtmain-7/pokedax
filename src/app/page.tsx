"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const T  = "#00B8A8";  // Teal — primary accent
const TL = "rgba(0,184,168,0.15)";
const T8 = "rgba(0,184,168,0.08)";
const T4 = "rgba(0,184,168,0.04)";
const GH = "#EFD7A8";  // Champagne — prices only
const BG = "#0A0A0C";
const B1 = "#16161A";
const B2 = "#1C1C21";
const B3 = "#222228";
const R1 = "rgba(255,255,255,0.04)";
const R2 = "rgba(255,255,255,0.08)";
const R3 = "rgba(255,255,255,0.12)";
const TX = "#F8F6F2";
const T2 = "#BEB9B0";
const T3 = "#6E6B66";
const GR = "#3db87a";
const RD = "#dc4a5a";

const SB = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Card { id:string; name:string; name_de:string; set_id:string; number:string; price_market:number; price_avg7:number; image_url:string|null; change:number; rarity:string|null; }

function TrendingCard({ card }: { card: Card }) {
  const up = card.change >= 0;
  const imgSrc = card.image_url
    ? (card.image_url.includes(".") ? card.image_url : card.image_url + "/low.webp")
    : null;
  return (
    <Link href={`/preischeck/${card.id}`} style={{ textDecoration:"none", flexShrink:0, width:140 }}>
      <div style={{
        background: B1,
        border: `1px solid ${up ? "rgba(61,184,122,0.18)" : R2}`,
        borderRadius: 16,
        overflow: "hidden",
        transition: "transform .2s, border-color .2s",
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLElement).style.borderColor = up ? "rgba(61,184,122,0.35)" : "rgba(0,184,168,0.3)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.borderColor = up ? "rgba(61,184,122,0.18)" : R2; }}>
        {/* Card image with padding */}
        <div style={{ padding: "8px 8px 0", background: B2 }}>
          <div style={{ height: 96, borderRadius: 10, overflow: "hidden", background: B3, display:"flex", alignItems:"center", justifyContent:"center" }}>
            {imgSrc
              ? <img src={imgSrc} alt="" style={{ width:"100%", height:"100%", objectFit:"contain" }} onError={e=>{(e.target as HTMLImageElement).style.display="none"}}/>
              : <span style={{ fontSize:28, opacity:.2, color:T3 }}>◎</span>
            }
          </div>
        </div>
        {/* Info */}
        <div style={{ padding: "8px 10px 10px" }}>
          <div style={{ fontSize:11, fontWeight:500, color:TX, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", marginBottom:2 }}>
            {card.name_de || card.name}
          </div>
          <div style={{ fontSize:9, color:T3, marginBottom:6, textTransform:"uppercase", letterSpacing:".06em" }}>
            {card.set_id}
          </div>
          <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between" }}>
            <span style={{ fontSize:13, fontFamily:"var(--font-mono)", fontWeight:400, color:GH }}>
              {card.price_market.toLocaleString("de-DE", { minimumFractionDigits:2 })} €
            </span>
            <span style={{ fontSize:10, fontWeight:600, color: up ? GR : RD }}>
              {up ? "▲" : "▼"} {Math.abs(card.change).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div style={{ textAlign:"center" }}>
      <div style={{ fontSize:"clamp(32px,4vw,52px)", fontWeight:200, letterSpacing:"-.05em", color:GH, lineHeight:1, fontFamily:"var(--font-display)" }}>{n}</div>
      <div style={{ fontSize:11, color:T3, marginTop:4 }}>{label}</div>
    </div>
  );
}

export default function HomePage() {
  const [trending, setTrending] = useState<Card[]>([]);
  const [posts,    setPosts]    = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [stats,    setStats]    = useState({ cards: 22400, sets: 214, users: 0 });
  const [loaded,   setLoaded]   = useState(false);

  useEffect(() => {
    async function load() {
      const { data: cards } = await SB.from("cards")
        .select("id,name,name_de,set_id,number,price_market,price_avg7,image_url,rarity")
        .not("price_market","is",null)
        .not("price_avg7","is",null)
        .gt("price_market", 2)
        .order("price_market", { ascending: false })
        .limit(80);

      if (cards?.length) {
        const withChange = cards.map((c:any) => ({
          ...c, change: ((c.price_market - c.price_avg7) / c.price_avg7 * 100)
        }));
        const top = [...withChange].sort((a,b) => b.change - a.change).slice(0, 10);
        setTrending(top);
      }

      const { data: fp } = await SB.from("forum_posts")
        .select("id,title,upvotes,created_at,forum_categories(name)")
        .eq("is_deleted", false)
        .order("created_at", { ascending: false })
        .limit(4);
      setPosts((fp??[]).map((p:any) => ({...p, forum_categories: Array.isArray(p.forum_categories)?p.forum_categories[0]:p.forum_categories})));

      const { data: ml } = await SB.from("marketplace_listings")
        .select(`price,cards!marketplace_listings_card_id_fkey(name,name_de,image_url,price_market),profiles!marketplace_listings_user_id_fkey(username)`)
        .eq("is_active", true).eq("type","offer")
        .order("created_at", { ascending: false }).limit(4);
      setListings((ml??[]).map((l:any) => ({...l, cards:Array.isArray(l.cards)?l.cards[0]:l.cards, profiles:Array.isArray(l.profiles)?l.profiles[0]:l.profiles})));

      const [{ count: uc }, { count: cc }, { count: sc }] = await Promise.all([
        SB.from("profiles").select("id",{count:"exact",head:true}),
        SB.from("cards").select("id",{count:"exact",head:true}),
        SB.from("sets").select("id",{count:"exact",head:true}),
      ]);
      setStats({ cards: cc ?? 22400, sets: sc ?? 214, users: uc ?? 0 });
      setLoaded(true);
    }
    load();
  }, []);

  return (
    <div style={{ color: TX, background: BG }}>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(80px,12vw,160px) clamp(20px,4vw,48px) clamp(48px,6vw,80px)" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr auto", gap: 48, alignItems:"center" }}>

          {/* Left: headline */}
          <div>
            <div style={{
              display:"inline-flex", alignItems:"center", gap:8,
              padding:"5px 14px", borderRadius:40,
              border:`0.5px solid ${TL}`, background: T4,
              fontSize:10, fontWeight:600, color:T,
              letterSpacing:".1em", textTransform:"uppercase", marginBottom:28,
            }}>
              <span style={{ width:5, height:5, borderRadius:"50%", background:T, display:"inline-block", animation:"pulse 2s ease-in-out infinite" }}/>
              Live · Cardmarket Deutschland
            </div>

            <h1 style={{
              fontFamily:"var(--font-display)",
              fontSize:"clamp(44px,6.5vw,88px)",
              fontWeight:200, letterSpacing:"-.07em",
              lineHeight: 0.92, marginBottom: 24, color: TX,
            }}>
              Deine Karten.<br/>
              <span style={{ color: T }}>Ihr Wert.</span>
            </h1>

            <p style={{ fontSize:"clamp(14px,1.5vw,17px)", color:T3, maxWidth:380, lineHeight:1.85, fontWeight:300, marginBottom:36 }}>
              Scanner. Preise. Marktplatz. Community.<br/>
              Für Sammler die es ernst meinen.
            </p>

            <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
              <Link href="/scanner" style={{
                padding:"13px 28px", borderRadius:14,
                background: T, color: BG,
                fontSize:14, fontWeight:500,
                textDecoration:"none",
                boxShadow:`0 0 32px rgba(0,184,168,0.25)`,
                letterSpacing:"-.01em",
              }}>Karte scannen</Link>
              <Link href="/preischeck" style={{
                padding:"13px 24px", borderRadius:14,
                background:"transparent", color:T2,
                fontSize:14, fontWeight:400,
                textDecoration:"none", border:`0.5px solid ${R3}`,
                letterSpacing:"-.01em",
              }}>Preischeck</Link>
            </div>
          </div>

          {/* Right: stats floating */}
          <div style={{ display:"flex", flexDirection:"column", gap:24, paddingRight:8 }}>
            <Stat n={loaded ? (stats.cards.toLocaleString("de-DE") + "+") : "…"} label="Karten" />
            <div style={{ width:1, height:24, background:R2, margin:"0 auto" }}/>
            <Stat n={loaded ? String(stats.sets) : "…"} label="Sets" />
            <div style={{ width:1, height:24, background:R2, margin:"0 auto" }}/>
            <Stat n={loaded && stats.users > 0 ? String(stats.users) : "Live"} label={loaded && stats.users > 0 ? "Sammler" : "Preise"} />
          </div>
        </div>
      </section>

      {/* ── TRENDING HORIZONTAL SCROLL ───────────────────────── */}
      <section style={{ maxWidth:1200, margin:"0 auto", padding:"0 clamp(20px,4vw,48px) clamp(56px,7vw,88px)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div>
            <div style={{ fontSize:9, fontWeight:600, letterSpacing:".14em", textTransform:"uppercase", color:T3, marginBottom:4 }}>Trending heute</div>
            <div style={{ fontSize:18, fontWeight:300, letterSpacing:"-.03em", color:TX }}>Top Karten im Anstieg</div>
          </div>
          <Link href="/preischeck?sort=trend_desc" style={{ fontSize:12, color:T3, textDecoration:"none", border:`0.5px solid ${R2}`, padding:"6px 14px", borderRadius:8 }}>
            Alle ansehen →
          </Link>
        </div>

        {/* Horizontal scroll */}
        <div style={{
          display:"flex", gap:10, overflowX:"auto", paddingBottom:8,
          scrollSnapType:"x mandatory",
          msOverflowStyle:"none", scrollbarWidth:"none",
        }}>
          {trending.length > 0
            ? trending.map(c => <TrendingCard key={c.id} card={c} />)
            : Array.from({length:6}).map((_,i) => (
              <div key={i} style={{ width:140, height:188, borderRadius:16, background:B1, border:`1px solid ${R2}`, flexShrink:0, opacity:.3, animation:"skeleton-pulse 1.5s ease-in-out infinite" }}/>
            ))
          }
        </div>
      </section>

      {/* ── FEATURES GRID ────────────────────────────────────── */}
      <section style={{ maxWidth:1200, margin:"0 auto", padding:"0 clamp(20px,4vw,48px) clamp(56px,7vw,88px)" }}>
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <div style={{ fontSize:9, fontWeight:600, letterSpacing:".14em", textTransform:"uppercase", color:T3, marginBottom:12 }}>Features</div>
          <h2 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(24px,3.5vw,42px)", fontWeight:200, letterSpacing:"-.05em", color:TX }}>
            Alles für ernsthafte Sammler.
          </h2>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:8 }}>
          {[
            { icon:"⊙", title:"KI-Scanner",       desc:"Karte fotografieren — sofort Marktwert. Powered by Gemini.",     href:"/scanner",     accent: true },
            { icon:"◈", title:"Preischeck",        desc:"Live-Daten. 22.000+ Karten. 7 & 30-Tage-Trend.",                href:"/preischeck",  accent: false },
            { icon:"◎", title:"Escrow-Marktplatz", desc:"Sicher kaufen & verkaufen. Geld erst bei Erhalt frei.",          href:"/marketplace", accent: true },
            { icon:"◇", title:"Portfolio",         desc:"Wert live. Preisverlauf. CSV-Export.",                            href:"/dashboard/portfolio", accent: false },
            { icon:"◉", title:"Wishlist",          desc:"Wunschkarte merken — Auto-Alert bei Wunschpreis.",               href:"/dashboard/wishlist", accent: false },
            { icon:"⇄", title:"Vergleich",         desc:"Zwei Karten nebeneinander. Preis, Typ, Stats.",                  href:"/compare",     accent: false },
          ].map(({icon, title, desc, href, accent}) => (
            <Link key={href} href={href} style={{ textDecoration:"none" }}>
              <div style={{
                background: accent ? `linear-gradient(135deg, ${T4}, ${B1})` : B1,
                border: `1px solid ${accent ? TL : R2}`,
                borderRadius:18, padding:"20px 22px",
                transition:"transform .2s, border-color .2s",
                height:"100%",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.borderColor = TL; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.borderColor = accent ? TL : R2; }}>
                <div style={{ fontSize:20, color: T, marginBottom:14, opacity:.9 }}>{icon}</div>
                <div style={{ fontSize:14, fontWeight:500, color:TX, marginBottom:6 }}>{title}</div>
                <div style={{ fontSize:12, color:T3, lineHeight:1.75 }}>{desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── LIVE ACTIVITY ────────────────────────────────────── */}
      <section style={{ maxWidth:1200, margin:"0 auto", padding:"0 clamp(20px,4vw,48px) clamp(56px,7vw,88px)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:20 }}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:GR, animation:"pulse 2s ease-in-out infinite", display:"inline-block" }}/>
          <span style={{ fontSize:9, fontWeight:600, letterSpacing:".12em", textTransform:"uppercase", color:T3 }}>Live-Aktivität</span>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>

          {/* Forum */}
          <div style={{ background:B1, border:`1px solid ${R2}`, borderRadius:18, overflow:"hidden" }}>
            <div style={{ padding:"14px 16px", borderBottom:`0.5px solid ${R1}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:13, fontWeight:500, color:TX }}>Community</span>
              <Link href="/forum" style={{ fontSize:11, color:T3, textDecoration:"none" }}>Forum →</Link>
            </div>
            {posts.length > 0 ? posts.map(p => (
              <Link key={p.id} href={`/forum/post/${p.id}`} style={{
                textDecoration:"none", display:"flex", alignItems:"center",
                gap:10, padding:"10px 16px", borderBottom:`0.5px solid ${R1}`,
              }}
              onMouseEnter={e=>(e.currentTarget.style.background=B2)}
              onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                <span style={{ width:5, height:5, borderRadius:"50%", background:T, flexShrink:0, opacity:.5 }}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12, color:TX, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.title}</div>
                  <div style={{ fontSize:10, color:T3 }}>{p.forum_categories?.name ?? "Forum"}</div>
                </div>
                <span style={{ fontSize:10, color:T3, flexShrink:0 }}>↑{p.upvotes??0}</span>
              </Link>
            )) : Array.from({length:4}).map((_,i) => (
              <div key={i} style={{ height:54, borderBottom:`0.5px solid ${R1}`, opacity:.2, animation:"skeleton-pulse 1.5s ease-in-out infinite" }}/>
            ))}
            <Link href="/forum/new" style={{ display:"block", padding:"10px 16px", fontSize:11, color:T, textDecoration:"none", textAlign:"center", borderTop:`0.5px solid ${R1}` }}>
              + Beitrag erstellen
            </Link>
          </div>

          {/* Marketplace */}
          <div style={{ background:B1, border:`1px solid ${R2}`, borderRadius:18, overflow:"hidden" }}>
            <div style={{ padding:"14px 16px", borderBottom:`0.5px solid ${R1}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:13, fontWeight:500, color:TX }}>Neueste Angebote</span>
              <Link href="/marketplace" style={{ fontSize:11, color:T3, textDecoration:"none" }}>Marktplatz →</Link>
            </div>
            {listings.length > 0 ? listings.map((l,i) => {
              const card = l.cards;
              const imgSrc = card?.image_url ? (card.image_url.includes(".") ? card.image_url : card.image_url + "/low.webp") : null;
              const isDeal = l.price && card?.price_market && l.price < card.price_market * 0.95;
              return (
                <Link key={i} href="/marketplace" style={{
                  textDecoration:"none", display:"flex", alignItems:"center",
                  gap:10, padding:"10px 16px", borderBottom:`0.5px solid ${R1}`,
                }}
                onMouseEnter={e=>(e.currentTarget.style.background=B2)}
                onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                  <div style={{ width:28, height:38, borderRadius:5, background:B2, overflow:"hidden", flexShrink:0, border:`0.5px solid ${R2}` }}>
                    {imgSrc && <img src={imgSrc} alt="" style={{ width:"100%", height:"100%", objectFit:"contain" }}/>}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:12, color:TX, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{card?.name_de||card?.name||"Karte"}</div>
                    <div style={{ fontSize:10, color:T3 }}>@{l.profiles?.username||"Anonym"}</div>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    {isDeal && <div style={{ fontSize:8, fontWeight:700, color:T, marginBottom:2 }}>DEAL</div>}
                    <div style={{ fontSize:13, fontFamily:"var(--font-mono)", color: isDeal ? T : GH }}>{l.price?.toFixed(2)} €</div>
                  </div>
                </Link>
              );
            }) : Array.from({length:4}).map((_,i) => (
              <div key={i} style={{ height:58, borderBottom:`0.5px solid ${R1}`, opacity:.2, animation:"skeleton-pulse 1.5s ease-in-out infinite" }}/>
            ))}
            <Link href="/marketplace" style={{ display:"block", padding:"10px 16px", fontSize:11, color:T, textDecoration:"none", textAlign:"center", borderTop:`0.5px solid ${R1}` }}>
              + Karte inserieren
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section style={{ maxWidth:680, margin:"0 auto", padding:"0 clamp(20px,4vw,48px) clamp(80px,10vw,140px)" }}>
        <div style={{
          background:`linear-gradient(135deg, rgba(0,184,168,0.08), ${B1})`,
          border:`1px solid ${TL}`, borderRadius:24,
          padding:"clamp(36px,5vw,56px) clamp(28px,5vw,52px)",
          textAlign:"center", position:"relative", overflow:"hidden",
        }}>
          <div style={{ position:"absolute", top:0, left:0, right:0, height:1, background:`linear-gradient(90deg,transparent,${T},transparent)` }}/>
          <div style={{ fontSize:9, fontWeight:600, letterSpacing:".16em", textTransform:"uppercase", color:T, marginBottom:16 }}>✦ Premium</div>
          <h2 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(22px,3.5vw,38px)", fontWeight:200, letterSpacing:"-.05em", color:TX, marginBottom:12 }}>
            Für ernsthafte Sammler.
          </h2>
          <p style={{ fontSize:13, color:T3, lineHeight:1.85, marginBottom:28, maxWidth:380, margin:"0 auto 28px" }}>
            Unlimitierter Scanner · Marktplatz · Wishlist-Alerts<br/>
            Preisalarme · 3 % statt 5 % Provision
          </p>
          <Link href="/dashboard/premium" style={{
            display:"inline-flex", alignItems:"center", gap:8,
            padding:"13px 32px", borderRadius:14,
            background:T, color:BG, fontSize:14, fontWeight:500,
            textDecoration:"none",
            boxShadow:`0 0 32px rgba(0,184,168,0.3)`,
          }}>Premium werden ✦</Link>
          <div style={{ marginTop:14, fontSize:11, color:T3 }}>6,99 € / Monat · Jederzeit kündbar</div>
        </div>
      </section>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes skeleton-pulse { 0%,100%{opacity:.15} 50%{opacity:.3} }
        section div::-webkit-scrollbar { display:none }
        @media(max-width:680px) {
          section > div:first-child { grid-template-columns:1fr !important; }
        }
      `}</style>
    </div>
  );
}
