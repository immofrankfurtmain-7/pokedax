import { createClient } from '@/lib/supabase/server'
import { TrendingUp, Package, Bell, ShoppingBag, Star, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import AvatarUpload from '@/components/ui/AvatarUpload'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile }  = await supabase.from('profiles').select('*').eq('id', user!.id).single()
  const { data: portfolioCards } = await supabase.from('portfolio_cards').select('id').eq('user_id', user!.id)

  const totalCards = portfolioCards?.length ?? 0
  const isPremium  = profile?.is_premium ?? false
  const username   = profile?.username ?? user!.email?.split('@')[0] ?? 'Trainer'

  const quickActions = [
    { label:'Portfolio',  href:'/dashboard/portfolio',   icon:TrendingUp,  color:'#a78bfa' },
    { label:'Set-Tracker',href:'/dashboard/sets',        icon:Package,     color:'#38bdf8' },
    { label:'Marktplatz', href:'/dashboard/marketplace', icon:ShoppingBag, color:'#00e676' },
    { label:'Alerts',     href:'/dashboard/alerts',      icon:Bell,        color:'#FFD700' },
  ]

  return (
    <div className="p-8">
      {/* Profile header */}
      <div className="flex items-center gap-5 mb-8">
        <AvatarUpload
          userId={user!.id}
          avatarUrl={profile?.avatar_url}
          username={username}
          size="lg"
        />
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Hey, <span className="gradient-text">{username}</span> 👋
          </h1>
          <p className="text-white/40 text-sm mt-1 font-normal">{user!.email}</p>
          {isPremium && (
            <div className="flex items-center gap-1.5 mt-2">
              <Star size={12} className="text-yellow-400"/>
              <span className="text-xs font-bold text-yellow-400">PREMIUM</span>
            </div>
          )}
        </div>
      </div>

      {/* Premium upsell */}
      {!isPremium && (
        <div className="mb-6 rounded-2xl p-5 bg-gradient-to-r from-violet-950/60 to-purple-950/40 border border-violet-700/30 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-400/15 border border-yellow-400/30 flex items-center justify-center">
              <Star size={18} className="text-yellow-400"/>
            </div>
            <div>
              <div className="text-sm font-bold text-white">Upgrade auf Premium</div>
              <div className="text-xs text-white/45 font-normal">Portfolio, Marktplatz, Alerts – ab 4,99 €/Mo</div>
            </div>
          </div>
          <Link href="/dashboard/premium"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 text-white text-sm font-bold shadow-[0_4px_16px_rgba(124,58,237,0.4)] hover:-translate-y-0.5 transition-all flex-shrink-0">
            Premium werden <ArrowRight size={14}/>
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label:'Karten im Portfolio', value:String(totalCards),              sub: totalCards>0?'+2 diese Woche':'Noch keine Karten', color:'#a78bfa', icon:Package },
          { label:'Portfolio-Wert',      value:totalCards>0?'€ 284,50':'€ 0',  sub: totalCards>0?'↑ +12,4% (7d)':'Karten hinzufügen', color:'#00e676', icon:TrendingUp },
          { label:'Aktive Alerts',       value:'0',                              sub:'Keine Alerts',    color:'#FFD700', icon:Bell },
          { label:'Marktplatz',          value:'0',                              sub:'Keine Angebote',  color:'#38bdf8', icon:ShoppingBag },
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

      {/* Quick actions */}
      <div className="mb-8">
        <h2 className="text-xs font-bold text-white/40 mb-4 tracking-widest uppercase">Schnellzugriff</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map(({ label, href, icon: Icon, color }) => (
            <Link key={href} href={href}
              className="group flex flex-col items-center gap-2.5 bg-white/2 border border-white/6 rounded-2xl p-5 hover:bg-white/4 hover:border-violet-800/30 hover:-translate-y-0.5 transition-all text-center">
              <div className="w-11 h-11 rounded-xl border flex items-center justify-center group-hover:scale-110 transition-transform"
                style={{ background:`${color}14`, borderColor:`${color}30` }}>
                <Icon size={19} style={{ color }}/>
              </div>
              <span className="text-xs font-semibold text-white/65 group-hover:text-white/90 transition-colors">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Activity placeholder */}
      <div className="bg-white/2 border border-white/6 rounded-2xl p-6">
        <h2 className="text-xs font-bold text-white/40 mb-5 tracking-widest uppercase">Letzte Aktivität</h2>
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="text-4xl mb-3 opacity-25">🃏</div>
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
