import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

interface Props { params: Promise<{ username: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `@${username} — pokédax`,
    description: `Pokémon TCG Sammler @${username} auf pokédax`,
    openGraph: {
      title: `@${username} auf pokédax`,
      images: [`/api/og/profile/${username}`],
    },
  };
}

export default async function ProfilPage({ params }: Props) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id,username,avatar_url,created_at,is_premium")
    .eq("username", username)
    .single();

  if (!profile) notFound();

  const [
    { count: cardCount },
    { count: tradeCount },
    { data: badges },
    { data: topCards },
    { data: sellerStats },
  ] = await Promise.all([
    supabase.from("user_collection").select("id", { count: "exact", head: true }).eq("user_id", profile.id),
    supabase.from("escrow_transactions").select("id", { count: "exact", head: true })
      .or(`buyer_id.eq.${profile.id},seller_id.eq.${profile.id}`)
      .eq("status", "released"),
    supabase.from("user_badges").select("id,badge_key,label,icon,awarded_at").eq("user_id", profile.id).limit(10),
    supabase.from("user_collection")
      .select("cards(id,name,name_de,image_url,price_market)")
      .eq("user_id", profile.id).limit(6),
    supabase.from("seller_stats").select("*").eq("user_id", profile.id).single(),
  ]);

  const topCardsFlat = (topCards ?? [])
    .map((c: any) => Array.isArray(c.cards) ? c.cards[0] : c.cards)
    .filter(Boolean);

  const memberSince = new Date(profile.created_at).toLocaleDateString("de-DE", { month: "long", year: "numeric" });
  const initial = username[0]?.toUpperCase() ?? "U";

  const GOLD  = "#C9A66B";
  const BG    = "#0A0A0A";
  const BG2   = "#111111";
  const BG3   = "#1A1A1A";
  const TX    = "#EDE9E0";
  const TX2   = "rgba(237,233,224,0.7)";
  const GD2   = "rgba(201,166,107,0.7)";

  return (
    <div style={{ background: BG, minHeight: "100vh", color: TX }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;700&family=Instrument+Sans:wght@400;500;600&display=swap');
        .ph { font-family:'Playfair Display',serif; letter-spacing:-0.05em; }
        .card-tile { background:#111111; border:1px solid rgba(255,255,255,0.07); border-radius:16px; overflow:hidden; text-decoration:none; display:block; transition:transform 0.2s,border-color 0.2s; }
        .card-tile:hover { transform:translateY(-3px); border-color:rgba(201,166,107,0.2); }
        .badge-chip { display:inline-flex; align-items:center; gap:6px; padding:6px 14px; background:rgba(201,166,107,0.08); border:1px solid rgba(201,166,107,0.2); border-radius:100px; font-size:12px; font-weight:600; color:#C9A66B; }
      `}</style>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "clamp(60px,8vw,100px) clamp(20px,4vw,48px)" }}>

        {/* Profile header */}
        <div style={{ display: "flex", gap: 32, alignItems: "flex-start", marginBottom: 64, flexWrap: "wrap" }}>
          {/* Avatar */}
          <div style={{
            width: 96, height: 96, borderRadius: "50%", flexShrink: 0,
            background: "rgba(201,166,107,0.12)",
            border: `2px solid rgba(201,166,107,0.3)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 36, fontWeight: 700, color: GOLD,
          }}>
            {initial}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
              <h1 className="ph" style={{ fontSize: "clamp(32px,4vw,52px)", fontWeight: 500, color: TX, lineHeight: 1 }}>
                @{username}
              </h1>
              {profile.is_premium && (
                <span style={{ padding: "4px 14px", background: "rgba(201,166,107,0.12)", border: "1px solid rgba(201,166,107,0.3)", borderRadius: 100, fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: "0.1em" }}>
                  ✦ PREMIUM
                </span>
              )}
            </div>
            <div style={{ fontSize: 13, color: "rgba(237,233,224,0.4)", marginBottom: 20 }}>
              Mitglied seit {memberSince}
            </div>

            {/* Stats row */}
            <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
              {[
                { n: (cardCount ?? 0).toString(), l: "Karten" },
                { n: (tradeCount ?? 0).toString(), l: "Trades" },
                { n: (sellerStats?.data?.avg_rating ?? "–").toString(), l: "Bewertung" },
              ].map(({ n, l }) => (
                <div key={l}>
                  <div className="ph" style={{ fontSize: 28, fontWeight: 500, color: GOLD, lineHeight: 1, marginBottom: 2 }}>{n}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(237,233,224,0.4)" }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Badges */}
        {(badges ?? []).length > 0 && (
          <div style={{ marginBottom: 48 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: GD2, marginBottom: 16 }}>Badges</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {(badges ?? []).map((b: any) => (
                <div key={b.id} className="badge-chip">
                  {b.icon && <span>{b.icon}</span>}
                  {b.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top cards */}
        {topCardsFlat.length > 0 && (
          <div style={{ marginBottom: 48 }}>
            <div style={{ width: "100%", height: 1, background: "linear-gradient(90deg,transparent,rgba(201,166,107,0.2),transparent)", marginBottom: 32 }}/>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: GD2, marginBottom: 20 }}>
              Sammlung
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 12 }}>
              {topCardsFlat.map((card: any) => {
                const img = card.image_url?.includes(".") ? card.image_url : (card.image_url ? card.image_url + "/low.webp" : null);
                return (
                  <Link key={card.id} href={`/preischeck/${card.id}`} className="card-tile">
                    <div style={{ aspectRatio: "3/4", background: BG3, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                      {img && <img src={img} alt={card.name} style={{ width: "85%", height: "85%", objectFit: "contain" }} loading="lazy"/>}
                    </div>
                    <div style={{ padding: "8px 10px" }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: TX, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{card.name_de || card.name}</div>
                      {card.price_market && <div style={{ fontFamily: "monospace", fontSize: 12, color: GOLD }}>{card.price_market.toFixed(2)} €</div>}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Seller stats */}
        {sellerStats?.data && sellerStats.data.total_sales > 0 && (
          <div>
            <div style={{ width: "100%", height: 1, background: "linear-gradient(90deg,transparent,rgba(201,166,107,0.2),transparent)", marginBottom: 32 }}/>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: GD2, marginBottom: 20 }}>Händler-Profil</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12 }}>
              {[
                { l: "Verkäufe",     v: sellerStats.data.total_sales?.toString() ?? "0"          },
                { l: "Volumen",      v: (sellerStats.data.total_volume ?? 0).toFixed(0) + " €"   },
                { l: "Bewertung",    v: (sellerStats.data.avg_rating ?? 0).toFixed(1) + " / 5"  },
                { l: "Reaktionsrate",v: (sellerStats.data.response_rate ?? 0).toFixed(0) + " %" },
              ].map(({ l, v }) => (
                <div key={l} style={{ background: BG2, borderRadius: 16, padding: "20px", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: GD2, marginBottom: 8 }}>{l}</div>
                  <div className="ph" style={{ fontSize: 24, fontWeight: 500, color: GOLD }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
