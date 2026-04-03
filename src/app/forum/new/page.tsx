// src/app/forum/new/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

const categories = [
  { name: "Preise", value: "preise" },
  { name: "Sammlung", value: "sammlung" },
  { name: "Strategie", value: "strategie" },
  { name: "News", value: "news" },
  { name: "Tausch", value: "tausch" },
  { name: "Fake-Check", value: "fake-check" },
];

export default function NewPostPage() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !category || !content) return;

    setIsSubmitting(true);

    // Simulierte Verzögerung (später echte Supabase-Speicherung)
    setTimeout(() => {
      alert("Beitrag wurde erfolgreich erstellt! (In der echten Version würde er jetzt gespeichert werden)");
      setIsSubmitting(false);
      // Redirect zur Forum-Übersicht
      window.location.href = "/forum";
    }, 1200);
  };

  return (
    <div className="bg-[var(--bg-base)] text-[var(--tx-1)] min-h-screen pb-20">
      <div className="max-w-3xl mx-auto px-10 pt-12">

        {/* Back Button */}
        <Link 
          href="/forum" 
          className="inline-flex items-center gap-2 text-[var(--tx-2)] hover:text-[var(--tx-1)] transition-colors mb-10"
        >
          ← Zurück zum Forum
        </Link>

        <div className="mb-12">
          <h1 className="text-5xl font-light tracking-[-2px]">Neuer Beitrag</h1>
          <p className="text-[var(--tx-2)] mt-3">Teile deine Gedanken mit der Community</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          
          {/* Titel */}
          <div>
            <label className="block text-sm text-[var(--tx-3)] mb-3">Titel des Beitrags</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z. B. Charizard UPC – lohnt sich Grading noch?"
              className="w-full bg-[var(--bg-1)] border border-[var(--br-2)] rounded-3xl px-8 py-5 text-lg outline-none focus:border-[var(--g18)] transition-colors"
              required
            />
          </div>

          {/* Kategorie */}
          <div>
            <label className="block text-sm text-[var(--tx-3)] mb-3">Kategorie</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`py-4 rounded-3xl text-sm font-medium transition-all ${
                    category === cat.value 
                      ? "bg-[var(--g)] text-black" 
                      : "bg-[var(--bg-1)] border border-[var(--br-2)] hover:border-[var(--g18)]"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Inhalt */}
          <div>
            <label className="block text-sm text-[var(--tx-3)] mb-3">Dein Beitrag</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Schreibe hier deinen Beitrag... Sei respektvoll und hilfreich."
              className="w-full bg-[var(--bg-1)] border border-[var(--br-2)] rounded-3xl px-8 py-6 text-[17px] outline-none focus:border-[var(--g18)] transition-colors min-h-[280px] resize-y"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={isSubmitting || !title || !category || !content}
              className="w-full py-5 bg-[var(--g)] text-black font-medium rounded-3xl text-lg hover:bg-[#f5c16e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Beitrag wird erstellt..." : "Beitrag veröffentlichen"}
            </button>
          </div>

          <p className="text-center text-xs text-[var(--tx-3)]">
            Dein Beitrag wird nach manueller Prüfung freigeschaltet.
          </p>
        </form>

      </div>
    </div>
  );
}