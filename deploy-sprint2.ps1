# PokéDax Sprint 2 — Stripe Connect + Escrow + Bewertungssystem
$root = "C:\Users\lenovo\pokedax\pokedax\pokedax"
$enc  = New-Object System.Text.UTF8Encoding $true
Write-Host ""
Write-Host "pokEdax Sprint 2" -ForegroundColor Yellow
Write-Host "================" -ForegroundColor Yellow
Write-Host ""
Write-Host "  [1] Stripe Connect: Seller-Onboarding (KYC + Bankverbindung)" -ForegroundColor Green
Write-Host "  [2] Escrow erstellen: PaymentIntent + Gebührenberechnung" -ForegroundColor Green
Write-Host "  [3] Escrow-Status: Versand, Bestätigung, Auto-Release" -ForegroundColor Green
Write-Host "  [4] Bewertungssystem: nach Trade, Seller-Stats" -ForegroundColor Green
Write-Host "  [5] Escrow-Seite: /marketplace/escrow/[id]" -ForegroundColor Green
Write-Host "  [6] Navbar mit Hamburger-Menü (Mobile)" -ForegroundColor Green
Write-Host "  [7] Dashboard-Layout-Fix (keine alte Sidebar)" -ForegroundColor Green
Write-Host ""

$dirs = @(
  "$root\src\app\api\marketplace\seller\onboard",
  "$root\src\app\api\marketplace\escrow\create",
  "$root\src\app\api\marketplace\escrow\update",
  "$root\src\app\api\marketplace\reviews",
  "$root\src\app\api\cron\escrow-release",
  "$root\src\lib","$root\src\lib\supabase",
  "$root\src\app\auth","$root\src\app\dashboard",
  "$root\src\components\layout"
)
foreach ($d in $dirs) { if (-not (Test-Path $d)) { New-Item -ItemType Directory -Path $d -Force | Out-Null } }
cmd /c mkdir "$root\src\app\marketplace\escrow\[id]" 2>$null
Write-Host "Schreibe Dateien..." -ForegroundColor DarkGray

$nextconfig = @'
/** @type {import('next').NextConfig} */
const nextConfig = { images: { remotePatterns: [{ protocol:"https",hostname:"assets.tcgdex.net"},{ protocol:"https",hostname:"images.tcgdex.net"}] } };
module.exports = nextConfig;
'@
[System.IO.File]::WriteAllText("$root\next.config.js", $nextconfig, $enc)
Write-Host "  OK  next.config.js" -ForegroundColor Green

$supaClient = @'
import { createBrowserClient } from "@supabase/ssr";
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
'@
[System.IO.File]::WriteAllText("$root\src\lib\supabase\client.ts", $supaClient, $enc)
Write-Host "  OK  client.ts" -ForegroundColor Green

$supaServer = @'
import { createServerClient } from "@supabase/ssr";
import { createClient as createAnonClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(c) {
          try { c.forEach(({name,value,options})=>cookieStore.set(name,value,options)); } catch {}
        },
      },
    }
  );
}

export async function createRouteClient(request?: NextRequest) {
  const cookieStore = await cookies();
  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(c) {
          try { c.forEach(({name,value,options})=>cookieStore.set(name,value,options)); } catch {}
        },
      },
    }
  );
  if (request) {
    const auth = request.headers.get("Authorization");
    if (auth?.startsWith("Bearer ")) {
      const token = auth.slice(7);
      const { data: { user } } = await client.auth.getUser(token);
      if (user) {
        return createAnonClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          { global: { headers: { Authorization: `Bearer ${token}` } } }
        );
      }
    }
  }
  return client;
}

'@
[System.IO.File]::WriteAllText("$root\src\lib\supabase\server.ts", $supaServer, $enc)
Write-Host "  OK  server.ts" -ForegroundColor Green

$authlayout = @'
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{position:"relative",minHeight:"100vh",background:"#09090b",overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,pointerEvents:"none",background:"radial-gradient(ellipse 80% 50% at 15% 20%, rgba(212,168,67,0.09) 0%, transparent 60%)"}}/>
      <div style={{position:"relative",zIndex:1}}>{children}</div>
    </div>
  );
}
'@
[System.IO.File]::WriteAllText("$root\src\app\auth\layout.tsx", $authlayout, $enc)
Write-Host "  OK  layout.tsx" -ForegroundColor Green

$dashLayout = @'
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
'@
[System.IO.File]::WriteAllText("$root\src\app\dashboard\layout.tsx", $dashLayout, $enc)
Write-Host "  OK  layout.tsx" -ForegroundColor Green

