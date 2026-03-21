'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, ChevronRight, X } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import TcgCard from '@/components/cards/TcgCard'
import { formatPrice, SIGNAL_LABELS, SIGNAL_COLORS, getTypeConfig } from '@/lib/pokemon-api'
import type { TrendingCard } from '@/types'

interface DetailPanelProps { trending: TrendingCard; onClose: () => void }

function DetailPanel({ trending, onClose }: DetailPanelProps) {
  const { card, price } = trending
  const [imgErr, setImgErr] = useState(false)
  const typeConf    = getTypeConfig(card.types)
  const signalColor = SIGNAL_COLORS[price.signal]
  const changeColor = price.change7d >= 0 ? '#00e676' : '#ff5252'

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0,   scale: 1 }}
      exit={{  opacity: 0, y: -10, scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="relative mb-6 rounded-2xl overflow-hidden border border-violet-800/25 backdrop-blur-2xl bg-[rgba(12,8,28,0.92)] shadow-[0_28px_80px_rgba(0,0,0,0.55)]"
    >
      <button onClick={onClose} className="absolute top-4 right-4 z-10 text-white/30 hover:text-white transition-colors">
        <X size={18}/>
      </button>

      <div className="p-6 flex flex-col md:flex-row gap-6">
        {/* Image */}
        <div className="relative w-28 md:w-36 flex-shrink-0 rounded-xl overflow-hidden bg-white/3 border border-white/7 self-start" style={{ aspectRatio:'3/4' }}>
          {!imgErr
            ? <Image src={card.images.large} alt={card.name} fill className="object-contain" onError={() => setImgErr(true)}/>
            : <div className="w-full h-full flex items-center justify-center text-4xl">✨</div>
          }
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3 mb-2 flex-wrap">
            <h3 className="text-2xl font-black text-white tracking-tight">{card.name}</h3>
            <span className="text-[10px] font-black px-2 py-1 rounded-full tracking-wider"
              style={{ background:`${signalColor}18`, color:signalColor, border:`1px solid ${signalColor}44` }}>
              {SIGNAL_LABELS[price.signal]}
            </span>
          </div>
          <p className="text-xs text-white/35 font-medium mb-1">{card.set.name} · {card.number}</p>
          <div className="text-4xl font-black text-white tracking-tight mb-4">{formatPrice(price.price)} €</div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              ['30T Min', `${formatPrice(price.low)} €`, ''],
              ['30T Max', `${formatPrice(price.high)} €`, ''],
              ['7W Trend', `${price.change7d >= 0 ? '+' : ''}${price.change7d}%`, price.change7d >= 0 ? '#00e676' : '#ff5252'],
            ].map(([l, v, c]) => (
              <div key={l} className="bg-white/3 border border-white/6 rounded-xl p-3 text-center">
                <div className="text-[9px] font-semibold text-white/28 uppercase tracking-widest">{l}</div>
                <div className="text-base font-black mt-1" style={{ color: c || 'white' }}>{v}</div>
              </div>
            ))}
          </div>

          {/* Recommendation */}
          <div className="rounded-xl p-3 mb-4 text-sm font-normal text-white/55 leading-relaxed"
            style={{ background:`${signalColor}08`, border:`1px solid ${signalColor}22` }}>
            <span className="font-bold tracking-wide" style={{ color:signalColor }}>{SIGNAL_LABELS[price.signal]} · </span>
            {price.signal === 'buy'  && 'Starke Nachfrage – Preis steigt kontinuierlich. Jetzt kaufen vor dem nächsten Sprung.'}
            {price.signal === 'sell' && 'Preis fällt seit mehreren Wochen. Jetzt noch guten Preis erzielen.'}
            {price.signal === 'hold' && 'Stabiler Preis mit leicht positivem Trend. Halten und beobachten.'}
          </div>

          <a
            href={`https://www.cardmarket.com/de/Pokemon/Cards?searchString=${encodeURIComponent(card.name)}`}
            target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-2 bg-violet-950/50 border border-violet-700/30 rounded-xl px-4 py-2.5 text-violet-300 text-sm font-semibold hover:border-violet-500/50 hover:bg-violet-950/70 hover:-translate-y-0.5 transition-all"
          >
            Auf Cardmarket ansehen <ChevronRight size={14}/>
          </a>
        </div>
      </div>
    </motion.div>
  )
}

interface TrendingGridProps { cards: TrendingCard[] }

export default function TrendingGrid({ cards }: TrendingGridProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const selectedCard = cards.find(c => c.card.id === selected)

  return (
    <section className="relative z-10 py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-violet-400 uppercase tracking-widest mb-2">
              <TrendingUp size={13}/>
              Trending jetzt
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">Meistgesuchte Karten</h2>
            <p className="text-sm text-white/35 font-normal mt-1">Live-Preise · Täglich aktualisiert von Cardmarket</p>
          </div>
          <Link href="/preischeck" className="text-sm font-semibold text-violet-300 hover:text-violet-200 transition-colors flex items-center gap-1">
            Alle ansehen <ChevronRight size={15}/>
          </Link>
        </div>

        {/* Detail panel */}
        <AnimatePresence>
          {selectedCard && (
            <DetailPanel key={selectedCard.card.id} trending={selectedCard} onClose={() => setSelected(null)}/>
          )}
        </AnimatePresence>

        {/* Cards grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {cards.map((t, i) => (
            <motion.div
              key={t.card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
            >
              <TcgCard
                trending={t}
                selected={selected === t.card.id}
                onClick={() => setSelected(selected === t.card.id ? null : t.card.id)}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
