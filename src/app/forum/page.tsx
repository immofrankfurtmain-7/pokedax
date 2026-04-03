// src/app/forum/page.tsx

export default function ForumPage() {
  return (
    <div className="min-h-screen bg-[var(--canvas)] py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="font-display text-5xl font-light tracking-[-0.04em]">Forum</h1>
            <p className="text-[var(--tx-2)] mt-2">Diskutiere Preise, Sammlungen und Strategien mit der Community.</p>
          </div>
          <div className="px-8 py-4 bg-[var(--gold)] text-[#0a0a0a] font-medium rounded-3xl gold-glow">Neuen Beitrag erstellen</div>
        </div>

        <div className="space-y-6">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="bg-[var(--bg-1)] border border-[var(--br-1)] rounded-3xl p-8 gold-glow flex gap-8">
              <div className="w-12 h-12 rounded-2xl bg-[var(--bg-2)] flex-shrink-0 flex items-center justify-center text-xl font-light">A</div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <div>
                    <span className="font-medium">@luxecollector</span>
                    <span className="ml-4 text-xs px-4 py-1 bg-[var(--gold-08)] text-[var(--gold)] rounded-full">Preise</span>
                  </div>
                  <div className="text-xs text-[var(--tx-3)]">vor 2 Std.</div>
                </div>
                <div className="mt-3 text-[var(--tx-1)] text-lg leading-tight">
                  Ist der Preis von Moonbreon schon überhitzt oder lohnt sich noch ein Einstieg?
                </div>
                <div className="mt-6 text-xs text-[var(--tx-3)]">124 Upvotes • 18 Antworten</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}