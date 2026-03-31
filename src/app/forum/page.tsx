"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const B0="#07070F",B1="#0C0C1A",B2="#101020",B3="#161628",B4="#1E1E38";
const BR1="rgba(255,255,255,0.048)",BR2="rgba(255,255,255,0.080)";
const T1="#EDEAF6",T2="#8A89A8",T3="#454462";
const G="#E9A84B",G18="rgba(233,168,75,0.18)",G06="rgba(233,168,75,0.06)";

interface Post {
  id:string; title:string; content?:string; upvotes:number; created_at:string;
  profiles?:{username:string};
  forum_categories?:{name:string;color?:string};
}
interface Category { id:string; name:string; }

const CAT_STYLE:Record<string,{c:string;bg:string;br:string}>={
  Preise:    {c:G,      bg:"rgba(233,168,75,0.07)",  br:G18},
  News:      {c:G,      bg:"rgba(233,168,75,0.07)",  br:G18},
  Sammlung:  {c:"#4BBF82",bg:"rgba(75,191,130,0.07)",br:"rgba(75,191,130,0.15)"},
  Strategie: {c:"#A855F7",bg:"rgba(168,85,247,0.07)",br:"rgba(168,85,247,0.15)"},
  Tausch:    {c:"#38BDF8",bg:"rgba(56,189,248,0.07)",br:"rgba(56,189,248,0.15)"},
  "Fake-Check":{c:"#3BBDB6",bg:"rgba(59,189,182,0.07)",br:"rgba(59,189,182,0.15)"},
};

function timeAgo(dateStr:string):string {
  const diff=Date.now()-new Date(dateStr).getTime();
  const m=Math.floor(diff/60000);
  if(m<1)return"Gerade eben";
  if(m<60)return`vor ${m} Min.`;
  const h=Math.floor(m/60);
  if(h<24)return`vor ${h} Std.`;
  return`vor ${Math.floor(h/24)} Tagen`;
}

function ThreadRow({post}:{post:Post}) {
  const cat=post.forum_categories?.name??"Allgemein";
  const cs=CAT_STYLE[cat]??{c:T2,bg:"rgba(255,255,255,0.05)",br:BR2};
  const author=post.profiles?.username??"Anonym";
  return(
    <Link href={`/forum/post/${post.id}`} style={{textDecoration:"none"}}>
      <div style={{
        display:"flex",alignItems:"flex-start",gap:14,
        padding:"18px 24px",
        borderBottom:`1px solid rgba(255,255,255,0.038)`,
        transition:"background .1s",cursor:"pointer",
      }}
      onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background="rgba(255,255,255,0.015)";}}
      onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="transparent";}}>
        {/* Avatar */}
        <div style={{
          width:32,height:32,borderRadius:9,
          background:B4,border:`1px solid ${BR2}`,
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:12,fontWeight:600,color:T2,flexShrink:0,marginTop:1,
        }}>{author[0]?.toUpperCase()}</div>

        {/* Body */}
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:5,flexWrap:"wrap"}}>
            <span style={{fontSize:12,fontWeight:500,color:T1}}>{author}</span>
            <span style={{fontSize:9,fontWeight:600,padding:"1px 7px",borderRadius:4,background:cs.bg,color:cs.c,border:`1px solid ${cs.br}`,letterSpacing:".04em"}}>{cat}</span>
            <span style={{fontSize:10,color:T3,marginLeft:"auto"}}>{timeAgo(post.created_at)}</span>
          </div>
          <div style={{fontSize:13.5,fontWeight:500,color:T1,marginBottom:4,letterSpacing:"-.013em",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{post.title}</div>
          <div style={{display:"flex",gap:12}}>
            <span style={{fontSize:10,color:T3,display:"flex",alignItems:"center",gap:3}}>
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M10 2H2C1.4 2 1 2.4 1 3v5c0 .6.4 1 1 1h1l1.5 1.5L6 9h4c.6 0 1-.4 1-1V3c0-.6-.4-1-1-1z"/></svg>
              {post.upvotes??0}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function ForumPage() {
  const [posts,setPosts]=useState<Post[]>([]);
  const [cats,setCats]=useState<Category[]>([]);
  const [activeCat,setActiveCat]=useState("alle");
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    async function load(){
      setLoading(true);
      try{
        const {createClient}=await import("@/lib/supabase/client");
        const sb=createClient();
        const [postsRes,catsRes]=await Promise.all([
          sb.from("forum_posts")
            .select("id,title,upvotes,created_at,profiles(username),forum_categories(name)")
            .order("created_at",{ascending:false}).limit(40),
          sb.from("forum_categories").select("id,name").order("name"),
        ]);
        setPosts(postsRes.data as Post[]??[]);
        setCats(catsRes.data??[]);
      }finally{setLoading(false);}
    }
    load();
  },[]);

  const filtered=activeCat==="alle"?posts:posts.filter(p=>p.forum_categories?.name===activeCat);

  return(
    <div style={{minHeight:"80vh",color:T1}}>
      <div style={{maxWidth:860,margin:"0 auto",padding:"32px 24px"}}>

        {/* Header */}
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:28}}>
          <div>
            <h1 style={{fontSize:22,fontWeight:500,letterSpacing:"-.03em",color:T1,marginBottom:4}}>Forum</h1>
            <p style={{fontSize:12,color:T3}}>{posts.length} Beiträge · Community</p>
          </div>
          <Link href="/forum/new" style={{
            padding:"9px 18px",borderRadius:9,
            background:G,color:"#09070E",
            fontSize:12.5,fontWeight:600,textDecoration:"none",
            boxShadow:"0 2px 12px rgba(233,168,75,0.2)",
          }}>+ Beitrag erstellen</Link>
        </div>

        {/* Category tabs */}
        <div style={{display:"flex",gap:6,marginBottom:20,flexWrap:"wrap"}}>
          {["alle",...cats.map(c=>c.name)].map(cat=>{
            const active=activeCat===cat;
            const cs=cat!=="alle"?CAT_STYLE[cat]:null;
            return(
              <button key={cat} onClick={()=>setActiveCat(cat)} style={{
                padding:"5px 14px",borderRadius:7,fontSize:11.5,fontWeight:500,cursor:"pointer",
                background:active?(cs?cs.bg:G06):"transparent",
                color:active?(cs?cs.c:G):T3,
                border:`1px solid ${active?(cs?cs.br:G18):BR1}`,
                transition:"all .12s",
              }}>
                {cat==="alle"?"Alle Kategorien":cat}
              </button>
            );
          })}
        </div>

        {/* Thread list */}
        <div style={{background:B2,border:`1px solid ${BR2}`,borderRadius:20,overflow:"hidden"}}>
          {loading?(
            <div style={{padding:"48px",textAlign:"center",color:T3}}>Laden…</div>
          ):filtered.length===0?(
            <div style={{padding:"48px",textAlign:"center"}}>
              <div style={{fontSize:13,color:T3,marginBottom:12}}>Noch keine Beiträge in dieser Kategorie</div>
              <Link href="/forum/new" style={{fontSize:12,color:G,textDecoration:"none"}}>Ersten Beitrag erstellen →</Link>
            </div>
          ):(
            filtered.map(post=><ThreadRow key={post.id} post={post}/>)
          )}
          {!loading&&filtered.length>0&&(
            <div style={{padding:"13px 24px",borderTop:`1px solid ${BR1}`,fontSize:12,color:T3}}>
              {filtered.length} Beiträge
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
