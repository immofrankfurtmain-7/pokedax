"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

const T    = "#D4A843";
const TL   = "rgba(212,168,67,0.15)";
const T08  = "rgba(212,168,67,0.08)";
const T04  = "rgba(212,168,67,0.04)";
const BG   = "#0A0A0C";
const B1   = "#16161A";
const B2   = "#1C1C21";
const R1   = "rgba(255,255,255,0.04)";
const R2   = "rgba(255,255,255,0.08)";
const R3   = "rgba(255,255,255,0.12)";
const TX   = "#F8F6F2";
const T2   = "#BEB9B0";
const T3   = "#6E6B66";
const GH   = "#EFD7A8";

const NAV_LINKS = [
  { href: "/preischeck",  label: "Karten"     },
  { href: "/sets",        label: "Sets"       },
  { href: "/marketplace", label: "Marktplatz" },
  { href: "/forum",       label: "Community"  },
];

const DROPDOWN_LINKS = [
  { href: "/dashboard",           label: "Dashboard",     icon: "✦", section: "main" },
  { href: "/dashboard/portfolio", label: "Portfolio",     icon: "◈", section: "main" },
  { href: "/scanner",             label: "Scanner",       icon: "⊙", section: "main" },
  { href: "/compare",             label: "Vergleich",     icon: "⇄", section: "main" },
  { href: "/dashboard/wishlist",  label: "Wishlist",      icon: "◉", section: "main" },
  { href: "/fantasy",             label: "Fantasy",       icon: "◇", section: "extra" },
  { href: "/leaderboard",         label: "Leaderboard",   icon: "▲", section: "extra" },
  { href: "/settings",            label: "Einstellungen", icon: "◎", section: "extra" },
];

