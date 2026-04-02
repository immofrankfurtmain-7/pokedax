"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--br-1)] bg-[var(--bg-base)]">
      <div className="max-w-screen-2xl mx-auto px-10 py-6 flex items-center justify-between">
        
        {/* Logo */}
        <div className="font-medium text-2xl tracking-[-1px] text-[var(--g)]">
          PokéDax
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8 text-sm text-[var(--tx-2)]">
          <Link href="/preischeck" className="hover:text-[var(--tx-1)] transition-colors">Preischeck</Link>
          <Link href="/scanner" className="hover:text-[var(--tx-1)] transition-colors">Scanner</Link>
          <Link href="/portfolio" className="hover:text-[var(--tx-1)] transition-colors">Portfolio</Link>
          <Link href="/forum" className="hover:text-[var(--tx-1)] transition-colors">Forum</Link>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          <Link 
            href="/auth/login" 
            className="hidden md:block px-7 py-3 text-sm border border-[var(--br-2)] hover:border-[var(--g)] rounded-2xl transition-colors"
          >
            Anmelden
          </Link>
          <Link 
            href="/dashboard/premium" 
            className="px-7 py-3 bg-[var(--g)] text-black font-medium rounded-2xl hover:bg-[#f5c16e] transition-colors"
          >
            Premium
          </Link>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center text-[var(--tx-2)]"
          >
            <span className="text-2xl">☰</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-[var(--br-1)] bg-[var(--bg-1)]">
          <div className="flex flex-col px-10 py-6 gap-6 text-sm">
            <Link href="/preischeck" className="hover:text-[var(--tx-1)]">Preischeck</Link>
            <Link href="/scanner" className="hover:text-[var(--tx-1)]">Scanner</Link>
            <Link href="/portfolio" className="hover:text-[var(--tx-1)]">Portfolio</Link>
            <Link href="/forum" className="hover:text-[var(--tx-1)]">Forum</Link>
            <Link href="/auth/login" className="pt-4 border-t border-[var(--br-1)]">Anmelden</Link>
          </div>
        </div>
      )}
    </nav>
  );
}