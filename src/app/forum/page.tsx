"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const G="#C9A66B",G18="rgba(201,166,107,0.18)",G08="rgba(201,166,107,0.08)";
const BG1="#16161A",BG2="#1C1C21",BG3="#202025";
const BR1="rgba(255,255,255,0.045)",BR2="rgba(255,255,255,0.085)";
const TX1="#F8F6F2",TX2="#BEB9B0",TX3="#6E6B66",GREEN="#3db87a",RED="#dc4a5a";

const CAT_CONFIG: Record<string,{color:string;icon:string}> = {
  Preisdiskussion: {color:"#E9A84B",icon:"◈"},
  Neuigkeiten:     {color:"#60A5FA",icon:"◉"},
  Einsteiger:      {color:"#34D399",icon:"◎"},
  Sammlung:        {color:"#A78BFA",icon:"◇"},
  Strategie:       {color:"#F472B6",icon:"◆"},
  Tausch:          {color:"#38BDF8",icon:"◈"},
  "Fake-Check":    {color:"#FB923C",icon:"⚠"},
  Marktplatz:      {color:"#C084FC",icon:"◉"},
};

interface Post {
  id:string; title:string; content?:string; upvotes:number; created_at:string;
  reply_count?:number; view_count?:number; is_pinned?:boolean; is_hot?:boolean;
  profiles?:{username:string;avatar_url:string|null;is_premium?:boolean};
  forum_categories?:{name:string};
}

function timeAgo(d:string) {
  const mins = Math.floor((Date.now()-new Date(d).getTime())/60000);
  if (mins<1) return "Gerade";
  if (mins<60) return `${mins} Min.`;
  const h = Math.floor(mins/60);
  if (h<24) return `${h} Std.`;
  const days = Math.floor(h/24);
  if (days<7) return `${days} T.`;
  return `${Math.floor(days/7)} Wo.`;
}

function Avatar({username, size=28}:{username:string;size?:number}) {
  const colors = [G,"#60A5FA","#34D399","#A78BFA","#F472B6","#FB923C"];
  const c = colors[username.charCodeAt(0)%colors.length];
  return (
    <div style={{width:size,height:size,borderRadius:"50%",background:`${c}18`,border:`1px solid ${c}30`,
      display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.45,color:c,fontWeight:500,flexShrink:0}}>
      {username[0].toUpperCase()}
    </div>
  );
}

function PostRow({post,onUpvote}:{post:Post;onUpvote:(id:string)=>void}) {
  const cat = post.forum_categories?.name ?? "Forum";
  const cfg = CAT_CONFIG[cat] ?? {color:G,icon:"●"};
  const author = post.profiles?.username ?? "Anonym";

  return (
    <div style={{
      display:"flex",alignItems:"flex-start",gap:0,
      borderBottom:`1px solid ${BR1}`,
      transition:"background .12s",
    }}
    onMouseEnter={e=>(e.currentTarget.style.background=BG2)}
    onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>

      {/* Upvote */}
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"14px 12px 14px 16px",flexShrink:0,minWidth:52}}>
        <button onClick={(e)=>{e.preventDefault();e.stopPropagation();onUpvote(post.id);}} style={{
          width:28,height:28,borderRadius:8,background:"transparent",border:`1px solid ${BR2}`,
          display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",
          fontSize:11,color:TX3,transition:"all .15s",
        }}
        onMouseEnter={e=>{(e.currentTarget as any).style.borderColor=G;(e.currentTarget as any).style.color=G;}}
        onMouseLeave={e=>{(e.currentTarget as any).style.borderColor="rgba(255,255,255,0.085)";(e.currentTarget as any).style.color=TX3;}}>
          ▲
        </button>
        <div style={{fontSize:12,fontWeight:500,color:post.upvotes>0?TX2:TX3,marginTop:4,fontFamily:"var(--font-mono)",lineHeight:1}}>
          {post.upvotes}
        </div>
      </div>

      {/* Content */}
      <Link href={`/forum/post/${post.id}`} style={{flex:1,padding:"14px 16px 14px 0",textDecoration:"none",display:"block",minWidth:0}}>
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:7,flexWrap:"wrap"}}>
          {post.is_pinned&&<span style={{fontSize:9,fontWeight:600,padding:"1px 7px",borderRadius:4,background:"rgba(212,168,67,0.1)",color:G,border:`0.5px solid ${G18}`}}>📌 GEPINNT</span>}
          {post.is_hot&&<span style={{fontSize:9,fontWeight:600,padding:"1px 7px",borderRadius:4,background:"rgba(239,68,68,0.1)",color:"#f87171",border:"0.5px solid rgba(239,68,68,0.2)"}}>🔥 HOT</span>}
          <span style={{fontSize:9,fontWeight:600,padding:"2px 8px",borderRadius:5,background:`${cfg.color}12`,color:cfg.color,border:`0.5px solid ${cfg.color}25`,letterSpacing:".04em"}}>
            {cfg.icon} {cat.toUpperCase()}
          </span>
        </div>
        <div style={{fontSize:14,fontWeight:400,color:TX1,lineHeight:1.4,marginBottom:8,
          overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>
          {post.title}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
          <Avatar username={author} size={18}/>
          <span style={{fontSize:11,color:TX2}}>@{author}</span>
          {post.profiles?.is_premium&&<span style={{fontSize:8,color:G,fontWeight:600}}>✦</span>}
          <span style={{width:2,height:2,borderRadius:"50%",background:TX3,flexShrink:0}}/>
          <span style={{fontSize:11,color:TX3}}>{timeAgo(post.created_at)}</span>
          <span style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:12}}>
            {(post.reply_count??0)>0&&(
              <span style={{fontSize:11,color:TX3,display:"flex",alignItems:"center",gap:4}}>
                💬 {post.reply_count}
              </span>
            )}
          </span>
        </div>
      </Link>
    </div>
  );
}

