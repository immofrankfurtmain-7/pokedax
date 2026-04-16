"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const G="#D4A843",G18="rgba(212,168,67,0.18)",G08="rgba(212,168,67,0.08)";
const BG1="#16161A",BG2="#1C1C21",BR1="rgba(255,255,255,0.045)",BR2="rgba(255,255,255,0.085)";
const TX1="#F8F6F2",TX2="#BEB9B0",TX3="#6E6B66";

interface Card {
  id:string; name:string; name_de:string|null; number:string;
  image_url:string|null; price_market:number|null; rarity:string|null;
  types:string[]|null; is_holo:boolean;
}

export default function SetDetailPage() {
  const { id } = useParams() as { id: string };
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [setName, setSetName] = useState("");
  const [sort, setSort] = useState("number_asc");

  useEffect(() => {
    if (!id) return;
    loadSet();
  }, [id, sort]);

  async function loadSet() {
    setLoading(true);
    const sb = createClient();

    // Load set info
    const { data: setData } = await sb.from("sets")
      .select("name, name_de").eq("id", id).single();
    if (setData) setSetName(setData.name_de || setData.name);

    // Load cards — always filtered by set_id
    let q = sb.from("cards")
      .select("id,name,name_de,number,image_url,price_market,rarity,types,is_holo")
      .eq("set_id", id);

    if (sort === "price_desc") q = q.order("price_market", { ascending: false });
    else if (sort === "price_asc") q = q.order("price_market", { ascending: true });
    else q = q.order("number", { ascending: true });

    const { data } = await q.limit(500);
    // Sort by number as integer client-side (avoids text sort issues like 1,10,100,2)
    const sorted = (data || []).sort((a, b) => {
      const na = parseInt(a.number) || 0;
      const nb = parseInt(b.number) || 0;
      return sort === "price_desc" ? (b.price_market||0) - (a.price_market||0)
           : sort === "price_asc"  ? (a.price_market||0) - (b.price_market||0)
           : na - nb;
    });
    setCards(sorted);
    setLoading(false);
  }

  const formatPrice = (p: number | null) =>
    p ? p.toLocaleString("de-DE", { minimumFractionDigits: 2 }) + " €" : "–";

  return (
    <div style={{ color: TX1, minHeight: "100vh" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(48px,6vw,72px) clamp(16px,3vw,28px)" }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <Link href="/sets" style={{ fontSize: 12, color: TX3, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
            ← Alle Sets
          </Link>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: TX3, marginBottom: 8 }}>
                Set · {id.toUpperCase()}
              </div>
              <h1 style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 200, letterSpacing: "-.04em", margin: 0 }}>
                {setName || id}
              </h1>
              {!loading && (
                <div style={{ fontSize: 13, color: TX3, marginTop: 6 }}>
                  {cards.length} Karten
                </div>
              )}
            </div>
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              style={{
                background: BG2, border: `0.5px solid ${BR2}`, borderRadius: 10,
                color: TX1, padding: "8px 14px", fontSize: 13, cursor: "pointer",
              }}
            >
              <option value="number_asc">Nr. ↑</option>
              <option value="price_desc">Preis ↓</option>
              <option value="price_asc">Preis ↑</option>
            </select>
          </div>
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 80, color: TX3 }}>Lade Karten…</div>
        ) : cards.length === 0 ? (
          <div style={{ textAlign: "center", padding: 80, color: TX3 }}>Keine Karten gefunden</div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: 12,
          }}>
            {cards.map(card => (
              <Link key={card.id} href={`/preischeck/${card.id}`} style={{ textDecoration: "none" }}>
                <div style={{
                  background: "#16161A",
                  border: `1px solid ${card.price_market ? "rgba(212,168,67,0.15)" : "rgba(255,255,255,0.07)"}`,
                  borderRadius: 16, overflow: "hidden",
                  transition: "transform .2s, border-color .2s",
                  cursor: "pointer",
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(212,168,67,0.3)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.borderColor = card.price_market ? "rgba(212,168,67,0.15)" : "rgba(255,255,255,0.07)"; }}
                >
                  {/* Card Image — padded, smaller */}
                  <div style={{ padding: "8px 8px 0", background: "#1C1C21" }}>
                    <div style={{ aspectRatio: "3/4", borderRadius: 10, overflow: "hidden", background: "#222228", position: "relative", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      {card.image_url ? (
                        <img
                          src={card.image_url?.includes(".") ? card.image_url : card.image_url + "/low.webp"}
                          alt={card.name_de || card.name}
                          style={{ width: "100%", height: "100%", objectFit: "contain" }}
                          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      ) : (
                        <span style={{ fontSize: 28, opacity:.2, color:"#6E6B66" }}>◎</span>
                      )}
                      <div style={{
                        position: "absolute", bottom: 5, right: 5,
                        background: "rgba(0,0,0,0.65)", borderRadius: 4,
                        padding: "2px 5px", fontSize: 9, color: "#6E6B66",
                      }}>#{card.number}</div>
                    </div>
                  </div>

                  {/* Card Info */}
                  <div style={{ padding: "8px 10px 10px" }}>
                    <div style={{ fontSize: 11, fontWeight: 500, color: "#F8F6F2", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {card.name_de || card.name}
                    </div>
                    <div style={{ fontSize: 10, color: "#6E6B66", marginBottom: 5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {card.rarity || "–"}
                    </div>
                    <div style={{ fontSize: 13, fontFamily:"var(--font-mono)", fontWeight: 400, color: card.price_market ? "#EFD7A8" : "#6E6B66" }}>
                      {formatPrice(card.price_market)}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
