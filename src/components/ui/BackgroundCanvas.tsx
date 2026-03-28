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
    const ctx = canvas.getContext("2d");
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
        zIndex: -1,
        pointerEvents: "none",
      }}
      aria-hidden="true"
    />
  );
}
