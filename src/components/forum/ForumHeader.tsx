"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, Plus, Users, TrendingUp } from "lucide-react";

interface ForumHeaderProps {
  onlineCount?: number;
  postCount?: number;
}

export default function ForumHeader({ onlineCount = 0, postCount = 0 }: ForumHeaderProps) {
  const pathname = usePathname();
  const isPostDetail = pathname?.includes("/forum/post/");
  const isNewPost = pathname?.includes("/forum/new");

  return (
    <div
      className="w-full sticky top-14 z-30"
      style={{
        background: "rgba(8,0,16,0.95)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Accent line */}
      <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(200,100,255,0.5), rgba(0,255,255,0.3), transparent)" }} />

      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Left: Title + breadcrumb */}
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center"
            style={{
              width: 36, height: 36, borderRadius: "10px",
              background: "linear-gradient(135deg, rgba(200,100,255,0.2), rgba(0,255,255,0.1))",
              border: "1px solid rgba(200,100,255,0.3)",
              boxShadow: "0 0 12px rgba(200,100,255,0.15)",
            }}
          >
            <MessageSquare size={16} style={{ color: "#c864ff" }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Link href="/forum"
                className="font-black tracking-tight hover:text-white transition-colors"
                style={{
                  fontSize: 18,
                  background: "linear-gradient(135deg, #ffffff, #c8a0ff)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: isPostDetail || isNewPost ? undefined : "transparent",
                  color: isPostDetail || isNewPost ? "rgba(255,255,255,0.5)" : undefined,
                }}
              >
                Forum
              </Link>
              {isNewPost && (
                <>
                  <span style={{ color: "rgba(255,255,255,0.2)" }}>/</span>
                  <span style={{ fontSize: 15, color: "#00ffff", fontWeight: 600 }}>Neuer Beitrag</span>
                </>
              )}
              {isPostDetail && (
                <>
                  <span style={{ color: "rgba(255,255,255,0.2)" }}>/</span>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Beitrag</span>
                </>
              )}
            </div>
            {/* Stats row */}
            <div className="flex items-center gap-3">
              {onlineCount > 0 && (
                <div className="flex items-center gap-1">
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#00ff96", boxShadow: "0 0 4px #00ff96" }} />
                  <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>{onlineCount} online</span>
                </div>
              )}
              {postCount > 0 && (
                <div className="flex items-center gap-1">
                  <TrendingUp size={10} style={{ color: "rgba(255,255,255,0.25)" }} />
                  <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>{postCount.toLocaleString()} Beiträge</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: New Post button */}
        {!isNewPost && (
          <Link
            href="/forum/new"
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all hover:-translate-y-0.5"
            style={{
              background: "linear-gradient(135deg, rgba(200,100,255,0.2), rgba(0,255,255,0.1))",
              border: "1px solid rgba(200,100,255,0.4)",
              color: "#c864ff",
              fontSize: 13,
              boxShadow: "0 0 16px rgba(200,100,255,0.15)",
              whiteSpace: "nowrap",
            }}
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Neuer Beitrag</span>
            <span className="sm:hidden">Neu</span>
          </Link>
        )}
      </div>
    </div>
  );
}
