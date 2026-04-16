"use client";

interface Props {
  size?: number;
  label?: string;
}

export default function PokeballSpinner({ size = 48, label = "Wird gescannt..." }: Props) {
  const s = size;
  const r = s / 2;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <div style={{ width: s, height: s, position: "relative", animation: "pokeball-spin 1.2s linear infinite" }}>
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          {/* Top half - red */}
          <path
            d={`M ${r} ${r} m -${r} 0 a ${r} ${r} 0 0 1 ${s} 0 Z`}
            fill="#EE1515"
          />
          {/* Bottom half - white */}
          <path
            d={`M ${r} ${r} m -${r} 0 a ${r} ${r} 0 0 0 ${s} 0 Z`}
            fill="white"
          />
          {/* Center divider line */}
          <rect x={0} y={r - 2} width={s} height={4} fill="#1a1a1a" />
          {/* Outer ring */}
          <circle cx={r} cy={r} r={r - 1} fill="none" stroke="#1a1a1a" strokeWidth={2} />
          {/* Center button outer */}
          <circle cx={r} cy={r} r={r * 0.28} fill="#1a1a1a" />
          {/* Center button inner - pulses */}
          <circle cx={r} cy={r} r={r * 0.18} fill="white"
            style={{ animation: "pokeball-pulse 1.2s ease-in-out infinite" }} />
        </svg>
      </div>

      {label && (
        <p style={{
          fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 500,
          color: "rgba(255,255,255,0.4)", letterSpacing: "0.05em",
        }}>{label}</p>
      )}

      <style>{`
        @keyframes pokeball-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes pokeball-pulse {
          0%, 100% { opacity: 1; r: ${r * 0.18}px; }
          50%       { opacity: 0.4; r: ${r * 0.12}px; }
        }
      `}</style>
    </div>
  );
}
