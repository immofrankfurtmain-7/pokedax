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
