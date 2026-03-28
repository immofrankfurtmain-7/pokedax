"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{
      background: "rgba(0,0,0,0.6)",
      borderTop: "1px solid rgba(255,255,255,0.07)",
      padding: "40px 20px 32px",
      position: "relative",
      zIndex: 1,
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 32, marginBottom: 32 }}>

          {/* Logo + Description */}
          <div>
            <img
              src="/pokedax-logo.png"
              alt="PokéDax"
              style={{
                height: 148,
                width: "auto",
                filter: "drop-shadow(0 0 10px rgba(250,204,21,0.4))",
                marginBottom: 12,
              }}
            />
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, lineHeight: 1.6, maxWidth: 220 }}>
              Deutschlands #1 Pokémon-TCG-Preis-Plattform.
              Live-Preise · KI-Scanner · Community
            </p>
          </div>

          {/* Platform links */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 14 }}>
              Plattform
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { href: "/",           label: "Start"      },
                { href: "/preischeck", label: "Preischeck" },
                { href: "/scanner",    label: "Scanner"    },
                { href: "/forum",      label: "Forum"      },
                { href: "/dashboard",  label: "Dashboard"  },
                { href: "/spiel",      label: "Spiel"      },
              ].map(l => (
                <Link key={l.href} href={l.href} style={{
                  color: "rgba(255,255,255,0.4)", fontSize: 13,
                  textDecoration: "none", transition: "color .15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "white")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Legal links */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 14 }}>
              Rechtliches
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { href: "#", label: "Datenschutz"        },
                { href: "#", label: "Impressum"          },
                { href: "#", label: "Nutzungsbedingungen"},
                { href: "#", label: "Kontakt"            },
              ].map(l => (
                <Link key={l.label} href={l.href} style={{
                  color: "rgba(255,255,255,0.4)", fontSize: 13,
                  textDecoration: "none", transition: "color .15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "white")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          paddingTop: 20,
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 8,
        }}>
          <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}>
            © 2026 PokéDax · Nicht offiziell · Nicht affiliiert mit The Pokémon Company International
          </p>
          <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}>
            Made with ♥ für Pokémon-Sammler in D/A/CH
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          footer > div > div:first-child + div { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </footer>
  );
}
