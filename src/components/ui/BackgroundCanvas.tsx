"use client";

import { useEffect, useRef } from "react";

interface Props {
  intensity?: "low" | "medium" | "high";
}

const COLORS = ["#EE1515", "#FACC15", "#A855F7", "#22D3EE"];

export default function BackgroundCanvas({ intensity = "medium" }: Props) {
  const ref   = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = el.getContext("2d") as CanvasRenderingContext2D;
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
      return {
        x:Math.random()*W, y:Math.random()*H,
        vx:(Math.random()-.5)*.35, vy:(Math.random()-.5)*.35,
        r:.8+Math.random()*2, color:COLORS[Math.floor(Math.random()*4)],
        op:base, base, phase:Math.random()*Math.PI*2, glow:0,
      };
    });
    const bolts: Bolt[] = [];

    // Realistic lightning: just 2-3 sharp kinks, not fractal swirls
    function makeBolt(x1:number, y1:number, x2:number, y2:number): {x:number;y:number}[] {
      const kinks = 2 + Math.floor(Math.random() * 2); // 2-3 kinks
      const pts: {x:number;y:number}[] = [{x:x1,y:y1}];
      for (let i = 1; i < kinks; i++) {
        const t  = i / kinks;
        const mx = x1 + (x2 - x1) * t + (Math.random() - 0.5) * 60;
        const my = y1 + (y2 - y1) * t + (Math.random() - 0.5) * 30;
        pts.push({x:mx, y:my});
      }
      pts.push({x:x2, y:y2});
      return pts;
    }

    function spawnBolt() {
      const x1 = 80 + Math.random() * (W - 160);
      const x2 = x1 + (Math.random() - 0.5) * 120;
      const y2 = 120 + Math.random() * (H * 0.55);
      bolts.push({ pts: makeBolt(x1, 0, x2, y2), life: 0, max: 55 });

      // 1-2 short branches from a random kink
      const main = bolts[bolts.length - 1].pts;
      const branchFrom = main[1 + Math.floor(Math.random() * (main.length - 2))];
      const bLen = 1 + Math.floor(Math.random());
      for (let b = 0; b < bLen; b++) {
        const bx2 = branchFrom.x + (Math.random() - 0.5) * 80;
        const by2 = branchFrom.y + 40 + Math.random() * 80;
        bolts.push({ pts: makeBolt(branchFrom.x, branchFrom.y, bx2, by2), life: 0, max: 40 });
      }

      particles.forEach(p => {
        if (Math.hypot(p.x - x1, p.y) < 220) p.glow = 1;
      });
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      const now = Date.now();
      if (now - lastBolt > nextBolt) {
        spawnBolt();
        lastBolt = now;
        nextBolt = 8000 + Math.random() * 7000;
      }

      // Particles
      particles.forEach(p => {
        p.phase += .01;
        let op = p.base * (Math.sin(p.phase) * .4 + .6);
        const mdx = mouse.current.x - p.x;
        const mdy = mouse.current.y - p.y;
        const md  = Math.hypot(mdx, mdy);
        if (md < 120 && md > 0) {
          op = Math.min(.55, op * 1.8);
          p.vx += (mdx / md) * .012;
          p.vy += (mdy / md) * .012;
        }
        if (p.glow > 0) { op = Math.min(.65, op + p.glow * .45); p.glow *= .93; }
        const spd = Math.hypot(p.vx, p.vy);
        if (spd > .9) { p.vx *= .9/spd; p.vy *= .9/spd; }
        p.vx *= .999; p.vy *= .999;
        p.x += p.vx; p.y += p.vy;
        if (p.x < -5)   p.x = W + 5; if (p.x > W + 5) p.x = -5;
        if (p.y < -5)   p.y = H + 5; if (p.y > H + 5) p.y = -5;

        ctx.save();
        ctx.globalAlpha = op;
        if (p.glow > .05) {
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
          g.addColorStop(0, p.color); g.addColorStop(1, "transparent");
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r*5, 0, Math.PI*2); ctx.fill();
        }
        ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
        ctx.restore();
      });

      // Bolts
      for (let i = bolts.length - 1; i >= 0; i--) {
        const b = bolts[i]; b.life++;
        if (b.life >= b.max) { bolts.splice(i, 1); continue; }
        const t  = b.life / b.max;
        const op = t < .15 ? t / .15 : 1 - (t - .15) / .85;
        if (b.pts.length < 2) continue;
        [
          { c: "rgba(255,255,255,0.95)", w: 1.2 },
          { c: "rgba(238,21,21,0.6)",   w: 3   },
          { c: "rgba(238,21,21,0.15)",  w: 8   },
        ].forEach(layer => {
          ctx.save();
          ctx.globalAlpha = op;
          ctx.beginPath();
          ctx.moveTo(b.pts[0].x, b.pts[0].y);
          b.pts.forEach(pt => ctx.lineTo(pt.x, pt.y));
          ctx.strokeStyle = layer.c;
          ctx.lineWidth   = layer.w;
          ctx.lineJoin    = "round";
          ctx.lineCap     = "round";
          ctx.shadowBlur  = 12;
          ctx.shadowColor = "#EE1515";
          ctx.stroke();
          ctx.restore();
        });
      }

      raf = requestAnimationFrame(draw);
    }

    draw();

    const onResize  = () => { W = el.width = window.innerWidth; H = el.height = window.innerHeight; };
    const onMove    = (e: MouseEvent) => { mouse.current = { x: e.clientX, y: e.clientY }; };
    const onLeave   = () => { mouse.current = { x: -9999, y: -9999 }; };
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
        position: "fixed", top: 0, left: 0,
        width: "100vw", height: "100vh",
        zIndex: 0, pointerEvents: "none", display: "block",
      }}
    />
  );
}
