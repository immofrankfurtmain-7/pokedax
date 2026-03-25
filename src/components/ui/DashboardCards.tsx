'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { TrendingUp, Package, Bell, ShoppingBag, Layers, Star, ChevronRight, X, ArrowUpDown } from 'lucide-react'

interface CollectionCard {
  id: string
  name: string
  number: string
  rarity?: string
  image_url?: string
  price_market?: number
  price_avg1?: number
  price_avg7?: number
  price_avg30?: number
  set_id?: string
}

// ── MINI SPARKLINE ────────────────────────────────────────────────────────
function MiniSparkline({ card }: { card: CollectionCard }) {
  const cur = card.price_market ?? 0
  const p30 = card.price_avg30 ?? 0
  const p7  = card.price_avg7  ?? 0
  const p1  = card.price_avg1  ?? 0

  const hasHistory = p30 > 0 || p7 > 0 || p1 > 0
  const pctChange  = p30 > 0 ? ((cur - p30) / p30) * 100 : 0
  const isUp       = pctChange >  1
  const isDown     = pctChange < -1
  const color      = isUp ? '#4ade80' : isDown ? '#f87171' : '#fbbf24'

  const points  = hasHistory ? [p30 || cur, p7 || cur, p1 || cur, cur] : [cur, cur, cur, cur]
  const minP    = Math.min(...points) * 0.95
  const maxP    = Math.max(...points) * 1.05
  const range   = maxP - minP || 1
  const W = 52, H = 22
  const xs = [2, 18, 36, 50]
  const ys = points.map(p => H - ((p - minP) / range) * (H - 4) - 1)
  const pathD = `M${xs[0]} ${ys[0]} C${xs[0]+6} ${ys[0]},${xs[1]-4} ${ys[1]},${xs[1]} ${ys[1]} C${xs[1]+6} ${ys[1]},${xs[2]-6} ${ys[2]},${xs[2]} ${ys[2]} C${xs[2]+4} ${ys[2]},${xs[3]-6} ${ys[3]},${xs[3]} ${ys[3]}`
  const areaD = `${pathD} L${xs[3]} ${H} L${xs[0]} ${H} Z`
  const gId   = `g${card.id.replace(/[^a-z0-9]/gi,'').slice(0,8)}`

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:3, flexShrink:0, minWidth:110 }}>
      {/* Preis */}
      <div style={{ fontSize:15, fontWeight:900, color:'#fff', letterSpacing:'-.01em', lineHeight:1 }}>
        {cur > 0 ? `€${cur.toFixed(2)}` : '–'}
      </div>

      {/* Sparkline */}
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow:'visible' }}>
        <defs>
          <linearGradient id={gId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity=".4"/>
            <stop offset="100%" stopColor={color} stopOpacity="0"/>
          </linearGradient>
        </defs>
        <path d={areaD} fill={`url(#${gId})`}/>
        <path d={pathD} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx={xs[0]} cy={ys[0]} r="1.5" fill={color} opacity=".3"/>
        <circle cx={xs[1]} cy={ys[1]} r="1.5" fill={color} opacity=".5"/>
        <circle cx={xs[2]} cy={ys[2]} r="1.5" fill={color} opacity=".7"/>
        <circle cx={xs[3]} cy={ys[3]} r="3"   fill={color}/>
      </svg>

      {/* Badge */}
      <div style={{
        display:'flex', alignItems:'center', gap:2,
        borderRadius:20, padding:'1px 6px',
        fontSize:9, fontWeight:800, letterSpacing:'.04em',
        background: isUp ? 'rgba(74,222,128,.1)' : isDown ? 'rgba(248,113,113,.1)' : 'rgba(251,191,36,.1)',
        color, border:`1px solid ${color}33`,
      }}>
        {isUp   && '▲ '}
        {isDown && '▼ '}
        {!isUp && !isDown && '● '}
        {hasHistory ? `${pctChange > 0 ? '+' : ''}${pctChange.toFixed(1)}%` : 'kein Trend'}
      </div>
    </div>
  )
}

