# PokeDax v20 – Canvas sichtbar (backgrounds transparent)
$root = "C:\Users\lenovo\pokedax\pokedax\pokedax"
$enc  = New-Object System.Text.UTF8Encoding $true
Write-Host "PokeDax v20 – Canvas fix final..." -ForegroundColor Cyan

$dirs = @(
  "$root\src\components\ui","$root\src\app",
  "$root\src\app\dashboard","$root\src\app\forum",
  "$root\src\app\preischeck"
)
foreach ($d in $dirs) {
  if (-not (Test-Path -LiteralPath $d)) { New-Item -ItemType Directory -Path $d -Force | Out-Null }
}
$pid_ = "$root\src\app\forum\post\[id]"
if (-not (Test-Path -LiteralPath $pid_)) { New-Item -ItemType Directory -LiteralPath $pid_ -Force | Out-Null }


$bgCanvas = @'
"use client";

import { useEffect, useRef } from "react";

interface Props {
  intensity?: "low" | "medium" | "high";
}

const COLORS = ["#EE1515", "#FACC15", "#A855F7", "#22D3EE"];

export default function BackgroundCanvas({ intensity = "medium" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef  = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    if (!ctx) return;

    const COUNT = intensity === "low" ? 60 : intensity === "high" ? 140 : 100;
    const BOLT_MIN = 8000;
    const BOLT_MAX = 15000;

    let W = 0, H = 0, animId = 0;

    interface P {
      x:number;y:number;vx:number;vy:number;
      r:number;color:string;op:number;baseOp:number;
      phase:number;glow:number;
    }
    interface Bolt {
      pts:{x:number;y:number}[];
      life:number;max:number;
    }

    let particles: P[] = [];
    let bolts: Bolt[] = [];
    let lastBolt = Date.now();
    let nextBolt = BOLT_MIN + Math.random() * (BOLT_MAX - BOLT_MIN);

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    function lightning(x1:number,y1:number,x2:number,y2:number,d=0):{x:number;y:number}[] {
      if (d > 4) return [{x:x1,y:y1},{x:x2,y:y2}];
      const mx = (x1+x2)/2 + (Math.random()-0.5)*80;
      const my = (y1+y2)/2 + (Math.random()-0.5)*80;
      return [...lightning(x1,y1,mx,my,d+1), ...lightning(mx,my,x2,y2,d+1)];
    }

    function spawnBolt() {
      const x1 = 50 + Math.random() * (W - 100);
      const pts = lightning(x1, 0, x1 + (Math.random()-0.5)*300, 150 + Math.random() * (H*0.5));
      bolts.push({ pts, life: 0, max: 50 });
      particles.forEach(p => {
        if (Math.hypot(p.x - x1, p.y - 20) < 200) p.glow = 1;
      });
    }

    function init() {
      particles = Array.from({ length: COUNT }, () => {
        const op = 0.07 + Math.random() * 0.18;
        return {
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random()-0.5)*0.35, vy: (Math.random()-0.5)*0.35,
          r: 0.8 + Math.random()*2,
          color: COLORS[Math.floor(Math.random()*COLORS.length)],
          op, baseOp: op, phase: Math.random()*Math.PI*2, glow: 0,
        };
      });
    }

    function frame() {
      ctx.clearRect(0, 0, W, H);

      const now = Date.now();
      if (now - lastBolt > nextBolt) {
        spawnBolt();
        lastBolt = now;
        nextBolt = BOLT_MIN + Math.random() * (BOLT_MAX - BOLT_MIN);
      }

      // Particles
      particles.forEach(p => {
        p.phase += 0.01;
        const pulse = Math.sin(p.phase) * 0.4 + 0.6;
        let op = p.baseOp * pulse;

        // Mouse
        const mdx = mouseRef.current.x - p.x;
        const mdy = mouseRef.current.y - p.y;
        const md  = Math.hypot(mdx, mdy);
        if (md < 120 && md > 0) {
          op = Math.min(0.55, op * 1.8);
          p.vx += (mdx/md) * 0.012;
          p.vy += (mdy/md) * 0.012;
        }

        if (p.glow > 0) { op = Math.min(0.65, op + p.glow * 0.45); p.glow *= 0.93; }

        const spd = Math.hypot(p.vx, p.vy);
        if (spd > 0.9) { p.vx *= 0.9/spd; p.vy *= 0.9/spd; }
        p.vx *= 0.999; p.vy *= 0.999;
        p.x += p.vx; p.y += p.vy;
        if (p.x < -5)   p.x = W + 5;
        if (p.x > W + 5) p.x = -5;
        if (p.y < -5)   p.y = H + 5;
        if (p.y > H + 5) p.y = -5;

        ctx.save();
        ctx.globalAlpha = op;
        if (p.glow > 0.05) {
          const g = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*5);
          g.addColorStop(0, p.color);
          g.addColorStop(1, "transparent");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r*5, 0, Math.PI*2);
          ctx.fill();
        }
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
      });

      // Bolts
      bolts = bolts.filter(b => b.life < b.max);
      bolts.forEach(b => {
        b.life++;
        const t  = b.life / b.max;
        const op = t < 0.2 ? t / 0.2 : 1 - (t - 0.2) / 0.8;
        if (b.pts.length < 2) return;
        [
          { c: "rgba(255,255,255,0.9)", w: 0.8 },
          { c: "rgba(238,21,21,0.55)",  w: 2.5 },
          { c: "rgba(238,21,21,0.18)",  w: 6   },
        ].forEach(layer => {
          ctx.save();
          ctx.globalAlpha = op;
          ctx.beginPath();
          ctx.moveTo(b.pts[0].x, b.pts[0].y);
          b.pts.forEach(pt => ctx.lineTo(pt.x, pt.y));
          ctx.strokeStyle = layer.c;
          ctx.lineWidth   = layer.w;
          ctx.shadowBlur  = 10;
          ctx.shadowColor = "#EE1515";
          ctx.stroke();
          ctx.restore();
        });
      });

      animId = requestAnimationFrame(frame);
    }

    resize();
    init();
    frame();

    const onResize = () => { resize(); };
    const onMouse  = (e: MouseEvent) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    const onLeave  = () => { mouseRef.current = { x: -9999, y: -9999 }; };

    window.addEventListener("resize",    onResize);
    window.addEventListener("mousemove", onMouse);
    window.addEventListener("mouseleave",onLeave);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize",    onResize);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("mouseleave",onLeave);
    };
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0, left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        pointerEvents: "none",
        display: "block",
      }}
      aria-hidden="true"
    />
  );
}

'@
[System.IO.File]::WriteAllText("$root\src\components\ui\BackgroundCanvas.tsx", $bgCanvas, $enc)
Write-Host "  OK: BackgroundCanvas.tsx" -ForegroundColor Green

$globalsCSS = @'
@tailwind base;
@tailwind components;
@tailwind utilities;



