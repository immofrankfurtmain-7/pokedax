"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const GOLD = "#C9A66B";
const BG   = "#0A0A0A";
const BG2  = "#111111";
const TX   = "#EDE9E0";
const TX2  = "rgba(237,233,224,0.7)";
const GD2  = "rgba(201,166,107,0.7)";

const SB = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Item {
  id: string; quantity: number; condition: string;
  buy_price: number | null; buy_date: string | null;
  cards: { id:string; name:string; name_de:string|null; set_id:string; number:string; image_url:string|null; price_market:number|null; price_avg7:number|null; };
}

function calcROI(item: Item) {
  const cur    = (item.cards?.price_market ?? 0) * item.quantity;
  const cost   = (item.buy_price ?? 0) * item.quantity;
  const profit = cur - cost;
  const roi    = cost > 0 ? (profit / cost) * 100 : null;
  return { cur, cost, profit, roi };
}

export default function PortfolioPage() {
  const [user,     setUser]     = useState<any>(null);
  const [col,      setCol]      = useState<Item[]>([]);
  const [wish,     setWish]     = useState<any[]>([]);
  const [tab,      setTab]      = useState<"sammlung"|"wishlist">("sammlung");
  const [loading,  setLoading]  = useState(true);
  const [editId,   setEditId]   = useState<string|null>(null);
  const [editVal,  setEditVal]  = useState("");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await SB.auth.getUser();
      if (!user) { window.location.href = "/auth/login"; return; }
      setUser(user);
      const [{ data: cData }, { data: wData }] = await Promise.all([
        SB.from("user_collection")
          .select("id,quantity,condition,buy_price,buy_date,cards(id,name,name_de,set_id,number,image_url,price_market,price_avg7)")
          .eq("user_id", user.id).order("added_at", { ascending: false }).limit(200),
        SB.from("user_wishlist")
          .select("id,max_price,cards(id,name,name_de,set_id,number,image_url,price_market)")
          .eq("user_id", user.id).limit(100),
      ]);
      setCol((cData ?? []).map((c: any) => ({ ...c, cards: Array.isArray(c.cards) ? c.cards[0] : c.cards })));
      setWish((wData ?? []).map((w: any) => ({ ...w, cards: Array.isArray(w.cards) ? w.cards[0] : w.cards })));
      setLoading(false);
    }
    load();
  }, []);

  async function saveBuyPrice(itemId: string) {
    const price = parseFloat(editVal);
    if (!isNaN(price) && price >= 0) {
      try {
        await SB.from("user_collection").update({ buy_price: price }).eq("id", itemId);
        setCol(prev => prev.map(c => c.id === itemId ? { ...c, buy_price: price } : c));
      } catch {}
    }
    setEditId(null);
  }

  function exportCSV() {
    const rows = [
      ["Name","Set","Nr.","Zustand","Menge","Kaufpreis","Marktwert","Gewinn","ROI %"],
      ...col.map(c => {
        const { cur, cost, profit, roi } = calcROI(c);
        return [c.cards?.name_de||c.cards?.name||"", c.cards?.set_id||"", c.cards?.number||"", c.condition, c.quantity, cost>0?cost.toFixed(2):"", cur.toFixed(2), cost>0?profit.toFixed(2):"", roi!==null?roi.toFixed(1)+"%":""];
      })
    ];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "pokedax-portfolio.csv"; a.click();
  }

  const fmt = (n: number) => n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const totalValue  = col.reduce((s,c) => s + (c.cards?.price_market??0)*c.quantity, 0);
  const totalCost   = col.reduce((s,c) => s + (c.buy_price??0)*c.quantity, 0);
  const totalProfit = totalValue - totalCost;
  const totalROI    = totalCost > 0 ? (totalProfit/totalCost)*100 : null;
  const cardCount   = col.reduce((s,c) => s + c.quantity, 0);

  if (loading) return (
    <div style={{ background: BG, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: GD2 }}>
      Lade Portfolio…
    </div>
  );

  return (
    <div style={{ background: BG, minHeight: "100vh", color: TX }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;700&display=swap');
        .ph { font-family:'Playfair Display',serif; letter-spacing:-0.05em; }
        .tab-btn { padding:10px 24px; border-radius:100px; border:1px solid transparent; font-size:14px; cursor:pointer; transition:all 0.2s; background:transparent; }
        .tab-btn.active { background:rgba(201,166,107,0.1); border-color:rgba(201,166,107,0.3); color:#C9A66B; font-weight:600; }
        .tab-btn:not(.active) { color:rgba(237,233,224,0.5); }
        .row-item { display:grid; grid-template-columns:52px 1fr 90px 110px 110px 100px 90px; gap:12px; padding:12px 16px; background:#111111; border-bottom:1px solid rgba(255,255,255,0.05); align-items:center; transition:background 0.15s; }
        .row-item:hover { background:#151515; }
        .row-item:last-child { border-bottom:none; }
        .edit-input { width:80px; padding:6px 10px; background:rgba(255,255,255,0.06); border:1px solid rgba(201,166,107,0.4); border-radius:100px; color:#EDE9E0; font-size:12px; outline:none; text-align:right; font-family:inherit; }
        .btn-gold { display:inline-flex; align-items:center; gap:6px; padding:10px 20px; background:#C9A66B; color:#0A0A0A; border-radius:100px; border:none; font-size:13px; font-weight:600; cursor:pointer; text-decoration:none; transition:transform 0.2s; }
        .btn-gold:hover { transform:scale(1.03); }
        .btn-outline { display:inline-flex; padding:10px 18px; border:1px solid rgba(201,166,107,0.3); color:#C9A66B; border-radius:100px; font-size:13px; text-decoration:none; background:transparent; cursor:pointer; transition:all 0.2s; }
        .btn-outline:hover { background:#C9A66B; color:#0A0A0A; }
        .card-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:20px; }
        .wish-card { background:#111111; border:1px solid rgba(255,255,255,0.06); border-radius:20px; overflow:hidden; text-decoration:none; display:block; transition:transform 0.2s,border-color 0.2s; }
        .wish-card:hover { transform:translateY(-4px); border-color:rgba(201,166,107,0.25); }
        @keyframes skeleton { 0%,100%{opacity:.3} 50%{opacity:.6} }
        @media(max-width:900px){ .row-item{grid-template-columns:44px 1fr 80px 90px!important} .hide-mob{display:none!important} }
      `}</style>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "clamp(60px,8vw,100px) clamp(20px,4vw,48px)" }}>

        {/* Header */}
        <div style={{ marginBottom: 48, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: GD2, marginBottom: 16 }}>Deine Sammlung</div>
            <h1 className="ph" style={{ fontSize: "clamp(36px,5vw,64px)", fontWeight: 500, color: TX, lineHeight: 1 }}>
              {user?.email?.split("@")[0]}'s<br/><span style={{ color: GOLD }}>Portfolio</span>
            </h1>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={exportCSV} className="btn-outline">↓ CSV</button>
            <Link href="/scanner" className="btn-gold">+ Karte scannen</Link>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 1, border: "1px solid rgba(201,166,107,0.15)", borderRadius: 20, overflow: "hidden", marginBottom: 48 }}>
          {[
            { l: "Sammlungswert", v: fmt(totalValue) + " €", highlight: true },
            { l: "Investiert", v: totalCost > 0 ? fmt(totalCost) + " €" : "–" },
            { l: "Gewinn / Verlust", v: totalCost > 0 ? (totalProfit >= 0 ? "+" : "") + fmt(totalProfit) + " €" : "–", color: totalCost > 0 ? (totalProfit >= 0 ? "#3db87a" : "#dc4a5a") : undefined },
            { l: "ROI", v: totalROI !== null ? (totalROI >= 0 ? "+" : "") + totalROI.toFixed(1) + "%" : "–", color: totalROI !== null ? (totalROI >= 0 ? "#3db87a" : "#dc4a5a") : undefined },
            { l: "Karten", v: cardCount.toString() },
          ].map(({ l, v, highlight, color }, i) => (
            <div key={l} style={{ padding: "clamp(20px,3vw,28px)", background: highlight ? TX : BG2, borderRight: i < 4 ? "1px solid rgba(201,166,107,0.1)" : undefined }}>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: highlight ? "rgba(10,10,10,0.5)" : GD2, marginBottom: 10 }}>{l}</div>
              <div className="ph" style={{ fontSize: "clamp(22px,3vw,36px)", fontWeight: 500, letterSpacing: "-0.04em", color: highlight ? BG : (color ?? GOLD), lineHeight: 1 }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
          {(["sammlung", "wishlist"] as const).map(t => (
            <button key={t} className={`tab-btn${tab===t?" active":""}`} onClick={() => setTab(t)}>
              {t === "sammlung" ? "Sammlung" : "Wunschliste"}
              <span style={{ marginLeft: 8, fontSize: 11, opacity: 0.5 }}>({t === "sammlung" ? col.length : wish.length})</span>
            </button>
          ))}
        </div>

        {/* Collection Table */}
        {tab === "sammlung" && (
          col.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 20px" }}>
              <div style={{ fontSize: 48, opacity: 0.15, marginBottom: 20, color: GOLD }}>◎</div>
              <div style={{ fontSize: 18, color: TX2, marginBottom: 24 }}>Sammlung ist noch leer</div>
              <Link href="/scanner" className="btn-gold">Erste Karte scannen ✦</Link>
            </div>
          ) : (
            <div style={{ background: BG2, borderRadius: 20, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}>
              {/* Table header */}
              <div className="row-item" style={{ background: "#0D0D0D", borderBottom: "1px solid rgba(201,166,107,0.1)" }}>
                {["", "Karte", "Zustand", "Kaufpreis", "Marktwert", "Gewinn", "ROI"].map((h,i) => (
                  <div key={i} className={`${i > 1 ? "hide-mob" : ""}`} style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: GD2, textAlign: i > 1 ? "right" : "left" }}>{h}</div>
                ))}
              </div>

              {col.map(item => {
                const card = item.cards;
                if (!card) return null;
                const { cur, cost, profit, roi } = calcROI(item);
                const hasCost = item.buy_price !== null && item.buy_price > 0;
                const imgSrc  = card.image_url ? (card.image_url.includes(".") ? card.image_url : card.image_url + "/low.webp") : null;
                return (
                  <div key={item.id} className="row-item">
                    <div style={{ width: 44, height: 60, borderRadius: 6, overflow: "hidden", background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
                      {imgSrc && <img src={imgSrc} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }}/>}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <Link href={`/preischeck/${card.id}`} style={{ textDecoration: "none" }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: TX, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{card.name_de || card.name}</div>
                      </Link>
                      <div style={{ fontSize: 10, color: "rgba(237,233,224,0.3)", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 2 }}>
                        {card.set_id} · #{card.number}{item.quantity > 1 ? ` · ×${item.quantity}` : ""}
                      </div>
                    </div>
                    <div className="hide-mob" style={{ textAlign: "right", fontSize: 12, color: TX2 }}>{item.condition}</div>
                    {/* Buy price — editable */}
                    <div className="hide-mob" style={{ textAlign: "right" }}>
                      {editId === item.id ? (
                        <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                          <input className="edit-input" type="number" step="0.01" min="0" autoFocus
                            value={editVal} onChange={e => setEditVal(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter") saveBuyPrice(item.id); if (e.key === "Escape") setEditId(null); }}/>
                          <button onClick={() => saveBuyPrice(item.id)} style={{ padding: "4px 8px", background: GOLD, color: BG, border: "none", borderRadius: 100, cursor: "pointer", fontSize: 11 }}>✓</button>
                        </div>
                      ) : (
                        <button onClick={() => { setEditId(item.id); setEditVal(item.buy_price?.toString() ?? ""); }} style={{
                          background: "none", border: "none", cursor: "pointer",
                          fontFamily: "monospace", fontSize: 13,
                          color: hasCost ? TX : "rgba(237,233,224,0.25)",
                          textDecoration: hasCost ? "none" : "underline dotted",
                        }}>
                          {hasCost ? fmt(cost) + " €" : "Eintragen"}
                        </button>
                      )}
                    </div>
                    <div className="hide-mob" style={{ textAlign: "right", fontFamily: "monospace", fontSize: 13, color: GOLD }}>{cur > 0 ? fmt(cur) + " €" : "–"}</div>
                    <div className="hide-mob" style={{ textAlign: "right", fontFamily: "monospace", fontSize: 13, color: hasCost ? (profit >= 0 ? "#3db87a" : "#dc4a5a") : "rgba(237,233,224,0.25)" }}>
                      {hasCost ? (profit >= 0 ? "+" : "") + fmt(profit) + " €" : "–"}
                    </div>
                    <div className="hide-mob" style={{ textAlign: "right", fontSize: 13, fontWeight: 600, color: hasCost ? (roi! >= 0 ? "#3db87a" : "#dc4a5a") : "rgba(237,233,224,0.25)" }}>
                      {roi !== null ? (roi >= 0 ? "+" : "") + roi.toFixed(1) + "%" : "–"}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* Wishlist */}
        {tab === "wishlist" && (
          wish.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 20px" }}>
              <div style={{ fontSize: 48, opacity: 0.15, marginBottom: 20, color: GOLD }}>◉</div>
              <div style={{ fontSize: 18, color: TX2, marginBottom: 24 }}>Wunschliste ist leer</div>
              <Link href="/preischeck" className="btn-gold">Karten entdecken</Link>
            </div>
          ) : (
            <div className="card-grid">
              {wish.map((w: any) => {
                const card = w.cards;
                if (!card) return null;
                const imgSrc = card.image_url?.includes(".") ? card.image_url : (card.image_url ? card.image_url + "/low.webp" : null);
                const isDeal = w.max_price && card.price_market && card.price_market <= w.max_price;
                return (
                  <Link key={w.id} href={`/preischeck/${card.id}`} className="wish-card">
                    <div style={{ aspectRatio: "3/4", background: "#1A1A1A", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}>
                      {imgSrc && <img src={imgSrc} alt={card.name} style={{ width: "85%", height: "85%", objectFit: "contain" }}/>}
                      {isDeal && <div style={{ position: "absolute", top: 10, right: 10, padding: "3px 8px", borderRadius: 100, background: "rgba(201,166,107,0.2)", color: GOLD, fontSize: 9, fontWeight: 700, border: "1px solid rgba(201,166,107,0.3)" }}>DEAL ✦</div>}
                    </div>
                    <div style={{ padding: "12px 14px 16px" }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: TX, marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{card.name_de || card.name}</div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <div style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 600, color: GOLD }}>{card.price_market?.toFixed(2)} €</div>
                        {w.max_price && <div style={{ fontSize: 10, color: "rgba(237,233,224,0.3)" }}>Limit: {w.max_price.toFixed(2)} €</div>}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );
}
