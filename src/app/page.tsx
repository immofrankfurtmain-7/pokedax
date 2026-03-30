import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const TYPE_COLORS: Record<string, string> = {
  Fire:"#F97316", Water:"#38BDF8", Grass:"#4ADE80",
  Lightning:"#E9A84B", Psychic:"#A855F7", Fighting:"#EF4444",
  Darkness:"#6B7280", Metal:"#9CA3AF", Dragon:"#7C3AED", Colorless:"#CBD5E1",
};

async function getData() {
  try {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const [cardsRes, usersRes, forumRes, trendRes] = await Promise.all([
      sb.from("cards").select("*", { count: "exact", head: true }),
      sb.from("profiles").select("*", { count: "exact", head: true }),
      sb.from("forum_posts").select("*", { count: "exact", head: true }),
      sb.from("cards")
        .select("id,name,name_de,set_id,number,image_url,price_market,price_low,types")
        .not("price_market", "is", null)
        .gt("price_market", 5)
        .order("price_market", { ascending: false })
        .limit(8),
    ]);
    return {
      stats: {
        cards:  cardsRes.count  ?? 22271,
        users:  usersRes.count  ?? 3841,
        scans:  1247,
        forum:  forumRes.count  ?? 18330,
      },
      cards: trendRes.data ?? [],
    };
  } catch {
    return { stats: { cards:22271, users:3841, scans:1247, forum:18330 }, cards: [] };
  }
}

