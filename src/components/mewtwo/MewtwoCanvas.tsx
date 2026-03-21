'use client'
import { useEffect, useRef } from 'react'

// Mewtwo sitting pose paths – each path is a list of [x,y] points normalized 0–1
// The silhouette faces LEFT (matching the reference image)
const PATHS = [
  // Head
  { pts:[[.52,.06],[.48,.07],[.44,.09],[.41,.12],[.39,.15],[.38,.19],[.39,.22],[.41,.24],[.44,.26],[.48,.27],[.52,.27],[.56,.25],[.58,.22],[.59,.18],[.58,.14],[.55,.10],[.52,.07]], col:'rgba(185,140,255,{a})', w:1.4 },
  // Left horn
  { pts:[[.44,.09],[.41,.05],[.37,.01],[.35,-.01],[.37,.04],[.40,.08]], col:'rgba(210,80,130,{a})', w:1.1 },
  // Right horn
  { pts:[[.55,.09],[.58,.05],[.62,.01],[.64,-.01],[.61,.04],[.57,.08]], col:'rgba(210,80,130,{a})', w:1.1 },
  // Neck
  { pts:[[.46,.27],[.45,.31],[.45,.34],[.47,.36],[.53,.36],[.55,.34],[.55,.31],[.54,.27]], col:'rgba(165,115,235,{a})', w:1.2 },
  // Upper body / chest
  { pts:[[.42,.36],[.37,.38],[.33,.41],[.31,.45],[.31,.50],[.33,.54],[.37,.57],[.41,.59],[.46,.60],[.51,.60],[.56,.59],[.60,.57],[.63,.54],[.65,.50],[.64,.45],[.62,.41],[.58,.38],[.53,.36]], col:'rgba(155,105,235,{a})', w:1.4 },
  // Left arm (reaching forward)
  { pts:[[.37,.39],[.31,.40],[.26,.43],[.23,.47],[.23,.52],[.26,.55],[.30,.55],[.33,.53],[.35,.49],[.34,.44]], col:'rgba(145,95,220,{a})', w:1.2 },
  // Left fingers
  { pts:[[.25,.54],[.21,.57],[.19,.61]], col:'rgba(220,100,80,{a})', w:0.9 },
  { pts:[[.25,.54],[.22,.58],[.21,.63]], col:'rgba(220,100,80,{a})', w:0.9 },
  { pts:[[.25,.54],[.24,.59],[.24,.64]], col:'rgba(220,100,80,{a})', w:0.9 },
  // Right arm
  { pts:[[.59,.38],[.64,.40],[.68,.43],[.70,.47],[.69,.52],[.66,.55],[.62,.55],[.59,.52],[.58,.48]], col:'rgba(145,95,220,{a})', w:1.2 },
  // Lower body / hip (sitting)
  { pts:[[.34,.60],[.30,.64],[.28,.69],[.28,.74],[.30,.78],[.35,.81],[.40,.82],[.47,.83],[.53,.83],[.60,.82],[.65,.80],[.68,.76],[.68,.71],[.66,.66],[.62,.62],[.57,.60]], col:'rgba(135,85,215,{a})', w:1.5 },
  // Left leg bent
  { pts:[[.32,.79],[.28,.84],[.25,.89],[.24,.94],[.26,.98],[.30,1.0],[.35,1.0],[.40,.98],[.43,.94],[.43,.89],[.41,.84],[.37,.81]], col:'rgba(125,75,205,{a})', w:1.3 },
  // Right leg bent
  { pts:[[.64,.79],[.68,.84],[.71,.89],[.71,.95],[.69,.99],[.65,1.0],[.60,.99],[.56,.96],[.55,.91],[.56,.86],[.60,.82]], col:'rgba(125,75,205,{a})', w:1.3 },
  // Tail base
  { pts:[[.63,.61],[.68,.58],[.73,.55],[.77,.51],[.80,.47],[.82,.42],[.83,.37],[.82,.31],[.79,.27]], col:'rgba(210,70,100,{a})', w:1.4 },
  // Tail mid
  { pts:[[.79,.27],[.80,.22],[.82,.17],[.84,.12],[.84,.07],[.82,.03],[.79,.02],[.76,.03]], col:'rgba(220,80,110,{a})', w:1.3 },
  // Tail fin
  { pts:[[.76,.03],[.71,.05],[.68,.09],[.66,.14],[.67,.20],[.70,.24],[.74,.25],[.78,.23],[.81,.18],[.82,.12],[.80,.07],[.77,.03]], col:'rgba(215,65,95,{a})', w:1.2 },
  // Tail fin inner detail
  { pts:[[.71,.06],[.73,.11],[.74,.16],[.72,.21],[.70,.23]], col:'rgba(255,130,150,{a})', w:0.8 },
  // Spine
  { pts:[[.57,.27],[.60,.32],[.62,.37],[.63,.43],[.63,.50],[.62,.56],[.61,.61]], col:'rgba(115,80,200,{a})', w:1.0 },
  // Chest orb
  { pts:[[.49,.46],[.50,.44],[.52,.44],[.54,.46],[.54,.49],[.52,.51],[.49,.51],[.48,.48],[.49,.46]], col:'rgba(255,200,255,{a})', w:1.1 },
  // Aura wisps
  { pts:[[.27,.44],[.22,.42],[.19,.44],[.20,.48]], col:'rgba(190,100,255,{a})', w:0.7 },
  { pts:[[.26,.51],[.20,.50],[.17,.54],[.19,.58]], col:'rgba(190,100,255,{a})', w:0.7 },
  { pts:[[.69,.42],[.74,.40],[.77,.43]],           col:'rgba(190,100,255,{a})', w:0.7 },
]

