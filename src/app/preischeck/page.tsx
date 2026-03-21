'use client'
import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, X, ChevronRight, TrendingUp, TrendingDown, ExternalLink, Star } from 'lucide-react'
import Image from 'next/image'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { formatPrice, SIGNAL_LABELS, SIGNAL_COLORS, getTypeConfig, RARITY_LEVEL, TYPE_CONFIG } from '@/lib/pokemon-api'
import { formatCurrency } from '@/lib/utils'
import type { TrendingCard } from '@/types'

// ── Mock data (replace with real API calls) ────────────────────────────────
const MOCK_CARDS: TrendingCard[] = [
  { rank:1, rankChange:0, card:{ id:'sv1-6',     name:'Glurak ex',      supertype:'Pokémon', types:['Fire'],      set:{ id:'sv1',     name:'Karmesin & Purpur', series:'Scarlet & Violet', printedTotal:258, total:258, releaseDate:'2023-03-31', images:{ symbol:'', logo:'' } }, number:'006/198', rarity:'Special Illustration Rare', images:{ small:'https://images.pokemontcg.io/sv1/6_hires.png',     large:'https://images.pokemontcg.io/sv1/6_hires.png'     } }, price:{ cardId:'sv1-6',     price:189.90, low:155, high:220,  avg7:182, avg30:170, trend:180, change7d:12.4,  signal:'buy'  as const, updatedAt:'' } },
  { rank:2, rankChange:1, card:{ id:'sv4pt5-86', name:'Pikachu ex',     supertype:'Pokémon', types:['Lightning'], set:{ id:'sv4pt5',  name:'Paldeas Schicksale', series:'Scarlet & Violet', printedTotal:91,  total:91,  releaseDate:'2024-02-02', images:{ symbol:'', logo:'' } }, number:'086/091', rarity:'Illustration Rare',             images:{ small:'https://images.pokemontcg.io/sv4pt5/86_hires.png', large:'https://images.pokemontcg.io/sv4pt5/86_hires.png' } }, price:{ cardId:'sv4pt5-86', price:44.50,  low:35,  high:55,   avg7:43,  avg30:40,  trend:42,  change7d:5.2,   signal:'buy'  as const, updatedAt:'' } },
  { rank:3, rankChange:-1,card:{ id:'swsh11-71', name:'Mewtwo V',       supertype:'Pokémon', types:['Psychic'],   set:{ id:'swsh11',  name:'Verlorener Ursprung',series:'Sword & Shield',   printedTotal:196, total:196, releaseDate:'2022-09-09', images:{ symbol:'', logo:'' } }, number:'071/196', rarity:'Rare Ultra',                    images:{ small:'https://images.pokemontcg.io/swsh11/71_hires.png', large:'https://images.pokemontcg.io/swsh11/71_hires.png' } }, price:{ cardId:'swsh11-71', price:12.80,  low:10,  high:18,   avg7:13,  avg30:15,  trend:14,  change7d:-2.1,  signal:'sell' as const, updatedAt:'' } },
  { rank:4, rankChange:2, card:{ id:'sv1-63',    name:'Gengar ex',      supertype:'Pokémon', types:['Psychic'],   set:{ id:'sv1',     name:'Scharlachrot ex',    series:'Scarlet & Violet', printedTotal:258, total:258, releaseDate:'2023-03-31', images:{ symbol:'', logo:'' } }, number:'063/198', rarity:'Rare Ultra',                    images:{ small:'https://images.pokemontcg.io/sv1/63_hires.png',    large:'https://images.pokemontcg.io/sv1/63_hires.png'    } }, price:{ cardId:'sv1-63',    price:28.40,  low:22,  high:35,   avg7:27,  avg30:25,  trend:26,  change7d:1.8,   signal:'hold' as const, updatedAt:'' } },
  { rank:5, rankChange:0, card:{ id:'base1-4',   name:'Glurak 1st Ed.', supertype:'Pokémon', types:['Fire'],      set:{ id:'base1',   name:'Basis-Set 1999',      series:'Base',             printedTotal:102, total:102, releaseDate:'1999-01-09', images:{ symbol:'', logo:'' } }, number:'004/102', rarity:'Rare Holo',                     images:{ small:'https://images.pokemontcg.io/base1/4_hires.png',   large:'https://images.pokemontcg.io/base1/4_hires.png'   } }, price:{ cardId:'base1-4',   price:1250,   low:900, high:1500, avg7:1220,avg30:1100,trend:1180,change7d:8.9,   signal:'buy'  as const, updatedAt:'' } },
  { rank:6, rankChange:-1,card:{ id:'swsh5-49',  name:'Lapras V',       supertype:'Pokémon', types:['Water'],     set:{ id:'swsh5',   name:'Kampfstile',          series:'Sword & Shield',   printedTotal:163, total:163, releaseDate:'2021-03-19', images:{ symbol:'', logo:'' } }, number:'049/163', rarity:'Rare Ultra',                    images:{ small:'https://images.pokemontcg.io/swsh5/49_hires.png',  large:'https://images.pokemontcg.io/swsh5/49_hires.png'  } }, price:{ cardId:'swsh5-49',  price:67.20,  low:55,  high:80,   avg7:68,  avg30:72,  trend:70,  change7d:-1.5,  signal:'hold' as const, updatedAt:'' } },
  { rank:7, rankChange:3, card:{ id:'sv3pt5-200',name:'Iono',           supertype:'Trainer', types:undefined,     set:{ id:'sv3pt5',  name:'Paradox Rift',        series:'Scarlet & Violet', printedTotal:182, total:182, releaseDate:'2023-11-03', images:{ symbol:'', logo:'' } }, number:'200/182', rarity:'Special Illustration Rare', images:{ small:'https://images.pokemontcg.io/sv3pt5/200_hires.png',large:'https://images.pokemontcg.io/sv3pt5/200_hires.png'} }, price:{ cardId:'sv3pt5-200',price:89.90,  low:70,  high:115,  avg7:88,  avg30:82,  trend:85,  change7d:3.2,   signal:'buy'  as const, updatedAt:'' } },
  { rank:8, rankChange:-2,card:{ id:'sv4-198',   name:'Arven',          supertype:'Trainer', types:undefined,     set:{ id:'sv4',     name:'Paradox-Rift',        series:'Scarlet & Violet', printedTotal:182, total:182, releaseDate:'2023-11-03', images:{ symbol:'', logo:'' } }, number:'198/182', rarity:'Special Illustration Rare', images:{ small:'https://images.pokemontcg.io/sv4/198_hires.png',  large:'https://images.pokemontcg.io/sv4/198_hires.png'  } }, price:{ cardId:'sv4-198',   price:34.50,  low:28,  high:45,   avg7:35,  avg30:38,  trend:36,  change7d:-0.8,  signal:'hold' as const, updatedAt:'' } },
]