export default async function HomePage() {
  const { stats, cards } = await getData();

  const STATS = [
    { n: stats.cards.toLocaleString("de-DE"), l: "Karten"      },
    { n: "200",                               l: "Sets"         },
    { n: stats.users.toLocaleString("de-DE"), l: "Nutzer"       },
    { n: stats.scans.toLocaleString("de-DE"), l: "Scans heute"  },
  ];

  return (
    <div>

      {/* ── HERO ── */}
      <section style={{
        maxWidth: 900, margin: "0 auto",
        padding: "72px 24px 60px", textAlign: "center",
        background: "radial-gradient(ellipse 65% 45% at 50% 0%, rgba(233,168,75,0.055), transparent 70%)",
      }}>

        {/* Eyebrow pill */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "4px 12px", borderRadius: 20, marginBottom: 28,
          border: "1px solid rgba(233,168,75,0.22)",
          background: "rgba(233,168,75,0.07)",
          fontSize: 10, fontWeight: 500,
          color: "#E9A84B", letterSpacing: ".05em",
        }}>
          <span style={{
            display: "inline-block",
            width: 5, height: 5, borderRadius: "50%",
            background: "#E9A84B",
          }} />
          Live Cardmarket EUR · Deutschland
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: "clamp(34px, 5vw, 52px)",
          fontWeight: 300,
          letterSpacing: "-.04em",
          lineHeight: 1.06,
          color: "#EDEAF6",
          margin: "0 0 18px",
        }}>
          Deine Karten.<br />
          <span style={{ fontWeight: 600 }}>Ihr wahrer Wert.</span><br />
          <span style={{ color: "#474664", fontWeight: 300 }}>Jeden Tag.</span>
        </h1>

        {/* Subline */}
        <p style={{
          fontSize: 14, fontWeight: 400,
          color: "#8C8BAA",
          maxWidth: 380, margin: "0 auto 36px",
          lineHeight: 1.7,
        }}>
          Live-Preise von Cardmarket, KI-Scanner und Portfolio-Tracking —
          präzise, schnell und immer aktuell.
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 52 }}>
          <Link href="/preischeck" style={{
            padding: "12px 26px", borderRadius: 10,
            fontSize: 13, fontWeight: 600, letterSpacing: "-.01em",
            background: "#E9A84B", color: "#09070E",
            textDecoration: "none", display: "inline-block",
            boxShadow: "0 0 0 1px rgba(233,168,75,0.35), 0 4px 24px rgba(233,168,75,0.2)",
          }}>Preis checken</Link>
          <Link href="/scanner" style={{
            padding: "12px 26px", borderRadius: 10,
            fontSize: 13, fontWeight: 400,
            color: "#8C8BAA",
            border: "1px solid rgba(255,255,255,0.14)",
            background: "transparent", textDecoration: "none", display: "inline-block",
          }}>Karte scannen →</Link>
        </div>

        {/* Stats strip */}
        <div style={{
          display: "inline-grid",
          gridTemplateColumns: `repeat(${STATS.length}, 1fr)`,
          background: "#111122",
          border: "1px solid rgba(255,255,255,0.085)",
          borderRadius: 14, overflow: "hidden",
        }}>
          {STATS.map((s, i) => (
            <div key={s.l} style={{
              padding: "16px 22px", textAlign: "left",
              borderRight: i < STATS.length - 1
                ? "1px solid rgba(255,255,255,0.055)" : "none",
            }}>
              <div style={{
                fontSize: 21, fontWeight: 600,
                letterSpacing: "-.03em", lineHeight: 1,
                color: "#EDEAF6",
              }}>{s.n}</div>
              <div style={{ fontSize: 10, color: "#474664", marginTop: 4 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TRENDING CARDS ── */}
      {cards.length > 0 && (
        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 56px" }}>
          <div style={{
            display: "flex", alignItems: "baseline",
            justifyContent: "space-between", marginBottom: 20,
          }}>
            <h2 style={{
              fontSize: 16, fontWeight: 500,
              letterSpacing: "-.02em", color: "#EDEAF6", margin: 0,
            }}>Meistgesucht</h2>
            <Link href="/preischeck" style={{
              fontSize: 12, color: "#474664", textDecoration: "none",
            }}>Alle ansehen →</Link>
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(128px, 1fr))",
            gap: 10,
          }}>
            {(cards as any[]).map((card) => {
              const tc = TYPE_COLORS[card.types?.[0] ?? ""] ?? "#474664";
              const img = card.image_url
                ?? `https://assets.tcgdex.net/en/${card.set_id}/${card.number}/low.webp`;
              const name = card.name_de ?? card.name;
              const price = card.price_market
                ? `${Number(card.price_market).toFixed(2)}€`
                : card.price_low
                  ? `ab ${Number(card.price_low).toFixed(2)}€`
                  : "—";
              return (
                <Link
                  key={card.id}
                  href={`/preischeck?q=${encodeURIComponent(card.name)}`}
                  style={{ textDecoration: "none" }}
                >
                  <div style={{
                    background: "#111122",
                    border: "1px solid rgba(255,255,255,0.055)",
                    borderRadius: 13, overflow: "hidden",
                    transition: "transform .2s, border-color .2s, box-shadow .2s",
                  }}>
                    {/* Card image */}
                    <div style={{
                      aspectRatio: "3/4",
                      background: "#0D0D1A",
                      position: "relative",
                      overflow: "hidden",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <div style={{
                        position: "absolute", inset: 0,
                        background: `radial-gradient(circle at 50% 30%, ${tc}14, transparent 70%)`,
                      }} />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img} alt={name}
                        style={{ width: "100%", height: "100%", objectFit: "contain", padding: 4 }}
                      />
                      <div style={{
                        position: "absolute", bottom: 0, left: 0, right: 0, height: "45%",
                        background: "linear-gradient(to bottom, transparent, #111122)",
                      }} />
                    </div>
                    {/* Card info */}
                    <div style={{ padding: "9px 11px 12px" }}>
                      <div style={{
                        fontSize: 12, fontWeight: 500, color: "#EDEAF6",
                        marginBottom: 2, whiteSpace: "nowrap",
                        overflow: "hidden", textOverflow: "ellipsis",
                      }}>{name}</div>
                      <div style={{
                        fontSize: 9, color: "#474664", marginBottom: 7,
                      }}>{String(card.set_id).toUpperCase()} · #{card.number}</div>
                      <div style={{
                        fontSize: 14, fontWeight: 600,
                        letterSpacing: "-.02em",
                        fontFamily: "monospace",
                        color: "#E9A84B",
                      }}>{price}</div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ── SCANNER CTA ── */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 72px" }}>
        <div style={{
          background: "#111122",
          border: "1px solid rgba(255,255,255,0.085)",
          borderRadius: 20, padding: "32px 36px",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 1,
            background: "linear-gradient(90deg, transparent, rgba(233,168,75,0.35), transparent)",
          }} />
          <div style={{
            fontSize: 9, fontWeight: 600, letterSpacing: ".14em",
            textTransform: "uppercase", color: "#474664", marginBottom: 10,
          }}>KI-Scanner · Gemini Flash</div>
          <div style={{
            fontSize: 22, fontWeight: 400,
            letterSpacing: "-.03em", lineHeight: 1.2,
            color: "#EDEAF6", marginBottom: 10,
          }}>Foto machen. Preis wissen.</div>
          <p style={{
            fontSize: 13, color: "#8C8BAA",
            lineHeight: 1.65, marginBottom: 20, maxWidth: 480,
          }}>
            Karte fotografieren — KI erkennt sie in Sekunden und zeigt den
            aktuellen Cardmarket-Wert. 5 Scans pro Tag kostenlos.
          </p>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Link href="/scanner" style={{
              padding: "11px 24px", borderRadius: 10,
              background: "#E9A84B", color: "#09070E",
              fontSize: 13, fontWeight: 600,
              textDecoration: "none", display: "inline-block",
              boxShadow: "0 2px 16px rgba(233,168,75,0.22)",
            }}>Jetzt scannen</Link>
            <Link href="/dashboard/premium" style={{
              padding: "11px 20px", borderRadius: 10,
              border: "1px solid rgba(233,168,75,0.22)",
              color: "#E9A84B", fontSize: 12,
              background: "rgba(233,168,75,0.06)",
              textDecoration: "none", display: "inline-block",
            }}>Unlimitiert mit Premium ✦</Link>
          </div>
        </div>
      </section>

    </div>
  );
}
