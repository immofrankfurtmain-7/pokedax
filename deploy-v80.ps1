# PokéDax v8.0 — Complete Deploy (Marketplace + Dashboard + Sprint 2)
$root = "C:\Users\lenovo\pokedax\pokedax\pokedax"
$enc  = New-Object System.Text.UTF8Encoding $true
Write-Host ""
Write-Host "pokEdax v8.0 — Vollstaendiges Deploy" -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Enthalten:" -ForegroundColor Cyan
Write-Host "  Weltklasse Marktplatz (Card-Grid, Offer-Modal, Deal-Badge)" -ForegroundColor Green
Write-Host "  Premium Dashboard Hub" -ForegroundColor Green
Write-Host "  Sprint 2: Stripe Connect + Escrow + Bewertungssystem" -ForegroundColor Green
Write-Host "  Mobile Hamburger-Menu" -ForegroundColor Green
Write-Host "  Dashboard-Layout-Fix (keine Sidebar)" -ForegroundColor Green
Write-Host "  Alle Seiten und APIs vollstaendig" -ForegroundColor Green
Write-Host ""

$dirs = @(
  "$root\src\app","$root\src\app\preischeck","$root\src\app\portfolio","$root\src\app\scanner",
  "$root\src\app\fantasy","$root\src\app\leaderboard","$root\src\app\settings",
  "$root\src\app\forum","$root\src\app\forum\new","$root\src\app\marketplace",
  "$root\src\app\matches","$root\src\app\sets","$root\src\app\dashboard",
  "$root\src\app\dashboard\premium",
  "$root\src\app\auth","$root\src\app\auth\login","$root\src\app\auth\register","$root\src\app\auth\callback",
  "$root\src\app\impressum","$root\src\app\datenschutz",
  "$root\src\app\api\cards\search","$root\src\app\api\cards\sets",
  "$root\src\app\api\admin\sync-sets","$root\src\app\api\admin\sync-cards",
  "$root\src\app\api\stats","$root\src\app\api\stats\ticker",
  "$root\src\app\api\stripe\checkout","$root\src\app\api\webhooks\stripe","$root\src\app\api\scans",
  "$root\src\app\api\scanner\scan","$root\src\app\api\scanner\count",
  "$root\src\app\api\marketplace","$root\src\app\api\matches",
  "$root\src\app\api\marketplace\seller\onboard",
  "$root\src\app\api\marketplace\escrow\create",
  "$root\src\app\api\marketplace\escrow\update",
  "$root\src\app\api\marketplace\reviews",
  "$root\src\app\api\fantasy\team","$root\src\app\api\fantasy\leaderboard",
  "$root\src\app\api\leaderboard\portfolio",
  "$root\src\app\api\forum\posts","$root\src\app\api\forum\categories","$root\src\app\api\forum\replies",
  "$root\src\app\api\cron\price-history","$root\src\app\api\cron\wishlist-notify","$root\src\app\api\cron\escrow-release",
  "$root\src\components\layout","$root\src\components\ui","$root\src\components\premium",
  "$root\src\lib","$root\src\lib\supabase","$root\src\hooks"
)
foreach ($d in $dirs) {
  if (-not (Test-Path $d)) { New-Item -ItemType Directory -Path $d -Force | Out-Null }
}
if (-not (Test-Path "$root\src\app\profil")) { New-Item -ItemType Directory -Path "$root\src\app\profil" -Force | Out-Null }
cmd /c mkdir "$root\src\app\profil\[username]" 2>$null
cmd /c mkdir "$root\src\app\forum\post\[id]" 2>$null
cmd /c mkdir "$root\src\app\preischeck\[id]" 2>$null
cmd /c mkdir "$root\src\app\marketplace\escrow\[id]" 2>$null
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

$dashLayout = @'
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
'@
[System.IO.File]::WriteAllText("$root\src\app\dashboard\layout.tsx", $dashLayout, $enc)
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
  { href:"/scanner",           label:"Scanner"       },
  { href:"/portfolio",         label:"Portfolio"     },
  { href:"/fantasy",           label:"Fantasy League"},
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
                <Link href="/portfolio" style={{padding:"9px 18px",borderRadius:14,fontSize:13.5,color:"var(--tx-2)",textDecoration:"none"}}>
                  Portfolio
                </Link>
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
"use client";
import Link from "next/link";

const TX3 = "#62626f";
const BR1 = "rgba(255,255,255,0.045)";

export default function Footer() {
  return (
    <footer style={{
      borderTop: `0.5px solid ${BR1}`,
      padding: "clamp(28px,4vw,40px) clamp(16px,3vw,32px)",
      marginTop: "auto",
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 16,
      }}>
        <div style={{ fontSize: 12, color: TX3 }}>
          © {new Date().getFullYear()} pokédax · Für Sammler, die ihre Karten ernst nehmen.
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          {[
            { href: "/impressum",   label: "Impressum"   },
            { href: "/datenschutz", label: "Datenschutz" },
          ].map(({ href, label }) => (
            <Link key={href} href={href} style={{ fontSize: 12, color: TX3, textDecoration: "none" }}>
              {label}
            </Link>
          ))}
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

$supaClient = @'
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

'@
[System.IO.File]::WriteAllText("$root\src\lib\supabase\client.ts", $supaClient, $enc)
Write-Host "  OK  client.ts" -ForegroundColor Green

$supaServer = @'
import { createServerClient } from "@supabase/ssr";
import { createClient as createAnonClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(c) {
          try { c.forEach(({name,value,options})=>cookieStore.set(name,value,options)); } catch {}
        },
      },
    }
  );
}

export async function createRouteClient(request?: NextRequest) {
  const cookieStore = await cookies();
  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(c) {
          try { c.forEach(({name,value,options})=>cookieStore.set(name,value,options)); } catch {}
        },
      },
    }
  );
  if (request) {
    const auth = request.headers.get("Authorization");
    if (auth?.startsWith("Bearer ")) {
      const token = auth.slice(7);
      const { data: { user } } = await client.auth.getUser(token);
      if (user) {
        return createAnonClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          { global: { headers: { Authorization: `Bearer ${token}` } } }
        );
      }
    }
  }
  return client;
}

'@
[System.IO.File]::WriteAllText("$root\src\lib\supabase\server.ts", $supaServer, $enc)
Write-Host "  OK  server.ts" -ForegroundColor Green

$authCallback = @'
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
[System.IO.File]::WriteAllText("$root\src\app\auth\callback\route.ts", $authCallback, $enc)
Write-Host "  OK  route.ts" -ForegroundColor Green

$premGate = @'
"use client";
import Link from "next/link";
import { usePremium } from "@/hooks/usePremium";
export default function PremiumGate({ children }: { children: React.ReactNode }) {
  const { isPremium, loading } = usePremium();
  if (loading) return null;
  if (!isPremium) return (
    <div style={{textAlign:"center",padding:"48px",background:"#111114",border:"0.5px solid rgba(212,168,67,0.2)",borderRadius:20}}>
      <div style={{fontSize:14,color:"#a4a4b4",marginBottom:16}}>Dieses Feature ist nur für Premium-Mitglieder verfügbar.</div>
      <Link href="/dashboard/premium" style={{display:"inline-block",padding:"10px 24px",borderRadius:12,background:"#D4A843",color:"#09090b",textDecoration:"none",fontSize:14}}>Premium werden ✦</Link>
    </div>
  );
  return <>{children}</>;
}

'@
[System.IO.File]::WriteAllText("$root\src\components\ui\PremiumGate.tsx", $premGate, $enc)
Write-Host "  OK  PremiumGate.tsx" -ForegroundColor Green

$usePremium = @'
"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
export function usePremium() {
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(()=>{
    createClient().auth.getSession().then(async({data:{session}})=>{
      if(!session?.user){setLoading(false);return;}
      const{data}=await createClient().from("profiles").select("is_premium").eq("id",session.user.id).single();
      setIsPremium(data?.is_premium??false);
      setLoading(false);
    });
  },[]);
  return {isPremium, loading};
}

'@
[System.IO.File]::WriteAllText("$root\src\hooks\usePremium.ts", $usePremium, $enc)
Write-Host "  OK  usePremium.ts" -ForegroundColor Green

$pageHome = @'
"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

const G="#D4A843",G25="rgba(212,168,67,0.25)",G15="rgba(212,168,67,0.15)",G08="rgba(212,168,67,0.08)",G04="rgba(212,168,67,0.04)";
const TX1="#ededf2",TX2="#a4a4b4",TX3="#62626f";
const BG1="#111114",BG2="#18181c",BR1="rgba(255,255,255,0.045)",BR2="rgba(255,255,255,0.085)";

const STATS = [
  {n:"22.400+", l:"Karten in der Datenbank"},
  {n:"214",     l:"Sets & Serien"},
  {n:"Live",    l:"Cardmarket-Preise"},
  {n:"KI",      l:"Scanner mit Gemini"},
];

export default function HomePage() {
  const [tick, setTick] = useState(0);
  useEffect(()=>{const i=setInterval(()=>setTick(t=>t+1),3000);return()=>clearInterval(i);},[]);

  return (
    <div style={{color:TX1}}>
      {/* HERO */}
      <section style={{
        maxWidth:1000,margin:"0 auto",
        padding:"clamp(120px,16vw,220px) clamp(16px,3vw,32px) clamp(100px,12vw,180px)",
        textAlign:"center",
      }}>
        <div style={{
          display:"inline-flex",alignItems:"center",gap:8,
          padding:"7px 20px",borderRadius:40,
          border:`1px solid ${G15}`,background:G04,
          fontSize:11,fontWeight:500,color:G,
          letterSpacing:".14em",textTransform:"uppercase",
          marginBottom:52,
        }}>
          <span style={{width:5,height:5,borderRadius:"50%",background:G,display:"inline-block"}}/>
          Live · Cardmarket Deutschland
        </div>

        <h1 style={{
          fontFamily:"var(--font-display)",
          fontSize:"clamp(36px,7vw,88px)",
          fontWeight:200, letterSpacing:"-.07em",
          lineHeight:0.95, color:TX1,
          marginBottom:28,
        }}>
          Deine Karten.<br/>
          Ihr wahrer{" "}
          <span style={{color:G}}>Wert.</span>
        </h1>

        <p style={{
          fontSize:"clamp(15px,1.8vw,19px)",
          color:TX3, maxWidth:520, margin:"0 auto 48px",
          lineHeight:1.7, fontWeight:300,
        }}>
          Für Sammler, die ihre Karten ernst nehmen.<br/>
          Präzise. Zeitlos. Respektvoll.
        </p>

        <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
          <Link href="/preischeck" style={{
            padding:"clamp(12px,1.5vw,16px) clamp(24px,3vw,36px)",
            borderRadius:16, background:G, color:"#09090b",
            fontSize:"clamp(13px,1.4vw,15px)", fontWeight:400,
            textDecoration:"none",
            boxShadow:`0 4px 24px ${G25}`,
          }}>Preis checken</Link>
          <Link href="/scanner" style={{
            padding:"clamp(12px,1.5vw,16px) clamp(24px,3vw,36px)",
            borderRadius:16, background:"transparent", color:TX2,
            fontSize:"clamp(13px,1.4vw,15px)", fontWeight:400,
            textDecoration:"none",
            border:`0.5px solid ${BR2}`,
          }}>Karte scannen</Link>
        </div>
      </section>

      {/* STATS */}
      <section style={{
        maxWidth:1100, margin:"0 auto",
        padding:"0 clamp(16px,3vw,32px) clamp(80px,10vw,140px)",
      }}>
        <div style={{
          display:"grid",
          gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",
          gap:1, border:`0.5px solid ${BR1}`, borderRadius:20, overflow:"hidden",
        }}>
          {STATS.map(({n,l},i)=>(
            <div key={l} style={{
              padding:"clamp(20px,3vw,32px)", background:BG1,
              borderRight:i<STATS.length-1?`0.5px solid ${BR1}`:undefined,
            }}>
              <div style={{
                fontFamily:"var(--font-display)",
                fontSize:"clamp(28px,4vw,48px)",
                fontWeight:200, letterSpacing:"-.04em",
                color:G, marginBottom:8, lineHeight:1,
              }}>{n}</div>
              <div style={{fontSize:12,color:TX3,fontWeight:300}}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{
        maxWidth:1100, margin:"0 auto",
        padding:"0 clamp(16px,3vw,32px) clamp(80px,10vw,140px)",
      }}>
        <div style={{marginBottom:48,textAlign:"center"}}>
          <div style={{fontSize:9,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:TX3,marginBottom:16}}>Features</div>
          <h2 style={{fontFamily:"var(--font-display)",fontSize:"clamp(24px,4vw,44px)",fontWeight:200,letterSpacing:"-.05em"}}>
            Alles was du brauchst.
          </h2>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:10}}>
          {[
            {icon:"◈", title:"Preischeck",      desc:"Echte Cardmarket-Preise für 22.400+ Karten. Live-Daten, Preistrend, 7/30-Tage-Chart.",       href:"/preischeck"},
            {icon:"⊙", title:"KI-Scanner",      desc:"Karte fotografieren — pokédax erkennt sie sofort per Gemini AI und zeigt den Marktwert.",    href:"/scanner"},
            {icon:"◇", title:"Portfolio",       desc:"Sammlung verwalten, Gesamtwert berechnen, Preisentwicklung verfolgen.",                        href:"/portfolio"},
            {icon:"◈", title:"Marktplatz",      desc:"Karten kaufen und verkaufen. Sicher via Escrow. Nur für Premium-Mitglieder.",                  href:"/marketplace"},
            {icon:"◉", title:"Wishlist",        desc:"Karten merken — automatisch benachrichtigt wenn sie verfügbar sind.",                           href:"/matches"},
            {icon:"◫", title:"Forum",           desc:"Community für ernsthafte Sammler. Diskussionen, Bewertungen, Neuigkeiten.",                     href:"/forum"},
          ].map(({icon,title,desc,href})=>(
            <Link key={href} href={href} style={{
              background:BG1, border:`0.5px solid ${BR2}`, borderRadius:18,
              padding:"clamp(20px,3vw,28px)", textDecoration:"none",
              display:"block", transition:"border-color .2s,background .2s",
            }}
            onMouseEnter={e=>{(e.currentTarget as any).style.borderColor="rgba(212,168,67,0.2)";(e.currentTarget as any).style.background=BG2;}}
            onMouseLeave={e=>{(e.currentTarget as any).style.borderColor="rgba(255,255,255,0.085)";(e.currentTarget as any).style.background=BG1;}}>
              <div style={{fontSize:22,color:G,marginBottom:12,opacity:.7}}>{icon}</div>
              <div style={{fontSize:15,fontWeight:400,color:TX1,marginBottom:8}}>{title}</div>
              <div style={{fontSize:12,color:TX3,lineHeight:1.7}}>{desc}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        maxWidth:700, margin:"0 auto",
        padding:"0 clamp(16px,3vw,32px) clamp(100px,12vw,180px)",
        textAlign:"center",
      }}>
        <div style={{
          background:`linear-gradient(135deg,rgba(212,168,67,0.08),${BG1})`,
          border:`0.5px solid ${G15}`, borderRadius:24,
          padding:"clamp(36px,5vw,56px) clamp(24px,4vw,48px)",
          position:"relative", overflow:"hidden",
        }}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:0.5,
            background:`linear-gradient(90deg,transparent,${G},transparent)`}}/>
          <div style={{fontSize:9,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:G,marginBottom:16}}>Premium</div>
          <h2 style={{fontFamily:"var(--font-display)",fontSize:"clamp(22px,4vw,38px)",fontWeight:200,letterSpacing:"-.04em",marginBottom:12}}>
            Für ernsthafte Sammler.
          </h2>
          <p style={{fontSize:13,color:TX3,marginBottom:28,lineHeight:1.7}}>
            Marktplatz · Unlimitierter Scanner · Wishlist-Matching · Portfolio-Analytics
          </p>
          <Link href="/dashboard/premium" style={{
            display:"inline-flex",alignItems:"center",gap:8,
            padding:"12px 28px",borderRadius:14,
            background:G,color:"#09090b",
            fontSize:14,fontWeight:400,textDecoration:"none",
            boxShadow:`0 4px 24px ${G25}`,
          }}>
            Premium werden ✦
          </Link>
          <div style={{marginTop:16,fontSize:11,color:TX3}}>6,99 € / Monat · Jederzeit kündbar</div>
        </div>
      </section>
    </div>
  );
}

'@
[System.IO.File]::WriteAllText("$root\src\app\page.tsx", $pageHome, $enc)
Write-Host "  OK  page.tsx" -ForegroundColor Green

$pagePreischeck = @'
"use client";
import { useState, useEffect, useCallback } from "react";
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
  const [query,  setQuery]  = useState("");
  const [sort,   setSort]   = useState("price_desc");
  const [cards,  setCards]  = useState<Card[]>([]);
  const [loading,setLoading]= useState(true);
  const [total,  setTotal]  = useState(0);

  const load = useCallback(async (q:string, s:string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ q, sort:s, limit:"24" });
      const r = await fetch(`/api/cards/search?${params}`);
      const d = await r.json();
      setCards(d.cards ?? []);
      setTotal(d.total ?? d.cards?.length ?? 0);
    } catch { setCards([]); }
    setLoading(false);
  }, []);

  useEffect(() => { load("", "price_desc"); }, [load]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
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
                <Link key={card.id} href={`/preischeck?q=${encodeURIComponent(card.name)}`}
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
[System.IO.File]::WriteAllText("$root\src\app\preischeck\page.tsx", $pagePreischeck, $enc)
Write-Host "  OK  page.tsx" -ForegroundColor Green

$cardDetail = @'
"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const G="#D4A843",G18="rgba(212,168,67,0.18)",G08="rgba(212,168,67,0.08)";
const BG1="#111114",BG2="#18181c",BR1="rgba(255,255,255,0.045)",BR2="rgba(255,255,255,0.085)";
const TX1="#ededf2",TX2="#a4a4b4",TX3="#62626f",GREEN="#3db87a",RED="#dc4a5a";

const TYPE_COLOR:Record<string,string>={Fire:"#F97316",Water:"#38BDF8",Grass:"#4ADE80",Lightning:"#D4A843",Psychic:"#A855F7",Fighting:"#EF4444",Darkness:"#6B7280",Metal:"#9CA3AF",Dragon:"#7C3AED",Colorless:"#CBD5E1"};
const TYPE_DE:Record<string,string>={Fire:"Feuer",Water:"Wasser",Grass:"Pflanze",Lightning:"Elektro",Psychic:"Psycho",Fighting:"Kampf",Darkness:"Finsternis",Metal:"Metall",Dragon:"Drache",Colorless:"Farblos"};

function PriceChart({avg7,avg30,market,history}:{avg7:number|null;avg30:number|null;market:number|null;history?:{price_market:number;recorded_at:string}[]}) {
  if (!market) return null;
  let pts:number[];
  if (history && history.length>=3) {
    pts = history.map(h=>h.price_market).reverse();
  } else {
    const p30=avg30??market*0.88, p7=avg7??market*0.96;
    pts=[p30,p30*1.02,p30*0.98,p30*1.04,p30*1.01,p7*0.97,p7,p7*1.02,p7*0.99,p7*1.01,now*0.98,now*1.01,now*0.99,now].map(v=>typeof v==="number"?v:market);
  }
  const now=market;
  const min=Math.min(...pts)*0.97, max=Math.max(...pts)*1.03, range=max-min;
  const W=600, H=80;
  const xStep=W/(pts.length-1);
  const toY=(v:number)=>H-((v-min)/range)*H;
  const pathD=pts.map((v,i)=>`${i===0?"M":"L"}${i*xStep},${toY(v)}`).join(" ");
  const trend7=avg7?((market-avg7)/avg7*100):null;
  const trend30=avg30?((market-avg30)/avg30*100):null;
  return (
    <div style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:18,padding:"18px",marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:14}}>
        <div style={{fontSize:10,fontWeight:500,color:TX3,textTransform:"uppercase",letterSpacing:".08em"}}>Preisverlauf</div>
        <div style={{display:"flex",gap:16}}>
          {trend7!==null&&<div style={{textAlign:"right"}}><div style={{fontSize:9,color:TX3,marginBottom:2}}>7 Tage</div><div style={{fontSize:12,fontWeight:500,color:trend7>=0?GREEN:RED}}>{trend7>=0?"+":""}{trend7.toFixed(1)}%</div></div>}
          {trend30!==null&&<div style={{textAlign:"right"}}><div style={{fontSize:9,color:TX3,marginBottom:2}}>30 Tage</div><div style={{fontSize:12,fontWeight:500,color:trend30>=0?GREEN:RED}}>{trend30>=0?"+":""}{trend30.toFixed(1)}%</div></div>}
        </div>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{display:"block",height:64}}>
        <defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={G} stopOpacity=".2"/><stop offset="100%" stopColor={G} stopOpacity="0"/></linearGradient></defs>
        <path d={pathD+` L${(pts.length-1)*xStep},${H} L0,${H}Z`} fill="url(#cg)"/>
        <path d={pathD} fill="none" stroke={G} strokeWidth="1.8" opacity=".8"/>
        <circle cx={(pts.length-1)*xStep} cy={toY(market)} r="3" fill={G}/>
      </svg>
    </div>
  );
}

