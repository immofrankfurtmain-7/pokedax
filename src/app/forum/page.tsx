// src/app/forum/page.tsx
"use client";

import Link from "next/link";
import { useState } from "react";

const categories = [
  { name: "Alle", slug: "all" },
  { name: "Preise", slug: "preise" },
  { name: "Sammlung", slug: "sammlung" },
  { name: "Strategie", slug: "strategie" },
  { name: "News", slug: "news" },
  { name: "Tausch", slug: "tausch" },
  { name: "Fake-Check", slug: "fake-check" },
];

const samplePosts = [
  {
    id: 1,
    title: "Charizard UPC Wertentwicklung – lohnt sich Grading noch 2026?",
    category: "Preise",
    author: "MaxTrainer",
    time: "2 Std.",
    upvotes: 47,
  },
  {
    id: 2,
    title: "Meine komplette SV01-Sammlung ab € Verkauf oder Tausch?",
    category: "Sammlung",
    author: "SaraCollects",
    time: "5 Std.",
    upvotes: 31,
  },
  {
    id: 3,
    title: "Ist diese Charizard Base Set eine Fälschung? Fotos anbei",
    category: "Fake-Check",
    author: "KarteCheck",
    time: "14 Std.",
    upvotes: 89,
  },
  {
    id: 4,
    title: "Neue Sets 2026 – welche Karten werden voraussichtlich explodieren?",
    category: "Strategie",
    author: "TCGInvestor",
    time: "1 Tag",
    upvotes: 124,
  },
];

export default function ForumPage() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredPosts = activeCategory === "all" 
    ? samplePosts 
    : samplePosts.filter(post => post.category.toLowerCase() === activeCategory);

  return (
    <div className="bg-[var(--bg-base)] text-[var(--tx-1)] min-h-screen pb-20">
      <div className="max-w-screen-2xl mx-auto px-10 pt-12">

        {/* Header */}
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-5xl font-light tracking-[-2px]">Forum</h1>
            <p className="text-[var(--tx-2)] mt-3">Diskussionen und Erfahrungen der Community</p>
          </div>
          <Link 
            href="/forum/new" 
            className="px-8 py-4 bg-[var(--g)] text-black font-medium rounded-3xl hover:bg-[#f5c16e] transition-colors"
          >
            + Neuer Beitrag
          </Link>
        </div>

        {/* Kategorien */}
        <div className="flex flex-wrap gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setActiveCategory(cat.slug)}
              className={`px-6 py-2.5 rounded-3xl text-sm font-medium transition-all ${
                activeCategory === cat.slug 
                  ? "bg-[var(--g)] text-black" 
                  : "bg-[var(--bg-1)] border border-[var(--br-2)] hover:border-[var(--g18)]"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Posts */}
        <div className="space-y-6">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <Link 
                key={post.id} 
                href={`/forum/post/${post.id}`}
                className="block bg-[var(--bg-1)] border border-[var(--br-2)] rounded-3xl p-8 hover:border-[var(--g18)] transition-all group"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium text-lg leading-tight group-hover:text-[var(--g)] transition-colors">
                      {post.title}
                    </div>
                    <div className="flex items-center gap-4 mt-6 text-sm">
                      <span className="text-[var(--tx-2)]">{post.author}</span>
                      <span className="text-[var(--tx-3)]">• {post.time}</span>
                      <span className="px-4 py-1 text-xs bg-[var(--g06)] text-[var(--g)] rounded-full border border-[var(--g18)]">
                        {post.category}
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-sm text-[var(--tx-3)]">
                    <div className="flex items-center gap-1 justify-end">
                      ↑ {post.upvotes}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-20 text-[var(--tx-3)]">
              Noch keine Beiträge in dieser Kategorie.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}