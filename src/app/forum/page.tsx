"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { motion } from "framer-motion";

// ── Type Definitions (sauber & realistisch für Supabase) ──
interface Post {
  id: string;
  title: string;
  upvotes: number;
  created_at: string;
  profiles: { username: string } | null;           // ← wichtig: kann null oder Objekt sein
  forum_categories: { name: string } | null;       // ← wichtig: kann null oder Objekt sein
}

interface Category {
  id: string;
  name: string;
}

export default function ForumPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchForumData() {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const [postsRes, catsRes] = await Promise.all([
        supabase
          .from("forum_posts")
          .select(`
            id,
            title,
            upvotes,
            created_at,
            profiles (username),
            forum_categories (name)
          `)
          .order("created_at", { ascending: false })
          .limit(20),

        supabase
          .from("forum_categories")
          .select("id, name")
          .order("name"),
      ]);

      // Typ-Sicherheit: profiles und forum_categories sind bei Supabase oft Arrays → wir nehmen [0]
      const typedPosts: Post[] = (postsRes.data ?? []).map((p: any) => ({
        ...p,
        profiles: p.profiles?.[0] ?? null,                    // Array → erstes Element oder null
        forum_categories: p.forum_categories?.[0] ?? null,
      }));

      setPosts(typedPosts);
      setCats(catsRes.data ?? []);
      setLoading(false);
    }

    fetchForumData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)]">
        <div className="w-6 h-6 border-2 border-transparent border-t-[var(--g)] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-base)] min-h-screen pb-24">
      <div className="max-w-4xl mx-auto px-6 pt-12">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h1 className="text-4xl font-light tracking-tight">Forum</h1>
            <p className="text-[var(--tx-2)] mt-2">Diskussionen &amp; Erfahrungen der Community</p>
          </div>
          <Link
            href="/forum/new"
            className="px-6 py-3 bg-[var(--g)] text-[#0a0a0a] font-medium rounded-2xl hover:bg-[#f5c16e] transition-colors"
          >
            + Neuer Beitrag
          </Link>
        </div>

        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="text-center py-20 text-[var(--tx-3)]">
              Noch keine Beiträge vorhanden.
            </div>
          ) : (
            posts.map((post) => {
              const category = post.forum_categories?.name ?? "Allgemein";
              const username = post.profiles?.username ?? "Anonym";
              const timeAgo = new Date(post.created_at).toLocaleDateString("de-DE", {
                day: "2-digit",
                month: "short",
              });

              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group bg-[var(--bg-1)] border border-[var(--br-2)] hover:border-[var(--g18)] rounded-3xl p-8 transition-all"
                >
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-2xl bg-[var(--bg-3)] flex items-center justify-center text-xs font-medium text-[var(--tx-2)]">
                        {username[0]?.toUpperCase() ?? "?"}
                      </div>
                      <div>
                        <span className="font-medium text-[var(--tx-1)]">{username}</span>
                        <span className="text-[var(--tx-3)] ml-3 text-xs">{timeAgo}</span>
                      </div>
                    </div>

                    <div className="px-4 py-1 text-xs font-medium bg-[var(--g06)] text-[var(--g)] rounded-full border border-[var(--g18)]">
                      {category}
                    </div>
                  </div>

                  <Link href={`/forum/post/${post.id}`} className="block mt-6 group-hover:text-[var(--g)] transition-colors">
                    <h3 className="text-xl font-medium leading-snug tracking-[-0.2px]">{post.title}</h3>
                  </Link>

                  <div className="mt-6 flex items-center gap-6 text-xs text-[var(--tx-3)]">
                    <div className="flex items-center gap-1.5">
                      <span>↑</span>
                      <span>{post.upvotes ?? 0}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}