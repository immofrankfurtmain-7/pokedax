"use client";
import { useState } from "react";
const G="#E9A84B",G18="rgba(233,168,75,0.18)",G08="rgba(233,168,75,0.08)";
const BG1="#111113",BG2="#1a1a1f",BR1="rgba(255,255,255,0.06)",BR2="rgba(255,255,255,0.10)";
const TX1="#f0f0f5",TX2="#a8a8b8",TX3="#6b6b7a";

function Toggle({on,set}:{on:boolean;set:(v:boolean)=>void}) {
  return (
    <div onClick={()=>set(!on)} style={{
      width:44,height:26,borderRadius:13,cursor:"pointer",flexShrink:0,
      background:on?G:"rgba(255,255,255,0.06)",
      border:`1px solid ${on?"rgba(233,168,75,0.3)":BR2}`,
      position:"relative",transition:"all .22s var(--ease)",
    }}>
      <div style={{
        position:"absolute",width:20,height:20,borderRadius:"50%",
        background:on?"#0a0808":TX3,top:2,
        left:on?20:2,transition:"left .22s var(--ease)",
      }}/>
    </div>
  );
}

export default function SettingsPage() {
  const [alerts, setAlerts] = useState(true);
  const [pub,    setPub]    = useState(false);
  const [news,   setNews]   = useState(true);
  const [nav,    setNav]    = useState("account");

  const NAV = [
    {id:"account",l:"Account"},
    {id:"notifications",l:"Benachrichtigungen"},
    {id:"privacy",l:"Datenschutz"},
    {id:"subscription",l:"Abonnement"},
  ];

  return (
    <div style={{color:TX1,minHeight:"80vh"}}>
      <div style={{maxWidth:1100,margin:"0 auto",padding:"80px 24px"}}>
        <div style={{marginBottom:56}}>
          <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(36px,5vw,56px)",fontWeight:300,letterSpacing:"-.07em",color:TX1,marginBottom:8}}>Einstellungen</h1>
          <p style={{fontSize:15,color:TX3}}>Account, Benachrichtigungen, Datenschutz</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"240px 1fr",gap:20}}>
          {/* Sidebar */}
          <div style={{background:BG1,border:`1px solid ${BR1}`,borderRadius:24,padding:10,height:"fit-content"}}>
            {NAV.map(n=>(
              <div key={n.id} onClick={()=>setNav(n.id)} style={{
                padding:"12px 18px",borderRadius:16,fontSize:14,fontWeight:400,
                color:nav===n.id?G:TX2,
                background:nav===n.id?G08:"transparent",
                cursor:"pointer",marginBottom:2,
                transition:"all .15s",
              }}>{n.l}</div>
            ))}
            <div style={{margin:"8px 0",borderTop:`1px solid ${BR1}`,paddingTop:8}}>
              <div style={{padding:"12px 18px",borderRadius:16,fontSize:14,color:"#E04558",cursor:"pointer"}}>Abmelden</div>
            </div>
          </div>

          {/* Content */}
          <div style={{background:BG1,border:`1px solid ${BR1}`,borderRadius:24,padding:"clamp(24px,3vw,40px)"}}>
            <div style={{fontFamily:"var(--font-display)",fontSize:22,fontWeight:300,letterSpacing:"-.04em",color:TX1,marginBottom:4}}>Account</div>
            <div style={{fontSize:13,color:TX3,marginBottom:32}}>Verwalte deine Profil-Informationen</div>

            {[
              {l:"Benutzername",v:"MaxTrainer"},
              {l:"E-Mail",v:"max@example.de"},
              {l:"Passwort",v:"Zuletzt geändert vor 3 Monaten"},
            ].map(row=>(
              <div key={row.l} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 0",borderBottom:`1px solid ${BR1}`}}>
                <div>
                  <div style={{fontSize:14.5,fontWeight:500,color:TX1}}>{row.l}</div>
                  <div style={{fontSize:12,color:TX3,marginTop:2}}>{row.v}</div>
                </div>
                <button style={{padding:"8px 18px",borderRadius:12,fontSize:12.5,color:TX2,border:`1px solid ${BR2}`,background:"transparent",cursor:"pointer"}}>Bearbeiten</button>
              </div>
            ))}

            {[
              {l:"Preis-Alerts via E-Mail",sub:"Benachrichtigung wenn Zielpreis erreicht",v:alerts,set:setAlerts},
              {l:"Öffentliches Profil",sub:"Andere Sammler können dein Portfolio sehen",v:pub,set:setPub},
              {l:"Newsletter",sub:"Monatliche Marktanalysen und News",v:news,set:setNews},
            ].map(row=>(
              <div key={row.l} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 0",borderBottom:`1px solid ${BR1}`}}>
                <div>
                  <div style={{fontSize:14.5,fontWeight:500,color:TX1}}>{row.l}</div>
                  <div style={{fontSize:12,color:TX3,marginTop:2}}>{row.sub}</div>
                </div>
                <Toggle on={row.v} set={row.set}/>
              </div>
            ))}

            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 0"}}>
              <div>
                <div style={{fontSize:14.5,fontWeight:500,color:"#E04558"}}>Account löschen</div>
                <div style={{fontSize:12,color:TX3,marginTop:2}}>Alle Daten werden permanent gelöscht</div>
              </div>
              <button style={{padding:"8px 18px",borderRadius:12,fontSize:12.5,color:"#E04558",border:"1px solid rgba(224,69,88,0.25)",background:"transparent",cursor:"pointer"}}>Löschen</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