:root {
  /* Core Brand */
  --red: #EE1515;
  --red-glow: rgba(238, 21, 21, 0.15);
  --red-border: rgba(238, 21, 21, 0.3);
  --gold: #FACC15;
  --gold2: #f59e0b;

  /* Backgrounds */
  --bg: #0A0A0A;
  --bg2: #111111;
  --bg3: #181818;
  --bg4: #1f1f1f;

  /* Text */
  --text: #F8FAFC;
  --text2: #94A3B8;
  --text3: #475569;

  /* Borders */
  --border: rgba(255,255,255,0.07);
  --border2: rgba(255,255,255,0.12);
  --border3: rgba(255,255,255,0.2);

  /* Accents */
  --cyan: #00E5FF;
  --green: #22C55E;
  --purple: #A855F7;

  /* TCG Type Colors */
  --type-fire: #F97316;
  --type-water: #3B82F6;
  --type-grass: #22C55E;
  --type-lightning: #FACC15;
  --type-psychic: #A855F7;
  --type-fighting: #EF4444;
  --type-darkness: #6B7280;
  --type-metal: #9CA3AF;
  --type-dragon: #7C3AED;
  --type-fairy: #EC4899;

  /* Spacing (8px grid) */
  --sp1: 8px;
  --sp2: 16px;
  --sp3: 24px;
  --sp4: 32px;
  --sp5: 40px;
  --sp6: 48px;

  /* Radius */
  --r: 8px;
  --r2: 12px;
  --r3: 16px;
  --r4: 20px;
  --r5: 24px;
}

* {
  box-sizing: border-box;
}



body {
  background: transparent;
  color: var(--text);
  font-family: var(--font-inter), 'Inter', -apple-system, sans-serif;
  font-size: 15px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, h4, h5 {
  font-family: var(--font-poppins), 'Poppins', sans-serif;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.1;
}

/* ── Scrollbar ── */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: var(--bg2); }
::-webkit-scrollbar-thumb { background: var(--bg4); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--border3); }

/* ── Selection ── */
::selection { background: var(--red-glow); color: var(--text); }

/* ── Focus ── */
:focus-visible { outline: 2px solid var(--red); outline-offset: 2px; }

/* ── Pikachu Floaters ── */
.pikachu-left {
  position: fixed;
  left: 0;
  bottom: 80px;
  z-index: 10;
  width: 80px;
  opacity: 0.7;
  pointer-events: none;
  animation: pikachu-float 4s ease-in-out infinite;
}
.pikachu-right {
  position: fixed;
  right: 0;
  bottom: 80px;
  z-index: 10;
  width: 80px;
  opacity: 0.7;
  pointer-events: none;
  animation: pikachu-float 4s ease-in-out infinite 2s;
  transform: scaleX(-1);
}
@keyframes pikachu-float {
  0%, 100% { transform: translateY(0) scaleX(var(--flip, 1)); }
  50% { transform: translateY(-12px) scaleX(var(--flip, 1)); }
}
.pikachu-right { --flip: -1; }

/* ── Bottom Nav Mobile ── */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 50;
  background: rgba(10,10,10,0.97);
  border-top: 1px solid var(--border2);
  backdrop-filter: blur(20px);
  display: none;
  padding-bottom: env(safe-area-inset-bottom);
}
@media (max-width: 768px) {
  .bottom-nav { display: flex; }
  body { padding-bottom: 64px; }
  .pikachu-left, .pikachu-right { bottom: 72px; width: 60px; }
}
.bottom-nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 4px;
  cursor: pointer;
  text-decoration: none;
  color: var(--text3);
  transition: color 0.15s;
  gap: 3px;
}
.bottom-nav-item.active { color: var(--red); }
.bottom-nav-item svg { width: 20px; height: 20px; }
.bottom-nav-label { font-size: 10px; font-weight: 500; }

/* ── TCG Card Holo ── */
.holo-card {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1);
  cursor: pointer;
}
.holo-card:hover { transform: translateY(-6px) scale(1.02); }
.holo-shimmer {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.3s;
  background: linear-gradient(
    125deg,
    transparent 20%,
    rgba(255,255,255,0.06) 40%,
    rgba(255,255,255,0.12) 50%,
    rgba(255,255,255,0.06) 60%,
    transparent 80%
  );
  pointer-events: none;
  z-index: 2;
}
.holo-card:hover .holo-shimmer { opacity: 1; }

/* ── Section Labels ── */
.section-eyebrow {
  font-size: 10px;
  font-weight: 700;
  color: var(--red);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  margin-bottom: 6px;
}

/* ── Buttons ── */
.btn-primary {
  background: var(--red);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-family: var(--font-poppins), 'Poppins', sans-serif;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
}
.btn-primary:hover {
  transform: scale(1.03);
  box-shadow: 0 0 24px rgba(238,21,21,0.4);
}

.btn-outline {
  background: transparent;
  color: var(--text);
  border: 1px solid var(--border3);
  border-radius: 12px;
  padding: 12px 24px;
  font-family: var(--font-poppins), 'Poppins', sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}
.btn-outline:hover {
  border-color: var(--border3);
  background: var(--bg2);
}

/* ── Inputs ── */
input, textarea, select {
  background: var(--bg2);
  color: var(--text);
  border: 1px solid var(--border2);
  border-radius: 12px;
  font-family: var(--font-inter), 'Inter', sans-serif;
  transition: border-color 0.15s;
}
input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: var(--red);
}

/* ── Animations ── */
@keyframes fade-up {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: none; }
}
.animate-fade-up { animation: fade-up 0.4s ease forwards; }

@keyframes pulse-dot {
  0%,100% { opacity: 1; }
  50%      { opacity: 0.3; }
}
.live-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--red);
  animation: pulse-dot 2s infinite;
  display: inline-block;
}

/* ── Glassmorphism cards ── */
.glass-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--border2);
  border-radius: 16px;
  backdrop-filter: blur(12px);
}
.glass-card:hover {
  border-color: var(--border3);
}

