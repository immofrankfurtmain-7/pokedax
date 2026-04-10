# pokEdax Sprint 2+3 — Escrow fertig + Badges + Seller-Rating
$root = "C:\Users\lenovo\pokedax\pokedax\pokedax"
$enc  = New-Object System.Text.UTF8Encoding $true
Write-Host ""
Write-Host "pokEdax Sprint 2+3 Deploy" -ForegroundColor Yellow
Write-Host "=========================" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Marktplatz: echter Escrow-Flow + Seller-Rating" -ForegroundColor Green
Write-Host "  Dashboard: offene Escrow-Trades" -ForegroundColor Green
Write-Host "  Navbar: Hamburger-Menu (Mobile)" -ForegroundColor Green
Write-Host "  Scanner: Auto-Redirect nach Scan" -ForegroundColor Green
Write-Host "  Forum: Reddit/Linear Redesign" -ForegroundColor Green
Write-Host "  Badges-System (Sprint 3)" -ForegroundColor Green
Write-Host "  Alle Sprint 2 Routen: Stripe Connect, Escrow, Reviews" -ForegroundColor Green
Write-Host ""

$dirs = @(
  "$root\src\app\api\marketplace\seller\onboard",
  "$root\src\app\api\marketplace\escrow\create",
  "$root\src\app\api\marketplace\escrow\update",
  "$root\src\app\api\marketplace\reviews",
  "$root\src\app\api\cron\escrow-release",
  "$root\src\app\api\badges",
  "$root\src\lib\supabase"
)
foreach ($d in $dirs) { if (-not (Test-Path $d)) { New-Item -ItemType Directory -Path $d -Force | Out-Null } }
cmd /c mkdir "$root\src\app\marketplace\escrow\[id]" 2>$null
Write-Host "Schreibe Dateien..." -ForegroundColor DarkGray

$libClient = @'
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

'@
[System.IO.File]::WriteAllText("$root\src\lib\supabase\client.ts", $libClient, $enc)
Write-Host "  OK  client.ts" -ForegroundColor Green

$supaServer = @'
import { createServerClient } from "@supabase/ssr";
import { createClient as createAnonClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(c) {
          try { c.forEach(({name,value,options})=>cookieStore.set(name,value,options)); } catch {}
        },
      },
    }
  );
}

export async function createRouteClient(request?: NextRequest) {
  const cookieStore = await cookies();
  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(c) {
          try { c.forEach(({name,value,options})=>cookieStore.set(name,value,options)); } catch {}
        },
      },
    }
  );
  if (request) {
    const auth = request.headers.get("Authorization");
    if (auth?.startsWith("Bearer ")) {
      const token = auth.slice(7);
      const { data: { user } } = await client.auth.getUser(token);
      if (user) {
        return createAnonClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          { global: { headers: { Authorization: `Bearer ${token}` } } }
        );
      }
    }
  }
  return client;
}

'@
[System.IO.File]::WriteAllText("$root\src\lib\supabase\server.ts", $supaServer, $enc)
Write-Host "  OK  server.ts" -ForegroundColor Green

$navbar = @'
"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

const G   = "#D4A843";
const G15 = "rgba(212,168,67,0.15)";
const G08 = "rgba(212,168,67,0.08)";

const NAV_LINKS = [
  { href: "/preischeck",  label: "Karten"     },
  { href: "/marketplace", label: "Marktplatz" },
  { href: "/forum",       label: "Community"  },
];

const DROPDOWN_LINKS = [
  { href: "/dashboard",   label: "Dashboard",     icon: "✦" },
  { href: "/portfolio",   label: "Portfolio",      icon: "◈" },
  { href: "/scanner",     label: "Scanner",        icon: "⊙" },
  { href: "/sets",        label: "Sets",           icon: "◫" },
  { href: "/fantasy",     label: "Fantasy",        icon: "◇" },
  { href: "/leaderboard", label: "Leaderboard",    icon: "▲" },
  { href: "/matches",     label: "Meine Matches",  icon: "◉" },
  { href: "/settings",    label: "Einstellungen",  icon: "◎" },
];

