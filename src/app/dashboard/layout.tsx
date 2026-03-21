import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { LayoutDashboard, PieChart, Layers, ShoppingBag, Bell, Star, LogOut } from 'lucide-react'

const SIDEBAR_LINKS = [
  { href: '/dashboard',             icon: LayoutDashboard, label: 'Übersicht' },
  { href: '/dashboard/portfolio',   icon: PieChart,        label: 'Portfolio' },
  { href: '/dashboard/sets',        icon: Layers,          label: 'Set-Tracker' },
  { href: '/dashboard/marketplace', icon: ShoppingBag,     label: 'Marktplatz' },
  { href: '/dashboard/alerts',      icon: Bell,            label: 'Preis-Alerts' },
  { href: '/dashboard/premium',     icon: Star,            label: 'Premium', highlight: true },
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirectTo=/dashboard')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const isPremium = profile?.is_premium ?? false
  const username  = profile?.username ?? user.email?.split('@')[0] ?? 'Trainer'

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-56 bg-[rgba(4,2,14,0.95)] border-r border-white/5 z-[100] flex flex-col backdrop-blur-xl">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 px-5 h-[60px] border-b border-white/5">
          <svg viewBox="0 0 60 60" className="w-6 h-6 flex-shrink-0"><circle cx="30" cy="30" r="28" fill="white" stroke="rgba(0,0,0,0.2)" strokeWidth="1"/><path d="M2.5 30 Q2.5 3 30 3 Q57.5 3 57.5 30" fill="#CC0000"/><line x1="2.5" y1="30" x2="57.5" y2="30" stroke="rgba(0,0,0,0.3)" strokeWidth="2.5"/><circle cx="30" cy="30" r="9" fill="white" stroke="rgba(0,0,0,0.2)" strokeWidth="2.5"/><circle cx="30" cy="30" r="4.5" fill="rgba(245,245,245,0.9)"/></svg>
          <span className="font-display text-base tracking-widest text-yellow-400">POKÉDAX</span>
        </Link>

        {/* User badge */}
        <div className="px-4 py-3 border-b border-white/5">
          <div className="flex items-center gap-2.5 bg-white/3 rounded-xl p-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-purple-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {username[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white/85 truncate">{username}</div>
              {isPremium
                ? <div className="flex items-center gap-1 text-[9px] font-bold text-yellow-400"><Star size={8}/> PREMIUM</div>
                : <div className="text-[9px] text-white/35">Free Plan</div>
              }
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {SIDEBAR_LINKS.map(({ href, icon: Icon, label, highlight }) => (
            <Link key={href} href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all group ${
                highlight
                  ? 'bg-gradient-to-r from-violet-900/40 to-purple-900/30 text-yellow-400 border border-yellow-500/20 hover:border-yellow-500/40'
                  : 'text-white/45 hover:text-white/85 hover:bg-white/5'
              }`}>
              <Icon size={15} className={highlight ? 'text-yellow-400' : 'text-white/35 group-hover:text-white/65 transition-colors'}/>
              {label}
              {highlight && <Star size={9} className="ml-auto text-yellow-400/60"/>}
            </Link>
          ))}
        </nav>

        {/* Sign out */}
        <div className="px-3 py-4 border-t border-white/5">
          <form action="/api/auth/signout" method="POST">
            <button type="submit"
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-white/35 hover:text-white/65 hover:bg-white/5 transition-all">
              <LogOut size={15}/> Abmelden
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-56 flex-1 min-h-screen">
        <div className="relative">
          <div className="fixed inset-0 z-0 pointer-events-none ml-56">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_70%_10%,rgba(75,0,130,0.15)_0%,transparent_60%)]"/>
          </div>
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
