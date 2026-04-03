"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
const G="#E9A84B",G18="rgba(233,168,75,0.18)",G08="rgba(233,168,75,0.08)";
const BG1="#111113",BG2="#1a1a1f",BG3="#222228";
const BR1="rgba(255,255,255,0.050)",BR2="rgba(255,255,255,0.085)";
const TX1="#f0f0f5",TX2="#a8a8b8",TX3="#6b6b7a";
const GREEN="#4BBF82";
export default function PortfolioPage() {
  const [user,setUser]=useState<any>(null);
  const [col,setCol]=useState<any[]>([]);
  const [wish,setWish]=useState<any[]>([]);
  const [tab,setTab]=useState<"sammlung"|"wunschliste">("sammlung");
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    async function load(){
      const {createClient}=await import("@/lib/supabase/client");
      const sb=createClient();
      const {data:{user}}=await sb.auth.getUser();
      if(!user){window.location.href="/auth/login";return;}
      setUser(user);
      const [cR,wR]=await Promise.all([
        sb.from("user_collection").select("*,cards(name,name_de,image_url,price_market,set_id,number)").eq("user_id",user.id).limit(40),
        sb.from("user_wishlist").select("*,cards(name,name_de,image_url,price_market,set_id,number)").eq("user_id",user.id).limit(40),
      ]);
      setCol(cR.data??[]);setWish(wR.data??[]);setLoading(false);
    }
    load();
  },[]);
  const totalVal=col.reduce((a,c)=>a+(c.cards?.price_market??0)*(c.quantity??1),0);
  const wishVal=wish.reduce((a,w)=>a+(w.cards?.price_market??0),0);
  if(loading)return<div style={{minHeight:"80vh",display:"flex",alignItems:"center",justifyContent:"center",color:TX3}}>Lade Portfolio…</div>;
  return(
    <div style={{minHeight:"80vh",color:TX1}}>
      <div style={{maxWidth:1100,margin:"0 auto",padding:"44px 28px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:28}}>
          <div>
            <h1 style={{fontSize:24,fontWeight:300,letterSpacing:"-.04em",color:TX1,marginBottom:5,fontFamily:"var(--font-display)"}}>
              Willkommen, {user?.email?.split("@")[0]}
            </h1>
            <p style={{fontSize:12.5,color:TX3}}>Dein persönliches Portfolio · Mitglied seit {new Date(user?.created_at).toLocaleDateString("de-DE",{month:"long",year:"numeric"})}</p>
          </div>
          <Link href="/dashboard/premium" style={{padding:"7px 16px",borderRadius:9,background:G08,color:G,border:`1px solid ${G18}`,fontSize:12,fontWeight:500,textDecoration:"none"}}>✦ Upgrade</Link>
        </div>
        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:20}}>
          {[
            {l:"Sammlungswert",v:`${totalVal.toLocaleString("de-DE",{minimumFractionDigits:0})} €`,c:G},
            {l:"Karten",v:col.reduce((a,c)=>a+(c.quantity??1),0).toString()},
            {l:"Wunschliste",v:`${wishVal.toLocaleString("de-DE",{minimumFractionDigits:0})} €`},
            {l:"Sets",v:new Set(col.map(c=>c.cards?.set_id)).size.toString()},
          ].map(s=>(
            <div key={s.l} style={{background:BG1,border:`1px solid ${BR2}`,borderRadius:14,padding:"16px 18px"}}>
              <div style={{fontSize:9.5,color:TX3,marginBottom:6,letterSpacing:".05em",textTransform:"uppercase",fontWeight:600}}>{s.l}</div>
              <div style={{fontSize:26,fontWeight:400,letterSpacing:"-.04em",color:s.c??TX1,fontFamily:"'DM Mono',monospace"}}>{s.v}</div>
            </div>
          ))}
        </div>
        {/* Sparkline */}
        <div style={{background:BG1,border:`1px solid ${BR2}`,borderRadius:18,padding:"20px 22px",marginBottom:20,position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,rgba(233,168,75,0.3),transparent)`}}/>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
            <div>
              <div style={{fontSize:10.5,color:TX3,marginBottom:5}}>Portfolio-Entwicklung</div>
              <div style={{fontSize:32,fontWeight:300,letterSpacing:"-.05em",color:TX1,lineHeight:1,fontFamily:"'DM Mono',monospace"}}>{totalVal.toFixed(0)} €</div>
            </div>
            <div style={{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 10px",borderRadius:5,fontSize:11,fontWeight:500,color:GREEN,background:"rgba(75,191,130,0.08)",border:"1px solid rgba(75,191,130,0.15)"}}>▲ +0 % · 30T</div>
          </div>
          <svg width="100%" height="48" viewBox="0 0 600 48" preserveAspectRatio="none">
            <defs><linearGradient id="dg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#E9A84B" stopOpacity=".18"/><stop offset="100%" stopColor="#E9A84B" stopOpacity="0"/></linearGradient></defs>
            <path d="M0 38 C80 36,140 32,200 26 S280 18,340 14 S420 8,480 5 S560 2,600 1 L600 48 L0 48Z" fill="url(#dg)"/>
            <path d="M0 38 C80 36,140 32,200 26 S280 18,340 14 S420 8,480 5 S560 2,600 1" fill="none" stroke="#E9A84B" strokeWidth="1.5" opacity=".65"/>
          </svg>
        </div>
        {/* Tabs */}
        <div style={{display:"flex",gap:4,marginBottom:18}}>
          {(["sammlung","wunschliste"] as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{padding:"6px 18px",borderRadius:9,fontSize:12.5,fontWeight:500,cursor:"pointer",border:"none",background:tab===t?BG2:BG1,color:tab===t?TX1:TX3,transition:"all .12s"}}>
              {t==="sammlung"?"Sammlung":"Wunschliste"}
              <span style={{marginLeft:6,fontSize:10,color:TX3}}>({t==="sammlung"?col.length:wish.length})</span>
            </button>
          ))}
        </div>
        {/* Grid */}
        {(tab==="sammlung"?col:wish).length===0?(
          <div style={{background:BG1,border:`1px solid ${BR2}`,borderRadius:16,padding:"52px",textAlign:"center"}}>
            <div style={{fontSize:14,color:TX3,marginBottom:12}}>{tab==="sammlung"?"Sammlung ist noch leer":"Wunschliste ist leer"}</div>
            <Link href={tab==="sammlung"?"/scanner":"/preischeck"} style={{fontSize:13,color:G,textDecoration:"none"}}>{tab==="sammlung"?"Karte scannen um zu beginnen →":"Karten suchen und hinzufügen →"}</Link>
          </div>
        ):(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(128px,1fr))",gap:9}}>
            {(tab==="sammlung"?col:wish).map((item:any)=>{
              const card=item.cards;if(!card)return null;
              const img=card.image_url??`https://assets.tcgdex.net/en/${card.set_id}/${card.number}/low.webp`;
              return(
                <div key={item.id} style={{background:BG1,border:`1px solid ${BR1}`,borderRadius:13,overflow:"hidden"}}>
                  <div style={{aspectRatio:"3/4",background:BG2,display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={card.name_de??card.name} style={{width:"100%",height:"100%",objectFit:"contain",padding:4}}/>
                    {item.quantity>1&&<div style={{position:"absolute",top:6,right:6,background:"rgba(0,0,0,0.75)",color:TX1,fontSize:9,fontWeight:600,padding:"2px 5px",borderRadius:4}}>×{item.quantity}</div>}
                  </div>
                  <div style={{padding:"9px 11px 12px"}}>
                    <div style={{fontSize:12,fontWeight:500,color:TX1,marginBottom:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{card.name_de??card.name}</div>
                    <div style={{fontSize:13.5,fontWeight:500,fontFamily:"'DM Mono',monospace",color:G}}>{card.price_market?`${Number(card.price_market).toLocaleString("de-DE",{minimumFractionDigits:2})} €`:"–"}</div>
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
