'use client'
import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[error boundary]', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <div className="text-5xl mb-4">⚡</div>
        <h2 className="text-xl font-black text-white mb-2">Etwas ist schiefgelaufen</h2>
        <p className="text-sm text-white/40 mb-6 leading-relaxed">
          Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => reset()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 text-white text-sm font-bold shadow-[0_6px_20px_rgba(124,58,237,0.4)] hover:-translate-y-0.5 transition-all">
            Erneut versuchen
          </button>
          <a href="/" className="px-5 py-2.5 rounded-xl border border-white/10 text-white/60 text-sm font-semibold hover:border-white/20 hover:text-white transition-all">
            Startseite
          </a>
        </div>
        {error.digest && (
          <p className="mt-4 text-[10px] text-white/18 font-mono">Error ID: {error.digest}</p>
        )}
      </div>
    </div>
  )
}
