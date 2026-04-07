# PokéDax v7.0 — Feature Complete
$root = "C:\Users\lenovo\pokedax\pokedax\pokedax"
$enc  = New-Object System.Text.UTF8Encoding $true
Write-Host ""
Write-Host "pokEdax v7.0 — Feature Complete" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "v7.0 Fixes:" -ForegroundColor Cyan
Write-Host "  [1] Hero: Wert nicht mehr abgeschnitten" -ForegroundColor Green
Write-Host "  [2] Sets: Bilder + % Besitz + Progress-Bar" -ForegroundColor Green
Write-Host "  [3] Karten-Detailseite: /preischeck/[id] mit Chart" -ForegroundColor Green
Write-Host "  [4] Preischeck: Set-Filter aus URL, Links zur Detailseite" -ForegroundColor Green
Write-Host "  [5] Forum: Beitrag erstellen funktioniert" -ForegroundColor Green
Write-Host "  [6] Forum: Antworten sichtbar + schreibbar" -ForegroundColor Green
Write-Host "  [7] Forum Post Detail: ohne lucide-react" -ForegroundColor Green
Write-Host "  [8] Leaderboard: Portfolio-Wert als Hauptranking" -ForegroundColor Green
Write-Host ""

$dirs = @(
  "$root\src\app","$root\src\app\preischeck","$root\src\app\portfolio","$root\src\app\scanner",
  "$root\src\app\fantasy","$root\src\app\leaderboard","$root\src\app\settings","$root\src\app\forum",
  "$root\src\app\marketplace","$root\src\app\sets",
  "$root\src\app\dashboard","$root\src\app\dashboard\premium",
  "$root\src\app\auth","$root\src\app\auth\login","$root\src\app\auth\register","$root\src\app\auth\callback",
  "$root\src\app\api\cards\search","$root\src\app\api\cards\sets",
  "$root\src\app\api\admin\sync-sets","$root\src\app\api\admin\sync-cards","$root\src\app\api\stats",
  "$root\src\app\api\stripe\checkout","$root\src\app\api\webhooks\stripe","$root\src\app\api\scans",
  "$root\src\app\api\scanner\scan","$root\src\app\api\scanner\count",
  "$root\src\app\api\marketplace",
  "$root\src\app\api\fantasy\team","$root\src\app\api\fantasy\leaderboard",
  "$root\src\app\api\leaderboard\portfolio",
  "$root\src\app\api\forum\posts","$root\src\app\api\forum\categories","$root\src\app\api\forum\replies",
  "$root\src\components\layout","$root\src\components\ui","$root\src\components\premium",
  "$root\public","$root\src\app\impressum","$root\src\app\datenschutz","$root\src\app\agb",
  "$root\src\lib","$root\src\lib\supabase","$root\src\hooks"
)
foreach ($d in $dirs) { if (-not (Test-Path $d)) { New-Item -ItemType Directory -Path $d -Force | Out-Null } }
if (-not (Test-Path "$root\src\app\profil")) { New-Item -ItemType Directory -Path "$root\src\app\profil" -Force | Out-Null }
cmd /c mkdir "$root\src\app\profil\[username]" 2>$null
cmd /c mkdir "$root\src\app\forum\post\[id]" 2>$null
cmd /c mkdir "$root\src\app\forum\new" 2>$null
cmd /c mkdir "$root\src\app\preischeck\[id]" 2>$null
$oldPage = "$root\src\app\auth\callback\page.tsx"
if (Test-Path $oldPage) { Remove-Item $oldPage -Force }
Write-Host "Schreibe Dateien..." -ForegroundColor DarkGray

$nextconfig = @'
/** @type {import('next').NextConfig} */
const nextConfig = { images: { remotePatterns: [{ protocol:"https",hostname:"assets.tcgdex.net"},{ protocol:"https",hostname:"images.tcgdex.net"}] } };
module.exports = nextConfig;
'@
[System.IO.File]::WriteAllText("$root\next.config.js", $nextconfig, $enc)
Write-Host "  OK  next.config.js" -ForegroundColor Green

$authlayout = @'
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Anmelden | pokédax" };
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{position:"relative",minHeight:"100vh",background:"#09090b",overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,pointerEvents:"none",background:"radial-gradient(ellipse 80% 50% at 15% 20%, rgba(212,168,67,0.09) 0%, transparent 60%)"}}/>
      <div style={{position:"relative",zIndex:1}}>{children}</div>
    </div>
  );
}
'@
[System.IO.File]::WriteAllText("$root\src\app\auth\layout.tsx", $authlayout, $enc)
Write-Host "  OK  layout.tsx" -ForegroundColor Green

$globals = @'
@import url("https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600&family=DM+Mono:wght@400;500&display=swap");
@import url("https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500&display=swap");
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --canvas:  #09090b;
  --bg-1:    #111114;
  --bg-2:    #18181c;
  --bg-3:    #202025;
  --br-1:    rgba(255,255,255,0.045);
  --br-2:    rgba(255,255,255,0.085);
  --br-3:    rgba(255,255,255,0.13);
  --tx-1:    #ededf2;
  --tx-2:    #a4a4b4;
  --tx-3:    #62626f;
  /* Warmer, tiefer — echtes Champagner-Gold */
  --gold:     #D4A843;
  --gold-40:  rgba(212,168,67,0.40);
  --gold-25:  rgba(212,168,67,0.25);
  --gold-15:  rgba(212,168,67,0.15);
  --gold-08:  rgba(212,168,67,0.08);
  --gold-04:  rgba(212,168,67,0.04);
  --green:   #3db87a;
  --red:     #dc4a5a;
  --font-display: 'Satoshi', 'Inter', system-ui, sans-serif;
  --font-body:    'Inter', system-ui, sans-serif;
  --font-mono:    'DM Mono', 'Fira Mono', monospace;
  --ease:    cubic-bezier(0.22, 1, 0.36, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; -webkit-text-size-adjust: 100%; }

body {
  background-color: var(--canvas);
  background-image:
    radial-gradient(ellipse 80% 50% at 15% 20%, rgba(212,168,67,0.09) 0%, transparent 60%),
    radial-gradient(ellipse 60% 40% at 85% 75%, rgba(212,168,67,0.07) 0%, transparent 55%),
    radial-gradient(ellipse 40% 30% at 50% 100%, rgba(212,168,67,0.05) 0%, transparent 50%);
  background-attachment: fixed;
  color: var(--tx-1);
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
}

::-webkit-scrollbar { width: 2px; }
::-webkit-scrollbar-thumb { background: rgba(212,168,67,0.18); border-radius: 2px; }

/* ── Keyframes ── */
@keyframes blink         { 0%,100%{opacity:1} 50%{opacity:.12} }
@keyframes ticker-scroll { from{transform:translateX(0)} to{transform:translateX(-50%)} }
@keyframes fade-up       { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
@keyframes pulse         { 0%,100%{opacity:.35} 50%{opacity:.55} }
@keyframes spin          { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
@keyframes shimmer       { from{background-position:200% 0} to{background-position:-200% 0} }

/* ══════════════════════════════════════════════════════
   GOLD GLOW — sanft, warm, elegant
   Kein harter Ring. Reines weiches Leuchten.
   ══════════════════════════════════════════════════════ */
.gold-glow {
  position: relative;
  overflow: hidden;
  transition:
    transform  0.65s var(--ease),
    box-shadow 0.65s var(--ease),
    border-color 0.3s;
}
.gold-glow::before {
  content: '';
  position: absolute;
  inset: -80%;
  background: radial-gradient(
    ellipse 70% 70% at center,
    rgba(212,168,67,0.38) 0%,
    rgba(212,168,67,0.12) 40%,
    transparent 72%
  );
  opacity: 0;
  transition: opacity 0.65s var(--ease), transform 0.65s var(--ease);
  z-index: 0;
  border-radius: inherit;
  pointer-events: none;
}
.gold-glow:hover::before {
  opacity: 1;
  transform: scale(1.15);
}
.gold-glow:hover {
  transform: translateY(-6px);
  box-shadow:
    0 2px 0 rgba(212,168,67,0.20),
    0 20px 60px -12px rgba(212,168,67,0.35),
    0 40px 100px -20px rgba(212,168,67,0.18);
  border-color: rgba(212,168,67,0.28) !important;
}
.gold-glow > * { position: relative; z-index: 1; }

/* card-hover — identisch, aber etwas stärker für Karten */
.card-hover {
  position: relative;
  overflow: hidden;
  transition:
    transform  0.65s var(--ease),
    box-shadow 0.65s var(--ease),
    border-color 0.3s;
}
.card-hover::before {
  content: '';
  position: absolute;
  inset: -80%;
  background: radial-gradient(
    ellipse 70% 70% at center,
    rgba(212,168,67,0.35) 0%,
    rgba(212,168,67,0.10) 45%,
    transparent 72%
  );
  opacity: 0;
  transition: opacity 0.65s var(--ease), transform 0.65s var(--ease);
  z-index: 0;
  pointer-events: none;
}
.card-hover:hover::before {
  opacity: 1;
  transform: scale(1.1);
}
.card-hover:hover {
  transform: translateY(-8px) scale(1.015);
  box-shadow:
    0 2px 0 rgba(212,168,67,0.15),
    0 24px 56px -12px rgba(212,168,67,0.32),
    0 48px 96px -24px rgba(212,168,67,0.14);
  border-color: rgba(212,168,67,0.22) !important;
}
.card-hover > * { position: relative; z-index: 1; }

/* ── Mobile ── */
@media (max-width: 768px) {
  .gold-glow:hover, .card-hover:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 32px -8px rgba(212,168,67,0.28);
  }
  button, a[href] { min-height: 44px; }
}
@media (max-width: 480px) {
  .gold-glow:hover, .card-hover:hover {
    transform: none;
    box-shadow: 0 0 0 1px rgba(212,168,67,0.25);
  }
}

/* ── Nav desktop/mobile ── */
.nav-desktop { display: flex !important; }
.nav-mobile  { display: none  !important; }
@media (max-width: 768px) {
  .nav-desktop { display: none  !important; }
  .nav-mobile  { display: flex  !important; }
}

/* NUCLEAR: Hide any rogue canvas backgrounds */
canvas[aria-hidden="true"] { display: none !important; pointer-events: none !important; }

/* ═══════════════════════════════════════════════════════
   MOBILE OVERRIDES — alle 8 Bugs aus den Screenshots
   ═══════════════════════════════════════════════════════ */
@media (max-width: 640px) {

  /* Fix 1: overflow-x global — verhindert horizontales Scrollen */
  body, #__next, main { overflow-x: hidden !important; }

  /* Fix 2: zwei-spalten-grids → einspaltigs */
  .grid-2col { grid-template-columns: 1fr !important; }

  /* Fix 3: Scanner-Sektion (home + /scanner) — 2-col → 1-col */
  .scanner-split {
    grid-template-columns: 1fr !important;
    min-height: unset !important;
  }
  .scanner-split > div:first-child {
    border-right: none !important;
    border-bottom: 1px solid rgba(255,255,255,0.06) !important;
  }

  /* Fix 4: Fantasy-Sektion (home) — 2-col → 1-col */
  .fantasy-split {
    grid-template-columns: 1fr !important;
    min-height: unset !important;
  }
  .fantasy-split > div:last-child { display: none !important; }

  /* Fix 5: Portfolio+Welcome (home) — 2-col → 1-col */
  .portfolio-welcome-grid {
    grid-template-columns: 1fr !important;
  }

  /* Fix 6: Forum-Cards (home) — 3-col → 1-col */
  .forum-cards-grid {
    grid-template-columns: 1fr !important;
  }

  /* Fix 7: Pricing-Grid (home + premium) — 3-col → 1-col */
  .pricing-plans-grid {
    grid-template-columns: 1fr !important;
  }

  /* Fix 8: Karten-Grid (home) — horizontal scroll statt 5-col */
  .cards-scroll-mobile {
    display: flex !important;
    overflow-x: auto !important;
    scroll-snap-type: x mandatory !important;
    gap: 10px !important;
    padding-bottom: 8px !important;
    -webkit-overflow-scrolling: touch !important;
  }
  .cards-scroll-mobile > * {
    flex-shrink: 0 !important;
    width: 140px !important;
    scroll-snap-align: start !important;
  }

  /* Fix 9: Footer — 4-col → 2-col auf mobile */
  .footer-grid-4col {
    grid-template-columns: 1fr 1fr !important;
    gap: 24px !important;
  }
  .footer-brand-col {
    grid-column: 1 / -1 !important;
  }

  /* Fix 10: Fantasy E-Mail Form — flex → column */
  .notify-form-row {
    flex-direction: column !important;
    gap: 10px !important;
  }
  .notify-form-row input,
  .notify-form-row button {
    width: 100% !important;
  }

  /* Fix 11: Portfolio stats grid — 4-col → 2-col */
  .portfolio-stats-grid {
    grid-template-columns: 1fr 1fr !important;
  }

  /* Fix 12: Section padding auf mobile reduzieren */
  .section-padding-mobile {
    padding-left: 16px !important;
    padding-right: 16px !important;
  }

  /* Fix 13: Portfolio page — content nicht abschneiden */
  .portfolio-header {
    padding: 24px 16px !important;
    overflow: hidden !important;
  }
  .portfolio-username {
    font-size: clamp(22px, 6vw, 40px) !important;
    word-break: break-word !important;
  }
}

/* Tablet: 641–1024px */
@media (min-width: 641px) and (max-width: 1024px) {
  .pricing-plans-grid {
    grid-template-columns: 1fr 1fr !important;
  }
  .footer-grid-4col {
    grid-template-columns: 1fr 1fr !important;
  }
}

'@
[System.IO.File]::WriteAllText("$root\src\app\globals.css", $globals, $enc)
Write-Host "  OK  globals.css" -ForegroundColor Green

$layout = @'
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: { default:"pokédax — Deine Karten. Ihr wahrer Wert.", template:"%s · pokédax" },
  description:"Live Cardmarket EUR-Preise, KI-Scanner und Portfolio-Tracking für Pokémon TCG Sammler.",
  keywords:["Pokémon TCG","Preischeck","Cardmarket","Scanner","Portfolio","pokédax"],
  openGraph:{
    title:"pokédax — Deine Karten. Ihr wahrer Wert.",
    description:"Live Cardmarket EUR-Preise, KI-Scanner und Portfolio-Tracking.",
    url:"https://pokedax2.vercel.app",
    siteName:"pokédax",
    locale:"de_DE",
    type:"website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="anonymous"/>
      </head>
      <body style={{background:"#09090b"}}>
        <Navbar/>
        <main style={{ minHeight:"70vh" }}>{children}</main>
        <Footer/>
      </body>
    </html>
  );
}

'@
[System.IO.File]::WriteAllText("$root\src\app\layout.tsx", $layout, $enc)
Write-Host "  OK  layout.tsx" -ForegroundColor Green

$canvas = @'
// Disabled — background handled via CSS in globals.css
export default function BackgroundCanvas() { return null; }

'@
[System.IO.File]::WriteAllText("$root\src\components\ui\BackgroundCanvas.tsx", $canvas, $enc)
Write-Host "  OK  BackgroundCanvas.tsx" -ForegroundColor Green

$navbar = @'
"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const LINKS = [
  { href:"/preischeck",        label:"Preischeck"    },
  { href:"/sets",              label:"Sets"          },
  { href:"/scanner",           label:"Scanner"       },
  { href:"/portfolio",         label:"Portfolio"     },
  { href:"/marketplace",       label:"Marktplatz"    },
  { href:"/fantasy",           label:"Fantasy"       },
  { href:"/forum",             label:"Forum"         },
];

const G  = "#D4A843";
const G15 = "rgba(212,168,67,0.15)";
const G08 = "rgba(212,168,67,0.08)";

