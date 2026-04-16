"use client";

export default function MewtwoSilhouette() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        right: -20,
        bottom: 0,
        width: "clamp(180px, 22vw, 320px)",
        height: "auto",
        pointerEvents: "none",
        opacity: 0.06,
        zIndex: 0,
        userSelect: "none",
      }}
    >
      <svg viewBox="0 0 200 320" fill="white" xmlns="http://www.w3.org/2000/svg">
        {/* Mewtwo silhouette - simplified geometric shape */}
        {/* Head */}
        <ellipse cx="100" cy="60" rx="35" ry="38" />
        {/* Ears/horns */}
        <ellipse cx="75" cy="30" rx="10" ry="22" transform="rotate(-15 75 30)" />
        <ellipse cx="125" cy="30" rx="10" ry="22" transform="rotate(15 125 30)" />
        {/* Neck */}
        <rect x="88" y="90" width="24" height="20" rx="4" />
        {/* Body */}
        <ellipse cx="100" cy="155" rx="42" ry="50" />
        {/* Chest plate */}
        <ellipse cx="100" cy="140" rx="22" ry="16" />
        {/* Left arm */}
        <path d="M 60 120 Q 30 140 25 175 Q 22 195 35 200 Q 45 155 65 140 Z" />
        {/* Right arm */}
        <path d="M 140 120 Q 170 140 175 175 Q 178 195 165 200 Q 155 155 135 140 Z" />
        {/* Left hand */}
        <ellipse cx="32" cy="205" rx="14" ry="10" />
        {/* Right hand */}
        <ellipse cx="168" cy="205" rx="14" ry="10" />
        {/* Legs */}
        <path d="M 75 195 Q 65 240 60 280 Q 58 295 72 298 Q 80 265 85 220 Z" />
        <path d="M 125 195 Q 135 240 140 280 Q 142 295 128 298 Q 120 265 115 220 Z" />
        {/* Feet */}
        <ellipse cx="66" cy="300" rx="18" ry="10" />
        <ellipse cx="134" cy="300" rx="18" ry="10" />
        {/* Tail */}
        <path d="M 100 195 Q 150 210 165 240 Q 175 260 160 270 Q 148 255 138 235 Q 125 215 100 205 Z" />
        {/* Tail tip */}
        <ellipse cx="158" cy="272" rx="12" ry="10" />
      </svg>
    </div>
  );
}