$navbar = @'
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

  // Close mobile menu on route change
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

          {/* Logo */}
          <Link href="/" style={{
            fontFamily: "var(--font-display)",
            fontSize: 17, fontWeight: 300, letterSpacing: "-.04em",
            color: "#ededf2", textDecoration: "none", flexShrink: 0,
          }}>
            pokédax<span style={{ color: G }}>.</span>
          </Link>

          {/* Desktop nav */}
          <nav style={{ display: "flex", gap: 2, flex: 1, justifyContent: "center" }}
               className="desktop-nav">
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

            {/* Desktop: auth buttons / avatar */}
            <div className="desktop-auth" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {!user ? (
                <>
                  <Link href="/auth/login" style={{
                    padding: "7px 16px", borderRadius: 10,
                    fontSize: 13, color: "#a4a4b4", textDecoration: "none",
                  }}>Anmelden</Link>
                  <Link href="/dashboard/premium" style={{
                    padding: "7px 16px", borderRadius: 10, fontSize: 13,
                    background: G08, color: G, border: `0.5px solid ${G15}`,
                    textDecoration: "none",
                  }}>Premium ✦</Link>
                </>
              ) : (
                <div ref={dropRef} style={{ position: "relative" }}>
                  <button onClick={() => setDropOpen(v => !v)} style={{
                    width: 34, height: 34, borderRadius: "50%",
                    background: dropOpen ? G08 : "rgba(255,255,255,0.06)",
                    border: `0.5px solid ${dropOpen ? G15 : "rgba(255,255,255,0.1)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 500,
                    color: dropOpen ? G : "#a4a4b4",
                    cursor: "pointer", transition: "all 0.15s",
                  }}>
                    {initial}
                  </button>

                  {dropOpen && (
                    <div style={{
                      position: "absolute", top: "calc(100% + 8px)", right: 0,
                      width: 220,
                      background: "#111114",
                      border: "0.5px solid rgba(255,255,255,0.085)",
                      borderRadius: 14,
                      boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
                      overflow: "hidden",
                      animation: "dropIn 0.15s ease-out",
                      zIndex: 200,
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

            {/* Hamburger button — mobile only */}
            <button
              onClick={() => setMobOpen(v => !v)}
              className="hamburger-btn"
              aria-label="Menü"
              style={{
                width: 36, height: 36, borderRadius: 10,
                background: mobOpen ? G08 : "transparent",
                border: `0.5px solid ${mobOpen ? G15 : "rgba(255,255,255,0.08)"}`,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 5,
                cursor: "pointer", transition: "all 0.2s", flexShrink: 0,
              }}>
              <span style={{
                display: "block", width: 16, height: 1.5,
                background: mobOpen ? G : "#a4a4b4",
                borderRadius: 2,
                transition: "all 0.25s",
                transform: mobOpen ? "translateY(3px) rotate(45deg)" : "none",
              }}/>
              <span style={{
                display: "block", width: 16, height: 1.5,
                background: mobOpen ? G : "#a4a4b4",
                borderRadius: 2,
                transition: "all 0.25s",
                opacity: mobOpen ? 0 : 1,
              }}/>
              <span style={{
                display: "block", width: 16, height: 1.5,
                background: mobOpen ? G : "#a4a4b4",
                borderRadius: 2,
                transition: "all 0.25s",
                transform: mobOpen ? "translateY(-5px) rotate(-45deg)" : "none",
              }}/>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobOpen && (
          <div style={{
            borderTop: "0.5px solid rgba(255,255,255,0.06)",
            padding: "12px 16px 20px",
            display: "flex", flexDirection: "column", gap: 2,
            animation: "slideDown 0.2s ease-out",
          }}>
            {/* Main nav links */}
            {NAV_LINKS.map(({ href, label }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link key={href} href={href} style={{
                  padding: "11px 14px", borderRadius: 10, fontSize: 15,
                  color: active ? "#ededf2" : "#a4a4b4",
                  background: active ? "rgba(255,255,255,0.06)" : "transparent",
                  textDecoration: "none", fontWeight: active ? 500 : 400,
                }}>
                  {label}
                </Link>
              );
            })}

            <div style={{ height: 0.5, background: "rgba(255,255,255,0.06)", margin: "8px 0" }}/>

            {/* Dropdown links */}
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
                <Link href={`/profil/${username}`} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 14px", borderRadius: 10, fontSize: 14,
                  color: G, textDecoration: "none",
                }}>
                  <span style={{ fontSize: 13, color: "#62626f", width: 16, textAlign: "center" }}>◉</span>
                  @{username}
                </Link>
                <button onClick={signOut} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 14px", borderRadius: 10, fontSize: 14,
                  color: "#dc4a5a", background: "transparent", border: "none",
                  cursor: "pointer", width: "100%", textAlign: "left",
                }}>
                  <span style={{ fontSize: 13, color: "#62626f", width: 16, textAlign: "center" }}>×</span>
                  Abmelden
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" style={{
                  padding: "11px 14px", borderRadius: 10, fontSize: 15,
                  color: "#a4a4b4", textDecoration: "none",
                }}>Anmelden</Link>
                <Link href="/dashboard/premium" style={{
                  padding: "11px 14px", borderRadius: 10, fontSize: 15,
                  color: G, background: G08, border: `0.5px solid ${G15}`,
                  textDecoration: "none", textAlign: "center", fontWeight: 500,
                }}>Premium werden ✦</Link>
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

'@
[System.IO.File]::WriteAllText("$root\src\components\layout\Navbar.tsx", $navbar, $enc)
Write-Host "  OK  Navbar.tsx" -ForegroundColor Green

$sellerOnboard = @'
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createRouteClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

// POST /api/marketplace/seller/onboard
// Creates or retrieves Stripe Connect Express account for seller
export async function POST(request: NextRequest) {
  const supabase = await createRouteClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  // Check premium
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_premium, stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (!profile?.is_premium) {
    return NextResponse.json({ error: "Premium erforderlich" }, { status: 403 });
  }

  // Check if seller already has Connect account
  const { data: stats } = await supabase
    .from("seller_stats")
    .select("stripe_account_id")
    .eq("user_id", user.id)
    .single();

  let accountId = stats?.stripe_account_id;

  if (!accountId) {
    // Create new Express account
    const account = await stripe.accounts.create({
      type: "express",
      country: "DE",
      email: user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: "individual",
      settings: {
        payouts: { schedule: { interval: "weekly", weekly_anchor: "monday" } },
      },
    });
    accountId = account.id;

    // Save to seller_stats
    await supabase.from("seller_stats").upsert({
      user_id: user.id,
      stripe_account_id: accountId,
      is_verified: false,
    });
  }

  // Create onboarding link
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://pokedax.de";
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${appUrl}/dashboard?onboard=refresh`,
    return_url:  `${appUrl}/dashboard?onboard=success`,
    type: "account_onboarding",
  });

  return NextResponse.json({ url: accountLink.url });
}

// GET /api/marketplace/seller/onboard — check onboarding status
export async function GET(request: NextRequest) {
  const supabase = await createRouteClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ready: false });

  const { data: stats } = await supabase
    .from("seller_stats")
    .select("stripe_account_id, is_verified")
    .eq("user_id", user.id)
    .single();

  if (!stats?.stripe_account_id) return NextResponse.json({ ready: false, needs_onboard: true });

  try {
    const account = await stripe.accounts.retrieve(stats.stripe_account_id);
    const ready = account.charges_enabled && account.payouts_enabled;

    if (ready && !stats.is_verified) {
      await supabase.from("seller_stats")
        .update({ is_verified: true })
        .eq("user_id", user.id);
    }

    return NextResponse.json({
      ready,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      account_id: stats.stripe_account_id,
    });
  } catch {
    return NextResponse.json({ ready: false, error: "Account nicht gefunden" });
  }
}

