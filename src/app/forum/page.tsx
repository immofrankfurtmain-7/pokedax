"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { MessageSquare, TrendingUp, Pin, Lock, Flame, Eye, Heart } from "lucide-react";

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  post_count: number;
  sort_order: number;
}

interface Post {
  id: string;
  title: string;
  category_id: string;
  author_id: string;
  reply_count: number;
  like_count: number;
  view_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  is_hot: boolean;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string | null;
    forum_role: string;
    badge_trainer: boolean;
    badge_gym_leader: boolean;
    badge_elite4: boolean;
    badge_champion: boolean;
  };
}

const CATEGORY_STYLES: Record<string, { gradient: string; border: string; glow: string; type: string; rarity: string }> = {
  marktplatz: {
    gradient: "linear-gradient(135deg, #1a0533 0%, #2d0a52 50%, #1a0533 100%)",
    border: "rgba(200, 100, 255, 0.6)",
    glow: "rgba(200, 100, 255, 0.3)",
    type: "Psychic",
    rarity: "Rare Holo",
  },
  preise: {
    gradient: "linear-gradient(135deg, #001a2e 0%, #003366 50%, #001a2e 100%)",
    border: "rgba(0, 200, 255, 0.6)",
    glow: "rgba(0, 200, 255, 0.3)",
    type: "Water",
    rarity: "Uncommon",
  },
  "fake-check": {
    gradient: "linear-gradient(135deg, #1a0a00 0%, #3d1a00 50%, #1a0a00 100%)",
    border: "rgba(255, 150, 0, 0.6)",
    glow: "rgba(255, 150, 0, 0.3)",
    type: "Fire",
    rarity: "Rare",
  },
  news: {
    gradient: "linear-gradient(135deg, #00150a 0%, #003320 50%, #00150a 100%)",
    border: "rgba(0, 255, 150, 0.6)",
    glow: "rgba(0, 255, 150, 0.3)",
    type: "Grass",
    rarity: "Common",
  },
  einsteiger: {
    gradient: "linear-gradient(135deg, #1a1a00 0%, #333300 50%, #1a1a00 100%)",
    border: "rgba(255, 220, 0, 0.6)",
    glow: "rgba(255, 220, 0, 0.3)",
    type: "Lightning",
    rarity: "Common",
  },
  turniere: {
    gradient: "linear-gradient(135deg, #1a0000 0%, #330000 50%, #1a0000 100%)",
    border: "rgba(255, 60, 60, 0.6)",
    glow: "rgba(255, 60, 60, 0.3)",
    type: "Fighting",
    rarity: "Rare Holo EX",
  },
  premium: {
    gradient: "linear-gradient(135deg, #0a0014 0%, #1a003d 50%, #0a0014 100%)",
    border: "rgba(255, 215, 0, 0.8)",
    glow: "rgba(255, 215, 0, 0.4)",
    type: "Dragon",
    rarity: "Ultra Rare",
  },
};

const RARITY_DOTS: Record<string, number> = {
  Common: 1,
  Uncommon: 2,
  Rare: 3,
  "Rare Holo": 4,
  "Rare Holo EX": 5,
  "Ultra Rare": 6,
};

