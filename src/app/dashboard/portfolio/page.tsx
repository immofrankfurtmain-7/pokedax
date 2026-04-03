// src/app/portfolio/page.tsx

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-[var(--canvas)] py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-end mb-12">
          <div>
            <div className="uppercase text-xs tracking-widest text-[var(--tx-3)]">DEIN SAMMLUNGSWERT</div>
            <div className="font-display text-7xl font-light tracking-[-0.05em] text-[var(--tx-1)]">4.872 €</div>
          </div>
          <div className="text-emerald-400 text-2xl font-medium">+27,3 % <span className="text-sm text-[var(--tx-3)]">30 Tage</span></div>
        </div>

        {/* Sparkline */}
        <div className="bg-[var(--bg-1)] border border-[var(--br-1)] rounded-3xl p-10 mb-12 gold-glow">
          <svg width="100%" height="140" viewBox="0 0 800 140" fill="none">
            <defs>
              <linearGradient id="spark" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#E9A84B" stopOpacity="0.15"/>
                <stop offset="100%" stopColor="#E9A84B" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <path d="M20 110 Q150 95 280 75 Q420 55 550 48 Q680 32 780 25" stroke="#E9A84B" strokeWidth="3" strokeLinecap="round"/>
            <path d="M20 110 Q150 95 280 75 Q420 55 550 48 Q680 32 780 25 L780 140 L20 140 Z" fill="url(#spark)"/>
          </svg>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {["47 Karten", "3 Sammlungen", "Bester Trade +€ 680"].map((item, i) => (
            <div key={i} className="bg-[var(--bg-1)] border border-[var(--br-1)] rounded-3xl p-8 gold-glow">
              <div className="text-sm text-[var(--tx-3)]">{item}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}