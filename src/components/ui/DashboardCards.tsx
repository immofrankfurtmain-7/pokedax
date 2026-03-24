'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { TrendingUp, Package, Bell, ShoppingBag, Layers, Star, ChevronRight, X, ArrowUpDown } from 'lucide-react'

// ── TYPEN ─────────────────────────────────────────────────────────────────
interface CollectionCard {
  id: string
  name: string
  number: string
  image_url?: string
  price_market?: number
  set_id?: string
}

// ── PORTFOLIO MODAL ───────────────────────────────────────────────────────
function PortfolioModal({
  cards,
  totalValue,
  onClose,
}: {
  cards: CollectionCard[]
  totalValue: number
  onClose: () => void
}) {
  const [sortBy, setSortBy] = useState<'value' | 'name'>('value')

  const sorted = [...cards].sort((a, b) => {
    if (sortBy === 'value') return (b.price_market ?? 0) - (a.price_market ?? 0)
    return a.name.localeCompare(b.name)
  })

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[85vh] rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: 'rgba(10,4,28,0.98)',
          border: '1px solid rgba(167,139,250,0.2)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div>
            <h2 className="text-white font-black text-lg">Mein Portfolio</h2>
            <p className="text-white/40 text-xs mt-0.5">
              {cards.length} Karten · Gesamtwert{' '}
              <span className="text-green-400 font-bold">€{totalValue.toFixed(2)}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Sort Toggle */}
            <button
              onClick={() => setSortBy(s => s === 'value' ? 'name' : 'value')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white/50 hover:text-white transition-colors"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <ArrowUpDown size={12} />
              {sortBy === 'value' ? 'Nach Wert' : 'Nach Name'}
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white transition-colors"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Kartenliste */}
        <div className="overflow-y-auto flex-1 px-4 py-3 space-y-2">
          {sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="text-4xl mb-3 opacity-20">📦</div>
              <p className="text-white/30 text-sm">Noch keine Karten im Portfolio</p>
              <Link
                href="/dashboard/portfolio"
                onClick={onClose}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-violet-300"
                style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)' }}
              >
                Portfolio öffnen →
              </Link>
            </div>
          ) : (
            sorted.map((card, i) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                className="flex items-center gap-3 px-3 py-2 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                {/* Rang */}
                <span className="text-white/20 text-xs font-mono w-5 text-right flex-shrink-0">
                  {i + 1}
                </span>

                {/* Bild */}
                {card.image_url ? (
                  <img
                    src={card.image_url}
                    alt={card.name}
                    className="w-9 h-12 object-cover rounded-md flex-shrink-0"
                  />
                ) : (
                  <div className="w-9 h-12 rounded-md bg-gray-800 flex-shrink-0" />
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{card.name}</p>
                  <p className="text-white/30 text-xs">
                    #{card.number}
                    {card.set_id && (
                      <span className="ml-2 text-white/20">{card.set_id}</span>
                    )}
                  </p>
                </div>

                {/* Preis */}
                <div className="text-right flex-shrink-0">
                  {card.price_market ? (
                    <span className="text-green-400 font-black text-sm">
                      €{card.price_market.toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-white/20 text-xs">–</span>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/5 flex justify-between items-center">
          <span className="text-white/30 text-xs">{cards.length} Karten gesamt</span>
          <Link
            href="/dashboard/portfolio"
            onClick={onClose}
            className="text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors"
          >
            Zum Portfolio →
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

// ── POKEBALL CARD ──────────────────────────────────────────────────────────
function PokeballCard({
  label, onClick, href, sublabel, value, color
}: {
  label: string
  onClick?: () => void
  href?: string
  sublabel: string
  value: string
  color: string
}) {
  const inner = (
    <div className="block relative rounded-[20px] overflow-hidden aspect-square"
      style={{ background: 'linear-gradient(160deg,rgba(20,12,40,0.97),rgba(6,2,18,0.99))' }}>
      <div className="absolute inset-0 rounded-[20px] pointer-events-none"
        style={{ boxShadow: `inset 0 0 0 1.5px ${color}44, 0 0 20px ${color}18` }} />
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-15">
        <circle cx="50" cy="50" r="46" fill="none" stroke={color} strokeWidth="1.5" />
        <path d="M4 50 Q4 8 50 8 Q96 8 96 50" fill={color} fillOpacity="0.3" />
        <line x1="4" y1="50" x2="96" y2="50" stroke={color} strokeWidth="2.5" strokeOpacity="0.8" />
        <circle cx="50" cy="50" r="12" fill="none" stroke={color} strokeWidth="2" />
        <circle cx="50" cy="50" r="6" fill={color} fillOpacity="0.5" />
      </svg>
      <div className="absolute inset-0 flex flex-col justify-between p-4">
        <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color }}>{label}</div>
        <div>
          <div className="text-2xl font-black text-white tracking-tight">{value}</div>
          <div className="text-[10px] text-white/35 font-medium mt-0.5">{sublabel}</div>
        </div>
      </div>
    </div>
  )

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="cursor-pointer"
      onClick={onClick}
    >
      {onClick ? inner : <Link href={href ?? '#'}>{inner}</Link>}
    </motion.div>
  )
}

// ── TCG CARD ──────────────────────────────────────────────────────────────
function TcgCard({ label, href, icon: Icon, color, gradient, description, badge }:
  { label: string; href: string; icon: React.ElementType; color: string; gradient: string; description: string; badge?: string }) {
  return (
    <motion.div whileHover={{ y: -8, rotate: -0.5 }} whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}>
      <Link href={href} className="block relative rounded-[18px] overflow-hidden"
        style={{ background: 'linear-gradient(160deg,rgba(22,14,44,0.97),rgba(8,4,20,0.99))' }}>
        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-[18px]"
          style={{ background: 'linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.04) 40%,rgba(192,132,252,0.08) 48%,rgba(148,196,255,0.06) 54%,transparent 65%)' }} />
        <div className="h-[5px]" style={{ background: gradient }} />
        <div className="flex gap-1.5 px-3.5 pt-2.5">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="w-2 h-2 rounded-full transition-all"
              style={{ background: i <= 4 ? color : 'rgba(255,255,255,0.1)', boxShadow: i <= 4 ? `0 0 4px ${color}88` : 'none' }} />
          ))}
        </div>
        <div className="flex items-center justify-center py-5">
          <div className="relative">
            <div className="absolute inset-0 rounded-full blur-xl opacity-50" style={{ background: color, transform: 'scale(1.5)' }} />
            <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: `${color}18`, border: `1px solid ${color}44` }}>
              <Icon size={26} style={{ color }} />
            </div>
          </div>
        </div>
        <div className="px-3.5 pb-1">
          <div className="text-base font-black text-white tracking-tight">{label}</div>
          {badge && (
            <span className="text-[9px] font-black px-2 py-0.5 rounded-full mt-1 inline-block"
              style={{ background: `${color}18`, color, border: `1px solid ${color}40` }}>{badge}</span>
          )}
        </div>
        <div className="mx-3.5 my-2 h-px" style={{ background: `linear-gradient(90deg,transparent,${color}44,transparent)` }} />
        <div className="px-3.5 pb-4 flex items-center justify-between">
          <span className="text-[10px] text-white/40 font-medium">{description}</span>
          <ChevronRight size={12} className="text-white/25 flex-shrink-0" />
        </div>
        <div className="absolute inset-0 rounded-[18px] pointer-events-none"
          style={{ boxShadow: `inset 0 0 0 1.5px ${color}33` }} />
      </Link>
    </motion.div>
  )
}

