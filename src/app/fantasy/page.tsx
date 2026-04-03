// src/app/fantasy/page.tsx

export default function FantasyPage() {
  return (
    <div className="min-h-screen bg-[var(--canvas)] py-20">
      <div className="max-w-5xl mx-auto px-6 text-center">
        <div className="inline text-xs tracking-[0.125em] text-[var(--gold)] mb-4">NEW SEASON</div>
        <h1 className="font-display text-7xl font-light tracking-[-0.06em] mb-8">
          Fantasy League<br />PokéDax
        </h1>
        <p className="max-w-lg mx-auto text-[var(--tx-2)] text-lg mb-16">
          Baue dein 1.000 € Team. Sammle Punkte durch reale Kursentwicklungen. Monatliche Gewinner erhalten exklusive Trophy Cards.
        </p>

        <div className="inline-block px-12 py-5 bg-[var(--gold)] text-[#0a0a0a] font-semibold rounded-3xl text-lg gold-glow">
          Jetzt Team aufstellen →
        </div>
      </div>
    </div>
  );
}