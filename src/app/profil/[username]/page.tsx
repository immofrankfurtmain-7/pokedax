import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageSquare, Crown } from "lucide-react";
import type { Metadata } from "next";

interface Props { params: { username: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `${params.username} – PokéDax Profil`,
    description: `Pokémon TCG Profil von ${params.username} auf PokéDax`,
  };
}

// Card design based on membership tier
function getCardStyle(isPremium: boolean, isDealer: boolean) {
  if (isDealer) return {
    gradient: "linear-gradient(160deg, #1a1000 0%, #2d1f00 40%, #1a0d00 100%)",
    border: "rgba(250,204,21,0.7)", glow: "rgba(250,204,21,0.3)",
    typeColor: "#FACC15", type: "Dragon", rarity: "Hyper Rare", symbol: "✦✦✦",
    hp: 340, dots: 6,
    texture: "repeating-linear-gradient(45deg,transparent,transparent 10px,rgba(250,204,21,0.03) 10px,rgba(250,204,21,0.03) 20px)",
    nameGradient: "linear-gradient(135deg,#FACC15,#f59e0b)",
    badgeLabel: "ULTRA HÄNDLER",
  };
  if (isPremium) return {
    gradient: "linear-gradient(160deg, #0d0a2e 0%, #1a1040 50%, #0d0820 100%)",
    border: "rgba(168,85,247,0.5)", glow: "rgba(168,85,247,0.2)",
    typeColor: "#A855F7", type: "Psychic", rarity: "Illustration Rare", symbol: "✦",
    hp: 180, dots: 4,
    texture: "repeating-linear-gradient(135deg,transparent,transparent 8px,rgba(168,85,247,0.04) 8px,rgba(168,85,247,0.04) 16px)",
    nameGradient: "linear-gradient(135deg,#C084FC,#A855F7)",
    badgeLabel: null,
  };
  return {
    gradient: "linear-gradient(160deg, #1a1a1a 0%, #222 100%)",
    border: "rgba(156,163,175,0.3)", glow: "rgba(156,163,175,0.1)",
    typeColor: "#9CA3AF", type: "Colorless", rarity: "Common", symbol: "●",
    hp: 60, dots: 1,
    texture: "",
    nameGradient: "",
    badgeLabel: null,
  };
}

