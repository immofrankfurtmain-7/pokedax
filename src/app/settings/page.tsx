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
