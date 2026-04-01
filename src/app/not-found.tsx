"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-[var(--bg-base)] px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-md text-center"
      >
        {/* Minimalistischer 404 Indicator */}
        <div className="mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border border-[var(--br-2)] mb-8">
            <span className="text-[92px] font-light tracking-[-6px] text-[var(--tx-3)] select-none">404</span>
          </div>
        </div>

        <h1 className="text-4xl font-medium tracking-[-0.8px] text-[var(--tx-1)] mb-4">
          Seite nicht gefunden
        </h1>

        <p className="text-[var(--tx-2)] text-[15px] leading-relaxed max-w-[280px] mx-auto mb-12">
          Die gesuchte Seite existiert nicht oder wurde verschoben.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-10 py-4 bg-[var(--g)] hover:bg-[#f5c16e] active:bg-[#e09a3a] transition-all text-[#0a0a0a] font-semibold text-sm rounded-2xl flex items-center justify-center gap-2"
          >
            Zur Startseite
          </Link>

          <Link
            href="/preischeck"
            className="px-10 py-4 border border-[var(--br-2)] hover:border-[var(--g18)] hover:text-[var(--tx-1)] text-[var(--tx-2)] font-medium text-sm rounded-2xl transition-all"
          >
            Preischeck öffnen
          </Link>
        </div>

        <p className="mt-16 text-xs text-[var(--tx-3)]">
          PokéDax • Präzise. Edel. Immer aktuell.
        </p>
      </motion.div>
    </div>
  );
}