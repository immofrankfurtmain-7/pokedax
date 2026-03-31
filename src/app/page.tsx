"use client";

import Link from "next/link";

const G = "#E9A84B";           // Edles Gold wie gewünscht
const G18 = "rgba(233,168,75,0.18)";
const G10 = "rgba(233,168,75,0.10)";
const G06 = "rgba(233,168,75,0.06)";

export default function HomePage() {
  return (
    <div style={{
      background: "#05050D",
      color: "#F1ECF9",
      minHeight: "100vh",
      fontFamily: "Inter, system-ui, sans-serif",
      position: "relative",
      overflow: "hidden"
    }}>

      {/* Subtiler Canvas-Hintergrund */}
      <div style={{
        position: "fixed",
        inset: 0,
        background: `
          radial-gradient(circle at 25% 30%, rgba(233,168,75,0.07) 0%, transparent 45%),
          radial-gradient(circle at 75% 70%, rgba(233,168,75,0.05) 0%, transparent 50%)
        `,
        zIndex: 0,
        pointerEvents: "none"
      }} />

      {/* HERO */}
      <section style={{
        padding: "170px 24px 130px",
        textAlign: "center",
        position: "relative",
        zIndex: 2,
      }}>
        <h1 style={{
          fontSize: "clamp(56px, 8.5vw, 84px)",
          fontWeight: 260,
          letterSpacing: "-0.062em",
          lineHeight: 1.01,
          marginBottom: 32,
        }}>
          Dein wahrer Sammlungswert.<br />
          <span style={{ color: G, fontWeight: 400 }}>Jeden Tag.</span>
        </h1>

        <p style={{
          fontSize: "18.5px",
          color: "#9E9EB8",
          maxWidth: "590px",
          margin: "0 auto 68px",
          lineHeight: 1.78,
        }}>
          Live Cardmarket-Preise in Echtzeit.<br />
          Präziser KI-Scanner. Elegantes Portfolio-Tracking.
        </p>

        <div style={{ display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="#pricing" style={{
            padding: "19px 50px",
            background: G,
            color: "#0F0A00",
            fontWeight: 600,
            fontSize: "17px",
            borderRadius: "16px",
            textDecoration: "none",
            boxShadow: "0 14px 55px rgba(233,168,75,0.45)",
          }}>
            Premium starten – 6,99 €/Monat
          </Link>
          <Link href="#scanner" style={{
            padding: "19px 50px",
            border: "1px solid rgba(255,255,255,0.20)",
            color: "#F1ECF9",
            fontWeight: 500,
            fontSize: "17px",
            borderRadius: "16px",
            textDecoration: "none",
          }}>
            Karte scannen →
          </Link>
        </div>
      </section>

      {/* PRICING – Finaler edler Look */}
      <section id="pricing" style={{ 
        padding: "120px 24px", 
        maxWidth: "1240px", 
        margin: "0 auto",
        position: "relative",
        zIndex: 2 
      }}>
        <div style={{ textAlign: "center", marginBottom: "80px" }}>
          <h2 style={{ 
            fontSize: "34px", 
            fontWeight: 500, 
            letterSpacing: "-0.025em" 
          }}>
            Wähle dein Paket
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "36px" }}>

          {/* Free */}
          <div style={{
            background: "#0F0F1F",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "26px",
            padding: "50px 38px",
            textAlign: "center",
          }}>
            <div style={{ fontSize: "15px", color: "#777" }}>Free</div>
            <div style={{ fontSize: "48px", fontWeight: 600, margin: "28px 0 16px" }}>0 €</div>
            <button style={{
              width: "100%",
              padding: "17px",
              background: "#1F1F2F",
              color: "#999",
              border: "none",
              borderRadius: "14px",
              fontSize: "16px"
            }}>
              Kostenlos starten
            </button>
          </div>

          {/* Premium – Highlight */}
          <div style={{
            background: "#0F0F1F",
            border: "2px solid #E9A84B",
            borderRadius: "26px",
            padding: "50px 38px",
            position: "relative",
            boxShadow: "0 0 70px rgba(233,168,75,0.28)",
            transform: "scale(1.04)",
          }}>
            <div style={{
              position: "absolute",
              top: "-19px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "#E9A84B",
              color: "#0F0A00",
              padding: "8px 34px",
              borderRadius: "9999px",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "1px",
            }}>
              BELIEBTESTE WAHL
            </div>

            <div style={{ fontSize: "16.5px", color: G }}>Premium</div>
            <div style={{ fontSize: "58px", fontWeight: 600, color: G, margin: "18px 0 10px" }}>6,99 €</div>
            <div style={{ color: "#666", marginBottom: "42px" }}>pro Monat • monatlich kündbar</div>

            <button style={{
              width: "100%",
              padding: "19px",
              background: G,
              color: "#0F0A00",
              border: "none",
              borderRadius: "14px",
              fontSize: "17.5px",
              fontWeight: 600,
            }}>
              Jetzt Premium werden
            </button>
          </div>

          {/* Händler */}
          <div style={{
            background: "#0F0F1F",
            border: "1px solid rgba(233,168,75,0.38)",
            borderRadius: "26px",
            padding: "50px 38px",
            textAlign: "center",
          }}>
            <div style={{ fontSize: "15.5px", color: G }}>Händler</div>
            <div style={{ fontSize: "48px", fontWeight: 600, margin: "28px 0 16px" }}>19,99 €</div>
            <button style={{
              width: "100%",
              padding: "17px",
              background: "transparent",
              color: G,
              border: "1px solid #E9A84B",
              borderRadius: "14px",
              fontSize: "16px"
            }}>
              Händler-Account erstellen
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}