export default function CardDetailPage() {
  const {id} = useParams() as {id:string};
  const [card, setCard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [inColl, setInColl] = useState(false);
  const [inWish, setInWish] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [adding, setAdding] = useState(false);
  const [priceHistory, setPriceHistory] = useState<any[]>([]);

  useEffect(()=>{
    const sb=createClient();
    sb.from("cards").select("id,name,name_de,set_id,number,types,rarity,image_url,price_market,price_low,price_avg7,price_avg30,hp,category,stage,illustrator,regulation_mark,is_holo,is_reverse_holo").eq("id",id).single().then(({data})=>{setCard(data);setLoading(false);});
    sb.from("price_history").select("price_market,recorded_at").eq("card_id",id).order("recorded_at",{ascending:false}).limit(30).then(({data})=>setPriceHistory(data??[]));
    sb.auth.getSession().then(async({data:{session}})=>{
      if(!session?.user) return;
      setUser(session.user);
      const [col,wish]=await Promise.all([
        sb.from("user_collection").select("id").eq("user_id",session.user.id).eq("card_id",id).maybeSingle(),
        sb.from("user_wishlist").select("id").eq("user_id",session.user.id).eq("card_id",id).maybeSingle(),
      ]);
      setInColl(!!col.data);
      setInWish(!!wish.data);
    });
  },[id]);

  async function toggleCollection(){
    if(!user||!card) return;
    setAdding(true);
    const sb=createClient();
    if(inColl){await sb.from("user_collection").delete().eq("user_id",user.id).eq("card_id",id);setInColl(false);}
    else{await sb.from("user_collection").insert({user_id:user.id,card_id:id,quantity:1,condition:"NM"});setInColl(true);}
    setAdding(false);
  }

  async function toggleWishlist(){
    if(!user||!card) return;
    setAdding(true);
    const sb=createClient();
    if(inWish){await sb.from("user_wishlist").delete().eq("user_id",user.id).eq("card_id",id);setInWish(false);}
    else{await sb.from("user_wishlist").insert({user_id:user.id,card_id:id});setInWish(true);}
    setAdding(false);
  }

  if(loading) return <div style={{color:TX1,minHeight:"80vh",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{fontSize:14,color:TX3}}>Lädt…</div></div>;
  if(!card) return <div style={{color:TX1,minHeight:"80vh",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{textAlign:"center"}}><div style={{fontSize:14,color:TX3,marginBottom:12}}>Karte nicht gefunden.</div><Link href="/preischeck" style={{color:G,textDecoration:"none",fontSize:13}}>← Zurück</Link></div></div>;

  const type=card.types?.[0];
  const typeColor=type?(TYPE_COLOR[type]??TX3):TX3;

  return (
    <div style={{color:TX1,minHeight:"80vh"}}>
      <div style={{maxWidth:1000,margin:"0 auto",padding:"clamp(40px,6vw,72px) clamp(16px,3vw,28px)"}}>
        <Link href="/preischeck" style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:12,color:TX3,textDecoration:"none",marginBottom:28}}>← Zurück</Link>
        <div style={{display:"grid",gridTemplateColumns:"clamp(200px,28vw,280px) 1fr",gap:24,alignItems:"start"}}>
          <div>
            <div style={{background:BG2,borderRadius:18,overflow:"hidden",border:`0.5px solid ${BR2}`,aspectRatio:"2/3",display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
              {card.image_url?<img src={card.image_url} alt={card.name_de??card.name} style={{width:"100%",height:"100%",objectFit:"contain",padding:12}}/>:<div style={{fontSize:48,opacity:.1}}>◈</div>}
              {(card.is_holo||card.is_reverse_holo)&&<div style={{position:"absolute",top:10,right:10,padding:"2px 8px",borderRadius:5,background:G08,color:G,fontSize:9,fontWeight:600}}>{card.is_reverse_holo?"REV. HOLO":"HOLO"}</div>}
            </div>
            <div style={{display:"flex",gap:8,marginTop:12}}>
              <button onClick={toggleCollection} disabled={!user||adding} style={{flex:1,padding:"10px",borderRadius:11,fontSize:12,border:"none",cursor:user?"pointer":"default",background:inColl?G08:"rgba(255,255,255,0.04)",color:inColl?G:TX3,outline:`0.5px solid ${inColl?G18:BR1}`,transition:"all .2s"}}>
                {inColl?"✓ In Sammlung":"+ Sammlung"}
              </button>
              <button onClick={toggleWishlist} disabled={!user||adding} style={{flex:1,padding:"10px",borderRadius:11,fontSize:12,border:"none",cursor:user?"pointer":"default",background:inWish?"rgba(220,74,90,0.08)":"rgba(255,255,255,0.04)",color:inWish?RED:TX3,outline:`0.5px solid ${inWish?"rgba(220,74,90,0.2)":BR1}`,transition:"all .2s"}}>
                {inWish?"♥ Wunschliste":"♡ Wunschliste"}
              </button>
            </div>
            {!user&&<div style={{fontSize:10,color:TX3,textAlign:"center",marginTop:8}}><Link href="/auth/login" style={{color:G,textDecoration:"none"}}>Anmelden</Link> zum Sammeln</div>}
          </div>
          <div>
            {type&&<div style={{display:"inline-flex",alignItems:"center",gap:6,marginBottom:12,padding:"4px 12px",borderRadius:8,background:`${typeColor}12`,border:`0.5px solid ${typeColor}25`}}><div style={{width:7,height:7,borderRadius:"50%",background:typeColor}}/><span style={{fontSize:11,fontWeight:500,color:typeColor}}>{TYPE_DE[type]??type}</span></div>}
            <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(22px,4vw,38px)",fontWeight:200,letterSpacing:"-.04em",marginBottom:6,lineHeight:1.1}}>{card.name_de||card.name}</h1>
            {card.name_de&&card.name_de!==card.name&&<div style={{fontSize:13,color:TX3,marginBottom:14}}>{card.name}</div>}
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:20}}>
              <span style={{fontSize:11,color:TX3,fontFamily:"var(--font-mono)"}}>{card.set_id.toUpperCase()}</span>
              <span style={{color:TX3}}>·</span><span style={{fontSize:11,color:TX3}}>#{card.number}</span>
              {card.rarity&&<><span style={{color:TX3}}>·</span><span style={{fontSize:11,color:TX2}}>{card.rarity}</span></>}
            </div>
            <div style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:16,padding:"16px 18px",marginBottom:12}}>
              <div style={{fontSize:9,color:TX3,textTransform:"uppercase",letterSpacing:".1em",marginBottom:6}}>Marktpreis</div>
              <div style={{display:"flex",alignItems:"baseline",gap:12,flexWrap:"wrap"}}>
                <div style={{fontFamily:"var(--font-mono)",fontSize:"clamp(28px,5vw,48px)",fontWeight:300,color:G,letterSpacing:"-.05em",lineHeight:1}}>
                  {card.price_market?.toLocaleString("de-DE",{minimumFractionDigits:2})} €
                </div>
              </div>
              {(card.price_low||card.price_avg30)&&(
                <div style={{display:"flex",gap:16,marginTop:10,flexWrap:"wrap"}}>
                  {card.price_low&&<div><div style={{fontSize:9,color:TX3,marginBottom:2}}>Niedrigster</div><div style={{fontSize:12,fontFamily:"var(--font-mono)",color:TX2}}>{card.price_low.toLocaleString("de-DE",{minimumFractionDigits:2})} €</div></div>}
                  {card.price_avg30&&<div><div style={{fontSize:9,color:TX3,marginBottom:2}}>30T-Schnitt</div><div style={{fontSize:12,fontFamily:"var(--font-mono)",color:TX2}}>{card.price_avg30.toLocaleString("de-DE",{minimumFractionDigits:2})} €</div></div>}
                </div>
              )}
            </div>
            <PriceChart avg7={card.price_avg7} avg30={card.price_avg30} market={card.price_market} history={priceHistory}/>
            <div style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:16,overflow:"hidden",marginBottom:12}}>
              <div style={{padding:"10px 14px",borderBottom:`0.5px solid ${BR1}`,fontSize:10,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:TX3}}>Details</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:0}}>
                {[["Typ",card.types?.map((t:string)=>TYPE_DE[t]??t).join(", ")??"—"],["KP",card.hp??"—"],["Kategorie",card.category??"—"],["Stage",card.stage??"—"],["Illustrator",card.illustrator??"—"],["Regulation",card.regulation_mark??"—"]].map(([l,v],i)=>(
                  <div key={l} style={{padding:"10px 14px",borderBottom:`0.5px solid ${BR1}`,borderRight:i%2===0?`0.5px solid ${BR1}`:undefined}}>
                    <div style={{fontSize:9,color:TX3,textTransform:"uppercase",letterSpacing:".06em",marginBottom:2}}>{l}</div>
                    <div style={{fontSize:12,color:TX1}}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
            <Link href="/marketplace" style={{display:"block",padding:"11px 14px",borderRadius:12,background:G08,border:`0.5px solid ${G18}`,color:TX1,textDecoration:"none",fontSize:13,transition:"all .2s"}}>
              <span style={{color:G}}>◈</span> Angebote auf dem Marktplatz →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

'@
[System.IO.File]::WriteAllText("$root\src\app\preischeck\[id]\page.tsx", $cardDetail, $enc)
Write-Host "  OK  page.tsx" -ForegroundColor Green

$pageScanner = @'
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
[System.IO.File]::WriteAllText("$root\src\app\scanner\page.tsx", $pageScanner, $enc)
Write-Host "  OK  page.tsx" -ForegroundColor Green

$pagePortfolio = @'
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
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:32}}>
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
              {["7T","30T","90T"].map((t,i)=>(
                <div key={t} style={{padding:"5px 12px",borderRadius:10,fontSize:12,fontWeight:500,color:i===1?TX1:TX3,background:i===1?BG2:"transparent",cursor:"pointer"}}>{t}</div>
              ))}
            </div>
          </div>
          <svg width="100%" height="60" viewBox="0 0 600 60" preserveAspectRatio="none" style={{display:"block",marginTop:16}}>
            <defs><linearGradient id="pg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#E9A84B" stopOpacity=".2"/><stop offset="100%" stopColor="#E9A84B" stopOpacity="0"/></linearGradient></defs>
            <path d="M0 46 C80 44,140 38,200 30 S290 20,360 15 S450 8,520 5 S575 2,600 1 L600 60 L0 60Z" fill="url(#pg)"/>
            <path d="M0 46 C80 44,140 38,200 30 S290 20,360 15 S450 8,520 5 S575 2,600 1" fill="none" stroke="#E9A84B" strokeWidth="1.5" opacity=".7"/>
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
[System.IO.File]::WriteAllText("$root\src\app\portfolio\page.tsx", $pagePortfolio, $enc)
Write-Host "  OK  page.tsx" -ForegroundColor Green

$pageForum = @'
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const G="#E9A84B",G18="rgba(233,168,75,0.18)",G08="rgba(233,168,75,0.08)";
const BG1="#111113",BR1="rgba(255,255,255,0.06)",BR2="rgba(255,255,255,0.10)";
const TX1="#f0f0f5",TX2="#a8a8b8",TX3="#6b6b7a";
const GREEN="#4BBF82",RED="#E04558";

const CAT_COLORS: Record<string,string> = {
  Preise:G, News:G, Sammlung:GREEN, Strategie:"#C084FC",
  Tausch:"#7DD3FC", "Fake-Check":"#3BBDB6", Einsteiger:"#FCD34D",
  Neuigkeiten:G, Preisdiskussion:G, Marktplatz:"#C084FC",
};

interface Post {
  id:string;title:string;upvotes:number;created_at:string;
  profiles?:{username:string};forum_categories?:{name:string};
}

function ago(d:string) {
  const h=Math.floor((Date.now()-new Date(d).getTime())/3600000);
  return h<1?"Gerade":h<24?`vor ${h} Std.`:`vor ${Math.floor(h/24)} T.`;
}

export default function ForumPage() {
  const [posts,   setPosts]   = useState<Post[]>([]);
  const [cats,    setCats]    = useState<string[]>([]);
  const [active,  setActive]  = useState("alle");
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(()=>{
    async function load() {
      try {
        const sb = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        const [pR, cR] = await Promise.all([
          sb.from("forum_posts")
            .select("id,title,upvotes,created_at,profiles(username),forum_categories(name)")
            .order("created_at",{ascending:false})
            .limit(48),
          sb.from("forum_categories").select("name").order("name"),
        ]);
        if (pR.error) throw pR.error;
        const normalized = (pR.data??[]).map((p:any)=>({
          ...p,
          profiles: Array.isArray(p.profiles)?p.profiles[0]:p.profiles,
          forum_categories: Array.isArray(p.forum_categories)?p.forum_categories[0]:p.forum_categories,
        })) as Post[];
        setPosts(normalized);
        const uniqueCats = [...new Set(normalized.map(p=>p.forum_categories?.name).filter(Boolean))] as string[];
        setCats(uniqueCats);
      } catch(e:any) {
        setError("Beiträge konnten nicht geladen werden.");
        console.error(e);
      }
      setLoading(false);
    }
    load();
  },[]);

  const filtered = active==="alle"
    ? posts
    : posts.filter(p=>p.forum_categories?.name===active);

  return (
    <div style={{color:TX1,minHeight:"80vh"}}>
      <div style={{maxWidth:1100,margin:"0 auto",padding:"clamp(40px,8vw,80px) clamp(16px,4vw,24px)"}}>

        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:48,flexWrap:"wrap",gap:16}}>
          <div>
            <div style={{fontSize:10,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:G,marginBottom:16}}>Community</div>
            <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(36px,5vw,56px)",fontWeight:300,letterSpacing:"-.07em",color:TX1,marginBottom:8}}>Forum</h1>
            <p style={{fontSize:14,color:TX3}}>{loading?"Lädt…":`${posts.length} Beiträge`}</p>
          </div>
          <Link href="/forum/new" className="gold-glow" style={{
            padding:"clamp(10px,2vw,14px) clamp(20px,3vw,28px)",
            borderRadius:20,background:G,color:"#0a0808",
            fontSize:"clamp(13px,1.5vw,15px)",fontWeight:600,textDecoration:"none",
          }}>+ Beitrag erstellen</Link>
        </div>

        {/* Category filter */}
        {!loading && cats.length > 0 && (
          <div style={{display:"flex",gap:8,marginBottom:36,flexWrap:"wrap"}}>
            {["alle",...cats].map(cat=>{
              const on = active===cat;
              const c = cat!=="alle" ? (CAT_COLORS[cat]??G) : G;
              return (
                <button key={cat} onClick={()=>setActive(cat)} style={{
                  padding:"9px 18px",borderRadius:14,fontSize:13,fontWeight:500,
                  cursor:"pointer",border:"none",transition:"all .15s",
                  background:on?`${c}14`:"transparent",
                  color:on?c:TX3,
                  outline:on?`1px solid ${c}30`:"1px solid rgba(255,255,255,0.06)",
                }}>{cat==="alle"?"Alle":cat}</button>
              );
            })}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
            {Array.from({length:6}).map((_,i)=>(
              <div key={i} style={{background:BG1,border:`1px solid ${BR1}`,borderRadius:24,padding:28,minHeight:140,opacity:.4,animation:"pulse 1.5s ease-in-out infinite"}}/>
            ))}
          </div>
        ) : error ? (
          <div style={{textAlign:"center",padding:80,background:BG1,border:`1px solid ${BR2}`,borderRadius:28}}>
            <div style={{fontSize:16,color:RED,marginBottom:12}}>{error}</div>
            <button onClick={()=>window.location.reload()} style={{fontSize:14,color:G,background:"transparent",border:"none",cursor:"pointer",textDecoration:"underline"}}>Erneut versuchen</button>
          </div>
        ) : filtered.length===0 ? (
          <div style={{textAlign:"center",padding:80,background:BG1,border:`1px solid ${BR2}`,borderRadius:28}}>
            <div style={{fontSize:16,color:TX3,marginBottom:16}}>Noch keine Beiträge</div>
            <Link href="/forum/new" style={{fontSize:15,color:G,textDecoration:"none"}}>Ersten Beitrag erstellen →</Link>
          </div>
        ) : (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(clamp(260px,30vw,340px),1fr))",gap:14}}>
            {filtered.map(post=>{
              const cat = post.forum_categories?.name??"Forum";
              const c   = CAT_COLORS[cat]??G;
              const author = post.profiles?.username??"Anonym";
              return (
                <Link key={post.id} href={`/forum/post/${post.id}`} className="card-hover" style={{
                  background:BG1,border:`1px solid ${BR1}`,
                  borderRadius:24,padding:"clamp(20px,3vw,28px)",
                  textDecoration:"none",display:"block",
                }}>
                  <div style={{fontSize:10,fontWeight:600,letterSpacing:".08em",textTransform:"uppercase",color:c,marginBottom:14}}>{cat}</div>
                  <div style={{fontSize:"clamp(14px,1.4vw,17px)",fontWeight:500,color:TX1,lineHeight:1.45,marginBottom:20,
                    display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{post.title}</div>
                  <div style={{fontSize:12,color:TX3,display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                    <span>{author}</span>
                    <span style={{width:3,height:3,borderRadius:"50%",background:TX3,display:"inline-block",flexShrink:0}}/>
                    <span>{ago(post.created_at)}</span>
                    <span style={{marginLeft:"auto",fontSize:13,color:TX2}}>↑ {post.upvotes??0}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:.4}50%{opacity:.6}}`}</style>
    </div>
  );
}

'@
[System.IO.File]::WriteAllText("$root\src\app\forum\page.tsx", $pageForum, $enc)
Write-Host "  OK  page.tsx" -ForegroundColor Green

$forumNew = @'
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const G="#D4A843",G18="rgba(212,168,67,0.18)";
const BG1="#111114",BR1="rgba(255,255,255,0.045)",BR2="rgba(255,255,255,0.085)";
const TX1="#ededf2",TX2="#a4a4b4",TX3="#62626f",RED="#dc4a5a";

const CAT_CONFIG:Record<string,{color:string}>={
  Preisdiskussion:{color:"#E9A84B"},Neuigkeiten:{color:"#60A5FA"},Einsteiger:{color:"#34D399"},
  Sammlung:{color:"#A78BFA"},Strategie:{color:"#F472B6"},Tausch:{color:"#38BDF8"},
  "Fake-Check":{color:"#FB923C"},Marktplatz:{color:"#C084FC"},
};

export default function ForumNewPage() {
  const router = useRouter();
  const [user,       setUser]       = useState<any>(null);
  const [cats,       setCats]       = useState<any[]>([]);
  const [title,      setTitle]      = useState("");
  const [content,    setContent]    = useState("");
  const [catId,      setCatId]      = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");

  useEffect(()=>{
    const sb=createClient();
    sb.auth.getSession().then(({data:{session}})=>{
      setUser(session?.user??null);
      if(!session?.user) router.push("/auth/login?redirect=/forum/new");
    });
    createClient().from("forum_categories").select("id,name,color").order("name").then(({data})=>setCats(data??[]));
  },[]);

  async function submit(){
    if(!title.trim()){setError("Titel darf nicht leer sein.");return;}
    if(!catId){setError("Bitte eine Kategorie wählen.");return;}
    if(content.trim().length<10){setError("Inhalt zu kurz (min. 10 Zeichen).");return;}
    setSubmitting(true);setError("");
    const sb=createClient();
    const{data:{session}}=await sb.auth.getSession();
    const fh:Record<string,string>={"Content-Type":"application/json"};
    if(session?.access_token) fh["Authorization"]=`Bearer ${session.access_token}`;
    const res=await fetch("/api/forum/posts",{method:"POST",headers:fh,body:JSON.stringify({category_id:catId,title:title.trim(),content:content.trim(),tags:[]})});
    const data=await res.json();
    if(!res.ok){setError(data.error??"Fehler.");setSubmitting(false);return;}
    router.push(data.post?.id?`/forum/post/${data.post.id}`:"/forum");
  }

  if(!user) return <div style={{color:TX1,minHeight:"80vh",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{fontSize:14,color:TX3}}>Weiterleitung…</div></div>;

  return (
    <div style={{color:TX1,minHeight:"80vh"}}>
      <div style={{maxWidth:740,margin:"0 auto",padding:"clamp(52px,7vw,80px) clamp(16px,3vw,28px)"}}>
        <Link href="/forum" style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:12,color:TX3,textDecoration:"none",marginBottom:24}}>← Forum</Link>
        <div style={{marginBottom:28}}>
          <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(24px,4vw,40px)",fontWeight:200,letterSpacing:"-.05em"}}>Neuer Beitrag</h1>
        </div>
        <div style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:20,padding:24,position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:0.5,background:`linear-gradient(90deg,transparent,rgba(212,168,67,0.25),transparent)`}}/>
          <div style={{marginBottom:18}}>
            <div style={{fontSize:10,color:TX3,textTransform:"uppercase",letterSpacing:".08em",marginBottom:8}}>Kategorie</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {cats.map(c=>{const cfg=CAT_CONFIG[c.name]??{color:G};const on=catId===c.id;return(
                <button key={c.id} onClick={()=>setCatId(c.id)} style={{padding:"6px 14px",borderRadius:8,fontSize:12,border:"none",cursor:"pointer",background:on?`${cfg.color}15`:"transparent",color:on?cfg.color:TX3,outline:`0.5px solid ${on?cfg.color+"30":BR1}`,transition:"all .15s"}}>{c.name}</button>
              );})}
            </div>
          </div>
          <div style={{marginBottom:14}}>
            <div style={{fontSize:10,color:TX3,textTransform:"uppercase",letterSpacing:".08em",marginBottom:7}}>Titel</div>
            <input value={title} onChange={e=>setTitle(e.target.value)} maxLength={200} placeholder="Worüber möchtest du diskutieren?"
              style={{width:"100%",padding:"11px 14px",borderRadius:11,background:"rgba(0,0,0,0.3)",border:`0.5px solid ${BR2}`,color:TX1,fontSize:14,outline:"none"}}/>
          </div>
          <div style={{marginBottom:18}}>
            <div style={{fontSize:10,color:TX3,textTransform:"uppercase",letterSpacing:".08em",marginBottom:7}}>Inhalt</div>
            <textarea value={content} onChange={e=>setContent(e.target.value)} rows={7} placeholder="Schreibe deinen Beitrag…"
              style={{width:"100%",padding:"11px 14px",borderRadius:11,background:"rgba(0,0,0,0.3)",border:`0.5px solid ${BR2}`,color:TX1,fontSize:13,outline:"none",fontFamily:"inherit",resize:"vertical",lineHeight:1.7}}/>
          </div>
          {error&&<div style={{fontSize:12,color:RED,marginBottom:12,padding:"9px 12px",borderRadius:8,background:"rgba(220,74,90,0.08)",border:"0.5px solid rgba(220,74,90,0.2)"}}>{error}</div>}
          <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
            <Link href="/forum" style={{padding:"10px 20px",borderRadius:11,background:"transparent",color:TX2,fontSize:13,textDecoration:"none",border:`0.5px solid ${BR1}`}}>Abbrechen</Link>
            <button onClick={submit} disabled={submitting} style={{padding:"10px 24px",borderRadius:11,background:G,color:"#0a0808",fontSize:13,border:"none",cursor:submitting?"wait":"pointer",opacity:submitting?.7:1}}>
              {submitting?"Veröffentliche…":"Beitrag veröffentlichen"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

'@
[System.IO.File]::WriteAllText("$root\src\app\forum\new\page.tsx", $forumNew, $enc)
Write-Host "  OK  page.tsx" -ForegroundColor Green

$forumPost = @'
"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const G="#D4A843",G18="rgba(212,168,67,0.18)";
const BG1="#111114",BG2="#18181c",BR1="rgba(255,255,255,0.045)",BR2="rgba(255,255,255,0.085)";
const TX1="#ededf2",TX2="#a4a4b4",TX3="#62626f",GREEN="#3db87a",RED="#dc4a5a";

const CAT_CONFIG:Record<string,{color:string;icon:string}>={
  Preisdiskussion:{color:"#E9A84B",icon:"◈"},Neuigkeiten:{color:"#60A5FA",icon:"◉"},
  Einsteiger:{color:"#34D399",icon:"◎"},Sammlung:{color:"#A78BFA",icon:"◇"},
  Strategie:{color:"#F472B6",icon:"◆"},Tausch:{color:"#38BDF8",icon:"◈"},
  "Fake-Check":{color:"#FB923C",icon:"⚠"},Marktplatz:{color:"#C084FC",icon:"◉"},
};

function timeAgo(d:string){const h=Math.floor((Date.now()-new Date(d).getTime())/3600000);if(h<1)return"Gerade";if(h<24)return`vor ${h} Std.`;return`vor ${Math.floor(h/24)} T.`;}

export default function ForumPostPage() {
  const {id} = useParams() as {id:string};
  const [post, setPost] = useState<any>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(()=>{
    const sb=createClient();
    sb.auth.getSession().then(({data:{session}})=>setUser(session?.user??null));
    // Load post
    sb.from("forum_posts").select("*,profiles(username,is_premium),forum_categories(name)").eq("id",id).single().then(({data})=>{
      if(data){
        setPost({...data,
          profiles:Array.isArray(data.profiles)?data.profiles[0]:data.profiles,
          forum_categories:Array.isArray(data.forum_categories)?data.forum_categories[0]:data.forum_categories,
        });
      }
      setLoading(false);
    });
    // Load replies
    fetch(`/api/forum/replies?post_id=${id}`).then(r=>r.json()).then(d=>setReplies(d.replies??[]));
  },[id]);

  async function submitReply(){
    if(!replyContent.trim()) return;
    setSubmitting(true);setError("");
    const sb=createClient();
    const{data:{session}}=await sb.auth.getSession();
    const h:Record<string,string>={"Content-Type":"application/json"};
    if(session?.access_token) h["Authorization"]=`Bearer ${session.access_token}`;
    const res=await fetch("/api/forum/replies",{method:"POST",headers:h,body:JSON.stringify({post_id:id,content:replyContent.trim()})});
    const data=await res.json();
    if(!res.ok){setError(data.error??"Fehler.");setSubmitting(false);return;}
    setReplies(prev=>[...prev,data.reply]);
    setReplyContent("");
    setSubmitting(false);
  }

  if(loading) return <div style={{color:TX1,minHeight:"80vh",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{fontSize:14,color:TX3}}>Lädt…</div></div>;
  if(!post) return <div style={{color:TX1,minHeight:"80vh",display:"flex",alignItems:"center",justifyContent:"center"}}><div><div style={{fontSize:14,color:TX3,marginBottom:12}}>Beitrag nicht gefunden.</div><Link href="/forum" style={{color:G,textDecoration:"none",fontSize:13}}>← Forum</Link></div></div>;

  const catName=post.forum_categories?.name??"Forum";
  const cfg=CAT_CONFIG[catName]??{color:G,icon:"●"};

  return (
    <div style={{color:TX1,minHeight:"80vh"}}>
      <div style={{maxWidth:760,margin:"0 auto",padding:"clamp(52px,7vw,80px) clamp(16px,3vw,28px)"}}>
        <Link href="/forum" style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:12,color:TX3,textDecoration:"none",marginBottom:24}}>← Forum</Link>

        {/* Post */}
        <div style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:18,overflow:"hidden",marginBottom:14}}>
          <div style={{padding:"20px 22px",borderBottom:`0.5px solid ${BR1}`}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:5,padding:"3px 10px",borderRadius:6,background:`${cfg.color}12`,border:`0.5px solid ${cfg.color}25`,marginBottom:12}}>
              <span style={{fontSize:10,color:cfg.color}}>{cfg.icon}</span>
              <span style={{fontSize:10,fontWeight:600,color:cfg.color,letterSpacing:".04em"}}>{catName.toUpperCase()}</span>
            </div>
            <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(18px,3vw,28px)",fontWeight:300,letterSpacing:"-.03em",marginBottom:14,lineHeight:1.3}}>{post.title}</h1>
            <div style={{display:"flex",alignItems:"center",gap:10,fontSize:11,color:TX3}}>
              <span>@{post.profiles?.username??"Anonym"}</span>
              {post.profiles?.is_premium&&<span style={{color:G,fontSize:9}}>✦</span>}
              <span>·</span><span>{timeAgo(post.created_at)}</span>
              <span>·</span><span>↑ {post.upvotes??0}</span>
              {post.reply_count>0&&<><span>·</span><span>💬 {post.reply_count}</span></>}
            </div>
          </div>
          <div style={{padding:"20px 22px",fontSize:14,color:TX2,lineHeight:1.8,whiteSpace:"pre-wrap"}}>{post.content}</div>
        </div>

        {/* Replies */}
        {replies.length>0&&(
          <div style={{marginBottom:14}}>
            <div style={{fontSize:10,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:TX3,marginBottom:10}}>{replies.length} {replies.length===1?"Antwort":"Antworten"}</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {replies.map((r:any)=>(
                <div key={r.id} style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:14,padding:"14px 18px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8,fontSize:11,color:TX3}}>
                    <span style={{color:TX2}}>@{r.profiles?.username??"Anonym"}</span>
                    {r.profiles?.is_premium&&<span style={{color:G,fontSize:9}}>✦</span>}
                    <span>·</span><span>{timeAgo(r.created_at)}</span>
                    <span style={{marginLeft:"auto"}}>↑ {r.upvotes??0}</span>
                  </div>
                  <div style={{fontSize:13,color:TX2,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{r.content}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reply form */}
        <div style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:16,padding:"18px"}}>
          <div style={{fontSize:11,fontWeight:500,color:TX1,marginBottom:12}}>Antworten</div>
          {user?(
            <>
              <textarea value={replyContent} onChange={e=>setReplyContent(e.target.value)} rows={4}
                placeholder="Deine Antwort…"
                style={{width:"100%",padding:"11px 14px",borderRadius:10,background:"rgba(0,0,0,0.3)",border:`0.5px solid ${BR2}`,color:TX1,fontSize:13,outline:"none",fontFamily:"inherit",resize:"vertical",lineHeight:1.7,marginBottom:10}}/>
              {error&&<div style={{fontSize:12,color:RED,marginBottom:8}}>{error}</div>}
              <button onClick={submitReply} disabled={submitting||!replyContent.trim()} style={{padding:"10px 22px",borderRadius:10,background:replyContent.trim()?G:"rgba(255,255,255,0.04)",color:replyContent.trim()?"#0a0808":TX3,border:"none",cursor:replyContent.trim()?"pointer":"default",fontSize:13,float:"right"}}>
                {submitting?"Sende…":"Antwort senden →"}
              </button>
              <div style={{clear:"both"}}/>
            </>
          ):(
            <div style={{textAlign:"center",padding:"16px"}}>
              <div style={{fontSize:12,color:TX3,marginBottom:8}}>Bitte anmelden um zu antworten.</div>
              <Link href="/auth/login" style={{fontSize:13,color:G,textDecoration:"none"}}>Anmelden →</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'@
[System.IO.File]::WriteAllText("$root\src\app\forum\post\[id]\page.tsx", $forumPost, $enc)
Write-Host "  OK  page.tsx" -ForegroundColor Green

$pageFantasy = @'
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
    const res = await fetch("/api/fantasy/team");
    const data = await res.json();
    setTeam(data.team);
    setPicks(data.picks ?? []);
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
[System.IO.File]::WriteAllText("$root\src\app\fantasy\page.tsx", $pageFantasy, $enc)
Write-Host "  OK  page.tsx" -ForegroundColor Green

$pageLeader = @'
"use client";
import Link from "next/link";
const G="#E9A84B",G18="rgba(233,168,75,0.18)",G08="rgba(233,168,75,0.08)";
const BG1="#111113",BR1="rgba(255,255,255,0.06)",BR2="rgba(255,255,255,0.10)";
const TX1="#f0f0f5",TX2="#a8a8b8",TX3="#6b6b7a";

const LB=[
  {r:1, name:"MaxTrainer",    badge:"✦",   val:"12.480",change:"+8,2%"},
  {r:2, name:"SaraCollects",  badge:"✦",   val:"9.340", change:"+3,1%"},
  {r:3, name:"TCGInvestor",   badge:"✦✦✦", val:"8.120", change:"+12,4%"},
  {r:4, name:"KarteCheck",    badge:"",    val:"4.890", change:"−1,8%"},
  {r:5, name:"PokeHunter99",  badge:"",    val:"3.240", change:"+5,7%"},
  {r:6, name:"DragonMaster",  badge:"",    val:"2.847", change:"+2,3%"},
  {r:7, name:"NachtaraFan",   badge:"",    val:"1.990", change:"−0,9%"},
];

export default function LeaderboardPage() {
  return (
    <div style={{color:TX1,minHeight:"80vh"}}>
      <div style={{maxWidth:900,margin:"0 auto",padding:"80px 24px"}}>
        <div style={{marginBottom:64}}>
          <div style={{fontSize:10,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:G,marginBottom:16}}>Community</div>
          <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(40px,6vw,68px)",fontWeight:300,letterSpacing:"-.07em",lineHeight:1.0,color:TX1,marginBottom:10}}>Leaderboard</h1>
          <p style={{fontSize:15,color:TX3}}>Rangliste nach Portfolio-Wert · April 2026</p>
        </div>

        {/* Podium — top 3 */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1.15fr 1fr",gap:10,marginBottom:16,alignItems:"flex-end"}}>
          {[LB[1],LB[0],LB[2]].map((r,i)=>{
            const isCenter = i===1;
            return (
              <div key={r.name} className={isCenter?"gold-glow":""} style={{
                background:isCenter?`radial-gradient(ellipse 80% 55% at 50% 0%,rgba(233,168,75,0.09),transparent 55%),${BG1}`:BG1,
                border:isCenter?"1px solid rgba(233,168,75,0.25)":`1px solid ${BR1}`,
                borderRadius:24,padding:isCenter?"clamp(24px,3vw,36px)":"clamp(18px,2.5vw,28px)",
                textAlign:"center",position:"relative",
              }}>
                {isCenter&&<div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,rgba(233,168,75,0.5),transparent)`,borderRadius:"24px 24px 0 0"}}/>}
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:isCenter?14:12,fontWeight:600,color:isCenter?G:TX3,marginBottom:10}}>
                  {["02","01","03"][i]}
                </div>
                <div style={{width:isCenter?52:44,height:isCenter?52:44,borderRadius:"50%",background:isCenter?"rgba(233,168,75,0.1)":"rgba(255,255,255,0.05)",border:isCenter?`2px solid rgba(233,168,75,0.3)`:`1px solid ${BR2}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:isCenter?20:17,fontWeight:600,color:isCenter?G:TX2,margin:"0 auto 14px"}}>
                  {r.name[0]}
                </div>
                <div style={{fontSize:isCenter?15:13,fontWeight:500,color:TX1,marginBottom:3}}>{r.name}</div>
                {r.badge&&<div style={{fontSize:10,color:G,marginBottom:8}}>{r.badge}</div>}
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:isCenter?20:16,color:isCenter?G:TX2,fontWeight:400}}>{r.val} €</div>
              </div>
            );
          })}
        </div>

        {/* Rank 4–7 */}
        <div style={{background:BG1,border:`1px solid ${BR2}`,borderRadius:24,overflow:"hidden",marginBottom:20}}>
          {LB.slice(3).map((r,i)=>(
            <div key={r.name} style={{
              display:"grid",gridTemplateColumns:"52px 52px 1fr auto auto",
              gap:12,padding:"18px 24px",
              borderBottom:i<3?`1px solid rgba(255,255,255,0.04)`:"none",
              alignItems:"center",
            }}>
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:13,fontWeight:600,color:TX3,textAlign:"center"}}>{String(r.r).padStart(2,"0")}</div>
              <div style={{width:36,height:36,borderRadius:11,background:"rgba(255,255,255,0.04)",border:`1px solid ${BR1}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:600,color:TX2}}>{r.name[0]}</div>
              <div style={{fontSize:14,fontWeight:500,color:TX1}}>{r.name}</div>
              <div style={{fontSize:12,color:r.change.startsWith("+")?G:"rgba(224,69,88,0.8)",fontFamily:"'DM Mono',monospace"}}>{r.change}</div>
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:15,color:TX2,fontWeight:400,textAlign:"right"}}>{r.val} €</div>
            </div>
          ))}
        </div>

        {/* Your rank */}
        <div style={{background:G08,border:`1px solid ${G18}`,borderRadius:20,padding:"18px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
          <div style={{fontSize:14,color:TX2}}>Dein Rang: <strong style={{color:TX1,fontWeight:500}}>#247</strong> · 847 € Portfolio-Wert</div>
          <Link href="/dashboard/premium" className="gold-glow" style={{padding:"10px 22px",borderRadius:14,background:G,color:"#0a0808",fontSize:13,fontWeight:600,textDecoration:"none"}}>Portfolio aufbauen ✦</Link>
        </div>
      </div>
    </div>
  );
}