export default function Navbar() {
  const pathname   = usePathname();
  const router     = useRouter();
  const [user,     setUser]     = useState<any>(null);
  const [dropOpen, setDropOpen] = useState(false);
  const [mobOpen,  setMobOpen]  = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sb = createClient();
    sb.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    const { data: { subscription } } = sb.auth.onAuthStateChange((_, s) => setUser(s?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  useEffect(() => { setMobOpen(false); setDropOpen(false); }, [pathname]);

  async function signOut() {
    setDropOpen(false); setMobOpen(false);
    await createClient().auth.signOut();
    router.push("/");
  }

  const username = user?.email?.split("@")[0] ?? "Account";
  const initial  = username[0]?.toUpperCase() ?? "A";

  return (
    <>
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled || mobOpen ? "rgba(9,9,11,0.95)" : "transparent",
        backdropFilter: scrolled || mobOpen ? "blur(16px)" : "none",
        borderBottom: scrolled || mobOpen ? "0.5px solid rgba(255,255,255,0.06)" : "0.5px solid transparent",
        transition: "background 0.3s, backdrop-filter 0.3s, border-color 0.3s",
      }}>
        <div style={{
          maxWidth: 1200, margin: "0 auto",
          padding: "0 clamp(16px,3vw,32px)",
          height: 60,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 24,
        }}>
          <Link href="/" style={{
            fontFamily: "var(--font-display)",
            fontSize: 17, fontWeight: 300, letterSpacing: "-.04em",
            color: "#ededf2", textDecoration: "none", flexShrink: 0,
          }}>pokédax<span style={{ color: G }}>.</span></Link>

          <nav style={{ display: "flex", gap: 2, flex: 1, justifyContent: "center" }} className="desktop-nav">
            {NAV_LINKS.map(({ href, label }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link key={href} href={href} style={{
                  padding: "6px 16px", borderRadius: 10, fontSize: 13, fontWeight: 400,
                  color: active ? "#ededf2" : "#62626f",
                  background: active ? "rgba(255,255,255,0.06)" : "transparent",
                  textDecoration: "none", transition: "color 0.15s, background 0.15s",
                }}
                onMouseEnter={e => { if (!active) (e.currentTarget as any).style.color = "#a4a4b4"; }}
                onMouseLeave={e => { if (!active) (e.currentTarget as any).style.color = "#62626f"; }}>
                  {label}
                </Link>
              );
            })}
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <div className="desktop-auth" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {!user ? (
                <>
                  <Link href="/auth/login" style={{ padding: "7px 16px", borderRadius: 10, fontSize: 13, color: "#a4a4b4", textDecoration: "none" }}>Anmelden</Link>
                  <Link href="/dashboard/premium" style={{ padding: "7px 16px", borderRadius: 10, fontSize: 13, background: G08, color: G, border: `0.5px solid ${G15}`, textDecoration: "none" }}>Premium ✦</Link>
                </>
              ) : (
                <div ref={dropRef} style={{ position: "relative" }}>
                  <button onClick={() => setDropOpen(v => !v)} style={{
                    width: 34, height: 34, borderRadius: "50%",
                    background: dropOpen ? G08 : "rgba(255,255,255,0.06)",
                    border: `0.5px solid ${dropOpen ? G15 : "rgba(255,255,255,0.1)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 500, color: dropOpen ? G : "#a4a4b4",
                    cursor: "pointer", transition: "all 0.15s",
                  }}>{initial}</button>

                  {dropOpen && (
                    <div style={{
                      position: "absolute", top: "calc(100% + 8px)", right: 0, width: 220,
                      background: "#111114", border: "0.5px solid rgba(255,255,255,0.085)",
                      borderRadius: 14, boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
                      overflow: "hidden", animation: "dropIn 0.15s ease-out", zIndex: 200,
                    }}>
                      <div style={{ padding: "12px 14px 10px", borderBottom: "0.5px solid rgba(255,255,255,0.045)" }}>
                        <div style={{ fontSize: 13, color: "#ededf2", marginBottom: 2 }}>@{username}</div>
                        <div style={{ fontSize: 11, color: "#62626f", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</div>
                      </div>
                      <div style={{ padding: "6px 0" }}>
                        {DROPDOWN_LINKS.map(({ href, label, icon }) => (
                          <Link key={href} href={href} onClick={() => setDropOpen(false)} style={{
                            display: "flex", alignItems: "center", gap: 10,
                            padding: "8px 14px", fontSize: 13, color: "#a4a4b4",
                            textDecoration: "none", transition: "background 0.1s, color 0.1s",
                          }}
                          onMouseEnter={e => { (e.currentTarget as any).style.background = "rgba(255,255,255,0.04)"; (e.currentTarget as any).style.color = "#ededf2"; }}
                          onMouseLeave={e => { (e.currentTarget as any).style.background = "transparent"; (e.currentTarget as any).style.color = "#a4a4b4"; }}>
                            <span style={{ fontSize: 11, color: "#62626f", width: 14, textAlign: "center", flexShrink: 0 }}>{icon}</span>
                            {label}
                          </Link>
                        ))}
                      </div>
                      <div style={{ borderTop: "0.5px solid rgba(255,255,255,0.045)", padding: "6px 0" }}>
                        <Link href={`/profil/${username}`} onClick={() => setDropOpen(false)} style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "8px 14px", fontSize: 13, color: G, textDecoration: "none",
                        }}
                        onMouseEnter={e => (e.currentTarget as any).style.background = "rgba(255,255,255,0.04)"}
                        onMouseLeave={e => (e.currentTarget as any).style.background = "transparent"}>
                          <span style={{ fontSize: 11, color: "#62626f", width: 14, textAlign: "center" }}>◉</span>
                          Mein Profil
                        </Link>
                        <button onClick={signOut} style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "8px 14px", width: "100%",
                          fontSize: 13, color: "#dc4a5a",
                          background: "transparent", border: "none", cursor: "pointer",
                        }}
                        onMouseEnter={e => (e.currentTarget as any).style.background = "rgba(220,74,90,0.06)"}
                        onMouseLeave={e => (e.currentTarget as any).style.background = "transparent"}>
                          <span style={{ fontSize: 11, color: "#62626f", width: 14, textAlign: "center" }}>×</span>
                          Abmelden
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button onClick={() => setMobOpen(v => !v)} className="hamburger-btn" aria-label="Menü" style={{
              width: 36, height: 36, borderRadius: 10,
              background: mobOpen ? G08 : "transparent",
              border: `0.5px solid ${mobOpen ? G15 : "rgba(255,255,255,0.08)"}`,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 5,
              cursor: "pointer", transition: "all 0.2s", flexShrink: 0,
            }}>
              <span style={{ display: "block", width: 16, height: 1.5, background: mobOpen ? G : "#a4a4b4", borderRadius: 2, transition: "all 0.25s", transform: mobOpen ? "translateY(3px) rotate(45deg)" : "none" }}/>
              <span style={{ display: "block", width: 16, height: 1.5, background: mobOpen ? G : "#a4a4b4", borderRadius: 2, transition: "all 0.25s", opacity: mobOpen ? 0 : 1 }}/>
              <span style={{ display: "block", width: 16, height: 1.5, background: mobOpen ? G : "#a4a4b4", borderRadius: 2, transition: "all 0.25s", transform: mobOpen ? "translateY(-5px) rotate(-45deg)" : "none" }}/>
            </button>
          </div>
        </div>

        {mobOpen && (
          <div style={{
            borderTop: "0.5px solid rgba(255,255,255,0.06)",
            padding: "12px 16px 20px",
            display: "flex", flexDirection: "column", gap: 2,
            animation: "slideDown 0.2s ease-out",
          }}>
            {NAV_LINKS.map(({ href, label }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link key={href} href={href} style={{
                  padding: "11px 14px", borderRadius: 10, fontSize: 15,
                  color: active ? "#ededf2" : "#a4a4b4",
                  background: active ? "rgba(255,255,255,0.06)" : "transparent",
                  textDecoration: "none", fontWeight: active ? 500 : 400,
                }}>{label}</Link>
              );
            })}
            <div style={{ height: 0.5, background: "rgba(255,255,255,0.06)", margin: "8px 0" }}/>
            {user ? (
              <>
                {DROPDOWN_LINKS.map(({ href, label, icon }) => (
                  <Link key={href} href={href} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "10px 14px", borderRadius: 10, fontSize: 14,
                    color: "#a4a4b4", textDecoration: "none",
                  }}>
                    <span style={{ fontSize: 13, color: "#62626f", width: 16, textAlign: "center" }}>{icon}</span>
                    {label}
                  </Link>
                ))}
                <div style={{ height: 0.5, background: "rgba(255,255,255,0.06)", margin: "8px 0" }}/>
                <Link href={`/profil/${username}`} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 10, fontSize: 14, color: G, textDecoration: "none" }}>
                  <span style={{ fontSize: 13, color: "#62626f", width: 16, textAlign: "center" }}>◉</span>
                  @{username}
                </Link>
                <button onClick={signOut} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 10, fontSize: 14, color: "#dc4a5a", background: "transparent", border: "none", cursor: "pointer", width: "100%", textAlign: "left" }}>
                  <span style={{ fontSize: 13, color: "#62626f", width: 16, textAlign: "center" }}>×</span>
                  Abmelden
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" style={{ padding: "11px 14px", borderRadius: 10, fontSize: 15, color: "#a4a4b4", textDecoration: "none" }}>Anmelden</Link>
                <Link href="/dashboard/premium" style={{ padding: "11px 14px", borderRadius: 10, fontSize: 15, color: G, background: G08, border: `0.5px solid ${G15}`, textDecoration: "none", textAlign: "center", fontWeight: 500 }}>Premium werden ✦</Link>
              </>
            )}
          </div>
        )}
      </header>

      <style>{`
        @keyframes dropIn   { from { opacity:0; transform:translateY(-6px) } to { opacity:1; transform:translateY(0) } }
        @keyframes slideDown{ from { opacity:0; transform:translateY(-8px) } to { opacity:1; transform:translateY(0) } }
        .desktop-nav  { display: flex !important; }
        .desktop-auth { display: flex !important; }
        .hamburger-btn{ display: none !important; }
        @media (max-width: 680px) {
          .desktop-nav  { display: none !important; }
          .desktop-auth { display: none !important; }
          .hamburger-btn{ display: flex !important; }
        }
      `}</style>
    </>
  );
}

'@
[System.IO.File]::WriteAllText("$root\src\components\layout\Navbar.tsx", $navbar, $enc)
Write-Host "  OK  Navbar.tsx" -ForegroundColor Green

$scanner = @'
"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const G="#D4A843",G25="rgba(212,168,67,0.25)",G18="rgba(212,168,67,0.18)",G08="rgba(212,168,67,0.08)",G04="rgba(212,168,67,0.04)";
const BG1="#111114",BG2="#18181c",BR1="rgba(255,255,255,0.045)",BR2="rgba(255,255,255,0.085)";
const TX1="#ededf2",TX2="#a4a4b4",TX3="#62626f",GREEN="#3db87a",RED="#dc4a5a";

interface ScanResult {
  gemini: { name:string; name_de:string; set_id:string|null; number:string|null; confidence:number };
  card: { id:string; name:string; name_de:string; set_id:string; number:string; price_market:number; price_avg7:number|null; price_avg30:number|null; image_url:string|null; rarity:string|null } | null;
  matches: any[];
  scansUsed: number | null;
  scansLeft: number | null;
}
interface Listing { id:string; type:"offer"|"want"; price:number|null; condition:string; note:string; profiles:{username:string}|null }

function ConditionBadge({c}:{c:string}) {
  const colors:Record<string,string> = {NM:GREEN,LP:"#a4d87a",MP:G,HP:RED,D:RED};
  return <span style={{fontSize:9,fontWeight:600,padding:"2px 6px",borderRadius:4,background:"rgba(255,255,255,0.04)",color:colors[c]??TX3,border:"0.5px solid rgba(255,255,255,0.08)"}}>{c}</span>;
}

function MatchingPanel({cardId}:{cardId:string}) {
  const [tab, setTab] = useState<"offer"|"want">("offer");
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<"offer"|"want">("offer");
  const [formPrice, setFormPrice] = useState("");
  const [formCond, setFormCond] = useState("NM");
  const [formNote, setFormNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadListings(t: "offer"|"want") {
    setLoading(true);
    const res = await fetch(`/api/marketplace?card_id=${cardId}&type=${t}`);
    const data = await res.json();
    setListings(data.listings ?? []);
    setLoading(false);
  }

  useEffect(() => { loadListings(tab); }, [tab, cardId]);

  async function submitListing() {
    setSubmitting(true);
    await fetch("/api/marketplace", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ card_id:cardId, type:formType, price:parseFloat(formPrice)||null, condition:formCond, note:formNote }),
    });
    setSubmitting(false);
    setShowForm(false);
    loadListings(tab);
  }

  return (
    <div style={{marginTop:24,background:BG1,border:`1px solid ${BR2}`,borderRadius:22,overflow:"hidden"}}>
      {/* Tabs */}
      <div style={{display:"flex",borderBottom:`1px solid ${BR1}`}}>
        {([["offer","Kaufangebote"],["want","Suchangebote"]] as const).map(([t,l])=>(
          <button key={t} onClick={()=>setTab(t)} style={{
            flex:1,padding:"14px",fontSize:13,fontWeight:500,border:"none",cursor:"pointer",
            background:tab===t?BG2:"transparent",
            color:tab===t?TX1:TX3,
            borderBottom:tab===t?`2px solid ${G}`:"2px solid transparent",
            transition:"all .2s",
          }}>{l} {tab===t&&listings.length>0&&<span style={{fontSize:10,background:G08,color:G,padding:"1px 6px",borderRadius:4,marginLeft:6}}>{listings.length}</span>}</button>
        ))}
      </div>
      {/* List */}
      <div style={{padding:"0 4px"}}>
        {loading ? (
          <div style={{padding:"28px",textAlign:"center",fontSize:13,color:TX3}}>Lädt…</div>
        ) : listings.length === 0 ? (
          <div style={{padding:"28px",textAlign:"center"}}>
            <div style={{fontSize:13,color:TX3,marginBottom:12}}>Noch keine {tab==="offer"?"Angebote":"Suchanfragen"}</div>
            <button onClick={()=>{setFormType(tab);setShowForm(true);}} style={{
              padding:"8px 20px",borderRadius:10,fontSize:12,fontWeight:500,
              background:G,color:"#0a0808",border:"none",cursor:"pointer",
            }}>Ich {tab==="offer"?"biete an":"suche"} ✦</button>
          </div>
        ) : (
          <>
            {listings.map(l=>(
              <div key={l.id} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",borderBottom:`1px solid ${BR1}`}}>
                <div style={{width:36,height:36,borderRadius:"50%",background:BG2,border:`1px solid ${BR1}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:G,fontWeight:500,flexShrink:0}}>
                  {(l.profiles?.username?.[0]??"?").toUpperCase()}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,color:TX1,fontWeight:400}}>{l.profiles?.username??"Anonym"}</div>
                  {l.note&&<div style={{fontSize:11,color:TX3,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l.note}</div>}
                </div>
                <ConditionBadge c={l.condition}/>
                {l.price&&<div style={{fontSize:15,fontWeight:400,fontFamily:"var(--font-mono)",color:G,flexShrink:0}}>{l.price.toLocaleString("de-DE",{minimumFractionDigits:2})} €</div>}
                <a href={`/profil/${l.profiles?.username??""}`} style={{
                  padding:"7px 14px",borderRadius:10,fontSize:12,fontWeight:500,
                  background:tab==="offer"?G:"transparent",color:tab==="offer"?"#0a0808":G,
                  border:tab==="offer"?"none":`1px solid ${G18}`,textDecoration:"none",flexShrink:0,
                }}>Kontakt</a>
              </div>
            ))}
            <div style={{padding:"12px 16px"}}>
              <button onClick={()=>{setFormType(tab);setShowForm(true);}} style={{
                fontSize:12,color:TX3,background:"transparent",border:`1px solid ${BR1}`,
                borderRadius:8,padding:"6px 14px",cursor:"pointer",
              }}>+ Eigenes Angebot erstellen</button>
            </div>
          </>
        )}
      </div>
      {/* Create listing form */}
      {showForm&&(
        <div style={{padding:"16px",background:BG2,borderTop:`1px solid ${BR1}`}}>
          <div style={{fontSize:12,fontWeight:500,color:TX1,marginBottom:12}}>
            {formType==="offer"?"Ich biete diese Karte an":"Ich suche diese Karte"}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
            <div>
              <div style={{fontSize:9,color:TX3,marginBottom:4,textTransform:"uppercase",letterSpacing:".08em"}}>Preis (€)</div>
              <input value={formPrice} onChange={e=>setFormPrice(e.target.value)} type="number" placeholder="z.B. 45.00"
                style={{width:"100%",padding:"9px 12px",borderRadius:8,background:"rgba(0,0,0,0.3)",border:`1px solid ${BR2}`,color:TX1,fontSize:13,outline:"none"}}/>
            </div>
            <div>
              <div style={{fontSize:9,color:TX3,marginBottom:4,textTransform:"uppercase",letterSpacing:".08em"}}>Zustand</div>
              <select value={formCond} onChange={e=>setFormCond(e.target.value)}
                style={{width:"100%",padding:"9px 12px",borderRadius:8,background:BG1,border:`1px solid ${BR2}`,color:TX1,fontSize:13,outline:"none"}}>
                {["NM","LP","MP","HP","D"].map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <input value={formNote} onChange={e=>setFormNote(e.target.value)} placeholder="Kurze Notiz (optional)"
            style={{width:"100%",padding:"9px 12px",borderRadius:8,background:"rgba(0,0,0,0.3)",border:`1px solid ${BR2}`,color:TX1,fontSize:13,outline:"none",marginBottom:10}}/>
          <div style={{display:"flex",gap:8}}>
            <button onClick={submitListing} disabled={submitting} style={{flex:1,padding:"10px",borderRadius:10,background:G,color:"#0a0808",fontSize:13,fontWeight:500,border:"none",cursor:"pointer"}}>
              {submitting?"Wird gespeichert…":"Veröffentlichen"}
            </button>
            <button onClick={()=>setShowForm(false)} style={{padding:"10px 16px",borderRadius:10,background:"transparent",color:TX2,fontSize:13,border:`1px solid ${BR1}`,cursor:"pointer"}}>Abbrechen</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ScannerPage() {
  const [dragging, setDragging]     = useState(false);
  const [scanning, setScanning]     = useState(false);
  const [result,   setResult]       = useState<ScanResult|null>(null);
  const [preview,  setPreview]      = useState<string|null>(null);
  const [error,    setError]        = useState<string|null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const router = useRouter();
  const [scansToday, setScansToday] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load scan count on mount
  useEffect(() => {
    fetch("/api/scanner/count").then(r=>r.json()).then(d=>setScansToday(d.count??0)).catch(()=>{});
  }, []);

  async function handleFile(file: File) {
    setError(null);
    setResult(null);
    setScanning(true);

    // Preview
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    // Convert to base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve((r.result as string).split(",")[1]);
      r.onerror = reject;
      r.readAsDataURL(file);
    });

    try {
      const res = await fetch("/api/scanner/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType: file.type || "image/jpeg" }),
      });

      const data = await res.json();

      if (res.status === 429) {
        setError("Du hast dein Tageslimit von 5 Scans erreicht. Upgrade auf Premium für unlimitierte Scans.");
        setScanning(false);
        return;
      }
      if (!res.ok || data.error) {
        setError(data.error === "Karte nicht erkannt" ? "Karte konnte nicht erkannt werden. Bitte ein klareres Foto versuchen." : "Fehler beim Scannen. Bitte erneut versuchen.");
        setScanning(false);
        return;
      }

      setResult(data);
      if (data.card?.id) {
        setRedirecting(true);
        setTimeout(() => router.push(`/preischeck/${data.card.id}`), 1500);
      }
      if (data.scansUsed !== null) setScansToday(data.scansUsed);
    } catch {
      setError("Verbindungsfehler. Bitte erneut versuchen.");
    }
    setScanning(false);
  }

  const card = result?.card;
  const priceFormatted = card?.price_market
    ? card.price_market.toLocaleString("de-DE", { minimumFractionDigits: 2 }) + " €"
    : null;
  const trend7 = card?.price_avg7 && card?.price_market
    ? ((card.price_market - card.price_avg7) / card.price_avg7 * 100)
    : null;

  return (
    <div style={{color:TX1,minHeight:"80vh"}}>
      <div style={{maxWidth:1100,margin:"0 auto",padding:"clamp(52px,7vw,80px) clamp(16px,3vw,28px)"}}>

        {/* Header */}
        <div style={{textAlign:"center",marginBottom:"clamp(48px,6vw,72px)"}}>
          <div style={{fontSize:9,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:TX3,marginBottom:16,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            <span style={{width:16,height:0.5,background:TX3,display:"inline-block"}}/>KI-Scanner · Gemini Flash<span style={{width:16,height:0.5,background:TX3,display:"inline-block"}}/>
          </div>
          <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(36px,6vw,68px)",fontWeight:200,letterSpacing:"-.055em",lineHeight:1.0,marginBottom:18}}>
            Foto machen.<br/><span style={{color:G}}>Preis wissen.</span>
          </h1>
          <p style={{fontSize:"clamp(14px,1.6vw,18px)",color:TX2,maxWidth:460,margin:"0 auto",lineHeight:1.8,fontWeight:300}}>
            Halte deine Karte vor die Kamera. In Sekunden erhältst du den aktuellen Cardmarket-Wert.
          </p>
        </div>

        {/* Main layout */}
        <div className="scanner-split" style={{
          background:BG1,border:`1px solid ${BR2}`,borderRadius:28,
          overflow:"hidden",display:"grid",gridTemplateColumns:"1fr 1fr",minHeight:480,
          position:"relative",
        }}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${G25},transparent)`}}/>

          {/* Left: Upload */}
          <div style={{padding:"clamp(28px,4vw,52px)",display:"flex",flexDirection:"column",justifyContent:"center",borderRight:`1px solid ${BR1}`}}>
            <input ref={inputRef} type="file" accept="image/*" style={{display:"none"}}
              onChange={e=>e.target.files?.[0]&&handleFile(e.target.files[0])}/>

            {/* Drop zone */}
            <div
              onClick={()=>inputRef.current?.click()}
              onDragOver={e=>{e.preventDefault();setDragging(true);}}
              onDragLeave={()=>setDragging(false)}
              onDrop={e=>{e.preventDefault();setDragging(false);e.dataTransfer.files[0]&&handleFile(e.dataTransfer.files[0]);}}
              style={{
                borderRadius:18,border:`1.5px dashed ${dragging?G25:BR2}`,
                background:dragging?G04:"rgba(0,0,0,0.2)",
                display:"flex",flexDirection:"column",alignItems:"center",
                justifyContent:"center",gap:12,cursor:"pointer",
                aspectRatio:"4/3",marginBottom:20,
                transition:"all .4s var(--ease)",overflow:"hidden",position:"relative",
              }}>
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="Vorschau" style={{width:"100%",height:"100%",objectFit:"contain",padding:12}}/>
              ) : (
                <>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={TX3} strokeWidth="1.2" style={{opacity:.4}}>
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
                  </svg>
                  <div style={{textAlign:"center"}}>
                    <div style={{fontSize:14,color:TX2,marginBottom:4,fontWeight:300}}>Foto hier ablegen</div>
                    <div style={{fontSize:12,color:TX3}}>oder klicken zum Hochladen</div>
                    <div style={{fontSize:10,color:TX3,marginTop:8,padding:"3px 12px",borderRadius:6,background:"rgba(255,255,255,0.04)",display:"inline-block"}}>JPG · PNG · WEBP · max 10 MB</div>
                  </div>
                </>
              )}
            </div>

            <button onClick={()=>!scanning&&inputRef.current?.click()} style={{
              width:"100%",padding:"14px",borderRadius:16,
              background:scanning?"transparent":G,
              color:scanning?G:"#0a0808",
              fontSize:14,fontWeight:400,border:scanning?`1px solid ${G18}`:"none",
              cursor:scanning?"wait":"pointer",letterSpacing:"-.01em",
              transition:"all .3s",boxShadow:scanning?"none":`0 2px 20px ${G25}`,
              marginBottom:12,
            }}>
              {scanning ? "Erkennt Karte…" : "Jetzt scannen"}
            </button>

            {/* Scan counter */}
            <div style={{textAlign:"center",fontSize:12,color:TX3}}>
              <span style={{padding:"3px 12px",borderRadius:6,background:scansToday>=5?`rgba(220,74,90,0.08)`:`rgba(212,168,67,0.06)`,color:scansToday>=5?RED:TX3}}>
                {scansToday} / 5 Scans heute
              </span>
              {" · "}
              <Link href="/dashboard/premium" style={{color:G,textDecoration:"none",fontSize:12}}>Unlimitiert mit Premium ✦</Link>
            </div>
          </div>

          {/* Right: Result */}
          <div style={{padding:"clamp(28px,4vw,52px)",display:"flex",flexDirection:"column",justifyContent:"center"}}>
            {scanning ? (
              <div style={{textAlign:"center"}}>
                <div style={{width:52,height:52,borderRadius:"50%",border:`1.5px solid ${G18}`,borderTopColor:G,margin:"0 auto 20px",animation:"spin 0.8s linear infinite"}}/>
                <div style={{fontSize:15,color:TX2,fontWeight:300}}>KI analysiert deine Karte…</div>
                <div style={{fontSize:12,color:TX3,marginTop:8}}>Abgleich mit 22.000+ Karten</div>
              </div>
            ) : error ? (
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:14,color:RED,marginBottom:16,lineHeight:1.6}}>{error}</div>
                {error.includes("Tageslimit") && (
                  <Link href="/dashboard/premium" style={{display:"inline-block",padding:"12px 24px",borderRadius:14,background:G,color:"#0a0808",fontSize:13,fontWeight:400,textDecoration:"none"}}>Premium werden ✦</Link>
                )}
              </div>
            ) : result && card ? (
              <div>
                {/* Card found */}
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:18}}>
                  <span style={{width:6,height:6,borderRadius:"50%",background:GREEN,display:"inline-block"}}/>
                  <span style={{fontSize:10,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:GREEN}}>
                    Erkannt · {Math.round((result.gemini.confidence??0.95)*100)}% Konfidenz
                  </span>
                </div>

                {/* Card name */}
                <div style={{fontFamily:"var(--font-display)",fontSize:"clamp(22px,3vw,36px)",fontWeight:200,letterSpacing:"-.04em",color:TX1,marginBottom:6,lineHeight:1.1}}>
                  {card.name_de || card.name}
                </div>
                <div style={{fontSize:13,color:TX3,marginBottom:20}}>
                  {card.set_id?.toUpperCase()} · #{card.number} {card.rarity&&`· ${card.rarity}`}
                </div>

                {/* Price */}
                <div style={{fontFamily:"var(--font-mono)",fontSize:"clamp(36px,4.5vw,56px)",fontWeight:300,color:G,letterSpacing:"-.05em",lineHeight:1,marginBottom:8}}>
                  {priceFormatted}
                </div>
                {trend7 !== null && (
                  <div style={{fontSize:12,color:trend7>=0?GREEN:RED,marginBottom:24}}>
                    {trend7>=0?"▲":"▼"} {Math.abs(trend7).toFixed(1)} % vs. 7-Tage-Schnitt
                  </div>
                )}

                <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:24}}>
                  <Link href={`/preischeck/${card.id}`} style={{
                    padding:"10px 20px",borderRadius:12,background:G,color:"#0a0808",
                    fontSize:13,fontWeight:400,textDecoration:"none",
                    boxShadow:`0 2px 16px ${G25}`,
                  }}>Preishistorie</Link>
                  <button onClick={()=>{setResult(null);setPreview(null);setError(null);}} style={{
                    padding:"10px 20px",borderRadius:12,background:"transparent",
                    color:TX2,fontSize:13,border:`1px solid ${BR2}`,cursor:"pointer",
                  }}>Neue Karte</button>
                </div>

                {/* Matching panel */}
                <MatchingPanel cardId={card.id}/>
              </div>
            ) : result && !card ? (
              // Gemini recognized but no DB match
              <div>
                <div style={{fontSize:10,fontWeight:600,letterSpacing:".1em",color:"#e8a84a",marginBottom:16,textTransform:"uppercase"}}>
                  ⚠ Karte erkannt — kein Preis gefunden
                </div>
                <div style={{fontSize:20,fontWeight:300,color:TX1,marginBottom:8}}>{result.gemini.name_de||result.gemini.name}</div>
                <div style={{fontSize:13,color:TX3,marginBottom:20}}>Diese Karte ist noch nicht in unserer Datenbank.</div>
                <Link href={`/preischeck?q=${encodeURIComponent(result.gemini.name_de||result.gemini.name)}`}
                  style={{padding:"10px 20px",borderRadius:12,background:G,color:"#0a0808",fontSize:13,textDecoration:"none"}}>
                  Trotzdem suchen
                </Link>
              </div>
            ) : (
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:48,opacity:.08,marginBottom:14}}>◎</div>
                <div style={{fontSize:15,color:TX3,fontWeight:300,lineHeight:1.7}}>Lade eine Karte hoch<br/>um den Preis zu sehen</div>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

'@
[System.IO.File]::WriteAllText("$root\src\app\scanner\page.tsx", $scanner, $enc)
Write-Host "  OK  page.tsx" -ForegroundColor Green

$forum = @'
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const G="#D4A843",G18="rgba(212,168,67,0.18)",G08="rgba(212,168,67,0.08)";
const BG1="#111114",BG2="#18181c",BG3="#202025";
const BR1="rgba(255,255,255,0.045)",BR2="rgba(255,255,255,0.085)";
const TX1="#ededf2",TX2="#a4a4b4",TX3="#62626f",GREEN="#3db87a",RED="#dc4a5a";

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

'@
[System.IO.File]::WriteAllText("$root\src\app\forum\page.tsx", $forum, $enc)
Write-Host "  OK  page.tsx" -ForegroundColor Green

$card = @'
"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const G="#D4A843",G18="rgba(212,168,67,0.18)",G08="rgba(212,168,67,0.08)";
const BG1="#111114",BG2="#18181c",BR1="rgba(255,255,255,0.045)",BR2="rgba(255,255,255,0.085)";
const TX1="#ededf2",TX2="#a4a4b4",TX3="#62626f",GREEN="#3db87a",RED="#dc4a5a";

const TYPE_COLOR:Record<string,string>={Fire:"#F97316",Water:"#38BDF8",Grass:"#4ADE80",Lightning:"#D4A843",Psychic:"#A855F7",Fighting:"#EF4444",Darkness:"#6B7280",Metal:"#9CA3AF",Dragon:"#7C3AED",Colorless:"#CBD5E1"};
const TYPE_DE:Record<string,string>={Fire:"Feuer",Water:"Wasser",Grass:"Pflanze",Lightning:"Elektro",Psychic:"Psycho",Fighting:"Kampf",Darkness:"Finsternis",Metal:"Metall",Dragon:"Drache",Colorless:"Farblos"};

function PriceChart({avg7,avg30,market,history}:{avg7:number|null;avg30:number|null;market:number|null;history?:{price_market:number;recorded_at:string}[]}) {
  if (!market) return null;
  let pts:number[];
  if (history && history.length>=3) {
    pts = history.map(h=>h.price_market).reverse();
  } else {
    const now=market;
    const p30=avg30??market*0.88, p7=avg7??market*0.96;
    pts=[p30,p30*1.02,p30*0.98,p30*1.04,p30*1.01,p7*0.97,p7,p7*1.02,p7*0.99,p7*1.01,now*0.98,now*1.01,now*0.99,now];
  }
  const now=market;
  const min=Math.min(...pts)*0.97, max=Math.max(...pts)*1.03, range=max-min;
  const W=600, H=80;
  const xStep=W/(pts.length-1);
  const toY=(v:number)=>H-((v-min)/range)*H;
  const pathD=pts.map((v,i)=>`${i===0?"M":"L"}${i*xStep},${toY(v)}`).join(" ");
  const trend7=avg7?((market-avg7)/avg7*100):null;
  const trend30=avg30?((market-avg30)/avg30*100):null;
  return (
    <div style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:18,padding:"18px",marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:14}}>
        <div style={{fontSize:10,fontWeight:500,color:TX3,textTransform:"uppercase",letterSpacing:".08em"}}>Preisverlauf</div>
        <div style={{display:"flex",gap:16}}>
          {trend7!==null&&<div style={{textAlign:"right"}}><div style={{fontSize:9,color:TX3,marginBottom:2}}>7 Tage</div><div style={{fontSize:12,fontWeight:500,color:trend7>=0?GREEN:RED}}>{trend7>=0?"+":""}{trend7.toFixed(1)}%</div></div>}
          {trend30!==null&&<div style={{textAlign:"right"}}><div style={{fontSize:9,color:TX3,marginBottom:2}}>30 Tage</div><div style={{fontSize:12,fontWeight:500,color:trend30>=0?GREEN:RED}}>{trend30>=0?"+":""}{trend30.toFixed(1)}%</div></div>}
        </div>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{display:"block",height:64}}>
        <defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={G} stopOpacity=".2"/><stop offset="100%" stopColor={G} stopOpacity="0"/></linearGradient></defs>
        <path d={pathD+` L${(pts.length-1)*xStep},${H} L0,${H}Z`} fill="url(#cg)"/>
        <path d={pathD} fill="none" stroke={G} strokeWidth="1.8" opacity=".8"/>
        <circle cx={(pts.length-1)*xStep} cy={toY(market)} r="3" fill={G}/>
      </svg>
    </div>
  );
}

export default function CardDetailPage() {
  const {id} = useParams() as {id:string};
  const [card, setCard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [inColl, setInColl] = useState(false);
  const [inWish, setInWish] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [adding, setAdding] = useState(false);
  const [priceHistory, setPriceHistory] = useState<any[]>([]);

  useEffect(()=>{
    const sb=createClient();
    sb.from("cards").select("id,name,name_de,set_id,number,types,rarity,image_url,price_market,price_low,price_avg7,price_avg30,hp,category,stage,illustrator,regulation_mark,is_holo,is_reverse_holo").eq("id",id).single().then(({data})=>{setCard(data);setLoading(false);});
    sb.from("price_history").select("price_market,recorded_at").eq("card_id",id).order("recorded_at",{ascending:false}).limit(30).then(({data})=>setPriceHistory(data??[]));
    sb.auth.getSession().then(async({data:{session}})=>{
      if(!session?.user) return;
      setUser(session.user);
      const [col,wish]=await Promise.all([
        sb.from("user_collection").select("id").eq("user_id",session.user.id).eq("card_id",id).maybeSingle(),
        sb.from("user_wishlist").select("id").eq("user_id",session.user.id).eq("card_id",id).maybeSingle(),
      ]);
      setInColl(!!col.data);
      setInWish(!!wish.data);
    });
  },[id]);

  async function toggleCollection(){
    if(!user||!card) return;
    setAdding(true);
    const sb=createClient();
    if(inColl){await sb.from("user_collection").delete().eq("user_id",user.id).eq("card_id",id);setInColl(false);}
    else{await sb.from("user_collection").insert({user_id:user.id,card_id:id,quantity:1,condition:"NM"});setInColl(true);}
    setAdding(false);
  }

  async function toggleWishlist(){
    if(!user||!card) return;
    setAdding(true);
    const sb=createClient();
    if(inWish){await sb.from("user_wishlist").delete().eq("user_id",user.id).eq("card_id",id);setInWish(false);}
    else{await sb.from("user_wishlist").insert({user_id:user.id,card_id:id});setInWish(true);}
    setAdding(false);
  }

  if(loading) return <div style={{color:TX1,minHeight:"80vh",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{fontSize:14,color:TX3}}>Lädt…</div></div>;
  if(!card) return <div style={{color:TX1,minHeight:"80vh",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{textAlign:"center"}}><div style={{fontSize:14,color:TX3,marginBottom:12}}>Karte nicht gefunden.</div><Link href="/preischeck" style={{color:G,textDecoration:"none",fontSize:13}}>← Zurück</Link></div></div>;

  const type=card.types?.[0];
  const typeColor=type?(TYPE_COLOR[type]??TX3):TX3;

  return (
    <div style={{color:TX1,minHeight:"80vh"}}>
      <div style={{maxWidth:1000,margin:"0 auto",padding:"clamp(40px,6vw,72px) clamp(16px,3vw,28px)"}}>
        <Link href="/preischeck" style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:12,color:TX3,textDecoration:"none",marginBottom:28}}>← Zurück</Link>
        <div style={{display:"grid",gridTemplateColumns:"clamp(200px,28vw,280px) 1fr",gap:24,alignItems:"start"}}>
          <div>
            <div style={{background:BG2,borderRadius:18,overflow:"hidden",border:`0.5px solid ${BR2}`,aspectRatio:"2/3",display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
              {card.image_url?<img src={card.image_url} alt={card.name_de??card.name} style={{width:"100%",height:"100%",objectFit:"contain",padding:12}}/>:<div style={{fontSize:48,opacity:.1}}>◈</div>}
              {(card.is_holo||card.is_reverse_holo)&&<div style={{position:"absolute",top:10,right:10,padding:"2px 8px",borderRadius:5,background:G08,color:G,fontSize:9,fontWeight:600}}>{card.is_reverse_holo?"REV. HOLO":"HOLO"}</div>}
            </div>
            <div style={{display:"flex",gap:8,marginTop:12}}>
              <button onClick={toggleCollection} disabled={!user||adding} style={{flex:1,padding:"10px",borderRadius:11,fontSize:12,border:"none",cursor:user?"pointer":"default",background:inColl?G08:"rgba(255,255,255,0.04)",color:inColl?G:TX3,outline:`0.5px solid ${inColl?G18:BR1}`,transition:"all .2s"}}>
                {inColl?"✓ In Sammlung":"+ Sammlung"}
              </button>
              <button onClick={toggleWishlist} disabled={!user||adding} style={{flex:1,padding:"10px",borderRadius:11,fontSize:12,border:"none",cursor:user?"pointer":"default",background:inWish?"rgba(220,74,90,0.08)":"rgba(255,255,255,0.04)",color:inWish?RED:TX3,outline:`0.5px solid ${inWish?"rgba(220,74,90,0.2)":BR1}`,transition:"all .2s"}}>
                {inWish?"♥ Wunschliste":"♡ Wunschliste"}
              </button>
            </div>
            {!user&&<div style={{fontSize:10,color:TX3,textAlign:"center",marginTop:8}}><Link href="/auth/login" style={{color:G,textDecoration:"none"}}>Anmelden</Link> zum Sammeln</div>}
          </div>
          <div>
            {type&&<div style={{display:"inline-flex",alignItems:"center",gap:6,marginBottom:12,padding:"4px 12px",borderRadius:8,background:`${typeColor}12`,border:`0.5px solid ${typeColor}25`}}><div style={{width:7,height:7,borderRadius:"50%",background:typeColor}}/><span style={{fontSize:11,fontWeight:500,color:typeColor}}>{TYPE_DE[type]??type}</span></div>}
            <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(22px,4vw,38px)",fontWeight:200,letterSpacing:"-.04em",marginBottom:6,lineHeight:1.1}}>{card.name_de||card.name}</h1>
            {card.name_de&&card.name_de!==card.name&&<div style={{fontSize:13,color:TX3,marginBottom:14}}>{card.name}</div>}
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:20}}>
              <span style={{fontSize:11,color:TX3,fontFamily:"var(--font-mono)"}}>{card.set_id.toUpperCase()}</span>
              <span style={{color:TX3}}>·</span><span style={{fontSize:11,color:TX3}}>#{card.number}</span>
              {card.rarity&&<><span style={{color:TX3}}>·</span><span style={{fontSize:11,color:TX2}}>{card.rarity}</span></>}
            </div>
            <div style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:16,padding:"16px 18px",marginBottom:12}}>
              <div style={{fontSize:9,color:TX3,textTransform:"uppercase",letterSpacing:".1em",marginBottom:6}}>Marktpreis</div>
              <div style={{display:"flex",alignItems:"baseline",gap:12,flexWrap:"wrap"}}>
                <div style={{fontFamily:"var(--font-mono)",fontSize:"clamp(28px,5vw,48px)",fontWeight:300,color:G,letterSpacing:"-.05em",lineHeight:1}}>
                  {card.price_market?.toLocaleString("de-DE",{minimumFractionDigits:2})} €
                </div>
              </div>
              {(card.price_low||card.price_avg30)&&(
                <div style={{display:"flex",gap:16,marginTop:10,flexWrap:"wrap"}}>
                  {card.price_low&&<div><div style={{fontSize:9,color:TX3,marginBottom:2}}>Niedrigster</div><div style={{fontSize:12,fontFamily:"var(--font-mono)",color:TX2}}>{card.price_low.toLocaleString("de-DE",{minimumFractionDigits:2})} €</div></div>}
                  {card.price_avg30&&<div><div style={{fontSize:9,color:TX3,marginBottom:2}}>30T-Schnitt</div><div style={{fontSize:12,fontFamily:"var(--font-mono)",color:TX2}}>{card.price_avg30.toLocaleString("de-DE",{minimumFractionDigits:2})} €</div></div>}
                </div>
              )}
            </div>
            <PriceChart avg7={card.price_avg7} avg30={card.price_avg30} market={card.price_market} history={priceHistory}/>
            <div style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:16,overflow:"hidden",marginBottom:12}}>
              <div style={{padding:"10px 14px",borderBottom:`0.5px solid ${BR1}`,fontSize:10,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:TX3}}>Details</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:0}}>
                {[["Typ",card.types?.map((t:string)=>TYPE_DE[t]??t).join(", ")??"—"],["KP",card.hp??"—"],["Kategorie",card.category??"—"],["Stage",card.stage??"—"],["Illustrator",card.illustrator??"—"],["Regulation",card.regulation_mark??"—"]].map(([l,v],i)=>(
                  <div key={l} style={{padding:"10px 14px",borderBottom:`0.5px solid ${BR1}`,borderRight:i%2===0?`0.5px solid ${BR1}`:undefined}}>
                    <div style={{fontSize:9,color:TX3,textTransform:"uppercase",letterSpacing:".06em",marginBottom:2}}>{l}</div>
                    <div style={{fontSize:12,color:TX1}}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
            <Link href="/marketplace" style={{display:"block",padding:"11px 14px",borderRadius:12,background:G08,border:`0.5px solid ${G18}`,color:TX1,textDecoration:"none",fontSize:13,transition:"all .2s"}}>
              <span style={{color:G}}>◈</span> Angebote auf dem Marktplatz →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

'@
[System.IO.File]::WriteAllText("$root\src\app\preischeck\[id]\page.tsx", $card, $enc)
Write-Host "  OK  page.tsx" -ForegroundColor Green

$marketplace = @'
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const G="#D4A843",G25="rgba(212,168,67,0.25)",G18="rgba(212,168,67,0.18)",G10="rgba(212,168,67,0.10)",G05="rgba(212,168,67,0.05)";
const BG1="#111114",BG2="#18181c",BG3="#1e1e22";
const BR1="rgba(255,255,255,0.045)",BR2="rgba(255,255,255,0.085)",BR3="rgba(255,255,255,0.13)";
const TX1="#ededf2",TX2="#a4a4b4",TX3="#62626f";
const GREEN="#3db87a",RED="#dc4a5a",AMBER="#f59e0b";

const COND:Record<string,{label:string;color:string}>={
  NM:{label:"Near Mint",color:GREEN},LP:{label:"Light Played",color:"#7dd3b0"},
  MP:{label:"Mod. Played",color:AMBER},HP:{label:"Heavy Played",color:"#fb923c"},D:{label:"Damaged",color:RED},
};

function ago(d:string){const h=Math.floor((Date.now()-new Date(d).getTime())/3600000);if(h<1)return"Gerade";if(h<24)return`${h}h`;if(h<168)return`${Math.floor(h/24)}T`;return`${Math.floor(h/168)}W`;}

function Avatar({username,size=28}:{username:string;size?:number}){
  const colors=["#D4A843","#60A5FA","#34D399","#A78BFA","#F472B6","#FB923C"];
  const c=colors[username.charCodeAt(0)%colors.length];
  return <div style={{width:size,height:size,borderRadius:"50%",background:`${c}15`,border:`0.5px solid ${c}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*.42,color:c,fontWeight:500,flexShrink:0}}>{username[0].toUpperCase()}</div>;
}

