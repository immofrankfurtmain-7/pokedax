import Link from "next/link";

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-6 pt-20 pb-32">
      {/* HERO – viel Luft, Satoshi */}
      <section className="text-center pt-12 pb-28">
        <div className="inline-flex items-center gap-2.5 px-6 py-2 rounded-full border border-[var(--gold-08)] bg-[var(--gold-05)] text-[var(--gold)] text-xs tracking-[0.125em] font-medium mb-10">
          LIVE • CARDMARKET • DEUTSCHLAND
        </div>

        <h1 className="font-display text-[92px] leading-[0.96] font-light tracking-[-0.055em] text-[var(--tx-1)] mb-8">
          Deine Karten.<br />Ihr wahrer Wert.
        </h1>

        <p className="max-w-lg mx-auto text-[var(--tx-2)] text-[17.5px] leading-relaxed tracking-[-0.01em]">
          Minimal. Präzise. Zeitlos.<br />
          Live-Preise, intelligenter Scanner und echte Sammler-Tools.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-16">
          <Link
            href="/preischeck"
            className="px-10 py-4.5 bg-[var(--gold)] hover:bg-[#c08f3f] text-[#0a0a0a] font-medium text-sm rounded-2xl hover-lift gold-focus inline-flex items-center justify-center"
          >
            Preis checken
          </Link>
          <Link
            href="/scanner"
            className="px-10 py-4.5 border border-[var(--br-2)] hover:border-[var(--gold-12)] text-[var(--tx-2)] font-medium text-sm rounded-2xl hover-lift transition-colors"
          >
            Karte scannen
          </Link>
        </div>
      </section>

      {/* STATS – extrem clean */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[var(--br-1)] rounded-3xl overflow-hidden mb-28">
        {[
          { value: "28.470", label: "Karten" },
          { value: "1.684", label: "Aktive Sammler" },
          { value: "9.320", label: "Forum-Beiträge" },
          { value: "312", label: "Sets" },
        ].map((item, i) => (
          <div key={i} className="bg-[var(--bg-1)] py-9 px-8 text-center">
            <div className="font-display text-5xl font-light tracking-[-0.04em] text-[var(--tx-1)]">{item.value}</div>
            <div className="text-xs text-[var(--tx-3)] tracking-widest mt-2 uppercase">{item.label}</div>
          </div>
        ))}
      </div>

      {/* TRENDING + FANTASY LEAGUE in einem ruhigen Layout */}
      <div className="grid lg:grid-cols-5 gap-8 mb-32">
        {/* Trending Cards */}
        <div className="lg:col-span-3">
          <div className="flex justify-between items-baseline mb-8">
            <h2 className="font-display text-2xl font-light tracking-tight">Meistgesucht</h2>
            <Link href="/preischeck" className="text-sm text-[var(--tx-3)] hover:text-[var(--gold)]">Alle ansehen →</Link>
          </div>
          {/* Hier später dynamische Cards – aktuell Platzhalter mit gleicher Ästhetik */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-[var(--bg-1)] border border-[var(--br-1)] rounded-3xl overflow-hidden hover-lift group">
                <div className="aspect-[4/3] bg-[var(--bg-2)] flex items-center justify-center">
                  <div className="text-[var(--tx-4)] text-xs">Card Preview {i}</div>
                </div>
                <div className="p-6">
                  <div className="text-sm text-[var(--tx-1)] font-medium line-clamp-1">Charizard ex – Scarlet & Violet</div>
                  <div className="text-xs text-[var(--tx-3)] mt-1">SV3 · #234</div>
                  <div className="mt-4 text-[var(--gold)] font-mono text-lg">184,50 €</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fantasy League Teaser – neu & prominent */}
        <div className="lg:col-span-2 bg-[var(--bg-1)] border border-[var(--br-1)] rounded-3xl p-10 flex flex-col hover-lift">
          <div className="uppercase text-xs tracking-[0.12em] text-[var(--gold)] mb-3">NEW SEASON</div>
          <div className="font-display text-4xl leading-none tracking-[-0.03em] mb-6">
            Fantasy League<br />PokéDax
          </div>
          <p className="text-[var(--tx-2)] text-[15px] leading-relaxed flex-1">
            Baue dein 1.000 € Team. Sammle Punkte durch reale Kursentwicklungen. 
            Monatliche Preise und shareable Trophy Cards.
          </p>

          <div className="mt-10 pt-8 border-t border-[var(--br-1)]">
            <div className="text-xs text-[var(--tx-3)] mb-4">AKTUELLES LEADERBOARD</div>
            <div className="space-y-4">
              {["@luxecollector", "@pokegoldrush", "@silentvault"].map((user, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-[var(--tx-2)]">{user}</span>
                  <span className="font-mono text-[var(--gold)]">+{Math.floor(Math.random()*120)+80} pts</span>
                </div>
              ))}
            </div>
          </div>

          <Link href="/fantasy" className="mt-10 block w-full py-4 text-center border border-[var(--gold-12)] hover:bg-[var(--gold-05)] text-[var(--gold)] font-medium rounded-2xl transition-all">
            Jetzt Team aufstellen →
          </Link>
        </div>
      </div>

      {/* Scanner + Portfolio Teaser – noch ruhiger */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-[var(--bg-1)] border border-[var(--br-1)] rounded-3xl p-12 hover-lift">
          <div className="text-xs tracking-widest text-[var(--tx-3)] mb-4">GEMINI POWERED</div>
          <div className="font-display text-[42px] leading-none tracking-tight mb-8">Foto machen.<br />Sofort den Wert kennen.</div>
          <Link href="/scanner" className="inline-block px-9 py-4 bg-[var(--gold)] text-black font-medium rounded-2xl hover-lift">
            Scanner starten
          </Link>
        </div>

        <div className="bg-[var(--bg-1)] border border-[var(--br-1)] rounded-3xl p-12 hover-lift flex flex-col">
          <div>
            <div className="uppercase text-xs tracking-widest text-[var(--tx-3)]">Dein Portfolio</div>
            <div className="font-display text-[68px] font-light tracking-[-0.04em] text-[var(--tx-1)] mt-3 mb-1">4.872 €</div>
            <div className="text-emerald-400 flex items-center gap-2 text-sm">▲ 27,3 % <span className="text-[var(--tx-3)]">diesen Monat</span></div>
          </div>
          <div className="mt-auto pt-12 text-xs text-[var(--tx-3)]">47 Karten · 3 Sammlungen</div>
        </div>
      </div>
    </div>
  );
}