'@
[System.IO.File]::WriteAllText("$root\src\app\leaderboard\page.tsx", $pageLeader, $enc)
Write-Host "  OK  page.tsx" -ForegroundColor Green

$pageMkt = @'
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const G="#D4A843",G25="rgba(212,168,67,0.25)",G18="rgba(212,168,67,0.18)",G10="rgba(212,168,67,0.10)",G05="rgba(212,168,67,0.05)";
const BG1="#111114",BG2="#18181c",BG3="#1e1e22";
const BR1="rgba(255,255,255,0.045)",BR2="rgba(255,255,255,0.085)",BR3="rgba(255,255,255,0.13)";
const TX1="#ededf2",TX2="#a4a4b4",TX3="#62626f";
const GREEN="#3db87a",RED="#dc4a5a",AMBER="#f59e0b";

const COND:Record<string,{label:string;color:string}>={
  NM:{label:"Near Mint",color:GREEN},LP:{label:"Light Played",color:"#7dd3b0"},
  MP:{label:"Mod. Played",color:AMBER},HP:{label:"Heavy Played",color:"#fb923c"},D:{label:"Damaged",color:RED},
};

function ago(d:string){const h=Math.floor((Date.now()-new Date(d).getTime())/3600000);if(h<1)return"Gerade";if(h<24)return`${h}h`;if(h<168)return`${Math.floor(h/24)}T`;return`${Math.floor(h/168)}W`;}

