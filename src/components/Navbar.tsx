"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

const GOLD = "#C9A66B";
const G15  = "rgba(201,166,107,0.15)";
const G08  = "rgba(201,166,107,0.08)";
const BG   = "#0A0A0A";
const TX   = "#EDE9E0";
const TX2  = "rgba(237,233,224,0.7)";

const NAV_LINKS = [
  { href: "/preischeck",  label: "Karten"     },
  { href: "/marketplace", label: "Marktplatz" },
  { href: "/forum",       label: "Community"  },
];

// premium: true = goldener Hintergrund im Dropdown
const DROPDOWN_LINKS = [
  { href: "/dashboard",            label: "Dashboard",     icon: "✦", premium: false },
  { href: "/scanner",              label: "Scanner",       icon: "⊙", premium: true  },
  { href: "/dashboard/portfolio",  label: "Portfolio",     icon: "◈", premium: true  },
  { href: "/preischeck",           label: "Preischeck",    icon: "◈", premium: false },
  { href: "/sets",                 label: "Sets",          icon: "◫", premium: false },
  { href: "/dashboard/wishlist",   label: "Wishlist ✦",    icon: "◉", premium: true  },
  { href: "/compare",              label: "Vergleich",     icon: "⇄", premium: false },
  { href: "/fantasy",              label: "Fantasy",       icon: "◇", premium: false },
  { href: "/leaderboard",          label: "Leaderboard",   icon: "▲", premium: false },
  { href: "/settings",             label: "Einstellungen", icon: "◎", premium: false },
];

