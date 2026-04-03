"use client";
import Link from "next/link";
export default function Footer() {
  const T1="#f0f0f5",T2="#a8a8b8",T3="#6b6b7a";
  return (
    <footer style={{background:"var(--bg-1)",borderTop:"1px solid var(--br-1)",padding:"52px 24px 36px",marginTop:56}}>
      <div style={{maxWidth:1100,margin:"0 auto"}}>
        <div style={{display:"grid",gridTemplateColumns:"1.6fr 1fr 1fr 1fr",gap:48,marginBottom:40}}>
          <div>
            <div style={{fontSize:18,fontWeight:300,letterSpacing:"-.035em",color:T1,marginBottom:12,fontFamily:"var(--font-display)"}}>pokédax</div>
            <p style={{fontSize:12.5,color:T3,lineHeight:1.75,maxWidth:230,marginBottom:20}}>Die präziseste und edelste Plattform für Pokémon TCG. Live Cardmarket-Preise. KI-Scanner. Echte Sammler-Tools.</p>
            <div style={{display:"flex",gap:10}}>
              {["𝕏","in","⬡"].map(s=>(
                <a key={s} href="#" style={{width:32,height:32,borderRadius:9,border:"1px solid var(--br-2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:T3,textDecoration:"none",transition:"all .12s"}}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color=T2;(e.currentTarget as HTMLElement).style.borderColor="var(--br-3)";}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color=T3;(e.currentTarget as HTMLElement).style.borderColor="var(--br-2)";}}>{s}</a>
              ))}
            </div>
          </div>
          {[
            {title:"Plattform",links:[{h:"/preischeck",l:"Preischeck"},{h:"/scanner",l:"KI-Scanner"},{h:"/portfolio",l:"Portfolio"},{h:"/fantasy",l:"Fantasy League"},{h:"/forum",l:"Forum"}]},
            {title:"Community",links:[{h:"/leaderboard",l:"Leaderboard"},{h:"/forum",l:"Diskussionen"},{h:"#",l:"Discord"},{h:"#",l:"Blog"}]},
            {title:"Legal",links:[{h:"/impressum",l:"Impressum"},{h:"/datenschutz",l:"Datenschutz"},{h:"/agb",l:"AGB"},{h:"/dashboard/premium",l:"Premium ✦"}]},
          ].map(col=>(
            <div key={col.title}>
              <div style={{fontSize:9,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:T3,marginBottom:14}}>{col.title}</div>
              <div style={{display:"flex",flexDirection:"column",gap:9}}>
                {col.links.map(l=>(
                  <Link key={l.h} href={l.h} style={{fontSize:12.5,color:T2,textDecoration:"none",transition:"color .12s"}}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color=T1;}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color=T2;}}>{l.l}</Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{borderTop:"1px solid var(--br-1)",paddingTop:22,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:11,color:T3}}>© 2026 PokéDax · Nicht offiziell · Nicht affiliiert mit The Pokémon Company</span>
          <span style={{fontSize:11,color:T3}}>Mit Präzision entwickelt · Deutschland</span>
        </div>
      </div>
    </footer>
  );
}
