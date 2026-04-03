// src/app/loading.tsx
export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--canvas)]">
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-11 h-11">
          <div className="absolute inset-0 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-[3px] border border-[var(--br-2)] rounded-full" />
        </div>
        <div className="text-[11px] font-medium tracking-[0.08em] text-[var(--tx-3)] uppercase">
          Lade PokéDax…
        </div>
      </div>
    </div>
  );
}