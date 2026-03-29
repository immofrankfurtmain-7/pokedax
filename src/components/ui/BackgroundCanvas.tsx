"use client";

import { useEffect, useRef } from "react";

interface Props {
  intensity?: "low" | "medium" | "high";
}

const COLORS = [
  { r:249, g:115, b:22  },  // fire orange
  { r:59,  g:130, b:246 },  // water blue
  { r:168, g:85,  b:247 },  // psychic purple
  { r:250, g:204, b:21  },  // lightning gold
  { r:34,  g:197, b:94  },  // grass green
  { r:0,   g:229, b:255 },  // cyan
  { r:238, g:21,  b:21  },  // pokémon red
];

export default function BackgroundCanvas({ intensity = "medium" }: Props) {
  const ref   = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = el.getContext("2d") as CanvasRenderingContext2D;
    if (!ctx) return;

    const ORB_COUNT  = intensity === "low" ? 8 : intensity === "high" ? 18 : 12;
    const STAR_COUNT = intensity === "low" ? 80 : intensity === "high" ? 180 : 130;

    let W = el.width  = window.innerWidth;
    let H = el.height = window.innerHeight;
    let raf = 0;

    type Orb = {
      x:number; y:number; vx:number; vy:number;
      r:number; color:{r:number;g:number;b:number};
      op:number; phase:number; speed:number;
    };
    type Star = {
      x:number; y:number; r:number; op:number;
      phase:number; speed:number; twinkle:boolean;
    };

    // Stars — mix of static and twinkling
    const stars: Star[] = Array.from({ length: STAR_COUNT }, () => ({
      x:       Math.random() * W,
      y:       Math.random() * H,
      r:       0.3 + Math.random() * 1.4,
      op:      0.1 + Math.random() * 0.5,
      phase:   Math.random() * Math.PI * 2,
      speed:   0.004 + Math.random() * 0.012,
      twinkle: Math.random() > 0.4,
    }));

    // Orbs — large soft glowing blobs, very low opacity
    const orbs: Orb[] = Array.from({ length: ORB_COUNT }, () => {
      const c = COLORS[Math.floor(Math.random() * COLORS.length)];
      return {
        x:     Math.random() * W,
        y:     Math.random() * H,
        vx:    (Math.random() - 0.5) * 0.18,
        vy:    (Math.random() - 0.5) * 0.18,
        r:     100 + Math.random() * 180,
        color: c,
        op:    0.025 + Math.random() * 0.045,
        phase: Math.random() * Math.PI * 2,
        speed: 0.003 + Math.random() * 0.007,
      };
    });

    function draw() {
      // Deep space background
      ctx.fillStyle = "#0d0a1a";
      ctx.fillRect(0, 0, W, H);

      // ── Stars ──────────────────────────────────────────
      stars.forEach(s => {
        s.phase += s.speed;
        const brightness = s.twinkle
          ? s.op * (0.3 + Math.abs(Math.sin(s.phase)) * 0.7)
          : s.op * (0.7 + Math.sin(s.phase) * 0.3);

        ctx.globalAlpha = brightness;
        ctx.fillStyle   = "white";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();

        // Occasional bright star with cross-flare
        if (s.r > 1.1 && s.twinkle && brightness > s.op * 0.8) {
          ctx.globalAlpha = brightness * 0.4;
          ctx.strokeStyle = "white";
          ctx.lineWidth   = 0.5;
          ctx.beginPath();
          ctx.moveTo(s.x - s.r * 3, s.y);
          ctx.lineTo(s.x + s.r * 3, s.y);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(s.x, s.y - s.r * 3);
          ctx.lineTo(s.x, s.y + s.r * 3);
          ctx.stroke();
        }
      });

      // ── Orbs ───────────────────────────────────────────
      orbs.forEach(o => {
        o.phase += o.speed;
        o.x     += o.vx;
        o.y     += o.vy;

        // Mouse subtle repulsion
        const mdx = o.x - mouse.current.x;
        const mdy = o.y - mouse.current.y;
        const md  = Math.hypot(mdx, mdy);
        if (md < 300 && md > 0) {
          const force = (300 - md) / 300 * 0.003;
          o.vx += (mdx / md) * force;
          o.vy += (mdy / md) * force;
        }

        // Speed limit + damping
        const spd = Math.hypot(o.vx, o.vy);
        if (spd > 0.4) { o.vx *= 0.4 / spd; o.vy *= 0.4 / spd; }
        o.vx *= 0.999; o.vy *= 0.999;

        // Wrap
        if (o.x < -o.r) o.x = W + o.r;
        if (o.x > W + o.r) o.x = -o.r;
        if (o.y < -o.r) o.y = H + o.r;
        if (o.y > H + o.r) o.y = -o.r;

        const pulse = 0.6 + Math.sin(o.phase) * 0.4;
        const op    = o.op * pulse;

        // Outer soft glow
        const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
        g.addColorStop(0,   `rgba(${o.color.r},${o.color.g},${o.color.b},${op * 2.5})`);
        g.addColorStop(0.4, `rgba(${o.color.r},${o.color.g},${o.color.b},${op})`);
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
      // Redistribute stars on resize
      stars.forEach(s => {
        if (s.x > W) s.x = Math.random() * W;
        if (s.y > H) s.y = Math.random() * H;
      });
    };
    const onMove  = (e: MouseEvent) => { mouse.current = { x: e.clientX, y: e.clientY }; };
    const onLeave = () => { mouse.current = { x: -9999, y: -9999 }; };

    window.addEventListener("resize",     onResize);
    window.addEventListener("mousemove",  onMove);
    window.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize",     onResize);
      window.removeEventListener("mousemove",  onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, [intensity]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{
        position:      "fixed",
        top:           0,
        left:          0,
        width:         "100vw",
        height:        "100vh",
        zIndex:        0,
        pointerEvents: "none",
        display:       "block",
      }}
    />
  );
}
