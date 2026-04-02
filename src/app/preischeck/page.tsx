// src/app/preischeck/page.tsx
import { Suspense } from "react";

export default function PreischeckPage() {
  return (
    <div className="bg-[var(--bg-base)] text-[var(--tx-1)] min-h-screen">
      <div className="max-w-screen-2xl mx-auto px-10 pt-12">
        
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h1 className="text-5xl font-light tracking-[-2px] mb-4">
            Preis checken
          </h1>
          <p className="text-[var(--tx-2)] text-lg">
            Gib den Namen oder die Kartennummer ein – sofort den aktuellen Cardmarket-Wert sehen.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-16">
          <div className="bg-[var(--bg-1)] border border-[var(--br-2)] rounded-3xl p-2 flex items-center">
            <input 
              type="text" 
              placeholder="z. B. Charizard ex, Pikachu VMAX, Gardevoir ex..."
              className="flex-1 bg-transparent outline-none px-8 py-5 text-lg placeholder-[var(--tx-3)]"
            />
            <button className="bg-[var(--g)] text-black font-medium px-10 py-5 rounded-3xl hover:bg-[#f5c16e] transition-colors">
              Suchen
            </button>
          </div>
        </div>

        {/* Ergebnisse Platzhalter (später dynamisch) */}
        <div className="max-w-4xl mx-auto">
          <div className="text-xs text-[var(--tx-3)] mb-6 tracking-widest">ERGEBNISSE</div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Beispiel-Karte */}
            <div className="bg-[var(--bg-1)] border border-[var(--br-2)] rounded-3xl overflow-hidden group hover:border-[var(--g18)] transition-all">
              <div className="aspect-[3/4] bg-[var(--bg-2)] flex items-center justify-center p-8">
                <div className="w-full h-full bg-black/30 rounded-2xl"></div>
              </div>
              <div className="px-6 py-7">
                <div className="font-medium">Charizard ex</div>
                <div className="text-xs text-[var(--tx-3)]">Scarlet & Violet • #234</div>
                <div className="price mt-6">312,80 €</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}