function HoloCard({ category }: { category: Category }) {
  const style = CATEGORY_STYLES[category.id] || CATEGORY_STYLES["news"];
  const dots = RARITY_DOTS[style.rarity] || 1;

  return (
    <Link href={`/forum?category=${category.id}`} className="block group">
      <div
        className="relative overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2"
        style={{
          background: style.gradient,
          border: `1px solid ${style.border}`,
          borderRadius: "12px",
          boxShadow: `0 0 20px ${style.glow}, inset 0 0 40px rgba(0,0,0,0.3)`,
          aspectRatio: "2.5/3.5",
          minHeight: "240px",
        }}
      >
        {/* Holo shimmer overlay */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background:
              "linear-gradient(125deg, transparent 20%, rgba(255,255,255,0.08) 40%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.08) 60%, transparent 80%)",
            backgroundSize: "200% 200%",
          }}
        />

        {/* Card top bar */}
        <div
          className="flex items-center justify-between px-3 pt-3 pb-1"
          style={{ borderBottom: `1px solid ${style.border}40` }}
        >
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: style.border, fontSize: "9px" }}>
            {style.type} Type
          </span>
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)", fontSize: "9px" }}>
            HP {Math.floor(category.post_count / 10) + 60}
          </span>
        </div>

        {/* Icon area */}
        <div className="flex items-center justify-center" style={{ height: "90px", position: "relative" }}>
          <div
            className="flex items-center justify-center text-4xl"
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: `radial-gradient(circle, ${style.glow} 0%, transparent 70%)`,
              border: `1px solid ${style.border}60`,
              filter: "drop-shadow(0 0 12px " + style.glow + ")",
            }}
          >
            {category.icon}
          </div>
        </div>

        {/* Card name */}
        <div className="px-3 pb-1">
          <h3
            className="font-bold text-white text-center"
            style={{
              fontSize: "13px",
              textShadow: `0 0 10px ${style.glow}`,
              letterSpacing: "0.05em",
            }}
          >
            {category.name}
          </h3>
        </div>

        {/* Divider */}
        <div className="mx-3 my-1" style={{ height: "1px", background: `${style.border}40` }} />

        {/* Description */}
        <div className="px-3 pb-2">
          <p
            className="text-center"
            style={{
              color: "rgba(255,255,255,0.55)",
              fontSize: "9px",
              lineHeight: "1.4",
            }}
          >
            {category.description}
          </p>
        </div>

        {/* Stats */}
        <div className="px-3 pb-2">
          <div
            className="flex items-center justify-between px-2 py-1 rounded"
            style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${style.border}30` }}
          >
            <div className="flex items-center gap-1">
              <MessageSquare size={8} style={{ color: style.border }} />
              <span style={{ color: style.border, fontSize: "9px", fontWeight: 600 }}>
                {category.post_count.toLocaleString()}
              </span>
            </div>
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "9px" }}>Beiträge</span>
          </div>
        </div>

        {/* Rarity dots */}
        <div className="flex justify-center gap-1 pb-2">
          {Array.from({ length: dots }).map((_, i) => (
            <div
              key={i}
              style={{
                width: i === dots - 1 ? "6px" : "5px",
                height: i === dots - 1 ? "6px" : "5px",
                borderRadius: "50%",
                background: i === dots - 1 ? style.border : `${style.border}70`,
                boxShadow: i === dots - 1 ? `0 0 4px ${style.glow}` : "none",
              }}
            />
          ))}
        </div>

        {/* Bottom rarity text */}
        <div
          className="absolute bottom-2 left-0 right-0 text-center"
          style={{ color: "rgba(255,255,255,0.3)", fontSize: "8px" }}
        >
          {style.rarity}
        </div>
      </div>
    </Link>
  );
}

function PostRow({ post, categoryId }: { post: Post; categoryId?: string }) {
  const style = categoryId ? CATEGORY_STYLES[categoryId] || CATEGORY_STYLES["news"] : CATEGORY_STYLES["news"];
  const role = post.profiles?.forum_role;
  const roleColor =
    role === "admin" ? "#ff4444" : role === "moderator" ? "#00ccff" : "rgba(255,255,255,0.4)";
  const roleLabel = role === "admin" ? "ADMIN" : role === "moderator" ? "MOD" : null;

  return (
    <Link href={`/forum/post/${post.id}`} className="block group">
      <div
        className="relative flex items-center gap-3 p-3 rounded-lg transition-all duration-200"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          marginBottom: "6px",
        }}
      >
        {/* Hover glow */}
        <div
          className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
          style={{ background: `linear-gradient(90deg, ${style.glow}15, transparent)` }}
        />

        {/* Badges */}
        <div className="flex gap-1 shrink-0">
          {post.is_pinned && (
            <span title="Angeheftet">
              <Pin size={12} style={{ color: "#00ffff" }} />
            </span>
          )}
          {post.is_locked && (
            <span title="Gesperrt">
              <Lock size={12} style={{ color: "#ff8800" }} />
            </span>
          )}
          {post.is_hot && (
            <span title="Hot">
              <Flame size={12} style={{ color: "#ff4444" }} />
            </span>
          )}
          {!post.is_pinned && !post.is_locked && !post.is_hot && (
            <div style={{ width: 12 }} />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p
              className="font-medium truncate group-hover:text-white transition-colors"
              style={{ color: "rgba(255,255,255,0.85)", fontSize: "13px" }}
            >
              {post.title}
            </p>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px" }}>
              von{" "}
              <span style={{ color: roleColor, fontWeight: 500 }}>
                {post.profiles?.username || "Unbekannt"}
              </span>
              {roleLabel && (
                <span
                  className="ml-1 px-1 rounded"
                  style={{ background: `${roleColor}22`, color: roleColor, fontSize: "9px", fontWeight: 700 }}
                >
                  {roleLabel}
                </span>
              )}
            </span>
            <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "11px" }}>
              {new Date(post.created_at).toLocaleDateString("de-DE")}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1">
            <MessageSquare size={11} style={{ color: "rgba(255,255,255,0.3)" }} />
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px" }}>{post.reply_count}</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart size={11} style={{ color: "rgba(255,255,255,0.3)" }} />
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px" }}>{post.like_count}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye size={11} style={{ color: "rgba(255,255,255,0.3)" }} />
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px" }}>{post.view_count}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function ForumPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [hotPosts, setHotPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [categoryPosts, setCategoryPosts] = useState<Post[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("category");
    if (cat) setActiveCategory(cat);
    loadData();
  }, []);

  useEffect(() => {
    if (activeCategory) loadCategoryPosts(activeCategory);
    else setCategoryPosts([]);
  }, [activeCategory]);

  async function loadData() {
    setLoading(true);
    try {
      const [catRes, recentRes, hotRes] = await Promise.all([
        fetch("/api/forum/categories"),
        fetch("/api/forum/posts?limit=8&sort=recent"),
        fetch("/api/forum/posts?limit=5&sort=hot"),
      ]);
      const [catData, recentData, hotData] = await Promise.all([
        catRes.json(),
        recentRes.json(),
        hotRes.json(),
      ]);
      setCategories(catData.categories || []);
      setRecentPosts(recentData.posts || []);
      setHotPosts(hotData.posts || []);
    } finally {
      setLoading(false);
    }
  }

  async function loadCategoryPosts(catId: string) {
    const res = await fetch(`/api/forum/posts?category=${catId}&limit=15`);
    const data = await res.json();
    setCategoryPosts(data.posts || []);
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(180deg, #080010 0%, #0d0020 50%, #050010 100%)",
        color: "white",
      }}
    >
      {/* Starfield bg */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.15) 0%, transparent 100%), radial-gradient(1px 1px at 80% 10%, rgba(255,255,255,0.1) 0%, transparent 100%), radial-gradient(1px 1px at 50% 60%, rgba(255,255,255,0.12) 0%, transparent 100%), radial-gradient(1px 1px at 10% 80%, rgba(255,255,255,0.08) 0%, transparent 100%)",
          backgroundSize: "400px 400px, 300px 300px, 500px 500px, 350px 350px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div
              style={{
                width: "40px",
                height: "1px",
                background: "linear-gradient(90deg, transparent, #00ffff)",
              }}
            />
            <span style={{ color: "#00ffff", fontSize: "11px", letterSpacing: "0.3em", fontWeight: 600 }}>
              POKÉDAX
            </span>
            <div
              style={{
                width: "40px",
                height: "1px",
                background: "linear-gradient(90deg, #00ffff, transparent)",
              }}
            />
          </div>
          <h1
            className="text-4xl font-black mb-2"
            style={{
              background: "linear-gradient(135deg, #ffffff 0%, #c8a0ff 50%, #00ffff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.02em",
            }}
          >
            Community Forum
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px" }}>
            Tausche, diskutiere und werde Teil der deutschen Pokémon TCG Community
          </p>
        </div>

        {/* Category Cards Grid */}
        <div className="mb-10">
          <h2
            className="text-sm font-bold uppercase tracking-widest mb-4"
            style={{ color: "rgba(255,255,255,0.3)", letterSpacing: "0.2em" }}
          >
            Kategorien
          </h2>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl animate-pulse"
                  style={{ background: "rgba(255,255,255,0.05)", aspectRatio: "2.5/3.5", minHeight: "240px" }}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                  className="cursor-pointer"
                >
                  <div
                    style={{
                      outline: activeCategory === cat.id
                        ? `2px solid ${CATEGORY_STYLES[cat.id]?.border || "#00ffff"}`
                        : "none",
                      outlineOffset: "3px",
                      borderRadius: "14px",
                    }}
                  >
                    <HoloCard category={cat} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category posts (when selected) */}
        {activeCategory && categoryPosts.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-sm font-bold uppercase tracking-widest"
                style={{ color: CATEGORY_STYLES[activeCategory]?.border || "#00ffff", letterSpacing: "0.2em" }}
              >
                {categories.find((c) => c.id === activeCategory)?.name || activeCategory}
              </h2>
              <Link
                href={`/forum/new?category=${activeCategory}`}
                className="px-3 py-1 rounded-full text-xs font-bold transition-all"
                style={{
                  background: `${CATEGORY_STYLES[activeCategory]?.glow || "rgba(0,255,255,0.1)"}`,
                  border: `1px solid ${CATEGORY_STYLES[activeCategory]?.border || "#00ffff"}`,
                  color: CATEGORY_STYLES[activeCategory]?.border || "#00ffff",
                }}
              >
                + Neuer Beitrag
              </Link>
            </div>
            <div>
              {categoryPosts.map((post) => (
                <PostRow key={post.id} post={post} categoryId={activeCategory} />
              ))}
            </div>
          </div>
        )}

        {/* Two column layout: Recent + Hot */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Posts */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={14} style={{ color: "#00ffff" }} />
              <h2
                className="text-sm font-bold uppercase tracking-widest"
                style={{ color: "rgba(255,255,255,0.3)", letterSpacing: "0.2em" }}
              >
                Neueste Beiträge
              </h2>
            </div>
            <div>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-lg mb-2 animate-pulse"
                      style={{ background: "rgba(255,255,255,0.04)", height: "52px" }}
                    />
                  ))
                : recentPosts.map((post) => (
                    <PostRow key={post.id} post={post} categoryId={post.category_id} />
                  ))}
            </div>
          </div>

          {/* Hot Posts + New Post CTA */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Flame size={14} style={{ color: "#ff4444" }} />
              <h2
                className="text-sm font-bold uppercase tracking-widest"
                style={{ color: "rgba(255,255,255,0.3)", letterSpacing: "0.2em" }}
              >
                Trending
              </h2>
            </div>
            <div className="mb-6">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-lg mb-2 animate-pulse"
                      style={{ background: "rgba(255,255,255,0.04)", height: "52px" }}
                    />
                  ))
                : hotPosts.map((post) => (
                    <PostRow key={post.id} post={post} categoryId={post.category_id} />
                  ))}
            </div>

            {/* New Post CTA */}
            <Link href="/forum/new">
              <div
                className="relative overflow-hidden rounded-xl p-4 cursor-pointer group transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: "linear-gradient(135deg, #1a0533 0%, #2d0a52 100%)",
                  border: "1px solid rgba(200, 100, 255, 0.4)",
                  boxShadow: "0 0 20px rgba(200, 100, 255, 0.15)",
                }}
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: "linear-gradient(135deg, rgba(200,100,255,0.1), transparent)" }}
                />
                <p className="font-bold text-white mb-1" style={{ fontSize: "14px" }}>
                  Beitrag erstellen
                </p>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>
                  Teile deine Gedanken mit der Community
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
