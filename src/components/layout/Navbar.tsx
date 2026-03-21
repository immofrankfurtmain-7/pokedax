'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Zap, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

const NAV_LINKS = [
  { href: '/',            label: 'Start' },
  { href: '/preischeck',  label: 'Preischeck' },
  { href: '/scanner',     label: 'Scanner' },
  { href: '/forum',       label: 'Forum' },
  { href: '/dashboard',   label: 'Dashboard', requiresAuth: true },
]

function PokeDaxLogo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 group">
      {/* Pokeball */}
      <div className="relative w-7 h-7 flex-shrink-0">
        <svg viewBox="0 0 60 60" className="w-full h-full drop-shadow-[0_0_8px_rgba(255,215,0,0.5)] group-hover:drop-shadow-[0_0_14px_rgba(255,215,0,0.8)] transition-all duration-300">
          <circle cx="30" cy="30" r="28" fill="white" stroke="rgba(0,0,0,0.2)" strokeWidth="1"/>
          <path d="M2.5 30 Q2.5 3 30 3 Q57.5 3 57.5 30" fill="#CC0000"/>
          <line x1="2.5" y1="30" x2="57.5" y2="30" stroke="rgba(0,0,0,0.3)" strokeWidth="2.5"/>
          <circle cx="30" cy="30" r="9"   fill="white" stroke="rgba(0,0,0,0.2)" strokeWidth="2.5"/>
          <circle cx="30" cy="30" r="4.5" fill="rgba(245,245,245,0.9)"/>
          <circle cx="27" cy="27" r="1.8" fill="rgba(255,255,255,0.95)"/>
        </svg>
      </div>
      {/* Wordmark */}
      <span className="font-display text-xl tracking-widest text-yellow-400 text-glow-gold group-hover:tracking-[0.2em] transition-all duration-300">
        POKÉDAX
      </span>
    </Link>
  )
}

export default function Navbar() {
  const [open,    setOpen]    = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [user,    setUser]    = useState<User | null>(null)
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => setUser(session?.user ?? null))
    return () => subscription.unsubscribe()
  }, [supabase])

  return (
    <>
      <nav className={cn(
        'fixed top-0 inset-x-0 z-[200] transition-all duration-300',
        scrolled
          ? 'bg-[rgba(4,2,14,0.92)] backdrop-blur-2xl border-b border-[rgba(124,58,237,0.18)] shadow-[0_1px_40px_rgba(0,0,0,0.7)]'
          : 'bg-transparent'
      )}>
        <div className="max-w-7xl mx-auto px-6 h-[60px] flex items-center gap-2">
          <PokeDaxLogo/>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1 ml-8">
            {NAV_LINKS.filter(l => !l.requiresAuth || user).map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
                  pathname === link.href
                    ? 'text-violet-300 bg-violet-950/50'
                    : 'text-white/40 hover:text-white/85 hover:bg-white/5'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex-1"/>

          {/* CTA buttons */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <Link href="/dashboard" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-violet-300 bg-violet-950/40 border border-violet-800/30 hover:border-violet-600/50 transition-all">
                  <Zap size={14}/>
                  Dashboard
                </Link>
                <Link href="/dashboard/premium" className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold bg-gradient-to-r from-violet-600 to-purple-500 text-white shadow-[0_4px_16px_rgba(124,58,237,0.45)] hover:shadow-[0_6px_22px_rgba(124,58,237,0.6)] hover:-translate-y-0.5 transition-all">
                  <Star size={13}/>
                  Premium
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="px-3 py-1.5 rounded-full border border-violet-700/40 text-violet-300 text-sm font-medium hover:border-violet-500 hover:bg-violet-950/30 transition-all">
                  Anmelden
                </Link>
                <Link href="/auth/register" className="px-4 py-1.5 rounded-full text-sm font-bold bg-gradient-to-r from-violet-600 to-purple-500 text-white shadow-[0_4px_16px_rgba(124,58,237,0.45)] hover:shadow-[0_6px_22px_rgba(124,58,237,0.6)] hover:-translate-y-0.5 transition-all">
                  Kostenlos starten
                </Link>
              </>
            )}
          </div>

          {/* Hamburger */}
          <button
            className="md:hidden ml-2 text-violet-300 hover:text-white transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Menü"
          >
            {open ? <X size={22}/> : <Menu size={22}/>}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[60px] inset-x-0 z-[199] bg-[rgba(4,2,14,0.98)] backdrop-blur-2xl border-b border-violet-900/20 md:hidden"
          >
            <div className="px-5 py-4 flex flex-col gap-1">
              {NAV_LINKS.filter(l => !l.requiresAuth || user).map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'px-4 py-3 rounded-xl text-sm font-medium transition-all',
                    pathname === link.href
                      ? 'text-violet-300 bg-violet-950/50'
                      : 'text-white/50 hover:text-white/85 hover:bg-white/5'
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-white/5 mt-2 pt-3 flex flex-col gap-2">
                {user ? (
                  <Link href="/dashboard/premium" onClick={() => setOpen(false)}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold bg-gradient-to-r from-violet-600 to-purple-500 text-white">
                    <Star size={14}/> Premium werden
                  </Link>
                ) : (
                  <>
                    <Link href="/auth/login" onClick={() => setOpen(false)}
                      className="py-3 text-center rounded-xl border border-violet-700/40 text-violet-300 text-sm font-medium">
                      Anmelden
                    </Link>
                    <Link href="/auth/register" onClick={() => setOpen(false)}
                      className="py-3 text-center rounded-xl font-bold bg-gradient-to-r from-violet-600 to-purple-500 text-white">
                      Kostenlos starten
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
