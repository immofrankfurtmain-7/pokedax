"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Search, LayoutDashboard, MessageSquare, Gamepad2, Zap, TrendingUp,
  Menu, X, ChevronRight, LogOut, Home, Crown,
  Shield, Star, Camera
} from "lucide-react";

const NAV = [
  { href: "/",           label: "Start",      icon: Home,           color: "#EE1515" },
  { href: "/preischeck", label: "Preischeck", icon: Search,         color: "#00E5FF" },
  { href: "/dashboard",  label: "Dashboard",  icon: LayoutDashboard,color: "#A855F7" },
  { href: "/forum",      label: "Forum",      icon: MessageSquare,  color: "#22C55E" },
  { href: "/spiel",      label: "Spiel",      icon: Gamepad2,       color: "#FACC15" },
  { href: "/scanner",    label: "Scanner",    icon: Camera,         color: "#F97316" },
  { href: "/top-movers", label: "Top Movers", icon: TrendingUp,     color: "#22C55E" },
];

const BOTTOM_NAV = [
  { href: "/",           label: "Start",    icon: Home          },
  { href: "/preischeck", label: "Preise",   icon: Search        },
  { href: "/scanner",    label: "Scanner",  icon: Camera        },
  { href: "/forum",      label: "Forum",    icon: MessageSquare },
  { href: "/top-movers", label: "Top Movers", icon: TrendingUp },
  { href: "/dashboard",  label: "Profil",   icon: LayoutDashboard },
];

