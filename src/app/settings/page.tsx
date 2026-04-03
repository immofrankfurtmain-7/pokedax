"use client";
import { useState } from "react";
const G="#E9A84B",G18="rgba(233,168,75,0.18)",G08="rgba(233,168,75,0.08)";
const BG1="#111113",BG2="#1a1a1f",BG3="#222228";
const BR1="rgba(255,255,255,0.050)",BR2="rgba(255,255,255,0.085)";
const TX1="#f0f0f5",TX2="#a8a8b8",TX3="#6b6b7a";
export default function SettingsPage() {
  const [alerts,setAlerts]=useState(true);
  const [pub,setPub]=useState(false);
  const [nav,setNav]=useState("account");
  const NAV=[{id:"account",l:"Account"},{id:"notifications",l:"Benachrichtigungen"},{id:"privacy",l:"Datenschutz"},{id:"subscription",l:"Abonnement"}];
  return(
    <div style={{minHeight:"80vh",color:TX1}}>
      <div style={{maxWidth:1100,margin:"0 auto",padding:"44px 28px"}}>
        <div style={{marginBottom:28}}>
          <h1 style={{fontSize:24,fontWeight:300,letterSpacing:"-.04em",color:TX1,marginBottom:5,fontFamily:"var(--font-display)"}}>Einstellungen</h1>
          <p style={{fontSize:12.5,color:TX3}}>Account, Benachrichtigungen, Datenschutz</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"210px 1fr",gap:20}}>
          <div style={{background:BG1,border:`1px solid ${BR1}`,borderRadius:16,padding:8,height:"fit-content"}}>
            {NAV.map(n=>(
              <div key={n.id} onClick={()=>setNav(n.id)} style={{padding:"9px 14px",borderRadius:9,fontSize:13,color:nav===n.id?G:TX2,background:nav===n.id?G08:"transparent",cursor:"pointer",marginBottom:2,transition:"all .12s"}}>{n.l}</div>
            ))}
            <div style={{margin:"8px 0 0",borderTop:`1px solid ${BR1}`,paddingTop:8}}>
              <div style={{padding:"9px 14px",borderRadius:9,fontSize:13,color:"#E04558",cursor:"pointer"}}>Abmelden</div>
            </div>
          </div>
          <div style={{background:BG1,border:`1px solid ${BR1}`,borderRadius:18,padding:24}}>
            <div style={{fontSize:15,fontWeight:500,color:TX1,marginBottom:4}}>Account</div>
            <div style={{fontSize:12,color:TX3,marginBottom:24}}>Verwalte deine Profil-Informationen</div>
            {[
              {l:"Benutzername",v:"MaxTrainer"},{l:"E-Mail",v:"max@example.de"},{l:"Passwort",v:"Zuletzt geändert vor 3 Monaten"},
            ].map(r=>(
              <div key={r.l} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 0",borderBottom:`1px solid ${BR1}`}}>
                <div>
                  <div style={{fontSize:13.5,fontWeight:500,color:TX1}}>{r.l}</div>
                  <div style={{fontSize:11,color:TX3,marginTop:2}}>{r.v}</div>
                </div>
                <button style={{padding:"5px 13px",borderRadius:8,fontSize:11.5,color:TX2,border:`1px solid ${BR2}`,background:"transparent",cursor:"pointer"}}>Bearbeiten</button>
              </div>
            ))}
            {[
              {l:"Preis-Alerts via E-Mail",sub:"Benachrichtigung wenn Zielpreis erreicht",v:alerts,set:setAlerts},
              {l:"Öffentliches Profil",sub:"Andere können dein Portfolio sehen",v:pub,set:setPub},
            ].map(r=>(
              <div key={r.l} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 0",borderBottom:`1px solid ${BR1}`}}>
                <div>
                  <div style={{fontSize:13.5,fontWeight:500,color:TX1}}>{r.l}</div>
                  <div style={{fontSize:11,color:TX3,marginTop:2}}>{r.sub}</div>
                </div>
                <div onClick={()=>r.set(!r.v)} style={{width:38,height:22,borderRadius:11,background:r.v?G:BG3,border:`1px solid ${r.v?G18:BR2}`,position:"relative",cursor:"pointer",transition:"all .2s var(--ease)"}}>
                  <div style={{position:"absolute",width:16,height:16,borderRadius:"50%",background:r.v?"#0a0808":TX3,top:2,left:r.v?18:2,transition:"all .2s var(--ease)"}}/>
                </div>
              </div>
            ))}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 0"}}>
              <div>
                <div style={{fontSize:13.5,fontWeight:500,color:"#E04558"}}>Account löschen</div>
                <div style={{fontSize:11,color:TX3,marginTop:2}}>Alle Daten werden permanent gelöscht</div>
              </div>
              <button style={{padding:"5px 13px",borderRadius:8,fontSize:11.5,color:"#E04558",border:"1px solid rgba(224,69,88,0.3)",background:"transparent",cursor:"pointer"}}>Löschen</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
