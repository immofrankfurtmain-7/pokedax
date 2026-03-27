# PokeDax Forum Redesign - Deployment Script
# Ausfuehren in PowerShell: .\deploy-forum.ps1

$root = "C:\Users\lenovo\pokedax\pokedax\pokedax"
$enc = [System.Text.Encoding]::UTF8

Write-Host "PokeDax Forum Redesign wird installiert..." -ForegroundColor Cyan

# Ordner anlegen (eckige Klammern im Pfad brauchen LiteralPath)
$dirs = @(
  "$root\src\app\forum",
  "$root\src\app\forum\new",
  "$root\src\app\api\forum\posts"
)
foreach ($d in $dirs) {
  if (-not (Test-Path -LiteralPath $d)) {
    New-Item -ItemType Directory -Path $d -Force | Out-Null
  }
}
$postDir = "$root\src\app\forum\post\[id]"
if (-not (Test-Path -LiteralPath $postDir)) {
  New-Item -ItemType Directory -LiteralPath $postDir -Force | Out-Null
}


$forumPage = @'
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

'@
[System.IO.File]::WriteAllText("$root\src\app\forum\page.tsx", $forumPage, $enc)
Write-Host "  page.tsx" -ForegroundColor Green

$newPostPage = @'
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, Tag, X } from "lucide-react";

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const CATEGORY_STYLES: Record<string, { color: string; glow: string }> = {
  marktplatz:  { color: "#c864ff", glow: "rgba(200,100,255,0.3)" },
  preise:      { color: "#00c8ff", glow: "rgba(0,200,255,0.3)"   },
  "fake-check":{ color: "#ff9600", glow: "rgba(255,150,0,0.3)"   },
  news:        { color: "#00ff96", glow: "rgba(0,255,150,0.3)"   },
  einsteiger:  { color: "#ffdc00", glow: "rgba(255,220,0,0.3)"   },
  turniere:    { color: "#ff3c3c", glow: "rgba(255,60,60,0.3)"   },
  premium:     { color: "#ffd700", glow: "rgba(255,215,0,0.4)"   },
};

