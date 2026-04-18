"use client";
import { useState, useEffect, useCallback } from "react";
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

interface Listing {
  id: string; type: "offer"|"want"; price: number|null;
  condition: string; note: string; card_id: string;
  profiles: { username: string }|null;
  cards: { id:string; name:string; name_de:string|null; set_id:string; number:string; image_url:string|null; price_market:number|null }|null;
}

export default function MarketplacePage() {
  const [listings,   setListings]   = useState<Listing[]>([]);
  const [tab,        setTab]        = useState<"offer"|"want">("offer");
  const [loading,    setLoading]    = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [user,       setUser]       = useState<any>(null);
  const [presellId,  setPresellId]  = useState<string|null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sell = params.get("sell");
    if (sell) { setPresellId(sell); setShowCreate(true); }
    SB.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
  }, []);

  const loadListings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/marketplace?type=${tab}&limit=24`);
      const data = await res.json();
      setListings(data.listings ?? []);
    } catch {}
    setLoading(false);
  }, [tab]);

  useEffect(() => { loadListings(); }, [loadListings]);

  return (
    <div style={{ background: BG, minHeight: "100vh", color: TX }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;700&family=Instrument+Sans:wght@400;500;600&display=swap');
        .ph { font-family:'Playfair Display',serif; letter-spacing:-0.05em; }
        .listing-card { background:#111111; border:1px solid rgba(255,255,255,0.07); border-radius:20px; overflow:hidden; transition:transform 0.25s cubic-bezier(0.22,1,0.36,1),border-color 0.2s,box-shadow 0.25s; }
        .listing-card:hover { transform:translateY(-4px); border-color:rgba(201,166,107,0.25); box-shadow:0 20px 50px rgba(0,0,0,0.5); }
        .listing-card.deal { border-color:rgba(201,166,107,0.3); background:linear-gradient(135deg,rgba(201,166,107,0.05),#111111); }
        .tab-btn { padding:10px 28px; border-radius:100px; border:1px solid transparent; font-size:14px; cursor:pointer; transition:all 0.2s; background:transparent; }
        .tab-btn.active { background:rgba(201,166,107,0.1); border-color:rgba(201,166,107,0.3); color:#C9A66B; font-weight:600; }
        .tab-btn:not(.active) { color:rgba(237,233,224,0.5); }
        .tab-btn:not(.active):hover { color:#EDE9E0; }
        .btn-gold { display:inline-flex; align-items:center; gap:8px; padding:13px 26px; background:#C9A66B; color:#0A0A0A; border-radius:100px; border:none; font-size:14px; font-weight:600; cursor:pointer; text-decoration:none; transition:transform 0.2s,box-shadow 0.2s; }
        .btn-gold:hover { transform:scale(1.03); box-shadow:0 8px 32px rgba(201,166,107,0.3); }
        @keyframes skeleton { 0%,100%{opacity:.3} 50%{opacity:.6} }
        .skel { animation:skeleton 1.5s ease-in-out infinite; background:#111; border-radius:20px; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation:fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) both; }
      `}</style>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "clamp(60px,8vw,100px) clamp(20px,4vw,48px)" }}>

        {/* Header */}
        <div style={{ marginBottom: 56, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: GD2, marginBottom: 16 }}>
              Escrow-gesicherter Handel
            </div>
            <h1 className="ph" style={{ fontSize: "clamp(40px,6vw,80px)", fontWeight: 500, color: TX, lineHeight: 1 }}>
              Marktplatz
            </h1>
          </div>
          <button onClick={() => { if (!user) { window.location.href = "/auth/login"; return; } setShowCreate(true); }}
            className="btn-gold" style={{ fontSize: 15 }}>
            + Inserieren ✦
          </button>
        </div>

        {/* Escrow info */}
        <div style={{ padding: "16px 24px", marginBottom: 40, background: "rgba(201,166,107,0.06)", border: "1px solid rgba(201,166,107,0.2)", borderRadius: 100, display: "inline-flex", alignItems: "center", gap: 12, fontSize: 13, color: GD2 }}>
          <span style={{ fontSize: 18 }}>✦</span>
          <span>Sicher via pokédax Escrow — Geld wird erst freigegeben wenn du den Erhalt bestätigst.</span>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 48 }}>
          {(["offer","want"] as const).map(t => (
            <button key={t} className={`tab-btn${tab===t?" active":""}`} onClick={() => setTab(t)}>
              {t === "offer" ? "Angebote" : "Gesuche"}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16 }}>
            {Array.from({length: 8}).map((_,i) => (
              <div key={i} className="skel" style={{ height: 140 }}/>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div style={{ textAlign: "center", padding: "100px 20px" }}>
            <div style={{ fontSize: 56, opacity: 0.1, marginBottom: 24, color: GOLD }}>◎</div>
            <h2 className="ph" style={{ fontSize: 32, fontWeight: 500, color: TX2, marginBottom: 16 }}>
              {tab === "offer" ? "Noch keine Angebote" : "Noch keine Gesuche"}
            </h2>
            <button onClick={() => setShowCreate(true)} className="btn-gold">Erstes Inserat erstellen</button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 16 }}>
            {listings.map((l, i) => {
              const card   = l.cards;
              const imgSrc = card?.image_url ? (card.image_url.includes(".") ? card.image_url : card.image_url + "/low.webp") : null;
              const isDeal = l.price && card?.price_market && l.price < card.price_market * 0.92;
              return (
                <div key={l.id} className={`listing-card fade-up${isDeal ? " deal" : ""}`} style={{ animationDelay: `${i * 30}ms` }}>
                  <div style={{ display: "flex", gap: 0 }}>
                    {/* Card image */}
                    <Link href={`/preischeck/${card?.id}`} style={{ textDecoration: "none", flexShrink: 0 }}>
                      <div style={{ width: 80, background: BG3, display: "flex", alignItems: "center", justifyContent: "center", padding: "10px 6px", alignSelf: "stretch" }}>
                        {imgSrc ? (
                          <img src={imgSrc} alt="" style={{ width: "100%", aspectRatio: "3/4", objectFit: "contain", borderRadius: 8 }}/>
                        ) : (
                          <div style={{ width: "100%", aspectRatio: "3/4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, opacity: 0.15 }}>◎</div>
                        )}
                      </div>
                    </Link>

                    {/* Info */}
                    <div style={{ flex: 1, padding: "16px 18px", minWidth: 0 }}>
                      {isDeal && (
                        <div style={{ fontSize: 9, fontWeight: 700, color: GOLD, letterSpacing: "0.1em", marginBottom: 6 }}>
                          ✦ DEAL · UNTER MARKTWERT
                        </div>
                      )}
                      <Link href={`/preischeck/${card?.id}`} style={{ textDecoration: "none" }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: TX, marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {card?.name_de || card?.name || "Karte"}
                        </div>
                      </Link>
                      <div style={{ fontSize: 10, color: "rgba(237,233,224,0.35)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
                        {card?.set_id} · #{card?.number} · {l.condition}
                      </div>
                      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                        <div className="ph" style={{ fontSize: 22, fontWeight: 500, color: GOLD }}>
                          {l.price ? l.price.toFixed(2) + " €" : "VHS"}
                        </div>
                        <div style={{ fontSize: 11, color: "rgba(237,233,224,0.35)" }}>
                          @{l.profiles?.username ?? "Anonym"}
                        </div>
                      </div>
                      {card?.price_market && l.price && (
                        <div style={{ fontSize: 10, color: "rgba(237,233,224,0.3)", marginTop: 4 }}>
                          Marktwert: {card.price_market.toFixed(2)} €
                          {isDeal && <span style={{ color: "#3db87a", marginLeft: 6 }}>↓ {((1 - l.price/card.price_market)*100).toFixed(0)}% günstiger</span>}
                        </div>
                      )}
                    </div>
                  </div>
                  {l.note && (
                    <div style={{ padding: "10px 18px", borderTop: "1px solid rgba(255,255,255,0.05)", fontSize: 12, color: TX2, fontStyle: "italic" }}>
                      „{l.note}"
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showCreate && (
        <CreateModal
          presellCardId={presellId}
          onClose={() => { setShowCreate(false); setPresellId(null); }}
          onCreated={() => { setShowCreate(false); setPresellId(null); loadListings(); }}
        />
      )}
    </div>
  );
}

function CreateModal({ presellCardId, onClose, onCreated }: {
  presellCardId: string|null; onClose: ()=>void; onCreated: ()=>void;
}) {
  const [search,    setSearch]    = useState("");
  const [results,   setResults]   = useState<any[]>([]);
  const [card,      setCard]      = useState<any>(null);
  const [type,      setType]      = useState<"offer"|"want">("offer");
  const [price,     setPrice]     = useState("");
  const [condition, setCondition] = useState("NM");
  const [note,      setNote]      = useState("");
  const [loading,   setLoading]   = useState(false);
  const [msg,       setMsg]       = useState("");

  useEffect(() => {
    if (!presellCardId) return;
    SB.from("cards").select("id,name,name_de,set_id,number,image_url,price_market")
      .eq("id", presellCardId).single()
      .then(({ data }) => { if (data) { setCard(data); setSearch(data.name_de || data.name); } });
  }, [presellCardId]);

  async function searchCards(q: string) {
    setSearch(q);
    if (q.length < 2) { setResults([]); return; }
    try {
      const url = "/api/cards/search?q=" + encodeURIComponent(q) + "&limit=6";
      const res = await fetch(url);
      if (!res.ok) { console.error("Search failed:", res.status); return; }
      const data = await res.json();
      console.log("Search results:", data);
      setResults(data.cards ?? []);
    } catch(err) {
      console.error("Search error:", err);
      // Fallback: search directly in Supabase
      const { data } = await SB.from("cards")
        .select("id,name,name_de,set_id,number,image_url,price_market")
        .or("name.ilike.*" + q + "*,name_de.ilike.*" + q + "*")
        .limit(6);
      setResults(data ?? []);
    }
  }

  async function submit() {
    if (!card) { setMsg("Bitte eine Karte wählen."); return; }
    setLoading(true);
    try {
      const { data: { session } } = await SB.auth.getSession();
      if (!session) { window.location.href = "/auth/login"; return; }

      // Direct Supabase insert (more reliable than API route)
      const { error } = await SB.from("marketplace_listings").insert({
        user_id:   session.user.id,
        seller_id: session.user.id,
        card_id:   card.id,
        type,
        price:     price ? parseFloat(price) : null,
        condition,
        note:      note.trim() || null,
        is_active: true,
      });

      if (error) { setMsg("Fehler: " + error.message); setLoading(false); return; }
      setMsg("✓ Inserat erstellt!");
      setTimeout(onCreated, 800);
    } catch (e: any) { setMsg("Fehler: " + e.message); }
    setLoading(false);
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#0F0F0F", borderRadius: 24, width: "100%", maxWidth: 520, padding: 36, position: "relative", border: "1px solid rgba(201,166,107,0.2)", maxHeight: "90vh", overflow: "auto" }}>
        <div style={{ position: "absolute", top: 0, left: "20%", right: "20%", height: 1, background: "linear-gradient(90deg,transparent,rgba(201,166,107,0.5),transparent)" }}/>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", fontSize: 22, cursor: "pointer", color: TX2 }}>×</button>

        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: GD2, marginBottom: 8 }}>Marktplatz</div>
        <h2 className="ph" style={{ fontSize: 32, fontWeight: 500, marginBottom: 28, color: TX }}>Inserat erstellen</h2>

        {/* Type toggle */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {(["offer","want"] as const).map(t => (
            <button key={t} onClick={() => setType(t)} style={{
              flex: 1, padding: "13px", borderRadius: 100, cursor: "pointer",
              background: type === t ? TX : "rgba(255,255,255,0.04)",
              color: type === t ? BG : TX2,
              border: `1px solid ${type === t ? TX : "rgba(255,255,255,0.1)"}`,
              fontSize: 14, fontWeight: 600, transition: "all 0.2s",
            }}>{t === "offer" ? "Anbieten" : "Suchen"}</button>
          ))}
        </div>

        {/* Card search */}
        <div style={{ marginBottom: 16, position: "relative" }}>
          <input value={search} onChange={e => searchCards(e.target.value)}
            placeholder="Karte suchen…"
            style={{ width: "100%", padding: "14px 18px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: TX, fontSize: 15, outline: "none", fontFamily: "inherit", transition: "border-color 0.2s" }}
            onFocus={e => (e.target as any).style.borderColor = "rgba(201,166,107,0.4)"}
            onBlur={e  => (e.target as any).style.borderColor = "rgba(255,255,255,0.1)"}/>
          {results.length > 0 && (
            <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 9999, background: "#111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0 0 12px 12px", boxShadow: "0 16px 40px rgba(0,0,0,0.6)" }}>
              {results.map((r: any) => (
                <button key={r.id} onClick={() => { setCard(r); setSearch(r.name_de || r.name); setResults([]); }} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  width: "100%", padding: "12px 16px", background: "none", border: "none",
                  cursor: "pointer", textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.06)",
                  transition: "background 0.1s",
                }}
                onMouseEnter={e => (e.currentTarget as any).style.background = "rgba(255,255,255,0.04)"}
                onMouseLeave={e => (e.currentTarget as any).style.background = "none"}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: TX }}>{r.name_de || r.name}</div>
                  <div style={{ fontSize: 11, color: GD2, marginLeft: "auto", flexShrink: 0 }}>
                    {r.set_id} · #{r.number}{r.price_market ? ` · ${r.price_market.toFixed(2)} €` : ""}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected card */}
        {card && (
          <div style={{ display: "flex", gap: 12, padding: "12px 14px", background: "rgba(201,166,107,0.06)", borderRadius: 12, marginBottom: 20, alignItems: "center", border: "1px solid rgba(201,166,107,0.15)" }}>
            {card.image_url && (
              <img src={card.image_url.includes(".") ? card.image_url : card.image_url + "/low.webp"}
                alt="" style={{ width: 36, height: 50, objectFit: "contain", borderRadius: 4 }}/>
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: TX }}>{card.name_de || card.name}</div>
              <div style={{ fontSize: 11, color: GD2 }}>{card.set_id} · #{card.number}{card.price_market ? ` · Marktwert: ${card.price_market.toFixed(2)} €` : ""}</div>
            </div>
            <button onClick={() => { setCard(null); setSearch(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: TX2, fontSize: 18 }}>×</button>
          </div>
        )}

        {/* Price */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: GD2, marginBottom: 8 }}>Preis (€)</label>
          <input type="number" step="0.50" min="0" value={price} onChange={e => setPrice(e.target.value)}
            placeholder={card?.price_market ? `Marktwert: ${card.price_market.toFixed(2)} €` : "0.00"}
            style={{ width: "100%", padding: "14px 18px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: TX, fontSize: 15, outline: "none", fontFamily: "inherit" }}/>
        </div>

        {/* Condition */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: GD2, marginBottom: 8 }}>Zustand</label>
          <div style={{ display: "flex", gap: 6 }}>
            {["NM","LP","MP","HP","D"].map(c => (
              <button key={c} onClick={() => setCondition(c)} style={{
                flex: 1, padding: "10px 0", borderRadius: 100, fontSize: 12, fontWeight: 600, cursor: "pointer",
                border: "1px solid", transition: "all 0.15s",
                borderColor: condition === c ? "rgba(201,166,107,0.5)" : "rgba(255,255,255,0.1)",
                background: condition === c ? "rgba(201,166,107,0.12)" : "transparent",
                color: condition === c ? GOLD : TX2,
              }}>{c}</button>
            ))}
          </div>
        </div>

        {/* Note */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: GD2, marginBottom: 8 }}>Notiz (optional)</label>
          <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
            placeholder="Zustand, Versand, etc."
            style={{ width: "100%", padding: "14px 18px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: TX, fontSize: 14, outline: "none", resize: "none", fontFamily: "inherit" }}/>
        </div>

        {msg && <div style={{ marginBottom: 16, fontSize: 13, color: msg.startsWith("✓") ? "#3db87a" : "#dc4a5a" }}>{msg}</div>}

        <button onClick={submit} disabled={loading || !card} className="btn-gold"
          style={{ width: "100%", justifyContent: "center", fontSize: 15, padding: "16px", opacity: loading || !card ? 0.5 : 1, borderRadius: 100 }}>
          {loading ? "Erstelle Inserat…" : "Inserat veröffentlichen ✦"}
        </button>
      </div>
    </div>
  );
}
