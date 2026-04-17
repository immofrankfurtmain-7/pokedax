"use client";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const G="#C9A66B",G18="rgba(201,166,107,0.18)";
const BG1="#16161A",BG2="#1C1C21",BR1="rgba(255,255,255,0.045)",BR2="rgba(255,255,255,0.085)";
const TX1="#F8F6F2",TX2="#BEB9B0",TX3="#6E6B66",GREEN="#3db87a",RED="#dc4a5a";

const CAT_CONFIG:Record<string,{color:string;icon:string}>={
  Preisdiskussion:{color:"#E9A84B",icon:"◈"},Neuigkeiten:{color:"#60A5FA",icon:"◉"},
  Einsteiger:{color:"#34D399",icon:"◎"},Sammlung:{color:"#A78BFA",icon:"◇"},
  Strategie:{color:"#F472B6",icon:"◆"},Tausch:{color:"#38BDF8",icon:"◈"},
  "Fake-Check":{color:"#FB923C",icon:"⚠"},Marktplatz:{color:"#C084FC",icon:"◉"},
};

function timeAgo(d:string){
  const mins=Math.floor((Date.now()-new Date(d).getTime())/60000);
  if(mins<1)return"Gerade";if(mins<60)return`${mins} Min.`;
  const h=Math.floor(mins/60);if(h<24)return`${h} Std.`;
  return`${Math.floor(h/24)} T.`;
}

