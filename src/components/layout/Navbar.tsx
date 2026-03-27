"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Search, LayoutDashboard, MessageSquare, Gamepad2,
  Star, Menu, X, ChevronRight, LogOut, User, Shield,
  Zap, Swords, TrendingUp, BookOpen, Crown
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  glow: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/preischeck",  label: "Preischeck",  icon: <Search size={16} />,       color: "#00ffff",  glow: "rgba(0,255,255,0.3)"   },
  { href: "/dashboard",   label: "Dashboard",   icon: <LayoutDashboard size={16}/>,color: "#c864ff",  glow: "rgba(200,100,255,0.3)" },
  { href: "/forum",       label: "Forum",       icon: <MessageSquare size={16} />, color: "#00ff96",  glow: "rgba(0,255,150,0.3)"   },
  { href: "/spiel",       label: "Spiel",       icon: <Gamepad2 size={16} />,      color: "#ffdc00",  glow: "rgba(255,220,0,0.3)"   },
  { href: "/scanner",     label: "Scanner",     icon: <Zap size={16} />,           color: "#ff9600",  glow: "rgba(255,150,0,0.3)"   },
];

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        supabase
          .from("profiles")
          .select("username, avatar_url, forum_role, badge_champion, badge_elite4, badge_gym_leader, badge_trainer, is_premium")
          .eq("id", user.id)
          .single()
          .then(({ data }) => setProfile(data));
      }
    });
  }, []);

  // Close drawer on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (mobileOpen && drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [mobileOpen]);

  // Prevent body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const roleColor = profile?.forum_role === "admin" ? "#ff4444"
    : profile?.forum_role === "moderator" ? "#00ccff"
    : profile?.is_premium ? "#ffd700"
    : "rgba(255,255,255,0.5)";

  const topBadge = profile?.badge_champion ? { icon: <Crown size={10} />, color: "#ffd700" }
    : profile?.badge_elite4 ? { icon: <Star size={10} />, color: "#c864ff" }
    : profile?.badge_gym_leader ? { icon: <Shield size={10} />, color: "#00c8ff" }
    : profile?.badge_trainer ? { icon: <Zap size={10} />, color: "#00ff96" }
    : null;

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <>
      {/* ── Desktop & Mobile Topbar ── */}
      <nav
        className="sticky top-0 z-50 w-full"
        style={{
          background: "rgba(8, 0, 16, 0.92)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 4px 30px rgba(0,0,0,0.4)",
        }}
      >
        {/* Cyan top accent line */}
        <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, #00ffff40, #c864ff40, transparent)" }} />

        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div
              className="flex items-center justify-center text-lg font-black"
              style={{
                width: "32px", height: "32px", borderRadius: "50%",
                background: "radial-gradient(circle, #ffd70040, transparent)",
                border: "1.5px solid #ffd70060",
                color: "#ffd700",
                fontSize: "16px",
              }}
            >
              ◎
            </div>
            <span
              className="font-black tracking-tight hidden sm:block"
              style={{
                background: "linear-gradient(135deg, #ffd700, #ffaa00)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontSize: "17px",
                letterSpacing: "-0.02em",
              }}
            >
              POKÉDAX
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 text-sm font-medium"
                  style={{
                    color: isActive ? item.color : "rgba(255,255,255,0.5)",
                    background: isActive ? `${item.glow}` : "transparent",
                    border: isActive ? `1px solid ${item.color}30` : "1px solid transparent",
                    boxShadow: isActive ? `0 0 12px ${item.glow}` : "none",
                  }}
                >
                  <span style={{ color: isActive ? item.color : "rgba(255,255,255,0.35)" }}>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Right side: User + Hamburger */}
          <div className="flex items-center gap-2">
            {/* User avatar (desktop) */}
            {user && profile ? (
              <div className="hidden md:flex items-center gap-2">
                <div className="relative">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.username}
                      className="rounded-full object-cover"
                      style={{ width: 30, height: 30, border: `1.5px solid ${roleColor}`, boxShadow: `0 0 6px ${roleColor}60` }}
                    />
                  ) : (
                    <div
                      className="rounded-full flex items-center justify-center font-bold"
                      style={{ width: 30, height: 30, background: `${roleColor}20`, border: `1.5px solid ${roleColor}`, color: roleColor, fontSize: 12 }}
                    >
                      {profile.username?.[0]?.toUpperCase()}
                    </div>
                  )}
                  {topBadge && (
                    <div className="absolute -bottom-1 -right-1 rounded-full flex items-center justify-center"
                      style={{ width: 14, height: 14, background: "#080010", border: `1px solid ${topBadge.color}`, color: topBadge.color }}>
                      {topBadge.icon}
                    </div>
                  )}
                </div>
                <span style={{ color: roleColor, fontSize: 13, fontWeight: 600 }}>{profile.username}</span>
                <button
                  onClick={handleSignOut}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ color: "rgba(255,255,255,0.3)", background: "none", border: "none", cursor: "pointer" }}
                  title="Ausloggen"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/auth/login"
                  className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                  style={{ color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  Login
                </Link>
                <Link href="/auth/register"
                  className="px-3 py-1.5 rounded-lg text-sm font-bold transition-all"
                  style={{ background: "rgba(0,255,255,0.1)", border: "1px solid rgba(0,255,255,0.3)", color: "#00ffff" }}>
                  Registrieren
                </Link>
              </div>
            )}

            {/* Hamburger button (mobile) */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden flex items-center justify-center rounded-lg transition-all"
              style={{
                width: 38, height: 38,
                background: mobileOpen ? "rgba(0,255,255,0.1)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${mobileOpen ? "rgba(0,255,255,0.3)" : "rgba(255,255,255,0.1)"}`,
                color: mobileOpen ? "#00ffff" : "rgba(255,255,255,0.7)",
                cursor: "pointer",
              }}
              aria-label="Menü"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile Drawer ── */}
      <div
        ref={drawerRef}
        className="fixed top-0 right-0 h-full z-50 md:hidden flex flex-col transition-transform duration-300 ease-out"
        style={{
          width: "280px",
          background: "linear-gradient(180deg, #0d0020 0%, #080010 100%)",
          borderLeft: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "-20px 0 60px rgba(0,0,0,0.8)",
          transform: mobileOpen ? "translateX(0)" : "translateX(100%)",
        }}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <span
            className="font-black"
            style={{ background: "linear-gradient(135deg, #ffd700, #ffaa00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontSize: 18 }}
          >
            POKÉDAX
          </span>
          <button
            onClick={() => setMobileOpen(false)}
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer" }}
          >
            <X size={20} />
          </button>
        </div>

        {/* User section in drawer */}
        {user && profile ? (
          <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center gap-3">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.username} className="rounded-full"
                  style={{ width: 40, height: 40, border: `2px solid ${roleColor}` }} />
              ) : (
                <div className="rounded-full flex items-center justify-center font-bold"
                  style={{ width: 40, height: 40, background: `${roleColor}20`, border: `2px solid ${roleColor}`, color: roleColor, fontSize: 16 }}>
                  {profile.username?.[0]?.toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-bold text-white" style={{ fontSize: 14 }}>{profile.username}</p>
                <p style={{ color: roleColor, fontSize: 11, textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>
                  {profile.forum_role === "admin" ? "Admin" : profile.forum_role === "moderator" ? "Moderator" : profile.is_premium ? "Premium" : "Member"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-5 py-4 flex flex-col gap-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <Link href="/auth/login" className="text-center py-2 rounded-xl font-medium text-sm"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}>
              Login
            </Link>
            <Link href="/auth/register" className="text-center py-2 rounded-xl font-bold text-sm"
              style={{ background: "rgba(0,255,255,0.1)", border: "1px solid rgba(0,255,255,0.3)", color: "#00ffff" }}>
              Registrieren
            </Link>
          </div>
        )}

        {/* Nav links in drawer */}
        <div className="flex-1 px-3 py-4 overflow-y-auto">
          <p className="px-2 mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.2)" }}>
            Navigation
          </p>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href}
                className="flex items-center justify-between px-3 py-3 rounded-xl mb-1 transition-all"
                style={{
                  background: isActive ? `${item.glow}` : "transparent",
                  border: isActive ? `1px solid ${item.color}30` : "1px solid transparent",
                  color: isActive ? item.color : "rgba(255,255,255,0.6)",
                }}
              >
                <div className="flex items-center gap-3">
                  <span style={{ color: isActive ? item.color : "rgba(255,255,255,0.3)" }}>{item.icon}</span>
                  <span style={{ fontSize: 15, fontWeight: isActive ? 600 : 400 }}>{item.label}</span>
                </div>
                <ChevronRight size={14} style={{ color: "rgba(255,255,255,0.2)" }} />
              </Link>
            );
          })}
        </div>

        {/* Drawer footer */}
        {user && (
          <div className="px-5 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            <button onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all"
              style={{ background: "rgba(255,60,60,0.08)", border: "1px solid rgba(255,60,60,0.2)", color: "rgba(255,100,100,0.8)", fontSize: 13, cursor: "pointer" }}>
              <LogOut size={14} />
              Ausloggen
            </button>
          </div>
        )}
      </div>
    </>
  );
}
