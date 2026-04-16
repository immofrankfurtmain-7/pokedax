"use client";
import Link from "next/link";

const TX3 = "#62626f";
const BR1 = "rgba(255,255,255,0.045)";

export default function Footer() {
  return (
    <footer style={{
      borderTop: `0.5px solid ${BR1}`,
      padding: "clamp(28px,4vw,40px) clamp(16px,3vw,32px)",
      marginTop: "auto",
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 16,
      }}>
        <div style={{ fontSize: 12, color: TX3 }}>
          © {new Date().getFullYear()} pokédax · Für Sammler, die ihre Karten ernst nehmen.
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          {[
            { href: "/impressum",   label: "Impressum"   },
            { href: "/datenschutz", label: "Datenschutz" },
          ].map(({ href, label }) => (
            <Link key={href} href={href} style={{ fontSize: 12, color: TX3, textDecoration: "none" }}>
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
