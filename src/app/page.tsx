"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const GOLD = "#C9A66B";
const BG   = "#0A0A0A";
const BG2  = "#111111";
const TX   = "#EDE9E0";
const TX2  = "rgba(237,233,224,0.7)";
const GD2  = "rgba(201,166,107,0.7)";

const SB = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function HomePage() {
  const [stats, setStats] = useState({ cards: 23742, sets: 214 });
  const [topCard, setTopCard] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [emailDone, setEmailDone] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [{ count: cc }, { count: sc }] = await Promise.all([
          SB.from("cards").select("id", { count: "exact", head: true }),
          SB.from("sets").select("id", { count: "exact", head: true }),
        ]);
        const { data } = await SB.from("cards")
          .select("id,name,name_de,price_market,image_url")
          .not("price_market", "is", null).gt("price_market", 50)
          .order("price_market", { ascending: false }).limit(1).single();
        setStats({ cards: cc ?? 23742, sets: sc ?? 214 });
        if (data) setTopCard(data);
      } catch {}
    }
    load();
  }, []);

  const imgSrc = topCard?.image_url
    ? (topCard.image_url.includes(".") ? topCard.image_url : topCard.image_url + "/high.webp")
    : null;

  const GoldDivider = () => (
    <div style={{ width: "100%", height: 1, background: "linear-gradient(90deg,transparent,rgba(201,166,107,0.3),transparent)" }} />
  );

  return (
    <div style={{ background: BG, color: TX, minHeight: "100vh", fontFamily: "'Instrument Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;700&family=Instrument+Sans:wght@400;500;600&display=swap');
        .ph { font-family: 'Playfair Display', serif; letter-spacing: -0.05em; }
        .luxury-float { transition: all 0.8s cubic-bezier(0.4,0,0.2,1); }
        .luxury-float:hover { transform: translateY(-18px) rotate(1.2deg); box-shadow: 0 50px 100px -30px rgba(201,166,107,0.4); }
        .btn-gold { display:inline-flex; align-items:center; gap:8px; padding:14px 32px; background:#C9A66B; color:#0A0A0A; border-radius:100px; border:none; font-size:14px; font-weight:600; cursor:pointer; text-decoration:none; transition:transform 0.2s,box-shadow 0.2s; }
        .btn-gold:hover { transform:scale(1.04); box-shadow:0 12px 40px rgba(201,166,107,0.35); }
        .btn-outline { display:inline-flex; align-items:center; padding:14px 28px; border:1px solid #C9A66B; color:#C9A66B; border-radius:100px; font-size:14px; font-weight:500; text-decoration:none; background:transparent; transition:all 0.2s; }
        .btn-outline:hover { background:#C9A66B; color:#0A0A0A; }
        .screenshot-frame { background:#111111; border:1px solid rgba(201,166,107,0.25); box-shadow:0 35px 70px -25px rgba(201,166,107,0.2); border-radius:28px; overflow:hidden; }
        .feat-row { display:grid; gap:clamp(40px,6vw,64px); align-items:center; }
        .label-sm { font-size:11px; letter-spacing:0.18em; text-transform:uppercase; color:rgba(201,166,107,0.7); }
        .func-card { display:flex; gap:18px; align-items:flex-start; padding:clamp(20px,2.5vw,28px); background:#111111; border-radius:20px; border:1px solid rgba(201,166,107,0.1); }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) both; }
        @media(max-width:900px){ .feat-row{grid-template-columns:1fr!important} .hero-grid{grid-template-columns:1fr!important} .stats-grid{grid-template-columns:repeat(2,1fr)!important} }
        @media(max-width:640px){ .hide-mob{display:none!important} }
      `}</style>

      {/* HERO */}
      <header style={{ minHeight:"100vh", display:"flex", alignItems:"center", maxWidth:1600, margin:"0 auto", padding:"clamp(120px,18vw,180px) clamp(20px,4vw,40px) clamp(60px,8vw,100px)" }}>
        <div className="hero-grid" style={{ display:"grid", gridTemplateColumns:"7fr 5fr", gap:"clamp(40px,6vw,80px)", alignItems:"center", width:"100%" }}>
          <div className="fade-up">
            <h1 className="ph" style={{ fontSize:"clamp(4.2rem,9.5vw,8rem)", lineHeight:1.01, color:TX, marginBottom:40 }}>
              Deine Karten.<br/>Dein Vermögen.
            </h1>
            <p style={{ fontSize:"clamp(17px,1.8vw,22px)", color:GD2, maxWidth:460, lineHeight:1.7, marginBottom:56 }}>
              Der seriöse Standard für Pokémon TCG Sammler.<br/>KI-gestützt. Elegant. Professionell.
            </p>
            <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
              <Link href="/scanner" className="btn-gold">Karte scannen ✦</Link>
              <Link href="/auth/register" className="btn-outline">Kostenlos starten</Link>
            </div>
          </div>
          <div className="hide-mob" style={{ display:"flex", justifyContent:"center" }}>
            <div className="luxury-float" style={{ width:"clamp(260px,28vw,390px)", aspectRatio:"3/4", background:BG2, borderRadius:28, border:"1px solid rgba(201,166,107,0.3)", boxShadow:"0 35px 70px -20px rgba(201,166,107,0.25)", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", position:"relative" }}>
              {imgSrc ? (
                <img src={imgSrc} alt={topCard?.name_de || topCard?.name} style={{ width:"100%", height:"100%", objectFit:"contain", padding:16 }} />
              ) : (
                <div style={{ textAlign:"center", padding:40 }}>
                  <div className="ph" style={{ fontSize:42, fontWeight:500, marginBottom:16 }}>Pikachu VMAX</div>
                  <div className="ph" style={{ fontSize:42, fontWeight:500, color:'#C9A66B', marginBottom:24 }}>€ 1.284</div>
                  <div style={{ fontSize:11, letterSpacing:"0.2em", textTransform:"uppercase", color:GD2 }}>Mint · KI-Scan · Live</div>
                </div>
              )}
              <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at center bottom,rgba(201,166,107,0.1),transparent 60%)", pointerEvents:"none" }}/>
            </div>
          </div>
        </div>
      </header>

      {/* STATS */}
      <div style={{ maxWidth:1600, margin:"0 auto", padding:"clamp(40px,6vw,80px) clamp(20px,4vw,40px)" }}>
        <GoldDivider />
        <div className="stats-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:40, textAlign:"center", padding:"clamp(40px,6vw,80px) 0" }}>
          {[
            { n:"12.487",    l:"Karten gescannt" },
            { n:"4.8 Mio €", l:"Portfolio-Wert"  },
            { n:"98.4 %",    l:"KI-Genauigkeit"  },
            { n:"14 Tage",   l:"Premium Test"     },
          ].map(({ n, l }) => (
            <div key={l}>
              <div className="ph" style={{ fontSize:"clamp(32px,4vw,52px)", fontWeight:500, color:'#C9A66B', lineHeight:1, marginBottom:12 }}>{n}</div>
              <div className="label-sm">{l}</div>
            </div>
          ))}
        </div>
        <GoldDivider />
      </div>

      {/* FEATURES */}
      <div style={{ maxWidth:1600, margin:"0 auto", padding:"clamp(60px,8vw,112px) clamp(20px,4vw,40px)" }}>
        <div style={{ display:"flex", flexDirection:"column", gap:"clamp(80px,10vw,112px)" }}>

          {[
            { label:"KI-Scanner", title:"Fotografiere.\nWert sofort sehen.", desc:"Fotografiere deine Karte – in Sekunden erhältst du präzise Zustandsanalyse, Seltenheit und aktuellen Marktwert von Cardmarket Deutschland.", icon:"⊙", href:"/scanner", premium:true, flip:false },
            { label:"Live-Preise", title:"Echtzeit-Preise &\nIntelligentes Matching.", desc:"Echtzeit-Preise von Cardmarket und automatisches Matching deiner Wunschkarten mit passenden Angeboten auf dem Marktplatz.", icon:"◈", href:"/preischeck", premium:false, flip:true },
            { label:"Sammlung", title:"Deine Karten.\nWie in einer Galerie.", desc:"Schönes Karten-Grid, Filter, Sets-Übersicht und persönliche Notizen – deine Karten endlich würdig präsentiert.", icon:"◎", href:"/sets", premium:false, flip:false },
            { label:"Portfolio-Tracking", title:"Wertentwicklung.\nCharts. Insights.", desc:"Portfolio-Wert live. ROI pro Karte. Gewinn & Verlust. Mit Premium wirst du zum Profi-Sammler.", icon:"◇", href:"/dashboard/portfolio", premium:true, flip:true },
          ].map(({ label, title, desc, icon, href, premium, flip }) => (
            <div key={label} className="feat-row" style={{ gridTemplateColumns: flip ? "5fr 7fr" : "7fr 5fr" }}>
              {flip && (
                <div className="screenshot-frame" style={{ padding:16 }}>
                  <div style={{ background:BG, aspectRatio:"16/10", borderRadius:18, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <Link href={href} style={{ textDecoration:"none", textAlign:"center" }}>
                      <div style={{ fontSize:48, color:'#C9A66B', marginBottom:12, opacity:0.6 }}>{icon}</div>
                      <div style={{ fontSize:13, color:GD2 }}>{label} öffnen →</div>
                    </Link>
                  </div>
                </div>
              )}
              <div>
                <div className="label-sm" style={{ marginBottom:20 }}>{label}</div>
                <h2 className="ph" style={{ fontSize:"clamp(28px,3.5vw,48px)", fontWeight:500, color:TX, marginBottom:24, lineHeight:1.1 }}>
                  {title.split("\n").map((line, i) => <span key={i}>{line}{i === 0 && <br/>}</span>)}
                </h2>
                <p style={{ fontSize:"clamp(15px,1.4vw,18px)", color:TX2, lineHeight:1.8, maxWidth:480 }}>{desc}</p>
                {premium && (
                  <div style={{ marginTop:28, display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ fontSize:24, color:GOLD }}>✦</span>
                    <span style={{ fontSize:13, letterSpacing:"0.12em", textTransform:"uppercase", fontWeight:600, color:GOLD }}>Premium</span>
                  </div>
                )}
              </div>
              {!flip && (
                <div className="screenshot-frame" style={{ padding:16 }}>
                  <div style={{ background:BG, aspectRatio:"16/10", borderRadius:18, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <Link href={href} style={{ textDecoration:"none", textAlign:"center" }}>
                      <div style={{ fontSize:48, color:'#C9A66B', marginBottom:12, opacity:0.6 }}>{icon}</div>
                      <div style={{ fontSize:13, color:GD2 }}>{label} öffnen →</div>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ALLE FUNKTIONEN */}
      <div style={{ maxWidth:1600, margin:"0 auto", padding:"clamp(60px,8vw,112px) clamp(20px,4vw,40px)" }}>
        <GoldDivider />
        <h2 className="ph" style={{ fontSize:"clamp(28px,3.5vw,44px)", textAlign:"center", margin:"clamp(48px,6vw,80px) 0" }}>
          Alle Funktionen im Überblick
        </h2>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:"clamp(16px,2vw,24px)" }}>
          {[
            { icon:"◉", title:"Community Forum",         sub:"Diskussionen unter Kennern"              },
            { icon:"◈", title:"Wishlist & Price Alarms", sub:"Automatische Benachrichtigungen"         },
            { icon:"⇄", title:"Escrow & sichere Trades", sub:"Geschützte Käufe und Verkäufe"           },
            { icon:"▲", title:"Advanced KI-Analyse",     sub:"Trendvorhersagen & Seltenheits-Scoring"  },
            { icon:"◫", title:"214 Sets & Serien",       sub:"Vollständige Karten-Datenbank"            },
            { icon:"◇", title:"Fantasy League",          sub:"Gegen andere Sammler antreten"            },
            { icon:"⊙", title:"23.000+ Karten",          sub:"Täglich aktualisierte Preise"             },
            { icon:"✦", title:"Grading-Tracking",        sub:"PSA, BGS, CGC Einstufungen"              },
          ].map(({ icon, title, sub }) => (
            <div key={title} className="func-card">
              <span style={{ fontSize:28, color:'#C9A66B', flexShrink:0, marginTop:2 }}>{icon}</span>
              <div>
                <div style={{ fontSize:15, fontWeight:600, color:TX, marginBottom:4 }}>{title}</div>
                <div style={{ fontSize:13, color:GD2 }}>{sub}</div>
              </div>
            </div>
          ))}
        </div>
        <GoldDivider style={{ marginTop:"clamp(48px,6vw,80px)" }} />
      </div>

      {/* FANTASY LEAGUE — COMING SOON */}
      <div style={{ maxWidth:1600, margin:"0 auto", padding:"0 clamp(20px,4vw,40px) clamp(60px,8vw,112px)" }}>
        <div style={{ background:BG2, borderRadius:32, padding:"clamp(48px,6vw,80px)", textAlign:"center", border:"1px solid rgba(201,166,107,0.25)", boxShadow:"0 40px 80px -30px rgba(201,166,107,0.2)", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:0, left:"15%", right:"15%", height:1, background:"linear-gradient(90deg,transparent,rgba(201,166,107,0.5),transparent)" }}/>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"8px 20px", background:"rgba(201,166,107,0.1)", color:'#C9A66B', borderRadius:100, fontSize:13, fontWeight:600, marginBottom:24, border:"1px solid rgba(201,166,107,0.2)" }}>
            <span>🏆</span> ✦ COMING SOON
          </div>
          <h2 className="ph" style={{ fontSize:"clamp(36px,5vw,64px)", lineHeight:1, marginBottom:24, color:TX }}>Fantasy League</h2>
          <p style={{ fontSize:"clamp(15px,1.5vw,20px)", color:TX2, maxWidth:440, margin:"0 auto 48px", lineHeight:1.7 }}>
            Bilde dein Traum-Team aus seltenen Pokémon TCG Karten.<br/>Tritt gegen andere Sammler an und gewinne Preise.
          </p>
          <div style={{ maxWidth:480, margin:"0 auto" }}>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
              <input type="email" placeholder="Deine E-Mail-Adresse" value={email} onChange={e => setEmail(e.target.value)}
                style={{ flex:1, minWidth:220, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(201,166,107,0.3)", borderRadius:100, padding:"18px 28px", color:TX, fontSize:15, outline:"none", fontFamily:"inherit" }}/>
              <button onClick={() => { if (email) { setEmailDone(true); setEmail(""); } }}
                style={{ padding:"18px 32px", background:GOLD, color:BG, borderRadius:100, border:"none", fontSize:14, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap" }}>
                {emailDone ? "✓ Eingetragen!" : "Early Access ✦"}
              </button>
            </div>
            <p style={{ fontSize:12, color:"rgba(201,166,107,0.5)", marginTop:14 }}>Erhalte Early Access und exklusive Infos zur Fantasy League</p>
          </div>
        </div>
      </div>

      {/* PREMIUM CTA */}
      <div style={{ maxWidth:800, margin:"0 auto", padding:"0 clamp(20px,4vw,40px) clamp(80px,10vw,140px)" }}>
        <div style={{ background:BG2, borderRadius:32, padding:"clamp(48px,6vw,72px)", textAlign:"center", position:"relative", overflow:"hidden", border:"1px solid rgba(201,166,107,0.15)", boxShadow:"0 40px 80px -30px rgba(201,166,107,0.15)" }}>
          <div style={{ position:"absolute", top:0, left:"15%", right:"15%", height:1, background:`linear-gradient(90deg,transparent,${GOLD},transparent)` }}/>
          <div style={{ fontSize:12, letterSpacing:"0.2em", textTransform:"uppercase", color:GD2, marginBottom:20 }}>✦ Premium</div>
          <h2 className="ph" style={{ fontSize:"clamp(32px,4vw,56px)", color:TX, marginBottom:16, lineHeight:1.1 }}>Für ernsthafte Sammler.</h2>
          <p style={{ fontSize:16, color:TX2, lineHeight:1.8, maxWidth:360, margin:"0 auto 36px" }}>
            Unlimitierter Scanner · Marktplatz · Wishlist-Alerts<br/>Preisalarme · 3 % statt 5 % Provision
          </p>
          <Link href="/dashboard/premium" className="btn-gold" style={{ fontSize:16, padding:"16px 40px" }}>Premium werden ✦</Link>
          <div style={{ marginTop:16, fontSize:12, color:"rgba(201,166,107,0.4)" }}>6,99 € / Monat · Jederzeit kündbar</div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ background:BG, borderTop:"1px solid rgba(201,166,107,0.1)", padding:"clamp(40px,5vw,64px) clamp(20px,4vw,40px)", textAlign:"center" }}>
        <div style={{ fontSize:13, color:"rgba(201,166,107,0.5)" }}>© 2026 pokédax — Weltklasse Design für ernsthafte Sammler</div>
      </footer>
    </div>
  );
}
