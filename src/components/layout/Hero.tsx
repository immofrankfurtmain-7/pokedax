'use client'
import { useRef } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Search, Camera, TrendingUp, Shield, Zap } from 'lucide-react'
import dynamic from 'next/dynamic'

const MewtwoCanvas = dynamic(() => import('@/components/mewtwo/MewtwoCanvas'), { ssr: false })

const STATS = [
  { value: '98.420', label: 'Karten in DB' },
  { value: '2.841',  label: 'Aktive Nutzer' },
  { value: '1.247',  label: 'Scans heute' },
  { value: '18.330', label: 'Forum-Posts' },
]

const FEATURES = [
  { icon: TrendingUp, text: 'Live-Preise von Cardmarket' },
  { icon: Camera,     text: 'KI-Karten-Scanner' },
  { icon: Shield,     text: 'Fake-Check & Grading-Tipps' },
  { icon: Zap,        text: 'Realtime Preis-Alerts' },
]

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y       = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  return (
    <section ref={ref} className="relative min-h-screen flex items-center overflow-hidden pt-[60px]">
      {/* Background layers */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-5%,rgba(75,0,130,0.35)_0%,transparent_65%)]"/>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_90%_60%,rgba(50,15,120,0.2)_0%,transparent_55%)]"/>
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#04020e] to-transparent"/>

      {/* Mewtwo constellation – fixed right side */}
      <MewtwoCanvas/>

      {/* Content */}
      <motion.div
        style={{ y, opacity }}
        className="relative z-10 max-w-7xl mx-auto px-6 w-full"
      >
        <div className="max-w-[580px]">

          {/* Live badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-violet-950/50 border border-violet-800/40 rounded-full px-4 py-2 mb-8 backdrop-blur-sm"
          >
            <div className="live-dot"/>
            <span className="text-[11px] font-bold text-violet-300 tracking-widest uppercase">
              Live-Preise von Cardmarket · Deutschland
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[clamp(40px,6vw,72px)] font-black text-white leading-[0.95] tracking-tight mb-4"
          >
            Pokémon TCG
            <span className="gradient-text block mt-2">
              Preis-Check DE
            </span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-white/45 font-normal leading-relaxed mb-10 max-w-[440px]"
          >
            Scanne deine Karte und erhalte sofort den{' '}
            <strong className="text-white/80 font-semibold">aktuellen Marktwert</strong>{' '}
            mit Kauf-/Verkaufsempfehlung – direkt von Cardmarket.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-4 mb-12"
          >
            <Link
              href="/preischeck"
              className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl font-bold text-[15px] bg-gradient-to-r from-violet-600 to-purple-500 text-white shadow-[0_8px_28px_rgba(124,58,237,0.5)] hover:shadow-[0_12px_36px_rgba(124,58,237,0.65)] hover:-translate-y-0.5 transition-all duration-200"
            >
              <Search size={18} className="group-hover:scale-110 transition-transform"/>
              Preis checken
            </Link>
            <Link
              href="/scanner"
              className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl font-semibold text-[15px] border border-white/15 bg-white/4 text-white/80 hover:bg-white/9 hover:border-white/25 hover:-translate-y-0.5 backdrop-blur-md transition-all duration-200"
            >
              <Camera size={18} className="group-hover:scale-110 transition-transform"/>
              Karte scannen
            </Link>
          </motion.div>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap gap-2 mb-12"
          >
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 bg-white/4 border border-white/7 rounded-full px-3 py-1.5 text-[11px] font-medium text-white/45">
                <Icon size={11} className="text-violet-400"/>
                {text}
              </div>
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex gap-8 flex-wrap"
          >
            {STATS.map((s, i) => (
              <div key={s.label} className="flex items-center gap-6">
                <div>
                  <div className="text-2xl font-black text-white tracking-tight">{s.value}</div>
                  <div className="text-[11px] text-white/32 font-medium mt-0.5 tracking-wide">{s.label}</div>
                </div>
                {i < STATS.length - 1 && <div className="w-px h-8 bg-white/7 self-center"/>}
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
      >
        <div className="text-[10px] font-medium text-white/25 tracking-widest uppercase">Scrollen</div>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
          className="w-px h-10 bg-gradient-to-b from-violet-500/60 to-transparent"
        />
      </motion.div>
    </section>
  )
}
