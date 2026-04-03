// src/app/forum/post/[id]/page.tsx
"use client";

import Link from "next/link";
import { useState } from "react";

export default function ForumPostDetail() {
  const [newComment, setNewComment] = useState("");

  // Beispiel-Daten (später aus Supabase)
  const post = {
    id: 1,
    title: "Charizard UPC Wertentwicklung – lohnt sich Grading noch 2026?",
    category: "Preise",
    author: "MaxTrainer",
    time: "vor 2 Stunden",
    upvotes: 47,
    content: "Hallo zusammen,\n\nich habe einen Charizard UPC aus der neuesten Kollektion und überlege, ob sich ein PSA- oder CGC-Grading noch lohnt. Der Raw-Wert liegt aktuell bei ca. 85–95 €. Was sind eure Erfahrungen mit Grading bei modernen Karten in 2026? Lohnt sich der Aufwand und die Kosten noch, oder ist der Markt zu gesättigt?\n\nIch würde mich über fundierte Meinungen freuen.",
  };

  const comments = [
    {
      id: 1,
      author: "TCGInvestor",
      time: "vor 1 Stunde",
      content: "Bei modernen Karten lohnt sich Grading nur noch bei Top-Center und bei Karten mit hoher Nachfrage. Bei Charizard UPC würde ich warten, bis der Hype etwas abflaut.",
      upvotes: 12,
    },
    {
      id: 2,
      author: "SaraCollects",
      time: "vor 45 Minuten",
      content: "Ich habe letzten Monat einen graded und bin mit dem Ergebnis sehr zufrieden. PSA 10 bringt aktuell ca. 40–50 % Aufschlag.",
      upvotes: 8,
    },
  ];

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    alert("Kommentar würde hier in der echten Version gespeichert werden.");
    setNewComment("");
  };

  return (
    <div className="bg-[var(--bg-base)] text-[var(--tx-1)] min-h-screen pb-20">
      <div className="max-w-3xl mx-auto px-10 pt-12">

        {/* Back Button */}
        <Link href="/forum" className="inline-flex items-center gap-2 text-[var(--tx-2)] hover:text-[var(--tx-1)] transition-colors mb-8">
          ← Zurück zum Forum
        </Link>

        {/* Post Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="px-4 py-1 text-xs font-medium bg-[var(--g06)] text-[var(--g)] rounded-full border border-[var(--g18)]">
              {post.category}
            </div>
            <div className="text-xs text-[var(--tx-3)]">{post.time}</div>
          </div>

          <h1 className="text-4xl font-light tracking-[-1.2px] leading-tight mb-8">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 text-sm">
            <div className="w-9 h-9 rounded-2xl bg-[var(--bg-2)] flex items-center justify-center font-medium">
              {post.author[0]}
            </div>
            <div>
              <div className="font-medium">{post.author}</div>
              <div className="text-[var(--tx-3)] text-xs">Mitglied seit 2024</div>
            </div>
          </div>
        </div>

        {/* Post Content */}
        <div className="bg-[var(--bg-1)] border border-[var(--br-2)] rounded-3xl p-12 leading-relaxed text-[17px] mb-16">
          {post.content.split("\n\n").map((paragraph, i) => (
            <p key={i} className="mb-6">{paragraph}</p>
          ))}
        </div>

        {/* Upvote Bar */}
        <div className="flex items-center gap-6 mb-12">
          <button className="flex items-center gap-3 text-sm text-[var(--tx-2)] hover:text-[var(--tx-1)] transition-colors">
            <span className="text-2xl">↑</span>
            <span>{post.upvotes}</span>
          </button>
          <div className="text-[var(--tx-3)]">•</div>
          <div className="text-sm text-[var(--tx-3)]">Teilen</div>
        </div>

        {/* Comments Section */}
        <div>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-light">Kommentare ({comments.length})</h2>
          </div>

          <div className="space-y-8 mb-16">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-[var(--bg-1)] border border-[var(--br-2)] rounded-3xl p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-8 h-8 rounded-2xl bg-[var(--bg-2)] flex items-center justify-center text-sm font-medium">
                    {comment.author[0]}
                  </div>
                  <div>
                    <div className="font-medium">{comment.author}</div>
                    <div className="text-xs text-[var(--tx-3)]">{comment.time}</div>
                  </div>
                </div>
                <p className="text-[var(--tx-2)] leading-relaxed">{comment.content}</p>
                <div className="mt-6 flex items-center gap-2 text-xs text-[var(--tx-3)]">
                  ↑ {comment.upvotes}
                </div>
              </div>
            ))}
          </div>

          {/* New Comment */}
          <div className="bg-[var(--bg-1)] border border-[var(--br-2)] rounded-3xl p-8">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Dein Kommentar..."
              className="w-full bg-transparent outline-none resize-y min-h-[120px] text-[var(--tx-1)] placeholder-[var(--tx-3)]"
            />
            <div className="flex justify-end mt-6">
              <button 
                onClick={handleSubmitComment}
                disabled={!newComment.trim()}
                className="px-8 py-4 bg-[var(--g)] text-black font-medium rounded-3xl disabled:opacity-50 transition-all"
              >
                Kommentar senden
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}