// ── GLASS CARD ────────────────────────────────────────────────────────────
function GlassCard({ label, href, icon: Icon, value, sub, color, accentColor }:
  { label: string; href: string; icon: React.ElementType; value: string; sub: string; color: string; accentColor: string }) {
  return (
    <motion.div whileHover={{ y: -4, scale: 1.02 }} whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}>
      <Link href={href} className="block relative rounded-2xl overflow-hidden p-5"
        style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px) saturate(1.5)',
          border: '1px solid rgba(255,255,255,0.09)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}>
        <div className="absolute top-0 left-6 right-6 h-[1px]"
          style={{ background: `linear-gradient(90deg,transparent,${accentColor}88,transparent)` }} />
        <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-20 blur-2xl"
          style={{ background: accentColor }} />
        <div className="flex items-start justify-between mb-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
            <Icon size={16} style={{ color }} />
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
  totalCards: number
  isPremium: boolean
  portfolioValue?: number
  collectionCards?: CollectionCard[]
}

export default function DashboardCards({
  totalCards,
  isPremium,
  portfolioValue = 0,
  collectionCards = [],
}: Props) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <div className="space-y-8">
        {/* Stats */}
        <div>
          <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-4">Übersicht</div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <PokeballCard
              label="Karten" href="/dashboard/portfolio"
              value={String(totalCards)} sublabel="im Portfolio" color="#a78bfa"
            />
            <PokeballCard
              label="Wert"
              onClick={() => setShowModal(true)}
              value={portfolioValue > 0 ? `€${portfolioValue.toFixed(0)}` : '€0'}
              sublabel="Gesamtwert · Klicken"
              color="#00e676"
            />
            <PokeballCard
              label="Alerts" href="/dashboard/alerts"
              value="0" sublabel="aktiv" color="#FFD700"
            />
            <PokeballCard
              label="Angebote" href="/dashboard/marketplace"
              value="0" sublabel="Marktplatz" color="#38bdf8"
            />
          </div>
        </div>

        {/* Features */}
        <div>
          <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-4">Features</div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <TcgCard label="Portfolio" href="/dashboard/portfolio"
              icon={TrendingUp} color="#a78bfa"
              gradient="linear-gradient(135deg,#a78bfa,#7c3aed)"
              description="Wert tracken" badge="RARE" />
            <TcgCard label="Set-Tracker" href="/dashboard/sets"
              icon={Layers} color="#38bdf8"
              gradient="linear-gradient(135deg,#38bdf8,#0284c7)"
              description="Fortschritt" badge="HOLO" />
            <TcgCard label="Marktplatz" href="/dashboard/marketplace"
              icon={ShoppingBag} color="#00e676"
              gradient="linear-gradient(135deg,#00e676,#059669)"
              description="Kaufen & verkaufen" />
            <TcgCard label="Preis-Alerts" href="/dashboard/alerts"
              icon={Bell} color="#FFD700"
              gradient="linear-gradient(135deg,#FFD700,#d97706)"
              description="Benachrichtigungen" />
          </div>
        </div>

        {/* Premium */}
        {!isPremium && (
          <div>
            <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-4">Premium freischalten</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <GlassCard label="Pro Scanner" href="/dashboard/premium"
                icon={Package} value="Unlimitiert" sub="Condition-Erkennung"
                color="#a78bfa" accentColor="#7c3aed" />
              <GlassCard label="Live Alerts" href="/dashboard/premium"
                icon={Bell} value="Echtzeit" sub="E-Mail Benachrichtigung"
                color="#38bdf8" accentColor="#0284c7" />
              <GlassCard label="Premium" href="/dashboard/premium"
                icon={Star} value="4,99 €/Mo" sub="Alle Features freischalten"
                color="#FFD700" accentColor="#d97706" />
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <PortfolioModal
            cards={collectionCards}
            totalValue={portfolioValue}
            onClose={() => setShowModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
