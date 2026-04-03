// src/app/auth/register/page.tsx
"use client";

import Link from "next/link";
import { useState } from "react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Die Passwörter stimmen nicht überein.");
      return;
    }

    setLoading(true);

    // Simulierte Registrierung (später echte Supabase Auth)
    setTimeout(() => {
      setLoading(false);
      alert("Registrierung erfolgreich! Willkommen bei PokéDax.");
      window.location.href = "/";
    }, 1400);
  };

  return (
    <div className="bg-[var(--bg-base)] text-[var(--tx-1)] min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-12">
          <div className="inline-block font-medium text-4xl tracking-[-1px] text-[var(--g)]">PokéDax</div>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-4xl font-light tracking-tight mb-3">Konto erstellen</h1>
          <p className="text-[var(--tx-2)]">Werde Teil der seriösen Pokémon TCG Community</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Name */}
          <div>
            <label className="block text-sm text-[var(--tx-3)] mb-3">Dein Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Max Mustermann"
              className="w-full bg-[var(--bg-1)] border border-[var(--br-2)] rounded-3xl px-8 py-5 text-lg outline-none focus:border-[var(--g18)] transition-colors"
              required
            />
          </div>

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
              placeholder="Mindestens 8 Zeichen"
              className="w-full bg-[var(--bg-1)] border border-[var(--br-2)] rounded-3xl px-8 py-5 text-lg outline-none focus:border-[var(--g18)] transition-colors"
              required
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm text-[var(--tx-3)] mb-3">Passwort bestätigen</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Passwort wiederholen"
              className="w-full bg-[var(--bg-1)] border border-[var(--br-2)] rounded-3xl px-8 py-5 text-lg outline-none focus:border-[var(--g18)] transition-colors"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !name || !email || !password || !confirmPassword}
            className="w-full py-5 bg-[var(--g)] text-black font-medium rounded-3xl text-lg hover:bg-[#f5c16e] transition-colors disabled:opacity-50"
          >
            {loading ? "Konto wird erstellt..." : "Konto erstellen"}
          </button>
        </form>

        {/* Login Link */}
        <div className="text-center mt-12 text-sm text-[var(--tx-2)]">
          Bereits registriert?{" "}
          <Link href="/auth/login" className="text-[var(--g)] hover:underline">
            Jetzt anmelden
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