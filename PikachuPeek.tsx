'use client'
import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Pikachu SVG – Kopf der hinter einer Wand guckt
function PikachuHead({ side }: { side: 'left' | 'right' }) {
  const flip = side === 'right'
  return (
    <svg
      viewBox="0 0 120 140"
      width="120" height="140"
      style={{ transform: flip ? 'scaleX(-1)' : 'none', display:'block' }}
    >
      {/* Ears */}
      {/* Left ear */}
      <ellipse cx="28" cy="28" rx="14" ry="22" fill="#FFD700" transform="rotate(-15 28 28)"/>
      <ellipse cx="28" cy="22" rx="7" ry="13" fill="#1a1a1a" transform="rotate(-15 28 22)"/>
      {/* Right ear */}
      <ellipse cx="92" cy="28" rx="14" ry="22" fill="#FFD700" transform="rotate(15 92 28)"/>
      <ellipse cx="92" cy="22" rx="7" ry="13" fill="#1a1a1a" transform="rotate(15 92 22)"/>

      {/* Head */}
      <ellipse cx="60" cy="82" rx="52" ry="55" fill="#FFD700"/>

      {/* Cheek circles (red) */}
      <circle cx="28" cy="100" r="14" fill="#FF6B6B" opacity="0.85"/>
      <circle cx="92" cy="100" r="14" fill="#FF6B6B" opacity="0.85"/>

      {/* Eyes */}
      <ellipse cx="42" cy="72" rx="10" ry="11" fill="#1a1a1a"/>
      <ellipse cx="78" cy="72" rx="10" ry="11" fill="#1a1a1a"/>
      {/* Eye shine */}
      <circle cx="45" cy="69" r="3.5" fill="white"/>
      <circle cx="81" cy="69" r="3.5" fill="white"/>
      <circle cx="46.5" cy="67.5" r="1.5" fill="white"/>
      <circle cx="82.5" cy="67.5" r="1.5" fill="white"/>

      {/* Nose */}
      <ellipse cx="60" cy="88" rx="4" ry="2.5" fill="#1a1a1a"/>

      {/* Mouth – happy grin */}
      <path d="M 48 96 Q 60 108 72 96" fill="none" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round"/>

      {/* Wall edge shadow */}
      <rect
        x={flip ? 0 : 90}
        y="40" width="30" height="100"
        fill="rgba(4,2,14,0.0)"
      />
    </svg>
  )
}

type PeekState = {
  side:    'left' | 'right'
  yPos:    number  // % from top
  visible: boolean
}

export default function PikachuPeek() {
  const [peek, setPeek]   = useState<PeekState | null>(null)
  const timerRef          = useRef<NodeJS.Timeout>()
  const peekCountRef      = useRef(0)

  useEffect(() => {
    const schedule = () => {
      // Random interval: 15–45 seconds
      const delay = 15000 + Math.random() * 30000
      timerRef.current = setTimeout(() => {
        // Pick a random side and vertical position
        const side  = Math.random() > 0.5 ? 'left' : 'right'
        const yPos  = 25 + Math.random() * 45  // 25%–70% from top

        // Show Pikachu
        setPeek({ side, yPos, visible: true })
        peekCountRef.current++

        // Hide after 2.5–4 seconds
        const hideDelay = 2500 + Math.random() * 1500
        setTimeout(() => {
          setPeek(prev => prev ? { ...prev, visible: false } : null)
          // Remove after exit animation
          setTimeout(() => { setPeek(null); schedule() }, 700)
        }, hideDelay)
      }, delay)
    }

    // First peek after 8 seconds
    timerRef.current = setTimeout(() => {
      const side = Math.random() > 0.5 ? 'left' : 'right'
      setPeek({ side, yPos: 40, visible: true })
      setTimeout(() => {
        setPeek(prev => prev ? { ...prev, visible: false } : null)
        setTimeout(() => { setPeek(null); schedule() }, 700)
      }, 3000)
    }, 8000)

    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  if (!peek) return null

  const isLeft  = peek.side === 'left'
  const xHidden = isLeft ? -110 : 110    // fully offscreen
  const xPeeked = isLeft ?  -20 : 20     // slightly peeking in

  return (
    <AnimatePresence>
      {peek.visible && (
        <motion.div
          key={`peek-${peekCountRef.current}`}
          initial={{   x: xHidden, opacity: 0 }}
          animate={{   x: xPeeked, opacity: 1 }}
          exit={{      x: xHidden, opacity: 0 }}
          transition={{
            x:       { type:'spring', stiffness:180, damping:22 },
            opacity: { duration: 0.2 },
          }}
          style={{
            position:  'fixed',
            top:       `${peek.yPos}%`,
            left:      isLeft ? 0 : 'auto',
            right:     isLeft ? 'auto' : 0,
            zIndex:    150,
            pointerEvents: 'none',
            filter:    'drop-shadow(0 4px 20px rgba(255,215,0,0.5))',
          }}
        >
          <PikachuHead side={peek.side}/>
          {/* Glow effect */}
          <div style={{
            position: 'absolute',
            inset: '-10px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,215,0,0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}/>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
