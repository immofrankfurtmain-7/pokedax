"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const G="#D4A843",G18="rgba(212,168,67,0.18)",G08="rgba(212,168,67,0.08)";
const BG1="#111114",BG2="#18181c",BR1="rgba(255,255,255,0.045)",BR2="rgba(255,255,255,0.085)";
const TX1="#ededf2",TX2="#a4a4b4",TX3="#62626f",GREEN="#3db87a",RED="#dc4a5a";

const CONDITION_LABEL: Record<string,string> = {NM:"Near Mint",LP:"Light Played",MP:"Moderately Played",HP:"Heavily Played",D:"Damaged"};
const CONDITION_COLOR: Record<string,string> = {NM:GREEN,LP:"#a4d87a",MP:G,HP:RED,D:RED};

interface Listing {
  id:string; type:"offer"|"want"; price:number|null; condition:string; note:string; created_at:string;
  user_id:string;
  profiles:{username:string;avatar_url:string|null}|null;
  cards:{id:string;name:string;name_de:string;set_id:string;number:string;price_market:number|null;image_url:string|null}|null;
}

export default function MarketplacePage() {
  const [tab,       setTab]       = useState<"offer"|"want">("offer");
  const [listings,  setListings]  = useState<Listing[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [showForm,  setShowForm]  = useState(false);
  const [user,      setUser]      = useState<any>(null);

  // Form state
  const [fSearch,  setFSearch]  = useState("");
  const [fResults, setFResults] = useState<any[]>([]);
  const [fCard,    setFCard]    = useState<any>(null);
  const [fType,    setFType]    = useState<"offer"|"want">("offer");
  const [fPrice,   setFPrice]   = useState("");
  const [fCond,    setFCond]    = useState("NM");
  const [fNote,    setFNote]    = useState("");
  const [fLoading, setFLoading] = useState(false);
  const [fMsg,     setFMsg]     = useState("");

  useEffect(() => {
    const sb = createClient();
    sb.auth.getUser().then(({data:{user}}) => setUser(user));
    loadListings(tab);
  }, []);

  async function loadListings(t: "offer"|"want") {
    setLoading(true);
    const sb = createClient();
    const { data } = await sb
      .from("marketplace_listings")
      .select("id,type,price,condition,note,created_at,user_id,profiles!marketplace_listings_user_id_fkey(username,avatar_url),cards!marketplace_listings_card_id_fkey(id,name,name_de,set_id,number,price_market,image_url)")
      .eq("type", t)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(40);
    setListings((data as any[]) ?? []);
    setLoading(false);
  }

  async function searchCards(q: string) {
    setFSearch(q);
    if (q.length < 2) { setFResults([]); return; }
    const res = await fetch(`/api/cards/search?q=${encodeURIComponent(q)}&limit=5`);
    const data = await res.json();
    setFResults(data.cards ?? []);
  }

  async function submitListing() {
    if (!fCard) { setFMsg("Bitte eine Karte auswählen."); return; }
    setFLoading(true);
    const sb = createClient();
    const { data: { session } } = await sb.auth.getSession();
    const headers: Record<string,string> = {"Content-Type":"application/json"};
    if (session?.access_token) headers["Authorization"] = `Bearer ${session.access_token}`;
    const res = await fetch("/api/marketplace", {
      method:"POST",
      headers,
      body:JSON.stringify({card_id:fCard.id,type:fType,price:parseFloat(fPrice)||null,condition:fCond,note:fNote}),
    });
    const data = await res.json();
    if (!res.ok) {
      setFMsg(data.error === "Nicht angemeldet" ? "Bitte zuerst anmelden." : data.error ?? "Fehler.");
    } else {
      setFMsg("✓ Inserat erstellt!");
      setFCard(null); setFSearch(""); setFResults([]); setFPrice(""); setFNote("");
      setTimeout(()=>{ setShowForm(false); setFMsg(""); loadListings(tab); }, 1200);
    }
    setFLoading(false);
  }

  const filtered = listings.filter(l => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (l.cards?.name_de??l.cards?.name??"").toLowerCase().includes(q) ||
           (l.profiles?.username??"").toLowerCase().includes(q);
  });

  return (
    <div style={{color:TX1,minHeight:"80vh"}}>
      <div style={{maxWidth:1100,margin:"0 auto",padding:"clamp(52px,7vw,80px) clamp(16px,3vw,28px)"}}>

        {/* Header */}
        <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",flexWrap:"wrap",gap:16,marginBottom:"clamp(32px,5vw,52px)"}}>
          <div>
            <div style={{fontSize:9,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:TX3,marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
              <span style={{width:16,height:0.5,background:TX3}}/>Marktplatz
            </div>
            <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(28px,5vw,52px)",fontWeight:200,letterSpacing:"-.055em",marginBottom:8}}>
              Karten kaufen<br/><span style={{color:G}}>& verkaufen.</span>
            </h1>
            <p style={{fontSize:13,color:TX3,fontWeight:300}}>Direkt mit anderen Sammlern handeln. Kein Mittelmann.</p>
          </div>
          <button onClick={()=>setShowForm(!showForm)} style={{
            padding:"12px 24px",borderRadius:14,background:G,color:"#0a0808",
            fontSize:13,fontWeight:400,border:"none",cursor:"pointer",
            boxShadow:`0 2px 20px rgba(212,168,67,0.25)`,
          }}>+ Inserat erstellen</button>
        </div>

        {/* Create listing form */}
        {showForm&&(
          <div style={{background:BG1,border:`1px solid ${BR2}`,borderRadius:22,padding:24,marginBottom:20,position:"relative"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,rgba(212,168,67,0.3),transparent)`,borderRadius:"22px 22px 0 0"}}/>
            <div style={{fontSize:13,fontWeight:500,color:TX1,marginBottom:18}}>Neues Inserat</div>

            {/* Type toggle */}
            <div style={{display:"flex",gap:8,marginBottom:16}}>
              {([["offer","Ich biete an"],["want","Ich suche"]] as const).map(([t,l])=>(
                <button key={t} onClick={()=>setFType(t)} style={{
                  padding:"8px 18px",borderRadius:10,fontSize:12,fontWeight:400,border:"none",cursor:"pointer",
                  background:fType===t?(t==="offer"?G:G08):"transparent",
                  color:fType===t?(t==="offer"?"#0a0808":G):TX3,
                  outline:fType===t?"none":`1px solid ${BR2}`,transition:"all .2s",
                }}>{l}</button>
              ))}
            </div>

            {/* Card search */}
            <div style={{marginBottom:12}}>
              <div style={{fontSize:10,color:TX3,marginBottom:6,textTransform:"uppercase",letterSpacing:".08em"}}>Karte</div>
              {fCard ? (
                <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:BG2,borderRadius:10,border:`1px solid ${G18}`}}>
                  {fCard.image_url&&<img src={fCard.image_url} alt="" style={{width:24,height:34,objectFit:"contain"}}/>}
                  <span style={{fontSize:13,color:TX1}}>{fCard.name_de||fCard.name}</span>
                  <span style={{fontSize:11,color:TX3,marginLeft:4}}>{fCard.set_id?.toUpperCase()} · #{fCard.number}</span>
                  <button onClick={()=>setFCard(null)} style={{marginLeft:"auto",background:"transparent",border:"none",color:TX3,cursor:"pointer",fontSize:14}}>×</button>
                </div>
              ) : (
                <div>
                  <div style={{position:"relative"}}>
                    <svg style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",opacity:.35}} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input value={fSearch} onChange={e=>searchCards(e.target.value)} placeholder="Karte suchen…"
                      style={{width:"100%",padding:"9px 9px 9px 30px",borderRadius:10,background:"rgba(0,0,0,0.3)",border:`1px solid ${BR2}`,color:TX1,fontSize:13,outline:"none"}}/>
                  </div>
                  {fResults.length>0&&(
                    <div style={{marginTop:6,display:"flex",flexDirection:"column",gap:4}}>
                      {fResults.map((c:any)=>(
                        <div key={c.id} onClick={()=>{setFCard(c);setFResults([]);}} style={{
                          display:"flex",alignItems:"center",gap:10,padding:"8px 12px",
                          background:BG2,borderRadius:8,border:`1px solid ${BR1}`,cursor:"pointer",
                        }}>
                          {c.image_url&&<img src={c.image_url} alt="" style={{width:20,height:28,objectFit:"contain"}}/>}
                          <span style={{fontSize:12,color:TX1}}>{c.name_de||c.name}</span>
                          <span style={{fontSize:10,color:TX3,marginLeft:4}}>{c.set_id?.toUpperCase()}</span>
                          <span style={{marginLeft:"auto",fontSize:12,fontFamily:"var(--font-mono)",color:G}}>{c.price_market?.toFixed(2)} €</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
              <div>
                <div style={{fontSize:10,color:TX3,marginBottom:6,textTransform:"uppercase",letterSpacing:".08em"}}>Preis (€)</div>
                <input value={fPrice} onChange={e=>setFPrice(e.target.value)} type="number" placeholder="z.B. 45.00" min="0" step="0.01"
                  style={{width:"100%",padding:"9px 12px",borderRadius:9,background:"rgba(0,0,0,0.3)",border:`1px solid ${BR2}`,color:TX1,fontSize:13,outline:"none"}}/>
              </div>
              <div>
                <div style={{fontSize:10,color:TX3,marginBottom:6,textTransform:"uppercase",letterSpacing:".08em"}}>Zustand</div>
                <select value={fCond} onChange={e=>setFCond(e.target.value)}
                  style={{width:"100%",padding:"9px 12px",borderRadius:9,background:BG1,border:`1px solid ${BR2}`,color:TX1,fontSize:13,outline:"none"}}>
                  {["NM","LP","MP","HP","D"].map(c=><option key={c} value={c}>{c} — {CONDITION_LABEL[c]}</option>)}
                </select>
              </div>
            </div>
            <input value={fNote} onChange={e=>setFNote(e.target.value)} placeholder="Notiz: Versand, Tausch, Grading…"
              style={{width:"100%",padding:"9px 12px",borderRadius:9,background:"rgba(0,0,0,0.3)",border:`1px solid ${BR2}`,color:TX1,fontSize:13,outline:"none",marginBottom:12}}/>
            {fMsg&&<div style={{fontSize:12,color:fMsg.startsWith("✓")?GREEN:RED,marginBottom:10}}>{fMsg}</div>}
            <div style={{display:"flex",gap:8}}>
              <button onClick={submitListing} disabled={fLoading||!fCard} style={{
                flex:1,padding:"11px",borderRadius:11,background:fCard?G:"rgba(255,255,255,0.05)",
                color:fCard?"#0a0808":TX3,fontSize:13,fontWeight:400,border:"none",
                cursor:fCard?"pointer":"not-allowed",
              }}>{fLoading?"Speichert…":"Inserat veröffentlichen"}</button>
              <button onClick={()=>setShowForm(false)} style={{padding:"11px 16px",borderRadius:11,background:"transparent",color:TX2,fontSize:13,border:`1px solid ${BR1}`,cursor:"pointer"}}>Abbrechen</button>
            </div>
          </div>
        )}

        {/* Tabs + Search */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap",marginBottom:16}}>
          <div style={{display:"flex",gap:2,background:BG1,borderRadius:13,padding:3,border:`1px solid ${BR1}`}}>
            {([["offer","Kaufangebote"],["want","Suchangebote"]] as const).map(([t,l])=>(
              <button key={t} onClick={()=>{setTab(t);loadListings(t);}} style={{
                padding:"7px 18px",borderRadius:9,fontSize:13,fontWeight:400,border:"none",cursor:"pointer",
                background:tab===t?BG2:"transparent",color:tab===t?TX1:TX3,transition:"all .2s",
              }}>{l}</button>
            ))}
          </div>
          <div style={{position:"relative"}}>
            <svg style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",opacity:.3}} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Karte oder Nutzer suchen"
              style={{padding:"8px 8px 8px 32px",borderRadius:11,background:BG1,border:`1px solid ${BR2}`,color:TX1,fontSize:12,outline:"none",width:220}}/>
          </div>
        </div>

        {/* Listings */}
        {loading ? (
          <div style={{padding:"48px",textAlign:"center",fontSize:14,color:TX3}}>Lädt…</div>
        ) : filtered.length===0 ? (
          <div style={{background:BG1,border:`1px solid ${BR2}`,borderRadius:20,padding:"48px",textAlign:"center"}}>
            <div style={{fontSize:14,color:TX3,marginBottom:16}}>Noch keine {tab==="offer"?"Angebote":"Suchanfragen"}.</div>
            <button onClick={()=>setShowForm(true)} style={{fontSize:13,color:G,background:"transparent",border:"none",cursor:"pointer"}}>Ersten Eintrag erstellen →</button>
          </div>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {filtered.map(l=>{
              const card = l.cards;
              const refPrice = card?.price_market;
              const showDeal = l.type==="offer"&&l.price&&refPrice&&l.price<refPrice;
              return (
                <div key={l.id} style={{
                  display:"flex",alignItems:"center",gap:14,
                  background:BG1,border:`1px solid ${BR1}`,borderRadius:16,
                  padding:"14px 18px",transition:"border-color .2s",
                }}>
                  {/* Card image */}
                  <div style={{width:40,height:56,borderRadius:6,background:BG2,overflow:"hidden",flexShrink:0}}>
                    {card?.image_url&&<img src={card.image_url} alt="" style={{width:"100%",height:"100%",objectFit:"contain"}}/>}
                  </div>
                  {/* Card info */}
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                      <div style={{fontSize:14,fontWeight:400,color:TX1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                        {card?.name_de||card?.name||"Unbekannte Karte"}
                      </div>
                      {showDeal&&<span style={{fontSize:9,fontWeight:600,padding:"1px 6px",borderRadius:4,background:"rgba(61,184,122,0.1)",color:GREEN,border:"0.5px solid rgba(61,184,122,0.2)"}}>DEAL</span>}
                    </div>
                    <div style={{fontSize:11,color:TX3}}>{card?.set_id?.toUpperCase()} · #{card?.number}</div>
                    {l.note&&<div style={{fontSize:11,color:TX2,marginTop:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l.note}</div>}
                  </div>
                  {/* Condition */}
                  <div style={{flexShrink:0}}>
                    <span style={{fontSize:9,fontWeight:600,padding:"2px 7px",borderRadius:4,background:"rgba(255,255,255,0.04)",color:CONDITION_COLOR[l.condition]||TX3,border:"0.5px solid rgba(255,255,255,0.08)"}}>{l.condition}</span>
                  </div>
                  {/* Seller */}
                  <div style={{flexShrink:0,textAlign:"right"}}>
                    <div style={{fontSize:12,color:TX2,marginBottom:2}}>@{l.profiles?.username||"Anonym"}</div>
                    {l.price ? (
                      <div style={{fontSize:16,fontFamily:"var(--font-mono)",fontWeight:300,color:G,letterSpacing:"-.03em"}}>
                        {l.price.toLocaleString("de-DE",{minimumFractionDigits:2})} €
                      </div>
                    ) : <div style={{fontSize:11,color:TX3}}>VB</div>}
                  </div>
                  {/* Action */}
                  <a href={`/profil/${l.profiles?.username||""}`} style={{
                    flexShrink:0,padding:"8px 16px",borderRadius:10,fontSize:12,fontWeight:400,
                    background:l.type==="offer"?G:"transparent",
                    color:l.type==="offer"?"#0a0808":G,
                    border:l.type==="offer"?"none":`1px solid ${G18}`,
                    textDecoration:"none",
                  }}>Kontakt</a>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
