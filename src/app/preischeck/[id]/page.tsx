"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
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

export default function CardDetailPage() {
  const { id } = useParams();
  const [card,     setCard]     = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [similar,  setSimilar]  = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [added,    setAdded]    = useState(false);
  const [wished,   setWished]   = useState(false);

  useEffect(() => {
    if (!id) return;
    async function load() {
      const [{ data: c }, { data: l }] = await Promise.all([
        SB.from("cards").select("id,name,name_de,name_en,set_id,number,hp,types,rarity,is_holo,image_url,price_market,price_low,price_avg7,price_avg30,attacks,abilities,illustrator,regulation_mark,category,stage,scan_count").eq("id", id as string).single(),
        SB.from("marketplace_listings")
          .select("id,type,price,condition,profiles!marketplace_listings_user_id_fkey(username)")
          .eq("card_id", id as string).eq("is_active", true).order("price", { ascending: true }).limit(8),
      ]);
      setCard(c);
      setListings((l ?? []).map((x: any) => ({ ...x, profiles: Array.isArray(x.profiles) ? x.profiles[0] : x.profiles })));

      // Similar cards from same set
      if (c?.set_id) {
        const { data: sim } = await SB.from("cards")
          .select("id,name,name_de,image_url,price_market,number")
          .eq("set_id", c.set_id).not("id","eq",id as string)
          .not("price_market","is",null).order("price_market", { ascending: false }).limit(6);
        setSimilar(sim ?? []);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  async function addToPortfolio() {
    const { data: { user } } = await SB.auth.getUser();
    if (!user) { window.location.href = "/auth/login"; return; }
    try {
      await SB.from("user_collection").upsert({ user_id: user.id, card_id: id, quantity: 1, condition: "NM" }, { onConflict: "user_id,card_id" });
      setAdded(true);
    } catch {}
  }

  async function addToWishlist() {
    const { data: { user } } = await SB.auth.getUser();
    if (!user) { window.location.href = "/auth/login"; return; }
    try {
      await SB.from("user_wishlist").upsert({ user_id: user.id, card_id: id }, { onConflict: "user_id,card_id" });
      setWished(true);
    } catch {}
  }

  if (loading) return <div style={{ background: BG, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: GD2 }}>Lade…</div>;
  if (!card)   return <div style={{ background: BG, minHeight: "100vh", display: "flex", flexDirection:"column", alignItems: "center", justifyContent: "center", gap:16 }}><div style={{color:TX2}}>Karte nicht gefunden</div><Link href="/preischeck" style={{color:GOLD}}>← Zurück</Link></div>;

  const imgSrc  = card.image_url ? (card.image_url.includes(".") ? card.image_url : card.image_url + "/high.webp") : null;
  const pct30   = card.price_avg30 && card.price_market ? ((card.price_market - card.price_avg30) / card.price_avg30 * 100) : null;
  const up30    = pct30 !== null && pct30 >= 0;

  return (
    <div style={{ background: BG, minHeight: "100vh", color: TX }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;700&family=Instrument+Sans:wght@400;500;600&display=swap');
        .ph { font-family:'Playfair Display',serif; letter-spacing:-0.05em; }
        .btn-gold { display:inline-flex; align-items:center; gap:8px; padding:14px 28px; background:#C9A66B; color:#0A0A0A; border-radius:100px; border:none; font-size:14px; font-weight:600; cursor:pointer; text-decoration:none; transition:transform 0.2s; width:100%; justify-content:center; }
        .btn-gold:hover { transform:scale(1.02); }
        .btn-outline { display:inline-flex; align-items:center; gap:8px; padding:13px 24px; border:1px solid rgba(201,166,107,0.3); color:#C9A66B; border-radius:100px; background:transparent; font-size:14px; cursor:pointer; text-decoration:none; transition:all 0.2s; width:100%; justify-content:center; }
        .btn-outline:hover { background:#C9A66B; color:#0A0A0A; }
        .listing-row { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:14px 18px; background:#1A1A1A; border-bottom:1px solid rgba(255,255,255,0.05); transition:background 0.15s; }
        .listing-row:hover { background:#1F1F1F; }
        .listing-row:last-child { border-bottom:none; }
        .sim-card { background:#111111; border:1px solid rgba(255,255,255,0.06); border-radius:16px; overflow:hidden; text-decoration:none; display:block; transition:transform 0.2s,border-color 0.2s; }
        .sim-card:hover { transform:translateY(-4px); border-color:rgba(201,166,107,0.25); }
        .attack-row { padding:16px 18px; background:#1A1A1A; border-bottom:1px solid rgba(255,255,255,0.05); }
        .attack-row:last-child { border-bottom:none; }
        .stat-cell { padding:16px; background:#111111; border-right:1px solid rgba(255,255,255,0.05); border-bottom:1px solid rgba(255,255,255,0.05); }
        .breadcrumb-link { color:rgba(237,233,224,0.4); text-decoration:none; font-size:13px; transition:color 0.15s; }
        .breadcrumb-link:hover { color:#C9A66B; }
      `}</style>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(60px,8vw,100px) clamp(20px,4vw,48px)" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 48, fontSize: 13, color: "rgba(237,233,224,0.4)" }}>
          <Link href="/preischeck" className="breadcrumb-link">Preischeck</Link>
          <span>›</span>
          <Link href={`/sets/${card.set_id}`} className="breadcrumb-link">{card.set_id?.toUpperCase()}</Link>
          <span>›</span>
          <span style={{ color: TX2 }}>{card.name_de || card.name}</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 64, alignItems: "start" }}>

          {/* Left — Card */}
          <div>
            {/* Card image */}
            <div style={{
              background: BG2, borderRadius: 24, overflow: "hidden",
              border: "1px solid rgba(201,166,107,0.15)",
              boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
              marginBottom: 24, position: "relative",
            }}>
              <div style={{ padding: "24px 24px 0", background: BG3, display: "flex", justifyContent: "center" }}>
                <div style={{ width: "75%", aspectRatio: "3/4" }}>
                  {imgSrc ? (
                    <img src={imgSrc} alt={card.name_de || card.name}
                      style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, opacity: 0.1 }}>◎</div>
                  )}
                </div>
              </div>
              {/* Gold bottom glow */}
              <div style={{ height: 1, background: "linear-gradient(90deg,transparent,rgba(201,166,107,0.3),transparent)" }}/>
              <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 11, color: "rgba(237,233,224,0.3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {card.set_id?.toUpperCase()} · #{card.number}
                </div>
                {card.scan_count > 0 && (
                  <div style={{ fontSize: 10, color: GD2 }}>⊙ {card.scan_count}× gescannt</div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button onClick={addToPortfolio} className="btn-gold" disabled={added}
                style={{ opacity: added ? 0.8 : 1 }}>
                {added ? "✓ Zur Sammlung hinzugefügt" : "+ Zu meiner Sammlung"}
              </button>
              <button onClick={addToWishlist} className="btn-outline" disabled={wished}
                style={{ opacity: wished ? 0.8 : 1, border: wished ? "1px solid rgba(201,166,107,0.5)" : undefined }}>
                {wished ? "✓ Auf Wunschliste" : "◉ Zur Wunschliste"}
              </button>
              <Link href={`/marketplace?sell=${card.id}`} style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "13px 24px", borderRadius: 100,
                border: "1px solid rgba(255,255,255,0.1)",
                color: TX2, fontSize: 14, textDecoration: "none",
                transition: "border-color 0.2s, color 0.2s",
              }}>
                Inserieren →
              </Link>
            </div>
          </div>

          {/* Right — Info */}
          <div>
            {/* Rarity / type */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              {card.rarity && (
                <span style={{ padding: "4px 12px", borderRadius: 100, background: "rgba(201,166,107,0.1)", color: GOLD, fontSize: 11, fontWeight: 600, border: "1px solid rgba(201,166,107,0.2)" }}>
                  {card.rarity}
                </span>
              )}
              {card.is_holo && (
                <span style={{ padding: "4px 12px", borderRadius: 100, background: "rgba(255,255,255,0.05)", color: TX2, fontSize: 11 }}>
                  Holo
                </span>
              )}
            </div>

            <h1 className="ph" style={{ fontSize: "clamp(32px,4vw,56px)", fontWeight: 500, color: TX, marginBottom: 8, lineHeight: 1 }}>
              {card.name_de || card.name}
            </h1>
            {card.name_de && card.name !== card.name_de && (
              <div style={{ fontSize: 16, color: TX2, marginBottom: 32 }}>{card.name}</div>
            )}

            {/* Price block */}
            <div style={{ background: BG2, borderRadius: 20, padding: "28px", marginBottom: 32, border: "1px solid rgba(201,166,107,0.12)", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(201,166,107,0.3),transparent)" }}/>
              <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: GD2, marginBottom: 12 }}>Marktwert</div>
              <div className="ph" style={{ fontSize: "clamp(40px,5vw,64px)", fontWeight: 500, color: GOLD, lineHeight: 1, marginBottom: 16 }}>
                {card.price_market ? card.price_market.toLocaleString("de-DE", { minimumFractionDigits: 2 }) + " €" : "–"}
              </div>
              <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                {card.price_low && (
                  <div>
                    <div style={{ fontSize: 10, color: GD2, marginBottom: 4, letterSpacing: "0.1em", textTransform: "uppercase" }}>Ab</div>
                    <div style={{ fontFamily: "monospace", fontSize: 16, color: TX }}>{card.price_low.toFixed(2)} €</div>
                  </div>
                )}
                {card.price_avg7 && (
                  <div>
                    <div style={{ fontSize: 10, color: GD2, marginBottom: 4, letterSpacing: "0.1em", textTransform: "uppercase" }}>7-Tage-Ø</div>
                    <div style={{ fontFamily: "monospace", fontSize: 16, color: TX }}>{card.price_avg7.toFixed(2)} €</div>
                  </div>
                )}
                {pct30 !== null && (
                  <div>
                    <div style={{ fontSize: 10, color: GD2, marginBottom: 4, letterSpacing: "0.1em", textTransform: "uppercase" }}>30-Tage</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: up30 ? "#3db87a" : "#dc4a5a" }}>
                      {up30 ? "▲" : "▼"} {Math.abs(pct30).toFixed(1)}%
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Stats grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)", marginBottom: 32 }}>
              {[
                { l: "HP",        v: card.hp || "–"              },
                { l: "Typ",       v: card.types?.join(", ") || "–" },
                { l: "Stufe",     v: card.stage || "–"            },
                { l: "Kategorie", v: card.category || "–"         },
                { l: "Illustrator", v: card.illustrator || "–"    },
                { l: "Regulation",  v: card.regulation_mark || "–" },
              ].map(({ l, v }, i) => (
                <div key={l} className="stat-cell" style={{ borderRight: (i+1)%3===0 ? "none" : undefined, borderBottom: i>2 ? "none" : undefined }}>
                  <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: GD2, marginBottom: 4 }}>{l}</div>
                  <div style={{ fontSize: 13, color: TX, fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </div>

            {/* Attacks */}
            {card.attacks?.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: GD2, marginBottom: 14 }}>Attacken</div>
                <div style={{ background: BG2, borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}>
                  {card.attacks.map((atk: any, i: number) => (
                    <div key={i} className="attack-row">
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, fontSize: 14, color: TX }}>{atk.name}</span>
                        {atk.damage && <span style={{ fontFamily: "monospace", fontSize: 14, color: GOLD }}>{atk.damage}</span>}
                      </div>
                      {atk.text && <div style={{ fontSize: 13, color: TX2, lineHeight: 1.6 }}>{atk.text}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Marketplace listings */}
            {listings.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: GD2 }}>Angebote</div>
                  <Link href="/marketplace" style={{ fontSize: 12, color: GOLD, textDecoration: "none" }}>Alle →</Link>
                </div>
                <div style={{ background: BG2, borderRadius: 16, overflow: "hidden", border: "1px solid rgba(201,166,107,0.1)" }}>
                  {listings.map((l: any) => (
                    <div key={l.id} className="listing-row">
                      <div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: TX }}>@{l.profiles?.username ?? "Anonym"}</span>
                        <span style={{ fontSize: 11, color: TX2, marginLeft: 8 }}>{l.condition}</span>
                      </div>
                      <div style={{ fontFamily: "monospace", fontSize: 16, fontWeight: 600, color: GOLD }}>
                        {l.price?.toFixed(2)} €
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Similar cards */}
        {similar.length > 0 && (
          <div style={{ marginTop: 64 }}>
            <div style={{ width: "100%", height: 1, background: "linear-gradient(90deg,transparent,rgba(201,166,107,0.2),transparent)", marginBottom: 40 }}/>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: GD2, marginBottom: 20 }}>
              Weitere Karten aus {card.set_id?.toUpperCase()}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 16 }}>
              {similar.map(s => {
                const sImg = s.image_url ? (s.image_url.includes(".") ? s.image_url : s.image_url + "/low.webp") : null;
                return (
                  <Link key={s.id} href={`/preischeck/${s.id}`} className="sim-card">
                    <div style={{ aspectRatio: "3/4", background: BG3, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                      {sImg && <img src={sImg} alt="" style={{ width: "85%", height: "85%", objectFit: "contain" }} loading="lazy"/>}
                    </div>
                    <div style={{ padding: "10px 12px 14px" }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: TX, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 4 }}>{s.name_de || s.name}</div>
                      <div style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 600, color: GOLD }}>{s.price_market?.toFixed(2)} €</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