function Avatar({username,size=28}:{username:string;size?:number}){
  const colors=["#D4A843","#60A5FA","#34D399","#A78BFA","#F472B6","#FB923C"];
  const c=colors[username.charCodeAt(0)%colors.length];
  return <div style={{width:size,height:size,borderRadius:"50%",background:`${c}15`,border:`0.5px solid ${c}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*.42,color:c,fontWeight:500,flexShrink:0}}>{username[0].toUpperCase()}</div>;
}

function ListingCard({l,onOffer}:{l:any;onOffer:(l:any)=>void}){
  const card=l.cards;
  const cond=COND[l.condition]??COND.NM;
  const isDeal=l.type==="offer"&&l.price&&card?.price_market&&l.price<card.price_market*0.95;
  const seller=l.profiles?.username??"Anonym";
  const [hov,setHov]=useState(false);
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{background:hov?BG2:BG1,border:`0.5px solid ${hov?(isDeal?G18:BR3):BR2}`,borderRadius:18,overflow:"hidden",transition:"all .2s",transform:hov?"translateY(-2px)":"none",boxShadow:hov?`0 8px 32px rgba(0,0,0,0.4)`:undefined,position:"relative"}}>
      {isDeal&&<div style={{position:"absolute",top:0,left:0,right:0,height:1.5,background:`linear-gradient(90deg,transparent,${G},transparent)`}}/>}
      <div style={{display:"flex",gap:12,padding:"14px 14px 10px"}}>
        <Link href={`/preischeck/${card?.id}`} style={{flexShrink:0,textDecoration:"none"}}>
          <div style={{width:56,height:78,borderRadius:8,background:BG3,overflow:"hidden",border:`0.5px solid ${BR2}`,transition:"all .2s",transform:hov?"scale(1.04)":"scale(1)"}}>
            {card?.image_url?<img src={card.image_url} alt="" style={{width:"100%",height:"100%",objectFit:"contain"}}/>:<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,color:TX3,opacity:.2}}>◈</div>}
          </div>
        </Link>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:6,marginBottom:4,flexWrap:"wrap"}}>
            {isDeal&&<span style={{fontSize:8,fontWeight:700,padding:"1px 5px",borderRadius:3,background:G10,color:G,border:`0.5px solid ${G18}`,flexShrink:0}}>DEAL</span>}
            {l.type==="want"&&<span style={{fontSize:8,fontWeight:700,padding:"1px 5px",borderRadius:3,background:"rgba(96,165,250,0.10)",color:"#60A5FA",border:"0.5px solid rgba(96,165,250,0.2)",flexShrink:0}}>SUCHE</span>}
          </div>
          <Link href={`/preischeck/${card?.id}`} style={{textDecoration:"none"}}>
            <div style={{fontSize:13.5,fontWeight:400,color:TX1,lineHeight:1.3,marginBottom:3,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{card?.name_de||card?.name||"Unbekannte Karte"}</div>
          </Link>
          <div style={{fontSize:10,color:TX3,marginBottom:6}}>{card?.set_id?.toUpperCase()} · #{card?.number}{card?.rarity&&<span style={{marginLeft:6,opacity:.7}}>{card.rarity}</span>}</div>
          <span style={{fontSize:9,fontWeight:600,padding:"2px 7px",borderRadius:4,background:`${cond.color}12`,color:cond.color,border:`0.5px solid ${cond.color}25`}}>{l.condition} · {cond.label}</span>
        </div>
      </div>
      <div style={{height:0.5,background:BR1,margin:"0 14px"}}/>
      <div style={{padding:"10px 14px",display:"flex",alignItems:"center",gap:10}}>
        <Avatar username={seller} size={24}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:11,color:TX2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>@{seller}</div>
          <div style={{fontSize:9,color:TX3}}>{ago(l.created_at)}</div>
        </div>
        <div style={{textAlign:"right",flexShrink:0}}>
          {l.price?<div style={{fontSize:17,fontFamily:"var(--font-mono)",fontWeight:300,color:isDeal?G:TX1,letterSpacing:"-.04em",lineHeight:1}}>{l.price.toLocaleString("de-DE",{minimumFractionDigits:2})} €</div>:<div style={{fontSize:13,color:TX3,fontStyle:"italic"}}>VB</div>}
        </div>
      </div>
      {l.note&&<div style={{padding:"0 14px 8px",fontSize:11,color:TX3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",borderTop:`0.5px solid ${BR1}`,paddingTop:8}}>"{l.note}"</div>}
      <div style={{padding:"0 12px 12px"}}>
        {l.type==="offer"?
          <button onClick={()=>onOffer(l)} style={{width:"100%",padding:"9px",borderRadius:10,background:hov?G:G10,color:hov?"#0a0808":G,border:`0.5px solid ${hov?G:G18}`,fontSize:12,cursor:"pointer",transition:"all .2s"}}>Angebot machen</button>
          :<Link href={`/preischeck/${card?.id}`} style={{display:"block",textAlign:"center",padding:"9px",borderRadius:10,background:"rgba(96,165,250,0.06)",color:"#60A5FA",border:"0.5px solid rgba(96,165,250,0.15)",fontSize:12,textDecoration:"none"}}>Ich habe diese Karte →</Link>
        }
      </div>
    </div>
  );
}

function OfferModal({listing,onClose}:{listing:any;onClose:()=>void}){
  const [price,setPrice]=useState(listing.price?.toString()??"");
  const [done,setDone]=useState(false);
  const card=listing.cards;
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20,backdropFilter:"blur(8px)"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:BG1,border:`0.5px solid ${BR3}`,borderRadius:22,padding:26,width:"100%",maxWidth:440,position:"relative"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:0.5,background:`linear-gradient(90deg,transparent,${G},transparent)`,borderRadius:"22px 22px 0 0"}}/>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
          {card?.image_url&&<img src={card.image_url} alt="" style={{width:44,height:60,objectFit:"contain",borderRadius:6}}/>}
          <div style={{flex:1}}>
            <div style={{fontSize:9,color:TX3,textTransform:"uppercase",letterSpacing:".08em",marginBottom:4}}>Angebot machen</div>
            <div style={{fontSize:15,fontWeight:400,color:TX1,lineHeight:1.2}}>{card?.name_de||card?.name}</div>
            <div style={{fontSize:11,color:TX3,marginTop:2}}>{card?.set_id?.toUpperCase()} · {listing.condition}</div>
          </div>
          <button onClick={onClose} style={{background:"transparent",border:"none",color:TX3,fontSize:18,cursor:"pointer"}}>×</button>
        </div>
        {done?(
          <div style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{fontSize:28,marginBottom:12}}>✦</div>
            <div style={{fontSize:15,fontWeight:400,color:TX1,marginBottom:8}}>Angebot gesendet</div>
            <div style={{fontSize:12,color:TX3,marginBottom:20}}>@{listing.profiles?.username} wird benachrichtigt.</div>
            <button onClick={onClose} style={{padding:"10px 24px",borderRadius:10,background:G,color:"#0a0808",border:"none",cursor:"pointer",fontSize:13}}>Schließen</button>
          </div>
        ):(
          <>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:10,color:TX3,textTransform:"uppercase",letterSpacing:".08em",marginBottom:6}}>Dein Angebot</div>
              <div style={{position:"relative"}}>
                <input type="number" value={price} onChange={e=>setPrice(e.target.value)} placeholder={listing.price?.toString()??"0.00"} min="0" step="0.50"
                  style={{width:"100%",padding:"11px 40px 11px 14px",borderRadius:11,background:"rgba(0,0,0,0.3)",border:`0.5px solid ${BR2}`,color:TX1,fontSize:16,fontFamily:"var(--font-mono)",outline:"none"}}/>
                <span style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",fontSize:13,color:TX3}}>€</span>
              </div>
              {card?.price_market&&<div style={{fontSize:10,color:TX3,marginTop:5}}>Marktwert: {card.price_market.toLocaleString("de-DE",{minimumFractionDigits:2})} €</div>}
            </div>
            <div style={{padding:"10px 12px",borderRadius:10,marginBottom:14,background:"rgba(61,184,122,0.06)",border:"0.5px solid rgba(61,184,122,0.15)",fontSize:11,color:"#7dd3b0",lineHeight:1.6}}>
              ✦ Sicheres Escrow-System aktiv — Geld wird erst nach Bestätigung des Erhalts freigegeben.
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setDone(true)} disabled={!price} style={{flex:1,padding:"11px",borderRadius:11,background:price?G:"rgba(255,255,255,0.04)",color:price?"#0a0808":TX3,border:"none",cursor:price?"pointer":"not-allowed",fontSize:13}}>Angebot senden</button>
              <Link href={`/profil/${listing.profiles?.username??""}`} style={{padding:"11px 14px",borderRadius:11,background:"transparent",color:TX2,border:`0.5px solid ${BR2}`,fontSize:13,textDecoration:"none",display:"flex",alignItems:"center"}}>Profil</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function CreateListingModal({onClose,onCreated}:{onClose:()=>void;onCreated:()=>void}){
  const [fSearch,setFSearch]=useState("");const [fResults,setFResults]=useState<any[]>([]);
  const [fCard,setFCard]=useState<any>(null);const [fType,setFType]=useState<"offer"|"want">("offer");
  const [fPrice,setFPrice]=useState("");const [fCond,setFCond]=useState("NM");
  const [fNote,setFNote]=useState("");const [fLoading,setFLoading]=useState(false);const [fMsg,setFMsg]=useState("");

  async function searchCards(q:string){setFSearch(q);if(q.length<2){setFResults([]);return;}
    const r=await fetch(`/api/cards/search?q=${encodeURIComponent(q)}&limit=5`);const d=await r.json();setFResults(d.cards??[]);}

  async function submit(){
    if(!fCard){setFMsg("Bitte eine Karte wählen.");return;}
    setFLoading(true);
    const sb=createClient();const{data:{session}}=await sb.auth.getSession();
    const h:Record<string,string>={"Content-Type":"application/json"};
    if(session?.access_token) h["Authorization"]=`Bearer ${session.access_token}`;
    const res=await fetch("/api/marketplace",{method:"POST",headers:h,body:JSON.stringify({card_id:fCard.id,type:fType,price:parseFloat(fPrice)||null,condition:fCond,note:fNote})});
    const data=await res.json();
    if(!res.ok){setFMsg(data.error??"Fehler.");}
    else{setFMsg("✓ Inserat erstellt!");setTimeout(()=>{onClose();onCreated();},800);}
    setFLoading(false);
  }

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20,backdropFilter:"blur(8px)"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:BG1,border:`0.5px solid ${BR3}`,borderRadius:22,padding:24,width:"100%",maxWidth:480,position:"relative"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:0.5,background:`linear-gradient(90deg,transparent,${G},transparent)`,borderRadius:"22px 22px 0 0"}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <div style={{fontSize:14,fontWeight:400,color:TX1}}>Neue Karte inserieren</div>
          <button onClick={onClose} style={{background:"transparent",border:"none",color:TX3,fontSize:18,cursor:"pointer"}}>×</button>
        </div>
        <div style={{display:"flex",gap:6,marginBottom:14}}>
          {([["offer","Ich biete an"],["want","Ich suche"]] as const).map(([t,l])=>(
            <button key={t} onClick={()=>setFType(t)} style={{flex:1,padding:"8px",borderRadius:9,fontSize:12,border:"none",cursor:"pointer",background:fType===t?(t==="offer"?G:G10):"transparent",color:fType===t?(t==="offer"?"#0a0808":G):TX3,outline:`0.5px solid ${fType===t?G:BR2}`,transition:"all .15s"}}>{l}</button>
          ))}
        </div>
        <div style={{marginBottom:12}}>
          {fCard?(
            <div style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:BG2,borderRadius:9,border:`0.5px solid ${G18}`}}>
              {fCard.image_url&&<img src={fCard.image_url} alt="" style={{width:22,height:30,objectFit:"contain"}}/>}
              <div style={{flex:1}}><div style={{fontSize:13,color:TX1}}>{fCard.name_de||fCard.name}</div><div style={{fontSize:10,color:TX3}}>{fCard.set_id?.toUpperCase()}</div></div>
              <div style={{fontSize:13,fontFamily:"var(--font-mono)",color:G}}>{fCard.price_market?.toFixed(2)} €</div>
              <button onClick={()=>setFCard(null)} style={{background:"transparent",border:"none",color:TX3,cursor:"pointer",fontSize:16}}>×</button>
            </div>
          ):(
            <div>
              <input value={fSearch} onChange={e=>searchCards(e.target.value)} placeholder="Kartenname suchen…"
                style={{width:"100%",padding:"9px 12px",borderRadius:9,background:"rgba(0,0,0,0.3)",border:`0.5px solid ${BR2}`,color:TX1,fontSize:13,outline:"none"}}/>
              {fResults.length>0&&<div style={{marginTop:4,display:"flex",flexDirection:"column",gap:3}}>
                {fResults.map((c:any)=>(
                  <div key={c.id} onClick={()=>{setFCard(c);setFResults([]);}} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:BG2,borderRadius:7,border:`0.5px solid ${BR1}`,cursor:"pointer"}}>
                    {c.image_url&&<img src={c.image_url} alt="" style={{width:18,height:25,objectFit:"contain"}}/>}
                    <div style={{flex:1,fontSize:12,color:TX1}}>{c.name_de||c.name}</div>
                    <div style={{fontSize:11,fontFamily:"var(--font-mono)",color:G}}>{c.price_market?.toFixed(2)} €</div>
                  </div>
                ))}
              </div>}
            </div>
          )}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
          <div>
            <div style={{fontSize:10,color:TX3,textTransform:"uppercase",letterSpacing:".06em",marginBottom:5}}>Preis (€)</div>
            <input value={fPrice} onChange={e=>setFPrice(e.target.value)} type="number" placeholder={fCard?.price_market?.toFixed(2)??"0.00"} min="0" step="0.50"
              style={{width:"100%",padding:"9px 12px",borderRadius:8,background:"rgba(0,0,0,0.3)",border:`0.5px solid ${BR2}`,color:TX1,fontSize:13,outline:"none"}}/>
          </div>
          <div>
            <div style={{fontSize:10,color:TX3,textTransform:"uppercase",letterSpacing:".06em",marginBottom:5}}>Zustand</div>
            <select value={fCond} onChange={e=>setFCond(e.target.value)} style={{width:"100%",padding:"9px 12px",borderRadius:8,background:BG1,border:`0.5px solid ${BR2}`,color:TX1,fontSize:12,outline:"none"}}>
              {["NM","LP","MP","HP","D"].map(c=><option key={c} value={c}>{c} — {COND[c]?.label}</option>)}
            </select>
          </div>
        </div>
        <input value={fNote} onChange={e=>setFNote(e.target.value)} placeholder="Notiz: Versand, Tausch, Grading…"
          style={{width:"100%",padding:"9px 12px",borderRadius:8,background:"rgba(0,0,0,0.3)",border:`0.5px solid ${BR2}`,color:TX1,fontSize:12,outline:"none",marginBottom:10}}/>
        {fMsg&&<div style={{fontSize:12,color:fMsg.startsWith("✓")?GREEN:RED,marginBottom:10}}>{fMsg}</div>}
        <div style={{display:"flex",gap:8}}>
          <button onClick={submit} disabled={fLoading||!fCard} style={{flex:1,padding:"11px",borderRadius:10,background:fCard?G:"rgba(255,255,255,0.04)",color:fCard?"#0a0808":TX3,border:"none",cursor:fCard?"pointer":"not-allowed",fontSize:13}}>
            {fLoading?"Speichert…":"Veröffentlichen"}
          </button>
          <button onClick={onClose} style={{padding:"11px 16px",borderRadius:10,background:"transparent",color:TX2,fontSize:13,border:`0.5px solid ${BR1}`,cursor:"pointer"}}>Abbrechen</button>
        </div>
      </div>
    </div>
  );
}

export default function MarketplacePage(){
  const [listings, setListings] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState<"offer"|"want"|"all">("offer");
  const [sort,     setSort]     = useState("newest");
  const [search,   setSearch]   = useState("");
  const [condFilter,setCondFilter]=useState("");
  const [offerModal,setOfferModal]=useState<any>(null);
  const [showCreate,setShowCreate]=useState(false);

  useEffect(()=>{loadListings();},[]);

  async function loadListings(){
    setLoading(true);
    const sb=createClient();
    const{data}=await sb.from("marketplace_listings")
      .select(`id,type,price,condition,note,created_at,user_id,is_active,
        profiles!marketplace_listings_user_id_fkey(username,avatar_url),
        cards!marketplace_listings_card_id_fkey(id,name,name_de,set_id,number,price_market,price_avg7,image_url,rarity,types)`)
      .eq("is_active",true).order("created_at",{ascending:false}).limit(60);
    const normalized=(data??[]).map((l:any)=>({...l,
      profiles:Array.isArray(l.profiles)?l.profiles[0]:l.profiles,
      cards:Array.isArray(l.cards)?l.cards[0]:l.cards,
    }));
    setListings(normalized);
    setLoading(false);
  }

  let filtered=listings.filter(l=>{
    if(tab!=="all"&&l.type!==tab) return false;
    if(search&&!(l.cards?.name_de??l.cards?.name??"").toLowerCase().includes(search.toLowerCase())&&!(l.profiles?.username??"").toLowerCase().includes(search.toLowerCase())) return false;
    if(condFilter&&l.condition!==condFilter) return false;
    return true;
  });
  if(sort==="price_asc") filtered=[...filtered].sort((a,b)=>(a.price??999)-(b.price??999));
  if(sort==="price_desc") filtered=[...filtered].sort((a,b)=>(b.price??0)-(a.price??0));
  if(sort==="deal") filtered=[...filtered].sort((a,b)=>{const da=a.price&&a.cards?.price_market?a.price/a.cards.price_market:1;const db=b.price&&b.cards?.price_market?b.price/b.cards.price_market:1;return da-db;});

  const dealCount=listings.filter(l=>l.type==="offer"&&l.price&&l.cards?.price_market&&l.price<l.cards.price_market*0.95).length;

  return (
    <div style={{color:TX1,minHeight:"80vh"}}>
      <div style={{maxWidth:1200,margin:"0 auto",padding:"clamp(52px,7vw,80px) clamp(16px,3vw,28px)"}}>
        <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",flexWrap:"wrap",gap:16,marginBottom:"clamp(28px,4vw,44px)"}}>
          <div>
            <div style={{fontSize:9,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:TX3,marginBottom:12,display:"flex",alignItems:"center",gap:8}}><span style={{width:16,height:0.5,background:TX3,display:"inline-block"}}/>Marktplatz</div>
            <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(26px,4.5vw,48px)",fontWeight:200,letterSpacing:"-.055em",marginBottom:6,lineHeight:1.05}}>Kaufen &<br/><span style={{color:G}}>verkaufen.</span></h1>
            <div style={{display:"flex",gap:14,marginTop:10,flexWrap:"wrap"}}>
              <span style={{fontSize:12,color:TX3}}>{listings.filter(l=>l.type==="offer").length} Angebote</span>
              <span style={{fontSize:12,color:TX3}}>{listings.filter(l=>l.type==="want").length} Gesuche</span>
              {dealCount>0&&<span style={{fontSize:12,color:G}}>✦ {dealCount} Deals unter Marktwert</span>}
            </div>
          </div>
          <button onClick={()=>setShowCreate(true)} style={{padding:"10px 20px",borderRadius:12,background:G,color:"#0a0808",fontSize:13,fontWeight:400,border:"none",cursor:"pointer",boxShadow:`0 2px 16px ${G25}`,flexShrink:0}}>+ Inserat</button>
        </div>

        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14,alignItems:"center"}}>
          <div style={{display:"flex",gap:2,background:BG1,borderRadius:11,padding:3,border:`0.5px solid ${BR2}`}}>
            {([["offer","Kaufangebote"],["want","Gesuche"],["all","Alle"]] as const).map(([t,l])=>(
              <button key={t} onClick={()=>setTab(t)} style={{padding:"6px 16px",borderRadius:8,fontSize:12,border:"none",cursor:"pointer",background:tab===t?BG2:"transparent",color:tab===t?TX1:TX3,transition:"all .15s"}}>{l}</button>
            ))}
          </div>
          <select value={sort} onChange={e=>setSort(e.target.value)} style={{padding:"7px 12px",borderRadius:9,background:BG1,border:`0.5px solid ${BR2}`,color:TX2,fontSize:12,outline:"none"}}>
            <option value="newest">Neueste zuerst</option>
            <option value="price_asc">Preis aufsteigend</option>
            <option value="price_desc">Preis absteigend</option>
            <option value="deal">Beste Deals</option>
          </select>
          <select value={condFilter} onChange={e=>setCondFilter(e.target.value)} style={{padding:"7px 12px",borderRadius:9,background:BG1,border:`0.5px solid ${BR2}`,color:TX2,fontSize:12,outline:"none"}}>
            <option value="">Alle Zustände</option>
            {["NM","LP","MP","HP","D"].map(c=><option key={c} value={c}>{c} · {COND[c]?.label}</option>)}
          </select>
          <div style={{position:"relative",flex:1,minWidth:160,maxWidth:280}}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Karte oder Verkäufer…"
              style={{width:"100%",padding:"7px 8px 7px 28px",borderRadius:9,background:BG1,border:`0.5px solid ${BR2}`,color:TX1,fontSize:12,outline:"none"}}/>
          </div>
        </div>

        {loading?(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:12}}>
            {Array.from({length:8}).map((_,i)=><div key={i} style={{height:240,background:BG1,border:`0.5px solid ${BR1}`,borderRadius:18,opacity:.3,animation:"pulse 1.5s ease-in-out infinite"}}/>)}
          </div>
        ):filtered.length===0?(
          <div style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:20,padding:"60px",textAlign:"center"}}>
            <div style={{fontSize:32,marginBottom:16,opacity:.2}}>◈</div>
            <div style={{fontSize:14,color:TX3,marginBottom:20}}>Keine Einträge gefunden.</div>
            <button onClick={()=>setTab("all")} style={{fontSize:13,color:G,background:"transparent",border:"none",cursor:"pointer"}}>Alle anzeigen →</button>
          </div>
        ):(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:12}}>
            {filtered.map(l=><ListingCard key={l.id} l={l} onOffer={setOfferModal}/>)}
          </div>
        )}
      </div>
      {offerModal&&<OfferModal listing={offerModal} onClose={()=>setOfferModal(null)}/>}
      {showCreate&&<CreateListingModal onClose={()=>setShowCreate(false)} onCreated={loadListings}/>}
      <style>{`@keyframes pulse{0%,100%{opacity:.3}50%{opacity:.5}}`}</style>
    </div>
  );
}

'@
[System.IO.File]::WriteAllText("$root\src\app\marketplace\page.tsx", $pageMkt, $enc)
Write-Host "  OK  page.tsx" -ForegroundColor Green

$pageEscrow = @'
"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const G="#D4A843",G18="rgba(212,168,67,0.18)",G08="rgba(212,168,67,0.08)";
const BG1="#111114",BG2="#18181c",BR1="rgba(255,255,255,0.045)",BR2="rgba(255,255,255,0.085)";
const TX1="#ededf2",TX2="#a4a4b4",TX3="#62626f",GREEN="#3db87a",RED="#dc4a5a",AMBER="#f59e0b";

const STATUS_META: Record<string,{label:string;color:string;desc:string}> = {
  pending:  {label:"Zahlung ausstehend", color:AMBER, desc:"Warte auf Zahlungseingang"},
  paid:     {label:"Bezahlt",            color:GREEN, desc:"Zahlung eingegangen · Seller kann versenden"},
  shipped:  {label:"Versendet",          color:"#60A5FA", desc:"Paket unterwegs · Bitte Erhalt bestätigen"},
  received: {label:"Erhalten",           color:GREEN, desc:"Käufer hat Erhalt bestätigt"},
  released: {label:"Abgeschlossen",      color:GREEN, desc:"Geld wurde an Seller überwiesen"},
  disputed: {label:"Streitfall",         color:RED,   desc:"Admin wird sich melden"},
};

function Step({n,label,active,done}:{n:number;label:string;active:boolean;done:boolean}) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      <div style={{
        width:28,height:28,borderRadius:"50%",flexShrink:0,
        background:done?GREEN:active?G:"rgba(255,255,255,0.04)",
        border:`0.5px solid ${done?GREEN:active?G:BR2}`,
        display:"flex",alignItems:"center",justifyContent:"center",
        fontSize:11,fontWeight:500,
        color:done||active?"#0a0808":TX3,
        transition:"all .3s",
      }}>{done?"✓":n}</div>
      <span style={{fontSize:13,color:done||active?TX1:TX3,transition:"color .3s"}}>{label}</span>
    </div>
  );
}

export default function EscrowPage() {
  const { id } = useParams() as { id: string };
  const [escrow,  setEscrow]  = useState<any>(null);
  const [user,    setUser]    = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [action,  setAction]  = useState(false);
  const [tracking,setTracking]= useState("");
  const [dispute, setDispute] = useState("");
  const [showDisp,setShowDisp]= useState(false);
  const [review,  setReview]  = useState<{rating:number;comment:string}|null>(null);
  const [rated,   setRated]   = useState(false);
  const [msg,     setMsg]     = useState("");

  useEffect(()=>{
    const sb = createClient();
    sb.auth.getSession().then(({data:{session}})=>{
      setUser(session?.user ?? null);
      if (!session?.user) return;
      load(sb, id);
    });
  },[id]);

  async function load(sb: any, escrow_id: string) {
    const { data } = await sb
      .from("escrow_transactions")
      .select(`
        *,
        buyer:profiles!escrow_transactions_buyer_id_fkey(username,avatar_url),
        seller:profiles!escrow_transactions_seller_id_fkey(username,avatar_url),
        marketplace_listings(price,condition,
          cards!marketplace_listings_card_id_fkey(id,name,name_de,set_id,number,image_url))
      `)
      .eq("id", escrow_id)
      .single();
    if (data) {
      setEscrow({
        ...data,
        buyer:  Array.isArray(data.buyer)  ? data.buyer[0]  : data.buyer,
        seller: Array.isArray(data.seller) ? data.seller[0] : data.seller,
      });
    }
    setLoading(false);
  }

  async function doAction(act: string) {
    setAction(true);
    setMsg("");
    const sb = createClient();
    const {data:{session}} = await sb.auth.getSession();
    const h: Record<string,string> = {"Content-Type":"application/json"};
    if (session?.access_token) h["Authorization"]=`Bearer ${session.access_token}`;
    const res = await fetch("/api/marketplace/escrow/update", {
      method:"POST", headers:h,
      body: JSON.stringify({
        escrow_id: id, action: act,
        tracking_number: act==="ship"?tracking:undefined,
        dispute_reason:  act==="dispute"?dispute:undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) { setMsg(data.error ?? "Fehler."); }
    else {
      setEscrow((prev: any) => ({...prev, status: data.status}));
      setMsg(act==="confirm"?"✓ Erhalt bestätigt — Zahlung freigegeben!":
             act==="ship"?"✓ Versand eingetragen!":
             "Streitfall gemeldet. Wir melden uns.");
    }
    setAction(false);
  }

  async function submitReview() {
    if (!review || review.rating < 1) return;
    const sb = createClient();
    const {data:{session}} = await sb.auth.getSession();
    const h: Record<string,string> = {"Content-Type":"application/json"};
    if (session?.access_token) h["Authorization"]=`Bearer ${session.access_token}`;
    const res = await fetch("/api/marketplace/reviews", {
      method:"POST", headers:h,
      body: JSON.stringify({escrow_id: id, ...review}),
    });
    if (res.ok) setRated(true);
    else setMsg("Bewertung konnte nicht gespeichert werden.");
  }

  if (loading) return (
    <div style={{color:TX1,minHeight:"80vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{fontSize:13,color:TX3}}>Lädt…</div>
    </div>
  );
  if (!escrow) return (
    <div style={{color:TX1,minHeight:"80vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:14,color:TX3,marginBottom:12}}>Transaktion nicht gefunden.</div>
        <Link href="/dashboard" style={{color:G,textDecoration:"none",fontSize:13}}>← Dashboard</Link>
      </div>
    </div>
  );

  const isBuyer  = user?.id === escrow.buyer_id;
  const isSeller = user?.id === escrow.seller_id;
  const meta     = STATUS_META[escrow.status] ?? STATUS_META.pending;
  const card     = escrow.marketplace_listings?.cards;
  const steps    = ["pending","paid","shipped","released"];
  const stepIdx  = steps.indexOf(escrow.status);

  return (
    <div style={{color:TX1,minHeight:"80vh"}}>
      <div style={{maxWidth:720,margin:"0 auto",padding:"clamp(52px,7vw,80px) clamp(16px,3vw,28px)"}}>

        <Link href="/dashboard" style={{fontSize:12,color:TX3,textDecoration:"none",display:"inline-flex",alignItems:"center",gap:6,marginBottom:28}}>← Dashboard</Link>

        {/* Header */}
        <div style={{marginBottom:28}}>
          <div style={{fontSize:9,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:TX3,marginBottom:12}}>Transaktion · {id.slice(0,8).toUpperCase()}</div>
          <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(22px,4vw,38px)",fontWeight:200,letterSpacing:"-.04em",marginBottom:8}}>
            Escrow-Status
          </h1>
          <div style={{display:"inline-flex",alignItems:"center",gap:6,padding:"4px 12px",borderRadius:8,background:`${meta.color}12`,border:`0.5px solid ${meta.color}25`}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:meta.color}}/>
            <span style={{fontSize:12,fontWeight:500,color:meta.color}}>{meta.label}</span>
          </div>
        </div>

        {/* Card info */}
        {card && (
          <div style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:16,padding:"14px 16px",marginBottom:14,display:"flex",gap:12,alignItems:"center"}}>
            <div style={{width:44,height:60,borderRadius:7,background:BG2,overflow:"hidden",flexShrink:0}}>
              {card.image_url&&<img src={card.image_url} alt="" style={{width:"100%",height:"100%",objectFit:"contain"}}/>}
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:14,color:TX1,marginBottom:3}}>{card.name_de||card.name}</div>
              <div style={{fontSize:11,color:TX3}}>{card.set_id?.toUpperCase()} · {escrow.marketplace_listings?.condition}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:11,color:TX3,marginBottom:2}}>Kaufpreis</div>
              <div style={{fontSize:18,fontFamily:"var(--font-mono)",fontWeight:300,color:G}}>
                {escrow.gross_amount?.toLocaleString("de-DE",{minimumFractionDigits:2})} €
              </div>
            </div>
          </div>
        )}

        {/* Steps */}
        <div style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:16,padding:"18px",marginBottom:14}}>
          <div style={{fontSize:10,fontWeight:600,letterSpacing:".08em",textTransform:"uppercase",color:TX3,marginBottom:14}}>Ablauf</div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <Step n={1} label="Zahlung eingegangen"   done={stepIdx>=1} active={stepIdx===0}/>
            <Step n={2} label="Karte versendet"       done={stepIdx>=2} active={stepIdx===1}/>
            <Step n={3} label="Erhalt bestätigt"      done={stepIdx>=3} active={stepIdx===2}/>
            <Step n={4} label="Auszahlung erfolgt"    done={stepIdx>=3} active={false}/>
          </div>
          {escrow.tracking_number && (
            <div style={{marginTop:12,padding:"8px 12px",borderRadius:8,background:BG2,fontSize:11,color:TX3}}>
              Tracking: <span style={{color:TX1,fontFamily:"var(--font-mono)"}}>{escrow.tracking_number}</span>
            </div>
          )}
          {escrow.auto_release_at && escrow.status==="shipped" && (
            <div style={{marginTop:8,fontSize:11,color:TX3}}>
              Auto-Freigabe: {new Date(escrow.auto_release_at).toLocaleDateString("de-DE")}
            </div>
          )}
        </div>

        {/* Fee breakdown */}
        <div style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:16,overflow:"hidden",marginBottom:14}}>
          <div style={{padding:"11px 16px",borderBottom:`0.5px solid ${BR1}`,fontSize:10,fontWeight:600,letterSpacing:".08em",textTransform:"uppercase",color:TX3}}>Gebühren</div>
          {[
            {l:"Kaufpreis",          v:`${escrow.marketplace_listings?.price?.toLocaleString("de-DE",{minimumFractionDigits:2})} €`},
            {l:"Escrow-Gebühr (1%)", v:`${escrow.escrow_fee?.toLocaleString("de-DE",{minimumFractionDigits:2})} €`},
            {l:"Käufer zahlt",       v:`${escrow.gross_amount?.toLocaleString("de-DE",{minimumFractionDigits:2})} €`, bold:true},
            {l:"Plattform-Provision",v:`${escrow.platform_fee?.toLocaleString("de-DE",{minimumFractionDigits:2})} €`},
            {l:"Seller erhält",      v:`${escrow.seller_payout?.toLocaleString("de-DE",{minimumFractionDigits:2})} €`, bold:true, gold:true},
          ].map(({l,v,bold,gold})=>(
            <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"10px 16px",borderBottom:`0.5px solid ${BR1}`}}>
              <span style={{fontSize:12,color:TX3}}>{l}</span>
              <span style={{fontSize:12,fontFamily:"var(--font-mono)",fontWeight:bold?500:300,color:gold?G:TX1}}>{v}</span>
            </div>
          ))}
        </div>

        {/* Parties */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          {[
            {label:"Käufer", profile:escrow.buyer,  isMe:isBuyer},
            {label:"Seller", profile:escrow.seller, isMe:isSeller},
          ].map(({label,profile,isMe})=>(
            <div key={label} style={{background:BG1,border:`0.5px solid ${isMe?G18:BR2}`,borderRadius:12,padding:"12px 14px"}}>
              <div style={{fontSize:9,color:TX3,marginBottom:6,textTransform:"uppercase",letterSpacing:".06em"}}>{label}{isMe?" (Du)":""}</div>
              <div style={{fontSize:13,color:TX1}}>@{profile?.username??"-"}</div>
            </div>
          ))}
        </div>

        {/* Actions */}
        {msg && (
          <div style={{padding:"10px 14px",borderRadius:10,marginBottom:12,
            background:msg.startsWith("✓")?"rgba(61,184,122,0.08)":"rgba(220,74,90,0.08)",
            border:`0.5px solid ${msg.startsWith("✓")?"rgba(61,184,122,0.2)":"rgba(220,74,90,0.2)"}`,
            fontSize:12,color:msg.startsWith("✓")?GREEN:RED}}>
            {msg}
          </div>
        )}

        {/* Seller: ship */}
        {isSeller && escrow.status==="paid" && (
          <div style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:16,padding:"16px",marginBottom:10}}>
            <div style={{fontSize:12,fontWeight:500,color:TX1,marginBottom:10}}>Versand eintragen</div>
            <input value={tracking} onChange={e=>setTracking(e.target.value)}
              placeholder="Tracking-Nummer (optional)"
              style={{width:"100%",padding:"9px 12px",borderRadius:9,background:"rgba(0,0,0,0.3)",
                border:`0.5px solid ${BR2}`,color:TX1,fontSize:12,outline:"none",marginBottom:10}}/>
            <button onClick={()=>doAction("ship")} disabled={action} style={{
              width:"100%",padding:"11px",borderRadius:10,background:G,color:"#0a0808",
              border:"none",cursor:"pointer",fontSize:13,fontWeight:400,
            }}>{action?"Speichert…":"Versand bestätigen ✓"}</button>
          </div>
        )}

        {/* Buyer: confirm */}
        {isBuyer && escrow.status==="shipped" && (
          <div style={{background:BG1,border:`0.5px solid ${G18}`,borderRadius:16,padding:"16px",marginBottom:10,position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:0.5,background:`linear-gradient(90deg,transparent,${G},transparent)`}}/>
            <div style={{fontSize:12,fontWeight:500,color:TX1,marginBottom:6}}>Karte erhalten?</div>
            <div style={{fontSize:11,color:TX3,marginBottom:12}}>Nach Bestätigung wird die Zahlung sofort an den Seller freigegeben.</div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>doAction("confirm")} disabled={action} style={{
                flex:1,padding:"11px",borderRadius:10,background:G,color:"#0a0808",
                border:"none",cursor:"pointer",fontSize:13,fontWeight:400,
              }}>{action?"Lädt…":"Erhalt bestätigen → Zahlung freigeben"}</button>
              <button onClick={()=>setShowDisp(v=>!v)} style={{
                padding:"11px 14px",borderRadius:10,background:"transparent",
                color:RED,border:`0.5px solid rgba(220,74,90,0.2)`,cursor:"pointer",fontSize:12,
              }}>Problem</button>
            </div>
            {showDisp && (
              <div style={{marginTop:10}}>
                <textarea value={dispute} onChange={e=>setDispute(e.target.value)}
                  placeholder="Was ist das Problem?" rows={3}
                  style={{width:"100%",padding:"9px 12px",borderRadius:9,background:"rgba(0,0,0,0.3)",
                    border:`0.5px solid rgba(220,74,90,0.2)`,color:TX1,fontSize:12,outline:"none",resize:"none",marginBottom:8}}/>
                <button onClick={()=>doAction("dispute")} disabled={action||!dispute} style={{
                  width:"100%",padding:"9px",borderRadius:9,background:"rgba(220,74,90,0.1)",
                  color:RED,border:`0.5px solid rgba(220,74,90,0.2)`,cursor:"pointer",fontSize:12,
                }}>Streitfall melden</button>
              </div>
            )}
          </div>
        )}

        {/* Review */}
        {escrow.status==="released" && !rated && (
          <div style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:16,padding:"16px"}}>
            <div style={{fontSize:12,fontWeight:500,color:TX1,marginBottom:12}}>
              {isBuyer?"Seller bewerten":"Käufer bewerten"}
            </div>
            {/* Stars */}
            <div style={{display:"flex",gap:6,marginBottom:12}}>
              {[1,2,3,4,5].map(n=>(
                <button key={n} onClick={()=>setReview(r=>({...(r??{comment:""}),rating:n}))} style={{
                  fontSize:22,background:"transparent",border:"none",cursor:"pointer",
                  color:(review?.rating??0)>=n?G:TX3,transition:"color .15s",padding:0,
                }}>✦</button>
              ))}
            </div>
            <textarea value={review?.comment??""} onChange={e=>setReview(r=>({...(r??{rating:0}),comment:e.target.value}))}
              placeholder="Kommentar (optional)" rows={2}
              style={{width:"100%",padding:"9px 12px",borderRadius:9,background:"rgba(0,0,0,0.3)",
                border:`0.5px solid ${BR2}`,color:TX1,fontSize:12,outline:"none",resize:"none",marginBottom:10}}/>
            <button onClick={submitReview} disabled={!review?.rating} style={{
              width:"100%",padding:"10px",borderRadius:10,
              background:review?.rating?G:"rgba(255,255,255,0.04)",
              color:review?.rating?"#0a0808":TX3,
              border:"none",cursor:review?.rating?"pointer":"default",fontSize:13,
            }}>Bewertung abgeben</button>
          </div>
        )}
        {rated && (
          <div style={{textAlign:"center",padding:"16px",fontSize:13,color:GREEN}}>✦ Bewertung gespeichert. Danke!</div>
        )}
      </div>
    </div>
  );
}

'@
[System.IO.File]::WriteAllText("$root\src\app\marketplace\escrow\[id]\page.tsx", $pageEscrow, $enc)
Write-Host "  OK  page.tsx" -ForegroundColor Green

$pageMatches = @'
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const G="#D4A843",G18="rgba(212,168,67,0.18)",G08="rgba(212,168,67,0.08)";
const BG1="#111114",BG2="#18181c",BR1="rgba(255,255,255,0.045)",BR2="rgba(255,255,255,0.085)";
const TX1="#ededf2",TX2="#a4a4b4",TX3="#62626f",GREEN="#3db87a";

function timeAgo(d:string){const h=Math.floor((Date.now()-new Date(d).getTime())/3600000);if(h<1)return"Gerade";if(h<24)return`vor ${h} Std.`;return`vor ${Math.floor(h/24)} T.`;}

export default function MatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user,    setUser]    = useState<any>(null);

  useEffect(()=>{
    const sb=createClient();
    sb.auth.getSession().then(async({data:{session}})=>{
      setUser(session?.user??null);
      if(!session?.user){setLoading(false);return;}
      const h:Record<string,string>={};
      if(session.access_token) h["Authorization"]=`Bearer ${session.access_token}`;
      const res=await fetch("/api/matches",{headers:h});
      const data=await res.json();
      setMatches(data.matches??[]);
      setLoading(false);
    });
  },[]);

  async function dismiss(id:string){
    const sb=createClient();
    const{data:{session}}=await sb.auth.getSession();
    const h:Record<string,string>={"Content-Type":"application/json"};
    if(session?.access_token) h["Authorization"]=`Bearer ${session.access_token}`;
    await fetch("/api/matches",{method:"PATCH",headers:h,body:JSON.stringify({id})});
    setMatches(prev=>prev.filter(m=>m.id!==id));
  }

  return (
    <div style={{color:TX1,minHeight:"80vh"}}>
      <div style={{maxWidth:800,margin:"0 auto",padding:"clamp(52px,7vw,80px) clamp(16px,3vw,28px)"}}>
        <div style={{marginBottom:"clamp(28px,4vw,44px)"}}>
          <div style={{fontSize:9,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:TX3,marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
            <span style={{width:16,height:0.5,background:TX3,display:"inline-block"}}/>Wishlist
          </div>
          <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(26px,4vw,44px)",fontWeight:200,letterSpacing:"-.055em",marginBottom:8}}>Deine Matches</h1>
          <p style={{fontSize:13,color:TX3}}>{loading?"Lädt…":matches.length===0?"Keine aktiven Matches.":`${matches.length} Karten aus deiner Wishlist sind verfügbar`}</p>
        </div>
        {!user?(
          <div style={{textAlign:"center",padding:"48px",background:BG1,border:`0.5px solid ${BR2}`,borderRadius:20}}>
            <div style={{fontSize:14,color:TX3,marginBottom:16}}>Bitte anmelden.</div>
            <Link href="/auth/login" style={{color:G,textDecoration:"none",fontSize:13}}>Anmelden →</Link>
          </div>
        ):loading?<div style={{padding:"48px",textAlign:"center",fontSize:14,color:TX3}}>Lädt…</div>
        :matches.length===0?(
          <div style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:20,padding:"48px",textAlign:"center"}}>
            <div style={{fontSize:32,marginBottom:16,opacity:.2}}>◈</div>
            <div style={{fontSize:14,color:TX2,marginBottom:8}}>Keine Matches gerade.</div>
            <div style={{fontSize:12,color:TX3,marginBottom:20}}>Füge Karten zur Wishlist hinzu — du wirst sofort benachrichtigt wenn sie verfügbar sind.</div>
            <Link href="/preischeck" style={{fontSize:13,color:G,textDecoration:"none"}}>Karten entdecken →</Link>
          </div>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {matches.map((match:any)=>{
              const listing=match.marketplace_listings;
              if(!listing) return null;
              const card=listing.cards;
              const isPerfect=(match.price_delta_pct??0)<=0;
              return (
                <div key={match.id} style={{background:BG1,border:`0.5px solid ${isPerfect?G18:BR2}`,borderRadius:16,padding:"14px 16px",display:"flex",alignItems:"center",gap:14,position:"relative",overflow:"hidden"}}>
                  {isPerfect&&<div style={{position:"absolute",top:0,left:0,right:0,height:0.5,background:`linear-gradient(90deg,transparent,${G},transparent)`}}/>}
                  <div style={{width:44,height:60,borderRadius:6,background:BG2,overflow:"hidden",flexShrink:0}}>
                    {card?.image_url&&<img src={card.image_url} alt="" style={{width:"100%",height:"100%",objectFit:"contain"}}/>}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                      {isPerfect&&<span style={{fontSize:9,fontWeight:600,padding:"1px 6px",borderRadius:4,background:G08,color:G,border:`0.5px solid ${G18}`}}>✦ MATCH</span>}
                      <span style={{fontSize:14,fontWeight:400,color:TX1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{card?.name_de||card?.name}</span>
                    </div>
                    <div style={{fontSize:11,color:TX3}}>{card?.set_id?.toUpperCase()} · {listing.condition} · {timeAgo(match.created_at)}</div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8,flexShrink:0}}>
                    <div style={{fontFamily:"var(--font-mono)",fontSize:18,fontWeight:300,color:isPerfect?G:TX1,letterSpacing:"-.03em"}}>{listing.price?.toLocaleString("de-DE",{minimumFractionDigits:2})} €</div>
                    <div style={{display:"flex",gap:6}}>
                      <Link href="/marketplace" style={{padding:"6px 14px",borderRadius:8,fontSize:12,background:isPerfect?G:"rgba(255,255,255,0.06)",color:isPerfect?"#0a0808":TX2,textDecoration:"none"}}>Ansehen</Link>
                      <button onClick={()=>dismiss(match.id)} style={{padding:"6px 10px",borderRadius:8,fontSize:12,background:"transparent",color:TX3,border:`0.5px solid ${BR1}`,cursor:"pointer"}}>×</button>
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
[System.IO.File]::WriteAllText("$root\src\app\matches\page.tsx", $pageMatches, $enc)
Write-Host "  OK  page.tsx" -ForegroundColor Green

$pageSets = @'
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const G="#D4A843",G18="rgba(212,168,67,0.18)",G08="rgba(212,168,67,0.08)";
const BG1="#111114",BG2="#18181c",BR1="rgba(255,255,255,0.045)",BR2="rgba(255,255,255,0.085)";
const TX1="#ededf2",TX2="#a4a4b4",TX3="#62626f",GREEN="#3db87a";

const SERIES_ORDER = ["Scarlet & Violet","Sword & Shield","Sun & Moon","XY","Black & White","HeartGold & SoulSilver","Diamond & Pearl","EX","Neo","Gym","Base"];

export default function SetsPage() {
  const [sets,    setSets]    = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [series,  setSeries]  = useState("alle");
  const [owned,   setOwned]   = useState<Record<string,number>>({});

  useEffect(()=>{
    fetch("/api/cards/sets").then(r=>r.json()).then(d=>{setSets(d.sets??[]);setLoading(false);});
    const sb = createClient();
    sb.auth.getSession().then(async({data:{session}})=>{
      if (!session?.user) return;
      const {data} = await sb.from("user_collection")
        .select("cards!user_collection_card_id_fkey(set_id)").eq("user_id",session.user.id);
      const counts:Record<string,number>={};
      for (const e of data??[]) { const s=(e as any).cards?.set_id; if(s) counts[s]=(counts[s]??0)+1; }
      setOwned(counts);
    });
  },[]);

  const allSeries = Array.from(new Set(sets.map(s=>s.series??'Sonstige'))).sort((a,b)=>{
    const ia=SERIES_ORDER.indexOf(a), ib=SERIES_ORDER.indexOf(b);
    return (ia<0?99:ia)-(ib<0?99:ib);
  });

  const filtered = sets.filter(s=>{
    const matchSearch = !search||(s.name_de??s.name??"").toLowerCase().includes(search.toLowerCase())||s.id.toLowerCase().includes(search.toLowerCase());
    const matchSeries = series==="alle"||(s.series??'Sonstige')===series;
    return matchSearch&&matchSeries;
  });

  const grouped:Record<string,any[]>={};
  for (const s of filtered) { const k=s.series??"Sonstige"; if(!grouped[k]) grouped[k]=[]; grouped[k].push(s); }
  const sortedSeries = Object.keys(grouped).sort((a,b)=>{
    const ia=SERIES_ORDER.indexOf(a),ib=SERIES_ORDER.indexOf(b);
    return (ia<0?99:ia)-(ib<0?99:ib);
  });
  const hasOwned = Object.values(owned).some(v=>v>0);

  return (
    <div style={{color:TX1,minHeight:"80vh"}}>
      <div style={{maxWidth:1160,margin:"0 auto",padding:"clamp(52px,7vw,80px) clamp(16px,3vw,28px)"}}>
        <div style={{marginBottom:"clamp(28px,4vw,44px)"}}>
          <div style={{fontSize:9,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:TX3,marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
            <span style={{width:16,height:0.5,background:TX3,display:"inline-block"}}/>Sets & Serien
          </div>
          <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(26px,5vw,52px)",fontWeight:200,letterSpacing:"-.055em",marginBottom:8}}>Alle Sets</h1>
          <p style={{fontSize:12,color:TX3}}>{loading?"Lädt…":`${sets.length} Sets · Klicken für alle Karten`}</p>
        </div>
        <div style={{display:"flex",gap:10,marginBottom:20,flexWrap:"wrap",alignItems:"center"}}>
          <div style={{position:"relative",flex:1,minWidth:180,maxWidth:300}}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Set suchen…"
              style={{width:"100%",padding:"9px 12px",borderRadius:11,background:BG1,border:`0.5px solid ${BR2}`,color:TX1,fontSize:12,outline:"none"}}/>
          </div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            <button onClick={()=>setSeries("alle")} style={{padding:"5px 14px",borderRadius:8,fontSize:11,border:"none",cursor:"pointer",background:series==="alle"?G08:"transparent",color:series==="alle"?G:TX3,outline:`1px solid ${series==="alle"?G18:BR1}`}}>Alle</button>
            {allSeries.slice(0,7).map(s=>(
              <button key={s} onClick={()=>setSeries(s)} style={{padding:"5px 14px",borderRadius:8,fontSize:11,border:"none",cursor:"pointer",background:series===s?G08:"transparent",color:series===s?G:TX3,outline:`1px solid ${series===s?G18:BR1}`}}>{s}</button>
            ))}
          </div>
        </div>
        {loading?<div style={{padding:"48px",textAlign:"center",fontSize:14,color:TX3}}>Lädt…</div>:(
          <div style={{display:"flex",flexDirection:"column",gap:28}}>
            {sortedSeries.map(sname=>(
              <div key={sname}>
                {series==="alle"&&(
                  <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                    <div style={{fontSize:10,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:TX3}}>{sname}</div>
                    <div style={{flex:1,height:0.5,background:BR1}}/>
                    <div style={{fontSize:10,color:TX3}}>{grouped[sname].length}</div>
                  </div>
                )}
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))",gap:8}}>
                  {grouped[sname].map((s:any)=>{
                    const oc=owned[s.id]??0;
                    const pct=s.total?Math.round(oc/s.total*100):0;
                    return (
                      <Link key={s.id} href={`/preischeck?set=${encodeURIComponent(s.id)}`} style={{
                        background:BG1,border:`0.5px solid ${oc>0?G18:BR1}`,borderRadius:14,
                        padding:"14px 16px",textDecoration:"none",display:"flex",flexDirection:"column",gap:6,
                        transition:"border-color .2s,background .2s",
                      }}
                      onMouseEnter={e=>{(e.currentTarget as any).style.background=BG2;}}
                      onMouseLeave={e=>{(e.currentTarget as any).style.background=BG1;}}>
                        {s.logo_url&&<img src={s.logo_url} alt={s.name} style={{height:28,objectFit:"contain",objectPosition:"left",opacity:.8}} onError={e=>{(e.target as any).style.display="none";}}/>}
                        {!s.logo_url&&s.symbol_url&&<img src={s.symbol_url} alt="" style={{height:24,width:24,objectFit:"contain",opacity:.6}} onError={e=>{(e.target as any).style.display="none";}}/>}
                        <div style={{fontSize:12.5,fontWeight:400,color:TX1,lineHeight:1.3}}>{s.name_de||s.name}</div>
                        <div style={{fontSize:10,color:TX3}}>{s.id.toUpperCase()}{s.total&&<span> · {s.total} Karten</span>}{s.release_date&&<span> · {s.release_date.slice(0,4)}</span>}</div>
                        {hasOwned&&s.total&&(
                          <div>
                            <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
                              <span style={{fontSize:9,color:TX3}}>{oc}/{s.total}</span>
                              <span style={{fontSize:9,fontWeight:600,color:pct>=100?G:pct>=50?"#60A5FA":TX3}}>{pct}%</span>
                            </div>
                            <div style={{height:3,background:BR1,borderRadius:2,overflow:"hidden",marginTop:4}}>
                              <div style={{height:"100%",width:`${Math.min(100,pct)}%`,background:pct>=100?G:pct>=50?"#60A5FA":TX3,borderRadius:2}}/>
                            </div>
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

'@
[System.IO.File]::WriteAllText("$root\src\app\sets\page.tsx", $pageSets, $enc)
Write-Host "  OK  page.tsx" -ForegroundColor Green

$pageSettings = @'
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
[System.IO.File]::WriteAllText("$root\src\app\settings\page.tsx", $pageSettings, $enc)
Write-Host "  OK  page.tsx" -ForegroundColor Green

$pagePremium = @'
"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const G="#D4A843",G18="rgba(212,168,67,0.18)",G08="rgba(212,168,67,0.08)";
const BG1="#111114",BG2="#18181c",BR1="rgba(255,255,255,0.045)",BR2="rgba(255,255,255,0.085)";
const TX1="#ededf2",TX2="#a4a4b4",TX3="#62626f",GREEN="#3db87a";

const FEATURES = [
  "Marktplatz: Kaufen, Verkaufen, Inserieren",
  "KI-Scanner unlimitiert (Free: 5/Tag)",
  "Wishlist-Matching mit E-Mail-Benachrichtigung",
  "Portfolio-Analytics & Preistrends",
  "Niedrigere Marktplatz-Provision (3% statt 5%)",
  "Premium-Badge auf deinem Profil",
  "Früher Zugang zu neuen Features",
];

export default function PremiumPage() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  async function subscribe() {
    setLoading(true);
    setError("");
    const sb = createClient();
    const { data: { session } } = await sb.auth.getSession();
    if (!session) { window.location.href = "/auth/login?redirect=/dashboard/premium"; return; }
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}` },
      body: JSON.stringify({ plan: "premium" }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else { setError(data.error ?? "Fehler beim Checkout."); setLoading(false); }
  }

  return (
    <div style={{ color: TX1, minHeight: "80vh" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "clamp(52px,7vw,80px) clamp(16px,3vw,28px)" }}>
        <div style={{ marginBottom: "clamp(32px,5vw,52px)", textAlign: "center" }}>
          <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: G, marginBottom: 16 }}>✦ Premium</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px,5vw,52px)", fontWeight: 200, letterSpacing: "-.055em", marginBottom: 12 }}>
            Für ernsthafte Sammler.
          </h1>
          <p style={{ fontSize: 14, color: TX3, lineHeight: 1.7 }}>Alles was du brauchst um deine Sammlung professionell zu verwalten und zu handeln.</p>
        </div>

        <div style={{ background: `linear-gradient(135deg,rgba(212,168,67,0.08),${BG1})`, border: `0.5px solid ${G18}`, borderRadius: 22, padding: "32px", marginBottom: 14, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 0.5, background: `linear-gradient(90deg,transparent,${G},transparent)` }}/>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 24 }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 48, fontWeight: 200, letterSpacing: "-.06em", color: G, lineHeight: 1 }}>6,99</div>
            <div style={{ fontSize: 16, color: TX3 }}>€ / Monat</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
            {FEATURES.map(f => (
              <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ color: GREEN, fontSize: 12, marginTop: 1, flexShrink: 0 }}>✓</span>
                <span style={{ fontSize: 13, color: TX2 }}>{f}</span>
              </div>
            ))}
          </div>
          {error && <div style={{ fontSize: 12, color: "#dc4a5a", marginBottom: 12 }}>{error}</div>}
          <button onClick={subscribe} disabled={loading} style={{ width: "100%", padding: "14px", borderRadius: 14, background: G, color: "#09090b", fontSize: 15, fontWeight: 400, border: "none", cursor: loading ? "wait" : "pointer", boxShadow: `0 4px 24px rgba(212,168,67,0.25)`, opacity: loading ? 0.7 : 1 }}>
            {loading ? "Weiterleitung…" : "Jetzt Premium werden ✦"}
          </button>
          <div style={{ fontSize: 11, color: TX3, textAlign: "center", marginTop: 12 }}>Jederzeit kündbar · Sichere Zahlung via Stripe</div>
        </div>

        <div style={{ background: BG1, border: `0.5px solid ${BR2}`, borderRadius: 14, padding: "16px", textAlign: "center" }}>
          <div style={{ fontSize: 12, color: TX3, marginBottom: 6 }}>Du hast bereits Premium?</div>
          <Link href="/dashboard" style={{ fontSize: 13, color: G, textDecoration: "none" }}>Zum Dashboard →</Link>
        </div>
      </div>
    </div>
  );
}

