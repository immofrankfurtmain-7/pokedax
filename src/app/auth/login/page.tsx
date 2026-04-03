// src/app/auth/login/page.tsx
"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulierte Anmeldung (später echte Supabase Auth)
    setTimeout(() => {
      setLoading(false);
      alert("Anmeldung erfolgreich! (In der echten Version wirst du eingeloggt)");
      window.location.href = "/";
    }, 1200);
  };

  return (
    <div className="bg-[var(--bg-base)] text-[var(--tx-1)] min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="inline-block font-medium text-4xl tracking-[-1px] text-[var(--g)]">PokéDax</div>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-4xl font-light tracking-tight mb-3">Willkommen zurück</h1>
          <p className="text-[var(--tx-2)]">Melde dich an, um dein Portfolio zu verwalten</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Email */}
          <div>
            <label className="block text-sm text-[var(--tx-3)] mb-3">E-Mail-Adresse</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="deine@email.de"
              className="w-full bg-[var(--bg-1)] border border-[var(--br-2)] rounded-3xl px-8 py-5 text-lg outline-none focus:border-[var(--g18)] transition-colors"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm text-[var(--tx-3)] mb-3">Passwort</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[var(--bg-1)] border border-[var(--br-2)] rounded-3xl px-8 py-5 text-lg outline-none focus:border-[var(--g18)] transition-colors"
              required
            />
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <Link href="/auth/forgot-password" className="text-sm text-[var(--tx-2)] hover:text-[var(--g)] transition-colors">
              Passwort vergessen?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-[var(--g)] text-black font-medium rounded-3xl text-lg hover:bg-[#f5c16e] transition-colors disabled:opacity-70"
          >
            {loading ? "Anmelden..." : "Anmelden"}
          </button>
        </form>

        {/* Register Link */}
        <div className="text-center mt-12 text-sm text-[var(--tx-2)]">
          Noch kein Konto?{" "}
          <Link href="/auth/register" className="text-[var(--g)] hover:underline">
            Jetzt kostenlos registrieren
          </Link>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center text-[10px] text-[var(--tx-3)] tracking-widest">
          SICHER • VERSCHLÜSSELT • DSGVO-KONFORM
        </div>

      </div>
    </div>
  );
}