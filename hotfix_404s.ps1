# Hotfix: matches 404 + profil 404
$root = "C:\Users\lenovo\pokedax\pokedax\pokedax"
$enc  = New-Object System.Text.UTF8Encoding $true

# Create directories - brackets need special handling
New-Item -ItemType Directory -Path "$root\src\app\matches" -Force | Out-Null
New-Item -ItemType Directory -Path "$root\src\app\profil" -Force | Out-Null

# [username] folder - use .NET directly to avoid PowerShell bracket issue
[System.IO.Directory]::CreateDirectory("$root\src\app\profil\[username]") | Out-Null

Write-Host "Ordner erstellt" -ForegroundColor DarkGray


$matchesPage = @'
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const G="#D4A843",G18="rgba(212,168,67,0.18)",G08="rgba(212,168,67,0.08)";
const BG1="#111114",BG2="#18181c",BR1="rgba(255,255,255,0.045)",BR2="rgba(255,255,255,0.085)";
const TX1="#ededf2",TX2="#a4a4b4",TX3="#62626f",GREEN="#3db87a";

interface Match {
  id: string; created_at: string; match_score: number; price_delta_pct: number;
  listing_id: string;
  marketplace_listings: {
    id: string; price: number; condition: string; note: string;
    cards: { id:string; name:string; name_de:string; set_id:string; number:string; image_url:string|null; price_market:number|null };
    profiles: { username:string; avatar_url:string|null };
  } | null;
}

function timeAgo(d: string) {
  const h = Math.floor((Date.now() - new Date(d).getTime()) / 3600000);
  if (h < 1) return "Gerade eben";
  if (h < 24) return `vor ${h} Std.`;
  return `vor ${Math.floor(h / 24)} T.`;
}

