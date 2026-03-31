"use client";

import Link from "next/link";

const G = "#E8B02F";
const G18 = "rgba(232,176,47,0.18)";
const G10 = "rgba(232,176,47,0.10)";

const B0 = "#05050D";
const B1 = "#0A0A17";
const B2 = "#101022";

const T1 = "#F1ECF9";
const T2 = "#8F8EB1";
const T3 = "#4B4A62";

export default function HomePage() {
  return (
    <div style={{ background: B0, color: T1, minHeight: "100vh", fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* HERO */}
      <section style={{
        padding: "130px 24px 100px",
        textAlign: "center",
        background: "radial-gradient(ellipse 80% 55% at 50% -15%, rgba(232,176,47,0.085), transparent 70%)",
      }}>
        <h1 style={{
          fontSize: "clamp(52px, 7.8vw, 76px)",
          fontWeight: 280,
          letterSpacing: "-0.052em",
          lineHeight: 1.03,
          marginBottom: 28,
        }}>
          Dein wahrer Sammlungswert.<br />
          <span style={{ color: G, fontWeight: 400 }}>Jeden Tag.</span>
        </h1>
        <p style={{
          fontSize: "17.5px",
          color: T2,
          maxWidth: "540px",
          margin: "0 auto 56px",
          lineHeight: 1.7,
        }}>
          Live Cardmarket-Preise • KI-Scanner • Schönes Portfolio<br />
          Die elegante Plattform für deutsche Pokémon TCG Sammler.
        </p>

        <div style={{ display: "flex", gap: "18px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="#pricing" style={{
            padding: "17px 44px",
            background: G,
            color: "#0A0800",
            fontWeight: 600,
            fontSize: "16.5px",
            borderRadius: "16px",
            textDecoration: "none",
            boxShadow: "0 10px 40px rgba(232,176,47,0.38)",
          }}>
            Premium starten – 6,99 €/Monat
          </Link>
          <Link href="#scanner" style={{
            padding: "17px 44px",
            border: "1px solid rgba(255,255,255,0.16)",
            color: T1,
            fontWeight: 500,
            fontSize: "16.5px",
            borderRadius: "16px",
            textDecoration: "none",
          }}>
            Karte scannen →
          </Link>
        </div>
      </section>

      {/* PRICING – edel & clean */}
      <section id="pricing" style={{ padding: "100px 24px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <h2 style={{ fontSize: "31px", fontWeight: 500, letterSpacing: "-0.015em" }}>Wähle dein Paket</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "28px" }}>

          {/* Free */}
          <div style={{
            background: B2,
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "22px",
            padding: "42px 34px",
            textAlign: "center",
          }}>
            <div style={{ fontSize: "15px", color: "#777" }}>Free</div>
            <div style={{ fontSize: "46px", fontWeight: 600, margin: "20px 0 10px" }}>0 €</div>
            <button style={{
              width: "100%",
              padding: "16px",
              background: "#1C1C2E",
              color: "#999",
              border: "none",
              borderRadius: "14px",
              fontSize: "15.5px",
              marginTop: "20px"
            }}>
              Kostenlos starten
            </button>
          </div>

          {/* Premium – Highlight */}
          <div style={{
            background: B2,
            border: "2px solid #E8B02F",
            borderRadius: "22px",
            padding: "42px 34px",
            position: "relative",
            boxShadow: "0 0 50px rgba(232,176,47,0.20)",
            transform: "scale(1.03)",
          }}>
            <div style={{
              position: "absolute",
              top: "-16px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "#E8B02F",
              color: "#0A0800",
              padding: "7px 26px",
              borderRadius: "9999px",
              fontSize: "10.5px",
              fontWeight: 700,
              letterSpacing: "0.8px",
            }}>
              ★ BELIEBTESTE WAHL ★
            </div>

            <div style={{ fontSize: "16px", color: G, marginBottom: "6px" }}>Premium</div>
            <div style={{ fontSize: "54px", fontWeight: 600, color: G, marginBottom: "6px" }}>6,99 €</div>
            <div style={{ color: T3, marginBottom: "34px" }}>pro Monat • monatlich kündbar</div>

            <button style={{
              width: "100%",
              padding: "17px",
              background: G,
              color: "#0A0800",
              border: "none",
              borderRadius: "14px",
              fontSize: "16.5px",
              fontWeight: 600,
            }}>
              Jetzt Premium werden
            </button>
          </div>

          {/* Händler */}
          <div style={{
            background: B2,
            border: "1px solid rgba(232,176,47,0.35)",
            borderRadius: "22px",
            padding: "42px 34px",
            textAlign: "center",
          }}>
            <div style={{ fontSize: "15px", color: G }}>Händler</div>
            <div style={{ fontSize: "46px", fontWeight: 600, margin: "20px 0 10px" }}>19,99 €</div>
            <button style={{
              width: "100%",
              padding: "16px",
              background: "transparent",
              color: G,
              border: "1px solid #E8B02F",
              borderRadius: "14px",
              fontSize: "15.5px",
              marginTop: "20px"
            }}>
              Händler-Account erstellen
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}