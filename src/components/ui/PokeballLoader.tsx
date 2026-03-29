"use client";

export default function PokeballLoader({ text = "Wird geladen..." }: { text?: string }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:14, padding:"64px 0" }}>
      <div style={{ animation:"pb-spin 1s linear infinite", filter:"drop-shadow(0 0 14px rgba(238,21,21,0.5))" }}>
        <svg width="56" height="56" viewBox="0 0 56 56">
          <circle cx="28" cy="28" r="26" fill="#EE1515"/>
          <path d="M 2 28 A 26 26 0 0 1 54 28 Z" fill="white"/>
          <rect x="2" y="25.5" width="52" height="5" fill="#111"/>
          <circle cx="28" cy="28" r="9" fill="#111"/>
          <circle cx="28" cy="28" r="5.5" fill="white"/>
          <circle cx="28" cy="28" r="2.5" fill="#f0f0f0" style={{ animation:"pb-pulse 1s ease-in-out infinite" }}/>
        </svg>
      </div>
      {text && <p style={{ color:"rgba(255,255,255,0.35)", fontSize:13, fontFamily:"Inter,sans-serif" }}>{text}</p>}
      <style>{`
        @keyframes pb-spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        @keyframes pb-pulse { 0%,100% { opacity:1; } 50% { opacity:0.2; } }
      `}</style>
    </div>
  );
}
