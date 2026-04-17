"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const GOLD = "#C9A66B";
const BG   = "#0A0A0A";
const BG2  = "#111111";
const BG3  = "#1A1A1A";
const TX   = "#EDE9E0";
const TX2  = "rgba(237,233,224,0.7)";
const GD2  = "rgba(201,166,107,0.7)";

const SB = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DashboardPage() {
  const [user,      setUser]      = useState<any>(null);
  const [stats,     setStats]     = useState({ cards: 0, value: 0, scans: 0, listings: 0 });
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [topCards,  setTopCards]  = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await SB.auth.getUser();
      if (!user) { window.location.href = "/auth/login"; return; }
      setUser(user);

      try {
        const [
          { data: collection },
          { data: scans },
          { data: listings },
        ] = await Promise.all([
          SB.from("user_collection")
            .select("quantity,buy_price,cards(price_market)")
            .eq("user_id", user.id).limit(200),
          SB.from("scan_logs")
            .select("id,created_at,cards(id,name,name_de,image_url,price_market)")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }).limit(5),
          SB.from("marketplace_listings")
            .select("id").eq("user_id", user.id).eq("is_active", true),
        ]);

        const col = collection ?? [];
        const totalValue = col.reduce((s: number, c: any) => {
          const card = Array.isArray(c.cards) ? c.cards[0] : c.cards;
          return s + (card?.price_market ?? 0) * (c.quantity ?? 1);
        }, 0);
        const cardCount = col.reduce((s: number, c: any) => s + (c.quantity ?? 1), 0);

        setStats({
          cards:    cardCount,
          value:    totalValue,
          scans:    (scans ?? []).length,
          listings: (listings ?? []).length,
        });

        const sc = (scans ?? []).map((s: any) => ({
          ...s, cards: Array.isArray(s.cards) ? s.cards[0] : s.cards,
        }));
        setRecentScans(sc);

        // Top cards by value
        const sorted = [...col]
          .map((c: any) => ({ ...c, cards: Array.isArray(c.cards) ? c.cards[0] : c.cards }))
          .filter((c: any) => c.cards?.price_market > 0)
          .sort((a: any, b: any) => (b.cards.price_market * b.quantity) - (a.cards.price_market * a.quantity))
          .slice(0, 6);
        setTopCards(sorted);
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  const username = user?.email?.split("@")[0] ?? "";
  const initial  = username[0]?.toUpperCase() ?? "U";

  if (loading) return (
    <div style={{ background: BG, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: GD2 }}>
      Lade Dashboard…
    </div>
  );

  return (
    <div style={{ background: BG, minHeight: "100vh", color: TX }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;700&family=Instrument+Sans:wght@400;500;600&display=swap');
        .ph { font-family:'Playfair Display',serif; letter-spacing:-0.05em; }
        .stat-card { background:#111111; border:1px solid rgba(255,255,255,0.07); border-radius:20px; padding:clamp(20px,3vw,28px); transition:border-color 0.2s; text-decoration:none; display:block; }
        .stat-card:hover { border-color:rgba(201,166,107,0.25); }
        .quick-link { display:flex; align-items:center; gap:14px; padding:16px 20px; background:#111111; border:1px solid rgba(255,255,255,0.07); border-radius:16px; text-decoration:none; transition:all 0.2s; }
        .quick-link:hover { border-color:rgba(201,166,107,0.3); transform:translateX(4px); }
        .scan-row { display:flex; align-items:center; gap:12px; padding:14px 0; border-bottom:1px solid rgba(255,255,255,0.05); }
        .scan-row:last-child { border-bottom:none; }
        .top-card { background:#111111; border:1px solid rgba(255,255,255,0.06); border-radius:16px; overflow:hidden; text-decoration:none; display:block; transition:transform 0.2s,border-color 0.2s; }
        .top-card:hover { transform:translateY(-3px); border-color:rgba(201,166,107,0.2); }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation:fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) both; }
      `}</style>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(60px,8vw,100px) clamp(20px,4vw,48px)" }}>

        {/* Header */}
        <div style={{ marginBottom: 56, display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(201,166,107,0.15)", border: "2px solid rgba(201,166,107,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700, color: GOLD, flexShrink: 0 }}>
            {initial}
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: GD2, marginBottom: 6 }}>Willkommen zurück</div>
            <h1 className="ph" style={{ fontSize: "clamp(32px,4vw,52px)", fontWeight: 500, color: TX, lineHeight: 1 }}>
              @{username}
            </h1>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12, marginBottom: 48 }}>
          {[
            { href: "/dashboard/portfolio", icon: "◈", label: "Sammlungswert",  value: stats.value > 0 ? stats.value.toLocaleString("de-DE", { minimumFractionDigits: 2 }) + " €" : "–", sub: stats.cards + " Karten", highlight: true },
            { href: "/scanner",             icon: "⊙", label: "Letzte Scans",   value: stats.scans.toString(), sub: "Heute", highlight: false },
            { href: "/marketplace",         icon: "◎", label: "Aktive Inserate", value: stats.listings.toString(), sub: "Marktplatz", highlight: false },
            { href: "/dashboard/premium",   icon: "✦", label: "Premium",        value: "6,99 €", sub: "/ Monat", highlight: false, gold: true },
          ].map(({ href, icon, label, value, sub, highlight, gold }) => (
            <Link key={label} href={href} className="stat-card fade-up">
              <div style={{ fontSize: 20, color: gold ? GOLD : "rgba(201,166,107,0.4)", marginBottom: 16 }}>{icon}</div>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: GD2, marginBottom: 8 }}>{label}</div>
              <div className="ph" style={{ fontSize: "clamp(24px,3vw,36px)", fontWeight: 500, color: highlight ? GOLD : TX, lineHeight: 1, marginBottom: 4 }}>{value}</div>
              <div style={{ fontSize: 12, color: "rgba(237,233,224,0.35)" }}>{sub}</div>
            </Link>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

          {/* Quick Links */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: GD2, marginBottom: 16 }}>Quick Actions</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { href: "/scanner",              icon: "⊙", label: "Karte scannen",       sub: "KI-gestützte Erkennung",     premium: true  },
                { href: "/dashboard/portfolio",  icon: "◈", label: "Portfolio ansehen",   sub: `${stats.cards} Karten · ${stats.value > 0 ? stats.value.toFixed(0) + " €" : "–"}`, premium: false },
                { href: "/preischeck",           icon: "◎", label: "Preischeck",           sub: "23.000+ Karten live",        premium: false },
                { href: "/marketplace",          icon: "⇄", label: "Marktplatz",           sub: "Kaufen & Verkaufen",         premium: false },
                { href: "/dashboard/wishlist",   icon: "◉", label: "Wunschliste",          sub: "Automatisches Matching",     premium: true  },
                { href: "/forum",                icon: "◉", label: "Community Forum",      sub: "Diskussionen & Tipps",       premium: false },
              ].map(({ href, icon, label, sub, premium }) => (
                <Link key={href} href={href} className="quick-link">
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: premium ? "rgba(201,166,107,0.12)" : "rgba(255,255,255,0.05)", border: `1px solid ${premium ? "rgba(201,166,107,0.25)" : "rgba(255,255,255,0.08)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: premium ? GOLD : "rgba(201,166,107,0.4)", flexShrink: 0 }}>
                    {premium ? "✦" : icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: TX, marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: 11, color: "rgba(237,233,224,0.4)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sub}</div>
                  </div>
                  {premium && <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(201,166,107,0.6)", background: "rgba(201,166,107,0.08)", padding: "2px 8px", borderRadius: 4, flexShrink: 0 }}>PRO</span>}
                  <span style={{ color: "rgba(237,233,224,0.2)", fontSize: 16 }}>→</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* Recent scans */}
            {recentScans.length > 0 && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: GD2 }}>Letzte Scans</div>
                  <Link href="/scanner" style={{ fontSize: 12, color: GOLD, textDecoration: "none" }}>Scanner →</Link>
                </div>
                <div style={{ background: BG2, borderRadius: 16, padding: "8px 16px", border: "1px solid rgba(255,255,255,0.07)" }}>
                  {recentScans.map(s => {
                    const card = s.cards;
                    if (!card) return null;
                    const img = card.image_url ? (card.image_url.includes(".") ? card.image_url : card.image_url + "/low.webp") : null;
                    return (
                      <Link key={s.id} href={`/preischeck/${card.id}`} style={{ textDecoration: "none" }}>
                        <div className="scan-row">
                          <div style={{ width: 36, height: 50, borderRadius: 5, overflow: "hidden", background: BG3, flexShrink: 0 }}>
                            {img && <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }}/>}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: TX, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{card.name_de || card.name}</div>
                            <div style={{ fontSize: 11, color: "rgba(237,233,224,0.35)" }}>{new Date(s.created_at).toLocaleDateString("de-DE")}</div>
                          </div>
                          {card.price_market && (
                            <div style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 600, color: GOLD, flexShrink: 0 }}>
                              {card.price_market.toFixed(2)} €
                            </div>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Top cards */}
            {topCards.length > 0 && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: GD2 }}>Wertvollste Karten</div>
                  <Link href="/dashboard/portfolio" style={{ fontSize: 12, color: GOLD, textDecoration: "none" }}>Portfolio →</Link>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                  {topCards.slice(0,6).map((item: any) => {
                    const card = item.cards;
                    const img  = card?.image_url ? (card.image_url.includes(".") ? card.image_url : card.image_url + "/low.webp") : null;
                    return (
                      <Link key={item.id} href={`/preischeck/${card?.id}`} className="top-card">
                        <div style={{ aspectRatio: "3/4", background: BG3, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                          {img && <img src={img} alt="" style={{ width: "90%", height: "90%", objectFit: "contain" }} loading="lazy"/>}
                        </div>
                        <div style={{ padding: "8px 10px" }}>
                          <div style={{ fontSize: 10, fontWeight: 600, color: TX, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{card?.name_de || card?.name}</div>
                          <div style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 600, color: GOLD }}>{card?.price_market?.toFixed(2)} €</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