export default function NewPostPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCat = searchParams.get("category") || "";

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(preselectedCat);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/forum/categories").then(r => r.json()).then(d => setCategories(d.categories || []));
  }, []);

  const catStyle = CATEGORY_STYLES[selectedCategory] || { color: "#00ffff", glow: "rgba(0,255,255,0.3)" };

  function addTag() {
    const t = tagInput.trim().toLowerCase().replace(/[^a-z0-9äöü-]/g, "");
    if (t && !tags.includes(t) && tags.length < 5) {
      setTags([...tags, t]);
      setTagInput("");
    }
  }

  async function handleSubmit() {
    if (!title.trim() || !content.trim() || !selectedCategory) {
      setError("Bitte alle Pflichtfelder ausfüllen.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/forum/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category_id: selectedCategory,
          title: title.trim(),
          content: content.trim(),
          tags,
        }),
      });
      const data = await res.json();
      if (res.ok && data.post?.id) {
        router.push(`/forum/post/${data.post.id}`);
      } else {
        setError(data.error || "Fehler beim Erstellen des Beitrags.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(180deg, #080010 0%, #0d0020 50%, #050010 100%)", color: "white" }}
    >
      <div
        style={{
          height: "2px",
          background: `linear-gradient(90deg, transparent, ${catStyle.color}, transparent)`,
          transition: "all 0.3s",
        }}
      />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link
          href="/forum"
          className="inline-flex items-center gap-2 mb-6 transition-colors hover:text-white"
          style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}
        >
          <ArrowLeft size={14} />
          Zurück zum Forum
        </Link>

        <div className="mb-8">
          <h1
            className="text-3xl font-black mb-2"
            style={{
              background: `linear-gradient(135deg, #ffffff, ${catStyle.color})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Neuer Beitrag
          </h1>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "14px" }}>
            Teile deine Gedanken mit der Community
          </p>
        </div>

        <div className="space-y-5">
          {/* Category */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.3)" }}>
              Kategorie *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((cat) => {
                const s = CATEGORY_STYLES[cat.id] || { color: "#00ffff", glow: "" };
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all"
                    style={{
                      background: isSelected ? `${s.color}20` : "rgba(255,255,255,0.04)",
                      border: `1px solid ${isSelected ? s.color + "60" : "rgba(255,255,255,0.08)"}`,
                      color: isSelected ? s.color : "rgba(255,255,255,0.5)",
                      boxShadow: isSelected ? `0 0 12px ${s.glow}` : "none",
                      cursor: "pointer",
                    }}
                  >
                    <span style={{ fontSize: "16px" }}>{cat.icon}</span>
                    <span style={{ fontSize: "12px", fontWeight: 500 }}>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.3)" }}>
              Titel *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Worum geht es in deinem Beitrag?"
              maxLength={120}
              className="w-full px-4 py-3 rounded-xl focus:outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: `1px solid ${title ? catStyle.color + "40" : "rgba(255,255,255,0.08)"}`,
                color: "white",
                fontSize: "15px",
              }}
            />
            <p className="text-right mt-1" style={{ color: "rgba(255,255,255,0.2)", fontSize: "11px" }}>
              {title.length}/120
            </p>
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.3)" }}>
              Inhalt *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Schreibe deinen Beitrag..."
              rows={8}
              className="w-full px-4 py-3 rounded-xl focus:outline-none resize-none transition-all"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: `1px solid ${content ? catStyle.color + "40" : "rgba(255,255,255,0.08)"}`,
                color: "white",
                fontSize: "14px",
                lineHeight: 1.6,
              }}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.3)" }}>
              Tags <span style={{ color: "rgba(255,255,255,0.2)", fontWeight: 400, textTransform: "none" }}>(optional, max. 5)</span>
            </label>
            <div className="flex gap-2 mb-2">
              <div className="relative flex-1">
                <Tag size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.3)" }} />
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  placeholder="Tag eingeben, Enter drücken"
                  className="w-full pl-8 pr-4 py-2 rounded-xl focus:outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "white",
                    fontSize: "13px",
                  }}
                />
              </div>
              <button
                onClick={addTag}
                className="px-3 py-2 rounded-xl transition-all"
                style={{
                  background: `${catStyle.color}20`,
                  border: `1px solid ${catStyle.color}40`,
                  color: catStyle.color,
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                +
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                    style={{
                      background: `${catStyle.color}15`,
                      border: `1px solid ${catStyle.color}30`,
                      color: catStyle.color,
                      fontSize: "12px",
                    }}
                  >
                    #{tag}
                    <button
                      onClick={() => setTags(tags.filter((t) => t !== tag))}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", display: "flex" }}
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div
              className="px-4 py-3 rounded-xl"
              style={{ background: "rgba(255,60,60,0.1)", border: "1px solid rgba(255,60,60,0.3)", color: "#ff6464", fontSize: "13px" }}
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="flex items-center justify-between pt-2">
            <Link href="/forum" style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px" }}>
              Abbrechen
            </Link>
            <button
              onClick={handleSubmit}
              disabled={submitting || !title.trim() || !content.trim() || !selectedCategory}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all"
              style={{
                background:
                  title && content && selectedCategory
                    ? `linear-gradient(135deg, ${catStyle.color}40, ${catStyle.color}20)`
                    : "rgba(255,255,255,0.05)",
                border: `1px solid ${title && content && selectedCategory ? catStyle.color + "60" : "rgba(255,255,255,0.1)"}`,
                color: title && content && selectedCategory ? catStyle.color : "rgba(255,255,255,0.3)",
                fontSize: "14px",
                boxShadow: title && content && selectedCategory ? `0 0 20px ${catStyle.glow}` : "none",
                cursor: title && content && selectedCategory ? "pointer" : "not-allowed",
              }}
            >
              <Send size={14} />
              {submitting ? "Wird erstellt..." : "Beitrag veröffentlichen"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

'@
[System.IO.File]::WriteAllText("$root\src\app\forum\new\page.tsx", $newPostPage, $enc)
Write-Host "  page.tsx" -ForegroundColor Green

$postsRoute = @'
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const limit = parseInt(searchParams.get("limit") || "20");
  const sort = searchParams.get("sort") || "recent"; // "recent" | "hot"

  let query = supabase
    .from("forum_posts")
    .select(
      `id, title, category_id, author_id, reply_count, like_count,
       view_count, is_pinned, is_locked, is_hot, tags, created_at,
       profiles(username, avatar_url, forum_role, post_count,
         badge_trainer, badge_gym_leader, badge_elite4, badge_champion, is_premium)`
    )
    .eq("is_deleted", false)
    .limit(limit);

  if (category) {
    query = query.eq("category_id", category);
  }

  if (sort === "hot") {
    query = query.order("is_hot", { ascending: false }).order("like_count", { ascending: false });
  } else {
    query = query.order("is_pinned", { ascending: false }).order("created_at", { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ posts: data });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });
  }

  // Check if banned
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_banned, forum_role")
    .eq("id", user.id)
    .single();

  if (profile?.is_banned) {
    return NextResponse.json({ error: "Du bist gesperrt." }, { status: 403 });
  }

  const body = await request.json();
  const { category_id, title, content, tags } = body;

  if (!category_id || !title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "Pflichtfelder fehlen" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("forum_posts")
    .insert({
      category_id,
      author_id: user.id,
      title: title.trim(),
      content: content.trim(),
      tags: tags || [],
      upvotes: 0,
      reply_count: 0,
      like_count: 0,
      view_count: 0,
      is_pinned: false,
      is_locked: false,
      is_deleted: false,
      is_hot: false,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ post: data });
}

'@
[System.IO.File]::WriteAllText("$root\src\app\api\forum\posts\route.ts", $postsRoute, $enc)
Write-Host "  route.ts" -ForegroundColor Green

$postDetailPage = @'
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft, Heart, MessageSquare, Flag, Pin, Lock, Flame,
  Eye, Send, Shield, Star, Trophy, Zap, ChevronUp
} from "lucide-react";

interface Post {
  id: string;
  title: string;
  content: string;
  category_id: string;
  author_id: string;
  reply_count: number;
  like_count: number;
  view_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  is_hot: boolean;
  tags: string[];
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string | null;
    forum_role: string;
    post_count: number;
    badge_trainer: boolean;
    badge_gym_leader: boolean;
    badge_elite4: boolean;
    badge_champion: boolean;
    is_premium: boolean;
  };
}

interface Reply {
  id: string;
  content: string;
  author_id: string;
  upvotes: number;
  like_count?: number;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string | null;
    forum_role: string;
    post_count: number;
    badge_trainer: boolean;
    badge_gym_leader: boolean;
    badge_elite4: boolean;
    badge_champion: boolean;
    is_premium: boolean;
  };
}

const CATEGORY_STYLES: Record<string, { color: string; glow: string; label: string }> = {
  marktplatz:  { color: "#c864ff", glow: "rgba(200,100,255,0.3)", label: "Marktplatz" },
  preise:      { color: "#00c8ff", glow: "rgba(0,200,255,0.3)",   label: "Preise" },
  "fake-check":{ color: "#ff9600", glow: "rgba(255,150,0,0.3)",   label: "Fake-Check" },
  news:        { color: "#00ff96", glow: "rgba(0,255,150,0.3)",   label: "News" },
  einsteiger:  { color: "#ffdc00", glow: "rgba(255,220,0,0.3)",   label: "Einsteiger" },
  turniere:    { color: "#ff3c3c", glow: "rgba(255,60,60,0.3)",   label: "Turniere" },
  premium:     { color: "#ffd700", glow: "rgba(255,215,0,0.4)",   label: "Premium" },
};

function getBadgeIcon(profile: Post["profiles"] | Reply["profiles"]) {
  if (profile.badge_champion)   return { icon: <Trophy size={10} />, label: "Champion",     color: "#ffd700" };
  if (profile.badge_elite4)     return { icon: <Star size={10} />,   label: "Top Vier",      color: "#c864ff" };
  if (profile.badge_gym_leader) return { icon: <Shield size={10} />, label: "Arenaleiter",  color: "#00c8ff" };
  if (profile.badge_trainer)    return { icon: <Zap size={10} />,    label: "Trainer",       color: "#00ff96" };
  return null;
}

function getRoleStyle(role: string) {
  if (role === "admin")     return { color: "#ff4444", label: "ADMIN" };
  if (role === "moderator") return { color: "#00ccff", label: "MOD" };
  return null;
}

function Avatar({ profile, size = 40 }: { profile: Post["profiles"] | Reply["profiles"]; size?: number }) {
  const role = getRoleStyle(profile.forum_role);
  const badge = getBadgeIcon(profile);
  const ringColor = role?.color || badge?.color || "rgba(255,255,255,0.2)";

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {profile.avatar_url ? (
        <img
          src={profile.avatar_url}
          alt={profile.username}
          className="rounded-full object-cover"
          style={{
            width: size, height: size,
            border: `2px solid ${ringColor}`,
            boxShadow: `0 0 8px ${ringColor}60`,
          }}
        />
      ) : (
        <div
          className="rounded-full flex items-center justify-center font-bold"
          style={{
            width: size, height: size,
            background: `linear-gradient(135deg, ${ringColor}40, ${ringColor}20)`,
            border: `2px solid ${ringColor}`,
            boxShadow: `0 0 8px ${ringColor}60`,
            color: ringColor,
            fontSize: size * 0.35,
          }}
        >
          {profile.username?.[0]?.toUpperCase() || "?"}
        </div>
      )}
    </div>
  );
}

function UserInfo({ profile }: { profile: Post["profiles"] | Reply["profiles"] }) {
  const role = getRoleStyle(profile.forum_role);
  const badge = getBadgeIcon(profile);

  return (
    <div>
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="font-bold text-white" style={{ fontSize: "13px" }}>
          {profile.username}
        </span>
        {role && (
          <span
            className="px-1.5 rounded text-white"
            style={{
              background: `${role.color}30`,
              border: `1px solid ${role.color}60`,
              color: role.color,
              fontSize: "9px",
              fontWeight: 700,
              letterSpacing: "0.05em",
            }}
          >
            {role.label}
          </span>
        )}
        {badge && (
          <span
            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full"
            style={{
              background: `${badge.color}20`,
              border: `1px solid ${badge.color}40`,
              color: badge.color,
              fontSize: "9px",
            }}
          >
            {badge.icon}
            {badge.label}
          </span>
        )}
        {profile.is_premium && (
          <span
            className="px-1.5 rounded"
            style={{
              background: "rgba(255,215,0,0.15)",
              border: "1px solid rgba(255,215,0,0.4)",
              color: "#ffd700",
              fontSize: "9px",
              fontWeight: 600,
            }}
          >
            PREMIUM
          </span>
        )}
      </div>
      <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px", marginTop: "1px" }}>
        {profile.post_count} Beiträge
      </p>
    </div>
  );
}

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    loadPost();
    loadUser();
  }, [postId]);

  async function loadUser() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  }

  async function loadPost() {
    setLoading(true);
    try {
      const res = await fetch(`/api/forum/post/${postId}`);
      const data = await res.json();
      setPost(data.post);
      setReplies(data.replies || []);
    } finally {
      setLoading(false);
    }
  }

  async function handleLike() {
    if (!currentUser) return;
    setLiked(!liked);
    await fetch("/api/forum/like", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post_id: postId }),
    });
  }

  async function handleReply() {
    if (!replyContent.trim() || !currentUser) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/forum/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: postId, content: replyContent }),
      });
      if (res.ok) {
        setReplyContent("");
        loadPost();
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReport() {
    if (!currentUser) return;
    const reason = prompt("Grund der Meldung:");
    if (!reason) return;
    await fetch("/api/forum/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post_id: postId, reason }),
    });
    alert("Beitrag wurde gemeldet. Danke!");
  }

  const catStyle = post ? (CATEGORY_STYLES[post.category_id] || CATEGORY_STYLES["news"]) : CATEGORY_STYLES["news"];

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(180deg, #080010 0%, #0d0020 100%)" }}
      >
        <div
          className="w-8 h-8 rounded-full animate-spin"
          style={{ border: "2px solid rgba(255,255,255,0.1)", borderTopColor: "#00ffff" }}
        />
      </div>
    );
  }

  if (!post) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center"
        style={{ background: "linear-gradient(180deg, #080010 0%, #0d0020 100%)" }}
      >
        <p className="text-white mb-4">Beitrag nicht gefunden.</p>
        <Link href="/forum" className="text-cyan-400 hover:underline">← Zurück zum Forum</Link>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(180deg, #080010 0%, #0d0020 50%, #050010 100%)", color: "white" }}
    >
      {/* Top accent line */}
      <div style={{ height: "2px", background: `linear-gradient(90deg, transparent, ${catStyle.color}, transparent)` }} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back link */}
        <Link
          href="/forum"
          className="inline-flex items-center gap-2 mb-6 transition-colors hover:text-white"
          style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}
        >
          <ArrowLeft size={14} />
          Zurück zum Forum
        </Link>

        {/* Category pill */}
        <div className="mb-4">
          <span
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold"
            style={{
              background: `${catStyle.glow}`,
              border: `1px solid ${catStyle.color}60`,
              color: catStyle.color,
              letterSpacing: "0.05em",
            }}
          >
            {catStyle.label}
          </span>
          {post.is_pinned && (
            <span className="ml-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs" style={{ color: "#00ffff", background: "rgba(0,255,255,0.1)" }}>
              <Pin size={10} /> Angeheftet
            </span>
          )}
          {post.is_locked && (
            <span className="ml-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs" style={{ color: "#ff8800", background: "rgba(255,136,0,0.1)" }}>
              <Lock size={10} /> Gesperrt
            </span>
          )}
          {post.is_hot && (
            <span className="ml-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs" style={{ color: "#ff4444", background: "rgba(255,68,68,0.1)" }}>
              <Flame size={10} /> Hot
            </span>
          )}
        </div>

        {/* Post card */}
        <div
          className="rounded-2xl overflow-hidden mb-6"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
            border: `1px solid ${catStyle.color}30`,
            boxShadow: `0 0 40px ${catStyle.glow}20`,
          }}
        >
          {/* Post header */}
          <div className="p-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <h1
              className="text-2xl font-black mb-5 leading-tight"
              style={{ color: "white", letterSpacing: "-0.01em" }}
            >
              {post.title}
            </h1>

            {/* Author row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar profile={post.profiles} size={44} />
                <UserInfo profile={post.profiles} />
              </div>
              <div className="flex items-center gap-4" style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px" }}>
                <div className="flex items-center gap-1">
                  <Eye size={12} />
                  {post.view_count}
                </div>
                <span>{new Date(post.created_at).toLocaleDateString("de-DE")}</span>
              </div>
            </div>
          </div>

          {/* Post content */}
          <div className="p-6">
            <div
              className="leading-relaxed whitespace-pre-wrap"
              style={{ color: "rgba(255,255,255,0.8)", fontSize: "15px", lineHeight: 1.7 }}
            >
              {post.content}
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-5">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-full"
                    style={{
                      background: `${catStyle.color}15`,
                      border: `1px solid ${catStyle.color}30`,
                      color: catStyle.color,
                      fontSize: "11px",
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Post actions */}
          <div
            className="flex items-center justify-between px-6 py-3"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-center gap-4">
              <button
                onClick={handleLike}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all"
                style={{
                  background: liked ? "rgba(255,100,100,0.15)" : "rgba(255,255,255,0.05)",
                  border: liked ? "1px solid rgba(255,100,100,0.4)" : "1px solid rgba(255,255,255,0.1)",
                  color: liked ? "#ff6464" : "rgba(255,255,255,0.4)",
                  fontSize: "12px",
                  cursor: currentUser ? "pointer" : "not-allowed",
                }}
              >
                <Heart size={13} fill={liked ? "currentColor" : "none"} />
                {post.like_count + (liked ? 1 : 0)}
              </button>

              <div className="flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px" }}>
                <MessageSquare size={13} />
                {post.reply_count} Antworten
              </div>
            </div>

            {currentUser && (
              <button
                onClick={handleReport}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all"
                style={{
                  color: "rgba(255,255,255,0.25)",
                  fontSize: "11px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <Flag size={11} />
                Melden
              </button>
            )}
          </div>
        </div>

        {/* Replies */}
        {replies.length > 0 && (
          <div className="mb-6">
            <h2
              className="text-sm font-bold uppercase tracking-widest mb-4"
              style={{ color: "rgba(255,255,255,0.3)", letterSpacing: "0.2em" }}
            >
              {replies.length} Antwort{replies.length !== 1 ? "en" : ""}
            </h2>
            <div className="space-y-3">
              {replies.map((reply, idx) => (
                <div
                  key={reply.id}
                  className="rounded-xl p-4"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div className="flex gap-3">
                    {/* Number */}
                    <div
                      className="shrink-0 flex items-start justify-center mt-0.5"
                      style={{ width: "20px", color: "rgba(255,255,255,0.15)", fontSize: "11px", fontWeight: 600 }}
                    >
                      #{idx + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Author */}
                      <div className="flex items-center gap-2 mb-3">
                        <Avatar profile={reply.profiles} size={32} />
                        <UserInfo profile={reply.profiles} />
                        <span className="ml-auto" style={{ color: "rgba(255,255,255,0.25)", fontSize: "11px" }}>
                          {new Date(reply.created_at).toLocaleDateString("de-DE")}
                        </span>
                      </div>

                      {/* Content */}
                      <p
                        className="whitespace-pre-wrap"
                        style={{ color: "rgba(255,255,255,0.75)", fontSize: "14px", lineHeight: 1.6 }}
                      >
                        {reply.content}
                      </p>

                      {/* Like */}
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          className="flex items-center gap-1 text-xs transition-colors"
                          style={{ color: "rgba(255,255,255,0.25)", background: "none", border: "none", cursor: "pointer" }}
                          onClick={async () => {
                            if (!currentUser) return;
                            await fetch("/api/forum/like", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ reply_id: reply.id }),
                            });
                          }}
                        >
                          <ChevronUp size={12} />
                          {reply.upvotes || 0}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reply form */}
        {!post.is_locked && (
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: `1px solid ${catStyle.color}20`,
            }}
          >
            <div className="p-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <h2
                className="text-sm font-bold uppercase tracking-widest"
                style={{ color: "rgba(255,255,255,0.3)", letterSpacing: "0.2em" }}
              >
                Antworten
              </h2>
            </div>
            <div className="p-4">
              {currentUser ? (
                <>
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Schreibe deine Antwort..."
                    rows={4}
                    className="w-full rounded-xl px-4 py-3 resize-none focus:outline-none transition-all"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "white",
                      fontSize: "14px",
                    }}
                    onFocus={(e) => {
                      e.target.style.border = `1px solid ${catStyle.color}50`;
                    }}
                    onBlur={(e) => {
                      e.target.style.border = "1px solid rgba(255,255,255,0.1)";
                    }}
                  />
                  <div className="flex justify-end mt-3">
                    <button
                      onClick={handleReply}
                      disabled={submitting || !replyContent.trim()}
                      className="flex items-center gap-2 px-5 py-2 rounded-xl font-bold transition-all"
                      style={{
                        background: replyContent.trim()
                          ? `linear-gradient(135deg, ${catStyle.color}40, ${catStyle.color}20)`
                          : "rgba(255,255,255,0.05)",
                        border: `1px solid ${replyContent.trim() ? catStyle.color + "60" : "rgba(255,255,255,0.1)"}`,
                        color: replyContent.trim() ? catStyle.color : "rgba(255,255,255,0.3)",
                        fontSize: "13px",
                        cursor: replyContent.trim() ? "pointer" : "not-allowed",
                      }}
                    >
                      <Send size={13} />
                      {submitting ? "Senden..." : "Antworten"}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px", marginBottom: "12px" }}>
                    Du musst eingeloggt sein, um zu antworten.
                  </p>
                  <Link
                    href="/auth/login"
                    className="px-4 py-2 rounded-xl font-bold text-sm"
                    style={{
                      background: `${catStyle.color}20`,
                      border: `1px solid ${catStyle.color}50`,
                      color: catStyle.color,
                    }}
                  >
                    Einloggen
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {post.is_locked && (
          <div
            className="rounded-xl p-4 flex items-center gap-3"
            style={{ background: "rgba(255,136,0,0.08)", border: "1px solid rgba(255,136,0,0.2)" }}
          >
            <Lock size={16} style={{ color: "#ff8800" }} />
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>
              Dieser Beitrag wurde gesperrt. Neue Antworten sind nicht möglich.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

'@
[System.IO.File]::WriteAllText("$root\src\app\forum\post\[id]\page.tsx", $postDetailPage, $enc)
Write-Host "  post/[id]/page.tsx" -ForegroundColor Green

Write-Host ""
Write-Host "Fertig! Alle 4 Dateien geschrieben." -ForegroundColor Cyan
Write-Host "Jetzt: GitHub Desktop -> Commit & Push -> Vercel deployed automatisch." -ForegroundColor Yellow
