// src/app/impressum/page.tsx

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-[var(--canvas)] py-20">
      <div className="max-w-3xl mx-auto px-6 prose prose-invert">
        <h1 className="font-display text-5xl font-light tracking-tight mb-12">Impressum</h1>
        
        <div className="space-y-12 text-[var(--tx-2)] leading-relaxed">
          <div>
            <h2 className="text-xl font-medium text-[var(--tx-1)] mb-4">Angaben gemäß § 5 TMG</h2>
            <p>PokéDax GmbH<br />Musterstraße 12<br />80331 München</p>
          </div>
          
          <div>
            <h2 className="text-xl font-medium text-[var(--tx-1)] mb-4">Kontakt</h2>
            <p>E-Mail: hello@pokedax.de</p>
          </div>

          <div className="text-xs text-[var(--tx-3)]">
            Diese Seite wurde mit höchster Präzision und Liebe zum Detail gestaltet.
          </div>
        </div>
      </div>
    </div>
  );
}