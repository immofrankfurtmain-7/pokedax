"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function NotFound() {
  const [spin, setSpin] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setSpin(s => !s), 1500);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      minHeight: "80vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      textAlign: "center", padding: "40px 20px", color: "white",
    }}>
      {/* Animated Pokéball */}
      <div style={{
        width: 100, height: 100, marginBottom: 32,
        animation: spin ? "pokeball-shake 0.4s ease" : "pokeball-float 3s ease-in-out infinite",
        filter: "drop-shadow(0 0 20px rgba(238,21,21,0.4))",
      }}>
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="48" fill="#EE1515" />
          <path d="M 2 50 A 48 48 0 0 1 98 50 Z" fill="white" />
          <rect x="2" y="47" width="96" height="6" fill="#1a1a1a" />
          <circle cx="50" cy="50" r="14" fill="#1a1a1a" />
          <circle cx="50" cy="50" r="10" fill="white" />
          <circle cx="50" cy="50" r="5" fill="#f0f0f0"
            style={{ animation: "pokeball-pulse 1.5s ease-in-out infinite" }} />
        </svg>
      </div>

      <div style={{ fontSize: 11, fontWeight: 700, color: "#EE1515", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 16 }}>
        Fehler 404
      </div>

      <h1 style={{
        fontFamily: "Poppins, sans-serif", fontWeight: 900,
        fontSize: "clamp(28px, 5vw, 48px)", letterSpacing: "-0.02em",
        marginBottom: 12, lineHeight: 1.1,
      }}>
        Diese Seite ist<br />
        <span style={{ background: "linear-gradient(135deg, #EE1515, #ff6b6b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          entwischt!
        </span>
      </h1>

      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 15, maxWidth: 380, marginBottom: 32, lineHeight: 1.6 }}>
        Der Wildpokémon-Detektor zeigt nichts an. Diese Seite existiert nicht — oder ist gerade auf der Flucht.
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <Link href="/" style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "12px 24px", borderRadius: 12,
          background: "#EE1515", color: "white",
          fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: 14,
          textDecoration: "none",
        }}>
          🏠 Zur Startseite
        </Link>
        <Link href="/preischeck" style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "12px 24px", borderRadius: 12,
          background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)",
          color: "rgba(255,255,255,0.7)",
          fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: 14,
          textDecoration: "none",
        }}>
          🔍 Preischeck
        </Link>
      </div>

      <style>{`
        @keyframes pokeball-float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(5deg); }
        }
        @keyframes pokeball-shake {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-15deg); }
          75% { transform: rotate(15deg); }
        }
        @keyframes pokeball-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
