// src/components/layout/Navbar.tsx

"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="relative z-50 border-b border-[var(--br-1)] bg-[var(--canvas)]/95 backdrop-blur-2xl">
      <div className="max-w-6xl mx-auto px-6">
        <div className="h-20 flex items-center justify-between">
          {/* Logo – edel, klein, fein */}
          <Link href="/" className="group">
            <span className="font-display text-[22px] font-light tracking-[-0.07em] text-[var(--tx-1)]">
              pokédax
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-12 text-sm">
            <Link 
              href="/preischeck" 
              className="text-[var(--tx-2)] hover:text-[var(--tx-1)] transition-all gold-glow px-4 py-3 rounded-2xl"
            >
              Preischeck
            </Link>
            <Link 
              href="/scanner" 
              className="text-[var(--tx-2)] hover:text-[var(--tx-1)] transition-all gold-glow px-4 py-3 rounded-2xl"
            >
              Scanner
            </Link>
            <Link 
              href="/portfolio" 
              className="text-[var(--tx-2)] hover:text-[var(--tx-1)] transition-all gold-glow px-4 py-3 rounded-2xl"
            >
              Portfolio
            </Link>
            <Link 
              href="/fantasy" 
              className="text-[var(--tx-2)] hover:text-[var(--tx-1)] transition-all gold-glow px-4 py-3 rounded-2xl"
            >
              Fantasy League
            </Link>
          </div>

          {/* Right Side – Premium prominent */}
          <div className="flex items-center gap-6">
            <Link 
              href="/auth/login" 
              className="hidden md:block text-sm font-medium text-[var(--tx-2)] hover:text-[var(--tx-1)] transition-all gold-glow px-5 py-3 rounded-2xl"
            >
              Anmelden
            </Link>

            {/* Premium Button – stark und edel */}
            <Link 
              href="/dashboard/premium" 
              className="hidden md:block px-7 py-3 bg-[var(--gold)] hover:bg-[#d19a3f] text-[#0a0a0a] font-semibold text-sm rounded-3xl gold-glow transition-all"
            >
              Premium
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center text-[var(--tx-2)] hover:text-[var(--tx-1)]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d={isOpen ? "M6 18L18 6M6 6h12v12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-[var(--br-1)] bg-[var(--bg-1)]">
          <div className="px-6 py-10 flex flex-col gap-7 text-[17px]">
            <Link href="/preischeck" className="text-[var(--tx-1)]" onClick={() => setIsOpen(false)}>Preischeck</Link>
            <Link href="/scanner" className="text-[var(--tx-1)]" onClick={() => setIsOpen(false)}>Scanner</Link>
            <Link href="/portfolio" className="text-[var(--tx-1)]" onClick={() => setIsOpen(false)}>Portfolio</Link>
            <Link href="/fantasy" className="text-[var(--tx-1)]" onClick={() => setIsOpen(false)}>Fantasy League</Link>
            <Link href="/forum" className="text-[var(--tx-1)]" onClick={() => setIsOpen(false)}>Forum</Link>

            <div className="pt-8 border-t border-[var(--br-1)] space-y-4">
              <Link 
                href="/auth/login" 
                className="block py-4 text-center text-[var(--tx-2)]" 
                onClick={() => setIsOpen(false)}
              >
                Anmelden
              </Link>
              <Link 
                href="/dashboard/premium" 
                className="block py-4 text-center bg-[var(--gold)] text-[#0a0a0a] font-semibold rounded-3xl gold-glow"
                onClick={() => setIsOpen(false)}
              >
                Premium werden
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}