export default function MatchesPage() {
  const [matches,  setMatches]  = useState<Match[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [user,     setUser]     = useState<any>(null);

  useEffect(() => {
    const sb = createClient();
    sb.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (!user) { setLoading(false); return; }
      loadMatches();
    });
  }, []);

  async function loadMatches() {
    const sb = createClient();
    const { data: { session } } = await sb.auth.getSession();
    const h: Record<string,string> = {};
    if (session?.access_token) h["Authorization"] = `Bearer ${session.access_token}`;
    const res = await fetch("/api/matches", { headers: h });
    const data = await res.json();
    setMatches(data.matches ?? []);
    setLoading(false);
  }

  async function dismiss(id: string) {
    const sb = createClient();
    const { data: { session } } = await sb.auth.getSession();
    const h: Record<string,string> = { "Content-Type": "application/json" };
    if (session?.access_token) h["Authorization"] = `Bearer ${session.access_token}`;
    await fetch("/api/matches", { method: "PATCH", headers: h, body: JSON.stringify({ id }) });
    setMatches(prev => prev.filter(m => m.id !== id));
  }

  return (
    <div style={{ color: TX1, minHeight: "80vh" }}>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "clamp(52px,7vw,80px) clamp(16px,3vw,28px)" }}>

        {/* Header */}
        <div style={{ marginBottom: "clamp(28px,4vw,44px)" }}>
          <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: TX3, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 16, height: 0.5, background: TX3, display: "inline-block" }} />Wishlist
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(26px,4vw,44px)", fontWeight: 200, letterSpacing: "-.055em", marginBottom: 8 }}>
            Deine Matches
          </h1>
          <p style={{ fontSize: 13, color: TX3 }}>
            {loading ? "Lädt…" : matches.length === 0 ? "Keine aktiven Matches." : `${matches.length} Karten aus deiner Wishlist sind verfügbar`}
          </p>
        </div>

        {!user ? (
          <div style={{ textAlign: "center", padding: "48px", background: BG1, border: `1px solid ${BR2}`, borderRadius: 20 }}>
            <div style={{ fontSize: 14, color: TX3, marginBottom: 16 }}>Bitte anmelden um deine Matches zu sehen.</div>
            <Link href="/auth/login" style={{ color: G, textDecoration: "none", fontSize: 13 }}>Anmelden →</Link>
          </div>
        ) : loading ? (
          <div style={{ padding: "48px", textAlign: "center", fontSize: 14, color: TX3 }}>Lädt…</div>
        ) : matches.length === 0 ? (
          <div style={{ background: BG1, border: `1px solid ${BR2}`, borderRadius: 20, padding: "48px", textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 16, opacity: 0.3 }}>◈</div>
            <div style={{ fontSize: 14, color: TX2, marginBottom: 8 }}>Keine Matches gerade.</div>
            <div style={{ fontSize: 12, color: TX3, marginBottom: 20 }}>Füge Karten zu deiner Wishlist hinzu — sobald jemand sie anbietet, wirst du hier benachrichtigt.</div>
            <Link href="/preischeck" style={{ fontSize: 13, color: G, textDecoration: "none" }}>Karten entdecken →</Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {matches.map(match => {
              const listing = match.marketplace_listings;
              if (!listing) return null;
              const card    = listing.cards;
              const isPerfect = match.price_delta_pct <= 0;
              return (
                <div key={match.id} style={{
                  background: BG1,
                  border: `0.5px solid ${isPerfect ? G18 : BR2}`,
                  borderRadius: 16, padding: "14px 16px",
                  display: "flex", alignItems: "center", gap: 14,
                  position: "relative", overflow: "hidden",
                }}>
                  {isPerfect && (
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 0.5, background: `linear-gradient(90deg,transparent,${G},transparent)` }} />
                  )}

                  {/* Card image */}
                  <div style={{ width: 44, height: 60, borderRadius: 6, background: BG2, overflow: "hidden", flexShrink: 0 }}>
                    {card?.image_url && <img src={card.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      {isPerfect && (
                        <span style={{ fontSize: 9, fontWeight: 600, padding: "1px 6px", borderRadius: 4, background: G08, color: G, border: `0.5px solid ${G18}` }}>✦ MATCH</span>
                      )}
                      <span style={{ fontSize: 14, fontWeight: 400, color: TX1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {card?.name_de || card?.name}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: TX3, marginBottom: 4 }}>
                      {card?.set_id?.toUpperCase()} · #{card?.number} · {listing.condition}
                    </div>
                    <div style={{ fontSize: 11, color: TX2, display: "flex", gap: 10 }}>
                      <span>@{listing.profiles?.username ?? "Anonym"}</span>
                      <span style={{ color: TX3 }}>·</span>
                      <span>{timeAgo(match.created_at)}</span>
                      {card?.price_market && (
                        <>
                          <span style={{ color: TX3 }}>·</span>
                          <span style={{ color: TX3 }}>Marktwert {card.price_market.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Price + actions */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 300, color: isPerfect ? G : TX1, letterSpacing: "-.03em" }}>
                      {listing.price.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Link href={`/marketplace`} style={{
                        padding: "6px 14px", borderRadius: 8, fontSize: 12,
                        background: isPerfect ? G : "rgba(255,255,255,0.06)",
                        color: isPerfect ? "#0a0808" : TX2,
                        textDecoration: "none",
                      }}>Ansehen</Link>
                      <button onClick={() => dismiss(match.id)} style={{
                        padding: "6px 10px", borderRadius: 8, fontSize: 12,
                        background: "transparent", color: TX3,
                        border: `0.5px solid ${BR1}`, cursor: "pointer",
                      }}>×</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

'@
[System.IO.File]::WriteAllText("$root\src\app\matches\page.tsx", $matchesPage, $enc)
Write-Host "  OK  matches/page.tsx" -ForegroundColor Green

$profilPage = @'
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props { params: { username: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `@${params.username} — pokédax`,
    description: `Pokémon TCG Sammlung von @${params.username} auf pokédax`,
  };
}

const G="#D4A843",G18="rgba(212,168,67,0.18)",G08="rgba(212,168,67,0.08)";
const BG1="#111114",BG2="#18181c",BR1="rgba(255,255,255,0.045)",BR2="rgba(255,255,255,0.085)";
const TX1="#ededf2",TX2="#a4a4b4",TX3="#62626f",GREEN="#3db87a";

function getBadge(portfolioValue: number, salesCount: number) {
  if (portfolioValue >= 10000 || salesCount >= 100) return { label: "Champion",    color: "#D4A843", icon: "✦" };
  if (portfolioValue >= 3000  || salesCount >= 25)  return { label: "Elite Vier",  color: "#A78BFA", icon: "◆" };
  if (portfolioValue >= 1000  || salesCount >= 10)  return { label: "Arenaleiter", color: "#60A5FA", icon: "◈" };
  if (portfolioValue >= 200   || salesCount >= 1)   return { label: "Trainer",     color: GREEN,     icon: "◎" };
  return null;
}

export default async function ProfilePage({ params }: Props) {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Profile
  const { data: profile } = await sb
    .from("profiles")
    .select("id, username, avatar_url, is_premium, created_at")
    .eq("username", params.username)
    .single();

  if (!profile) notFound();

  // Portfolio value: sum(price_market * quantity)
  const { data: collection } = await sb
    .from("user_collection")
    .select("quantity, cards!user_collection_card_id_fkey(price_market)")
    .eq("user_id", profile.id);

  const portfolioValue = (collection ?? []).reduce((sum: number, item: any) => {
    return sum + (item.cards?.price_market ?? 0) * (item.quantity ?? 1);
  }, 0);

  const collectionCount = (collection ?? []).reduce((s: number, i: any) => s + (i.quantity ?? 1), 0);

  // Active listings
  const { data: listings } = await sb
    .from("marketplace_listings")
    .select("id, price, condition, cards!marketplace_listings_card_id_fkey(id, name, name_de, set_id, number, image_url)")
    .eq("seller_id", profile.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(6);

  // Forum posts count
  const { count: postCount } = await sb
    .from("forum_posts")
    .select("id", { count: "exact", head: true })
    .eq("author_id", profile.id);

  // Completed sales count (for badge)
  const { count: salesCount } = await sb
    .from("escrow_transactions")
    .select("id", { count: "exact", head: true })
    .eq("seller_id", profile.id)
    .eq("status", "released");

  const badge    = getBadge(portfolioValue, salesCount ?? 0);
  const joined   = new Date(profile.created_at).toLocaleDateString("de-DE", { month: "long", year: "numeric" });
  const initial  = profile.username?.[0]?.toUpperCase() ?? "?";
  const isPrem   = profile.is_premium;

  return (
    <div style={{ color: TX1, minHeight: "80vh" }}>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "clamp(52px,7vw,80px) clamp(16px,3vw,28px)" }}>

        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 16, alignItems: "start" }}>

          {/* Left: Profile card */}
          <div>
            <div style={{
              background: BG1, border: `0.5px solid ${isPrem ? G18 : BR2}`,
              borderRadius: 18, padding: "22px", marginBottom: 12,
              position: "relative", overflow: "hidden",
            }}>
              {isPrem && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 0.5, background: `linear-gradient(90deg,transparent,${G},transparent)` }} />}

              {/* Avatar */}
              <div style={{
                width: 64, height: 64, borderRadius: 16, marginBottom: 14,
                background: isPrem ? G08 : BG2,
                border: `0.5px solid ${isPrem ? G18 : BR2}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 24, fontWeight: 300, color: isPrem ? G : TX2,
              }}>{initial}</div>

              {/* Name */}
              <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 200, letterSpacing: "-.04em", marginBottom: 4 }}>
                @{profile.username}
              </div>
              {isPrem && <div style={{ fontSize: 10, color: G, fontWeight: 600, letterSpacing: ".08em", marginBottom: 8 }}>✦ PREMIUM</div>}
              {badge && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 6, background: `${badge.color}10`, border: `0.5px solid ${badge.color}30`, marginBottom: 12 }}>
                  <span style={{ fontSize: 10, color: badge.color }}>{badge.icon}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: badge.color, letterSpacing: ".04em" }}>{badge.label.toUpperCase()}</span>
                </div>
              )}
              <div style={{ fontSize: 11, color: TX3 }}>Mitglied seit {joined}</div>
            </div>

            {/* Stats */}
            <div style={{ background: BG1, border: `0.5px solid ${BR2}`, borderRadius: 14, overflow: "hidden" }}>
              {[
                { l: "Portfolio-Wert", v: portfolioValue > 0 ? `${portfolioValue.toLocaleString("de-DE", { minimumFractionDigits: 0 })} €` : "—", gold: portfolioValue > 0 },
                { l: "Karten",         v: collectionCount > 0 ? String(collectionCount) : "—", gold: false },
                { l: "Beiträge",       v: String(postCount ?? 0), gold: false },
                { l: "Verkäufe",       v: String(salesCount ?? 0), gold: false },
              ].map(({ l, v, gold }, i, arr) => (
                <div key={l} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "11px 14px",
                  borderBottom: i < arr.length - 1 ? `0.5px solid ${BR1}` : undefined,
                }}>
                  <span style={{ fontSize: 12, color: TX3 }}>{l}</span>
                  <span style={{ fontSize: 13, fontFamily: "var(--font-mono)", fontWeight: 300, color: gold ? G : TX1 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Listings */}
          <div>
            {listings && listings.length > 0 ? (
              <div style={{ background: BG1, border: `0.5px solid ${BR2}`, borderRadius: 18, overflow: "hidden" }}>
                <div style={{ padding: "12px 16px", borderBottom: `0.5px solid ${BR1}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: TX3 }}>Aktive Listings</span>
                  <span style={{ fontSize: 11, color: TX3 }}>{listings.length}</span>
                </div>
                {listings.map((listing: any, i: number) => {
                  const card = listing.cards;
                  return (
                    <Link key={listing.id} href={`/preischeck/${card?.id}`} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "12px 16px",
                      borderBottom: i < listings.length - 1 ? `0.5px solid ${BR1}` : undefined,
                      textDecoration: "none",
                    }}>
                      <div style={{ width: 36, height: 50, borderRadius: 5, background: BG2, overflow: "hidden", flexShrink: 0 }}>
                        {card?.image_url && <img src={card.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, color: TX1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {card?.name_de || card?.name}
                        </div>
                        <div style={{ fontSize: 10, color: TX3 }}>{card?.set_id?.toUpperCase()} · {listing.condition}</div>
                      </div>
                      <div style={{ fontSize: 14, fontFamily: "var(--font-mono)", fontWeight: 300, color: G, flexShrink: 0 }}>
                        {listing.price?.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div style={{ background: BG1, border: `0.5px solid ${BR2}`, borderRadius: 18, padding: "48px", textAlign: "center" }}>
                <div style={{ fontSize: 13, color: TX3 }}>Keine aktiven Listings.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

'@
[System.IO.File]::WriteAllText("$root\src\app\profil\[username]\page.tsx", $profilPage, $enc)
Write-Host "  OK  profil/[username]/page.tsx" -ForegroundColor Green

$navbarFile = @'
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

'@
[System.IO.File]::WriteAllText("$root\src\components\layout\Navbar.tsx", $navbarFile, $enc)
Write-Host "  OK  Navbar.tsx" -ForegroundColor Green

# Remove old wrong matches path if exists
$wrongPath = "$root\src\app\marketplace\matches"
if (Test-Path $wrongPath) { Remove-Item $wrongPath -Recurse -Force }

Write-Host ""
Write-Host "Fertig! GitHub Desktop -> Commit -> Push" -ForegroundColor Yellow
Write-Host ""
Write-Host "URLs nach Deploy:" -ForegroundColor Cyan
Write-Host "  /matches          -> Wishlist-Matches" -ForegroundColor White
Write-Host "  /profil/[username] -> Oeffentliches Profil" -ForegroundColor White
Write-Host ""
Write-Host "Cron-Jobs (manuell aufrufbar):" -ForegroundColor Cyan
Write-Host "  /api/cron/price-history   -> Top-200 Karten in price_history loggen" -ForegroundColor White
Write-Host "  /api/cron/wishlist-notify -> Matches per E-Mail senden (spaeter)" -ForegroundColor White