export default function Navbar() {
  const pathname = usePathname();
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser]       = useState<any>(null);
  const [open, setOpen]       = useState(false);
  const drawerRef             = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sb = createClient();
    sb.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) sb.from("profiles").select("username,avatar_url,forum_role,is_premium,badge_champion,badge_elite4,badge_gym_leader,badge_trainer").eq("id", user.id).single().then(({ data }) => setProfile(data));
    });
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (open && drawerRef.current && !drawerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname?.startsWith(href);

  const roleColor = profile?.forum_role === "admin" ? "#EE1515"
    : profile?.forum_role === "moderator" ? "#00E5FF"
    : profile?.is_premium ? "#FACC15"
    : "rgba(255,255,255,0.4)";

  const badgeLabel = profile?.badge_champion ? "Champion"
    : profile?.badge_elite4 ? "Top Vier"
    : profile?.badge_gym_leader ? "Arenaleiter"
    : profile?.badge_trainer ? "Trainer"
    : null;

  async function signOut() {
    await createClient().auth.signOut();
    window.location.href = "/";
  }

  return (
    <>
      {/* ── Top Navbar ── */}
      <nav className="sticky-header" style={{ height: 100 }}>
        {/* Pokemon-style top accent - dual color */}
        <div style={{ height: 3, background: "linear-gradient(90deg, transparent, #EE1515 20%, #FACC15 50%, #EE1515 80%, transparent)" }} />

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px", height: 98, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <img
              src="/pokedax-logo.png"
              alt="PokéDax"
              style={{
                height: 120, width: "auto",
              filter: "drop-shadow(0 0 8px rgba(250,204,21,0.4))",
              }}
            />
          </Link>

          {/* Desktop Links */}
          <div style={{ display: "flex", gap: 2 }} className="hidden-mobile">
            {NAV.map(({ href, label, icon: Icon, color }) => {
              const active = isActive(href);
              return (
                <Link key={href} href={href} style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "6px 12px", borderRadius: 8,
                  fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 500,
                  color: active ? color : "rgba(255,255,255,0.5)",
                  background: active ? `${color}15` : "transparent",
                  border: `1px solid ${active ? color + "30" : "transparent"}`,
                  textDecoration: "none",
                  transition: "all .15s",
                }}>
                  <Icon size={14} />
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Right: User + Hamburger */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Desktop user */}
            {user && profile ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }} className="hidden-mobile">
                {!profile?.is_premium && (
                  <Link href="/dashboard/premium" style={{
                    display: "flex", alignItems: "center", gap: 5,
                    padding: "5px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                    background: "linear-gradient(135deg, #FACC15, #f59e0b)",
                    color: "#000", textDecoration: "none",
                    fontFamily: "Poppins, sans-serif",
                    boxShadow: "0 0 10px rgba(250,204,21,0.25)",
                  }}>👑 Premium</Link>
                )}
                <div style={{ position: "relative" }}>
                  {profile.avatar_url ? (
                    <Link href={`/profil/${profile.username}`} style={{ display: "flex" }}>
                    <img src={profile.avatar_url} alt={profile.username}
                      style={{ width: 30, height: 30, borderRadius: "50%", objectFit: "cover", border: `2px solid ${roleColor}`, cursor: "pointer" }} />
                  </Link>
                  ) : (
                    <Link href={`/profil/${profile.username}`} style={{ display: "flex" }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: "50%",
                      background: `${roleColor}20`, border: `2px solid ${roleColor}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 700, fontSize: 12, color: roleColor, cursor: "pointer",
                    }}>{profile.username?.[0]?.toUpperCase()}</div>
                  </Link>
                  )}
                </div>
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600, color: roleColor }}>
                  {profile.username}
                </span>
                <button onClick={signOut} title="Ausloggen"
                  style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", padding: 4, display: "flex" }}>
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 6, alignItems: "center" }} className="hidden-mobile">
                <Link href="/dashboard/premium" style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 700,
                  background: "linear-gradient(135deg, #FACC15, #f59e0b)",
                  color: "#000", textDecoration: "none",
                  fontFamily: "Poppins, sans-serif",
                  boxShadow: "0 0 12px rgba(250,204,21,0.3)",
                }}>👑 Premium</Link>
                <Link href="/auth/login" style={{
                  padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 500,
                  color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.12)",
                  textDecoration: "none",
                }}>Login</Link>
                <Link href="/auth/register" style={{
                  padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 700,
                  color: "white", background: "#EE1515", border: "none", textDecoration: "none",
                  fontFamily: "Poppins, sans-serif",
                }}>Registrieren</Link>
              </div>
            )}

            {/* Hamburger */}
            <button onClick={() => setOpen(!open)}
              style={{
                width: 36, height: 36, borderRadius: 8,
                background: open ? "rgba(238,21,21,0.1)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${open ? "rgba(238,21,21,0.3)" : "rgba(255,255,255,0.1)"}`,
                color: open ? "#EE1515" : "rgba(255,255,255,0.6)",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              }}
              aria-label="Menü öffnen"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Overlay ── */}
      {open && (
        <div onClick={() => setOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", zIndex: 48 }} />
      )}

      {/* ── Drawer ── */}
      <div ref={drawerRef} style={{
        position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 49,
        width: 290,
        background: "linear-gradient(180deg, #111111 0%, #0A0A0A 100%)",
        borderLeft: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "-24px 0 60px rgba(0,0,0,0.9)",
        transform: open ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
        display: "flex", flexDirection: "column",
        overflowY: "auto",
      }}>
        {/* Red top line */}
        <div style={{ height: 2, background: "linear-gradient(90deg, transparent, #EE1515, transparent)", flexShrink: 0 }} />

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
          <img
            src="/pokedax-logo.png"
            alt="PokéDax"
            style={{ height: 32, width: "auto", filter: "drop-shadow(0 0 6px rgba(250,204,21,0.4))" }}
          />
          <button onClick={() => setOpen(false)}
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", display: "flex" }}>
            <X size={20} />
          </button>
        </div>

        {/* User block */}
        {user && profile ? (
          <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.username}
                  style={{ width: 40, height: 40, borderRadius: "50%", border: `2px solid ${roleColor}` }} />
              ) : (
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: `${roleColor}20`, border: `2px solid ${roleColor}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700, fontSize: 16, color: roleColor,
                }}>{profile.username?.[0]?.toUpperCase()}</div>
              )}
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: "#F8FAFC" }}>{profile.username}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: roleColor, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {profile.forum_role === "admin" ? "Admin"
                    : profile.forum_role === "moderator" ? "Moderator"
                    : profile.is_premium ? "⭐ Premium"
                    : badgeLabel || "Trainer"}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
            <Link href="/auth/login" onClick={() => setOpen(false)} style={{
              display: "block", textAlign: "center", padding: "9px 0", borderRadius: 10,
              fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.6)",
              border: "1px solid rgba(255,255,255,0.12)", textDecoration: "none",
            }}>Login</Link>
            <Link href="/auth/register" onClick={() => setOpen(false)} style={{
              display: "block", textAlign: "center", padding: "9px 0", borderRadius: 10,
              fontSize: 14, fontWeight: 700, color: "white",
              background: "#EE1515", textDecoration: "none", fontFamily: "Poppins, sans-serif",
            }}>Registrieren</Link>
          </div>
        )}

        {/* Nav Links */}
        <div style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.2)", letterSpacing: "0.2em", textTransform: "uppercase", padding: "4px 8px 10px" }}>
            Navigation
          </div>
          {NAV.map(({ href, label, icon: Icon, color }) => {
            const active = isActive(href);
            return (
              <Link key={href} href={href} onClick={() => setOpen(false)} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "11px 10px", borderRadius: 10, marginBottom: 2,
                background: active ? `${color}15` : "transparent",
                border: `1px solid ${active ? color + "25" : "transparent"}`,
                color: active ? color : "rgba(255,255,255,0.6)",
                textDecoration: "none", transition: "all .15s",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Icon size={16} />
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: active ? 600 : 400 }}>{label}</span>
                </div>
                <ChevronRight size={14} style={{ color: "rgba(255,255,255,0.2)" }} />
              </Link>
            );
          })}

          {/* Premium upsell */}
          {!profile?.is_premium && (
            <Link href="/dashboard/premium" onClick={() => setOpen(false)} style={{
              display: "block", margin: "12px 0 0", padding: "12px 10px", borderRadius: 10,
              background: "rgba(250,204,21,0.08)", border: "1px solid rgba(250,204,21,0.2)",
              textDecoration: "none",
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#FACC15", marginBottom: 2 }}>👑 Premium · 7,99€/Mo</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Unlimitierter Scanner + mehr</div>
            </Link>
          )}
        </div>

        {/* Sign out */}
        {user && (
          <div style={{ padding: "12px 10px", borderTop: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
            <button onClick={signOut} style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "10px", borderRadius: 10, cursor: "pointer",
              background: "rgba(238,21,21,0.06)", border: "1px solid rgba(238,21,21,0.15)",
              color: "rgba(238,21,21,0.7)", fontSize: 13, fontFamily: "Inter, sans-serif",
            }}>
              <LogOut size={14} />
              Ausloggen
            </button>
          </div>
        )}
      </div>

      {/* ── Bottom Navigation (Mobile only) ── */}
      <nav className="bottom-nav">
        {BOTTOM_NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href} className={`bottom-nav-item${active ? " active" : ""}`}>
              <Icon size={20} />
              <span className="bottom-nav-label">{label}</span>
            </Link>
          );
        })}
      </nav>

      <style>{`
        @media (min-width: 769px) { .hidden-mobile { display: flex !important; } }
        @media (max-width: 768px) { .hidden-mobile { display: none !important; } }
      `}</style>
    </>
  );
}