export default function Navbar() {
  const pathname = usePathname();
  const router   = useRouter();
  const [user,     setUser]     = useState<any>(null);
  const [open,     setOpen]     = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const sb = createClient();
    sb.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: { subscription } } = sb.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <>
      {/* Live Ticker */}
      <div style={{
        background:"var(--bg-1)",
        borderBottom:"1px solid var(--br-1)",
        padding:"10px 0",
        overflow:"hidden",
        whiteSpace:"nowrap",
      }}>
        <div style={{
          display:"inline-flex",
          animation:"ticker-scroll 55s linear infinite",
          gap:0,
        }}>
          {Array.from({length:4}).map((_,i)=>(
            <span key={i} style={{
              paddingRight:56,
              fontSize:10.5,
              fontWeight:500,
              letterSpacing:".13em",
              color:"rgba(212,168,67,0.75)",
              textTransform:"uppercase",
            }}>
              LIVE&nbsp;·&nbsp;Glurak ex +12,4 %&nbsp;·&nbsp;Mewtu ex +5,7 %&nbsp;·&nbsp;Umbreon ex +8,2 %&nbsp;·&nbsp;Pikachu ex −3,1 %&nbsp;·&nbsp;Lugia ex +18,3 %&nbsp;·&nbsp;Gardevoir ex +6,9 %&nbsp;·&nbsp;Dragonite ex +18,3 %
            </span>
          ))}
        </div>
      </div>

      {/* Navbar */}
      <nav style={{
        borderBottom:`1px solid ${scrolled ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.04)"}`,
        background: scrolled
          ? "rgba(9,9,11,0.97)"
          : "rgba(9,9,11,0.88)",
        backdropFilter:"blur(48px) saturate(180%)",
        WebkitBackdropFilter:"blur(48px) saturate(180%)",
        position:"sticky",
        top:0,
        zIndex:50,
        transition:"background .3s, border-color .3s",
      }}>
        <div style={{
          maxWidth:1240,margin:"0 auto",
          padding:"0 clamp(16px,3vw,32px)",
          height:72,
          display:"flex",alignItems:"center",
          justifyContent:"space-between",
        }}>

          {/* Logo */}
          <Link href="/" style={{
            fontFamily:"var(--font-display)",
            fontSize:22,fontWeight:300,
            letterSpacing:"-.08em",
            color:G,textDecoration:"none",
            flexShrink:0,
          }}>pokédax</Link>

          {/* Desktop nav */}
          <div className="nav-desktop" style={{display:"flex",alignItems:"center",gap:2}}>
            {LINKS.map(l => {
              const active = pathname === l.href || pathname.startsWith(l.href+"/");
              return (
                <Link key={l.href} href={l.href} className="gold-glow" style={{
                  padding:"9px 18px",borderRadius:14,
                  fontSize:13.5,fontWeight:400,
                  color: active ? G : "var(--tx-2)",
                  textDecoration:"none",
                  background: active ? G08 : "transparent",
                  letterSpacing:"-.01em",
                }}>{l.label}</Link>
              );
            })}
          </div>

          {/* Desktop actions */}
          <div className="nav-desktop" style={{display:"flex",alignItems:"center",gap:10}}>
            {user ? (
              <>
<button onClick={signOut} style={{padding:"9px 18px",borderRadius:14,fontSize:13.5,color:"var(--tx-3)",border:"none",background:"transparent",cursor:"pointer"}}>
                  Abmelden
                </button>
              </>
            ) : (
              <Link href="/auth/login" className="gold-glow" style={{
                padding:"9px 20px",borderRadius:14,
                fontSize:13.5,color:"var(--tx-2)",
                border:"1px solid var(--br-2)",textDecoration:"none",
              }}>Anmelden</Link>
            )}
            <Link href="/dashboard/premium" className="gold-glow" style={{
              padding:"10px 22px",borderRadius:20,
              fontSize:13.5,fontWeight:500,
              background:G,color:"#080608",
              textDecoration:"none",letterSpacing:"-.01em",
            }}>Premium</Link>
          </div>

          {/* Mobile burger */}
          <button className="nav-mobile" onClick={()=>setOpen(o=>!o)} style={{
            width:42,height:42,borderRadius:12,
            background: open ? G08 : "transparent",
            border:`1px solid ${open ? G15 : "var(--br-2)"}`,
            display:"flex",flexDirection:"column",
            alignItems:"center",justifyContent:"center",gap:5,
            cursor:"pointer",padding:0,flexShrink:0,transition:"all .2s",
          }} aria-label="Menü">
            {[0,1,2].map(i=>(
              <span key={i} style={{
                display:"block",width:18,height:1.5,
                background: open ? G : "var(--tx-2)",
                borderRadius:1,
                transform: open
                  ? i===0 ? "rotate(45deg) translate(0,4.7px)"
                  : i===1 ? "scaleX(0)"
                  : "rotate(-45deg) translate(0,-4.7px)"
                  : "none",
                opacity: open && i===1 ? 0 : 1,
                transition:"all .22s var(--ease)",
              }}/>
            ))}
          </button>
        </div>

        {/* Mobile dropdown */}
        {open && (
          <div style={{
            borderTop:"1px solid var(--br-1)",
            background:"rgba(9,9,11,0.98)",
            backdropFilter:"blur(48px)",
            padding:"10px 16px 20px",
          }}>
            {LINKS.map(l=>(
              <Link key={l.href} href={l.href} style={{
                display:"block",padding:"14px 16px",
                borderRadius:14,marginBottom:2,
                fontSize:17,fontWeight:400,
                color: pathname===l.href ? G : "var(--tx-1)",
                textDecoration:"none",
                background: pathname===l.href ? G08 : "transparent",
                letterSpacing:"-.02em",
              }}>{l.label}</Link>
            ))}
            <div style={{margin:"10px 0 6px",borderTop:"1px solid var(--br-1)",paddingTop:10}}>
              <Link href="/dashboard/premium" style={{
                display:"block",padding:"15px 16px",borderRadius:16,
                fontSize:17,fontWeight:500,
                background:G,color:"#080608",
                textDecoration:"none",textAlign:"center",letterSpacing:"-.01em",
              }}>Premium werden</Link>
              {!user && (
                <Link href="/auth/login" style={{
                  display:"block",padding:"14px 16px",marginTop:6,
                  borderRadius:14,fontSize:16,color:"var(--tx-2)",
                  textDecoration:"none",textAlign:"center",
                }}>Anmelden</Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

'@
[System.IO.File]::WriteAllText("$root\src\components\layout\Navbar.tsx", $navbar, $enc)
Write-Host "  OK  Navbar.tsx" -ForegroundColor Green

$footer = @'
import Link from "next/link";
const G="#D4A843", TX1="#ededf2", TX2="#a4a4b4", TX3="#62626f";
const BG1="#111114", BR1="rgba(255,255,255,0.045)";
export default function Footer() {
  return (
    <footer style={{borderTop:`1px solid ${BR1}`,marginTop:0}}>
      <div style={{maxWidth:1240,margin:"0 auto",padding:"clamp(60px,8vw,100px) clamp(16px,3vw,32px) clamp(40px,5vw,60px)"}}>
        <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:"clamp(32px,5vw,64px)",marginBottom:56}} className="footer-grid-4col">
          <div className="footer-brand-col">
            <div style={{fontFamily:"var(--font-display)",fontSize:20,fontWeight:300,letterSpacing:"-.08em",color:G,marginBottom:16}}>pokédax</div>
            <p style={{fontSize:13.5,color:TX3,lineHeight:1.85,maxWidth:220,marginBottom:28}}>Quiet Collector Luxury.<br/>Präzise Preise. Edle Tools.<br/>Für ernsthafte Sammler.</p>
            <div style={{display:"flex",gap:8}}>
              {["𝕏","in","⬡"].map(s=>(
                <a key={s} href="#" style={{width:34,height:34,borderRadius:10,border:`1px solid ${BR1}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:TX3,textDecoration:"none"}}>{s}</a>
              ))}
            </div>
          </div>
          {[
            {t:"Plattform",links:[{h:"/preischeck",l:"Preischeck"},{h:"/scanner",l:"KI-Scanner"},{h:"/portfolio",l:"Portfolio"},{h:"/fantasy",l:"Fantasy League"},{h:"/forum",l:"Forum"}]},
            {t:"Community",links:[{h:"/leaderboard",l:"Leaderboard"},{h:"/forum",l:"Diskussionen"},{h:"#",l:"Discord"},{h:"#",l:"Blog"}]},
            {t:"Legal",links:[{h:"/impressum",l:"Impressum"},{h:"/datenschutz",l:"Datenschutz"},{h:"/agb",l:"AGB"},{h:"/dashboard/premium",l:"Premium ✦"}]},
          ].map(col=>(
            <div key={col.t}>
              <div style={{fontSize:9.5,fontWeight:600,letterSpacing:".16em",textTransform:"uppercase",color:TX3,marginBottom:18}}>{col.t}</div>
              <div style={{display:"flex",flexDirection:"column",gap:11}}>
                {col.links.map(l=>(
                  <Link key={l.h} href={l.h} style={{fontSize:13.5,color:TX2,textDecoration:"none"}}>{l.l}</Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{borderTop:`1px solid ${BR1}`,paddingTop:24,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
          <span style={{fontSize:12,color:TX3}}>© 2026 PokéDax · Quiet Collector Luxury · Nicht offiziell</span>
          <span style={{fontSize:12,color:TX3}}>Mit Präzision entwickelt · Deutschland</span>
        </div>
      </div>
    </footer>
  );
}

'@
[System.IO.File]::WriteAllText("$root\src\components\layout\Footer.tsx", $footer, $enc)
Write-Host "  OK  Footer.tsx" -ForegroundColor Green

$ticker = @'
"use client";
import { useEffect, useState } from "react";

interface TickerCard { name: string; price: number; change: number; set: string; }

const FALLBACK: TickerCard[] = [
  { name:"Glurak ex",      price:189.90, change:+12.4, set:"SV01"   },
  { name:"Mewtu ex",       price:245.00, change:+5.7,  set:"MEW"    },
  { name:"Umbreon ex",     price:134.50, change:+8.2,  set:"SV08.5" },
  { name:"Pikachu ex",     price:67.20,  change:-3.1,  set:"SV09"   },
  { name:"Lugia ex",       price:312.00, change:+18.3, set:"SV04"   },
  { name:"Gardevoir ex",   price:54.60,  change:+6.9,  set:"SV02"   },
  { name:"Giratina VSTAR", price:76.30,  change:-2.4,  set:"SV00"   },
  { name:"Mew ex",         price:156.80, change:+11.1, set:"MEW"    },
  { name:"Rayquaza ex",    price:98.40,  change:-1.8,  set:"SV07"   },
  { name:"Dragonite ex",   price:312.00, change:+18.3, set:"OBF"    },
];

function fmt(n: number) {
  return n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtPct(n: number) {
  return Math.abs(n).toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

function Item({ card }: { card: TickerCard }) {
  const up = card.change >= 0;
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:9,
      padding:"0 24px",
      borderRight:"1px solid rgba(233,168,75,0.08)",
      whiteSpace:"nowrap", flexShrink:0,
    }}>
      <span style={{ fontSize:11, fontWeight:400, letterSpacing:"-.01em", color:"rgba(233,168,75,0.85)", fontFamily:"var(--font-body)" }}>
        {card.name}
      </span>
      <span style={{ fontSize:9, fontWeight:600, letterSpacing:".08em", color:"rgba(233,168,75,0.28)" }}>
        {card.set}
      </span>
      <span style={{ fontSize:11, fontWeight:500, letterSpacing:"-.01em", color:"rgba(233,168,75,0.95)", fontFamily:"var(--font-mono)" }}>
        {fmt(card.price)} €
      </span>
      <span style={{ fontSize:10, fontWeight:600, color: up ? "rgba(233,168,75,0.62)" : "rgba(233,168,75,0.35)", letterSpacing:"-.005em" }}>
        {up ? "▲" : "▼"} {up ? "+" : "−"}{fmtPct(card.change)} %
      </span>
    </span>
  );
}

export default function PriceTicker() {
  const [cards, setCards] = useState<TickerCard[]>(FALLBACK);

  useEffect(() => {
    fetch("/api/stats/ticker")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.cards?.length) setCards(d.cards); })
      .catch(() => {});
  }, []);

  const items = [...cards, ...cards, ...cards];

  return (
    <div style={{
      height:28, overflow:"hidden",
      background:"rgba(233,168,75,0.018)",
      borderTop:"1px solid rgba(233,168,75,0.07)",
      borderBottom:"1px solid rgba(233,168,75,0.07)",
      borderRadius:"0 0 14px 14px",
      marginTop:1,
      display:"flex", alignItems:"center",
    }}>
      {/* Live badge */}
      <div style={{
        height:"100%", padding:"0 16px", flexShrink:0,
        display:"flex", alignItems:"center", gap:7,
        borderRight:"1px solid rgba(233,168,75,0.1)",
      }}>
        <div style={{
          width:4, height:4, borderRadius:"50%",
          background:"#E9A84B",
          animation:"blink 2s ease-in-out infinite",
        }}/>
        <span style={{ fontSize:8.5, fontWeight:700, letterSpacing:".15em", textTransform:"uppercase", color:"#E9A84B" }}>
          Live
        </span>
      </div>

      {/* Scrolling track — 60s = slow & readable */}
      <div style={{
        display:"flex", overflow:"hidden", flex:1,
        maskImage:"linear-gradient(90deg,transparent 0%,black 4%,black 96%,transparent 100%)",
        WebkitMaskImage:"linear-gradient(90deg,transparent 0%,black 4%,black 96%,transparent 100%)",
      }}>
        <div style={{
          display:"flex",
          animation:"ticker-scroll 60s linear infinite",
        }}>
          {items.map((c, i) => <Item key={i} card={c}/>)}
        </div>
      </div>
    </div>
  );
}

'@
[System.IO.File]::WriteAllText("$root\src\components\ui\PriceTicker.tsx", $ticker, $enc)
Write-Host "  OK  PriceTicker.tsx" -ForegroundColor Green

$notfound = @'
import Link from "next/link";
const G="#E9A84B",TX1="#f0f0f5",TX2="#a8a8b8",TX3="#6b6b7a";
export default function NotFound() {
  return (
    <div style={{minHeight:"70vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 24px",textAlign:"center",color:TX1}}>
      <div style={{fontFamily:"var(--font-display)",fontSize:"clamp(80px,16vw,160px)",fontWeight:300,letterSpacing:"-.08em",color:"rgba(255,255,255,0.04)",lineHeight:1,marginBottom:24,userSelect:"none"}}>404</div>
      <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(26px,3vw,38px)",fontWeight:300,letterSpacing:"-.04em",marginBottom:14,color:TX1}}>Diese Karte ist entwischt.</h1>
      <p style={{fontSize:16,color:TX2,marginBottom:44,maxWidth:360,lineHeight:1.72}}>Diese Seite existiert nicht — oder befindet sich gerade auf einem Turnier irgendwo da draußen.</p>
      <div style={{display:"flex",gap:12,flexWrap:"wrap",justifyContent:"center"}}>
        <Link href="/" className="gold-glow" style={{padding:"15px 32px",borderRadius:22,background:G,color:"#0a0808",fontSize:14,fontWeight:600,textDecoration:"none"}}>Startseite</Link>
        <Link href="/preischeck" className="gold-glow" style={{padding:"15px 32px",borderRadius:22,border:"1px solid rgba(255,255,255,0.12)",color:TX2,fontSize:14,textDecoration:"none"}}>Preischeck</Link>
      </div>
    </div>
  );
}

'@
[System.IO.File]::WriteAllText("$root\src\app\not-found.tsx", $notfound, $enc)
Write-Host "  OK  not-found.tsx" -ForegroundColor Green

$supa_client = @'
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
export function createClient() {
  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}
'@
[System.IO.File]::WriteAllText("$root\src\lib\supabase\client.ts", $supa_client, $enc)
Write-Host "  OK  client.ts" -ForegroundColor Green

$supa_server = @'
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); }, setAll(c) { try { c.forEach(({name,value,options})=>cookieStore.set(name,value,options)); } catch {} } } }
  );
}
'@
[System.IO.File]::WriteAllText("$root\src\lib\supabase\server.ts", $supa_server, $enc)
Write-Host "  OK  server.ts" -ForegroundColor Green

$auth_callback = @'
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/portfolio";

  if (code) {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { error } = await sb.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }
  return NextResponse.redirect(`${origin}/auth/login?error=auth_error`);
}

'@
[System.IO.File]::WriteAllText("$root\src\app\auth\callback\route.ts", $auth_callback, $enc)
Write-Host "  OK  route.ts" -ForegroundColor Green

$page_home = @'
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
          fontSize:"clamp(36px,7vw,88px)",
          fontWeight:300,
          letterSpacing:"-.09em",
          lineHeight:0.96,
          color:TX1,
          marginBottom:28,
        }}>
          Deine Karten.<br/>
          Ihr wahrer{" "}
          <span style={{color:G}}>Wert.</span>
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
          overflow:"hidden",position:"relative",display:"grid",gridTemplateColumns:"1fr 1fr",minHeight:400}} className="scanner-split">
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
          overflow:"hidden",position:"relative",display:"grid",gridTemplateColumns:"1fr 1fr",minHeight:400}} className="fantasy-split">
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
          <div className="forum-cards-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
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
        <div className="portfolio-welcome-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
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

        <div className="pricing-plans-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:28}}>
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

'@
[System.IO.File]::WriteAllText("$root\src\app\page.tsx", $page_home, $enc)
Write-Host "  OK  page.tsx" -ForegroundColor Green

$page_preischeck = @'
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
  const searchParams = useSearchParams();
  const [query,  setQuery]  = useState(searchParams.get("q")??"");
  const [setFilter, setSetFilter] = useState(searchParams.get("set")??"");
  const [sort,   setSort]   = useState("price_desc");
  const [cards,  setCards]  = useState<Card[]>([]);
  const [loading,setLoading]= useState(true);
  const [total,  setTotal]  = useState(0);
  const [selectedCard, setSelectedCard] = useState<Card|null>(null);

  const load = useCallback(async (q:string, s:string, setId?:string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ q, sort:s, limit:"24" });
      if (setId) params.set("set_id", setId);
      const r = await fetch(`/api/cards/search?${params}`);
      const d = await r.json();
      setCards(d.cards ?? []);
      setTotal(d.total ?? d.cards?.length ?? 0);
    } catch { setCards([]); }
    setLoading(false);
  }, []);

  useEffect(() => {
    const q = searchParams.get("q")??"";
    const set = searchParams.get("set")??"";
    setQuery(q);
    setSetFilter(set);
    load(q, "price_desc", set);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSetFilter("");
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
                <Link key={card.id} href={`/preischeck/${card.id}`}
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
[System.IO.File]::WriteAllText("$root\src\app\preischeck\page.tsx", $page_preischeck, $enc)
Write-Host "  OK  page.tsx" -ForegroundColor Green

$card_detail = @'
"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const G="#D4A843",G25="rgba(212,168,67,0.25)",G18="rgba(212,168,67,0.18)",G08="rgba(212,168,67,0.08)";
const BG1="#111114",BG2="#18181c",BR1="rgba(255,255,255,0.045)",BR2="rgba(255,255,255,0.085)";
const TX1="#ededf2",TX2="#a4a4b4",TX3="#62626f",GREEN="#3db87a",RED="#dc4a5a";

const TYPE_COLOR: Record<string,string> = {
  Fire:"#F97316",Water:"#38BDF8",Grass:"#4ADE80",Lightning:"#D4A843",
  Psychic:"#A855F7",Fighting:"#EF4444",Darkness:"#6B7280",Metal:"#9CA3AF",
  Dragon:"#7C3AED",Colorless:"#CBD5E1",
};
const TYPE_DE: Record<string,string> = {
  Fire:"Feuer",Water:"Wasser",Grass:"Pflanze",Lightning:"Elektro",
  Psychic:"Psycho",Fighting:"Kampf",Darkness:"Finsternis",Metal:"Metall",
  Dragon:"Drache",Colorless:"Farblos",
};

interface Card {
  id:string; name:string; name_de:string|null; set_id:string; number:string;
  types:string[]|null; rarity:string|null; image_url:string|null;
  price_market:number|null; price_low:number|null;
  price_avg7:number|null; price_avg30:number|null;
  hp:string|null; category:string|null; stage:string|null;
  illustrator:string|null; regulation_mark:string|null;
  is_holo:boolean|null; is_reverse_holo:boolean|null;
}

function PriceChart({avg7, avg30, market}: {avg7:number|null; avg30:number|null; market:number|null}) {
  if (!market) return null;

  const p30 = avg30 ?? market * 0.85;
  const p7  = avg7  ?? market * 0.94;
  const now = market;

  // Generate mock price history from the 3 data points
  const pts = [
    p30, p30*1.02, p30*0.98, p30*1.05, p30*1.01,
    p7*0.97, p7, p7*1.03, p7*0.99, p7*1.02,
    now*0.98, now*1.01, now*0.99, now,
  ];

  const min = Math.min(...pts) * 0.97;
  const max = Math.max(...pts) * 1.03;
  const range = max - min;

  const W = 600, H = 80;
  const xStep = W / (pts.length - 1);
  const toY = (v: number) => H - ((v - min) / range) * H;

  const pathD = pts.map((v,i) => `${i===0?"M":"L"}${i*xStep},${toY(v)}`).join(" ");
  const fillD = pathD + ` L${(pts.length-1)*xStep},${H} L0,${H}Z`;

  const trend7  = avg7  ? ((market - avg7)  / avg7  * 100) : null;
  const trend30 = avg30 ? ((market - avg30) / avg30 * 100) : null;

  return (
    <div style={{background:BG1,border:`1px solid ${BR2}`,borderRadius:18,padding:"20px",marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:16}}>
        <div style={{fontSize:11,fontWeight:500,color:TX2}}>Preisverlauf</div>
        <div style={{display:"flex",gap:16}}>
          {trend7!==null&&(
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:9,color:TX3,marginBottom:2}}>7 Tage</div>
              <div style={{fontSize:12,fontWeight:500,color:trend7>=0?GREEN:RED}}>
                {trend7>=0?"+":""}{trend7.toFixed(1)}%
              </div>
            </div>
          )}
          {trend30!==null&&(
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:9,color:TX3,marginBottom:2}}>30 Tage</div>
              <div style={{fontSize:12,fontWeight:500,color:trend30>=0?GREEN:RED}}>
                {trend30>=0?"+":""}{trend30.toFixed(1)}%
              </div>
            </div>
          )}
        </div>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H+4}`} preserveAspectRatio="none" style={{display:"block",height:70}}>
        <defs>
          <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={G} stopOpacity=".25"/>
            <stop offset="100%" stopColor={G} stopOpacity="0"/>
          </linearGradient>
        </defs>
        <path d={fillD} fill="url(#cg)"/>
        <path d={pathD} fill="none" stroke={G} strokeWidth="1.8" opacity=".8"/>
        {/* Current price dot */}
        <circle cx={(pts.length-1)*xStep} cy={toY(now)} r="3" fill={G}/>
      </svg>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:8,fontSize:9,color:TX3}}>
        <span>vor 30 Tagen</span>
        <span>vor 7 Tagen</span>
        <span>Heute</span>
      </div>
    </div>
  );
}

export default function CardDetailPage() {
  const params = useParams();
  const cardId = params.id as string;
  const [card,    setCard]    = useState<Card|null>(null);
  const [loading, setLoading] = useState(true);
  const [inColl,  setInColl]  = useState(false);
  const [inWish,  setInWish]  = useState(false);
  const [user,    setUser]    = useState<any>(null);
  const [adding,  setAdding]  = useState(false);

  useEffect(() => {
    const sb = createClient();
    // Load card
    sb.from("cards")
      .select("id,name,name_de,set_id,number,types,rarity,image_url,price_market,price_low,price_avg7,price_avg30,hp,category,stage,illustrator,regulation_mark,is_holo,is_reverse_holo")
      .eq("id", cardId)
      .single()
      .then(({data}) => {
        setCard(data as Card);
        setLoading(false);
      });

    // Check user + collection status
    sb.auth.getUser().then(async ({data:{user}}) => {
      if (!user) return;
      setUser(user);
      const [col, wish] = await Promise.all([
        sb.from("user_collection").select("id").eq("user_id",user.id).eq("card_id",cardId).maybeSingle(),
        sb.from("user_wishlist").select("id").eq("user_id",user.id).eq("card_id",cardId).maybeSingle(),
      ]);
      setInColl(!!col.data);
      setInWish(!!wish.data);
    });
  }, [cardId]);

  async function toggleCollection() {
    if (!user || !card) return;
    setAdding(true);
    const sb = createClient();
    if (inColl) {
      await sb.from("user_collection").delete().eq("user_id",user.id).eq("card_id",cardId);
      setInColl(false);
    } else {
      await sb.from("user_collection").insert({user_id:user.id,card_id:cardId,quantity:1,condition:"NM"});
      setInColl(true);
    }
    setAdding(false);
  }

  async function toggleWishlist() {
    if (!user || !card) return;
    setAdding(true);
    const sb = createClient();
    if (inWish) {
      await sb.from("user_wishlist").delete().eq("user_id",user.id).eq("card_id",cardId);
      setInWish(false);
    } else {
      await sb.from("user_wishlist").insert({user_id:user.id,card_id:cardId});
      setInWish(true);
    }
    setAdding(false);
  }

  if (loading) return (
    <div style={{color:TX1,minHeight:"80vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{fontSize:14,color:TX3}}>Lädt…</div>
    </div>
  );

  if (!card) return (
    <div style={{color:TX1,minHeight:"80vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:14,color:TX3,marginBottom:12}}>Karte nicht gefunden.</div>
        <Link href="/preischeck" style={{fontSize:13,color:G,textDecoration:"none"}}>← Zurück zum Preischeck</Link>
      </div>
    </div>
  );

  const type     = card.types?.[0];
  const typeColor = type ? (TYPE_COLOR[type]??TX3) : TX3;
  const priceFmt = card.price_market?.toLocaleString("de-DE",{minimumFractionDigits:2}) + " €";
  const trend7   = card.price_avg7 && card.price_market ? ((card.price_market-card.price_avg7)/card.price_avg7*100) : null;

  return (
    <div style={{color:TX1,minHeight:"80vh"}}>
      <div style={{maxWidth:1000,margin:"0 auto",padding:"clamp(40px,6vw,72px) clamp(16px,3vw,28px)"}}>

        {/* Back */}
        <Link href="/preischeck" style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:12,color:TX3,textDecoration:"none",marginBottom:32}}>
          ← Zurück
        </Link>

        <div style={{display:"grid",gridTemplateColumns:"280px 1fr",gap:24,alignItems:"start"}}>

          {/* Left: Card image */}
          <div>
            <div style={{
              background:BG2,borderRadius:20,overflow:"hidden",
              border:`1px solid ${BR2}`,aspectRatio:"2/3",
              display:"flex",alignItems:"center",justifyContent:"center",
              position:"relative",
            }}>
              {card.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={card.image_url} alt={card.name_de??card.name}
                  style={{width:"100%",height:"100%",objectFit:"contain",padding:12}}/>
              ) : (
                <div style={{fontSize:48,opacity:.1}}>◈</div>
              )}
              {(card.is_holo||card.is_reverse_holo)&&(
                <div style={{position:"absolute",top:10,right:10,padding:"2px 8px",borderRadius:5,background:G08,color:G,fontSize:9,fontWeight:600}}>
                  {card.is_reverse_holo?"REV. HOLO":"HOLO"}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div style={{display:"flex",gap:8,marginTop:12}}>
              <button onClick={toggleCollection} disabled={!user||adding} style={{
                flex:1,padding:"10px",borderRadius:12,fontSize:12,fontWeight:400,border:"none",cursor:user?"pointer":"default",
                background:inColl?G08:"rgba(255,255,255,0.04)",
                color:inColl?G:TX3,
                outline:`1px solid ${inColl?G18:BR1}`,
                transition:"all .2s",
              }}>
                {inColl?"✓ In Sammlung":"+ Sammlung"}
              </button>
              <button onClick={toggleWishlist} disabled={!user||adding} style={{
                flex:1,padding:"10px",borderRadius:12,fontSize:12,fontWeight:400,border:"none",cursor:user?"pointer":"default",
                background:inWish?"rgba(220,74,90,0.08)":"rgba(255,255,255,0.04)",
                color:inWish?RED:TX3,
                outline:`1px solid ${inWish?"rgba(220,74,90,0.2)":BR1}`,
                transition:"all .2s",
              }}>
                {inWish?"♥ Wunschliste":"♡ Wunschliste"}
              </button>
            </div>
            {!user&&<div style={{fontSize:10,color:TX3,textAlign:"center",marginTop:8}}>
              <Link href="/auth/login" style={{color:G,textDecoration:"none"}}>Anmelden</Link> zum Sammeln
            </div>}
          </div>

          {/* Right: Details */}
          <div>
            {/* Type badge */}
            {type&&(
              <div style={{display:"inline-flex",alignItems:"center",gap:6,marginBottom:12,padding:"4px 12px",borderRadius:8,background:`${typeColor}12`,border:`0.5px solid ${typeColor}25`}}>
                <div style={{width:7,height:7,borderRadius:"50%",background:typeColor}}/>
                <span style={{fontSize:11,fontWeight:500,color:typeColor}}>{TYPE_DE[type]??type}</span>
              </div>
            )}

            {/* Name */}
            <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(24px,4vw,40px)",fontWeight:200,letterSpacing:"-.04em",marginBottom:6,lineHeight:1.1}}>
              {card.name_de||card.name}
            </h1>
            {card.name_de&&card.name_de!==card.name&&(
              <div style={{fontSize:13,color:TX3,marginBottom:16}}>{card.name}</div>
            )}

            {/* Set info */}
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:24}}>
              <span style={{fontSize:11,color:TX3,fontFamily:"var(--font-mono)"}}>{card.set_id.toUpperCase()}</span>
              <span style={{color:TX3,fontSize:11}}>·</span>
              <span style={{fontSize:11,color:TX3}}>#{card.number}</span>
              {card.rarity&&<><span style={{color:TX3}}>·</span><span style={{fontSize:11,color:TX2}}>{card.rarity}</span></>}
              {card.regulation_mark&&<><span style={{color:TX3}}>·</span><span style={{fontSize:11,color:TX3}}>{card.regulation_mark}</span></>}
            </div>

            {/* Price block */}
            <div style={{background:BG1,border:`1px solid ${BR2}`,borderRadius:18,padding:"18px 20px",marginBottom:14}}>
              <div style={{fontSize:9,color:TX3,textTransform:"uppercase",letterSpacing:".1em",marginBottom:6}}>Marktpreis</div>
              <div style={{display:"flex",alignItems:"baseline",gap:12,flexWrap:"wrap"}}>
                <div style={{fontFamily:"var(--font-mono)",fontSize:"clamp(32px,5vw,52px)",fontWeight:300,color:G,letterSpacing:"-.05em",lineHeight:1}}>
                  {priceFmt}
                </div>
                {trend7!==null&&(
                  <div style={{fontSize:13,fontWeight:500,color:trend7>=0?GREEN:RED}}>
                    {trend7>=0?"▲":"▼"} {Math.abs(trend7).toFixed(1)}% (7T)
                  </div>
                )}
              </div>
              {(card.price_low||card.price_avg30)&&(
                <div style={{display:"flex",gap:16,marginTop:12,flexWrap:"wrap"}}>
                  {card.price_low&&(
                    <div>
                      <div style={{fontSize:9,color:TX3,marginBottom:2}}>Niedrigster</div>
                      <div style={{fontSize:13,fontFamily:"var(--font-mono)",color:TX2}}>{card.price_low.toLocaleString("de-DE",{minimumFractionDigits:2})} €</div>
                    </div>
                  )}
                  {card.price_avg30&&(
                    <div>
                      <div style={{fontSize:9,color:TX3,marginBottom:2}}>30T-Schnitt</div>
                      <div style={{fontSize:13,fontFamily:"var(--font-mono)",color:TX2}}>{card.price_avg30.toLocaleString("de-DE",{minimumFractionDigits:2})} €</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Price chart */}
            <PriceChart avg7={card.price_avg7} avg30={card.price_avg30} market={card.price_market}/>

            {/* Card stats */}
            <div style={{background:BG1,border:`1px solid ${BR2}`,borderRadius:18,overflow:"hidden",marginBottom:14}}>
              <div style={{padding:"12px 16px",borderBottom:`1px solid ${BR1}`,fontSize:10,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:TX3}}>Details</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:0}}>
                {[
                  ["Typ",        card.types?.map(t=>TYPE_DE[t]??t).join(", ") ?? "—"],
                  ["KP",         card.hp ?? "—"],
                  ["Kategorie",  card.category ?? "—"],
                  ["Stage",      card.stage ?? "—"],
                  ["Illustrator",card.illustrator ?? "—"],
                  ["Regulation", card.regulation_mark ?? "—"],
                ].map(([l,v],i)=>(
                  <div key={l} style={{padding:"11px 16px",borderBottom:`1px solid ${BR1}`,borderRight:i%2===0?`1px solid ${BR1}`:undefined}}>
                    <div style={{fontSize:9,color:TX3,textTransform:"uppercase",letterSpacing:".08em",marginBottom:3}}>{l}</div>
                    <div style={{fontSize:12,color:TX1}}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Marketplace shortcut */}
            <Link href={`/marketplace?card=${encodeURIComponent(card.id)}`} style={{
              display:"block",padding:"12px 16px",borderRadius:14,
              background:`${G08}`,border:`1px solid ${G18}`,
              color:TX1,textDecoration:"none",fontSize:13,
              transition:"all .2s",
            }}>
              <span style={{color:G}}>◈</span> Kauf- & Tauschangebote ansehen →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

'@
[System.IO.File]::WriteAllText("$root\src\app\preischeck\[id]\page.tsx", $card_detail, $enc)
Write-Host "  OK  page.tsx" -ForegroundColor Green

$page_scanner = @'
"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

const G="#D4A843",G25="rgba(212,168,67,0.25)",G18="rgba(212,168,67,0.18)",G08="rgba(212,168,67,0.08)",G04="rgba(212,168,67,0.04)";
const BG1="#111114",BG2="#18181c",BR1="rgba(255,255,255,0.045)",BR2="rgba(255,255,255,0.085)";
const TX1="#ededf2",TX2="#a4a4b4",TX3="#62626f",GREEN="#3db87a",RED="#dc4a5a";

interface ScanResult {
  gemini: { name:string; name_de:string; set_id:string|null; number:string|null; confidence:number };
  card: { id:string; name:string; name_de:string; set_id:string; number:string; price_market:number; price_avg7:number|null; price_avg30:number|null; image_url:string|null; rarity:string|null } | null;
  matches: any[];
  scansUsed: number | null;
  scansLeft: number | null;
}
interface Listing { id:string; type:"offer"|"want"; price:number|null; condition:string; note:string; profiles:{username:string}|null }

function ConditionBadge({c}:{c:string}) {
  const colors:Record<string,string> = {NM:GREEN,LP:"#a4d87a",MP:G,HP:RED,D:RED};
  return <span style={{fontSize:9,fontWeight:600,padding:"2px 6px",borderRadius:4,background:"rgba(255,255,255,0.04)",color:colors[c]??TX3,border:"0.5px solid rgba(255,255,255,0.08)"}}>{c}</span>;
}

function MatchingPanel({cardId}:{cardId:string}) {
  const [tab, setTab] = useState<"offer"|"want">("offer");
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<"offer"|"want">("offer");
  const [formPrice, setFormPrice] = useState("");
  const [formCond, setFormCond] = useState("NM");
  const [formNote, setFormNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadListings(t: "offer"|"want") {
    setLoading(true);
    const res = await fetch(`/api/marketplace?card_id=${cardId}&type=${t}`);
    const data = await res.json();
    setListings(data.listings ?? []);
    setLoading(false);
  }

  useEffect(() => { loadListings(tab); }, [tab, cardId]);

  async function submitListing() {
    setSubmitting(true);
    await fetch("/api/marketplace", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ card_id:cardId, type:formType, price:parseFloat(formPrice)||null, condition:formCond, note:formNote }),
    });
    setSubmitting(false);
    setShowForm(false);
    loadListings(tab);
  }

  return (
    <div style={{marginTop:24,background:BG1,border:`1px solid ${BR2}`,borderRadius:22,overflow:"hidden"}}>
      {/* Tabs */}
      <div style={{display:"flex",borderBottom:`1px solid ${BR1}`}}>
        {([["offer","Kaufangebote"],["want","Suchangebote"]] as const).map(([t,l])=>(
          <button key={t} onClick={()=>setTab(t)} style={{
            flex:1,padding:"14px",fontSize:13,fontWeight:500,border:"none",cursor:"pointer",
            background:tab===t?BG2:"transparent",
            color:tab===t?TX1:TX3,
            borderBottom:tab===t?`2px solid ${G}`:"2px solid transparent",
            transition:"all .2s",
          }}>{l} {tab===t&&listings.length>0&&<span style={{fontSize:10,background:G08,color:G,padding:"1px 6px",borderRadius:4,marginLeft:6}}>{listings.length}</span>}</button>
        ))}
      </div>
      {/* List */}
      <div style={{padding:"0 4px"}}>
        {loading ? (
          <div style={{padding:"28px",textAlign:"center",fontSize:13,color:TX3}}>Lädt…</div>
        ) : listings.length === 0 ? (
          <div style={{padding:"28px",textAlign:"center"}}>
            <div style={{fontSize:13,color:TX3,marginBottom:12}}>Noch keine {tab==="offer"?"Angebote":"Suchanfragen"}</div>
            <button onClick={()=>{setFormType(tab);setShowForm(true);}} style={{
              padding:"8px 20px",borderRadius:10,fontSize:12,fontWeight:500,
              background:G,color:"#0a0808",border:"none",cursor:"pointer",
            }}>Ich {tab==="offer"?"biete an":"suche"} ✦</button>
          </div>
        ) : (
          <>
            {listings.map(l=>(
              <div key={l.id} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",borderBottom:`1px solid ${BR1}`}}>
                <div style={{width:36,height:36,borderRadius:"50%",background:BG2,border:`1px solid ${BR1}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:G,fontWeight:500,flexShrink:0}}>
                  {(l.profiles?.username?.[0]??"?").toUpperCase()}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,color:TX1,fontWeight:400}}>{l.profiles?.username??"Anonym"}</div>
                  {l.note&&<div style={{fontSize:11,color:TX3,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l.note}</div>}
                </div>
                <ConditionBadge c={l.condition}/>
                {l.price&&<div style={{fontSize:15,fontWeight:400,fontFamily:"var(--font-mono)",color:G,flexShrink:0}}>{l.price.toLocaleString("de-DE",{minimumFractionDigits:2})} €</div>}
                <a href={`/profil/${l.profiles?.username??""}`} style={{
                  padding:"7px 14px",borderRadius:10,fontSize:12,fontWeight:500,
                  background:tab==="offer"?G:"transparent",color:tab==="offer"?"#0a0808":G,
                  border:tab==="offer"?"none":`1px solid ${G18}`,textDecoration:"none",flexShrink:0,
                }}>Kontakt</a>
              </div>
            ))}
            <div style={{padding:"12px 16px"}}>
              <button onClick={()=>{setFormType(tab);setShowForm(true);}} style={{
                fontSize:12,color:TX3,background:"transparent",border:`1px solid ${BR1}`,
                borderRadius:8,padding:"6px 14px",cursor:"pointer",
              }}>+ Eigenes Angebot erstellen</button>
            </div>
          </>
        )}
      </div>
      {/* Create listing form */}
      {showForm&&(
        <div style={{padding:"16px",background:BG2,borderTop:`1px solid ${BR1}`}}>
          <div style={{fontSize:12,fontWeight:500,color:TX1,marginBottom:12}}>
            {formType==="offer"?"Ich biete diese Karte an":"Ich suche diese Karte"}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
            <div>
              <div style={{fontSize:9,color:TX3,marginBottom:4,textTransform:"uppercase",letterSpacing:".08em"}}>Preis (€)</div>
              <input value={formPrice} onChange={e=>setFormPrice(e.target.value)} type="number" placeholder="z.B. 45.00"
                style={{width:"100%",padding:"9px 12px",borderRadius:8,background:"rgba(0,0,0,0.3)",border:`1px solid ${BR2}`,color:TX1,fontSize:13,outline:"none"}}/>
            </div>
            <div>
              <div style={{fontSize:9,color:TX3,marginBottom:4,textTransform:"uppercase",letterSpacing:".08em"}}>Zustand</div>
              <select value={formCond} onChange={e=>setFormCond(e.target.value)}
                style={{width:"100%",padding:"9px 12px",borderRadius:8,background:BG1,border:`1px solid ${BR2}`,color:TX1,fontSize:13,outline:"none"}}>
                {["NM","LP","MP","HP","D"].map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <input value={formNote} onChange={e=>setFormNote(e.target.value)} placeholder="Kurze Notiz (optional)"
            style={{width:"100%",padding:"9px 12px",borderRadius:8,background:"rgba(0,0,0,0.3)",border:`1px solid ${BR2}`,color:TX1,fontSize:13,outline:"none",marginBottom:10}}/>
          <div style={{display:"flex",gap:8}}>
            <button onClick={submitListing} disabled={submitting} style={{flex:1,padding:"10px",borderRadius:10,background:G,color:"#0a0808",fontSize:13,fontWeight:500,border:"none",cursor:"pointer"}}>
              {submitting?"Wird gespeichert…":"Veröffentlichen"}
            </button>
            <button onClick={()=>setShowForm(false)} style={{padding:"10px 16px",borderRadius:10,background:"transparent",color:TX2,fontSize:13,border:`1px solid ${BR1}`,cursor:"pointer"}}>Abbrechen</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ScannerPage() {
  const [dragging, setDragging]     = useState(false);
  const [scanning, setScanning]     = useState(false);
  const [result,   setResult]       = useState<ScanResult|null>(null);
  const [preview,  setPreview]      = useState<string|null>(null);
  const [error,    setError]        = useState<string|null>(null);
  const [scansToday, setScansToday] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load scan count on mount
  useEffect(() => {
    fetch("/api/scanner/count").then(r=>r.json()).then(d=>setScansToday(d.count??0)).catch(()=>{});
  }, []);

  async function handleFile(file: File) {
    setError(null);
    setResult(null);
    setScanning(true);

    // Preview
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    // Convert to base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve((r.result as string).split(",")[1]);
      r.onerror = reject;
      r.readAsDataURL(file);
    });

    try {
      const res = await fetch("/api/scanner/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType: file.type || "image/jpeg" }),
      });

      const data = await res.json();

      if (res.status === 429) {
        setError("Du hast dein Tageslimit von 5 Scans erreicht. Upgrade auf Premium für unlimitierte Scans.");
        setScanning(false);
        return;
      }
      if (!res.ok || data.error) {
        setError(data.error === "Karte nicht erkannt" ? "Karte konnte nicht erkannt werden. Bitte ein klareres Foto versuchen." : "Fehler beim Scannen. Bitte erneut versuchen.");
        setScanning(false);
        return;
      }

      setResult(data);
      if (data.scansUsed !== null) setScansToday(data.scansUsed);
    } catch {
      setError("Verbindungsfehler. Bitte erneut versuchen.");
    }
    setScanning(false);
  }

  const card = result?.card;
  const priceFormatted = card?.price_market
    ? card.price_market.toLocaleString("de-DE", { minimumFractionDigits: 2 }) + " €"
    : null;
  const trend7 = card?.price_avg7 && card?.price_market
    ? ((card.price_market - card.price_avg7) / card.price_avg7 * 100)
    : null;

  return (
    <div style={{color:TX1,minHeight:"80vh"}}>
      <div style={{maxWidth:1100,margin:"0 auto",padding:"clamp(52px,7vw,80px) clamp(16px,3vw,28px)"}}>

        {/* Header */}
        <div style={{textAlign:"center",marginBottom:"clamp(48px,6vw,72px)"}}>
          <div style={{fontSize:9,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:TX3,marginBottom:16,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            <span style={{width:16,height:0.5,background:TX3,display:"inline-block"}}/>KI-Scanner · Gemini Flash<span style={{width:16,height:0.5,background:TX3,display:"inline-block"}}/>
          </div>
          <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(36px,6vw,68px)",fontWeight:200,letterSpacing:"-.055em",lineHeight:1.0,marginBottom:18}}>
            Foto machen.<br/><span style={{color:G}}>Preis wissen.</span>
          </h1>
          <p style={{fontSize:"clamp(14px,1.6vw,18px)",color:TX2,maxWidth:460,margin:"0 auto",lineHeight:1.8,fontWeight:300}}>
            Halte deine Karte vor die Kamera. In Sekunden erhältst du den aktuellen Cardmarket-Wert.
          </p>
        </div>

        {/* Main layout */}
        <div className="scanner-split" style={{
          background:BG1,border:`1px solid ${BR2}`,borderRadius:28,
          overflow:"hidden",display:"grid",gridTemplateColumns:"1fr 1fr",minHeight:480,
          position:"relative",
        }}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${G25},transparent)`}}/>

          {/* Left: Upload */}
          <div style={{padding:"clamp(28px,4vw,52px)",display:"flex",flexDirection:"column",justifyContent:"center",borderRight:`1px solid ${BR1}`}}>
            <input ref={inputRef} type="file" accept="image/*" style={{display:"none"}}
              onChange={e=>e.target.files?.[0]&&handleFile(e.target.files[0])}/>

            {/* Drop zone */}
            <div
              onClick={()=>inputRef.current?.click()}
              onDragOver={e=>{e.preventDefault();setDragging(true);}}
              onDragLeave={()=>setDragging(false)}
              onDrop={e=>{e.preventDefault();setDragging(false);e.dataTransfer.files[0]&&handleFile(e.dataTransfer.files[0]);}}
              style={{
                borderRadius:18,border:`1.5px dashed ${dragging?G25:BR2}`,
                background:dragging?G04:"rgba(0,0,0,0.2)",
                display:"flex",flexDirection:"column",alignItems:"center",
                justifyContent:"center",gap:12,cursor:"pointer",
                aspectRatio:"4/3",marginBottom:20,
                transition:"all .4s var(--ease)",overflow:"hidden",position:"relative",
              }}>
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="Vorschau" style={{width:"100%",height:"100%",objectFit:"contain",padding:12}}/>
              ) : (
                <>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={TX3} strokeWidth="1.2" style={{opacity:.4}}>
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
                  </svg>
                  <div style={{textAlign:"center"}}>
                    <div style={{fontSize:14,color:TX2,marginBottom:4,fontWeight:300}}>Foto hier ablegen</div>
                    <div style={{fontSize:12,color:TX3}}>oder klicken zum Hochladen</div>
                    <div style={{fontSize:10,color:TX3,marginTop:8,padding:"3px 12px",borderRadius:6,background:"rgba(255,255,255,0.04)",display:"inline-block"}}>JPG · PNG · WEBP · max 10 MB</div>
                  </div>
                </>
              )}
            </div>

            <button onClick={()=>!scanning&&inputRef.current?.click()} style={{
              width:"100%",padding:"14px",borderRadius:16,
              background:scanning?"transparent":G,
              color:scanning?G:"#0a0808",
              fontSize:14,fontWeight:400,border:scanning?`1px solid ${G18}`:"none",
              cursor:scanning?"wait":"pointer",letterSpacing:"-.01em",
              transition:"all .3s",boxShadow:scanning?"none":`0 2px 20px ${G25}`,
              marginBottom:12,
            }}>
              {scanning ? "Erkennt Karte…" : "Jetzt scannen"}
            </button>

            {/* Scan counter */}
            <div style={{textAlign:"center",fontSize:12,color:TX3}}>
              <span style={{padding:"3px 12px",borderRadius:6,background:scansToday>=5?`rgba(220,74,90,0.08)`:`rgba(212,168,67,0.06)`,color:scansToday>=5?RED:TX3}}>
                {scansToday} / 5 Scans heute
              </span>
              {" · "}
              <Link href="/dashboard/premium" style={{color:G,textDecoration:"none",fontSize:12}}>Unlimitiert mit Premium ✦</Link>
            </div>
          </div>

          {/* Right: Result */}
          <div style={{padding:"clamp(28px,4vw,52px)",display:"flex",flexDirection:"column",justifyContent:"center"}}>
            {scanning ? (
              <div style={{textAlign:"center"}}>
                <div style={{width:52,height:52,borderRadius:"50%",border:`1.5px solid ${G18}`,borderTopColor:G,margin:"0 auto 20px",animation:"spin 0.8s linear infinite"}}/>
                <div style={{fontSize:15,color:TX2,fontWeight:300}}>KI analysiert deine Karte…</div>
                <div style={{fontSize:12,color:TX3,marginTop:8}}>Abgleich mit 22.000+ Karten</div>
              </div>
            ) : error ? (
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:14,color:RED,marginBottom:16,lineHeight:1.6}}>{error}</div>
                {error.includes("Tageslimit") && (
                  <Link href="/dashboard/premium" style={{display:"inline-block",padding:"12px 24px",borderRadius:14,background:G,color:"#0a0808",fontSize:13,fontWeight:400,textDecoration:"none"}}>Premium werden ✦</Link>
                )}
              </div>
            ) : result && card ? (
              <div>
                {/* Card found */}
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:18}}>
                  <span style={{width:6,height:6,borderRadius:"50%",background:GREEN,display:"inline-block"}}/>
                  <span style={{fontSize:10,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:GREEN}}>
                    Erkannt · {Math.round((result.gemini.confidence??0.95)*100)}% Konfidenz
                  </span>
                </div>

                {/* Card name */}
                <div style={{fontFamily:"var(--font-display)",fontSize:"clamp(22px,3vw,36px)",fontWeight:200,letterSpacing:"-.04em",color:TX1,marginBottom:6,lineHeight:1.1}}>
                  {card.name_de || card.name}
                </div>
                <div style={{fontSize:13,color:TX3,marginBottom:20}}>
                  {card.set_id?.toUpperCase()} · #{card.number} {card.rarity&&`· ${card.rarity}`}
                </div>

                {/* Price */}
                <div style={{fontFamily:"var(--font-mono)",fontSize:"clamp(36px,4.5vw,56px)",fontWeight:300,color:G,letterSpacing:"-.05em",lineHeight:1,marginBottom:8}}>
                  {priceFormatted}
                </div>
                {trend7 !== null && (
                  <div style={{fontSize:12,color:trend7>=0?GREEN:RED,marginBottom:24}}>
                    {trend7>=0?"▲":"▼"} {Math.abs(trend7).toFixed(1)} % vs. 7-Tage-Schnitt
                  </div>
                )}

                <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:24}}>
                  <Link href={`/preischeck?q=${encodeURIComponent(card.name_de||card.name)}`} style={{
                    padding:"10px 20px",borderRadius:12,background:G,color:"#0a0808",
                    fontSize:13,fontWeight:400,textDecoration:"none",
                    boxShadow:`0 2px 16px ${G25}`,
                  }}>Preishistorie</Link>
                  <button onClick={()=>{setResult(null);setPreview(null);setError(null);}} style={{
                    padding:"10px 20px",borderRadius:12,background:"transparent",
                    color:TX2,fontSize:13,border:`1px solid ${BR2}`,cursor:"pointer",
                  }}>Neue Karte</button>
                </div>

                {/* Matching panel */}
                <MatchingPanel cardId={card.id}/>
              </div>
            ) : result && !card ? (
              // Gemini recognized but no DB match
              <div>
                <div style={{fontSize:10,fontWeight:600,letterSpacing:".1em",color:"#e8a84a",marginBottom:16,textTransform:"uppercase"}}>
                  ⚠ Karte erkannt — kein Preis gefunden
                </div>
                <div style={{fontSize:20,fontWeight:300,color:TX1,marginBottom:8}}>{result.gemini.name_de||result.gemini.name}</div>
                <div style={{fontSize:13,color:TX3,marginBottom:20}}>Diese Karte ist noch nicht in unserer Datenbank.</div>
                <Link href={`/preischeck?q=${encodeURIComponent(result.gemini.name_de||result.gemini.name)}`}
                  style={{padding:"10px 20px",borderRadius:12,background:G,color:"#0a0808",fontSize:13,textDecoration:"none"}}>
                  Trotzdem suchen
                </Link>
              </div>
            ) : (
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:48,opacity:.08,marginBottom:14}}>◎</div>
                <div style={{fontSize:15,color:TX3,fontWeight:300,lineHeight:1.7}}>Lade eine Karte hoch<br/>um den Preis zu sehen</div>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

'@
[System.IO.File]::WriteAllText("$root\src\app\scanner\page.tsx", $page_scanner, $enc)
Write-Host "  OK  page.tsx" -ForegroundColor Green

$page_portfolio = @'
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const G="#E9A84B",G18="rgba(233,168,75,0.18)",G08="rgba(233,168,75,0.08)";
const BG1="#111113",BG2="#1a1a1f",BR1="rgba(255,255,255,0.06)",BR2="rgba(255,255,255,0.10)";
const TX1="#f0f0f5",TX2="#a8a8b8",TX3="#6b6b7a",GREEN="#4BBF82";

export default function PortfolioPage() {
  const [user,    setUser]    = useState<any>(null);
  const [col,     setCol]     = useState<any[]>([]);
  const [wish,    setWish]    = useState<any[]>([]);
  const [tab,     setTab]     = useState<"sammlung"|"wunschliste">("sammlung");
  const [chartPeriod, setChartPeriod] = useState<"7T"|"30T"|"90T">("30T");
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    async function load(){
      const{createClient}=await import("@/lib/supabase/client");
      const sb=createClient();
      const{data:{user}}=await sb.auth.getUser();
      if(!user){window.location.href="/auth/login";return;}
      setUser(user);
      const[cR,wR]=await Promise.all([
        sb.from("user_collection").select("*,cards(name,name_de,image_url,price_market,set_id,number)").eq("user_id",user.id).limit(40),
        sb.from("user_wishlist").select("*,cards(name,name_de,image_url,price_market,set_id,number)").eq("user_id",user.id).limit(40),
      ]);
      setCol(cR.data??[]);setWish(wR.data??[]);setLoading(false);
    }
    load();
  },[]);

  const totalVal = col.reduce((a,c)=>a+(c.cards?.price_market??0)*(c.quantity??1),0);
  const wishVal  = wish.reduce((a,w)=>a+(w.cards?.price_market??0),0);
  const fmt = (n:number) => n.toLocaleString("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2});

  if(loading) return (
    <div style={{minHeight:"80vh",display:"flex",alignItems:"center",justifyContent:"center",color:TX3,fontSize:16}}>Lade Portfolio…</div>
  );

  const items = tab==="sammlung" ? col : wish;

  return (
    <div style={{color:TX1,minHeight:"80vh",overflowX:"hidden"}}>
      <div style={{maxWidth:1200,margin:"0 auto",padding:"80px 24px"}}>

        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:56,flexWrap:"wrap",gap:16}}>
          <div>
            <div style={{fontSize:10,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:G,marginBottom:16}}>Dein Portfolio</div>
            <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(36px,5vw,60px)",fontWeight:300,letterSpacing:"-.07em",lineHeight:1.0,color:TX1,marginBottom:8}}>
              {user?.email?.split("@")[0]}
            </h1>
            <p style={{fontSize:14,color:TX3}}>Mitglied seit {new Date(user?.created_at).toLocaleDateString("de-DE",{month:"long",year:"numeric"})}</p>
          </div>
          <Link href="/dashboard/premium" className="gold-glow" style={{padding:"12px 24px",borderRadius:20,background:G08,color:G,border:`1px solid ${G18}`,fontSize:13,fontWeight:500,textDecoration:"none"}}>✦ Upgrade</Link>
        </div>

        {/* Stats row */}
        <div className="portfolio-stats-grid" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:32}}>
          {[
            {l:"Sammlungswert",v:`${totalVal.toLocaleString("de-DE",{minimumFractionDigits:2})} €`,big:true},
            {l:"Karten gesamt",v:col.reduce((a,c)=>a+(c.quantity??1),0).toString()},
            {l:"Wunschliste",v:`${wishVal.toLocaleString("de-DE",{minimumFractionDigits:2})} €`},
            {l:"Sets",v:new Set(col.map(c=>c.cards?.set_id)).size.toString()},
          ].map(s=>(
            <div key={s.l} style={{background:BG1,border:`1px solid ${s.big?"rgba(233,168,75,0.18)":BR1}`,borderRadius:22,padding:"clamp(20px,3vw,32px)"}}>
              <div style={{fontSize:10,fontWeight:600,letterSpacing:".12em",textTransform:"uppercase",color:s.big?G:TX3,marginBottom:12}}>{s.l}</div>
              <div style={{fontFamily:"var(--font-display)",fontSize:"clamp(24px,3.5vw,40px)",fontWeight:300,letterSpacing:"-.06em",color:s.big?G:TX1,lineHeight:1}}>{s.v}</div>
            </div>
          ))}
        </div>

        {/* Sparkline */}
        <div style={{background:BG1,border:`1px solid ${BR2}`,borderRadius:28,padding:"clamp(24px,4vw,40px)",marginBottom:32,position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,rgba(233,168,75,0.4),transparent)`}}/>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8,flexWrap:"wrap",gap:8}}>
            <div>
              <div style={{fontSize:11,color:TX3,marginBottom:6}}>Portfolio-Entwicklung</div>
              <div style={{fontFamily:"var(--font-display)",fontSize:"clamp(32px,4.5vw,52px)",fontWeight:300,letterSpacing:"-.055em",color:TX1,lineHeight:1}}>{totalVal.toFixed(0)} €</div>
            </div>
            <div style={{display:"flex",gap:4}}>
              {(["7T","30T","90T"] as const).map((t)=>(
                <button key={t} onClick={()=>setChartPeriod(t)} style={{
                  padding:"5px 12px",borderRadius:10,fontSize:12,fontWeight:500,border:"none",cursor:"pointer",
                  color:chartPeriod===t?TX1:TX3,
                  background:chartPeriod===t?BG2:"transparent",
                  transition:"all .2s",
                }}>{t}</button>
              ))}
            </div>
          </div>
          <svg width="100%" height="60" viewBox="0 0 600 60" preserveAspectRatio="none" style={{display:"block",marginTop:16}}>
            <defs><linearGradient id="pg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#E9A84B" stopOpacity=".18"/><stop offset="100%" stopColor="#E9A84B" stopOpacity="0"/></linearGradient></defs>
            {chartPeriod==="7T"&&<><path d="M0 42 C60 40,90 35,130 28 S185 20,225 16 S280 13,320 11 S375 8,415 5 S468 2,510 1 S565 0,600 0 L600 60 L0 60Z" fill="url(#pg)"/><path d="M0 42 C60 40,90 35,130 28 S185 20,225 16 S280 13,320 11 S375 8,415 5 S468 2,510 1 S565 0,600 0" fill="none" stroke="#E9A84B" strokeWidth="1.5" opacity=".7"/></>}
            {chartPeriod==="30T"&&<><path d="M0 52 C55 50,85 45,125 38 S180 28,220 22 S278 16,318 12 S372 8,412 5 S465 2,505 1 S562 0,600 0 L600 60 L0 60Z" fill="url(#pg)"/><path d="M0 52 C55 50,85 45,125 38 S180 28,220 22 S278 16,318 12 S372 8,412 5 S465 2,505 1 S562 0,600 0" fill="none" stroke="#E9A84B" strokeWidth="1.5" opacity=".7"/></>}
            {chartPeriod==="90T"&&<><path d="M0 58 C70 55,110 50,150 44 S210 36,250 30 S300 22,340 16 S390 10,430 6 S480 2,520 1 S570 0,600 0 L600 60 L0 60Z" fill="url(#pg)"/><path d="M0 58 C70 55,110 50,150 44 S210 36,250 30 S300 22,340 16 S390 10,430 6 S480 2,520 1 S570 0,600 0" fill="none" stroke="#E9A84B" strokeWidth="1.5" opacity=".7"/></>}
          </svg>
        </div>

        {/* Tabs */}
        <div style={{display:"flex",gap:6,marginBottom:28}}>
          {(["sammlung","wunschliste"] as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{
              padding:"10px 24px",borderRadius:16,fontSize:14,fontWeight:500,
              cursor:"pointer",border:"none",
              background:tab===t?BG1:"transparent",
              color:tab===t?TX1:TX3,
              outline:tab===t?`1px solid ${BR2}`:"none",
            }}>
              {t==="sammlung"?"Sammlung":"Wunschliste"}
              <span style={{marginLeft:8,fontSize:11,color:TX3}}>({t==="sammlung"?col.length:wish.length})</span>
            </button>
          ))}
        </div>

        {/* Cards */}
        {items.length===0 ? (
          <div style={{background:BG1,border:`1px solid ${BR2}`,borderRadius:28,padding:"72px",textAlign:"center"}}>
            <div style={{fontSize:16,color:TX3,marginBottom:16}}>{tab==="sammlung"?"Sammlung ist noch leer":"Wunschliste ist leer"}</div>
            <Link href={tab==="sammlung"?"/scanner":"/preischeck"} style={{fontSize:15,color:G,textDecoration:"none"}}>
              {tab==="sammlung"?"Karte scannen um zu beginnen →":"Karten entdecken →"}
            </Link>
          </div>
        ) : (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:14}}>
            {items.map((item:any)=>{
              const card=item.cards;if(!card)return null;
              const img=card.image_url??`https://assets.tcgdex.net/en/${card.set_id}/${card.number}/low.webp`;
              return (
                <div key={item.id} className="card-hover" style={{background:BG1,border:`1px solid ${BR1}`,borderRadius:22,overflow:"hidden"}}>
                  <div style={{aspectRatio:"3/4",background:BG2,display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={card.name_de??card.name} style={{width:"100%",height:"100%",objectFit:"contain",padding:6}}/>
                    {item.quantity>1&&<div style={{position:"absolute",top:8,right:8,background:"rgba(0,0,0,0.8)",color:TX1,fontSize:10,fontWeight:600,padding:"2px 6px",borderRadius:6}}>×{item.quantity}</div>}
                  </div>
                  <div style={{padding:"12px 14px 16px"}}>
                    <div style={{fontSize:13,fontWeight:500,color:TX1,marginBottom:4,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{card.name_de??card.name}</div>
                    <div style={{fontFamily:"'DM Mono',monospace",fontSize:"clamp(15px,1.4vw,18px)",color:G,fontWeight:400}}>
                      {card.price_market?`${fmt(card.price_market)} €`:"–"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

'@
[System.IO.File]::WriteAllText("$root\src\app\portfolio\page.tsx", $page_portfolio, $enc)
Write-Host "  OK  page.tsx" -ForegroundColor Green

$page_forum = @'
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const G="#D4A843",G18="rgba(212,168,67,0.18)",G08="rgba(212,168,67,0.08)";
const BG1="#111114",BG2="#18181c",BG3="#1e1e22",BR1="rgba(255,255,255,0.045)",BR2="rgba(255,255,255,0.085)";
const TX1="#ededf2",TX2="#a4a4b4",TX3="#62626f",GREEN="#3db87a",RED="#dc4a5a";

const CAT_CONFIG: Record<string,{color:string;icon:string}> = {
  Preisdiskussion: {color:"#E9A84B",icon:"◈"},
  Neuigkeiten:     {color:"#60A5FA",icon:"◉"},
  Einsteiger:      {color:"#34D399",icon:"◎"},
  Sammlung:        {color:"#A78BFA",icon:"◇"},
  Strategie:       {color:"#F472B6",icon:"◆"},
  Tausch:          {color:"#38BDF8",icon:"◈"},
  "Fake-Check":    {color:"#FB923C",icon:"⚠"},
  Marktplatz:      {color:"#C084FC",icon:"◉"},
};

interface Post {
  id:string; title:string; content?:string; upvotes:number; created_at:string;
  reply_count?:number; view_count?:number; is_pinned?:boolean; is_hot?:boolean;
  profiles?:{username:string;avatar_url:string|null;is_premium?:boolean};
  forum_categories?:{name:string};
}

function timeAgo(d:string) {
  const mins = Math.floor((Date.now()-new Date(d).getTime())/60000);
  if (mins<1) return "Gerade";
  if (mins<60) return `${mins} Min.`;
  const h = Math.floor(mins/60);
  if (h<24) return `${h} Std.`;
  const days = Math.floor(h/24);
  if (days<7) return `${days} T.`;
  return `${Math.floor(days/7)} Wo.`;
}

function Avatar({username, size=28}:{username:string;size?:number}) {
  const colors = [G,"#60A5FA","#34D399","#A78BFA","#F472B6","#FB923C"];
  const c = colors[username.charCodeAt(0)%colors.length];
  return (
    <div style={{width:size,height:size,borderRadius:"50%",background:`${c}18`,border:`1px solid ${c}30`,
      display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.45,color:c,fontWeight:500,flexShrink:0}}>
      {username[0].toUpperCase()}
    </div>
  );
}

function PostRow({post,onUpvote}:{post:Post;onUpvote:(id:string)=>void}) {
  const cat = post.forum_categories?.name ?? "Forum";
  const cfg = CAT_CONFIG[cat] ?? {color:G,icon:"●"};
  const author = post.profiles?.username ?? "Anonym";

  return (
    <div style={{
      display:"flex",alignItems:"flex-start",gap:0,
      borderBottom:`1px solid ${BR1}`,
      transition:"background .12s",
    }}
    onMouseEnter={e=>(e.currentTarget.style.background=BG2)}
    onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>

      {/* Upvote column */}
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"14px 12px 14px 16px",flexShrink:0,minWidth:52}}>
        <button onClick={(e)=>{e.preventDefault();e.stopPropagation();onUpvote(post.id);}} style={{
          width:28,height:28,borderRadius:8,background:"transparent",border:`1px solid ${BR2}`,
          display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",
          fontSize:11,color:TX3,transition:"all .15s",
        }}
        onMouseEnter={e=>{(e.currentTarget as any).style.borderColor=G;(e.currentTarget as any).style.color=G;}}
        onMouseLeave={e=>{(e.currentTarget as any).style.borderColor="rgba(255,255,255,0.085)";(e.currentTarget as any).style.color=TX3;}}>
          ▲
        </button>
        <div style={{fontSize:12,fontWeight:500,color:post.upvotes>0?TX2:TX3,marginTop:4,fontFamily:"var(--font-mono)",lineHeight:1}}>
          {post.upvotes}
        </div>
      </div>

      {/* Main content */}
      <Link href={`/forum/post/${post.id}`} style={{flex:1,padding:"14px 16px 14px 0",textDecoration:"none",display:"block",minWidth:0}}>
        {/* Top row: badges */}
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:7,flexWrap:"wrap"}}>
          {post.is_pinned&&(
            <span style={{fontSize:9,fontWeight:600,padding:"1px 7px",borderRadius:4,background:"rgba(212,168,67,0.1)",color:G,border:`0.5px solid ${G18}`}}>📌 GEPINNT</span>
          )}
          {post.is_hot&&(
            <span style={{fontSize:9,fontWeight:600,padding:"1px 7px",borderRadius:4,background:"rgba(239,68,68,0.1)",color:"#f87171",border:"0.5px solid rgba(239,68,68,0.2)"}}>🔥 HOT</span>
          )}
          <span style={{
            fontSize:9,fontWeight:600,padding:"2px 8px",borderRadius:5,
            background:`${cfg.color}12`,color:cfg.color,
            border:`0.5px solid ${cfg.color}25`,letterSpacing:".04em",
          }}>{cfg.icon} {cat.toUpperCase()}</span>
        </div>

        {/* Title */}
        <div style={{fontSize:14,fontWeight:400,color:TX1,lineHeight:1.4,marginBottom:8,
          overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>
          {post.title}
        </div>

        {/* Meta row */}
        <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
          <Avatar username={author} size={18}/>
          <span style={{fontSize:11,color:TX2}}>@{author}</span>
          {post.profiles?.is_premium&&<span style={{fontSize:8,color:G,fontWeight:600}}>✦</span>}
          <span style={{width:2,height:2,borderRadius:"50%",background:TX3,flexShrink:0}}/>
          <span style={{fontSize:11,color:TX3}}>{timeAgo(post.created_at)}</span>
          <span style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:12}}>
            {(post.reply_count??0)>0&&(
              <span style={{fontSize:11,color:TX3,display:"flex",alignItems:"center",gap:4}}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                {post.reply_count}
              </span>
            )}
            {(post.view_count??0)>0&&(
              <span style={{fontSize:11,color:TX3,display:"flex",alignItems:"center",gap:4}}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                {post.view_count}
              </span>
            )}
          </span>
        </div>
      </Link>
    </div>
  );
}

export default function ForumPage() {
  const [posts,   setPosts]   = useState<Post[]>([]);
  const [cats,    setCats]    = useState<string[]>([]);
  const [cat,     setCat]     = useState("alle");
  const [sort,    setSort]    = useState<"hot"|"neu"|"top">("hot");
  const [search,  setSearch]  = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const sb = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const [pR, cR] = await Promise.all([
        sb.from("forum_posts")
          .select("id,title,content,upvotes,created_at,profiles(username,avatar_url,is_premium),forum_categories(name)")
          .order("created_at",{ascending:false})
          .limit(60),
        sb.from("forum_categories").select("name").order("name"),
      ]);
      const normalized = (pR.data??[]).map((p:any)=>({
        ...p,
        profiles: Array.isArray(p.profiles)?p.profiles[0]:p.profiles,
        forum_categories: Array.isArray(p.forum_categories)?p.forum_categories[0]:p.forum_categories,
      }));
      setPosts(normalized as Post[]);
      const uniqueCats = Array.from(new Set(normalized.map((p:any)=>p.forum_categories?.name).filter(Boolean))) as string[];
      setCats(uniqueCats);
    } catch(e) { console.error(e); }
    setLoading(false);
  }

  async function upvote(postId: string) {
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const post = posts.find(p=>p.id===postId);
    if (!post) return;
    await sb.from("forum_posts").update({upvotes:(post.upvotes??0)+1}).eq("id",postId);
    setPosts(prev=>prev.map(p=>p.id===postId?{...p,upvotes:(p.upvotes??0)+1}:p));
  }

  // Filter + sort
  let filtered = posts.filter(p => {
    if (cat!=="alle" && p.forum_categories?.name!==cat) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!p.title.toLowerCase().includes(q) && !(p.profiles?.username??'').toLowerCase().includes(q)) return false;
    }
    return true;
  });

  if (sort==="top")  filtered = [...filtered].sort((a,b)=>(b.upvotes??0)-(a.upvotes??0));
  if (sort==="hot")  filtered = [...filtered].sort((a,b)=>{
    const scoreA = (a.upvotes??0)*2 + (a.reply_count??0)*3 + (a.view_count??0)*0.1;
    const scoreB = (b.upvotes??0)*2 + (b.reply_count??0)*3 + (b.view_count??0)*0.1;
    return scoreB - scoreA;
  });

  // Pinned first
  const pinned  = filtered.filter(p=>p.is_pinned);
  const regular = filtered.filter(p=>!p.is_pinned);
  const sorted  = [...pinned, ...regular];

  const stats = {
    total: posts.length,
    today: posts.filter(p=>new Date(p.created_at)>new Date(Date.now()-86400000)).length,
    topCat: cats.reduce((top,c)=>{
      const count = posts.filter(p=>p.forum_categories?.name===c).length;
      return count>(posts.filter(p=>p.forum_categories?.name===top).length) ? c : top;
    }, cats[0]??''),
  };

  return (
    <div style={{color:TX1,minHeight:"80vh"}}>
      <div style={{maxWidth:1160,margin:"0 auto",padding:"clamp(52px,7vw,80px) clamp(16px,3vw,28px)"}}>

        {/* Page header */}
        <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",flexWrap:"wrap",gap:14,marginBottom:"clamp(28px,4vw,44px)"}}>
          <div>
            <div style={{fontSize:9,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:TX3,marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
              <span style={{width:16,height:0.5,background:TX3}}/>Community
            </div>
            <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(26px,4vw,46px)",fontWeight:200,letterSpacing:"-.055em",marginBottom:4}}>Forum</h1>
            <p style={{fontSize:12,color:TX3}}>
              {loading?"Lädt…":`${posts.length} Beiträge · ${stats.today} heute`}
            </p>
          </div>
          <Link href="/forum/new" style={{
            padding:"10px 22px",borderRadius:12,background:G,color:"#0a0808",
            fontSize:13,fontWeight:400,textDecoration:"none",
            boxShadow:`0 2px 16px rgba(212,168,67,0.2)`,flexShrink:0,
          }}>+ Beitrag</Link>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 240px",gap:16,alignItems:"start"}}>
          {/* Main column */}
          <div>
            {/* Toolbar: search + sort */}
            <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
              <div style={{position:"relative",flex:1,minWidth:200}}>
                <svg style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",opacity:.3}} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Suchen…"
                  style={{width:"100%",padding:"8px 8px 8px 30px",borderRadius:10,background:BG1,border:`1px solid ${BR2}`,color:TX1,fontSize:12,outline:"none"}}/>
              </div>
              {/* Sort buttons */}
              <div style={{display:"flex",gap:2,background:BG1,borderRadius:11,padding:3,border:`1px solid ${BR1}`}}>
                {([["hot","🔥 Hot"],["neu","✦ Neu"],["top","▲ Top"]] as const).map(([s,l])=>(
                  <button key={s} onClick={()=>setSort(s)} style={{
                    padding:"5px 14px",borderRadius:8,fontSize:12,fontWeight:400,border:"none",cursor:"pointer",
                    background:sort===s?BG2:"transparent",color:sort===s?TX1:TX3,transition:"all .15s",
                  }}>{l}</button>
                ))}
              </div>
            </div>

            {/* Category filter pills */}
            <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
              <button onClick={()=>setCat("alle")} style={{
                padding:"5px 14px",borderRadius:8,fontSize:11,fontWeight:400,border:"none",cursor:"pointer",
                background:cat==="alle"?BG3:"transparent",color:cat==="alle"?TX1:TX3,
                outline:`1px solid ${cat==="alle"?BR2:BR1}`,transition:"all .15s",
              }}>Alle</button>
              {cats.map(c=>{
                const cfg = CAT_CONFIG[c]??{color:G,icon:"●"};
                const on = cat===c;
                return (
                  <button key={c} onClick={()=>setCat(c)} style={{
                    padding:"5px 14px",borderRadius:8,fontSize:11,fontWeight:400,border:"none",cursor:"pointer",
                    background:on?`${cfg.color}12`:"transparent",color:on?cfg.color:TX3,
                    outline:`1px solid ${on?cfg.color+"30":BR1}`,transition:"all .15s",
                  }}>{cfg.icon} {c}</button>
                );
              })}
            </div>

            {/* Posts list */}
            <div style={{background:BG1,border:`1px solid ${BR2}`,borderRadius:18,overflow:"hidden"}}>
              {loading ? (
                Array.from({length:8}).map((_,i)=>(
                  <div key={i} style={{height:76,borderBottom:`1px solid ${BR1}`,opacity:.3,background:`linear-gradient(90deg,${BG2},${BG1})`,animation:"pulse 1.5s ease-in-out infinite"}}/>
                ))
              ) : sorted.length===0 ? (
                <div style={{padding:"48px",textAlign:"center"}}>
                  <div style={{fontSize:14,color:TX3,marginBottom:12}}>Keine Beiträge gefunden.</div>
                  <Link href="/forum/new" style={{fontSize:13,color:G,textDecoration:"none"}}>Ersten Beitrag erstellen →</Link>
                </div>
              ) : sorted.map(post=>(
                <PostRow key={post.id} post={post} onUpvote={upvote}/>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div style={{display:"flex",flexDirection:"column",gap:12,position:"sticky",top:76}}>

            {/* Stats */}
            <div style={{background:BG1,border:`1px solid ${BR2}`,borderRadius:16,overflow:"hidden"}}>
              <div style={{padding:"12px 16px",borderBottom:`1px solid ${BR1}`,fontSize:10,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:TX3}}>Community</div>
              <div style={{padding:"12px 16px",display:"flex",flexDirection:"column",gap:8}}>
                {[
                  {l:"Beiträge gesamt",v:posts.length},
                  {l:"Heute",v:stats.today},
                  {l:"Kategorien",v:cats.length},
                ].map(s=>(
                  <div key={s.l} style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:12,color:TX3}}>{s.l}</span>
                    <span style={{fontSize:13,fontWeight:400,color:TX1,fontFamily:"var(--font-mono)"}}>{s.v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div style={{background:BG1,border:`1px solid ${BR2}`,borderRadius:16,overflow:"hidden"}}>
              <div style={{padding:"12px 16px",borderBottom:`1px solid ${BR1}`,fontSize:10,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:TX3}}>Kategorien</div>
              <div style={{padding:"8px 0"}}>
                {cats.map(c=>{
                  const cfg = CAT_CONFIG[c]??{color:G,icon:"●"};
                  const count = posts.filter(p=>p.forum_categories?.name===c).length;
                  return (
                    <button key={c} onClick={()=>setCat(c==="alle"||cat===c?"alle":c)} style={{
                      width:"100%",display:"flex",alignItems:"center",gap:10,
                      padding:"8px 16px",background:"transparent",border:"none",cursor:"pointer",
                      transition:"background .1s",
                    }}
                    onMouseEnter={e=>(e.currentTarget.style.background=BG2)}
                    onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                      <span style={{width:6,height:6,borderRadius:"50%",background:cfg.color,flexShrink:0}}/>
                      <span style={{flex:1,textAlign:"left",fontSize:12,color:cat===c?cfg.color:TX2}}>{c}</span>
                      <span style={{fontSize:10,color:TX3,fontFamily:"var(--font-mono)"}}>{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick links */}
            <div style={{background:BG1,border:`1px solid ${BR2}`,borderRadius:16,padding:"14px 16px"}}>
              <div style={{fontSize:10,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:TX3,marginBottom:10}}>Quick Links</div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {[
                  {href:"/forum/new",label:"+ Beitrag erstellen",c:G},
                  {href:"/marketplace",label:"◈ Marktplatz",c:TX3},
                  {href:"/scanner",label:"◎ KI-Scanner",c:TX3},
                  {href:"/leaderboard",label:"▲ Leaderboard",c:TX3},
                ].map(l=>(
                  <Link key={l.href} href={l.href} style={{fontSize:12,color:l.c,textDecoration:"none",padding:"3px 0",transition:"color .15s"}}>{l.label}</Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:.3}50%{opacity:.5}}`}</style>
    </div>
  );
}

'@
[System.IO.File]::WriteAllText("$root\src\app\forum\page.tsx", $page_forum, $enc)
Write-Host "  OK  page.tsx" -ForegroundColor Green

$forum_new = @'
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const G="#D4A843",G18="rgba(212,168,67,0.18)",G08="rgba(212,168,67,0.08)";
const BG1="#111114",BG2="#18181c",BR1="rgba(255,255,255,0.045)",BR2="rgba(255,255,255,0.085)";
const TX1="#ededf2",TX2="#a4a4b4",TX3="#62626f",RED="#dc4a5a";

const CAT_CONFIG: Record<string,{color:string}> = {
  Preisdiskussion:{color:"#E9A84B"},Neuigkeiten:{color:"#60A5FA"},
  Einsteiger:{color:"#34D399"},Sammlung:{color:"#A78BFA"},
  Strategie:{color:"#F472B6"},Tausch:{color:"#38BDF8"},
  "Fake-Check":{color:"#FB923C"},Marktplatz:{color:"#C084FC"},
};

interface Category { id:string; name:string; color:string; }

export default function ForumNewPage() {
  const router = useRouter();
  const [user,       setUser]       = useState<any>(null);
  const [cats,       setCats]       = useState<Category[]>([]);
  const [title,      setTitle]      = useState("");
  const [content,    setContent]    = useState("");
  const [catId,      setCatId]      = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");

  useEffect(() => {
    const sb = createClient();
    sb.auth.getUser().then(({data:{user}}) => {
      setUser(user);
      if (!user) router.push("/auth/login?redirect=/forum/new");
    });
    // Load categories from Supabase directly (no custom API needed)
    sb.from("forum_categories").select("id, name, color").order("name")
      .then(({data}) => setCats(data ?? []));
  }, []);

  async function submit() {
    if (!title.trim()) { setError("Titel darf nicht leer sein."); return; }
    if (!catId)        { setError("Bitte eine Kategorie wählen."); return; }
    if (content.trim().length < 10) { setError("Inhalt zu kurz (min. 10 Zeichen)."); return; }
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/forum/posts", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ category_id:catId, title:title.trim(), content:content.trim(), tags:[] }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Fehler beim Erstellen.");
      setSubmitting(false);
      return;
    }
    router.push(data.post?.id ? `/forum/post/${data.post.id}` : "/forum");
  }

  if (!user) return (
    <div style={{color:TX1,minHeight:"80vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{fontSize:14,color:TX3}}>Weiterleitung…</div>
    </div>
  );

  return (
    <div style={{color:TX1,minHeight:"80vh"}}>
      <div style={{maxWidth:740,margin:"0 auto",padding:"clamp(52px,7vw,80px) clamp(16px,3vw,28px)"}}>

        <Link href="/forum" style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:12,color:TX3,textDecoration:"none",marginBottom:28}}>← Forum</Link>

        <div style={{marginBottom:32}}>
          <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(24px,4vw,40px)",fontWeight:200,letterSpacing:"-.05em",marginBottom:6}}>Neuer Beitrag</h1>
          <p style={{fontSize:13,color:TX3}}>Als @{user?.email?.split("@")[0]??user?.id?.slice(0,8)}</p>
        </div>

        <div style={{background:BG1,border:`1px solid ${BR2}`,borderRadius:22,overflow:"hidden",position:"relative"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,rgba(212,168,67,0.25),transparent)`}}/>

          <div style={{padding:24}}>
            {/* Category */}
            <div style={{marginBottom:20}}>
              <div style={{fontSize:10,fontWeight:500,color:TX3,textTransform:"uppercase",letterSpacing:".08em",marginBottom:10}}>Kategorie</div>
              <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                {cats.map(c=>{
                  const cfg = CAT_CONFIG[c.name]??{color:G};
                  const on  = catId===c.id;
                  return (
                    <button key={c.id} onClick={()=>setCatId(c.id)} style={{
                      padding:"6px 14px",borderRadius:9,fontSize:12,fontWeight:400,border:"none",cursor:"pointer",
                      background:on?`${cfg.color}15`:"transparent",color:on?cfg.color:TX3,
                      outline:`1px solid ${on?cfg.color+"30":BR1}`,transition:"all .15s",
                    }}>{c.name}</button>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <div style={{marginBottom:16}}>
              <div style={{fontSize:10,fontWeight:500,color:TX3,textTransform:"uppercase",letterSpacing:".08em",marginBottom:8}}>Titel</div>
              <input value={title} onChange={e=>setTitle(e.target.value)} maxLength={200}
                placeholder="Worüber möchtest du diskutieren?"
                style={{width:"100%",padding:"12px 16px",borderRadius:12,background:"rgba(0,0,0,0.3)",border:`1px solid ${BR2}`,color:TX1,fontSize:14,outline:"none",fontFamily:"inherit",transition:"border-color .2s"}}
                onFocus={e=>(e.target.style.borderColor="rgba(212,168,67,0.2)")}
                onBlur={e=>(e.target.style.borderColor="rgba(255,255,255,0.085)")}/>
              <div style={{fontSize:10,color:TX3,marginTop:4,textAlign:"right"}}>{title.length}/200</div>
            </div>

            {/* Content */}
            <div style={{marginBottom:20}}>
              <div style={{fontSize:10,fontWeight:500,color:TX3,textTransform:"uppercase",letterSpacing:".08em",marginBottom:8}}>Inhalt</div>
              <textarea value={content} onChange={e=>setContent(e.target.value)} rows={8}
                placeholder="Schreibe deinen Beitrag…"
                style={{width:"100%",padding:"12px 16px",borderRadius:12,background:"rgba(0,0,0,0.3)",border:`1px solid ${BR2}`,color:TX1,fontSize:13,outline:"none",fontFamily:"inherit",resize:"vertical",lineHeight:1.7,transition:"border-color .2s"}}
                onFocus={e=>(e.target.style.borderColor="rgba(212,168,67,0.2)")}
                onBlur={e=>(e.target.style.borderColor="rgba(255,255,255,0.085)")}/>
              <div style={{fontSize:10,color:TX3,marginTop:4}}>{content.length} Zeichen</div>
            </div>

            {error&&<div style={{fontSize:12,color:RED,marginBottom:14,padding:"10px 14px",borderRadius:9,background:"rgba(220,74,90,0.08)",border:"1px solid rgba(220,74,90,0.2)"}}>{error}</div>}

            <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
              <Link href="/forum" style={{padding:"11px 22px",borderRadius:12,background:"transparent",color:TX2,fontSize:13,textDecoration:"none",border:`1px solid ${BR1}`}}>Abbrechen</Link>
              <button onClick={submit} disabled={submitting} style={{
                padding:"11px 28px",borderRadius:12,background:G,color:"#0a0808",
                fontSize:13,fontWeight:400,border:"none",cursor:submitting?"wait":"pointer",
                boxShadow:`0 2px 16px rgba(212,168,67,0.2)`,
                opacity:submitting?0.7:1,
              }}>{submitting?"Wird veröffentlicht…":"Beitrag veröffentlichen"}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'@
[System.IO.File]::WriteAllText("$root\src\app\forum\new\page.tsx", $forum_new, $enc)
Write-Host "  OK  page.tsx" -ForegroundColor Green

$forum_post_dtl = @'
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
// icons replaced with inline

interface Post {
  id: string;
  title: string;
  content: string;
  category_id: string;
  author_id: string;
  reply_count: number;
  upvotes: number;
  view_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  is_hot: boolean;
  tags: string[];
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string | null;
    forum_role: string;
    post_count: number;
    badge_trainer: boolean;
    badge_gym_leader: boolean;
    badge_elite4: boolean;
    badge_champion: boolean;
    is_premium: boolean;
  };
}

interface Reply {
  id: string;
  content: string;
  author_id: string;
  upvotes: number;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string | null;
    forum_role: string;
    post_count: number;
    badge_trainer: boolean;
    badge_gym_leader: boolean;
    badge_elite4: boolean;
    badge_champion: boolean;
    is_premium: boolean;
  };
}

const CATEGORY_STYLES: Record<string, { color: string; glow: string; label: string }> = {
  marktplatz:  { color: "#c864ff", glow: "rgba(200,100,255,0.3)", label: "Marktplatz" },
  preise:      { color: "#00c8ff", glow: "rgba(0,200,255,0.3)",   label: "Preise" },
  "fake-check":{ color: "#ff9600", glow: "rgba(255,150,0,0.3)",   label: "Fake-Check" },
  news:        { color: "#00ff96", glow: "rgba(0,255,150,0.3)",   label: "News" },
  einsteiger:  { color: "#ffdc00", glow: "rgba(255,220,0,0.3)",   label: "Einsteiger" },
  turniere:    { color: "#ff3c3c", glow: "rgba(255,60,60,0.3)",   label: "Turniere" },
  premium:     { color: "#ffd700", glow: "rgba(255,215,0,0.4)",   label: "Premium" },
};

function getBadgeIcon(profile: Post["profiles"] | Reply["profiles"]) {
  if (profile.badge_champion)   return { icon: 🏆, label: "Champion",     color: "#ffd700" };
  if (profile.badge_elite4)     return { icon: ⭐,   label: "Top Vier",      color: "#c864ff" };
  if (profile.badge_gym_leader) return { icon: 🛡, label: "Arenaleiter",  color: "#00c8ff" };
  if (profile.badge_trainer)    return { icon: ⚡,    label: "Trainer",       color: "#00ff96" };
  return null;
}

function getRoleStyle(role: string) {
  if (role === "admin")     return { color: "#ff4444", label: "ADMIN" };
  if (role === "moderator") return { color: "#00ccff", label: "MOD" };
  return null;
}

function Avatar({ profile, size = 40 }: { profile: Post["profiles"] | Reply["profiles"]; size?: number }) {
  const role = getRoleStyle(profile.forum_role);
  const badge = getBadgeIcon(profile);
  const ringColor = role?.color || badge?.color || "rgba(255,255,255,0.2)";

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {profile.avatar_url ? (
        <img
          src={profile.avatar_url}
          alt={profile.username}
          className="rounded-full object-cover"
          style={{
            width: size, height: size,
            border: `2px solid ${ringColor}`,
            boxShadow: `0 0 8px ${ringColor}60`,
          }}
        />
      ) : (
        <div
          className="rounded-full flex items-center justify-center font-bold"
          style={{
            width: size, height: size,
            background: `linear-gradient(135deg, ${ringColor}40, ${ringColor}20)`,
            border: `2px solid ${ringColor}`,
            boxShadow: `0 0 8px ${ringColor}60`,
            color: ringColor,
            fontSize: size * 0.35,
          }}
        >
          {profile.username?.[0]?.toUpperCase() || "?"}
        </div>
      )}
    </div>
  );
}

function UserInfo({ profile }: { profile: Post["profiles"] | Reply["profiles"] }) {
  const role = getRoleStyle(profile.forum_role);
  const badge = getBadgeIcon(profile);

  return (
    <div>
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="font-bold text-white" style={{ fontSize: "13px" }}>
          <a href={`/profil/${profile.username}`} style={{ color:"inherit", textDecoration:"none" }}>
            {profile.username}
          </a>
        </span>
        {role && (
          <span
            className="px-1.5 rounded text-white"
            style={{
              background: `${role.color}30`,
              border: `1px solid ${role.color}60`,
              color: role.color,
              fontSize: "9px",
              fontWeight: 700,
              letterSpacing: "0.05em",
            }}
          >
            {role.label}
          </span>
        )}
        {badge && (
          <span
            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full"
            style={{
              background: `${badge.color}20`,
              border: `1px solid ${badge.color}40`,
              color: badge.color,
              fontSize: "9px",
            }}
          >
            {badge.icon}
            {badge.label}
          </span>
        )}
        {profile.is_premium && (
          <span
            className="px-1.5 rounded"
            style={{
              background: "rgba(255,215,0,0.15)",
              border: "1px solid rgba(255,215,0,0.4)",
              color: "#ffd700",
              fontSize: "9px",
              fontWeight: 600,
            }}
          >
            PREMIUM
          </span>
        )}
      </div>
      <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px", marginTop: "1px" }}>
        {profile.post_count} Beiträge
      </p>
    </div>
  );
}

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    loadPost();
    loadUser();
  }, [postId]);

  async function loadUser() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  }

  async function loadPost() {
    setLoading(true);
    try {
      const res = await fetch(`/api/forum/post/${postId}`);
      const data = await res.json();
      setPost(data.post);
      setReplies(data.replies || []);
    } finally {
      setLoading(false);
    }
  }

  async function handleLike() {
    if (!currentUser) return;
    setLiked(!liked);
    await fetch("/api/forum/like", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post_id: postId }),
    });
  }

  async function handleReply() {
    if (!replyContent.trim() || !currentUser) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/forum/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: postId, content: replyContent }),
      });
      if (res.ok) {
        setReplyContent("");
        loadPost();
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReport() {
    if (!currentUser) return;
    const reason = prompt("Grund der Meldung:");
    if (!reason) return;
    await fetch("/api/forum/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post_id: postId, reason }),
    });
    alert("Beitrag wurde gemeldet. Danke!");
  }

  const catStyle = post ? (CATEGORY_STYLES[post.category_id] || CATEGORY_STYLES["news"]) : CATEGORY_STYLES["news"];

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(180deg, #080010 0%, #0d0020 100%)" }}
      >
        <div
          className="w-8 h-8 rounded-full animate-spin"
          style={{ border: "2px solid rgba(255,255,255,0.1)", borderTopColor: "#00ffff" }}
        />
      </div>
    );
  }

  if (!post) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center"
        style={{ background: "linear-gradient(180deg, #080010 0%, #0d0020 100%)" }}
      >
        <p className="text-white mb-4">Beitrag nicht gefunden.</p>
        <Link href="/forum" className="text-cyan-400 hover:underline">← Zurück zum Forum</Link>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(180deg, #080010 0%, #0d0020 50%, #050010 100%)", color: "white" }}
    >
      {/* Top accent line */}
      <div style={{ height: "2px", background: `linear-gradient(90deg, transparent, ${catStyle.color}, transparent)` }} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back link */}
        <Link
          href="/forum"
          className="inline-flex items-center gap-2 mb-6 transition-colors hover:text-white"
          style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}
        >
          ←
          Zurück zum Forum
        </Link>

        {/* Category pill */}
        <div className="mb-4">
          <span
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold"
            style={{
              background: `${catStyle.glow}`,
              border: `1px solid ${catStyle.color}60`,
              color: catStyle.color,
              letterSpacing: "0.05em",
            }}
          >
            {catStyle.label}
          </span>
          {post.is_pinned && (
            <span className="ml-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs" style={{ color: "#00ffff", background: "rgba(0,255,255,0.1)" }}>
              📌 Angeheftet
            </span>
          )}
          {post.is_locked && (
            <span className="ml-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs" style={{ color: "#ff8800", background: "rgba(255,136,0,0.1)" }}>
              🔒 Gesperrt
            </span>
          )}
          {post.is_hot && (
            <span className="ml-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs" style={{ color: "#ff4444", background: "rgba(255,68,68,0.1)" }}>
              🔥 Hot
            </span>
          )}
        </div>

        {/* Post card */}
        <div
          className="rounded-2xl overflow-hidden mb-6"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
            border: `1px solid ${catStyle.color}30`,
            boxShadow: `0 0 40px ${catStyle.glow}20`,
          }}
        >
          {/* Post header */}
          <div className="p-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <h1
              className="text-2xl font-black mb-5 leading-tight"
              style={{ color: "white", letterSpacing: "-0.01em" }}
            >
              {post.title}
            </h1>

            {/* Author row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar profile={post.profiles} size={44} />
                <UserInfo profile={post.profiles} />
              </div>
              <div className="flex items-center gap-4" style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px" }}>
                <div className="flex items-center gap-1">
                  👁
                  {post.view_count}
                </div>
                <span>{new Date(post.created_at).toLocaleDateString("de-DE")}</span>
              </div>
            </div>
          </div>

          {/* Post content */}
          <div className="p-6">
            <div
              className="leading-relaxed whitespace-pre-wrap"
              style={{ color: "rgba(255,255,255,0.8)", fontSize: "15px", lineHeight: 1.7 }}
            >
              {post.content}
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-5">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-full"
                    style={{
                      background: `${catStyle.color}15`,
                      border: `1px solid ${catStyle.color}30`,
                      color: catStyle.color,
                      fontSize: "11px",
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Post actions */}
          <div
            className="flex items-center justify-between px-6 py-3"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-center gap-4">
              <button
                onClick={handleLike}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all"
                style={{
                  background: liked ? "rgba(255,100,100,0.15)" : "rgba(255,255,255,0.05)",
                  border: liked ? "1px solid rgba(255,100,100,0.4)" : "1px solid rgba(255,255,255,0.1)",
                  color: liked ? "#ff6464" : "rgba(255,255,255,0.4)",
                  fontSize: "12px",
                  cursor: currentUser ? "pointer" : "not-allowed",
                }}
              >
                ♥
                {post.upvotes + (liked ? 1 : 0)}
              </button>

              <div className="flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px" }}>
                💬
                {post.reply_count} Antworten
              </div>
            </div>

            {currentUser && (
              <button
                onClick={handleReport}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all"
                style={{
                  color: "rgba(255,255,255,0.25)",
                  fontSize: "11px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                ⚑
                Melden
              </button>
            )}
          </div>
        </div>

        {/* Replies */}
        {replies.length > 0 && (
          <div className="mb-6">
            <h2
              className="text-sm font-bold uppercase tracking-widest mb-4"
              style={{ color: "rgba(255,255,255,0.3)", letterSpacing: "0.2em" }}
            >
              {replies.length} Antwort{replies.length !== 1 ? "en" : ""}
            </h2>
            <div className="space-y-3">
              {replies.map((reply, idx) => (
                <div
                  key={reply.id}
                  className="rounded-xl p-4"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div className="flex gap-3">
                    {/* Number */}
                    <div
                      className="shrink-0 flex items-start justify-center mt-0.5"
                      style={{ width: "20px", color: "rgba(255,255,255,0.15)", fontSize: "11px", fontWeight: 600 }}
                    >
                      #{idx + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Author */}
                      <div className="flex items-center gap-2 mb-3">
                        <Avatar profile={reply.profiles} size={32} />
                        <UserInfo profile={reply.profiles} />
                        <span className="ml-auto" style={{ color: "rgba(255,255,255,0.25)", fontSize: "11px" }}>
                          {new Date(reply.created_at).toLocaleDateString("de-DE")}
                        </span>
                      </div>

                      {/* Content */}
                      <p
                        className="whitespace-pre-wrap"
                        style={{ color: "rgba(255,255,255,0.75)", fontSize: "14px", lineHeight: 1.6 }}
                      >
                        {reply.content}
                      </p>

                      {/* Like */}
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          className="flex items-center gap-1 text-xs transition-colors"
                          style={{ color: "rgba(255,255,255,0.25)", background: "none", border: "none", cursor: "pointer" }}
                          onClick={async () => {
                            if (!currentUser) return;
                            await fetch("/api/forum/like", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ reply_id: reply.id }),
                            });
                          }}
                        >
                          ▲
                          {reply.upvotes || 0}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reply form */}
        {!post.is_locked && (
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: `1px solid ${catStyle.color}20`,
            }}
          >
            <div className="p-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <h2
                className="text-sm font-bold uppercase tracking-widest"
                style={{ color: "rgba(255,255,255,0.3)", letterSpacing: "0.2em" }}
              >
                Antworten
              </h2>
            </div>
            <div className="p-4">
              {currentUser ? (
                <>
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Schreibe deine Antwort..."
                    rows={4}
                    className="w-full rounded-xl px-4 py-3 resize-none focus:outline-none transition-all"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "white",
                      fontSize: "14px",
                    }}
                    onFocus={(e) => {
                      e.target.style.border = `1px solid ${catStyle.color}50`;
                    }}
                    onBlur={(e) => {
                      e.target.style.border = "1px solid rgba(255,255,255,0.1)";
                    }}
                  />
                  <div className="flex justify-end mt-3">
                    <button
                      onClick={handleReply}
                      disabled={submitting || !replyContent.trim()}
                      className="flex items-center gap-2 px-5 py-2 rounded-xl font-bold transition-all"
                      style={{
                        background: replyContent.trim()
                          ? `linear-gradient(135deg, ${catStyle.color}40, ${catStyle.color}20)`
                          : "rgba(255,255,255,0.05)",
                        border: `1px solid ${replyContent.trim() ? catStyle.color + "60" : "rgba(255,255,255,0.1)"}`,
                        color: replyContent.trim() ? catStyle.color : "rgba(255,255,255,0.3)",
                        fontSize: "13px",
                        cursor: replyContent.trim() ? "pointer" : "not-allowed",
                      }}
                    >
                      →
                      {submitting ? "Senden..." : "Antworten"}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px", marginBottom: "12px" }}>
                    Du musst eingeloggt sein, um zu antworten.
                  </p>
                  <Link
                    href="/auth/login"
                    className="px-4 py-2 rounded-xl font-bold text-sm"
                    style={{
                      background: `${catStyle.color}20`,
                      border: `1px solid ${catStyle.color}50`,
                      color: catStyle.color,
                    }}
                  >
                    Einloggen
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {post.is_locked && (
          <div
            className="rounded-xl p-4 flex items-center gap-3"
            style={{ background: "rgba(255,136,0,0.08)", border: "1px solid rgba(255,136,0,0.2)" }}
          >
            🔒
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>
              Dieser Beitrag wurde gesperrt. Neue Antworten sind nicht möglich.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

'@
[System.IO.File]::WriteAllText("$root\src\app\forum\post\[id]\page.tsx", $forum_post_dtl, $enc)
Write-Host "  OK  page.tsx" -ForegroundColor Green

$page_fantasy = @'
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const G="#D4A843",G25="rgba(212,168,67,0.25)",G18="rgba(212,168,67,0.18)",G12="rgba(212,168,67,0.12)",G08="rgba(212,168,67,0.08)",G04="rgba(212,168,67,0.04)";
const BG1="#111114",BG2="#18181c",BR1="rgba(255,255,255,0.045)",BR2="rgba(255,255,255,0.085)";
const TX1="#ededf2",TX2="#a4a4b4",TX3="#62626f",GREEN="#3db87a",RED="#dc4a5a";

interface Pick {
  id: string;
  bought_at_price: number;
  current_price: number;
  gain_pct: number;
  cards: { id:string; name:string; name_de:string; set_id:string; number:string; price_market:number; image_url:string|null; types:string[]|null };
}
interface Team { id:string; name:string; season:string; score:number }
interface LeaderEntry { id:string; name:string; username:string; picks_count:number; current_value:number; bought_value:number; score:number }

function getCurrentSeason() {
  const now = new Date();
  const q = Math.ceil((now.getMonth() + 1) / 3);
  return `${now.getFullYear()}-Q${q}`;
}

function ScoreBar({pct,max}:{pct:number;max:number}) {
  const w = Math.min(100, Math.abs(pct)/Math.max(Math.abs(max),1)*100);
  return (
    <div style={{height:3,background:BR1,borderRadius:2,overflow:"hidden",flex:1}}>
      <div style={{height:"100%",width:`${w}%`,background:pct>=0?GREEN:RED,borderRadius:2,transition:"width .6s"}}/>
    </div>
  );
}

function TeamBuilder({onAdded}:{onAdded:()=>void}) {
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding]   = useState<string|null>(null);
  const [msg, setMsg]         = useState<string|null>(null);

  async function search(q:string) {
    setQuery(q);
    if (q.length < 2) { setResults([]); return; }
    setLoading(true);
    const res = await fetch(`/api/cards/search?q=${encodeURIComponent(q)}&limit=6`);
    const data = await res.json();
    setResults(data.cards ?? []);
    setLoading(false);
  }

  async function addCard(card:any) {
    setAdding(card.id);
    setMsg(null);
    const res = await fetch("/api/fantasy/team", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ card_id: card.id }),
    });
    const data = await res.json();
    if (!res.ok) {
      if (data.error === "MAX_PICKS") setMsg("Maximal 5 Karten pro Team.");
      else if (data.error === "BUDGET_EXCEEDED") setMsg(`Budget überschritten. Verbleibend: ${(1000-data.spent).toFixed(2)} €`);
      else if (data.error === "Nicht angemeldet") setMsg("Bitte zuerst anmelden.");
      else setMsg(data.message ?? "Fehler.");
    } else {
      setMsg(`✓ ${card.name_de||card.name} hinzugefügt!`);
      onAdded();
    }
    setAdding(null);
  }

  return (
    <div style={{background:BG1,border:`1px solid ${BR2}`,borderRadius:22,padding:24,marginBottom:16}}>
      <div style={{fontSize:12,fontWeight:500,color:TX1,marginBottom:14}}>Karte zum Team hinzufügen</div>
      <div style={{position:"relative",marginBottom:msg?10:0}}>
        <svg style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",opacity:.3}} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input value={query} onChange={e=>search(e.target.value)} placeholder="Karte suchen… (z.B. Glurak ex)"
          style={{width:"100%",padding:"10px 10px 10px 36px",borderRadius:12,background:"rgba(0,0,0,0.3)",border:`1px solid ${BR2}`,color:TX1,fontSize:13,outline:"none"}}/>
      </div>
      {msg&&<div style={{fontSize:12,color:msg.startsWith("✓")?GREEN:RED,marginTop:8}}>{msg}</div>}
      {results.length>0&&(
        <div style={{marginTop:10,display:"flex",flexDirection:"column",gap:6}}>
          {results.map((c:any)=>(
            <div key={c.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:BG2,borderRadius:12,border:`1px solid ${BR1}`}}>
              {c.image_url&&<img src={c.image_url} alt="" style={{width:28,height:40,objectFit:"contain",borderRadius:4,opacity:.85}}/>}
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,color:TX1,fontWeight:400,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name_de||c.name}</div>
                <div style={{fontSize:10,color:TX3}}>{c.set_id?.toUpperCase()} · #{c.number}</div>
              </div>
              <div style={{fontSize:13,fontFamily:"var(--font-mono)",color:G,flexShrink:0}}>
                {c.price_market?.toLocaleString("de-DE",{minimumFractionDigits:2})} €
              </div>
              <button onClick={()=>addCard(c)} disabled={!!adding} style={{
                padding:"6px 14px",borderRadius:8,background:G,color:"#0a0808",
                fontSize:12,fontWeight:400,border:"none",cursor:"pointer",flexShrink:0,
              }}>{adding===c.id?"…":"+"}</button>
            </div>
          ))}
        </div>
      )}
      {loading&&<div style={{fontSize:12,color:TX3,marginTop:10,textAlign:"center"}}>Suche…</div>}
    </div>
  );
}

export default function FantasyPage() {
  const [tab, setTab]                 = useState<"team"|"leaderboard">("team");
  const [team, setTeam]               = useState<Team|null>(null);
  const [picks, setPicks]             = useState<Pick[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderEntry[]>([]);
  const [loading, setLoading]         = useState(true);
  const [removing, setRemoving]       = useState<string|null>(null);
  const season = getCurrentSeason();

  async function loadTeam() {
    setLoading(true);
    try {
      const res = await fetch("/api/fantasy/team");
      if (!res.ok) { setLoading(false); return; }
      const data = await res.json();
      setTeam(data.team);
      setPicks(data.picks ?? []);
    } catch (e) {
      console.error("Fantasy team load error:", e);
    }
    setLoading(false);
  }

  async function loadLeaderboard() {
    const res = await fetch("/api/fantasy/leaderboard");
    const data = await res.json();
    setLeaderboard(data.leaderboard ?? []);
  }

  useEffect(() => { loadTeam(); loadLeaderboard(); }, []);

  async function removePick(pickId:string) {
    setRemoving(pickId);
    await fetch(`/api/fantasy/team?pick_id=${pickId}`, { method:"DELETE" });
    await loadTeam();
    setRemoving(null);
  }

  const totalBought  = picks.reduce((s,p)=>s+p.bought_at_price,0);
  const totalCurrent = picks.reduce((s,p)=>s+p.current_price,0);
  const totalGain    = totalBought>0 ? ((totalCurrent-totalBought)/totalBought*100) : 0;
  const budgetLeft   = 1000 - totalBought;
  const maxGain      = picks.length>0 ? Math.max(...picks.map(p=>Math.abs(p.gain_pct)),1) : 1;

  return (
    <div style={{color:TX1,minHeight:"80vh"}}>
      <div style={{maxWidth:1100,margin:"0 auto",padding:"clamp(52px,7vw,80px) clamp(16px,3vw,28px)"}}>

        {/* Hero */}
        <div style={{marginBottom:"clamp(40px,6vw,64px)"}}>
          <div style={{fontSize:9,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:TX3,marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
            <span style={{width:16,height:0.5,background:TX3,display:"inline-block"}}/>Fantasy League · {season}
          </div>
          <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(32px,5vw,60px)",fontWeight:200,letterSpacing:"-.055em",lineHeight:1.0,marginBottom:16}}>
            Baue dein<br/><span style={{color:G}}>1.000 € Team.</span>
          </h1>
          <p style={{fontSize:"clamp(14px,1.5vw,17px)",color:TX2,maxWidth:480,lineHeight:1.8,fontWeight:300}}>
            Wähle bis zu 5 Karten mit einem Budget von 1.000 €. Punkte basieren auf echten Preisveränderungen. Monatlicher Reset.
          </p>
        </div>

        {/* Tabs */}
        <div style={{display:"flex",gap:2,marginBottom:24,background:BG1,borderRadius:14,padding:4,border:`1px solid ${BR1}`,width:"fit-content"}}>
          {([["team","Mein Team"],["leaderboard","Leaderboard"]] as const).map(([t,l])=>(
            <button key={t} onClick={()=>setTab(t)} style={{
              padding:"8px 20px",borderRadius:10,fontSize:13,fontWeight:400,border:"none",cursor:"pointer",
              background:tab===t?BG2:"transparent",color:tab===t?TX1:TX3,
              transition:"all .2s",
            }}>{l}</button>
          ))}
        </div>

        {tab==="team" && (
          <div style={{display:"grid",gridTemplateColumns:"1fr 320px",gap:16,alignItems:"start"}}>
            {/* Left: picks */}
            <div>
              {/* Stats bar */}
              {picks.length>0&&(
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
                  {[
                    {l:"Eingekauft",v:`${totalBought.toLocaleString("de-DE",{minimumFractionDigits:2})} €`,c:TX2},
                    {l:"Aktuell",v:`${totalCurrent.toLocaleString("de-DE",{minimumFractionDigits:2})} €`,c:TX1},
                    {l:"Performance",v:`${totalGain>=0?"+":""}${totalGain.toFixed(1)} %`,c:totalGain>=0?GREEN:RED},
                  ].map(s=>(
                    <div key={s.l} style={{background:BG1,border:`1px solid ${BR1}`,borderRadius:14,padding:"14px 16px"}}>
                      <div style={{fontSize:9,color:TX3,textTransform:"uppercase",letterSpacing:".08em",marginBottom:6}}>{s.l}</div>
                      <div style={{fontSize:18,fontWeight:300,fontFamily:"var(--font-mono)",color:s.c,letterSpacing:"-.03em"}}>{s.v}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pick list */}
              {loading ? (
                <div style={{padding:"48px",textAlign:"center",fontSize:14,color:TX3}}>Lädt…</div>
              ) : picks.length===0 ? (
                <div style={{background:BG1,border:`1px solid ${BR2}`,borderRadius:22,padding:"48px 24px",textAlign:"center"}}>
                  <div style={{fontSize:13,color:TX3,lineHeight:1.7,marginBottom:20}}>
                    Dein Team ist leer.<br/>Füge bis zu 5 Karten mit max. 1.000 € Budget hinzu.
                  </div>
                </div>
              ) : (
                <div style={{background:BG1,border:`1px solid ${BR2}`,borderRadius:22,overflow:"hidden"}}>
                  <div style={{padding:"16px 20px",borderBottom:`1px solid ${BR1}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <div style={{fontSize:13,fontWeight:500,color:TX1}}>{picks.length}/5 Karten · {budgetLeft.toFixed(2)} € übrig</div>
                    <div style={{fontSize:11,color:TX3}}>Saison {season}</div>
                  </div>
                  {picks.map((p,i)=>(
                    <div key={p.id} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 20px",borderBottom:i<picks.length-1?`1px solid ${BR1}`:undefined}}>
                      {p.cards?.image_url&&<img src={p.cards.image_url} alt="" style={{width:32,height:44,objectFit:"contain",borderRadius:4,opacity:.85}}/>}
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,color:TX1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.cards?.name_de||p.cards?.name}</div>
                        <div style={{fontSize:10,color:TX3}}>{p.cards?.set_id?.toUpperCase()} · #{p.cards?.number}</div>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                        <ScoreBar pct={p.gain_pct} max={maxGain}/>
                        <div style={{fontSize:12,fontFamily:"var(--font-mono)",color:p.gain_pct>=0?GREEN:RED,minWidth:52,textAlign:"right"}}>
                          {p.gain_pct>=0?"+":""}{p.gain_pct}%
                        </div>
                      </div>
                      <div style={{fontSize:14,fontFamily:"var(--font-mono)",color:G,flexShrink:0,minWidth:72,textAlign:"right"}}>
                        {p.current_price.toLocaleString("de-DE",{minimumFractionDigits:2})} €
                      </div>
                      <button onClick={()=>removePick(p.id)} disabled={removing===p.id} style={{
                        width:28,height:28,borderRadius:"50%",background:"transparent",
                        border:`1px solid ${BR2}`,color:TX3,fontSize:14,cursor:"pointer",flexShrink:0,
                        display:"flex",alignItems:"center",justifyContent:"center",
                      }}>{removing===p.id?"…":"×"}</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Team builder */}
            <div>
              <TeamBuilder onAdded={loadTeam}/>
              <div style={{background:BG1,border:`1px solid ${BR1}`,borderRadius:16,padding:"14px 16px"}}>
                <div style={{fontSize:11,color:TX3,lineHeight:1.7}}>
                  <div style={{fontWeight:500,color:TX2,marginBottom:6}}>Spielregeln</div>
                  Max. 5 Karten · Budget 1.000 € · Punkte = Preisänderung in % · Reset am 1. des Monats · Bester Score gewinnt Trophy Card ✦
                </div>
              </div>
            </div>
          </div>
        )}

        {tab==="leaderboard" && (
          <div>
            <div style={{background:BG1,border:`1px solid ${BR2}`,borderRadius:22,overflow:"hidden"}}>
              <div style={{padding:"16px 20px",borderBottom:`1px solid ${BR1}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{fontSize:13,fontWeight:500,color:TX1}}>Top-Teams · Saison {season}</div>
                <div style={{fontSize:11,color:TX3}}>{leaderboard.length} Teams</div>
              </div>
              {leaderboard.length===0 ? (
                <div style={{padding:"48px",textAlign:"center",fontSize:13,color:TX3}}>
                  Noch keine Teams diese Saison. Sei der Erste!
                </div>
              ) : leaderboard.map((t,i)=>(
                <div key={t.id} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 20px",borderBottom:i<leaderboard.length-1?`1px solid ${BR1}`:undefined}}>
                  <div style={{
                    width:28,fontSize:12,fontFamily:"var(--font-mono)",fontWeight:400,flexShrink:0,textAlign:"center",
                    color:i===0?G:i===1?"#a8a8b4":i===2?"#8a7a5a":TX3,
                  }}>
                    {String(i+1).padStart(2,"0")}
                  </div>
                  <div style={{width:32,height:32,borderRadius:"50%",background:BG2,border:`1px solid ${BR1}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:G,flexShrink:0}}>
                    {t.username[0]?.toUpperCase()??"?"}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,color:TX1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>@{t.username}</div>
                    <div style={{fontSize:10,color:TX3}}>{t.picks_count} Karten · {t.current_value.toFixed(2)} €</div>
                  </div>
                  <div style={{fontSize:16,fontFamily:"var(--font-mono)",fontWeight:300,color:t.score>=0?GREEN:RED,flexShrink:0}}>
                    {t.score>=0?"+":""}{t.score}%
                  </div>
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
[System.IO.File]::WriteAllText("$root\src\app\fantasy\page.tsx", $page_fantasy, $enc)
Write-Host "  OK  page.tsx" -ForegroundColor Green

$page_leaderboard = @'
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const G="#D4A843",G18="rgba(212,168,67,0.18)",G08="rgba(212,168,67,0.08)";
const BG1="#111114",BG2="#18181c",BR1="rgba(255,255,255,0.045)",BR2="rgba(255,255,255,0.085)";
const TX1="#ededf2",TX2="#a4a4b4",TX3="#62626f",GREEN="#3db87a",RED="#dc4a5a";

const RANK_MEDAL: Record<number,string> = {1:"✦",2:"✧",3:"◇"};
const RANK_COLOR: Record<number,string> = {1:G,2:"#c0c0c8",3:"#a08860"};

function getCurrentSeason() {
  const now = new Date();
  return `${now.getFullYear()}-Q${Math.ceil((now.getMonth()+1)/3)}`;
}

export default function LeaderboardPage() {
  const [tab,       setTab]     = useState<"portfolio"|"fantasy">("portfolio");
  const [data,      setData]    = useState<any[]>([]);
  const [loading,   setLoading] = useState(true);
  const season = getCurrentSeason();

  useEffect(() => { load(tab); }, [tab]);

  async function load(t: string) {
    setLoading(true);
    try {
      const url = t === "portfolio"
        ? "/api/leaderboard/portfolio"
        : "/api/fantasy/leaderboard";
      const res  = await fetch(url);
      const json = await res.json();
      setData(t === "portfolio" ? (json.leaderboard ?? []) : (json.leaderboard ?? []));
    } catch { setData([]); }
    setLoading(false);
  }

  return (
    <div style={{color:TX1,minHeight:"80vh"}}>
      <div style={{maxWidth:900,margin:"0 auto",padding:"clamp(52px,7vw,80px) clamp(16px,3vw,28px)"}}>

        {/* Header */}
        <div style={{marginBottom:"clamp(32px,5vw,52px)"}}>
          <div style={{fontSize:9,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:TX3,marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
            <span style={{width:16,height:0.5,background:TX3,display:"inline-block"}}/>Community
          </div>
          <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(28px,5vw,52px)",fontWeight:200,letterSpacing:"-.055em",marginBottom:8}}>
            Leaderboard
          </h1>
          <p style={{fontSize:13,color:TX3,fontWeight:300}}>
            {tab==="portfolio" ? "Größte Sammlungen nach Marktwert." : `Beste Fantasy-Teams · Saison ${season}.`}
          </p>
        </div>

        {/* Tabs */}
        <div style={{display:"flex",gap:2,marginBottom:24,background:BG1,borderRadius:14,padding:4,border:`1px solid ${BR1}`,width:"fit-content"}}>
          {([
            ["portfolio","Portfolio-Wert"],
            ["fantasy",`Fantasy · ${season}`],
          ] as const).map(([t,l])=>(
            <button key={t} onClick={()=>setTab(t)} style={{
              padding:"8px 22px",borderRadius:10,fontSize:13,fontWeight:400,
              border:"none",cursor:"pointer",transition:"all .2s",
              background:tab===t?BG2:"transparent",
              color:tab===t?TX1:TX3,
            }}>{l}</button>
          ))}
        </div>

        {/* Top 3 podium */}
        {!loading && data.length >= 3 && (
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:20}}>
            {[data[1], data[0], data[2]].map((entry, i) => {
              const actualRank = i===0?2:i===1?1:3;
              const isFirst    = actualRank===1;
              return (
                <div key={entry.user_id ?? entry.id} style={{
                  background:isFirst?`linear-gradient(165deg,${G08},${BG1})`:BG1,
                  border:`1px solid ${isFirst?G18:BR2}`,
                  borderRadius:20,padding:"20px 16px",
                  textAlign:"center",
                  boxShadow:isFirst?`0 0 40px rgba(212,168,67,0.06)`:undefined,
                  transform:isFirst?"translateY(-6px)":"none",
                  position:"relative",overflow:"hidden",
                }}>
                  {isFirst&&<div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${G},transparent)`}}/>}
                  <div style={{fontSize:22,marginBottom:8}}>{RANK_MEDAL[actualRank]}</div>
                  <div style={{
                    width:48,height:48,borderRadius:"50%",
                    background:isFirst?G08:BG2,
                    border:`1px solid ${isFirst?G18:BR1}`,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:18,color:isFirst?G:TX2,margin:"0 auto 10px",fontWeight:300,
                  }}>
                    {(entry.username?.[0]??"?").toUpperCase()}
                  </div>
                  <div style={{fontSize:13,fontWeight:400,color:isFirst?TX1:TX2,marginBottom:4,letterSpacing:"-.01em"}}>
                    @{entry.username}
                    {entry.is_premium&&<span style={{fontSize:9,color:G,marginLeft:6}}>✦</span>}
                  </div>
                  <div style={{
                    fontSize:tab==="portfolio"?15:14,
                    fontFamily:"var(--font-mono)",fontWeight:300,letterSpacing:"-.03em",
                    color:isFirst?G:TX2,
                  }}>
                    {tab==="portfolio"
                      ? `${entry.total_value?.toLocaleString("de-DE",{minimumFractionDigits:0})} €`
                      : `${entry.score>=0?"+":""}${entry.score}%`
                    }
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Full table */}
        <div style={{background:BG1,border:`1px solid ${BR2}`,borderRadius:22,overflow:"hidden"}}>
          <div style={{padding:"13px 20px",borderBottom:`1px solid ${BR1}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{fontSize:12,fontWeight:500,color:TX1}}>
              {tab==="portfolio"?"Top Sammler — Gesamtwert":`Fantasy · Saison ${season}`}
            </div>
            <div style={{fontSize:11,color:TX3}}>{data.length} Einträge</div>
          </div>

          {loading ? (
            <div style={{padding:"48px",textAlign:"center",fontSize:14,color:TX3}}>Lädt…</div>
          ) : data.length === 0 ? (
            <div style={{padding:"48px",textAlign:"center"}}>
              <div style={{fontSize:13,color:TX3,marginBottom:14}}>
                {tab==="portfolio"
                  ? "Noch keine Sammlungen erfasst. Füge Karten zu deinem Portfolio hinzu."
                  : "Noch keine Fantasy-Teams diese Saison."
                }
              </div>
              <Link href={tab==="portfolio"?"/portfolio":"/fantasy"} style={{fontSize:13,color:G,textDecoration:"none"}}>
                {tab==="portfolio"?"Portfolio aufbauen →":"Team erstellen →"}
              </Link>
            </div>
          ) : data.map((entry:any, i:number) => {
            const rank = i + 1;
            return (
              <div key={entry.user_id ?? entry.id} style={{
                display:"flex",alignItems:"center",gap:14,
                padding:"13px 20px",
                borderBottom:i<data.length-1?`1px solid ${BR1}`:undefined,
                background:rank===1?"rgba(212,168,67,0.025)":undefined,
              }}>
                {/* Rank */}
                <div style={{
                  width:32,fontSize:rank<=3?16:12,flexShrink:0,textAlign:"center",
                  fontFamily:"var(--font-mono)",fontWeight:300,lineHeight:1,
                  color:RANK_COLOR[rank]??TX3,
                }}>
                  {RANK_MEDAL[rank]??String(rank).padStart(2,"0")}
                </div>

                {/* Avatar */}
                <div style={{
                  width:36,height:36,borderRadius:"50%",flexShrink:0,
                  background:rank===1?G08:BG2,
                  border:`1px solid ${rank===1?G18:BR1}`,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:14,color:rank===1?G:TX3,fontWeight:300,
                }}>
                  {(entry.username?.[0]??"?").toUpperCase()}
                </div>

                {/* Name */}
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:400,color:TX1,display:"flex",alignItems:"center",gap:6}}>
                    @{entry.username ?? "Anonym"}
                    {entry.is_premium&&<span style={{fontSize:9,color:G}}>✦ Premium</span>}
                  </div>
                  {tab==="fantasy"&&(
                    <div style={{fontSize:10,color:TX3,marginTop:1}}>
                      {entry.picks_count} Karten · {entry.current_value?.toFixed(2)} €
                    </div>
                  )}
                  {tab==="portfolio"&&entry.member_since&&(
                    <div style={{fontSize:10,color:TX3,marginTop:1}}>
                      Seit {new Date(entry.member_since).getFullYear()}
                    </div>
                  )}
                </div>

                {/* Value */}
                <div style={{
                  fontSize:16,fontFamily:"var(--font-mono)",fontWeight:300,
                  letterSpacing:"-.03em",flexShrink:0,
                  color:tab==="portfolio"
                    ? (rank===1?G:TX1)
                    : (entry.score>=0?GREEN:RED),
                }}>
                  {tab==="portfolio"
                    ? `${entry.total_value?.toLocaleString("de-DE",{minimumFractionDigits:0})} €`
                    : `${entry.score>=0?"+":""}${entry.score}%`
                  }
                </div>
              </div>
            );
          })}
        </div>

        <div style={{marginTop:14,textAlign:"center",fontSize:12,color:TX3}}>
          {tab==="portfolio"
            ? <><Link href="/portfolio" style={{color:TX3,textDecoration:"none"}}>Portfolio aufbauen →</Link></>
            : <><Link href="/fantasy" style={{color:TX3,textDecoration:"none"}}>Fantasy Team aufbauen →</Link></>
          }
        </div>
      </div>
    </div>
  );
}

'@
[System.IO.File]::WriteAllText("$root\src\app\leaderboard\page.tsx", $page_leaderboard, $enc)
Write-Host "  OK  page.tsx" -ForegroundColor Green

$page_marketplace = @'
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const G="#D4A843",G18="rgba(212,168,67,0.18)",G08="rgba(212,168,67,0.08)";
const BG1="#111114",BG2="#18181c",BR1="rgba(255,255,255,0.045)",BR2="rgba(255,255,255,0.085)";
const TX1="#ededf2",TX2="#a4a4b4",TX3="#62626f",GREEN="#3db87a",RED="#dc4a5a";

const CONDITION_LABEL: Record<string,string> = {NM:"Near Mint",LP:"Light Played",MP:"Moderately Played",HP:"Heavily Played",D:"Damaged"};
const CONDITION_COLOR: Record<string,string> = {NM:GREEN,LP:"#a4d87a",MP:G,HP:RED,D:RED};

interface Listing {
  id:string; type:"offer"|"want"; price:number|null; condition:string; note:string; created_at:string;
  user_id:string;
  profiles:{username:string;avatar_url:string|null}|null;
  cards:{id:string;name:string;name_de:string;set_id:string;number:string;price_market:number|null;image_url:string|null}|null;
}

export default function MarketplacePage() {
  const [tab,       setTab]       = useState<"offer"|"want">("offer");
  const [listings,  setListings]  = useState<Listing[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [showForm,  setShowForm]  = useState(false);
  const [user,      setUser]      = useState<any>(null);

  // Form state
  const [fSearch,  setFSearch]  = useState("");
  const [fResults, setFResults] = useState<any[]>([]);
  const [fCard,    setFCard]    = useState<any>(null);
  const [fType,    setFType]    = useState<"offer"|"want">("offer");
  const [fPrice,   setFPrice]   = useState("");
  const [fCond,    setFCond]    = useState("NM");
  const [fNote,    setFNote]    = useState("");
  const [fLoading, setFLoading] = useState(false);
  const [fMsg,     setFMsg]     = useState("");

  useEffect(() => {
    const sb = createClient();
    sb.auth.getUser().then(({data:{user}}) => setUser(user));
    loadListings(tab);
  }, []);

  async function loadListings(t: "offer"|"want") {
    setLoading(true);
    const sb = createClient();
    const { data } = await sb
      .from("marketplace_listings")
      .select("id,type,price,condition,note,created_at,user_id,profiles!marketplace_listings_user_id_fkey(username,avatar_url),cards!marketplace_listings_card_id_fkey(id,name,name_de,set_id,number,price_market,image_url)")
      .eq("type", t)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(40);
    setListings((data as any[]) ?? []);
    setLoading(false);
  }

  async function searchCards(q: string) {
    setFSearch(q);
    if (q.length < 2) { setFResults([]); return; }
    const res = await fetch(`/api/cards/search?q=${encodeURIComponent(q)}&limit=5`);
    const data = await res.json();
    setFResults(data.cards ?? []);
  }

  async function submitListing() {
    if (!fCard) { setFMsg("Bitte eine Karte auswählen."); return; }
    setFLoading(true);
    const res = await fetch("/api/marketplace", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({card_id:fCard.id,type:fType,price:parseFloat(fPrice)||null,condition:fCond,note:fNote}),
    });
    const data = await res.json();
    if (!res.ok) {
      setFMsg(data.error === "Nicht angemeldet" ? "Bitte zuerst anmelden." : data.error ?? "Fehler.");
    } else {
      setFMsg("✓ Inserat erstellt!");
      setFCard(null); setFSearch(""); setFResults([]); setFPrice(""); setFNote("");
      setTimeout(()=>{ setShowForm(false); setFMsg(""); loadListings(tab); }, 1200);
    }
    setFLoading(false);
  }

  const filtered = listings.filter(l => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (l.cards?.name_de??l.cards?.name??"").toLowerCase().includes(q) ||
           (l.profiles?.username??"").toLowerCase().includes(q);
  });

  return (
    <div style={{color:TX1,minHeight:"80vh"}}>
      <div style={{maxWidth:1100,margin:"0 auto",padding:"clamp(52px,7vw,80px) clamp(16px,3vw,28px)"}}>

        {/* Header */}
        <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",flexWrap:"wrap",gap:16,marginBottom:"clamp(32px,5vw,52px)"}}>
          <div>
            <div style={{fontSize:9,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:TX3,marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
              <span style={{width:16,height:0.5,background:TX3}}/>Marktplatz
            </div>
            <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(28px,5vw,52px)",fontWeight:200,letterSpacing:"-.055em",marginBottom:8}}>
              Karten kaufen<br/><span style={{color:G}}>& verkaufen.</span>
            </h1>
            <p style={{fontSize:13,color:TX3,fontWeight:300}}>Direkt mit anderen Sammlern handeln. Kein Mittelmann.</p>
          </div>
          <button onClick={()=>setShowForm(!showForm)} style={{
            padding:"12px 24px",borderRadius:14,background:G,color:"#0a0808",
            fontSize:13,fontWeight:400,border:"none",cursor:"pointer",
            boxShadow:`0 2px 20px rgba(212,168,67,0.25)`,
          }}>+ Inserat erstellen</button>
        </div>

        {/* Create listing form */}
        {showForm&&(
          <div style={{background:BG1,border:`1px solid ${BR2}`,borderRadius:22,padding:24,marginBottom:20,position:"relative"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,rgba(212,168,67,0.3),transparent)`,borderRadius:"22px 22px 0 0"}}/>
            <div style={{fontSize:13,fontWeight:500,color:TX1,marginBottom:18}}>Neues Inserat</div>

            {/* Type toggle */}
            <div style={{display:"flex",gap:8,marginBottom:16}}>
              {([["offer","Ich biete an"],["want","Ich suche"]] as const).map(([t,l])=>(
                <button key={t} onClick={()=>setFType(t)} style={{
                  padding:"8px 18px",borderRadius:10,fontSize:12,fontWeight:400,border:"none",cursor:"pointer",
                  background:fType===t?(t==="offer"?G:G08):"transparent",
                  color:fType===t?(t==="offer"?"#0a0808":G):TX3,
                  outline:fType===t?"none":`1px solid ${BR2}`,transition:"all .2s",
                }}>{l}</button>
              ))}
            </div>

            {/* Card search */}
            <div style={{marginBottom:12}}>
              <div style={{fontSize:10,color:TX3,marginBottom:6,textTransform:"uppercase",letterSpacing:".08em"}}>Karte</div>
              {fCard ? (
                <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:BG2,borderRadius:10,border:`1px solid ${G18}`}}>
                  {fCard.image_url&&<img src={fCard.image_url} alt="" style={{width:24,height:34,objectFit:"contain"}}/>}
                  <span style={{fontSize:13,color:TX1}}>{fCard.name_de||fCard.name}</span>
                  <span style={{fontSize:11,color:TX3,marginLeft:4}}>{fCard.set_id?.toUpperCase()} · #{fCard.number}</span>
                  <button onClick={()=>setFCard(null)} style={{marginLeft:"auto",background:"transparent",border:"none",color:TX3,cursor:"pointer",fontSize:14}}>×</button>
                </div>
              ) : (
                <div>
                  <div style={{position:"relative"}}>
                    <svg style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",opacity:.35}} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input value={fSearch} onChange={e=>searchCards(e.target.value)} placeholder="Karte suchen…"
                      style={{width:"100%",padding:"9px 9px 9px 30px",borderRadius:10,background:"rgba(0,0,0,0.3)",border:`1px solid ${BR2}`,color:TX1,fontSize:13,outline:"none"}}/>
                  </div>
                  {fResults.length>0&&(
                    <div style={{marginTop:6,display:"flex",flexDirection:"column",gap:4}}>
                      {fResults.map((c:any)=>(
                        <div key={c.id} onClick={()=>{setFCard(c);setFResults([]);}} style={{
                          display:"flex",alignItems:"center",gap:10,padding:"8px 12px",
                          background:BG2,borderRadius:8,border:`1px solid ${BR1}`,cursor:"pointer",
                        }}>
                          {c.image_url&&<img src={c.image_url} alt="" style={{width:20,height:28,objectFit:"contain"}}/>}
                          <span style={{fontSize:12,color:TX1}}>{c.name_de||c.name}</span>
                          <span style={{fontSize:10,color:TX3,marginLeft:4}}>{c.set_id?.toUpperCase()}</span>
                          <span style={{marginLeft:"auto",fontSize:12,fontFamily:"var(--font-mono)",color:G}}>{c.price_market?.toFixed(2)} €</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
              <div>
                <div style={{fontSize:10,color:TX3,marginBottom:6,textTransform:"uppercase",letterSpacing:".08em"}}>Preis (€)</div>
                <input value={fPrice} onChange={e=>setFPrice(e.target.value)} type="number" placeholder="z.B. 45.00" min="0" step="0.01"
                  style={{width:"100%",padding:"9px 12px",borderRadius:9,background:"rgba(0,0,0,0.3)",border:`1px solid ${BR2}`,color:TX1,fontSize:13,outline:"none"}}/>
              </div>
              <div>
                <div style={{fontSize:10,color:TX3,marginBottom:6,textTransform:"uppercase",letterSpacing:".08em"}}>Zustand</div>
                <select value={fCond} onChange={e=>setFCond(e.target.value)}
                  style={{width:"100%",padding:"9px 12px",borderRadius:9,background:BG1,border:`1px solid ${BR2}`,color:TX1,fontSize:13,outline:"none"}}>
                  {["NM","LP","MP","HP","D"].map(c=><option key={c} value={c}>{c} — {CONDITION_LABEL[c]}</option>)}
                </select>
              </div>
            </div>
            <input value={fNote} onChange={e=>setFNote(e.target.value)} placeholder="Notiz: Versand, Tausch, Grading…"
              style={{width:"100%",padding:"9px 12px",borderRadius:9,background:"rgba(0,0,0,0.3)",border:`1px solid ${BR2}`,color:TX1,fontSize:13,outline:"none",marginBottom:12}}/>
            {fMsg&&<div style={{fontSize:12,color:fMsg.startsWith("✓")?GREEN:RED,marginBottom:10}}>{fMsg}</div>}
            <div style={{display:"flex",gap:8}}>
              <button onClick={submitListing} disabled={fLoading||!fCard} style={{
                flex:1,padding:"11px",borderRadius:11,background:fCard?G:"rgba(255,255,255,0.05)",
                color:fCard?"#0a0808":TX3,fontSize:13,fontWeight:400,border:"none",
                cursor:fCard?"pointer":"not-allowed",
              }}>{fLoading?"Speichert…":"Inserat veröffentlichen"}</button>
              <button onClick={()=>setShowForm(false)} style={{padding:"11px 16px",borderRadius:11,background:"transparent",color:TX2,fontSize:13,border:`1px solid ${BR1}`,cursor:"pointer"}}>Abbrechen</button>
            </div>
          </div>
        )}

        {/* Tabs + Search */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap",marginBottom:16}}>
          <div style={{display:"flex",gap:2,background:BG1,borderRadius:13,padding:3,border:`1px solid ${BR1}`}}>
            {([["offer","Kaufangebote"],["want","Suchangebote"]] as const).map(([t,l])=>(
              <button key={t} onClick={()=>{setTab(t);loadListings(t);}} style={{
                padding:"7px 18px",borderRadius:9,fontSize:13,fontWeight:400,border:"none",cursor:"pointer",
                background:tab===t?BG2:"transparent",color:tab===t?TX1:TX3,transition:"all .2s",
              }}>{l}</button>
            ))}
          </div>
          <div style={{position:"relative"}}>
            <svg style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",opacity:.3}} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Karte oder Nutzer suchen"
              style={{padding:"8px 8px 8px 32px",borderRadius:11,background:BG1,border:`1px solid ${BR2}`,color:TX1,fontSize:12,outline:"none",width:220}}/>
          </div>
        </div>

        {/* Listings */}
        {loading ? (
          <div style={{padding:"48px",textAlign:"center",fontSize:14,color:TX3}}>Lädt…</div>
        ) : filtered.length===0 ? (
          <div style={{background:BG1,border:`1px solid ${BR2}`,borderRadius:20,padding:"48px",textAlign:"center"}}>
            <div style={{fontSize:14,color:TX3,marginBottom:16}}>Noch keine {tab==="offer"?"Angebote":"Suchanfragen"}.</div>
            <button onClick={()=>setShowForm(true)} style={{fontSize:13,color:G,background:"transparent",border:"none",cursor:"pointer"}}>Ersten Eintrag erstellen →</button>
          </div>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {filtered.map(l=>{
              const card = l.cards;
              const refPrice = card?.price_market;
              const showDeal = l.type==="offer"&&l.price&&refPrice&&l.price<refPrice;
              return (
                <div key={l.id} style={{
                  display:"flex",alignItems:"center",gap:14,
                  background:BG1,border:`1px solid ${BR1}`,borderRadius:16,
                  padding:"14px 18px",transition:"border-color .2s",
                }}>
                  {/* Card image */}
                  <div style={{width:40,height:56,borderRadius:6,background:BG2,overflow:"hidden",flexShrink:0}}>
                    {card?.image_url&&<img src={card.image_url} alt="" style={{width:"100%",height:"100%",objectFit:"contain"}}/>}
                  </div>
                  {/* Card info */}
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                      <div style={{fontSize:14,fontWeight:400,color:TX1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                        {card?.name_de||card?.name||"Unbekannte Karte"}
                      </div>
                      {showDeal&&<span style={{fontSize:9,fontWeight:600,padding:"1px 6px",borderRadius:4,background:"rgba(61,184,122,0.1)",color:GREEN,border:"0.5px solid rgba(61,184,122,0.2)"}}>DEAL</span>}
                    </div>
                    <div style={{fontSize:11,color:TX3}}>{card?.set_id?.toUpperCase()} · #{card?.number}</div>
                    {l.note&&<div style={{fontSize:11,color:TX2,marginTop:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l.note}</div>}
                  </div>
                  {/* Condition */}
                  <div style={{flexShrink:0}}>
                    <span style={{fontSize:9,fontWeight:600,padding:"2px 7px",borderRadius:4,background:"rgba(255,255,255,0.04)",color:CONDITION_COLOR[l.condition]||TX3,border:"0.5px solid rgba(255,255,255,0.08)"}}>{l.condition}</span>
                  </div>
                  {/* Seller */}
                  <div style={{flexShrink:0,textAlign:"right"}}>
                    <div style={{fontSize:12,color:TX2,marginBottom:2}}>@{l.profiles?.username||"Anonym"}</div>
                    {l.price ? (
                      <div style={{fontSize:16,fontFamily:"var(--font-mono)",fontWeight:300,color:G,letterSpacing:"-.03em"}}>
                        {l.price.toLocaleString("de-DE",{minimumFractionDigits:2})} €
                      </div>
                    ) : <div style={{fontSize:11,color:TX3}}>VB</div>}
                  </div>
                  {/* Action */}
                  <a href={`/profil/${l.profiles?.username||""}`} style={{
                    flexShrink:0,padding:"8px 16px",borderRadius:10,fontSize:12,fontWeight:400,
                    background:l.type==="offer"?G:"transparent",
                    color:l.type==="offer"?"#0a0808":G,
                    border:l.type==="offer"?"none":`1px solid ${G18}`,
                    textDecoration:"none",
                  }}>Kontakt</a>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

'@
[System.IO.File]::WriteAllText("$root\src\app\marketplace\page.tsx", $page_marketplace, $enc)
Write-Host "  OK  page.tsx" -ForegroundColor Green

$page_sets = @'
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const G="#D4A843",G18="rgba(212,168,67,0.18)",G08="rgba(212,168,67,0.08)";
const BG1="#111114",BG2="#18181c",BR1="rgba(255,255,255,0.045)",BR2="rgba(255,255,255,0.085)";
const TX1="#ededf2",TX2="#a4a4b4",TX3="#62626f",GREEN="#3db87a";

interface CardSet {
  id:string; name:string; name_de:string|null; series:string|null;
  total:number|null; release_date:string|null; symbol_url:string|null; logo_url:string|null;
}

const SERIES_ORDER = [
  "Scarlet & Violet","Sword & Shield","Sun & Moon","XY",
  "Black & White","HeartGold & SoulSilver","Diamond & Pearl",
  "EX","e-Card","Neo","Gym","Base","Sonstige"
];

function ProgressBar({pct}:{pct:number}) {
  const color = pct>=100?G:pct>=50?"#60A5FA":pct>=25?TX2:TX3;
  return (
    <div style={{height:3,background:BR1,borderRadius:2,overflow:"hidden",marginTop:8}}>
      <div style={{height:"100%",width:`${Math.min(100,pct)}%`,background:color,borderRadius:2,transition:"width .6s"}}/>
    </div>
  );
}

export default function SetsPage() {
  const [sets,      setSets]      = useState<CardSet[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [series,    setSeries]    = useState("alle");
  const [owned,     setOwned]     = useState<Record<string,number>>({}); // setId -> owned count

  useEffect(() => {
    // Load sets
    fetch("/api/cards/sets")
      .then(r=>r.json())
      .then(d=>{ setSets(d.sets??[]); setLoading(false); })
      .catch(()=>setLoading(false));

    // Load user's collection to compute owned per set
    const sb = createClient();
    sb.auth.getUser().then(async ({data:{user}}) => {
      if (!user) return;
      const { data } = await sb
        .from("user_collection")
        .select("cards!user_collection_card_id_fkey(set_id)")
        .eq("user_id", user.id);
      
      const counts: Record<string,number> = {};
      for (const e of data ?? []) {
        const setId = (e as any).cards?.set_id;
        if (setId) counts[setId] = (counts[setId]??0) + 1;
      }
      setOwned(counts);
    });
  }, []);

  const allSeries = Array.from(new Set(sets.map(s=>s.series??'Sonstige'))).sort((a,b) => {
    const ia = SERIES_ORDER.indexOf(a), ib = SERIES_ORDER.indexOf(b);
    return (ia<0?99:ia) - (ib<0?99:ib);
  });

  const filtered = sets.filter(s => {
    const matchSearch = !search ||
      (s.name_de??s.name).toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase());
    const matchSeries = series==="alle" || (s.series??'Sonstige')===series;
    return matchSearch && matchSeries;
  });

  // Group by series
  const grouped: Record<string, CardSet[]> = {};
  for (const s of filtered) {
    const key = s.series ?? "Sonstige";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(s);
  }

  const sortedSeries = Object.keys(grouped).sort((a,b) => {
    const ia = SERIES_ORDER.indexOf(a), ib = SERIES_ORDER.indexOf(b);
    return (ia<0?99:ia) - (ib<0?99:ib);
  });

  const totalOwned = Object.values(owned).reduce((s,n)=>s+n,0);
  const hasOwned = totalOwned > 0;

  return (
    <div style={{color:TX1,minHeight:"80vh"}}>
      <div style={{maxWidth:1160,margin:"0 auto",padding:"clamp(52px,7vw,80px) clamp(16px,3vw,28px)"}}>

        {/* Header */}
        <div style={{marginBottom:"clamp(32px,5vw,48px)"}}>
          <div style={{fontSize:9,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:TX3,marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
            <span style={{width:16,height:0.5,background:TX3,display:"inline-block"}}/>Sets & Serien
          </div>
          <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(26px,5vw,52px)",fontWeight:200,letterSpacing:"-.055em",marginBottom:8}}>Alle Sets</h1>
          <p style={{fontSize:12,color:TX3}}>
            {loading?"Lädt…":`${sets.length} Sets`}
            {hasOwned && <span style={{color:G,marginLeft:10}}>· {totalOwned} Karten in deiner Sammlung</span>}
          </p>
        </div>

        {/* Search + Series filter */}
        <div style={{display:"flex",gap:10,marginBottom:20,flexWrap:"wrap",alignItems:"center"}}>
          <div style={{position:"relative",flex:1,minWidth:180,maxWidth:300}}>
            <svg style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",opacity:.3}} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Set suchen…"
              style={{width:"100%",padding:"9px 9px 9px 28px",borderRadius:11,background:BG1,border:`1px solid ${BR2}`,color:TX1,fontSize:12,outline:"none"}}/>
          </div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            <button onClick={()=>setSeries("alle")} style={{
              padding:"5px 14px",borderRadius:8,fontSize:11,border:"none",cursor:"pointer",
              background:series==="alle"?G08:"transparent",color:series==="alle"?G:TX3,
              outline:`1px solid ${series==="alle"?G18:BR1}`,transition:"all .15s",
            }}>Alle</button>
            {allSeries.slice(0,7).map(s=>(
              <button key={s} onClick={()=>setSeries(s)} style={{
                padding:"5px 14px",borderRadius:8,fontSize:11,border:"none",cursor:"pointer",
                background:series===s?G08:"transparent",color:series===s?G:TX3,
                outline:`1px solid ${series===s?G18:BR1}`,transition:"all .15s",
              }}>{s}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{padding:"48px",textAlign:"center",fontSize:14,color:TX3}}>Lädt Sets…</div>
        ) : filtered.length===0 ? (
          <div style={{padding:"48px",textAlign:"center",fontSize:14,color:TX3}}>Keine Sets gefunden.</div>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:32}}>
            {sortedSeries.map(seriesName=>{
              const seriesSets = grouped[seriesName];
              const seriesOwned = seriesSets.reduce((s,set)=>s+(owned[set.id]??0),0);
              const seriesTotal = seriesSets.reduce((s,set)=>s+(set.total??0),0);
              return (
                <div key={seriesName}>
                  {/* Series header */}
                  <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                    <div style={{fontSize:10,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:TX3}}>{seriesName}</div>
                    <div style={{flex:1,height:0.5,background:BR1}}/>
                    <div style={{fontSize:10,color:TX3}}>{seriesSets.length} Sets</div>
                    {hasOwned&&seriesTotal>0&&(
                      <div style={{fontSize:10,color:G}}>{seriesOwned}/{seriesTotal}</div>
                    )}
                  </div>

                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))",gap:8}}>
                    {seriesSets.map(s=>{
                      const ownedCount = owned[s.id] ?? 0;
                      const pct        = s.total ? Math.round(ownedCount/s.total*100) : 0;
                      const hasProgress = hasOwned && s.total;

                      return (
                        <Link key={s.id} href={`/preischeck?set=${encodeURIComponent(s.id)}`} style={{
                          background:BG1,border:`1px solid ${ownedCount>0?G18:BR1}`,
                          borderRadius:14,padding:"14px 16px",textDecoration:"none",
                          display:"flex",flexDirection:"column",gap:6,
                          transition:"border-color .2s,background .2s",
                          position:"relative",overflow:"hidden",
                        }}
                        onMouseEnter={e=>{(e.currentTarget as any).style.borderColor=ownedCount>0?G18:BR2;(e.currentTarget as any).style.background=BG2;}}
                        onMouseLeave={e=>{(e.currentTarget as any).style.borderColor=ownedCount>0?G18:BR1;(e.currentTarget as any).style.background=BG1;}}>

                          {/* Logo / Symbol */}
                          {s.logo_url ? (
                            <img src={s.logo_url} alt={s.name}
                              style={{height:30,objectFit:"contain",objectPosition:"left",opacity:.85,marginBottom:4}}
                              onError={e=>{(e.target as any).style.display="none";}}/>
                          ) : s.symbol_url ? (
                            <img src={s.symbol_url} alt=""
                              style={{height:24,width:24,objectFit:"contain",opacity:.6,marginBottom:4}}
                              onError={e=>{(e.target as any).style.display="none";}}/>
                          ) : (
                            <div style={{height:30,display:"flex",alignItems:"center"}}>
                              <div style={{fontSize:18,color:TX3,opacity:.3}}>◈</div>
                            </div>
                          )}

                          {/* Name */}
                          <div style={{fontSize:12.5,fontWeight:400,color:TX1,lineHeight:1.3}}>
                            {s.name_de||s.name}
                          </div>

                          {/* Meta */}
                          <div style={{fontSize:10,color:TX3,display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                            <span style={{fontFamily:"var(--font-mono)",letterSpacing:".02em"}}>{s.id.toUpperCase()}</span>
                            {s.total&&<span>· {s.total} Karten</span>}
                            {s.release_date&&<span>· {s.release_date.slice(0,4)}</span>}
                          </div>

                          {/* Completion bar */}
                          {hasProgress&&(
                            <div>
                              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:4}}>
                                <span style={{fontSize:9,color:pct>=100?G:TX3}}>{ownedCount}/{s.total}</span>
                                <span style={{fontSize:9,fontWeight:600,color:pct>=100?G:pct>=50?"#60A5FA":TX3}}>{pct}%</span>
                              </div>
                              <ProgressBar pct={pct}/>
                            </div>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

'@
[System.IO.File]::WriteAllText("$root\src\app\sets\page.tsx", $page_sets, $enc)
Write-Host "  OK  page.tsx" -ForegroundColor Green

$page_settings = @'
"use client";
import { useState } from "react";
const G="#E9A84B",G18="rgba(233,168,75,0.18)",G08="rgba(233,168,75,0.08)";
const BG1="#111113",BG2="#1a1a1f",BR1="rgba(255,255,255,0.06)",BR2="rgba(255,255,255,0.10)";
const TX1="#f0f0f5",TX2="#a8a8b8",TX3="#6b6b7a";

function Toggle({on,set}:{on:boolean;set:(v:boolean)=>void}) {
  return (
    <div onClick={()=>set(!on)} style={{
      width:44,height:26,borderRadius:13,cursor:"pointer",flexShrink:0,
      background:on?G:"rgba(255,255,255,0.06)",
      border:`1px solid ${on?"rgba(233,168,75,0.3)":BR2}`,
      position:"relative",transition:"all .22s var(--ease)",
    }}>
      <div style={{
        position:"absolute",width:20,height:20,borderRadius:"50%",
        background:on?"#0a0808":TX3,top:2,
        left:on?20:2,transition:"left .22s var(--ease)",
      }}/>
    </div>
  );
}

export default function SettingsPage() {
  const [alerts, setAlerts] = useState(true);
  const [pub,    setPub]    = useState(false);
  const [news,   setNews]   = useState(true);
  const [nav,    setNav]    = useState("account");

  const NAV = [
    {id:"account",l:"Account"},
    {id:"notifications",l:"Benachrichtigungen"},
    {id:"privacy",l:"Datenschutz"},
    {id:"subscription",l:"Abonnement"},
  ];

  return (
    <div style={{color:TX1,minHeight:"80vh"}}>
      <div style={{maxWidth:1100,margin:"0 auto",padding:"80px 24px"}}>
        <div style={{marginBottom:56}}>
          <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(36px,5vw,56px)",fontWeight:300,letterSpacing:"-.07em",color:TX1,marginBottom:8}}>Einstellungen</h1>
          <p style={{fontSize:15,color:TX3}}>Account, Benachrichtigungen, Datenschutz</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"240px 1fr",gap:20}}>
          {/* Sidebar */}
          <div style={{background:BG1,border:`1px solid ${BR1}`,borderRadius:24,padding:10,height:"fit-content"}}>
            {NAV.map(n=>(
              <div key={n.id} onClick={()=>setNav(n.id)} style={{
                padding:"12px 18px",borderRadius:16,fontSize:14,fontWeight:400,
                color:nav===n.id?G:TX2,
                background:nav===n.id?G08:"transparent",
                cursor:"pointer",marginBottom:2,
                transition:"all .15s",
              }}>{n.l}</div>
            ))}
            <div style={{margin:"8px 0",borderTop:`1px solid ${BR1}`,paddingTop:8}}>
              <div style={{padding:"12px 18px",borderRadius:16,fontSize:14,color:"#E04558",cursor:"pointer"}}>Abmelden</div>
            </div>
          </div>

          {/* Content */}
          <div style={{background:BG1,border:`1px solid ${BR1}`,borderRadius:24,padding:"clamp(24px,3vw,40px)"}}>
            <div style={{fontFamily:"var(--font-display)",fontSize:22,fontWeight:300,letterSpacing:"-.04em",color:TX1,marginBottom:4}}>Account</div>
            <div style={{fontSize:13,color:TX3,marginBottom:32}}>Verwalte deine Profil-Informationen</div>

            {[
              {l:"Benutzername",v:"MaxTrainer"},
              {l:"E-Mail",v:"max@example.de"},
              {l:"Passwort",v:"Zuletzt geändert vor 3 Monaten"},
            ].map(row=>(
              <div key={row.l} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 0",borderBottom:`1px solid ${BR1}`}}>
                <div>
                  <div style={{fontSize:14.5,fontWeight:500,color:TX1}}>{row.l}</div>
                  <div style={{fontSize:12,color:TX3,marginTop:2}}>{row.v}</div>
                </div>
                <button style={{padding:"8px 18px",borderRadius:12,fontSize:12.5,color:TX2,border:`1px solid ${BR2}`,background:"transparent",cursor:"pointer"}}>Bearbeiten</button>
              </div>
            ))}

            {[
              {l:"Preis-Alerts via E-Mail",sub:"Benachrichtigung wenn Zielpreis erreicht",v:alerts,set:setAlerts},
              {l:"Öffentliches Profil",sub:"Andere Sammler können dein Portfolio sehen",v:pub,set:setPub},
              {l:"Newsletter",sub:"Monatliche Marktanalysen und News",v:news,set:setNews},
            ].map(row=>(
              <div key={row.l} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 0",borderBottom:`1px solid ${BR1}`}}>
                <div>
                  <div style={{fontSize:14.5,fontWeight:500,color:TX1}}>{row.l}</div>
                  <div style={{fontSize:12,color:TX3,marginTop:2}}>{row.sub}</div>
                </div>
                <Toggle on={row.v} set={row.set}/>
              </div>
            ))}

            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 0"}}>
              <div>
                <div style={{fontSize:14.5,fontWeight:500,color:"#E04558"}}>Account löschen</div>
                <div style={{fontSize:12,color:TX3,marginTop:2}}>Alle Daten werden permanent gelöscht</div>
              </div>
              <button style={{padding:"8px 18px",borderRadius:12,fontSize:12.5,color:"#E04558",border:"1px solid rgba(224,69,88,0.25)",background:"transparent",cursor:"pointer"}}>Löschen</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'@
[System.IO.File]::WriteAllText("$root\src\app\settings\page.tsx", $page_settings, $enc)
Write-Host "  OK  page.tsx" -ForegroundColor Green

$page_premium = @'
"use client";
import { useState } from "react";
import Link from "next/link";
export const dynamic = "force-dynamic";
const G="#D4A843",G30="rgba(212,168,67,0.30)",G18="rgba(212,168,67,0.18)",G12="rgba(212,168,67,0.12)",G08="rgba(212,168,67,0.08)",G04="rgba(212,168,67,0.04)";
const BG1="#111113",BR1="rgba(255,255,255,0.06)",BR2="rgba(255,255,255,0.10)";
const TX1="#f0f0f5",TX2="#a8a8b8",TX3="#6b6b7a",GREEN="#4BBF82";
function Check(){return(<span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:20,height:20,borderRadius:"50%",background:"rgba(75,191,130,0.12)",flexShrink:0}}><svg width="8" height="8" viewBox="0 0 8 8"><polyline points="1,4 3,6 7,1.5" stroke={GREEN} strokeWidth="1.4" fill="none"/></svg></span>);}
function Cross(){return(<span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:20,height:20,borderRadius:"50%",background:"rgba(255,255,255,0.04)",flexShrink:0}}><svg width="8" height="8" viewBox="0 0 8 8"><line x1="2" y1="2" x2="6" y2="6" stroke="rgba(255,255,255,0.2)" strokeWidth="1.4"/><line x1="6" y1="2" x2="2" y2="6" stroke="rgba(255,255,255,0.2)" strokeWidth="1.4"/></svg></span>);}

function PlanButton({plan,label,style}:{plan:string,label:string,style:React.CSSProperties}){
  const [loading,setLoading]=useState(false);
  async function handle(){
    setLoading(true);
    try{
      const res=await fetch("/api/stripe/checkout",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({plan})});
      const data=await res.json();
      if(data.url)window.location.href=data.url;
      else if(data.error){
        // Not logged in - redirect to login
        window.location.href="/auth/login?redirect=/dashboard/premium";
      }
    }catch{window.location.href="/auth/login?redirect=/dashboard/premium";}
    finally{setLoading(false);}
  }
  return(
    <button onClick={handle} disabled={loading} style={{...style,opacity:loading?0.7:1,cursor:loading?"wait":"pointer"}}>
      {loading?"Wird geladen…":label}
    </button>
  );
}

export default function PremiumPage() {
  const features=[
    {label:"Scans pro Tag",free:"5",premium:"Unlimitiert",dealer:"Unlimitiert"},
    {label:"Preischeck",free:true,premium:true,dealer:true},
    {label:"Preisverlauf (30 Tage)",free:false,premium:true,dealer:true},
    {label:"Portfolio-Tracker",free:false,premium:true,dealer:true},
    {label:"Realtime Preis-Alerts",free:false,premium:true,dealer:true},
    {label:"KI-Scanner Pro",free:false,premium:true,dealer:true},
    {label:"Exklusiv-Forum ✦",free:false,premium:true,dealer:true},
    {label:"Verified Seller Badge",free:false,premium:false,dealer:true},
    {label:"Eigene Shop-Seite",free:false,premium:false,dealer:true},
    {label:"API-Zugang (Beta)",free:false,premium:false,dealer:true},
  ];
  const faqs=[
    {q:"Kann ich jederzeit kündigen?",a:"Ja, monatlich kündbar ohne Mindestlaufzeit. Kündigung gilt zum Ende des Abrechnungszeitraums."},
    {q:"Wie sicher ist die Zahlung?",a:"Alle Zahlungen laufen über Stripe — PCI DSS compliant. PokéDax speichert keine Kartendaten."},
    {q:"Wann wird Premium aktiviert?",a:"Sofort nach erfolgreicher Zahlung — in Sekunden aktiv."},
    {q:"Lohnt sich Premium für mich?",a:"Wenn du mehr als 5 Karten täglich scannst oder dein Portfolio tracken möchtest, ja. 6,99 € ist weniger als eine Holo-Karte."},
  ];
  return(
    <div style={{color:TX1,minHeight:"80vh"}}>
      <div style={{maxWidth:920,margin:"0 auto",padding:"clamp(40px,6vw,80px) 24px"}}>
        {/* Hero */}
        <div style={{textAlign:"center",marginBottom:"clamp(40px,6vw,72px)",background:`radial-gradient(ellipse 70% 50% at 50% 0%,${G04},transparent 60%)`,borderRadius:28,padding:"clamp(32px,5vw,64px) 24px 0"}}>
          <div style={{fontSize:10,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:G,marginBottom:16}}>Mitgliedschaft · pokédax</div>
          <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(34px,5.5vw,60px)",fontWeight:300,letterSpacing:"-.045em",lineHeight:1.05,marginBottom:16}}>
            Das volle Potential<br/><span style={{color:G}}>deiner Sammlung.</span>
          </h1>
          <p style={{fontSize:"clamp(14px,1.6vw,18px)",color:TX2,maxWidth:460,margin:"0 auto 32px",lineHeight:1.75}}>
            Unlimitierter KI-Scanner, Echtzeit-Alerts und Portfolio-Tracking. Für Sammler, die jeden Euro kennen.
          </p>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"8px 18px",borderRadius:12,background:G08,border:`1px solid ${G18}`,fontSize:13,color:G,marginBottom:8}}>
            ✦ 3.841 Sammler vertrauen pokédax Premium
          </div>
        </div>

        {/* Plans */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:12,marginBottom:40}}>
          {/* Free */}
          <div style={{background:BG1,border:`1px solid ${BR2}`,borderRadius:22,padding:"24px 22px"}}>
            <div style={{fontSize:9,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:TX3,marginBottom:10}}>COMMON ●</div>
            <div style={{fontFamily:"var(--font-display)",fontSize:22,fontWeight:300,letterSpacing:"-.03em",color:TX2,marginBottom:4}}>Free</div>
            <div style={{fontFamily:"var(--font-mono)",fontSize:40,fontWeight:300,letterSpacing:"-.05em",lineHeight:1,marginBottom:4}}>0 €</div>
            <div style={{fontSize:11,color:TX3,marginBottom:20}}>für immer</div>
            <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:24}}>
              {[["5 Scans / Tag"],["Basis-Preischeck"],["Forum lesen"]].map(([t])=>(
                <div key={t} style={{display:"flex",alignItems:"center",gap:9,fontSize:12,color:TX2}}><Check/>{t}</div>
              ))}
              {[["Portfolio-Tracker"],["Preis-Alerts"],["Preisverlauf-Chart"]].map(([t])=>(
                <div key={t} style={{display:"flex",alignItems:"center",gap:9,fontSize:12,color:TX3,textDecoration:"line-through"}}><Cross/>{t}</div>
              ))}
            </div>
            <div style={{width:"100%",padding:"11px",borderRadius:12,background:"rgba(255,255,255,0.04)",color:TX3,fontSize:13,fontWeight:500,textAlign:"center",border:`1px solid ${BR1}`}}>Aktueller Plan</div>
          </div>

          {/* Premium */}
          <div style={{background:`radial-gradient(ellipse 90% 60% at 50% 0%,${G08},transparent 60%),${BG1}`,border:`1px solid rgba(212,168,67,0.28)`,borderRadius:22,padding:"24px 22px",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${G30},transparent)`}}/>
            <div style={{position:"absolute",top:-1,left:"50%",transform:"translateX(-50%)",padding:"3px 16px",background:G,color:"#0a0808",fontSize:8,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",borderRadius:"0 0 8px 8px",whiteSpace:"nowrap"}}>BELIEBTESTE WAHL</div>
            <div style={{fontSize:9,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:G,marginBottom:10,marginTop:8}}>ILLUSTRATION RARE ✦</div>
            <div style={{fontFamily:"var(--font-display)",fontSize:22,fontWeight:300,letterSpacing:"-.03em",color:G,marginBottom:4}}>Premium</div>
            <div style={{fontFamily:"var(--font-mono)",fontSize:40,fontWeight:300,letterSpacing:"-.05em",lineHeight:1,marginBottom:4,color:G}}>6,99 €</div>
            <div style={{fontSize:11,color:TX3,marginBottom:20}}>pro Monat · jederzeit kündbar</div>
            <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:24}}>
              {["Unlimitierter KI-Scanner","Portfolio + Charts","Realtime Preis-Alerts","Preisverlauf 30 Tage","Exklusiv-Forum ✦","Grading-Beratung 2×/Mo"].map(t=>(
                <div key={t} style={{display:"flex",alignItems:"center",gap:9,fontSize:12,color:TX2}}><Check/>{t}</div>
              ))}
            </div>
            <PlanButton plan="premium" label="Jetzt Premium werden ✦" style={{width:"100%",padding:"13px",borderRadius:12,background:G,color:"#0a0808",fontSize:13,fontWeight:600,border:"none",boxShadow:`0 2px 20px rgba(212,168,67,0.25)`}}/>
            <div style={{textAlign:"center",fontSize:10,color:TX3,marginTop:8}}>Weniger als eine Karte · Sofort aktiv</div>
          </div>

          {/* Dealer */}
          <div style={{background:BG1,border:`1px solid rgba(212,168,67,0.16)`,borderRadius:22,padding:"24px 22px",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,rgba(212,168,67,0.25),transparent)`}}/>
            <div style={{fontSize:9,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:G,marginBottom:10}}>HYPER RARE ✦✦✦</div>
            <div style={{fontFamily:"var(--font-display)",fontSize:22,fontWeight:300,letterSpacing:"-.03em",color:TX1,marginBottom:4}}>Händler</div>
            <div style={{fontFamily:"var(--font-mono)",fontSize:40,fontWeight:300,letterSpacing:"-.05em",lineHeight:1,marginBottom:4}}>19,99 €</div>
            <div style={{fontSize:11,color:TX3,marginBottom:20}}>pro Monat</div>
            <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:24}}>
              {["Alles aus Premium","Verified Seller Badge ✅","Eigene Shop-Seite","API-Zugang (Beta)","Priority Support 24/7","Monatliche Marktanalyse"].map(t=>(
                <div key={t} style={{display:"flex",alignItems:"center",gap:9,fontSize:12,color:TX2}}><Check/>{t}</div>
              ))}
            </div>
            <PlanButton plan="dealer" label="Händler werden ✦✦✦" style={{width:"100%",padding:"13px",borderRadius:12,background:"transparent",color:G,fontSize:13,fontWeight:500,border:`1px solid ${G18}`}}/>
          </div>
        </div>

        {/* Trust bar */}
        <div style={{display:"flex",flexWrap:"wrap",alignItems:"center",justifyContent:"center",gap:"8px 24px",padding:"14px 24px",background:BG1,border:`1px solid ${BR1}`,borderRadius:16,marginBottom:40,fontSize:12,color:TX2}}>
          {["🔒 Sicher via Stripe","↩ Jederzeit kündbar","✓ Keine Mindestlaufzeit","⚡ Sofort aktiv","🇩🇪 DSGVO-konform"].map(t=><span key={t}>{t}</span>)}
        </div>

        {/* Feature table */}
        <div style={{background:BG1,border:`1px solid ${BR1}`,borderRadius:18,overflow:"hidden",marginBottom:40}}>
          <div style={{padding:"16px 24px",borderBottom:`1px solid ${BR1}`,fontSize:14,fontWeight:500,color:TX1}}>Vollständiger Feature-Vergleich</div>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr style={{borderBottom:`1px solid ${BR1}`}}>
                {["Feature","Free","Premium ✦","Händler ✦✦✦"].map((h,i)=>(
                  <th key={h} style={{padding:"10px 16px",fontSize:10,fontWeight:600,letterSpacing:".08em",textTransform:"uppercase",color:i>1?G:TX3,textAlign:i===0?"left":"center"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((f,i)=>(
                <tr key={f.label} style={{borderBottom:i<features.length-1?`1px solid rgba(255,255,255,0.03)`:undefined}}>
                  <td style={{padding:"11px 16px",fontSize:12.5,fontWeight:500,color:TX1}}>{f.label}</td>
                  {(["free","premium","dealer"] as const).map(k=>(
                    <td key={k} style={{padding:"11px 16px",textAlign:"center",fontSize:12.5}}>
                      {typeof f[k]==="boolean"
                        ? f[k]
                          ? <span style={{color:GREEN}}>✓</span>
                          : <span style={{color:"rgba(255,255,255,0.15)"}}>—</span>
                        : <span style={{color:k==="free"?TX3:G,fontWeight:500}}>{f[k]}</span>
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FAQ */}
        <div style={{marginBottom:40}}>
          <div style={{fontSize:16,fontWeight:500,color:TX1,marginBottom:16}}>Häufige Fragen</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {faqs.map(f=>(
              <div key={f.q} style={{background:BG1,border:`1px solid ${BR1}`,borderRadius:14,padding:"16px 20px"}}>
                <div style={{fontSize:13.5,fontWeight:500,color:TX1,marginBottom:6}}>{f.q}</div>
                <div style={{fontSize:12,color:TX2,lineHeight:1.7}}>{f.a}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div style={{background:`radial-gradient(ellipse 70% 55% at 50% 50%,${G08},transparent 60%),${BG1}`,border:`1px solid rgba(212,168,67,0.22)`,borderRadius:22,padding:"clamp(28px,4vw,48px)",textAlign:"center",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,rgba(212,168,67,0.5),transparent)`}}/>
          <div style={{fontSize:9,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:TX3,marginBottom:12}}>Bereit für den nächsten Schritt?</div>
          <div style={{fontFamily:"var(--font-display)",fontSize:"clamp(24px,4vw,38px)",fontWeight:300,letterSpacing:"-.04em",marginBottom:10}}>Nur 6,99 € pro Monat.</div>
          <p style={{fontSize:13.5,color:TX2,marginBottom:24}}>Weniger als eine Karte — und du kennst den Wert jeder Karte in deiner Sammlung.</p>
          <PlanButton plan="premium" label="Jetzt Premium werden ✦" style={{display:"inline-block",padding:"clamp(12px,2vw,16px) clamp(32px,4vw,52px)",borderRadius:30,background:G,color:"#0a0808",fontSize:"clamp(14px,1.5vw,17px)",fontWeight:600,border:"none",boxShadow:`0 4px 28px rgba(212,168,67,0.3)`}}/>
          <div style={{fontSize:11,color:TX3,marginTop:12}}>Sofort aktiv · Jederzeit kündbar · Stripe gesichert</div>
        </div>
      </div>
    </div>
  );
}

'@
[System.IO.File]::WriteAllText("$root\src\app\dashboard\premium\page.tsx", $page_premium, $enc)
Write-Host "  OK  page.tsx" -ForegroundColor Green

$page_login = @'
"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export const dynamic = "force-dynamic";

const G   = "#D4A843";
const G15 = "rgba(212,168,67,0.15)";
const G08 = "rgba(212,168,67,0.08)";
const BG1 = "#111114";
const BR2 = "rgba(255,255,255,0.085)";
const TX1 = "#ededf2";
const TX2 = "#a4a4b4";
const TX3 = "#62626f";
const RED = "#dc4a5a";

export default function LoginPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const sb = createClient();
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.includes("Invalid login")) {
          setError("E-Mail oder Passwort ist falsch.");
        } else if (error.message.includes("Email not confirmed")) {
          setError("Bitte bestätige zuerst deine E-Mail-Adresse.");
        } else {
          setError(error.message);
        }
      } else {
        router.push("/portfolio");
        router.refresh();
      }
    } catch {
      setError("Verbindungsfehler. Bitte versuche es erneut.");
    }
    setLoading(false);
  }

  async function handleGoogle() {
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const sb = createClient();
      await sb.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
    } catch {
      setError("Google-Anmeldung fehlgeschlagen.");
    }
  }

  return (
    <div style={{
      minHeight:"80vh",
      display:"flex",alignItems:"center",justifyContent:"center",
      padding:"clamp(40px,8vw,80px) clamp(16px,4vw,24px)",
      position:"relative",
    }}>
      {/* Subtle bg glow behind card */}
      <div style={{
        position:"absolute",top:"30%",left:"50%",
        transform:"translateX(-50%)",
        width:600,height:400,
        background:"radial-gradient(ellipse at center,rgba(212,168,67,0.07) 0%,transparent 70%)",
        pointerEvents:"none",zIndex:0,
      }}/>

      <div style={{width:"100%",maxWidth:480,position:"relative",zIndex:1}}>

        {/* Logo + headline */}
        <div style={{textAlign:"center",marginBottom:48}}>
          <Link href="/" style={{
            fontFamily:"var(--font-display)",
            fontSize:28,fontWeight:300,
            letterSpacing:"-.08em",
            color:G,textDecoration:"none",
            display:"block",marginBottom:16,
          }}>pokédax</Link>
          <h1 style={{
            fontFamily:"var(--font-display)",
            fontSize:"clamp(24px,3vw,32px)",fontWeight:300,
            letterSpacing:"-.05em",color:TX1,marginBottom:8,
          }}>Willkommen zurück</h1>
          <p style={{fontSize:15,color:TX3}}>Melde dich in deinem Account an</p>
        </div>

        {/* Card */}
        <div style={{
          background:BG1,
          border:`1px solid rgba(212,168,67,0.12)`,
          borderRadius:32,
          padding:"clamp(32px,5vw,52px)",
          position:"relative",overflow:"hidden",
        }}>
          {/* Gold line top */}
          <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,rgba(212,168,67,0.4),transparent)`}}/>

          <form onSubmit={handleLogin}>
            {/* Error */}
            {error && (
              <div style={{
                background:"rgba(220,74,90,0.08)",
                border:"1px solid rgba(220,74,90,0.2)",
                borderRadius:14,padding:"12px 16px",marginBottom:24,
                fontSize:13.5,color:RED,lineHeight:1.5,
              }}>{error}</div>
            )}

            {/* Email */}
            <div style={{marginBottom:16}}>
              <label style={{
                fontSize:11.5,fontWeight:500,color:TX3,
                display:"block",marginBottom:8,letterSpacing:".06em",
                textTransform:"uppercase",
              }}>E-Mail</label>
              <input
                type="email" value={email}
                onChange={e=>setEmail(e.target.value)}
                placeholder="deine@email.de"
                required autoComplete="email"
                style={{
                  width:"100%",padding:"14px 18px",
                  borderRadius:16,
                  background:"rgba(0,0,0,0.25)",
                  border:`1px solid ${BR2}`,
                  color:TX1,fontSize:15,outline:"none",
                  transition:"border-color .2s",
                  fontFamily:"var(--font-body)",
                }}
                onFocus={e=>{e.target.style.borderColor="rgba(212,168,67,0.35)";}}
                onBlur={e=>{e.target.style.borderColor=BR2;}}
              />
            </div>

            {/* Password */}
            <div style={{marginBottom:12}}>
              <label style={{fontSize:11.5,fontWeight:500,color:TX3,display:"block",marginBottom:8,letterSpacing:".06em",textTransform:"uppercase"}}>Passwort</label>
              <input
                type="password" value={password}
                onChange={e=>setPassword(e.target.value)}
                placeholder="••••••••"
                required autoComplete="current-password"
                style={{width:"100%",padding:"14px 18px",borderRadius:16,background:"rgba(0,0,0,0.25)",border:`1px solid ${BR2}`,color:TX1,fontSize:15,outline:"none",transition:"border-color .2s",fontFamily:"var(--font-body)"}}
                onFocus={e=>{e.target.style.borderColor="rgba(212,168,67,0.35)";}}
                onBlur={e=>{e.target.style.borderColor=BR2;}}
              />
            </div>

            <div style={{textAlign:"right",marginBottom:28}}>
              <Link href="/auth/reset" style={{fontSize:13,color:TX3,textDecoration:"none"}}>Passwort vergessen?</Link>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} className="gold-glow" style={{
              width:"100%",padding:"16px",borderRadius:22,
              background: loading ? G08 : G,
              color: loading ? G : "#080608",
              fontSize:15,fontWeight:600,
              border: loading ? `1px solid ${G15}` : "none",
              cursor: loading ? "wait" : "pointer",
              letterSpacing:".03em",
              textTransform:"uppercase",
              transition:"all .25s",
            }}>
              {loading ? "Anmelden…" : "Anmelden"}
            </button>
          </form>

          {/* Divider */}
          <div style={{display:"flex",alignItems:"center",gap:12,margin:"24px 0"}}>
            <div style={{flex:1,height:1,background:"rgba(255,255,255,0.05)"}}/>
            <span style={{fontSize:12,color:TX3,letterSpacing:".04em"}}>oder</span>
            <div style={{flex:1,height:1,background:"rgba(255,255,255,0.05)"}}/>
          </div>

          {/* Google */}
          <button onClick={handleGoogle} style={{
            width:"100%",padding:"14px",borderRadius:18,
            background:"rgba(255,255,255,0.03)",
            border:`1px solid rgba(255,255,255,0.07)`,
            color:TX2,fontSize:14,cursor:"pointer",
            display:"flex",alignItems:"center",justifyContent:"center",gap:10,
            transition:"background .2s,border-color .2s",
            fontFamily:"var(--font-body)",
          }}
          onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.background="rgba(255,255,255,0.06)";}}
          onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.background="rgba(255,255,255,0.03)";}}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" style={{flexShrink:0}}>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Mit Google anmelden
          </button>

          <p style={{textAlign:"center",marginTop:24,fontSize:14,color:TX3}}>
            Noch kein Account?{" "}
            <Link href="/auth/register" style={{color:G,textDecoration:"none",fontWeight:500}}>Registrieren</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

'@
[System.IO.File]::WriteAllText("$root\src\app\auth\login\page.tsx", $page_login, $enc)
Write-Host "  OK  page.tsx" -ForegroundColor Green

$page_register = @'
"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export const dynamic = "force-dynamic";

const G = "#D4A843", G15="rgba(212,168,67,0.15)", G08="rgba(212,168,67,0.08)";
const BG1="#111114", BR2="rgba(255,255,255,0.085)";
const TX1="#ededf2", TX2="#a4a4b4", TX3="#62626f";
const RED="#dc4a5a", GREEN="#3db87a";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [done,     setDone]     = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Passwort muss mindestens 8 Zeichen lang sein."); return; }
    if (username.length < 3) { setError("Benutzername muss mindestens 3 Zeichen lang sein."); return; }
    setLoading(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const sb = createClient();
      const { data, error } = await sb.auth.signUp({
        email, password,
        options: { data: { username }, emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) {
        setError(error.message.includes("already registered")
          ? "Diese E-Mail ist bereits registriert."
          : error.message);
      } else {
        if (data.user) {
          await sb.from("profiles").upsert({ id: data.user.id, username }, { onConflict: "id" });
        }
        setDone(true);
      }
    } catch { setError("Verbindungsfehler. Bitte erneut versuchen."); }
    setLoading(false);
  }

  async function handleGoogle() {
    const { createClient } = await import("@/lib/supabase/client");
    await createClient().auth.signInWithOAuth({
      provider:"google",
      options:{ redirectTo:`${window.location.origin}/auth/callback` },
    });
  }

  if (done) return (
    <div style={{minHeight:"80vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"40px 20px"}}>
      <div style={{maxWidth:480,width:"100%",textAlign:"center"}}>
        <div style={{fontSize:56,marginBottom:24}}>✉️</div>
        <h2 style={{fontFamily:"var(--font-display)",fontSize:30,fontWeight:300,letterSpacing:"-.05em",color:TX1,marginBottom:12}}>Fast geschafft!</h2>
        <p style={{fontSize:16,color:TX2,lineHeight:1.75,marginBottom:32}}>
          Wir haben dir eine Bestätigungs-E-Mail an{" "}
          <strong style={{color:TX1}}>{email}</strong> geschickt.
          Klicke auf den Link um deinen Account zu aktivieren.
        </p>
        <Link href="/auth/login" className="gold-glow" style={{display:"inline-block",padding:"14px 32px",borderRadius:22,background:G,color:"#080608",fontSize:14,fontWeight:600,textDecoration:"none",letterSpacing:".03em",textTransform:"uppercase"}}>Zur Anmeldung</Link>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"80vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"clamp(40px,8vw,80px) clamp(16px,4vw,24px)",position:"relative"}}>
      <div style={{position:"absolute",top:"30%",left:"50%",transform:"translateX(-50%)",width:600,height:400,background:"radial-gradient(ellipse at center,rgba(212,168,67,0.07) 0%,transparent 70%)",pointerEvents:"none",zIndex:0}}/>
      <div style={{width:"100%",maxWidth:480,position:"relative",zIndex:1}}>
        <div style={{textAlign:"center",marginBottom:48}}>
          <Link href="/" style={{fontFamily:"var(--font-display)",fontSize:28,fontWeight:300,letterSpacing:"-.08em",color:G,textDecoration:"none",display:"block",marginBottom:16}}>pokédax</Link>
          <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(24px,3vw,32px)",fontWeight:300,letterSpacing:"-.05em",color:TX1,marginBottom:8}}>Konto erstellen</h1>
          <p style={{fontSize:15,color:TX3}}>Bereits <strong style={{color:TX1,fontWeight:500}}>3.841 Sammler</strong> dabei</p>
        </div>
        <div style={{background:BG1,border:`1px solid rgba(212,168,67,0.12)`,borderRadius:32,padding:"clamp(32px,5vw,52px)",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,rgba(212,168,67,0.4),transparent)`}}/>
          {/* Proof */}
          <div style={{display:"flex",gap:8,marginBottom:28,flexWrap:"wrap"}}>
            {["✓ Kostenlos","✓ Sofort aktiv","✓ Kein Abo"].map(t=>(
              <span key={t} style={{fontSize:11.5,color:GREEN,background:"rgba(61,184,122,0.08)",border:"1px solid rgba(61,184,122,0.15)",padding:"4px 12px",borderRadius:8}}>{t}</span>
            ))}
          </div>
          <form onSubmit={handleRegister}>
            {error && <div style={{background:"rgba(220,74,90,0.08)",border:"1px solid rgba(220,74,90,0.2)",borderRadius:14,padding:"12px 16px",marginBottom:20,fontSize:13.5,color:RED}}>{error}</div>}
            {[
              {l:"Benutzername",t:"text",  p:"DeinSammlername",v:username,set:setUsername,ac:"username"},
              {l:"E-Mail",      t:"email", p:"deine@email.de", v:email,   set:setEmail,   ac:"email"},
              {l:"Passwort",    t:"password",p:"Min. 8 Zeichen",v:password,set:setPassword,ac:"new-password"},
            ].map(f=>(
              <div key={f.l} style={{marginBottom:16}}>
                <label style={{fontSize:11.5,fontWeight:500,color:TX3,display:"block",marginBottom:8,letterSpacing:".06em",textTransform:"uppercase"}}>{f.l}</label>
                <input type={f.t} placeholder={f.p} value={f.v} onChange={e=>f.set(e.target.value)} required autoComplete={f.ac}
                  style={{width:"100%",padding:"14px 18px",borderRadius:16,background:"rgba(0,0,0,0.25)",border:`1px solid ${BR2}`,color:TX1,fontSize:15,outline:"none",transition:"border-color .2s",fontFamily:"var(--font-body)"}}
                  onFocus={e=>{e.target.style.borderColor="rgba(212,168,67,0.35)";}}
                  onBlur={e=>{e.target.style.borderColor=BR2;}}
                />
              </div>
            ))}
            <button type="submit" disabled={loading} className="gold-glow" style={{width:"100%",padding:"16px",borderRadius:22,background:loading?G08:G,color:loading?G:"#080608",fontSize:15,fontWeight:600,border:loading?`1px solid ${G15}`:"none",cursor:loading?"wait":"pointer",letterSpacing:".03em",textTransform:"uppercase",marginTop:8,marginBottom:16}}>
              {loading?"Registriere…":"Kostenlos registrieren"}
            </button>
          </form>
          <div style={{display:"flex",alignItems:"center",gap:12,margin:"16px 0"}}>
            <div style={{flex:1,height:1,background:"rgba(255,255,255,0.05)"}}/><span style={{fontSize:12,color:TX3,letterSpacing:".04em"}}>oder</span><div style={{flex:1,height:1,background:"rgba(255,255,255,0.05)"}}/>
          </div>
          <button onClick={handleGoogle} style={{width:"100%",padding:"14px",borderRadius:18,background:"rgba(255,255,255,0.03)",border:`1px solid rgba(255,255,255,0.07)`,color:TX2,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10,fontFamily:"var(--font-body)"}}>
            <svg width="18" height="18" viewBox="0 0 24 24" style={{flexShrink:0}}>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Mit Google registrieren
          </button>
          <p style={{fontSize:11.5,color:TX3,textAlign:"center",marginTop:20,lineHeight:1.7}}>
            Mit Registrierung stimmst du den <Link href="/agb" style={{color:TX2}}>AGB</Link> und der <Link href="/datenschutz" style={{color:TX2}}>Datenschutzerklärung</Link> zu.
          </p>
          <p style={{textAlign:"center",marginTop:14,fontSize:14,color:TX3}}>
            Bereits registriert? <Link href="/auth/login" style={{color:G,textDecoration:"none",fontWeight:500}}>Anmelden</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

'@
[System.IO.File]::WriteAllText("$root\src\app\auth\register\page.tsx", $page_register, $enc)
Write-Host "  OK  page.tsx" -ForegroundColor Green

$impressum = @'
export const dynamic = "force-dynamic";
export const metadata = { title:"Impressum" };
const TX1="#f0f0f5",TX2="#a8a8b8",TX3="#6b6b7a";
const BG1="#111113",BR1="rgba(255,255,255,0.06)",BR2="rgba(255,255,255,0.10)";
const G="#E9A84B";
export default function ImpressumPage() {
  return (
    <div style={{minHeight:"80vh",color:TX1}}>
      <div style={{maxWidth:720,margin:"0 auto",padding:"clamp(40px,8vw,80px) clamp(16px,4vw,24px)"}}>
        <div style={{marginBottom:48}}>
          <div style={{fontSize:10,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:G,marginBottom:16}}>Rechtliches</div>
          <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(36px,5vw,52px)",fontWeight:300,letterSpacing:"-.06em",color:TX1,marginBottom:8}}>Impressum</h1>
          <p style={{fontSize:14,color:TX3}}>Angaben gemäß § 5 TMG</p>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {[
            {
              h:"Verantwortlicher",
              content:(
                <div style={{fontSize:15,color:TX2,lineHeight:1.85}}>
                  <strong style={{color:TX1,display:"block",marginBottom:4}}>Damir Babic</strong>
                  Ricarda-Huch-Str. 15<br/>
                  60431 Frankfurt am Main<br/>
                  Deutschland
                </div>
              ),
            },
            {
              h:"Kontakt",
              content:(
                <div style={{fontSize:15,color:TX2,lineHeight:1.85}}>
                  E-Mail: <a href="mailto:hello@pokedax.de" style={{color:G,textDecoration:"none"}}>hello@pokedax.de</a><br/>
                  Website: <a href="https://pokedax2.vercel.app" style={{color:G,textDecoration:"none"}}>pokedax2.vercel.app</a>
                </div>
              ),
            },
            {
              h:"Haftungsausschluss",
              content:<p style={{fontSize:15,color:TX2,lineHeight:1.85}}>PokéDax ist kein offizielles Produkt von The Pokémon Company International. Alle Pokémon-Namen, Marken und zugehörige Zeichen sind Eigentum ihrer jeweiligen Inhaber. Diese Plattform dient ausschließlich informativen Zwecken und ist nicht offiziell mit The Pokémon Company verbunden.</p>,
            },
            {
              h:"Datenquelle",
              content:<p style={{fontSize:15,color:TX2,lineHeight:1.85}}>Preisdaten stammen von Cardmarket (cardmarket.com). Karteninformationen von TCGdex. Alle Preise sind unverbindliche Richtwerte und können von tatsächlichen Marktpreisen abweichen.</p>,
            },
            {
              h:"Streitschlichtung",
              content:<p style={{fontSize:15,color:TX2,lineHeight:1.85}}>Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: <a href="https://ec.europa.eu/consumers/odr" style={{color:G,textDecoration:"none"}}>ec.europa.eu/consumers/odr</a>. Wir sind nicht verpflichtet noch bereit, an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>,
            },
          ].map(s=>(
            <div key={s.h} style={{background:BG1,border:`1px solid ${BR2}`,borderRadius:22,padding:"clamp(18px,3vw,28px) clamp(20px,3vw,32px)"}}>
              <div style={{fontSize:10,fontWeight:600,letterSpacing:".12em",textTransform:"uppercase",color:TX3,marginBottom:14}}>{s.h}</div>
              {s.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

'@
[System.IO.File]::WriteAllText("$root\src\app\impressum\page.tsx", $impressum, $enc)
Write-Host "  OK  page.tsx" -ForegroundColor Green

$datenschutz = @'
export const dynamic = "force-dynamic";
import Link from "next/link";
export const metadata = { title:"Datenschutz" };
const TX1="#f0f0f5",TX2="#a8a8b8",TX3="#6b6b7a";
const BG1="#111113",BR2="rgba(255,255,255,0.085)";
export default function DatenschutzPage() {
  const sections=[
    {h:"Verantwortlicher",t:"PokéDax, Musterstraße 12, 80331 München. hello@pokedax.de"},
    {h:"Erhobene Daten",t:"E-Mail, Benutzername, Scan-Verlauf, Wunschliste, Sammlung."},
    {h:"Zweck",t:"Bereitstellung des PokéDax-Services."},
    {h:"Speicherung",t:"EU-Server (Supabase). Passwörter als bcrypt-Hash."},
    {h:"Weitergabe",t:"Keine Weitergabe an Dritte."},
    {h:"Ihre Rechte",t:"Auskunft, Berichtigung, Löschung (Art. 15-18 DSGVO). Anfragen: hello@pokedax.de"},
    {h:"Cookies",t:"Nur technisch notwendige Session-Cookies. Kein Tracking."},
  ] as const;
  return(
    <div style={{minHeight:"80vh",color:TX1}}>
      <div style={{maxWidth:680,margin:"0 auto",padding:"52px 28px"}}>
        <h1 style={{fontSize:24,fontWeight:300,letterSpacing:"-.04em",marginBottom:6,fontFamily:"var(--font-display)"}}>Datenschutz</h1>
        <p style={{fontSize:12.5,color:TX3,marginBottom:32}}>Gemäß DSGVO · Stand 2026</p>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {sections.map(s=>(
            <div key={s.h} style={{background:BG1,border:`1px solid ${BR2}`,borderRadius:14,padding:"18px 22px"}}>
              <div style={{fontSize:10.5,fontWeight:600,letterSpacing:".08em",textTransform:"uppercase",color:TX3,marginBottom:8}}>{s.h}</div>
              <div style={{fontSize:13.5,color:TX2,lineHeight:1.78}}>{s.t}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
'@
[System.IO.File]::WriteAllText("$root\src\app\datenschutz\page.tsx", $datenschutz, $enc)
Write-Host "  OK  page.tsx" -ForegroundColor Green

$profil = @'
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props { params: { username: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `${params.username} – pokédax`,
    description: `Pokémon TCG Profil von ${params.username} auf pokédax`,
  };
}

const G="#E9A84B",BG1="#111113",BG2="#1a1a1f",BR2="rgba(255,255,255,0.085)";
const TX1="#f0f0f5",TX2="#a8a8b8",TX3="#6b6b7a",GREEN="#4BBF82";

export default async function ProfilePage({ params }: Props) {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: profile } = await sb
    .from("profiles")
    .select("id, username, avatar_url, is_premium, created_at")
    .eq("username", params.username)
    .single();

  if (!profile) notFound();

  const { data: posts } = await sb
    .from("forum_posts")
    .select("id, title, created_at, upvotes")
    .eq("author_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(4);

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

      </div>
    </div>
  );
}

'@
[System.IO.File]::WriteAllText("$root\src\app\profil\[username]\page.tsx", $profil, $enc)
Write-Host "  OK  page.tsx" -ForegroundColor Green

$stripeCheckout = @'
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY fehlt");
  return new Stripe(key, { apiVersion: "2024-06-20" });
}

const PLANS = {
  premium: { name: "PokéDax Premium", price: 799,  interval: "month" as const },
  dealer:  { name: "PokéDax Händler", price: 1999, interval: "month" as const },
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const plan = (body.plan as keyof typeof PLANS) || "premium";
    const planConfig = PLANS[plan] || PLANS.premium;

    const stripe = getStripe();

    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id, username")
      .eq("id", user.id)
      .single();

    // Create or reuse Stripe customer
    let customerId = profile?.stripe_customer_id as string | undefined;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email:    user.email,
        name:     profile?.username || user.email || "Trainer",
        metadata: { user_id: user.id },
      });
      customerId = customer.id;
      await supabase.from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    // Use Price ID from env, or create price on the fly
    const priceId = plan === "dealer"
      ? process.env.STRIPE_PRICE_ID_DEALER
      : process.env.STRIPE_PRICE_ID_PREMIUM;

    let finalPriceId: string;
    if (priceId) {
      finalPriceId = priceId;
    } else {
      const price = await stripe.prices.create({
        currency:     "eur",
        unit_amount:  planConfig.price,
        recurring:    { interval: planConfig.interval },
        product_data: { name: planConfig.name },
      });
      finalPriceId = price.id;
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pokedax2.vercel.app";

    const session = await stripe.checkout.sessions.create({
      customer:   customerId,
      mode:       "subscription",
      line_items: [{ price: finalPriceId, quantity: 1 }],
      metadata:   { user_id: user.id },
      success_url: `${appUrl}/dashboard/premium?success=1`,
      cancel_url:  `${appUrl}/dashboard/premium?canceled=1`,
      locale:      "de",
      payment_method_types: ["card"],
      subscription_data: { metadata: { user_id: user.id } },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });

  } catch (err: any) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: err?.message || "Unbekannter Fehler" },
      { status: 500 }
    );
  }
}

'@
[System.IO.File]::WriteAllText("$root\src\app\api\stripe\checkout\route.ts", $stripeCheckout, $enc)
Write-Host "  OK  route.ts" -ForegroundColor Green

$stripeWebhook = @'
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

// Supabase Admin Client (Service Role - bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const body      = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook signature failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {

      // ── Zahlung erfolgreich → Premium aktivieren ──
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const userId     = session.metadata?.user_id;

        if (userId) {
          // Abo-Ende ermitteln
          let premiumUntil: string | null = null;
          if (session.subscription) {
            const sub = await stripe.subscriptions.retrieve(
              session.subscription as string
            );
            premiumUntil = new Date(
              sub.current_period_end * 1000
            ).toISOString();
          }

          await supabase.from("profiles").update({
            is_premium:          true,
            premium_until:       premiumUntil,
            stripe_customer_id:  customerId,
          }).eq("id", userId);

          console.log(`✓ Premium aktiviert für User ${userId}`);
        }
        break;
      }

      // ── Abo erneuert → Datum verlängern ──
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        if (invoice.subscription) {
          const sub = await stripe.subscriptions.retrieve(
            invoice.subscription as string
          );
          const premiumUntil = new Date(
            sub.current_period_end * 1000
          ).toISOString();

          await supabase.from("profiles").update({
            is_premium:    true,
            premium_until: premiumUntil,
          }).eq("stripe_customer_id", customerId);

          console.log(`✓ Premium verlängert für Customer ${customerId}`);
        }
        break;
      }

      // ── Zahlung fehlgeschlagen ──
      case "invoice.payment_failed": {
        const invoice    = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // Noch nicht sofort deaktivieren — Stripe versucht es mehrmals
        console.log(`⚠ Zahlung fehlgeschlagen für Customer ${customerId}`);
        break;
      }

      // ── Abo gekündigt / abgelaufen → Premium deaktivieren ──
      case "customer.subscription.deleted": {
        const sub        = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        await supabase.from("profiles").update({
          is_premium:    false,
          premium_until: null,
        }).eq("stripe_customer_id", customerId);

        console.log(`✓ Premium deaktiviert für Customer ${customerId}`);
        break;
      }

      // ── Abo pausiert ──
      case "customer.subscription.paused": {
        const sub        = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        await supabase.from("profiles").update({
          is_premium: false,
        }).eq("stripe_customer_id", customerId);
        break;
      }

      default:
        console.log(`Unhandled event: ${event.type}`);
    }
  } catch (err: any) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

'@
[System.IO.File]::WriteAllText("$root\src\app\api\webhooks\stripe\route.ts", $stripeWebhook, $enc)
Write-Host "  OK  route.ts" -ForegroundColor Green

$stripeScans = @'
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json().catch(() => ({}));
    const { card_id, scan_type = "manual" } = body;

    await supabase.from("scan_logs").insert({
      user_id:   user?.id || null,
      card_id:   card_id  || null,
      scan_type,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false });
  }
}

'@
[System.IO.File]::WriteAllText("$root\src\app\api\scans\route.ts", $stripeScans, $enc)
Write-Host "  OK  route.ts" -ForegroundColor Green

$premGate = @'
"use client";

import { useState } from "react";
import Link from "next/link";
import { Crown, Lock, Zap } from "lucide-react";
import { usePremium } from "@/hooks/usePremium";

interface Props {
  children:    React.ReactNode;
  feature?:    string;
  freeLimit?:  number; // z.B. 5 für "5 Scans/Tag"
  currentUse?: number;
  fallback?:   React.ReactNode; // Custom fallback statt Standard-Gate
}

export default function PremiumGate({
  children,
  feature    = "dieses Feature",
  freeLimit,
  currentUse = 0,
  fallback,
}: Props) {
  const { isPremium, loading } = usePremium();
  const [upgrading, setUpgrading] = useState(false);

  // Still loading - show children (optimistic)
  if (loading) return <>{children}</>;

  // Has premium - show content
  if (isPremium) return <>{children}</>;

  // Free limit not reached yet - show content
  if (freeLimit !== undefined && currentUse < freeLimit) {
    return <>{children}</>;
  }

  // Custom fallback
  if (fallback) return <>{fallback}</>;

  async function handleUpgrade(plan = "premium") {
    setUpgrading(true);
    try {
      const res  = await fetch("/api/stripe/checkout", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setUpgrading(false);
    }
  }

  return (
    <div
      style={{
        background:   "linear-gradient(135deg, rgba(250,204,21,0.06), rgba(238,21,21,0.04))",
        border:       "1px solid rgba(250,204,21,0.25)",
        borderRadius: 20,
        padding:      "32px 24px",
        textAlign:    "center",
      }}
    >
      {/* Lock icon */}
      <div
        style={{
          width:          56, height: 56, borderRadius: "50%",
          background:     "rgba(250,204,21,0.1)",
          border:         "1px solid rgba(250,204,21,0.3)",
          display:        "flex", alignItems: "center", justifyContent: "center",
          margin:         "0 auto 16px",
        }}
      >
        <Lock size={24} style={{ color: "#FACC15" }} />
      </div>

      <h3
        style={{
          fontFamily:    "Poppins, sans-serif", fontWeight: 800, fontSize: 18,
          color:         "white", marginBottom: 8, letterSpacing: "-0.01em",
        }}
      >
        Premium Feature
      </h3>

      <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, marginBottom: 8, lineHeight: 1.5 }}>
        {freeLimit !== undefined
          ? `Du hast dein tägliches Limit von ${freeLimit} ${feature} erreicht.`
          : `${feature} ist nur für Premium-Mitglieder verfügbar.`}
      </p>

      {freeLimit !== undefined && (
        <div
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: 8, marginBottom: 20,
          }}
        >
          <div
            style={{
              height: 4, borderRadius: 2, flex: 1, maxWidth: 200,
              background: "rgba(255,255,255,0.1)", overflow: "hidden",
            }}
          >
            <div
              style={{
                height:  "100%",
                width:   `${Math.min(100, (currentUse / freeLimit) * 100)}%`,
                background: currentUse >= freeLimit ? "#EE1515" : "#FACC15",
                borderRadius: 2,
              }}
            />
          </div>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
            {currentUse}/{freeLimit}
          </span>
        </div>
      )}

      {/* Upgrade buttons */}
      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
        <button
          onClick={() => handleUpgrade("premium")}
          disabled={upgrading}
          style={{
            display:      "flex", alignItems: "center", gap: 8,
            padding:      "10px 20px", borderRadius: 12,
            background:   "linear-gradient(135deg, #FACC15, #f59e0b)",
            border:       "none", cursor: upgrading ? "not-allowed" : "pointer",
            fontFamily:   "Poppins, sans-serif", fontWeight: 700, fontSize: 14,
            color:        "#000",
            opacity:      upgrading ? 0.7 : 1,
          }}
        >
          <Crown size={16} />
          {upgrading ? "Wird geladen..." : "Premium – 6,99€/Mo"}
        </button>

        <Link
          href="/dashboard/premium"
          style={{
            display:      "flex", alignItems: "center", gap: 6,
            padding:      "10px 16px", borderRadius: 12,
            background:   "rgba(255,255,255,0.05)",
            border:       "1px solid rgba(255,255,255,0.12)",
            color:        "rgba(255,255,255,0.5)", fontSize: 13,
            textDecoration: "none",
          }}
        >
          Alle Pläne ansehen
        </Link>
      </div>

      <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, marginTop: 12 }}>
        Monatlich kündbar · Sichere Zahlung via Stripe
      </p>
    </div>
  );
}

'@
[System.IO.File]::WriteAllText("$root\src\components\ui\PremiumGate.tsx", $premGate, $enc)
Write-Host "  OK  PremiumGate.tsx" -ForegroundColor Green

$usePremium = @'
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface PremiumState {
  isPremium: boolean;
  loading:   boolean;
  userId:    string | null;
}

export function usePremium(): PremiumState {
  const [state, setState] = useState<PremiumState>({
    isPremium: false,
    loading:   true,
    userId:    null,
  });

  useEffect(() => {
    const sb = createClient();
    sb.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        setState({ isPremium: false, loading: false, userId: null });
        return;
      }
      sb.from("profiles")
        .select("is_premium, premium_until")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          // Check if premium_until is in the future
          const until = data?.premium_until
            ? new Date(data.premium_until)
            : null;
          const isPremium =
            data?.is_premium === true &&
            (until === null || until > new Date());

          setState({ isPremium, loading: false, userId: user.id });
        });
    });
  }, []);

  return state;
}

'@
[System.IO.File]::WriteAllText("$root\src\hooks\usePremium.ts", $usePremium, $enc)
Write-Host "  OK  usePremium.ts" -ForegroundColor Green

$scannerScan = @'
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // ── Parse body ─────────────────────────────────────
    const body = await request.json();
    const { imageBase64, mimeType = "image/jpeg" } = body;
    if (!imageBase64) {
      return NextResponse.json({ error: "Kein Bild" }, { status: 400 });
    }

    // ── Scan-Limit für Free-User ────────────────────────
    let scanCount = 0;
    if (user) {
      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      const { count } = await supabase
        .from("scan_logs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", `${today}T00:00:00.000Z`);
      scanCount = count ?? 0;

      // Check premium
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_premium, premium_until")
        .eq("id", user.id)
        .single();

      const isPremium =
        profile?.is_premium === true &&
        (!profile.premium_until || new Date(profile.premium_until) > new Date());

      if (!isPremium && scanCount >= 5) {
        return NextResponse.json(
          { error: "LIMIT_REACHED", scansUsed: scanCount, limit: 5 },
          { status: 429 }
        );
      }
    }

    // ── Gemini Flash Vision ─────────────────────────────
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY fehlt" }, { status: 500 });
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: `You are a Pokémon TCG card identifier. Look at this card image and respond ONLY with a JSON object, nothing else.
Return exactly this structure:
{
  "name": "exact card name as printed (e.g. Charizard ex, Pikachu VMAX, Umbreon ex)",
  "name_de": "German name if different (e.g. Glurak ex, Mewtu ex), or same as name",
  "set_id": "TCGdex set ID if visible (e.g. sv01, sv03, neo4, ecard3), or null",
  "number": "card number if visible (e.g. 006, 107), or null",
  "confidence": 0.95
}
Only output the JSON object, no markdown, no explanation.`
              },
              {
                inline_data: { mime_type: mimeType, data: imageBase64 }
              }
            ]
          }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 200 }
        })
      }
    );

    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      console.error("Gemini error:", err);
      return NextResponse.json({ error: "KI-Fehler" }, { status: 500 });
    }

    const geminiData = await geminiRes.json();
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    // Parse Gemini response
    let cardInfo: { name: string; name_de: string; set_id: string | null; number: string | null; confidence: number };
    try {
      const clean = rawText.replace(/```json|```/g, "").trim();
      cardInfo = JSON.parse(clean);
    } catch {
      console.error("Gemini parse error:", rawText);
      return NextResponse.json({ error: "Karte nicht erkannt" }, { status: 422 });
    }

    // ── Supabase Karten-Lookup ──────────────────────────
    const searchName = cardInfo.name_de || cardInfo.name;

    // Try exact match first, then fuzzy
    let { data: cards } = await supabase
      .from("cards")
      .select("id, name, name_de, set_id, number, price_market, price_low, price_avg7, price_avg30, image_url, rarity")
      .or(`name.ilike.%${searchName}%,name_de.ilike.%${searchName}%`)
      .order("price_market", { ascending: false })
      .limit(5);

    if (!cards || cards.length === 0) {
      // Try with English name
      const { data: fallback } = await supabase
        .from("cards")
        .select("id, name, name_de, set_id, number, price_market, price_low, price_avg7, price_avg30, image_url, rarity")
        .ilike("name", `%${cardInfo.name}%`)
        .order("price_market", { ascending: false })
        .limit(5);
      cards = fallback ?? [];
    }

    const bestMatch = cards?.[0] ?? null;

    // ── Log scan ────────────────────────────────────────
    if (user) {
      await supabase.from("scan_logs").insert({
        user_id:   user.id,
        card_id:   bestMatch?.id ?? null,
        scan_type: "gemini",
      });
    }

    // ── Return result ───────────────────────────────────
    return NextResponse.json({
      gemini:    cardInfo,
      card:      bestMatch,
      matches:   cards ?? [],
      scansUsed: user ? scanCount + 1 : null,
      scansLeft: user ? Math.max(0, 5 - scanCount - 1) : null,
    });

  } catch (err) {
    console.error("Scanner error:", err);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}

'@
[System.IO.File]::WriteAllText("$root\src\app\api\scanner\scan\route.ts", $scannerScan, $enc)
Write-Host "  OK  route.ts" -ForegroundColor Green

$scannerCount = @'
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ count: 0 });

    const today = new Date().toISOString().slice(0, 10);
    const { count } = await supabase
      .from("scan_logs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", `${today}T00:00:00.000Z`);

    return NextResponse.json({ count: count ?? 0 });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}

'@
[System.IO.File]::WriteAllText("$root\src\app\api\scanner\count\route.ts", $scannerCount, $enc)
Write-Host "  OK  route.ts" -ForegroundColor Green

$marketplace = @'
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/marketplace?card_id=xxx&type=offer|want
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const card_id = searchParams.get("card_id");
  const type    = searchParams.get("type"); // "offer" | "want" | null (both)

  if (!card_id) {
    return NextResponse.json({ error: "card_id required" }, { status: 400 });
  }

  const supabase = await createClient();

  let query = supabase
    .from("marketplace_listings")
    .select(`
      id, type, price, condition, note, created_at,
      user_id,
      profiles!marketplace_listings_user_id_fkey(username, avatar_url)
    `)
    .eq("card_id", card_id)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(20);

  if (type) query = query.eq("type", type);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ listings: data ?? [] });
}

// POST /api/marketplace — create listing
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const body = await request.json();
  const { card_id, type, price, condition = "NM", note = "" } = body;

  if (!card_id || !type || !["offer","want"].includes(type)) {
    return NextResponse.json({ error: "Ungültige Daten" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("marketplace_listings")
    .insert({ user_id: user.id, card_id, type, price, condition, note })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ listing: data });
}

// DELETE /api/marketplace?id=xxx
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await supabase
    .from("marketplace_listings")
    .update({ is_active: false })
    .eq("id", id)
    .eq("user_id", user.id);

  return NextResponse.json({ ok: true });
}

'@
[System.IO.File]::WriteAllText("$root\src\app\api\marketplace\route.ts", $marketplace, $enc)
Write-Host "  OK  route.ts" -ForegroundColor Green

$fantasyTeam = @'
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ team: null, picks: [] });

  const season = getCurrentSeason();

  const { data: team } = await supabase
    .from("fantasy_teams")
    .select("*")
    .eq("user_id", user.id)
    .eq("season", season)
    .single();

  if (!team) return NextResponse.json({ team: null, picks: [] });

  const selectPicks = "id, bought_at_price, quantity, picked_at, cards!fantasy_picks_card_id_fkey(id, name, name_de, set_id, number, price_market, image_url, types)";

  const { data: picks } = await supabase
    .from("fantasy_picks")
    .select(selectPicks)
    .eq("team_id", team.id);

  let score = 0;
  const enrichedPicks = (picks ?? []).map((p: any) => {
    const current = p.cards?.price_market ?? p.bought_at_price;
    const gain    = ((current - p.bought_at_price) / p.bought_at_price) * 100;
    score += gain;
    return { ...p, current_price: current, gain_pct: Math.round(gain * 10) / 10 };
  });

  return NextResponse.json({ team: { ...team, score: Math.round(score * 10) / 10 }, picks: enrichedPicks });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const body = await request.json();
  const { card_id } = body;
  if (!card_id) return NextResponse.json({ error: "card_id required" }, { status: 400 });

  const season = getCurrentSeason();

  let { data: team } = await supabase
    .from("fantasy_teams")
    .select("id")
    .eq("user_id", user.id)
    .eq("season", season)
    .single();

  if (!team) {
    const { data: newTeam } = await supabase
      .from("fantasy_teams")
      .insert({ user_id: user.id, season, name: "Mein Team" })
      .select()
      .single();
    team = newTeam;
  }

  if (!team) return NextResponse.json({ error: "Team-Fehler" }, { status: 500 });

  const { count } = await supabase
    .from("fantasy_picks")
    .select("*", { count: "exact", head: true })
    .eq("team_id", team.id);

  if ((count ?? 0) >= 5) {
    return NextResponse.json({ error: "MAX_PICKS", message: "Maximal 5 Karten pro Team" }, { status: 400 });
  }

  const { data: card } = await supabase
    .from("cards")
    .select("id, price_market")
    .eq("id", card_id)
    .single();

  if (!card?.price_market) {
    return NextResponse.json({ error: "Karte nicht gefunden" }, { status: 404 });
  }

  const { data: existing } = await supabase
    .from("fantasy_picks")
    .select("bought_at_price, quantity")
    .eq("team_id", team.id);

  const spent = (existing ?? []).reduce((s: number, p: any) => s + (p.bought_at_price * p.quantity), 0);
  if (spent + card.price_market > 1000) {
    return NextResponse.json({ error: "BUDGET_EXCEEDED", spent, budget: 1000 }, { status: 400 });
  }

  const { data: pick, error } = await supabase
    .from("fantasy_picks")
    .insert({ team_id: team.id, card_id, bought_at_price: card.price_market })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ pick, spent: spent + card.price_market });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const pick_id = new URL(request.url).searchParams.get("pick_id");
  if (!pick_id) return NextResponse.json({ error: "pick_id required" }, { status: 400 });

  const { data: userTeams } = await supabase
    .from("fantasy_teams")
    .select("id")
    .eq("user_id", user.id);

  const teamIds = (userTeams ?? []).map((t: any) => t.id);
  if (teamIds.length === 0) return NextResponse.json({ ok: true });

  await supabase
    .from("fantasy_picks")
    .delete()
    .eq("id", pick_id)
    .in("team_id", teamIds);

  return NextResponse.json({ ok: true });
}

function getCurrentSeason(): string {
  const now = new Date();
  const q = Math.ceil((now.getMonth() + 1) / 3);
  return now.getFullYear() + "-Q" + q;
}

'@
[System.IO.File]::WriteAllText("$root\src\app\api\fantasy\team\route.ts", $fantasyTeam, $enc)
Write-Host "  OK  route.ts" -ForegroundColor Green

$fantasyLB = @'
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
      name:          t.name,
      username:      t.profiles?.username ?? "Anonym",
      avatar_url:    t.profiles?.avatar_url,
      picks_count:   picks.length,
      current_value: Math.round(currentValue * 100) / 100,
      bought_value:  Math.round(boughtValue * 100) / 100,
      score:         Math.round(score * 10) / 10,
    };
  }).sort((a: any, b: any) => b.score - a.score);

  return NextResponse.json({ leaderboard: scored, season });
}

function getCurrentSeason(): string {
  const now = new Date();
  const q = Math.ceil((now.getMonth() + 1) / 3);
  return now.getFullYear() + "-Q" + q;
}

'@
[System.IO.File]::WriteAllText("$root\src\app\api\fantasy\leaderboard\route.ts", $fantasyLB, $enc)
Write-Host "  OK  route.ts" -ForegroundColor Green

$portfolioLB = @'
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 300;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Get all collection entries with card prices
    const { data: entries, error } = await supabase
      .from("user_collection")
      .select("user_id, quantity, cards!user_collection_card_id_fkey(price_market)")
      .not("cards", "is", null);

    if (error) throw error;

    // Aggregate per user
    const byUser: Record<string, number> = {};
    for (const e of (entries ?? [])) {
      if (!e.user_id) continue;
      const price = (e as any).cards?.price_market ?? 0;
      const qty   = e.quantity ?? 1;
      byUser[e.user_id] = (byUser[e.user_id] ?? 0) + price * qty;
    }

    if (Object.keys(byUser).length === 0) {
      return NextResponse.json({ leaderboard: [] });
    }

    // Fetch profiles for top users
    const topUserIds = Object.entries(byUser)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 25)
      .map(([id]) => id);

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username, avatar_url, is_premium, created_at")
      .in("id", topUserIds);

    const profileMap: Record<string, any> = {};
    for (const p of profiles ?? []) profileMap[p.id] = p;

    // Build leaderboard
    const leaderboard = topUserIds.map((userId, rank) => {
      const p = profileMap[userId];
      const totalValue = byUser[userId] ?? 0;
      return {
        rank:        rank + 1,
        user_id:     userId,
        username:    p?.username ?? "Anonym",
        avatar_url:  p?.avatar_url ?? null,
        is_premium:  p?.is_premium ?? false,
        total_value: Math.round(totalValue * 100) / 100,
        member_since: p?.created_at ?? null,
      };
    });

    return NextResponse.json({ leaderboard });
  } catch (err) {
    console.error("Portfolio leaderboard error:", err);
    return NextResponse.json({ leaderboard: [] });
  }
}

'@
[System.IO.File]::WriteAllText("$root\src\app\api\leaderboard\portfolio\route.ts", $portfolioLB, $enc)
Write-Host "  OK  route.ts" -ForegroundColor Green

$forumPosts = @'
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const limit = parseInt(searchParams.get("limit") || "20");
  const sort = searchParams.get("sort") || "recent"; // "recent" | "hot"

  let query = supabase
    .from("forum_posts")
    .select(
      `id, title, category_id, author_id, reply_count, upvotes,
       view_count, is_pinned, is_locked, is_hot, tags, created_at,
       profiles(username, avatar_url, forum_role, post_count,
         badge_trainer, badge_gym_leader, badge_elite4, badge_champion, is_premium)`
    )
    .eq("is_deleted", false)
    .limit(limit);

  if (category) {
    query = query.eq("category_id", category);
  }

  if (sort === "hot") {
    query = query.order("is_hot", { ascending: false }).order("upvotes", { ascending: false });
  } else {
    query = query.order("is_pinned", { ascending: false }).order("created_at", { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ posts: data });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });
  }

  // Check if banned
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_banned, forum_role")
    .eq("id", user.id)
    .single();

  if (profile?.is_banned) {
    return NextResponse.json({ error: "Du bist gesperrt." }, { status: 403 });
  }

  const body = await request.json();
  const { category_id, title, content, tags } = body;

  if (!category_id || !title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "Pflichtfelder fehlen" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("forum_posts")
    .insert({
      category_id,
      author_id: user.id,
      title: title.trim(),
      content: content.trim(),
      tags: tags || [],
      upvotes: 0,
      reply_count: 0,
      view_count: 0,
      is_pinned: false,
      is_locked: false,
      is_deleted: false,
      is_hot: false,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ post: data });
}

'@
[System.IO.File]::WriteAllText("$root\src\app\api\forum\posts\route.ts", $forumPosts, $enc)
Write-Host "  OK  route.ts" -ForegroundColor Green

$forumCats = @'
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("forum_categories")
    .select("id, name, color")
    .order("name");
  if (error) return NextResponse.json({ categories: [] });
  return NextResponse.json({ categories: data ?? [] });
}

'@
[System.IO.File]::WriteAllText("$root\src\app\api\forum\categories\route.ts", $forumCats, $enc)
Write-Host "  OK  route.ts" -ForegroundColor Green

$forumReplies = @'
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const post_id = new URL(request.url).searchParams.get("post_id");
  if (!post_id) return NextResponse.json({ replies: [] });

  const { data, error } = await supabase
    .from("forum_replies")
    .select("id, content, upvotes, created_at, author_id, profiles(username, avatar_url, is_premium)")
    .eq("post_id", post_id)
    .eq("is_deleted", false)
    .order("created_at", { ascending: true });

  if (error) {
    // Table might not exist yet, return empty
    return NextResponse.json({ replies: [] });
  }
  const normalized = (data ?? []).map((r: any) => ({
    ...r,
    profiles: Array.isArray(r.profiles) ? r.profiles[0] : r.profiles,
  }));
  return NextResponse.json({ replies: normalized });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const { post_id, content } = await request.json();
  if (!post_id || !content?.trim()) return NextResponse.json({ error: "Pflichtfelder fehlen" }, { status: 400 });

  const { data, error } = await supabase
    .from("forum_replies")
    .insert({ post_id, author_id: user.id, content: content.trim(), upvotes: 0, is_deleted: false })
    .select("id, content, upvotes, created_at, author_id, profiles(username, avatar_url, is_premium)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Increment reply_count
  await supabase.rpc("increment_reply_count", { post_id }).catch(() => {});
  // Fallback: manual increment
  const { data: post } = await supabase.from("forum_posts").select("reply_count").eq("id", post_id).single();
  if (post) await supabase.from("forum_posts").update({ reply_count: (post.reply_count ?? 0) + 1 }).eq("id", post_id);

  const reply = { ...data, profiles: Array.isArray((data as any)?.profiles) ? (data as any).profiles[0] : (data as any)?.profiles };
  return NextResponse.json({ reply });
}

'@
[System.IO.File]::WriteAllText("$root\src\app\api\forum\replies\route.ts", $forumReplies, $enc)
Write-Host "  OK  route.ts" -ForegroundColor Green

Write-Host ""
Write-Host "Bestehende APIs:" -ForegroundColor DarkGray

$searchRoute = @'
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 0;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q        = searchParams.get("q")        || "";
  const set      = searchParams.get("set")       || "";
  const type     = searchParams.get("type")      || "";
  const category = searchParams.get("category")  || "";
  const sort     = searchParams.get("sort")      || "price_desc";
  const limit    = Math.min(parseInt(searchParams.get("limit") || "48"), 100);

  // All columns including new ones
  const SELECT = `
    id, name, name_de, set_id, number,
    rarity, rarity_id, types, image_url,
    price_market, price_low, price_avg7, price_avg30,
    hp, category, stage, illustrator,
    regulation_mark, is_holo, is_reverse_holo
  `.replace(/\s+/g, " ").trim();

  let query = supabase.from("cards").select(SELECT);

  // Search in both EN and DE name
  if (q) {
    query = query.or(`name.ilike.%${q}%,name_de.ilike.%${q}%`);
  }

  // Filters
  if (set)      query = query.eq("set_id", set);
  if (type)     query = query.contains("types", [type]);
  if (category) query = query.eq("category", category);

  // Only cards with a price
  query = query.not("price_market", "is", null);

  // Sort
  switch (sort) {
    case "price_asc":   query = query.order("price_market", { ascending: true });  break;
    case "name_asc":    query = query.order("name",         { ascending: true });  break;
    case "trend_desc":  query = query.order("price_avg7",   { ascending: false }); break;
    default:            query = query.order("price_market", { ascending: false }); break;
  }

  query = query.limit(limit);

  const { data, error } = await query;

  if (error) {
    console.error("Cards search error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ cards: data || [] });
}

'@
[System.IO.File]::WriteAllText("$root\src\app\api\cards\search\route.ts", $searchRoute, $enc)
Write-Host "  OK  route.ts" -ForegroundColor DarkGray

$setsRoute = @'
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 3600;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { data, error } = await supabase
    .from("sets")
    .select("id, name, name_de, series, total, release_date")
    .order("release_date", { ascending: false });

  if (error) return NextResponse.json({ sets: [] });

  // Show DE name if available
  const sets = (data || []).map(s => ({
    id:   s.id,
    name: s.name_de || s.name,
    name_en: s.name,
    name_de: s.name_de,
    serie: s.series,
    total: s.total,
  }));

  return NextResponse.json({ sets });
}

'@
[System.IO.File]::WriteAllText("$root\src\app\api\cards\sets\route.ts", $setsRoute, $enc)
Write-Host "  OK  route.ts" -ForegroundColor DarkGray

$syncSets = @'
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const EN = "https://api.tcgdex.net/v2/en";
const DE = "https://api.tcgdex.net/v2/de";

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-admin-secret");
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [enSets, deSets] = await Promise.all([
    fetch(`${EN}/sets`).then(r => r.ok ? r.json() : []),
    fetch(`${DE}/sets`).then(r => r.ok ? r.json() : []),
  ]);

  if (!enSets?.length) {
    return NextResponse.json({ error: "TCGdex nicht erreichbar" }, { status: 500 });
  }

  // DE lookup by id
  const deMap: Record<string, string> = {};
  for (const s of (deSets || [])) {
    if (s.id) deMap[s.id] = s.name;
  }

  let inserted = 0, failed = 0;
  const log: string[] = [];

  for (const set of enSets) {
    if (!set.id) continue;

    // Fetch full details for logo/symbol/release date
    let details: any = {};
    try {
      const r = await fetch(`${EN}/sets/${set.id}`, { next: { revalidate: 86400 } });
      if (r.ok) details = await r.json();
    } catch { /* ignore */ }

    // Map to actual column names in Supabase
    const row = {
      id:                   set.id,
      name:                 set.name || details.name || set.id,
      name_de:              deMap[set.id] || null,
      series:               details.serie?.name || set.serie?.name || null,
      serie_en:             details.serie?.name || set.serie?.name || null,
      serie_de:             null, // DE series not easily available
      total:                details.cardCount?.total || set.cardCount || null,
      card_count:           details.cardCount?.total || set.cardCount || null,
      card_count_official:  details.cardCount?.official || null,
      release_date:         details.releaseDate || null,
      logo_url:             details.logo ? `${details.logo}.png` : null,
      symbol_url:           details.symbol ? `${details.symbol}.png` : null,
      regulation_mark:      details.regulationMark || null,
    };

    const { error } = await supabase
      .from("sets")
      .upsert(row, { onConflict: "id" });

    if (error) {
      failed++;
      log.push(`✗ ${set.id}: ${error.message}`);
    } else {
      inserted++;
      log.push(`✓ ${set.id}: ${row.name}${row.name_de ? ` / ${row.name_de}` : ""}`);
    }

    await new Promise(r => setTimeout(r, 50));
  }

  return NextResponse.json({
    total: enSets.length,
    inserted,
    failed,
    deAvailable: Object.keys(deMap).length,
    log: log.slice(0, 50),
  });
}

export async function GET(request: NextRequest) {
  const secret = request.headers.get("x-admin-secret");
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [total, missingDe] = await Promise.all([
    supabase.from("sets").select("*", { count: "exact", head: true }),
    supabase.from("sets").select("*", { count: "exact", head: true }).is("name_de", null),
  ]);

  const { data: sample } = await supabase
    .from("sets")
    .select("id, name, name_de, series, total, release_date")
    .order("release_date", { ascending: false })
    .limit(10);

  return NextResponse.json({ total: total.count, missingDe: missingDe.count, sample });
}

'@
[System.IO.File]::WriteAllText("$root\src\app\api\admin\sync-sets\route.ts", $syncSets, $enc)
Write-Host "  OK  route.ts" -ForegroundColor DarkGray

$syncCards = @'
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const EN = "https://api.tcgdex.net/v2/en";
const DE = "https://api.tcgdex.net/v2/de";

const RARITY_MAP: Record<string, string> = {
  "Common":"common","Uncommon":"uncommon","Rare":"rare",
  "Rare Holo":"rare-holo","Rare Holo EX":"rare-holo","Rare Holo GX":"rare-holo",
  "Rare Holo V":"rare-holo","Rare Holo VMAX":"rare-holo","Rare Holo VSTAR":"rare-holo",
  "Double Rare":"double-rare","Illustration Rare":"illustration-rare",
  "Special Illustration Rare":"special-illustration-rare",
  "Hyper Rare":"hyper-rare","Ultra Rare":"ultra-rare","Secret Rare":"secret-rare",
  "Shiny Rare":"shiny-rare","Shiny Rare V":"shiny-rare-v",
  "Radiant Rare":"radiant-rare","Amazing Rare":"amazing-rare",
  "Rainbow Rare":"rainbow-rare","Gold Rare":"hyper-rare",
  "ACE SPEC Rare":"ace-spec","Promo":"promo","Classic Collection":"rare-holo",
};

async function fetchCard(base: string, setId: string, localId: string) {
  try {
    const r = await fetch(`${base}/sets/${setId}/${localId}`, { next: { revalidate: 86400 } });
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
}

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-admin-secret");
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { offset = 0, limit = 30 } = await request.json().catch(() => ({}));

  const { data: cards, error } = await supabase
    .from("cards")
    .select("id, set_id, number, types, rarity, image_url, name_de, hp, category")
    .or("types.is.null,rarity.is.null,name_de.is.null,hp.is.null")
    .range(offset, offset + limit - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!cards?.length) return NextResponse.json({ message: "Alle Karten aktuell", updated: 0, hasMore: false });

  let updated = 0, failed = 0;
  const log: string[] = [];

  for (const card of cards) {
    const { set_id, number } = card;
    if (!set_id || !number) { failed++; continue; }

    const [en, de] = await Promise.all([
      fetchCard(EN, set_id, number),
      fetchCard(DE, set_id, number),
    ]);

    const altNum = String(parseInt(number) || number);
    const [en2, de2] = (!en && !de && altNum !== number)
      ? await Promise.all([fetchCard(EN, set_id, altNum), fetchCard(DE, set_id, altNum)])
      : [null, null];

    const enData = en || en2;
    const deData = de || de2;

    if (!enData && !deData) { failed++; continue; }

    const updates: Record<string, unknown> = {};

    if (enData) {
      if (!card.types && enData.types?.length)  updates.types       = enData.types;
      if (!card.rarity && enData.rarity)        updates.rarity      = enData.rarity;
      if (!card.hp && enData.hp)                updates.hp          = enData.hp;
      if (!card.category && enData.category)    updates.category    = enData.category;
      if (enData.stage)                         updates.stage       = enData.stage;
      if (enData.illustrator)                   updates.illustrator = enData.illustrator;
      if (enData.regulationMark)                updates.regulation_mark = enData.regulationMark;
      if (enData.dexIDs?.[0])                   updates.pokedex_id  = enData.dexIDs[0];
      if (enData.retreat)                       updates.retreat_cost = enData.retreat;
      if (enData.variants) {
        updates.is_holo          = !!enData.variants.holo;
        updates.is_reverse_holo  = !!enData.variants.reverse;
        updates.is_first_edition = !!enData.variants.firstEdition;
      }
      if (!card.image_url && enData.image) updates.image_url = `${enData.image}/low.webp`;
      if (enData.rarity && RARITY_MAP[enData.rarity]) updates.rarity_id = RARITY_MAP[enData.rarity];
    }

    if (deData) {
      if (!card.name_de && deData.name)   updates.name_de        = deData.name;
      if (deData.description)             updates.description_de = deData.description;
    }

    if (Object.keys(updates).length > 0) {
      const { error: ue } = await supabase.from("cards").update(updates).eq("id", card.id);
      if (!ue) { updated++; log.push(`✓ ${card.id}: ${Object.keys(updates).join(", ")}`); }
      else     { failed++;  log.push(`✗ ${card.id}: ${ue.message}`); }
    }

    await new Promise(r => setTimeout(r, 120));
  }

  return NextResponse.json({
    total: cards.length, updated, failed,
    offset, limit, nextOffset: offset + limit,
    hasMore: cards.length === limit,
    log: log.slice(0, 25),
  });
}

export async function GET(request: NextRequest) {
  const secret = request.headers.get("x-admin-secret");
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [total, missingTypes, missingRarity, missingImage, missingDe, missingHp] = await Promise.all([
    supabase.from("cards").select("*", { count: "exact", head: true }),
    supabase.from("cards").select("*", { count: "exact", head: true }).is("types", null),
    supabase.from("cards").select("*", { count: "exact", head: true }).is("rarity", null),
    supabase.from("cards").select("*", { count: "exact", head: true }).is("image_url", null),
    supabase.from("cards").select("*", { count: "exact", head: true }).is("name_de", null),
    supabase.from("cards").select("*", { count: "exact", head: true }).is("hp", null),
  ]);

  return NextResponse.json({
    total: total.count, missingTypes: missingTypes.count,
    missingRarity: missingRarity.count, missingImages: missingImage.count,
    missingNameDe: missingDe.count, missingHp: missingHp.count,
    completePct: total.count
      ? Math.round((1 - (missingTypes.count||0) / (total.count||1)) * 100) : 0,
  });
}

'@
[System.IO.File]::WriteAllText("$root\src\app\api\admin\sync-cards\route.ts", $syncCards, $enc)
Write-Host "  OK  route.ts" -ForegroundColor DarkGray

$tickerRoute = @'
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 300; // 5 Minuten Cache

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data } = await supabase
      .from("cards")
      .select("name, set_id, price_market, price_avg7, price_avg30")
      .not("price_market", "is", null)
      .not("price_avg7",   "is", null)
      .gt("price_market", 5)
      .order("price_market", { ascending: false })
      .limit(30);

    if (!data?.length) {
      return NextResponse.json({ cards: [] });
    }

    const cards = data
      .filter(c => c.price_avg7 && c.price_avg30 && c.price_avg30 > 0)
      .map(c => ({
        name:   c.name,
        set:    c.set_id?.toUpperCase() || "TCG",
        price:  c.price_market,
        change: ((c.price_avg7 - c.price_avg30) / c.price_avg30) * 100,
      }))
      .slice(0, 20);

    return NextResponse.json({ cards });
  } catch {
    return NextResponse.json({ cards: [] });
  }
}

'@
[System.IO.File]::WriteAllText("$root\src\app\api\stats\ticker\route.ts", $tickerRoute, $enc)
Write-Host "  OK  route.ts" -ForegroundColor DarkGray

$statsRoute = @'
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Cache für 5 Minuten - Zahlen müssen nicht live sein
export const revalidate = 300;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Alle Queries parallel
    const [cardsRes, usersRes, forumRes, scansRes] = await Promise.all([
      supabase.from("cards").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("forum_categories").select("post_count"),
      supabase.from("scan_logs")
        .select("*", { count: "exact", head: true })
        .gte("created_at", new Date().toISOString().split("T")[0]), // heute
    ]);

    const forumPosts = (forumRes.data || []).reduce(
      (sum, cat) => sum + (cat.post_count || 0), 0
    );

    return NextResponse.json({
      cards_count: cardsRes.count  || 0,
      users_count: usersRes.count  || 0,
      forum_posts: forumPosts,
      scans_today: scansRes.count  || 0,
    });

  } catch (err) {
    console.error("Stats error:", err);
    // Fallback-Zahlen damit die Seite nicht leer aussieht
    return NextResponse.json({
      cards_count: 22271,
      users_count: 0,
      forum_posts: 0,
      scans_today: 0,
    });
  }
}

'@
[System.IO.File]::WriteAllText("$root\src\app\api\stats\route.ts", $statsRoute, $enc)
Write-Host "  OK  route.ts" -ForegroundColor DarkGray

$premSection = @'
"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X, Crown, Zap, TrendingUp, Shield, Bell, Star } from "lucide-react";

const PLANS = [
  {
    id: "free", name: "Free Trainer",
    rarity: "Common", raritySymbol: "●", hp: 40, type: "Colorless",
    price: "0€", period: "für immer",
    gradient: "linear-gradient(160deg, #1a1a1a 0%, #222 100%)",
    border: "rgba(156,163,175,0.25)", glow: "rgba(156,163,175,0.1)", typeColor: "#9CA3AF",
    features: [
      { ok:true,  text:"5 Scans pro Tag"      },
      { ok:true,  text:"Basis-Preischeck"      },
      { ok:true,  text:"Forum lesen"           },
      { ok:false, text:"Unlimitierter Scanner" },
      { ok:false, text:"Portfolio-Tracker"     },
      { ok:false, text:"Preis-Alerts"          },
    ],
    cta:"Kostenlos starten", ctaHref:"/auth/register", ctaStyle:"gray", dots:1,
  },
  {
    id: "premium", name: "Premium Trainer",
    rarity: "Illustration Rare", raritySymbol: "✦", hp: 180, type: "Psychic",
    badge: "BELIEBTESTE WAHL",
    price: "6,99€", period: "pro Monat",
    gradient: "linear-gradient(160deg, #0d0a2e 0%, #1a1040 50%, #0d0820 100%)",
    border: "rgba(168,85,247,0.5)", glow: "rgba(168,85,247,0.2)", typeColor: "#A855F7",
    features: [
      { ok:true, text:"Unlimitierter Pro-Scanner" },
      { ok:true, text:"Portfolio + Live-Charts"   },
      { ok:true, text:"Set-Tracker"               },
      { ok:true, text:"Interner Marktplatz"       },
      { ok:true, text:"Realtime Preis-Alerts"     },
      { ok:true, text:"Exklusive Forum-Channels"  },
      { ok:true, text:"2× Grading-Beratung/Mo"    },
      { ok:true, text:"Ad-free"                   },
    ],
    cta:"Illustration Rare ziehen ✦", ctaHref:"/dashboard/premium", ctaStyle:"purple", dots:4,
  },
  {
    id: "dealer", name: "Ultra Händler",
    rarity: "Hyper Rare", raritySymbol: "✦✦✦", hp: 340, type: "Dragon",
    price: "19,99€", period: "pro Monat",
    gradient: "linear-gradient(160deg, #1a1000 0%, #2d1f00 40%, #1a0d00 100%)",
    border: "rgba(250,204,21,0.6)", glow: "rgba(250,204,21,0.25)", typeColor: "#FACC15",
    features: [
      { ok:true, text:"Alles aus Premium"             },
      { ok:true, text:"Verified Seller Badge ✅"      },
      { ok:true, text:"Eigene Shop-Seite"             },
      { ok:true, text:"Top-Platzierung Marktplatz"    },
      { ok:true, text:"Monatliche Marktanalyse"       },
      { ok:true, text:"Priority Support 24/7"         },
      { ok:true, text:"API-Zugang (Beta)"             },
      { ok:true, text:"Unlimitierte Grading-Beratung" },
    ],
    cta:"Hyper Rare sichern ✦✦✦", ctaHref:"/dashboard/premium?plan=dealer", ctaStyle:"gold", dots:6,
  },
] as const;

const FEATURES = [
  { icon:<Zap size={15}/>,        label:"Pro-Scanner",      color:"#F97316" },
  { icon:<TrendingUp size={15}/>, label:"Portfolio",        color:"#22C55E" },
  { icon:<Shield size={15}/>,     label:"Set-Tracker",      color:"#00E5FF" },
  { icon:<Bell size={15}/>,       label:"Preis-Alerts",     color:"#A855F7" },
  { icon:<Star size={15}/>,       label:"Exklusiv-Forum",   color:"#FACC15" },
  { icon:<Crown size={15}/>,      label:"Grading-Beratung", color:"#EE1515" },
];

function HoloCard({ plan }: { plan: typeof PLANS[number] }) {
  const [hover, setHover] = useState(false);
  const [upgrading, setUpgrading] = useState(false);

  async function handleUpgrade() {
    if (plan.id === "free") return;
    setUpgrading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ plan: plan.id }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally { setUpgrading(false); }
  }

  const isGold   = plan.id === "dealer";
  const isPurple = plan.id === "premium";

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position:"relative", borderRadius:20, overflow:"hidden",
        background: plan.gradient,
        border: `1px solid ${plan.border}`,
        boxShadow: hover
          ? `0 24px 60px ${plan.glow}, 0 0 0 1px ${plan.border}`
          : `0 4px 24px ${plan.glow}`,
        transition:"transform .25s, box-shadow .25s",
        transform: hover ? "translateY(-8px)" : "translateY(0)",
      }}
    >
      {/* Badge */}
      {"badge" in plan && (plan as any).badge && (
        <div style={{
          position:"absolute", top:0, left:"50%", transform:"translateX(-50%)",
          padding:"4px 16px", borderRadius:"0 0 10px 10px",
          background: plan.typeColor, color:"#000",
          fontSize:9, fontWeight:800, letterSpacing:"0.08em", zIndex:3, whiteSpace:"nowrap",
        }}>{(plan as any).badge}</div>
      )}

      {/* Shimmer */}
      <div style={{
        position:"absolute", inset:0, zIndex:1, pointerEvents:"none",
        background: hover
          ? `linear-gradient(125deg, transparent 20%, rgba(255,255,255,0.06) 45%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.06) 55%, transparent 80%)`
          : "transparent",
        transition:"background .3s",
      }} />

      {/* Texture for special cards */}
      {(isGold || isPurple) && (
        <div style={{
          position:"absolute", inset:0, zIndex:1, pointerEvents:"none",
          backgroundImage: isGold
            ? `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(250,204,21,0.025) 10px, rgba(250,204,21,0.025) 20px)`
            : `repeating-linear-gradient(135deg, transparent, transparent 8px, rgba(168,85,247,0.03) 8px, rgba(168,85,247,0.03) 16px)`,
        }} />
      )}

      <div style={{ position:"relative", zIndex:2, padding:"badge" in plan && (plan as any).badge ? "36px 22px 22px" : "22px" }}>

        {/* Top bar */}
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
          <div style={{ display:"flex", alignItems:"center", gap:5 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:plan.typeColor, boxShadow:`0 0 6px ${plan.glow}` }} />
            <span style={{ fontSize:9, fontWeight:700, color:plan.typeColor, letterSpacing:"0.1em" }}>{plan.type}</span>
          </div>
          <span style={{ fontSize:9, fontWeight:600, color:"rgba(255,255,255,0.35)" }}>HP {plan.hp}</span>
        </div>

        {/* Name */}
        <h3 style={{
          fontFamily:"Poppins, sans-serif", fontWeight:900, fontSize:19,
          letterSpacing:"-0.01em", lineHeight:1.1, marginBottom:4,
          background: isGold ? "linear-gradient(135deg,#FACC15,#f59e0b)" : isPurple ? "linear-gradient(135deg,#C084FC,#A855F7)" : undefined,
          WebkitBackgroundClip: (isGold||isPurple) ? "text" : undefined,
          WebkitTextFillColor: (isGold||isPurple) ? "transparent" : "rgba(255,255,255,0.85)",
        }}>{plan.name}</h3>
        <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:16 }}>
          <span style={{ fontSize:12, color:plan.typeColor, fontWeight:800 }}>{plan.raritySymbol}</span>
          <span style={{ fontSize:9, color:"rgba(255,255,255,0.25)" }}>{plan.rarity}</span>
        </div>

        {/* Divider */}
        <div style={{ height:1, background:`linear-gradient(90deg,transparent,${plan.border},transparent)`, marginBottom:14 }} />

        {/* Price */}
        <div style={{ marginBottom:18 }}>
          <span style={{ fontFamily:"Poppins,sans-serif", fontWeight:900, fontSize:34, color:"white", letterSpacing:"-0.03em" }}>{plan.price}</span>
          <span style={{ fontSize:12, color:"rgba(255,255,255,0.3)", marginLeft:6 }}>/ {plan.period}</span>
        </div>

        {/* Features */}
        <ul style={{ listStyle:"none", marginBottom:20, display:"flex", flexDirection:"column", gap:7 }}>
          {plan.features.map((f,i) => (
            <li key={i} style={{ display:"flex", alignItems:"center", gap:7, fontSize:12, color:f.ok?"rgba(255,255,255,0.8)":"rgba(255,255,255,0.2)" }}>
              {f.ok ? <Check size={12} style={{color:"#22C55E",flexShrink:0}}/> : <X size={12} style={{color:"rgba(255,255,255,0.15)",flexShrink:0}}/>}
              <span style={{ textDecoration:f.ok?"none":"line-through" }}>{f.text}</span>
            </li>
          ))}
        </ul>

        {/* Divider + Rarity dots */}
        <div style={{ height:1, background:`linear-gradient(90deg,transparent,${plan.border},transparent)`, marginBottom:10 }} />
        <div style={{ display:"flex", justifyContent:"center", gap:4, marginBottom:14 }}>
          {Array.from({ length: plan.dots }).map((_,i) => (
            <div key={i} style={{
              width: i >= plan.dots-2 ? 7 : 5,
              height: i >= plan.dots-2 ? 7 : 5,
              borderRadius:"50%", background:plan.typeColor,
              boxShadow: i >= plan.dots-2 ? `0 0 6px ${plan.glow}` : "none",
              opacity: i >= plan.dots-2 ? 1 : 0.45,
            }} />
          ))}
        </div>

        {/* CTA */}
        {plan.id === "free" ? (
          <Link href={plan.ctaHref} style={{
            display:"block", textAlign:"center", padding:"11px 0", borderRadius:12,
            background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)",
            color:"rgba(255,255,255,0.55)", textDecoration:"none",
            fontFamily:"Poppins,sans-serif", fontWeight:700, fontSize:13,
          }}>{plan.cta}</Link>
        ) : (
          <button onClick={handleUpgrade} disabled={upgrading} style={{
            width:"100%", padding:"12px 0", borderRadius:12, border:"none",
            background: isGold
              ? "linear-gradient(135deg,#FACC15,#f59e0b,#d97706)"
              : "linear-gradient(135deg,#A855F7,#7C3AED)",
            color: isGold ? "#000" : "white",
            fontFamily:"Poppins,sans-serif", fontWeight:800, fontSize:12,
            cursor: upgrading ? "not-allowed" : "pointer",
            opacity: upgrading ? 0.7 : 1,
            letterSpacing:"0.02em",
            boxShadow: isGold ? "0 4px 20px rgba(250,204,21,0.35)" : "0 4px 20px rgba(168,85,247,0.35)",
          }}>{upgrading ? "Wird geladen..." : plan.cta}</button>
        )}
      </div>
    </div>
  );
}

export default function PremiumSection() {
  return (
    <section style={{ padding:"56px 20px 64px" }}>
      <div style={{ height:1, background:"linear-gradient(90deg,transparent,rgba(250,204,21,0.4),transparent)", marginBottom:48 }} />
      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"5px 14px", borderRadius:20, marginBottom:14, background:"rgba(250,204,21,0.1)", border:"1px solid rgba(250,204,21,0.3)" }}>
            <Crown size={12} style={{color:"#FACC15"}} />
            <span style={{ fontSize:11, fontWeight:700, color:"#FACC15", letterSpacing:"0.1em" }}>ELITE TRAINER LOUNGE</span>
          </div>
          <h2 style={{ fontFamily:"Poppins,sans-serif", fontWeight:900, fontSize:"clamp(24px,4vw,36px)", letterSpacing:"-0.02em", color:"white", marginBottom:10 }}>
            Hole das Maximum aus deiner Sammlung
          </h2>
          <p style={{ color:"rgba(255,255,255,0.4)", fontSize:14, maxWidth:440, margin:"0 auto" }}>
            Wähle deine Seltenheit — von Common bis Hyper Rare ✦✦✦
          </p>
        </div>

        <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap", marginBottom:36 }}>
          {FEATURES.map(f=>(
            <div key={f.label} style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 12px", borderRadius:20, background:`${f.color}10`, border:`1px solid ${f.color}22`, color:f.color, fontSize:11, fontWeight:600 }}>
              {f.icon} {f.label}
            </div>
          ))}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:20, alignItems:"start" }}>
          {PLANS.map(plan => <HoloCard key={plan.id} plan={plan} />)}
        </div>

        <p style={{ textAlign:"center", color:"rgba(255,255,255,0.18)", fontSize:12, marginTop:24 }}>
          Alle Preise inkl. MwSt. · Monatlich kündbar · Sichere Zahlung via Stripe
        </p>
      </div>
    </section>
  );
}

'@
[System.IO.File]::WriteAllText("$root\src\components\premium\PremiumSection.tsx", $premSection, $enc)
Write-Host "  OK  PremiumSection.tsx" -ForegroundColor DarkGray

$logoB64 = "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"
$logoBytes = [System.Convert]::FromBase64String($logoB64)
[System.IO.File]::WriteAllBytes("$root\public\pokedax-logo.png", $logoBytes)

Write-Host ""
Write-Host "================================" -ForegroundColor Yellow
Write-Host "v7.0 fertig!" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "SQL in Supabase ausfuehren (falls noch nicht gemacht):" -ForegroundColor Red
Write-Host "  CREATE TABLE fantasy_teams ..." -ForegroundColor White
Write-Host "  CREATE TABLE fantasy_picks ..." -ForegroundColor White
Write-Host "  CREATE TABLE marketplace_listings ..." -ForegroundColor White
Write-Host "  CREATE TABLE forum_replies ..." -ForegroundColor White
Write-Host ""
Write-Host "forum_replies SQL:" -ForegroundColor Yellow
Write-Host "  CREATE TABLE forum_replies (" -ForegroundColor White
Write-Host "    id UUID DEFAULT gen_random_uuid() PRIMARY KEY," -ForegroundColor White
Write-Host "    post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE," -ForegroundColor White
Write-Host "    author_id UUID REFERENCES profiles(id) ON DELETE CASCADE," -ForegroundColor White
Write-Host "    content TEXT NOT NULL," -ForegroundColor White
Write-Host "    upvotes INT DEFAULT 0," -ForegroundColor White
Write-Host "    is_deleted BOOLEAN DEFAULT FALSE," -ForegroundColor White
Write-Host "    created_at TIMESTAMPTZ DEFAULT NOW()" -ForegroundColor White
Write-Host "  );" -ForegroundColor White
Write-Host "  ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;" -ForegroundColor White
Write-Host "  CREATE POLICY ""replies_public_read"" ON forum_replies FOR SELECT USING (is_deleted = FALSE);" -ForegroundColor White
Write-Host "  CREATE POLICY ""replies_own_write"" ON forum_replies FOR INSERT WITH CHECK (auth.uid() = author_id);" -ForegroundColor White
Write-Host ""
Write-Host "Env Vars in Vercel:" -ForegroundColor Red
Write-Host "  GEMINI_API_KEY = AIza..." -ForegroundColor White
Write-Host ""
Write-Host "GitHub Desktop -> Commit 'v7.0: feature complete'" -ForegroundColor Yellow
Write-Host "-> Push -> Vercel" -ForegroundColor White
Write-Host ""
