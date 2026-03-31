"use client";

import Link from "next/link";

const G = "#E8B02F";
const G20 = "rgba(232,176,47,0.20)";
const G12 = "rgba(232,176,47,0.12)";
const G07 = "rgba(232,176,47,0.07)";

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
  Lightning: "#E8B02F",
  Psychic: "#A855F7",
  Fighting: "#EF4444",
  Darkness: "#6B7280",
  Metal: "#9CA3AF",
  Dragon: "#7C3AED",
  Colorless: "#CBD5E1",
};

export default function HomePage() {
  const stats = { cards: 22271, users: 3841, scans: 1247, forum: 18330 };
  const cards = [
    { id: 1, name: "Glurak ex", set_id: "SV01", number: "006", price_market: 189.90, types: ["Fire"] },
    { id: 2, name: "Mewtu ex", set_id: "MEW", number: "205", price_market: 245.00, types: ["Psychic"] },
    { id: 3, name: "Dragonite ex", set_id: "OBF", number: "191", price_market: 312.00, types: ["Dragon"] },
  ];

  return (
    <div style={{ background: B0, color: T1, minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>

      {/* HERO */}
      <section style={{
        padding: "110px 24px 90px",
        textAlign: "center",
        background: "radial-gradient(ellipse 75% 55% at 50% -15%, rgba(232,176,47,0.075), transparent 68%)",
      }}>
        <h1 style={{
          fontSize: "clamp(44px, 7vw, 68px)",
          fontWeight: 300,
          letterSpacing: "-0.048em",
          lineHeight: 1.04,
          marginBottom: 22
        }}>
          Dein wahrer Sammlungswert.<br />
          <strong>Jeden Tag.</strong>
        </h1>
        <p style={{
          fontSize: 16,
          color: T2,
          maxWidth: 480,
          margin: "0 auto 52px",
          lineHeight: 1.75
        }}>
          Live-Preise von Cardmarket, KI-Scanner und präzises Portfolio-Tracking — alles an einem Ort.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <Link href="/preischeck" style={{
            padding: "15px 36px",
            borderRadius: 13,
            fontSize: 15,
            fontWeight: 600,
            background: G,
            color: "#0A0800",
            textDecoration: "none",
            boxShadow: "0 6px 28px rgba(232,176,47,0.32)"
          }}>
            Preis checken
          </Link>
          <Link href="/scanner" style={{
            padding: "15px 36px",
            borderRadius: 13,
            fontSize: 15,
            fontWeight: 400,
            color: T2,
            border: "1px solid rgba(255,255,255,0.12)",
            textDecoration: "none"
          }}>
            Karte scannen →
          </Link>
        </div>
      </section>

      {/* TRENDING CARDS */}
      <section style={{ padding: "60px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 500, letterSpacing: "-0.02em" }}>Meistgesucht</h2>
          <Link href="/preischeck" style={{ color: T3, fontSize: 13 }}>Alle ansehen →</Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(185px, 1fr))", gap: 18 }}>
          {cards.map((card) => (
            <Link key={card.id} href={`/preischeck?q=${card.name}`} style={{ textDecoration: "none" }}>
              <div style={{
                background: B2,
                border: "1px solid rgba(255,255,255,0.055)",
                borderRadius: 14,
                overflow: "hidden",
                transition: "all 0.28s cubic-bezier(0.23,1,0.32,1)"
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-7px)";
                  e.currentTarget.style.boxShadow = "0 25px 55px rgba(0,0,0,0.65), 0 0 35px rgba(232,176,47,0.09)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ aspectRatio: "3/4", background: B1, position: "relative" }}>
                  <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 30%, ${TYPE_COLOR[card.types?.[0] || ""] || "#474664"}15, transparent 70%)` }} />
                  <div style={{ padding: 20, textAlign: "center", color: "#555", fontSize: 13 }}>Kartenbild</div>
                </div>
                <div style={{ padding: "14px 14px 16px" }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500, marginBottom: 4 }}>{card.name}</div>
                  <div style={{ fontSize: 9.5, color: T3, marginBottom: 8 }}>{card.set_id} · #{card.number}</div>
                  <div style={{ fontSize: 16.5, fontWeight: 550, color: G, fontFamily: "'DM Mono', monospace" }}>
                    {card.price_market ? `${card.price_market.toFixed(2)}€` : "—"}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* SCANNER + PORTFOLIO */}
      <section style={{ padding: "40px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div style={{ background: B2, border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: 32 }}>
            <h2 style={{ fontSize: 22, marginBottom: 12 }}>Foto machen. Preis wissen.</h2>
            <div style={{
              border: "2px dashed rgba(232,176,47,0.25)",
              borderRadius: 14,
              padding: 60px 20px,
              textAlign: "center",
              cursor: "pointer"
            }}>
              <p style={{ color: T3 }}>Klicke oder lege ein Foto deiner Karte ab</p>
            </div>
          </div>

          <div style={{ background: B2, border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: 32 }}>
            <div style={{ fontSize: 42, fontWeight: 550, letterSpacing: "-0.04em" }}>2.847€</div>
            <p style={{ color: "#4AC18A", marginTop: 8 }}>+18,4 % in 30 Tagen</p>
          </div>
        </div>
      </section>

      {/* PRICING – Abo-Boxen */}
      <section style={{ padding: "60px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>

          <div style={{ background: B2, border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: 32 }}>
            <div style={{ fontSize: 13, color: "#888" }}>Free</div>
            <div style={{ fontSize: 36, fontWeight: 550, margin: "12px 0" }}>0€</div>
            <button style={{ width: "100%", padding: 14, borderRadius: 12, background: "#222", color: "#aaa" }}>Kostenlos starten</button>
          </div>

          <div style={{
            background: B2,
            border: "2px solid #E8B02F",
            borderRadius: 20,
            padding: 32,
            position: "relative",
            boxShadow: "0 0 30px rgba(232,176,47,0.15)"
          }}>
            <div style={{
              position: "absolute",
              top: -12,
              left: "50%",
              transform: "translateX(-50%)",
              background: "#E8B02F",
              color: "#0A0800",
              padding: "4px 18px",
              borderRadius: 9999,
              fontSize: 9,
              fontWeight: 700
            }}>BELIEBTESTE WAHL</div>
            <div style={{ fontSize: 13, color: "#E8B02F", marginBottom: 8 }}>Premium</div>
            <div style={{ fontSize: 36, fontWeight: 550, color: "#E8B02F" }}>6,99€</div>
            <div style={{ fontSize: 13, color: "#888", marginBottom: 24 }}>pro Monat</div>
            <button style={{ width: "100%", padding: 14, borderRadius: 12, background: "#E8B02F", color: "#0A0800", fontWeight: 600 }}>Premium werden</button>
          </div>

          <div style={{ background: B2, border: "1px solid rgba(232,176,47,0.3)", borderRadius: 20, padding: 32 }}>
            <div style={{ fontSize: 13, color: "#E8B02F", marginBottom: 8 }}>Händler</div>
            <div style={{ fontSize: 36, fontWeight: 550 }}>19,99€</div>
            <div style={{ fontSize: 13, color: "#888", marginBottom: 24 }}>pro Monat</div>
            <button style={{ width: "100%", padding: 14, borderRadius: 12, background: "transparent", color: "#E8B02F", border: "1px solid #E8B02F" }}>Händler werden</button>
          </div>
        </div>
      </section>

    </div>
  );
}