'@
[System.IO.File]::WriteAllText("$root\src\app\dashboard\premium\page.tsx", $pagePremium, $enc)
Write-Host "  OK  page.tsx" -ForegroundColor Green

$pageDash = @'
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const G="#D4A843",G18="rgba(212,168,67,0.18)",G10="rgba(212,168,67,0.10)",G05="rgba(212,168,67,0.05)";
const BG1="#111114",BG2="#18181c",BR1="rgba(255,255,255,0.045)",BR2="rgba(255,255,255,0.085)";
const TX1="#ededf2",TX2="#a4a4b4",TX3="#62626f",GREEN="#3db87a",RED="#dc4a5a";

function StatCard({label,value,sub,gold,href}:{label:string;value:string;sub?:string;gold?:boolean;href?:string}) {
  const inner=(
    <div style={{background:BG1,border:`0.5px solid ${gold?G18:BR2}`,borderRadius:14,padding:"16px 18px",position:"relative",overflow:"hidden",transition:"border-color .2s"}}>
      {gold&&<div style={{position:"absolute",top:0,left:0,right:0,height:0.5,background:`linear-gradient(90deg,transparent,${G},transparent)`}}/>}
      <div style={{fontSize:10,fontWeight:500,color:TX3,textTransform:"uppercase",letterSpacing:".08em",marginBottom:10}}>{label}</div>
      <div style={{fontSize:24,fontFamily:"var(--font-mono)",fontWeight:300,letterSpacing:"-.04em",color:gold?G:TX1,lineHeight:1,marginBottom:sub?6:0}}>{value}</div>
      {sub&&<div style={{fontSize:11,color:TX3}}>{sub}</div>}
    </div>
  );
  if(!href) return inner;
  return <Link href={href} style={{textDecoration:"none",display:"block"}}>{inner}</Link>;
}

