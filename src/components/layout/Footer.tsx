// src/components/layout/Footer.tsx

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[var(--canvas)] border-t border-[var(--br-1)] pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-12 gap-y-16">
          {/* Brand */}
          <div className="md:col-span-5">
            <div className="font-display text-[28px] font-light tracking-[-0.07em] text-[var(--tx-1)] mb-4">
              pokédax
            </div>
            <p className="text-[var(--tx-3)] max-w-xs leading-relaxed">
              Die präziseste und edelste Plattform für Pokémon TCG.<br />
              Live Cardmarket. KI-Scanner. Echte Sammler-Tools.
            </p>
          </div>

          {/* Links */}
          <div className="md:col-span-3">
            <div className="uppercase text-xs tracking-widest text-[var(--tx-3)] mb-6">Plattform</div>
            <div className="space-y-4 text-sm">
              <Link href="/preischeck" className="block text-[var(--tx-2)] hover:text-[var(--tx-1)] transition-colors">Preischeck</Link>
              <Link href="/scanner" className="block text-[var(--tx-2)] hover:text-[var(--tx-1)] transition-colors">KI-Scanner</Link>
              <Link href="/portfolio" className="block text-[var(--tx-2)] hover:text-[var(--tx-1)] transition-colors">Portfolio</Link>
              <Link href="/fantasy" className="block text-[var(--tx-2)] hover:text-[var(--tx-1)] transition-colors">Fantasy League</Link>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="uppercase text-xs tracking-widest text-[var(--tx-3)] mb-6">Community</div>
            <div className="space-y-4 text-sm">
              <Link href="/forum" className="block text-[var(--tx-2)] hover:text-[var(--tx-1)] transition-colors">Forum</Link>
              <Link href="/leaderboard" className="block text-[var(--tx-2)] hover:text-[var(--tx-1)] transition-colors">Leaderboard</Link>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="uppercase text-xs tracking-widest text-[var(--tx-3)] mb-6">Legal</div>
            <div className="space-y-4 text-sm">
              <Link href="/impressum" className="block text-[var(--tx-2)] hover:text-[var(--tx-1)] transition-colors">Impressum</Link>
              <Link href="/datenschutz" className="block text-[var(--tx-2)] hover:text-[var(--tx-1)] transition-colors">Datenschutz</Link>
              <Link href="/agb" className="block text-[var(--tx-2)] hover:text-[var(--tx-1)] transition-colors">AGB</Link>
            </div>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="mt-24 pt-10 border-t border-[var(--br-1)] flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-[var(--tx-3)]">
          <div>© {new Date().getFullYear()} PokéDax. Alle Rechte vorbehalten.</div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-[var(--tx-2)] transition-colors">Twitter</a>
            <a href="#" className="hover:text-[var(--tx-2)] transition-colors">Instagram</a>
            <a href="#" className="hover:text-[var(--tx-2)] transition-colors">Discord</a>
          </div>
          <div>Mit Präzision in Deutschland entwickelt</div>
        </div>
      </div>
    </footer>
  );
}