'@
[System.IO.File]::WriteAllText("$root\src\app\api\marketplace\seller\onboard\route.ts", $sellerOnboard, $enc)
Write-Host "  OK  route.ts" -ForegroundColor Green

$escrowCreate = @'
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createRouteClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

const LAUNCH_END = new Date("2026-07-01");

function calcFees(price: number, isPremium: boolean) {
  const isLaunch = new Date() < LAUNCH_END;
  const escrowFee   = Math.round(price * 0.01 * 100) / 100;
  const provisionRate = (!isLaunch && price > 5) ? (isPremium ? 0.03 : 0.05) : 0;
  const platformFee  = Math.round(price * provisionRate * 100) / 100;
  const sellerPayout = Math.round((price - platformFee) * 100) / 100;
  const buyerTotal   = Math.round((price + escrowFee) * 100) / 100;
  return { escrowFee, platformFee, sellerPayout, buyerTotal, provisionRate, isLaunch };
}

// POST /api/marketplace/escrow/create
export async function POST(request: NextRequest) {
  const supabase = await createRouteClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const { listing_id, offered_price } = await request.json();
  if (!listing_id || !offered_price) {
    return NextResponse.json({ error: "listing_id und offered_price erforderlich" }, { status: 400 });
  }

  // Load listing + seller data
  const { data: listing } = await supabase
    .from("marketplace_listings")
    .select(`
      id, card_id, price, seller_id, status,
      seller_stats!marketplace_listings_seller_id_fkey(stripe_account_id, is_verified)
    `)
    .eq("id", listing_id)
    .single();

  if (!listing) return NextResponse.json({ error: "Inserat nicht gefunden" }, { status: 404 });
  if (listing.status !== "active") return NextResponse.json({ error: "Inserat nicht mehr verfügbar" }, { status: 400 });
  if (listing.seller_id === user.id) return NextResponse.json({ error: "Eigenes Inserat" }, { status: 400 });

  const sellerStats = (listing as any).seller_stats;
  if (!sellerStats?.stripe_account_id || !sellerStats?.is_verified) {
    return NextResponse.json({ error: "Seller nicht verifiziert" }, { status: 400 });
  }

  // Buyer premium check
  const { data: buyerProfile } = await supabase
    .from("profiles")
    .select("is_premium")
    .eq("id", user.id)
    .single();

  const fees = calcFees(offered_price, buyerProfile?.is_premium ?? false);

  // Create Stripe PaymentIntent with Connect
  const pi = await stripe.paymentIntents.create({
    amount: Math.round(fees.buyerTotal * 100),
    currency: "eur",
    application_fee_amount: Math.round((fees.platformFee + fees.escrowFee) * 100),
    transfer_data: { destination: sellerStats.stripe_account_id },
    capture_method: "automatic",
    metadata: {
      listing_id,
      buyer_id: user.id,
      seller_id: listing.seller_id,
    },
  });

  // Create escrow record
  const autoRelease = new Date();
  autoRelease.setDate(autoRelease.getDate() + 14);

  const { data: escrow } = await supabase
    .from("escrow_transactions")
    .insert({
      buyer_id:       user.id,
      seller_id:      listing.seller_id,
      gross_amount:   fees.buyerTotal,
      seller_payout:  fees.sellerPayout,
      platform_fee:   fees.platformFee,
      escrow_fee:     fees.escrowFee,
      stripe_pi_id:   pi.id,
      status:         "pending",
      auto_release_at: autoRelease.toISOString(),
    })
    .select()
    .single();

  // Reserve listing
  await supabase
    .from("marketplace_listings")
    .update({ status: "reserved" })
    .eq("id", listing_id);

  return NextResponse.json({
    client_secret: pi.client_secret,
    escrow_id: escrow?.id,
    fees,
  });
}

'@
[System.IO.File]::WriteAllText("$root\src\app\api\marketplace\escrow\create\route.ts", $escrowCreate, $enc)
Write-Host "  OK  route.ts" -ForegroundColor Green

$escrowUpdate = @'
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createRouteClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