/* ── Price highlight ── */
.price-up   { color: #22C55E; }
.price-down { color: #EF4444; }
.price-nav, main, footer {
  position: relative;
  z-index: 1;
}

main { font-family: var(--font-poppins), 'Poppins', sans-serif; font-weight: 800; color: var(--cyan); }

/* ── Forum post row ── */
.forum-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 10px;
  background: rgba(255,255,255,0.02);
  border: 1px solid var(--border);
  margin-bottom: 6px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  text-decoration: none;
  color: inherit;
}
.forum-row:hover {
  border-color: var(--border2);
  background: rgba(255,255,255,0.04);
}

/* ── Utility ── */
.text-gradient-red {
  background: linear-gradient(135deg, var(--red), #ff6b6b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.text-gradient-gold {
  background: linear-gradient(135deg, var(--gold), var(--gold2));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.text-gradient-hero {
  background: linear-gradient(135deg, #ffffff 0%, #F8FAFC 60%, #CBD5E1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* ── Hero radial bg ── */
.hero-bg {
  background:
    radial-gradient(ellipse 80% 50% at 50% -10%, rgba(238,21,21,0.08), transparent),
    radial-gradient(ellipse 40% 30% at 80% 80%, rgba(250,204,21,0.04), transparent),
    var(--bg);
}

/* ── Sticky header blur ── */
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 40;
  background: rgba(10,10,10,0.94);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
}

/* hide pikachu on very small screens */
@media (max-width: 400px) {
  .pikachu-left, .pikachu-right { display: none; }
}

/* ── Canvas visibility fix ── */
html {
  background: #0A0A0A;
}
body {
  background: transparent !important;
}
/* All direct page wrappers must not create opaque background */
main > div[style] {
  background: transparent !important;
}
nav {
  position: relative;
  z-index: 50;
}
main {
  position: relative;
  z-index: 1;
}
footer {
  position: relative;
  z-index: 1;
}

'@
[System.IO.File]::WriteAllText("$root\src\app\globals.css", $globalsCSS, $enc)
Write-Host "  OK: globals.css" -ForegroundColor Green

$rootLayout = @'
import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FloatingPikachu from "@/components/ui/FloatingPikachu";
import BackgroundCanvas from "@/components/ui/BackgroundCanvas";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PokéDax – Deutschlands #1 Pokémon TCG Plattform",
  description: "Live Cardmarket EUR Preise, KI-Scanner, Portfolio und Community. Deutschlands größte Pokémon TCG Plattform.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${poppins.variable} ${inter.variable}`}>
      <body>
        <Navbar />
        <BackgroundCanvas intensity="medium" />
        <FloatingPikachu />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}

'@
[System.IO.File]::WriteAllText("$root\src\app\layout.tsx", $rootLayout, $enc)
Write-Host "  OK: layout.tsx" -ForegroundColor Green

$dashboardPage = @'
import { createClient } from '@/lib/supabase/server'
import { Star, TrendingUp, TrendingDown, ArrowRight, Heart, LayoutDashboard, Folder, List, Bell, Crown } from 'lucide-react'
import Link from 'next/link'
import AvatarUpload from '@/components/ui/AvatarUpload'
import DashboardSparkline from '@/components/ui/DashboardSparkline'

export const dynamic = 'force-dynamic'

const NAV_LINKS = [
  { href: '/dashboard',           label: 'Dashboard', active: true  },
  { href: '/dashboard/portfolio', label: 'Portfolio',  active: false },
  { href: '/dashboard/wishlist',  label: 'Wishlists',  active: false },
  { href: '/dashboard/alerts',    label: 'Alerts',     active: false },
  { href: '/dashboard/premium',   label: 'Premium',    active: false, gold: true },
]

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user!.id).single()

  const { data: collectionWithPrices } = await supabase
    .from('user_collection')
    .select(`
      quantity, is_foil,
      cards (
        id, name, number, set_id, rarity, image_url,
        price_market, price_foil_market,
        price_avg1, price_avg7, price_avg30,
        price_foil_avg1, price_foil_avg7, price_foil_avg30
      )
    `)
    .eq('user_id', user!.id)

  // Wishlist preview
  const { data: wishlists } = await supabase
    .from('wishlists')
    .select('id, name, is_watchlist')
    .eq('user_id', user!.id)
    .limit(3)

  const { data: wishlistItems } = await supabase
    .from('wishlist_items')
    .select('wishlist_id, cards(id, name, image_url, price_market)')
    .in('wishlist_id', (wishlists || []).map(w => w.id))
    .limit(6)

  const portfolioValue = collectionWithPrices?.reduce((sum, item) => {
    const card = item.cards as any
    const price = item.is_foil
      ? (card?.price_foil_market ?? card?.price_market ?? 0)
      : (card?.price_market ?? 0)
    return sum + (price * (item.quantity ?? 1))
  }, 0) ?? 0

  const collectionCards = (collectionWithPrices ?? []).map(item => {
    const card = item.cards as any
    const isFoil = item.is_foil
    return {
      id:          card?.id ?? '',
      name:        card?.name ?? '',
      number:      card?.number ?? '',
      set_id:      card?.set_id ?? '',
      rarity:      card?.rarity ?? null,
      image_url:   card?.image_url ?? null,
      quantity:    item.quantity ?? 1,
      is_foil:     isFoil,
      price_market: isFoil ? (card?.price_foil_market ?? card?.price_market ?? null) : (card?.price_market ?? null),
      price_avg1:  isFoil ? (card?.price_foil_avg1  ?? card?.price_avg1  ?? null) : (card?.price_avg1  ?? null),
      price_avg7:  isFoil ? (card?.price_foil_avg7  ?? card?.price_avg7  ?? null) : (card?.price_avg7  ?? null),
      price_avg30: isFoil ? (card?.price_foil_avg30 ?? card?.price_avg30 ?? null) : (card?.price_avg30 ?? null),
    }
  })

  // Top 5 Karten nach Wert
  const topCards = [...collectionCards]
    .filter(c => c.price_market && c.price_market > 0)
    .sort((a, b) => (b.price_market! * b.quantity) - (a.price_market! * a.quantity))
    .slice(0, 5)

  // Sparkline data from avg30 → avg7 → avg1 trend
  const sparklineData = collectionCards
    .filter(c => c.price_avg30 && c.price_avg7 && c.price_avg1)
    .slice(0, 10)
    .map(c => ({
      avg30: (c.price_avg30! * c.quantity),
      avg7:  (c.price_avg7!  * c.quantity),
      avg1:  (c.price_avg1!  * c.quantity),
    }))
    .reduce(
      (acc, c) => ({
        avg30: acc.avg30 + c.avg30,
        avg7:  acc.avg7  + c.avg7,
        avg1:  acc.avg1  + c.avg1,
      }),
      { avg30: 0, avg7: 0, avg1: 0 }
    )

  const portfolioChange7d = sparklineData.avg7 > 0 && sparklineData.avg30 > 0
    ? ((sparklineData.avg7 - sparklineData.avg30) / sparklineData.avg30) * 100
    : 0

  const totalCards = collectionCards.length
  const isPremium  = profile?.is_premium ?? false
  const username   = profile?.username ?? user!.email?.split('@')[0] ?? 'Trainer'
  const roleColor  = profile?.forum_role === 'admin' ? '#EE1515'
    : profile?.forum_role === 'moderator' ? '#00E5FF'
    : isPremium ? '#FACC15'
    : 'rgba(255,255,255,0.4)'

  return (
    <div style={{ background: 'transparent', minHeight: '100vh', color: 'white' }}>
      {/* Red top accent */}
      <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, #EE1515 30%, #EE1515 70%, transparent)' }} />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px' }}>

        {/* Sub-nav */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 28, flexWrap: 'wrap' }}>
          {NAV_LINKS.map(l => (
            <Link key={l.href} href={l.href} style={{
              padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              textDecoration: 'none',
              background: l.active ? '#EE1515' : l.gold ? 'rgba(250,204,21,0.08)' : 'rgba(255,255,255,0.04)',
              border: l.active ? 'none' : l.gold ? '1px solid rgba(250,204,21,0.25)' : '1px solid rgba(255,255,255,0.1)',
              color: l.active ? 'white' : l.gold ? '#FACC15' : 'rgba(255,255,255,0.5)',
            }}>{l.label}</Link>
          ))}
        </div>

        {/* ── HERO ROW: Avatar + Portfolio Value ── */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20,
        }} className="dashboard-hero-grid">

          {/* User card */}
          <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 20, padding: '24px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <AvatarUpload userId={user!.id} avatarUrl={profile?.avatar_url} username={username} size="lg" />
              <div>
                <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 22, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 2 }}>
                  Hey, <span style={{ color: '#EE1515' }}>{username}</span> 👋
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>{user!.email}</p>
                {isPremium ? (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 8, padding: '3px 10px', borderRadius: 20, background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.3)' }}>
                    <Star size={10} style={{ color: '#FACC15' }} />
                    <span style={{ fontSize: 10, fontWeight: 800, color: '#FACC15', letterSpacing: '0.08em' }}>PREMIUM AKTIV</span>
                  </div>
                ) : (
                  <Link href="/dashboard/premium" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 8, padding: '3px 10px', borderRadius: 20, background: 'rgba(250,204,21,0.06)', border: '1px solid rgba(250,204,21,0.15)', textDecoration: 'none', fontSize: 10, fontWeight: 700, color: '#FACC15' }}>
                    <Crown size={10} /> Premium freischalten
                  </Link>
                )}
              </div>
            </div>

            {/* Quick stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { label: 'Karten', value: totalCards.toString() },
                { label: 'Forum Posts', value: (profile?.post_count ?? 0).toString() },
              ].map(s => (
                <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '10px 14px' }}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>{s.label}</div>
                  <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 22, fontWeight: 900, color: 'white' }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Portfolio value card */}
          <div style={{
            background: portfolioChange7d >= 0
              ? 'linear-gradient(135deg, rgba(34,197,94,0.06), rgba(255,255,255,0.02))'
              : 'linear-gradient(135deg, rgba(238,21,21,0.06), rgba(255,255,255,0.02))',
            border: `1px solid ${portfolioChange7d >= 0 ? 'rgba(34,197,94,0.2)' : 'rgba(238,21,21,0.2)'}`,
            borderRadius: 20, padding: '24px', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 8 }}>
              Portfolio-Wert
            </div>
            <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 40, fontWeight: 900, letterSpacing: '-0.03em', color: 'white', lineHeight: 1, marginBottom: 6 }}>
              {portfolioValue.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€
            </div>

            {/* 7d change */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
              {portfolioChange7d >= 0
                ? <TrendingUp size={14} style={{ color: '#22C55E' }} />
                : <TrendingDown size={14} style={{ color: '#EE1515' }} />
              }
              <span style={{ fontSize: 13, fontWeight: 700, color: portfolioChange7d >= 0 ? '#22C55E' : '#EE1515' }}>
                {portfolioChange7d >= 0 ? '+' : ''}{portfolioChange7d.toFixed(1)}% (7 Tage)
              </span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
                · {totalCards} Karten
              </span>
            </div>

            {/* Sparkline */}
            <DashboardSparkline
              avg30={sparklineData.avg30}
              avg7={sparklineData.avg7}
              avg1={sparklineData.avg1}
              positive={portfolioChange7d >= 0}
            />

            <Link href="/dashboard/portfolio" style={{
              display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 12,
              fontSize: 12, fontWeight: 600, color: portfolioChange7d >= 0 ? '#22C55E' : '#EE1515',
              textDecoration: 'none',
            }}>
              Portfolio öffnen <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        {/* ── TOP KARTEN + WISHLIST ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="dashboard-bottom-grid">

          {/* Top Karten */}
          <div style={{
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 20, overflow: 'hidden',
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <TrendingUp size={14} style={{ color: '#EE1515' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Top Karten</span>
              </div>
              <Link href="/dashboard/portfolio" style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>Alle →</Link>
            </div>

            {topCards.length === 0 ? (
              <div style={{ padding: '32px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 36, marginBottom: 10, opacity: 0.2 }}>🃏</div>
                <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>Noch keine Karten im Portfolio</p>
                <Link href="/dashboard/portfolio" style={{ display: 'inline-block', marginTop: 12, padding: '7px 16px', borderRadius: 8, background: 'rgba(238,21,21,0.1)', border: '1px solid rgba(238,21,21,0.2)', color: '#EE1515', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                  Portfolio aufbauen →
                </Link>
              </div>
            ) : (
              <div>
                {topCards.map((card, i) => {
                  const change = card.price_avg7 && card.price_avg30 && card.price_avg30 > 0
                    ? ((card.price_avg7 - card.price_avg30) / card.price_avg30) * 100
                    : null
                  const totalVal = (card.price_market ?? 0) * card.quantity
                  return (
                    <div key={card.id} style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px',
                      borderBottom: i < topCards.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    }}>
                      {/* Rank */}
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.2)', minWidth: 16, textAlign: 'center' }}>#{i + 1}</span>

                      {/* Image */}
                      <div style={{ width: 32, height: 44, borderRadius: 4, overflow: 'hidden', background: 'rgba(255,255,255,0.05)', flexShrink: 0 }}>
                        {card.image_url && (
                          <img src={card.image_url} alt={card.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        )}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.name}</p>
                        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{card.set_id?.toUpperCase()} · ×{card.quantity}</p>
                      </div>

                      {/* Value + trend */}
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 14, fontWeight: 800, color: '#00E5FF' }}>
                          {totalVal.toFixed(2)}€
                        </p>
                        {change !== null && (
                          <p style={{ fontSize: 10, fontWeight: 700, color: change >= 0 ? '#22C55E' : '#EE1515' }}>
                            {change >= 0 ? '↑' : '↓'}{Math.abs(change).toFixed(1)}%
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Wishlist Preview */}
          <div style={{
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 20, overflow: 'hidden',
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Heart size={14} style={{ color: '#EE1515' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Wishlist</span>
              </div>
              <Link href="/dashboard/wishlist" style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>Alle →</Link>
            </div>

            {!wishlists || wishlists.length === 0 ? (
              <div style={{ padding: '32px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 36, marginBottom: 10, opacity: 0.2 }}>💝</div>
                <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>Noch keine Wishlists erstellt</p>
                <Link href="/dashboard/wishlist" style={{ display: 'inline-block', marginTop: 12, padding: '7px 16px', borderRadius: 8, background: 'rgba(238,21,21,0.1)', border: '1px solid rgba(238,21,21,0.2)', color: '#EE1515', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                  Wishlist erstellen →
                </Link>
              </div>
            ) : (
              <div style={{ padding: '12px 20px' }}>
                {(wishlists || []).map(wl => {
                  const items = (wishlistItems || []).filter(i => i.wishlist_id === wl.id)
                  return (
                    <div key={wl.id} style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>{wl.name}</span>
                          {wl.is_watchlist && (
                            <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.25)', color: '#00E5FF' }}>WATCH</span>
                          )}
                        </div>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>{items.length} Karten</span>
                      </div>

                      {/* Card thumbnails */}
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {items.slice(0, 4).map(item => {
                          const card = item.cards as any
                          return (
                            <div key={card?.id} style={{
                              width: 36, height: 50, borderRadius: 4, overflow: 'hidden',
                              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                              flexShrink: 0,
                            }}>
                              {card?.image_url && (
                                <img src={card.image_url} alt={card.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                              )}
                            </div>
                          )
                        })}
                        {items.length > 4 && (
                          <div style={{
                            width: 36, height: 50, borderRadius: 4,
                            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)',
                          }}>+{items.length - 4}</div>
                        )}
                      </div>
                    </div>
                  )
                })}
                <Link href="/dashboard/wishlist" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                  padding: '8px 0', borderRadius: 8, marginTop: 4,
                  background: 'rgba(238,21,21,0.06)', border: '1px solid rgba(238,21,21,0.15)',
                  color: '#EE1515', fontSize: 12, fontWeight: 600, textDecoration: 'none',
                }}>
                  Alle Wishlists <ArrowRight size={12} />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .dashboard-hero-grid { grid-template-columns: 1fr !important; }
          .dashboard-bottom-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

'@
[System.IO.File]::WriteAllText("$root\src\app\dashboard\page.tsx", $dashboardPage, $enc)
Write-Host "  OK: page.tsx" -ForegroundColor Green

$forumPage = @'
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { MessageSquare, TrendingUp, Pin, Lock, Flame, Eye, Heart } from "lucide-react";
import ForumHeader from "@/components/forum/ForumHeader";

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  post_count: number;
  sort_order: number;
}

interface Post {
  id: string;
  title: string;
  category_id: string;
  author_id: string;
  reply_count: number;
  upvotes: number;
  view_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  is_hot: boolean;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string | null;
    forum_role: string;
    badge_trainer: boolean;
    badge_gym_leader: boolean;
    badge_elite4: boolean;
    badge_champion: boolean;
  };
}

const CATEGORY_STYLES: Record<string, { gradient: string; border: string; glow: string; type: string; rarity: string }> = {
  marktplatz: {
    gradient: "linear-gradient(135deg, #1a0533 0%, #2d0a52 50%, #1a0533 100%)",
    border: "rgba(200, 100, 255, 0.6)",
    glow: "rgba(200, 100, 255, 0.3)",
    type: "Psychic",
    rarity: "Rare Holo",
  },
  preise: {
    gradient: "linear-gradient(135deg, #001a2e 0%, #003366 50%, #001a2e 100%)",
    border: "rgba(0, 200, 255, 0.6)",
    glow: "rgba(0, 200, 255, 0.3)",
    type: "Water",
    rarity: "Uncommon",
  },
  "fake-check": {
    gradient: "linear-gradient(135deg, #1a0a00 0%, #3d1a00 50%, #1a0a00 100%)",
    border: "rgba(255, 150, 0, 0.6)",
    glow: "rgba(255, 150, 0, 0.3)",
    type: "Fire",
    rarity: "Rare",
  },
  news: {
    gradient: "linear-gradient(135deg, #00150a 0%, #003320 50%, #00150a 100%)",
    border: "rgba(0, 255, 150, 0.6)",
    glow: "rgba(0, 255, 150, 0.3)",
    type: "Grass",
    rarity: "Common",
  },
  einsteiger: {
    gradient: "linear-gradient(135deg, #1a1a00 0%, #333300 50%, #1a1a00 100%)",
    border: "rgba(255, 220, 0, 0.6)",
    glow: "rgba(255, 220, 0, 0.3)",
    type: "Lightning",
    rarity: "Common",
  },
  turniere: {
    gradient: "linear-gradient(135deg, #1a0000 0%, #330000 50%, #1a0000 100%)",
    border: "rgba(255, 60, 60, 0.6)",
    glow: "rgba(255, 60, 60, 0.3)",
    type: "Fighting",
    rarity: "Rare Holo EX",
  },
  premium: {
    gradient: "linear-gradient(135deg, #0a0014 0%, #1a003d 50%, #0a0014 100%)",
    border: "rgba(255, 215, 0, 0.8)",
    glow: "rgba(255, 215, 0, 0.4)",
    type: "Dragon",
    rarity: "Ultra Rare",
  },
};

const RARITY_DOTS: Record<string, number> = {
  Common: 1,
  Uncommon: 2,
  Rare: 3,
  "Rare Holo": 4,
  "Rare Holo EX": 5,
  "Ultra Rare": 6,
};

function HoloCard({ category }: { category: Category }) {
  const style = CATEGORY_STYLES[category.id] || CATEGORY_STYLES["news"];
  const dots = RARITY_DOTS[style.rarity] || 1;

  return (
    <Link href={`/forum?category=${category.id}`} className="block group">
      <div
        className="relative overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2"
        style={{
          background: style.gradient,
          border: `1px solid ${style.border}`,
          borderRadius: "12px",
          boxShadow: `0 0 20px ${style.glow}, inset 0 0 40px rgba(0,0,0,0.3)`,
          aspectRatio: "2.5/3.5",
          minHeight: "240px",
        }}
      >
        {/* Holo shimmer overlay */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background:
              "linear-gradient(125deg, transparent 20%, rgba(255,255,255,0.08) 40%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.08) 60%, transparent 80%)",
            backgroundSize: "200% 200%",
          }}
        />

        {/* Card top bar */}
        <div
          className="flex items-center justify-between px-3 pt-3 pb-1"
          style={{ borderBottom: `1px solid ${style.border}40` }}
        >
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: style.border, fontSize: "9px" }}>
            {style.type} Type
          </span>
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)", fontSize: "9px" }}>
            HP {Math.floor(category.post_count / 10) + 60}
          </span>
        </div>

        {/* Icon area */}
        <div className="flex items-center justify-center" style={{ height: "90px", position: "relative" }}>
          <div
            className="flex items-center justify-center text-4xl"
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: `radial-gradient(circle, ${style.glow} 0%, transparent 70%)`,
              border: `1px solid ${style.border}60`,
              filter: "drop-shadow(0 0 12px " + style.glow + ")",
            }}
          >
            {category.icon}
          </div>
        </div>

        {/* Card name */}
        <div className="px-3 pb-1">
          <h3
            className="font-bold text-white text-center"
            style={{
              fontSize: "13px",
              textShadow: `0 0 10px ${style.glow}`,
              letterSpacing: "0.05em",
            }}
          >
            {category.name}
          </h3>
        </div>

        {/* Divider */}
        <div className="mx-3 my-1" style={{ height: "1px", background: `${style.border}40` }} />

        {/* Description */}
        <div className="px-3 pb-2">
          <p
            className="text-center"
            style={{
              color: "rgba(255,255,255,0.55)",
              fontSize: "9px",
              lineHeight: "1.4",
            }}
          >
            {category.description}
          </p>
        </div>

        {/* Stats */}
        <div className="px-3 pb-2">
          <div
            className="flex items-center justify-between px-2 py-1 rounded"
            style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${style.border}30` }}
          >
            <div className="flex items-center gap-1">
              <MessageSquare size={8} style={{ color: style.border }} />
              <span style={{ color: style.border, fontSize: "9px", fontWeight: 600 }}>
                {category.post_count.toLocaleString()}
              </span>
            </div>
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "9px" }}>Beiträge</span>
          </div>
        </div>

        {/* Rarity dots */}
        <div className="flex justify-center gap-1 pb-2">
          {Array.from({ length: dots }).map((_, i) => (
            <div
              key={i}
              style={{
                width: i === dots - 1 ? "6px" : "5px",
                height: i === dots - 1 ? "6px" : "5px",
                borderRadius: "50%",
                background: i === dots - 1 ? style.border : `${style.border}70`,
                boxShadow: i === dots - 1 ? `0 0 4px ${style.glow}` : "none",
              }}
            />
          ))}
        </div>

        {/* Bottom rarity text */}
        <div
          className="absolute bottom-2 left-0 right-0 text-center"
          style={{ color: "rgba(255,255,255,0.3)", fontSize: "8px" }}
        >
          {style.rarity}
        </div>
      </div>
    </Link>
  );
}

function PostRow({ post, categoryId }: { post: Post; categoryId?: string }) {
  const style = categoryId ? CATEGORY_STYLES[categoryId] || CATEGORY_STYLES["news"] : CATEGORY_STYLES["news"];
  const role = post.profiles?.forum_role;
  const roleColor =
    role === "admin" ? "#ff4444" : role === "moderator" ? "#00ccff" : "rgba(255,255,255,0.4)";
  const roleLabel = role === "admin" ? "ADMIN" : role === "moderator" ? "MOD" : null;

  return (
    <Link href={`/forum/post/${post.id}`} className="block group">
      <div
        className="relative flex items-center gap-3 p-3 rounded-lg transition-all duration-200"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          marginBottom: "6px",
        }}
      >
        {/* Hover glow */}
        <div
          className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
          style={{ background: `linear-gradient(90deg, ${style.glow}15, transparent)` }}
        />

        {/* Badges */}
        <div className="flex gap-1 shrink-0">
          {post.is_pinned && (
            <span title="Angeheftet">
              <Pin size={12} style={{ color: "#00ffff" }} />
            </span>
          )}
          {post.is_locked && (
            <span title="Gesperrt">
              <Lock size={12} style={{ color: "#ff8800" }} />
            </span>
          )}
          {post.is_hot && (
            <span title="Hot">
              <Flame size={12} style={{ color: "#ff4444" }} />
            </span>
          )}
          {!post.is_pinned && !post.is_locked && !post.is_hot && (
            <div style={{ width: 12 }} />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p
              className="font-medium truncate group-hover:text-white transition-colors"
              style={{ color: "rgba(255,255,255,0.85)", fontSize: "13px" }}
            >
              {post.title}
            </p>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px" }}>
              von{" "}
              <span style={{ color: roleColor, fontWeight: 500 }}>
                {post.profiles?.username || "Unbekannt"}
              </span>
              {roleLabel && (
                <span
                  className="ml-1 px-1 rounded"
                  style={{ background: `${roleColor}22`, color: roleColor, fontSize: "9px", fontWeight: 700 }}
                >
                  {roleLabel}
                </span>
              )}
            </span>
            <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "11px" }}>
              {new Date(post.created_at).toLocaleDateString("de-DE")}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1">
            <MessageSquare size={11} style={{ color: "rgba(255,255,255,0.3)" }} />
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px" }}>{post.reply_count}</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart size={11} style={{ color: "rgba(255,255,255,0.3)" }} />
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px" }}>{post.upvotes}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye size={11} style={{ color: "rgba(255,255,255,0.3)" }} />
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px" }}>{post.view_count}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function ForumPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [hotPosts, setHotPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [categoryPosts, setCategoryPosts] = useState<Post[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("category");
    if (cat) setActiveCategory(cat);
    loadData();
  }, []);

  useEffect(() => {
    if (activeCategory) loadCategoryPosts(activeCategory);
    else setCategoryPosts([]);
  }, [activeCategory]);

  async function loadData() {
    setLoading(true);
    try {
      const [catRes, recentRes, hotRes] = await Promise.all([
        fetch("/api/forum/categories"),
        fetch("/api/forum/posts?limit=8&sort=recent"),
        fetch("/api/forum/posts?limit=5&sort=hot"),
      ]);
      const [catData, recentData, hotData] = await Promise.all([
        catRes.json(),
        recentRes.json(),
        hotRes.json(),
      ]);
      setCategories(catData.categories || []);
      setRecentPosts(recentData.posts || []);
      setHotPosts(hotData.posts || []);
    } finally {
      setLoading(false);
    }
  }

  async function loadCategoryPosts(catId: string) {
    const res = await fetch(`/api/forum/posts?category=${catId}&limit=15`);
    const data = await res.json();
    setCategoryPosts(data.posts || []);
  }

  // Sum up total posts across all categories
  const totalPosts = categories.reduce((sum, c) => sum + (c.post_count || 0), 0);

  return (
    <>
    <ForumHeader postCount={totalPosts} />
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(180deg, #080010 0%, #0d0020 50%, #050010 100%)",
        color: "white",
      }}
    >
      {/* Starfield bg */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.15) 0%, transparent 100%), radial-gradient(1px 1px at 80% 10%, rgba(255,255,255,0.1) 0%, transparent 100%), radial-gradient(1px 1px at 50% 60%, rgba(255,255,255,0.12) 0%, transparent 100%), radial-gradient(1px 1px at 10% 80%, rgba(255,255,255,0.08) 0%, transparent 100%)",
          backgroundSize: "400px 400px, 300px 300px, 500px 500px, 350px 350px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div
              style={{
                width: "40px",
                height: "1px",
                background: "linear-gradient(90deg, transparent, #00ffff)",
              }}
            />
            <span style={{ color: "#00ffff", fontSize: "11px", letterSpacing: "0.3em", fontWeight: 600 }}>
              POKÉDAX
            </span>
            <div
              style={{
                width: "40px",
                height: "1px",
                background: "linear-gradient(90deg, #00ffff, transparent)",
              }}
            />
          </div>
          <h1
            className="text-4xl font-black mb-2"
            style={{
              background: "linear-gradient(135deg, #ffffff 0%, #c8a0ff 50%, #00ffff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.02em",
            }}
          >
            Community Forum
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px" }}>
            Tausche, diskutiere und werde Teil der deutschen Pokémon TCG Community
          </p>
        </div>

        {/* Category Cards Grid */}
        <div className="mb-10">
          <h2
            className="text-sm font-bold uppercase tracking-widest mb-4"
            style={{ color: "rgba(255,255,255,0.3)", letterSpacing: "0.2em" }}
          >
            Kategorien
          </h2>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl animate-pulse"
                  style={{ background: "rgba(255,255,255,0.05)", aspectRatio: "2.5/3.5", minHeight: "240px" }}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                  className="cursor-pointer"
                >
                  <div
                    style={{
                      outline: activeCategory === cat.id
                        ? `2px solid ${CATEGORY_STYLES[cat.id]?.border || "#00ffff"}`
                        : "none",
                      outlineOffset: "3px",
                      borderRadius: "14px",
                    }}
                  >
                    <HoloCard category={cat} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category posts (when selected) */}
        {activeCategory && categoryPosts.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-sm font-bold uppercase tracking-widest"
                style={{ color: CATEGORY_STYLES[activeCategory]?.border || "#00ffff", letterSpacing: "0.2em" }}
              >
                {categories.find((c) => c.id === activeCategory)?.name || activeCategory}
              </h2>
              <Link
                href={`/forum/new?category=${activeCategory}`}
                className="px-3 py-1 rounded-full text-xs font-bold transition-all"
                style={{
                  background: `${CATEGORY_STYLES[activeCategory]?.glow || "rgba(0,255,255,0.1)"}`,
                  border: `1px solid ${CATEGORY_STYLES[activeCategory]?.border || "#00ffff"}`,
                  color: CATEGORY_STYLES[activeCategory]?.border || "#00ffff",
                }}
              >
                + Neuer Beitrag
              </Link>
            </div>
            <div>
              {categoryPosts.map((post) => (
                <PostRow key={post.id} post={post} categoryId={activeCategory} />
              ))}
            </div>
          </div>
        )}

        {/* Two column layout: Recent + Hot */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Posts */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={14} style={{ color: "#00ffff" }} />
              <h2
                className="text-sm font-bold uppercase tracking-widest"
                style={{ color: "rgba(255,255,255,0.3)", letterSpacing: "0.2em" }}
              >
                Neueste Beiträge
              </h2>
            </div>
            <div>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-lg mb-2 animate-pulse"
                      style={{ background: "rgba(255,255,255,0.04)", height: "52px" }}
                    />
                  ))
                : recentPosts.map((post) => (
                    <PostRow key={post.id} post={post} categoryId={post.category_id} />
                  ))}
            </div>
          </div>

          {/* Hot Posts + New Post CTA */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Flame size={14} style={{ color: "#ff4444" }} />
              <h2
                className="text-sm font-bold uppercase tracking-widest"
                style={{ color: "rgba(255,255,255,0.3)", letterSpacing: "0.2em" }}
              >
                Trending
              </h2>
            </div>
            <div className="mb-6">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-lg mb-2 animate-pulse"
                      style={{ background: "rgba(255,255,255,0.04)", height: "52px" }}
                    />
                  ))
                : hotPosts.map((post) => (
                    <PostRow key={post.id} post={post} categoryId={post.category_id} />
                  ))}
            </div>

            {/* New Post CTA */}
            <Link href="/forum/new">
              <div
                className="relative overflow-hidden rounded-xl p-4 cursor-pointer group transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: "linear-gradient(135deg, #1a0533 0%, #2d0a52 100%)",
                  border: "1px solid rgba(200, 100, 255, 0.4)",
                  boxShadow: "0 0 20px rgba(200, 100, 255, 0.15)",
                }}
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: "linear-gradient(135deg, rgba(200,100,255,0.1), transparent)" }}
                />
                <p className="font-bold text-white mb-1" style={{ fontSize: "14px" }}>
                  Beitrag erstellen
                </p>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>
                  Teile deine Gedanken mit der Community
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
'@
[System.IO.File]::WriteAllText("$root\src\app\forum\page.tsx", $forumPage, $enc)
Write-Host "  OK: page.tsx" -ForegroundColor Green

$preischeck = @'
"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, SlidersHorizontal, X, TrendingUp, TrendingDown, Minus } from "lucide-react";
import WishlistButton from "@/components/ui/WishlistButton";
import { useDebounce } from "@/hooks/useDebounce";

interface Card {
  id: string;
  name: string;
  set_id: string;
  number: string;
  rarity: string | null;
  types: string[] | null;
  image_url: string | null;
  price_market: number | null;
  price_low: number | null;
  price_avg7: number | null;
  price_avg30: number | null;
}

interface CardSet {
  id: string;
  name: string;
}

const TYPE_COLORS: Record<string, string> = {
  Fire: "#ff6b35", Water: "#4fc3f7", Grass: "#66bb6a",
  Lightning: "#ffee58", Psychic: "#ab47bc", Fighting: "#ef5350",
  Darkness: "#5c5c5c", Metal: "#90a4ae", Dragon: "#7e57c2",
  Fairy: "#f48fb1", Colorless: "#bdbdbd", Normal: "#bdbdbd",
};

function PriceTrend({ avg7, avg30 }: { avg7?: number | null; avg30?: number | null }) {
  if (!avg7 || !avg30 || avg30 === 0) return null;
  const pct = ((avg7 - avg30) / avg30) * 100;
  if (Math.abs(pct) < 1) return <Minus size={11} style={{ color: "rgba(255,255,255,0.3)" }} />;
  if (pct > 0) return (
    <span className="flex items-center gap-0.5" style={{ color: "#00ff96", fontSize: 10, fontWeight: 700 }}>
      <TrendingUp size={10} />+{pct.toFixed(0)}%
    </span>
  );
  return (
    <span className="flex items-center gap-0.5" style={{ color: "#ff4444", fontSize: 10, fontWeight: 700 }}>
      <TrendingDown size={10} />{pct.toFixed(0)}%
    </span>
  );
}

function CardItem({ card }: { card: Card }) {
  const typeColor = card.types?.[0] ? (TYPE_COLORS[card.types[0]] || "#c864ff") : "#c864ff";
  const imgUrl = card.image_url || `https://assets.tcgdex.net/en/${card.set_id}/${card.number}/low.webp`;

  return (
    <div
      className="group relative overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1.5"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
        border: `1px solid ${typeColor}25`,
        boxShadow: `0 0 20px ${typeColor}10`,
      }}
    >
      {/* Holo shimmer */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10"
        style={{
          background: "linear-gradient(125deg, transparent 20%, rgba(255,255,255,0.06) 45%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.06) 55%, transparent 80%)",
        }}
      />

      {/* Card image */}
      <div className="relative" style={{ aspectRatio: "2.5/3.5", background: "rgba(0,0,0,0.3)" }}>
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={card.name}
            className="w-full h-full object-contain p-2"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ color: "rgba(255,255,255,0.1)", fontSize: 40 }}>
            ◎
          </div>
        )}

        {/* Type glow at bottom of image */}
        <div
          className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none"
          style={{ background: `linear-gradient(0deg, ${typeColor}20, transparent)` }}
        />

        {/* Wishlist button - top right corner overlay */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <WishlistButton cardId={card.id} />
        </div>

        {/* Rarity badge */}
        {card.rarity && (
          <div
            className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md"
            style={{
              background: "rgba(0,0,0,0.7)",
              border: `1px solid ${typeColor}40`,
              color: typeColor,
              fontSize: 9,
              fontWeight: 700,
              backdropFilter: "blur(4px)",
            }}
          >
            {card.rarity}
          </div>
        )}
      </div>

      {/* Card info */}
      <div className="p-3">
        {/* Type pill */}
        {card.types?.[0] && (
          <div className="flex items-center gap-1 mb-1.5">
            <span
              className="px-2 py-0.5 rounded-full text-white"
              style={{ background: `${typeColor}30`, border: `1px solid ${typeColor}50`, fontSize: 9, fontWeight: 700 }}
            >
              {card.types[0]}
            </span>
          </div>
        )}

        <p className="font-bold text-white mb-0.5 leading-tight" style={{ fontSize: 13 }}>
          {card.name}
        </p>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, marginBottom: 8 }}>
          {card.set_id?.toUpperCase()} · #{card.number}
        </p>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div>
            {card.price_market ? (
              <>
                <p className="font-black" style={{ color: "#00ffff", fontSize: 16, lineHeight: 1 }}>
                  {card.price_market.toFixed(2)}€
                </p>
                <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 9, marginTop: 1 }}>Marktpreis</p>
              </>
            ) : card.price_low ? (
              <>
                <p className="font-black" style={{ color: "#00ff96", fontSize: 16, lineHeight: 1 }}>
                  ab {card.price_low.toFixed(2)}€
                </p>
                <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 9, marginTop: 1 }}>Mindestpreis</p>
              </>
            ) : (
              <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 12 }}>Kein Preis</p>
            )}
          </div>
          <PriceTrend avg7={card.price_avg7} avg30={card.price_avg30} />
        </div>
      </div>
    </div>
  );
}

