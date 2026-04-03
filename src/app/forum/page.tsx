"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
const G="#E9A84B",G18="rgba(233,168,75,0.18)",G08="rgba(233,168,75,0.08)";
const BG1="#111113",BG3="#222228";
const BR1="rgba(255,255,255,0.050)",BR2="rgba(255,255,255,0.085)";
const TX1="#f0f0f5",TX2="#a8a8b8",TX3="#6b6b7a";
const GREEN="#4BBF82",RED="#E04558";

interface Post { id:string;title:string;upvotes:number;created_at:string;profiles?:{username:string};forum_categories?:{name:string}; }
interface Cat  { id:string;name:string; }
const CS: Record<string,{c:string;bg:string;br:string}> = {
  Preise:      {c:G,      bg:G08,                         br:G18},
  News:        {c:G,      bg:G08,                         br:G18},
  Sammlung:    {c:GREEN,  bg:"rgba(75,191,130,0.08)",      br:"rgba(75,191,130,0.18)"},
  Strategie:   {c:"#C084FC",bg:"rgba(192,132,252,0.08)",  br:"rgba(192,132,252,0.18)"},
  Tausch:      {c:"#7DD3FC",bg:"rgba(125,211,252,0.08)",  br:"rgba(125,211,252,0.18)"},
  "Fake-Check":{c:"#3BBDB6",bg:"rgba(59,189,182,0.08)",   br:"rgba(59,189,182,0.18)"},
};
function ago(d:string) {
  const h=Math.floor((Date.now()-new Date(d).getTime())/3600000);
  return h<1?"Gerade":h<24?`vor ${h} Std.`:`vor ${Math.floor(h/24)}d`;
}
export default function ForumPage() {
  const [posts,setPosts]=useState<Post[]>([]);
  const [cats,setCats]=useState<Cat[]>([]);
  const [active,setActive]=useState("alle");
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    async function load(){
      const {createClient}=await import("@/lib/supabase/client");
      const sb=createClient();
      const [pR,cR]=await Promise.all([
        sb.from("forum_posts").select("id,title,upvotes,created_at,profiles(username),forum_categories(name)").order("created_at",{ascending:false}).limit(40),
        sb.from("forum_categories").select("id,name").order("name"),
      ]);
      setPosts(pR.data as Post[]??[]);setCats(cR.data??[]);setLoading(false);
    }
    load();
  },[]);
  const filtered=active==="alle"?posts:posts.filter(p=>p.forum_categories?.name===active);
  return(
    <div style={{minHeight:"80vh",color:TX1}}>
      <div style={{maxWidth:860,margin:"0 auto",padding:"44px 28px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:28}}>
          <div>
            <h1 style={{fontSize:24,fontWeight:300,letterSpacing:"-.04em",color:TX1,marginBottom:5,fontFamily:"var(--font-display)"}}>Forum</h1>
            <p style={{fontSize:12.5,color:TX3}}>{posts.length} Beiträge · Community</p>
          </div>
          <Link href="/forum/new" style={{padding:"10px 20px",borderRadius:10,background:G,color:"#0a0808",fontSize:12.5,fontWeight:600,textDecoration:"none",boxShadow:"0 2px 14px rgba(233,168,75,0.2)"}}>+ Beitrag erstellen</Link>
        </div>
        <div style={{display:"flex",gap:6,marginBottom:22,flexWrap:"wrap"}}>
          {["alle",...cats.map(c=>c.name)].map(cat=>{
            const on=active===cat;
            const cs=cat!=="alle"?CS[cat]:null;
            return(
              <button key={cat} onClick={()=>setActive(cat)} style={{padding:"5px 14px",borderRadius:8,fontSize:11.5,fontWeight:500,cursor:"pointer",background:on?(cs?cs.bg:G08):"transparent",color:on?(cs?cs.c:G):TX3,border:`1px solid ${on?(cs?cs.br:G18):BR1}`,transition:"all .12s"}}>
                {cat==="alle"?"Alle":cat}
              </button>
            );
          })}
        </div>
        <div style={{background:BG1,border:`1px solid ${BR2}`,borderRadius:22,overflow:"hidden"}}>
          {loading?<div style={{padding:"48px",textAlign:"center",color:TX3}}>Lädt…</div>
          :filtered.length===0?<div style={{padding:"48px",textAlign:"center"}}>
              <div style={{fontSize:13.5,color:TX3,marginBottom:12}}>Noch keine Beiträge</div>
              <Link href="/forum/new" style={{fontSize:13,color:G,textDecoration:"none"}}>Ersten Beitrag erstellen →</Link>
            </div>
          :filtered.map((post,i)=>{
            const cat=post.forum_categories?.name??"Allgemein";
            const cs=CS[cat]??{c:TX2,bg:BR1,br:BR2};
            const author=post.profiles?.username??"Anonym";
            return(
              <Link key={post.id} href={`/forum/post/${post.id}`} style={{textDecoration:"none"}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:14,padding:"18px 24px",borderBottom:i<filtered.length-1?"1px solid rgba(255,255,255,0.032)":"none",cursor:"pointer",transition:"background .1s"}}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background="rgba(255,255,255,0.015)";}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="transparent";}}>
                  <div style={{width:32,height:32,borderRadius:9,background:BG3,border:`1px solid ${BR2}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12.5,fontWeight:600,color:TX2,flexShrink:0,marginTop:1}}>{author[0]?.toUpperCase()}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:5,flexWrap:"wrap"}}>
                      <span style={{fontSize:12,fontWeight:500,color:TX1}}>{author}</span>
                      <span style={{fontSize:9,fontWeight:600,padding:"1px 7px",borderRadius:4,background:cs.bg,color:cs.c,border:`1px solid ${cs.br}`,letterSpacing:".04em"}}>{cat}</span>
                      <span style={{fontSize:10,color:TX3,marginLeft:"auto"}}>{ago(post.created_at)}</span>
                    </div>
                    <div style={{fontSize:13.5,fontWeight:500,color:TX1,marginBottom:4,letterSpacing:"-.013em",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{post.title}</div>
                    <span style={{fontSize:10,color:TX3}}>↑ {post.upvotes??0}</span>
                  </div>
                </div>
              </Link>
            );
          })}
          {!loading&&filtered.length>0&&<div style={{padding:"13px 24px",borderTop:`1px solid ${BR1}`,fontSize:12,color:TX3}}>{filtered.length} Beiträge</div>}
        </div>
      </div>
    </div>
  );
}
