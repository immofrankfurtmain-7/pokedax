# Hotfix: Dashboard Inhalt ersetzen (alten Müll entfernen)
$root = "C:\Users\lenovo\pokedax\pokedax\pokedax"
$enc  = New-Object System.Text.UTF8Encoding $true

New-Item -ItemType Directory -Path "$root\src\app\dashboard" -Force | Out-Null

$dash = @'
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const G="#D4A843",G18="rgba(212,168,67,0.18)",G10="rgba(212,168,67,0.10)",G05="rgba(212,168,67,0.05)";
const BG1="#111114",BG2="#18181c",BR1="rgba(255,255,255,0.045)",BR2="rgba(255,255,255,0.085)";
const TX1="#ededf2",TX2="#a4a4b4",TX3="#62626f",GREEN="#3db87a",RED="#dc4a5a";

function StatCard({label,value,sub,gold,href}:{label:string;value:string;sub?:string;gold?:boolean;href?:string}) {
  const inner = (
    <div style={{background:BG1,border:`0.5px solid ${gold?G18:BR2}`,borderRadius:14,
      padding:"16px 18px",position:"relative",overflow:"hidden",
      transition:"border-color .2s,background .2s",
    }}>
      {gold&&<div style={{position:"absolute",top:0,left:0,right:0,height:0.5,
        background:`linear-gradient(90deg,transparent,${G},transparent)`}}/>}
      <div style={{fontSize:10,fontWeight:500,color:TX3,textTransform:"uppercase",
        letterSpacing:".08em",marginBottom:10}}>{label}</div>
      <div style={{fontSize:24,fontFamily:"var(--font-mono)",fontWeight:300,
        letterSpacing:"-.04em",color:gold?G:TX1,lineHeight:1,marginBottom:sub?6:0}}>{value}</div>
      {sub&&<div style={{fontSize:11,color:TX3}}>{sub}</div>}
    </div>
  );
  if (!href) return inner;
  return <Link href={href} style={{textDecoration:"none",display:"block"}}>{inner}</Link>;
}

function SectionHeader({title,href,count}:{title:string;href?:string;count?:number}) {
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
      <div style={{fontSize:10,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:TX3}}>{title}</div>
      {href&&<Link href={href} style={{fontSize:11,color:TX3,textDecoration:"none"}}>
        {count!==undefined?`Alle ${count} →`:"Alle →"}
      </Link>}
    </div>
  );
}