// POST /api/marketplace/escrow/update
// Actions: ship, confirm, dispute
export async function POST(request: NextRequest) {
  const supabase = await createRouteClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const { escrow_id, action, tracking_number, dispute_reason } = await request.json();

  const { data: escrow } = await supabase
    .from("escrow_transactions")
    .select("*")
    .eq("id", escrow_id)
    .single();

  if (!escrow) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });

  switch (action) {
    case "ship": {
      if (escrow.seller_id !== user.id) return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
      if (escrow.status !== "paid") return NextResponse.json({ error: "Zahlung nicht eingegangen" }, { status: 400 });
      await supabase.from("escrow_transactions").update({
        status: "shipped",
        shipped_at: new Date().toISOString(),
        tracking_number: tracking_number ?? null,
      }).eq("id", escrow_id);
      return NextResponse.json({ ok: true, status: "shipped" });
    }

    case "confirm": {
      if (escrow.buyer_id !== user.id) return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
      if (escrow.status !== "shipped") return NextResponse.json({ error: "Noch nicht versendet" }, { status: 400 });
      await releaseEscrow(supabase, escrow);
      return NextResponse.json({ ok: true, status: "released" });
    }

    case "dispute": {
      if (escrow.buyer_id !== user.id) return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
      await supabase.from("escrow_transactions").update({
        status: "disputed",
        dispute_reason: dispute_reason ?? "Kein Grund angegeben",
      }).eq("id", escrow_id);
      return NextResponse.json({ ok: true, status: "disputed" });
    }

    default:
      return NextResponse.json({ error: "Unbekannte Aktion" }, { status: 400 });
  }
}

async function releaseEscrow(supabase: any, escrow: any) {
  // Transfer funds to seller via Stripe
  try {
    await stripe.transfers.create({
      amount: Math.round(escrow.seller_payout * 100),
      currency: "eur",
      destination: escrow.stripe_seller_account ?? "",
      transfer_group: escrow.id,
    });
  } catch (e) {
    console.error("Stripe transfer error:", e);
  }

  await supabase.from("escrow_transactions").update({
    status: "released",
    received_at: new Date().toISOString(),
    released_at: new Date().toISOString(),
  }).eq("id", escrow.id);

  // Update seller stats
  await supabase.rpc("update_seller_stats", {
    p_seller_id: escrow.seller_id,
    p_amount: escrow.seller_payout,
  }).catch(() => {});

  // Fallback: manual update
  const { data: stats } = await supabase
    .from("seller_stats")
    .select("total_sales, total_volume")
    .eq("user_id", escrow.seller_id)
    .single();

  if (stats) {
    await supabase.from("seller_stats").update({
      total_sales:  (stats.total_sales ?? 0) + 1,
      total_volume: (stats.total_volume ?? 0) + escrow.seller_payout,
    }).eq("user_id", escrow.seller_id);
  }

  // Log transaction
  await supabase.from("marketplace_transactions").insert({
    escrow_id: escrow.id,
    event_type: "funds_released",
    amount: escrow.seller_payout,
  });
}

'@
[System.IO.File]::WriteAllText("$root\src\app\api\marketplace\escrow\update\route.ts", $escrowUpdate, $enc)
Write-Host "  OK  route.ts" -ForegroundColor Green

$cronEscrow = @'
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/cron/escrow-release — runs every 4 hours
export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: overdue } = await supabase
    .from("escrow_transactions")
    .select("*")
    .eq("status", "shipped")
    .lt("auto_release_at", new Date().toISOString())
    .limit(20);

  let released = 0;
  for (const escrow of overdue ?? []) {
    try {
      await supabase.from("escrow_transactions").update({
        status: "released",
        released_at: new Date().toISOString(),
      }).eq("id", escrow.id);

      await supabase.from("seller_stats").update({
        total_sales:  (escrow as any).total_sales ?? 0 + 1,
        total_volume: (escrow as any).total_volume ?? 0 + escrow.seller_payout,
      }).eq("user_id", escrow.seller_id);

      await supabase.from("marketplace_transactions").insert({
        escrow_id: escrow.id,
        event_type: "auto_released",
        amount: escrow.seller_payout,
      });
      released++;
    } catch (e) { console.error(e); }
  }

  return NextResponse.json({ released, checked: overdue?.length ?? 0 });
}

'@
[System.IO.File]::WriteAllText("$root\src\app\api\cron\escrow-release\route.ts", $cronEscrow, $enc)
Write-Host "  OK  route.ts" -ForegroundColor Green

$reviewsApi = @'
import { NextRequest, NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/server";

// POST /api/marketplace/reviews
export async function POST(request: NextRequest) {
  const supabase = await createRouteClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const { escrow_id, rating, comment } = await request.json();

  if (!escrow_id || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Ungültige Daten" }, { status: 400 });
  }

  const { data: escrow } = await supabase
    .from("escrow_transactions")
    .select("buyer_id, seller_id, status")
    .eq("id", escrow_id)
    .single();

  if (!escrow) return NextResponse.json({ error: "Transaktion nicht gefunden" }, { status: 404 });
  if (escrow.status !== "released") return NextResponse.json({ error: "Transaktion noch nicht abgeschlossen" }, { status: 400 });

  const isBuyer  = escrow.buyer_id  === user.id;
  const isSeller = escrow.seller_id === user.id;
  if (!isBuyer && !isSeller) return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });

  const reviewed_id = isBuyer ? escrow.seller_id : escrow.buyer_id;

  const { data, error } = await supabase
    .from("marketplace_reviews")
    .insert({
      escrow_id,
      reviewer_id: user.id,
      reviewed_id,
      role: isBuyer ? "buyer" : "seller",
      rating,
      comment: comment?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "Bereits bewertet" }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Update avg_rating in seller_stats for the reviewed user
  const { data: allReviews } = await supabase
    .from("marketplace_reviews")
    .select("rating")
    .eq("reviewed_id", reviewed_id);

  if (allReviews?.length) {
    const avg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
    await supabase.from("seller_stats").upsert({
      user_id: reviewed_id,
      avg_rating: Math.round(avg * 100) / 100,
      rating_count: allReviews.length,
    });
  }

  return NextResponse.json({ review: data });
}

