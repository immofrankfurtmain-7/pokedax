"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare, Flame, ArrowRight } from "lucide-react";

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  post_count: number;
}

interface Post {
  id: string;
  title: string;
  category_id: string;
  reply_count: number;
  upvotes: number;
  is_hot: boolean;
  created_at: string;
  profiles: { username: string };
}

const CAT = {
  marktplatz:   { gradient: "linear-gradient(135deg, #1a0533 0%, #2d0a52 50%, #1a0533 100%)", border: "rgba(168,85,247,0.6)",  glow: "rgba(168,85,247,0.25)", type: "Psychic",   rarity: "Rare Holo",    dots: 4 },
  preise:       { gradient: "linear-gradient(135deg, #001a2e 0%, #003366 50%, #001a2e 100%)", border: "rgba(0,229,255,0.6)",   glow: "rgba(0,229,255,0.25)",  type: "Water",     rarity: "Uncommon",     dots: 2 },
  "fake-check": { gradient: "linear-gradient(135deg, #1a0a00 0%, #3d1a00 50%, #1a0a00 100%)", border: "rgba(249,115,22,0.6)",  glow: "rgba(249,115,22,0.25)", type: "Fire",      rarity: "Rare",         dots: 3 },
  news:         { gradient: "linear-gradient(135deg, #00150a 0%, #003320 50%, #00150a 100%)", border: "rgba(34,197,94,0.6)",   glow: "rgba(34,197,94,0.25)",  type: "Grass",     rarity: "Common",       dots: 1 },
  einsteiger:   { gradient: "linear-gradient(135deg, #1a1a00 0%, #333300 50%, #1a1a00 100%)", border: "rgba(250,204,21,0.6)",  glow: "rgba(250,204,21,0.25)", type: "Lightning", rarity: "Common",       dots: 1 },
  turniere:     { gradient: "linear-gradient(135deg, #1a0000 0%, #330000 50%, #1a0000 100%)", border: "rgba(238,21,21,0.6)",   glow: "rgba(238,21,21,0.25)",  type: "Fighting",  rarity: "Rare Holo EX", dots: 5 },
  premium:      { gradient: "linear-gradient(135deg, #0a0014 0%, #1a003d 50%, #0a0014 100%)", border: "rgba(250,204,21,0.8)",  glow: "rgba(250,204,21,0.3)",  type: "Dragon",    rarity: "Ultra Rare",   dots: 6 },
};

