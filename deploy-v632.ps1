# PokéDax v6.3.2 — Forum TypeScript Fix + Auth Callback Fix
$root = "C:\Users\lenovo\pokedax\pokedax\pokedax"
$enc  = New-Object System.Text.UTF8Encoding $true
Write-Host "pokEdax v6.3.2 — Forum + Auth Fix" -ForegroundColor Cyan
Write-Host ""

# 1. Loesche kolliderende auth/callback/page.tsx
$oldPage = "$root\src\app\auth\callback\page.tsx"
if (Test-Path $oldPage) {
  Remove-Item $oldPage -Force
  Write-Host "  DEL  auth/callback/page.tsx" -ForegroundColor Yellow
}
if (-not (Test-Path "$root\src\app\auth\callback")) {
  New-Item -ItemType Directory -Path "$root\src\app\auth\callback" -Force | Out-Null
}

$route = @'
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/portfolio";

  if (code) {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { error } = await sb.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }
  return NextResponse.redirect(`${origin}/auth/login?error=auth_error`);
}

'@
[System.IO.File]::WriteAllText("$root\src\app\auth\callback\route.ts", $route, $enc)
Write-Host "  OK   auth/callback/route.ts" -ForegroundColor Green

$forum = @'
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const G="#E9A84B",G18="rgba(233,168,75,0.18)",G08="rgba(233,168,75,0.08)";
const BG1="#111113",BR1="rgba(255,255,255,0.06)",BR2="rgba(255,255,255,0.10)";
const TX1="#f0f0f5",TX2="#a8a8b8",TX3="#6b6b7a";
const GREEN="#4BBF82",RED="#E04558";

const CAT_COLORS: Record<string,string> = {
  Preise:G, News:G, Sammlung:GREEN, Strategie:"#C084FC",
  Tausch:"#7DD3FC", "Fake-Check":"#3BBDB6", Einsteiger:"#FCD34D",
  Neuigkeiten:G, Preisdiskussion:G, Marktplatz:"#C084FC",
};

interface Post {
  id:string;title:string;upvotes:number;created_at:string;
  profiles?:{username:string};forum_categories?:{name:string};
}

function ago(d:string) {
  const h=Math.floor((Date.now()-new Date(d).getTime())/3600000);
  return h<1?"Gerade":h<24?`vor ${h} Std.`:`vor ${Math.floor(h/24)} T.`;
}

