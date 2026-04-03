// src/app/not-found.tsx
"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
      <div className="mb-10 relative">
        <div className="w-20 h-20 rounded-2xl border border-[var(--br-gold)] bg-[var(--bg-1)] flex items-center justify-center">
          <div className="w-9 h-9 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>

      <h1 className="text-4xl font-light tracking-[-0.04em] text-[var(--tx-1)] mb-3">
        Seite nicht gefunden
      </h1>
      <p className="max-w-[340px] text-[var(--tx-2)] text-[15px] leading-relaxed mb-12">
        Die gesuchte Karte scheint aus dem Set entwischt zu sein. 
        Versuche es erneut oder kehre zur Startseite zurück.
      </p>

      <div className="flex gap-4">
        <Link
          href="/"
          className="px-8 py-3.5 bg-[var(--gold)] text-[#0a0a0a] font-medium text-sm tracking-[-0.01em] rounded-xl hover-lift gold-focus"
        >
          Zur Startseite
        </Link>
        <Link
          href="/preischeck"
          className="px-8 py-3.5 border border-[var(--br-2)] text-[var(--tx-2)] font-medium text-sm tracking-[-0.01em] rounded-xl hover:bg-[var(--bg-2)] transition-colors"
        >
          Preischeck öffnen
        </Link>
      </div>
    </div>
  );
}