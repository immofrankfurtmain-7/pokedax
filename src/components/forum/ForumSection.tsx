"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare, TrendingUp, Flame, ArrowRight } from "lucide-react";

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

const CAT_STYLES: Record<string, { color: string; glow: string; bg: string }> = {
  marktplatz:   { color: "#c864ff", glow: "rgba(200,100,255,0.25)", bg: "linear-gradient(135deg, #1a0533, #2d0a52)" },
  preise:       { color: "#00c8ff", glow: "rgba(0,200,255,0.25)",   bg: "linear-gradient(135deg, #001a2e, #003366)" },
  "fake-check": { color: "#ff9600", glow: "rgba(255,150,0,0.25)",   bg: "linear-gradient(135deg, #1a0a00, #3d1a00)" },
  news:         { color: "#00ff96", glow: "rgba(0,255,150,0.25)",   bg: "linear-gradient(135deg, #00150a, #003320)" },
  einsteiger:   { color: "#ffdc00", glow: "rgba(255,220,0,0.25)",   bg: "linear-gradient(135deg, #1a1a00, #333300)" },
  turniere:     { color: "#ff3c3c", glow: "rgba(255,60,60,0.25)",   bg: "linear-gradient(135deg, #1a0000, #330000)" },
  premium:      { color: "#ffd700", glow: "rgba(255,215,0,0.3)",    bg: "linear-gradient(135deg, #0a0014, #1a003d)"  },
};

export default function ForumSection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [hotPosts, setHotPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/forum/categories").then(r => r.json()),
      fetch("/api/forum/posts?sort=hot&limit=4").then(r => r.json()),
    ]).then(([catData, postsData]) => {
      setCategories(catData.categories || []);
      setHotPosts(postsData.posts || []);
      setLoading(false);
    });
  }, []);

  return (
    <section className="py-16 px-4" style={{ background: "linear-gradient(180deg, transparent, rgba(75,0,130,0.08), transparent)" }}>
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div style={{ width: 24, height: 1, background: "linear-gradient(90deg, transparent, #c864ff)" }} />
              <span style={{ color: "#c864ff", fontSize: 11, letterSpacing: "0.25em", fontWeight: 700 }}>COMMUNITY</span>
            </div>
            <h2
              className="text-3xl font-black"
              style={{
                background: "linear-gradient(135deg, #ffffff, #c8a0ff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.02em",
              }}
            >
              Forum
            </h2>
          </div>
          <Link
            href="/forum"
            className="flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-white"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            Alle Kategorien
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Category cards (2/3 width) */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {loading
                ? Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="rounded-xl animate-pulse"
                      style={{ background: "rgba(255,255,255,0.04)", height: 110 }} />
                  ))
                : categories.map((cat) => {
                    const s = CAT_STYLES[cat.id] || CAT_STYLES["news"];
                    return (
                      <Link key={cat.id} href={`/forum?category=${cat.id}`} className="block group">
                        <div
                          className="relative overflow-hidden rounded-xl p-3 h-full transition-all duration-200 hover:-translate-y-1"
                          style={{
                            background: s.bg,
                            border: `1px solid ${s.color}40`,
                            boxShadow: `0 0 16px ${s.glow}`,
                            minHeight: 110,
                          }}
                        >
                          {/* Shimmer on hover */}
                          <div
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                            style={{ background: "linear-gradient(125deg, transparent 30%, rgba(255,255,255,0.07) 50%, transparent 70%)" }}
                          />
                          {/* Icon */}
                          <div className="text-2xl mb-2">{cat.icon}</div>
                          {/* Name */}
                          <p className="font-bold text-white mb-1" style={{ fontSize: 12, lineHeight: 1.2 }}>{cat.name}</p>
                          {/* Post count */}
                          <div className="flex items-center gap-1">
                            <MessageSquare size={9} style={{ color: s.color }} />
                            <span style={{ color: s.color, fontSize: 10, fontWeight: 600 }}>
                              {cat.post_count?.toLocaleString()}
                            </span>
                          </div>
                          {/* Bottom color strip */}
                          <div
                            className="absolute bottom-0 left-0 right-0 h-0.5"
                            style={{ background: `linear-gradient(90deg, transparent, ${s.color}, transparent)` }}
                          />
                        </div>
                      </Link>
                    );
                  })}

              {/* CTA card */}
              <Link href="/forum/new" className="block group">
                <div
                  className="relative overflow-hidden rounded-xl p-3 h-full flex flex-col items-center justify-center text-center transition-all duration-200 hover:-translate-y-1"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px dashed rgba(255,255,255,0.12)",
                    minHeight: 110,
                  }}
                >
                  <div style={{ fontSize: 20, marginBottom: 6, color: "rgba(255,255,255,0.3)" }}>+</div>
                  <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>Beitrag erstellen</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Right: Hot posts */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Flame size={13} style={{ color: "#ff4444" }} />
              <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" }}>
                Trending
              </span>
            </div>
            <div className="space-y-2">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-lg animate-pulse"
                      style={{ background: "rgba(255,255,255,0.04)", height: 60 }} />
                  ))
                : hotPosts.map((post) => {
                    const s = CAT_STYLES[post.category_id] || CAT_STYLES["news"];
                    return (
                      <Link key={post.id} href={`/forum/post/${post.id}`} className="block group">
                        <div
                          className="p-3 rounded-lg transition-all"
                          style={{
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.06)",
                          }}
                        >
                          <div
                            className="w-1 h-full absolute left-0 top-0 rounded-l-lg"
                            style={{ background: s.color }}
                          />
                          <p
                            className="font-medium group-hover:text-white transition-colors line-clamp-2"
                            style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, lineHeight: 1.4, marginBottom: 4 }}
                          >
                            {post.title}
                          </p>
                          <div className="flex items-center gap-3">
                            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }}>
                              von {post.profiles?.username}
                            </span>
                            <div className="flex items-center gap-1" style={{ color: "rgba(255,255,255,0.25)", fontSize: 10 }}>
                              <MessageSquare size={9} />
                              {post.reply_count}
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
            </div>
            <Link
              href="/forum"
              className="flex items-center justify-center gap-2 mt-4 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: "rgba(200,100,255,0.08)",
                border: "1px solid rgba(200,100,255,0.2)",
                color: "#c864ff",
              }}
            >
              Alle Beiträge
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
