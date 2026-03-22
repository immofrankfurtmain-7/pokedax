'use client'
import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type PeekState = {
  side:    'left' | 'right'
  yPos:    number
  visible: boolean
  key:     number
}

export default function PikachuPeek() {
  const [peek,    setPeek]   = useState<PeekState | null>(null)
  const timerRef             = useRef<NodeJS.Timeout>()
  const countRef             = useRef(0)

  useEffect(() => {
    const show = (side: 'left' | 'right', yPos: number, duration: number) => {
      countRef.current++
      setPeek({ side, yPos, visible: true, key: countRef.current })

      setTimeout(() => {
        setPeek(prev => prev ? { ...prev, visible: false } : null)
        setTimeout(() => { setPeek(null); schedule() }, 800)
      }, duration)
    }

    const schedule = () => {
      // 20–50 seconds between peeks
      const delay = 20000 + Math.random() * 30000
      timerRef.current = setTimeout(() => {
        const side     = Math.random() > 0.5 ? 'left' : 'right'
        const yPos     = 20 + Math.random() * 50
        const duration = 2500 + Math.random() * 2000
        show(side, yPos, duration)
      }, delay)
    }

    // First peek after 10 seconds
    timerRef.current = setTimeout(() => {
      show('right', 45, 3000)
    }, 10000)

    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  if (!peek) return null

  const isLeft = peek.side === 'left'

  // Bild 1 (pikachu-right.png) kommt von rechts rein
  // Bild 2 (pikachu-left.png) kommt von links rein
  const imgSrc  = isLeft ? '/pikachu-left.png' : '/pikachu-right.png'

  // Wie weit ins Bild – ca. 35% des Bildes sichtbar
  const hiddenX = isLeft ? -160 : 160
  const shownX  = isLeft ? -20  : 20

  return (
    <AnimatePresence>
      {peek.visible && (
        <motion.div
          key={peek.key}
          initial={{   x: hiddenX, opacity: 0   }}
          animate={{   x: shownX,  opacity: 1   }}
          exit={{      x: hiddenX, opacity: 0   }}
          transition={{
            x:       { type:'spring', stiffness:160, damping:20 },
            opacity: { duration: 0.25 },
          }}
          style={{
            position:      'fixed',
            top:           `${peek.yPos}%`,
            left:          isLeft ? 0 : 'auto',
            right:         isLeft ? 'auto' : 0,
            zIndex:        150,
            pointerEvents: 'none',
            // Drop shadow / gold glow
            filter:        'drop-shadow(0 4px 24px rgba(255,215,0,0.55)) drop-shadow(0 0 8px rgba(255,215,0,0.3))',
          }}
        >
          <img
            src={imgSrc}
            alt="Pikachu"
            style={{
              width:     '160px',
              height:    'auto',
              display:   'block',
              // Mirror bild-2 so it looks toward screen center when coming from left
              transform: isLeft ? 'scaleX(-1)' : 'none',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
