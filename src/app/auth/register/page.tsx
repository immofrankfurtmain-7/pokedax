'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, Chrome, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const PASSWORD_RULES = [
  { label: 'Mindestens 8 Zeichen', test: (pw: string) => pw.length >= 8 },
  { label: 'Großbuchstabe',        test: (pw: string) => /[A-Z]/.test(pw) },
  { label: 'Zahl',                 test: (pw: string) => /[0-9]/.test(pw) },
]

export default function RegisterPage() {
  const router   = useRouter()
  const supabase = createClient()

  const [username, setUsername] = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [done,     setDone]     = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) { toast.error('Passwort zu kurz (mind. 8 Zeichen)'); return }
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { username }, emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) {
      toast.error(error.message)
    } else {
      setDone(true)
    }
    setLoading(false)
  }

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
          className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-green-950/60 border border-green-500/40 flex items-center justify-center mx-auto mb-5">
            <Check size={28} className="text-green-400"/>
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Fast fertig!</h2>
          <p className="text-white/45 text-sm leading-relaxed mb-6">
            Wir haben dir eine Bestätigungs-E-Mail an <strong className="text-white/70">{email}</strong> geschickt.
            Klicke den Link um dein Konto zu aktivieren.
          </p>
          <Link href="/" className="text-sm text-violet-400 hover:text-violet-300 font-semibold transition-colors">
            Zurück zur Startseite
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(75,0,130,0.3)_0%,transparent_60%)]"/>

      <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} className="relative w-full max-w-sm">

        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <svg viewBox="0 0 60 60" className="w-8 h-8"><circle cx="30" cy="30" r="28" fill="white" stroke="rgba(0,0,0,0.2)" strokeWidth="1"/><path d="M2.5 30 Q2.5 3 30 3 Q57.5 3 57.5 30" fill="#CC0000"/><line x1="2.5" y1="30" x2="57.5" y2="30" stroke="rgba(0,0,0,0.3)" strokeWidth="2.5"/><circle cx="30" cy="30" r="9" fill="white" stroke="rgba(0,0,0,0.2)" strokeWidth="2.5"/><circle cx="30" cy="30" r="4.5" fill="rgba(245,245,245,0.9)"/></svg>
            <span className="font-display text-2xl tracking-widest text-yellow-400">POKÉDAX</span>
          </Link>
          <h1 className="text-2xl font-black text-white tracking-tight">Konto erstellen</h1>
          <p className="text-sm text-white/40 mt-1">Kostenlos · Kein Abo nötig</p>
        </div>

        <div className="bg-[rgba(12,8,28,0.9)] border border-violet-900/30 rounded-2xl p-6 backdrop-blur-2xl shadow-[0_24px_80px_rgba(0,0,0,0.5)]">

          <button onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-white/70 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all mb-4">
            <Chrome size={16}/> Mit Google registrieren
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-white/8"/>
            <span className="text-xs text-white/25 font-medium">oder</span>
            <div className="flex-1 h-px bg-white/8"/>
          </div>

          <form onSubmit={handleRegister} className="space-y-3">
            <div className="relative">
              <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"/>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                placeholder="Benutzername" required minLength={3}
                className="w-full bg-white/4 border border-white/9 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/15 transition-all"/>
            </div>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"/>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="E-Mail" required
                className="w-full bg-white/4 border border-white/9 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/15 transition-all"/>
            </div>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"/>
              <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Passwort" required
                className="w-full bg-white/4 border border-white/9 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/15 transition-all"/>
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
              </button>
            </div>

            {/* Password strength */}
            {password.length > 0 && (
              <div className="space-y-1 pt-1">
                {PASSWORD_RULES.map(r => (
                  <div key={r.label} className="flex items-center gap-2 text-[11px]">
                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0 transition-all ${r.test(password) ? 'bg-green-500/20 border-green-500/60' : 'bg-white/5 border-white/15'}`}>
                      {r.test(password) && <Check size={8} className="text-green-400"/>}
                    </div>
                    <span className={r.test(password) ? 'text-green-400/80' : 'text-white/30'}>{r.label}</span>
                  </div>
                ))}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-violet-600 to-purple-500 text-white shadow-[0_6px_20px_rgba(124,58,237,0.4)] hover:shadow-[0_10px_28px_rgba(124,58,237,0.55)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all mt-2">
              {loading ? 'Konto wird erstellt…' : 'Konto erstellen'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-white/35 mt-5">
          Bereits registriert?{' '}
          <Link href="/auth/login" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">Anmelden</Link>
        </p>
        <p className="text-center text-[11px] text-white/20 mt-3">
          Mit der Registrierung stimmst du unseren <span className="underline cursor-pointer">Nutzungsbedingungen</span> zu.
        </p>
      </motion.div>
    </div>
  )
}
