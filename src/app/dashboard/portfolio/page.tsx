'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Plus, Package, DollarSign, BarChart2 } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { formatCurrency } from '@/lib/utils'
import { SIGNAL_COLORS } from '@/lib/pokemon-api'

// Mock chart data – replace with real Supabase data
const CHART_DATA = [
  { date: '01.01', value: 820 },
  { date: '08.01', value: 890 },
  { date: '15.01', value: 865 },
  { date: '22.01', value: 940 },
  { date: '29.01', value: 920 },
  { date: '05.02', value: 1050 },
  { date: '12.02', value: 1120 },
  { date: '19.02', value: 1095 },
  { date: '26.02', value: 1180 },
  { date: '05.03', value: 1240 },
  { date: '12.03', value: 1290 },
  { date: '19.03', value: 1380 },
]

const MOCK_CARDS = [
  { id:1, name:'Glurak ex',      set:'Karmesin & Purpur', condition:'NearMint', qty:1, purchasePrice:150, currentPrice:189.90, change:26.6, img:'https://images.pokemontcg.io/sv1/6_hires.png' },
  { id:2, name:'Pikachu ex',     set:'Paldeas Schicksale', condition:'Mint',    qty:2, purchasePrice:38,  currentPrice:44.50,  change:17.1, img:'https://images.pokemontcg.io/sv4pt5/86_hires.png' },
  { id:3, name:'Glurak 1st Ed.', set:'Basis-Set 1999',    condition:'Good',     qty:1, purchasePrice:900, currentPrice:1250,   change:38.9, img:'https://images.pokemontcg.io/base1/4_hires.png' },
  { id:4, name:'Lapras V',       set:'Kampfstile',         condition:'Excellent',qty:1, purchasePrice:72,  currentPrice:67.20,  change:-6.7, img:'https://images.pokemontcg.io/swsh5/49_hires.png' },
]

const CONDITIONS = ['PSA10','PSA9','PSA8','Mint','NearMint','Excellent','Good','Poor']
const TIMEFRAMES = ['7T', '30T', '90T', '1J', 'Gesamt'] as const

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[rgba(12,8,28,0.95)] border border-violet-800/30 rounded-xl px-4 py-2.5 text-sm backdrop-blur-xl">
      <div className="text-white/40 text-xs mb-1">{label}</div>
      <div className="text-white font-black text-base">{formatCurrency(payload[0].value)}</div>
    </div>
  )
}

