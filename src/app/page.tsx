import Link from "next/link";

export default function HomePage() {
  return (
    <div style={{ color: "white", minHeight: "100vh" }}>

      {/* HERO */}
      <section style={{
        maxWidth: 900, margin: "0 auto",
        padding: "72px 24px 60px", textAlign: "center",
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "4px 12px", borderRadius: 20, marginBottom: 28,
          border: "1px solid rgba(233,168,75,0.18)",
          background: "rgba(233,168,75,0.06)",
          fontSize: 10, fontWeight: 500,
          color: "#E9A84B", letterSpacing: ".04em",
        }}>
          Live Cardmarket EUR · Deutschland
        </div>

        <h1 style={{
          fontSize: "clamp(36px,5.5vw,54px)",
          fontWeight: 300, letterSpacing: "-.04em",
          lineHeight: 1.05, marginBottom: 18,
          color: "#EDEAF6",
        }}>
          Deine Karten.<br />
          <strong style={{ fontWeight: 600 }}>Ihr wahrer Wert.</strong><br />
          <span style={{ color: "#474664" }}>Jeden Tag.</span>
        </h1>

        <p style={{
          fontSize: 14, color: "#8C8BAA",
          maxWidth: 380, margin: "0 auto 36px", lineHeight: 1.7,
        }}>
          Live-Preise von Cardmarket, KI-Scanner und Portfolio-Tracking.
        </p>

        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 52 }}>
          <Link href="/preischeck" style={{
            padding: "11px 24px", borderRadius: 10,
            fontSize: 13, fontWeight: 600,
            background: "#E9A84B", color: "#09070E",
            textDecoration: "none",
          }}>Preis checken</Link>
          <Link href="/scanner" style={{
            padding: "11px 24px", borderRadius: 10,
            fontSize: 13, fontWeight: 400, color: "#8C8BAA",
            border: "1px solid rgba(255,255,255,0.13)",
            background: "transparent", textDecoration: "none",
          }}>Karte scannen →</Link>
        </div>

        {/* Stats */}
        <div style={{
          display: "inline-grid",
          gridTemplateColumns: "repeat(4,1fr)",
          background: "#111122",
          border: "1px solid rgba(255,255,255,0.085)",
          borderRadius: 14, overflow: "hidden",
        }}>
          {[
            { n: "22.271", l: "Karten"      },
            { n: "200",    l: "Sets"         },
            { n: "3.841",  l: "Nutzer"       },
            { n: "1.247",  l: "Scans heute"  },
          ].map((s, i, arr) => (
            <div key={s.l} style={{
              padding: "18px 24px", textAlign: "left",
              borderRight: i < arr.length - 1
                ? "1px solid rgba(255,255,255,0.05)" : "none",
            }}>
              <div style={{ fontSize: 22, fontWeight: 600, color: "#EDEAF6", lineHeight: 1 }}>
                {s.n}
              </div>
              <div style={{ fontSize: 10, color: "#474664", marginTop: 4 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SCANNER CTA */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 64px" }}>
        <div style={{
          background: "#111122",
          border: "1px solid rgba(255,255,255,0.085)",
          borderRadius: 20, padding: "28px 32px",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 1,
            background: "linear-gradient(90deg,transparent,rgba(233,168,75,0.3),transparent)",
          }} />
          <div style={{ marginBottom: 16 }}>
            <div style={{
              fontSize: 9, fontWeight: 600, letterSpacing: ".12em",
              textTransform: "uppercase", color: "#474664", marginBottom: 8,
            }}>KI-Scanner · Gemini Flash</div>
            <div style={{
              fontSize: 21, fontWeight: 400,
              letterSpacing: "-.03em", lineHeight: 1.22, marginBottom: 9,
            }}>Foto machen. Preis wissen.</div>
            <div style={{ fontSize: 12.5, color: "#8C8BAA", lineHeight: 1.65, marginBottom: 16 }}>
              Karte fotografieren — KI erkennt sie und zeigt den Cardmarket-Wert.
            </div>
          </div>
          <Link href="/scanner" style={{
            display: "inline-block", padding: "11px 24px",
            borderRadius: 10, background: "#E9A84B", color: "#09070E",
            fontSize: 13, fontWeight: 600, textDecoration: "none",
          }}>Jetzt scannen</Link>
        </div>
      </section>

    </div>
  );
}
