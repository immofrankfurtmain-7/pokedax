"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

const G   = "#D4A843";
const G15 = "rgba(212,168,67,0.15)";
const G08 = "rgba(212,168,67,0.08)";

const NAV_LINKS = [
  { href: "/preischeck",  label: "Karten"     },
  { href: "/marketplace", label: "Marktplatz" },
  { href: "/forum",       label: "Community"  },
];

const DROPDOWN_LINKS = [
  { href: "/dashboard",   label: "Dashboard",     icon: "✦" },
  { href: "/portfolio",   label: "Portfolio",      icon: "◈" },
  { href: "/scanner",     label: "Scanner",        icon: "⊙" },
  { href: "/sets",        label: "Sets",           icon: "◫" },
  { href: "/fantasy",     label: "Fantasy",        icon: "◇" },
  { href: "/leaderboard", label: "Leaderboard",    icon: "▲" },
  { href: "/matches",     label: "Meine Matches",  icon: "◉" },
  { href: "/settings",    label: "Einstellungen",  icon: "◎" },
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
        background: scrolled || mobOpen ? "rgba(9,9,11,0.95)" : "transparent",
        backdropFilter: scrolled || mobOpen ? "blur(16px)" : "none",
        borderBottom: scrolled || mobOpen ? "0.5px solid rgba(255,255,255,0.06)" : "0.5px solid transparent",
        transition: "background 0.3s, backdrop-filter 0.3s, border-color 0.3s",
      }}>
        <div style={{
          maxWidth: 1200, margin: "0 auto",
          padding: "0 clamp(16px,3vw,32px)",
          height: 60,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 24,
        }}>
          <Link href="/" style={{
            fontFamily: "var(--font-display)",
            fontSize: 17, fontWeight: 300, letterSpacing: "-.04em",
            color: "#ededf2", textDecoration: "none", flexShrink: 0,
          }}>pokédax<span style={{ color: G }}>.</span></Link>

          <nav style={{ display: "flex", gap: 2, flex: 1, justifyContent: "center" }} className="desktop-nav">
            {NAV_LINKS.map(({ href, label }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link key={href} href={href} style={{
                  padding: "6px 16px", borderRadius: 10, fontSize: 13, fontWeight: 400,
                  color: active ? "#ededf2" : "#62626f",
                  background: active ? "rgba(255,255,255,0.06)" : "transparent",
                  textDecoration: "none", transition: "color 0.15s, background 0.15s",
                }}
                onMouseEnter={e => { if (!active) (e.currentTarget as any).style.color = "#a4a4b4"; }}
                onMouseLeave={e => { if (!active) (e.currentTarget as any).style.color = "#62626f"; }}>
                  {label}
                </Link>
              );
            })}
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <div className="desktop-auth" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {!user ? (
                <>
                  <Link href="/auth/login" style={{ padding: "7px 16px", borderRadius: 10, fontSize: 13, color: "#a4a4b4", textDecoration: "none" }}>Anmelden</Link>
                  <Link href="/dashboard/premium" style={{ padding: "7px 16px", borderRadius: 10, fontSize: 13, background: G08, color: G, border: `0.5px solid ${G15}`, textDecoration: "none" }}>Premium ✦</Link>
                </>
              ) : (
                <div ref={dropRef} style={{ position: "relative" }}>
                  <button onClick={() => setDropOpen(v => !v)} style={{
                    width: 34, height: 34, borderRadius: "50%",
                    background: dropOpen ? G08 : "rgba(255,255,255,0.06)",
                    border: `0.5px solid ${dropOpen ? G15 : "rgba(255,255,255,0.1)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 500, color: dropOpen ? G : "#a4a4b4",
                    cursor: "pointer", transition: "all 0.15s",
                  }}>{initial}</button>

                  {dropOpen && (
                    <div style={{
                      position: "absolute", top: "calc(100% + 8px)", right: 0, width: 220,
                      background: "#111114", border: "0.5px solid rgba(255,255,255,0.085)",
                      borderRadius: 14, boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
                      overflow: "hidden", animation: "dropIn 0.15s ease-out", zIndex: 200,
                    }}>
                      <div style={{ padding: "12px 14px 10px", borderBottom: "0.5px solid rgba(255,255,255,0.045)" }}>
                        <div style={{ fontSize: 13, color: "#ededf2", marginBottom: 2 }}>@{username}</div>
                        <div style={{ fontSize: 11, color: "#62626f", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</div>
                      </div>
                      <div style={{ padding: "6px 0" }}>
                        {DROPDOWN_LINKS.map(({ href, label, icon }) => (
                          <Link key={href} href={href} onClick={() => setDropOpen(false)} style={{
                            display: "flex", alignItems: "center", gap: 10,
                            padding: "8px 14px", fontSize: 13, color: "#a4a4b4",
                            textDecoration: "none", transition: "background 0.1s, color 0.1s",
                          }}
                          onMouseEnter={e => { (e.currentTarget as any).style.background = "rgba(255,255,255,0.04)"; (e.currentTarget as any).style.color = "#ededf2"; }}
                          onMouseLeave={e => { (e.currentTarget as any).style.background = "transparent"; (e.currentTarget as any).style.color = "#a4a4b4"; }}>
                            <span style={{ fontSize: 11, color: "#62626f", width: 14, textAlign: "center", flexShrink: 0 }}>{icon}</span>
                            {label}
                          </Link>
                        ))}
                      </div>
                      <div style={{ borderTop: "0.5px solid rgba(255,255,255,0.045)", padding: "6px 0" }}>
                        <Link href={`/profil/${username}`} onClick={() => setDropOpen(false)} style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "8px 14px", fontSize: 13, color: G, textDecoration: "none",
                        }}
                        onMouseEnter={e => (e.currentTarget as any).style.background = "rgba(255,255,255,0.04)"}
                        onMouseLeave={e => (e.currentTarget as any).style.background = "transparent"}>
                          <span style={{ fontSize: 11, color: "#62626f", width: 14, textAlign: "center" }}>◉</span>
                          Mein Profil
                        </Link>
                        <button onClick={signOut} style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "8px 14px", width: "100%",
                          fontSize: 13, color: "#dc4a5a",
                          background: "transparent", border: "none", cursor: "pointer",
                        }}
                        onMouseEnter={e => (e.currentTarget as any).style.background = "rgba(220,74,90,0.06)"}
                        onMouseLeave={e => (e.currentTarget as any).style.background = "transparent"}>
                          <span style={{ fontSize: 11, color: "#62626f", width: 14, textAlign: "center" }}>×</span>
                          Abmelden
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button onClick={() => setMobOpen(v => !v)} className="hamburger-btn" aria-label="Menü" style={{
              width: 36, height: 36, borderRadius: 10,
              background: mobOpen ? G08 : "transparent",
              border: `0.5px solid ${mobOpen ? G15 : "rgba(255,255,255,0.08)"}`,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 5,
              cursor: "pointer", transition: "all 0.2s", flexShrink: 0,
            }}>
              <span style={{ display: "block", width: 16, height: 1.5, background: mobOpen ? G : "#a4a4b4", borderRadius: 2, transition: "all 0.25s", transform: mobOpen ? "translateY(3px) rotate(45deg)" : "none" }}/>
              <span style={{ display: "block", width: 16, height: 1.5, background: mobOpen ? G : "#a4a4b4", borderRadius: 2, transition: "all 0.25s", opacity: mobOpen ? 0 : 1 }}/>
              <span style={{ display: "block", width: 16, height: 1.5, background: mobOpen ? G : "#a4a4b4", borderRadius: 2, transition: "all 0.25s", transform: mobOpen ? "translateY(-5px) rotate(-45deg)" : "none" }}/>
            </button>
          </div>
        </div>

        {mobOpen && (
          <div style={{
            borderTop: "0.5px solid rgba(255,255,255,0.06)",
            padding: "12px 16px 20px",
            display: "flex", flexDirection: "column", gap: 2,
            animation: "slideDown 0.2s ease-out",
          }}>
            {NAV_LINKS.map(({ href, label }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link key={href} href={href} style={{
                  padding: "11px 14px", borderRadius: 10, fontSize: 15,
                  color: active ? "#ededf2" : "#a4a4b4",
                  background: active ? "rgba(255,255,255,0.06)" : "transparent",
                  textDecoration: "none", fontWeight: active ? 500 : 400,
                }}>{label}</Link>
              );
            })}
            <div style={{ height: 0.5, background: "rgba(255,255,255,0.06)", margin: "8px 0" }}/>
            {user ? (
              <>
                {DROPDOWN_LINKS.map(({ href, label, icon }) => (
                  <Link key={href} href={href} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "10px 14px", borderRadius: 10, fontSize: 14,
                    color: "#a4a4b4", textDecoration: "none",
                  }}>
                    <span style={{ fontSize: 13, color: "#62626f", width: 16, textAlign: "center" }}>{icon}</span>
                    {label}
                  </Link>
                ))}
                <div style={{ height: 0.5, background: "rgba(255,255,255,0.06)", margin: "8px 0" }}/>
                <Link href={`/profil/${username}`} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 10, fontSize: 14, color: G, textDecoration: "none" }}>
                  <span style={{ fontSize: 13, color: "#62626f", width: 16, textAlign: "center" }}>◉</span>
                  @{username}
                </Link>
                <button onClick={signOut} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 10, fontSize: 14, color: "#dc4a5a", background: "transparent", border: "none", cursor: "pointer", width: "100%", textAlign: "left" }}>
                  <span style={{ fontSize: 13, color: "#62626f", width: 16, textAlign: "center" }}>×</span>
                  Abmelden
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" style={{ padding: "11px 14px", borderRadius: 10, fontSize: 15, color: "#a4a4b4", textDecoration: "none" }}>Anmelden</Link>
                <Link href="/dashboard/premium" style={{ padding: "11px 14px", borderRadius: 10, fontSize: 15, color: G, background: G08, border: `0.5px solid ${G15}`, textDecoration: "none", textAlign: "center", fontWeight: 500 }}>Premium werden ✦</Link>
              </>
            )}
          </div>
        )}
      </header>

      <style>{`
        @keyframes dropIn   { from { opacity:0; transform:translateY(-6px) } to { opacity:1; transform:translateY(0) } }
        @keyframes slideDown{ from { opacity:0; transform:translateY(-8px) } to { opacity:1; transform:translateY(0) } }
        .desktop-nav  { display: flex !important; }
        .desktop-auth { display: flex !important; }
        .hamburger-btn{ display: none !important; }
        @media (max-width: 680px) {
          .desktop-nav  { display: none !important; }
          .desktop-auth { display: none !important; }
          .hamburger-btn{ display: flex !important; }
        }
      `}</style>
    </>
  );
}
