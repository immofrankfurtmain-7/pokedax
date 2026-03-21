'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { BarChart2, ShoppingBag, Bell, Shield, Layers, Star, Check, X } from 'lucide-react'

const PREMIUM_FEATURES = [
  { icon: BarChart2, title: 'Portfolio-Tracker',    desc: 'Verfolge den Wert deiner Sammlung mit Live-Charts und Gewinn-/Verlustanalyse.' },
  { icon: Layers,    title: 'Set-Tracker',          desc: 'Sieh auf einen Blick welche Karten dir noch fehlen und wie viel dein Set wert ist.' },
  { icon: ShoppingBag, title: 'Interner Marktplatz', desc: 'Kaufe und verkaufe direkt an andere Sammler. Angebote, Chat & Preisverhandlung.' },
  { icon: Bell,      title: 'Preis-Alerts',         desc: 'Erhalte sofort eine Benachrichtigung wenn eine Karte deinen Zielpreis erreicht.' },
  { icon: Shield,    title: 'Pro-Scanner',          desc: 'Unlimitiertes Scannen inkl. Condition-Erkennung (PSA-Klasse) und Alt-Art-Detection.' },
  { icon: Star,      title: 'Ad-free & Exklusiv',  desc: 'Keine Werbung, exklusive Forum-Bereiche und Priority-Support.' },
]

const PLANS = [
  {
    name: 'Free',
    price: '0 €',
    period: 'für immer',
    featured: false,
    badge: null,
    features: [
      [true,  '5 Scans pro Tag'],
      [true,  'Basis-Preischeck'],
      [true,  'Forum lesen'],
      [false, 'Unlimitierter Scanner'],
      [false, 'Portfolio-Tracker'],
      [false, 'Set-Tracker'],
      [false, 'Interner Marktplatz'],
      [false, 'Preis-Alerts'],
    ],
    cta: 'Kostenlos starten',
    ctaHref: '/auth/register',
    solid: false,
  },
  {
    name: 'Premium',
    price: '4,99 €',
    period: 'pro Monat',
    featured: true,
    badge: 'BELIEBTESTE WAHL',
    features: [
      [true, 'Unlimitierter Pro-Scanner'],
      [true, 'Vollständiger Preischeck'],
      [true, 'Portfolio-Tracker + Charts'],
      [true, 'Set-Tracker (alle Sets)'],
      [true, 'Interner Marktplatz'],
      [true, 'Realtime Preis-Alerts'],
      [true, 'Exklusive Forum-Channels'],
      [true, '2× Grading-Beratung/Mo'],
    ],
    cta: 'Premium werden',
    ctaHref: '/dashboard/premium',
    solid: true,
  },
  {
    name: 'Händler',
    price: '19,99 €',
    period: 'pro Monat',
    featured: false,
    badge: null,
    features: [
      [true, 'Alles aus Premium'],
      [true, 'Verified Seller Badge'],
      [true, 'Eigene Shop-Seite'],
      [true, 'Top-Platzierung Marktplatz'],
      [true, 'Monatliche Marktanalyse'],
      [true, 'Priority Support 24/7'],
      [true, 'API-Zugang (Beta)'],
      [true, 'Unlimitierte Grading-Beratung'],
    ],
    cta: 'Händler werden',
    ctaHref: '/dashboard/premium?plan=dealer',
    solid: false,
  },
]

export default function PremiumSection() {
  return (
    <section className="relative z-10 py-24 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 text-[11px] font-bold text-violet-400 uppercase tracking-widest mb-4">
            <Star size={12}/>
            Premium
          </div>
          <h2 className="text-4xl font-black text-white tracking-tight mb-4">
            Hole das Maximum<br/>
            <span className="gradient-text">aus deiner Sammlung</span>
          </h2>
          <p className="text-white/40 text-base max-w-md mx-auto">
            Premium-Mitglieder steigern den Wert ihrer Sammlung im Schnitt um 18% im ersten Monat.
          </p>
        </motion.div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-20">
          {PREMIUM_FEATURES.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="group bg-white/2 border border-white/6 rounded-2xl p-5 hover:bg-violet-950/20 hover:border-violet-800/30 transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-violet-950/60 border border-violet-800/40 flex items-center justify-center mb-3 group-hover:border-violet-600/50 transition-colors">
                <Icon size={17} className="text-violet-400"/>
              </div>
              <h3 className="text-sm font-bold text-white mb-1.5">{title}</h3>
              <p className="text-xs text-white/38 leading-relaxed font-normal">{desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Pricing plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1 ${
                plan.featured
                  ? 'bg-gradient-to-b from-violet-950/60 to-[rgba(4,2,14,0.9)] border border-violet-700/40 shadow-[0_0_40px_rgba(124,58,237,0.12),inset_0_1px_0_rgba(167,139,250,0.1)]'
                  : 'bg-white/2 border border-white/7'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-purple-500 text-white text-[10px] font-black px-4 py-1 rounded-full tracking-wider shadow-[0_4px_14px_rgba(124,58,237,0.45)]">
                  {plan.badge}
                </div>
              )}

              <div className="text-lg font-black text-white mb-1">{plan.name}</div>
              <div className="text-4xl font-black text-white tracking-tight">{plan.price}</div>
              <div className="text-xs text-white/30 mt-1 mb-6">{plan.period}</div>

              <div className="space-y-2.5 mb-8">
                {plan.features.map(([ok, text], j) => (
                  <div key={j} className="flex items-center gap-2.5 text-sm">
                    {ok
                      ? <Check size={14} className="text-violet-400 flex-shrink-0"/>
                      : <X    size={14} className="text-white/18 flex-shrink-0"/>
                    }
                    <span style={{ color: ok ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0.22)' }}>{String(text)}</span>
                  </div>
                ))}
              </div>

              <Link
                href={plan.ctaHref}
                className={`block w-full py-3 text-center rounded-xl text-sm font-bold transition-all ${
                  plan.solid
                    ? 'bg-gradient-to-r from-violet-600 to-purple-500 text-white shadow-[0_6px_20px_rgba(124,58,237,0.4)] hover:shadow-[0_10px_28px_rgba(124,58,237,0.55)] hover:-translate-y-0.5'
                    : 'border border-white/14 text-white/60 hover:border-white/28 hover:text-white'
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-xs text-white/20 mt-6">
          Alle Preise inkl. MwSt. · Monatlich kündbar · Sichere Zahlung via Stripe
        </p>
      </div>
    </section>
  )
}
