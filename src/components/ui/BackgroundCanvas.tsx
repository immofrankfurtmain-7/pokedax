"use client";
import { useEffect, useRef } from "react";

interface Props { intensity?: "low" | "medium" | "high"; }

export default function BackgroundCanvas({ intensity = "medium" }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = el.getContext("2d") as CanvasRenderingContext2D;
    if (!ctx) return;

    const STAR_COUNT = intensity === "low" ? 60 : intensity === "high" ? 140 : 100;
    const ORB_COUNT  = intensity === "low" ? 2  : intensity === "high" ? 5   : 3;

    let W = el.width  = window.innerWidth;
    let H = el.height = window.innerHeight;
    let raf = 0;

    // Stars — tiny white dots
    type Star = { x:number; y:number; r:number; op:number; phase:number; speed:number; twinkle:boolean; };
    const stars: Star[] = Array.from({ length: STAR_COUNT }, () => ({
      x:       Math.random() * W,
      y:       Math.random() * H,
      r:       0.25 + Math.random() * 1.1,
      op:      0.08 + Math.random() * 0.35,
      phase:   Math.random() * Math.PI * 2,
      speed:   0.003 + Math.random() * 0.009,
      twinkle: Math.random() > 0.5,
    }));

    // Orbs — only gold/dark gold, very subtle
    // Gold: 233,168,75  Dark-gold: 180,120,40
    const ORB_COLORS = [
      { r:233, g:168, b:75  }, // gold
      { r:180, g:120, b:40  }, // dark gold
      { r:210, g:150, b:60  }, // mid gold
    ];
    type Orb = { x:number; y:number; vx:number; vy:number; r:number; color:{r:number;g:number;b:number}; op:number; phase:number; speed:number; };
    const orbs: Orb[] = Array.from({ length: ORB_COUNT }, (_, i) => ({
      x:     (W / (ORB_COUNT + 1)) * (i + 1) + (Math.random() - 0.5) * 200,
      y:     H * (0.2 + Math.random() * 0.6),
      vx:    (Math.random() - 0.5) * 0.08,
      vy:    (Math.random() - 0.5) * 0.08,
      r:     200 + Math.random() * 300,
      color: ORB_COLORS[i % ORB_COLORS.length],
      op:    0.018 + Math.random() * 0.022,  // very subtle: max 0.04
      phase: Math.random() * Math.PI * 2,
      speed: 0.002 + Math.random() * 0.004,
    }));

    function draw() {
      // Pure #0a0a0a background — matches --canvas
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, W, H);

      // Stars
      stars.forEach(s => {
        s.phase += s.speed;
        const brightness = s.twinkle
          ? s.op * (0.3 + Math.abs(Math.sin(s.phase)) * 0.7)
          : s.op * (0.6 + Math.sin(s.phase) * 0.4);
        ctx.globalAlpha = brightness;
        ctx.fillStyle   = "white";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Gold orbs — extremely subtle
      orbs.forEach(o => {
        o.phase += o.speed;
        o.x += o.vx; o.y += o.vy;
        // Gentle wrap
        if (o.x < -o.r) o.x = W + o.r;
        if (o.x > W + o.r) o.x = -o.r;
        if (o.y < -o.r) o.y = H + o.r;
        if (o.y > H + o.r) o.y = -o.r;
        const pulse = 0.5 + Math.sin(o.phase) * 0.5;
        const op    = o.op * pulse;
        const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
        g.addColorStop(0,   `rgba(${o.color.r},${o.color.g},${o.color.b},${op * 2.5})`);
        g.addColorStop(0.5, `rgba(${o.color.r},${o.color.g},${o.color.b},${op})`);
        g.addColorStop(1,   `rgba(${o.color.r},${o.color.g},${o.color.b},0)`);
        ctx.globalAlpha = 1;
        ctx.fillStyle   = g;
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    }

    draw();

    const onResize = () => {
      W = el.width  = window.innerWidth;
      H = el.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, [intensity]);

  return (
    <canvas ref={ref} aria-hidden="true" style={{
      position:"fixed", top:0, left:0,
      width:"100vw", height:"100vh",
      zIndex:0, pointerEvents:"none", display:"block",
    }}/>
  );
}