export default function ForumPage() {
  const [posts,   setPosts]   = useState<Post[]>([]);
  const [cats,    setCats]    = useState<string[]>([]);
  const [cat,     setCat]     = useState("alle");
  const [sort,    setSort]    = useState<"hot"|"neu"|"top">("hot");
  const [search,  setSearch]  = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const sb = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const [pR, cR] = await Promise.all([
        sb.from("forum_posts")
          .select("id,title,content,upvotes,created_at,profiles(username,avatar_url,is_premium),forum_categories(name)")
          .order("created_at",{ascending:false})
          .limit(60),
        sb.from("forum_categories").select("name").order("name"),
      ]);
      const normalized = (pR.data??[]).map((p:any)=>({
        ...p,
        profiles: Array.isArray(p.profiles)?p.profiles[0]:p.profiles,
        forum_categories: Array.isArray(p.forum_categories)?p.forum_categories[0]:p.forum_categories,
      }));
      setPosts(normalized as Post[]);
      const uniqueCats = Array.from(new Set(normalized.map((p:any)=>p.forum_categories?.name).filter(Boolean))) as string[];
      setCats(uniqueCats);
    } catch(e) { console.error(e); }
    setLoading(false);
  }

  async function upvote(postId: string) {
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const post = posts.find(p=>p.id===postId);
    if (!post) return;
    await sb.from("forum_posts").update({upvotes:(post.upvotes??0)+1}).eq("id",postId);
    setPosts(prev=>prev.map(p=>p.id===postId?{...p,upvotes:(p.upvotes??0)+1}:p));
  }

  let filtered = posts.filter(p => {
    if (cat!=="alle" && p.forum_categories?.name!==cat) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!p.title.toLowerCase().includes(q) && !(p.profiles?.username??'').toLowerCase().includes(q)) return false;
    }
    return true;
  });

  if (sort==="top")  filtered = [...filtered].sort((a,b)=>(b.upvotes??0)-(a.upvotes??0));
  if (sort==="hot")  filtered = [...filtered].sort((a,b)=>{
    const sA = (a.upvotes??0)*2 + (a.reply_count??0)*3;
    const sB = (b.upvotes??0)*2 + (b.reply_count??0)*3;
    return sB - sA;
  });

  const pinned  = filtered.filter(p=>p.is_pinned);
  const regular = filtered.filter(p=>!p.is_pinned);
  const sorted  = [...pinned, ...regular];

  return (
    <div style={{color:TX1,minHeight:"80vh"}}>
      <div style={{maxWidth:1160,margin:"0 auto",padding:"clamp(52px,7vw,80px) clamp(16px,3vw,28px)"}}>

        <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",flexWrap:"wrap",gap:14,marginBottom:"clamp(28px,4vw,44px)"}}>
          <div>
            <div style={{fontSize:9,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:TX3,marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
              <span style={{width:16,height:0.5,background:TX3}}/>Community
            </div>
            <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(26px,4vw,46px)",fontWeight:200,letterSpacing:"-.055em",marginBottom:4}}>Forum</h1>
            <p style={{fontSize:12,color:TX3}}>{loading?"Lädt…":`${posts.length} Beiträge`}</p>
          </div>
          <Link href="/forum/new" style={{padding:"10px 22px",borderRadius:12,background:G,color:"#0a0808",fontSize:13,fontWeight:400,textDecoration:"none",boxShadow:`0 2px 16px rgba(212,168,67,0.2)`,flexShrink:0}}>
            + Beitrag
          </Link>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 240px",gap:16,alignItems:"start"}}>
          <div>
            {/* Toolbar */}
            <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
              <div style={{position:"relative",flex:1,minWidth:200}}>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Suchen…"
                  style={{width:"100%",padding:"8px 8px 8px 30px",borderRadius:10,background:BG1,border:`0.5px solid ${BR2}`,color:TX1,fontSize:12,outline:"none"}}/>
              </div>
              <div style={{display:"flex",gap:2,background:BG1,borderRadius:11,padding:3,border:`0.5px solid ${BR1}`}}>
                {([["hot","🔥 Hot"],["neu","✦ Neu"],["top","▲ Top"]] as const).map(([s,l])=>(
                  <button key={s} onClick={()=>setSort(s)} style={{
                    padding:"5px 14px",borderRadius:8,fontSize:12,fontWeight:400,border:"none",cursor:"pointer",
                    background:sort===s?BG2:"transparent",color:sort===s?TX1:TX3,transition:"all .15s",
                  }}>{l}</button>
                ))}
              </div>
            </div>

            {/* Category pills */}
            <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
              <button onClick={()=>setCat("alle")} style={{
                padding:"5px 14px",borderRadius:8,fontSize:11,border:"none",cursor:"pointer",
                background:cat==="alle"?BG3:"transparent",color:cat==="alle"?TX1:TX3,
                outline:`1px solid ${cat==="alle"?BR2:BR1}`,transition:"all .15s",
              }}>Alle</button>
              {cats.map(c=>{
                const cfg = CAT_CONFIG[c]??{color:G,icon:"●"};
                const on = cat===c;
                return (
                  <button key={c} onClick={()=>setCat(c)} style={{
                    padding:"5px 14px",borderRadius:8,fontSize:11,border:"none",cursor:"pointer",
                    background:on?`${cfg.color}12`:"transparent",color:on?cfg.color:TX3,
                    outline:`1px solid ${on?cfg.color+"30":BR1}`,transition:"all .15s",
                  }}>{cfg.icon} {c}</button>
                );
              })}
            </div>

            {/* Posts */}
            <div style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:18,overflow:"hidden"}}>
              {loading ? (
                Array.from({length:8}).map((_,i)=>(
                  <div key={i} style={{height:76,borderBottom:`1px solid ${BR1}`,opacity:.3,animation:"pulse 1.5s ease-in-out infinite"}}/>
                ))
              ) : sorted.length===0 ? (
                <div style={{padding:"48px",textAlign:"center"}}>
                  <div style={{fontSize:14,color:TX3,marginBottom:12}}>Keine Beiträge gefunden.</div>
                  <Link href="/forum/new" style={{fontSize:13,color:G,textDecoration:"none"}}>Ersten Beitrag erstellen →</Link>
                </div>
              ) : sorted.map(post=>(
                <PostRow key={post.id} post={post} onUpvote={upvote}/>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div style={{display:"flex",flexDirection:"column",gap:12,position:"sticky",top:76}}>
            <div style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:16,overflow:"hidden"}}>
              <div style={{padding:"12px 16px",borderBottom:`0.5px solid ${BR1}`,fontSize:10,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:TX3}}>Community</div>
              <div style={{padding:"12px 16px",display:"flex",flexDirection:"column",gap:8}}>
                {[{l:"Beiträge",v:posts.length},{l:"Heute",v:posts.filter(p=>new Date(p.created_at)>new Date(Date.now()-86400000)).length},{l:"Kategorien",v:cats.length}].map(s=>(
                  <div key={s.l} style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:12,color:TX3}}>{s.l}</span>
                    <span style={{fontSize:13,color:TX1,fontFamily:"var(--font-mono)"}}>{s.v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:16,overflow:"hidden"}}>
              <div style={{padding:"12px 16px",borderBottom:`0.5px solid ${BR1}`,fontSize:10,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:TX3}}>Kategorien</div>
              <div style={{padding:"8px 0"}}>
                {cats.map(c=>{
                  const cfg = CAT_CONFIG[c]??{color:G,icon:"●"};
                  const count = posts.filter(p=>p.forum_categories?.name===c).length;
                  return (
                    <button key={c} onClick={()=>setCat(cat===c?"alle":c)} style={{
                      width:"100%",display:"flex",alignItems:"center",gap:10,
                      padding:"8px 16px",background:"transparent",border:"none",cursor:"pointer",
                    }}
                    onMouseEnter={e=>(e.currentTarget.style.background=BG2)}
                    onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                      <span style={{width:6,height:6,borderRadius:"50%",background:cfg.color,flexShrink:0}}/>
                      <span style={{flex:1,textAlign:"left",fontSize:12,color:cat===c?cfg.color:TX2}}>{c}</span>
                      <span style={{fontSize:10,color:TX3,fontFamily:"var(--font-mono)"}}>{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:16,padding:"14px 16px"}}>
              <div style={{fontSize:10,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:TX3,marginBottom:10}}>Quick Links</div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {[{href:"/forum/new",label:"+ Beitrag erstellen",c:G},{href:"/marketplace",label:"◈ Marktplatz",c:TX3},{href:"/scanner",label:"◎ KI-Scanner",c:TX3},{href:"/leaderboard",label:"▲ Leaderboard",c:TX3}].map(l=>(
                  <Link key={l.href} href={l.href} style={{fontSize:12,color:l.c,textDecoration:"none",padding:"3px 0"}}>{l.label}</Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:.3}50%{opacity:.5}}`}</style>
    </div>
  );
}
