// src/app/forum/page.tsx

"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

type Post = {
  id: string;
  title: string;
  upvotes: number;
  created_at: string;
  profiles: { username: string } | null;
  forum_categories: { name: string } | null;
};

export default function ForumPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("alle");

  useEffect(() => {
    async function loadPosts() {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data, error } = await supabase
        .from("forum_posts")
        .select(`
          id,
          title,
          upvotes,
          created_at,
          profiles!inner(username),
          forum_categories!inner(name)
        `)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) {
        console.error("Forum fetch error:", error);
        setLoading(false);
        return;
      }

      // Supabase gibt profiles als Array zurück → wir nehmen das erste Element
      const mappedPosts: Post[] = (data || []).map((item: any) => ({
        ...item,
        profiles: item.profiles?.[0] || null,        // wichtig: Array → einzelnes Objekt
        forum_categories: item.forum_categories?.[0] || null,
      }));

      setPosts(mappedPosts);
      setLoading(false);
    }

    loadPosts();
  }, []);

  const getTimeAgo = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return "Gerade eben";
    if (hours < 24) return `vor ${hours} Std.`;
    return `vor ${Math.floor(hours / 24)} Tagen`;
  };

  const filteredPosts = activeCategory === "alle" 
    ? posts 
    : posts.filter(p => p.forum_categories?.name === activeCategory);

  const categories = ["alle", ...new Set(posts.map(p => p.forum_categories?.name).filter(Boolean))];

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--canvas)] flex items-center justify-center">
        <div className="text-[var(--tx-3)]">Laden...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--canvas)] py-16">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="font-display text-5xl font-light tracking-[-0.04em]">Forum</h1>
            <p className="text-[var(--tx-2)] mt-2">Diskutiere Preise, Sammlungen und Strategien mit der Community.</p>
          </div>
          <Link 
            href="/forum/new"
            className="px-8 py-4 bg-[var(--gold)] text-[#0a0a0a] font-semibold rounded-3xl gold-glow"
          >
            + Neuer Beitrag
          </Link>
        </div>

        {/* Kategorie Filter */}
        <div className="flex flex-wrap gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-3 text-sm rounded-2xl transition-all gold-glow ${
                activeCategory === cat 
                  ? "bg-[var(--gold)] text-[#0a0a0a] font-medium" 
                  : "bg-[var(--bg-1)] text-[var(--tx-2)] hover:text-[var(--tx-1)] border border-[var(--br-2)]"
              }`}
            >
              {cat === "alle" ? "Alle Beiträge" : cat}
            </button>
          ))}
        </div>

        {/* Posts */}
        <div className="space-y-6">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => {
              const cat = post.forum_categories?.name || "Allgemein";
              const author = post.profiles?.username || "Anonym";
              const ago = getTimeAgo(post.created_at);

              return (
                <Link 
                  key={post.id} 
                  href={`/forum/post/${post.id}`}
                  className="block bg-[var(--bg-1)] border border-[var(--br-1)] rounded-3xl p-9 gold-glow group"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-5">
                      <div className="w-11 h-11 rounded-2xl bg-[var(--bg-2)] flex items-center justify-center text-lg font-light text-[var(--tx-2)] border border-[var(--br-2)]">
                        {author[0]?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <div className="font-medium text-[var(--tx-1)]">{author}</div>
                        <div className="text-xs text-[var(--tx-3)]">{ago}</div>
                      </div>
                    </div>

                    <div className="px-5 py-1.5 text-xs font-medium bg-[var(--gold-08)] text-[var(--gold)] rounded-full border border-[var(--gold-12)]">
                      {cat}
                    </div>
                  </div>

                  <div className="mt-7 text-[17px] leading-tight text-[var(--tx-1)] group-hover:text-[var(--gold)] transition-colors">
                    {post.title}
                  </div>

                  <div className="mt-8 flex items-center gap-6 text-xs text-[var(--tx-3)]">
                    <span>↑ {post.upvotes || 0} Upvotes</span>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="bg-[var(--bg-1)] border border-[var(--br-1)] rounded-3xl p-20 text-center">
              <div className="text-[var(--tx-3)] text-lg">Noch keine Beiträge in dieser Kategorie.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}