// GET /api/marketplace/reviews?user_id=xxx
export async function GET(request: NextRequest) {
  const supabase = await createRouteClient(request);
  const user_id = new URL(request.url).searchParams.get("user_id");
  if (!user_id) return NextResponse.json({ reviews: [] });

  const { data } = await supabase
    .from("marketplace_reviews")
    .select(`
      id, rating, comment, role, created_at,
      profiles!marketplace_reviews_reviewer_id_fkey(username)
    `)
    .eq("reviewed_id", user_id)
    .order("created_at", { ascending: false })
    .limit(20);

  const normalized = (data ?? []).map((r: any) => ({
    ...r,
    profiles: Array.isArray(r.profiles) ? r.profiles[0] : r.profiles,
  }));

  return NextResponse.json({ reviews: normalized });
}

'@
[System.IO.File]::WriteAllText("$root\src\app\api\marketplace\reviews\route.ts", $reviewsApi, $enc)
Write-Host "  OK  route.ts" -ForegroundColor Green

$pageEscrow = @'
"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const G="#D4A843",G18="rgba(212,168,67,0.18)",G08="rgba(212,168,67,0.08)";
const BG1="#111114",BG2="#18181c",BR1="rgba(255,255,255,0.045)",BR2="rgba(255,255,255,0.085)";
const TX1="#ededf2",TX2="#a4a4b4",TX3="#62626f",GREEN="#3db87a",RED="#dc4a5a",AMBER="#f59e0b";

const STATUS_META: Record<string,{label:string;color:string;desc:string}> = {
  pending:  {label:"Zahlung ausstehend", color:AMBER, desc:"Warte auf Zahlungseingang"},
  paid:     {label:"Bezahlt",            color:GREEN, desc:"Zahlung eingegangen · Seller kann versenden"},
  shipped:  {label:"Versendet",          color:"#60A5FA", desc:"Paket unterwegs · Bitte Erhalt bestätigen"},
  received: {label:"Erhalten",           color:GREEN, desc:"Käufer hat Erhalt bestätigt"},
  released: {label:"Abgeschlossen",      color:GREEN, desc:"Geld wurde an Seller überwiesen"},
  disputed: {label:"Streitfall",         color:RED,   desc:"Admin wird sich melden"},
};

function Step({n,label,active,done}:{n:number;label:string;active:boolean;done:boolean}) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      <div style={{
        width:28,height:28,borderRadius:"50%",flexShrink:0,
        background:done?GREEN:active?G:"rgba(255,255,255,0.04)",
        border:`0.5px solid ${done?GREEN:active?G:BR2}`,
        display:"flex",alignItems:"center",justifyContent:"center",
        fontSize:11,fontWeight:500,
        color:done||active?"#0a0808":TX3,
        transition:"all .3s",
      }}>{done?"✓":n}</div>
      <span style={{fontSize:13,color:done||active?TX1:TX3,transition:"color .3s"}}>{label}</span>
    </div>
  );
}