const TYPES = ['Alle', 'Fire', 'Water', 'Lightning', 'Psychic', 'Grass', 'Fighting', 'Dragon', 'Darkness', 'Metal']
const RARITIES = ['Alle', 'Common', 'Uncommon', 'Rare', 'Rare Holo', 'Rare Ultra', 'Special Illustration Rare']
const SIGNALS = ['Alle', 'KAUFEN', 'HALTEN', 'VERKAUFEN']
const SORT_OPTIONS = [
  { label: 'Preis ↓', value: 'price_desc' },
  { label: 'Preis ↑', value: 'price_asc'  },
  { label: 'Trend ↓', value: 'trend_desc' },
  { label: 'Trend ↑', value: 'trend_asc'  },
  { label: 'Name A–Z', value: 'name'      },
]

// ── Mini Sparkline ─────────────────────────────────────────────────────────
function Sparkline({ change, color }: { change: number; color: string }) {
  const seed = Math.abs(change)
  const pts = Array.from({ length: 9 }, (_, i) => {
    const base = 50
    const trend = change * i * 0.8
    const noise = Math.sin(i * seed * 0.7) * 6
    return Math.max(5, Math.min(95, base + trend + noise))
  })
  const w = 80, h = 28, p = 2
  const min = Math.min(...pts), max = Math.max(...pts), r = max - min || 1
  const svgPts = pts.map((v, i) => {
    const x = p + (i / (pts.length - 1)) * (w - p * 2)
    const y = h - p - ((v - min) / r) * (h - p * 2)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  const last = svgPts[svgPts.length - 1].split(',')
  const fill = `${svgPts[0].split(',')[0]},${h} ${svgPts.join(' ')} ${last[0]},${h}`
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: 80, height: 28 }}>
      <defs>
        <linearGradient id={`sg${change}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.02"/>
        </linearGradient>
      </defs>
      <polygon points={fill} fill={`url(#sg${change})`}/>
      <polyline points={svgPts.join(' ')} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={last[0]} cy={last[1]} r="2" fill={color}/>
    </svg>
  )
}

// ── Card Row (table view) ──────────────────────────────────────────────────
function CardRow({ t, isSelected, onClick }: { t: TrendingCard; isSelected: boolean; onClick: () => void }) {
  const [imgErr, setImgErr] = useState(false)
  const { card, price } = t
  const typeConf    = getTypeConfig(card.types)
  const signalColor = SIGNAL_COLORS[price.signal]
  const changeColor = price.change7d >= 0 ? '#00e676' : '#ff5252'

  return (
    <motion.tr
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className={`group border-b border-white/4 cursor-pointer transition-all hover:bg-white/2 ${isSelected ? 'bg-violet-950/20 border-violet-800/25' : ''}`}
      onClick={onClick}
    >
      {/* Rank */}
      <td className="px-4 py-3 text-xs font-bold text-white/25 w-8 text-center">
        <div className="flex flex-col items-center gap-0.5">
          <span>{t.rank}</span>
          {t.rankChange !== 0 && (
            <span className="text-[8px]" style={{ color: t.rankChange > 0 ? '#00e676' : '#ff5252' }}>
              {t.rankChange > 0 ? '↑' : '↓'}{Math.abs(t.rankChange)}
            </span>
          )}
        </div>
      </td>

      {/* Card */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-12 rounded-lg overflow-hidden bg-white/3 border border-white/6 flex items-center justify-center flex-shrink-0">
            {!imgErr
              ? <img src={card.images.small} alt={card.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform" onError={() => setImgErr(true)}/>
              : <span className="text-lg">{card.types?.[0] === 'Fire' ? '🔥' : card.types?.[0] === 'Water' ? '🌊' : '✨'}</span>
            }
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white/90 group-hover:text-white transition-colors">{card.name}</span>
              {(RARITY_LEVEL[card.rarity ?? ''] ?? 0) >= 4 && (
                <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-yellow-400/10 border border-yellow-400/25 text-yellow-400">HOLO</span>
              )}
            </div>
            <div className="text-[10px] text-white/30 font-medium mt-0.5">{card.set.name} · {card.number}</div>
          </div>
        </div>
      </td>

      {/* Type */}
      <td className="px-4 py-3 hidden md:table-cell">
        {card.types?.[0] && (
          <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ background:`${typeConf.color}14`, color:typeConf.color, border:`1px solid ${typeConf.color}28` }}>
            {card.types[0]}
          </span>
        )}
      </td>

      {/* Rarity */}
      <td className="px-4 py-3 hidden lg:table-cell">
        <div className="flex gap-1">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: i < (RARITY_LEVEL[card.rarity ?? ''] ?? 2) ? typeConf.color : 'rgba(255,255,255,0.1)' }}/>
          ))}
        </div>
      </td>

      {/* Price */}
      <td className="px-4 py-3 text-right">
        <span className="text-sm font-black text-white">{formatPrice(price.price)} €</span>
      </td>

      {/* 7d change */}
      <td className="px-4 py-3 hidden sm:table-cell">
        <div className="flex items-center gap-2 justify-end">
          <Sparkline change={price.change7d} color={changeColor}/>
          <span className="text-xs font-bold w-14 text-right" style={{ color: changeColor }}>
            {price.change7d >= 0 ? '+' : ''}{price.change7d}%
          </span>
        </div>
      </td>

      {/* Signal */}
      <td className="px-4 py-3 text-right">
        <span className="text-[10px] font-black px-2.5 py-1 rounded-full" style={{ background:`${signalColor}18`, color:signalColor, border:`1px solid ${signalColor}38` }}>
          {SIGNAL_LABELS[price.signal]}
        </span>
      </td>

      {/* Arrow */}
      <td className="px-4 py-3 w-8">
        <ChevronRight size={13} className="text-white/20 group-hover:text-white/50 transition-colors ml-auto"/>
      </td>
    </motion.tr>
  )
}

