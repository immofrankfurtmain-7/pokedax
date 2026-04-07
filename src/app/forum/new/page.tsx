"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const G="#D4A843",G18="rgba(212,168,67,0.18)",G08="rgba(212,168,67,0.08)";
const BG1="#111114",BG2="#18181c",BR1="rgba(255,255,255,0.045)",BR2="rgba(255,255,255,0.085)";
const TX1="#ededf2",TX2="#a4a4b4",TX3="#62626f",RED="#dc4a5a";

const CAT_CONFIG: Record<string,{color:string}> = {
  Preisdiskussion:{color:"#E9A84B"},Neuigkeiten:{color:"#60A5FA"},
  Einsteiger:{color:"#34D399"},Sammlung:{color:"#A78BFA"},
  Strategie:{color:"#F472B6"},Tausch:{color:"#38BDF8"},
  "Fake-Check":{color:"#FB923C"},Marktplatz:{color:"#C084FC"},
};

interface Category { id:string; name:string; color:string; }

export default function ForumNewPage() {
  const router = useRouter();
  const [user,       setUser]       = useState<any>(null);
  const [cats,       setCats]       = useState<Category[]>([]);
  const [title,      setTitle]      = useState("");
  const [content,    setContent]    = useState("");
  const [catId,      setCatId]      = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");

  useEffect(() => {
    const sb = createClient();
    sb.auth.getUser().then(({data:{user}}) => {
      setUser(user);
      if (!user) router.push("/auth/login?redirect=/forum/new");
    });
    // Load categories from Supabase directly (no custom API needed)
    sb.from("forum_categories").select("id, name, color").order("name")
      .then(({data}) => setCats(data ?? []));
  }, []);

  async function submit() {
    if (!title.trim()) { setError("Titel darf nicht leer sein."); return; }
    if (!catId)        { setError("Bitte eine Kategorie wählen."); return; }
    if (content.trim().length < 10) { setError("Inhalt zu kurz (min. 10 Zeichen)."); return; }
    setSubmitting(true);
    setError("");

    const { data: { session } } = await createClient().auth.getSession();
    const fh: Record<string,string> = {"Content-Type":"application/json"};
    if (session?.access_token) fh["Authorization"] = `Bearer ${session.access_token}`;
    const res = await fetch("/api/forum/posts", {
      method:"POST",
      headers: fh,
      body:JSON.stringify({ category_id:catId, title:title.trim(), content:content.trim(), tags:[] }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Fehler beim Erstellen.");
      setSubmitting(false);
      return;
    }
    router.push(data.post?.id ? `/forum/post/${data.post.id}` : "/forum");
  }

  if (!user) return (
    <div style={{color:TX1,minHeight:"80vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{fontSize:14,color:TX3}}>Weiterleitung…</div>
    </div>
  );

  return (
    <div style={{color:TX1,minHeight:"80vh"}}>
      <div style={{maxWidth:740,margin:"0 auto",padding:"clamp(52px,7vw,80px) clamp(16px,3vw,28px)"}}>

        <Link href="/forum" style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:12,color:TX3,textDecoration:"none",marginBottom:28}}>← Forum</Link>

        <div style={{marginBottom:32}}>
          <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(24px,4vw,40px)",fontWeight:200,letterSpacing:"-.05em",marginBottom:6}}>Neuer Beitrag</h1>
          <p style={{fontSize:13,color:TX3}}>Als @{user?.email?.split("@")[0]??user?.id?.slice(0,8)}</p>
        </div>

        <div style={{background:BG1,border:`1px solid ${BR2}`,borderRadius:22,overflow:"hidden",position:"relative"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,rgba(212,168,67,0.25),transparent)`}}/>

          <div style={{padding:24}}>
            {/* Category */}
            <div style={{marginBottom:20}}>
              <div style={{fontSize:10,fontWeight:500,color:TX3,textTransform:"uppercase",letterSpacing:".08em",marginBottom:10}}>Kategorie</div>
              <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                {cats.map(c=>{
                  const cfg = CAT_CONFIG[c.name]??{color:G};
                  const on  = catId===c.id;
                  return (
                    <button key={c.id} onClick={()=>setCatId(c.id)} style={{
                      padding:"6px 14px",borderRadius:9,fontSize:12,fontWeight:400,border:"none",cursor:"pointer",
                      background:on?`${cfg.color}15`:"transparent",color:on?cfg.color:TX3,
                      outline:`1px solid ${on?cfg.color+"30":BR1}`,transition:"all .15s",
                    }}>{c.name}</button>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <div style={{marginBottom:16}}>
              <div style={{fontSize:10,fontWeight:500,color:TX3,textTransform:"uppercase",letterSpacing:".08em",marginBottom:8}}>Titel</div>
              <input value={title} onChange={e=>setTitle(e.target.value)} maxLength={200}
                placeholder="Worüber möchtest du diskutieren?"
                style={{width:"100%",padding:"12px 16px",borderRadius:12,background:"rgba(0,0,0,0.3)",border:`1px solid ${BR2}`,color:TX1,fontSize:14,outline:"none",fontFamily:"inherit",transition:"border-color .2s"}}
                onFocus={e=>(e.target.style.borderColor="rgba(212,168,67,0.2)")}
                onBlur={e=>(e.target.style.borderColor="rgba(255,255,255,0.085)")}/>
              <div style={{fontSize:10,color:TX3,marginTop:4,textAlign:"right"}}>{title.length}/200</div>
            </div>

            {/* Content */}
            <div style={{marginBottom:20}}>
              <div style={{fontSize:10,fontWeight:500,color:TX3,textTransform:"uppercase",letterSpacing:".08em",marginBottom:8}}>Inhalt</div>
              <textarea value={content} onChange={e=>setContent(e.target.value)} rows={8}
                placeholder="Schreibe deinen Beitrag…"
                style={{width:"100%",padding:"12px 16px",borderRadius:12,background:"rgba(0,0,0,0.3)",border:`1px solid ${BR2}`,color:TX1,fontSize:13,outline:"none",fontFamily:"inherit",resize:"vertical",lineHeight:1.7,transition:"border-color .2s"}}
                onFocus={e=>(e.target.style.borderColor="rgba(212,168,67,0.2)")}
                onBlur={e=>(e.target.style.borderColor="rgba(255,255,255,0.085)")}/>
              <div style={{fontSize:10,color:TX3,marginTop:4}}>{content.length} Zeichen</div>
            </div>

            {error&&<div style={{fontSize:12,color:RED,marginBottom:14,padding:"10px 14px",borderRadius:9,background:"rgba(220,74,90,0.08)",border:"1px solid rgba(220,74,90,0.2)"}}>{error}</div>}

            <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
              <Link href="/forum" style={{padding:"11px 22px",borderRadius:12,background:"transparent",color:TX2,fontSize:13,textDecoration:"none",border:`1px solid ${BR1}`}}>Abbrechen</Link>
              <button onClick={submit} disabled={submitting} style={{
                padding:"11px 28px",borderRadius:12,background:G,color:"#0a0808",
                fontSize:13,fontWeight:400,border:"none",cursor:submitting?"wait":"pointer",
                boxShadow:`0 2px 16px rgba(212,168,67,0.2)`,
                opacity:submitting?0.7:1,
              }}>{submitting?"Wird veröffentlicht…":"Beitrag veröffentlichen"}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
