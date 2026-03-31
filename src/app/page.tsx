"use client";

import Link from "next/link";

const G = "#E9A84B";           // Dein edles Gold
const G18 = "rgba(233,168,75,0.18)";
const G08 = "rgba(233,168,75,0.08)";

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

      {/* Subtiler Canvas-ähnlicher Background */}
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "radial-gradient(circle at 30% 20%, rgba(233,168,75,0.06) 0%, transparent 50%)",
        zIndex: 0,
        pointerEvents: "none"
      }} />

      {/* HERO */}
      <section style={{
        padding: "160px 24px 120px",
        textAlign: "center",
        position: "relative",
        zIndex: 1,
      }}>
        <h1 style={{
          fontSize: "clamp(54px, 8.2vw, 80px)",
          fontWeight: 270,
          letterSpacing: "-0.058em",
          lineHeight: 1.02,
          marginBottom: 32,
        }}>
          Dein wahrer Sammlungswert.<br />
          <span style={{ color: G }}>Jeden Tag.</span>
        </h1>

        <p style={{
          fontSize: "18px",
          color: "#9E9EB8",
          maxWidth: "580px",
          margin: "0 auto 64px",
          lineHeight: 1.75,
        }}>
          Live Cardmarket-Preise • KI-Scanner • Elegantes Portfolio<br />
          Für ernsthafte Pokémon TCG Sammler.
        </p>

        <div style={{ display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="#pricing" style={{
            padding: "18px 48px",
            background: G,
            color: "#0F0A00",
            fontWeight: 600,
            fontSize: "17px",
            borderRadius: "16px",
            textDecoration: "none",
            boxShadow: "0 12px 50px rgba(233,168,75,0.42)",
          }}>
            Premium starten – 6,99 €/Monat
          </Link>
          <Link href="#scanner" style={{
            padding: "18px 48px",
            border: "1px solid rgba(255,255,255,0.18)",
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

      {/* PRICING */}
      <section id="pricing" style={{ padding: "100px 24px", maxWidth: "1220px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: "72px" }}>
          <h2 style={{ fontSize: "32px", fontWeight: 500, letterSpacing: "-0.02em" }}>Wähle dein Paket</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(355px, 1fr))", gap: "32px" }}>

          {/* Free */}
          <div style={{
            background: "#0F0F1F",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "24px",
            padding: "48px 36px",
            textAlign: "center",
          }}>
            <div style={{ fontSize: "15px", color: "#777" }}>Free</div>
            <div style={{ fontSize: "48px", fontWeight: 600, margin: "26px 0 14px" }}>0 €</div>
            <button style={{
              width: "100%",
              padding: "16px",
              background: "#1F1F2F",
              color: "#999",
              border: "none",
              borderRadius: "14px",
              fontSize: "16px"
            }}>
              Kostenlos starten
            </button>
          </div>

          {/* Premium */}
          <div style={{
            background: "#0F0F1F",
            border: "2px solid #E9A84B",
            borderRadius: "24px",
            padding: "48px 36px",
            position: "relative",
            boxShadow: "0 0 60px rgba(233,168,75,0.25)",
          }}>
            <div style={{
              position: "absolute",
              top: "-18px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "#E9A84B",
              color: "#0F0A00",
              padding: "8px 32px",
              borderRadius: "9999px",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.6px",
            }}>
              BELIEBTESTE WAHL
            </div>

            <div style={{ fontSize: "16px", color: G }}>Premium</div>
            <div style={{ fontSize: "56px", fontWeight: 600, color: G, margin: "18px 0 10px" }}>6,99 €</div>
            <div style={{ color: "#666", marginBottom: "40px" }}>pro Monat • monatlich kündbar</div>

            <button style={{
              width: "100%",
              padding: "18px",
              background: G,
              color: "#0F0A00",
              border: "none",
              borderRadius: "14px",
              fontSize: "17px",
              fontWeight: 600,
            }}>
              Jetzt Premium werden
            </button>
          </div>

          {/* Händler */}
          <div style={{
            background: "#0F0F1F",
            border: "1px solid rgba(233,168,75,0.35)",
            borderRadius: "24px",
            padding: "48px 36px",
            textAlign: "center",
          }}>
            <div style={{ fontSize: "15px", color: G }}>Händler</div>
            <div style={{ fontSize: "48px", fontWeight: 600, margin: "26px 0 14px" }}>19,99 €</div>
            <button style={{
              width: "100%",
              padding: "16px",
              background: "transparent",
              color: G,
              border: "1px solid #E9A84B",
              borderRadius: "14px",
              fontSize: "16px"
            }}>
              Händler werden
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}