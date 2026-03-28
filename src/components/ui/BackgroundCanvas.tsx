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
