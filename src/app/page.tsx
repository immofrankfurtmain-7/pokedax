"use client";

import Link from "next/link";

const G = "#E9A84B";
const G18 = "rgba(233,168,75,0.18)";
const G10 = "rgba(233,168,75,0.10)";
const G06 = "rgba(233,168,75,0.06)";

const B0 = "#05050D";
const B1 = "#0A0A17";
const B2 = "#101022";
const B3 = "#16162A";

const T1 = "#F1ECF9";
const T2 = "#8F8EB1";
const T3 = "#4B4A62";

const TYPE_COLOR: Record<string, string> = {
  Fire: "#F97316",
  Water: "#38BDF8",
  Grass: "#4ADE80",
  Lightning: "#E9A84B",
  Psychic: "#A855F7",
  Fighting: "#EF4444",
  Darkness: "#6B7280",
  Metal: "#9CA3AF",
  Dragon: "#7C3AED",
  Colorless: "#CBD5E1",
};

export default function HomePage() {
  const cards = [
    { id: 1, name: "Glurak ex", set_id: "SV01", number: "006", price_market: 189.90, types: ["Fire"] },
    { id: 2, name: "Mewtu ex", set_id: "MEW", number: "205", price_market: 245.00, types: ["Psychic"] },
    { id: 3, name: "Dragonite ex", set_id: "OBF", number: "191", price_market: 312.00, types: ["Dragon"] },
  ];

  return (
    <div style={{ background: B0, color: T1, minHeight: "100vh", fontFamily: "Inter, system-ui, sans-serif", position: "relative", overflow: "hidden" }}>

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
        padding: "160px 24px 120px",
        textAlign: "center",
        position: "relative",
        zIndex: 2,
      }}>
        <h1 style={{
          fontSize: "clamp(54px, 8.2vw, 82px)",
          fontWeight: 260,
          letterSpacing: "-0.06em",
          lineHeight: 1.02,
          marginBottom: 32,
        }}>
          Dein wahrer Sammlungswert.<br />
          <span style={{ color: G }}>Jeden Tag.</span>
        </h1>
        <p style={{
          fontSize: "18px",
          color: T2,
          maxWidth: "580px",
          margin: "0 auto 64px",
          lineHeight: 1.75,
        }}>
          Live Cardmarket-Preise • KI-Scanner • Elegantes Portfolio-Tracking
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
            color: T1,
            fontWeight: 500,
            fontSize: "17px",
            borderRadius: "16px",
            textDecoration: "none",
          }}>
            Karte scannen →
          </Link>
        </div>
      </section>

      {/* TRENDING CARDS */}
      <section style={{ padding: "80px 24px", position: "relative", zIndex: 2 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "32px", maxWidth: "1240px", marginLeft: "auto", marginRight: "auto" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 500 }}>Meistgesucht</h2>
          <Link href="/preischeck" style={{ color: T3, fontSize: "14px" }}>Alle ansehen →</Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "20px", maxWidth: "1240px", margin: "0 auto" }}>
          {cards.map((card) => (
            <Link key={card.id} href={`/preischeck?q=${card.name}`} style={{ textDecoration: "none" }}>
              <div style={{
                background: B2,
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "18px",
                overflow: "hidden",
                transition: "all 0.3s cubic-bezier(0.23,1,0.32,1)",
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.boxShadow = "0 25px 60px rgba(0,0,0,0.7), 0 0 40px rgba(233,168,75,0.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ aspectRatio: "3/4", background: B1, position: "relative" }}>
                  <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 30%, ${TYPE_COLOR[card.types[0]]}25, transparent 70%)` }} />
                  <div style={{ padding: "60px 20px", textAlign: "center", color: "#555", fontSize: "14px" }}>Kartenbild</div>
                </div>
                <div style={{ padding: "16px" }}>
                  <div style={{ fontSize: "14.5px", fontWeight: 500, marginBottom: 4 }}>{card.name}</div>
                  <div style={{ fontSize: "10px", color: T3, marginBottom: 8 }}>{card.set_id} · #{card.number}</div>
                  <div style={{ fontSize: "17px", fontWeight: 600, color: G, fontFamily: "'DM Mono', monospace" }}>
                    {card.price_market.toFixed(2)} €
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* SCANNER + PORTFOLIO */}
      <section style={{ padding: "80px 24px", position: "relative", zIndex: 2 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "28px", maxWidth: "1240px", margin: "0 auto" }}>
          {/* Scanner */}
          <div style={{ background: B2, border: "1px solid rgba(255,255,255,0.07)", borderRadius: "24px", padding: "48px 36px" }}>
            <h2 style={{ fontSize: "26px", marginBottom: "20px" }}>Foto machen. Preis wissen.</h2>
            <div style={{
              border: "2px dashed rgba(233,168,75,0.25)",
              borderRadius: "18px",
              padding: "80px 20px",
              textAlign: "center",
              cursor: "pointer"
            }}>
              <p style={{ color: T3, fontSize: "15px" }}>Klicke oder lege ein Foto deiner Karte ab</p>
            </div>
          </div>

          {/* Portfolio */}
          <div style={{ background: B2, border: "1px solid rgba(255,255,255,0.07)", borderRadius: "24px", padding: "48px 36px" }}>
            <div style={{ fontSize: "46px", fontWeight: 600, letterSpacing: "-0.04em" }}>2.847 €</div>
            <p style={{ color: "#4AC18A", marginTop: "12px", fontSize: "17px" }}>+18,4 % in 30 Tagen</p>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding: "120px 24px", maxWidth: "1240px", margin: "0 auto", position: "relative", zIndex: 2 }}>
        <div style={{ textAlign: "center", marginBottom: "80px" }}>
          <h2 style={{ fontSize: "33px", fontWeight: 500 }}>Wähle dein Paket</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "32px" }}>

          {/* Free */}
          <div style={{
            background: B2,
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "24px",
            padding: "48px 36px",
            textAlign: "center",
          }}>
            <div style={{ fontSize: "15px", color: "#777" }}>Free</div>
            <div style={{ fontSize: "48px", fontWeight: 600, margin: "26px 0 14px" }}>0 €</div>
            <button style={{
              width: "100%",
              padding: "17px",
              background: "#1F1F2F",
              color: "#999",
              border: "none",
              borderRadius: "14px",
            }}>
              Kostenlos starten
            </button>
          </div>

          {/* Premium */}
          <div style={{
            background: B2,
            border: "2px solid #E9A84B",
            borderRadius: "24px",
            padding: "48px 36px",
            position: "relative",
            boxShadow: "0 0 65px rgba(233,168,75,0.25)",
          }}>
            <div style={{
              position: "absolute",
              top: "-18px",
              left: "50%",
              transform: "translateX(-50%)",
              background: G,
              color: "#0F0A00",
              padding: "8px 32px",
              borderRadius: "9999px",
              fontSize: "11px",
              fontWeight: 700,
            }}>
              BELIEBTESTE WAHL
            </div>
            <div style={{ fontSize: "16px", color: G }}>Premium</div>
            <div style={{ fontSize: "56px", fontWeight: 600, color: G, margin: "18px 0 8px" }}>6,99 €</div>
            <div style={{ color: T3, marginBottom: "40px" }}>pro Monat • monatlich kündbar</div>
            <button style={{
              width: "100%",
              padding: "19px",
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
            background: B2,
            border: "1px solid rgba(233,168,75,0.35)",
            borderRadius: "24px",
            padding: "48px 36px",
            textAlign: "center",
          }}>
            <div style={{ fontSize: "15px", color: G }}>Händler</div>
            <div style={{ fontSize: "48px", fontWeight: 600, margin: "26px 0 14px" }}>19,99 €</div>
            <button style={{
              width: "100%",
              padding: "17px",
              background: "transparent",
              color: G,
              border: "1px solid #E9A84B",
              borderRadius: "14px",
            }}>
              Händler werden
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}