import Link from "next/link";

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-6 pt-16 pb-32 relative z-10">
      {/* HERO – ein Wort in Gold */}
      <section className="text-center pt-12 pb-24">
        <div className="inline-flex items-center gap-2 px-6 py-2 rounded-3xl border border-[var(--gold-12)] bg-[var(--gold-05)] text-[var(--gold)] text-xs font-medium tracking-widest mb-10">
          LIVE CARDMARKET • DEUTSCHLAND
        </div>

        <h1 className="font-display text-[82px] leading-[0.98] font-light tracking-[-0.055em] text-[var(--tx-1)] mb-6">
          Deine Karten.<br />
          Ihr wahrer <span className="text-[var(--gold)]">Wert</span>.
        </h1>

        <p className="max-w-md mx-auto text-[var(--tx-2)] text-[17px] leading-relaxed">
          Minimal. Präzise. Edel.<br />
          Live-Preise, KI-Scanner und Portfolio-Tracking auf höchstem Niveau.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-16">
          <Link href="/preischeck" className="px-10 py-5 bg-[var(--gold)] text-[#0a0a0a] font-semibold rounded-3xl text-sm gold-glow inline-flex items-center justify-center">
            Preis checken
          </Link>
          <Link href="/scanner" className="px-10 py-5 border border-[var(--br-2)] hover:border-[var(--gold-18)] text-[var(--tx-2)] font-medium rounded-3xl transition-all gold-glow">
            Karte scannen →
          </Link>
        </div>
      </section>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[var(--br-1)] rounded-3xl overflow-hidden mb-28">
        {[
          { n: "28.470", l: "Karten" },
          { n: "1.684", l: "Aktive Sammler" },
          { n: "9.320", l: "Forum-Beiträge" },
          { n: "312", l: "Sets" },
        ].map((s, i) => (
          <div key={i} className="bg-[var(--bg-1)] px-8 py-8 text-center">
            <div className="text-5xl font-light tracking-[-0.04em]">{s.n}</div>
            <div className="text-xs text-[var(--tx-3)] tracking-widest mt-2 uppercase">{s.l}</div>
          </div>
        ))}
      </div>

      {/* TRENDING – starke Hovers */}
      <section className="mb-28">
        <div className="flex items-baseline justify-between mb-8">
          <h2 className="font-display text-2xl font-light tracking-tight">Meistgesucht</h2>
          <Link href="/preischeck" className="text-sm text-[var(--tx-3)] hover:text-[var(--gold)]">Alle ansehen →</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <Link key={i} href="/preischeck" className="card-hover block">
              <div className="bg-[var(--bg-1)] border border-[var(--br-1)] rounded-3xl overflow-hidden">
                <div className="aspect-[4/3] bg-[var(--bg-2)] flex items-center justify-center p-8">
                  <div className="text-[var(--tx-3)] text-xs font-mono">CARD PREVIEW {i}</div>
                </div>
                <div className="p-6">
                  <div className="text-sm font-medium text-[var(--tx-1)] line-clamp-1">Charizard ex – Scarlet &amp; Violet</div>
                  <div className="text-xs text-[var(--tx-3)]">SV3 • #234</div>
                  <div className="mt-5 flex justify-between items-baseline">
                    <span className="font-mono text-[var(--gold)] text-xl">184,50 €</span>
                    <span className="text-emerald-400 text-xs">+12,4 %</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* SCANNER + PORTFOLIO */}
      <div className="grid md:grid-cols-2 gap-8 mb-28">
        {/* Großer Scanner Upload-Bereich */}
        <div className="bg-[var(--bg-1)] border border-[var(--br-1)] rounded-3xl p-10 gold-glow">
          <div className="uppercase text-xs tracking-[0.12em] text-[var(--tx-3)] mb-3">KI-SCANNER • GEMINI FLASH</div>
          <div className="text-4xl font-light tracking-[-0.03em] leading-none mb-6">
            Foto machen.<br />Preis wissen.
          </div>
          <p className="text-[var(--tx-2)] mb-8">Karte auf den Tisch legen – in 2 Sekunden den aktuellen Cardmarket-Wert sehen.</p>
          
          <div className="border-2 border-dashed border-[var(--gold-18)] rounded-3xl h-72 flex flex-col items-center justify-center gap-4 hover:border-[var(--gold)] transition-colors">
            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" className="text-[var(--gold)]">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
            </svg>
            <div className="text-center">
              <div className="text-sm font-medium">Foto ablegen oder klicken</div>
              <div className="text-xs text-[var(--tx-3)]">JPG, PNG, HEIC • Max 10 MB</div>
            </div>
          </div>

          <Link href="/scanner" className="mt-8 block w-full py-5 text-center bg-[var(--gold)] text-[#0a0a0a] font-semibold rounded-3xl text-sm gold-glow">
            Jetzt scannen
          </Link>
        </div>

        {/* Portfolio mit Sparkline */}
        <div className="bg-[var(--bg-1)] border border-[var(--br-1)] rounded-3xl p-10 flex flex-col gold-glow">
          <div className="flex-1">
            <div className="uppercase text-xs tracking-widest text-[var(--tx-3)]">DEIN PORTFOLIO</div>
            <div className="text-6xl font-light tracking-[-0.04em] mt-2 mb-1">4.872 €</div>
            <div className="flex items-center gap-2 text-emerald-400">
              ▲ <span className="font-medium">+27,3 %</span>
              <span className="text-[var(--tx-3)] text-sm">30 Tage</span>
            </div>
          </div>

          <svg width="100%" height="92" viewBox="0 0 420 92" fill="none" xmlns="http://www.w3.org/2000/svg" className="mt-8">
            <defs>
              <linearGradient id="portfolioGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#E9A84B" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#E9A84B" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M10 75 Q80 68 140 55 Q200 38 260 32 Q320 18 410 12" stroke="#E9A84B" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M10 75 Q80 68 140 55 Q200 38 260 32 Q320 18 410 12 L410 92 L10 92 Z" fill="url(#portfolioGlow)" />
          </svg>

          <div className="text-xs text-[var(--tx-3)] flex justify-between mt-4">
            <div>47 Karten • 3 Sammlungen</div>
            <div className="font-mono text-[var(--gold)]">Bester Trade +€ 680</div>
          </div>
        </div>
      </div>

      {/* PRICING BOXEN – vollständig */}
      <section className="mb-16">
        <div className="text-center mb-12">
          <div className="text-sm text-[var(--tx-3)] tracking-widest">MITGLIEDSCHAFT</div>
          <h2 className="font-display text-4xl font-light tracking-[-0.03em] mt-3">Wähle deine Stufe</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Free */}
          <div className="bg-[var(--bg-1)] border border-[var(--br-1)] rounded-3xl p-9">
            <div className="uppercase text-xs text-[var(--tx-3)] tracking-widest mb-6">COMMON</div>
            <div className="text-5xl font-light">Free</div>
            <div className="text-[var(--tx-3)]">für immer</div>
            <div className="my-8 h-px bg-[var(--br-1)]" />
            <ul className="space-y-4 text-sm text-[var(--tx-2)]">
              <li>✓ 5 Scans / Tag</li>
              <li>✓ Basis-Preischeck</li>
              <li>✓ Forum lesen</li>
              <li className="opacity-40">✕ Portfolio + Charts</li>
            </ul>
            <Link href="/auth/register" className="mt-12 block w-full py-5 text-center border border-[var(--br-2)] rounded-3xl text-sm font-medium">Kostenlos starten</Link>
          </div>

          {/* Premium */}
          <div className="bg-gradient-to-b from-[var(--gold-08)] to-[var(--bg-1)] border border-[var(--gold-18)] rounded-3xl p-9 relative gold-glow">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[var(--gold)] text-[#0a0a0a] text-xs font-bold px-8 py-1 rounded-b-3xl">BELIEBTESTE WAHL</div>
            <div className="uppercase text-xs text-[var(--gold)] tracking-widest mt-8 mb-6">ILLUSTRATION RARE</div>
            <div className="text-5xl font-light text-[var(--gold)]">6,99 €</div>
            <div className="text-sm text-[var(--tx-3)]">pro Monat</div>
            <div className="my-8 h-px bg-[var(--gold-12)]" />
            <ul className="space-y-4 text-sm">
              <li className="text-[var(--tx-1)]">✓ Unlimitierte Scans</li>
              <li className="text-[var(--tx-1)]">✓ Vollständiges Portfolio + Charts</li>
              <li className="text-[var(--tx-1)]">✓ Preis-Alerts</li>
              <li className="text-[var(--tx-1)]">✓ Exklusives Forum</li>
            </ul>
            <Link href="/dashboard/premium" className="mt-12 block w-full py-5 text-center bg-[var(--gold)] text-[#0a0a0a] font-semibold rounded-3xl">Premium werden</Link>
          </div>

          {/* Dealer */}
          <div className="bg-[var(--bg-1)] border border-[var(--br-1)] rounded-3xl p-9">
            <div className="uppercase text-xs text-[var(--gold)] tracking-widest mb-6">HYPER RARE</div>
            <div className="text-5xl font-light">19,99 €</div>
            <div className="text-sm text-[var(--tx-3)]">pro Monat</div>
            <div className="my-8 h-px bg-[var(--br-1)]" />
            <ul className="space-y-4 text-sm text-[var(--tx-2)]">
              <li>✓ Alles aus Premium</li>
              <li>✓ Verified Seller Badge</li>
              <li>✓ Eigene Shop-Seite</li>
              <li>✓ API-Zugang</li>
            </ul>
            <Link href="/dashboard/premium?plan=dealer" className="mt-12 block w-full py-5 text-center border border-[var(--gold-18)] text-[var(--gold)] rounded-3xl">Händler werden</Link>
          </div>
        </div>
      </section>
    </div>
  );
}