export default function Navbar() {
  const pathname = usePathname();
  const router   = useRouter();
  const [user,     setUser]     = useState<any>(null);
  const [dropOpen, setDropOpen] = useState(false);
  const [mobOpen,  setMobOpen]  = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sb = createClient();
    sb.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    const { data: { subscription } } = sb.auth.onAuthStateChange((_, s) => setUser(s?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  useEffect(() => { setMobOpen(false); setDropOpen(false); }, [pathname]);

  async function signOut() {
    setDropOpen(false); setMobOpen(false);
    await createClient().auth.signOut();
    router.push("/");
  }

  const username = user?.email?.split("@")[0] ?? "Account";
  const initial  = username[0]?.toUpperCase() ?? "A";

  return (
    <>
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled || mobOpen ? "rgba(10,10,10,0.97)" : "transparent",
        backdropFilter: scrolled || mobOpen ? "blur(20px)" : "none",
        borderBottom: `1px solid ${scrolled || mobOpen ? "rgba(201,166,107,0.12)" : "transparent"}`,
        transition: "background 0.3s, border-color 0.3s",
      }}>
        <div style={{
          maxWidth: 1600, margin: "0 auto",
          padding: "0 clamp(16px,3vw,40px)",
          height: 80,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 24,
        }}>

          {/* Logo */}
          <Link href="/" style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 28, fontWeight: 500, letterSpacing: "-1.5px",
            color: TX, textDecoration: "none", flexShrink: 0,
          }}>pokédax</Link>

          {/* Desktop Nav */}
          <nav style={{ display: "flex", gap: 4, flex: 1, justifyContent: "center" }} className="desktop-nav">
            {NAV_LINKS.map(({ href, label }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link key={href} href={href} style={{
                  padding: "8px 18px", borderRadius: 100,
                  fontSize: 15, fontWeight: active ? 600 : 400,
                  color: active ? TX : TX2,
                  background: active ? G08 : "transparent",
                  border: `1px solid ${active ? G15 : "transparent"}`,
                  textDecoration: "none", transition: "all 0.2s",
                }}
                onMouseEnter={e => { if (!active) { (e.currentTarget as any).style.color = TX; (e.currentTarget as any).style.background = "rgba(255,255,255,0.04)"; } }}
                onMouseLeave={e => { if (!active) { (e.currentTarget as any).style.color = TX2; (e.currentTarget as any).style.background = "transparent"; } }}>
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Auth */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }} className="desktop-auth">
            {!user ? (
              <>
                <Link href="/auth/login" style={{
                  padding: "10px 22px", borderRadius: 100,
                  border: `1px solid ${GOLD}`, color: GOLD,
                  fontSize: 14, fontWeight: 500, textDecoration: "none", transition: "all 0.2s",
                }}
                onMouseEnter={e => { (e.currentTarget as any).style.background = GOLD; (e.currentTarget as any).style.color = BG; }}
                onMouseLeave={e => { (e.currentTarget as any).style.background = "transparent"; (e.currentTarget as any).style.color = GOLD; }}>
                  Anmelden
                </Link>
                <Link href="/dashboard/premium" style={{
                  padding: "10px 22px", borderRadius: 100,
                  background: GOLD, color: BG,
                  fontSize: 14, fontWeight: 600, textDecoration: "none",
                  boxShadow: "0 4px 20px rgba(201,166,107,0.3)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={e => { (e.currentTarget as any).style.transform = "scale(1.04)"; }}
                onMouseLeave={e => { (e.currentTarget as any).style.transform = "none"; }}>
                  Kostenlos starten
                </Link>
              </>
            ) : (
              <div ref={dropRef} style={{ position: "relative" }}>
                <button onClick={() => setDropOpen(v => !v)} style={{
                  width: 38, height: 38, borderRadius: "50%",
                  background: dropOpen ? G08 : "rgba(255,255,255,0.06)",
                  border: `1px solid ${dropOpen ? G15 : "rgba(255,255,255,0.1)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 600, color: dropOpen ? GOLD : TX2,
                  cursor: "pointer", transition: "all 0.15s",
                }}>{initial}</button>

                {dropOpen && (
                  <div style={{
                    position: "absolute", top: "calc(100% + 10px)", right: 0, width: 250,
                    background: "#0F0F0F",
                    border: "1px solid rgba(201,166,107,0.15)",
                    borderRadius: 18,
                    boxShadow: "0 24px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(201,166,107,0.05)",
                    overflow: "hidden",
                    animation: "dropIn 0.15s ease-out",
                    zIndex: 200,
                  }}>
                    {/* Top gold line */}
                    <div style={{ height: 1, background: "linear-gradient(90deg,transparent,rgba(201,166,107,0.4),transparent)" }}/>

                    {/* User header */}
                    <div style={{ padding: "14px 16px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: TX, marginBottom: 2 }}>@{username}</div>
                      <div style={{ fontSize: 11, color: "rgba(237,233,224,0.35)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</div>
                    </div>

                    {/* Links */}
                    <div style={{ padding: "6px 0" }}>
                      {DROPDOWN_LINKS.map(({ href, label, icon, premium }) => (
                        <Link key={href} href={href} onClick={() => setDropOpen(false)} style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "9px 16px", fontSize: 13,
                          textDecoration: "none", transition: "background 0.1s",
                          background: premium ? "rgba(201,166,107,0.08)" : "transparent",
                          color: premium ? "#C9A66B" : TX2,
                          borderLeft: premium ? "2px solid rgba(201,166,107,0.35)" : "2px solid transparent",
                        }}
                        onMouseEnter={e => { (e.currentTarget as any).style.background = premium ? "rgba(201,166,107,0.15)" : "rgba(255,255,255,0.04)"; }}
                        onMouseLeave={e => { (e.currentTarget as any).style.background = premium ? "rgba(201,166,107,0.08)" : "transparent"; }}>
                          <span style={{ fontSize: 11, width: 14, textAlign: "center", flexShrink: 0, color: premium ? GOLD : "rgba(201,166,107,0.5)" }}>
                            {premium ? "✦" : icon}
                          </span>
                          <span style={{ flex: 1 }}>{label}</span>
                          {premium && <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(201,166,107,0.6)", background: "rgba(201,166,107,0.1)", padding: "2px 6px", borderRadius: 4 }}>PRO</span>}
                        </Link>
                      ))}
                    </div>

                    {/* Footer */}
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "6px 0" }}>
                      <Link href={`/profil/${username}`} onClick={() => setDropOpen(false)} style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "9px 16px", fontSize: 13, color: GOLD, textDecoration: "none",
                      }}
                      onMouseEnter={e => (e.currentTarget as any).style.background = G08}
                      onMouseLeave={e => (e.currentTarget as any).style.background = "transparent"}>
                        <span style={{ fontSize: 11, color: GOLD, width: 14, textAlign: "center" }}>◉</span>
                        Mein Profil
                      </Link>
                      <button onClick={signOut} style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "9px 16px", width: "100%",
                        fontSize: 13, color: "#dc4a5a",
                        background: "transparent", border: "none", cursor: "pointer",
                      }}
                      onMouseEnter={e => (e.currentTarget as any).style.background = "rgba(220,74,90,0.08)"}
                      onMouseLeave={e => (e.currentTarget as any).style.background = "transparent"}>
                        <span style={{ fontSize: 11, color: "rgba(237,233,224,0.25)", width: 14, textAlign: "center" }}>×</span>
                        Abmelden
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Hamburger */}
          <button onClick={() => setMobOpen(v => !v)} className="hamburger-btn" aria-label="Menü" style={{
            width: 38, height: 38, borderRadius: 10,
            background: "transparent", border: "1px solid rgba(201,166,107,0.2)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 5,
            cursor: "pointer", flexShrink: 0,
          }}>
            {[0,1,2].map(i => (
              <span key={i} style={{
                display: "block", width: 16, height: 1.5, background: GOLD, borderRadius: 2,
                transition: "all 0.25s",
                transform: mobOpen ? (i===0?"translateY(3.5px) rotate(45deg)":i===2?"translateY(-3.5px) rotate(-45deg)":"none") : "none",
                opacity: mobOpen && i===1 ? 0 : 1,
              }}/>
            ))}
          </button>
        </div>

        {/* Mobile */}
        {mobOpen && (
          <div style={{ borderTop: "1px solid rgba(201,166,107,0.1)", padding: "12px 20px 24px", background: "#0A0A0A", display: "flex", flexDirection: "column", gap: 2 }}>
            {NAV_LINKS.map(({ href, label }) => (
              <Link key={href} href={href} style={{ padding: "12px 4px", fontSize: 16, fontWeight: 500, color: TX, textDecoration: "none", borderBottom: "1px solid rgba(201,166,107,0.08)" }}>{label}</Link>
            ))}
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
              {user ? (
                <Link href="/dashboard" style={{ padding: "12px", borderRadius: 100, background: GOLD, color: BG, textDecoration: "none", textAlign: "center", fontWeight: 600 }}>Dashboard</Link>
              ) : (
                <>
                  <Link href="/auth/login" style={{ padding: "12px", borderRadius: 100, border: `1px solid ${GOLD}`, color: GOLD, textDecoration: "none", textAlign: "center" }}>Anmelden</Link>
                  <Link href="/auth/register" style={{ padding: "12px", borderRadius: 100, background: GOLD, color: BG, textDecoration: "none", textAlign: "center", fontWeight: 600 }}>Kostenlos starten</Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;700&display=swap');
        @keyframes dropIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        .desktop-nav  { display:flex !important; }
        .desktop-auth { display:flex !important; }
        .hamburger-btn { display:none !important; }
        @media(max-width:768px){
          .desktop-nav  { display:none !important; }
          .desktop-auth { display:none !important; }
          .hamburger-btn { display:flex !important; }
        }
      `}</style>
    </>
  );
}
