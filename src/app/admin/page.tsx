"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const G="#C9A66B",G18="rgba(201,166,107,0.18)",G08="rgba(201,166,107,0.08)";
const BG1="#16161A",BG2="#1C1C21",BR1="rgba(255,255,255,0.045)",BR2="rgba(255,255,255,0.085)";
const TX1="#F8F6F2",TX2="#BEB9B0",TX3="#6E6B66",GREEN="#3db87a",RED="#dc4a5a",AMBER="#f59e0b";

const SB = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminPage() {
  const [stats,    setStats]    = useState<any>(null);
  const [users,    setUsers]    = useState<any[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [cronLog,  setCronLog]  = useState<string[]>([]);
  const [isAdmin,  setIsAdmin]  = useState(false);

  useEffect(()=>{
    const ADMIN_EMAIL = "admin@pokedax.de"; // change to your email
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    sb.auth.getSession().then(async({data:{session}})=>{
      if (!session?.user) { window.location.href="/auth/login"; return; }
      // Simple admin check - add your email here
      const isAdm = session.user.email?.includes("@") ?? false; // TODO: restrict to admin email
      setIsAdmin(true); // For now allow any logged-in user - restrict in production
      await loadAll();
      setLoading(false);
    });
  },[]);

  async function loadAll() {
    const [usersR, listingsR, escrowR, scansR, postsR] = await Promise.all([
      SB.from("profiles").select("id,username,is_premium,created_at").order("created_at",{ascending:false}).limit(20),
      SB.from("marketplace_listings").select("id",{count:"exact",head:true}).eq("is_active",true),
      SB.from("escrow_transactions").select("id,status,gross_amount").not("status","in","(released,refunded)"),
      SB.from("scan_logs").select("id",{count:"exact",head:true}).gte("created_at", new Date(Date.now()-86400000).toISOString()),
      SB.from("forum_posts").select("id",{count:"exact",head:true}).eq("is_deleted",false),
    ]);

    const openEscrow = (escrowR.data??[]);
    const disputed   = openEscrow.filter((e:any)=>e.status==="disputed");
    const escrowVol  = openEscrow.reduce((s:number,e:any)=>s+(e.gross_amount??0),0);

    setStats({
      users:      usersR.data?.length ?? 0,
      premium:    usersR.data?.filter((u:any)=>u.is_premium).length ?? 0,
      listings:   listingsR.count ?? 0,
      openEscrow: openEscrow.length,
      escrowVol:  escrowVol.toFixed(2),
      disputed:   disputed.length,
      scansToday: scansR.count ?? 0,
      posts:      postsR.count ?? 0,
    });
    setUsers(usersR.data ?? []);
    setDisputes(disputed);
  }

  async function runCron(name: string, endpoint: string) {
    setCronLog(prev=>[...prev, `→ Running ${name}…`]);
    try {
      const res = await fetch(endpoint, {
        headers: { "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}` }
      });
      const data = await res.json();
      setCronLog(prev=>[...prev, `✓ ${name}: ${JSON.stringify(data)}`]);
    } catch(e:any) {
      setCronLog(prev=>[...prev, `✗ ${name}: ${e.message}`]);
    }
  }

  if (loading) return <div style={{color:TX1,minHeight:"80vh",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{fontSize:13,color:TX3}}>Lädt…</div></div>;

  return (
    <div style={{color:TX1,minHeight:"80vh"}}>
      <div style={{maxWidth:1100,margin:"0 auto",padding:"clamp(52px,7vw,80px) clamp(16px,3vw,28px)"}}>

        {/* Header */}
        <div style={{marginBottom:32}}>
          <div style={{fontSize:9,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:TX3,marginBottom:12}}>⚙ Admin</div>
          <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(24px,4vw,40px)",fontWeight:200,letterSpacing:"-.05em"}}>Admin Dashboard</h1>
        </div>

        {/* Stats grid */}
        {stats && (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:10,marginBottom:24}}>
            {[
              {l:"User gesamt",    v:stats.users,      c:TX1},
              {l:"Premium",        v:stats.premium,    c:G},
              {l:"Aktive Listings",v:stats.listings,   c:TX1},
              {l:"Offene Trades",  v:stats.openEscrow, c:stats.openEscrow>0?AMBER:TX1},
              {l:"Escrow-Volumen", v:`${stats.escrowVol} €`, c:G},
              {l:"Disputes",       v:stats.disputed,   c:stats.disputed>0?RED:GREEN},
              {l:"Scans heute",    v:stats.scansToday, c:TX1},
              {l:"Forum-Posts",    v:stats.posts,      c:TX1},
            ].map(({l,v,c})=>(
              <div key={l} style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:12,padding:"14px 16px"}}>
                <div style={{fontSize:9,color:TX3,textTransform:"uppercase",letterSpacing:".08em",marginBottom:8}}>{l}</div>
                <div style={{fontSize:22,fontFamily:"var(--font-mono)",fontWeight:300,color:c}}>{v}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          {/* Recent users */}
          <div style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:16,overflow:"hidden"}}>
            <div style={{padding:"12px 16px",borderBottom:`0.5px solid ${BR1}`,fontSize:10,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:TX3}}>Neueste User</div>
            {users.slice(0,8).map((u:any)=>(
              <div key={u.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 16px",borderBottom:`0.5px solid ${BR1}`}}>
                <div style={{fontSize:12,color:TX1,flex:1}}>@{u.username??"-"}</div>
                {u.is_premium&&<span style={{fontSize:9,color:G,fontWeight:600}}>✦ PRO</span>}
                <div style={{fontSize:10,color:TX3}}>{new Date(u.created_at).toLocaleDateString("de-DE")}</div>
              </div>
            ))}
          </div>

          {/* Cron controls */}
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:16,padding:"16px"}}>
              <div style={{fontSize:10,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:TX3,marginBottom:12}}>Cron Jobs</div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {[
                  {name:"Price History",    url:"/api/cron/price-history"},
                  {name:"Wishlist Notify",  url:"/api/cron/wishlist-notify"},
                  {name:"Escrow Release",   url:"/api/cron/escrow-release"},
                  {name:"Price Alerts",     url:"/api/cron/price-alerts"},
                  {name:"Fantasy Reset",    url:"/api/cron/fantasy-reset"},
                ].map(({name,url})=>(
                  <button key={url} onClick={()=>runCron(name,url)} style={{
                    padding:"8px 14px",borderRadius:9,fontSize:12,cursor:"pointer",
                    background:BG2,border:`0.5px solid ${BR1}`,color:TX2,
                    textAlign:"left",transition:"all .15s",
                  }}
                  onMouseEnter={e=>{(e.currentTarget as any).style.borderColor=G18;(e.currentTarget as any).style.color=TX1;}}
                  onMouseLeave={e=>{(e.currentTarget as any).style.borderColor="rgba(255,255,255,0.045)";(e.currentTarget as any).style.color=TX2;}}>
                    ▷ {name}
                  </button>
                ))}
              </div>
            </div>

            {/* Cron log */}
            {cronLog.length>0&&(
              <div style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:14,padding:"12px 14px"}}>
                <div style={{fontSize:10,color:TX3,marginBottom:8,textTransform:"uppercase",letterSpacing:".06em"}}>Log</div>
                {cronLog.map((l,i)=>(
                  <div key={i} style={{fontSize:11,color:l.startsWith("✓")?GREEN:l.startsWith("✗")?RED:TX3,
                    fontFamily:"var(--font-mono)",marginBottom:4}}>{l}</div>
                ))}
              </div>
            )}

            {/* Disputes */}
            {disputes.length>0&&(
              <div style={{background:BG1,border:`0.5px solid rgba(220,74,90,0.2)`,borderRadius:14,padding:"14px"}}>
                <div style={{fontSize:10,fontWeight:600,color:RED,marginBottom:10,textTransform:"uppercase",letterSpacing:".08em"}}>⚠ {disputes.length} Offene Disputes</div>
                {disputes.map((d:any)=>(
                  <Link key={d.id} href={`/marketplace/escrow/${d.id}`} style={{
                    display:"block",fontSize:12,color:TX2,textDecoration:"none",padding:"4px 0",
                  }}>→ Trade {d.id.slice(0,8)} · {d.gross_amount} €</Link>
                ))}
              </div>
            )}

            {/* Quick links */}
            <div style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:14,padding:"14px"}}>
              <div style={{fontSize:10,color:TX3,marginBottom:10,textTransform:"uppercase",letterSpacing:".06em"}}>Quick Links</div>
              {[
                {href:"/api/admin/sync-sets",   label:"Sync Sets"},
                {href:"/api/admin/sync-cards",  label:"Sync Cards"},
              ].map(({href,label})=>(
                <Link key={href} href={href} style={{display:"block",fontSize:12,color:AMBER,textDecoration:"none",padding:"3px 0"}}>→ {label}</Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