function ListingCard({l,onOffer}:{l:any;onOffer:(l:any)=>void}){
  const card=l.cards;
  const cond=COND[l.condition]??COND.NM;
  const isDeal=l.type==="offer"&&l.price&&card?.price_market&&l.price<card.price_market*0.95;
  const seller=l.profiles?.username??"Anonym";
  const [hov,setHov]=useState(false);
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{background:hov?BG2:BG1,border:`0.5px solid ${hov?(isDeal?G18:BR3):BR2}`,borderRadius:18,overflow:"hidden",transition:"all .2s",transform:hov?"translateY(-2px)":"none",boxShadow:hov?`0 8px 32px rgba(0,0,0,0.4)`:undefined,position:"relative"}}>
      {isDeal&&<div style={{position:"absolute",top:0,left:0,right:0,height:1.5,background:`linear-gradient(90deg,transparent,${G},transparent)`}}/>}
      <div style={{display:"flex",gap:12,padding:"14px 14px 10px"}}>
        <Link href={`/preischeck/${card?.id}`} style={{flexShrink:0,textDecoration:"none"}}>
          <div style={{width:56,height:78,borderRadius:8,background:BG3,overflow:"hidden",border:`0.5px solid ${BR2}`,transition:"all .2s",transform:hov?"scale(1.04)":"scale(1)"}}>
            {card?.image_url?<img src={card.image_url} alt="" style={{width:"100%",height:"100%",objectFit:"contain"}}/>:<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,color:TX3,opacity:.2}}>◈</div>}
          </div>
        </Link>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:6,marginBottom:4,flexWrap:"wrap"}}>
            {isDeal&&<span style={{fontSize:8,fontWeight:700,padding:"1px 5px",borderRadius:3,background:G10,color:G,border:`0.5px solid ${G18}`,flexShrink:0}}>DEAL</span>}
            {l.type==="want"&&<span style={{fontSize:8,fontWeight:700,padding:"1px 5px",borderRadius:3,background:"rgba(96,165,250,0.10)",color:"#60A5FA",border:"0.5px solid rgba(96,165,250,0.2)",flexShrink:0}}>SUCHE</span>}
          </div>
          <Link href={`/preischeck/${card?.id}`} style={{textDecoration:"none"}}>
            <div style={{fontSize:13.5,fontWeight:400,color:TX1,lineHeight:1.3,marginBottom:3,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{card?.name_de||card?.name||"Unbekannte Karte"}</div>
          </Link>
          <div style={{fontSize:10,color:TX3,marginBottom:6}}>{card?.set_id?.toUpperCase()} · #{card?.number}{card?.rarity&&<span style={{marginLeft:6,opacity:.7}}>{card.rarity}</span>}</div>
          <span style={{fontSize:9,fontWeight:600,padding:"2px 7px",borderRadius:4,background:`${cond.color}12`,color:cond.color,border:`0.5px solid ${cond.color}25`}}>{l.condition} · {cond.label}</span>
        </div>
      </div>
      <div style={{height:0.5,background:BR1,margin:"0 14px"}}/>
      <div style={{padding:"10px 14px",display:"flex",alignItems:"center",gap:10}}>
        <Avatar username={seller} size={24}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:11,color:TX2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:4}}>
            @{seller}
            {l.seller_stats?.is_verified && <span style={{fontSize:8,color:GREEN}}>✓</span>}
          </div>
          <div style={{fontSize:9,color:TX3,display:"flex",alignItems:"center",gap:5}}>
            {l.seller_stats?.rating_count > 0 ? (
              <span>⭐ {l.seller_stats.avg_rating?.toFixed(1)} ({l.seller_stats.rating_count})</span>
            ) : <span>{ago(l.created_at)}</span>}
          </div>
        </div>
        <div style={{textAlign:"right",flexShrink:0}}>
          {l.price?<div style={{fontSize:17,fontFamily:"var(--font-mono)",fontWeight:300,color:isDeal?G:TX1,letterSpacing:"-.04em",lineHeight:1}}>{l.price.toLocaleString("de-DE",{minimumFractionDigits:2})} €</div>:<div style={{fontSize:13,color:TX3,fontStyle:"italic"}}>VB</div>}
        </div>
      </div>
      {l.note&&<div style={{padding:"0 14px 8px",fontSize:11,color:TX3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",borderTop:`0.5px solid ${BR1}`,paddingTop:8}}>"{l.note}"</div>}
      <div style={{padding:"0 12px 12px"}}>
        {l.type==="offer"?
          <button onClick={()=>onOffer(l)} style={{width:"100%",padding:"9px",borderRadius:10,background:hov?G:G10,color:hov?"#0a0808":G,border:`0.5px solid ${hov?G:G18}`,fontSize:12,cursor:"pointer",transition:"all .2s"}}>Angebot machen</button>
          :<Link href={`/preischeck/${card?.id}`} style={{display:"block",textAlign:"center",padding:"9px",borderRadius:10,background:"rgba(96,165,250,0.06)",color:"#60A5FA",border:"0.5px solid rgba(96,165,250,0.15)",fontSize:12,textDecoration:"none"}}>Ich habe diese Karte →</Link>
        }
      </div>
    </div>
  );
}

function OfferModal({listing,onClose}:{listing:any;onClose:()=>void}){
  const [price,   setPrice]   = useState(listing.price?.toString()??"");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [step,    setStep]    = useState<"form"|"processing"|"done">("form");
  const card = listing.cards;

  const escrowFee = price ? Math.round(parseFloat(price)*0.01*100)/100 : 0;
  const total     = price ? Math.round((parseFloat(price)+escrowFee)*100)/100 : 0;

  async function checkout() {
    if (!price || parseFloat(price) <= 0) return;
    setLoading(true); setError("");
    const sb = createClient();
    const {data:{session}} = await sb.auth.getSession();
    if (!session) { setError("Bitte zuerst anmelden."); setLoading(false); return; }
    const h: Record<string,string> = {"Content-Type":"application/json","Authorization":`Bearer ${session.access_token}`};
    const res = await fetch("/api/marketplace/escrow/create", {
      method:"POST", headers:h,
      body: JSON.stringify({ listing_id: listing.id, offered_price: parseFloat(price) }),
    });
    const data = await res.json();
    if (!res.ok) {
      // Seller not verified → redirect to settings
      if (data.error?.includes("nicht verifiziert")) {
        setError("Verkäufer noch nicht für Zahlungen verifiziert. Bitte later versuchen.");
      } else {
        setError(data.error ?? "Fehler beim Erstellen des Kaufs.");
      }
      setLoading(false); return;
    }
    setStep("processing");
    // Stripe Payment — open checkout in new tab or redirect
    if (data.client_secret) {
      // Redirect to escrow page to complete payment
      window.location.href = `/marketplace/escrow/${data.escrow_id}?pay=1`;
    } else {
      setStep("done");
    }
  }

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20,backdropFilter:"blur(8px)"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:BG1,border:`0.5px solid ${BR3}`,borderRadius:22,padding:26,width:"100%",maxWidth:440,position:"relative"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:0.5,background:`linear-gradient(90deg,transparent,${G},transparent)`,borderRadius:"22px 22px 0 0"}}/>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
          {card?.image_url&&<img src={card.image_url} alt="" style={{width:44,height:60,objectFit:"contain",borderRadius:6}}/>}
          <div style={{flex:1}}>
            <div style={{fontSize:9,color:TX3,textTransform:"uppercase",letterSpacing:".08em",marginBottom:4}}>Jetzt kaufen</div>
            <div style={{fontSize:15,fontWeight:400,color:TX1,lineHeight:1.2}}>{card?.name_de||card?.name}</div>
            <div style={{fontSize:11,color:TX3,marginTop:2}}>{card?.set_id?.toUpperCase()} · {listing.condition}</div>
          </div>
          <button onClick={onClose} style={{background:"transparent",border:"none",color:TX3,fontSize:18,cursor:"pointer",padding:4}}>×</button>
        </div>

        {step==="done" ? (
          <div style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{fontSize:28,marginBottom:12}}>✦</div>
            <div style={{fontSize:15,color:TX1,marginBottom:8}}>Kauf eingeleitet</div>
            <div style={{fontSize:12,color:TX3,marginBottom:20}}>Du wirst zur sicheren Zahlung weitergeleitet.</div>
            <button onClick={onClose} style={{padding:"10px 24px",borderRadius:10,background:G,color:"#0a0808",border:"none",cursor:"pointer",fontSize:13}}>Schließen</button>
          </div>
        ) : step==="processing" ? (
          <div style={{textAlign:"center",padding:"24px 0"}}>
            <div style={{width:32,height:32,border:`2px solid rgba(212,168,67,0.2)`,borderTop:`2px solid ${G}`,borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 12px"}}/>
            <div style={{fontSize:13,color:TX2}}>Wird verarbeitet…</div>
          </div>
        ) : (
          <>
            {/* Price */}
            <div style={{marginBottom:12}}>
              <div style={{fontSize:10,color:TX3,textTransform:"uppercase",letterSpacing:".08em",marginBottom:6}}>Kaufpreis</div>
              <div style={{position:"relative"}}>
                <input type="number" value={price} onChange={e=>setPrice(e.target.value)}
                  placeholder={listing.price?.toString()??"0.00"} min="0" step="0.50"
                  style={{width:"100%",padding:"11px 40px 11px 14px",borderRadius:11,background:"rgba(0,0,0,0.3)",border:`0.5px solid ${BR2}`,color:TX1,fontSize:16,fontFamily:"var(--font-mono)",outline:"none"}}/>
                <span style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",fontSize:13,color:TX3}}>€</span>
              </div>
              {card?.price_market&&<div style={{fontSize:10,color:TX3,marginTop:4}}>Marktwert: {card.price_market.toLocaleString("de-DE",{minimumFractionDigits:2})} €</div>}
            </div>

            {/* Fee breakdown */}
            {price && parseFloat(price) > 0 && (
              <div style={{background:BG2,borderRadius:10,padding:"12px 14px",marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:TX3,marginBottom:6}}>
                  <span>Kaufpreis</span><span style={{fontFamily:"var(--font-mono)"}}>{parseFloat(price).toLocaleString("de-DE",{minimumFractionDigits:2})} €</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:TX3,marginBottom:6}}>
                  <span>Escrow-Gebühr (1%)</span><span style={{fontFamily:"var(--font-mono)"}}>+{escrowFee.toLocaleString("de-DE",{minimumFractionDigits:2})} €</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:TX1,fontWeight:500,borderTop:`0.5px solid ${BR1}`,paddingTop:8,marginTop:4}}>
                  <span>Gesamt</span><span style={{fontFamily:"var(--font-mono)",color:G}}>{total.toLocaleString("de-DE",{minimumFractionDigits:2})} €</span>
                </div>
              </div>
            )}

            {/* Escrow notice */}
            <div style={{padding:"9px 12px",borderRadius:10,marginBottom:12,background:"rgba(61,184,122,0.06)",border:"0.5px solid rgba(61,184,122,0.15)",fontSize:11,color:"#7dd3b0",lineHeight:1.6}}>
              ✦ Sicher via pokédax Escrow — Geld wird erst freigegeben wenn du den Erhalt bestätigst.
            </div>

            {error&&<div style={{fontSize:12,color:RED,marginBottom:10,padding:"8px 12px",borderRadius:8,background:"rgba(220,74,90,0.08)"}}>{error}</div>}

            <div style={{display:"flex",gap:8}}>
              <button onClick={checkout} disabled={loading||!price||parseFloat(price)<=0} style={{
                flex:1,padding:"12px",borderRadius:11,
                background:price&&parseFloat(price)>0?G:"rgba(255,255,255,0.04)",
                color:price&&parseFloat(price)>0?"#0a0808":TX3,
                border:"none",cursor:price&&parseFloat(price)>0?"pointer":"not-allowed",
                fontSize:13,fontWeight:400,
              }}>{loading?"Weiterleitung…":"Sicher kaufen ✦"}</button>
              <Link href={`/profil/${listing.profiles?.username??""}`} style={{padding:"12px 14px",borderRadius:11,background:"transparent",color:TX2,border:`0.5px solid ${BR2}`,fontSize:13,textDecoration:"none",display:"flex",alignItems:"center"}}>Profil</Link>
            </div>
          </>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function CreateListingModal({onClose,onCreated}:{onClose:()=>void;onCreated:()=>void}){
  const [fSearch,setFSearch]=useState("");const [fResults,setFResults]=useState<any[]>([]);
  const [fCard,setFCard]=useState<any>(null);const [fType,setFType]=useState<"offer"|"want">("offer");
  const [fPrice,setFPrice]=useState("");const [fCond,setFCond]=useState("NM");
  const [fNote,setFNote]=useState("");const [fLoading,setFLoading]=useState(false);const [fMsg,setFMsg]=useState("");

  async function searchCards(q:string){setFSearch(q);if(q.length<2){setFResults([]);return;}
    const r=await fetch(`/api/cards/search?q=${encodeURIComponent(q)}&limit=5`);const d=await r.json();setFResults(d.cards??[]);}

  async function submit(){
    if(!fCard){setFMsg("Bitte eine Karte wählen.");return;}
    setFLoading(true);
    const sb=createClient();const{data:{session}}=await sb.auth.getSession();
    const h:Record<string,string>={"Content-Type":"application/json"};
    if(session?.access_token) h["Authorization"]=`Bearer ${session.access_token}`;
    const res=await fetch("/api/marketplace",{method:"POST",headers:h,body:JSON.stringify({card_id:fCard.id,type:fType,price:parseFloat(fPrice)||null,condition:fCond,note:fNote})});
    const data=await res.json();
    if(!res.ok){setFMsg(data.error??"Fehler.");}
    else{setFMsg("✓ Inserat erstellt!");setTimeout(()=>{onClose();onCreated();},800);}
    setFLoading(false);
  }

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20,backdropFilter:"blur(8px)"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:BG1,border:`0.5px solid ${BR3}`,borderRadius:22,padding:24,width:"100%",maxWidth:480,position:"relative"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:0.5,background:`linear-gradient(90deg,transparent,${G},transparent)`,borderRadius:"22px 22px 0 0"}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <div style={{fontSize:14,fontWeight:400,color:TX1}}>Neue Karte inserieren</div>
          <button onClick={onClose} style={{background:"transparent",border:"none",color:TX3,fontSize:18,cursor:"pointer"}}>×</button>
        </div>
        <div style={{display:"flex",gap:6,marginBottom:14}}>
          {([["offer","Ich biete an"],["want","Ich suche"]] as const).map(([t,l])=>(
            <button key={t} onClick={()=>setFType(t)} style={{flex:1,padding:"8px",borderRadius:9,fontSize:12,border:"none",cursor:"pointer",background:fType===t?(t==="offer"?G:G10):"transparent",color:fType===t?(t==="offer"?"#0a0808":G):TX3,outline:`0.5px solid ${fType===t?G:BR2}`,transition:"all .15s"}}>{l}</button>
          ))}
        </div>
        <div style={{marginBottom:12}}>
          {fCard?(
            <div style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:BG2,borderRadius:9,border:`0.5px solid ${G18}`}}>
              {fCard.image_url&&<img src={fCard.image_url} alt="" style={{width:22,height:30,objectFit:"contain"}}/>}
              <div style={{flex:1}}><div style={{fontSize:13,color:TX1}}>{fCard.name_de||fCard.name}</div><div style={{fontSize:10,color:TX3}}>{fCard.set_id?.toUpperCase()}</div></div>
              <div style={{fontSize:13,fontFamily:"var(--font-mono)",color:G}}>{fCard.price_market?.toFixed(2)} €</div>
              <button onClick={()=>setFCard(null)} style={{background:"transparent",border:"none",color:TX3,cursor:"pointer",fontSize:16}}>×</button>
            </div>
          ):(
            <div>
              <input value={fSearch} onChange={e=>searchCards(e.target.value)} placeholder="Kartenname suchen…"
                style={{width:"100%",padding:"9px 12px",borderRadius:9,background:"rgba(0,0,0,0.3)",border:`0.5px solid ${BR2}`,color:TX1,fontSize:13,outline:"none"}}/>
              {fResults.length>0&&<div style={{marginTop:4,display:"flex",flexDirection:"column",gap:3}}>
                {fResults.map((c:any)=>(
                  <div key={c.id} onClick={()=>{setFCard(c);setFResults([]);}} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:BG2,borderRadius:7,border:`0.5px solid ${BR1}`,cursor:"pointer"}}>
                    {c.image_url&&<img src={c.image_url} alt="" style={{width:18,height:25,objectFit:"contain"}}/>}
                    <div style={{flex:1,fontSize:12,color:TX1}}>{c.name_de||c.name}</div>
                    <div style={{fontSize:11,fontFamily:"var(--font-mono)",color:G}}>{c.price_market?.toFixed(2)} €</div>
                  </div>
                ))}
              </div>}
            </div>
          )}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
          <div>
            <div style={{fontSize:10,color:TX3,textTransform:"uppercase",letterSpacing:".06em",marginBottom:5}}>Preis (€)</div>
            <input value={fPrice} onChange={e=>setFPrice(e.target.value)} type="number" placeholder={fCard?.price_market?.toFixed(2)??"0.00"} min="0" step="0.50"
              style={{width:"100%",padding:"9px 12px",borderRadius:8,background:"rgba(0,0,0,0.3)",border:`0.5px solid ${BR2}`,color:TX1,fontSize:13,outline:"none"}}/>
          </div>
          <div>
            <div style={{fontSize:10,color:TX3,textTransform:"uppercase",letterSpacing:".06em",marginBottom:5}}>Zustand</div>
            <select value={fCond} onChange={e=>setFCond(e.target.value)} style={{width:"100%",padding:"9px 12px",borderRadius:8,background:BG1,border:`0.5px solid ${BR2}`,color:TX1,fontSize:12,outline:"none"}}>
              {["NM","LP","MP","HP","D"].map(c=><option key={c} value={c}>{c} — {COND[c]?.label}</option>)}
            </select>
          </div>
        </div>
        <input value={fNote} onChange={e=>setFNote(e.target.value)} placeholder="Notiz: Versand, Tausch, Grading…"
          style={{width:"100%",padding:"9px 12px",borderRadius:8,background:"rgba(0,0,0,0.3)",border:`0.5px solid ${BR2}`,color:TX1,fontSize:12,outline:"none",marginBottom:10}}/>
        {fMsg&&<div style={{fontSize:12,color:fMsg.startsWith("✓")?GREEN:RED,marginBottom:10}}>{fMsg}</div>}
        <div style={{display:"flex",gap:8}}>
          <button onClick={submit} disabled={fLoading||!fCard} style={{flex:1,padding:"11px",borderRadius:10,background:fCard?G:"rgba(255,255,255,0.04)",color:fCard?"#0a0808":TX3,border:"none",cursor:fCard?"pointer":"not-allowed",fontSize:13}}>
            {fLoading?"Speichert…":"Veröffentlichen"}
          </button>
          <button onClick={onClose} style={{padding:"11px 16px",borderRadius:10,background:"transparent",color:TX2,fontSize:13,border:`0.5px solid ${BR1}`,cursor:"pointer"}}>Abbrechen</button>
        </div>
      </div>
    </div>
  );
}

