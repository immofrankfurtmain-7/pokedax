'use client'
import { useEffect, useRef } from 'react'

const PATHS = [
  {pts:[[.52,.06],[.48,.07],[.44,.09],[.41,.12],[.39,.15],[.38,.19],[.39,.22],[.41,.24],[.44,.26],[.48,.27],[.52,.27],[.56,.25],[.58,.22],[.59,.18],[.58,.14],[.55,.10],[.52,.07]],col:'rgba(185,140,255,{a})',w:1.8},
  {pts:[[.44,.09],[.41,.05],[.37,.01],[.35,-.01],[.37,.04],[.40,.08]],col:'rgba(220,90,140,{a})',w:1.4},
  {pts:[[.55,.09],[.58,.05],[.62,.01],[.64,-.01],[.61,.04],[.57,.08]],col:'rgba(220,90,140,{a})',w:1.4},
  {pts:[[.46,.27],[.45,.31],[.45,.34],[.47,.36],[.53,.36],[.55,.34],[.55,.31],[.54,.27]],col:'rgba(170,120,240,{a})',w:1.5},
  {pts:[[.42,.36],[.37,.38],[.33,.41],[.31,.45],[.31,.50],[.33,.54],[.37,.57],[.41,.59],[.46,.60],[.51,.60],[.56,.59],[.60,.57],[.63,.54],[.65,.50],[.64,.45],[.62,.41],[.58,.38],[.53,.36]],col:'rgba(160,110,240,{a})',w:1.8},
  {pts:[[.37,.39],[.31,.40],[.26,.43],[.23,.47],[.23,.52],[.26,.55],[.30,.55],[.33,.53],[.35,.49],[.34,.44]],col:'rgba(150,100,225,{a})',w:1.5},
  {pts:[[.25,.54],[.21,.57],[.19,.61]],col:'rgba(230,110,90,{a})',w:1.2},
  {pts:[[.25,.54],[.22,.58],[.21,.63]],col:'rgba(230,110,90,{a})',w:1.2},
  {pts:[[.25,.54],[.24,.59],[.24,.64]],col:'rgba(230,110,90,{a})',w:1.2},
  {pts:[[.59,.38],[.64,.40],[.68,.43],[.70,.47],[.69,.52],[.66,.55],[.62,.55],[.59,.52],[.58,.48]],col:'rgba(150,100,225,{a})',w:1.5},
  {pts:[[.34,.60],[.30,.64],[.28,.69],[.28,.74],[.30,.78],[.35,.81],[.40,.82],[.47,.83],[.53,.83],[.60,.82],[.65,.80],[.68,.76],[.68,.71],[.66,.66],[.62,.62],[.57,.60]],col:'rgba(140,90,220,{a})',w:2.0},
  {pts:[[.32,.79],[.28,.84],[.25,.89],[.24,.94],[.26,.98],[.30,1.0],[.35,1.0],[.40,.98],[.43,.94],[.43,.89],[.41,.84],[.37,.81]],col:'rgba(130,80,210,{a})',w:1.7},
  {pts:[[.64,.79],[.68,.84],[.71,.89],[.71,.95],[.69,.99],[.65,1.0],[.60,.99],[.56,.96],[.55,.91],[.56,.86],[.60,.82]],col:'rgba(130,80,210,{a})',w:1.7},
  {pts:[[.63,.61],[.68,.58],[.73,.55],[.77,.51],[.80,.47],[.82,.42],[.83,.37],[.82,.31],[.79,.27]],col:'rgba(220,75,105,{a})',w:1.8},
  {pts:[[.79,.27],[.80,.22],[.82,.17],[.84,.12],[.84,.07],[.82,.03],[.79,.02],[.76,.03]],col:'rgba(230,85,115,{a})',w:1.7},
  {pts:[[.76,.03],[.71,.05],[.68,.09],[.66,.14],[.67,.20],[.70,.24],[.74,.25],[.78,.23],[.81,.18],[.82,.12],[.80,.07],[.77,.03]],col:'rgba(220,70,100,{a})',w:1.6},
  {pts:[[.71,.06],[.73,.11],[.74,.16],[.72,.21],[.70,.23]],col:'rgba(255,140,160,{a})',w:1.0},
  {pts:[[.57,.27],[.60,.32],[.62,.37],[.63,.43],[.63,.50],[.62,.56],[.61,.61]],col:'rgba(120,85,205,{a})',w:1.3},
  {pts:[[.49,.46],[.50,.44],[.52,.44],[.54,.46],[.54,.49],[.52,.51],[.49,.51],[.48,.48],[.49,.46]],col:'rgba(255,210,255,{a})',w:1.4},
  {pts:[[.27,.44],[.22,.42],[.19,.44],[.20,.48]],col:'rgba(200,110,255,{a})',w:1.0},
  {pts:[[.26,.51],[.20,.50],[.17,.54],[.19,.58]],col:'rgba(200,110,255,{a})',w:1.0},
  {pts:[[.69,.42],[.74,.40],[.77,.43]],col:'rgba(200,110,255,{a})',w:1.0},
]

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

    const allPts: number[][] = []
    PATHS.forEach(p => p.pts.forEach(pt => allPts.push(pt)))

    const RADIUS = 0.065
    const conns: [number,number,number][] = []
    for (let i = 0; i < allPts.length; i++)
      for (let j = i+1; j < allPts.length; j++) {
        const dx = allPts[i][0]-allPts[j][0], dy = allPts[i][1]-allPts[j][1]
        const d = Math.sqrt(dx*dx+dy*dy)
        if (d < RADIUS && d > 0.003) conns.push([i,j,d])
      }

    const stars = Array.from({length:180}, () => ({
      x:Math.random(), y:Math.random(),
      r:Math.random()*1.6+0.3,
      a:Math.random()*0.5+0.08,
      vx:(Math.random()-.5)*0.0001,
      vy:(Math.random()-.5)*0.0001,
      ph:Math.random()*Math.PI*2,
    }))

    let t0: number|null = null
    const DUR = 6000

    const draw = (ts: number) => {
      if (!t0) t0 = ts
      const prog = Math.min((ts-t0)/DUR, 1)
      const W = canvas.width, H = canvas.height

      // Scale to fill full height, positioned on right side
      const SY = H * 0.90
      const SX = SY * 0.65
      const OX = W * 0.28
      const OY = H * 0.05

      const px = (x: number) => OX + x * SX
      const py = (y: number) => OY + y * SY

      ctx.clearRect(0, 0, W, H)

      // Background stars
      stars.forEach(s => {
        s.x+=s.vx; s.y+=s.vy
        if(s.x<0)s.x=1; if(s.x>1)s.x=0
        if(s.y<0)s.y=1; if(s.y>1)s.y=0
        s.ph+=0.01
        const a = s.a*(0.4+Math.sin(s.ph)*0.6)*Math.min(prog*3,1)
        ctx.beginPath(); ctx.arc(s.x*W, s.y*H, s.r, 0, Math.PI*2)
        ctx.fillStyle = `rgba(160,120,255,${a})`; ctx.fill()
      })

      // Star network
      const netA = Math.max(0,Math.min((prog-0.08)/0.45,1))
      if(netA > 0) conns.forEach(([i,j,d]) => {
        const a = (1-d/RADIUS)*0.18*netA
        ctx.beginPath()
        ctx.moveTo(px(allPts[i][0]),py(allPts[i][1]))
        ctx.lineTo(px(allPts[j][0]),py(allPts[j][1]))
        ctx.strokeStyle = `rgba(140,100,255,${a})`
        ctx.lineWidth = 0.5; ctx.stroke()
      })

      // Draw paths
      let totalSegs = 0
      PATHS.forEach(p => { totalSegs += p.pts.length-1 })
      const segsToShow = prog * totalSegs
      let shown = 0

      PATHS.forEach(path => {
        for(let s=0; s<path.pts.length-1; s++) {
          if(shown >= segsToShow) break
          shown++
          const x1=px(path.pts[s][0]),   y1=py(path.pts[s][1])
          const x2=px(path.pts[s+1][0]), y2=py(path.pts[s+1][1])
          let ex=x2, ey=y2
          if(shown===Math.floor(segsToShow)+1) {
            const t=segsToShow-Math.floor(segsToShow)
            ex=x1+(x2-x1)*t; ey=y1+(y2-y1)*t
          }
          const c = path.col
          // Wide outer glow
          ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(ex,ey)
          ctx.strokeStyle=c.replace('{a}','0.12'); ctx.lineWidth=(path.w+5)*2.5; ctx.lineCap='round'; ctx.stroke()
          // Mid glow
          ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(ex,ey)
          ctx.strokeStyle=c.replace('{a}','0.35'); ctx.lineWidth=path.w+3; ctx.stroke()
          // Core
          ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(ex,ey)
          ctx.strokeStyle=c.replace('{a}','0.9'); ctx.lineWidth=path.w; ctx.stroke()
        }
      })

      // Dots
      let dc=0
      PATHS.forEach(path => path.pts.forEach(pt => {
        dc++
        if(dc > segsToShow+1) return
        const x=px(pt[0]), y=py(pt[1])
        const pulse=Math.sin(ts*0.0025+dc*0.9)*0.5+0.5
        const a=Math.min(prog*2.5,1)

        const g=ctx.createRadialGradient(x,y,0,x,y,9+pulse*3)
        g.addColorStop(0,`rgba(220,180,255,${0.6*a})`)
        g.addColorStop(1,'rgba(220,180,255,0)')
        ctx.beginPath(); ctx.arc(x,y,9+pulse*3,0,Math.PI*2); ctx.fillStyle=g; ctx.fill()

        ctx.beginPath(); ctx.arc(x,y,2+pulse*1.2,0,Math.PI*2)
        ctx.fillStyle=`rgba(240,220,255,${0.95*a})`; ctx.fill()
      }))

      // Eyes – intense cyan
      if(prog > 0.3) {
        const eyeA=Math.min((prog-0.3)/0.25,1)
        ;[[.43,.22],[.55,.22]].forEach(([ex,ey]) => {
          const x=px(ex), y=py(ey)
          const p2=Math.sin(ts*0.003)*0.5+0.5
          ;[18,10,5,2.5].forEach((r,i) => {
            const alphas=[0.06,0.15,0.5,1.0]
            const colors=['rgba(0,240,255,','rgba(0,220,255,','rgba(100,230,255,','rgba(200,245,255,']
            const g=ctx.createRadialGradient(x,y,0,x,y,r+p2*(5-i))
            g.addColorStop(0,`${colors[i]}${alphas[i]*eyeA})`)
            g.addColorStop(1,`${colors[i]}0)`)
            ctx.beginPath(); ctx.arc(x,y,r+p2*(5-i),0,Math.PI*2); ctx.fillStyle=g; ctx.fill()
          })
        })
      }

      // Chest orb
      if(prog > 0.5) {
        const orbA=Math.min((prog-0.5)/0.3,1)
        const x=px(.51), y=py(.47)
        const p2=Math.sin(ts*0.004)*0.5+0.5
        ;[20,12,6].forEach((r,i) => {
          const alphas=[0.08,0.25,0.8]
          const g=ctx.createRadialGradient(x,y,0,x,y,r+p2*(6-i*2))
          g.addColorStop(0,`rgba(255,170,255,${alphas[i]*orbA})`)
          g.addColorStop(1,'rgba(200,100,255,0)')
          ctx.beginPath(); ctx.arc(x,y,r+p2*(6-i*2),0,Math.PI*2); ctx.fillStyle=g; ctx.fill()
        })
      }

      // Full aura at completion
      if(prog > 0.82) {
        const aA=Math.min((prog-0.82)/0.18,1)
        const cx=px(.50), cy=py(.47)
        const pulse=Math.sin(ts*0.002)*0.5+0.5
        const g=ctx.createRadialGradient(cx,cy,0,cx,cy,H*0.55)
        g.addColorStop(0,`rgba(160,70,255,${(0.12+pulse*0.06)*aA})`)
        g.addColorStop(0.4,`rgba(100,40,220,${0.06*aA})`)
        g.addColorStop(1,'rgba(60,10,180,0)')
        ctx.beginPath(); ctx.arc(cx,cy,H*0.55,0,Math.PI*2); ctx.fillStyle=g; ctx.fill()
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
        position:'fixed',
        top:0, left:0,
        width:'100vw',
        height:'100vh',
        pointerEvents:'none',
        zIndex:0,
        opacity:0.55,
        mixBlendMode:'screen',
      }}
    />
  )
}
