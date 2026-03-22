'use client'
import { useEffect, useRef } from 'react'

// Mewtwo Silhouette – sitzende Pose, schaut nach links
// Koordinaten normalisiert 0-1, basierend auf Referenzbild
// Mewtwo füllt die rechte Bildschirmhälfte
const PATHS = [
  // ── KOPF (Außenkontur, gegen Uhrzeigersinn) ──────────────────────────────
  {
    col: '#c084fc', glowCol: 'rgba(192,132,252,', w: 1.2, glow: 6,
    pts: [
      [.640,.095],[.628,.082],[.618,.072],[.612,.062],[.608,.055],
      [.608,.048],[.612,.042],[.618,.040],[.625,.042],[.632,.048],
      [.638,.058],[.645,.068],[.652,.075],[.660,.080],[.668,.082],
      [.675,.082],[.682,.080],[.688,.075],[.692,.068],[.695,.060],
      [.695,.052],[.692,.045],[.688,.040],[.682,.038],[.675,.038],
      [.668,.040],[.662,.045],[.658,.052],[.655,.060],[.652,.070],
    ]
  },
  // ── LINKES OHR ────────────────────────────────────────────────────────────
  {
    col: '#a78bfa', glowCol: 'rgba(167,139,250,', w: 1.0, glow: 5,
    pts: [
      [.625,.060],[.618,.048],[.612,.038],[.608,.028],[.605,.018],
      [.608,.012],[.615,.010],[.620,.015],[.622,.025],[.622,.038],
    ]
  },
  // ── RECHTES OHR ───────────────────────────────────────────────────────────
  {
    col: '#a78bfa', glowCol: 'rgba(167,139,250,', w: 1.0, glow: 5,
    pts: [
      [.678,.058],[.682,.048],[.688,.035],[.692,.022],[.695,.012],
      [.698,.008],[.705,.010],[.708,.018],[.705,.028],[.700,.038],
      [.695,.050],
    ]
  },
  // ── AUGEN (leuchten cyan) ─────────────────────────────────────────────────
  {
    col: '#67e8f9', glowCol: 'rgba(103,232,249,', w: 1.5, glow: 8,
    pts: [
      [.638,.155],[.642,.150],[.648,.148],[.655,.150],[.658,.155],
      [.655,.162],[.648,.165],[.641,.162],[.638,.155],
    ]
  },
  {
    col: '#67e8f9', glowCol: 'rgba(103,232,249,', w: 1.5, glow: 8,
    pts: [
      [.668,.152],[.672,.148],[.678,.146],[.685,.148],[.688,.152],
      [.685,.158],[.678,.162],[.671,.158],[.668,.152],
    ]
  },
  // ── HALS / NACKEN ─────────────────────────────────────────────────────────
  {
    col: '#a78bfa', glowCol: 'rgba(167,139,250,', w: 1.2, glow: 5,
    pts: [
      [.638,.095],[.635,.108],[.635,.122],[.638,.132],[.645,.138],
      [.655,.140],[.665,.140],[.672,.138],[.678,.132],[.680,.122],
      [.680,.108],[.678,.095],
    ]
  },
  // ── OBERKÖRPER / BRUST ────────────────────────────────────────────────────
  {
    col: '#c084fc', glowCol: 'rgba(192,132,252,', w: 1.4, glow: 7,
    pts: [
      [.635,.140],[.625,.148],[.618,.158],[.615,.170],[.615,.185],
      [.618,.200],[.622,.212],[.628,.222],[.635,.230],[.645,.235],
      [.655,.238],[.665,.238],[.675,.235],[.682,.228],[.688,.218],
      [.692,.205],[.692,.190],[.688,.175],[.682,.162],[.675,.150],
      [.668,.142],[.658,.140],[.648,.140],
    ]
  },
  // ── LINKER ARM (hinten, verschränkt) ─────────────────────────────────────
  {
    col: '#9f7aea', glowCol: 'rgba(159,122,234,', w: 1.1, glow: 5,
    pts: [
      [.620,.158],[.610,.162],[.600,.168],[.592,.178],[.588,.190],
      [.588,.202],[.592,.212],[.598,.218],[.605,.220],[.612,.218],
      [.618,.212],[.622,.202],[.622,.190],
    ]
  },
  // ── LINKE HAND / FINGER ───────────────────────────────────────────────────
  {
    col: '#f87171', glowCol: 'rgba(248,113,113,', w: 0.9, glow: 5,
    pts: [
      [.590,.210],[.582,.218],[.578,.228],[.582,.235],[.590,.232]
    ]
  },
  {
    col: '#f87171', glowCol: 'rgba(248,113,113,', w: 0.9, glow: 5,
    pts: [
      [.590,.210],[.580,.222],[.575,.235],[.578,.242]]
  },
  {
    col: '#f87171', glowCol: 'rgba(248,113,113,', w: 0.9, glow: 5,
    pts: [
      [.590,.210],[.582,.225],[.580,.240],[.582,.248]]
  },
  // ── RECHTER ARM (vorne mit Feuer-Kontur) ─────────────────────────────────
  {
    col: '#c084fc', glowCol: 'rgba(192,132,252,', w: 1.2, glow: 6,
    pts: [
      [.690,.162],[.700,.168],[.710,.175],[.718,.185],[.722,.198],
      [.720,.212],[.715,.222],[.708,.228],[.700,.230],[.692,.225],
      [.685,.215],[.682,.202],[.683,.188],[.686,.175],
    ]
  },
  // ── RECHTE HAND FEUER ────────────────────────────────────────────────────
  {
    col: '#fb923c', glowCol: 'rgba(251,146,60,', w: 1.0, glow: 6,
    pts: [
      [.718,.185],[.728,.178],[.735,.168],[.738,.158],[.732,.148],
      [.725,.145],[.720,.150],[.718,.160],
    ]
  },
  {
    col: '#fbbf24', glowCol: 'rgba(251,191,36,', w: 0.8, glow: 4,
    pts: [
      [.720,.150],[.728,.140],[.730,.128],[.725,.120],[.718,.122],
    ]
  },
  // ── BAUCH / RUMPF ─────────────────────────────────────────────────────────
  {
    col: '#a78bfa', glowCol: 'rgba(167,139,250,', w: 1.5, glow: 7,
    pts: [
      [.622,.235],[.618,.252],[.618,.272],[.620,.292],[.625,.308],
      [.632,.318],[.642,.322],[.652,.325],[.662,.325],[.672,.322],
      [.680,.315],[.685,.302],[.688,.285],[.685,.268],[.680,.252],
      [.675,.240],
    ]
  },
  // ── HÜFTE / GESÄSS (große Kurve) ─────────────────────────────────────────
  {
    col: '#9f7aea', glowCol: 'rgba(159,122,234,', w: 1.6, glow: 8,
    pts: [
      [.618,.290],[.610,.305],[.605,.325],[.602,.348],[.602,.368],
      [.605,.385],[.612,.398],[.622,.405],[.632,.408],[.645,.410],
      [.658,.410],[.668,.408],[.678,.402],[.685,.392],[.688,.378],
      [.688,.360],[.685,.342],[.680,.325],
    ]
  },
  // ── LINKES BEIN ───────────────────────────────────────────────────────────
  {
    col: '#8b5cf6', glowCol: 'rgba(139,92,246,', w: 1.3, glow: 6,
    pts: [
      [.618,.395],[.612,.415],[.608,.438],[.608,.462],[.610,.482],
      [.615,.498],[.622,.508],[.630,.512],[.638,.510],[.645,.502],
      [.648,.488],[.648,.468],[.645,.448],[.638,.430],[.628,.415],
    ]
  },
  // ── LINKER FUSS ──────────────────────────────────────────────────────────
  {
    col: '#7c3aed', glowCol: 'rgba(124,58,237,', w: 1.1, glow: 5,
    pts: [
      [.608,.498],[.600,.510],[.598,.525],[.602,.535],[.612,.538],
      [.625,.535],[.632,.525],[.635,.512],
    ]
  },
  // ── RECHTES BEIN ─────────────────────────────────────────────────────────
  {
    col: '#8b5cf6', glowCol: 'rgba(139,92,246,', w: 1.3, glow: 6,
    pts: [
      [.678,.400],[.685,.418],[.690,.438],[.692,.460],[.690,.480],
      [.685,.498],[.678,.510],[.668,.515],[.658,.512],[.650,.505],
      [.648,.490],
    ]
  },
  // ── RECHTER FUSS ─────────────────────────────────────────────────────────
  {
    col: '#7c3aed', glowCol: 'rgba(124,58,237,', w: 1.1, glow: 5,
    pts: [
      [.692,.498],[.698,.510],[.700,.525],[.698,.538],[.688,.542],
      [.675,.540],[.665,.532],[.662,.518],[.665,.505],
    ]
  },
  // ── SCHWANZANSATZ (aus dem Rücken) ────────────────────────────────────────
  {
    col: '#c084fc', glowCol: 'rgba(192,132,252,', w: 1.3, glow: 6,
    pts: [
      [.685,.310],[.695,.298],[.706,.282],[.718,.265],[.728,.248],
      [.738,.230],[.748,.212],[.755,.195],
    ]
  },
  // ── SCHWANZ MITTE ─────────────────────────────────────────────────────────
  {
    col: '#e879f9', glowCol: 'rgba(232,121,249,', w: 1.1, glow: 6,
    pts: [
      [.755,.195],[.762,.178],[.768,.160],[.772,.142],[.775,.125],
      [.775,.108],[.772,.092],[.768,.078],[.762,.065],
    ]
  },
  // ── SCHWANZSPITZE (breite Fläche, ROT) ───────────────────────────────────
  {
    col: '#f87171', glowCol: 'rgba(248,113,113,', w: 1.8, glow: 10,
    pts: [
      [.762,.065],[.768,.052],[.775,.040],[.782,.028],[.790,.018],
      [.800,.012],[.812,.010],[.822,.015],[.830,.025],[.835,.038],
      [.835,.052],[.830,.068],[.822,.080],[.812,.088],[.800,.092],
      [.790,.090],[.780,.082],[.772,.072],[.765,.060],
    ]
  },
  // ── SCHWANZSPITZE INNERE DETAIL-LINIEN (rot/orange) ───────────────────────
  {
    col: '#fb923c', glowCol: 'rgba(251,146,60,', w: 0.8, glow: 5,
    pts: [
      [.775,.038],[.782,.048],[.788,.060],[.792,.072],[.790,.082],
    ]
  },
  {
    col: '#fbbf24', glowCol: 'rgba(251,191,36,', w: 0.7, glow: 4,
    pts: [
      [.800,.022],[.805,.035],[.808,.050],[.808,.065],[.805,.078],
    ]
  },
  // ── SCHWANZUNTERSEITE (zweite Kontur) ────────────────────────────────────
  {
    col: '#d946ef', glowCol: 'rgba(217,70,239,', w: 1.0, glow: 5,
    pts: [
      [.688,.360],[.696,.345],[.705,.328],[.715,.310],[.725,.292],
      [.735,.272],[.742,.252],[.748,.232],[.752,.212],[.755,.195],
    ]
  },
  // ── AURA-EFFEKTE (Energie-Linien am Körper) ───────────────────────────────
  {
    col: '#818cf8', glowCol: 'rgba(129,140,248,', w: 0.7, glow: 4,
    pts: [
      [.598,.200],[.592,.210],[.588,.222],[.590,.232],
    ]
  },
  {
    col: '#818cf8', glowCol: 'rgba(129,140,248,', w: 0.7, glow: 4,
    pts: [
      [.718,.195],[.725,.185],[.730,.172],[.728,.160],
    ]
  },
  // ── WIRBELSÄULE / RÜCKEN-DETAIL ───────────────────────────────────────────
  {
    col: '#7c3aed', glowCol: 'rgba(124,58,237,', w: 0.9, glow: 4,
    pts: [
      [.678,.142],[.682,.162],[.685,.182],[.685,.205],[.682,.228],
      [.680,.252],[.678,.278],[.678,.305],[.680,.330],[.682,.355],
      [.685,.375],
    ]
  },
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

    // Hintergrund-Sterne
    const bgStars = Array.from({ length: 100 }, () => ({
      x: Math.random(), y: Math.random(),
      r: Math.random()*1.0+0.2,
      a: Math.random()*0.35+0.05,
      vx: (Math.random()-.5)*0.00007,
      vy: (Math.random()-.5)*0.00007,
      ph: Math.random()*Math.PI*2,
    }))

    // Gesamtzahl der Segmente berechnen
    let totalSegs = 0
    PATHS.forEach(p => { totalSegs += p.pts.length - 1 })

    let t0: number|null = null
    const DRAW_DUR = 6000  // 6 Sekunden zum Zeichnen

    const draw = (ts: number) => {
      if (!t0) t0 = ts
      const elapsed = ts - t0
      const prog = Math.min(elapsed / DRAW_DUR, 1)
      const W = canvas.width, H = canvas.height

      ctx.clearRect(0, 0, W, H)

      // Skalierung: Mewtwo füllt die rechte Bildschirmhälfte
      // Referenz-Koordinaten: x: 0.57–0.84, y: 0.008–0.542
      // Wir skalieren so dass Mewtwo von oben bis unten geht
      const mwLeft  = 0.57  // linker Rand der Koordinaten
      const mwRight = 0.84  // rechter Rand
      const mwTop   = 0.008 // oberer Rand
      const mwBot   = 0.542 // unterer Rand

      // Ziel: rechte 55% des Screens, 92% der Höhe
      const targetW = W * 0.55
      const targetH = H * 0.92
      const targetX = W * 0.30   // start x (lässt 30% für Content links)
      const targetY = H * 0.04   // start y

      const coordW = mwRight - mwLeft
      const coordH = mwBot   - mwTop

      // Skalierungsfaktor (uniform, Aspektverhältnis erhalten)
      const scaleF = Math.min(targetW / coordW, targetH / coordH)
      // Zentrieren
      const offsetX = targetX + (targetW - coordW * scaleF) / 2 - mwLeft * scaleF
      const offsetY = targetY + (targetH - coordH * scaleF) / 2 - mwTop  * scaleF

      const px = (x: number) => offsetX + x * scaleF
      const py = (y: number) => offsetY + y * scaleF

      // Hintergrund-Sterne
      bgStars.forEach(s => {
        s.x += s.vx; s.y += s.vy
        if(s.x<0)s.x=1; if(s.x>1)s.x=0
        if(s.y<0)s.y=1; if(s.y>1)s.y=0
        s.ph += 0.009
        const a = s.a*(0.4+Math.sin(s.ph)*0.6)*Math.min(elapsed/2000,1)
        ctx.beginPath(); ctx.arc(s.x*W, s.y*H, s.r, 0, Math.PI*2)
        ctx.fillStyle = `rgba(160,100,255,${a})`; ctx.fill()
      })

      // Pfade progressiv zeichnen
      const segsToShow = prog * totalSegs
      let drawnSegs = 0

      PATHS.forEach(path => {
        const pts = path.pts
        for (let i = 0; i < pts.length - 1; i++) {
          if (drawnSegs >= segsToShow) break
          drawnSegs++

          const x1 = px(pts[i][0]),   y1 = py(pts[i][1])
          const x2 = px(pts[i+1][0]), y2 = py(pts[i+1][1])

          // Partial last segment
          let ex = x2, ey = y2
          if (drawnSegs === Math.floor(segsToShow) + 1) {
            const t = segsToShow - Math.floor(segsToShow)
            ex = x1 + (x2-x1)*t
            ey = y1 + (y2-y1)*t
          }

          ctx.lineCap = 'round'
          ctx.lineJoin = 'round'

          // Äußerer breiter Glow
          ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(ex,ey)
          ctx.strokeStyle = path.glowCol + '0.12)'
          ctx.lineWidth = path.glow * 2.5; ctx.stroke()

          // Mittlerer Glow
          ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(ex,ey)
          ctx.strokeStyle = path.glowCol + '0.35)'
          ctx.lineWidth = path.glow; ctx.stroke()

          // Kern-Linie (hell/weiß-ish)
          ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(ex,ey)
          ctx.strokeStyle = path.glowCol + '0.85)'
          ctx.lineWidth = path.w; ctx.stroke()

          // Dünner weißer Highlight
          ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(ex,ey)
          ctx.strokeStyle = 'rgba(255,255,255,0.25)'
          ctx.lineWidth = path.w * 0.35; ctx.stroke()
        }
      })

      // Punkte an jedem Knoten
      let dotCount = 0
      PATHS.forEach(path => {
        path.pts.forEach((pt, i) => {
          dotCount++
          if (dotCount > segsToShow + 1) return
          const x = px(pt[0]), y = py(pt[1])
          const pulse = Math.sin(ts * 0.002 + dotCount * 0.5) * 0.5 + 0.5
          const a = Math.min(prog * 3, 1)

          ctx.beginPath(); ctx.arc(x, y, 1.5 + pulse * 1.0, 0, Math.PI*2)
          ctx.fillStyle = path.glowCol + `${0.9 * a})`; ctx.fill()
        })
      })

      // Augen: extra cyan Glow wenn komplett
      if (prog > 0.4) {
        const eyeA = Math.min((prog-0.4)/0.3, 1)
        // Augen-Pfade sind Index 3 und 4, Mittelpunkte
        const eyes = [
          [(.638+.658)/2, (.148+.165)/2],
          [(.668+.688)/2, (.146+.162)/2],
        ]
        eyes.forEach(([ex, ey]) => {
          const x = px(ex), y = py(ey)
          const p2 = Math.sin(ts*0.003)*0.5+0.5
          ;[18, 9, 4].forEach((r, i) => {
            const als = [0.06, 0.18, 0.85]
            const g = ctx.createRadialGradient(x,y,0,x,y,r+p2*4)
            g.addColorStop(0, `rgba(0,240,255,${als[i]*eyeA})`)
            g.addColorStop(1, 'rgba(0,240,255,0)')
            ctx.beginPath(); ctx.arc(x,y,r+p2*4,0,Math.PI*2)
            ctx.fillStyle = g; ctx.fill()
          })
        })
      }

      // Schwanzspitze: extra roter Glow
      if (prog > 0.75) {
        const tailA = Math.min((prog-0.75)/0.2, 1)
        const tailCenter = [(.762+.835)/2, (.010+.092)/2]
        const x = px(tailCenter[0]), y = py(tailCenter[1])
        const p2 = Math.sin(ts*0.004)*0.5+0.5
        ;[25, 14, 6].forEach((r, i) => {
          const als = [0.06, 0.15, 0.5]
          const g = ctx.createRadialGradient(x,y,0,x,y,r+p2*5)
          g.addColorStop(0, `rgba(248,113,113,${als[i]*tailA})`)
          g.addColorStop(1, 'rgba(248,113,113,0)')
          ctx.beginPath(); ctx.arc(x,y,r+p2*5,0,Math.PI*2)
          ctx.fillStyle = g; ctx.fill()
        })
      }

      // Psychic-Aura am Ende
      if (prog > 0.88) {
        const aA = Math.min((prog-0.88)/0.12, 1) * 0.08
        const cx = px(0.650), cy = py(0.280)
        const g = ctx.createRadialGradient(cx,cy,0,cx,cy,H*0.5)
        g.addColorStop(0,   `rgba(139,92,246,${aA})`)
        g.addColorStop(0.5, `rgba(99,60,200,${aA*0.4})`)
        g.addColorStop(1,   'rgba(60,20,180,0)')
        ctx.beginPath(); ctx.arc(cx,cy,H*0.5,0,Math.PI*2)
        ctx.fillStyle = g; ctx.fill()
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
      aria-hidden="true"
      style={{
        position:      'fixed',
        top:           0,
        left:          0,
        width:         '100vw',
        height:        '100vh',
        pointerEvents: 'none',
        zIndex:        0,
        opacity:       0.55,
        mixBlendMode:  'screen',
      }}
    />
  )
}
