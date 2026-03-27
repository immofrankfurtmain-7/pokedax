import Link from "next/link";
import { Search, Camera, TrendingUp, ArrowRight } from "lucide-react";
import TrendingGrid from "@/components/cards/TrendingGrid";
import ForumSection from "@/components/forum/ForumSection";
import PremiumSection from "@/components/premium/PremiumSection";
import OnlineUsers from "@/components/ui/OnlineUsers";

export default function HomePage() {
  return (
    <div style={{ background: "#0A0A0A", minHeight: "100vh" }}>

      {/* ── HERO ── */}
      <section style={{
        background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(238,21,21,0.09), transparent), radial-gradient(ellipse 40% 30% at 80% 90%, rgba(250,204,21,0.04), transparent), #0A0A0A",
        padding: "72px 20px 60px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Live badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          padding: "5px 14px", borderRadius: 20,
          background: "rgba(238,21,21,0.1)", border: "1px solid rgba(238,21,21,0.25)",
          marginBottom: 22,
        }}>
          <span className="live-dot" />
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 700, color: "#EE1515", letterSpacing: "0.06em" }}>
            LIVE · CARDMARKET EUR-PREISE
          </span>
        </div>

        <h1 style={{ fontSize: "clamp(36px, 7vw, 64px)", fontFamily: "Poppins, sans-serif", fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1.05, marginBottom: 18 }}>
          <span style={{ color: "#F8FAFC" }}>Pokémon TCG</span>
          <br />
          <span style={{ background: "linear-gradient(135deg, #EE1515, #ff6b6b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Preis-Check DE
          </span>
        </h1>

        <p style={{ fontSize: 15, color: "#94A3B8", maxWidth: 480, margin: "0 auto 32px", lineHeight: 1.65 }}>
          Scanne deine Karte und erhalte sofort den aktuellen Marktwert mit Kauf-/Verkaufsempfehlung – direkt von Cardmarket.
        </p>

        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 48 }}>
          <Link href="/preischeck" className="btn-primary" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Search size={16} />
            Preis checken
          </Link>
          <Link href="/scanner" className="btn-outline" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Camera size={16} />
            Karte scannen
          </Link>
        </div>

        {/* Stats bar */}
        <div style={{
          display: "flex", flexWrap: "wrap", justifyContent: "center",
          border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16,
          overflow: "hidden", background: "#111111",
          maxWidth: 640, margin: "0 auto",
        }}>
          {[
            { val: "98.420", label: "Karten in DB" },
            { val: "2.841",  label: "Aktive Nutzer" },
            { val: "1.247",  label: "Scans heute"   },
            { val: "18.330", label: "Forum-Posts"   },
          ].map((s, i, arr) => (
            <div key={s.label} style={{
              flex: "1 1 120px", padding: "18px 16px", textAlign: "center",
              borderRight: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.07)" : "none",
            }}>
              <div style={{ fontFamily: "Poppins, sans-serif", fontWeight: 900, fontSize: 22, color: "#F8FAFC" }}>
                {s.val}
              </div>
              <div style={{ fontSize: 10, fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 3 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Feature pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 24 }}>
          {["Live-Preise von Cardmarket", "KI-Karten-Scanner", "Fake-Check & Grading", "Realtime Preis-Alerts"].map(f => (
            <span key={f} style={{
              padding: "5px 12px", borderRadius: 20,
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
              fontSize: 12, color: "#94A3B8",
            }}>✓ {f}</span>
          ))}
        </div>
      </section>

      {/* ── TRENDING CARDS ── */}
      <section style={{ padding: "48px 20px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <div className="section-eyebrow" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <TrendingUp size={12} />
              Trending jetzt
            </div>
            <h2 style={{ fontFamily: "Poppins, sans-serif", fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 800, color: "#F8FAFC", letterSpacing: "-0.02em" }}>
              Meistgesuchte Karten
            </h2>
          </div>
          <Link href="/preischeck" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "#475569", textDecoration: "none" }}>
            Alle ansehen <ArrowRight size={14} />
          </Link>
        </div>
        <TrendingGrid />
      </section>

      {/* ── FORUM SECTION ── */}
      <ForumSection />

      {/* ── ONLINE USERS ── */}
      <section style={{ padding: "0 20px 48px", maxWidth: 1200, margin: "0 auto" }}>
        <OnlineUsers />
      </section>

      {/* ── PREMIUM ── */}
      <PremiumSection />
    </div>
  );
}
