'use client'
import { useEffect, useRef, useState } from 'react'

interface Bolt {
  id:        number
  points:    [number, number][]
  opacity:   number
  width:     number
  color:     string
  life:      number
  maxLife:   number
  branches:  { points: [number,number][]; opacity: number }[]
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

const COLORS = [
  '#a78bfa', // violet
  '#818cf8', // indigo
  '#67e8f9', // cyan
  '#c084fc', // purple
  '#e879f9', // fuchsia
]

export default function LightningBackground() {
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const rafRef       = useRef<number>(0)
  const boltsRef     = useRef<Bolt[]>([])
  const nextIdRef    = useRef(0)
  const scrollYRef   = useRef(0)
  const lastScrollRef = useRef(0)
  const scrollVelRef  = useRef(0)

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

    // Track scroll velocity
    const onScroll = () => {
      const sy = window.scrollY
      scrollVelRef.current = Math.abs(sy - lastScrollRef.current)
      lastScrollRef.current = sy
      scrollYRef.current    = sy

      // Spawn bolts based on scroll speed
      const speed = scrollVelRef.current
      if (speed > 12) {
        const count = Math.min(Math.floor(speed / 40) + 1, 2)
        for (let i = 0; i < count; i++) {
          spawnBolt(canvas.width, canvas.height)
        }
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    // Auto-spawn ambient bolts
    let ambientTimer = 0
    const AMBIENT_INTERVAL = 6000

    const spawnBolt = (W: number, H: number) => {
      const color = COLORS[Math.floor(Math.random() * COLORS.length)]
      const fromTop = Math.random() > 0.4

      let x1: number, y1: number, x2: number, y2: number
      if (fromTop) {
        x1 = W * (0.2 + Math.random() * 0.6)
        y1 = 0
        x2 = x1 + (Math.random() - .5) * W * 0.3
        y2 = H * (0.3 + Math.random() * 0.5)
      } else {
        x1 = Math.random() > 0.5 ? 0 : W
        y1 = H * (0.1 + Math.random() * 0.6)
        x2 = W * (0.3 + Math.random() * 0.4)
        y2 = y1 + (Math.random() - .5) * H * 0.3
      }

      const pts = generateLightning(x1, y1, x2, y2, 2.8)

      // Branches
      const branches: Bolt['branches'] = []
      const branchCount = Math.floor(Math.random() * 3) + 1
      for (let b = 0; b < branchCount; b++) {
        const bIdx = Math.floor(Math.random() * (pts.length - 2)) + 1
        const [bx, by] = pts[bIdx]
        const angle = Math.random() * Math.PI * 2
        const len   = 40 + Math.random() * 80
        const bx2   = bx + Math.cos(angle) * len
        const by2   = by + Math.sin(angle) * len
        branches.push({
          points:  generateLightning(bx, by, bx2, by2, 2.0),
          opacity: 0.4 + Math.random() * 0.4,
        })
      }

      boltsRef.current.push({
        id:      nextIdRef.current++,
        points:  pts,
        opacity: 0.7 + Math.random() * 0.3,
        width:   0.8 + Math.random() * 1.2,
        color,
        life:    0,
        maxLife: 18 + Math.floor(Math.random() * 20),
        branches,
      })
    }

    const draw = (ts: number) => {
      const W = canvas.width, H = canvas.height
      ctx.clearRect(0, 0, W, H)

      // Ambient spawn
      if (ts - ambientTimer > AMBIENT_INTERVAL) {
        ambientTimer = ts
        spawnBolt(W, H)
      }

      // Draw + age bolts
      boltsRef.current = boltsRef.current.filter(bolt => {
        bolt.life++
        if (bolt.life > bolt.maxLife) return false

        const progress   = bolt.life / bolt.maxLife
        // Flicker: bright at start, fade at end
        const flicker    = progress < 0.15 ? 1 : progress < 0.3 ? 0.6 + Math.random()*0.4 : 1 - progress
        const alpha      = bolt.opacity * flicker

        if (alpha <= 0.01) return false

        const drawSegments = (pts: [number,number][], lineW: number, a: number) => {
          if (pts.length < 2) return
          // Glow layer
          ctx.beginPath()
          ctx.moveTo(pts[0][0], pts[0][1])
          pts.slice(1).forEach(([x,y]) => ctx.lineTo(x,y))
          ctx.strokeStyle = bolt.color.replace('#', 'rgba(') + `,${a * 0.15})`
          // parse hex properly
          const hex = bolt.color.replace('#','')
          const r   = parseInt(hex.slice(0,2),16)
          const g2  = parseInt(hex.slice(2,4),16)
          const b   = parseInt(hex.slice(4,6),16)
          ctx.strokeStyle = `rgba(${r},${g2},${b},${a * 0.12})`
          ctx.lineWidth   = lineW * 6
          ctx.lineCap     = 'round'
          ctx.lineJoin    = 'round'
          ctx.stroke()

          // Core glow
          ctx.beginPath()
          ctx.moveTo(pts[0][0], pts[0][1])
          pts.slice(1).forEach(([x,y]) => ctx.lineTo(x,y))
          ctx.strokeStyle = `rgba(${r},${g2},${b},${a * 0.45})`
          ctx.lineWidth   = lineW * 2.5
          ctx.stroke()

          // Bright core
          ctx.beginPath()
          ctx.moveTo(pts[0][0], pts[0][1])
          pts.slice(1).forEach(([x,y]) => ctx.lineTo(x,y))
          ctx.strokeStyle = `rgba(${r},${g2},${b},${a * 0.9})`
          ctx.lineWidth   = lineW
          ctx.stroke()

          // White hot center
          ctx.beginPath()
          ctx.moveTo(pts[0][0], pts[0][1])
          pts.slice(1).forEach(([x,y]) => ctx.lineTo(x,y))
          ctx.strokeStyle = `rgba(255,255,255,${a * 0.5})`
          ctx.lineWidth   = lineW * 0.3
          ctx.stroke()
        }

        drawSegments(bolt.points, bolt.width, alpha)
        bolt.branches.forEach(b => drawSegments(b.points, bolt.width * 0.5, alpha * b.opacity))

        // Spark at tip
        const tip = bolt.points[bolt.points.length - 1]
        if (bolt.life < 6) {
          const hex = bolt.color.replace('#','')
          const r   = parseInt(hex.slice(0,2),16)
          const g2  = parseInt(hex.slice(2,4),16)
          const b2  = parseInt(hex.slice(4,6),16)
          const sg  = ctx.createRadialGradient(tip[0],tip[1],0,tip[0],tip[1],12+Math.random()*8)
          sg.addColorStop(0, `rgba(255,255,255,${alpha*0.9})`)
          sg.addColorStop(0.3, `rgba(${r},${g2},${b2},${alpha*0.6})`)
          sg.addColorStop(1,   `rgba(${r},${g2},${b2},0)`)
          ctx.beginPath(); ctx.arc(tip[0],tip[1],12+Math.random()*8,0,Math.PI*2)
          ctx.fillStyle = sg; ctx.fill()
        }

        return true
      })

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize',   resize)
      window.removeEventListener('scroll',   onScroll)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position:      'fixed',
        top:           0,
        left:          0,
        width:         '100vw',
        height:        '100vh',
        pointerEvents: 'none',
        zIndex:        0,
        opacity:       0.65,
        mixBlendMode:  'screen',
      }}
    />
  )
}
