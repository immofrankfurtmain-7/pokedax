// src/app/dashboard/premium/page.tsx

export default function PremiumPage() {
  return (
    <div className="min-h-screen bg-[var(--canvas)] py-20">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-3xl border border-[var(--gold-12)] bg-[var(--gold-05)] text-[var(--gold)] text-xs tracking-widest mb-6">
            MITGLIEDSCHAFT
          </div>
          <h1 className="font-display text-6xl font-light tracking-[-0.06em] mb-6">
            Wähle deine Stufe
          </h1>
          <p className="text-[var(--tx-2)] max-w-md mx-auto">Von Common bis Hyper Rare – für jeden Sammler die passende Stufe.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Free */}
          <div className="bg-[var(--bg-1)] border border-[var(--br-1)] rounded-3xl p-10">
            <div className="uppercase text-xs tracking-widest text-[var(--tx-3)] mb-8">COMMON</div>
            <div className="text-5xl font-light mb-1">Free</div>
            <div className="text-[var(--tx-3)] mb-12">für immer</div>

            <ul className="space-y-5 text-sm mb-12">
              <li className="flex items-center gap-3"><span className="text-emerald-400">✓</span> 5 Scans pro Tag</li>
              <li className="flex items-center gap-3"><span className="text-emerald-400">✓</span> Basis-Preischeck</li>
              <li className="flex items-center gap-3"><span className="text-emerald-400">✓</span> Forum lesen</li>
              <li className="flex items-center gap-3 text-[var(--tx-3)]"><span>✕</span> Portfolio Tracking</li>
            </ul>

            <div className="text-center py-4 border border-[var(--br-2)] rounded-2xl text-sm font-medium text-[var(--tx-2)]">Aktuell aktiv</div>
          </div>

          {/* Premium – highlighted */}
          <div className="bg-gradient-to-b from-[var(--gold-08)] to-[var(--bg-1)] border border-[var(--gold-18)] rounded-3xl p-10 relative gold-glow scale-105">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--gold)] text-[#0a0a0a] text-xs font-bold px-8 py-1 rounded-b-2xl">EMPFOHLEN</div>
            
            <div className="uppercase text-xs tracking-widest text-[var(--gold)] mb-8">ILLUSTRATION RARE</div>
            <div className="flex items-baseline gap-3 mb-1">
              <span className="text-6xl font-light text-[var(--gold)]">6,99</span>
              <span className="text-[var(--gold)]">€ / Monat</span>
            </div>

            <ul className="space-y-5 text-sm mt-12 mb-12">
              <li className="flex items-center gap-3 text-[var(--tx-1)]"><span className="text-emerald-400">✓</span> Unlimitierte Scans</li>
              <li className="flex items-center gap-3 text-[var(--tx-1)]"><span className="text-emerald-400">✓</span> Vollständiges Portfolio + Charts</li>
              <li className="flex items-center gap-3 text-[var(--tx-1)]"><span className="text-emerald-400">✓</span> Preis-Alerts</li>
              <li className="flex items-center gap-3 text-[var(--tx-1)]"><span className="text-emerald-400">✓</span> Exklusives Forum</li>
            </ul>

            <div className="text-center py-4 bg-[var(--gold)] text-[#0a0a0a] font-semibold rounded-2xl gold-glow">Jetzt Premium werden</div>
          </div>

          {/* Dealer */}
          <div className="bg-[var(--bg-1)] border border-[var(--br-1)] rounded-3xl p-10">
            <div className="uppercase text-xs tracking-widest text-[var(--gold)] mb-8">HYPER RARE</div>
            <div className="text-5xl font-light mb-1">19,99 €</div>
            <div className="text-[var(--tx-3)] mb-12">pro Monat</div>

            <ul className="space-y-5 text-sm mb-12">
              <li className="flex items-center gap-3"><span className="text-emerald-400">✓</span> Alles aus Premium</li>
              <li className="flex items-center gap-3"><span className="text-emerald-400">✓</span> Verified Seller Badge</li>
              <li className="flex items-center gap-3"><span className="text-emerald-400">✓</span> Eigene Shop-Seite</li>
              <li className="flex items-center gap-3"><span className="text-emerald-400">✓</span> API-Zugang</li>
            </ul>

            <div className="text-center py-4 border border-[var(--gold-18)] text-[var(--gold)] font-medium rounded-2xl gold-glow">Händler werden</div>
          </div>
        </div>
      </div>
    </div>
  );
}