"use client";

import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const G = "#E9A84B";
const G20 = "rgba(233,168,75,0.20)";
const G12 = "rgba(233,168,75,0.12)";
const G08 = "rgba(233,168,75,0.08)";

const TYPE_COLORS: Record<string, string> = {
  Fire: "#F97316",
  Water: "#38BDF8",
  Grass: "#4ADE80",
  Lightning: "#E9A84B",
  Psychic: "#A855F7",
  Fighting: "#EF4444",
  Darkness: "#6B7280",
  Metal: "#9CA3AF",
  Dragon: "#7C3AED",
  Colorless: "#CBD5E1",
};

// Section divider
const Divider = () => (
  <div style={{ height: 1, background: "rgba(255,255,255,0.055)", margin: "0 24px" }} />
);

// Feature row for pricing
function Feat({ text, off }: { text: string; off?: boolean }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      fontSize: 11.5,
      color: off ? "#474664" : "#8C8BAA",
      textDecoration: off ? "line-through" : "none"
    }}>
      <div style={{
        width: 14,
        height: 14,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        background: off ? "rgba(255,255,255,0.03)" : "rgba(77,191,133,0.12)"
      }}>
        {!off && (
          <svg width="7" height="7" viewBox="0 0 8 8">
            <polyline points="1,4 3,6 7,1.5" stroke="#4DBF85" strokeWidth="1.3" fill="none" />
          </svg>
        )}
      </div>
      {text}
    </div>
  );
}

async function getData() {
  try {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const [cardsRes, usersRes, forumCountRes, trendRes, forumRes, portRes] = await Promise.all([
      sb.from("cards").select("*", { count: "exact", head: true }),
      sb.from("profiles").select("*", { count: "exact", head: true }),
      sb.from("forum_posts").select("*", { count: "exact", head: true }),
      sb.from("cards")
        .select("id,name,name_de,set_id,number,image_url,price_market,price_low,price_avg30,types,rarity")
        .not("price_market", "is", null)
        .gt("price_market", 5)
        .order("price_market", { ascending: false })
        .limit(8),
      sb.from("forum_posts")
        .select("id,title,upvotes,created_at,profiles(username),forum_categories(name)")
        .order("created_at", { ascending: false })
        .limit(4),
      sb.from("cards")
        .select("id,name,name_de,set_id,number,image_url,price_market,price_avg7,price_avg30")
        .not("price_market", "is", null)
        .gt("price_market", 5)
        .order("price_market", { ascending: false })
        .limit(5),
    ]);

    return {
      stats: {
        cards: cardsRes.count ?? 22271,
        users: usersRes.count ?? 3841,
        scans: 1247,
        forum: forumCountRes.count ?? 18330
      },
      cards: trendRes.data ?? [],
      posts: forumRes.data ?? [],
      portCards: portRes.data ?? [],
    };
  } catch {
    return {
      stats: { cards: 22271, users: 3841, scans: 1247, forum: 18330 },
      cards: [],
      posts: [],
      portCards: []
    };
  }
}

