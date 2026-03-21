import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[#04020e]">
      <div className="text-center">
        <div className="text-[120px] font-black text-transparent bg-gradient-to-br from-violet-600/30 to-purple-900/20 bg-clip-text select-none leading-none mb-2">
          404
        </div>
        <div className="text-2xl font-black text-white mb-3">Seite nicht gefunden</div>
        <p className="text-white/40 text-sm mb-8 max-w-xs mx-auto">
          Die gesuchte Seite existiert nicht oder wurde verschoben.
        </p>
        <Link href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 text-white font-bold shadow-[0_6px_20px_rgba(124,58,237,0.4)] hover:-translate-y-0.5 transition-all">
          Zurück zur Startseite
        </Link>
      </div>
    </div>
  )
}
