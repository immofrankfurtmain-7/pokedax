import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props { params: { username: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `${params.username} – pokédax`,
    description: `Pokémon TCG Profil von ${params.username} auf pokédax`,
  };
}

const G="#E9A84B",BG1="#111113",BG2="#1a1a1f",BR2="rgba(255,255,255,0.085)";
const TX1="#f0f0f5",TX2="#a8a8b8",TX3="#6b6b7a",GREEN="#4BBF82";

export default async function ProfilePage({ params }: Props) {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: profile } = await sb
    .from("profiles")
    .select("id, username, avatar_url, is_premium, created_at")
    .eq("username", params.username)
    .single();

  if (!profile) notFound();

  const { data: posts } = await sb
    .from("forum_posts")
    .select("id, title, created_at, upvotes")
    .eq("author_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(4);

  const joined = new Date(profile.created_at).toLocaleDateString("de-DE", {
    month: "long", year: "numeric",
  });
  const initial = profile.username?.[0]?.toUpperCase() ?? "?";
  const isPrem = profile.is_premium;

  return (
    <div style={{ minHeight:"80vh", color:TX1 }}>
      <div style={{ maxWidth:520, margin:"0 auto", padding:"44px 28px" }}>

        {/* Back */}
        <Link href="/" style={{ display:"inline-flex", alignItems:"center", gap:6, color:TX3, fontSize:13, textDecoration:"none", marginBottom:28 }}>
          ← Zurück
        </Link>

        {/* Profile card */}
        <div style={{
          background: isPrem
            ? "linear-gradient(160deg,#0d0a2e,#1a1040,#0d0820)"
            : BG1,
          border: `1px solid ${isPrem ? "rgba(168,85,247,0.4)" : BR2}`,
          borderRadius:24, padding:"28px", marginBottom:16, position:"relative", overflow:"hidden",
        }}>
          {isPrem && (
            <div style={{ position:"absolute", top:0, left:0, right:0, height:1, background:"linear-gradient(90deg,transparent,rgba(168,85,247,0.5),transparent)" }}/>
          )}

          {/* Avatar + name */}
          <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:20 }}>
            <div style={{
              width:56, height:56, borderRadius:16, flexShrink:0,
              background: isPrem ? "rgba(168,85,247,0.15)" : BG2,
              border: `2px solid ${isPrem ? "rgba(168,85,247,0.4)" : BR2}`,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:22, fontWeight:600,
              color: isPrem ? "#C084FC" : TX2,
            }}>
              {initial}
            </div>
            <div>
              <div style={{ fontSize:20, fontWeight:300, letterSpacing:"-.035em", color:TX1, fontFamily:"var(--font-display)" }}>
                {profile.username}
                {isPrem && <span style={{ fontSize:12, color:"#C084FC", marginLeft:8 }}>✦ Premium</span>}
              </div>
              <div style={{ fontSize:12, color:TX3, marginTop:3 }}>Mitglied seit {joined}</div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            <div style={{ background:"rgba(255,255,255,0.03)", border:`1px solid rgba(255,255,255,0.06)`, borderRadius:12, padding:"12px 14px" }}>
              <div style={{ fontSize:9.5, color:TX3, marginBottom:4, textTransform:"uppercase", letterSpacing:".06em", fontWeight:600 }}>Mitgliedschaft</div>
              <div style={{ fontSize:14, fontWeight:500, color: isPrem ? "#C084FC" : TX2 }}>
                {isPrem ? "Premium ✦" : "Free"}
              </div>
            </div>
            <div style={{ background:"rgba(255,255,255,0.03)", border:`1px solid rgba(255,255,255,0.06)`, borderRadius:12, padding:"12px 14px" }}>
              <div style={{ fontSize:9.5, color:TX3, marginBottom:4, textTransform:"uppercase", letterSpacing:".06em", fontWeight:600 }}>Beiträge</div>
              <div style={{ fontSize:14, fontWeight:500, color:TX1 }}>{posts?.length ?? 0}</div>
            </div>
          </div>

          {!isPrem && (
            <Link href="/dashboard/premium" style={{
              display:"flex", alignItems:"center", justifyContent:"center", gap:6,
              padding:"10px", borderRadius:12, marginTop:12,
              background:G, color:"#0a0808",
              textDecoration:"none", fontSize:13, fontWeight:600,
            }}>
              Premium werden ✦
            </Link>
          )}
        </div>

        {/* Recent posts */}
        {posts && posts.length > 0 && (
          <div style={{ background:BG1, border:`1px solid ${BR2}`, borderRadius:18, overflow:"hidden" }}>
            <div style={{ padding:"12px 18px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
              <span style={{ fontSize:10, fontWeight:600, color:TX3, textTransform:"uppercase", letterSpacing:".1em" }}>
                Letzte Beiträge
              </span>
            </div>
            {posts.map((post, i) => (
              <Link key={post.id} href={`/forum/post/${post.id}`} style={{ display:"block", textDecoration:"none" }}>
                <div style={{
                  display:"flex", alignItems:"center", gap:12,
                  padding:"12px 18px",
                  borderBottom: i < posts.length-1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:500, color:TX2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", marginBottom:2 }}>
                      {post.title}
                    </div>
                    <div style={{ fontSize:10, color:TX3 }}>
                      {new Date(post.created_at).toLocaleDateString("de-DE")}
                    </div>
                  </div>
                  <span style={{ fontSize:10, color:TX3, flexShrink:0 }}>↑ {post.upvotes ?? 0}</span>
                </div>
              </Link>
            ))}
          </div>
        )}


        {/* Badges */}
        {badges.length > 0 && (
          <div style={{ marginBottom:24 }}>
            <div style={{ fontSize:10, fontWeight:600, letterSpacing:".1em", textTransform:"uppercase", color:"#62626f", marginBottom:12 }}>Badges</div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {badges.map((b:any)=>(
                <div key={b.badge_key} style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"5px 12px", borderRadius:8, background:"rgba(212,168,67,0.08)", border:"0.5px solid rgba(212,168,67,0.18)" }}>
                  <span style={{ fontSize:13 }}>{b.icon}</span>
                  <span style={{ fontSize:11, color:"#D4A843" }}>{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Seller Stats */}
        {seller && (seller.total_sales > 0 || seller.is_verified) && (
          <div style={{ marginBottom:24, background:"#111114", border:"0.5px solid rgba(255,255,255,0.085)", borderRadius:16, padding:"14px 16px" }}>
            <div style={{ fontSize:10, fontWeight:600, letterSpacing:".1em", textTransform:"uppercase", color:"#62626f", marginBottom:12 }}>Verkäufer-Statistik</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
              {seller.avg_rating > 0 && <div><div style={{ fontSize:9, color:"#62626f", marginBottom:3 }}>Bewertung</div><div style={{ fontSize:18, fontFamily:"var(--font-mono)", fontWeight:300, color:"#D4A843" }}>⭐ {seller.avg_rating?.toFixed(1)}</div><div style={{ fontSize:9, color:"#62626f" }}>{seller.rating_count} Bewertungen</div></div>}
              {seller.total_sales > 0 && <div><div style={{ fontSize:9, color:"#62626f", marginBottom:3 }}>Verkäufe</div><div style={{ fontSize:18, fontFamily:"var(--font-mono)", fontWeight:300, color:"#ededf2" }}>{seller.total_sales}</div></div>}
              {seller.is_verified && <div style={{ display:"flex", alignItems:"center", gap:6 }}><span style={{ fontSize:16, color:"#3db87a" }}>✓</span><span style={{ fontSize:12, color:"#3db87a" }}>Verifiziert</span></div>}
            </div>
          </div>
        )}

        {/* Reviews */}
        {reviews.length > 0 && (
          <div style={{ marginBottom:24 }}>
            <div style={{ fontSize:10, fontWeight:600, letterSpacing:".1em", textTransform:"uppercase", color:"#62626f", marginBottom:12 }}>Bewertungen</div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {reviews.map((r:any, i:number)=>(
                <div key={i} style={{ background:"#111114", border:"0.5px solid rgba(255,255,255,0.085)", borderRadius:12, padding:"12px 14px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                    <div style={{ fontSize:13, color:"#D4A843" }}>{"★".repeat(r.rating)}{"☆".repeat(5-r.rating)}</div>
                    <div style={{ fontSize:11, color:"#62626f" }}>von @{r.profiles?.username??"-"}</div>
                    <div style={{ fontSize:10, color:"#62626f", marginLeft:"auto" }}>{r.role==="buyer"?"Käufer":"Verkäufer"}</div>
                  </div>
                  {r.comment && <div style={{ fontSize:12, color:"#a4a4b4", lineHeight:1.6 }}>{r.comment}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