export default async function HomePage() {
  const { stats, cards, posts, portCards } = await getData();

  return (
    <div style={{
      background: "#05050D",
      color: "#F1ECF9",
      minHeight: "100vh",
      fontFamily: "Inter, system-ui, sans-serif",
      position: "relative",
      overflow: "hidden"
    }}>

      {/* Subtiler Canvas-Hintergrund */}
      <div style={{
        position: "fixed",
        inset: 0,
        background: `
          radial-gradient(circle at 25% 30%, rgba(233,168,75,0.065) 0%, transparent 48%),
          radial-gradient(circle at 78% 68%, rgba(233,168,75,0.048) 0%, transparent 52%)
        `,
        zIndex: 0,
        pointerEvents: "none"
      }} />

      {/* HERO */}
      <section style={{
        padding: "88px 24px 72px",
        textAlign: "center",
        position: "relative",
        zIndex: 2,
        background: "radial-gradient(ellipse 70% 48% at 50% 0%, rgba(233,168,75,0.06), transparent 75%)"
      }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "5px 14px",
          borderRadius: 20,
          marginBottom: 32,
          border: "1px solid rgba(233,168,75,0.25)",
          background: "rgba(233,168,75,0.06)",
          fontSize: 10.5,
          fontWeight: 500,
          color: G,
          letterSpacing: ".06em"
        }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: G, display: "inline-block" }} />
          LIVE CARDMARKET EUR • DEUTSCHLAND
        </div>

        <h1 style={{
          fontSize: "clamp(36px, 5.8vw, 54px)",
          fontWeight: 300,
          letterSpacing: "-0.042em",
          lineHeight: 1.08,
          marginBottom: 20,
        }}>
          Deine Karten.<br />
          <span style={{ fontWeight: 600, color: "#EDEAF6" }}>Ihr wahrer Wert.</span><br />
          <span style={{ color: "#474664", fontWeight: 300 }}>Jeden Tag.</span>
        </h1>

        <p style={{
          fontSize: 14.5,
          color: "#8C8BAA",
          maxWidth: 400,
          margin: "0 auto 40px",
          lineHeight: 1.75
        }}>
          Live-Preise von Cardmarket, KI-Scanner und Portfolio-Tracking — 
          präzise, schnell und immer aktuell.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 48 }}>
          <Link href="/preischeck" style={{
            padding: "13px 28px",
            borderRadius: 12,
            fontSize: 13.5,
            fontWeight: 600,
            background: G,
            color: "#09070E",
            textDecoration: "none",
            boxShadow: "0 0 0 1px rgba(233,168,75,0.4), 0 6px 28px rgba(233,168,75,0.25)"
          }}>
            Preis checken
          </Link>
          <Link href="/scanner" style={{
            padding: "13px 28px",
            borderRadius: 12,
            fontSize: 13.5,
            fontWeight: 400,
            color: "#8C8BAA",
            border: "1px solid rgba(255,255,255,0.16)",
            background: "transparent",
            textDecoration: "none"
          }}>
            Karte scannen →
          </Link>
        </div>

        {/* Stats Bar */}
        <div style={{
          display: "inline-grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          background: "#111122",
          border: "1px solid rgba(255,255,255,0.085)",
          borderRadius: 16,
          overflow: "hidden",
          maxWidth: 720,
          margin: "0 auto"
        }}>
          {[
            { n: stats.cards.toLocaleString("de-DE"), l: "Karten" },
            { n: "200", l: "Sets" },
            { n: stats.users.toLocaleString("de-DE"), l: "Nutzer" },
            { n: stats.forum.toLocaleString("de-DE"), l: "Forum-Posts" }
          ].map((s, i) => (
            <div key={s.l} style={{
              padding: "18px 20px",
              textAlign: "left",
              borderRight: i < 3 ? "1px solid rgba(255,255,255,0.055)" : "none"
            }}>
              <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.03em" }}>{s.n}</div>
              <div style={{ fontSize: 10.5, color: "#474664", marginTop: 4 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      <Divider />

      {/* TRENDING CARDS */}
      {cards.length > 0 && (
        <section style={{ padding: "36px 24px" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 20 }}>
            <h2 style={{ fontSize: 15, fontWeight: 500, letterSpacing: "-0.02em", color: "#EDEAF6", margin: 0 }}>Meistgesucht</h2>
            <Link href="/preischeck" style={{ fontSize: 12, color: "#474664", textDecoration: "none" }}>Alle ansehen →</Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 8 }}>
            {(cards as any[]).map(card => {
              const tc = TYPE_COLORS[card.types?.[0] ?? ""] ?? "#474664";
              const img = card.image_url ?? `https://assets.tcgdex.net/en/${card.set_id}/${card.number}/low.webp`;
              const name = card.name_de ?? card.name;
              const price = card.price_market ? `${Number(card.price_market).toFixed(2)}€` : card.price_low ? `ab ${Number(card.price_low).toFixed(2)}€` : "—";
              const pct = card.price_avg30 && card.price_avg30 > 0 ? ((card.price_market - card.price_avg30) / card.price_avg30 * 100) : null;
              const dots = card.rarity?.includes("Hyper") ? "✦✦✦" : card.rarity?.includes("Illus") ? "✦" : card.rarity?.includes("Holo") ? "●●" : "●";

              return (
                <Link key={card.id} href={`/preischeck?q=${encodeURIComponent(card.name)}`} style={{ textDecoration: "none" }}>
                  <div style={{
                    background: "#111122",
                    border: "1px solid rgba(255,255,255,0.055)",
                    borderRadius: 13,
                    overflow: "hidden",
                    transition: "transform .25s cubic-bezier(0.23,1,0.32,1), box-shadow .25s"
                  }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-6px)";
                      e.currentTarget.style.boxShadow = "0 20px 50px rgba(0,0,0,0.65), 0 0 35px rgba(233,168,75,0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div style={{ aspectRatio: "3/4", background: "#0D0D1A", position: "relative", overflow: "hidden" }}>
                      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 30%, ${tc}18, transparent 70%)` }} />
                      <img src={img} alt={name} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 6 }} />
                    </div>
                    <div style={{ padding: "10px 12px 14px" }}>
                      <div style={{ fontSize: 12.5, fontWeight: 500, color: "#EDEAF6", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</div>
                      <div style={{ fontSize: 9.5, color: "#474664", marginBottom: 8 }}>{String(card.set_id).toUpperCase()} · #{card.number}</div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 14.5, fontWeight: 600, fontFamily: "monospace", color: G }}>{price}</span>
                        {pct !== null && (
                          <span style={{ fontSize: 9.5, fontWeight: 600, color: pct >= 0 ? "#4DBF85" : "#E8495A" }}>
                            {pct >= 0 ? "▲" : "▼"} {Math.abs(pct).toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <Divider />

      {/* SCANNER + PORTFOLIO */}
      <section style={{ padding: "36px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {/* Scanner */}
          <div style={{ background: "#111122", border: "1px solid rgba(255,255,255,0.085)", borderRadius: 20, padding: "28px 28px 32px", position: "relative" }}>
            <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: "#474664", marginBottom: 10 }}>KI-Scanner</div>
            <div style={{ fontSize: 21, fontWeight: 400, lineHeight: 1.25, marginBottom: 12 }}>Foto machen.<br />Preis wissen.</div>
            <div style={{ fontSize: 13, color: "#8C8BAA", lineHeight: 1.6, marginBottom: 20 }}>KI erkennt deine Karte in Sekunden und zeigt den aktuellen Cardmarket-Wert.</div>
            <Link href="/scanner" style={{
              display: "block",
              textAlign: "center",
              padding: "12px",
              borderRadius: 12,
              background: G,
              color: "#09070E",
              fontSize: 13.5,
              fontWeight: 600,
              textDecoration: "none"
            }}>
              Jetzt scannen
            </Link>
          </div>

          {/* Portfolio */}
          <div style={{ background: "#111122", border: "1px solid rgba(255,255,255,0.085)", borderRadius: 20, padding: "28px 28px 32px" }}>
            <div style={{ fontSize: 38, fontWeight: 550, letterSpacing: "-0.04em" }}>2.847 €</div>
            <p style={{ color: "#4DBF85", marginTop: 8, fontSize: 16.5 }}>+18,4 % in 30 Tagen</p>
          </div>
        </div>
      </section>

      <Divider />

      {/* FORUM */}
      <section style={{ padding: "36px 24px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 500, letterSpacing: "-0.02em", color: "#EDEAF6", margin: 0 }}>Forum</h2>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 10, color: "#474664" }}>{stats.forum.toLocaleString("de-DE")} Beiträge</span>
            <Link href="/forum/new" style={{ padding: "4px 12px", borderRadius: 6, fontSize: 11, fontWeight: 500, background: "rgba(233,168,75,0.07)", color: G, border: "1px solid rgba(233,168,75,0.2)", textDecoration: "none" }}>+ Beitrag</Link>
          </div>
        </div>
        <div style={{ background: "#111122", border: "1px solid rgba(255,255,255,0.085)", borderRadius: 20, overflow: "hidden" }}>
          {posts.length > 0 ? (posts as any[]).map((post: any, i: number) => {
            const cat = post.forum_categories?.name ?? "Allgemein";
            const catColors: Record<string, { c: string; bg: string; br: string }> = {
              Preise: { c: "#E9A84B", bg: "rgba(233,168,75,0.08)", br: "rgba(233,168,75,0.2)" },
              Sammlung: { c: "#4DBF85", bg: "rgba(77,191,133,0.08)", br: "rgba(77,191,133,0.2)" },
              Strategie: { c: "#A855F7", bg: "rgba(168,85,247,0.08)", br: "rgba(168,85,247,0.2)" },
              News: { c: "#E9A84B", bg: "rgba(233,168,75,0.08)", br: "rgba(233,168,75,0.2)" },
              Tausch: { c: "#38BDF8", bg: "rgba(56,189,248,0.08)", br: "rgba(56,189,248,0.2)" },
              "Fake-Check": { c: "#3DBFB8", bg: "rgba(61,191,184,0.08)", br: "rgba(61,191,184,0.2)" },
            };
            const cs = catColors[cat] ?? { c: "#8C8BAA", bg: "rgba(255,255,255,0.05)", br: "rgba(255,255,255,0.1)" };
            const author = post.profiles?.username ?? "Anonym";
            const diff = Date.now() - new Date(post.created_at).getTime();
            const h = Math.floor(diff / 3600000);
            const ago = h < 1 ? "Gerade eben" : h < 24 ? `vor ${h} Std.` : `vor ${Math.floor(h / 24)} Tagen`;

            return (
              <Link key={post.id} href={`/forum/post/${post.id}`} style={{ textDecoration: "none" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 13, padding: "16px 22px", borderBottom: i < posts.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, color: "#8C8BAA", flexShrink: 0, marginTop: 1 }}>
                    {author[0]?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <span style={{ fontSize: 11.5, fontWeight: 500, color: "#EDEAF6" }}>{author}</span>
                      <span style={{ fontSize: 9, fontWeight: 600, padding: "1px 6px", borderRadius: 4, background: cs.bg, color: cs.c, border: `1px solid ${cs.br}` }}>{cat}</span>
                      <span style={{ fontSize: 10, color: "#474664", marginLeft: "auto" }}>{ago}</span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#EDEAF6", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", letterSpacing: "-0.01em", marginBottom: 4 }}>{post.title}</div>
                    <div style={{ display: "flex", gap: 12 }}>
                      <span style={{ fontSize: 10, color: "#474664" }}>
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2" style={{ verticalAlign: "middle", marginRight: 3 }}><path d="M10 2H2C1.4 2 1 2.4 1 3v5c0 .6.4 1 1 1h1l1.5 1.5L6 9h4c.6 0 1-.4 1-1V3c0-.6-.4-1-1-1z" /></svg>
                        {post.upvotes ?? 0} Upvotes
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          }) : (
            <div style={{ padding: "32px", textAlign: "center" }}>
              <div style={{ fontSize: 13, color: "#474664", marginBottom: 10 }}>Noch keine Beiträge</div>
              <Link href="/forum" style={{ fontSize: 12, color: G, textDecoration: "none" }}>Forum öffnen →</Link>
            </div>
          )}
          <div style={{ padding: "12px 22px", borderTop: "1px solid rgba(255,255,255,0.055)" }}>
            <Link href="/forum" style={{ fontSize: 12, color: "#474664", textDecoration: "none" }}>Alle Beiträge →</Link>
          </div>
        </div>
      </section>

      <Divider />

      {/* PRICING */}
      <section style={{ padding: "36px 24px" }}>
        <div style={{ marginBottom: 24, textAlign: "center" }}>
          <h2 style={{ fontSize: 15, fontWeight: 500, letterSpacing: "-0.02em", color: "#EDEAF6", margin: "0 0 6px" }}>Mitgliedschaft wählen</h2>
          <p style={{ fontSize: 12, color: "#474664" }}>Von Common bis Hyper Rare ✦✦✦</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>

          {/* Free */}
          <div style={{ background: "#111122", border: "1px solid rgba(255,255,255,0.085)", borderRadius: 20, padding: 20 }}>
            <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: ".08em", color: "#474664", marginBottom: 10 }}>COMMON ●</div>
            <div style={{ fontSize: 18, fontWeight: 550, letterSpacing: "-0.02em", color: "#8C8BAA", marginBottom: 3 }}>Free</div>
            <div style={{ fontSize: 30, fontWeight: 550, letterSpacing: "-0.04em", lineHeight: 1, color: "#EDEAF6" }}>0€</div>
            <div style={{ fontSize: 11, color: "#474664", marginBottom: 14 }}>für immer</div>
            <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.055)", margin: "14px 0" }} />
            <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 14 }}>
              <div style={{ width: 4, height: 4, borderRadius: "50%", background: G }} />
              {[1,2,3,4].map(i => <div key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(255,255,255,0.13)" }} />)}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
              <Feat text="5 Scans/Tag" />
              <Feat text="Basis-Preischeck" />
              <Feat text="Forum lesen" />
              <Feat text="Portfolio" off />
              <Feat text="Preis-Alerts" off />
            </div>
            <Link href="/auth/register" style={{ display: "block", textAlign: "center", padding: "10px", borderRadius: 10, background: "rgba(255,255,255,0.05)", color: "#8C8BAA", fontSize: 12.5, fontWeight: 600, textDecoration: "none" }}>Kostenlos starten</Link>
          </div>

          {/* Premium (featured) */}
          <div style={{
            background: "linear-gradient(160deg, rgba(233,168,75,0.045) 0%, #111122 55%)",
            border: "1px solid rgba(233,168,75,0.2)",
            borderRadius: 20,
            padding: 20,
            position: "relative"
          }}>
            <div style={{
              position: "absolute",
              top: -1,
              left: "50%",
              transform: "translateX(-50%)",
              padding: "3px 12px",
              background: G,
              color: "#09070E",
              fontSize: 8,
              fontWeight: 700,
              letterSpacing: ".08em",
              borderRadius: "0 0 7px 7px",
              whiteSpace: "nowrap"
            }}>BELIEBTESTE WAHL</div>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(233,168,75,0.4), transparent)", borderRadius: "20px 20px 0 0" }} />
            <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: ".08em", color: G, marginBottom: 10, marginTop: 8 }}>ILLUSTRATION RARE ✦</div>
            <div style={{ fontSize: 18, fontWeight: 550, letterSpacing: "-0.02em", color: G, marginBottom: 3 }}>Premium</div>
            <div style={{ fontSize: 30, fontWeight: 550, letterSpacing: "-0.04em", lineHeight: 1, color: G }}>6,99€</div>
            <div style={{ fontSize: 11, color: "#474664", marginBottom: 14 }}>pro Monat</div>
            <hr style={{ border: "none", borderTop: "1px solid rgba(233,168,75,0.1)", margin: "14px 0" }} />
            <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 14 }}>
              {[0,1,2,3].map(i => <div key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: G, opacity: i === 3 ? 1 : 0.5, boxShadow: i === 3 ? "0 0 6px rgba(233,168,75,0.5)" : undefined }} />)}
              <div style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(255,255,255,0.13)" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
              <Feat text="Unlimitierter Scanner" />
              <Feat text="Portfolio + Charts" />
              <Feat text="Preis-Alerts" />
              <Feat text="Exklusiv-Forum" />
              <Feat text="Grading-Beratung 2×/Mo" />
            </div>
            <Link href="/dashboard/premium" style={{
              display: "block",
              textAlign: "center",
              padding: "10px",
              borderRadius: 10,
              background: G,
              color: "#09070E",
              fontSize: 12.5,
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: "0 3px 16px rgba(233,168,75,0.22)"
            }}>Premium werden ✦</Link>
          </div>

          {/* Dealer */}
          <div style={{ background: "#111122", border: "1px solid rgba(233,168,75,0.12)", borderRadius: 20, padding: 20 }}>
            <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: ".08em", color: G, marginBottom: 10 }}>HYPER RARE ✦✦✦</div>
            <div style={{ fontSize: 18, fontWeight: 550, letterSpacing: "-0.02em", color: "#EDEAF6", marginBottom: 3 }}>Händler</div>
            <div style={{ fontSize: 30, fontWeight: 550, letterSpacing: "-0.04em", lineHeight: 1, color: "#EDEAF6" }}>19,99€</div>
            <div style={{ fontSize: 11, color: "#474664", marginBottom: 14 }}>pro Monat</div>
            <hr style={{ border: "none", borderTop: "1px solid rgba(233,168,75,0.08)", margin: "14px 0" }} />
            <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 14 }}>
              {[0,1,2,3,4,5].map(i => <div key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: G, opacity: i >= 4 ? 1 : 0.4, boxShadow: i >= 4 ? "0 0 6px rgba(233,168,75,0.5)" : undefined }} />)}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
              <Feat text="Alles aus Premium" />
              <Feat text="Verified Seller Badge ✅" />
              <Feat text="Eigene Shop-Seite" />
              <Feat text="API-Zugang (Beta)" />
              <Feat text="Priority Support 24/7" />
            </div>
            <Link href="/dashboard/premium?plan=dealer" style={{
              display: "block",
              textAlign: "center",
              padding: "10px",
              borderRadius: 10,
              background: "rgba(233,168,75,0.08)",
              color: G,
              fontSize: 12.5,
              fontWeight: 600,
              textDecoration: "none",
              border: "1px solid rgba(233,168,75,0.2)"
            }}>Händler werden ✦✦✦</Link>
          </div>

        </div>
        <p style={{ textAlign: "center", color: "#474664", fontSize: 11, marginTop: 16 }}>Alle Preise inkl. MwSt. · Monatlich kündbar · Sichere Zahlung via Stripe</p>
      </section>

    </div>
  );
}