// src/app/not-found.tsx

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center bg-[var(--canvas)]">
      <div className="mb-12">
        <div className="w-24 h-24 mx-auto border border-[var(--gold-18)] rounded-3xl flex items-center justify-center">
          <span className="text-6xl text-[var(--gold)] font-light">404</span>
        </div>
      </div>

      <h1 className="font-display text-5xl font-light tracking-[-0.04em] mb-4 text-[var(--tx-1)]">
        Seite nicht gefunden
      </h1>
      <p className="text-[var(--tx-2)] max-w-sm mb-12">
        Die gesuchte Karte scheint aus dem Set entwischt zu sein.
      </p>

      <div className="flex gap-4">
        <Link 
          href="/" 
          className="px-8 py-4 bg-[var(--gold)] text-[#0a0a0a] font-semibold rounded-3xl gold-glow"
        >
          Zur Startseite
        </Link>
        <Link 
          href="/preischeck" 
          className="px-8 py-4 border border-[var(--br-2)] text-[var(--tx-2)] font-medium rounded-3xl gold-glow"
        >
          Preischeck öffnen
        </Link>
      </div>
    </div>
  );
}