export default function Navbar() {
  const pathname   = usePathname();
  const router     = useRouter();
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
    const fn = () => setScrolled(window.scrollY > 12);
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
        background: scrolled || mobOpen
          ? "rgba(10,10,12,0.92)"
          : "transparent",
        backdropFilter: scrolled || mobOpen ? "blur(20px) saturate(1.5)" : "none",
        borderBottom: scrolled || mobOpen
          ? "0.5px solid rgba(255,255,255,0.06)"
          : "0.5px solid transparent",
        transition: "background 0.3s, border-color 0.3s",
      }}>
        <div style={{
          maxWidth: 1200, margin: "0 auto",
          padding: "0 clamp(16px,3vw,32px)",
          height: 60,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 24,
        }}>

          {/* Logo */}
          <Link href="/" style={{
            fontFamily: "var(--font-display)",
            fontSize: 18, fontWeight: 300, letterSpacing: "-.04em",
            color: TX, textDecoration: "none", flexShrink: 0,
            display: "flex", alignItems: "center", gap: 1,
          }}>
            pokédax<span style={{
              color: T,
              textShadow: `0 0 12px rgba(212,168,67,0.6)`,
              animation: "gold-pulse 3s ease-in-out infinite",
            }}>.</span>
          </Link>

          {/* Desktop Nav */}
          <nav style={{ display: "flex", gap: 2, flex: 1, justifyContent: "center" }} className="desktop-nav">
            {NAV_LINKS.map(({ href, label }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link key={href} href={href} style={{
                  padding: "7px 16px", borderRadius: 10,
                  fontSize: 13, fontWeight: active ? 500 : 400,
                  color: active ? TX : T3,
                  background: active ? "rgba(212,168,67,0.08)" : "transparent",
                  border: active ? "0.5px solid rgba(212,168,67,0.18)" : "0.5px solid transparent",
                  textDecoration: "none",
                  transition: "all 0.15s",
                  position: "relative",
                }}
                onMouseEnter={e => {
                  if (!active) {
                    const el = e.currentTarget as HTMLElement;
                    el.style.color = TX;
                    el.style.background = "rgba(212,168,67,0.06)";
                    el.style.border = "0.5px solid rgba(212,168,67,0.15)";
                    el.style.boxShadow = "0 0 16px rgba(212,168,67,0.08)";
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    const el = e.currentTarget as HTMLElement;
                    el.style.color = T3;
                    el.style.background = "transparent";
                    el.style.border = "0.5px solid transparent";
                    el.style.boxShadow = "none";
                  }
                }}>
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <div className="desktop-auth" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {!user ? (
                <>
                  <Link href="/auth/login" style={{
                    padding: "7px 16px", borderRadius: 10,
                    fontSize: 13, color: T2, textDecoration: "none",
                    transition: "color 0.15s",
                  }}
                  onMouseEnter={e => (e.currentTarget as any).style.color = TX}
                  onMouseLeave={e => (e.currentTarget as any).style.color = T2}>
                    Anmelden
                  </Link>
                  <Link href="/dashboard/premium" style={{
                    padding: "7px 18px", borderRadius: 10, fontSize: 13,
                    background: T, color: BG, fontWeight: 500,
                    textDecoration: "none",
                    boxShadow: "0 0 20px rgba(212,168,67,0.25)",
                    transition: "box-shadow 0.2s, transform 0.15s",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as any).style.boxShadow = "0 0 28px rgba(0,184,168,0.4)";
                    (e.currentTarget as any).style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as any).style.boxShadow = "0 0 20px rgba(212,168,67,0.25)";
                    (e.currentTarget as any).style.transform = "translateY(0)";
                  }}>
                    Premium ✦
                  </Link>
                </>
              ) : (
                <div ref={dropRef} style={{ position: "relative" }}>
                  <button onClick={() => setDropOpen(v => !v)} style={{
                    width: 34, height: 34, borderRadius: "50%",
                    background: dropOpen ? T08 : R1,
                    border: `0.5px solid ${dropOpen ? TL : R2}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 500,
                    color: dropOpen ? T : T2,
                    cursor: "pointer", transition: "all 0.15s",
                    boxShadow: dropOpen ? "0 0 16px rgba(212,168,67,0.2)" : "none",
                  }}
                  onMouseEnter={e => {
                    if (!dropOpen) {
                      (e.currentTarget as any).style.borderColor = TL;
                      (e.currentTarget as any).style.color = T;
                      (e.currentTarget as any).style.boxShadow = "0 0 12px rgba(212,168,67,0.15)";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!dropOpen) {
                      (e.currentTarget as any).style.borderColor = R2;
                      (e.currentTarget as any).style.color = T2;
                      (e.currentTarget as any).style.boxShadow = "none";
                    }
                  }}>
                    {initial}
                  </button>

                  {dropOpen && (
                    <div style={{
                      position: "absolute", top: "calc(100% + 10px)", right: 0, width: 230,
                      background: B1,
                      border: "0.5px solid rgba(255,255,255,0.08)",
                      borderRadius: 16,
                      boxShadow: "0 20px 60px rgba(0,0,0,0.7), 0 0 0 0.5px rgba(212,168,67,0.08)",
                      overflow: "hidden",
                      animation: "dropIn 0.15s ease-out",
                      zIndex: 200,
                    }}>
                      {/* User header */}
                      <div style={{ padding: "14px 16px 12px", borderBottom: `0.5px solid ${R1}` }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: TX, marginBottom: 2 }}>@{username}</div>
                        <div style={{ fontSize: 11, color: T3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</div>
                      </div>

                      {/* Main links */}
                      <div style={{ padding: "6px 0" }}>
                        {DROPDOWN_LINKS.filter(l => l.section === "main").map(({ href, label, icon }) => (
                          <Link key={href} href={href} onClick={() => setDropOpen(false)} style={{
                            display: "flex", alignItems: "center", gap: 10,
                            padding: "8px 16px", fontSize: 13, color: T2,
                            textDecoration: "none", transition: "all 0.1s",
                          }}
                          onMouseEnter={e => {
                            const el = e.currentTarget as HTMLElement;
                            el.style.background = "rgba(212,168,67,0.06)";
                            el.style.color = TX;
                          }}
                          onMouseLeave={e => {
                            const el = e.currentTarget as HTMLElement;
                            el.style.background = "transparent";
                            el.style.color = T2;
                          }}>
                            <span style={{ fontSize: 11, color: T, width: 14, textAlign: "center", flexShrink: 0 }}>{icon}</span>
                            {label}
                          </Link>
                        ))}
                      </div>

                      {/* Extra links */}
                      <div style={{ padding: "6px 0", borderTop: `0.5px solid ${R1}` }}>
                        {DROPDOWN_LINKS.filter(l => l.section === "extra").map(({ href, label, icon }) => (
                          <Link key={href} href={href} onClick={() => setDropOpen(false)} style={{
                            display: "flex", alignItems: "center", gap: 10,
                            padding: "7px 16px", fontSize: 12, color: T3,
                            textDecoration: "none", transition: "all 0.1s",
                          }}
                          onMouseEnter={e => {
                            (e.currentTarget as HTMLElement).style.background = R1;
                            (e.currentTarget as HTMLElement).style.color = T2;
                          }}
                          onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.background = "transparent";
                            (e.currentTarget as HTMLElement).style.color = T3;
                          }}>
                            <span style={{ fontSize: 10, color: T3, width: 14, textAlign: "center", flexShrink: 0 }}>{icon}</span>
                            {label}
                          </Link>
                        ))}
                      </div>

                      {/* Footer */}
                      <div style={{ borderTop: `0.5px solid ${R1}`, padding: "6px 0" }}>
                        <Link href={`/profil/${username}`} onClick={() => setDropOpen(false)} style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "8px 16px", fontSize: 13, color: T,
                          textDecoration: "none",
                        }}
                        onMouseEnter={e => (e.currentTarget as any).style.background = T08}
                        onMouseLeave={e => (e.currentTarget as any).style.background = "transparent"}>
                          <span style={{ fontSize: 11, color: T, width: 14, textAlign: "center" }}>◉</span>
                          Mein Profil
                        </Link>
                        <button onClick={signOut} style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "8px 16px", width: "100%",
                          fontSize: 13, color: "#dc4a5a",
                          background: "transparent", border: "none", cursor: "pointer",
                          transition: "background 0.1s",
                        }}
                        onMouseEnter={e => (e.currentTarget as any).style.background = "rgba(220,74,90,0.06)"}
                        onMouseLeave={e => (e.currentTarget as any).style.background = "transparent"}>
                          <span style={{ fontSize: 11, color: T3, width: 14, textAlign: "center" }}>×</span>
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
              width: 36, height: 36, borderRadius: 10,
              background: mobOpen ? T08 : "transparent",
              border: `0.5px solid ${mobOpen ? TL : R2}`,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 5,
              cursor: "pointer", transition: "all 0.2s", flexShrink: 0,
            }}>
              <span style={{ display:"block", width:16, height:1.5, background: mobOpen ? T : T2, borderRadius:2, transition:"all 0.25s", transform: mobOpen ? "translateY(3.5px) rotate(45deg)" : "none" }}/>
              <span style={{ display:"block", width:16, height:1.5, background: mobOpen ? T : T2, borderRadius:2, transition:"all 0.25s", opacity: mobOpen ? 0 : 1 }}/>
              <span style={{ display:"block", width:16, height:1.5, background: mobOpen ? T : T2, borderRadius:2, transition:"all 0.25s", transform: mobOpen ? "translateY(-3.5px) rotate(-45deg)" : "none" }}/>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobOpen && (
          <div style={{
            borderTop: "0.5px solid rgba(255,255,255,0.06)",
            padding: "12px 16px 24px",
            display: "flex", flexDirection: "column", gap: 2,
            animation: "slideDown 0.2s ease-out",
          }}>
            {NAV_LINKS.map(({ href, label }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link key={href} href={href} style={{
                  padding: "12px 14px", borderRadius: 12, fontSize: 15,
                  color: active ? TX : T2,
                  background: active ? T08 : "transparent",
                  border: active ? `0.5px solid ${TL}` : "0.5px solid transparent",
                  textDecoration: "none", fontWeight: active ? 500 : 400,
                  transition: "all 0.15s",
                }}>{label}</Link>
              );
            })}
            <div style={{ height: 0.5, background: R1, margin: "8px 0" }}/>
            {user ? (
              <>
                {DROPDOWN_LINKS.map(({ href, label, icon }) => (
                  <Link key={href} href={href} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "10px 14px", borderRadius: 10, fontSize: 14,
                    color: T2, textDecoration: "none",
                  }}>
                    <span style={{ fontSize: 12, color: T, width: 16, textAlign: "center" }}>{icon}</span>
                    {label}
                  </Link>
                ))}
                <div style={{ height: 0.5, background: R1, margin: "8px 0" }}/>
                <Link href={`/profil/${username}`} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 14px", borderRadius: 10, fontSize: 14,
                  color: T, textDecoration: "none",
                }}>
                  <span style={{ fontSize: 12, color: T, width: 16, textAlign: "center" }}>◉</span>
                  @{username}
                </Link>
                <button onClick={signOut} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 14px", borderRadius: 10, fontSize: 14,
                  color: "#dc4a5a", background: "transparent", border: "none",
                  cursor: "pointer", width: "100%", textAlign: "left",
                }}>
                  <span style={{ fontSize: 12, color: T3, width: 16, textAlign: "center" }}>×</span>
                  Abmelden
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" style={{
                  padding: "12px 14px", borderRadius: 12, fontSize: 15,
                  color: T2, textDecoration: "none",
                }}>Anmelden</Link>
                <Link href="/dashboard/premium" style={{
                  padding: "12px 14px", borderRadius: 12, fontSize: 15,
                  color: BG, background: T, fontWeight: 500,
                  textDecoration: "none", textAlign: "center",
                  boxShadow: "0 0 24px rgba(212,168,67,0.3)",
                }}>Premium werden ✦</Link>
              </>
            )}
          </div>
        )}
      </header>

      <style>{`
        @keyframes dropIn    { from { opacity:0; transform:translateY(-8px) } to { opacity:1; transform:translateY(0) } }
        @keyframes slideDown { from { opacity:0; transform:translateY(-6px) } to { opacity:1; transform:translateY(0) } }
        @keyframes gold-pulse { 0%,100% { text-shadow: 0 0 12px rgba(212,168,67,0.6) } 50% { text-shadow: 0 0 20px rgba(212,168,67,0.9), 0 0 40px rgba(212,168,67,0.3) } }
        .desktop-nav   { display: flex !important; }
        .desktop-auth  { display: flex !important; }
        .hamburger-btn { display: none !important; }
        @media (max-width: 680px) {
          .desktop-nav   { display: none !important; }
          .desktop-auth  { display: none !important; }
          .hamburger-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}