// ── Detail Panel ───────────────────────────────────────────────────────────
function DetailPanel({ t, onClose }: { t: TrendingCard; onClose: () => void }) {
  const [imgErr, setImgErr] = useState(false)
  const [addedToPortfolio, setAddedToPortfolio] = useState(false)
  const { card, price } = t
  const typeConf    = getTypeConfig(card.types)
  const signalColor = SIGNAL_COLORS[price.signal]
  const changeColor = price.change7d >= 0 ? '#00e676' : '#ff5252'
  const rarityLvl   = RARITY_LEVEL[card.rarity ?? ''] ?? 2

  return (
    <motion.div
      initial={{ opacity: 0, y: -12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 280, damping: 24 }}
      className="mb-5 rounded-2xl border border-violet-800/25 bg-[rgba(10,6,24,0.95)] backdrop-blur-2xl overflow-hidden shadow-[0_28px_80px_rgba(0,0,0,0.6)]"
    >
      {/* Top color stripe */}
      <div className="h-1 w-full" style={{ background: typeConf.grad }}/>

      <div className="p-6">
        <button onClick={onClose} className="absolute top-5 right-5 text-white/25 hover:text-white transition-colors">
          <X size={17}/>
        </button>

        <div className="flex gap-5 flex-wrap">
          {/* Card image */}
          <div className="relative w-28 flex-shrink-0 rounded-xl overflow-hidden bg-white/3 border border-white/7 self-start" style={{ aspectRatio:'3/4' }}>
            {!imgErr
              ? <img src={card.images.large} alt={card.name} className="w-full h-full object-contain" onError={() => setImgErr(true)}/>
              : <div className="w-full h-full flex items-center justify-center text-4xl">✨</div>
            }
          </div>

          {/* Right side */}
          <div className="flex-1 min-w-[220px]">
            {/* Name + badges */}
            <div className="flex items-start gap-2 flex-wrap mb-1">
              <h2 className="text-2xl font-black text-white tracking-tight">{card.name}</h2>
              {rarityLvl >= 4 && <span className="text-[9px] font-black px-2 py-0.5 rounded bg-yellow-400/10 border border-yellow-400/25 text-yellow-400 mt-1">HOLO</span>}
            </div>
            <p className="text-xs text-white/32 font-medium mb-1">{card.set.name} · {card.number}</p>
            {card.rarity && <p className="text-[10px] text-white/22 font-medium mb-3">{card.rarity}</p>}

            {/* Type + Rarity dots */}
            <div className="flex items-center gap-3 mb-4">
              {card.types?.[0] && (
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background:`${typeConf.color}14`, color:typeConf.color, border:`1px solid ${typeConf.color}28` }}>
                  {card.types[0]}
                </span>
              )}
              <div className="flex gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <div key={i} className="w-2 h-2 rounded-full" style={{ background: i < rarityLvl ? typeConf.color : 'rgba(255,255,255,0.1)', boxShadow: i < rarityLvl ? `0 0 5px ${typeConf.glow}` : 'none' }}/>
                ))}
              </div>
            </div>

            {/* Price + signal */}
            <div className="flex items-center gap-3 mb-5">
              <span className="text-4xl font-black text-white tracking-tight">{formatPrice(price.price)} €</span>
              <span className="text-[11px] font-black px-3 py-1.5 rounded-full" style={{ background:`${signalColor}18`, color:signalColor, border:`1px solid ${signalColor}44` }}>
                {SIGNAL_LABELS[price.signal]}
              </span>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                ['30T Min',  `${formatPrice(price.low)} €`,            ''],
                ['30T Max',  `${formatPrice(price.high)} €`,           ''],
                ['7T Avg',   `${formatPrice(price.avg7)} €`,           ''],
                ['30T Avg',  `${formatPrice(price.avg30)} €`,          ''],
                ['7T Trend', `${price.change7d >= 0 ? '+' : ''}${price.change7d}%`, price.change7d >= 0 ? '#00e676' : '#ff5252'],
                ['Cardmarket', 'ansehen →',                             '#a78bfa'],
              ].map(([l, v, c]) => (
                <div key={l} className="bg-white/3 border border-white/6 rounded-xl p-2.5 text-center">
                  <div className="text-[9px] font-semibold text-white/28 uppercase tracking-widest">{l}</div>
                  {l === 'Cardmarket'
                    ? <a href={`https://www.cardmarket.com/de/Pokemon/Cards?searchString=${encodeURIComponent(card.name)}`} target="_blank" rel="noreferrer"
                        className="text-xs font-bold mt-0.5 block transition-colors hover:text-violet-300" style={{ color: '#a78bfa' }}>{v}</a>
                    : <div className="text-sm font-black mt-0.5" style={{ color: c || 'white' }}>{v}</div>
                  }
                </div>
              ))}
            </div>

            {/* Recommendation */}
            <div className="rounded-xl p-3.5 mb-4" style={{ background:`${signalColor}08`, border:`1px solid ${signalColor}22` }}>
              <span className="text-[11px] font-black tracking-wider" style={{ color: signalColor }}>{SIGNAL_LABELS[price.signal]} · </span>
              <span className="text-xs text-white/52 leading-relaxed font-normal">
                {price.signal === 'buy'  && 'Starke Nachfrage – Preis steigt kontinuierlich. Guter Einstiegspunkt vor dem nächsten Sprung.'}
                {price.signal === 'sell' && 'Preis rückläufig seit mehreren Wochen. Jetzt verkaufen um den besten Preis zu erzielen.'}
                {price.signal === 'hold' && 'Preis stabil mit leicht positivem Trend. Halten und Entwicklung beobachten.'}
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-2 flex-wrap">
              <a href={`https://www.cardmarket.com/de/Pokemon/Cards?searchString=${encodeURIComponent(card.name)}`}
                target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-950/50 border border-violet-700/30 text-violet-300 text-xs font-semibold hover:border-violet-600/50 hover:bg-violet-950/70 hover:-translate-y-0.5 transition-all">
                <ExternalLink size={12}/> Cardmarket
              </a>
              <button
                onClick={() => setAddedToPortfolio(true)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${addedToPortfolio ? 'bg-green-950/50 border border-green-600/30 text-green-400' : 'bg-white/4 border border-white/10 text-white/50 hover:border-white/20 hover:text-white'}`}>
                {addedToPortfolio ? '✓ Im Portfolio' : '+ Portfolio'}
              </button>
              <a href="/dashboard/alerts"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/4 border border-white/10 text-white/50 text-xs font-semibold hover:border-white/20 hover:text-white transition-all">
                🔔 Alert setzen
              </a>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ── MAIN PAGE ──────────────────────────────────────────────────────────────
export default function PreischeckPage() {
  const [query,      setQuery]      = useState('')
  const [typeFilter, setTypeFilter] = useState('Alle')
  const [signal,     setSignal]     = useState('Alle')
  const [sort,       setSort]       = useState('price_desc')
  const [selected,   setSelected]   = useState<string | null>(null)
  const [showFilters,setShowFilters]= useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = MOCK_CARDS
    .filter(t => {
      const q = query.toLowerCase()
      if (q && !t.card.name.toLowerCase().includes(q) && !t.card.set.name.toLowerCase().includes(q)) return false
      if (typeFilter !== 'Alle' && !t.card.types?.includes(typeFilter)) return false
      if (signal !== 'Alle') {
        const map: Record<string,string> = { 'KAUFEN':'buy', 'HALTEN':'hold', 'VERKAUFEN':'sell' }
        if (t.price.signal !== map[signal]) return false
      }
      return true
    })
    .sort((a, b) => {
      switch (sort) {
        case 'price_asc':  return a.price.price - b.price.price
        case 'price_desc': return b.price.price - a.price.price
        case 'trend_desc': return b.price.change7d - a.price.change7d
        case 'trend_asc':  return a.price.change7d - b.price.change7d
        case 'name':       return a.card.name.localeCompare(b.card.name)
        default:           return 0
      }
    })

  const selectedCard = MOCK_CARDS.find(t => t.card.id === selected)
  const activeFilters = [typeFilter !== 'Alle' && typeFilter, signal !== 'Alle' && signal].filter(Boolean)

  return (
    <main className="min-h-screen">
      <Navbar/>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} className="mb-8">
          <div className="text-[11px] font-bold text-violet-400 uppercase tracking-widest mb-2">Live von Cardmarket</div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">Preischeck</h1>
          <p className="text-white/40 text-sm font-normal">
            {MOCK_CARDS.length.toLocaleString('de-DE')} Karten · Live-Preise · Kauf-/Verkaufsempfehlung
          </p>
        </motion.div>

        {/* Search + filter bar */}
        <div className="flex gap-3 mb-4 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"/>
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Karte suchen: Glurak, Pikachu, Mewtwo…"
              className="w-full bg-white/4 border border-white/9 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/22 outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/12 transition-all"
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
                <X size={14}/>
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${showFilters || activeFilters.length > 0 ? 'bg-violet-950/50 border-violet-700/40 text-violet-300' : 'bg-white/4 border-white/9 text-white/50 hover:border-white/16 hover:text-white/80'}`}
          >
            <Filter size={14}/>
            Filter
            {activeFilters.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-violet-500 text-white text-[9px] font-black flex items-center justify-center">{activeFilters.length}</span>
            )}
          </button>

          {/* Sort */}
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="bg-white/4 border border-white/9 rounded-xl px-4 py-3 text-sm text-white/70 outline-none focus:border-violet-500/50 transition-all cursor-pointer"
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Expandable filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
              className="overflow-hidden"
            >
              <div className="bg-white/2 border border-white/6 rounded-2xl p-5 mb-4 space-y-4">
                {/* Type filter */}
                <div>
                  <div className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-2">Typ</div>
                  <div className="flex flex-wrap gap-2">
                    {TYPES.map(type => {
                      const conf = type !== 'Alle' ? (TYPE_CONFIG[type] ?? TYPE_CONFIG.default) : null
                      return (
                        <button key={type} onClick={() => setTypeFilter(type)}
                          className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all border"
                          style={typeFilter === type && conf ? {
                            background: `${conf.color}18`, color: conf.color, borderColor: `${conf.color}44`
                          } : {
                            background: typeFilter === type ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.04)',
                            color: typeFilter === type ? '#a78bfa' : 'rgba(255,255,255,0.45)',
                            borderColor: typeFilter === type ? 'rgba(167,139,250,0.4)' : 'transparent',
                          }}>
                          {type}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Signal filter */}
                <div>
                  <div className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-2">Empfehlung</div>
                  <div className="flex gap-2 flex-wrap">
                    {SIGNALS.map(s => {
                      const colorMap: Record<string, string> = { 'KAUFEN':'#00e676', 'HALTEN':'#FFD700', 'VERKAUFEN':'#ff5252' }
                      const c = colorMap[s]
                      return (
                        <button key={s} onClick={() => setSignal(s)}
                          className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all border"
                          style={signal === s && c ? { background:`${c}18`, color:c, borderColor:`${c}44` }
                            : signal === s ? { background:'rgba(167,139,250,0.15)', color:'#a78bfa', borderColor:'rgba(167,139,250,0.4)' }
                            : { background:'rgba(255,255,255,0.04)', color:'rgba(255,255,255,0.45)', borderColor:'transparent' }}>
                          {s}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Reset */}
                {activeFilters.length > 0 && (
                  <button onClick={() => { setTypeFilter('Alle'); setSignal('Alle') }}
                    className="text-xs text-violet-400 hover:text-violet-300 font-semibold transition-colors">
                    × Alle Filter zurücksetzen
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-white/30 font-medium">
            {filtered.length} Karten {query && `für „${query}"`}
          </p>
          {activeFilters.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {activeFilters.map(f => (
                <span key={String(f)} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-950/50 border border-violet-700/30 text-violet-300">
                  {String(f)}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Detail panel */}
        <AnimatePresence>
          {selectedCard && (
            <div className="relative">
              <DetailPanel key={selectedCard.card.id} t={selectedCard} onClose={() => setSelected(null)}/>
            </div>
          )}
        </AnimatePresence>

        {/* Table */}
        {filtered.length > 0 ? (
          <div className="bg-white/2 border border-white/6 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/6">
                    {['#', 'Karte', 'Typ', 'Seltenheit', 'Preis', '7T Trend', 'Signal', ''].map(h => (
                      <th key={h} className={`px-4 py-3 text-left text-[10px] font-semibold text-white/28 uppercase tracking-widest ${h === 'Typ' ? 'hidden md:table-cell' : ''} ${h === 'Seltenheit' ? 'hidden lg:table-cell' : ''} ${h === '7T Trend' ? 'hidden sm:table-cell' : ''}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t, i) => (
                    <CardRow
                      key={t.card.id}
                      t={t}
                      isSelected={selected === t.card.id}
                      onClick={() => setSelected(selected === t.card.id ? null : t.card.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-5xl mb-4 opacity-25">🔍</div>
            <div className="text-sm font-medium text-white/30">Keine Karten gefunden</div>
            <div className="text-xs text-white/20 mt-1">Versuche eine andere Suche oder Filter</div>
            <button onClick={() => { setQuery(''); setTypeFilter('Alle'); setSignal('Alle') }}
              className="mt-4 text-xs text-violet-400 hover:text-violet-300 font-semibold transition-colors">
              Filter zurücksetzen
            </button>
          </div>
        )}

        {/* Premium upsell */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}
          className="mt-8 flex items-center gap-4 bg-gradient-to-r from-violet-950/50 to-purple-950/40 border border-violet-800/25 rounded-2xl px-6 py-4 flex-wrap">
          <Star size={18} className="text-yellow-400 flex-shrink-0"/>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-white/80">Echte Live-Preise mit Premium</div>
            <div className="text-xs text-white/40 font-normal">90-Tage-Charts, Preis-Alerts und Portfolio-Tracking – ab 4,99 €/Mo</div>
          </div>
          <a href="/dashboard/premium" className="flex-shrink-0 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 text-white text-xs font-bold shadow-[0_6px_16px_rgba(124,58,237,0.4)] hover:-translate-y-0.5 transition-all">
            Premium werden →
          </a>
        </motion.div>
      </div>

      <Footer/>
    </main>
  )
}
