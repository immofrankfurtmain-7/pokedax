"use client";
import Link from "next/link";
const G="#E9A84B",G18="rgba(233,168,75,0.18)",G08="rgba(233,168,75,0.08)";
const BG1="#111113",BR1="rgba(255,255,255,0.06)",BR2="rgba(255,255,255,0.10)";
const TX1="#f0f0f5",TX2="#a8a8b8",TX3="#6b6b7a";

const LB=[
  {r:1, name:"MaxTrainer",    badge:"✦",   val:"12.480",change:"+8,2%"},
  {r:2, name:"SaraCollects",  badge:"✦",   val:"9.340", change:"+3,1%"},
  {r:3, name:"TCGInvestor",   badge:"✦✦✦", val:"8.120", change:"+12,4%"},
  {r:4, name:"KarteCheck",    badge:"",    val:"4.890", change:"−1,8%"},
  {r:5, name:"PokeHunter99",  badge:"",    val:"3.240", change:"+5,7%"},
  {r:6, name:"DragonMaster",  badge:"",    val:"2.847", change:"+2,3%"},
  {r:7, name:"NachtaraFan",   badge:"",    val:"1.990", change:"−0,9%"},
];

export default function LeaderboardPage() {
  return (
    <div style={{color:TX1,minHeight:"80vh"}}>
      <div style={{maxWidth:900,margin:"0 auto",padding:"80px 24px"}}>
        <div style={{marginBottom:64}}>
          <div style={{fontSize:10,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:G,marginBottom:16}}>Community</div>
          <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(40px,6vw,68px)",fontWeight:300,letterSpacing:"-.07em",lineHeight:1.0,color:TX1,marginBottom:10}}>Leaderboard</h1>
          <p style={{fontSize:15,color:TX3}}>Rangliste nach Portfolio-Wert · April 2026</p>
        </div>

        {/* Podium — top 3 */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1.15fr 1fr",gap:10,marginBottom:16,alignItems:"flex-end"}}>
          {[LB[1],LB[0],LB[2]].map((r,i)=>{
            const isCenter = i===1;
            return (
              <div key={r.name} className={isCenter?"gold-glow":""} style={{
                background:isCenter?`radial-gradient(ellipse 80% 55% at 50% 0%,rgba(233,168,75,0.09),transparent 55%),${BG1}`:BG1,
                border:isCenter?"1px solid rgba(233,168,75,0.25)":`1px solid ${BR1}`,
                borderRadius:24,padding:isCenter?"clamp(24px,3vw,36px)":"clamp(18px,2.5vw,28px)",
                textAlign:"center",position:"relative",
              }}>
                {isCenter&&<div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,rgba(233,168,75,0.5),transparent)`,borderRadius:"24px 24px 0 0"}}/>}
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:isCenter?14:12,fontWeight:600,color:isCenter?G:TX3,marginBottom:10}}>
                  {["02","01","03"][i]}
                </div>
                <div style={{width:isCenter?52:44,height:isCenter?52:44,borderRadius:"50%",background:isCenter?"rgba(233,168,75,0.1)":"rgba(255,255,255,0.05)",border:isCenter?`2px solid rgba(233,168,75,0.3)`:`1px solid ${BR2}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:isCenter?20:17,fontWeight:600,color:isCenter?G:TX2,margin:"0 auto 14px"}}>
                  {r.name[0]}
                </div>
                <div style={{fontSize:isCenter?15:13,fontWeight:500,color:TX1,marginBottom:3}}>{r.name}</div>
                {r.badge&&<div style={{fontSize:10,color:G,marginBottom:8}}>{r.badge}</div>}
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:isCenter?20:16,color:isCenter?G:TX2,fontWeight:400}}>{r.val} €</div>
              </div>
            );
          })}
        </div>

        {/* Rank 4–7 */}
        <div style={{background:BG1,border:`1px solid ${BR2}`,borderRadius:24,overflow:"hidden",marginBottom:20}}>
          {LB.slice(3).map((r,i)=>(
            <div key={r.name} style={{
              display:"grid",gridTemplateColumns:"52px 52px 1fr auto auto",
              gap:12,padding:"18px 24px",
              borderBottom:i<3?`1px solid rgba(255,255,255,0.04)`:"none",
              alignItems:"center",
            }}>
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:13,fontWeight:600,color:TX3,textAlign:"center"}}>{String(r.r).padStart(2,"0")}</div>
              <div style={{width:36,height:36,borderRadius:11,background:"rgba(255,255,255,0.04)",border:`1px solid ${BR1}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:600,color:TX2}}>{r.name[0]}</div>
              <div style={{fontSize:14,fontWeight:500,color:TX1}}>{r.name}</div>
              <div style={{fontSize:12,color:r.change.startsWith("+")?G:"rgba(224,69,88,0.8)",fontFamily:"'DM Mono',monospace"}}>{r.change}</div>
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:15,color:TX2,fontWeight:400,textAlign:"right"}}>{r.val} €</div>
            </div>
          ))}
        </div>

        {/* Your rank */}
        <div style={{background:G08,border:`1px solid ${G18}`,borderRadius:20,padding:"18px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
          <div style={{fontSize:14,color:TX2}}>Dein Rang: <strong style={{color:TX1,fontWeight:500}}>#247</strong> · 847 € Portfolio-Wert</div>
          <Link href="/dashboard/premium" className="gold-glow" style={{padding:"10px 22px",borderRadius:14,background:G,color:"#0a0808",fontSize:13,fontWeight:600,textDecoration:"none"}}>Portfolio aufbauen ✦</Link>
        </div>
      </div>
    </div>
  );
}
