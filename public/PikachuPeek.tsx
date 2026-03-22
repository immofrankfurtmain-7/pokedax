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
  const [peek,  setPeek] = useState<PeekState | null>(null)
  const timerRef         = useRef<NodeJS.Timeout>()
  const countRef         = useRef(0)

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
      const delay = 20000 + Math.random() * 30000
      timerRef.current = setTimeout(() => {
        show(
          Math.random() > 0.5 ? 'left' : 'right',
          20 + Math.random() * 50,
          2500 + Math.random() * 2000
        )
      }, delay)
    }

    // First peek after 10s
    timerRef.current = setTimeout(() => show('right', 45, 3000), 10000)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  if (!peek) return null

  const isLeft = peek.side === 'left'

  // Design_ohne_Titel.svg      → schaut nach rechts → kommt von rechts rein
  // Design_ohne_Titel__1_.svg  → schaut nach links  → kommt von links rein
  const imgSrc  = isLeft ? '/pikachu-left.svg' : '/pikachu-right.svg'
  const hiddenX = isLeft ? -170 : 170
  const shownX  = isLeft ? -15  : 15

  return (
    <AnimatePresence>
      {peek.visible && (
        <motion.div
          key={peek.key}
          initial={{   x: hiddenX, opacity: 0 }}
          animate={{   x: shownX,  opacity: 1 }}
          exit={{      x: hiddenX, opacity: 0 }}
          transition={{
            x:       { type: 'spring', stiffness: 160, damping: 20 },
            opacity: { duration: 0.2 },
          }}
          style={{
            position:      'fixed',
            top:           `${peek.yPos}%`,
            left:          isLeft ? 0 : 'auto',
            right:         isLeft ? 'auto' : 0,
            zIndex:        150,
            pointerEvents: 'none',
          }}
        >
          <img
            src={imgSrc}
            alt="Pikachu"
            style={{
              width:   '160px',
              height:  'auto',
              display: 'block',
              filter:  'drop-shadow(0 4px 20px rgba(255,215,0,0.6))',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
