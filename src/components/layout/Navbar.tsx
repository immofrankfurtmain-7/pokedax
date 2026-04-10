"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

const G  = "#D4A843";
const G15 = "rgba(212,168,67,0.15)";
const G08 = "rgba(212,168,67,0.08)";

const NAV_LINKS = [
  { href: "/preischeck", label: "Karten"     },
  { href: "/marketplace", label: "Marktplatz" },
  { href: "/forum",      label: "Community"  },
];

const DROPDOWN_LINKS = [
  { href: "/dashboard",          label: "Dashboard",     icon: "✦" },
  { href: "/portfolio",          label: "Portfolio",     icon: "◈" },
  { href: "/scanner",            label: "Scanner",       icon: "⊙" },
  { href: "/sets",               label: "Sets",          icon: "◫" },
  { href: "/fantasy",            label: "Fantasy",       icon: "◇" },
  { href: "/leaderboard",        label: "Leaderboard",   icon: "▲" },
  { href: "/matches",            label: "Meine Matches",  icon: "◈" },
  { href: "/settings",           label: "Einstellungen",  icon: "◎" },
];

export default function Navbar() {
  const pathname  = usePathname();
  const router    = useRouter();
  const [user,    setUser]    = useState<any>(null);
  const [open,    setOpen]    = useState(false);
  const [scrolled,setScrolled]= useState(false);
  const dropRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sb = createClient();
    sb.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: { subscription } } = sb.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function signOut() {
    setOpen(false);
    await createClient().auth.signOut();
    router.push("/");
  }

  const username = user?.email?.split("@")[0] ?? "Account";
  const initial  = username[0]?.toUpperCase() ?? "A";

  return (
    <header style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? "rgba(9,9,11,0.92)" : "transparent",
      backdropFilter: scrolled ? "blur(16px)" : "none",
      borderBottom: scrolled ? "0.5px solid rgba(255,255,255,0.06)" : "0.5px solid transparent",
      transition: "all 0.3s ease",
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto",
        padding: "0 clamp(16px,3vw,32px)",
        height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 32,
      }}>

        {/* Logo */}
        <Link href="/" style={{
          fontFamily: "var(--font-display)",
          fontSize: 17, fontWeight: 300, letterSpacing: "-.04em",
          color: "#ededf2", textDecoration: "none", flexShrink: 0,
        }}>
          pokédax
          <span style={{ color: G, marginLeft: 2 }}>.</span>
        </Link>

        {/* Nav links */}
        <nav style={{ display: "flex", gap: 2, flex: 1, justifyContent: "center" }}>
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link key={href} href={href} style={{
                padding: "6px 16px", borderRadius: 10,
                fontSize: 13, fontWeight: 400,
                color: active ? "#ededf2" : "#62626f",
                background: active ? "rgba(255,255,255,0.06)" : "transparent",
                textDecoration: "none",
                transition: "color 0.15s, background 0.15s",
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as any).style.color = "#a4a4b4"; }}
              onMouseLeave={e => { if (!active) (e.currentTarget as any).style.color = "#62626f"; }}>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {!user ? (
            <>
              <Link href="/auth/login" style={{
                padding: "7px 16px", borderRadius: 10,
                fontSize: 13, color: "#a4a4b4",
                textDecoration: "none",
              }}>Anmelden</Link>
              <Link href="/dashboard/premium" style={{
                padding: "7px 16px", borderRadius: 10,
                fontSize: 13, fontWeight: 400,
                background: G08, color: G,
                border: `0.5px solid ${G15}`,
                textDecoration: "none",
              }}>Premium ✦</Link>
            </>
          ) : (
            <div ref={dropRef} style={{ position: "relative" }}>
              {/* Avatar button */}
              <button onClick={() => setOpen(v => !v)} style={{
                width: 34, height: 34, borderRadius: "50%",
                background: open ? G08 : "rgba(255,255,255,0.06)",
                border: `0.5px solid ${open ? G15 : "rgba(255,255,255,0.1)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 500, color: open ? G : "#a4a4b4",
                cursor: "pointer", transition: "all 0.15s",
              }}>
                {initial}
              </button>

              {/* Dropdown */}
              {open && (
                <div style={{
                  position: "absolute", top: "calc(100% + 8px)", right: 0,
                  width: 220,
                  background: "#111114",
                  border: "0.5px solid rgba(255,255,255,0.085)",
                  borderRadius: 14,
                  boxShadow: "0 16px 48px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(212,168,67,0.06)",
                  overflow: "hidden",
                  animation: "dropIn 0.15s ease-out",
                }}>
                  {/* User info */}
                  <div style={{
                    padding: "12px 14px 10px",
                    borderBottom: "0.5px solid rgba(255,255,255,0.045)",
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 400, color: "#ededf2", marginBottom: 2 }}>
                      @{username}
                    </div>
                    <div style={{ fontSize: 11, color: "#62626f" }}>
                      {user?.email}
                    </div>
                  </div>

                  {/* Links */}
                  <div style={{ padding: "6px 0" }}>
                    {DROPDOWN_LINKS.map(({ href, label, icon }) => (
                      <Link key={href} href={href}
                        onClick={() => setOpen(false)}
                        style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "8px 14px",
                          fontSize: 13, color: "#a4a4b4",
                          textDecoration: "none",
                          transition: "background 0.1s, color 0.1s",
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as any).style.background = "rgba(255,255,255,0.04)";
                          (e.currentTarget as any).style.color = "#ededf2";
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as any).style.background = "transparent";
                          (e.currentTarget as any).style.color = "#a4a4b4";
                        }}>
                        <span style={{ fontSize: 11, color: "#62626f", width: 14, textAlign: "center" }}>{icon}</span>
                        {label}
                        {href === "/scanner" && (
                          <span style={{
                            marginLeft: "auto", fontSize: 9, padding: "1px 6px",
                            borderRadius: 4, background: G08, color: G,
                            border: `0.5px solid ${G15}`, fontWeight: 600,
                          }}>KI</span>
                        )}
                      </Link>
                    ))}
                  </div>

                  {/* Profile + Logout */}
                  <div style={{ borderTop: "0.5px solid rgba(255,255,255,0.045)", padding: "6px 0" }}>
                    <Link href={`/profil/${username}`}
                      onClick={() => setOpen(false)}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "8px 14px",
                        fontSize: 13, color: G,
                        textDecoration: "none",
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
                      transition: "background 0.1s",
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
      </div>
      <style>{`@keyframes dropIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </header>
  );
}