export default function ForumPage() {
  const [posts,   setPosts]   = useState<Post[]>([]);
  const [cats,    setCats]    = useState<string[]>([]);
  const [active,  setActive]  = useState("alle");
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(()=>{
    async function load() {
      try {
        const sb = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        const [pR, cR] = await Promise.all([
          sb.from("forum_posts")
            .select("id,title,upvotes,created_at,profiles(username),forum_categories(name)")
            .order("created_at",{ascending:false})
            .limit(48),
          sb.from("forum_categories").select("name").order("name"),
        ]);
        if (pR.error) throw pR.error;
        const normalized = (pR.data??[]).map((p:any)=>({
          ...p,
          profiles: Array.isArray(p.profiles)?p.profiles[0]:p.profiles,
          forum_categories: Array.isArray(p.forum_categories)?p.forum_categories[0]:p.forum_categories,
        })) as Post[];
        setPosts(normalized);
        const uniqueCats = Array.from(new Set(normalized.map(p=>p.forum_categories?.name).filter(Boolean))) as string[];
        setCats(uniqueCats);
      } catch(e:any) {
        setError("Beiträge konnten nicht geladen werden.");
        console.error(e);
      }
      setLoading(false);
    }
    load();
  },[]);

  const filtered = active==="alle"
    ? posts
    : posts.filter(p=>p.forum_categories?.name===active);

  return (
    <div style={{color:TX1,minHeight:"80vh"}}>
      <div style={{maxWidth:1100,margin:"0 auto",padding:"clamp(40px,8vw,80px) clamp(16px,4vw,24px)"}}>

        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:48,flexWrap:"wrap",gap:16}}>
          <div>
            <div style={{fontSize:10,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:G,marginBottom:16}}>Community</div>
            <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(36px,5vw,56px)",fontWeight:300,letterSpacing:"-.07em",color:TX1,marginBottom:8}}>Forum</h1>
            <p style={{fontSize:14,color:TX3}}>{loading?"Lädt…":`${posts.length} Beiträge`}</p>
          </div>
          <Link href="/forum/new" className="gold-glow" style={{
            padding:"clamp(10px,2vw,14px) clamp(20px,3vw,28px)",
            borderRadius:20,background:G,color:"#0a0808",
            fontSize:"clamp(13px,1.5vw,15px)",fontWeight:600,textDecoration:"none",
          }}>+ Beitrag erstellen</Link>
        </div>

        {/* Category filter */}
        {!loading && cats.length > 0 && (
          <div style={{display:"flex",gap:8,marginBottom:36,flexWrap:"wrap"}}>
            {["alle",...cats].map(cat=>{
              const on = active===cat;
              const c = cat!=="alle" ? (CAT_COLORS[cat]??G) : G;
              return (
                <button key={cat} onClick={()=>setActive(cat)} style={{
                  padding:"9px 18px",borderRadius:14,fontSize:13,fontWeight:500,
                  cursor:"pointer",border:"none",transition:"all .15s",
                  background:on?`${c}14`:"transparent",
                  color:on?c:TX3,
                  outline:on?`1px solid ${c}30`:"1px solid rgba(255,255,255,0.06)",
                }}>{cat==="alle"?"Alle":cat}</button>
              );
            })}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
            {Array.from({length:6}).map((_,i)=>(
              <div key={i} style={{background:BG1,border:`1px solid ${BR1}`,borderRadius:24,padding:28,minHeight:140,opacity:.4,animation:"pulse 1.5s ease-in-out infinite"}}/>
            ))}
          </div>
        ) : error ? (
          <div style={{textAlign:"center",padding:80,background:BG1,border:`1px solid ${BR2}`,borderRadius:28}}>
            <div style={{fontSize:16,color:RED,marginBottom:12}}>{error}</div>
            <button onClick={()=>window.location.reload()} style={{fontSize:14,color:G,background:"transparent",border:"none",cursor:"pointer",textDecoration:"underline"}}>Erneut versuchen</button>
          </div>
        ) : filtered.length===0 ? (
          <div style={{textAlign:"center",padding:80,background:BG1,border:`1px solid ${BR2}`,borderRadius:28}}>
            <div style={{fontSize:16,color:TX3,marginBottom:16}}>Noch keine Beiträge</div>
            <Link href="/forum/new" style={{fontSize:15,color:G,textDecoration:"none"}}>Ersten Beitrag erstellen →</Link>
          </div>
        ) : (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(clamp(260px,30vw,340px),1fr))",gap:14}}>
            {filtered.map(post=>{
              const cat = post.forum_categories?.name??"Forum";
              const c   = CAT_COLORS[cat]??G;
              const author = post.profiles?.username??"Anonym";
              return (
                <Link key={post.id} href={`/forum/post/${post.id}`} className="card-hover" style={{
                  background:BG1,border:`1px solid ${BR1}`,
                  borderRadius:24,padding:"clamp(20px,3vw,28px)",
                  textDecoration:"none",display:"block",
                }}>
                  <div style={{fontSize:10,fontWeight:600,letterSpacing:".08em",textTransform:"uppercase",color:c,marginBottom:14}}>{cat}</div>
                  <div style={{fontSize:"clamp(14px,1.4vw,17px)",fontWeight:500,color:TX1,lineHeight:1.45,marginBottom:20,
                    display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{post.title}</div>
                  <div style={{fontSize:12,color:TX3,display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                    <span>{author}</span>
                    <span style={{width:3,height:3,borderRadius:"50%",background:TX3,display:"inline-block",flexShrink:0}}/>
                    <span>{ago(post.created_at)}</span>
                    <span style={{marginLeft:"auto",fontSize:13,color:TX2}}>↑ {post.upvotes??0}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:.4}50%{opacity:.6}}`}</style>
    </div>
  );
}

'@
[System.IO.File]::WriteAllText("$root\src\app\forum\page.tsx", $forum, $enc)
Write-Host "  OK   forum/page.tsx (Array.from fix)" -ForegroundColor Green

Write-Host ""
Write-Host "v6.3.2 fertig!" -ForegroundColor Green
Write-Host "GitHub Desktop -> Commit 'v6.3.2: forum + auth fix'" -ForegroundColor Yellow
Write-Host "-> Push -> Vercel" -ForegroundColor White
Write-Host ""
