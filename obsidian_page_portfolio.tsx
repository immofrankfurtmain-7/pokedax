"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const G="#E9A84B",G18="rgba(233,168,75,0.18)",G08="rgba(233,168,75,0.08)";
const BG1="#16161A",BG2="#1C1C21",BR1="rgba(255,255,255,0.06)",BR2="rgba(255,255,255,0.10)";
const TX1="#f0f0f5",TX2="#a8a8b8",TX3="#6E6B66",GREEN="#4BBF82";

export default function PortfolioPage() {
  const [user,    setUser]    = useState<any>(null);
  const [col,     setCol]     = useState<any[]>([]);
  const [showDupes, setShowDupes] = useState(false);
  const [wish,    setWish]    = useState<any[]>([]);
  const [tab,     setTab]     = useState<"sammlung"|"wunschliste">("sammlung");
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    async function load(){
      const{createClient}=await import("@/lib/supabase/client");
      const sb=createClient();
      const{data:{user}}=await sb.auth.getUser();
      if(!user){window.location.href="/auth/login";return;}
      setUser(user);
      const[cR,wR]=await Promise.all([
        sb.from("user_collection").select("*,cards(name,name_de,image_url,price_market,set_id,number)").eq("user_id",user.id).limit(40),
        sb.from("user_wishlist").select("*,cards(name,name_de,image_url,price_market,set_id,number)").eq("user_id",user.id).limit(40),
      ]);
      setCol(cR.data??[]);setWish(wR.data??[]);setLoading(false);
    }
    load();
  },[]);

  const totalVal = col.reduce((a,c)=>a+(c.cards?.price_market??0)*(c.quantity??1),0);
  const wishVal  = wish.reduce((a,w)=>a+(w.cards?.price_market??0),0);
  const fmt = (n:number) => n.toLocaleString("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2});

  if(loading) return (
    <div style={{minHeight:"80vh",display:"flex",alignItems:"center",justifyContent:"center",color:TX3,fontSize:16}}>Lade Portfolio…</div>
  );

  const items = tab==="sammlung" ? col : wish;

  function exportCSV() {
    const rows = [
      ["Name","Name (DE)","Set","Nummer","Zustand","Menge","Preis (€)","Gesamt (€)"],
      ...col.map((c:any) => [
        c.cards?.name ?? "",
        c.cards?.name_de ?? "",
        c.cards?.set_id?.toUpperCase() ?? "",
        c.cards?.number ?? "",
        c.condition ?? "NM",
        c.quantity ?? 1,
        (c.cards?.price_market ?? 0).toFixed(2),
        ((c.cards?.price_market ?? 0) * (c.quantity ?? 1)).toFixed(2),
      ])
    ];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], {type:"text/csv;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "pokedax-sammlung.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  const dupes = col.filter((c:any) => (c.quantity ?? 1) > 1);
  const dupeValue = dupes.reduce((s:number,c:any) =>
    s + (c.cards?.price_market ?? 0) * ((c.quantity ?? 1) - 1), 0);

  return (
    <div style={{color:TX1,minHeight:"80vh",overflowX:"hidden"}}>
      <div style={{maxWidth:1200,margin:"0 auto",padding:"80px 24px"}}>

        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:56,flexWrap:"wrap",gap:16}}>
          <div>
            <div style={{fontSize:10,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:G,marginBottom:16}}>Dein Portfolio</div>
            <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(36px,5vw,60px)",fontWeight:300,letterSpacing:"-.07em",lineHeight:1.0,color:TX1,marginBottom:8}}>
              {user?.email?.split("@")[0]}
            </h1>
            <p style={{fontSize:14,color:TX3}}>Mitglied seit {new Date(user?.created_at).toLocaleDateString("de-DE",{month:"long",year:"numeric"})}</p>
          </div>
          <Link href="/dashboard/premium" className="gold-glow" style={{padding:"12px 24px",borderRadius:20,background:G08,color:G,border:`1px solid ${G18}`,fontSize:13,fontWeight:500,textDecoration:"none"}}>✦ Upgrade</Link>
        </div>

        {/* Stats row */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:32}}>
          {[
            {l:"Sammlungswert",v:`${totalVal.toLocaleString("de-DE",{minimumFractionDigits:2})} €`,big:true},
            {l:"Karten gesamt",v:col.reduce((a,c)=>a+(c.quantity??1),0).toString()},
            {l:"Wunschliste",v:`${wishVal.toLocaleString("de-DE",{minimumFractionDigits:2})} €`},
            {l:"Sets",v:new Set(col.map(c=>c.cards?.set_id)).size.toString()},
          ].map(s=>(
            <div key={s.l} style={{background:BG1,border:`1px solid ${s.big?"rgba(233,168,75,0.18)":BR1}`,borderRadius:22,padding:"clamp(20px,3vw,32px)"}}>
              <div style={{fontSize:10,fontWeight:600,letterSpacing:".12em",textTransform:"uppercase",color:s.big?G:TX3,marginBottom:12}}>{s.l}</div>
              <div style={{fontFamily:"var(--font-display)",fontSize:"clamp(24px,3.5vw,40px)",fontWeight:300,letterSpacing:"-.06em",color:s.big?G:TX1,lineHeight:1}}>{s.v}</div>
            </div>
          ))}
        </div>

        {/* Sparkline */}
        <div style={{background:BG1,border:`1px solid ${BR2}`,borderRadius:28,padding:"clamp(24px,4vw,40px)",marginBottom:32,position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,rgba(233,168,75,0.4),transparent)`}}/>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8,flexWrap:"wrap",gap:8}}>
            <div>
              <div style={{fontSize:11,color:TX3,marginBottom:6}}>Portfolio-Entwicklung</div>
              <div style={{fontFamily:"var(--font-display)",fontSize:"clamp(32px,4.5vw,52px)",fontWeight:300,letterSpacing:"-.055em",color:TX1,lineHeight:1}}>{totalVal.toFixed(0)} €</div>
            </div>
            <div style={{display:"flex",gap:4}}>
              {["7T","30T","90T"].map((t,i)=>(
                <div key={t} style={{padding:"5px 12px",borderRadius:10,fontSize:12,fontWeight:500,color:i===1?TX1:TX3,background:i===1?BG2:"transparent",cursor:"pointer"}}>{t}</div>
              ))}
            </div>
          </div>
          <svg width="100%" height="60" viewBox="0 0 600 60" preserveAspectRatio="none" style={{display:"block",marginTop:16}}>
            <defs><linearGradient id="pg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#E9A84B" stopOpacity=".2"/><stop offset="100%" stopColor="#E9A84B" stopOpacity="0"/></linearGradient></defs>
            <path d="M0 46 C80 44,140 38,200 30 S290 20,360 15 S450 8,520 5 S575 2,600 1 L600 60 L0 60Z" fill="url(#pg)"/>
            <path d="M0 46 C80 44,140 38,200 30 S290 20,360 15 S450 8,520 5 S575 2,600 1" fill="none" stroke="#E9A84B" strokeWidth="1.5" opacity=".7"/>
          </svg>
        </div>

        {/* Export + Duplikate */}
        {col.length > 0 && (
          <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
            <button onClick={exportCSV} style={{
              padding:"8px 16px",borderRadius:10,fontSize:12,cursor:"pointer",
              background:"rgba(255,255,255,0.04)",color:"#BEB9B0",
              border:"0.5px solid rgba(255,255,255,0.085)",
            }}>↓ CSV Export</button>
            {dupes.length > 0 && (
              <button onClick={()=>setShowDupes(v=>!v)} style={{
                padding:"8px 16px",borderRadius:10,fontSize:12,cursor:"pointer",
                background:showDupes?"rgba(212,168,67,0.1)":"rgba(255,255,255,0.04)",
                color:showDupes?"#00B8A8":"#BEB9B0",
                border:`0.5px solid ${showDupes?"rgba(212,168,67,0.2)":"rgba(255,255,255,0.085)"}`,
              }}>◈ {dupes.length} Duplikate · {dupeValue.toFixed(0)} €</button>
            )}
          </div>
        )}

        {/* Duplikate-Ansicht */}
        {showDupes && dupes.length > 0 && (
          <div style={{background:"#16161A",border:"0.5px solid rgba(0,184,168,0.18)",borderRadius:16,overflow:"hidden",marginBottom:16}}>
            <div style={{padding:"11px 16px",borderBottom:"0.5px solid rgba(255,255,255,0.045)",fontSize:10,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:"#6E6B66",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span>Duplikate</span>
              <span style={{color:"#00B8A8"}}>{dupeValue.toFixed(2)} € Potenzial</span>
            </div>
            {dupes.map((c:any)=>(
              <div key={c.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 16px",borderBottom:"0.5px solid rgba(255,255,255,0.03)"}}>
                <div style={{width:24,height:33,borderRadius:3,background:"#1C1C21",overflow:"hidden",flexShrink:0}}>
                  {c.cards?.image_url&&<img src={c.cards.image_url} alt="" style={{width:"100%",height:"100%",objectFit:"contain"}}/>}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,color:"#F8F6F2",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.cards?.name_de||c.cards?.name}</div>
                  <div style={{fontSize:10,color:"#6E6B66"}}>{c.quantity}× · {c.condition}</div>
                </div>
                <div style={{fontSize:12,fontFamily:"var(--font-mono)",color:"#EFD7A8",flexShrink:0}}>
                  {((c.cards?.price_market??0)*((c.quantity??1)-1)).toFixed(2)} €
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div style={{display:"flex",gap:6,marginBottom:28}}>
          {(["sammlung","wunschliste"] as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{
              padding:"10px 24px",borderRadius:16,fontSize:14,fontWeight:500,
              cursor:"pointer",border:"none",
              background:tab===t?BG1:"transparent",
              color:tab===t?TX1:TX3,
              outline:tab===t?`1px solid ${BR2}`:"none",
            }}>
              {t==="sammlung"?"Sammlung":"Wunschliste"}
              <span style={{marginLeft:8,fontSize:11,color:TX3}}>({t==="sammlung"?col.length:wish.length})</span>
            </button>
          ))}
        </div>

        {/* Cards */}
        {items.length===0 ? (
          <div style={{background:BG1,border:`1px solid ${BR2}`,borderRadius:28,padding:"72px",textAlign:"center"}}>
            <div style={{fontSize:16,color:TX3,marginBottom:16}}>{tab==="sammlung"?"Sammlung ist noch leer":"Wunschliste ist leer"}</div>
            <Link href={tab==="sammlung"?"/scanner":"/preischeck"} style={{fontSize:15,color:G,textDecoration:"none"}}>
              {tab==="sammlung"?"Karte scannen um zu beginnen →":"Karten entdecken →"}
            </Link>
          </div>
        ) : (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:14}}>
            {items.map((item:any)=>{
              const card=item.cards;if(!card)return null;
              const img=card.image_url??`https://assets.tcgdex.net/en/${card.set_id}/${card.number}/low.webp`;
              return (
                <div key={item.id} className="card-hover" style={{background:BG1,border:`1px solid ${BR1}`,borderRadius:22,overflow:"hidden"}}>
                  <div style={{aspectRatio:"3/4",background:BG2,display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={card.name_de??card.name} style={{width:"100%",height:"100%",objectFit:"contain",padding:6}}/>
                    {item.quantity>1&&<div style={{position:"absolute",top:8,right:8,background:"rgba(0,0,0,0.8)",color:TX1,fontSize:10,fontWeight:600,padding:"2px 6px",borderRadius:6}}>×{item.quantity}</div>}
                  </div>
                  <div style={{padding:"12px 14px 16px"}}>
                    <div style={{fontSize:13,fontWeight:500,color:TX1,marginBottom:4,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{card.name_de??card.name}</div>
                    <div style={{fontFamily:"'DM Mono',monospace",fontSize:"clamp(15px,1.4vw,18px)",color:G,fontWeight:400}}>
                      {card.price_market?`${fmt(card.price_market)} €`:"–"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
