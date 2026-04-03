"use client";
const G="#E9A84B",G18="rgba(233,168,75,0.18)",G08="rgba(233,168,75,0.08)";
const BG1="#111113",BG2="#1a1a1f",BG3="#222228";
const BR1="rgba(255,255,255,0.050)",BR2="rgba(255,255,255,0.085)";
const TX1="#f0f0f5",TX2="#a8a8b8",TX3="#6b6b7a";
const GREEN="#4BBF82";
import Link from "next/link";
const LB=[
  {rank:1,name:"MaxTrainer",badge:"✦",val:"12.480 €"},{rank:2,name:"SaraCollects",badge:"✦",val:"9.340 €"},
  {rank:3,name:"TCGInvestor",badge:"✦✦✦",val:"8.120 €"},{rank:4,name:"KarteCheck",badge:"",val:"4.890 €"},
  {rank:5,name:"PokeHunter99",badge:"",val:"3.240 €"},{rank:6,name:"DragonMaster",badge:"",val:"2.847 €"},
  {rank:7,name:"NachtaraFan",badge:"",val:"1.990 €"},
];
export default function LeaderboardPage() {
  return(
    <div style={{minHeight:"80vh",color:TX1}}>
      <div style={{maxWidth:860,margin:"0 auto",padding:"44px 28px"}}>
        <div style={{marginBottom:28}}>
          <h1 style={{fontSize:24,fontWeight:300,letterSpacing:"-.04em",color:TX1,marginBottom:5,fontFamily:"var(--font-display)"}}>Leaderboard</h1>
          <p style={{fontSize:12.5,color:TX3}}>Rangliste nach Portfolio-Wert · April 2026</p>
        </div>
        <div style={{display:"flex",gap:7,marginBottom:20}}>
          {["Portfolio-Wert","Scans","Forum-Posts"].map((t,i)=>(
            <button key={t} style={{padding:"5px 14px",borderRadius:8,fontSize:11.5,fontWeight:500,cursor:"pointer",border:`1px solid ${i===0?G18:BR1}`,background:i===0?G08:"transparent",color:i===0?G:TX3,transition:"all .12s"}}>{t}</button>
          ))}
        </div>
        <div style={{background:BG1,border:`1px solid ${BR2}`,borderRadius:20,overflow:"hidden"}}>
          <div style={{padding:"14px 20px",borderBottom:`1px solid ${BR1}`,display:"grid",gridTemplateColumns:"36px 48px 1fr auto",gap:14,alignItems:"center"}}>
            {["#","","Sammler","Portfolio-Wert"].map(h=><div key={h} style={{fontSize:9,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:TX3}}>{h}</div>)}
          </div>
          {LB.map((r,i)=>(
            <div key={r.rank} style={{display:"grid",gridTemplateColumns:"36px 48px 1fr auto",gap:14,padding:"14px 20px",borderBottom:i<LB.length-1?"1px solid rgba(255,255,255,0.035)":"none",alignItems:"center",cursor:"pointer",transition:"background .1s"}}
            onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background="rgba(255,255,255,0.015)";}}
            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="transparent";}}>
              <div style={{fontSize:13,fontWeight:500,fontFamily:"'DM Mono',monospace",color:r.rank<=3?G:TX3,textAlign:"center"}}>{String(r.rank).padStart(2,"0")}</div>
              <div style={{width:34,height:34,borderRadius:10,background:r.badge?G08:BG3,border:`1px solid ${r.badge?G18:BR2}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12.5,fontWeight:600,color:r.badge?G:TX2}}>{r.name[0]}</div>
              <div style={{fontSize:13,fontWeight:500,color:TX1}}>{r.name}{r.badge&&<span style={{fontSize:10,color:G,marginLeft:6}}>{r.badge}</span>}</div>
              <div style={{fontSize:13,fontWeight:500,fontFamily:"'DM Mono',monospace",color:G}}>{r.val}</div>
            </div>
          ))}
        </div>
        <div style={{background:G08,border:`1px solid ${G18}`,borderRadius:14,padding:"14px 22px",marginTop:16,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{fontSize:13,color:TX2}}>Dein Rang: <strong style={{color:TX1,fontWeight:500}}>#247</strong> · 847 € Portfolio-Wert</div>
          <Link href="/dashboard/premium" style={{padding:"5px 14px",borderRadius:8,fontSize:11.5,fontWeight:500,background:G08,color:G,border:`1px solid ${G18}`,textDecoration:"none"}}>Portfolio aufbauen ✦</Link>
        </div>
      </div>
    </div>
  );
}
