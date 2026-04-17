"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const G="#C9A66B",G18="rgba(201,166,107,0.18)",G08="rgba(201,166,107,0.08)";
const BG1="#16161A",BG2="#1C1C21",BR1="rgba(255,255,255,0.045)",BR2="rgba(255,255,255,0.085)";
const TX1="#F8F6F2",TX2="#BEB9B0",TX3="#6E6B66",GREEN="#3db87a",RED="#dc4a5a",AMBER="#f59e0b";

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