export default function ForumSection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [hotPosts,   setHotPosts]   = useState<Post[]>([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/forum/categories").then(r => r.json()),
      fetch("/api/forum/posts?sort=hot&limit=5").then(r => r.json()),
    ]).then(([c, p]) => {
      setCategories(c.categories || []);
      setHotPosts(p.posts || []);
      setLoading(false);
    });
  }, []);

  return (
    <section style={{ padding: "0 20px 48px", background: "linear-gradient(180deg, transparent, rgba(238,21,21,0.03), transparent)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <div className="section-eyebrow">Community</div>
            <h2 style={{ fontFamily: "Poppins, sans-serif", fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 800, color: "#F8FAFC", letterSpacing: "-0.02em" }}>
              Forum
            </h2>
          </div>
          <Link href="/forum" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "#475569", textDecoration: "none" }}>
            Alle Kategorien <ArrowRight size={14} />
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 24 }}>

          {/* TCG Holo Karten Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 12 }}>
            {loading
              ? Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} style={{ borderRadius: 12, background: "rgba(255,255,255,0.04)", aspectRatio: "2.5/3.5", animation: "pulse 1.5s infinite" }} />
                ))
              : categories.map(cat => {
                  const s = CAT[cat.id as keyof typeof CAT] || CAT.news;
                  return (
                    <Link key={cat.id} href={`/forum?category=${cat.id}`} style={{ display: "block", textDecoration: "none" }}
                      className="holo-card">
                      <div style={{
                        background: s.gradient,
                        border: `1px solid ${s.border}`,
                        borderRadius: 12,
                        boxShadow: `0 0 20px ${s.glow}, inset 0 0 40px rgba(0,0,0,0.3)`,
                        aspectRatio: "2.5/3.5",
                        display: "flex", flexDirection: "column",
                        position: "relative", overflow: "hidden",
                      }}>
                        <div className="holo-shimmer" />

                        {/* Top bar */}
                        <div style={{ padding: "6px 8px 4px", borderBottom: `1px solid ${s.border}40`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ color: s.border, fontSize: 8, fontWeight: 700, letterSpacing: "0.05em" }}>{s.type}</span>
                          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 8 }}>HP {Math.floor((cat.post_count || 0) / 10) + 60}</span>
                        </div>

                        {/* Icon */}
                        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <div style={{
                            width: 52, height: 52, borderRadius: "50%",
                            background: `radial-gradient(circle, ${s.glow} 0%, transparent 70%)`,
                            border: `1px solid ${s.border}50`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 24,
                          }}>{cat.icon}</div>
                        </div>

                        {/* Name */}
                        <div style={{ padding: "0 6px 4px", textAlign: "center" }}>
                          <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: 10, color: "white", textShadow: `0 0 8px ${s.glow}`, letterSpacing: "0.03em" }}>
                            {cat.name}
                          </p>
                        </div>

                        {/* Divider */}
                        <div style={{ margin: "0 6px", height: 1, background: `${s.border}40` }} />

                        {/* Posts */}
                        <div style={{ padding: "4px 8px 4px" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(0,0,0,0.3)", padding: "3px 6px", borderRadius: 4 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                              <MessageSquare size={8} style={{ color: s.border }} />
                              <span style={{ color: s.border, fontSize: 8, fontWeight: 700 }}>{(cat.post_count || 0).toLocaleString()}</span>
                            </div>
                            <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 8 }}>Posts</span>
                          </div>
                        </div>

                        {/* Rarity dots */}
                        <div style={{ display: "flex", justifyContent: "center", gap: 3, paddingBottom: 6 }}>
                          {Array.from({ length: s.dots }).map((_, i) => (
                            <div key={i} style={{
                              width: i === s.dots - 1 ? 6 : 4,
                              height: i === s.dots - 1 ? 6 : 4,
                              borderRadius: "50%",
                              background: i === s.dots - 1 ? s.border : `${s.border}60`,
                              boxShadow: i === s.dots - 1 ? `0 0 4px ${s.glow}` : "none",
                            }} />
                          ))}
                        </div>

                        {/* Rarity text */}
                        <div style={{ position: "absolute", bottom: 4, left: 0, right: 0, textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 7 }}>
                          {s.rarity}
                        </div>
                      </div>
                    </Link>
                  );
                })}

            {/* New Post CTA */}
            <Link href="/forum/new" style={{ display: "block", textDecoration: "none" }}>
              <div style={{
                border: "1px dashed rgba(255,255,255,0.15)", borderRadius: 12,
                aspectRatio: "2.5/3.5", display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 6,
                background: "rgba(255,255,255,0.01)", transition: "border-color .2s",
              }}>
                <span style={{ fontSize: 22, color: "rgba(255,255,255,0.2)" }}>+</span>
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", textAlign: "center", lineHeight: 1.3 }}>Beitrag erstellen</span>
              </div>
            </Link>
          </div>

          {/* Trending sidebar */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
              <Flame size={13} style={{ color: "#EE1515" }} />
              <span style={{ fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 700, color: "#475569", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                Trending
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} style={{ height: 56, borderRadius: 10, background: "rgba(255,255,255,0.04)" }} />
                  ))
                : hotPosts.map(post => {
                    const s = CAT[post.category_id as keyof typeof CAT] || CAT.news;
                    return (
                      <Link key={post.id} href={`/forum/post/${post.id}`} className="forum-row" style={{ position: "relative", paddingLeft: 18 }}>
                        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: s.border, borderRadius: "10px 0 0 10px" }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: 12, color: "#F8FAFC", lineHeight: 1.35, marginBottom: 3, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                            {post.title}
                          </p>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ color: "#475569", fontSize: 10 }}>{post.profiles?.username}</span>
                            <div style={{ display: "flex", alignItems: "center", gap: 3, color: "#475569", fontSize: 10 }}>
                              <MessageSquare size={9} />
                              {post.reply_count}
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
            </div>
            <Link href="/forum" style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              marginTop: 12, padding: "10px 0", borderRadius: 10,
              background: "rgba(238,21,21,0.06)", border: "1px solid rgba(238,21,21,0.15)",
              color: "#EE1515", fontSize: 13, fontWeight: 600, textDecoration: "none",
            }}>
              Alle Beiträge <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