// ── PORTFOLIO MODAL ───────────────────────────────────────────────────────
function PortfolioModal({ cards, totalValue, onClose }: {
  cards: CollectionCard[]
  totalValue: number
  onClose: () => void
}) {
  const [sortBy, setSortBy] = useState<'value'|'name'>('value')

  const sorted = [...cards].sort((a, b) =>
    sortBy === 'value'
      ? (b.price_market ?? 0) - (a.price_market ?? 0)
      : a.name.localeCompare(b.name)
  )

  const accentFor = (rarity?: string) => {
    if (!rarity) return '#a78bfa'
    const r = rarity.toLowerCase()
    if (r.includes('holo') || r.includes('rare')) return '#fbbf24'
    if (r.includes('ultra') || r.includes('secret')) return '#f472b6'
    if (r.includes('common')) return '#60a5fa'
    return '#a78bfa'
  }

  return (
    <div
      style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:16, background:'rgba(0,0,0,0.85)', backdropFilter:'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity:0, scale:0.95, y:20 }}
        animate={{ opacity:1, scale:1, y:0 }}
        exit={{ opacity:0, scale:0.95, y:20 }}
        transition={{ type:'spring', stiffness:300, damping:25 }}
        onClick={e => e.stopPropagation()}
        style={{ width:'100%', maxWidth:620, maxHeight:'88vh', borderRadius:20, overflow:'hidden', display:'flex', flexDirection:'column', background:'rgba(7,2,26,0.99)', border:'1.5px solid rgba(167,139,250,.3)', boxShadow:'0 25px 60px rgba(0,0,0,.7)' }}
      >
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 18px', borderBottom:'1px solid rgba(255,255,255,.05)' }}>
          <div>
            <div style={{ color:'#fff', fontWeight:900, fontSize:16 }}>Mein Portfolio</div>
            <div style={{ color:'rgba(255,255,255,.35)', fontSize:11, marginTop:2 }}>
              {cards.length} Karten · <span style={{ color:'#4ade80', fontWeight:700 }}>€{totalValue.toFixed(2)}</span> Gesamtwert
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <button
              onClick={() => setSortBy(s => s === 'value' ? 'name' : 'value')}
              style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 10px', borderRadius:10, fontSize:11, fontWeight:600, color:'rgba(255,255,255,.5)', background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.08)', cursor:'pointer' }}
            >
              <ArrowUpDown size={11}/> {sortBy === 'value' ? 'Nach Wert' : 'Nach Name'}
            </button>
            <button
              onClick={onClose}
              style={{ width:30, height:30, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,.4)', background:'rgba(255,255,255,.05)', border:'none', cursor:'pointer' }}
            >
              <X size={14}/>
            </button>
          </div>
        </div>

        {/* Liste */}
        <div style={{ overflowY:'auto', flex:1, padding:'10px 12px', display:'flex', flexDirection:'column', gap:6 }}>
          {sorted.length === 0 ? (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'60px 0', textAlign:'center' }}>
              <div style={{ fontSize:40, marginBottom:12, opacity:.2 }}>📦</div>
              <div style={{ color:'rgba(255,255,255,.3)', fontSize:13 }}>Noch keine Karten im Portfolio</div>
            </div>
          ) : sorted.map((card, i) => {
            const accent = accentFor(card.rarity)
            return (
              <motion.div
                key={card.id}
                initial={{ opacity:0, x:-8 }}
                animate={{ opacity:1, x:0 }}
                transition={{ delay: i * 0.012 }}
                style={{
                  display:'flex', alignItems:'center', gap:10,
                  padding:'8px 12px', borderRadius:14,
                  background:'#07021a',
                  border:'1.5px solid rgba(167,139,250,.15)',
                  position:'relative', overflow:'hidden',
                }}
              >
                {/* Typ-Streifen */}
                <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${accent},transparent)`, borderRadius:'14px 14px 0 0' }}/>

                {/* Pokéball BG */}
                <svg style={{ position:'absolute', right:-8, top:'50%', transform:'translateY(-50%)', width:50, height:50, opacity:.04 }} viewBox="0 0 60 60">
                  <circle cx="30" cy="30" r="28" fill="none" stroke="white" strokeWidth="2"/>
                  <path d="M2 30 Q2 4 30 4 Q58 4 58 30" fill="white" fillOpacity=".5"/>
                  <line x1="2" y1="30" x2="58" y2="30" stroke="white" strokeWidth="3"/>
                  <circle cx="30" cy="30" r="8" fill="none" stroke="white" strokeWidth="2"/>
                  <circle cx="30" cy="30" r="4" fill="white" fillOpacity=".6"/>
                </svg>

                {/* Rang */}
                <span style={{ color:'rgba(255,255,255,.15)', fontSize:11, fontFamily:'monospace', width:16, textAlign:'right', flexShrink:0 }}>{i+1}</span>

                {/* Bild */}
                {card.image_url ? (
                  <img src={card.image_url} alt={card.name} style={{ width:34, height:47, objectFit:'cover', borderRadius:6, flexShrink:0, border:`1px solid ${accent}44` }}/>
                ) : (
                  <div style={{ width:34, height:47, borderRadius:6, background:'rgba(255,255,255,.05)', flexShrink:0, border:`1px solid ${accent}33` }}/>
                )}

                {/* Info – flex:1 damit es den restlichen Platz füllt */}
                <div style={{ flex:1, minWidth:0, paddingRight:8 }}>
                  <div style={{ color:'#fff', fontSize:13, fontWeight:800, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{card.name}</div>
                  <div style={{ display:'flex', gap:5, alignItems:'center', marginTop:3, flexWrap:'wrap' }}>
                    <span style={{ fontSize:9, fontWeight:700, padding:'1px 5px', borderRadius:8, background:`${accent}18`, color:accent, flexShrink:0 }}>#{card.number}</span>
                    {card.set_id && <span style={{ color:'rgba(255,255,255,.2)', fontSize:10, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{card.set_id}</span>}
                  </div>
                  {card.rarity && <div style={{ color:'rgba(255,255,255,.18)', fontSize:10, marginTop:2 }}>{card.rarity}</div>}
                </div>

                {/* Sparkline + Preis */}
                <MiniSparkline card={card}/>
              </motion.div>
            )
          })}
        </div>

        {/* Footer */}
        <div style={{ padding:'10px 18px', borderTop:'1px solid rgba(255,255,255,.05)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ color:'rgba(255,255,255,.25)', fontSize:11 }}>{cards.length} Karten gesamt</span>
          <Link href="/dashboard/portfolio" onClick={onClose} style={{ fontSize:11, fontWeight:700, color:'#a78bfa' }}>Zum Portfolio →</Link>
        </div>
      </motion.div>
    </div>
  )
}

// ── POKEBALL CARD ─────────────────────────────────────────────────────────
function PokeballCard({ label, onClick, href, sublabel, value, color }: {
  label:string; onClick?:()=>void; href?:string; sublabel:string; value:string; color:string
}) {
  const inner = (
    <div style={{ position:'relative', borderRadius:20, overflow:'hidden', aspectRatio:'1', background:'linear-gradient(160deg,rgba(20,12,40,0.97),rgba(6,2,18,0.99))' }}>
      <div style={{ position:'absolute', inset:0, borderRadius:20, pointerEvents:'none', boxShadow:`inset 0 0 0 1.5px ${color}44, 0 0 20px ${color}18` }}/>
      <svg viewBox="0 0 100 100" style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity:.15 }}>
        <circle cx="50" cy="50" r="46" fill="none" stroke={color} strokeWidth="1.5"/>
        <path d="M4 50 Q4 8 50 8 Q96 8 96 50" fill={color} fillOpacity="0.3"/>
        <line x1="4" y1="50" x2="96" y2="50" stroke={color} strokeWidth="2.5" strokeOpacity="0.8"/>
        <circle cx="50" cy="50" r="12" fill="none" stroke={color} strokeWidth="2"/>
        <circle cx="50" cy="50" r="6" fill={color} fillOpacity="0.5"/>
      </svg>
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', justifyContent:'space-between', padding:16 }}>
        <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.1em', color }}>{label}</div>
        <div>
          <div style={{ fontSize:24, fontWeight:900, color:'#fff', letterSpacing:'-.02em' }}>{value}</div>
          <div style={{ fontSize:10, color:'rgba(255,255,255,.3)', fontWeight:500, marginTop:2 }}>{sublabel}</div>
        </div>
      </div>
    </div>
  )
  return (
    <motion.div whileHover={{ y:-6, scale:1.03 }} whileTap={{ scale:0.97 }} transition={{ type:'spring', stiffness:300, damping:20 }} style={{ cursor:'pointer' }} onClick={onClick}>
      {onClick ? inner : <Link href={href ?? '#'}>{inner}</Link>}
    </motion.div>
  )
}

function TcgCard({ label, href, icon: Icon, color, gradient, description, badge }: {
  label:string; href:string; icon:React.ElementType; color:string; gradient:string; description:string; badge?:string
}) {
  return (
    <motion.div whileHover={{ y:-8, rotate:-0.5 }} whileTap={{ scale:0.98 }} transition={{ type:'spring', stiffness:300, damping:22 }}>
      <Link href={href} className="block relative rounded-[18px] overflow-hidden" style={{ background:'linear-gradient(160deg,rgba(22,14,44,0.97),rgba(8,4,20,0.99))' }}>
        <div className="h-[5px]" style={{ background:gradient }}/>
        <div className="flex gap-1.5 px-3.5 pt-2.5">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="w-2 h-2 rounded-full" style={{ background:i<=4?color:'rgba(255,255,255,0.1)', boxShadow:i<=4?`0 0 4px ${color}88`:'none' }}/>
          ))}
        </div>
        <div className="flex items-center justify-center py-5">
          <div style={{ position:'relative' }}>
            <div style={{ position:'absolute', inset:0, borderRadius:'50%', filter:'blur(16px)', opacity:.5, background:color, transform:'scale(1.5)' }}/>
            <div style={{ position:'relative', width:56, height:56, borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', background:`${color}18`, border:`1px solid ${color}44` }}>
              <Icon size={26} style={{ color }}/>
            </div>
          </div>
        </div>
        <div className="px-3.5 pb-1">
          <div className="text-base font-black text-white tracking-tight">{label}</div>
          {badge && <span className="text-[9px] font-black px-2 py-0.5 rounded-full mt-1 inline-block" style={{ background:`${color}18`, color, border:`1px solid ${color}40` }}>{badge}</span>}
        </div>
        <div className="mx-3.5 my-2 h-px" style={{ background:`linear-gradient(90deg,transparent,${color}44,transparent)` }}/>
        <div className="px-3.5 pb-4 flex items-center justify-between">
          <span className="text-[10px] text-white/40 font-medium">{description}</span>
          <ChevronRight size={12} className="text-white/25"/>
        </div>
        <div className="absolute inset-0 rounded-[18px] pointer-events-none" style={{ boxShadow:`inset 0 0 0 1.5px ${color}33` }}/>
      </Link>
    </motion.div>
  )
}

function GlassCard({ label, href, icon: Icon, value, sub, color, accentColor }: {
  label:string; href:string; icon:React.ElementType; value:string; sub:string; color:string; accentColor:string
}) {
  return (
    <motion.div whileHover={{ y:-4, scale:1.02 }} whileTap={{ scale:0.98 }} transition={{ type:'spring', stiffness:300, damping:22 }}>
      <Link href={href} className="block relative rounded-2xl overflow-hidden p-5" style={{ background:'rgba(255,255,255,0.04)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.09)' }}>
        <div className="absolute top-0 left-6 right-6 h-[1px]" style={{ background:`linear-gradient(90deg,transparent,${accentColor}88,transparent)` }}/>
        <div className="flex items-start justify-between mb-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:`${color}18`, border:`1px solid ${color}30` }}>
            <Icon size={16} style={{ color }}/>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/25">{label}</span>
        </div>
        <div className="text-2xl font-black text-white tracking-tight">{value}</div>
        <div className="text-xs mt-1 font-medium" style={{ color }}>{sub}</div>
      </Link>
    </motion.div>
  )
}

// ── MAIN ──────────────────────────────────────────────────────────────────
interface Props {
  totalCards: number
  isPremium: boolean
  portfolioValue?: number
  collectionCards?: CollectionCard[]
}

export default function DashboardCards({ totalCards, isPremium, portfolioValue = 0, collectionCards = [] }: Props) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <div className="space-y-8">
        <div>
          <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-4">Übersicht</div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <PokeballCard label="Karten" href="/dashboard/portfolio" value={String(totalCards)} sublabel="im Portfolio" color="#a78bfa"/>
            <PokeballCard label="Wert" onClick={() => setShowModal(true)} value={portfolioValue > 0 ? `€${portfolioValue.toFixed(0)}` : '€0'} sublabel="Gesamtwert · Klicken" color="#00e676"/>
            <PokeballCard label="Alerts" href="/dashboard/alerts" value="0" sublabel="aktiv" color="#FFD700"/>
            <PokeballCard label="Angebote" href="/dashboard/marketplace" value="0" sublabel="Marktplatz" color="#38bdf8"/>
          </div>
        </div>
        <div>
          <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-4">Features</div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <TcgCard label="Portfolio" href="/dashboard/portfolio" icon={TrendingUp} color="#a78bfa" gradient="linear-gradient(135deg,#a78bfa,#7c3aed)" description="Wert tracken" badge="RARE"/>
            <TcgCard label="Set-Tracker" href="/dashboard/sets" icon={Layers} color="#38bdf8" gradient="linear-gradient(135deg,#38bdf8,#0284c7)" description="Fortschritt" badge="HOLO"/>
            <TcgCard label="Marktplatz" href="/dashboard/marketplace" icon={ShoppingBag} color="#00e676" gradient="linear-gradient(135deg,#00e676,#059669)" description="Kaufen & verkaufen"/>
            <TcgCard label="Preis-Alerts" href="/dashboard/alerts" icon={Bell} color="#FFD700" gradient="linear-gradient(135deg,#FFD700,#d97706)" description="Benachrichtigungen"/>
          </div>
        </div>
        {!isPremium && (
          <div>
            <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-4">Premium freischalten</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <GlassCard label="Pro Scanner" href="/dashboard/premium" icon={Package} value="Unlimitiert" sub="Condition-Erkennung" color="#a78bfa" accentColor="#7c3aed"/>
              <GlassCard label="Live Alerts" href="/dashboard/premium" icon={Bell} value="Echtzeit" sub="E-Mail Benachrichtigung" color="#38bdf8" accentColor="#0284c7"/>
              <GlassCard label="Premium" href="/dashboard/premium" icon={Star} value="4,99 €/Mo" sub="Alle Features freischalten" color="#FFD700" accentColor="#d97706"/>
            </div>
          </div>
        )}
      </div>
      <AnimatePresence>
        {showModal && (
          <PortfolioModal cards={collectionCards} totalValue={portfolioValue} onClose={() => setShowModal(false)}/>
        )}
      </AnimatePresence>
    </>
  )
}