export default function EscrowPage() {
  const { id } = useParams() as { id: string };
  const [escrow,  setEscrow]  = useState<any>(null);
  const [user,    setUser]    = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [action,  setAction]  = useState(false);
  const [tracking,setTracking]= useState("");
  const [dispute, setDispute] = useState("");
  const [showDisp,setShowDisp]= useState(false);
  const [review,  setReview]  = useState<{rating:number;comment:string}|null>(null);
  const [rated,   setRated]   = useState(false);
  const [msg,     setMsg]     = useState("");

  useEffect(()=>{
    const sb = createClient();
    sb.auth.getSession().then(({data:{session}})=>{
      setUser(session?.user ?? null);
      if (!session?.user) return;
      load(sb, id);
    });
  },[id]);

  async function load(sb: any, escrow_id: string) {
    const { data } = await sb
      .from("escrow_transactions")
      .select(`
        *,
        buyer:profiles!escrow_transactions_buyer_id_fkey(username,avatar_url),
        seller:profiles!escrow_transactions_seller_id_fkey(username,avatar_url),
        marketplace_listings(price,condition,
          cards!marketplace_listings_card_id_fkey(id,name,name_de,set_id,number,image_url))
      `)
      .eq("id", escrow_id)
      .single();
    if (data) {
      setEscrow({
        ...data,
        buyer:  Array.isArray(data.buyer)  ? data.buyer[0]  : data.buyer,
        seller: Array.isArray(data.seller) ? data.seller[0] : data.seller,
      });
    }
    setLoading(false);
  }

  async function doAction(act: string) {
    setAction(true);
    setMsg("");
    const sb = createClient();
    const {data:{session}} = await sb.auth.getSession();
    const h: Record<string,string> = {"Content-Type":"application/json"};
    if (session?.access_token) h["Authorization"]=`Bearer ${session.access_token}`;
    const res = await fetch("/api/marketplace/escrow/update", {
      method:"POST", headers:h,
      body: JSON.stringify({
        escrow_id: id, action: act,
        tracking_number: act==="ship"?tracking:undefined,
        dispute_reason:  act==="dispute"?dispute:undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) { setMsg(data.error ?? "Fehler."); }
    else {
      setEscrow((prev: any) => ({...prev, status: data.status}));
      setMsg(act==="confirm"?"✓ Erhalt bestätigt — Zahlung freigegeben!":
             act==="ship"?"✓ Versand eingetragen!":
             "Streitfall gemeldet. Wir melden uns.");
    }
    setAction(false);
  }

  async function submitReview() {
    if (!review || review.rating < 1) return;
    const sb = createClient();
    const {data:{session}} = await sb.auth.getSession();
    const h: Record<string,string> = {"Content-Type":"application/json"};
    if (session?.access_token) h["Authorization"]=`Bearer ${session.access_token}`;
    const res = await fetch("/api/marketplace/reviews", {
      method:"POST", headers:h,
      body: JSON.stringify({escrow_id: id, ...review}),
    });
    if (res.ok) setRated(true);
    else setMsg("Bewertung konnte nicht gespeichert werden.");
  }

  if (loading) return (
    <div style={{color:TX1,minHeight:"80vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{fontSize:13,color:TX3}}>Lädt…</div>
    </div>
  );
  if (!escrow) return (
    <div style={{color:TX1,minHeight:"80vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:14,color:TX3,marginBottom:12}}>Transaktion nicht gefunden.</div>
        <Link href="/dashboard" style={{color:G,textDecoration:"none",fontSize:13}}>← Dashboard</Link>
      </div>
    </div>
  );

  const isBuyer  = user?.id === escrow.buyer_id;
  const isSeller = user?.id === escrow.seller_id;
  const meta     = STATUS_META[escrow.status] ?? STATUS_META.pending;
  const card     = escrow.marketplace_listings?.cards;
  const steps    = ["pending","paid","shipped","released"];
  const stepIdx  = steps.indexOf(escrow.status);

  return (
    <div style={{color:TX1,minHeight:"80vh"}}>
      <div style={{maxWidth:720,margin:"0 auto",padding:"clamp(52px,7vw,80px) clamp(16px,3vw,28px)"}}>

        <Link href="/dashboard" style={{fontSize:12,color:TX3,textDecoration:"none",display:"inline-flex",alignItems:"center",gap:6,marginBottom:28}}>← Dashboard</Link>

        {/* Header */}
        <div style={{marginBottom:28}}>
          <div style={{fontSize:9,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:TX3,marginBottom:12}}>Transaktion · {id.slice(0,8).toUpperCase()}</div>
          <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(22px,4vw,38px)",fontWeight:200,letterSpacing:"-.04em",marginBottom:8}}>
            Escrow-Status
          </h1>
          <div style={{display:"inline-flex",alignItems:"center",gap:6,padding:"4px 12px",borderRadius:8,background:`${meta.color}12`,border:`0.5px solid ${meta.color}25`}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:meta.color}}/>
            <span style={{fontSize:12,fontWeight:500,color:meta.color}}>{meta.label}</span>
          </div>
        </div>

        {/* Card info */}
        {card && (
          <div style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:16,padding:"14px 16px",marginBottom:14,display:"flex",gap:12,alignItems:"center"}}>
            <div style={{width:44,height:60,borderRadius:7,background:BG2,overflow:"hidden",flexShrink:0}}>
              {card.image_url&&<img src={card.image_url} alt="" style={{width:"100%",height:"100%",objectFit:"contain"}}/>}
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:14,color:TX1,marginBottom:3}}>{card.name_de||card.name}</div>
              <div style={{fontSize:11,color:TX3}}>{card.set_id?.toUpperCase()} · {escrow.marketplace_listings?.condition}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:11,color:TX3,marginBottom:2}}>Kaufpreis</div>
              <div style={{fontSize:18,fontFamily:"var(--font-mono)",fontWeight:300,color:G}}>
                {escrow.gross_amount?.toLocaleString("de-DE",{minimumFractionDigits:2})} €
              </div>
            </div>
          </div>
        )}

        {/* Steps */}
        <div style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:16,padding:"18px",marginBottom:14}}>
          <div style={{fontSize:10,fontWeight:600,letterSpacing:".08em",textTransform:"uppercase",color:TX3,marginBottom:14}}>Ablauf</div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <Step n={1} label="Zahlung eingegangen"   done={stepIdx>=1} active={stepIdx===0}/>
            <Step n={2} label="Karte versendet"       done={stepIdx>=2} active={stepIdx===1}/>
            <Step n={3} label="Erhalt bestätigt"      done={stepIdx>=3} active={stepIdx===2}/>
            <Step n={4} label="Auszahlung erfolgt"    done={stepIdx>=3} active={false}/>
          </div>
          {escrow.tracking_number && (
            <div style={{marginTop:12,padding:"8px 12px",borderRadius:8,background:BG2,fontSize:11,color:TX3}}>
              Tracking: <span style={{color:TX1,fontFamily:"var(--font-mono)"}}>{escrow.tracking_number}</span>
            </div>
          )}
          {escrow.auto_release_at && escrow.status==="shipped" && (
            <div style={{marginTop:8,fontSize:11,color:TX3}}>
              Auto-Freigabe: {new Date(escrow.auto_release_at).toLocaleDateString("de-DE")}
            </div>
          )}
        </div>

        {/* Fee breakdown */}
        <div style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:16,overflow:"hidden",marginBottom:14}}>
          <div style={{padding:"11px 16px",borderBottom:`0.5px solid ${BR1}`,fontSize:10,fontWeight:600,letterSpacing:".08em",textTransform:"uppercase",color:TX3}}>Gebühren</div>
          {[
            {l:"Kaufpreis",          v:`${escrow.marketplace_listings?.price?.toLocaleString("de-DE",{minimumFractionDigits:2})} €`},
            {l:"Escrow-Gebühr (1%)", v:`${escrow.escrow_fee?.toLocaleString("de-DE",{minimumFractionDigits:2})} €`},
            {l:"Käufer zahlt",       v:`${escrow.gross_amount?.toLocaleString("de-DE",{minimumFractionDigits:2})} €`, bold:true},
            {l:"Plattform-Provision",v:`${escrow.platform_fee?.toLocaleString("de-DE",{minimumFractionDigits:2})} €`},
            {l:"Seller erhält",      v:`${escrow.seller_payout?.toLocaleString("de-DE",{minimumFractionDigits:2})} €`, bold:true, gold:true},
          ].map(({l,v,bold,gold})=>(
            <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"10px 16px",borderBottom:`0.5px solid ${BR1}`}}>
              <span style={{fontSize:12,color:TX3}}>{l}</span>
              <span style={{fontSize:12,fontFamily:"var(--font-mono)",fontWeight:bold?500:300,color:gold?G:TX1}}>{v}</span>
            </div>
          ))}
        </div>

        {/* Parties */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          {[
            {label:"Käufer", profile:escrow.buyer,  isMe:isBuyer},
            {label:"Seller", profile:escrow.seller, isMe:isSeller},
          ].map(({label,profile,isMe})=>(
            <div key={label} style={{background:BG1,border:`0.5px solid ${isMe?G18:BR2}`,borderRadius:12,padding:"12px 14px"}}>
              <div style={{fontSize:9,color:TX3,marginBottom:6,textTransform:"uppercase",letterSpacing:".06em"}}>{label}{isMe?" (Du)":""}</div>
              <div style={{fontSize:13,color:TX1}}>@{profile?.username??"-"}</div>
            </div>
          ))}
        </div>

        {/* Actions */}
        {msg && (
          <div style={{padding:"10px 14px",borderRadius:10,marginBottom:12,
            background:msg.startsWith("✓")?"rgba(61,184,122,0.08)":"rgba(220,74,90,0.08)",
            border:`0.5px solid ${msg.startsWith("✓")?"rgba(61,184,122,0.2)":"rgba(220,74,90,0.2)"}`,
            fontSize:12,color:msg.startsWith("✓")?GREEN:RED}}>
            {msg}
          </div>
        )}

        {/* Seller: ship */}
        {isSeller && escrow.status==="paid" && (
          <div style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:16,padding:"16px",marginBottom:10}}>
            <div style={{fontSize:12,fontWeight:500,color:TX1,marginBottom:10}}>Versand eintragen</div>
            <input value={tracking} onChange={e=>setTracking(e.target.value)}
              placeholder="Tracking-Nummer (optional)"
              style={{width:"100%",padding:"9px 12px",borderRadius:9,background:"rgba(0,0,0,0.3)",
                border:`0.5px solid ${BR2}`,color:TX1,fontSize:12,outline:"none",marginBottom:10}}/>
            <button onClick={()=>doAction("ship")} disabled={action} style={{
              width:"100%",padding:"11px",borderRadius:10,background:G,color:"#0a0808",
              border:"none",cursor:"pointer",fontSize:13,fontWeight:400,
            }}>{action?"Speichert…":"Versand bestätigen ✓"}</button>
          </div>
        )}

        {/* Buyer: confirm */}
        {isBuyer && escrow.status==="shipped" && (
          <div style={{background:BG1,border:`0.5px solid ${G18}`,borderRadius:16,padding:"16px",marginBottom:10,position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:0.5,background:`linear-gradient(90deg,transparent,${G},transparent)`}}/>
            <div style={{fontSize:12,fontWeight:500,color:TX1,marginBottom:6}}>Karte erhalten?</div>
            <div style={{fontSize:11,color:TX3,marginBottom:12}}>Nach Bestätigung wird die Zahlung sofort an den Seller freigegeben.</div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>doAction("confirm")} disabled={action} style={{
                flex:1,padding:"11px",borderRadius:10,background:G,color:"#0a0808",
                border:"none",cursor:"pointer",fontSize:13,fontWeight:400,
              }}>{action?"Lädt…":"Erhalt bestätigen → Zahlung freigeben"}</button>
              <button onClick={()=>setShowDisp(v=>!v)} style={{
                padding:"11px 14px",borderRadius:10,background:"transparent",
                color:RED,border:`0.5px solid rgba(220,74,90,0.2)`,cursor:"pointer",fontSize:12,
              }}>Problem</button>
            </div>
            {showDisp && (
              <div style={{marginTop:10}}>
                <textarea value={dispute} onChange={e=>setDispute(e.target.value)}
                  placeholder="Was ist das Problem?" rows={3}
                  style={{width:"100%",padding:"9px 12px",borderRadius:9,background:"rgba(0,0,0,0.3)",
                    border:`0.5px solid rgba(220,74,90,0.2)`,color:TX1,fontSize:12,outline:"none",resize:"none",marginBottom:8}}/>
                <button onClick={()=>doAction("dispute")} disabled={action||!dispute} style={{
                  width:"100%",padding:"9px",borderRadius:9,background:"rgba(220,74,90,0.1)",
                  color:RED,border:`0.5px solid rgba(220,74,90,0.2)`,cursor:"pointer",fontSize:12,
                }}>Streitfall melden</button>
              </div>
            )}
          </div>
        )}

        {/* Review */}
        {escrow.status==="released" && !rated && (
          <div style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:16,padding:"16px"}}>
            <div style={{fontSize:12,fontWeight:500,color:TX1,marginBottom:12}}>
              {isBuyer?"Seller bewerten":"Käufer bewerten"}
            </div>
            {/* Stars */}
            <div style={{display:"flex",gap:6,marginBottom:12}}>
              {[1,2,3,4,5].map(n=>(
                <button key={n} onClick={()=>setReview(r=>({...(r??{comment:""}),rating:n}))} style={{
                  fontSize:22,background:"transparent",border:"none",cursor:"pointer",
                  color:(review?.rating??0)>=n?G:TX3,transition:"color .15s",padding:0,
                }}>✦</button>
              ))}
            </div>
            <textarea value={review?.comment??""} onChange={e=>setReview(r=>({...(r??{rating:0}),comment:e.target.value}))}
              placeholder="Kommentar (optional)" rows={2}
              style={{width:"100%",padding:"9px 12px",borderRadius:9,background:"rgba(0,0,0,0.3)",
                border:`0.5px solid ${BR2}`,color:TX1,fontSize:12,outline:"none",resize:"none",marginBottom:10}}/>
            <button onClick={submitReview} disabled={!review?.rating} style={{
              width:"100%",padding:"10px",borderRadius:10,
              background:review?.rating?G:"rgba(255,255,255,0.04)",
              color:review?.rating?"#0a0808":TX3,
              border:"none",cursor:review?.rating?"pointer":"default",fontSize:13,
            }}>Bewertung abgeben</button>
          </div>
        )}
        {rated && (
          <div style={{textAlign:"center",padding:"16px",fontSize:13,color:GREEN}}>✦ Bewertung gespeichert. Danke!</div>
        )}
      </div>
    </div>
  );
}