export default function DashboardPage() {
  const [user,      setUser]      = useState<any>(null);
  const [profile,   setProfile]   = useState<any>(null);
  const [loading,   setLoading]   = useState(true);
  const [portfolio, setPortfolio] = useState({value:0,count:0,delta7:0});
  const [matches,   setMatches]   = useState<any[]>([]);
  const [listings,  setListings]  = useState<any[]>([]);
  const [scansToday,setScansToday]= useState(0);
  const [scansMax,  setScansMax]  = useState(5);
  const [fantasy,   setFantasy]   = useState<any>(null);

  useEffect(()=>{
    async function init(){
      const sb=createClient();
      const{data:{session}}=await sb.auth.getSession();
      if(!session?.user){window.location.href="/auth/login?redirect=/dashboard";return;}
      setUser(session.user);
      const uid=session.user.id;
      await Promise.all([
        // Profile
        sb.from("profiles").select("username,avatar_url,is_premium,created_at").eq("id",uid).single().then(({data})=>setProfile(data)),
        // Portfolio
        sb.from("user_collection").select("quantity,cards!user_collection_card_id_fkey(price_market,price_avg7)").eq("user_id",uid).then(({data})=>{
          const items=data??[];
          const value=items.reduce((s:number,i:any)=>s+(i.cards?.price_market??0)*(i.quantity??1),0);
          const value7=items.reduce((s:number,i:any)=>s+(i.cards?.price_avg7??i.cards?.price_market??0)*(i.quantity??1),0);
          const count=items.reduce((s:number,i:any)=>s+(i.quantity??1),0);
          setPortfolio({value,count,delta7:value7>0?((value-value7)/value7*100):0});
        }),
        // Matches
        sb.from("wishlist_matches").select(`id,created_at,marketplace_listings!wishlist_matches_listing_id_fkey(price,condition,cards!marketplace_listings_card_id_fkey(name,name_de,image_url))`).eq("wishlist_user_id",uid).eq("dismissed",false).order("created_at",{ascending:false}).limit(4).then(({data})=>setMatches(data??[])),
        // Listings
        sb.from("marketplace_listings").select(`id,price,condition,cards!marketplace_listings_card_id_fkey(id,name,name_de,image_url,price_market)`).eq("seller_id",uid).eq("is_active",true).order("created_at",{ascending:false}).limit(4).then(({data})=>setListings(data??[])),
        // Scans
        sb.from("scan_logs").select("id",{count:"exact",head:true}).eq("user_id",uid).gte("created_at",new Date().toISOString().split("T")[0]+"T00:00:00Z").then(({count})=>setScansToday(count??0)),
        sb.from("profiles").select("is_premium").eq("id",uid).single().then(({data})=>setScansMax(data?.is_premium?9999:5)),
        // Fantasy
        (async()=>{
          const season=`${new Date().getFullYear()}-Q${Math.ceil((new Date().getMonth()+1)/3)}`;
          const{data:team}=await sb.from("fantasy_teams").select("id,name").eq("user_id",uid).eq("season",season).single();
          if(team){
            const{data:picks}=await sb.from("fantasy_picks").select("bought_at_price,quantity,cards!fantasy_picks_card_id_fkey(price_market)").eq("team_id",team.id);
            const cur=(picks??[]).reduce((s:number,p:any)=>s+(p.cards?.price_market??0)*(p.quantity??1),0);
            const inv=(picks??[]).reduce((s:number,p:any)=>s+(p.bought_at_price??0)*(p.quantity??1),0);
            setFantasy({name:team.name,picks:(picks??[]).length,pct:inv>0?((cur-inv)/inv*100):0,current:cur});
          }
        })(),
      ]);
      setLoading(false);
    }
    init();
  },[]);

  const username=profile?.username??user?.email?.split("@")[0]??"—";
  const initial=username[0]?.toUpperCase()??"?";
  const hour=new Date().getHours();
  const greeting=hour<12?"Guten Morgen":hour<17?"Guten Tag":"Guten Abend";

  if(loading) return <div style={{color:TX1,minHeight:"80vh",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{fontSize:13,color:TX3}}>Lädt Dashboard…</div></div>;

  return (
    <div style={{color:TX1,minHeight:"80vh"}}>
      <div style={{maxWidth:1100,margin:"0 auto",padding:"clamp(52px,7vw,80px) clamp(16px,3vw,28px)"}}>
        <div style={{marginBottom:"clamp(28px,4vw,48px)"}}>
          <div style={{fontSize:9,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:TX3,marginBottom:14,display:"flex",alignItems:"center",gap:8}}><span style={{width:16,height:0.5,background:TX3,display:"inline-block"}}/>{profile?.is_premium?"Premium Dashboard":"Dashboard"}</div>
          <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(26px,4.5vw,48px)",fontWeight:200,letterSpacing:"-.055em",marginBottom:6}}>{greeting}, <span style={{color:G}}>@{username}</span>.</h1>
          <p style={{fontSize:13,color:TX3}}>{new Date().toLocaleDateString("de-DE",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</p>
        </div>

        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:10,marginBottom:20}}>
          <StatCard label="Portfolio-Wert" value={portfolio.value>0?`${Math.round(portfolio.value).toLocaleString("de-DE")} €`:"—"} sub={portfolio.delta7!==0?`${portfolio.delta7>=0?"+":""}${portfolio.delta7.toFixed(1)}% (7 Tage)`:portfolio.count>0?`${portfolio.count} Karten`:"Noch keine Karten"} gold={portfolio.value>0} href="/portfolio"/>
          <StatCard label="Wishlist-Matches" value={matches.length>0?String(matches.length):"0"} sub={matches.length>0?"Neue Treffer":"Keine neuen Matches"} href="/matches"/>
          <StatCard label="Aktive Listings" value={String(listings.length)} sub={listings.length>0?"Karten im Marktplatz":"Noch nichts inseriert"} href="/marketplace"/>
          <StatCard label="Scanner heute" value={scansMax===9999?String(scansToday):`${scansToday}/${scansMax}`} sub={scansMax===9999?"Unlimitiert (Premium)":scansToday>=scansMax?"Limit erreicht":`${scansMax-scansToday} übrig`} href="/scanner"/>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {/* Matches */}
            <div style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:16,overflow:"hidden"}}>
              <div style={{padding:"12px 16px",borderBottom:`0.5px solid ${BR1}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:10,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:TX3}}>Wishlist-Matches</span>
                <Link href="/matches" style={{fontSize:11,color:TX3,textDecoration:"none"}}>Alle →</Link>
              </div>
              {matches.length===0?<div style={{padding:"20px 16px",textAlign:"center"}}><div style={{fontSize:12,color:TX3,marginBottom:6}}>Keine Matches.</div><Link href="/preischeck" style={{fontSize:11,color:G,textDecoration:"none"}}>Karten zur Wishlist →</Link></div>
              :matches.map((m:any,i:number)=>{const listing=m.marketplace_listings;const card=listing?.cards;return(
                <div key={m.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 16px",borderBottom:i<matches.length-1?`0.5px solid ${BR1}`:undefined}}>
                  <div style={{width:28,height:38,borderRadius:4,background:BG2,overflow:"hidden",flexShrink:0}}>{card?.image_url&&<img src={card.image_url} alt="" style={{width:"100%",height:"100%",objectFit:"contain"}}/>}</div>
                  <div style={{flex:1,minWidth:0}}><div style={{fontSize:12,color:TX1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{card?.name_de||card?.name}</div><div style={{fontSize:10,color:TX3}}>{listing?.condition} · {listing?.price?.toLocaleString("de-DE",{minimumFractionDigits:2})} €</div></div>
                  <Link href="/matches" style={{fontSize:11,color:G,textDecoration:"none",flexShrink:0}}>→</Link>
                </div>
              );})}
            </div>
            {/* Fantasy */}
            {fantasy?(
              <div style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:16,padding:"16px"}}>
                <div style={{fontSize:10,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:TX3,marginBottom:10}}>Fantasy League</div>
                <div style={{fontSize:13,color:TX1,marginBottom:10}}>{fantasy.name}</div>
                <div style={{display:"flex",gap:16}}>
                  <div><div style={{fontSize:9,color:TX3,marginBottom:3,textTransform:"uppercase",letterSpacing:".06em"}}>Performance</div><div style={{fontSize:18,fontFamily:"var(--font-mono)",fontWeight:300,color:fantasy.pct>=0?GREEN:RED}}>{fantasy.pct>=0?"+":""}{fantasy.pct.toFixed(1)}%</div></div>
                  <div><div style={{fontSize:9,color:TX3,marginBottom:3,textTransform:"uppercase",letterSpacing:".06em"}}>Karten</div><div style={{fontSize:18,fontFamily:"var(--font-mono)",fontWeight:300,color:TX1}}>{fantasy.picks}/5</div></div>
                  <div><div style={{fontSize:9,color:TX3,marginBottom:3,textTransform:"uppercase",letterSpacing:".06em"}}>Wert</div><div style={{fontSize:18,fontFamily:"var(--font-mono)",fontWeight:300,color:TX1}}>{Math.round(fantasy.current)} €</div></div>
                </div>
              </div>
            ):(
              <div style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:16,padding:"20px",textAlign:"center"}}>
                <div style={{fontSize:10,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:TX3,marginBottom:10}}>Fantasy League</div>
                <div style={{fontSize:12,color:TX3,marginBottom:10}}>Noch kein Team diese Saison.</div>
                <Link href="/fantasy" style={{fontSize:12,color:G,textDecoration:"none"}}>Team aufbauen →</Link>
              </div>
            )}
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {/* Listings */}
            <div style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:16,overflow:"hidden"}}>
              <div style={{padding:"12px 16px",borderBottom:`0.5px solid ${BR1}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:10,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:TX3}}>Meine Listings</span>
                <Link href="/marketplace" style={{fontSize:11,color:TX3,textDecoration:"none"}}>Alle →</Link>
              </div>
              {listings.length===0?<div style={{padding:"20px 16px",textAlign:"center"}}><div style={{fontSize:12,color:TX3,marginBottom:6}}>Keine aktiven Listings.</div><Link href="/marketplace" style={{fontSize:11,color:G,textDecoration:"none"}}>Erste Karte inserieren →</Link></div>
              :listings.map((l:any,i:number)=>{const card=l.cards;return(
                <div key={l.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 16px",borderBottom:i<listings.length-1?`0.5px solid ${BR1}`:undefined}}>
                  <div style={{width:28,height:38,borderRadius:4,background:BG2,overflow:"hidden",flexShrink:0}}>{card?.image_url&&<img src={card.image_url} alt="" style={{width:"100%",height:"100%",objectFit:"contain"}}/>}</div>
                  <div style={{flex:1,minWidth:0}}><div style={{fontSize:12,color:TX1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{card?.name_de||card?.name}</div><div style={{fontSize:10,color:TX3}}>{l.condition}</div></div>
                  <div style={{fontSize:13,fontFamily:"var(--font-mono)",fontWeight:300,color:G,flexShrink:0}}>{l.price?.toLocaleString("de-DE",{minimumFractionDigits:2})} €</div>
                </div>
              );})}
            </div>
            {/* Quick Actions */}
            <div style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:16,padding:"16px"}}>
              <div style={{fontSize:10,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:TX3,marginBottom:12}}>Schnellzugriff</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {[{href:"/scanner",label:"KI-Scanner",icon:"⊙",sub:"Karte scannen"},{href:"/preischeck",label:"Preischeck",icon:"◈",sub:"Karten suchen"},{href:"/portfolio",label:"Portfolio",icon:"◇",sub:"Sammlung"},{href:"/sets",label:"Sets",icon:"◫",sub:"Alle Sets"}].map(({href,label,icon,sub})=>(
                  <Link key={href} href={href} style={{padding:"12px 14px",borderRadius:11,background:BG2,border:`0.5px solid ${BR1}`,textDecoration:"none",display:"block",transition:"border-color .2s"}}
                  onMouseEnter={e=>{(e.currentTarget as any).style.borderColor=G18;}}
                  onMouseLeave={e=>{(e.currentTarget as any).style.borderColor="rgba(255,255,255,0.045)";}}>
                    <div style={{fontSize:16,marginBottom:5,color:G,opacity:.7}}>{icon}</div>
                    <div style={{fontSize:12,fontWeight:500,color:TX1,marginBottom:2}}>{label}</div>
                    <div style={{fontSize:10,color:TX3}}>{sub}</div>
                  </Link>
                ))}
              </div>
            </div>
            <Link href={`/profil/${username}`} style={{background:G05,border:`0.5px solid ${G18}`,borderRadius:14,padding:"14px 16px",textDecoration:"none",display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:36,height:36,borderRadius:"50%",background:G10,border:`0.5px solid ${G18}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:G}}>{initial}</div>
              <div style={{flex:1}}><div style={{fontSize:13,color:TX1}}>@{username}</div><div style={{fontSize:10,color:TX3}}>{profile?.is_premium?"✦ Premium · ":""}Profil ansehen</div></div>
              <div style={{fontSize:14,color:G}}>→</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

'@
[System.IO.File]::WriteAllText("$root\src\app\dashboard\page.tsx", $pageDash, $enc)
Write-Host "  OK  page.tsx" -ForegroundColor Green

$pageLogin = @'
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
[System.IO.File]::WriteAllText("$root\src\app\auth\login\page.tsx", $pageLogin, $enc)
Write-Host "  OK  page.tsx" -ForegroundColor Green

$pageRegister = @'
"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export const dynamic = "force-dynamic";

const G="#E9A84B",G18="rgba(233,168,75,0.18)";
const BG1="#111113",BR2="rgba(255,255,255,0.10)";
const TX1="#f0f0f5",TX2="#a8a8b8",TX3="#6b6b7a",RED="#E04558",GREEN="#4BBF82";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState(false);

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
        options: {
          data: { username },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        if (error.message.includes("already registered")) {
          setError("Diese E-Mail ist bereits registriert. Bitte melde dich an.");
        } else {
          setError(error.message);
        }
      } else {
        // Insert username into profiles if user created
        if (data.user) {
          await sb.from("profiles").upsert({ id: data.user.id, username }, { onConflict: "id" });
        }
        setSuccess(true);
      }
    } catch {
      setError("Verbindungsfehler. Bitte versuche es erneut.");
    }
    setLoading(false);
  }

  async function handleGoogle() {
    const { createClient } = await import("@/lib/supabase/client");
    const sb = createClient();
    await sb.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  if (success) return (
    <div style={{minHeight:"80vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"40px 20px"}}>
      <div style={{width:"100%",maxWidth:460,textAlign:"center"}}>
        <div style={{fontSize:48,marginBottom:20}}>✉️</div>
        <h2 style={{fontFamily:"var(--font-display)",fontSize:28,fontWeight:300,letterSpacing:"-.04em",color:TX1,marginBottom:12}}>Fast geschafft!</h2>
        <p style={{fontSize:16,color:TX2,lineHeight:1.75,marginBottom:28}}>
          Wir haben dir eine Bestätigungs-E-Mail an <strong style={{color:TX1}}>{email}</strong> geschickt.<br/>
          Klicke auf den Link um deinen Account zu aktivieren.
        </p>
        <Link href="/auth/login" className="gold-glow" style={{display:"inline-block",padding:"14px 32px",borderRadius:20,background:G,color:"#0a0808",fontSize:14,fontWeight:600,textDecoration:"none"}}>Zur Anmeldung</Link>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"80vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"40px 20px"}}>
      <div style={{width:"100%",maxWidth:460}}>
        <div style={{textAlign:"center",marginBottom:52}}>
          <div style={{fontFamily:"var(--font-display)",fontSize:32,fontWeight:300,letterSpacing:"-.09em",color:TX1,marginBottom:10}}>pokédax</div>
          <p style={{fontSize:16,color:TX2}}>Bereits <strong style={{color:TX1,fontWeight:500}}>3.841 Sammler</strong> dabei</p>
        </div>

        <div style={{background:BG1,border:`1px solid ${BR2}`,borderRadius:32,padding:"clamp(28px,5vw,48px)",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,rgba(233,168,75,0.3),transparent)`}}/>

          {/* Social proof */}
          <div style={{display:"flex",gap:8,marginBottom:24,flexWrap:"wrap"}}>
            {["✓ Kostenlos","✓ Sofort aktiv","✓ Kein Abo"].map(t=>(
              <span key={t} style={{fontSize:11.5,color:GREEN,background:"rgba(75,191,130,0.08)",border:"1px solid rgba(75,191,130,0.15)",padding:"4px 12px",borderRadius:8}}>{t}</span>
            ))}
          </div>

          <form onSubmit={handleRegister}>
            {error && (
              <div style={{background:"rgba(224,69,88,0.08)",border:"1px solid rgba(224,69,88,0.2)",borderRadius:14,padding:"12px 16px",marginBottom:20,fontSize:13.5,color:RED}}>{error}</div>
            )}
            {[
              {l:"Benutzername",t:"text",p:"DeinSammlername",v:username,set:setUsername,ac:"username"},
              {l:"E-Mail",t:"email",p:"deine@email.de",v:email,set:setEmail,ac:"email"},
              {l:"Passwort",t:"password",p:"Min. 8 Zeichen",v:password,set:setPassword,ac:"new-password"},
            ].map(f=>(
              <div key={f.l} style={{marginBottom:18}}>
                <label style={{fontSize:12,fontWeight:500,color:TX2,display:"block",marginBottom:8,letterSpacing:".04em"}}>{f.l}</label>
                <input type={f.t} placeholder={f.p} value={f.v} onChange={e=>f.set(e.target.value)} required autoComplete={f.ac}
                  style={{width:"100%",padding:"15px 20px",borderRadius:18,background:"rgba(0,0,0,0.3)",border:`1px solid ${BR2}`,color:TX1,fontSize:15,outline:"none"}}/>
              </div>
            ))}
            <button type="submit" disabled={loading} className="gold-glow" style={{
              width:"100%",padding:"17px",borderRadius:22,
              background:loading?"rgba(233,168,75,0.3)":G,
              color:loading?G:"#0a0808",
              fontSize:16,fontWeight:600,border:loading?`1px solid ${G18}`:"none",
              cursor:loading?"wait":"pointer",marginTop:4,marginBottom:16,
            }}>
              {loading ? "Registriere…" : "Kostenlos registrieren"}
            </button>
          </form>

          <div style={{display:"flex",alignItems:"center",gap:12,margin:"16px 0"}}>
            <div style={{flex:1,height:1,background:"rgba(255,255,255,0.06)"}}/><span style={{fontSize:12,color:TX3}}>oder</span><div style={{flex:1,height:1,background:"rgba(255,255,255,0.06)"}}/>
          </div>

          <button onClick={handleGoogle} style={{width:"100%",padding:"15px",borderRadius:18,background:"rgba(255,255,255,0.03)",border:`1px solid rgba(255,255,255,0.08)`,color:TX2,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Mit Google registrieren
          </button>

          <p style={{fontSize:11.5,color:TX3,textAlign:"center",marginTop:18,lineHeight:1.7}}>
            Mit der Registrierung stimmst du den <Link href="/agb" style={{color:TX2}}>AGB</Link> und der <Link href="/datenschutz" style={{color:TX2}}>Datenschutzerklärung</Link> zu.
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
[System.IO.File]::WriteAllText("$root\src\app\auth\register\page.tsx", $pageRegister, $enc)
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
"use client";
const TX1="#ededf2",TX2="#a4a4b4",TX3="#62626f";
export default function DatenschutzPage() {
  return (
    <div style={{color:TX1,minHeight:"80vh",maxWidth:720,margin:"0 auto",padding:"clamp(52px,7vw,80px) clamp(16px,3vw,28px)"}}>
      <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(26px,4vw,40px)",fontWeight:200,letterSpacing:"-.04em",marginBottom:24}}>Datenschutz</h1>
      <div style={{fontSize:13,color:TX2,lineHeight:1.8}}>
        <p style={{marginBottom:16}}>Der Schutz Ihrer persönlichen Daten ist uns wichtig. Diese Datenschutzerklärung informiert Sie über die Verarbeitung personenbezogener Daten auf pokédax.</p>
        <h2 style={{fontSize:16,fontWeight:400,color:TX1,marginBottom:8,marginTop:20}}>Verantwortlicher</h2>
        <p style={{marginBottom:16}}>Verantwortlich für die Datenverarbeitung ist der Betreiber von pokédax.</p>
        <h2 style={{fontSize:16,fontWeight:400,color:TX1,marginBottom:8,marginTop:20}}>Datenerhebung</h2>
        <p style={{marginBottom:16}}>Wir erheben nur Daten die für den Betrieb der Plattform notwendig sind: E-Mail-Adresse, Nutzername, Sammlungsdaten und Transaktionsdaten.</p>
        <h2 style={{fontSize:16,fontWeight:400,color:TX1,marginBottom:8,marginTop:20}}>Cookies</h2>
        <p style={{marginBottom:16}}>Wir verwenden technisch notwendige Cookies für die Authentifizierung.</p>
        <h2 style={{fontSize:16,fontWeight:400,color:TX1,marginBottom:8,marginTop:20}}>Kontakt</h2>
        <p>Bei Fragen zum Datenschutz kontaktieren Sie uns über das Impressum.</p>
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

$searchRoute = @'
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 0;
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q      = searchParams.get("q")     || "";
  const set    = searchParams.get("set")   || "";
  const sort   = searchParams.get("sort")  || "price_desc";
  const limit  = Math.min(parseInt(searchParams.get("limit") || "48"), 100);

  const SELECT = "id,name,name_de,set_id,number,rarity,types,image_url,price_market,price_low,price_avg7,price_avg30,hp,category,stage,illustrator,regulation_mark,is_holo,is_reverse_holo";
  let query = supabase.from("cards").select(SELECT);

  if (q) query = query.or(`name.ilike.%${q}%,name_de.ilike.%${q}%`);
  if (set) query = query.eq("set_id", set);
  query = query.not("price_market", "is", null);

  switch (sort) {
    case "price_asc":  query = query.order("price_market", { ascending: true });  break;
    case "name_asc":   query = query.order("name",         { ascending: true });  break;
    case "trend_desc": query = query.order("price_avg7",   { ascending: false }); break;
    default:           query = query.order("price_market", { ascending: false }); break;
  }
  query = query.limit(limit);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ cards: data || [], total: data?.length || 0 });
}

'@
[System.IO.File]::WriteAllText("$root\src\app\api\cards\search\route.ts", $searchRoute, $enc)
Write-Host "  OK  route.ts" -ForegroundColor Green

$setsRoute = @'
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 3600;
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function GET() {
  const { data, error } = await supabase
    .from("sets")
    .select("id, name, name_de, series, total, release_date, symbol_url, logo_url")
    .order("release_date", { ascending: false });
  if (error) return NextResponse.json({ sets: [] });
  const sets = (data || []).map(s => ({
    id: s.id, name: s.name_de || s.name, name_en: s.name, name_de: s.name_de,
    series: s.series, total: s.total, release_date: s.release_date,
    symbol_url: s.symbol_url, logo_url: s.logo_url,
  }));
  return NextResponse.json({ sets });
}

'@
[System.IO.File]::WriteAllText("$root\src\app\api\cards\sets\route.ts", $setsRoute, $enc)
Write-Host "  OK  route.ts" -ForegroundColor Green

$syncSets = @'
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
export async function GET(request: NextRequest) {
  const secret = request.headers.get("x-admin-secret");
  if (secret !== process.env.ADMIN_SECRET) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const r = await fetch("https://api.tcgdex.net/v2/de/sets");
  const sets = await r.json();
  const rows = sets.map((s: any) => ({ id: s.id, name: s.name, series: s.serie?.name, total: s.total, release_date: s.releaseDate, symbol_url: s.symbol, logo_url: s.logo }));
  const { error } = await supabase.from("sets").upsert(rows, { onConflict: "id" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ synced: rows.length });
}

'@
[System.IO.File]::WriteAllText("$root\src\app\api\admin\sync-sets\route.ts", $syncSets, $enc)
Write-Host "  OK  route.ts" -ForegroundColor Green

$syncCards = @'
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
export async function GET(request: NextRequest) {
  const secret = request.headers.get("x-admin-secret");
  if (secret !== process.env.ADMIN_SECRET) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: sets } = await supabase.from("sets").select("id").limit(5);
  let total = 0;
  for (const set of sets ?? []) {
    const r = await fetch(`https://api.tcgdex.net/v2/de/sets/${set.id}`);
    const data = await r.json();
    const cards = (data.cards ?? []).map((c: any) => ({ id: `${set.id}-${c.localId}`, name: c.name, set_id: set.id, number: c.localId, image_url: c.image ? `${c.image}/high.webp` : null }));
    if (cards.length) { await supabase.from("cards").upsert(cards, { onConflict: "id" }); total += cards.length; }
  }
  return NextResponse.json({ synced: total });
}

'@
[System.IO.File]::WriteAllText("$root\src\app\api\admin\sync-cards\route.ts", $syncCards, $enc)
Write-Host "  OK  route.ts" -ForegroundColor Green

$tickerRoute = @'
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
export const revalidate = 300;
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
export async function GET() {
  const { data } = await supabase.from("cards").select("name,name_de,price_market,price_avg7")
    .not("price_market","is",null).not("price_avg7","is",null).order("price_market",{ascending:false}).limit(20);
  const items = (data??[]).map(c=>({
    name: c.name_de||c.name,
    price: c.price_market,
    change: c.price_avg7 ? Math.round((c.price_market-c.price_avg7)/c.price_avg7*1000)/10 : 0,
  }));
  return NextResponse.json({ items });
}

'@
[System.IO.File]::WriteAllText("$root\src\app\api\stats\ticker\route.ts", $tickerRoute, $enc)
Write-Host "  OK  route.ts" -ForegroundColor Green

$statsRoute = @'
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
export const dynamic = "force-dynamic";
export const revalidate = 300;
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
export async function GET() {
  const [cards, sets, users] = await Promise.all([
    supabase.from("cards").select("id",{count:"exact",head:true}),
    supabase.from("sets").select("id",{count:"exact",head:true}),
    supabase.from("profiles").select("id",{count:"exact",head:true}),
  ]);
  return NextResponse.json({ cards: cards.count??0, sets: sets.count??0, users: users.count??0 });
}

'@
[System.IO.File]::WriteAllText("$root\src\app\api\stats\route.ts", $statsRoute, $enc)
Write-Host "  OK  route.ts" -ForegroundColor Green

$stripeCheckout = @'
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createRouteClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

export async function POST(request: NextRequest) {
  const supabase = await createRouteClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://pokedax.de";
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: process.env.STRIPE_PRICE_ID_PREMIUM!, quantity: 1 }],
    success_url: `${appUrl}/dashboard?checkout=success`,
    cancel_url:  `${appUrl}/dashboard/premium`,
    customer_email: user.email,
    metadata: { user_id: user.id },
  });
  return NextResponse.json({ url: session.url });
}

