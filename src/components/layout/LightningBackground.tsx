'use client'
import { useEffect, useRef } from 'react'

interface Bolt {
  id:       number
  points:   [number, number][]
  opacity:  number
  width:    number
  color:    string
  life:     number
  maxLife:  number
  branches: { points: [number,number][]; opacity: number }[]
}

function generateLightning(
  x1: number, y1: number,
  x2: number, y2: number,
  roughness = 2.5,
  depth = 0
): [number, number][] {
  if (depth > 6) return [[x1,y1],[x2,y2]]
  const mx = (x1+x2)/2 + (Math.random()-.5) * roughness * Math.abs(x2-x1+y2-y1) * 0.5
  const my = (y1+y2)/2 + (Math.random()-.5) * roughness * Math.abs(x2-x1+y2-y1) * 0.15
  return [
    ...generateLightning(x1,y1,mx,my,roughness*0.6,depth+1),
    ...generateLightning(mx,my,x2,y2,roughness*0.6,depth+1).slice(1),
  ]
}

const COLORS = ['#a78bfa','#818cf8','#67e8f9','#c084fc','#e879f9']

export default function LightningBackground() {
  const canvasRef     = useRef<HTMLCanvasElement>(null)
  const rafRef        = useRef<number>(0)
  const boltsRef      = useRef<Bolt[]>([])
  const nextIdRef     = useRef(0)
  const lastScrollRef = useRef(0)
  const scrollCoolRef = useRef(0)  // cooldown between scroll-bolts

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)

    const spawnBolt = (W: number, H: number) => {
      // Max 3 bolts at once
      if (boltsRef.current.length >= 3) return

      const color    = COLORS[Math.floor(Math.random() * COLORS.length)]
      const fromTop  = Math.random() > 0.35
      let x1: number, y1: number, x2: number, y2: number

      if (fromTop) {
        x1 = W * (0.15 + Math.random() * 0.7)
        y1 = 0
        x2 = x1 + (Math.random() - .5) * W * 0.25
        y2 = H * (0.25 + Math.random() * 0.5)
      } else {
        x1 = Math.random() > 0.5 ? 0 : W
        y1 = H * (0.1 + Math.random() * 0.6)
        x2 = W * (0.3 + Math.random() * 0.4)
        y2 = y1 + (Math.random() - .5) * H * 0.25
      }

      const pts = generateLightning(x1, y1, x2, y2, 2.8)
      const branches: Bolt['branches'] = []
      const bc = Math.floor(Math.random() * 2) + 1
      for (let b = 0; b < bc; b++) {
        const bIdx = Math.floor(Math.random() * (pts.length - 2)) + 1
        const [bx, by] = pts[bIdx]
        const angle = Math.random() * Math.PI * 2
        const len   = 30 + Math.random() * 60
        branches.push({
          points:  generateLightning(bx, by, bx + Math.cos(angle)*len, by + Math.sin(angle)*len, 2.0),
          opacity: 0.3 + Math.random() * 0.4,
        })
      }

      boltsRef.current.push({
        id: nextIdRef.current++,
        points: pts, color,
        opacity: 0.65 + Math.random() * 0.3,
        width:   0.8 + Math.random() * 1.0,
        life: 0, maxLife: 16 + Math.floor(Math.random() * 18),
        branches,
      })
    }

    // Scroll handler – very throttled
    const onScroll = () => {
      const sy  = window.scrollY
      const vel = Math.abs(sy - lastScrollRef.current)
      lastScrollRef.current = sy

      const now = Date.now()
      if (vel > 25 && now - scrollCoolRef.current > 1200) {
        scrollCoolRef.current = now
        spawnBolt(canvas.width, canvas.height)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    // Ambient – one bolt every 8 seconds
    let lastAmbient = 0

    const draw = (ts: number) => {
      const W = canvas.width, H = canvas.height
      ctx.clearRect(0, 0, W, H)

      // Ambient spawn
      if (ts - lastAmbient > 8000) {
        lastAmbient = ts
        spawnBolt(W, H)
      }

      boltsRef.current = boltsRef.current.filter(bolt => {
        bolt.life++
        if (bolt.life > bolt.maxLife) return false

        const progress = bolt.life / bolt.maxLife
        const flicker  = progress < 0.15 ? 1 : progress < 0.3 ? 0.5 + Math.random() * 0.5 : 1 - progress
        const alpha    = bolt.opacity * flicker
        if (alpha <= 0.02) return false

        const hex = bolt.color.replace('#','')
        const r   = parseInt(hex.slice(0,2),16)
        const g   = parseInt(hex.slice(2,4),16)
        const b   = parseInt(hex.slice(4,6),16)

        const drawSegs = (pts: [number,number][], lw: number, a: number) => {
          if (pts.length < 2) return
          // Outer glow
          ctx.beginPath(); ctx.moveTo(pts[0][0],pts[0][1])
          pts.slice(1).forEach(([x,y]) => ctx.lineTo(x,y))
          ctx.strokeStyle = `rgba(${r},${g},${b},${a*0.10})`
          ctx.lineWidth = lw * 7; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke()
          // Core glow
          ctx.beginPath(); ctx.moveTo(pts[0][0],pts[0][1])
          pts.slice(1).forEach(([x,y]) => ctx.lineTo(x,y))
          ctx.strokeStyle = `rgba(${r},${g},${b},${a*0.42})`
          ctx.lineWidth = lw * 2.5; ctx.stroke()
          // Bright core
          ctx.beginPath(); ctx.moveTo(pts[0][0],pts[0][1])
          pts.slice(1).forEach(([x,y]) => ctx.lineTo(x,y))
          ctx.strokeStyle = `rgba(${r},${g},${b},${a*0.88})`
          ctx.lineWidth = lw; ctx.stroke()
          // White center
          ctx.beginPath(); ctx.moveTo(pts[0][0],pts[0][1])
          pts.slice(1).forEach(([x,y]) => ctx.lineTo(x,y))
          ctx.strokeStyle = `rgba(255,255,255,${a*0.45})`
          ctx.lineWidth = lw * 0.3; ctx.stroke()
        }

        drawSegs(bolt.points, bolt.width, alpha)
        bolt.branches.forEach(br => drawSegs(br.points, bolt.width * 0.45, alpha * br.opacity))

        // Tip spark
        if (bolt.life < 5) {
          const tip = bolt.points[bolt.points.length - 1]
          const sg  = ctx.createRadialGradient(tip[0],tip[1],0,tip[0],tip[1],14)
          sg.addColorStop(0, `rgba(255,255,255,${alpha*0.85})`)
          sg.addColorStop(0.4, `rgba(${r},${g},${b},${alpha*0.55})`)
          sg.addColorStop(1, `rgba(${r},${g},${b},0)`)
          ctx.beginPath(); ctx.arc(tip[0],tip[1],14,0,Math.PI*2)
          ctx.fillStyle = sg; ctx.fill()
        }

        return true
      })

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position:      'fixed',
        top: 0, left:  0,
        width:         '100vw',
        height:        '100vh',
        pointerEvents: 'none',
        zIndex:        0,
        opacity:       0.6,
        mixBlendMode:  'screen',
      }}
    />
  )
}