export default function MarketplacePage(){
  const [listings, setListings] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState<"offer"|"want"|"all">("offer");
  const [sort,     setSort]     = useState("newest");
  const [search,   setSearch]   = useState("");
  const [condFilter,setCondFilter]=useState("");
  const [offerModal,setOfferModal]=useState<any>(null);
  const [showCreate,setShowCreate]=useState(false);

  useEffect(()=>{loadListings();},[]);

  async function loadListings(){
    setLoading(true);
    const sb=createClient();
    const{data}=await sb.from("marketplace_listings")
      .select(`id,type,price,condition,note,created_at,user_id,is_active,
        profiles!marketplace_listings_user_id_fkey(username,avatar_url),
        cards!marketplace_listings_card_id_fkey(id,name,name_de,set_id,number,price_market,price_avg7,image_url,rarity,types),
        seller_stats!marketplace_listings_seller_id_fkey(avg_rating,rating_count,is_verified)`)
      .eq("is_active",true).order("created_at",{ascending:false}).limit(60);
    const normalized=(data??[]).map((l:any)=>({...l,
      profiles:Array.isArray(l.profiles)?l.profiles[0]:l.profiles,
      cards:Array.isArray(l.cards)?l.cards[0]:l.cards,
      seller_stats:Array.isArray(l.seller_stats)?l.seller_stats[0]:l.seller_stats,
    }));
    setListings(normalized);
    setLoading(false);
  }

  let filtered=listings.filter(l=>{
    if(tab!=="all"&&l.type!==tab) return false;
    if(search&&!(l.cards?.name_de??l.cards?.name??"").toLowerCase().includes(search.toLowerCase())&&!(l.profiles?.username??"").toLowerCase().includes(search.toLowerCase())) return false;
    if(condFilter&&l.condition!==condFilter) return false;
    return true;
  });
  if(sort==="price_asc") filtered=[...filtered].sort((a,b)=>(a.price??999)-(b.price??999));
  if(sort==="price_desc") filtered=[...filtered].sort((a,b)=>(b.price??0)-(a.price??0));
  if(sort==="deal") filtered=[...filtered].sort((a,b)=>{const da=a.price&&a.cards?.price_market?a.price/a.cards.price_market:1;const db=b.price&&b.cards?.price_market?b.price/b.cards.price_market:1;return da-db;});

  const dealCount=listings.filter(l=>l.type==="offer"&&l.price&&l.cards?.price_market&&l.price<l.cards.price_market*0.95).length;

  return (
    <div style={{color:TX1,minHeight:"80vh"}}>
      <div style={{maxWidth:1200,margin:"0 auto",padding:"clamp(52px,7vw,80px) clamp(16px,3vw,28px)"}}>
        <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",flexWrap:"wrap",gap:16,marginBottom:"clamp(28px,4vw,44px)"}}>
          <div>
            <div style={{fontSize:9,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:TX3,marginBottom:12,display:"flex",alignItems:"center",gap:8}}><span style={{width:16,height:0.5,background:TX3,display:"inline-block"}}/>Marktplatz</div>
            <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(26px,4.5vw,48px)",fontWeight:200,letterSpacing:"-.055em",marginBottom:6,lineHeight:1.05}}>Kaufen &<br/><span style={{color:G}}>verkaufen.</span></h1>
            <div style={{display:"flex",gap:14,marginTop:10,flexWrap:"wrap"}}>
              <span style={{fontSize:12,color:TX3}}>{listings.filter(l=>l.type==="offer").length} Angebote</span>
              <span style={{fontSize:12,color:TX3}}>{listings.filter(l=>l.type==="want").length} Gesuche</span>
              {dealCount>0&&<span style={{fontSize:12,color:G}}>✦ {dealCount} Deals unter Marktwert</span>}
            </div>
          </div>
          <button onClick={()=>setShowCreate(true)} style={{padding:"10px 20px",borderRadius:12,background:G,color:"#0a0808",fontSize:13,fontWeight:400,border:"none",cursor:"pointer",boxShadow:`0 2px 16px ${G25}`,flexShrink:0}}>+ Inserat</button>
        </div>

        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14,alignItems:"center"}}>
          <div style={{display:"flex",gap:2,background:BG1,borderRadius:11,padding:3,border:`0.5px solid ${BR2}`}}>
            {([["offer","Kaufangebote"],["want","Gesuche"],["all","Alle"]] as const).map(([t,l])=>(
              <button key={t} onClick={()=>setTab(t)} style={{padding:"6px 16px",borderRadius:8,fontSize:12,border:"none",cursor:"pointer",background:tab===t?BG2:"transparent",color:tab===t?TX1:TX3,transition:"all .15s"}}>{l}</button>
            ))}
          </div>
          <select value={sort} onChange={e=>setSort(e.target.value)} style={{padding:"7px 12px",borderRadius:9,background:BG1,border:`0.5px solid ${BR2}`,color:TX2,fontSize:12,outline:"none"}}>
            <option value="newest">Neueste zuerst</option>
            <option value="price_asc">Preis aufsteigend</option>
            <option value="price_desc">Preis absteigend</option>
            <option value="deal">Beste Deals</option>
          </select>
          <select value={condFilter} onChange={e=>setCondFilter(e.target.value)} style={{padding:"7px 12px",borderRadius:9,background:BG1,border:`0.5px solid ${BR2}`,color:TX2,fontSize:12,outline:"none"}}>
            <option value="">Alle Zustände</option>
            {["NM","LP","MP","HP","D"].map(c=><option key={c} value={c}>{c} · {COND[c]?.label}</option>)}
          </select>
          <div style={{position:"relative",flex:1,minWidth:160,maxWidth:280}}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Karte oder Verkäufer…"
              style={{width:"100%",padding:"7px 8px 7px 28px",borderRadius:9,background:BG1,border:`0.5px solid ${BR2}`,color:TX1,fontSize:12,outline:"none"}}/>
          </div>
        </div>

        {loading?(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:12}}>
            {Array.from({length:8}).map((_,i)=><div key={i} style={{height:240,background:BG1,border:`0.5px solid ${BR1}`,borderRadius:18,opacity:.3,animation:"pulse 1.5s ease-in-out infinite"}}/>)}
          </div>
        ):filtered.length===0?(
          <div style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:20,padding:"60px",textAlign:"center"}}>
            <div style={{fontSize:32,marginBottom:16,opacity:.2}}>◈</div>
            <div style={{fontSize:14,color:TX3,marginBottom:20}}>Keine Einträge gefunden.</div>
            <button onClick={()=>setTab("all")} style={{fontSize:13,color:G,background:"transparent",border:"none",cursor:"pointer"}}>Alle anzeigen →</button>
          </div>
        ):(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:12}}>
            {filtered.map(l=><ListingCard key={l.id} l={l} onOffer={setOfferModal}/>)}
          </div>
        )}
      </div>
      {offerModal&&<OfferModal listing={offerModal} onClose={()=>setOfferModal(null)}/>}
      {showCreate&&<CreateListingModal onClose={()=>setShowCreate(false)} onCreated={loadListings}/>}
      <style>{`@keyframes pulse{0%,100%{opacity:.3}50%{opacity:.5}}`}</style>
    </div>
  );
}