export default function PreischeckPage() {
  const [query, setQuery] = useState("");
  const [cards, setCards] = useState<Card[]>([]);
  const [sets, setSets] = useState<CardSet[]>([]);
  const [selectedSet, setSelectedSet] = useState("");
  const [sortBy, setSortBy] = useState("price_desc");
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searched, setSearched] = useState(false);

  const debouncedQuery = useDebounce(query, 350);

  useEffect(() => {
    fetch("/api/cards/sets").then(r => r.json()).then(d => setSets(d.sets || []));
  }, []);

  useEffect(() => {
    if (debouncedQuery.length < 2 && !selectedSet) {
      setCards([]);
      setSearched(false);
      return;
    }
    search();
  }, [debouncedQuery, selectedSet, sortBy]);

  async function search() {
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams();
      if (debouncedQuery) params.set("q", debouncedQuery);
      if (selectedSet) params.set("set", selectedSet);
      params.set("sort", sortBy);
      params.set("limit", "48");
      const res = await fetch(`/api/cards/search?${params}`);
      const data = await res.json();
      setCards(data.cards || []);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(180deg, #080010 0%, #0d0020 50%, #050010 100%)", color: "white" }}
    >
      {/* Header */}
      <div
        className="sticky top-14 z-30"
        style={{
          background: "rgba(8,0,16,0.95)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(0,255,255,0.5), transparent)" }} />
        <div className="max-w-7xl mx-auto px-4 py-3">
          {/* Title row */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="font-black" style={{
                fontSize: 22, background: "linear-gradient(135deg, #ffffff, #00ffff)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "-0.02em",
              }}>
                Preischeck
              </h1>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>
                {cards.length > 0 ? `${cards.length} Karten gefunden` : "Über 22.000 Karten durchsuchen"}
              </p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all"
              style={{
                background: showFilters ? "rgba(0,255,255,0.1)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${showFilters ? "rgba(0,255,255,0.3)" : "rgba(255,255,255,0.1)"}`,
                color: showFilters ? "#00ffff" : "rgba(255,255,255,0.5)",
                fontSize: 13, cursor: "pointer",
              }}
            >
              <SlidersHorizontal size={14} />
              <span className="hidden sm:inline">Filter</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "rgba(255,255,255,0.35)" }} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Kartenname eingeben... (z.B. Charizard, Pikachu)"
              className="w-full pl-11 pr-10 py-3 rounded-xl focus:outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: query ? "1px solid rgba(0,255,255,0.4)" : "1px solid rgba(255,255,255,0.1)",
                color: "white", fontSize: 14,
                boxShadow: query ? "0 0 16px rgba(0,255,255,0.1)" : "none",
              }}
            />
            {query && (
              <button onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer" }}>
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="flex flex-wrap gap-3 mt-3">
              <select
                value={selectedSet}
                onChange={(e) => setSelectedSet(e.target.value)}
                className="px-3 py-2 rounded-xl focus:outline-none"
                style={{
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "white", fontSize: 13, cursor: "pointer",
                }}
              >
                <option value="">Alle Sets</option>
                {sets.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-xl focus:outline-none"
                style={{
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "white", fontSize: 13, cursor: "pointer",
                }}
              >
                <option value="price_desc">Preis: Hoch → Niedrig</option>
                <option value="price_asc">Preis: Niedrig → Hoch</option>
                <option value="name_asc">Name A → Z</option>
                <option value="trend_desc">Größter Preisanstieg</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Empty state */}
        {!searched && (
          <div className="text-center py-20">
            <div style={{ fontSize: 60, marginBottom: 16, filter: "drop-shadow(0 0 20px rgba(0,255,255,0.3))" }}>🔍</div>
            <h2 className="text-xl font-bold text-white mb-2">Karte suchen</h2>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 14 }}>
              Mindestens 2 Zeichen eingeben oder ein Set auswählen
            </p>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="rounded-2xl animate-pulse"
                style={{ background: "rgba(255,255,255,0.05)", aspectRatio: "2.5/3.5" }} />
            ))}
          </div>
        )}

        {/* Results */}
        {!loading && searched && cards.length === 0 && (
          <div className="text-center py-20">
            <div style={{ fontSize: 50, marginBottom: 16 }}>😕</div>
            <h2 className="text-lg font-bold text-white mb-2">Keine Karten gefunden</h2>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 14 }}>Anderen Suchbegriff oder anderes Set ausprobieren</p>
          </div>
        )}

        {!loading && cards.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {cards.map((card) => (
              <CardItem key={card.id} card={card} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

'@
[System.IO.File]::WriteAllText("$root\src\app\preischeck\page.tsx", $preischeck, $enc)
Write-Host "  OK: page.tsx" -ForegroundColor Green

$postDetail = @'
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft, Heart, MessageSquare, Flag, Pin, Lock, Flame,
  Eye, Send, Shield, Star, Trophy, Zap, ChevronUp
} from "lucide-react";

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
  if (profile.badge_champion)   return { icon: <Trophy size={10} />, label: "Champion",     color: "#ffd700" };
  if (profile.badge_elite4)     return { icon: <Star size={10} />,   label: "Top Vier",      color: "#c864ff" };
  if (profile.badge_gym_leader) return { icon: <Shield size={10} />, label: "Arenaleiter",  color: "#00c8ff" };
  if (profile.badge_trainer)    return { icon: <Zap size={10} />,    label: "Trainer",       color: "#00ff96" };
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
          {profile.username}
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
          <ArrowLeft size={14} />
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
              <Pin size={10} /> Angeheftet
            </span>
          )}
          {post.is_locked && (
            <span className="ml-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs" style={{ color: "#ff8800", background: "rgba(255,136,0,0.1)" }}>
              <Lock size={10} /> Gesperrt
            </span>
          )}
          {post.is_hot && (
            <span className="ml-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs" style={{ color: "#ff4444", background: "rgba(255,68,68,0.1)" }}>
              <Flame size={10} /> Hot
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
                  <Eye size={12} />
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
                <Heart size={13} fill={liked ? "currentColor" : "none"} />
                {post.upvotes + (liked ? 1 : 0)}
              </button>

              <div className="flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px" }}>
                <MessageSquare size={13} />
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
                <Flag size={11} />
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
                          <ChevronUp size={12} />
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
                      <Send size={13} />
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
            <Lock size={16} style={{ color: "#ff8800" }} />
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
[System.IO.File]::WriteAllText("$root\src\app\forum\post\[id]\page.tsx", $postDetail, $enc)
Write-Host "  OK: post/[id]/page.tsx" -ForegroundColor Green

Write-Host ""
Write-Host "Fertig!" -ForegroundColor Cyan
Write-Host "GitHub Desktop -> Commit & Push" -ForegroundColor Yellow
