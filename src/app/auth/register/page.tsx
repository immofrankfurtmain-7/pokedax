// src/app/auth/register/page.tsx

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[var(--canvas)] flex items-center justify-center py-20">
      <div className="w-full max-w-md px-6">
        <div className="text-center mb-12">
          <div className="font-display text-4xl font-light tracking-[-0.06em] mb-3">Werde Teil von PokéDax</div>
          <p className="text-[var(--tx-2)]">Erstelle dein Konto und starte mit deiner Sammlung.</p>
        </div>

        <div className="bg-[var(--bg-1)] border border-[var(--br-1)] rounded-3xl p-10 gold-glow">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs tracking-widest text-[var(--tx-3)] mb-2">VORNAME</div>
                <input type="text" className="w-full bg-transparent border border-[var(--br-2)] focus:border-[var(--gold)] rounded-2xl px-6 py-4 text-[var(--tx-1)] focus:outline-none gold-glow" />
              </div>
              <div>
                <div className="text-xs tracking-widest text-[var(--tx-3)] mb-2">NACHNAME</div>
                <input type="text" className="w-full bg-transparent border border-[var(--br-2)] focus:border-[var(--gold)] rounded-2xl px-6 py-4 text-[var(--tx-1)] focus:outline-none gold-glow" />
              </div>
            </div>

            <div>
              <div className="text-xs tracking-widest text-[var(--tx-3)] mb-2">E-MAIL</div>
              <input type="email" className="w-full bg-transparent border border-[var(--br-2)] focus:border-[var(--gold)] rounded-2xl px-6 py-4 text-[var(--tx-1)] focus:outline-none gold-glow" />
            </div>

            <div>
              <div className="text-xs tracking-widest text-[var(--tx-3)] mb-2">PASSWORT</div>
              <input type="password" className="w-full bg-transparent border border-[var(--br-2)] focus:border-[var(--gold)] rounded-2xl px-6 py-4 text-[var(--tx-1)] focus:outline-none gold-glow" />
            </div>

            <button className="w-full py-4 bg-[var(--gold)] text-[#0a0a0a] font-semibold rounded-3xl gold-glow mt-6">
              Konto erstellen
            </button>
          </div>

          <div className="text-center mt-8 text-sm">
            <span className="text-[var(--tx-3)]">Bereits registriert? </span>
            <a href="/auth/login" className="text-[var(--gold)] hover:underline">Anmelden</a>
          </div>
        </div>
      </div>
    </div>
  );
}