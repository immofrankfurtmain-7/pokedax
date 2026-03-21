'use client'
import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { getTypeConfig, formatPrice, SIGNAL_LABELS, SIGNAL_COLORS, RARITY_LEVEL } from '@/lib/pokemon-api'
import type { TrendingCard } from '@/types'

interface MiniTrendProps { values: number[]; signal: 'buy' | 'sell' | 'hold' }
function MiniTrend({ values, signal }: MiniTrendProps) {
  const color = SIGNAL_COLORS[signal]
  const w = 100, h = 28, p = 3
  const mx = Math.max(...values), mn = Math.min(...values), r = mx - mn || 1
  const pts = values.map((v, i) => {
    const x = p + (i / (values.length - 1)) * (w - p * 2)
    const y = h - p - ((v - mn) / r) * (h - p * 2)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  const last = pts[pts.length - 1].split(',')
  const fill = `${pts[0].split(',')[0]},${h} ${pts.join(' ')} ${pts[pts.length-1].split(',')[0]},${h}`
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 28 }}>
      <defs>
        <linearGradient id={`tg${signal}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.02"/>
        </linearGradient>
      </defs>
      <polygon points={fill} fill={`url(#tg${signal})`}/>
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={last[0]} cy={last[1]} r="2.5" fill={color}/>
    </svg>
  )
}

interface TcgCardProps {
  trending: TrendingCard
  selected?: boolean
  onClick?: () => void
  size?: 'sm' | 'md' | 'lg'
}

export default function TcgCard({ trending, selected, onClick, size = 'md' }: TcgCardProps) {
  const [imgErr, setImgErr] = useState(false)
  const { card, price } = trending
  const typeConf  = getTypeConfig(card.types)
  const rarityLvl = RARITY_LEVEL[card.rarity ?? ''] ?? 2
  const isHolo    = rarityLvl >= 4
  const signalColor = SIGNAL_COLORS[price.signal]
  const changeColor = price.change7d >= 0 ? '#00e676' : '#ff5252'
  const fallbackEmoji = { Fire:'🔥', Water:'🌊', Lightning:'⚡', Psychic:'🔮', Grass:'🌿', Fighting:'👊', Dragon:'🐉', Darkness:'🌑' }[card.types?.[0] ?? ''] ?? '✨'

  // Mock trend data (replace with real history)
  const trendData = Array.from({ length: 9 }, (_, i) => price.price * (0.85 + i * 0.02 + Math.random() * 0.04))

  return (
    <motion.div
      className={cn('tcg-card-wrap group', selected && 'selected')}
      style={{ '--card-glow': typeConf.glow } as React.CSSProperties}
      whileHover={{ y: -10, rotate: -0.5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={onClick}
    >
      <div className={cn(
        'tcg-card-inner',
        selected && 'border-violet-400 shadow-[0_0_0_2px_#a78bfa,0_22px_60px_rgba(0,0,0,0.75)]'
      )}>
        {isHolo && <div className="tcg-foil"/>}

        {/* Type color stripe */}
        <div className="h-1.5 w-full" style={{ background: typeConf.grad }}/>

        {/* Header row */}
        <div className="flex justify-between items-center px-3 pt-2 pb-1">
          <div className="flex gap-1">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full transition-all"
                style={{ background: i < rarityLvl ? typeConf.color : 'rgba(255,255,255,0.1)', boxShadow: i < rarityLvl ? `0 0 5px ${typeConf.glow}` : 'none' }}/>
            ))}
          </div>
          <span className="text-[8px] font-semibold text-white/20 tracking-wider">{card.number}</span>
        </div>

        {/* Card image */}
        <div className="relative mx-2.5 mb-1.5 rounded-lg overflow-hidden bg-white/3" style={{ aspectRatio: '3/4' }}>
          {!imgErr ? (
            <Image
              src={card.images.small}
              alt={card.name}
              fill
              className="object-contain group-hover:scale-105 transition-transform duration-300"
              onError={() => setImgErr(true)}
              sizes="(max-width: 768px) 50vw, 200px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">{fallbackEmoji}</div>
          )}
          {isHolo && (
            <div className="absolute top-1.5 right-1.5 bg-gradient-to-r from-yellow-400/20 to-purple-400/20 border border-yellow-400/40 rounded px-1.5 py-0.5 text-[7px] font-black text-yellow-400 tracking-wider">HOLO</div>
          )}
        </div>

        {/* Name + set */}
        <div className="px-3 pb-1">
          <div className="text-[13px] font-bold text-white leading-tight tracking-tight">{card.name}</div>
          <div className="text-[9px] text-white/25 font-medium mt-0.5">{card.set.name}</div>
        </div>

        {/* Divider */}
        <div className="mx-3 my-1.5 h-px bg-gradient-to-r from-transparent via-white/7 to-transparent"/>

        {/* Price row */}
        <div className="flex items-center justify-between px-3 pb-1">
          <span className="text-lg font-extrabold text-white tracking-tight">{formatPrice(price.price)} €</span>
          <span className="text-[8px] font-black px-2 py-1 rounded-full tracking-wider"
            style={{ background: `${signalColor}18`, color: signalColor, border: `1px solid ${signalColor}44` }}>
            {SIGNAL_LABELS[price.signal]}
          </span>
        </div>

        {/* Change + trend */}
        <div className="px-3 pb-3">
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded mb-1 inline-block"
            style={{ background: `${changeColor}14`, color: changeColor }}>
            {price.change7d >= 0 ? '↑' : '↓'} {Math.abs(price.change7d)}%
          </span>
          <MiniTrend values={trendData} signal={price.signal}/>
        </div>
      </div>
    </motion.div>
  )
}
