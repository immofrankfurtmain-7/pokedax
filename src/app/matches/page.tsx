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

export default function MatchesPage() {
  const [user,     setUser]     = useState<any>(null);
  const [wish,     setWish]     = useState<any[]>([]);
  const [matches,  setMatches]  = useState<any[]>([]);
  const [tab,      setTab]      = useState<"wishlist"|"matches">("wishlist");
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await SB.auth.getUser();
      if (!user) { window.location.href = "/auth/login"; return; }
      setUser(user);

      const [{ data: wData }, { data: mData }] = await Promise.all([
        SB.from("user_wishlist")
          .select("id,max_price,added_at,cards(id,name,name_de,set_id,number,image_url,price_market,price_avg7)")
          .eq("user_id", user.id)
          .order("added_at", { ascending: false }).limit(100),
        SB.from("wishlist_matches")
          .select("id,created_at,notified,cards(id,name,name_de,image_url,price_market,set_id,number),marketplace_listings(id,price,condition,profiles!marketplace_listings_user_id_fkey(username))")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }).limit(20),
      ]);

      setWish((wData ?? []).map((w: any) => ({ ...w, cards: Array.isArray(w.cards) ? w.cards[0] : w.cards })));
      setMatches((mData ?? []).map((m: any) => ({
        ...m,
        cards: Array.isArray(m.cards) ? m.cards[0] : m.cards,
        marketplace_listings: Array.isArray(m.marketplace_listings) ? m.marketplace_listings[0] : m.marketplace_listings,
      })));
      setLoading(false);
    }
    load();
  }, []);

  async function removeFromWishlist(wishId: string) {
    try {
      await SB.from("user_wishlist").delete().eq("id", wishId);
      setWish(prev => prev.filter(w => w.id !== wishId));
    } catch {}
  }

  return (
    <div style={{ background: BG, minHeight: "100vh", color: TX }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;700&family=Instrument+Sans:wght@400;500;600&display=swap');
        .ph { font-family:'Playfair Display',serif; letter-spacing:-0.05em; }
        .tab-btn { padding:10px 28px; border-radius:100px; border:1px solid transparent; font-size:14px; cursor:pointer; transition:all 0.2s; background:transparent; }
        .tab-btn.active { background:rgba(201,166,107,0.1); border-color:rgba(201,166,107,0.3); color:#C9A66B; font-weight:600; }
        .tab-btn:not(.active) { color:rgba(237,233,224,0.5); }
        .wish-card { background:#111111; border:1px solid rgba(255,255,255,0.07); border-radius:20px; overflow:hidden; transition:border-color 0.2s,transform 0.2s; }
        .wish-card:hover { border-color:rgba(201,166,107,0.2); transform:translateY(-2px); }
        .match-row { background:#111111; border:1px solid rgba(201,166,107,0.2); border-radius:16px; padding:20px; display:flex; gap:16px; align-items:center; transition:border-color 0.2s; background:linear-gradient(135deg,rgba(201,166,107,0.05),#111111); }
        .match-row:hover { border-color:rgba(201,166,107,0.35); }
        .btn-gold { display:inline-flex; align-items:center; gap:6px; padding:10px 20px; background:#C9A66B; color:#0A0A0A; border-radius:100px; border:none; font-size:13px; font-weight:600; cursor:pointer; text-decoration:none; transition:transform 0.2s; white-space:nowrap; }
        .btn-gold:hover { transform:scale(1.03); }
        @keyframes skeleton { 0%,100%{opacity:.3} 50%{opacity:.6} }
        .skel { animation:skeleton 1.5s ease-in-out infinite; background:#111; border-radius:16px; }
      `}</style>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(60px,8vw,100px) clamp(20px,4vw,48px)" }}>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: GD2, marginBottom: 16 }}>Automatisches Matching</div>
          <h1 className="ph" style={{ fontSize: "clamp(36px,5vw,72px)", fontWeight: 500, color: TX, lineHeight: 1 }}>
            Wishlist &<br/><span style={{ color: GOLD }}>Matches</span>
          </h1>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 40 }}>
          {(["wishlist","matches"] as const).map(t => (
            <button key={t} className={`tab-btn${tab===t?" active":""}`} onClick={() => setTab(t)}>
              {t === "wishlist" ? "Wunschliste" : (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  Matches
                  {matches.length > 0 && <span style={{ background: GOLD, color: BG, borderRadius: 100, padding: "1px 8px", fontSize: 11, fontWeight: 700 }}>{matches.length}</span>}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Wishlist */}
        {tab === "wishlist" && (
          loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 16 }}>
              {Array.from({length: 6}).map((_,i) => <div key={i} className="skel" style={{ aspectRatio: "3/5" }}/>)}
            </div>
          ) : wish.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 20px" }}>
              <div style={{ fontSize: 56, opacity: 0.1, marginBottom: 24, color: GOLD }}>◉</div>
              <h2 className="ph" style={{ fontSize: 28, fontWeight: 500, color: TX2, marginBottom: 16 }}>Wunschliste ist leer</h2>
              <Link href="/preischeck" style={{ display: "inline-flex", padding: "13px 28px", background: GOLD, color: BG, borderRadius: 100, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
                Karten entdecken →
              </Link>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 16 }}>
              {wish.map(w => {
                const card = w.cards;
                if (!card) return null;
                const imgSrc = card.image_url?.includes(".") ? card.image_url : (card.image_url ? card.image_url + "/low.webp" : null);
                const pct    = card.price_avg7 && card.price_market ? ((card.price_market - card.price_avg7) / card.price_avg7 * 100) : null;
                const isDeal = w.max_price && card.price_market && card.price_market <= w.max_price;
                return (
                  <div key={w.id} className="wish-card">
                    <Link href={`/preischeck/${card.id}`} style={{ textDecoration: "none", display: "block" }}>
                      <div style={{ aspectRatio: "3/4", background: BG3, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}>
                        {imgSrc && <img src={imgSrc} alt={card.name} style={{ width: "85%", height: "85%", objectFit: "contain" }}/>}
                        {isDeal && (
                          <div style={{ position: "absolute", top: 10, right: 10, padding: "3px 8px", borderRadius: 100, background: "rgba(201,166,107,0.2)", color: GOLD, fontSize: 9, fontWeight: 700, border: "1px solid rgba(201,166,107,0.3)" }}>
                            DEAL ✦
                          </div>
                        )}
                        {pct !== null && (
                          <div style={{ position: "absolute", top: 10, left: 10, padding: "2px 7px", borderRadius: 100, fontSize: 9, fontWeight: 700, background: pct >= 0 ? "rgba(61,184,122,0.15)" : "rgba(220,74,90,0.12)", color: pct >= 0 ? "#3db87a" : "#dc4a5a" }}>
                            {pct >= 0 ? "▲" : "▼"} {Math.abs(pct).toFixed(1)}%
                          </div>
                        )}
                      </div>
                      <div style={{ padding: "12px 14px" }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: TX, marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {card.name_de || card.name}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                          <div style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 600, color: GOLD }}>
                            {card.price_market?.toFixed(2)} €
                          </div>
                          {w.max_price && (
                            <div style={{ fontSize: 10, color: "rgba(237,233,224,0.3)" }}>Limit: {w.max_price.toFixed(2)} €</div>
                          )}
                        </div>
                      </div>
                    </Link>
                    <div style={{ padding: "0 14px 14px" }}>
                      <button onClick={() => removeFromWishlist(w.id)} style={{
                        width: "100%", padding: "8px", background: "transparent",
                        border: "1px solid rgba(255,255,255,0.08)", borderRadius: 100,
                        color: "rgba(237,233,224,0.35)", fontSize: 12, cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={e => { (e.currentTarget as any).style.borderColor = "rgba(220,74,90,0.3)"; (e.currentTarget as any).style.color = "#dc4a5a"; }}
                      onMouseLeave={e => { (e.currentTarget as any).style.borderColor = "rgba(255,255,255,0.08)"; (e.currentTarget as any).style.color = "rgba(237,233,224,0.35)"; }}>
                        Von Wunschliste entfernen
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* Matches */}
        {tab === "matches" && (
          loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {Array.from({length: 4}).map((_,i) => <div key={i} className="skel" style={{ height: 100 }}/>)}
            </div>
          ) : matches.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 20px" }}>
              <div style={{ fontSize: 56, opacity: 0.1, marginBottom: 24, color: GOLD }}>✦</div>
              <h2 className="ph" style={{ fontSize: 28, fontWeight: 500, color: TX2, marginBottom: 16 }}>
                Noch keine Matches
              </h2>
              <p style={{ fontSize: 15, color: "rgba(237,233,224,0.4)", maxWidth: 400, margin: "0 auto 32px", lineHeight: 1.7 }}>
                Füge Karten zur Wunschliste hinzu. Sobald jemand eine deiner Wunschkarten inseriert, erscheint es hier.
              </p>
              <button onClick={() => setTab("wishlist")} style={{ padding: "13px 28px", background: GOLD, color: BG, borderRadius: 100, border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                Zur Wunschliste
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {matches.map(m => {
                const card    = m.cards;
                const listing = m.marketplace_listings;
                if (!card) return null;
                const imgSrc  = card.image_url?.includes(".") ? card.image_url : (card.image_url ? card.image_url + "/low.webp" : null);
                const isCheap = listing?.price && card.price_market && listing.price < card.price_market * 0.97;
                return (
                  <div key={m.id} className="match-row">
                    {/* Gold line top */}
                    <div style={{ position: "absolute" }}/>
                    {/* Card image */}
                    <Link href={`/preischeck/${card.id}`} style={{ textDecoration: "none", flexShrink: 0 }}>
                      <div style={{ width: 56, height: 78, borderRadius: 8, overflow: "hidden", background: BG3, border: "1px solid rgba(201,166,107,0.15)" }}>
                        {imgSrc && <img src={imgSrc} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }}/>}
                      </div>
                    </Link>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: "0.08em" }}>✦ MATCH GEFUNDEN</span>
                        {!m.notified && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3db87a", flexShrink: 0 }}/>}
                      </div>
                      <Link href={`/preischeck/${card.id}`} style={{ textDecoration: "none" }}>
                        <div style={{ fontSize: 15, fontWeight: 600, color: TX, marginBottom: 2 }}>{card.name_de || card.name}</div>
                      </Link>
                      <div style={{ fontSize: 12, color: "rgba(237,233,224,0.4)" }}>
                        {card.set_id?.toUpperCase()} · @{listing?.profiles?.username ?? "Anonym"} · {listing?.condition ?? "NM"}
                      </div>
                    </div>

                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div className="ph" style={{ fontSize: 22, fontWeight: 500, color: GOLD, marginBottom: 4 }}>
                        {listing?.price?.toFixed(2)} €
                      </div>
                      {card.price_market && listing?.price && (
                        <div style={{ fontSize: 11, color: isCheap ? "#3db87a" : "rgba(237,233,224,0.35)", marginBottom: 10 }}>
                          Marktwert: {card.price_market.toFixed(2)} €
                        </div>
                      )}
                      <Link href="/marketplace" className="btn-gold">Kaufen ✦</Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );
}