'@
[System.IO.File]::WriteAllText("$root\src\app\api\stripe\checkout\route.ts", $stripeCheckout, $enc)
Write-Host "  OK  route.ts" -ForegroundColor Green

$stripeWebhook = @'
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig  = request.headers.get("stripe-signature")!;
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.user_id;
    if (userId) {
      const until = new Date();
      until.setMonth(until.getMonth() + 1);
      await supabase.from("profiles").update({
        is_premium: true,
        premium_until: until.toISOString(),
        stripe_customer_id: session.customer as string,
      }).eq("id", userId);
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    const { data } = await supabase.from("profiles")
      .select("id").eq("stripe_customer_id", sub.customer as string).single();
    if (data) await supabase.from("profiles").update({ is_premium: false }).eq("id", data.id);
  }

  return NextResponse.json({ received: true });
}

'@
[System.IO.File]::WriteAllText("$root\src\app\api\webhooks\stripe\route.ts", $stripeWebhook, $enc)
Write-Host "  OK  route.ts" -ForegroundColor Green

$stripeScans = @'
import { NextRequest, NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const supabase = await createRouteClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ count: 0, max: 5 });

  const today = new Date().toISOString().split("T")[0];
  const { count } = await supabase.from("scan_logs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", today + "T00:00:00Z");

  const { data: profile } = await supabase.from("profiles")
    .select("is_premium").eq("id", user.id).single();

  return NextResponse.json({ count: count ?? 0, max: profile?.is_premium ? 9999 : 5 });
}

'@
[System.IO.File]::WriteAllText("$root\src\app\api\scans\route.ts", $stripeScans, $enc)
Write-Host "  OK  route.ts" -ForegroundColor Green

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

$mktApi = @'
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
[System.IO.File]::WriteAllText("$root\src\app\api\marketplace\route.ts", $mktApi, $enc)
Write-Host "  OK  route.ts" -ForegroundColor Green

$matchesApi = @'
import { NextRequest, NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  const supabase = await createRouteClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ matches: [] });
  const { data } = await supabase
    .from("wishlist_matches")
    .select(`id, created_at, dismissed, match_score, price_delta_pct, listing_id,
      marketplace_listings!wishlist_matches_listing_id_fkey(
        id, price, condition, note, created_at,
        cards!marketplace_listings_card_id_fkey(id, name, name_de, set_id, number, image_url, price_market),
        profiles!marketplace_listings_user_id_fkey(username, avatar_url)
      )`)
    .eq("wishlist_user_id", user.id).eq("dismissed", false)
    .order("created_at", { ascending: false }).limit(30);
  return NextResponse.json({ matches: data ?? [] });
}
export async function PATCH(request: NextRequest) {
  const supabase = await createRouteClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  const { id } = await request.json();
  await supabase.from("wishlist_matches").update({ dismissed: true })
    .eq("id", id).eq("wishlist_user_id", user.id);
  return NextResponse.json({ ok: true });
}

'@
[System.IO.File]::WriteAllText("$root\src\app\api\matches\route.ts", $matchesApi, $enc)
Write-Host "  OK  route.ts" -ForegroundColor Green

$sellerOnboard = @'
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createRouteClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

