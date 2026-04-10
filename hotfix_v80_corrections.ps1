# Hotfix v8.0: Korrekte Versionen (Navbar + Scanner + Forum + Card)
$root = "C:\Users\lenovo\pokedax\pokedax\pokedax"
$enc  = New-Object System.Text.UTF8Encoding $true

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
Write-Host "  OK  Navbar.tsx (Hamburger + Dashboard)" -ForegroundColor Green

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
Write-Host "  OK  scanner/page.tsx (Redirect nach Scan)" -ForegroundColor Green

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
Write-Host "  OK  forum/page.tsx (Redesign: PostRow + Sidebar + Sort)" -ForegroundColor Green

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
Write-Host "  OK  preischeck/[id]/page.tsx" -ForegroundColor Green

Write-Host ""
Write-Host "GitHub Desktop -> Commit 'fix: navbar hamburger + scanner redirect + forum redesign' -> Push" -ForegroundColor Yellow
