'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star, Check, X, Zap, Shield, BarChart2, ShoppingBag, Bell, Layers, CreditCard } from 'lucide-react'
import { toast } from 'sonner'

const FEATURES_PREMIUM = [
  { icon: Zap,         text: 'Unlimitierter Pro-Scanner mit Condition-Erkennung' },
  { icon: BarChart2,   text: 'Portfolio-Tracker mit Live-Charts und Gewinnanalyse' },
  { icon: Layers,      text: 'Set-Tracker für alle Pokémon TCG Sets' },
  { icon: ShoppingBag, text: 'Interner Marktplatz – kaufe/verkaufe direkt' },
  { icon: Bell,        text: 'Realtime Preis-Alerts per E-Mail' },
  { icon: Shield,      text: 'Ad-free + Exklusive Forum-Channels' },
]

export default function PremiumPage() {
  const [loading, setLoading] = useState<'monthly' | 'yearly' | null>(null)
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')

  const handleCheckout = async (plan: 'monthly' | 'yearly') => {
    setLoading(plan)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const { url, error } = await res.json()
      if (error) { toast.error(error); return }
      window.location.href = url
    } catch {
      toast.error('Fehler beim Weiterleiten zu Stripe.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-10">
        <div className="text-[11px] font-bold text-violet-400 uppercase tracking-widest mb-1.5">Dashboard</div>
        <h1 className="text-3xl font-black text-white tracking-tight">Premium werden</h1>
        <p className="text-white/40 text-sm mt-1">Schalte alle Features frei und hole das Maximum aus deiner Sammlung</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Features list */}
        <div>
          <h2 className="text-base font-bold text-white/60 mb-5 uppercase text-xs tracking-widest">Was du bekommst</h2>
          <div className="space-y-3">
            {FEATURES_PREMIUM.map(({ icon: Icon, text }) => (
              <motion.div key={text}
                initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }}
                className="flex items-center gap-3 bg-white/2 border border-white/6 rounded-xl px-4 py-3">
                <div className="w-8 h-8 rounded-xl bg-violet-950/60 border border-violet-700/30 flex items-center justify-center flex-shrink-0">
                  <Icon size={14} className="text-violet-400"/>
                </div>
                <span className="text-sm text-white/70 font-medium">{text}</span>
                <Check size={13} className="text-green-400 ml-auto flex-shrink-0"/>
              </motion.div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="mt-6 bg-violet-950/30 border border-violet-800/25 rounded-2xl p-5">
            <div className="text-yellow-400 text-sm mb-2">★★★★★</div>
            <p className="text-sm text-white/55 italic leading-relaxed font-normal">
              „Dank PokeDax habe ich meinen Glurak ex genau zum richtigen Zeitpunkt verkauft – 40€ mehr als ich gedacht hätte."
            </p>
            <div className="text-xs text-white/30 mt-3 font-medium">— SammelFan_NRW, Essen</div>
          </div>
        </div>

        {/* Pricing card */}
        <div>
          {/* Billing toggle */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex gap-1 bg-white/4 border border-white/8 rounded-xl p-1">
              {(['monthly', 'yearly'] as const).map(b => (
                <button key={b} onClick={() => setBilling(b)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${billing === b ? 'bg-violet-600/40 text-violet-200 border border-violet-600/30' : 'text-white/35 hover:text-white/65'}`}>
                  {b === 'monthly' ? 'Monatlich' : 'Jährlich'}
                </button>
              ))}
            </div>
            {billing === 'yearly' && (
              <span className="text-[10px] font-black px-2 py-1 rounded-full bg-green-950/60 border border-green-500/30 text-green-400">
                2 Monate GRATIS
              </span>
            )}
          </div>

          {/* Main plan card */}
          <motion.div layout
            className="bg-gradient-to-b from-violet-950/70 to-[rgba(4,2,14,0.95)] border border-violet-700/40 rounded-2xl p-7 shadow-[0_0_50px_rgba(124,58,237,0.12),inset_0_1px_0_rgba(167,139,250,0.1)] mb-4">
            <div className="flex items-center gap-2 mb-1">
              <Star size={16} className="text-yellow-400"/>
              <span className="text-sm font-black text-white">Premium</span>
            </div>
            <div className="flex items-end gap-2 mb-1">
              <div className="text-5xl font-black text-white tracking-tight">
                {billing === 'monthly' ? '4,99' : '3,99'}
              </div>
              <div className="text-white/40 text-sm font-medium pb-1.5">€/Monat</div>
            </div>
            {billing === 'yearly' && (
              <div className="text-xs text-white/35 mb-4">= 47,88 €/Jahr · <span className="text-green-400 font-bold">Spare 11,88 €</span></div>
            )}
            <div className="text-xs text-white/30 mb-6">{billing === 'monthly' ? 'Monatlich kündbar' : 'Jährlich abgerechnet'}</div>

            <button
              onClick={() => handleCheckout(billing)}
              disabled={loading !== null}
              className="w-full py-3.5 rounded-xl font-bold text-base bg-gradient-to-r from-violet-600 to-purple-500 text-white shadow-[0_8px_28px_rgba(124,58,237,0.5)] hover:shadow-[0_12px_36px_rgba(124,58,237,0.65)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all flex items-center justify-center gap-2"
            >
              <CreditCard size={16}/>
              {loading === billing ? 'Weiterleitung zu Stripe…' : 'Jetzt Premium werden'}
            </button>

            <div className="flex items-center justify-center gap-4 mt-4">
              <img src="https://js.stripe.com/v3/fingerprinted/img/visa-365725566f9578a9589553aa9296d178.svg" alt="Visa" className="h-5 opacity-40"/>
              <img src="https://js.stripe.com/v3/fingerprinted/img/mastercard-4d8844094130711885b5e41b28c9848f.svg" alt="MC" className="h-5 opacity-40"/>
              <div className="flex items-center gap-1 text-[10px] text-white/30">
                <Shield size={10}/> SSL-verschlüsselt
              </div>
            </div>
          </motion.div>

          {/* Free plan comparison */}
          <div className="bg-white/2 border border-white/6 rounded-2xl p-5">
            <div className="text-xs font-bold text-white/35 uppercase tracking-widest mb-3">Free vs Premium</div>
            {[
              ['5 Scans/Tag', 'Unlimitierte Scans'],
              ['Kein Portfolio', 'Portfolio + Charts'],
              ['Kein Set-Tracker', 'Alle Sets tracken'],
              ['Kein Marktplatz', 'Kaufen & Verkaufen'],
              ['Kein Alerts', 'Realtime Preis-Alerts'],
            ].map(([free, premium], i) => (
              <div key={i} className="flex items-center gap-2 py-2 border-b border-white/4 last:border-0 text-xs">
                <div className="flex-1 flex items-center gap-1.5 text-white/30">
                  <X size={10} className="text-white/20 flex-shrink-0"/> {free}
                </div>
                <div className="flex-1 flex items-center gap-1.5 text-green-400">
                  <Check size={10} className="flex-shrink-0"/> {premium}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