export default function DashboardPage() {
  const [user,      setUser]      = useState<any>(null);
  const [profile,   setProfile]   = useState<any>(null);
  const [loading,   setLoading]   = useState(true);
  const [portfolio, setPortfolio] = useState({value:0,count:0,delta7:0});
  const [matches,   setMatches]   = useState<any[]>([]);
  const [listings,  setListings]  = useState<any[]>([]);
  const [scansToday,setScansToday]= useState(0);
  const [scansMax,  setScansMax]  = useState(5);
  const [fantasy,   setFantasy]   = useState<any>(null);

  useEffect(()=>{
    async function init() {
      const sb = createClient();
      // getSession reads from localStorage - immediate, no network
      const { data: { session } } = await sb.auth.getSession();
      const uid = session?.user?.id;
      if (!uid) {
        window.location.href = "/auth/login?redirect=/dashboard";
        return;
      }
      setUser(session.user);
      await Promise.all([
        loadProfile(sb, uid),
        loadPortfolio(sb, uid),
        loadMatches(sb, uid),
        loadListings(sb, uid),
        loadScans(sb, uid),
        loadFantasy(sb, uid),
      ]);
      setLoading(false);
    }
    init();
  },[]);

  async function loadProfile(sb:any, uid:string) {
    const {data} = await sb.from("profiles")
      .select("username,avatar_url,is_premium,created_at").eq("id",uid).single();
    setProfile(data);
  }

  async function loadPortfolio(sb:any, uid:string) {
    const {data} = await sb.from("user_collection")
      .select("quantity,cards!user_collection_card_id_fkey(price_market,price_avg7)")
      .eq("user_id",uid);
    const items = data??[];
    const value  = items.reduce((s:number,i:any)=>s+(i.cards?.price_market??0)*(i.quantity??1),0);
    const value7 = items.reduce((s:number,i:any)=>s+(i.cards?.price_avg7??i.cards?.price_market??0)*(i.quantity??1),0);
    const count  = items.reduce((s:number,i:any)=>s+(i.quantity??1),0);
    const delta7 = value7>0 ? ((value-value7)/value7*100) : 0;
    setPortfolio({value,count,delta7});
  }

  async function loadMatches(sb:any, uid:string) {
    const {data} = await sb.from("wishlist_matches")
      .select(`id,created_at,
        marketplace_listings!wishlist_matches_listing_id_fkey(
          price,condition,
          cards!marketplace_listings_card_id_fkey(id,name,name_de,image_url)
        )`)
      .eq("wishlist_user_id",uid).eq("dismissed",false)
      .order("created_at",{ascending:false}).limit(4);
    setMatches(data??[]);
  }

  async function loadListings(sb:any, uid:string) {
    const {data} = await sb.from("marketplace_listings")
      .select(`id,price,condition,created_at,
        cards!marketplace_listings_card_id_fkey(id,name,name_de,image_url,price_market)`)
      .eq("seller_id",uid).eq("is_active",true)
      .order("created_at",{ascending:false}).limit(4);
    setListings(data??[]);
  }

  async function loadScans(sb:any, uid:string) {
    const today = new Date().toISOString().split("T")[0];
    const {count} = await sb.from("scan_logs")
      .select("id",{count:"exact",head:true})
      .eq("user_id",uid).gte("created_at",today+"T00:00:00Z");
    const isPrem = (await sb.from("profiles").select("is_premium").eq("id",uid).single()).data?.is_premium;
    setScansToday(count??0);
    setScansMax(isPrem?9999:5);
  }

  async function loadFantasy(sb:any, uid:string) {
    const season = `${new Date().getFullYear()}-Q${Math.ceil((new Date().getMonth()+1)/3)}`;
    const {data} = await sb.from("fantasy_teams")
      .select("id,name,total_budget").eq("user_id",uid).eq("season",season).single();
    if (data) {
      const {data:picks} = await sb.from("fantasy_picks")
        .select("bought_at_price,quantity,cards!fantasy_picks_card_id_fkey(price_market)")
        .eq("team_id",data.id);
      const current = (picks??[]).reduce((s:number,p:any)=>s+(p.cards?.price_market??0)*(p.quantity??1),0);
      const invested= (picks??[]).reduce((s:number,p:any)=>s+(p.bought_at_price??0)*(p.quantity??1),0);
      const pct = invested>0?((current-invested)/invested*100):0;
      setFantasy({name:data.name,picks:(picks??[]).length,pct,current,invested});
    }
  }

  const username = profile?.username ?? user?.email?.split("@")[0] ?? "—";
  const initial  = username[0]?.toUpperCase()??"?";
  const isPrem   = profile?.is_premium;
  const hour     = new Date().getHours();
  const greeting = hour<12?"Guten Morgen":hour<17?"Guten Tag":"Guten Abend";

  if (loading) return (
    <div style={{color:TX1,minHeight:"80vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{fontSize:13,color:TX3}}>Lädt Dashboard…</div>
    </div>
  );

  return (
    <div style={{color:TX1,minHeight:"80vh"}}>
      <div style={{maxWidth:1100,margin:"0 auto",padding:"clamp(52px,7vw,80px) clamp(16px,3vw,28px)"}}>

        {/* Greeting */}
        <div style={{marginBottom:"clamp(28px,4vw,48px)"}}>
          <div style={{fontSize:9,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",
            color:TX3,marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
            <span style={{width:16,height:0.5,background:TX3,display:"inline-block"}}/>
            {isPrem?"Premium Dashboard":"Dashboard"}
          </div>
          <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(26px,4.5vw,48px)",
            fontWeight:200,letterSpacing:"-.055em",marginBottom:6}}>
            {greeting}, <span style={{color:G}}>@{username}</span>.
          </h1>
          <p style={{fontSize:13,color:TX3}}>
            {new Date().toLocaleDateString("de-DE",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
          </p>
        </div>

        {/* Stats row */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:10,marginBottom:24}}>
          <StatCard
            label="Portfolio-Wert"
            value={portfolio.value>0?`${Math.round(portfolio.value).toLocaleString("de-DE")} €`:"—"}
            sub={portfolio.delta7!==0?`${portfolio.delta7>=0?"+":""}${portfolio.delta7.toFixed(1)}% (7 Tage)`:portfolio.count>0?`${portfolio.count} Karten`:"Noch keine Karten"}
            gold={portfolio.value>0}
            href="/portfolio"
          />
          <StatCard
            label="Wishlist-Matches"
            value={matches.length>0?String(matches.length):"0"}
            sub={matches.length>0?"Neue Treffer":"Keine neuen Matches"}
            href="/matches"
          />
          <StatCard
            label="Aktive Listings"
            value={String(listings.length)}
            sub={listings.length>0?"Karten im Marktplatz":"Noch nichts inseriert"}
            href="/marketplace"
          />
          <StatCard
            label="Scanner heute"
            value={scansMax===9999?String(scansToday):`${scansToday}/${scansMax}`}
            sub={scansMax===9999?"Unlimitiert (Premium)":scansToday>=scansMax?"Limit erreicht":`${scansMax-scansToday} übrig`}
            href="/scanner"
          />
        </div>

        {/* Two column layout */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>

          {/* LEFT */}
          <div style={{display:"flex",flexDirection:"column",gap:16}}>

            {/* Wishlist Matches */}
            <div style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:16,overflow:"hidden"}}>
              <div style={{padding:"13px 16px",borderBottom:`0.5px solid ${BR1}`}}>
                <SectionHeader title="Wishlist-Matches" href="/matches" count={matches.length}/>
              </div>
              {matches.length===0 ? (
                <div style={{padding:"24px 16px",textAlign:"center"}}>
                  <div style={{fontSize:12,color:TX3,marginBottom:8}}>Keine aktiven Matches.</div>
                  <Link href="/preischeck" style={{fontSize:11,color:G,textDecoration:"none"}}>Karten zur Wishlist hinzufügen →</Link>
                </div>
              ) : matches.map((m:any,i:number)=>{
                const listing = m.marketplace_listings;
                const card = listing?.cards;
                return (
                  <div key={m.id} style={{display:"flex",alignItems:"center",gap:10,
                    padding:"11px 16px",borderBottom:i<matches.length-1?`0.5px solid ${BR1}`:undefined}}>
                    <div style={{width:28,height:38,borderRadius:4,background:BG2,overflow:"hidden",flexShrink:0}}>
                      {card?.image_url&&<img src={card.image_url} alt="" style={{width:"100%",height:"100%",objectFit:"contain"}}/>}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12,color:TX1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                        {card?.name_de||card?.name}
                      </div>
                      <div style={{fontSize:10,color:TX3}}>{listing?.condition} · {listing?.price?.toLocaleString("de-DE",{minimumFractionDigits:2})} €</div>
                    </div>
                    <Link href="/matches" style={{fontSize:11,color:G,textDecoration:"none",flexShrink:0}}>→</Link>
                  </div>
                );
              })}
            </div>

            {/* Fantasy */}
            {fantasy ? (
              <div style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:16,padding:"16px"}}>
                <SectionHeader title="Fantasy League" href="/fantasy"/>
                <div style={{fontSize:13,color:TX1,marginBottom:6}}>{fantasy.name}</div>
                <div style={{display:"flex",gap:16}}>
                  <div>
                    <div style={{fontSize:9,color:TX3,marginBottom:3,textTransform:"uppercase",letterSpacing:".06em"}}>Performance</div>
                    <div style={{fontSize:18,fontFamily:"var(--font-mono)",fontWeight:300,
                      color:fantasy.pct>=0?GREEN:RED}}>
                      {fantasy.pct>=0?"+":""}{fantasy.pct.toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div style={{fontSize:9,color:TX3,marginBottom:3,textTransform:"uppercase",letterSpacing:".06em"}}>Karten</div>
                    <div style={{fontSize:18,fontFamily:"var(--font-mono)",fontWeight:300,color:TX1}}>
                      {fantasy.picks}/5
                    </div>
                  </div>
                  <div>
                    <div style={{fontSize:9,color:TX3,marginBottom:3,textTransform:"uppercase",letterSpacing:".06em"}}>Wert</div>
                    <div style={{fontSize:18,fontFamily:"var(--font-mono)",fontWeight:300,color:TX1}}>
                      {Math.round(fantasy.current)} €
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:16,padding:"20px",textAlign:"center"}}>
                <SectionHeader title="Fantasy League" href="/fantasy"/>
                <div style={{fontSize:12,color:TX3,marginBottom:10}}>Noch kein Team diese Saison.</div>
                <Link href="/fantasy" style={{fontSize:12,color:G,textDecoration:"none"}}>Team aufbauen →</Link>
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div style={{display:"flex",flexDirection:"column",gap:16}}>

            {/* Active Listings */}
            <div style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:16,overflow:"hidden"}}>
              <div style={{padding:"13px 16px",borderBottom:`0.5px solid ${BR1}`}}>
                <SectionHeader title="Meine Listings" href="/marketplace" count={listings.length}/>
              </div>
              {listings.length===0 ? (
                <div style={{padding:"24px 16px",textAlign:"center"}}>
                  <div style={{fontSize:12,color:TX3,marginBottom:8}}>Noch keine aktiven Listings.</div>
                  <Link href="/marketplace" style={{fontSize:11,color:G,textDecoration:"none"}}>Erste Karte inserieren →</Link>
                </div>
              ) : listings.map((l:any,i:number)=>{
                const card = l.cards;
                const deal = l.price && card?.price_market && l.price<card.price_market;
                return (
                  <div key={l.id} style={{display:"flex",alignItems:"center",gap:10,
                    padding:"11px 16px",borderBottom:i<listings.length-1?`0.5px solid ${BR1}`:undefined}}>
                    <div style={{width:28,height:38,borderRadius:4,background:BG2,overflow:"hidden",flexShrink:0}}>
                      {card?.image_url&&<img src={card.image_url} alt="" style={{width:"100%",height:"100%",objectFit:"contain"}}/>}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12,color:TX1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                        {card?.name_de||card?.name}
                      </div>
                      <div style={{fontSize:10,color:TX3}}>{l.condition}</div>
                    </div>
                    <div style={{fontSize:13,fontFamily:"var(--font-mono)",fontWeight:300,
                      color:deal?G:TX1,flexShrink:0}}>
                      {l.price?.toLocaleString("de-DE",{minimumFractionDigits:2})} €
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:16,padding:"16px"}}>
              <div style={{fontSize:10,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",
                color:TX3,marginBottom:12}}>Schnellzugriff</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {[
                  {href:"/scanner",     label:"KI-Scanner",    icon:"⊙", sub:"Karte scannen"},
                  {href:"/preischeck",  label:"Preischeck",    icon:"◈", sub:"Karten suchen"},
                  {href:"/portfolio",   label:"Portfolio",     icon:"◇", sub:"Sammlung verwalten"},
                  {href:"/sets",        label:"Sets",          icon:"◫", sub:"Alle Sets ansehen"},
                ].map(({href,label,icon,sub})=>(
                  <Link key={href} href={href} style={{
                    padding:"12px 14px",borderRadius:11,background:BG2,
                    border:`0.5px solid ${BR1}`,textDecoration:"none",
                    transition:"border-color .2s,background .2s",
                    display:"block",
                  }}
                  onMouseEnter={e=>{(e.currentTarget as any).style.borderColor=G18;(e.currentTarget as any).style.background=BG1;}}
                  onMouseLeave={e=>{(e.currentTarget as any).style.borderColor="rgba(255,255,255,0.045)";(e.currentTarget as any).style.background=BG2;}}>
                    <div style={{fontSize:16,marginBottom:5,color:G18}}>{icon}</div>
                    <div style={{fontSize:12,fontWeight:500,color:TX1,marginBottom:2}}>{label}</div>
                    <div style={{fontSize:10,color:TX3}}>{sub}</div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Profile link */}
            <Link href={`/profil/${username}`} style={{
              background:G05,border:`0.5px solid ${G18}`,borderRadius:16,
              padding:"14px 16px",textDecoration:"none",
              display:"flex",alignItems:"center",gap:12,
              transition:"background .2s",
            }}
            onMouseEnter={e=>(e.currentTarget as any).style.background=G10}
            onMouseLeave={e=>(e.currentTarget as any).style.background=G05}>
              <div style={{width:36,height:36,borderRadius:"50%",background:G10,
                border:`0.5px solid ${G18}`,display:"flex",alignItems:"center",
                justifyContent:"center",fontSize:14,color:G}}>
                {initial}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,color:TX1}}>@{username}</div>
                <div style={{fontSize:10,color:TX3}}>{isPrem?"✦ Premium · ":""}Öffentliches Profil ansehen</div>
              </div>
              <div style={{fontSize:14,color:G}}>→</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

'@
[System.IO.File]::WriteAllText("$root\src\app\dashboard\page.tsx", $dash, $enc)
Write-Host "  OK  dashboard/page.tsx ersetzt" -ForegroundColor Green

$client = @'
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

'@
[System.IO.File]::WriteAllText("$root\src\lib\supabase\client.ts", $client, $enc)
Write-Host "  OK  lib/supabase/client.ts (createBrowserClient)" -ForegroundColor Green

Write-Host ""
Write-Host "Zur Kontrolle - Dateigroesse:" -ForegroundColor DarkGray
$size = (Get-Item "$root\src\app\dashboard\page.tsx").Length
Write-Host "  dashboard/page.tsx: $size bytes (erwartet: ~18000)" -ForegroundColor White

Write-Host ""
Write-Host "GitHub Desktop -> Commit 'fix: dashboard replace old content' -> Push" -ForegroundColor Yellow
