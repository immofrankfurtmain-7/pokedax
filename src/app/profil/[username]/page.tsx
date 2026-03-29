import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageSquare, Crown, Star, Shield, Zap, Trophy } from "lucide-react";
import type { Metadata } from "next";

interface Props { params: { username: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `${params.username} – PokéDax Profil`,
    description: `Pokémon TCG Sammler-Profil von ${params.username} auf PokéDax`,
  };
}

export default async function ProfilePage({ params }: Props) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, is_premium, created_at, stripe_customer_id")
    .eq("username", params.username)
    .single();

  if (!profile) notFound();

  const isOwn = user?.id === profile.id;

  // Forum posts - safe query
  const { data: posts, count: postCount } = await supabase
    .from("forum_posts")
    .select("id, title, created_at, upvotes", { count: "exact" })
    .eq("author_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const joined = new Date(profile.created_at).toLocaleDateString("de-DE", { month: "long", year: "numeric" });
  const accentColor = profile.is_premium ? "#FACC15" : "#00E5FF";
  const roleLabel   = profile.is_premium ? "Premium" : "Trainer";

  return (
    <div style={{ minHeight: "100vh", color: "white" }}>
      <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }} />

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px" }}>

        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.3)", fontSize: 13, textDecoration: "none", marginBottom: 28 }}>
          <ArrowLeft size={14} /> Startseite
        </Link>

        {/* Header */}
        <div style={{
          background: "rgba(255,255,255,0.03)", border: `1px solid ${accentColor}25`,
          borderRadius: 20, padding: "28px 28px 24px", marginBottom: 16,
          boxShadow: `0 0 40px ${accentColor}08`,
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>
            {/* Avatar */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.username}
                  style={{ width: 86, height: 86, borderRadius: "50%", objectFit: "cover", border: `3px solid ${accentColor}`, boxShadow: `0 0 18px ${accentColor}50` }} />
              ) : (
                <div style={{
                  width: 86, height: 86, borderRadius: "50%",
                  background: `${accentColor}18`, border: `3px solid ${accentColor}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "Poppins, sans-serif", fontWeight: 900, fontSize: 34,
                  color: accentColor, boxShadow: `0 0 18px ${accentColor}40`,
                }}>
                  {profile.username?.[0]?.toUpperCase() || "?"}
                </div>
              )}
              {profile.is_premium && (
                <div style={{
                  position: "absolute", bottom: -4, right: -4, width: 26, height: 26,
                  borderRadius: "50%", background: "#FACC15", border: "2px solid #0d0a1a",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Crown size={12} style={{ color: "#000" }} />
                </div>
              )}
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                <h1 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 900, fontSize: 26, letterSpacing: "-0.02em", color: "white" }}>
                  {profile.username}
                </h1>
                <span style={{
                  padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                  background: `${accentColor}18`, border: `1px solid ${accentColor}40`, color: accentColor,
                }}>{roleLabel}</span>
                {isOwn && (
                  <span style={{ padding: "3px 10px", borderRadius: 20, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.4)", fontSize: 11 }}>
                    Dein Profil
                  </span>
                )}
              </div>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, marginBottom: 12 }}>Dabei seit {joined}</p>

              {/* Badges based on post count */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {(postCount || 0) >= 1   && <Badge color="#22C55E" icon={<Zap size={12}/>}    label="Trainer"    />}
                {(postCount || 0) >= 25  && <Badge color="#00E5FF" icon={<Shield size={12}/>}  label="Arenaleiter"/>}
                {(postCount || 0) >= 100 && <Badge color="#A855F7" icon={<Star size={12}/>}    label="Top Vier"   />}
                {(postCount || 0) >= 500 && <Badge color="#FACC15" icon={<Trophy size={12}/>}  label="Champion"   />}
                {profile.is_premium      && <Badge color="#FACC15" icon={<Crown size={12}/>}   label="Premium"    />}
              </div>
            </div>

            {isOwn && (
              <Link href="/dashboard" style={{
                padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.6)", textDecoration: "none", flexShrink: 0,
              }}>
                ✏️ Bearbeiten
              </Link>
            )}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginBottom: 20 }}>
          {[
            { label: "Forum-Posts",  value: (postCount || 0).toLocaleString("de-DE"), color: "#00E5FF" },
            { label: "Mitglied",     value: joined.split(" ")[1] || "2025",            color: "#A855F7" },
            { label: "Status",       value: roleLabel,                                  color: accentColor },
          ].map(s => (
            <div key={s.label} style={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 14, padding: "16px 18px",
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
                {s.label}
              </div>
              <div style={{ fontFamily: "Poppins, sans-serif", fontWeight: 900, fontSize: 22, color: s.color, letterSpacing: "-0.01em" }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Recent posts */}
        {posts && posts.length > 0 && (
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 8 }}>
              <MessageSquare size={13} style={{ color: "#00E5FF" }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Letzte Beiträge
              </span>
            </div>
            {posts.map((post, i) => (
              <Link key={post.id} href={`/forum/post/${post.id}`} style={{ display: "block", textDecoration: "none" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "12px 20px",
                  borderBottom: i < posts.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  transition: "background .15s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.03)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.8)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 2 }}>
                      {post.title}
                    </p>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                      {new Date(post.created_at).toLocaleDateString("de-DE")}
                    </p>
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", flexShrink: 0 }}>
                    ❤️ {post.upvotes || 0}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Empty state */}
        {(!posts || posts.length === 0) && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "rgba(255,255,255,0.25)", fontSize: 14 }}>
            Noch keine Beiträge verfasst.
          </div>
        )}
      </div>
    </div>
  );
}

function Badge({ color, icon, label }: { color: string; icon: React.ReactNode; label: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 5, padding: "4px 10px",
      borderRadius: 20, background: `${color}15`, border: `1px solid ${color}35`,
      color, fontSize: 11, fontWeight: 600,
    }}>
      {icon} {label}
    </div>
  );
}
