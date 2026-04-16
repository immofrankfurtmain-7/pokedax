"use client";

export default function TopMoversError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, color: "white" }}>
      <div style={{ fontSize: 44 }}>⚠️</div>
      <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 800, fontSize: 20 }}>Fehler beim Laden</h2>
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, maxWidth: 360, textAlign: "center" }}>
        Die Top Movers konnten nicht geladen werden. Möglicherweise fehlen noch Preisdaten in der Datenbank.
      </p>
      <button onClick={reset} style={{ padding: "10px 20px", borderRadius: 10, background: "#EE1515", border: "none", color: "white", fontWeight: 700, cursor: "pointer" }}>
        Erneut versuchen
      </button>
    </div>
  );
}