'@
[System.IO.File]::WriteAllText("$root\src\app\marketplace\page.tsx", $marketplace, $enc)
Write-Host "  OK  page.tsx" -ForegroundColor Green

$escrowPage = @'
"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const G="#D4A843",G18="rgba(212,168,67,0.18)",G08="rgba(212,168,67,0.08)";
const BG1="#111114",BG2="#18181c",BR1="rgba(255,255,255,0.045)",BR2="rgba(255,255,255,0.085)";
const TX1="#ededf2",TX2="#a4a4b4",TX3="#62626f",GREEN="#3db87a",RED="#dc4a5a",AMBER="#f59e0b";

const STATUS_META: Record<string,{label:string;color:string;desc:string}> = {
  pending:  {label:"Zahlung ausstehend", color:AMBER, desc:"Warte auf Zahlungseingang"},
  paid:     {label:"Bezahlt",            color:GREEN, desc:"Zahlung eingegangen · Seller kann versenden"},
  shipped:  {label:"Versendet",          color:"#60A5FA", desc:"Paket unterwegs · Bitte Erhalt bestätigen"},
  received: {label:"Erhalten",           color:GREEN, desc:"Käufer hat Erhalt bestätigt"},
  released: {label:"Abgeschlossen",      color:GREEN, desc:"Geld wurde an Seller überwiesen"},
  disputed: {label:"Streitfall",         color:RED,   desc:"Admin wird sich melden"},
};

function Step({n,label,active,done}:{n:number;label:string;active:boolean;done:boolean}) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      <div style={{
        width:28,height:28,borderRadius:"50%",flexShrink:0,
        background:done?GREEN:active?G:"rgba(255,255,255,0.04)",
        border:`0.5px solid ${done?GREEN:active?G:BR2}`,
        display:"flex",alignItems:"center",justifyContent:"center",
        fontSize:11,fontWeight:500,
        color:done||active?"#0a0808":TX3,
        transition:"all .3s",
      }}>{done?"✓":n}</div>
      <span style={{fontSize:13,color:done||active?TX1:TX3,transition:"color .3s"}}>{label}</span>
    </div>
  );
}

export default function EscrowPage() {
  const { id } = useParams() as { id: string };
  const [escrow,  setEscrow]  = useState<any>(null);
  const [user,    setUser]    = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [action,  setAction]  = useState(false);
  const [tracking,setTracking]= useState("");
  const [dispute, setDispute] = useState("");
  const [showDisp,setShowDisp]= useState(false);
  const [review,  setReview]  = useState<{rating:number;comment:string}|null>(null);
  const [rated,   setRated]   = useState(false);
  const [msg,     setMsg]     = useState("");

  useEffect(()=>{
    const sb = createClient();
    sb.auth.getSession().then(({data:{session}})=>{
      setUser(session?.user ?? null);
      if (!session?.user) return;
      load(sb, id);
    });
  },[id]);

  async function load(sb: any, escrow_id: string) {
    const { data } = await sb
      .from("escrow_transactions")
      .select(`
        *,
        buyer:profiles!escrow_transactions_buyer_id_fkey(username,avatar_url),
        seller:profiles!escrow_transactions_seller_id_fkey(username,avatar_url),
        marketplace_listings(price,condition,
          cards!marketplace_listings_card_id_fkey(id,name,name_de,set_id,number,image_url))
      `)
      .eq("id", escrow_id)
      .single();
    if (data) {
      setEscrow({
        ...data,
        buyer:  Array.isArray(data.buyer)  ? data.buyer[0]  : data.buyer,
        seller: Array.isArray(data.seller) ? data.seller[0] : data.seller,
      });
    }
    setLoading(false);
  }

  async function doAction(act: string) {
    setAction(true);
    setMsg("");
    const sb = createClient();
    const {data:{session}} = await sb.auth.getSession();
    const h: Record<string,string> = {"Content-Type":"application/json"};
    if (session?.access_token) h["Authorization"]=`Bearer ${session.access_token}`;
    const res = await fetch("/api/marketplace/escrow/update", {
      method:"POST", headers:h,
      body: JSON.stringify({
        escrow_id: id, action: act,
        tracking_number: act==="ship"?tracking:undefined,
        dispute_reason:  act==="dispute"?dispute:undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) { setMsg(data.error ?? "Fehler."); }
    else {
      setEscrow((prev: any) => ({...prev, status: data.status}));
      setMsg(act==="confirm"?"✓ Erhalt bestätigt — Zahlung freigegeben!":
             act==="ship"?"✓ Versand eingetragen!":
             "Streitfall gemeldet. Wir melden uns.");
    }
    setAction(false);
  }

  async function submitReview() {
    if (!review || review.rating < 1) return;
    const sb = createClient();
    const {data:{session}} = await sb.auth.getSession();
    const h: Record<string,string> = {"Content-Type":"application/json"};
    if (session?.access_token) h["Authorization"]=`Bearer ${session.access_token}`;
    const res = await fetch("/api/marketplace/reviews", {
      method:"POST", headers:h,
      body: JSON.stringify({escrow_id: id, ...review}),
    });
    if (res.ok) setRated(true);
    else setMsg("Bewertung konnte nicht gespeichert werden.");
  }

  if (loading) return (
    <div style={{color:TX1,minHeight:"80vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{fontSize:13,color:TX3}}>Lädt…</div>
    </div>
  );
  if (!escrow) return (
    <div style={{color:TX1,minHeight:"80vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:14,color:TX3,marginBottom:12}}>Transaktion nicht gefunden.</div>
        <Link href="/dashboard" style={{color:G,textDecoration:"none",fontSize:13}}>← Dashboard</Link>
      </div>
    </div>
  );

  const isBuyer  = user?.id === escrow.buyer_id;
  const isSeller = user?.id === escrow.seller_id;
  const meta     = STATUS_META[escrow.status] ?? STATUS_META.pending;
  const card     = escrow.marketplace_listings?.cards;
  const steps    = ["pending","paid","shipped","released"];
  const stepIdx  = steps.indexOf(escrow.status);

  return (
    <div style={{color:TX1,minHeight:"80vh"}}>
      <div style={{maxWidth:720,margin:"0 auto",padding:"clamp(52px,7vw,80px) clamp(16px,3vw,28px)"}}>

        <Link href="/dashboard" style={{fontSize:12,color:TX3,textDecoration:"none",display:"inline-flex",alignItems:"center",gap:6,marginBottom:28}}>← Dashboard</Link>

        {/* Header */}
        <div style={{marginBottom:28}}>
          <div style={{fontSize:9,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:TX3,marginBottom:12}}>Transaktion · {id.slice(0,8).toUpperCase()}</div>
          <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(22px,4vw,38px)",fontWeight:200,letterSpacing:"-.04em",marginBottom:8}}>
            Escrow-Status
          </h1>
          <div style={{display:"inline-flex",alignItems:"center",gap:6,padding:"4px 12px",borderRadius:8,background:`${meta.color}12`,border:`0.5px solid ${meta.color}25`}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:meta.color}}/>
            <span style={{fontSize:12,fontWeight:500,color:meta.color}}>{meta.label}</span>
          </div>
        </div>

        {/* Card info */}
        {card && (
          <div style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:16,padding:"14px 16px",marginBottom:14,display:"flex",gap:12,alignItems:"center"}}>
            <div style={{width:44,height:60,borderRadius:7,background:BG2,overflow:"hidden",flexShrink:0}}>
              {card.image_url&&<img src={card.image_url} alt="" style={{width:"100%",height:"100%",objectFit:"contain"}}/>}
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:14,color:TX1,marginBottom:3}}>{card.name_de||card.name}</div>
              <div style={{fontSize:11,color:TX3}}>{card.set_id?.toUpperCase()} · {escrow.marketplace_listings?.condition}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:11,color:TX3,marginBottom:2}}>Kaufpreis</div>
              <div style={{fontSize:18,fontFamily:"var(--font-mono)",fontWeight:300,color:G}}>
                {escrow.gross_amount?.toLocaleString("de-DE",{minimumFractionDigits:2})} €
              </div>
            </div>
          </div>
        )}

        {/* Steps */}
        <div style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:16,padding:"18px",marginBottom:14}}>
          <div style={{fontSize:10,fontWeight:600,letterSpacing:".08em",textTransform:"uppercase",color:TX3,marginBottom:14}}>Ablauf</div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <Step n={1} label="Zahlung eingegangen"   done={stepIdx>=1} active={stepIdx===0}/>
            <Step n={2} label="Karte versendet"       done={stepIdx>=2} active={stepIdx===1}/>
            <Step n={3} label="Erhalt bestätigt"      done={stepIdx>=3} active={stepIdx===2}/>
            <Step n={4} label="Auszahlung erfolgt"    done={stepIdx>=3} active={false}/>
          </div>
          {escrow.tracking_number && (
            <div style={{marginTop:12,padding:"8px 12px",borderRadius:8,background:BG2,fontSize:11,color:TX3}}>
              Tracking: <span style={{color:TX1,fontFamily:"var(--font-mono)"}}>{escrow.tracking_number}</span>
            </div>
          )}
          {escrow.auto_release_at && escrow.status==="shipped" && (
            <div style={{marginTop:8,fontSize:11,color:TX3}}>
              Auto-Freigabe: {new Date(escrow.auto_release_at).toLocaleDateString("de-DE")}
            </div>
          )}
        </div>

        {/* Fee breakdown */}
        <div style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:16,overflow:"hidden",marginBottom:14}}>
          <div style={{padding:"11px 16px",borderBottom:`0.5px solid ${BR1}`,fontSize:10,fontWeight:600,letterSpacing:".08em",textTransform:"uppercase",color:TX3}}>Gebühren</div>
          {[
            {l:"Kaufpreis",          v:`${escrow.marketplace_listings?.price?.toLocaleString("de-DE",{minimumFractionDigits:2})} €`},
            {l:"Escrow-Gebühr (1%)", v:`${escrow.escrow_fee?.toLocaleString("de-DE",{minimumFractionDigits:2})} €`},
            {l:"Käufer zahlt",       v:`${escrow.gross_amount?.toLocaleString("de-DE",{minimumFractionDigits:2})} €`, bold:true},
            {l:"Plattform-Provision",v:`${escrow.platform_fee?.toLocaleString("de-DE",{minimumFractionDigits:2})} €`},
            {l:"Seller erhält",      v:`${escrow.seller_payout?.toLocaleString("de-DE",{minimumFractionDigits:2})} €`, bold:true, gold:true},
          ].map(({l,v,bold,gold})=>(
            <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"10px 16px",borderBottom:`0.5px solid ${BR1}`}}>
              <span style={{fontSize:12,color:TX3}}>{l}</span>
              <span style={{fontSize:12,fontFamily:"var(--font-mono)",fontWeight:bold?500:300,color:gold?G:TX1}}>{v}</span>
            </div>
          ))}
        </div>

        {/* Parties */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          {[
            {label:"Käufer", profile:escrow.buyer,  isMe:isBuyer},
            {label:"Seller", profile:escrow.seller, isMe:isSeller},
          ].map(({label,profile,isMe})=>(
            <div key={label} style={{background:BG1,border:`0.5px solid ${isMe?G18:BR2}`,borderRadius:12,padding:"12px 14px"}}>
              <div style={{fontSize:9,color:TX3,marginBottom:6,textTransform:"uppercase",letterSpacing:".06em"}}>{label}{isMe?" (Du)":""}</div>
              <div style={{fontSize:13,color:TX1}}>@{profile?.username??"-"}</div>
            </div>
          ))}
        </div>

        {/* Actions */}
        {msg && (
          <div style={{padding:"10px 14px",borderRadius:10,marginBottom:12,
            background:msg.startsWith("✓")?"rgba(61,184,122,0.08)":"rgba(220,74,90,0.08)",
            border:`0.5px solid ${msg.startsWith("✓")?"rgba(61,184,122,0.2)":"rgba(220,74,90,0.2)"}`,
            fontSize:12,color:msg.startsWith("✓")?GREEN:RED}}>
            {msg}
          </div>
        )}

        {/* Seller: ship */}
        {isSeller && escrow.status==="paid" && (
          <div style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:16,padding:"16px",marginBottom:10}}>
            <div style={{fontSize:12,fontWeight:500,color:TX1,marginBottom:10}}>Versand eintragen</div>
            <input value={tracking} onChange={e=>setTracking(e.target.value)}
              placeholder="Tracking-Nummer (optional)"
              style={{width:"100%",padding:"9px 12px",borderRadius:9,background:"rgba(0,0,0,0.3)",
                border:`0.5px solid ${BR2}`,color:TX1,fontSize:12,outline:"none",marginBottom:10}}/>
            <button onClick={()=>doAction("ship")} disabled={action} style={{
              width:"100%",padding:"11px",borderRadius:10,background:G,color:"#0a0808",
              border:"none",cursor:"pointer",fontSize:13,fontWeight:400,
            }}>{action?"Speichert…":"Versand bestätigen ✓"}</button>
          </div>
        )}

        {/* Buyer: confirm */}
        {isBuyer && escrow.status==="shipped" && (
          <div style={{background:BG1,border:`0.5px solid ${G18}`,borderRadius:16,padding:"16px",marginBottom:10,position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:0.5,background:`linear-gradient(90deg,transparent,${G},transparent)`}}/>
            <div style={{fontSize:12,fontWeight:500,color:TX1,marginBottom:6}}>Karte erhalten?</div>
            <div style={{fontSize:11,color:TX3,marginBottom:12}}>Nach Bestätigung wird die Zahlung sofort an den Seller freigegeben.</div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>doAction("confirm")} disabled={action} style={{
                flex:1,padding:"11px",borderRadius:10,background:G,color:"#0a0808",
                border:"none",cursor:"pointer",fontSize:13,fontWeight:400,
              }}>{action?"Lädt…":"Erhalt bestätigen → Zahlung freigeben"}</button>
              <button onClick={()=>setShowDisp(v=>!v)} style={{
                padding:"11px 14px",borderRadius:10,background:"transparent",
                color:RED,border:`0.5px solid rgba(220,74,90,0.2)`,cursor:"pointer",fontSize:12,
              }}>Problem</button>
            </div>
            {showDisp && (
              <div style={{marginTop:10}}>
                <textarea value={dispute} onChange={e=>setDispute(e.target.value)}
                  placeholder="Was ist das Problem?" rows={3}
                  style={{width:"100%",padding:"9px 12px",borderRadius:9,background:"rgba(0,0,0,0.3)",
                    border:`0.5px solid rgba(220,74,90,0.2)`,color:TX1,fontSize:12,outline:"none",resize:"none",marginBottom:8}}/>
                <button onClick={()=>doAction("dispute")} disabled={action||!dispute} style={{
                  width:"100%",padding:"9px",borderRadius:9,background:"rgba(220,74,90,0.1)",
                  color:RED,border:`0.5px solid rgba(220,74,90,0.2)`,cursor:"pointer",fontSize:12,
                }}>Streitfall melden</button>
              </div>
            )}
          </div>
        )}

        {/* Review */}
        {escrow.status==="released" && !rated && (
          <div style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:16,padding:"16px"}}>
            <div style={{fontSize:12,fontWeight:500,color:TX1,marginBottom:12}}>
              {isBuyer?"Seller bewerten":"Käufer bewerten"}
            </div>
            {/* Stars */}
            <div style={{display:"flex",gap:6,marginBottom:12}}>
              {[1,2,3,4,5].map(n=>(
                <button key={n} onClick={()=>setReview(r=>({...(r??{comment:""}),rating:n}))} style={{
                  fontSize:22,background:"transparent",border:"none",cursor:"pointer",
                  color:(review?.rating??0)>=n?G:TX3,transition:"color .15s",padding:0,
                }}>✦</button>
              ))}
            </div>
            <textarea value={review?.comment??""} onChange={e=>setReview(r=>({...(r??{rating:0}),comment:e.target.value}))}
              placeholder="Kommentar (optional)" rows={2}
              style={{width:"100%",padding:"9px 12px",borderRadius:9,background:"rgba(0,0,0,0.3)",
                border:`0.5px solid ${BR2}`,color:TX1,fontSize:12,outline:"none",resize:"none",marginBottom:10}}/>
            <button onClick={submitReview} disabled={!review?.rating} style={{
              width:"100%",padding:"10px",borderRadius:10,
              background:review?.rating?G:"rgba(255,255,255,0.04)",
              color:review?.rating?"#0a0808":TX3,
              border:"none",cursor:review?.rating?"pointer":"default",fontSize:13,
            }}>Bewertung abgeben</button>
          </div>
        )}
        {rated && (
          <div style={{textAlign:"center",padding:"16px",fontSize:13,color:GREEN}}>✦ Bewertung gespeichert. Danke!</div>
        )}
      </div>
    </div>
  );
}