const DRAW_DURATION = 5500 // ms to fully draw Mewtwo

export default function MewtwoCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef    = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    const resize = () => {
      canvas.width  = canvas.offsetWidth  * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    resize()
    window.addEventListener('resize', resize)

    // Collect all path points for star network
    const allPts: number[][] = []
    PATHS.forEach(p => p.pts.forEach(pt => allPts.push(pt)))

    // Build proximity connections
    const RADIUS = 0.07
    const conns: [number, number, number][] = []
    for (let i = 0; i < allPts.length; i++)
      for (let j = i + 1; j < allPts.length; j++) {
        const dx = allPts[i][0] - allPts[j][0]
        const dy = allPts[i][1] - allPts[j][1]
        const d  = Math.sqrt(dx*dx + dy*dy)
        if (d < RADIUS && d > 0.004) conns.push([i, j, d])
      }

    // Drifting background stars
    const stars = Array.from({ length: 150 }, () => ({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 1.3 + 0.2,
      a: Math.random() * 0.45 + 0.05,
      vx: (Math.random() - .5) * 0.00012,
      vy: (Math.random() - .5) * 0.00012,
      ph: Math.random() * Math.PI * 2,
    }))

    let t0: number | null = null

    const draw = (ts: number) => {
      if (!t0) t0 = ts
      const prog = Math.min((ts - t0) / DRAW_DURATION, 1)
      const W = canvas.offsetWidth, H = canvas.offsetHeight

      // Mewtwo takes right 55% of canvas, full height
      const SX = H * 0.58, SY = H * 0.92
      const OX = W * 0.30, OY = H * 0.03
      const px = (x: number) => OX + x * SX
      const py = (y: number) => OY + y * SY

      ctx.clearRect(0, 0, W, H)

      // ── BACKGROUND STARS
      stars.forEach(s => {
        s.x += s.vx; s.y += s.vy
        if (s.x < 0) s.x = 1; if (s.x > 1) s.x = 0
        if (s.y < 0) s.y = 1; if (s.y > 1) s.y = 0
        s.ph += 0.012
        const a = s.a * (0.5 + Math.sin(s.ph) * 0.5) * Math.min(prog * 4, 1)
        ctx.beginPath()
        ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(150,110,255,${a})`
        ctx.fill()
      })

      // ── STAR NETWORK CONNECTIONS
      const netA = Math.max(0, Math.min((prog - 0.1) / 0.5, 1))
      if (netA > 0) {
        conns.forEach(([i, j, d]) => {
          const a = (1 - d / RADIUS) * 0.14 * netA
          ctx.beginPath()
          ctx.moveTo(px(allPts[i][0]), py(allPts[i][1]))
          ctx.lineTo(px(allPts[j][0]), py(allPts[j][1]))
          ctx.strokeStyle = `rgba(130,90,255,${a})`
          ctx.lineWidth   = 0.4
          ctx.stroke()
        })
      }

      // ── DRAW PATHS PROGRESSIVELY
      let totalSegs = 0
      PATHS.forEach(p => { totalSegs += p.pts.length - 1 })
      const segsToShow = prog * totalSegs
      let shown = 0

      PATHS.forEach(path => {
        for (let s = 0; s < path.pts.length - 1; s++) {
          if (shown >= segsToShow) break
          shown++
          const x1 = px(path.pts[s][0]),   y1 = py(path.pts[s][1])
          const x2 = px(path.pts[s+1][0]), y2 = py(path.pts[s+1][1])

          // Partial last segment
          let ex = x2, ey = y2
          if (shown === Math.floor(segsToShow) + 1 && shown <= segsToShow + 1) {
            const t = segsToShow - Math.floor(segsToShow)
            ex = x1 + (x2 - x1) * t
            ey = y1 + (y2 - y1) * t
          }

          const c = path.col
          // Outer glow layer
          ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(ex,ey)
          ctx.strokeStyle = c.replace('{a}', '0.18'); ctx.lineWidth = (path.w + 3) * 2; ctx.lineCap = 'round'; ctx.stroke()
          // Mid glow
          ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(ex,ey)
          ctx.strokeStyle = c.replace('{a}', '0.4');  ctx.lineWidth = path.w + 2; ctx.stroke()
          // Core line
          ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(ex,ey)
          ctx.strokeStyle = c.replace('{a}', '0.85'); ctx.lineWidth = path.w; ctx.stroke()
        }
      })

      // ── NODE DOTS
      let dc = 0
      PATHS.forEach(path => {
        path.pts.forEach(pt => {
          dc++
          if (dc > segsToShow + 1) return
          const x = px(pt[0]), y = py(pt[1])
          const pulse = Math.sin(ts * 0.002 + dc * 0.8) * 0.5 + 0.5

          const g = ctx.createRadialGradient(x, y, 0, x, y, 8)
          g.addColorStop(0, `rgba(210,170,255,${0.55 * Math.min(prog * 2, 1)})`)
          g.addColorStop(1, 'rgba(210,170,255,0)')
          ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill()
          ctx.beginPath(); ctx.arc(x, y, 1.5 + pulse * 1.0, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(235,215,255,${0.9 * Math.min(prog * 2, 1)})`; ctx.fill()
        })
      })

      // ── EYES (cyan glow)
      if (prog > 0.35) {
        const eyeA = Math.min((prog - 0.35) / 0.3, 1)
        ;[[.43, .22], [.55, .22]].forEach(([ex, ey]) => {
          const x = px(ex), y = py(ey)
          const p2 = Math.sin(ts * 0.003) * 0.5 + 0.5
          ;[14, 7, 3].forEach((r, i) => {
            const alphas = [0.07, 0.18, 0.8]
            const g = ctx.createRadialGradient(x, y, 0, x, y, r + p2 * (5 - i))
            g.addColorStop(0, `rgba(0,220,255,${alphas[i] * eyeA})`)
            g.addColorStop(1, 'rgba(0,220,255,0)')
            ctx.beginPath(); ctx.arc(x, y, r + p2 * (5 - i), 0, Math.PI * 2)
            ctx.fillStyle = g; ctx.fill()
          })
        })
      }

      // ── CHEST ORB (magenta pulse)
      if (prog > 0.55) {
        const orbA = Math.min((prog - 0.55) / 0.3, 1)
        const x = px(.51), y = py(.47)
        const p2 = Math.sin(ts * 0.004) * 0.5 + 0.5
        const g = ctx.createRadialGradient(x, y, 0, x, y, 16 + p2 * 7)
        g.addColorStop(0, `rgba(255,160,255,${0.8 * orbA})`)
        g.addColorStop(0.5, `rgba(200,100,255,${0.35 * orbA})`)
        g.addColorStop(1, 'rgba(200,100,255,0)')
        ctx.beginPath(); ctx.arc(x, y, 16 + p2 * 7, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill()
      }

      // ── PSYCHIC AURA (completion)
      if (prog > 0.87) {
        const aA = Math.min((prog - 0.87) / 0.13, 1) * 0.1
        const cx = px(.50), cy = py(.47)
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, H * 0.52)
        g.addColorStop(0,   `rgba(140,60,255,${aA})`)
        g.addColorStop(0.5, `rgba(100,40,200,${aA * 0.4})`)
        g.addColorStop(1,   'rgba(80,20,180,0)')
        ctx.beginPath(); ctx.arc(cx, cy, H * 0.52, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill()
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="mewtwo-canvas"
      aria-hidden="true"
    />
  )
}
