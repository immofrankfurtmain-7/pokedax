"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const B1="#0C0C1A",B2="#101020",B3="#161628",B4="#1E1E38";
const BR1="rgba(255,255,255,0.048)",BR2="rgba(255,255,255,0.080)";
const T1="#EDEAF6",T2="#8A89A8",T3="#454462";
const G="#E9A84B",G18="rgba(233,168,75,0.18)",G06="rgba(233,168,75,0.06)";
const GREEN="#4BBF82",RED="#E04558";

interface CollectionCard {
  id:string;card_id:string;quantity:number;condition?:string;
  cards?:{name:string;name_de?:string;image_url?:string;price_market?:number;set_id:string;number:string};
}

function StatCard({label,value,sub,color}:{label:string;value:string;sub?:string;color?:string}) {
  return(
    <div style={{background:B2,border:`1px solid ${BR2}`,borderRadius:14,padding:"16px 18px"}}>
      <div style={{fontSize:9.5,color:T3,marginBottom:6,letterSpacing:".04em",textTransform:"uppercase",fontWeight:600}}>{label}</div>
      <div style={{fontSize:24,fontWeight:550,letterSpacing:"-.035em",color:color??T1,lineHeight:1}}>{value}</div>
      {sub&&<div style={{fontSize:10,color:T3,marginTop:4}}>{sub}</div>}
    </div>
  );
}