'@
[System.IO.File]::WriteAllText("$root\src\app\marketplace\escrow\[id]\page.tsx", $escrowPage, $enc)
Write-Host "  OK  page.tsx" -ForegroundColor Green

$dashboard = @'
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const G="#D4A843",G18="rgba(212,168,67,0.18)",G10="rgba(212,168,67,0.10)",G05="rgba(212,168,67,0.05)";
const BG1="#111114",BG2="#18181c",BR1="rgba(255,255,255,0.045)",BR2="rgba(255,255,255,0.085)";
const TX1="#ededf2",TX2="#a4a4b4",TX3="#62626f",GREEN="#3db87a",RED="#dc4a5a";

function StatCard({label,value,sub,gold,href}:{label:string;value:string;sub?:string;gold?:boolean;href?:string}) {
  const inner=(
    <div style={{background:BG1,border:`0.5px solid ${gold?G18:BR2}`,borderRadius:14,padding:"16px 18px",position:"relative",overflow:"hidden",transition:"border-color .2s"}}>
      {gold&&<div style={{position:"absolute",top:0,left:0,right:0,height:0.5,background:`linear-gradient(90deg,transparent,${G},transparent)`}}/>}
      <div style={{fontSize:10,fontWeight:500,color:TX3,textTransform:"uppercase",letterSpacing:".08em",marginBottom:10}}>{label}</div>
      <div style={{fontSize:24,fontFamily:"var(--font-mono)",fontWeight:300,letterSpacing:"-.04em",color:gold?G:TX1,lineHeight:1,marginBottom:sub?6:0}}>{value}</div>
      {sub&&<div style={{fontSize:11,color:TX3}}>{sub}</div>}
    </div>
  );
  if(!href) return inner;
  return <Link href={href} style={{textDecoration:"none",display:"block"}}>{inner}</Link>;
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
  const [escrows,   setEscrows]   = useState<any[]>([]);
  const [trades,    setTrades]    = useState<any[]>([]);

  useEffect(()=>{
    async function init(){
      const sb=createClient();
      const{data:{session}}=await sb.auth.getSession();
      if(!session?.user){window.location.href="/auth/login?redirect=/dashboard";return;}
      setUser(session.user);
      const uid=session.user.id;
      await Promise.all([
        // Profile
        sb.from("profiles").select("username,avatar_url,is_premium,created_at").eq("id",uid).single().then(({data})=>setProfile(data)),
        // Portfolio
        sb.from("user_collection").select("quantity,cards!user_collection_card_id_fkey(price_market,price_avg7)").eq("user_id",uid).then(({data})=>{
          const items=data??[];
          const value=items.reduce((s:number,i:any)=>s+(i.cards?.price_market??0)*(i.quantity??1),0);
          const value7=items.reduce((s:number,i:any)=>s+(i.cards?.price_avg7??i.cards?.price_market??0)*(i.quantity??1),0);
          const count=items.reduce((s:number,i:any)=>s+(i.quantity??1),0);
          setPortfolio({value,count,delta7:value7>0?((value-value7)/value7*100):0});
        }),
        // Matches
        sb.from("wishlist_matches").select(`id,created_at,marketplace_listings!wishlist_matches_listing_id_fkey(price,condition,cards!marketplace_listings_card_id_fkey(name,name_de,image_url))`).eq("wishlist_user_id",uid).eq("dismissed",false).order("created_at",{ascending:false}).limit(4).then(({data})=>setMatches(data??[])),
        // Listings
        sb.from("marketplace_listings").select(`id,price,condition,cards!marketplace_listings_card_id_fkey(id,name,name_de,image_url,price_market)`).eq("seller_id",uid).eq("is_active",true).order("created_at",{ascending:false}).limit(4).then(({data})=>setListings(data??[])),
        // Scans
        sb.from("scan_logs").select("id",{count:"exact",head:true}).eq("user_id",uid).gte("created_at",new Date().toISOString().split("T")[0]+"T00:00:00Z").then(({count})=>setScansToday(count??0)),
        sb.from("profiles").select("is_premium").eq("id",uid).single().then(({data})=>setScansMax(data?.is_premium?9999:5)),
        // Fantasy
        (async()=>{
          const season=`${new Date().getFullYear()}-Q${Math.ceil((new Date().getMonth()+1)/3)}`;
          const{data:team}=await sb.from("fantasy_teams").select("id,name").eq("user_id",uid).eq("season",season).single();
          if(team){
            const{data:picks}=await sb.from("fantasy_picks").select("bought_at_price,quantity,cards!fantasy_picks_card_id_fkey(price_market)").eq("team_id",team.id);
            const cur=(picks??[]).reduce((s:number,p:any)=>s+(p.cards?.price_market??0)*(p.quantity??1),0);
            const inv=(picks??[]).reduce((s:number,p:any)=>s+(p.bought_at_price??0)*(p.quantity??1),0);
            setFantasy({name:team.name,picks:(picks??[]).length,pct:inv>0?((cur-inv)/inv*100):0,current:cur});
          }
        })(),
      ]);
      setLoading(false);
    }
    init();
  },[]);

  const username=profile?.username??user?.email?.split("@")[0]??"—";
  const initial=username[0]?.toUpperCase()??"?";
  const hour=new Date().getHours();
  const greeting=hour<12?"Guten Morgen":hour<17?"Guten Tag":"Guten Abend";

  async function loadEscrows(sb:any, uid:string) {
    const {data} = await sb.from("escrow_transactions")
      .select("id,status,gross_amount,created_at,seller_id,buyer_id,tracking_number,auto_release_at")
      .or(`buyer_id.eq.${uid},seller_id.eq.${uid}`)
      .not("status","in","(released,refunded)")
      .order("created_at",{ascending:false}).limit(5);
    setEscrows(data??[]);
  }

  if(loading) return <div style={{color:TX1,minHeight:"80vh",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{fontSize:13,color:TX3}}>Lädt Dashboard…</div></div>;

  return (
    <div style={{color:TX1,minHeight:"80vh"}}>
      <div style={{maxWidth:1100,margin:"0 auto",padding:"clamp(52px,7vw,80px) clamp(16px,3vw,28px)"}}>
        <div style={{marginBottom:"clamp(28px,4vw,48px)"}}>
          <div style={{fontSize:9,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:TX3,marginBottom:14,display:"flex",alignItems:"center",gap:8}}><span style={{width:16,height:0.5,background:TX3,display:"inline-block"}}/>{profile?.is_premium?"Premium Dashboard":"Dashboard"}</div>
          <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(26px,4.5vw,48px)",fontWeight:200,letterSpacing:"-.055em",marginBottom:6}}>{greeting}, <span style={{color:G}}>@{username}</span>.</h1>
          <p style={{fontSize:13,color:TX3}}>{new Date().toLocaleDateString("de-DE",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</p>
        </div>

        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:10,marginBottom:20}}>
          <StatCard label="Portfolio-Wert" value={portfolio.value>0?`${Math.round(portfolio.value).toLocaleString("de-DE")} €`:"—"} sub={portfolio.delta7!==0?`${portfolio.delta7>=0?"+":""}${portfolio.delta7.toFixed(1)}% (7 Tage)`:portfolio.count>0?`${portfolio.count} Karten`:"Noch keine Karten"} gold={portfolio.value>0} href="/portfolio"/>
          <StatCard label="Wishlist-Matches" value={matches.length>0?String(matches.length):"0"} sub={matches.length>0?"Neue Treffer":"Keine neuen Matches"} href="/matches"/>
          <StatCard label="Aktive Listings" value={String(listings.length)} sub={listings.length>0?"Karten im Marktplatz":"Noch nichts inseriert"} href="/marketplace"/>
          <StatCard label="Scanner heute" value={scansMax===9999?String(scansToday):`${scansToday}/${scansMax}`} sub={scansMax===9999?"Unlimitiert (Premium)":scansToday>=scansMax?"Limit erreicht":`${scansMax-scansToday} übrig`} href="/scanner"/>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {/* Matches */}
            <div style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:16,overflow:"hidden"}}>
              <div style={{padding:"12px 16px",borderBottom:`0.5px solid ${BR1}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:10,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:TX3}}>Wishlist-Matches</span>
                <Link href="/matches" style={{fontSize:11,color:TX3,textDecoration:"none"}}>Alle →</Link>
              </div>
              {matches.length===0?<div style={{padding:"20px 16px",textAlign:"center"}}><div style={{fontSize:12,color:TX3,marginBottom:6}}>Keine Matches.</div><Link href="/preischeck" style={{fontSize:11,color:G,textDecoration:"none"}}>Karten zur Wishlist →</Link></div>
              :matches.map((m:any,i:number)=>{const listing=m.marketplace_listings;const card=listing?.cards;return(
                <div key={m.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 16px",borderBottom:i<matches.length-1?`0.5px solid ${BR1}`:undefined}}>
                  <div style={{width:28,height:38,borderRadius:4,background:BG2,overflow:"hidden",flexShrink:0}}>{card?.image_url&&<img src={card.image_url} alt="" style={{width:"100%",height:"100%",objectFit:"contain"}}/>}</div>
                  <div style={{flex:1,minWidth:0}}><div style={{fontSize:12,color:TX1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{card?.name_de||card?.name}</div><div style={{fontSize:10,color:TX3}}>{listing?.condition} · {listing?.price?.toLocaleString("de-DE",{minimumFractionDigits:2})} €</div></div>
                  <Link href="/matches" style={{fontSize:11,color:G,textDecoration:"none",flexShrink:0}}>→</Link>
                </div>
              );})}
            </div>
            {/* Fantasy */}
            {fantasy?(
              <div style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:16,padding:"16px"}}>
                <div style={{fontSize:10,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:TX3,marginBottom:10}}>Fantasy League</div>
                <div style={{fontSize:13,color:TX1,marginBottom:10}}>{fantasy.name}</div>
                <div style={{display:"flex",gap:16}}>
                  <div><div style={{fontSize:9,color:TX3,marginBottom:3,textTransform:"uppercase",letterSpacing:".06em"}}>Performance</div><div style={{fontSize:18,fontFamily:"var(--font-mono)",fontWeight:300,color:fantasy.pct>=0?GREEN:RED}}>{fantasy.pct>=0?"+":""}{fantasy.pct.toFixed(1)}%</div></div>
                  <div><div style={{fontSize:9,color:TX3,marginBottom:3,textTransform:"uppercase",letterSpacing:".06em"}}>Karten</div><div style={{fontSize:18,fontFamily:"var(--font-mono)",fontWeight:300,color:TX1}}>{fantasy.picks}/5</div></div>
                  <div><div style={{fontSize:9,color:TX3,marginBottom:3,textTransform:"uppercase",letterSpacing:".06em"}}>Wert</div><div style={{fontSize:18,fontFamily:"var(--font-mono)",fontWeight:300,color:TX1}}>{Math.round(fantasy.current)} €</div></div>
                </div>
              </div>
            ):(
              <div style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:16,padding:"20px",textAlign:"center"}}>
                <div style={{fontSize:10,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:TX3,marginBottom:10}}>Fantasy League</div>
                <div style={{fontSize:12,color:TX3,marginBottom:10}}>Noch kein Team diese Saison.</div>
                <Link href="/fantasy" style={{fontSize:12,color:G,textDecoration:"none"}}>Team aufbauen →</Link>
              </div>
            )}
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {/* Listings */}
            <div style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:16,overflow:"hidden"}}>
              <div style={{padding:"12px 16px",borderBottom:`0.5px solid ${BR1}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:10,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:TX3}}>Meine Listings</span>
                <Link href="/marketplace" style={{fontSize:11,color:TX3,textDecoration:"none"}}>Alle →</Link>
              </div>
              {listings.length===0?<div style={{padding:"20px 16px",textAlign:"center"}}><div style={{fontSize:12,color:TX3,marginBottom:6}}>Keine aktiven Listings.</div><Link href="/marketplace" style={{fontSize:11,color:G,textDecoration:"none"}}>Erste Karte inserieren →</Link></div>
              :listings.map((l:any,i:number)=>{const card=l.cards;return(
                <div key={l.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 16px",borderBottom:i<listings.length-1?`0.5px solid ${BR1}`:undefined}}>
                  <div style={{width:28,height:38,borderRadius:4,background:BG2,overflow:"hidden",flexShrink:0}}>{card?.image_url&&<img src={card.image_url} alt="" style={{width:"100%",height:"100%",objectFit:"contain"}}/>}</div>
                  <div style={{flex:1,minWidth:0}}><div style={{fontSize:12,color:TX1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{card?.name_de||card?.name}</div><div style={{fontSize:10,color:TX3}}>{l.condition}</div></div>
                  <div style={{fontSize:13,fontFamily:"var(--font-mono)",fontWeight:300,color:G,flexShrink:0}}>{l.price?.toLocaleString("de-DE",{minimumFractionDigits:2})} €</div>
                </div>
              );})}
            </div>
            {/* Open Trades */}
            {trades.length > 0 && (
              <div style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:16,overflow:"hidden"}}>
                <div style={{padding:"12px 16px",borderBottom:`0.5px solid ${BR1}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:10,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:TX3}}>Offene Trades</span>
                  <span style={{fontSize:11,color:TX3}}>{trades.length}</span>
                </div>
                {trades.map((t:any,i:number)=>{
                  const card = t.marketplace_listings?.cards;
                  const isBuyer = t.buyer_id === user?.id;
                  const statusColor = t.status==="paid"?GREEN:t.status==="shipped"?"#60A5FA":TX3;
                  const statusLabel = t.status==="pending"?"Zahlung ausstehend":t.status==="paid"?isBuyer?"Warte auf Versand":"Versand ausstehend":isBuyer?"Bestätigung ausstehend":"Versendet";
                  return (
                    <Link key={t.id} href={`/marketplace/escrow/${t.id}`} style={{
                      display:"flex",alignItems:"center",gap:10,padding:"10px 16px",
                      borderBottom:i<trades.length-1?`0.5px solid ${BR1}`:undefined,
                      textDecoration:"none",
                    }}>
                      <div style={{width:28,height:38,borderRadius:4,background:BG2,overflow:"hidden",flexShrink:0}}>
                        {card?.image_url&&<img src={card.image_url} alt="" style={{width:"100%",height:"100%",objectFit:"contain"}}/>}
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:12,color:TX1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{card?.name_de||card?.name}</div>
                        <div style={{fontSize:10,color:statusColor}}>{isBuyer?"Kauf":"Verkauf"} · {statusLabel}</div>
                      </div>
                      <div style={{fontSize:13,fontFamily:"var(--font-mono)",fontWeight:300,color:G,flexShrink:0}}>
                        {(isBuyer?t.gross_amount:t.seller_payout)?.toLocaleString("de-DE",{minimumFractionDigits:2})} €
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Open Escrow Transactions */}
            {escrows.length > 0 && (
              <div style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:16,overflow:"hidden",marginBottom:0}}>
                <div style={{padding:"12px 16px",borderBottom:`0.5px solid ${BR1}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:10,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:TX3}}>Offene Trades</span>
                  <span style={{fontSize:11,color:TX3}}>{escrows.length}</span>
                </div>
                {escrows.map((e:any,i:number)=>{
                  const isBuyer = e.buyer_id === user?.id;
                  const statusColor: Record<string,string> = {
                    pending:"#62626f", paid:GREEN, shipped:"#60A5FA",
                    received:GREEN, disputed:"#dc4a5a"
                  };
                  const statusLabel: Record<string,string> = {
                    pending:"Zahlung ausstehend", paid:"Bezahlt · Versand erwartet",
                    shipped:"Versendet · Bestätigung ausstehend",
                    received:"Erhalten", disputed:"Streitfall"
                  };
                  return (
                    <Link key={e.id} href={`/marketplace/escrow/${e.id}`} style={{
                      display:"flex",alignItems:"center",gap:10,padding:"10px 16px",
                      borderBottom:i<escrows.length-1?`0.5px solid ${BR1}`:undefined,
                      textDecoration:"none",
                    }}>
                      <div style={{width:6,height:6,borderRadius:"50%",background:statusColor[e.status]??TX3,flexShrink:0}}/>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:12,color:TX1,marginBottom:2}}>{isBuyer?"Kauf":"Verkauf"} · {e.gross_amount?.toLocaleString("de-DE",{minimumFractionDigits:2})} €</div>
                        <div style={{fontSize:10,color:TX3}}>{statusLabel[e.status]??e.status}</div>
                      </div>
                      <div style={{fontSize:11,color:TX3}}>→</div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Quick Actions */}
            <div style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:16,padding:"16px"}}>
              <div style={{fontSize:10,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:TX3,marginBottom:12}}>Schnellzugriff</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {[{href:"/scanner",label:"KI-Scanner",icon:"⊙",sub:"Karte scannen"},{href:"/preischeck",label:"Preischeck",icon:"◈",sub:"Karten suchen"},{href:"/portfolio",label:"Portfolio",icon:"◇",sub:"Sammlung"},{href:"/sets",label:"Sets",icon:"◫",sub:"Alle Sets"}].map(({href,label,icon,sub})=>(
                  <Link key={href} href={href} style={{padding:"12px 14px",borderRadius:11,background:BG2,border:`0.5px solid ${BR1}`,textDecoration:"none",display:"block",transition:"border-color .2s"}}
                  onMouseEnter={e=>{(e.currentTarget as any).style.borderColor=G18;}}
                  onMouseLeave={e=>{(e.currentTarget as any).style.borderColor="rgba(255,255,255,0.045)";}}>
                    <div style={{fontSize:16,marginBottom:5,color:G,opacity:.7}}>{icon}</div>
                    <div style={{fontSize:12,fontWeight:500,color:TX1,marginBottom:2}}>{label}</div>
                    <div style={{fontSize:10,color:TX3}}>{sub}</div>
                  </Link>
                ))}
              </div>
            </div>
            <Link href={`/profil/${username}`} style={{background:G05,border:`0.5px solid ${G18}`,borderRadius:14,padding:"14px 16px",textDecoration:"none",display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:36,height:36,borderRadius:"50%",background:G10,border:`0.5px solid ${G18}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:G}}>{initial}</div>
              <div style={{flex:1}}><div style={{fontSize:13,color:TX1}}>@{username}</div><div style={{fontSize:10,color:TX3}}>{profile?.is_premium?"✦ Premium · ":""}Profil ansehen</div></div>
              <div style={{fontSize:14,color:G}}>→</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

'@
[System.IO.File]::WriteAllText("$root\src\app\dashboard\page.tsx", $dashboard, $enc)
Write-Host "  OK  page.tsx" -ForegroundColor Green

$settings = @'
"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const G="#D4A843",G18="rgba(212,168,67,0.18)",G08="rgba(212,168,67,0.08)";
const BG1="#111114",BG2="#18181c",BR1="rgba(255,255,255,0.045)",BR2="rgba(255,255,255,0.085)";
const TX1="#ededf2",TX2="#a4a4b4",TX3="#62626f",GREEN="#3db87a",RED="#dc4a5a",AMBER="#f59e0b";

function Section({title, children}:{title:string;children:React.ReactNode}) {
  return (
    <div style={{marginBottom:20}}>
      <div style={{fontSize:10,fontWeight:600,letterSpacing:".12em",textTransform:"uppercase",color:TX3,marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
        <span style={{width:16,height:0.5,background:TX3,display:"inline-block"}}/>
        {title}
      </div>
      <div style={{background:BG1,border:`0.5px solid ${BR2}`,borderRadius:16,overflow:"hidden"}}>
        {children}
      </div>
    </div>
  );
}

function Row({label,sub,children}:{label:string;sub?:string;children:React.ReactNode}) {
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:16,padding:"14px 18px",borderBottom:`0.5px solid ${BR1}`}}>
      <div>
        <div style={{fontSize:13,color:TX1}}>{label}</div>
        {sub&&<div style={{fontSize:11,color:TX3,marginTop:2}}>{sub}</div>}
      </div>
      <div style={{flexShrink:0}}>{children}</div>
    </div>
  );
}

function Toggle({on,set}:{on:boolean;set:(v:boolean)=>void}) {
  return (
    <div onClick={()=>set(!on)} style={{
      width:40,height:22,borderRadius:11,cursor:"pointer",flexShrink:0,
      background:on?G:"rgba(255,255,255,0.08)",
      border:`0.5px solid ${on?G18:BR2}`,
      position:"relative",transition:"all .2s",
    }}>
      <div style={{
        position:"absolute",top:2,left:on?20:2,width:18,height:18,
        borderRadius:"50%",background:on?G:"#fff",
        transition:"all .2s",opacity:on?1:.7,
        boxShadow:"0 1px 4px rgba(0,0,0,0.3)",
      }}/>
    </div>
  );
}

export default function SettingsPage() {
  const [user,         setUser]         = useState<any>(null);
  const [profile,      setProfile]      = useState<any>(null);
  const [username,     setUsername]     = useState("");
  const [saving,       setSaving]       = useState(false);
  const [saveMsg,      setSaveMsg]      = useState("");
  const [notifMatch,   setNotifMatch]   = useState(true);
  const [notifForum,   setNotifForum]   = useState(false);
  // Seller onboarding
  const [sellerStatus, setSellerStatus] = useState<"unknown"|"not_started"|"pending"|"ready">("unknown");
  const [onboarding,   setOnboarding]   = useState(false);

  useEffect(() => {
    const sb = createClient();
    sb.auth.getSession().then(async ({data:{session}}) => {
      if (!session?.user) return;
      setUser(session.user);
      const {data:p} = await sb.from("profiles")
        .select("username, avatar_url, is_premium").eq("id",session.user.id).single();
      setProfile(p);
      setUsername(p?.username ?? "");
      // Check seller status
      checkSellerStatus(session.access_token);
    });
  }, []);

  async function checkSellerStatus(token?: string) {
    const h: Record<string,string> = {};
    if (token) h["Authorization"] = `Bearer ${token}`;
    try {
      const res = await fetch("/api/marketplace/seller/onboard", { headers: h });
      const data = await res.json();
      if (data.needs_onboard) setSellerStatus("not_started");
      else if (data.ready)    setSellerStatus("ready");
      else                    setSellerStatus("pending");
    } catch { setSellerStatus("unknown"); }
  }

  async function saveUsername() {
    if (!username.trim() || !user) return;
    setSaving(true); setSaveMsg("");
    const sb = createClient();
    const { error } = await sb.from("profiles")
      .update({ username: username.trim() }).eq("id", user.id);
    setSaveMsg(error ? "Fehler beim Speichern." : "✓ Gespeichert");
    setSaving(false);
    setTimeout(() => setSaveMsg(""), 3000);
  }

  async function startSellerOnboarding() {
    setOnboarding(true);
    const sb = createClient();
    const { data: { session } } = await sb.auth.getSession();
    const h: Record<string,string> = { "Content-Type":"application/json" };
    if (session?.access_token) h["Authorization"] = `Bearer ${session.access_token}`;
    const res = await fetch("/api/marketplace/seller/onboard", { method:"POST", headers:h });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else { alert(data.error ?? "Fehler beim Onboarding."); setOnboarding(false); }
  }

  const sellerMeta = {
    unknown:     { label:"Wird geprüft…",          color:TX3,   icon:"◎" },
    not_started: { label:"Noch nicht registriert",  color:AMBER, icon:"◈" },
    pending:     { label:"Verifizierung ausstehend",color:AMBER, icon:"◎" },
    ready:       { label:"Verifiziert ✓",           color:GREEN, icon:"✦" },
  }[sellerStatus];

  return (
    <div style={{color:TX1,minHeight:"80vh"}}>
      <div style={{maxWidth:680,margin:"0 auto",padding:"clamp(52px,7vw,80px) clamp(16px,3vw,28px)"}}>

        <div style={{marginBottom:"clamp(28px,4vw,44px)"}}>
          <div style={{fontSize:9,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:TX3,marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
            <span style={{width:16,height:0.5,background:TX3,display:"inline-block"}}/>Einstellungen
          </div>
          <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(24px,4vw,40px)",fontWeight:200,letterSpacing:"-.05em"}}>
            Mein Konto
          </h1>
        </div>

        {/* Profil */}
        <Section title="Profil">
          <Row label="Benutzername" sub="Sichtbar auf deinem öffentlichen Profil">
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <input value={username} onChange={e=>setUsername(e.target.value)}
                style={{padding:"7px 12px",borderRadius:9,background:"rgba(0,0,0,0.3)",
                  border:`0.5px solid ${BR2}`,color:TX1,fontSize:13,outline:"none",width:160}}/>
              <button onClick={saveUsername} disabled={saving} style={{
                padding:"7px 14px",borderRadius:9,background:G,color:"#0a0808",
                fontSize:12,border:"none",cursor:"pointer",opacity:saving?.7:1,
              }}>{saving?"…":"Speichern"}</button>
            </div>
          </Row>
          {saveMsg && (
            <div style={{padding:"8px 18px",fontSize:12,color:saveMsg.startsWith("✓")?GREEN:RED}}>{saveMsg}</div>
          )}
          <Row label="E-Mail" sub={user?.email ?? "—"}>
            <span style={{fontSize:11,color:TX3}}>Nicht änderbar</span>
          </Row>
          <div style={{padding:"14px 18px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div>
              <div style={{fontSize:13,color:TX1}}>Mitgliedschaft</div>
              <div style={{fontSize:11,color:TX3,marginTop:2}}>{profile?.is_premium?"Premium ✦ aktiv":"Free Plan"}</div>
            </div>
            {profile?.is_premium
              ? <span style={{fontSize:11,padding:"3px 10px",borderRadius:6,background:G08,color:G,border:`0.5px solid ${G18}`}}>✦ Premium</span>
              : <a href="/dashboard/premium" style={{fontSize:12,color:G,textDecoration:"none",padding:"7px 14px",borderRadius:9,background:G08,border:`0.5px solid ${G18}`}}>Upgrade ✦</a>
            }
          </div>
        </Section>

        {/* Verkäufer-Konto */}
        <Section title="Marktplatz · Verkäuferkonto">
          <div style={{padding:"16px 18px"}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
              <div style={{
                width:40,height:40,borderRadius:"50%",
                background:sellerStatus==="ready"?"rgba(61,184,122,0.1)":G08,
                border:`0.5px solid ${sellerStatus==="ready"?GREEN:G18}`,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:16,color:sellerMeta.color,
              }}>{sellerMeta.icon}</div>
              <div>
                <div style={{fontSize:13,fontWeight:500,color:TX1}}>Stripe Verkäufer-Konto</div>
                <div style={{fontSize:11,color:sellerMeta.color,marginTop:2}}>{sellerMeta.label}</div>
              </div>
            </div>

            {sellerStatus === "ready" ? (
              <div style={{padding:"10px 14px",borderRadius:10,background:"rgba(61,184,122,0.06)",border:"0.5px solid rgba(61,184,122,0.2)",fontSize:12,color:GREEN}}>
                ✓ Du kannst Karten verkaufen und Zahlungen empfangen. Auszahlung erfolgt wöchentlich montags.
              </div>
            ) : sellerStatus === "pending" ? (
              <div style={{padding:"10px 14px",borderRadius:10,background:`${G08}`,border:`0.5px solid ${G18}`,fontSize:12,color:TX2}}>
                Stripe prüft deine Angaben. Das dauert meist 1-2 Werktage. Du wirst per E-Mail benachrichtigt.
              </div>
            ) : (
              <div>
                <div style={{fontSize:12,color:TX3,marginBottom:12,lineHeight:1.7}}>
                  Um Karten zu verkaufen und Zahlungen zu empfangen musst du ein Stripe Verkäufer-Konto erstellen. Dafür benötigst du: Ausweis (Foto-ID), Bankverbindung (IBAN), Steuer-ID.
                </div>
                <div style={{display:"flex",gap:10,marginBottom:10}}>
                  <div style={{fontSize:11,color:TX3,display:"flex",alignItems:"center",gap:5}}>
                    <span style={{color:GREEN}}>✓</span> Kostenlos
                  </div>
                  <div style={{fontSize:11,color:TX3,display:"flex",alignItems:"center",gap:5}}>
                    <span style={{color:GREEN}}>✓</span> Sicher via Stripe
                  </div>
                  <div style={{fontSize:11,color:TX3,display:"flex",alignItems:"center",gap:5}}>
                    <span style={{color:GREEN}}>✓</span> Wöchentliche Auszahlung
                  </div>
                </div>
                {!profile?.is_premium ? (
                  <div style={{padding:"10px 14px",borderRadius:10,background:G08,border:`0.5px solid ${G18}`,fontSize:12,color:TX2}}>
                    Verkäufer-Konto ist nur für Premium-Mitglieder. <a href="/dashboard/premium" style={{color:G,textDecoration:"none"}}>Jetzt upgraden →</a>
                  </div>
                ) : (
                  <button onClick={startSellerOnboarding} disabled={onboarding} style={{
                    width:"100%",padding:"12px",borderRadius:12,
                    background:G,color:"#0a0808",
                    fontSize:13,fontWeight:400,border:"none",cursor:"pointer",
                    boxShadow:`0 2px 16px rgba(212,168,67,0.2)`,
                    opacity:onboarding?.7:1,
                  }}>
                    {onboarding ? "Weiterleitung zu Stripe…" : "Jetzt als Verkäufer registrieren →"}
                  </button>
                )}
              </div>
            )}
          </div>
        </Section>

        {/* Benachrichtigungen */}
        <Section title="Benachrichtigungen">
          <div style={{borderBottom:`0.5px solid ${BR1}`}}>
            <Row label="Wishlist-Matches" sub="E-Mail wenn eine Karte aus deiner Wishlist verfügbar ist">
              <Toggle on={notifMatch} set={setNotifMatch}/>
            </Row>
          </div>
          <Row label="Forum-Antworten" sub="E-Mail wenn jemand auf deinen Beitrag antwortet">
            <Toggle on={notifForum} set={setNotifForum}/>
          </Row>
        </Section>

        {/* Konto löschen */}
        <Section title="Gefahrenzone">
          <div style={{padding:"14px 18px"}}>
            <div style={{fontSize:12,color:TX3,marginBottom:12}}>Das Löschen deines Kontos ist unwiderruflich. Alle Daten werden permanent gelöscht.</div>
            <button style={{padding:"9px 18px",borderRadius:10,background:"transparent",color:RED,border:`0.5px solid rgba(220,74,90,0.3)`,fontSize:12,cursor:"pointer"}}>
              Konto löschen
            </button>
          </div>
        </Section>
      </div>
    </div>
  );
}

'@
[System.IO.File]::WriteAllText("$root\src\app\settings\page.tsx", $settings, $enc)
Write-Host "  OK  page.tsx" -ForegroundColor Green

$mktApi = @'
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/marketplace?card_id=xxx&type=offer|want
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const card_id = searchParams.get("card_id");
  const type    = searchParams.get("type"); // "offer" | "want" | null (both)

  if (!card_id) {
    return NextResponse.json({ error: "card_id required" }, { status: 400 });
  }

  const supabase = await createClient();

  let query = supabase
    .from("marketplace_listings")
    .select(`
      id, type, price, condition, note, created_at,
      user_id,
      profiles!marketplace_listings_user_id_fkey(username, avatar_url)
    `)
    .eq("card_id", card_id)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(20);

  if (type) query = query.eq("type", type);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ listings: data ?? [] });
}

// POST /api/marketplace — create listing
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const body = await request.json();
  const { card_id, type, price, condition = "NM", note = "" } = body;

  if (!card_id || !type || !["offer","want"].includes(type)) {
    return NextResponse.json({ error: "Ungültige Daten" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("marketplace_listings")
    .insert({ user_id: user.id, card_id, type, price, condition, note })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ listing: data });
}

// DELETE /api/marketplace?id=xxx
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await supabase
    .from("marketplace_listings")
    .update({ is_active: false })
    .eq("id", id)
    .eq("user_id", user.id);

  return NextResponse.json({ ok: true });
}

'@
[System.IO.File]::WriteAllText("$root\src\app\api\marketplace\route.ts", $mktApi, $enc)
Write-Host "  OK  route.ts" -ForegroundColor Green

$sellerOnboard = @'
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createRouteClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

// POST /api/marketplace/seller/onboard
// Creates or retrieves Stripe Connect Express account for seller
export async function POST(request: NextRequest) {
  const supabase = await createRouteClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  // Check premium
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_premium, stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (!profile?.is_premium) {
    return NextResponse.json({ error: "Premium erforderlich" }, { status: 403 });
  }

  // Check if seller already has Connect account
  const { data: stats } = await supabase
    .from("seller_stats")
    .select("stripe_account_id")
    .eq("user_id", user.id)
    .single();

  let accountId = stats?.stripe_account_id;

  if (!accountId) {
    // Create new Express account
    const account = await stripe.accounts.create({
      type: "express",
      country: "DE",
      email: user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: "individual",
      settings: {
        payouts: { schedule: { interval: "weekly", weekly_anchor: "monday" } },
      },
    });
    accountId = account.id;

    // Save to seller_stats
    await supabase.from("seller_stats").upsert({
      user_id: user.id,
      stripe_account_id: accountId,
      is_verified: false,
    });
  }

  // Create onboarding link
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://pokedax.de";
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${appUrl}/dashboard?onboard=refresh`,
    return_url:  `${appUrl}/dashboard?onboard=success`,
    type: "account_onboarding",
  });

  return NextResponse.json({ url: accountLink.url });
}

// GET /api/marketplace/seller/onboard — check onboarding status
export async function GET(request: NextRequest) {
  const supabase = await createRouteClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ready: false });

  const { data: stats } = await supabase
    .from("seller_stats")
    .select("stripe_account_id, is_verified")
    .eq("user_id", user.id)
    .single();

  if (!stats?.stripe_account_id) return NextResponse.json({ ready: false, needs_onboard: true });

  try {
    const account = await stripe.accounts.retrieve(stats.stripe_account_id);
    const ready = account.charges_enabled && account.payouts_enabled;

    if (ready && !stats.is_verified) {
      await supabase.from("seller_stats")
        .update({ is_verified: true })
        .eq("user_id", user.id);
    }

    return NextResponse.json({
      ready,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      account_id: stats.stripe_account_id,
    });
  } catch {
    return NextResponse.json({ ready: false, error: "Account nicht gefunden" });
  }
}

