// src/app/auth/login/page.tsx

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[var(--canvas)] flex items-center justify-center py-20">
      <div className="w-full max-w-md px-6">
        <div className="text-center mb-12">
          <div className="font-display text-4xl font-light tracking-[-0.06em] mb-3">Willkommen zurück</div>
          <p className="text-[var(--tx-2)]">Melde dich an, um deine Sammlung fortzusetzen.</p>
        </div>

        <div className="bg-[var(--bg-1)] border border-[var(--br-1)] rounded-3xl p-10 gold-glow">
          <div className="space-y-6">
            <div>
              <div className="text-xs tracking-widest text-[var(--tx-3)] mb-2">E-MAIL</div>
              <input 
                type="email" 
                placeholder="name@beispiel.de" 
                className="w-full bg-transparent border border-[var(--br-2)] focus:border-[var(--gold)] rounded-2xl px-6 py-4 text-[var(--tx-1)] focus:outline-none gold-glow" 
              />
            </div>

            <div>
              <div className="text-xs tracking-widest text-[var(--tx-3)] mb-2">PASSWORT</div>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full bg-transparent border border-[var(--br-2)] focus:border-[var(--gold)] rounded-2xl px-6 py-4 text-[var(--tx-1)] focus:outline-none gold-glow" 
              />
            </div>

            <button className="w-full py-4 bg-[var(--gold)] text-[#0a0a0a] font-semibold rounded-3xl gold-glow mt-4">
              Anmelden
            </button>
          </div>

          <div className="text-center mt-8 text-sm">
            <span className="text-[var(--tx-3)]">Noch kein Account? </span>
            <a href="/auth/register" className="text-[var(--gold)] hover:underline">Jetzt registrieren</a>
          </div>
        </div>
      </div>
    </div>
  );
}