export default function ForumPostPage() {
  const {id}=useParams() as {id:string};
  const [post,     setPost]     = useState<any>(null);
  const [replies,  setReplies]  = useState<any[]>([]);
  const [user,     setUser]     = useState<any>(null);
  const [loading,  setLoading]  = useState(true);
  const [reply,    setReply]    = useState("");
  const [sending,  setSending]  = useState(false);
  const [error,    setError]    = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);

  useEffect(()=>{
    const sb=createClient();
    async function load(){
      // Auth
      const {data:{session}} = await sb.auth.getSession();
      setUser(session?.user ?? null);

      // Post
      const {data:p} = await sb.from("forum_posts")
        .select("*,profiles(username,is_premium),forum_categories(name)")
        .eq("id",id).single();
      if(p) setPost({...p,
        profiles:Array.isArray(p.profiles)?p.profiles[0]:p.profiles,
        forum_categories:Array.isArray(p.forum_categories)?p.forum_categories[0]:p.forum_categories,
      });

      // Replies
      const {data:r} = await sb.from("forum_replies")
        .select("id,content,upvotes,created_at,author_id,profiles(username,avatar_url,is_premium)")
        .eq("post_id",id).eq("is_deleted",false)
        .order("created_at",{ascending:true});
      setReplies((r??[]).map((x:any)=>({...x,profiles:Array.isArray(x.profiles)?x.profiles[0]:x.profiles})));
      setLoading(false);

      // Supabase Realtime — live replies
      const channel = sb.channel(`forum_post_${id}`)
        .on('postgres_changes',{
          event:'INSERT', schema:'public', table:'forum_replies',
          filter:`post_id=eq.${id}`,
        },(payload:any)=>{
          const newReply = payload.new;
          // Fetch profile for new reply
          sb.from("profiles").select("username,avatar_url,is_premium")
            .eq("id",newReply.author_id).single()
            .then(({data:prof})=>{
              setReplies(prev=>{
                // Don't add duplicates
                if(prev.find(r=>r.id===newReply.id)) return prev;
                return [...prev,{...newReply,profiles:prof}];
              });
            });
        })
        .subscribe();
      channelRef.current = channel;
    }
    load();
    return ()=>{
      if(channelRef.current) sb.removeChannel(channelRef.current);
    };
  },[id]);

  // Scroll to bottom when new reply arrives
  useEffect(()=>{
    if(replies.length>0) bottomRef.current?.scrollIntoView({behavior:"smooth",block:"nearest"});
  },[replies.length]);

  async function submitReply(){
    if(!reply.trim()) return;
    setSending(true); setError("");
    const sb=createClient();
    const {data:{session}} = await sb.auth.getSession();
    const h:Record<string,string>={"Content-Type":"application/json"};
    if(session?.access_token) h["Authorization"]=`Bearer ${session.access_token}`;
    const res=await fetch("/api/forum/replies",{method:"POST",headers:h,
      body:JSON.stringify({post_id:id,content:reply.trim()})});
    const data=await res.json();
    if(!res.ok){setError(data.error??"Fehler.");setSending(false);return;}
    // Realtime will add it automatically, but add optimistically too
    setReplies(prev=>{
      if(prev.find(r=>r.id===data.reply?.id)) return prev;
      return [...prev,data.reply];
    });
    setReply("");
    setSending(false);
  }

  if(loading) return(
    <div style={{color:TX1,minHeight:"80vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{fontSize:14,color:TX3}}>Lädt…</div>
    </div>
  );
  if(!post) return(
    <div style={{color:TX1,minHeight:"80vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div><div style={{fontSize:14,color:TX3,marginBottom:12}}>Beitrag nicht gefunden.</div>
      <Link href="/forum" style={{color:G,textDecoration:"none",fontSize:13}}>← Forum</Link></div>
    </div>
  );

  const catName=post.forum_categories?.name??"Forum";
  const cfg=CAT_CONFIG[catName]??{color:G,icon:"●"};

  return(
    <div style={{color:TX1,minHeight:"80vh"}}>
      <div style={{maxWidth:760,margin:"0 auto",padding:"clamp(52px,7vw,80px) clamp(16px,3vw,28px)"}}>
        <Link href="/forum" style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:12,color:TX3,textDecoration:"none",marginBottom:24}}>← Forum</Link>

        {/* Post */}
        <div style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:18,overflow:"hidden",marginBottom:14}}>
          <div style={{padding:"20px 22px",borderBottom:`0.5px solid ${BR1}`}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:5,padding:"3px 10px",borderRadius:6,
              background:`${cfg.color}12`,border:`0.5px solid ${cfg.color}25`,marginBottom:12}}>
              <span style={{fontSize:10,color:cfg.color}}>{cfg.icon}</span>
              <span style={{fontSize:10,fontWeight:600,color:cfg.color,letterSpacing:".04em"}}>{catName.toUpperCase()}</span>
            </div>
            <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(18px,3vw,28px)",fontWeight:300,
              letterSpacing:"-.03em",marginBottom:14,lineHeight:1.3}}>{post.title}</h1>
            <div style={{display:"flex",alignItems:"center",gap:10,fontSize:11,color:TX3,flexWrap:"wrap"}}>
              <span style={{color:TX2}}>@{post.profiles?.username??"Anonym"}</span>
              {post.profiles?.is_premium&&<span style={{color:G,fontSize:9}}>✦</span>}
              <span>·</span><span>{timeAgo(post.created_at)}</span>
              <span>·</span><span>↑ {post.upvotes??0}</span>
              {(post.reply_count??0)>0&&<><span>·</span><span>💬 {post.reply_count}</span></>}
            </div>
          </div>
          <div style={{padding:"20px 22px",fontSize:14,color:TX2,lineHeight:1.8,whiteSpace:"pre-wrap"}}>{post.content}</div>
        </div>

        {/* Live indicator */}
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}>
          <div style={{fontSize:10,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:TX3}}>
            {replies.length} {replies.length===1?"Antwort":"Antworten"}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:4,marginLeft:"auto"}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:GREEN,animation:"pulse 2s ease-in-out infinite"}}/>
            <span style={{fontSize:9,color:TX3}}>Live</span>
          </div>
        </div>

        {/* Replies */}
        {replies.length>0&&(
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
            {replies.map((r:any)=>(
              <div key={r.id} style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:14,padding:"14px 18px"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8,fontSize:11,color:TX3}}>
                  <span style={{color:TX2}}>@{r.profiles?.username??"Anonym"}</span>
                  {r.profiles?.is_premium&&<span style={{color:G,fontSize:9}}>✦</span>}
                  <span>·</span><span>{timeAgo(r.created_at)}</span>
                  <span style={{marginLeft:"auto"}}>↑ {r.upvotes??0}</span>
                </div>
                <div style={{fontSize:13,color:TX2,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{r.content}</div>
              </div>
            ))}
            <div ref={bottomRef}/>
          </div>
        )}

        {/* Reply form */}
        <div style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:16,padding:"18px"}}>
          <div style={{fontSize:11,fontWeight:500,color:TX1,marginBottom:12}}>Antworten</div>
          {user?(
            <>
              <textarea value={reply} onChange={e=>setReply(e.target.value)} rows={4}
                placeholder="Deine Antwort…"
                style={{width:"100%",padding:"11px 14px",borderRadius:10,background:"rgba(0,0,0,0.3)",
                  border:`0.5px solid ${BR2}`,color:TX1,fontSize:13,outline:"none",
                  fontFamily:"inherit",resize:"vertical",lineHeight:1.7,marginBottom:10}}/>
              {error&&<div style={{fontSize:12,color:RED,marginBottom:8}}>{error}</div>}
              <button onClick={submitReply} disabled={sending||!reply.trim()} style={{
                float:"right",padding:"10px 22px",borderRadius:10,
                background:reply.trim()&&!sending?G:"rgba(255,255,255,0.04)",
                color:reply.trim()&&!sending?"#0a0808":TX3,
                border:"none",cursor:reply.trim()&&!sending?"pointer":"default",fontSize:13,
              }}>{sending?"Sende…":"Antwort senden →"}</button>
              <div style={{clear:"both"}}/>
            </>
          ):(
            <div style={{textAlign:"center",padding:"16px"}}>
              <div style={{fontSize:12,color:TX3,marginBottom:8}}>Bitte anmelden um zu antworten.</div>
              <Link href="/auth/login" style={{fontSize:13,color:G,textDecoration:"none"}}>Anmelden →</Link>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
    </div>
  );
}