export default async function ProfilePage({ params }: Props) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, is_premium, created_at")
    .eq("username", params.username)
    .single();

  if (!profile) notFound();

  const isOwn    = user?.id === profile.id;
  const isDealer = false; // future: check dealer plan
  const s        = getCardStyle(profile.is_premium, isDealer);

  const { data: posts, count: postCount } = await supabase
    .from("forum_posts")
    .select("id, title, created_at, upvotes", { count: "exact" })
    .eq("author_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(4);

  const joined = new Date(profile.created_at).toLocaleDateString("de-DE", { month: "long", year: "numeric" });
  const initials = profile.username?.[0]?.toUpperCase() || "?";

  return (
    <div style={{ minHeight:"100vh", color:"white" }}>
      <div style={{ height:2, background:`linear-gradient(90deg,transparent,${s.typeColor},transparent)` }} />
      <div style={{ maxWidth:520, margin:"0 auto", padding:"32px 20px" }}>

        <Link href="/" style={{ display:"inline-flex", alignItems:"center", gap:6, color:"rgba(255,255,255,0.3)", fontSize:13, textDecoration:"none", marginBottom:28 }}>
          <ArrowLeft size={14}/> Zurück
        </Link>

        {/* THE PROFILE CARD — TCG Style */}
        <div style={{
          position:"relative", borderRadius:24, overflow:"hidden",
          background: s.gradient,
          border: `1px solid ${s.border}`,
          boxShadow: `0 8px 60px ${s.glow}, 0 0 0 1px ${s.border}`,
          marginBottom:20,
        }}>
          {/* Texture overlay */}
          {s.texture && (
            <div style={{ position:"absolute", inset:0, backgroundImage:s.texture, pointerEvents:"none", zIndex:1 }} />
          )}

          {/* Shimmer for premium+ */}
          {profile.is_premium && (
            <div style={{
              position:"absolute", inset:0, zIndex:1, pointerEvents:"none",
              background:"linear-gradient(125deg,transparent 25%,rgba(255,255,255,0.05) 45%,rgba(255,255,255,0.09) 50%,rgba(255,255,255,0.05) 55%,transparent 75%)",
            }} />
          )}

          <div style={{ position:"relative", zIndex:2, padding:24 }}>

            {/* Top bar */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <div style={{ width:10, height:10, borderRadius:"50%", background:s.typeColor, boxShadow:`0 0 8px ${s.glow}` }} />
                <span style={{ fontSize:10, fontWeight:700, color:s.typeColor, letterSpacing:"0.1em" }}>{s.type}</span>
              </div>
              <span style={{ fontSize:10, fontWeight:600, color:"rgba(255,255,255,0.4)" }}>HP {s.hp}</span>
            </div>

            {/* Avatar + Name */}
            <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:20 }}>
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.username}
                  style={{ width:80, height:80, borderRadius:"50%", objectFit:"cover", border:`3px solid ${s.border}`, boxShadow:`0 0 20px ${s.glow}, 0 0 0 1px ${s.border}` }} />
              ) : (
                <div style={{
                  width:80, height:80, borderRadius:"50%",
                  background:`${s.typeColor}18`, border:`3px solid ${s.border}`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:32, fontWeight:900, color:s.typeColor,
                  fontFamily:"Poppins,sans-serif",
                  boxShadow:`0 0 20px ${s.glow}`,
                }}>{initials}</div>
              )}
              <div>
                <h1 style={{
                  fontFamily:"Poppins,sans-serif", fontWeight:900, fontSize:26,
                  letterSpacing:"-0.02em", lineHeight:1.1, marginBottom:4,
                  background: s.nameGradient || undefined,
                  WebkitBackgroundClip: s.nameGradient ? "text" : undefined,
                  WebkitTextFillColor: s.nameGradient ? "transparent" : "white",
                }}>{profile.username}</h1>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <span style={{ fontSize:13, color:s.typeColor, fontWeight:800 }}>{s.symbol}</span>
                  <span style={{ fontSize:10, color:"rgba(255,255,255,0.3)" }}>{s.rarity}</span>
                </div>
                <p style={{ fontSize:11, color:"rgba(255,255,255,0.3)", marginTop:4 }}>Dabei seit {joined}</p>
              </div>
            </div>

            {/* Divider */}
            <div style={{ height:1, background:`linear-gradient(90deg,transparent,${s.border},transparent)`, marginBottom:16 }} />

            {/* Stats as card attacks */}
            <div style={{ marginBottom:16 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                <div style={{ background:"rgba(0,0,0,0.25)", borderRadius:10, padding:"8px 12px" }}>
                  <div style={{ fontSize:9, color:"rgba(255,255,255,0.3)", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:2 }}>Forum-Posts</div>
                  <div style={{ fontFamily:"Poppins,sans-serif", fontWeight:900, fontSize:20, color:s.typeColor }}>{(postCount || 0).toLocaleString("de-DE")}</div>
                </div>
                <div style={{ background:"rgba(0,0,0,0.25)", borderRadius:10, padding:"8px 12px" }}>
                  <div style={{ fontSize:9, color:"rgba(255,255,255,0.3)", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:2 }}>Mitglied</div>
                  <div style={{ fontFamily:"Poppins,sans-serif", fontWeight:900, fontSize:14, color:"white" }}>{joined.split(" ")[1]}</div>
                </div>
              </div>
            </div>

            {/* Divider + Rarity dots */}
            <div style={{ height:1, background:`linear-gradient(90deg,transparent,${s.border},transparent)`, marginBottom:10 }} />
            <div style={{ display:"flex", justifyContent:"center", gap:4, marginBottom:0 }}>
              {Array.from({ length: s.dots }).map((_,i) => (
                <div key={i} style={{
                  width: i >= s.dots-2 ? 8 : 5,
                  height: i >= s.dots-2 ? 8 : 5,
                  borderRadius:"50%", background:s.typeColor,
                  boxShadow: i >= s.dots-2 ? `0 0 8px ${s.glow}` : "none",
                  opacity: i >= s.dots-2 ? 1 : 0.4,
                }} />
              ))}
            </div>
          </div>
        </div>

        {/* Edit / Own profile actions */}
        {isOwn && (
          <div style={{ display:"flex", gap:10, marginBottom:20 }}>
            <Link href="/dashboard" style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"10px", borderRadius:12, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)", color:"rgba(255,255,255,0.6)", textDecoration:"none", fontSize:13, fontWeight:600 }}>
              ← Mein Dashboard
            </Link>
            {!profile.is_premium && (
              <Link href="/dashboard/premium" style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"10px", borderRadius:12, background:"linear-gradient(135deg,#FACC15,#f59e0b)", color:"#000", textDecoration:"none", fontSize:13, fontWeight:800 }}>
                <Crown size={14}/> Premium ✦
              </Link>
            )}
          </div>
        )}
 

        {/* Recent posts */}
        {posts && posts.length > 0 && (
          <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:18, overflow:"hidden" }}>
            <div style={{ padding:"12px 18px", borderBottom:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", gap:8 }}>
              <MessageSquare size={13} style={{color:s.typeColor}} />
              <span style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.35)", textTransform:"uppercase", letterSpacing:"0.1em" }}>
                Letzte Beiträge
              </span>
            </div>
            {posts.map((post, i) => (
              <Link key={post.id} href={`/forum/post/${post.id}`} style={{ display:"block", textDecoration:"none" }}>
                <div style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 18px", borderBottom: i < posts.length-1 ? "1px solid rgba(255,255,255,0.04)" : "none", transition:"background .15s" }}
                >
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:13, fontWeight:500, color:"rgba(255,255,255,0.75)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", marginBottom:2 }}>{post.title}</p>
                    <p style={{ fontSize:10, color:"rgba(255,255,255,0.25)" }}>{new Date(post.created_at).toLocaleDateString("de-DE")}</p>
                  </div>
                  <span style={{ fontSize:10, color:"rgba(255,255,255,0.25)", flexShrink:0 }}>❤️ {post.upvotes || 0}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
