'use client'
import { useEffect, useRef } from 'react'

// Punkte von Grok – präzise Mewtwo-Silhouette (sitzend, Schwanz oben rechts)
// x/y sind normalisiert auf Canvas-Breite/Höhe
const STARS = [
  // Linkes Ohr
  { x:0.618, y:0.042, r:1.85, col:'#a5f3fc', ph:0.00 },
  { x:0.595, y:0.078, r:1.70, col:'#67e8f9', ph:0.12 },
  { x:0.632, y:0.065, r:2.05, col:'#c084fc', ph:0.24 },
  // Rechtes Ohr
  { x:0.712, y:0.038, r:1.95, col:'#a78bfa', ph:0.06 },
  { x:0.735, y:0.072, r:1.80, col:'#a5f3fc', ph:0.18 },
  { x:0.698, y:0.058, r:2.10, col:'#67e8f9', ph:0.30 },
  // Stirn
  { x:0.665, y:0.105, r:2.35, col:'#c084fc', ph:0.08 },
  { x:0.682, y:0.128, r:2.20, col:'#a5f3fc', ph:0.20 },
  // Linkes Auge
  { x:0.648, y:0.192, r:2.55, col:'#67e8f9', ph:0.14 },
  { x:0.635, y:0.222, r:2.10, col:'#a78bfa', ph:0.26 },
  { x:0.658, y:0.210, r:1.95, col:'#c084fc', ph:0.38 },
  // Rechtes Auge
  { x:0.702, y:0.188, r:2.60, col:'#a5f3fc', ph:0.16 },
  { x:0.715, y:0.218, r:2.15, col:'#67e8f9', ph:0.28 },
  { x:0.692, y:0.205, r:2.00, col:'#a78bfa', ph:0.40 },
  // Schnauze
  { x:0.675, y:0.248, r:2.25, col:'#c084fc', ph:0.10 },
  { x:0.680, y:0.275, r:1.85, col:'#a5f3fc', ph:0.22 },
  // Rechter Arm (vorne, Feuer-Kontur)
  { x:0.785, y:0.265, r:2.05, col:'#67e8f9', ph:0.04 },
  { x:0.815, y:0.235, r:1.90, col:'#c084fc', ph:0.18 },
  { x:0.845, y:0.205, r:2.20, col:'#a78bfa', ph:0.32 },
  { x:0.868, y:0.168, r:1.75, col:'#a5f3fc', ph:0.46 },
  // Linker Arm (hinten)
  { x:0.545, y:0.278, r:1.80, col:'#67e8f9', ph:0.08 },
  { x:0.515, y:0.245, r:2.00, col:'#c084fc', ph:0.22 },
  { x:0.485, y:0.218, r:1.65, col:'#a78bfa', ph:0.36 },
  // Brust
  { x:0.635, y:0.305, r:2.40, col:'#a5f3fc', ph:0.00 },
  { x:0.705, y:0.300, r:2.30, col:'#67e8f9', ph:0.14 },
  { x:0.670, y:0.345, r:2.55, col:'#c084fc', ph:0.28 },
  // Bauch
  { x:0.645, y:0.415, r:2.10, col:'#a78bfa', ph:0.12 },
  { x:0.685, y:0.445, r:2.00, col:'#a5f3fc', ph:0.26 },
  { x:0.615, y:0.460, r:1.95, col:'#67e8f9', ph:0.40 },
  // Schwanzansatz / Rücken
  { x:0.730, y:0.385, r:2.45, col:'#c084fc', ph:0.06 },
  { x:0.765, y:0.345, r:2.25, col:'#67e8f9', ph:0.20 },
  { x:0.800, y:0.305, r:2.05, col:'#a78bfa', ph:0.34 },
  // Schwanz Mitte
  { x:0.825, y:0.265, r:2.15, col:'#a5f3fc', ph:0.10 },
  { x:0.855, y:0.225, r:1.95, col:'#c084fc', ph:0.24 },
  { x:0.880, y:0.185, r:2.10, col:'#67e8f9', ph:0.38 },
  // Schwanzspitze (breite rote Fläche)
  { x:0.905, y:0.145, r:2.30, col:'#f87171', ph:0.16 },
  { x:0.935, y:0.105, r:2.00, col:'#f87171', ph:0.30 },
  { x:0.960, y:0.065, r:1.85, col:'#fca5a5', ph:0.44 },
  { x:0.890, y:0.175, r:1.90, col:'#f87171', ph:0.48 },
  // Linkes Bein
  { x:0.605, y:0.620, r:2.25, col:'#a5f3fc', ph:0.18 },
  { x:0.575, y:0.695, r:1.95, col:'#67e8f9', ph:0.32 },
  { x:0.545, y:0.765, r:1.75, col:'#c084fc', ph:0.46 },
  // Rechtes Bein
  { x:0.705, y:0.630, r:2.15, col:'#a78bfa', ph:0.22 },
  { x:0.735, y:0.705, r:1.85, col:'#a5f3fc', ph:0.36 },
  { x:0.765, y:0.775, r:1.65, col:'#67e8f9', ph:0.50 },
  // Innenfüllung
  { x:0.655, y:0.365, r:1.60, col:'#c084fc', ph:0.50 },
  { x:0.695, y:0.395, r:1.70, col:'#67e8f9', ph:0.65 },
  { x:0.625, y:0.385, r:1.55, col:'#a78bfa', ph:0.80 },
  { x:0.675, y:0.480, r:1.80, col:'#a5f3fc', ph:0.95 },
  { x:0.635, y:0.540, r:1.65, col:'#c084fc', ph:1.10 },
  { x:0.715, y:0.510, r:1.75, col:'#67e8f9', ph:1.25 },
]

