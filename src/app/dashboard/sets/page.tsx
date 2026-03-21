'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Layers, ChevronRight, CheckCircle, Circle, Search } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

const SETS = [
  {
    id: 'sv1', name: 'Scharlachrot & Violett', series: 'Scarlet & Violet',
    total: 258, owned: 201, setValue: 1840, ownedValue: 1430,
    coverImg: 'https://images.pokemontcg.io/sv1/logo.png',
    color: '#cc44ff', missing: ['Glurak ex', 'Gengar ex', 'Miraidon ex', 'Koraidon ex', 'Umbreon ex'],
    releaseDate: '2023-03-31',
  },
  {
    id: 'sv4pt5', name: 'Paldeas Schicksale', series: 'Scarlet & Violet',
    total: 91, owned: 74, setValue: 680, ownedValue: 540,
    coverImg: 'https://images.pokemontcg.io/sv4pt5/logo.png',
    color: '#FFD700', missing: ['Pikachu ex Alt Art', 'Sylveon ex', 'Mew ex'],
    releaseDate: '2024-02-02',
  },
  {
    id: 'swsh11', name: 'Verlorener Ursprung', series: 'Sword & Shield',
    total: 196, owned: 140, setValue: 920, ownedValue: 680,
    coverImg: 'https://images.pokemontcg.io/swsh11/logo.png',
    color: '#ff5500', missing: ['Giratina V Alt Art', 'Aerodactyl V', 'Pikachu VMAX'],
    releaseDate: '2022-09-09',
  },
]

function SetCard({ set, onClick }: { set: typeof SETS[0]; onClick: () => void }) {
  const pct = Math.round((set.owned / set.total) * 100)
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type:'spring', stiffness:300, damping:20 }}
      onClick={onClick}
      className="bg-white/2 border border-white/6 rounded-2xl p-5 cursor-pointer hover:bg-white/4 hover:border-violet-800/25 transition-all group"
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="w-14 h-10 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
          style={{ background:`${set.color}14`, border:`1px solid ${set.color}28` }}>
          <span className="text-2xl">🃏</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-white/88 truncate">{set.name}</div>
          <div className="text-[10px] text-white/30 font-medium mt-0.5">{set.series}</div>
        </div>
        <ChevronRight size={14} className="text-white/20 group-hover:text-white/50 flex-shrink-0 mt-1 transition-colors"/>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[10px] font-semibold text-white/35">Fortschritt</span>
          <span className="text-[10px] font-bold" style={{ color: set.color }}>{set.owned}/{set.total} ({pct}%)</span>
        </div>
        <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
          <motion.div className="h-full rounded-full" style={{ background: set.color }}
            initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, ease:'easeOut' }}/>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white/3 rounded-xl p-2.5 text-center">
          <div className="text-[9px] text-white/28 uppercase tracking-widest font-semibold">Set-Wert</div>
          <div className="text-sm font-black text-white mt-0.5">{formatCurrency(set.setValue)}</div>
        </div>
        <div className="bg-white/3 rounded-xl p-2.5 text-center">
          <div className="text-[9px] text-white/28 uppercase tracking-widest font-semibold">Mein Wert</div>
          <div className="text-sm font-black text-white mt-0.5">{formatCurrency(set.ownedValue)}</div>
        </div>
      </div>

      {/* Missing count */}
      {set.missing.length > 0 && (
        <div className="mt-3 flex items-center gap-1.5">
          <Circle size={9} className="text-white/25"/>
          <span className="text-[10px] text-white/35 font-medium">{set.missing.length} Karten fehlen noch</span>
        </div>
      )}
    </motion.div>
  )
}

export default function SetsPage() {
  const [selected, setSelected] = useState<typeof SETS[0] | null>(null)
  const [search,   setSearch]   = useState('')

  const filtered = SETS.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="text-[11px] font-bold text-violet-400 uppercase tracking-widest mb-1.5">Dashboard</div>
        <h1 className="text-3xl font-black text-white tracking-tight">Set-Tracker</h1>
        <p className="text-white/40 text-sm mt-1">Verfolge deinen Fortschritt in jedem Set</p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"/>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Set suchen…"
          className="w-full max-w-sm bg-white/4 border border-white/9 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/15 transition-all"/>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {filtered.map((set, i) => (
          <motion.div key={set.id} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay: i * 0.07 }}>
            <SetCard set={set} onClick={() => setSelected(selected?.id === set.id ? null : set)}/>
          </motion.div>
        ))}
      </div>

      {/* Detail panel */}
      {selected && (
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
          className="bg-[rgba(12,8,28,0.92)] border border-violet-800/25 rounded-2xl p-6 backdrop-blur-2xl">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-black text-white">{selected.name}</h2>
              <p className="text-sm text-white/35 mt-0.5">Fehlende Karten ({selected.missing.length})</p>
            </div>
            <button onClick={() => setSelected(null)} className="text-white/30 hover:text-white transition-colors text-sm">✕</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {selected.missing.map((name, i) => (
              <div key={i} className="flex items-center gap-2.5 bg-white/3 border border-white/6 rounded-xl px-4 py-3">
                <Circle size={13} className="text-white/20 flex-shrink-0"/>
                <span className="text-sm text-white/65 font-medium">{name}</span>
                <a href={`https://www.cardmarket.com/de/Pokemon/Cards?searchString=${encodeURIComponent(name)}`}
                  target="_blank" rel="noreferrer"
                  className="ml-auto text-[10px] text-violet-400 hover:text-violet-300 font-semibold transition-colors flex-shrink-0">
                  CM ↗
                </a>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