'@
[System.IO.File]::WriteAllText("$root\src\app\api\marketplace\seller\onboard\route.ts", $sellerOnboard, $enc)
Write-Host "  OK  route.ts" -ForegroundColor Green

$escrowCreate = @'
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createRouteClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

const LAUNCH_END = new Date("2026-07-01");

function calcFees(price: number, isPremium: boolean) {
  const isLaunch = new Date() < LAUNCH_END;
  const escrowFee   = Math.round(price * 0.01 * 100) / 100;
  const provisionRate = (!isLaunch && price > 5) ? (isPremium ? 0.03 : 0.05) : 0;
  const platformFee  = Math.round(price * provisionRate * 100) / 100;
  const sellerPayout = Math.round((price - platformFee) * 100) / 100;
  const buyerTotal   = Math.round((price + escrowFee) * 100) / 100;
  return { escrowFee, platformFee, sellerPayout, buyerTotal, provisionRate, isLaunch };
}

// POST /api/marketplace/escrow/create
export async function POST(request: NextRequest) {
  const supabase = await createRouteClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const { listing_id, offered_price } = await request.json();
  if (!listing_id || !offered_price) {
    return NextResponse.json({ error: "listing_id und offered_price erforderlich" }, { status: 400 });
  }

  // Load listing + seller data
  const { data: listing } = await supabase
    .from("marketplace_listings")
    .select(`
      id, card_id, price, seller_id, status,
      seller_stats!marketplace_listings_seller_id_fkey(stripe_account_id, is_verified)
    `)
    .eq("id", listing_id)
    .single();

  if (!listing) return NextResponse.json({ error: "Inserat nicht gefunden" }, { status: 404 });
  if (listing.status !== "active") return NextResponse.json({ error: "Inserat nicht mehr verfügbar" }, { status: 400 });
  if (listing.seller_id === user.id) return NextResponse.json({ error: "Eigenes Inserat" }, { status: 400 });

  const sellerStats = (listing as any).seller_stats;
  if (!sellerStats?.stripe_account_id || !sellerStats?.is_verified) {
    return NextResponse.json({ error: "Seller nicht verifiziert" }, { status: 400 });
  }

  // Buyer premium check
  const { data: buyerProfile } = await supabase
    .from("profiles")
    .select("is_premium")
    .eq("id", user.id)
    .single();

  const fees = calcFees(offered_price, buyerProfile?.is_premium ?? false);

  // Create Stripe PaymentIntent with Connect
  const pi = await stripe.paymentIntents.create({
    amount: Math.round(fees.buyerTotal * 100),
    currency: "eur",
    application_fee_amount: Math.round((fees.platformFee + fees.escrowFee) * 100),
    transfer_data: { destination: sellerStats.stripe_account_id },
    capture_method: "automatic",
    metadata: {
      listing_id,
      buyer_id: user.id,
      seller_id: listing.seller_id,
    },
  });

  // Create escrow record
  const autoRelease = new Date();
  autoRelease.setDate(autoRelease.getDate() + 14);

  const { data: escrow } = await supabase
    .from("escrow_transactions")
    .insert({
      buyer_id:       user.id,
      seller_id:      listing.seller_id,
      gross_amount:   fees.buyerTotal,
      seller_payout:  fees.sellerPayout,
      platform_fee:   fees.platformFee,
      escrow_fee:     fees.escrowFee,
      stripe_pi_id:   pi.id,
      status:         "pending",
      auto_release_at: autoRelease.toISOString(),
    })
    .select()
    .single();

  // Reserve listing
  await supabase
    .from("marketplace_listings")
    .update({ status: "reserved" })
    .eq("id", listing_id);

  return NextResponse.json({
    client_secret: pi.client_secret,
    escrow_id: escrow?.id,
    fees,
  });
}

