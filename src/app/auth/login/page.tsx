'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, Chrome } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function LoginPage() {
  const router      = useRouter()
  const searchParams = useSearchParams()
  const redirectTo  = searchParams.get('redirectTo') ?? '/dashboard'
  const supabase    = createClient()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Willkommen zurück!')
      router.push(redirectTo)
      router.refresh()
    }
    setLoading(false)
  }

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}` },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(75,0,130,0.3)_0%,transparent_60%)]"/>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <svg viewBox="0 0 60 60" className="w-8 h-8"><circle cx="30" cy="30" r="28" fill="white" stroke="rgba(0,0,0,0.2)" strokeWidth="1"/><path d="M2.5 30 Q2.5 3 30 3 Q57.5 3 57.5 30" fill="#CC0000"/><line x1="2.5" y1="30" x2="57.5" y2="30" stroke="rgba(0,0,0,0.3)" strokeWidth="2.5"/><circle cx="30" cy="30" r="9" fill="white" stroke="rgba(0,0,0,0.2)" strokeWidth="2.5"/><circle cx="30" cy="30" r="4.5" fill="rgba(245,245,245,0.9)"/></svg>
            <span className="font-display text-2xl tracking-widest text-yellow-400">POKÉDAX</span>
          </Link>
          <h1 className="text-2xl font-black text-white tracking-tight">Willkommen zurück</h1>
          <p className="text-sm text-white/40 mt-1">Melde dich an um fortzufahren</p>
        </div>

        {/* Card */}
        <div className="bg-[rgba(12,8,28,0.9)] border border-violet-900/30 rounded-2xl p-6 backdrop-blur-2xl shadow-[0_24px_80px_rgba(0,0,0,0.5)]">

          {/* Google */}
          <button onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-white/70 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all mb-4">
            <Chrome size={16}/>
            Mit Google anmelden
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-white/8"/>
            <span className="text-xs text-white/25 font-medium">oder</span>
            <div className="flex-1 h-px bg-white/8"/>
          </div>

          {/* Form */}
          <form onSubmit={handleEmail} className="space-y-3">
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"/>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="E-Mail" required
                className="w-full bg-white/4 border border-white/9 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/15 transition-all"
              />
            </div>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"/>
              <input
                type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Passwort" required
                className="w-full bg-white/4 border border-white/9 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/15 transition-all"
              />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
              </button>
            </div>

            <div className="flex justify-end">
              <Link href="/auth/forgot-password" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">Passwort vergessen?</Link>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-violet-600 to-purple-500 text-white shadow-[0_6px_20px_rgba(124,58,237,0.4)] hover:shadow-[0_10px_28px_rgba(124,58,237,0.55)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all">
              {loading ? 'Anmelden…' : 'Anmelden'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-white/35 mt-5">
          Noch kein Account?{' '}
          <Link href="/auth/register" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
            Kostenlos registrieren
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
