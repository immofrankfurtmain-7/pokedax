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
