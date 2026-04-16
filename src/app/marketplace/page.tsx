"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const G="#D4A843",G25="rgba(212,168,67,0.25)",G18="rgba(212,168,67,0.18)",G10="rgba(212,168,67,0.10)",G05="rgba(0,184,168,0.05)";
const BG1="#16161A",BG2="#1C1C21",BG3="#222228";
const BR1="rgba(255,255,255,0.045)",BR2="rgba(255,255,255,0.085)",BR3="rgba(255,255,255,0.13)";
const TX1="#F8F6F2",TX2="#BEB9B0",TX3="#6E6B66";
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
