"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

const NAV_LINKS = [
  { href: "/preischeck", label: "Preischeck" },
  { href: "/scanner",   label: "Scanner"   },
  { href: "/forum",     label: "Forum"     },
  { href: "/top-movers",label: "Top Movers"},
  { href: "/spiel",     label: "Spiel"     },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const sb = createClient();
    sb.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        sb.from("profiles").select("is_premium").eq("id", user.id).single()
          .then(({ data }) => { if (data) setIsPremium(data.is_premium); });
      }
    });
    const { data: { subscription } } = sb.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    const sb = createClient();
    await sb.auth.signOut();
    router.push("/");
  }

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 50,
      padding: "10px 20px 0",
    }}>
      <nav style={{
        height: 56,
        padding: "0 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "rgba(8,8,16,0.88)",
        border: "1px solid rgba(255,255,255,0.085)",
        borderRadius: 20,
        backdropFilter: "blur(28px) saturate(160%)",
        WebkitBackdropFilter: "blur(28px) saturate(160%)",
      }}>

        {/* Brand */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div style={{
            width: 24, height: 24, borderRadius: 7,
            background: "rgba(233,168,75,0.06)",
            border: "1px solid rgba(233,168,75,0.18)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Image src="/pokedax-logo.png" alt="PokéDax" width={16} height={16} style={{ objectFit: "contain" }} />
          </div>
          <span style={{ fontSize: 14.5, fontWeight: 500, letterSpacing: "-.025em", color: "var(--tx-1)" }}>
            PokéDax
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden-mobile" style={{ display: "flex" }}>
          {NAV_LINKS.map(link => {
            const active = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link key={link.href} href={link.href} style={{
                padding: "5px 12px", borderRadius: 6,
                fontSize: 12, fontWeight: 400,
                color: active ? "var(--tx-1)" : "var(--tx-2)",
                textDecoration: "none", position: "relative",
                transition: "color .12s, background .12s",
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.04)"; }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}
              >
                {link.label}
                {active && (
                  <span style={{
                    position: "absolute", bottom: -1, left: 12, right: 12,
                    height: 1, background: "var(--gold)", opacity: .65, borderRadius: 1,
                  }} />
                )}
              </Link>
            );
          })}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {isPremium && (
            <Link href="/dashboard/premium" style={{
              padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 500,
              background: "var(--gold-06)", color: "var(--gold)",
              border: "1px solid var(--gold-18)", textDecoration: "none",
            }}>✦ Premium</Link>
          )}
          {!isPremium && (
            <Link href="/dashboard/premium" style={{
              padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 500,
              background: "var(--gold-06)", color: "var(--gold)",
              border: "1px solid var(--gold-18)", textDecoration: "none",
            }}>👑 Premium</Link>
          )}
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Link href="/dashboard" style={{
                width: 30, height: 30, borderRadius: "50%",
                background: "var(--bg-3)", border: "1px solid var(--br-2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 600, color: "var(--gold)",
                textDecoration: "none",
              }}>
                {user.email?.[0]?.toUpperCase() || "U"}
              </Link>
              <button onClick={handleSignOut} style={{
                padding: "5px 12px", borderRadius: 6, fontSize: 12,
                color: "var(--tx-2)", border: "1px solid var(--br-2)",
                background: "transparent", cursor: "pointer",
              }}>Abmelden</button>
            </div>
          ) : (
            <>
              <Link href="/auth/login" style={{
                padding: "5px 12px", borderRadius: 6, fontSize: 12, fontWeight: 400,
                color: "var(--tx-2)", border: "1px solid var(--br-2)",
                background: "transparent", textDecoration: "none",
              }}>Anmelden</Link>
              <Link href="/auth/register" style={{
                padding: "5px 13px", borderRadius: 6, fontSize: 12, fontWeight: 500,
                background: "var(--gold)", color: "#09070E",
                border: "none", textDecoration: "none", letterSpacing: "-.01em",
              }}>Registrieren</Link>
            </>
          )}
        </div>
      </nav>
      <style>{`
        @media (min-width: 769px) { .hidden-mobile { display: flex !important; } }
        @media (max-width: 768px) { .hidden-mobile { display: none !important; } }
      `}</style>
    </header>
  );
}
