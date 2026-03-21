import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/5 bg-black/20 backdrop-blur-sm mt-20">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <svg viewBox="0 0 60 60" className="w-6 h-6"><circle cx="30" cy="30" r="28" fill="white" stroke="rgba(0,0,0,0.2)" strokeWidth="1"/><path d="M2.5 30 Q2.5 3 30 3 Q57.5 3 57.5 30" fill="#CC0000"/><line x1="2.5" y1="30" x2="57.5" y2="30" stroke="rgba(0,0,0,0.3)" strokeWidth="2.5"/><circle cx="30" cy="30" r="9" fill="white" stroke="rgba(0,0,0,0.2)" strokeWidth="2.5"/><circle cx="30" cy="30" r="4.5" fill="rgba(245,245,245,0.9)"/></svg>
              <span className="font-display text-lg tracking-widest text-yellow-400">POKÉDAX</span>
            </div>
            <p className="text-sm text-white/30 leading-relaxed">
              Deutschlands #1 Pokémon-TCG-Preis-Plattform.<br/>
              Live-Preise · KI-Scanner · Community
            </p>
          </div>
          <div>
            <div className="text-xs font-semibold text-white/30 tracking-widest uppercase mb-3">Plattform</div>
            {[['/', 'Start'], ['/preischeck', 'Preischeck'], ['/scanner', 'Scanner'], ['/forum', 'Forum'], ['/dashboard', 'Dashboard']].map(([href, label]) => (
              <Link key={href} href={href} className="block text-sm text-white/40 hover:text-white/75 mb-1.5 transition-colors">{label}</Link>
            ))}
          </div>
          <div>
            <div className="text-xs font-semibold text-white/30 tracking-widest uppercase mb-3">Rechtliches</div>
            {[['#', 'Datenschutz'], ['#', 'Impressum'], ['#', 'Nutzungsbedingungen'], ['#', 'Kontakt']].map(([href, label]) => (
              <Link key={label} href={href} className="block text-sm text-white/40 hover:text-white/75 mb-1.5 transition-colors">{label}</Link>
            ))}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-6 border-t border-white/5">
          <p className="text-xs text-white/20">© 2026 PokeDax · Nicht offiziell · Nicht affiliiert mit The Pokémon Company International</p>
          <p className="text-xs text-white/25">Made with ♥ für Pokémon-Sammler in D/A/CH</p>
        </div>
      </div>
    </footer>
  )
}
