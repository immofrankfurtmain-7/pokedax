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
  upvotes: number;
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
  upvotes?: number;
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
                {post.upvotes + (liked ? 1 : 0)}
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
