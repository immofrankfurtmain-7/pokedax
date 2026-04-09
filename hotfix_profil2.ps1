# Hotfix profil - Next.js 15 async params
$root = "C:\Users\lenovo\pokedax\pokedax\pokedax"
$enc  = New-Object System.Text.UTF8Encoding $true

[System.IO.Directory]::CreateDirectory("$root\src\app\profil\[username]") | Out-Null

$r = @'
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props { params: Promise<{ username: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `@${username} — pokédax`,
    description: `Pokémon TCG Sammlung von @${username} auf pokédax`,
  };
}

const G="#D4A843",G18="rgba(212,168,67,0.18)",G08="rgba(212,168,67,0.08)";
const BG1="#111114",BG2="#18181c",BR1="rgba(255,255,255,0.045)",BR2="rgba(255,255,255,0.085)";
const TX1="#ededf2",TX2="#a4a4b4",TX3="#62626f",GREEN="#3db87a";

function getBadge(portfolioValue: number, salesCount: number) {
  if (portfolioValue >= 10000 || salesCount >= 100) return { label: "Champion",    color: "#D4A843", icon: "✦" };
  if (portfolioValue >= 3000  || salesCount >= 25)  return { label: "Elite Vier",  color: "#A78BFA", icon: "◆" };
  if (portfolioValue >= 1000  || salesCount >= 10)  return { label: "Arenaleiter", color: "#60A5FA", icon: "◈" };
  if (portfolioValue >= 200   || salesCount >= 1)   return { label: "Trainer",     color: GREEN,     icon: "◎" };
  return null;
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Profile
  const { data: profile } = await sb
    .from("profiles")
    .select("id, username, avatar_url, is_premium, created_at")
    .eq("username", username)
    .single();

  if (!profile) notFound();

  // Portfolio value: sum(price_market * quantity)
  const { data: collection } = await sb
    .from("user_collection")
    .select("quantity, cards!user_collection_card_id_fkey(price_market)")
    .eq("user_id", profile.id);

  const portfolioValue = (collection ?? []).reduce((sum: number, item: any) => {
    return sum + (item.cards?.price_market ?? 0) * (item.quantity ?? 1);
  }, 0);

  const collectionCount = (collection ?? []).reduce((s: number, i: any) => s + (i.quantity ?? 1), 0);

  // Active listings
  const { data: listings } = await sb
    .from("marketplace_listings")
    .select("id, price, condition, cards!marketplace_listings_card_id_fkey(id, name, name_de, set_id, number, image_url)")
    .eq("seller_id", profile.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(6);

  // Forum posts count
  const { count: postCount } = await sb
    .from("forum_posts")
    .select("id", { count: "exact", head: true })
    .eq("author_id", profile.id);

  // Completed sales count (for badge)
  const { count: salesCount } = await sb
    .from("escrow_transactions")
    .select("id", { count: "exact", head: true })
    .eq("seller_id", profile.id)
    .eq("status", "released");

  const badge    = getBadge(portfolioValue, salesCount ?? 0);
  const joined   = new Date(profile.created_at).toLocaleDateString("de-DE", { month: "long", year: "numeric" });
  const initial  = profile.username?.[0]?.toUpperCase() ?? "?";
  const isPrem   = profile.is_premium;

  return (
    <div style={{ color: TX1, minHeight: "80vh" }}>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "clamp(52px,7vw,80px) clamp(16px,3vw,28px)" }}>

        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 16, alignItems: "start" }}>

          {/* Left: Profile card */}
          <div>
            <div style={{
              background: BG1, border: `0.5px solid ${isPrem ? G18 : BR2}`,
              borderRadius: 18, padding: "22px", marginBottom: 12,
              position: "relative", overflow: "hidden",
            }}>
              {isPrem && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 0.5, background: `linear-gradient(90deg,transparent,${G},transparent)` }} />}

              {/* Avatar */}
              <div style={{
                width: 64, height: 64, borderRadius: 16, marginBottom: 14,
                background: isPrem ? G08 : BG2,
                border: `0.5px solid ${isPrem ? G18 : BR2}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 24, fontWeight: 300, color: isPrem ? G : TX2,
              }}>{initial}</div>

              {/* Name */}
              <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 200, letterSpacing: "-.04em", marginBottom: 4 }}>
                @{profile.username}
              </div>
              {isPrem && <div style={{ fontSize: 10, color: G, fontWeight: 600, letterSpacing: ".08em", marginBottom: 8 }}>✦ PREMIUM</div>}
              {badge && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 6, background: `${badge.color}10`, border: `0.5px solid ${badge.color}30`, marginBottom: 12 }}>
                  <span style={{ fontSize: 10, color: badge.color }}>{badge.icon}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: badge.color, letterSpacing: ".04em" }}>{badge.label.toUpperCase()}</span>
                </div>
              )}
              <div style={{ fontSize: 11, color: TX3 }}>Mitglied seit {joined}</div>
            </div>

            {/* Stats */}
            <div style={{ background: BG1, border: `0.5px solid ${BR2}`, borderRadius: 14, overflow: "hidden" }}>
              {[
                { l: "Portfolio-Wert", v: portfolioValue > 0 ? `${portfolioValue.toLocaleString("de-DE", { minimumFractionDigits: 0 })} €` : "—", gold: portfolioValue > 0 },
                { l: "Karten",         v: collectionCount > 0 ? String(collectionCount) : "—", gold: false },
                { l: "Beiträge",       v: String(postCount ?? 0), gold: false },
                { l: "Verkäufe",       v: String(salesCount ?? 0), gold: false },
              ].map(({ l, v, gold }, i, arr) => (
                <div key={l} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "11px 14px",
                  borderBottom: i < arr.length - 1 ? `0.5px solid ${BR1}` : undefined,
                }}>
                  <span style={{ fontSize: 12, color: TX3 }}>{l}</span>
                  <span style={{ fontSize: 13, fontFamily: "var(--font-mono)", fontWeight: 300, color: gold ? G : TX1 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Listings */}
          <div>
            {listings && listings.length > 0 ? (
              <div style={{ background: BG1, border: `0.5px solid ${BR2}`, borderRadius: 18, overflow: "hidden" }}>
                <div style={{ padding: "12px 16px", borderBottom: `0.5px solid ${BR1}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: TX3 }}>Aktive Listings</span>
                  <span style={{ fontSize: 11, color: TX3 }}>{listings.length}</span>
                </div>
                {listings.map((listing: any, i: number) => {
                  const card = listing.cards;
                  return (
                    <Link key={listing.id} href={`/preischeck/${card?.id}`} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "12px 16px",
                      borderBottom: i < listings.length - 1 ? `0.5px solid ${BR1}` : undefined,
                      textDecoration: "none",
                    }}>
                      <div style={{ width: 36, height: 50, borderRadius: 5, background: BG2, overflow: "hidden", flexShrink: 0 }}>
                        {card?.image_url && <img src={card.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, color: TX1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {card?.name_de || card?.name}
                        </div>
                        <div style={{ fontSize: 10, color: TX3 }}>{card?.set_id?.toUpperCase()} · {listing.condition}</div>
                      </div>
                      <div style={{ fontSize: 14, fontFamily: "var(--font-mono)", fontWeight: 300, color: G, flexShrink: 0 }}>
                        {listing.price?.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div style={{ background: BG1, border: `0.5px solid ${BR2}`, borderRadius: 18, padding: "48px", textAlign: "center" }}>
                <div style={{ fontSize: 13, color: TX3 }}>Keine aktiven Listings.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

'@
[System.IO.File]::WriteAllText("$root\src\app\profil\[username]\page.tsx", $r, $enc)
Write-Host "OK profil/[username]/page.tsx" -ForegroundColor Green
Write-Host "GitHub Desktop -> Commit -> Push" -ForegroundColor Yellow
