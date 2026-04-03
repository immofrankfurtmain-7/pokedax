// src/app/preischeck/page.tsx

import Link from "next/link";

export default function PreischeckPage() {
  return (
    <div className="min-h-screen bg-[var(--canvas)]">
      <div className="max-w-6xl mx-auto px-6 pt-12 pb-24">
        
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-3xl border border-[var(--gold-12)] bg-[var(--gold-05)] text-[var(--gold)] text-xs font-medium tracking-widest mb-6">
            LIVE CARDMARKET • DEUTSCHLAND
          </div>
          <h1 className="font-display text-6xl font-light tracking-[-0.055em] text-[var(--tx-1)] leading-none mb-6">
            Finde den<br />wahren Wert.
          </h1>
          <p className="text-[var(--tx-2)] text-lg max-w-md mx-auto">
            Suche nach Pokémon TCG Karten und erhalte sofort aktuelle Cardmarket-Preise.
          </p>
        </div>

        {/* Große edle Suchleiste */}
        <div className="max-w-3xl mx-auto mb-20">
          <div className="relative group">
            <div className="absolute left-8 top-1/2 -translate-y-1/2 text-[var(--tx-3)]">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 01-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <input
              type="text"
              placeholder="Kartenname, Set oder Nummer eingeben..."
              className="w-full bg-[var(--bg-1)] border border-[var(--br-2)] focus:border-[var(--gold)] text-[var(--tx-1)] placeholder-[var(--tx-3)] pl-20 pr-8 py-7 rounded-3xl text-lg focus:outline-none gold-glow transition-all"
            />

            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-medium text-[var(--tx-3)] tracking-widest hidden sm:block">
              ⏎ SUCHEN
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-12 border-b border-[var(--br-1)] pb-8">
          <div className="flex items-center gap-3 flex-wrap">
            <button className="px-6 py-2.5 bg-[var(--bg-1)] border border-[var(--gold-12)] text-[var(--gold)] rounded-2xl text-sm font-medium gold-glow">Alle Sets</button>
            <button className="px-6 py-2.5 text-[var(--tx-2)] hover:text-[var(--tx-1)] transition-colors">Scarlet & Violet</button>
            <button className="px-6 py-2.5 text-[var(--tx-2)] hover:text-[var(--tx-1)] transition-colors">Sword & Shield</button>
            <button className="px-6 py-2.5 text-[var(--tx-2)] hover:text-[var(--tx-1)] transition-colors">Hidden Fates</button>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <select className="bg-[var(--bg-1)] border border-[var(--br-2)] text-[var(--tx-2)] px-5 py-3 rounded-2xl focus:outline-none gold-glow">
              <option>Preis: Hoch → Niedrig</option>
              <option>Preis: Niedrig → Hoch</option>
              <option>Neueste Sets</option>
              <option>Beliebtheit</option>
            </select>
          </div>
        </div>

        {/* Ergebnis Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <Link 
              key={i} 
              href="#" 
              className="card-hover block group"
            >
              <div className="bg-[var(--bg-1)] border border-[var(--br-1)] rounded-3xl overflow-hidden h-full flex flex-col">
                <div className="aspect-[4/3] bg-[var(--bg-2)] flex items-center justify-center p-6 relative">
                  <div className="text-[var(--tx-4)] text-xs font-mono">KARTENBILD {i + 1}</div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  <div className="text-sm font-medium text-[var(--tx-1)] line-clamp-2 mb-1 group-hover:text-[var(--gold)] transition-colors">
                    Charizard ex – Obsidian Flames
                  </div>
                  <div className="text-xs text-[var(--tx-3)] mb-6">
                    SVI • 234/197 • Illustration Rare
                  </div>

                  <div className="mt-auto flex justify-between items-end">
                    <div>
                      <div className="font-mono text-[var(--gold)] text-2xl tracking-tighter">184,50 €</div>
                      <div className="text-xs text-[var(--tx-3)]">Marktpreis</div>
                    </div>
                    <div className="text-emerald-400 text-xs font-medium text-right">
                      ▲ 8,4%<br />
                      <span className="text-[var(--tx-3)]">30 Tage</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Hinweis */}
        <div className="text-center mt-20 text-[var(--tx-3)] text-sm">
          28.470 Karten • Preise werden alle 15 Minuten aktualisiert
        </div>
      </div>
    </div>
  );
}