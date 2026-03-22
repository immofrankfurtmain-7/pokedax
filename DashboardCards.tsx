'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { TrendingUp, Package, Bell, ShoppingBag, Layers, Star, ChevronRight } from 'lucide-react'

// ── POKEBALL CARD ──────────────────────────────────────────────────────────
function PokeballCard({
  label, href, sublabel, value, color
}: { label:string; href:string; sublabel:string; value:string; color:string }) {
  return (
    <motion.div whileHover={{ y:-6, scale:1.03 }} whileTap={{ scale:0.97 }}
      transition={{ type:'spring', stiffness:300, damping:20 }}>
      <Link href={href} className="block relative rounded-[20px] overflow-hidden aspect-square"
        style={{ background:'linear-gradient(160deg,rgba(20,12,40,0.97),rgba(6,2,18,0.99))' }}>

        {/* Border glow */}
        <div className="absolute inset-0 rounded-[20px] pointer-events-none"
          style={{ boxShadow:`inset 0 0 0 1.5px ${color}44, 0 0 20px ${color}18` }}/>

        {/* Pokeball SVG fills the card */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-15">
          <circle cx="50" cy="50" r="46" fill="none" stroke={color} strokeWidth="1.5"/>
          <path d="M4 50 Q4 8 50 8 Q96 8 96 50" fill={color} fillOpacity="0.3"/>
          <line x1="4" y1="50" x2="96" y2="50" stroke={color} strokeWidth="2.5" strokeOpacity="0.8"/>
          <circle cx="50" cy="50" r="12" fill="none" stroke={color} strokeWidth="2"/>
          <circle cx="50" cy="50" r="6"  fill={color} fillOpacity="0.5"/>
        </svg>

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-between p-4">
          <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color }}>{label}</div>
          <div>
            <div className="text-2xl font-black text-white tracking-tight">{value}</div>
            <div className="text-[10px] text-white/35 font-medium mt-0.5">{sublabel}</div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

// ── TCG CARD STYLE ────────────────────────────────────────────────────────
function TcgCard({
  label, href, icon: Icon, color, gradient, description, badge
}: { label:string; href:string; icon:React.ElementType; color:string; gradient:string; description:string; badge?:string }) {
  return (
    <motion.div whileHover={{ y:-8, rotate:-0.5 }} whileTap={{ scale:0.98 }}
      transition={{ type:'spring', stiffness:300, damping:22 }}>
      <Link href={href} className="block relative rounded-[18px] overflow-hidden"
        style={{ background:'linear-gradient(160deg,rgba(22,14,44,0.97),rgba(8,4,20,0.99))' }}>

        {/* Holo shimmer */}
        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-[18px]"
          style={{ background:'linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.04) 40%,rgba(192,132,252,0.08) 48%,rgba(148,196,255,0.06) 54%,transparent 65%)' }}/>

        {/* Type stripe top */}
        <div className="h-[5px]" style={{ background: gradient }}/>

        {/* Rarity dots */}
        <div className="flex gap-1.5 px-3.5 pt-2.5">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="w-2 h-2 rounded-full transition-all"
              style={{ background: i <= 4 ? color : 'rgba(255,255,255,0.1)', boxShadow: i <= 4 ? `0 0 4px ${color}88` : 'none' }}/>
          ))}
        </div>

        {/* Icon area */}
        <div className="flex items-center justify-center py-5">
          <div className="relative">
            <div className="absolute inset-0 rounded-full blur-xl opacity-50" style={{ background:color, transform:'scale(1.5)' }}/>
            <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background:`${color}18`, border:`1px solid ${color}44` }}>
              <Icon size={26} style={{ color }}/>
            </div>
          </div>
        </div>

        {/* Name */}
        <div className="px-3.5 pb-1">
          <div className="text-base font-black text-white tracking-tight">{label}</div>
          {badge && (
            <span className="text-[9px] font-black px-2 py-0.5 rounded-full mt-1 inline-block"
              style={{ background:`${color}18`, color, border:`1px solid ${color}40` }}>{badge}</span>
          )}
        </div>

        {/* Divider */}
        <div className="mx-3.5 my-2 h-px" style={{ background:`linear-gradient(90deg,transparent,${color}44,transparent)` }}/>

        {/* Description */}
        <div className="px-3.5 pb-4 flex items-center justify-between">
          <span className="text-[10px] text-white/40 font-medium">{description}</span>
          <ChevronRight size={12} className="text-white/25 flex-shrink-0"/>
        </div>

        {/* Bottom border glow */}
        <div className="absolute inset-0 rounded-[18px] pointer-events-none"
          style={{ boxShadow:`inset 0 0 0 1.5px ${color}33` }}/>
      </Link>
    </motion.div>
  )
}