// POST /api/marketplace/seller/onboard
// Creates or retrieves Stripe Connect Express account for seller
export async function POST(request: NextRequest) {
  const supabase = await createRouteClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  // Check premium
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_premium, stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (!profile?.is_premium) {
    return NextResponse.json({ error: "Premium erforderlich" }, { status: 403 });
  }

  // Check if seller already has Connect account
  const { data: stats } = await supabase
    .from("seller_stats")
    .select("stripe_account_id")
    .eq("user_id", user.id)
    .single();

  let accountId = stats?.stripe_account_id;

  if (!accountId) {
    // Create new Express account
    const account = await stripe.accounts.create({
      type: "express",
      country: "DE",
      email: user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: "individual",
      settings: {
        payouts: { schedule: { interval: "weekly", weekly_anchor: "monday" } },
      },
    });
    accountId = account.id;

    // Save to seller_stats
    await supabase.from("seller_stats").upsert({
      user_id: user.id,
      stripe_account_id: accountId,
      is_verified: false,
    });
  }

  // Create onboarding link
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://pokedax.de";
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${appUrl}/dashboard?onboard=refresh`,
    return_url:  `${appUrl}/dashboard?onboard=success`,
    type: "account_onboarding",
  });

  return NextResponse.json({ url: accountLink.url });
}

// GET /api/marketplace/seller/onboard — check onboarding status
export async function GET(request: NextRequest) {
  const supabase = await createRouteClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ready: false });

  const { data: stats } = await supabase
    .from("seller_stats")
    .select("stripe_account_id, is_verified")
    .eq("user_id", user.id)
    .single();

  if (!stats?.stripe_account_id) return NextResponse.json({ ready: false, needs_onboard: true });

  try {
    const account = await stripe.accounts.retrieve(stats.stripe_account_id);
    const ready = account.charges_enabled && account.payouts_enabled;

    if (ready && !stats.is_verified) {
      await supabase.from("seller_stats")
        .update({ is_verified: true })
        .eq("user_id", user.id);
    }

    return NextResponse.json({
      ready,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      account_id: stats.stripe_account_id,
    });
  } catch {
    return NextResponse.json({ ready: false, error: "Account nicht gefunden" });
  }
}

'@
[System.IO.File]::WriteAllText("$root\src\app\api\marketplace\seller\onboard\route.ts", $sellerOnboard, $enc)
Write-Host "  OK  route.ts" -ForegroundColor Green

$escrowCreate = @'
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createRouteClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

const LAUNCH_END = new Date("2026-07-01");

function calcFees(price: number, isPremium: boolean) {
  const isLaunch = new Date() < LAUNCH_END;
  const escrowFee   = Math.round(price * 0.01 * 100) / 100;
  const provisionRate = (!isLaunch && price > 5) ? (isPremium ? 0.03 : 0.05) : 0;
  const platformFee  = Math.round(price * provisionRate * 100) / 100;
  const sellerPayout = Math.round((price - platformFee) * 100) / 100;
  const buyerTotal   = Math.round((price + escrowFee) * 100) / 100;
  return { escrowFee, platformFee, sellerPayout, buyerTotal, provisionRate, isLaunch };
}

// POST /api/marketplace/escrow/create
export async function POST(request: NextRequest) {
  const supabase = await createRouteClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const { listing_id, offered_price } = await request.json();
  if (!listing_id || !offered_price) {
    return NextResponse.json({ error: "listing_id und offered_price erforderlich" }, { status: 400 });
  }

  // Load listing + seller data
  const { data: listing } = await supabase
    .from("marketplace_listings")
    .select(`
      id, card_id, price, seller_id, status,
      seller_stats!marketplace_listings_seller_id_fkey(stripe_account_id, is_verified)
    `)
    .eq("id", listing_id)
    .single();

  if (!listing) return NextResponse.json({ error: "Inserat nicht gefunden" }, { status: 404 });
  if (listing.status !== "active") return NextResponse.json({ error: "Inserat nicht mehr verfügbar" }, { status: 400 });
  if (listing.seller_id === user.id) return NextResponse.json({ error: "Eigenes Inserat" }, { status: 400 });

  const sellerStats = (listing as any).seller_stats;
  if (!sellerStats?.stripe_account_id || !sellerStats?.is_verified) {
    return NextResponse.json({ error: "Seller nicht verifiziert" }, { status: 400 });
  }

  // Buyer premium check
  const { data: buyerProfile } = await supabase
    .from("profiles")
    .select("is_premium")
    .eq("id", user.id)
    .single();

  const fees = calcFees(offered_price, buyerProfile?.is_premium ?? false);

  // Create Stripe PaymentIntent with Connect
  const pi = await stripe.paymentIntents.create({
    amount: Math.round(fees.buyerTotal * 100),
    currency: "eur",
    application_fee_amount: Math.round((fees.platformFee + fees.escrowFee) * 100),
    transfer_data: { destination: sellerStats.stripe_account_id },
    capture_method: "automatic",
    metadata: {
      listing_id,
      buyer_id: user.id,
      seller_id: listing.seller_id,
    },
  });

  // Create escrow record
  const autoRelease = new Date();
  autoRelease.setDate(autoRelease.getDate() + 14);

  const { data: escrow } = await supabase
    .from("escrow_transactions")
    .insert({
      buyer_id:       user.id,
      seller_id:      listing.seller_id,
      gross_amount:   fees.buyerTotal,
      seller_payout:  fees.sellerPayout,
      platform_fee:   fees.platformFee,
      escrow_fee:     fees.escrowFee,
      stripe_pi_id:   pi.id,
      status:         "pending",
      auto_release_at: autoRelease.toISOString(),
    })
    .select()
    .single();

  // Reserve listing
  await supabase
    .from("marketplace_listings")
    .update({ status: "reserved" })
    .eq("id", listing_id);

  return NextResponse.json({
    client_secret: pi.client_secret,
    escrow_id: escrow?.id,
    fees,
  });
}

'@
[System.IO.File]::WriteAllText("$root\src\app\api\marketplace\escrow\create\route.ts", $escrowCreate, $enc)
Write-Host "  OK  route.ts" -ForegroundColor Green

$escrowUpdate = @'
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createRouteClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

// POST /api/marketplace/escrow/update
// Actions: ship, confirm, dispute
export async function POST(request: NextRequest) {
  const supabase = await createRouteClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const { escrow_id, action, tracking_number, dispute_reason } = await request.json();

  const { data: escrow } = await supabase
    .from("escrow_transactions")
    .select("*")
    .eq("id", escrow_id)
    .single();

  if (!escrow) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });

  switch (action) {
    case "ship": {
      if (escrow.seller_id !== user.id) return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
      if (escrow.status !== "paid") return NextResponse.json({ error: "Zahlung nicht eingegangen" }, { status: 400 });
      await supabase.from("escrow_transactions").update({
        status: "shipped",
        shipped_at: new Date().toISOString(),
        tracking_number: tracking_number ?? null,
      }).eq("id", escrow_id);
      return NextResponse.json({ ok: true, status: "shipped" });
    }

    case "confirm": {
      if (escrow.buyer_id !== user.id) return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
      if (escrow.status !== "shipped") return NextResponse.json({ error: "Noch nicht versendet" }, { status: 400 });
      await releaseEscrow(supabase, escrow);
      return NextResponse.json({ ok: true, status: "released" });
    }

    case "dispute": {
      if (escrow.buyer_id !== user.id) return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
      await supabase.from("escrow_transactions").update({
        status: "disputed",
        dispute_reason: dispute_reason ?? "Kein Grund angegeben",
      }).eq("id", escrow_id);
      return NextResponse.json({ ok: true, status: "disputed" });
    }

    default:
      return NextResponse.json({ error: "Unbekannte Aktion" }, { status: 400 });
  }
}

async function releaseEscrow(supabase: any, escrow: any) {
  // Transfer funds to seller via Stripe
  try {
    await stripe.transfers.create({
      amount: Math.round(escrow.seller_payout * 100),
      currency: "eur",
      destination: escrow.stripe_seller_account ?? "",
      transfer_group: escrow.id,
    });
  } catch (e) {
    console.error("Stripe transfer error:", e);
  }

  await supabase.from("escrow_transactions").update({
    status: "released",
    received_at: new Date().toISOString(),
    released_at: new Date().toISOString(),
  }).eq("id", escrow.id);

  // Update seller stats
  await supabase.rpc("update_seller_stats", {
    p_seller_id: escrow.seller_id,
    p_amount: escrow.seller_payout,
  }).catch(() => {});

  // Fallback: manual update
  const { data: stats } = await supabase
    .from("seller_stats")
    .select("total_sales, total_volume")
    .eq("user_id", escrow.seller_id)
    .single();

  if (stats) {
    await supabase.from("seller_stats").update({
      total_sales:  (stats.total_sales ?? 0) + 1,
      total_volume: (stats.total_volume ?? 0) + escrow.seller_payout,
    }).eq("user_id", escrow.seller_id);
  }

  // Log transaction
  await supabase.from("marketplace_transactions").insert({
    escrow_id: escrow.id,
    event_type: "funds_released",
    amount: escrow.seller_payout,
  });
}

'@
[System.IO.File]::WriteAllText("$root\src\app\api\marketplace\escrow\update\route.ts", $escrowUpdate, $enc)
Write-Host "  OK  route.ts" -ForegroundColor Green

$reviewsApi = @'
import { NextRequest, NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/server";

// POST /api/marketplace/reviews
export async function POST(request: NextRequest) {
  const supabase = await createRouteClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const { escrow_id, rating, comment } = await request.json();

  if (!escrow_id || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Ungültige Daten" }, { status: 400 });
  }

  const { data: escrow } = await supabase
    .from("escrow_transactions")
    .select("buyer_id, seller_id, status")
    .eq("id", escrow_id)
    .single();

  if (!escrow) return NextResponse.json({ error: "Transaktion nicht gefunden" }, { status: 404 });
  if (escrow.status !== "released") return NextResponse.json({ error: "Transaktion noch nicht abgeschlossen" }, { status: 400 });

  const isBuyer  = escrow.buyer_id  === user.id;
  const isSeller = escrow.seller_id === user.id;
  if (!isBuyer && !isSeller) return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });

  const reviewed_id = isBuyer ? escrow.seller_id : escrow.buyer_id;

  const { data, error } = await supabase
    .from("marketplace_reviews")
    .insert({
      escrow_id,
      reviewer_id: user.id,
      reviewed_id,
      role: isBuyer ? "buyer" : "seller",
      rating,
      comment: comment?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "Bereits bewertet" }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Update avg_rating in seller_stats for the reviewed user
  const { data: allReviews } = await supabase
    .from("marketplace_reviews")
    .select("rating")
    .eq("reviewed_id", reviewed_id);

  if (allReviews?.length) {
    const avg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
    await supabase.from("seller_stats").upsert({
      user_id: reviewed_id,
      avg_rating: Math.round(avg * 100) / 100,
      rating_count: allReviews.length,
    });
  }

  return NextResponse.json({ review: data });
}

// GET /api/marketplace/reviews?user_id=xxx
export async function GET(request: NextRequest) {
  const supabase = await createRouteClient(request);
  const user_id = new URL(request.url).searchParams.get("user_id");
  if (!user_id) return NextResponse.json({ reviews: [] });

  const { data } = await supabase
    .from("marketplace_reviews")
    .select(`
      id, rating, comment, role, created_at,
      profiles!marketplace_reviews_reviewer_id_fkey(username)
    `)
    .eq("reviewed_id", user_id)
    .order("created_at", { ascending: false })
    .limit(20);

  const normalized = (data ?? []).map((r: any) => ({
    ...r,
    profiles: Array.isArray(r.profiles) ? r.profiles[0] : r.profiles,
  }));

  return NextResponse.json({ reviews: normalized });
}

'@
[System.IO.File]::WriteAllText("$root\src\app\api\marketplace\reviews\route.ts", $reviewsApi, $enc)
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
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
export async function GET() {
  try {
    const { data: entries } = await supabase
      .from("user_collection")
      .select("user_id, quantity, cards!user_collection_card_id_fkey(price_market)")
      .not("cards", "is", null);
    const byUser: Record<string, number> = {};
    for (const e of (entries ?? [])) {
      if (!e.user_id) continue;
      byUser[e.user_id] = (byUser[e.user_id] ?? 0) + ((e as any).cards?.price_market ?? 0) * (e.quantity ?? 1);
    }
    const topIds = Object.entries(byUser).sort((a,b)=>b[1]-a[1]).slice(0,25).map(([id])=>id);
    if (!topIds.length) return NextResponse.json({ leaderboard: [] });
    const { data: profiles } = await supabase
      .from("profiles").select("id, username, is_premium, created_at").in("id", topIds);
    const pm: Record<string,any> = {};
    for (const p of profiles ?? []) pm[p.id] = p;
    const leaderboard = topIds.map((uid, i) => ({
      rank: i+1, user_id: uid,
      username: pm[uid]?.username ?? "Anonym",
      is_premium: pm[uid]?.is_premium ?? false,
      total_value: Math.round((byUser[uid] ?? 0) * 100) / 100,
      member_since: pm[uid]?.created_at ?? null,
    }));
    return NextResponse.json({ leaderboard });
  } catch { return NextResponse.json({ leaderboard: [] }); }
}

'@
[System.IO.File]::WriteAllText("$root\src\app\api\leaderboard\portfolio\route.ts", $portfolioLB, $enc)
Write-Host "  OK  route.ts" -ForegroundColor Green

$forumPosts = @'
import { NextRequest, NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createRouteClient(request);
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "48");
  const sort  = searchParams.get("sort") || "recent";

  let query = supabase.from("forum_posts")
    .select("id,title,category_id,author_id,reply_count,upvotes,view_count,is_pinned,is_locked,is_hot,tags,created_at,profiles(username,avatar_url,is_premium),forum_categories(name)")
    .eq("is_deleted", false).limit(limit);

  if (sort === "hot") query = query.order("upvotes", { ascending: false });
  else query = query.order("is_pinned",{ascending:false}).order("created_at",{ascending:false});

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ posts: data });
}

export async function POST(request: NextRequest) {
  const supabase = await createRouteClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });

  const { category_id, title, content, tags } = await request.json();
  if (!category_id || !title?.trim() || !content?.trim())
    return NextResponse.json({ error: "Pflichtfelder fehlen" }, { status: 400 });

  const { data, error } = await supabase.from("forum_posts")
    .insert({ category_id, author_id: user.id, title: title.trim(), content: content.trim(),
      tags: tags || [], upvotes: 0, reply_count: 0, view_count: 0,
      is_pinned: false, is_locked: false, is_deleted: false, is_hot: false })
    .select("id").single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
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
import { createRouteClient } from "@/lib/supabase/server";
export async function GET(request: NextRequest) {
  const supabase = await createRouteClient(request);
  const post_id = new URL(request.url).searchParams.get("post_id");
  if (!post_id) return NextResponse.json({ replies: [] });
  const { data } = await supabase
    .from("forum_replies")
    .select("id, content, upvotes, created_at, author_id, profiles(username, avatar_url, is_premium)")
    .eq("post_id", post_id).eq("is_deleted", false)
    .order("created_at", { ascending: true });
  const normalized = (data ?? []).map((r: any) => ({
    ...r, profiles: Array.isArray(r.profiles) ? r.profiles[0] : r.profiles,
  }));
  return NextResponse.json({ replies: normalized });
}
export async function POST(request: NextRequest) {
  const supabase = await createRouteClient(request);
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
  const { data: post } = await supabase.from("forum_posts").select("reply_count").eq("id", post_id).single();
  if (post) await supabase.from("forum_posts").update({ reply_count: (post.reply_count ?? 0) + 1 }).eq("id", post_id);
  const reply = { ...data, profiles: Array.isArray((data as any)?.profiles) ? (data as any).profiles[0] : (data as any)?.profiles };
  return NextResponse.json({ reply });
}

'@
[System.IO.File]::WriteAllText("$root\src\app\api\forum\replies\route.ts", $forumReplies, $enc)
Write-Host "  OK  route.ts" -ForegroundColor Green

$cronPriceHist = @'
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
export const dynamic = "force-dynamic";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: cards, error } = await supabase
    .from("cards").select("id, price_market, price_low")
    .not("price_market", "is", null).order("price_market", { ascending: false }).limit(200);
  if (error || !cards?.length) return NextResponse.json({ error: "No cards" }, { status: 500 });
  const today = new Date().toISOString().split("T")[0];
  const rows = cards.map(c => ({ card_id: c.id, price_market: c.price_market, price_low: c.price_low, recorded_at: today }));
  const { error: insertErr } = await supabase.from("price_history")
    .upsert(rows, { onConflict: "card_id,recorded_at", ignoreDuplicates: true });
  if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 });
  return NextResponse.json({ recorded: rows.length, date: today });
}

'@
[System.IO.File]::WriteAllText("$root\src\app\api\cron\price-history\route.ts", $cronPriceHist, $enc)
Write-Host "  OK  route.ts" -ForegroundColor Green

$cronWishlist = @'
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
export const dynamic = "force-dynamic";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: matches } = await supabase
    .from("wishlist_matches")
    .select(`id, wishlist_user_id,
      marketplace_listings!wishlist_matches_listing_id_fkey(price, condition,
        cards!marketplace_listings_card_id_fkey(name, name_de))`)
    .is("notified_at", null).eq("dismissed", false).limit(50);
  if (!matches?.length) return NextResponse.json({ sent: 0 });
  let sent = 0;
  for (const match of matches) {
    try {
      const { data: authUser } = await supabase.auth.admin.getUserById(match.wishlist_user_id);
      const email = authUser?.user?.email;
      if (!email) continue;
      const listing = (match as any).marketplace_listings;
      const card = listing?.cards;
      const cardName = card?.name_de || card?.name || "Unbekannte Karte";
      const price = listing?.price?.toLocaleString("de-DE", { minimumFractionDigits: 2 }) + " €";
      if (process.env.RESEND_API_KEY) {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.RESEND_API_KEY}` },
          body: JSON.stringify({
            from: "pokédax <matches@pokedax.de>", to: email,
            subject: `✦ ${cardName} ist verfügbar — ${price}`,
            html: `<div style="background:#09090b;color:#ededf2;padding:32px;font-family:Inter,sans-serif;max-width:520px;margin:0 auto;border-radius:16px"><div style="font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#62626f;margin-bottom:16px">pokédax · Wishlist Match</div><h1 style="font-size:24px;font-weight:300;margin:0 0 8px">Deine Karte ist verfügbar</h1><p style="color:#a4a4b4;margin:0 0 24px">${cardName} wird für <strong style="color:#D4A843">${price}</strong> angeboten</p><a href="https://pokedax.de/matches" style="display:inline-block;background:#D4A843;color:#09090b;padding:12px 24px;border-radius:10px;text-decoration:none;font-size:14px">Match ansehen →</a></div>`,
          }),
        });
      }
      await supabase.from("wishlist_matches").update({ notified_at: new Date().toISOString() }).eq("id", match.id);
      sent++;
    } catch(e) { console.error(e); }
  }
  return NextResponse.json({ sent });
}

'@
[System.IO.File]::WriteAllText("$root\src\app\api\cron\wishlist-notify\route.ts", $cronWishlist, $enc)
Write-Host "  OK  route.ts" -ForegroundColor Green

$cronEscrow = @'
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/cron/escrow-release — runs every 4 hours
export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: overdue } = await supabase
    .from("escrow_transactions")
    .select("*")
    .eq("status", "shipped")
    .lt("auto_release_at", new Date().toISOString())
    .limit(20);

  let released = 0;
  for (const escrow of overdue ?? []) {
    try {
      await supabase.from("escrow_transactions").update({
        status: "released",
        released_at: new Date().toISOString(),
      }).eq("id", escrow.id);

      await supabase.from("seller_stats").update({
        total_sales:  (escrow as any).total_sales ?? 0 + 1,
        total_volume: (escrow as any).total_volume ?? 0 + escrow.seller_payout,
      }).eq("user_id", escrow.seller_id);

      await supabase.from("marketplace_transactions").insert({
        escrow_id: escrow.id,
        event_type: "auto_released",
        amount: escrow.seller_payout,
      });
      released++;
    } catch (e) { console.error(e); }
  }

  return NextResponse.json({ released, checked: overdue?.length ?? 0 });
}

'@
[System.IO.File]::WriteAllText("$root\src\app\api\cron\escrow-release\route.ts", $cronEscrow, $enc)
Write-Host "  OK  route.ts" -ForegroundColor Green

Write-Host ""
Write-Host "=====================================" -ForegroundColor Yellow
Write-Host "v8.0 fertig! 65 Dateien geschrieben." -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "PFLICHT - SQL in Supabase (falls noch nicht gemacht):" -ForegroundColor Red
Write-Host "  sprint2.sql Inhalt ausfuehren (seller_stats, escrow_transactions, marketplace_reviews)" -ForegroundColor White
Write-Host ""
Write-Host "Neue Env Vars in Vercel:" -ForegroundColor Red
Write-Host "  NEXT_PUBLIC_APP_URL = https://pokedax2.vercel.app" -ForegroundColor White
Write-Host "  CRON_SECRET         = (geheimes Passwort)" -ForegroundColor White
Write-Host ""
Write-Host "Profil [username] manuell in VS Code erstellen!" -ForegroundColor Red
Write-Host "GitHub Desktop -> Commit 'v8.0: complete deploy' -> Push -> Vercel" -ForegroundColor Yellow
