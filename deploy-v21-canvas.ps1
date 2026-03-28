# PokeDax v21 – BackgroundCanvas final (kein TypeScript null Fehler)
$root = "C:\Users\lenovo\pokedax\pokedax\pokedax"
$enc  = New-Object System.Text.UTF8Encoding $true
Write-Host "PokeDax v21..." -ForegroundColor Cyan

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

export default function BackgroundCanvas({ intensity = "medium" }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = el.getContext("2d");
    if (!ctx) return;

    const COUNT = intensity === "low" ? 60 : intensity === "high" ? 140 : 100;
    let W = el.width  = window.innerWidth;
    let H = el.height = window.innerHeight;
    let raf = 0;
    let lastBolt = Date.now();
    let nextBolt = 8000 + Math.random() * 7000;

    type P = { x:number;y:number;vx:number;vy:number;r:number;color:string;op:number;base:number;phase:number;glow:number };
    type Bolt = { pts:{x:number;y:number}[];life:number;max:number };

    const particles: P[] = Array.from({ length: COUNT }, () => {
      const base = 0.07 + Math.random() * 0.18;
      return { x:Math.random()*W, y:Math.random()*H, vx:(Math.random()-.5)*.35, vy:(Math.random()-.5)*.35,
               r:.8+Math.random()*2, color:COLORS[Math.floor(Math.random()*4)], op:base, base, phase:Math.random()*Math.PI*2, glow:0 };
    });
    const bolts: Bolt[] = [];

    function seg(x1:number,y1:number,x2:number,y2:number,d=0):{x:number;y:number}[] {
      if(d>4) return [{x:x1,y:y1},{x:x2,y:y2}];
      const mx=(x1+x2)/2+(Math.random()-.5)*80, my=(y1+y2)/2+(Math.random()-.5)*80;
      return [...seg(x1,y1,mx,my,d+1),...seg(mx,my,x2,y2,d+1)];
    }

    function bolt() {
      const x1=50+Math.random()*(W-100);
      bolts.push({ pts:seg(x1,0,x1+(Math.random()-.5)*300,150+Math.random()*(H*.5)), life:0, max:50 });
      particles.forEach(p=>{ if(Math.hypot(p.x-x1,p.y-20)<200) p.glow=1; });
    }

    function draw() {
      ctx.clearRect(0,0,W,H);
      const now=Date.now();
      if(now-lastBolt>nextBolt){ bolt(); lastBolt=now; nextBolt=8000+Math.random()*7000; }

      particles.forEach(p=>{
        p.phase+=.01;
        let op=p.base*(Math.sin(p.phase)*.4+.6);
        const mdx=mouse.current.x-p.x, mdy=mouse.current.y-p.y, md=Math.hypot(mdx,mdy);
        if(md<120&&md>0){ op=Math.min(.55,op*1.8); p.vx+=(mdx/md)*.012; p.vy+=(mdy/md)*.012; }
        if(p.glow>0){ op=Math.min(.65,op+p.glow*.45); p.glow*=.93; }
        const spd=Math.hypot(p.vx,p.vy); if(spd>.9){p.vx*=.9/spd;p.vy*=.9/spd;}
        p.vx*=.999; p.vy*=.999; p.x+=p.vx; p.y+=p.vy;
        if(p.x<-5)p.x=W+5; if(p.x>W+5)p.x=-5;
        if(p.y<-5)p.y=H+5; if(p.y>H+5)p.y=-5;
        ctx.save(); ctx.globalAlpha=op;
        if(p.glow>.05){
          const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*5);
          g.addColorStop(0,p.color); g.addColorStop(1,"transparent");
          ctx.fillStyle=g; ctx.beginPath(); ctx.arc(p.x,p.y,p.r*5,0,Math.PI*2); ctx.fill();
        }
        ctx.fillStyle=p.color; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
        ctx.restore();
      });

      for(let i=bolts.length-1;i>=0;i--){
        const b=bolts[i]; b.life++;
        if(b.life>=b.max){ bolts.splice(i,1); continue; }
        const t=b.life/b.max, op=t<.2?t/.2:1-(t-.2)/.8;
        [{c:"rgba(255,255,255,0.9)",w:.8},{c:"rgba(238,21,21,0.55)",w:2.5},{c:"rgba(238,21,21,0.18)",w:6}].forEach(l=>{
          ctx.save(); ctx.globalAlpha=op; ctx.beginPath();
          ctx.moveTo(b.pts[0].x,b.pts[0].y); b.pts.forEach(pt=>ctx.lineTo(pt.x,pt.y));
          ctx.strokeStyle=l.c; ctx.lineWidth=l.w; ctx.shadowBlur=10; ctx.shadowColor="#EE1515"; ctx.stroke(); ctx.restore();
        });
      }
      raf=requestAnimationFrame(draw);
    }

    draw();

    const onResize=()=>{ W=el.width=window.innerWidth; H=el.height=window.innerHeight; };
    const onMove=(e:MouseEvent)=>{ mouse.current={x:e.clientX,y:e.clientY}; };
    const onLeave=()=>{ mouse.current={x:-9999,y:-9999}; };
    window.addEventListener("resize",onResize);
    window.addEventListener("mousemove",onMove);
    window.addEventListener("mouseleave",onLeave);
    return ()=>{ cancelAnimationFrame(raf); window.removeEventListener("resize",onResize); window.removeEventListener("mousemove",onMove); window.removeEventListener("mouseleave",onLeave); };
  }, [intensity]);

  return <canvas ref={ref} aria-hidden="true" style={{ position:"fixed", top:0, left:0, width:"100vw", height:"100vh", zIndex:0, pointerEvents:"none", display:"block" }} />;
}

'@
[System.IO.File]::WriteAllText("$root\src\components\ui\BackgroundCanvas.tsx", $bgCanvas, $enc)
Write-Host "  OK: BackgroundCanvas.tsx" -ForegroundColor Green

$layout = @'
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
[System.IO.File]::WriteAllText("$root\src\app\layout.tsx", $layout, $enc)
Write-Host "  OK: layout.tsx" -ForegroundColor Green

$globalCSS = @'
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
[System.IO.File]::WriteAllText("$root\src\app\globals.css", $globalCSS, $enc)
Write-Host "  OK: globals.css" -ForegroundColor Green

Write-Host ""
Write-Host "Fertig! Commit & Push." -ForegroundColor Cyan
