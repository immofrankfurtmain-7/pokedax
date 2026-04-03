// src/components/layout/Navbar.tsx

"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="relative z-50 border-b border-[var(--br-1)] bg-[var(--canvas)]/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-7 h-7 rounded-full border border-[var(--gold)] flex items-center justify-center">
              <span className="text-[var(--gold)] text-xl font-light tracking-[-0.05em]">P</span>
            </div>
            <div>
              <span className="font-display text-2xl font-light tracking-[-0.04em] text-[var(--tx-1)]">PokéDax</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10 text-sm font-medium">
            <Link 
              href="/preischeck" 
              className="text-[var(--tx-2)] hover:text-[var(--tx-1)] transition-colors gold-glow px-4 py-2 rounded-2xl"
            >
              Preischeck
            </Link>
            <Link 
              href="/scanner" 
              className="text-[var(--tx-2)] hover:text-[var(--tx-1)] transition-colors gold-glow px-4 py-2 rounded-2xl"
            >
              Scanner
            </Link>
            <Link 
              href="/portfolio" 
              className="text-[var(--tx-2)] hover:text-[var(--tx-1)] transition-colors gold-glow px-4 py-2 rounded-2xl"
            >
              Portfolio
            </Link>
            <Link 
              href="/fantasy" 
              className="text-[var(--tx-2)] hover:text-[var(--tx-1)] transition-colors gold-glow px-4 py-2 rounded-2xl"
            >
              Fantasy League
            </Link>
            <Link 
              href="/forum" 
              className="text-[var(--tx-2)] hover:text-[var(--tx-1)] transition-colors gold-glow px-4 py-2 rounded-2xl"
            >
              Forum
            </Link>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            <Link 
              href="/auth/login" 
              className="hidden md:block px-6 py-2.5 text-sm font-medium text-[var(--tx-2)] hover:text-[var(--tx-1)] transition-colors gold-glow rounded-2xl"
            >
              Anmelden
            </Link>
            
            <Link 
              href="/auth/register" 
              className="px-6 py-2.5 bg-[var(--gold)] text-[#0a0a0a] font-semibold text-sm rounded-3xl gold-glow"
            >
              Kostenlos starten
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center text-[var(--tx-2)] hover:text-[var(--tx-1)] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6h12v12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-[var(--br-1)] bg-[var(--bg-1)]">
          <div className="px-6 py-8 flex flex-col gap-6 text-lg">
            <Link href="/preischeck" className="text-[var(--tx-1)]" onClick={() => setIsOpen(false)}>Preischeck</Link>
            <Link href="/scanner" className="text-[var(--tx-1)]" onClick={() => setIsOpen(false)}>Scanner</Link>
            <Link href="/portfolio" className="text-[var(--tx-1)]" onClick={() => setIsOpen(false)}>Portfolio</Link>
            <Link href="/fantasy" className="text-[var(--tx-1)]" onClick={() => setIsOpen(false)}>Fantasy League</Link>
            <Link href="/forum" className="text-[var(--tx-1)]" onClick={() => setIsOpen(false)}>Forum</Link>
            
            <div className="pt-6 border-t border-[var(--br-1)] flex flex-col gap-4">
              <Link href="/auth/login" className="text-center py-4 text-[var(--tx-2)]" onClick={() => setIsOpen(false)}>
                Anmelden
              </Link>
              <Link 
                href="/auth/register" 
                className="text-center py-4 bg-[var(--gold)] text-[#0a0a0a] font-semibold rounded-3xl gold-glow"
                onClick={() => setIsOpen(false)}
              >
                Kostenlos starten
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}