export default function DashboardPage() {
  const [user,setUser]=useState<any>(null);
  const [profile,setProfile]=useState<any>(null);
  const [collection,setCollection]=useState<CollectionCard[]>([]);
  const [wishlist,setWishlist]=useState<any[]>([]);
  const [tab,setTab]=useState<"sammlung"|"wunschliste"|"scans">("sammlung");
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    async function load(){
      const {createClient}=await import("@/lib/supabase/client");
      const sb=createClient();
      const {data:{user}}=await sb.auth.getUser();
      if(!user){window.location.href="/auth/login";return;}
      setUser(user);
      const [profRes,colRes,wishRes]=await Promise.all([
        sb.from("profiles").select("*").eq("id",user.id).single(),
        sb.from("user_collection").select("*,cards(name,name_de,image_url,price_market,set_id,number)").eq("user_id",user.id).limit(40),
        sb.from("user_wishlist").select("*,cards(name,name_de,image_url,price_market,set_id,number)").eq("user_id",user.id).limit(40),
      ]);
      setProfile(profRes.data);
      setCollection(colRes.data??[]);
      setWishlist(wishRes.data??[]);
      setLoading(false);
    }
    load();
  },[]);

  const totalValue=collection.reduce((acc,c)=>acc+(c.cards?.price_market??0)*(c.quantity??1),0);
  const wishValue=wishlist.reduce((acc,w)=>acc+(w.cards?.price_market??0),0);

  if(loading)return(
    <div style={{minHeight:"80vh",display:"flex",alignItems:"center",justifyContent:"center",color:T3}}>
      Lade Dashboard…
    </div>
  );

  return(
    <div style={{minHeight:"80vh",color:T1}}>
      <div style={{maxWidth:1100,margin:"0 auto",padding:"32px 24px"}}>

        {/* Header with user card */}
        <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:12,marginBottom:28,alignItems:"start"}}>
          <div>
            <h1 style={{fontSize:22,fontWeight:500,letterSpacing:"-.03em",color:T1,marginBottom:4}}>
              Willkommen, {profile?.username??user?.email?.split("@")[0]}
            </h1>
            <p style={{fontSize:12,color:T3}}>
              {profile?.is_premium?"✦ Premium-Mitglied":"Free-Mitglied"} · Mitglied seit {new Date(user?.created_at).toLocaleDateString("de-DE",{month:"long",year:"numeric"})}
            </p>
          </div>
          {!profile?.is_premium&&(
            <Link href="/dashboard/premium" style={{
              padding:"9px 18px",borderRadius:9,
              background:G06,color:G,border:`1px solid ${G18}`,
              fontSize:12,fontWeight:500,textDecoration:"none",whiteSpace:"nowrap",
            }}>✦ Premium werden</Link>
          )}
        </div>

        {/* Stats row */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:24}}>
          <StatCard label="Sammlungswert" value={`${totalValue.toFixed(0)}€`} color={G}/>
          <StatCard label="Karten gesamt" value={collection.reduce((a,c)=>a+(c.quantity??1),0).toString()}/>
          <StatCard label="Wunschliste" value={`${wishValue.toFixed(0)}€`} sub={`${wishlist.length} Karten`}/>
          <StatCard label="Sets" value={new Set(collection.map(c=>c.cards?.set_id)).size.toString()} sub="verschiedene Sets"/>
        </div>

        {/* Sparkline */}
        <div style={{background:B2,border:`1px solid ${BR2}`,borderRadius:16,padding:"18px 20px",marginBottom:20}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div>
              <div style={{fontSize:10,color:T3,marginBottom:2}}>Portfolio-Entwicklung</div>
              <div style={{fontSize:26,fontWeight:550,letterSpacing:"-.04em",color:T1}}>{totalValue.toFixed(0)}€</div>
            </div>
            <div style={{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 10px",borderRadius:5,fontSize:11,fontWeight:500,color:GREEN,background:"rgba(75,191,130,0.08)",border:"1px solid rgba(75,191,130,0.15)"}}>▲ +0,0% · 30T</div>
          </div>
          <svg width="100%" height="48" viewBox="0 0 600 48" preserveAspectRatio="none">
            <defs><linearGradient id="dg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#E9A84B" stopOpacity=".18"/><stop offset="100%" stopColor="#E9A84B" stopOpacity="0"/></linearGradient></defs>
            <path d="M0 38 C80 36,140 32,200 26 S280 18,340 14 S420 8,480 5 S560 2,600 1 L600 48 L0 48Z" fill="url(#dg)"/>
            <path d="M0 38 C80 36,140 32,200 26 S280 18,340 14 S420 8,480 5 S560 2,600 1" fill="none" stroke="#E9A84B" strokeWidth="1.5" opacity=".65"/>
          </svg>
        </div>

        {/* Tabs */}
        <div style={{display:"flex",gap:3,marginBottom:16}}>
          {(["sammlung","wunschliste","scans"] as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{
              padding:"6px 16px",borderRadius:8,fontSize:12,fontWeight:500,cursor:"pointer",border:"none",
              background:tab===t?B3:B2,color:tab===t?T1:T3,
              transition:"all .12s",
            }}>
              {t==="sammlung"?"Sammlung":t==="wunschliste"?"Wunschliste":"Scan-Verlauf"}
              {t==="sammlung"&&collection.length>0&&<span style={{marginLeft:6,fontSize:10,color:T3}}>({collection.length})</span>}
              {t==="wunschliste"&&wishlist.length>0&&<span style={{marginLeft:6,fontSize:10,color:T3}}>({wishlist.length})</span>}
            </button>
          ))}
        </div>

        {/* Content */}
        {tab==="sammlung"&&(
          collection.length===0?(
            <div style={{background:B2,border:`1px solid ${BR2}`,borderRadius:16,padding:"48px",textAlign:"center"}}>
              <div style={{fontSize:14,color:T3,marginBottom:12}}>Sammlung ist noch leer</div>
              <Link href="/scanner" style={{fontSize:12,color:G,textDecoration:"none"}}>Karte scannen um zu beginnen →</Link>
            </div>
          ):(
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:8}}>
              {collection.map(item=>{
                const card=item.cards;
                if(!card)return null;
                const img=card.image_url??`https://assets.tcgdex.net/en/${card.set_id}/${card.number}/low.webp`;
                return(
                  <div key={item.id} style={{background:B2,border:`1px solid ${BR1}`,borderRadius:12,overflow:"hidden"}}>
                    <div style={{aspectRatio:"3/4",background:B1,display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt={card.name_de??card.name} style={{width:"100%",height:"100%",objectFit:"contain",padding:4}}/>
                      {item.quantity>1&&<div style={{position:"absolute",top:6,right:6,background:"rgba(0,0,0,0.7)",color:T1,fontSize:9,fontWeight:600,padding:"2px 5px",borderRadius:4}}>×{item.quantity}</div>}
                    </div>
                    <div style={{padding:"9px 11px 11px"}}>
                      <div style={{fontSize:11.5,fontWeight:500,color:T1,marginBottom:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{card.name_de??card.name}</div>
                      <div style={{fontSize:13,fontWeight:550,fontFamily:"'DM Mono',monospace",color:G}}>{card.price_market?`${card.price_market.toFixed(2)}€`:"–"}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
        {tab==="wunschliste"&&(
          wishlist.length===0?(
            <div style={{background:B2,border:`1px solid ${BR2}`,borderRadius:16,padding:"48px",textAlign:"center"}}>
              <div style={{fontSize:14,color:T3,marginBottom:12}}>Wunschliste ist leer</div>
              <Link href="/preischeck" style={{fontSize:12,color:G,textDecoration:"none"}}>Karten suchen und hinzufügen →</Link>
            </div>
          ):(
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:8}}>
              {wishlist.map(item=>{
                const card=item.cards;
                if(!card)return null;
                const img=card.image_url??`https://assets.tcgdex.net/en/${card.set_id}/${card.number}/low.webp`;
                return(
                  <div key={item.id} style={{background:B2,border:`1px solid ${BR1}`,borderRadius:12,overflow:"hidden"}}>
                    <div style={{aspectRatio:"3/4",background:B1,display:"flex",alignItems:"center",justifyContent:"center"}}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt={card.name_de??card.name} style={{width:"100%",height:"100%",objectFit:"contain",padding:4}}/>
                    </div>
                    <div style={{padding:"9px 11px 11px"}}>
                      <div style={{fontSize:11.5,fontWeight:500,color:T1,marginBottom:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{card.name_de??card.name}</div>
                      <div style={{fontSize:13,fontWeight:550,fontFamily:"'DM Mono',monospace",color:G}}>{card.price_market?`${card.price_market.toFixed(2)}€`:"–"}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
        {tab==="scans"&&(
          <div style={{background:B2,border:`1px solid ${BR2}`,borderRadius:16,padding:"48px",textAlign:"center"}}>
            <div style={{fontSize:14,color:T3,marginBottom:12}}>Scan-Verlauf</div>
            <Link href="/scanner" style={{fontSize:12,color:G,textDecoration:"none"}}>Karte jetzt scannen →</Link>
          </div>
        )}
      </div>
    </div>
  );
}
