import { createClient } from '@/lib/supabase/server'
import { TrendingUp, TrendingDown, Package, Bell, ShoppingBag, Star, ArrowRight } from 'lucide-react'
import Link from 'next/link'

async function StatCard({ label, value, sub, color, icon: Icon }: {
  label: string; value: string; sub: string; color: string; icon: React.ElementType
}) {
  return (
    <div className="bg-white/2 border border-white/6 rounded-2xl p-5 hover:bg-white/3 transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div className="text-xs font-semibold text-white/35 uppercase tracking-widest">{label}</div>
        <div className="w-8 h-8 rounded-xl border flex items-center justify-center transition-all"
          style={{ background: `${color}14`, borderColor: `${color}30` }}>
          <Icon size={14} style={{ color }}/>
        </div>
      </div>
      <div className="text-2xl font-black text-white tracking-tight">{value}</div>
      <div className="text-xs mt-1 font-medium" style={{ color }}>{sub}</div>
    </div>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user!.id).single()

  const { data: portfolioCards } = await supabase
    .from('portfolio_cards').select('*').eq('user_id', user!.id)

  const totalCards = portfolioCards?.length ?? 0
  const isPremium  = profile?.is_premium ?? false
  const username   = profile?.username ?? user!.email?.split('@')[0] ?? 'Trainer'

  const quickActions = [
    { label: 'Portfolio ansehen',  href: '/dashboard/portfolio',   icon: TrendingUp,  color: '#a78bfa' },
    { label: 'Set-Tracker',        href: '/dashboard/sets',        icon: Package,     color: '#38bdf8' },
    { label: 'Marktplatz',         href: '/dashboard/marketplace', icon: ShoppingBag, color: '#00e676' },
    { label: 'Preis-Alerts',       href: '/dashboard/alerts',      icon: Bell,        color: '#FFD700' },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white tracking-tight">
          Guten Tag, <span className="gradient-text">{username}</span> 👋
        </h1>
        <p className="text-white/40 text-sm mt-1 font-normal">Hier ist deine Übersicht für heute</p>
      </div>

      {/* Premium upsell (if free) */}
      {!isPremium && (
        <div className="mb-6 rounded-2xl p-5 bg-gradient-to-r from-violet-950/60 to-purple-950/40 border border-violet-700/30 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-400/15 border border-yellow-400/30 flex items-center justify-center">
              <Star size={18} className="text-yellow-400"/>
            </div>
            <div>
              <div className="text-sm font-bold text-white">Upgrade auf Premium</div>
              <div className="text-xs text-white/45 font-normal">Portfolio-Tracker, Marktplatz, Preis-Alerts und mehr – ab 4,99 €/Mo</div>
            </div>
          </div>
          <Link href="/dashboard/premium"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 text-white text-sm font-bold shadow-[0_4px_16px_rgba(124,58,237,0.4)] hover:shadow-[0_6px_22px_rgba(124,58,237,0.55)] hover:-translate-y-0.5 transition-all flex-shrink-0">
            Premium werden <ArrowRight size={14}/>
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Karten im Portfolio" value={String(totalCards)} sub={totalCards > 0 ? "+2 diese Woche" : "Noch keine Karten"} color="#a78bfa" icon={Package}/>
        <StatCard label="Portfolio-Wert" value={totalCards > 0 ? "€ 284,50" : "€ 0,00"} sub={totalCards > 0 ? "↑ +12,4% (7d)" : "Karten hinzufügen"} color="#00e676" icon={TrendingUp}/>
        <StatCard label="Aktive Alerts" value="0" sub="Noch keine Alerts" color="#FFD700" icon={Bell}/>
        <StatCard label="Marktplatz" value="0" sub="Keine Angebote" color="#38bdf8" icon={ShoppingBag}/>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-base font-bold text-white/70 mb-4 tracking-tight">Schnellzugriff</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map(({ label, href, icon: Icon, color }) => (
            <Link key={href} href={href}
              className="group flex flex-col items-center gap-2.5 bg-white/2 border border-white/6 rounded-2xl p-5 hover:bg-white/4 hover:border-violet-800/30 hover:-translate-y-0.5 transition-all text-center">
              <div className="w-11 h-11 rounded-xl border flex items-center justify-center group-hover:scale-110 transition-transform"
                style={{ background: `${color}14`, borderColor: `${color}30` }}>
                <Icon size={19} style={{ color }}/>
              </div>
              <span className="text-xs font-semibold text-white/65 group-hover:text-white/90 transition-colors leading-tight">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent activity placeholder */}
      <div className="bg-white/2 border border-white/6 rounded-2xl p-6">
        <h2 className="text-sm font-bold text-white/60 mb-4 tracking-tight uppercase text-xs">Letzte Aktivität</h2>
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="text-4xl mb-3 opacity-30">🃏</div>
          <div className="text-sm font-medium text-white/30">Noch keine Aktivität</div>
          <div className="text-xs text-white/20 mt-1">Füge Karten zu deinem Portfolio hinzu</div>
          <Link href="/dashboard/portfolio"
            className="mt-4 px-4 py-2 rounded-xl bg-violet-950/50 border border-violet-700/30 text-violet-300 text-xs font-semibold hover:border-violet-600/50 transition-all">
            Portfolio öffnen
          </Link>
        </div>
      </div>
    </div>
  )
}
