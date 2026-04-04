"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
const G="#E9A84B",G18="rgba(233,168,75,0.18)",G08="rgba(233,168,75,0.08)";
const BG1="#111113",BR1="rgba(255,255,255,0.06)";
const TX1="#f0f0f5",TX2="#a8a8b8",TX3="#6b6b7a";
const GREEN="#4BBF82",RED="#E04558";
interface Post{id:string;title:string;upvotes:number;created_at:string;profiles?:{username:string};forum_categories?:{name:string};}
const CS:Record<string,{c:string}>={
  Preise:{c:G},News:{c:G},Sammlung:{c:GREEN},
  Strategie:{c:"#C084FC"},Tausch:{c:"#7DD3FC"},"Fake-Check":{c:"#3BBDB6"},
};
function ago(d:string){const h=Math.floor((Date.now()-new Date(d).getTime())/3600000);return h<1?"Gerade":h<24?`vor ${h} Std.`:`vor ${Math.floor(h/24)} T.`;}
export default function ForumPage(){
  const[posts,setPosts]=useState<Post[]>([]);
  const[cats,setCats]=useState<{id:string;name:string}[]>([]);
  const[active,setActive]=useState("alle");
  const[loading,setLoading]=useState(true);
  useEffect(()=>{
    async function load(){
      const{createClient}=await import("@/lib/supabase/client");
      const sb=createClient();
      const[pR,cR]=await Promise.all([
        sb.from("forum_posts").select("id,title,upvotes,created_at,profiles(username),forum_categories(name)").order("created_at",{ascending:false}).limit(40),
        sb.from("forum_categories").select("id,name").order("name"),
      ]);
      const norm=(pR.data??[]).map((p:any)=>({...p,profiles:Array.isArray(p.profiles)?p.profiles[0]:p.profiles,forum_categories:Array.isArray(p.forum_categories)?p.forum_categories[0]:p.forum_categories})) as Post[];
      setPosts(norm);setCats(cR.data??[]);setLoading(false);
    }
    load();
  },[]);
  const filtered=active==="alle"?posts:posts.filter(p=>p.forum_categories?.name===active);
  return(
    <div style={{minHeight:"80vh",color:TX1}}>
      <div style={{maxWidth:1000,margin:"0 auto",padding:"72px 24px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:48}}>
          <div>
            <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(36px,5vw,56px)",fontWeight:300,letterSpacing:"-.07em",color:TX1,marginBottom:8}}>Community</h1>
            <p style={{fontSize:15,color:TX3}}>{posts.length} Beiträge</p>
          </div>
          <Link href="/forum/new" className="gold-glow" style={{padding:"14px 28px",borderRadius:22,background:G,color:"#0a0808",fontSize:14,fontWeight:600,textDecoration:"none"}}>+ Beitrag</Link>
        </div>
        <div style={{display:"flex",gap:8,marginBottom:36,flexWrap:"wrap"}}>
          {["alle",...cats.map(c=>c.name)].map(cat=>{
            const on=active===cat;
            const c=cat!=="alle"?CS[cat]?.c:null;
            return(
              <button key={cat} onClick={()=>setActive(cat)} style={{padding:"8px 18px",borderRadius:14,fontSize:13.5,fontWeight:500,cursor:"pointer",background:on?(c?"rgba(233,168,75,0.06)":"rgba(233,168,75,0.06)"):"transparent",color:on?(c??G):TX3,border:`1px solid ${on?"rgba(233,168,75,0.2)":"rgba(255,255,255,0.06)"}`,transition:"all .15s"}}>
                {cat==="alle"?"Alle":cat}
              </button>
            );
          })}
        </div>
        {loading?<div style={{textAlign:"center",padding:80,color:TX3,fontSize:15}}>Lädt…</div>
        :filtered.length===0?<div style={{textAlign:"center",padding:80}}>
            <p style={{fontSize:16,color:TX3,marginBottom:20}}>Noch keine Beiträge</p>
            <Link href="/forum/new" style={{fontSize:15,color:G,textDecoration:"none"}}>Ersten Beitrag erstellen →</Link>
          </div>
        :(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:16}}>
            {filtered.map(post=>{
              const cat=post.forum_categories?.name??"Forum";
              const c=CS[cat]?.c??G;
              const author=post.profiles?.username??"Anonym";
              return(
                <Link key={post.id} href={`/forum/post/${post.id}`} className="card-hover" style={{
                  background:BG1,border:`1px solid ${BR1}`,
                  borderRadius:28,padding:28,
                  textDecoration:"none",display:"block",
                }}>
                  <div style={{fontSize:10,fontWeight:600,letterSpacing:".08em",textTransform:"uppercase",color:c,marginBottom:14}}>{cat}</div>
                  <div style={{fontSize:16,fontWeight:500,color:TX1,lineHeight:1.45,marginBottom:24,display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{post.title}</div>
                  <div style={{fontSize:12,color:TX3,display:"flex",gap:8,alignItems:"center"}}>
                    <span>{author}</span>
                    <span style={{width:3,height:3,borderRadius:"50%",background:TX3,display:"inline-block"}}/>
                    <span>{ago(post.created_at)}</span>
                    <span style={{marginLeft:"auto"}}>↑ {post.upvotes??0}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
