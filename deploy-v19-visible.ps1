# PokeDax v19 – Canvas sichtbar (z-index fix + transparente Backgrounds)
$root = "C:\Users\lenovo\pokedax\pokedax\pokedax"
$enc  = New-Object System.Text.UTF8Encoding $true
Write-Host "PokeDax v19 – Canvas sichtbar..." -ForegroundColor Cyan

$dirs = @("$root\src\components\ui","$root\src\app")
foreach ($d in $dirs) {
  if (-not (Test-Path -LiteralPath $d)) { New-Item -ItemType Directory -Path $d -Force | Out-Null }
}


$bgCanvas = @'
"use client";

import { useEffect, useRef } from "react";

interface Props {
  intensity?: "low" | "medium" | "high";
}

const COLORS = ["#EE1515", "#FACC15", "#A855F7", "#22D3EE"];

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  radius: number;
  color: string;
  opacity: number;
  baseOpacity: number;
  pulseSpeed: number;
  pulsePhase: number;
  glow: number;
}

interface LightningBolt {
  points: { x: number; y: number }[];
  opacity: number;
  life: number;
  maxLife: number;
  branches: { points: { x: number; y: number }[]; opacity: number }[];
}

function createLightning(
  x1: number, y1: number,
  x2: number, y2: number,
  depth = 0
): { x: number; y: number }[] {
  if (depth > 4) return [{ x: x1, y: y1 }, { x: x2, y: y2 }];
  const mx = (x1 + x2) / 2 + (Math.random() - 0.5) * 80;
  const my = (y1 + y2) / 2 + (Math.random() - 0.5) * 80;
  return [
    ...createLightning(x1, y1, mx, my, depth + 1),
    ...createLightning(mx, my, x2, y2, depth + 1),
  ];
}

