"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const G="#00B8A8",G25="rgba(0,184,168,0.25)",G18="rgba(0,184,168,0.18)",G08="rgba(0,184,168,0.08)",G04="rgba(0,184,168,0.04)";
const BG1="#16161A",BG2="#1C1C21",BR1="rgba(255,255,255,0.045)",BR2="rgba(255,255,255,0.085)";
const TX1="#F8F6F2",TX2="#BEB9B0",TX3="#6E6B66",GREEN="#3db87a",RED="#dc4a5a";

interface ScanResult {
  status: string;
  card: { id:string; name:string; name_de:string; name_en:string; set_id:string; number:string; price_market:number|null; price_avg7:number|null; price_avg30:number|null; image_url:string|null; rarity:string|null; hp:string|null } | null;
  confidence: number;
  method: string;
  scansUsed: number | null;
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

  async function addToPortfolio(cardId: string, cardName: string) {
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const sb = createClient();
      const { data: { session } } = await sb.auth.getSession();
      if (!session) { window.location.href = "/auth/login"; return; }
      await sb.from("user_collection").upsert(
        { user_id: session.user.id, card_id: cardId, quantity: 1, condition: "NM" },
        { onConflict: "user_id,card_id" }
      );
      alert("✓ " + cardName + " zum Portfolio hinzugefügt!");
    } catch(e) { alert("Fehler beim Hinzufügen"); }
  }


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
              <span style={{padding:"3px 12px",borderRadius:6,background:scansToday>=5?`rgba(220,74,90,0.08)`:`rgba(0,184,168,0.06)`,color:scansToday>=5?RED:TX3}}>
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
                    Erkannt · {Math.round((result.confidence??0.95)*100)}% Konfidenz
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

                {/* Action Buttons */}
                <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
                  <Link href={`/preischeck/${card.id}`} style={{
                    padding:"12px 20px",borderRadius:12,background:G,color:"#0a0808",
                    fontSize:13,fontWeight:500,textDecoration:"none",textAlign:"center",
                    boxShadow:`0 2px 16px ${G25}`,display:"block",
                  }}>◈ Kartendetails ansehen</Link>
                  <button onClick={()=>addToPortfolio(card.id, card.name||"")} style={{
                    padding:"12px 20px",borderRadius:12,
                    background:"rgba(61,184,122,0.1)",color:"#3db87a",
                    fontSize:13,fontWeight:500,border:"0.5px solid rgba(61,184,122,0.3)",
                    cursor:"pointer",textAlign:"center",width:"100%",
                  }}>+ Portfolio hinzufügen</button>
                  <button onClick={()=>window.location.href=`/marketplace?sell=${card.id}&name=${encodeURIComponent(card.name_de||card.name||"")}`} style={{
                    padding:"12px 20px",borderRadius:12,
                    background:"rgba(0,184,168,0.08)",color:G,
                    fontSize:13,fontWeight:500,border:`0.5px solid ${G18}`,
                    cursor:"pointer",textAlign:"center",width:"100%",
                  }}>◎ Auf Marktplatz inserieren</button>
                  <button onClick={()=>{setResult(null);setPreview(null);setError(null);}} style={{
                    padding:"10px",borderRadius:10,background:"transparent",
                    color:TX3,fontSize:12,border:`0.5px solid ${BR1}`,cursor:"pointer",width:"100%",
                  }}>↺ Neue Karte scannen</button>
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
                <div style={{fontSize:20,fontWeight:300,color:TX1,marginBottom:8}}>{result.card?.name_de||result.card?.name||"Unbekannte Karte"}</div>
                <div style={{fontSize:13,color:TX3,marginBottom:20}}>Diese Karte ist noch nicht in unserer Datenbank.</div>
                <Link href={`/preischeck?q=${encodeURIComponent(result.card?.name_de||result.card?.name||"Erkannte Karte")}`}
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