// 68 Verbindungen von Grok
const CONNECTIONS: [number,number][] = [
  // Ohren-Netz
  [0,1],[1,2],[0,2],[3,4],[4,5],[3,5],[2,5],[1,4],
  // Stirn → Augen
  [6,7],[6,8],[7,9],[8,9],[6,10],[7,11],
  // Augen → Schnauze
  [8,12],[9,13],[10,12],[11,13],
  // Schnauze → Arme
  [12,14],[13,15],[12,16],[13,17],
  // Arme → Brust
  [14,18],[15,19],[16,18],[17,19],
  // Brust → Bauch
  [18,20],[19,21],[20,22],[21,22],
  // Bauch → Beine
  [20,23],[21,26],[22,24],[22,27],
  // Schwanz-Netz
  [19,28],[28,29],[29,30],[30,31],[31,32],[32,33],
  // Beine-Netz
  [23,34],[34,35],[35,36],[26,37],[37,38],[38,39],
  // Querverbindungen
  [8,18],[9,19],[14,20],[15,21],[16,22],[17,22],
  [6,12],[7,13],[10,18],[11,19],[24,27],[25,28],
  [30,33],[29,32],[2,6],[5,7],[4,11],[1,10],
]

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1,3),16)
  const g = parseInt(hex.slice(3,5),16)
  const b = parseInt(hex.slice(5,7),16)
  return { r, g, b }
}