'@
[System.IO.File]::WriteAllText("$root\src\app\marketplace\escrow\[id]\page.tsx", $pageEscrow, $enc)
Write-Host "  OK  page.tsx" -ForegroundColor Green

$sqlContent = @'
-- Sprint 2: Escrow + Reviews + Seller Stats
-- Run in Supabase SQL Editor

-- Seller Stats
CREATE TABLE IF NOT EXISTS seller_stats (
  user_id          UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  total_sales      INT         DEFAULT 0,
  total_volume     NUMERIC(12,2) DEFAULT 0,
  avg_rating       NUMERIC(3,2) DEFAULT 0,
  rating_count     INT         DEFAULT 0,
  response_rate    NUMERIC(5,2) DEFAULT 100,
  avg_ship_days    NUMERIC(4,1),
  is_verified      BOOLEAN     DEFAULT FALSE,
  stripe_account_id TEXT
);
ALTER TABLE seller_stats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "seller_stats_public"   ON seller_stats;
DROP POLICY IF EXISTS "seller_stats_own"      ON seller_stats;
CREATE POLICY "seller_stats_public" ON seller_stats FOR SELECT USING (true);
CREATE POLICY "seller_stats_own"    ON seller_stats FOR ALL   USING (auth.uid() = user_id);

-- Add seller_id to marketplace_listings if missing
ALTER TABLE marketplace_listings 
  ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES profiles(id);

