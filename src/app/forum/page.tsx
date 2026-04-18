"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const GOLD = "#C9A66B";
const BG   = "#0A0A0A";
const BG2  = "#111111";
const BG3  = "#1A1A1A";
const TX   = "#EDE9E0";
const TX2  = "rgba(237,233,224,0.7)";
const GD2  = "rgba(201,166,107,0.7)";

const SB = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function timeAgo(date: string) {
  const m = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
  if (m < 1)    return "gerade eben";
  if (m < 60)   return `${m} Min.`;
  if (m < 1440) return `${Math.floor(m / 60)} Std.`;
  return `${Math.floor(m / 1440)}d`;
}

export default function ForumPage() {
  const [posts,   setPosts]   = useState<any[]>([]);
  const [cats,    setCats]    = useState<any[]>([]);
  const [catId,   setCatId]   = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [user,    setUser]    = useState<any>(null);
  const [showNew, setShowNew] = useState(false);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    SB.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    SB.from("forum_categories").select("id,name,slug,icon").order("name")
      .then(({ data }) => {
        if (data?.length) {
          setCats(data);
        } else {
          // Fallback categories if table is empty
          setCats([
            { id: "1", name: "Allgemein",    slug: "allgemein",    icon: "💬" },
            { id: "2", name: "Preise",        slug: "preise",       icon: "📈" },
            { id: "3", name: "Suche/Biete",   slug: "suche-biete",  icon: "🔄" },
            { id: "4", name: "Neuheiten",     slug: "neuheiten",    icon: "✨" },
            { id: "5", name: "Grading",       slug: "grading",      icon: "🏆" },
          ]);
        }
      });
    loadPosts(null);

    channelRef.current = SB.channel("forum_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "forum_posts" }, () => loadPosts(catId))
      .subscribe();
    return () => { channelRef.current?.unsubscribe(); };
  }, []);

  useEffect(() => { loadPosts(catId); }, [catId]);

  async function loadPosts(categoryId: string | null) {
    setLoading(true);
    try {
      let q = SB.from("forum_posts")
        .select(`id,title,upvotes,created_at,card_id,
          profiles!forum_posts_user_id_fkey(username),
          forum_categories!forum_posts_category_id_fkey(name,slug),
          cards!forum_posts_card_id_fkey(name,name_de,image_url)`)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false })
        .limit(40);
      if (categoryId) q = q.eq("category_id", categoryId);
      const { data } = await q;
      setPosts((data ?? []).map((p: any) => ({
        ...p,
        profiles:         Array.isArray(p.profiles)         ? p.profiles[0]         : p.profiles,
        forum_categories: Array.isArray(p.forum_categories) ? p.forum_categories[0] : p.forum_categories,
        cards:            Array.isArray(p.cards)            ? p.cards[0]            : p.cards,
      })));
    } catch {}
    setLoading(false);
  }

  async function upvote(postId: string, current: number) {
    if (!user) { window.location.href = "/auth/login"; return; }
    try {
      await SB.from("forum_posts").update({ upvotes: current + 1 }).eq("id", postId);
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, upvotes: p.upvotes + 1 } : p));
    } catch {}
  }

  return (
    <div style={{ background: BG, minHeight: "100vh", color: TX }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;700&family=Instrument+Sans:wght@400;500;600&display=swap');
        .ph { font-family:'Playfair Display',serif; letter-spacing:-0.05em; }
        .post-row { background:#111111; border:1px solid rgba(255,255,255,0.06); border-radius:16px; overflow:hidden; transition:border-color 0.2s,transform 0.2s; cursor:pointer; }
        .post-row:hover { border-color:rgba(201,166,107,0.25); transform:translateY(-1px); }
        .cat-btn { padding:9px 18px; border-radius:100px; border:1px solid transparent; font-size:13px; cursor:pointer; transition:all 0.2s; background:transparent; }
        .cat-btn.active { background:rgba(201,166,107,0.1); border-color:rgba(201,166,107,0.3); color:#C9A66B; font-weight:600; }
        .cat-btn:not(.active) { color:rgba(237,233,224,0.5); }
        .cat-btn:not(.active):hover { color:#EDE9E0; background:rgba(255,255,255,0.04); }
        .btn-gold { display:inline-flex; align-items:center; gap:8px; padding:12px 24px; background:#C9A66B; color:#0A0A0A; border-radius:100px; border:none; font-size:13px; font-weight:600; cursor:pointer; text-decoration:none; transition:transform 0.2s; }
        .btn-gold:hover { transform:scale(1.03); }
        .vote-btn { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:3px; padding:0 20px; background:transparent; border:none; border-right:1px solid rgba(255,255,255,0.06); cursor:pointer; min-width:60px; flex-shrink:0; transition:background 0.15s; }
        .vote-btn:hover { background:rgba(201,166,107,0.06); }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation:fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) both; }
        .live-dot { width:7px; height:7px; border-radius:50%; background:#3db87a; animation:livePulse 2s ease-in-out infinite; }
        @keyframes livePulse { 0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(61,184,122,0)} 50%{opacity:0.7;box-shadow:0 0 0 4px rgba(61,184,122,0.1)} }
      `}</style>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(60px,8vw,100px) clamp(20px,4vw,48px)" }}>

        {/* Header */}
        <div style={{ marginBottom: 56, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: GD2, marginBottom: 16 }}>Community</div>
            <h1 className="ph" style={{ fontSize: "clamp(36px,5vw,72px)", fontWeight: 500, color: TX, lineHeight: 1 }}>
              Forum &<br/><span style={{ color: GOLD }}>Austausch</span>
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div className="live-dot"/>
              <span style={{ fontSize: 11, color: TX2 }}>Live</span>
            </div>
            <button onClick={() => { if (!user) { window.location.href = "/auth/login"; return; } setShowNew(true); }}
              className="btn-gold">+ Beitrag erstellen</button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 48, alignItems: "start" }}>

          {/* Sidebar */}
          <div style={{ position: "sticky", top: 100 }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: GD2, marginBottom: 12 }}>Kategorien</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <button className={`cat-btn${catId === null ? " active" : ""}`} onClick={() => setCatId(null)}>
                Alle Beiträge
              </button>
              {cats.map(cat => (
                <button key={cat.id} className={`cat-btn${catId === cat.id ? " active" : ""}`} onClick={() => setCatId(cat.id)}>
                  {cat.icon && <span style={{ marginRight: 6 }}>{cat.icon}</span>}
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Stats */}
            <div style={{ marginTop: 32, padding: "20px", background: BG2, borderRadius: 16, border: "1px solid rgba(201,166,107,0.1)" }}>
              <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: GD2, marginBottom: 12 }}>Community</div>
              <div style={{ fontSize: 28, fontWeight: 500, color: GOLD, fontFamily: "'Playfair Display', serif" }}>{posts.length}</div>
              <div style={{ fontSize: 12, color: TX2 }}>Aktive Beiträge</div>
            </div>
          </div>

          {/* Posts */}
          <div>
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} style={{ height: 90, background: BG2, borderRadius: 16, opacity: 0.4, animation: "fadeUp 1.5s ease-in-out infinite" }}/>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 20px" }}>
                <div style={{ fontSize: 48, opacity: 0.15, marginBottom: 16, color: GOLD }}>◉</div>
                <div style={{ fontSize: 18, color: TX2, marginBottom: 24 }}>Noch keine Beiträge</div>
                <button onClick={() => setShowNew(true)} className="btn-gold">Ersten Beitrag erstellen</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {posts.map((post, i) => {
                  const imgSrc = post.cards?.image_url?.includes(".") ? post.cards.image_url : (post.cards?.image_url ? post.cards.image_url + "/low.webp" : null);
                  return (
                    <div key={post.id} className="post-row fade-up" style={{ animationDelay: `${i * 30}ms`, display: "flex" }}>
                      {/* Vote */}
                      <button className="vote-btn" onClick={() => upvote(post.id, post.upvotes)}>
                        <span style={{ fontSize: 12, color: GD2 }}>▲</span>
                        <span style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 600, color: TX }}>{post.upvotes}</span>
                      </button>

                      {/* Content */}
                      <Link href={`/forum/post/${post.id}`} style={{ textDecoration: "none", flex: 1, padding: "16px 20px", display: "flex", gap: 14 }}>
                        {imgSrc && (
                          <div style={{ width: 40, height: 56, borderRadius: 6, overflow: "hidden", background: BG3, flexShrink: 0, border: "1px solid rgba(255,255,255,0.06)" }}>
                            <img src={imgSrc} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }}/>
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                            {post.forum_categories && (
                              <span style={{ padding: "2px 10px", borderRadius: 100, background: "rgba(201,166,107,0.08)", color: GD2, fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", border: "1px solid rgba(201,166,107,0.15)" }}>
                                {post.forum_categories.name}
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: 15, fontWeight: 600, color: TX, marginBottom: 4, lineHeight: 1.3 }}>{post.title}</div>
                          {(post.body || post.content) && (
                            <div style={{ fontSize: 13, color: TX2, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", lineHeight: 1.6 }}>
                              {post.body || post.content}
                            </div>
                          )}
                          <div style={{ marginTop: 8, display: "flex", gap: 12, fontSize: 11, color: "rgba(237,233,224,0.35)" }}>
                            <span>@{post.profiles?.username ?? "Anonym"}</span>
                            <span>vor {timeAgo(post.created_at)}</span>
                            {post.cards && <span style={{ color: GD2 }}>◎ {post.cards.name_de || post.cards.name}</span>}
                          </div>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {showNew && <NewPostModal cats={cats} onClose={() => setShowNew(false)} onCreated={() => { setShowNew(false); loadPosts(catId); }}/>}
    </div>
  );
}

function NewPostModal({ cats, onClose, onCreated }: { cats: any[]; onClose: () => void; onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [body,  setBody]  = useState("");
  const [catId, setCatId] = useState<string | null>(cats[0]?.id ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!title.trim()) { setError("Bitte einen Titel eingeben."); return; }
    setLoading(true);
    try {
      const { data: { session } } = await SB.auth.getSession();
      if (!session) { window.location.href = "/auth/login"; return; }
      const bodyText = body.trim() || null;
      // Try all possible column name combinations
      const attempts = [
        { user_id: session.user.id, title: title.trim(), content: bodyText, category_id: catId, upvotes: 0, is_deleted: false },
        { user_id: session.user.id, title: title.trim(), body: bodyText,    category_id: catId, upvotes: 0, is_deleted: false },
        { author_id: session.user.id, title: title.trim(), content: bodyText, category_id: catId, upvotes: 0 },
        { author_id: session.user.id, title: title.trim(), body: bodyText,    category_id: catId, upvotes: 0 },
        { user_id: session.user.id, title: title.trim(), category_id: catId, upvotes: 0 },
      ];
      let e: any = null;
      for (const attempt of attempts) {
        const result = await SB.from("forum_posts").insert(attempt);
        if (!result.error) { e = null; break; }
        e = result.error;
        if (!result.error.message?.includes("column")) break;
      }
      if (e) { setError(e.message); setLoading(false); return; }
      onCreated();
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#111111", borderRadius: 24, width: "100%", maxWidth: 540, padding: 36, position: "relative", border: "1px solid rgba(201,166,107,0.2)" }}>
        <div style={{ position: "absolute", top: 0, left: "20%", right: "20%", height: 1, background: "linear-gradient(90deg,transparent,rgba(201,166,107,0.4),transparent)" }}/>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", fontSize: 22, cursor: "pointer", color: TX2 }}>×</button>
        <h2 className="ph" style={{ fontSize: 28, fontWeight: 500, marginBottom: 24, color: TX }}>Neuer Beitrag</h2>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: GD2, marginBottom: 8 }}>Kategorie</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {cats.map(cat => (
              <button key={cat.id} onClick={() => setCatId(cat.id)} style={{
                padding: "7px 16px", borderRadius: 100, fontSize: 12, fontWeight: 500, cursor: "pointer",
                border: "1px solid", transition: "all 0.15s",
                borderColor: catId === cat.id ? "rgba(201,166,107,0.4)" : "rgba(255,255,255,0.1)",
                background: catId === cat.id ? "rgba(201,166,107,0.1)" : "transparent",
                color: catId === cat.id ? GOLD : TX2,
              }}>{cat.icon && cat.icon + " "}{cat.name}</button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: GD2, marginBottom: 8 }}>Titel</div>
          <input value={title} onChange={e => setTitle(e.target.value)} maxLength={120}
            placeholder="Worum geht es?"
            style={{ width: "100%", padding: "14px 18px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: TX, fontSize: 15, outline: "none", fontFamily: "inherit" }}/>
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: GD2, marginBottom: 8 }}>Inhalt</div>
          <textarea value={body} onChange={e => setBody(e.target.value)} rows={4}
            placeholder="Schreib mehr dazu…"
            style={{ width: "100%", padding: "14px 18px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: TX, fontSize: 15, outline: "none", resize: "vertical", minHeight: 100, fontFamily: "inherit" }}/>
        </div>

        {error && <div style={{ marginBottom: 16, fontSize: 13, color: "#dc4a5a" }}>{error}</div>}

        <button onClick={submit} disabled={loading || !title.trim()}
          className="btn-gold" style={{ width: "100%", justifyContent: "center", opacity: loading || !title.trim() ? 0.5 : 1 }}>
          {loading ? "Veröffentliche…" : "Beitrag veröffentlichen"}
        </button>
      </div>
    </div>
  );
}