export default function BackgroundCanvas({ intensity = "medium" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef  = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    if (!ctx) return;

    const COUNT = intensity === "low" ? 60 : intensity === "high" ? 140 : 100;
    const LIGHTNING_INTERVAL_MIN = intensity === "low" ? 12000 : 8000;
    const LIGHTNING_INTERVAL_MAX = intensity === "low" ? 20000 : 15000;

    let W = window.innerWidth;
    let H = window.innerHeight;
    let animId: number;
    let particles: Particle[] = [];
    let bolts: LightningBolt[] = [];
    let lastLightning = Date.now();
    let nextLightning = LIGHTNING_INTERVAL_MIN +
      Math.random() * (LIGHTNING_INTERVAL_MAX - LIGHTNING_INTERVAL_MIN);

    function resize() {
      if (!canvas) return;
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    function initParticles() {
      particles = Array.from({ length: COUNT }, () => {
        const baseOp = 0.06 + Math.random() * 0.18;
        return {
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          radius: 0.8 + Math.random() * 1.8,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          opacity: baseOp,
          baseOpacity: baseOp,
          pulseSpeed: 0.005 + Math.random() * 0.015,
          pulsePhase: Math.random() * Math.PI * 2,
          glow: 0,
        };
      });
    }

    function spawnLightning() {
      const x1 = Math.random() * W;
      const y1 = 0;
      const x2 = x1 + (Math.random() - 0.5) * 300;
      const y2 = 200 + Math.random() * (H * 0.6);
      const points = createLightning(x1, y1, x2, y2);

      // 1–3 branches
      const branches = Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => {
        const bi = Math.floor(Math.random() * points.length);
        const bp = points[bi];
        const bpts = createLightning(
          bp.x, bp.y,
          bp.x + (Math.random() - 0.5) * 200,
          bp.y + 80 + Math.random() * 150,
          2
        );
        return { points: bpts, opacity: 1 };
      });

      bolts.push({ points, branches, opacity: 1, life: 0, maxLife: 40 });

      // After-glow on nearby particles
      particles.forEach(p => {
        const dx = p.x - x1;
        const dy = p.y - y1;
        if (Math.hypot(dx, dy) < 200) p.glow = 1;
      });
    }

    function drawParticle(p: Particle, t: number) {
      p.pulsePhase += p.pulseSpeed;
      const pulse  = Math.sin(p.pulsePhase) * 0.5 + 0.5;
      p.opacity    = p.baseOpacity * (0.6 + pulse * 0.4);

      // Mouse attraction
      const mdx = mouseRef.current.x - p.x;
      const mdy = mouseRef.current.y - p.y;
      const md  = Math.hypot(mdx, mdy);
      if (md < 120) {
        const force = (120 - md) / 120 * 0.015;
        p.vx += (mdx / md) * force;
        p.vy += (mdy / md) * force;
        p.opacity = Math.min(0.5, p.opacity * 1.6);
      }

      // Glow decay
      if (p.glow > 0) {
        p.opacity = Math.min(0.6, p.opacity + p.glow * 0.4);
        p.glow   *= 0.93;
      }

      // Speed cap + damping
      const speed = Math.hypot(p.vx, p.vy);
      if (speed > 0.8) { p.vx *= 0.8 / speed * 0.8; p.vy *= 0.8 / speed * 0.8; }
      p.vx *= 0.999; p.vy *= 0.999;

      p.x += p.vx; p.y += p.vy;
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10;
      if (p.y > H + 10) p.y = -10;

      const r = p.radius + p.glow * 1.5;
      ctx.save();
      ctx.globalAlpha = p.opacity;
      if (p.glow > 0.05) {
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 4);
        grd.addColorStop(0, p.color);
        grd.addColorStop(1, "transparent");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function drawBolt(bolt: LightningBolt) {
      bolt.life++;
      const progress = bolt.life / bolt.maxLife;
      bolt.opacity   = progress < 0.2
        ? progress / 0.2
        : 1 - ((progress - 0.2) / 0.8);

      const drawSegments = (
        points: { x: number; y: number }[],
        width: number,
        alpha: number
      ) => {
        if (points.length < 2) return;
        ctx.save();
        ctx.globalAlpha = alpha * bolt.opacity;

        // White-red glow layers
        [
          { color: "rgba(255,255,255,0.9)", width: width * 0.5, blur: 0 },
          { color: "rgba(238,21,21,0.6)",   width: width * 1.5, blur: 6  },
          { color: "rgba(238,21,21,0.2)",   width: width * 4,   blur: 12 },
        ].forEach(layer => {
          ctx.beginPath();
          ctx.moveTo(points[0].x, points[0].y);
          for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
          }
          ctx.strokeStyle = layer.color;
          ctx.lineWidth   = layer.width;
          ctx.shadowBlur  = layer.blur;
          ctx.shadowColor = "#EE1515";
          ctx.stroke();
        });
        ctx.restore();
      };

      drawSegments(bolt.points, 1.2, 1);
      bolt.branches.forEach(b => drawSegments(b.points, 0.6, 0.6));
    }

    function frame() {
      ctx.clearRect(0, 0, W, H);

      const now = Date.now();
      if (now - lastLightning > nextLightning) {
        spawnLightning();
        lastLightning = now;
        nextLightning = LIGHTNING_INTERVAL_MIN +
          Math.random() * (LIGHTNING_INTERVAL_MAX - LIGHTNING_INTERVAL_MIN);
      }

      particles.forEach(p => drawParticle(p, now));

      bolts = bolts.filter(b => b.life < b.maxLife);
      bolts.forEach(b => drawBolt(b));

      animId = requestAnimationFrame(frame);
    }

    resize();
    initParticles();
    frame();

    const onResize = () => { resize(); };
    const onMouse  = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const onLeave  = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMouse);
    window.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0, left: 0,
        width: "100%", height: "100%",
        zIndex: 0,
        pointerEvents: "none",
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

html {
  background: #0A0A0A;
}

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

html {
  scroll-behavior: smooth;
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

$homePage = @'
import Link from "next/link";
import { Search, Camera, TrendingUp, ArrowRight } from "lucide-react";
import TrendingGrid from "@/components/cards/TrendingGrid";
import ForumSection from "@/components/forum/ForumSection";
import PremiumSection from "@/components/premium/PremiumSection";
import OnlineUsers from "@/components/ui/OnlineUsers";
import type { TrendingCard } from "@/types";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("cards")
    .select("id,name,set_id,number,rarity,types,image_url,price_market,price_low,price_high,price_avg7,price_avg30")
    .not("price_market", "is", null)
    .order("price_market", { ascending: false })
    .limit(8);

  const trendingCards: TrendingCard[] = (rows || []).map((row, i) => {
    const change7d = row.price_avg7 && row.price_avg30 && row.price_avg30 > 0
      ? Math.round(((row.price_avg7 - row.price_avg30) / row.price_avg30) * 1000) / 10
      : 0;
    const signal: "buy" | "sell" | "hold" = change7d >= 3 ? "buy" : change7d <= -3 ? "sell" : "hold";
    return {
      rank: i + 1,
      rankChange: 0,
      card: {
        id: row.id,
        name: row.name,
        number: row.number || "",
        rarity: row.rarity || "",
        types: row.types || [],
        images: {
          small: row.image_url || `https://assets.tcgdex.net/en/${row.set_id}/${row.number}/low.webp`,
          large: row.image_url || `https://assets.tcgdex.net/en/${row.set_id}/${row.number}/high.webp`,
        },
        set: { id: row.set_id || "", name: row.set_id?.toUpperCase() || "" },
      },
      price: {
        price:    row.price_market || 0,
        low:      row.price_low    || 0,
        high:     row.price_high   || 0,
        change7d,
        signal,
      },
    } as TrendingCard;
  });

  return (
    <div style={{ background: "rgba(10,10,10,0.85)", minHeight: "100vh" }}>

      {/* ── HERO ── */}
      <section style={{
        background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(238,21,21,0.09), transparent), radial-gradient(ellipse 40% 30% at 80% 90%, rgba(250,204,21,0.04), transparent), #0A0A0A",
        padding: "72px 20px 60px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Live badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          padding: "5px 14px", borderRadius: 20,
          background: "rgba(238,21,21,0.1)", border: "1px solid rgba(238,21,21,0.25)",
          marginBottom: 22,
        }}>
          <span className="live-dot" />
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 700, color: "#EE1515", letterSpacing: "0.06em" }}>
            LIVE · CARDMARKET EUR-PREISE
          </span>
        </div>

        <h1 style={{ fontSize: "clamp(36px, 7vw, 64px)", fontFamily: "Poppins, sans-serif", fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1.05, marginBottom: 18 }}>
          <span style={{ color: "#F8FAFC" }}>Pokémon TCG</span>
          <br />
          <span style={{ background: "linear-gradient(135deg, #EE1515, #ff6b6b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Preis-Check DE
          </span>
        </h1>

        <p style={{ fontSize: 15, color: "#94A3B8", maxWidth: 480, margin: "0 auto 32px", lineHeight: 1.65 }}>
          Scanne deine Karte und erhalte sofort den aktuellen Marktwert mit Kauf-/Verkaufsempfehlung – direkt von Cardmarket.
        </p>

        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 48 }}>
          <Link href="/preischeck" className="btn-primary" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Search size={16} />
            Preis checken
          </Link>
          <Link href="/scanner" className="btn-outline" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Camera size={16} />
            Karte scannen
          </Link>
        </div>

        {/* Stats bar */}
        <div style={{
          display: "flex", flexWrap: "wrap", justifyContent: "center",
          border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16,
          overflow: "hidden", background: "rgba(17,17,17,0.85)",
          maxWidth: 640, margin: "0 auto",
        }}>
          {[
            { val: "98.420", label: "Karten in DB" },
            { val: "2.841",  label: "Aktive Nutzer" },
            { val: "1.247",  label: "Scans heute"   },
            { val: "18.330", label: "Forum-Posts"   },
          ].map((s, i, arr) => (
            <div key={s.label} style={{
              flex: "1 1 120px", padding: "18px 16px", textAlign: "center",
              borderRight: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.07)" : "none",
            }}>
              <div style={{ fontFamily: "Poppins, sans-serif", fontWeight: 900, fontSize: 22, color: "#F8FAFC" }}>
                {s.val}
              </div>
              <div style={{ fontSize: 10, fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 3 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Feature pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 24 }}>
          {["Live-Preise von Cardmarket", "KI-Karten-Scanner", "Fake-Check & Grading", "Realtime Preis-Alerts"].map(f => (
            <span key={f} style={{
              padding: "5px 12px", borderRadius: 20,
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
              fontSize: 12, color: "#94A3B8",
            }}>✓ {f}</span>
          ))}
        </div>
      </section>

      {/* ── TRENDING CARDS ── */}
      <section style={{ padding: "48px 20px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <div className="section-eyebrow" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <TrendingUp size={12} />
              Trending jetzt
            </div>
            <h2 style={{ fontFamily: "Poppins, sans-serif", fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 800, color: "#F8FAFC", letterSpacing: "-0.02em" }}>
              Meistgesuchte Karten
            </h2>
          </div>
          <Link href="/preischeck" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "#475569", textDecoration: "none" }}>
            Alle ansehen <ArrowRight size={14} />
          </Link>
        </div>
        <TrendingGrid cards={trendingCards} />
      </section>

      {/* ── FORUM SECTION ── */}
      <ForumSection />

      {/* ── ONLINE USERS ── */}
      <section style={{ padding: "0 20px 48px", maxWidth: 1200, margin: "0 auto" }}>
        <OnlineUsers />
      </section>

      {/* ── PREMIUM ── */}
      <PremiumSection />
    </div>
  );
}

'@
[System.IO.File]::WriteAllText("$root\src\app\page.tsx", $homePage, $enc)
Write-Host "  OK: page.tsx" -ForegroundColor Green

Write-Host ""
Write-Host "Fertig! Blitze und Partikel sollten jetzt sichtbar sein." -ForegroundColor Cyan
Write-Host "GitHub Desktop -> Commit & Push" -ForegroundColor Yellow