-- Escrow Transactions
CREATE TABLE IF NOT EXISTS escrow_transactions (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id         UUID REFERENCES profiles(id),
  seller_id        UUID REFERENCES profiles(id),
  gross_amount     NUMERIC(10,2),
  seller_payout    NUMERIC(10,2),
  platform_fee     NUMERIC(10,2),
  escrow_fee       NUMERIC(10,2),
  stripe_pi_id     TEXT,
  stripe_transfer_id TEXT,
  status           TEXT DEFAULT 'pending'
                   CHECK (status IN ('pending','paid','shipped','received','released','disputed','refunded')),
  shipped_at       TIMESTAMPTZ,
  received_at      TIMESTAMPTZ,
  released_at      TIMESTAMPTZ,
  auto_release_at  TIMESTAMPTZ,
  tracking_number  TEXT,
  dispute_reason   TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE escrow_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "escrow_parties" ON escrow_transactions;
CREATE POLICY "escrow_parties" ON escrow_transactions
  FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Reviews
CREATE TABLE IF NOT EXISTS marketplace_reviews (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  escrow_id    UUID REFERENCES escrow_transactions(id),
  reviewer_id  UUID REFERENCES profiles(id),
  reviewed_id  UUID REFERENCES profiles(id),
  role         TEXT CHECK (role IN ('buyer','seller')),
  rating       INT  CHECK (rating BETWEEN 1 AND 5),
  comment      TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(escrow_id, reviewer_id)
);
ALTER TABLE marketplace_reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "reviews_public"    ON marketplace_reviews;
DROP POLICY IF EXISTS "reviews_own_write" ON marketplace_reviews;
CREATE POLICY "reviews_public"    ON marketplace_reviews FOR SELECT USING (true);
CREATE POLICY "reviews_own_write" ON marketplace_reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);

-- Marketplace Transactions Log
CREATE TABLE IF NOT EXISTS marketplace_transactions (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  escrow_id       UUID REFERENCES escrow_transactions(id),
  event_type      TEXT,
  amount          NUMERIC(10,2),
  stripe_event_id TEXT,
  metadata        JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_escrow_buyer   ON escrow_transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_escrow_seller  ON escrow_transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_escrow_status  ON escrow_transactions(status);
CREATE INDEX IF NOT EXISTS idx_escrow_release ON escrow_transactions(auto_release_at)
  WHERE status = 'shipped';
CREATE INDEX IF NOT EXISTS idx_reviews_reviewed ON marketplace_reviews(reviewed_id);

'@

Write-Host ""
Write-Host "================" -ForegroundColor Yellow
Write-Host "Sprint 2 Dateien geschrieben!" -ForegroundColor Yellow
Write-Host "================" -ForegroundColor Yellow
Write-Host ""
Write-Host "PFLICHT: SQL in Supabase ausfuehren:" -ForegroundColor Red
Write-Host "  Supabase Dashboard -> SQL Editor -> sprint2.sql Inhalt einfuegen" -ForegroundColor White
Write-Host ""
Write-Host "SQL-Inhalt:" -ForegroundColor Yellow
Write-Host $sqlContent -ForegroundColor DarkGray
Write-Host ""
Write-Host "Neue Env Vars in Vercel (falls noch nicht gesetzt):" -ForegroundColor Red
Write-Host "  STRIPE_SECRET_KEY      = sk_live_..." -ForegroundColor White
Write-Host "  NEXT_PUBLIC_APP_URL    = https://pokedax.de" -ForegroundColor White
Write-Host "  CRON_SECRET            = (dein geheimes Passwort)" -ForegroundColor White
Write-Host ""
Write-Host "GitHub Desktop -> Commit 'Sprint 2: Escrow + Stripe Connect + Reviews' -> Push" -ForegroundColor Yellow
