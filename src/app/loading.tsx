export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* Spinning Pokeball */}
        <div className="animate-spin-slow">
          <svg viewBox="0 0 60 60" className="w-12 h-12 drop-shadow-[0_0_12px_rgba(124,58,237,0.6)]">
            <circle cx="30" cy="30" r="28" fill="white" stroke="rgba(0,0,0,0.15)" strokeWidth="1"/>
            <path d="M2.5 30 Q2.5 3 30 3 Q57.5 3 57.5 30" fill="#CC0000"/>
            <line x1="2.5" y1="30" x2="57.5" y2="30" stroke="rgba(0,0,0,0.3)" strokeWidth="2.5"/>
            <circle cx="30" cy="30" r="9" fill="white" stroke="rgba(0,0,0,0.2)" strokeWidth="2.5"/>
            <circle cx="30" cy="30" r="4.5" fill="rgba(245,245,245,0.9)"/>
          </svg>
        </div>
        <span className="text-xs font-semibold text-white/30 tracking-widest uppercase">Laden…</span>
      </div>
    </div>
  )
}