export default function MewtwoCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef    = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Zusätzliche Hintergrund-Sterne (driften durch den Raum)
    const bgStars = Array.from({ length:120 }, () => ({
      x: Math.random(), y: Math.random(),
      r: Math.random()*1.2+0.2,
      a: Math.random()*0.4+0.06,
      vx: (Math.random()-.5)*0.00008,
      vy: (Math.random()-.5)*0.00008,
      ph: Math.random()*Math.PI*2,
    }))

    // Animations-State: Punkte erscheinen nacheinander
    let t0: number|null = null
    const DRAW_DUR  = 5000  // ms bis alle Punkte erschienen sind
    const CONN_DUR  = 3000  // ms bis alle Verbindungen erschienen sind

    const draw = (ts: number) => {
      if (!t0) t0 = ts
      const elapsed = ts - t0
      const W = canvas.width, H = canvas.height

      ctx.clearRect(0, 0, W, H)

      // Canvas-Koordinaten: Mewtwo füllt die rechte Seite
      // x-Koordinaten der Punkte gehen von ~0.48 bis ~0.96 → skalieren auf Vollbild
      // Wir lassen links ~30% leer (für Content), rechts ist Mewtwo
      const scaleX = W * 0.68   // Mewtwo-Breite
      const scaleY = H * 0.88   // Mewtwo-Höhe
      const offX   = W * 0.26   // Startpunkt X (lässt links Platz für Text)
      const offY   = H * 0.06   // Startpunkt Y

      const px = (x: number) => offX + x * scaleX
      const py = (y: number) => offY + y * scaleY

      // Hintergrund-Sterne
      bgStars.forEach(s => {
        s.x += s.vx; s.y += s.vy
        if(s.x<0)s.x=1; if(s.x>1)s.x=0
        if(s.y<0)s.y=1; if(s.y>1)s.y=0
        s.ph += 0.008
        const a = s.a*(0.4+Math.sin(s.ph)*0.6)*Math.min(elapsed/2000,1)
        ctx.beginPath(); ctx.arc(s.x*W, s.y*H, s.r, 0, Math.PI*2)
        ctx.fillStyle = `rgba(160,120,255,${a})`; ctx.fill()
      })

      // Wie viele Punkte sind bereits sichtbar?
      const pointsProg = Math.min(elapsed / DRAW_DUR, 1)
      const visibleCount = Math.floor(pointsProg * STARS.length)

      // Verbindungen zeichnen (erscheinen mit leichtem Delay)
      const connProg = Math.max(0, Math.min((elapsed - 500) / CONN_DUR, 1))
      const visibleConns = Math.floor(connProg * CONNECTIONS.length)

      for (let i = 0; i < visibleConns; i++) {
        const [a, b] = CONNECTIONS[i]
        if (a >= STARS.length || b >= STARS.length) continue
        if (a >= visibleCount || b >= visibleCount) continue

        const sa = STARS[a], sb = STARS[b]
        const x1 = px(sa.x), y1 = py(sa.y)
        const x2 = px(sb.x), y2 = py(sb.y)

        const rgbA = hexToRgb(sa.col)
        const rgbB = hexToRgb(sb.col)
        const grad = ctx.createLinearGradient(x1,y1,x2,y2)
        grad.addColorStop(0, `rgba(${rgbA.r},${rgbA.g},${rgbA.b},0.35)`)
        grad.addColorStop(1, `rgba(${rgbB.r},${rgbB.g},${rgbB.b},0.35)`)

        // Glow
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2)
        ctx.strokeStyle = `rgba(${rgbA.r},${rgbA.g},${rgbA.b},0.08)`
        ctx.lineWidth = 6; ctx.stroke()
        // Linie
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2)
        ctx.strokeStyle = grad; ctx.lineWidth = 0.8; ctx.stroke()
      }

      // Punkte zeichnen
      for (let i = 0; i < visibleCount; i++) {
        const s = STARS[i]
        const x = px(s.x), y = py(s.y)
        const pulse = Math.sin(ts*0.002 + s.ph) * 0.5 + 0.5
        const rgb = hexToRgb(s.col)

        // Erscheinungs-Progress für diesen Punkt
        const pointAge = Math.min((elapsed - (i/STARS.length)*DRAW_DUR*0.8) / 400, 1)
        if (pointAge <= 0) continue
        const alpha = Math.max(0, pointAge)

        // Äußerer Glow
        const grd = ctx.createRadialGradient(x,y,0,x,y,s.r*5+pulse*4)
        grd.addColorStop(0, `rgba(${rgb.r},${rgb.g},${rgb.b},${0.4*alpha})`)
        grd.addColorStop(1, `rgba(${rgb.r},${rgb.g},${rgb.b},0)`)
        ctx.beginPath(); ctx.arc(x,y,s.r*5+pulse*4,0,Math.PI*2)
        ctx.fillStyle = grd; ctx.fill()

        // Innerer Kern
        ctx.beginPath(); ctx.arc(x,y,s.r*(0.8+pulse*0.4),0,Math.PI*2)
        ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${0.9*alpha})`
        ctx.fill()

        // Weißer Highlight
        ctx.beginPath(); ctx.arc(x-s.r*0.3,y-s.r*0.3,s.r*0.35,0,Math.PI*2)
        ctx.fillStyle = `rgba(255,255,255,${0.6*alpha})`; ctx.fill()
      }

      // Spezial: Augen leuchten stärker wenn komplett gezeichnet
      if (pointsProg > 0.5) {
        const eyeA = Math.min((pointsProg-0.5)/0.3, 1)
        // Punkte 8 und 11 sind die Augen
        ;[STARS[8], STARS[11]].forEach(s => {
          const x = px(s.x), y = py(s.y)
          const p2 = Math.sin(ts*0.003)*0.5+0.5
          ;[20,10,5].forEach((r,i) => {
            const alphas = [0.07,0.2,0.9]
            const g = ctx.createRadialGradient(x,y,0,x,y,r+p2*(6-i*2))
            g.addColorStop(0,`rgba(0,240,255,${alphas[i]*eyeA})`)
            g.addColorStop(1,'rgba(0,240,255,0)')
            ctx.beginPath(); ctx.arc(x,y,r+p2*(6-i*2),0,Math.PI*2)
            ctx.fillStyle = g; ctx.fill()
          })
        })
      }

      // Schwanzspitze extra-Glühen (rot)
      if (pointsProg > 0.7) {
        const tailA = Math.min((pointsProg-0.7)/0.2, 1)
        ;[STARS[35],STARS[36],STARS[37],STARS[38]].forEach(s => {
          const x = px(s.x), y = py(s.y)
          const p2 = Math.sin(ts*0.004+s.ph)*0.5+0.5
          const g = ctx.createRadialGradient(x,y,0,x,y,12+p2*6)
          g.addColorStop(0,`rgba(248,113,113,${0.5*tailA})`)
          g.addColorStop(1,'rgba(248,113,113,0)')
          ctx.beginPath(); ctx.arc(x,y,12+p2*6,0,Math.PI*2)
          ctx.fillStyle = g; ctx.fill()
        })
      }

      // Abschluss-Aura wenn alles gezeichnet
      if (pointsProg > 0.9) {
        const aA = Math.min((pointsProg-0.9)/0.1,1)*0.08
        const cx = px(0.67), cy = py(0.4)
        const g = ctx.createRadialGradient(cx,cy,0,cx,cy,H*0.5)
        g.addColorStop(0, `rgba(140,60,255,${aA})`)
        g.addColorStop(0.5,`rgba(100,40,200,${aA*0.4})`)
        g.addColorStop(1,  'rgba(60,10,180,0)')
        ctx.beginPath(); ctx.arc(cx,cy,H*0.5,0,Math.PI*2)
        ctx.fillStyle = g; ctx.fill()
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener('resize',resize) }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width:  '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.6,
        mixBlendMode: 'screen',
      }}
    />
  )
}
