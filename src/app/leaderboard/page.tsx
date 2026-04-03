// src/app/leaderboard/page.tsx

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-[var(--canvas)] py-16">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="text-xs tracking-widest text-[var(--gold)] mb-3">FANTASY LEAGUE</div>
          <h1 className="font-display text-6xl font-light tracking-[-0.055em]">Leaderboard</h1>
        </div>

        <div className="bg-[var(--bg-1)] border border-[var(--br-1)] rounded-3xl overflow-hidden">
          {[1,2,3,4,5,6,7].map((rank) => (
            <div key={rank} className="flex items-center justify-between px-10 py-7 border-b border-[var(--br-1)] last:border-none hover:bg-[var(--bg-2)] transition-colors">
              <div className="flex items-center gap-6">
                <div className="w-8 text-2xl font-light text-[var(--tx-3)]">#{rank}</div>
                <div className="font-medium">@luxecollector{rank}</div>
              </div>
              <div className="font-mono text-[var(--gold)] text-xl">1.284 pts</div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12 text-xs text-[var(--tx-3)]">
          Aktualisiert alle 24 Stunden • Saison endet in 18 Tagen
        </div>
      </div>
    </div>
  );
}