// src/app/scanner/page.tsx

export default function ScannerPage() {
  return (
    <div className="min-h-screen bg-[var(--canvas)] flex items-center justify-center py-20">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <div className="mb-12">
          <div className="inline text-xs tracking-widest text-[var(--gold)]">GEMINI FLASH POWERED</div>
          <h1 className="font-display text-6xl font-light tracking-[-0.06em] mt-4 mb-6">
            Halte deine Karte<br />vor die Kamera.
          </h1>
          <p className="text-[var(--tx-2)] text-lg">Der Scanner erkennt Name, Set, Zustand und aktuellen Marktwert in Sekunden.</p>
        </div>

        {/* Großer Upload-Bereich */}
        <div className="border-2 border-dashed border-[var(--gold-18)] rounded-3xl h-[420px] flex flex-col items-center justify-center gap-8 hover:border-[var(--gold)] transition-all gold-glow">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" className="text-[var(--gold)]">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
          </svg>
          <div>
            <div className="text-xl font-medium mb-2">Foto oder Karte ablegen</div>
            <div className="text-sm text-[var(--tx-3)]">Unterstützt JPG, PNG, HEIC • Max. 15 MB</div>
          </div>
        </div>

        <div className="mt-10 text-xs text-[var(--tx-3)]">Oder klicke hier, um aus der Galerie zu wählen</div>
      </div>
    </div>
  );
}