'@
[System.IO.File]::WriteAllText("$root\src\app\api\marketplace\escrow\create\route.ts", $escrowCreate, $enc)
Write-Host "  OK  route.ts" -ForegroundColor Green

$escrowUpdate = @'
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createRouteClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

// POST /api/marketplace/escrow/update
// Actions: ship, confirm, dispute
export async function POST(request: NextRequest) {
  const supabase = await createRouteClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const { escrow_id, action, tracking_number, dispute_reason } = await request.json();

  const { data: escrow } = await supabase
    .from("escrow_transactions")
    .select("*")
    .eq("id", escrow_id)
    .single();

  if (!escrow) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });

  switch (action) {
    case "ship": {
      if (escrow.seller_id !== user.id) return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
      if (escrow.status !== "paid") return NextResponse.json({ error: "Zahlung nicht eingegangen" }, { status: 400 });
      await supabase.from("escrow_transactions").update({
        status: "shipped",
        shipped_at: new Date().toISOString(),
        tracking_number: tracking_number ?? null,
      }).eq("id", escrow_id);
      return NextResponse.json({ ok: true, status: "shipped" });
    }

    case "confirm": {
      if (escrow.buyer_id !== user.id) return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
      if (escrow.status !== "shipped") return NextResponse.json({ error: "Noch nicht versendet" }, { status: 400 });
      await releaseEscrow(supabase, escrow);
      return NextResponse.json({ ok: true, status: "released" });
    }

    case "dispute": {
      if (escrow.buyer_id !== user.id) return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
      await supabase.from("escrow_transactions").update({
        status: "disputed",
        dispute_reason: dispute_reason ?? "Kein Grund angegeben",
      }).eq("id", escrow_id);
      return NextResponse.json({ ok: true, status: "disputed" });
    }

    default:
      return NextResponse.json({ error: "Unbekannte Aktion" }, { status: 400 });
  }
}

async function releaseEscrow(supabase: any, escrow: any) {
  // Transfer funds to seller via Stripe
  try {
    await stripe.transfers.create({
      amount: Math.round(escrow.seller_payout * 100),
      currency: "eur",
      destination: escrow.stripe_seller_account ?? "",
      transfer_group: escrow.id,
    });
  } catch (e) {
    console.error("Stripe transfer error:", e);
  }

  await supabase.from("escrow_transactions").update({
    status: "released",
    received_at: new Date().toISOString(),
    released_at: new Date().toISOString(),
  }).eq("id", escrow.id);

  // Update seller stats
  await supabase.rpc("update_seller_stats", {
    p_seller_id: escrow.seller_id,
    p_amount: escrow.seller_payout,
  }).catch(() => {});

  // Fallback: manual update
  const { data: stats } = await supabase
    .from("seller_stats")
    .select("total_sales, total_volume")
    .eq("user_id", escrow.seller_id)
    .single();

  if (stats) {
    await supabase.from("seller_stats").update({
      total_sales:  (stats.total_sales ?? 0) + 1,
      total_volume: (stats.total_volume ?? 0) + escrow.seller_payout,
    }).eq("user_id", escrow.seller_id);
  }

  // Log transaction
  await supabase.from("marketplace_transactions").insert({
    escrow_id: escrow.id,
    event_type: "funds_released",
    amount: escrow.seller_payout,
  });
}

'@
[System.IO.File]::WriteAllText("$root\src\app\api\marketplace\escrow\update\route.ts", $escrowUpdate, $enc)
Write-Host "  OK  route.ts" -ForegroundColor Green

$escrowCron = @'
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/cron/escrow-release — runs every 4 hours
export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: overdue } = await supabase
    .from("escrow_transactions")
    .select("*")
    .eq("status", "shipped")
    .lt("auto_release_at", new Date().toISOString())
    .limit(20);

  let released = 0;
  for (const escrow of overdue ?? []) {
    try {
      await supabase.from("escrow_transactions").update({
        status: "released",
        released_at: new Date().toISOString(),
      }).eq("id", escrow.id);

      await supabase.from("seller_stats").update({
        total_sales:  (escrow as any).total_sales ?? 0 + 1,
        total_volume: (escrow as any).total_volume ?? 0 + escrow.seller_payout,
      }).eq("user_id", escrow.seller_id);

      await supabase.from("marketplace_transactions").insert({
        escrow_id: escrow.id,
        event_type: "auto_released",
        amount: escrow.seller_payout,
      });
      released++;
    } catch (e) { console.error(e); }
  }

  return NextResponse.json({ released, checked: overdue?.length ?? 0 });
}

'@
[System.IO.File]::WriteAllText("$root\src\app\api\cron\escrow-release\route.ts", $escrowCron, $enc)
Write-Host "  OK  route.ts" -ForegroundColor Green

$reviewsApi = @'
import { NextRequest, NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/server";

// POST /api/marketplace/reviews
export async function POST(request: NextRequest) {
  const supabase = await createRouteClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const { escrow_id, rating, comment } = await request.json();

  if (!escrow_id || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Ungültige Daten" }, { status: 400 });
  }

  const { data: escrow } = await supabase
    .from("escrow_transactions")
    .select("buyer_id, seller_id, status")
    .eq("id", escrow_id)
    .single();

  if (!escrow) return NextResponse.json({ error: "Transaktion nicht gefunden" }, { status: 404 });
  if (escrow.status !== "released") return NextResponse.json({ error: "Transaktion noch nicht abgeschlossen" }, { status: 400 });

  const isBuyer  = escrow.buyer_id  === user.id;
  const isSeller = escrow.seller_id === user.id;
  if (!isBuyer && !isSeller) return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });

  const reviewed_id = isBuyer ? escrow.seller_id : escrow.buyer_id;

  const { data, error } = await supabase
    .from("marketplace_reviews")
    .insert({
      escrow_id,
      reviewer_id: user.id,
      reviewed_id,
      role: isBuyer ? "buyer" : "seller",
      rating,
      comment: comment?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "Bereits bewertet" }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Update avg_rating in seller_stats for the reviewed user
  const { data: allReviews } = await supabase
    .from("marketplace_reviews")
    .select("rating")
    .eq("reviewed_id", reviewed_id);

  if (allReviews?.length) {
    const avg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
    await supabase.from("seller_stats").upsert({
      user_id: reviewed_id,
      avg_rating: Math.round(avg * 100) / 100,
      rating_count: allReviews.length,
    });
  }

  return NextResponse.json({ review: data });
}

// GET /api/marketplace/reviews?user_id=xxx
export async function GET(request: NextRequest) {
  const supabase = await createRouteClient(request);
  const user_id = new URL(request.url).searchParams.get("user_id");
  if (!user_id) return NextResponse.json({ reviews: [] });

  const { data } = await supabase
    .from("marketplace_reviews")
    .select(`
      id, rating, comment, role, created_at,
      profiles!marketplace_reviews_reviewer_id_fkey(username)
    `)
    .eq("reviewed_id", user_id)
    .order("created_at", { ascending: false })
    .limit(20);

  const normalized = (data ?? []).map((r: any) => ({
    ...r,
    profiles: Array.isArray(r.profiles) ? r.profiles[0] : r.profiles,
  }));

  return NextResponse.json({ reviews: normalized });
}

'@
[System.IO.File]::WriteAllText("$root\src\app\api\marketplace\reviews\route.ts", $reviewsApi, $enc)
Write-Host "  OK  route.ts" -ForegroundColor Green

$badgesApi = @'
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Badge thresholds
const BADGE_RULES = [
  { key: "badge_first_scan",     label: "Erster Scan",        icon: "⊙", check: async (uid:string) => {
    const {count} = await supabase.from("scan_logs").select("id",{count:"exact",head:true}).eq("user_id",uid);
    return (count??0) >= 1;
  }},
  { key: "badge_collector_100",  label: "100 Karten",         icon: "◈", check: async (uid:string) => {
    const {count} = await supabase.from("user_collection").select("id",{count:"exact",head:true}).eq("user_id",uid);
    return (count??0) >= 100;
  }},
  { key: "badge_first_trade",    label: "Erster Trade",       icon: "◉", check: async (uid:string) => {
    const {count} = await supabase.from("escrow_transactions").select("id",{count:"exact",head:true}).eq("seller_id",uid).eq("status","released");
    return (count??0) >= 1;
  }},
  { key: "badge_forum_10",       label: "Forum-Aktiv",        icon: "💬", check: async (uid:string) => {
    const {count} = await supabase.from("forum_posts").select("id",{count:"exact",head:true}).eq("author_id",uid);
    return (count??0) >= 10;
  }},
];

export async function POST(request: NextRequest) {
  const { user_id } = await request.json();
  if (!user_id) return NextResponse.json({ error: "user_id required" }, { status: 400 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user_id)
    .single();

  if (!profile) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const awarded: string[] = [];

  for (const rule of BADGE_RULES) {
    try {
      const earned = await rule.check(user_id);
      if (earned) {
        // Award badge - add to profiles badges JSONB column if not exists
        const { data: existing } = await supabase
          .from("user_badges")
          .select("id")
          .eq("user_id", user_id)
          .eq("badge_key", rule.key)
          .single();

        if (!existing) {
          await supabase.from("user_badges").insert({
            user_id, badge_key: rule.key,
            label: rule.label, icon: rule.icon,
            awarded_at: new Date().toISOString(),
          });
          awarded.push(rule.key);
        }
      }
    } catch(e) { console.error("Badge check error:", e); }
  }

  return NextResponse.json({ awarded, checked: BADGE_RULES.length });
}

export async function GET(request: NextRequest) {
  const user_id = new URL(request.url).searchParams.get("user_id");
  if (!user_id) return NextResponse.json({ badges: [] });

  const { data } = await supabase
    .from("user_badges")
    .select("badge_key, label, icon, awarded_at")
    .eq("user_id", user_id)
    .order("awarded_at", { ascending: false });

  return NextResponse.json({ badges: data ?? [] });
}

'@
[System.IO.File]::WriteAllText("$root\src\app\api\badges\route.ts", $badgesApi, $enc)
Write-Host "  OK  route.ts" -ForegroundColor Green

Write-Host ""
Write-Host "=========================" -ForegroundColor Yellow
Write-Host "Fertig! 17 Dateien geschrieben." -ForegroundColor Yellow
Write-Host "=========================" -ForegroundColor Yellow
Write-Host ""
Write-Host "PFLICHT - SQL ausfuehren (falls noch nicht gemacht):" -ForegroundColor Red
Write-Host "  1. sprint2.sql (seller_stats, escrow_transactions, reviews)" -ForegroundColor White
Write-Host "  2. sprint3.sql (user_badges, forum_posts.card_id)" -ForegroundColor White
Write-Host ""

$sprint3sql = @'
-- Sprint 3: Badges System
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS user_badges (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  badge_key  TEXT NOT NULL,
  label      TEXT NOT NULL,
  icon       TEXT,
  awarded_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_key)
);
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "badges_public" ON user_badges;
DROP POLICY IF EXISTS "badges_own" ON user_badges;
CREATE POLICY "badges_public" ON user_badges FOR SELECT USING (true);
CREATE POLICY "badges_own" ON user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Forum card tags
ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS card_id TEXT REFERENCES cards(id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_card ON forum_posts(card_id) WHERE card_id IS NOT NULL;

'@
Write-Host "sprint3.sql Inhalt:" -ForegroundColor Cyan
Write-Host $sprint3sql -ForegroundColor DarkGray
Write-Host ""
Write-Host "GitHub Desktop -> Commit 'Sprint 2+3: Escrow + Badges + Seller-Rating' -> Push" -ForegroundColor Yellow