export default function PortfolioPage() {
  const [timeframe, setTimeframe] = useState<typeof TIMEFRAMES[number]>('30T')
  const [showAddModal, setShowAddModal] = useState(false)

  const totalValue   = MOCK_CARDS.reduce((s, c) => s + c.currentPrice * c.qty, 0)
  const totalCost    = MOCK_CARDS.reduce((s, c) => s + c.purchasePrice * c.qty, 0)
  const gainLoss     = totalValue - totalCost
  const gainLossPct  = ((gainLoss / totalCost) * 100).toFixed(1)
  const isProfit     = gainLoss >= 0

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <div className="text-[11px] font-bold text-violet-400 uppercase tracking-widest mb-1.5">Dashboard</div>
          <h1 className="text-3xl font-black text-white tracking-tight">Portfolio</h1>
          <p className="text-white/40 text-sm mt-1">Deine Karten-Sammlung auf einen Blick</p>
        </div>
        <button onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 text-white text-sm font-bold shadow-[0_6px_20px_rgba(124,58,237,0.4)] hover:shadow-[0_10px_28px_rgba(124,58,237,0.55)] hover:-translate-y-0.5 transition-all">
          <Plus size={15}/> Karte hinzufügen
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label:'Gesamtwert',      value: formatCurrency(totalValue), sub: `${MOCK_CARDS.length} Karten`, color:'#a78bfa', icon: Package },
          { label:'Eingekauft für',  value: formatCurrency(totalCost),  sub: 'Kaufpreis gesamt',            color:'#38bdf8', icon: DollarSign },
          { label:'Gewinn/Verlust',  value: formatCurrency(gainLoss),   sub: `${isProfit?'+':''}${gainLossPct}%`, color: isProfit?'#00e676':'#ff5252', icon: isProfit ? TrendingUp : TrendingDown },
          { label:'Top Performer',   value: 'Glurak 1st Ed.',           sub: '+38.9% (30d)',                color:'#FFD700', icon: BarChart2 },
        ].map(({ label, value, sub, color, icon: Icon }) => (
          <div key={label} className="bg-white/2 border border-white/6 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-semibold text-white/30 uppercase tracking-widest">{label}</span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background:`${color}14`, border:`1px solid ${color}28` }}>
                <Icon size={13} style={{ color }}/>
              </div>
            </div>
            <div className="text-xl font-black text-white tracking-tight truncate">{value}</div>
            <div className="text-xs mt-1 font-medium" style={{ color }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white/2 border border-white/6 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <h2 className="text-sm font-bold text-white/70">Wert-Entwicklung</h2>
          <div className="flex gap-1 bg-white/4 border border-white/8 rounded-xl p-1">
            {TIMEFRAMES.map(tf => (
              <button key={tf} onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${timeframe === tf ? 'bg-violet-600/40 text-violet-200 border border-violet-600/30' : 'text-white/35 hover:text-white/60'}`}>
                {tf}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={CHART_DATA} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.02}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
            <XAxis dataKey="date" tick={{ fill:'rgba(255,255,255,0.25)', fontSize:10 }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fill:'rgba(255,255,255,0.25)', fontSize:10 }} axisLine={false} tickLine={false} tickFormatter={v => `€${v}`}/>
            <Tooltip content={<CustomTooltip/>}/>
            <Area type="monotone" dataKey="value" stroke="#a855f7" strokeWidth={2} fill="url(#portfolioGrad)" dot={false} activeDot={{ r:4, fill:'#a855f7', strokeWidth:0 }}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Cards table */}
      <div className="bg-white/2 border border-white/6 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white/70">Meine Karten</h2>
          <span className="text-xs text-white/30 font-medium">{MOCK_CARDS.length} Karten</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Karte', 'Zustand', 'Anz.', 'Kaufpreis', 'Aktuell', 'G/V', ''].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-white/28 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_CARDS.map((c, i) => {
                const total      = c.currentPrice * c.qty
                const cost       = c.purchasePrice * c.qty
                const diff       = total - cost
                const pct        = ((diff / cost) * 100).toFixed(1)
                const isPos      = diff >= 0
                const diffColor  = isPos ? '#00e676' : '#ff5252'
                return (
                  <motion.tr key={c.id}
                    initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay: i * 0.05 }}
                    className="border-b border-white/4 hover:bg-white/2 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img src={c.img} alt={c.name} className="w-8 h-10 object-contain rounded flex-shrink-0"/>
                        <div>
                          <div className="text-sm font-semibold text-white/88 leading-tight">{c.name}</div>
                          <div className="text-[10px] text-white/28 font-medium mt-0.5">{c.set}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-white/5 text-white/50">{c.condition}</span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-white/60 font-medium">×{c.qty}</td>
                    <td className="px-5 py-3.5 text-sm text-white/55 font-medium">{formatCurrency(c.purchasePrice)}</td>
                    <td className="px-5 py-3.5 text-sm font-bold text-white">{formatCurrency(c.currentPrice)}</td>
                    <td className="px-5 py-3.5">
                      <div className="text-sm font-bold" style={{ color: diffColor }}>
                        {isPos ? '+' : ''}{formatCurrency(diff)}
                      </div>
                      <div className="text-[10px] font-medium" style={{ color: diffColor }}>{isPos ? '+' : ''}{pct}%</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <button className="text-xs text-white/25 hover:text-violet-400 font-semibold transition-colors opacity-0 group-hover:opacity-100">
                        Verkaufen
                      </button>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Card Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md" onClick={() => setShowAddModal(false)}>
          <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
            className="bg-[rgba(12,8,28,0.98)] border border-violet-800/30 rounded-2xl p-6 w-full max-w-md shadow-[0_28px_80px_rgba(0,0,0,0.7)]"
            onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-black text-white mb-4">Karte hinzufügen</h3>
            <div className="space-y-3">
              <input placeholder="Kartenname suchen…" className="w-full bg-white/4 border border-white/9 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/15 transition-all"/>
              <select className="w-full bg-white/4 border border-white/9 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500/60 transition-all">
                <option value="">Zustand wählen</option>
                {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input type="number" placeholder="Kaufpreis (€)" className="w-full bg-white/4 border border-white/9 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-violet-500/60 transition-all"/>
              <input type="number" min="1" defaultValue="1" placeholder="Anzahl" className="w-full bg-white/4 border border-white/9 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500/60 transition-all"/>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 text-sm font-semibold hover:text-white hover:border-white/20 transition-all">Abbrechen</button>
              <button className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 text-white text-sm font-bold shadow-[0_6px_20px_rgba(124,58,237,0.4)] hover:-translate-y-0.5 transition-all">Hinzufügen</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
