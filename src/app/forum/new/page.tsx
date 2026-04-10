"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const G="#D4A843",G18="rgba(212,168,67,0.18)";
const BG1="#111114",BR1="rgba(255,255,255,0.045)",BR2="rgba(255,255,255,0.085)";
const TX1="#ededf2",TX2="#a4a4b4",TX3="#62626f",RED="#dc4a5a";

const CAT_CONFIG:Record<string,{color:string}>={
  Preisdiskussion:{color:"#E9A84B"},Neuigkeiten:{color:"#60A5FA"},Einsteiger:{color:"#34D399"},
  Sammlung:{color:"#A78BFA"},Strategie:{color:"#F472B6"},Tausch:{color:"#38BDF8"},
  "Fake-Check":{color:"#FB923C"},Marktplatz:{color:"#C084FC"},
};

export default function ForumNewPage() {
  const router = useRouter();
  const [user,       setUser]       = useState<any>(null);
  const [cats,       setCats]       = useState<any[]>([]);
  const [title,      setTitle]      = useState("");
  const [content,    setContent]    = useState("");
  const [catId,      setCatId]      = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");
  const [cardSearch, setCardSearch] = useState("");
  const [cardResults,setCardResults]= useState<any[]>([]);
  const [taggedCard, setTaggedCard] = useState<any>(null);

  useEffect(()=>{
    const sb=createClient();
    sb.auth.getSession().then(({data:{session}})=>{
      setUser(session?.user??null);
      if(!session?.user) router.push("/auth/login?redirect=/forum/new");
    });
    createClient().from("forum_categories").select("id,name,color").order("name").then(({data})=>setCats(data??[]));
  },[]);

  async function searchCards(q:string){
    setCardSearch(q);
    if(q.length<2){setCardResults([]);return;}
    const r=await fetch(`/api/cards/search?q=${encodeURIComponent(q)}&limit=4`);
    const d=await r.json();
    setCardResults(d.cards??[]);
  }

  async function submit(){
    if(!title.trim()){setError("Titel darf nicht leer sein.");return;}
    if(!catId){setError("Bitte eine Kategorie wählen.");return;}
    if(content.trim().length<10){setError("Inhalt zu kurz (min. 10 Zeichen).");return;}
    setSubmitting(true);setError("");
    const sb=createClient();
    const{data:{session}}=await sb.auth.getSession();
    const fh:Record<string,string>={"Content-Type":"application/json"};
    if(session?.access_token) fh["Authorization"]=`Bearer ${session.access_token}`;
    const res=await fetch("/api/forum/posts",{method:"POST",headers:fh,body:JSON.stringify({category_id:catId,title:title.trim(),content:content.trim(),tags:[],card_id:taggedCard?.id??null})});
    const data=await res.json();
    if(!res.ok){setError(data.error??"Fehler.");setSubmitting(false);return;}
    router.push(data.post?.id?`/forum/post/${data.post.id}`:"/forum");
  }

  if(!user) return <div style={{color:TX1,minHeight:"80vh",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{fontSize:14,color:TX3}}>Weiterleitung…</div></div>;

  return (
    <div style={{color:TX1,minHeight:"80vh"}}>
      <div style={{maxWidth:740,margin:"0 auto",padding:"clamp(52px,7vw,80px) clamp(16px,3vw,28px)"}}>
        <Link href="/forum" style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:12,color:TX3,textDecoration:"none",marginBottom:24}}>← Forum</Link>
        <div style={{marginBottom:28}}>
          <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(24px,4vw,40px)",fontWeight:200,letterSpacing:"-.05em"}}>Neuer Beitrag</h1>
        </div>
        <div style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:20,padding:24,position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:0.5,background:`linear-gradient(90deg,transparent,rgba(212,168,67,0.25),transparent)`}}/>
          <div style={{marginBottom:18}}>
            <div style={{fontSize:10,color:TX3,textTransform:"uppercase",letterSpacing:".08em",marginBottom:8}}>Kategorie</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {cats.map(c=>{const cfg=CAT_CONFIG[c.name]??{color:G};const on=catId===c.id;return(
                <button key={c.id} onClick={()=>setCatId(c.id)} style={{padding:"6px 14px",borderRadius:8,fontSize:12,border:"none",cursor:"pointer",background:on?`${cfg.color}15`:"transparent",color:on?cfg.color:TX3,outline:`0.5px solid ${on?cfg.color+"30":BR1}`,transition:"all .15s"}}>{c.name}</button>
              );})}
            </div>
          </div>
          <div style={{marginBottom:14}}>
            <div style={{fontSize:10,color:TX3,textTransform:"uppercase",letterSpacing:".08em",marginBottom:7}}>Titel</div>
            <input value={title} onChange={e=>setTitle(e.target.value)} maxLength={200} placeholder="Worüber möchtest du diskutieren?"
              style={{width:"100%",padding:"11px 14px",borderRadius:11,background:"rgba(0,0,0,0.3)",border:`0.5px solid ${BR2}`,color:TX1,fontSize:14,outline:"none"}}/>
          </div>
          <div style={{marginBottom:18}}>
            <div style={{fontSize:10,color:TX3,textTransform:"uppercase",letterSpacing:".08em",marginBottom:7}}>Inhalt</div>
            <textarea value={content} onChange={e=>setContent(e.target.value)} rows={7} placeholder="Schreibe deinen Beitrag…"
              style={{width:"100%",padding:"11px 14px",borderRadius:11,background:"rgba(0,0,0,0.3)",border:`0.5px solid ${BR2}`,color:TX1,fontSize:13,outline:"none",fontFamily:"inherit",resize:"vertical",lineHeight:1.7}}/>
          </div>
          {/* Optional card tag */}
          <div style={{marginBottom:16}}>
            <div style={{fontSize:10,color:TX3,textTransform:"uppercase",letterSpacing:".08em",marginBottom:7}}>Karte taggen (optional)</div>
            {taggedCard ? (
              <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:BG2,borderRadius:9,border:`0.5px solid ${G18}`}}>
                {taggedCard.image_url&&<img src={taggedCard.image_url} alt="" style={{width:22,height:30,objectFit:"contain"}}/>}
                <div style={{flex:1,fontSize:12,color:TX1}}>{taggedCard.name_de||taggedCard.name}</div>
                <div style={{fontSize:11,fontFamily:"var(--font-mono)",color:G}}>{taggedCard.price_market?.toFixed(2)} €</div>
                <button onClick={()=>setTaggedCard(null)} style={{background:"transparent",border:"none",color:TX3,cursor:"pointer",fontSize:16}}>×</button>
              </div>
            ) : (
              <div>
                <input value={cardSearch} onChange={e=>searchCards(e.target.value)} placeholder="Karte suchen und taggen…"
                  style={{width:"100%",padding:"9px 12px",borderRadius:9,background:"rgba(0,0,0,0.3)",border:`0.5px solid ${BR2}`,color:TX1,fontSize:12,outline:"none"}}/>
                {cardResults.length>0&&(
                  <div style={{marginTop:4,display:"flex",flexDirection:"column",gap:2}}>
                    {cardResults.map(c=>(
                      <div key={c.id} onClick={()=>{setTaggedCard(c);setCardResults([]);setCardSearch("");}} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 12px",background:BG2,borderRadius:7,border:`0.5px solid ${BR1}`,cursor:"pointer"}}>
                        {c.image_url&&<img src={c.image_url} alt="" style={{width:18,height:24,objectFit:"contain"}}/>}
                        <div style={{flex:1,fontSize:12,color:TX1}}>{c.name_de||c.name}</div>
                        <div style={{fontSize:11,fontFamily:"var(--font-mono)",color:G}}>{c.price_market?.toFixed(2)} €</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {error&&<div style={{fontSize:12,color:RED,marginBottom:12,padding:"9px 12px",borderRadius:8,background:"rgba(220,74,90,0.08)",border:"0.5px solid rgba(220,74,90,0.2)"}}>{error}</div>}
          <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
            <Link href="/forum" style={{padding:"10px 20px",borderRadius:11,background:"transparent",color:TX2,fontSize:13,textDecoration:"none",border:`0.5px solid ${BR1}`}}>Abbrechen</Link>
            <button onClick={submit} disabled={submitting} style={{padding:"10px 24px",borderRadius:11,background:G,color:"#0a0808",fontSize:13,border:"none",cursor:submitting?"wait":"pointer",opacity:submitting?.7:1}}>
              {submitting?"Veröffentliche…":"Beitrag veröffentlichen"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
