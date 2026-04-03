// src/components/layout/Footer.tsx

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--br-1)] bg-[var(--canvas)] pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-12 gap-y-16">
          {/* Left Column */}
          <div className="md:col-span-5">
            <div className="font-display text-3xl font-light tracking-[-0.06em] text-[var(--tx-1)] mb-3">
              PokéDax
            </div>
            <p className="text-[var(--tx-3)] max-w-sm leading-relaxed">
              Die edelste Plattform für Pokémon TCG in Deutschland.<br />
              Live-Preise. Präziser Scanner. Echtes Sammler-Feeling.
            </p>
          </div>

          {/* Navigation Columns */}
          <div className="md:col-span-3">
            <div className="text-xs tracking-widest text-[var(--tx-3)] mb-6">PRODUKT</div>
            <div className="flex flex-col gap-3 text-sm">
              <Link href="/preischeck" className="text-[var(--tx-2)] hover:text-[var(--tx-1)] transition-colors">Preischeck</Link>
              <Link href="/scanner" className="text-[var(--tx-2)] hover:text-[var(--tx-1)] transition-colors">KI-Scanner</Link>
              <Link href="/portfolio" className="text-[var(--tx-2)] hover:text-[var(--tx-1)] transition-colors">Portfolio</Link>
              <Link href="/fantasy" className="text-[var(--tx-2)] hover:text-[var(--tx-1)] transition-colors">Fantasy League</Link>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="text-xs tracking-widest text-[var(--tx-3)] mb-6">COMMUNITY</div>
            <div className="flex flex-col gap-3 text-sm">
              <Link href="/forum" className="text-[var(--tx-2)] hover:text-[var(--tx-1)] transition-colors">Forum</Link>
              <Link href="/leaderboard" className="text-[var(--tx-2)] hover:text-[var(--tx-1)] transition-colors">Leaderboard</Link>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="text-xs tracking-widest text-[var(--tx-3)] mb-6">RECHTLICH</div>
            <div className="flex flex-col gap-3 text-sm">
              <Link href="/impressum" className="text-[var(--tx-2)] hover:text-[var(--tx-1)] transition-colors">Impressum</Link>
              <Link href="/datenschutz" className="text-[var(--tx-2)] hover:text-[var(--tx-1)] transition-colors">Datenschutz</Link>
              <Link href="/agb" className="text-[var(--tx-2)] hover:text-[var(--tx-1)] transition-colors">AGB</Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-24 pt-8 border-t border-[var(--br-1)] flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[var(--tx-3)]">
          <div>© {new Date().getFullYear()} PokéDax. Alle Rechte vorbehalten.</div>
          <div className="flex gap-6">
            <a href="https://twitter.com" target="_blank" className="hover:text-[var(--tx-2)] transition-colors">Twitter</a>
            <a href="https://instagram.com" target="_blank" className="hover:text-[var(--tx-2)] transition-colors">Instagram</a>
            <a href="https://discord.com" target="_blank" className="hover:text-[var(--tx-2)] transition-colors">Discord</a>
          </div>
          <div>Made with precision in Germany</div>
        </div>
      </div>
    </footer>
  );
}