// ── MILCHGLAS CARD ────────────────────────────────────────────────────────
function GlassCard({
  label, href, icon: Icon, value, sub, color, accentColor
}: { label:string; href:string; icon:React.ElementType; value:string; sub:string; color:string; accentColor:string }) {
  return (
    <motion.div whileHover={{ y:-4, scale:1.02 }} whileTap={{ scale:0.98 }}
      transition={{ type:'spring', stiffness:300, damping:22 }}>
      <Link href={href} className="block relative rounded-2xl overflow-hidden p-5"
        style={{
          background:     'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px) saturate(1.5)',
          border:         '1px solid rgba(255,255,255,0.09)',
          boxShadow:      `0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)`,
        }}>

        {/* Accent top line */}
        <div className="absolute top-0 left-6 right-6 h-[1px]"
          style={{ background:`linear-gradient(90deg,transparent,${accentColor}88,transparent)` }}/>

        {/* Floating orb */}
        <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-20 blur-2xl"
          style={{ background: accentColor }}/>

        <div className="flex items-start justify-between mb-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background:`${color}18`, border:`1px solid ${color}30` }}>
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

// ── MAIN EXPORT ───────────────────────────────────────────────────────────
interface Props {
  totalCards:  number
  isPremium:   boolean
  portfolioValue?: number
}

export default function DashboardCards({ totalCards, isPremium, portfolioValue = 0 }: Props) {
  return (
    <div className="space-y-8">

      {/* Stats – Pokeball Style */}
      <div>
        <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-4">Übersicht</div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <PokeballCard label="Karten" href="/dashboard/portfolio" value={String(totalCards)} sublabel="im Portfolio" color="#a78bfa"/>
          <PokeballCard label="Wert" href="/dashboard/portfolio" value={portfolioValue > 0 ? `€${portfolioValue.toFixed(0)}` : '€ 0'} sublabel="Gesamtwert" color="#00e676"/>
          <PokeballCard label="Alerts" href="/dashboard/alerts" value="0" sublabel="aktiv" color="#FFD700"/>
          <PokeballCard label="Angebote" href="/dashboard/marketplace" value="0" sublabel="Marktplatz" color="#38bdf8"/>
        </div>
      </div>

      {/* Schnellzugriff – TCG Card Style */}
      <div>
        <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-4">Features</div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <TcgCard label="Portfolio" href="/dashboard/portfolio"
            icon={TrendingUp} color="#a78bfa"
            gradient="linear-gradient(135deg,#a78bfa,#7c3aed)"
            description="Wert tracken" badge="RARE"/>
          <TcgCard label="Set-Tracker" href="/dashboard/sets"
            icon={Layers} color="#38bdf8"
            gradient="linear-gradient(135deg,#38bdf8,#0284c7)"
            description="Fortschritt" badge="HOLO"/>
          <TcgCard label="Marktplatz" href="/dashboard/marketplace"
            icon={ShoppingBag} color="#00e676"
            gradient="linear-gradient(135deg,#00e676,#059669)"
            description="Kaufen & verkaufen"/>
          <TcgCard label="Preis-Alerts" href="/dashboard/alerts"
            icon={Bell} color="#FFD700"
            gradient="linear-gradient(135deg,#FFD700,#d97706)"
            description="Benachrichtigungen"/>
        </div>
      </div>

      {/* Premium – Milchglas */}
      {!isPremium && (
        <div>
          <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-4">Premium freischalten</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <GlassCard label="Pro Scanner" href="/dashboard/premium"
              icon={Package} value="Unlimitiert" sub="Condition-Erkennung"
              color="#a78bfa" accentColor="#7c3aed"/>
            <GlassCard label="Live Alerts" href="/dashboard/premium"
              icon={Bell} value="Echtzeit" sub="E-Mail Benachrichtigung"
              color="#38bdf8" accentColor="#0284c7"/>
            <GlassCard label="Premium" href="/dashboard/premium"
              icon={Star} value="4,99 €/Mo" sub="Alle Features freischalten"
              color="#FFD700" accentColor="#d97706"/>
          </div>
        </div>
      )}
    </div>
  )
}
