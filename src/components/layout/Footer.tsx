import Link from "next/link";
const G="#D4A843", TX1="#ededf2", TX2="#a4a4b4", TX3="#62626f";
const BG1="#111114", BR1="rgba(255,255,255,0.045)";
export default function Footer() {
  return (
    <footer style={{borderTop:`1px solid ${BR1}`,marginTop:0}}>
      <div style={{maxWidth:1240,margin:"0 auto",padding:"clamp(60px,8vw,100px) clamp(16px,3vw,32px) clamp(40px,5vw,60px)"}}>
        <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:"clamp(32px,5vw,64px)",marginBottom:56}}>
          <div>
            <div style={{fontFamily:"var(--font-display)",fontSize:20,fontWeight:300,letterSpacing:"-.08em",color:G,marginBottom:16}}>pokédax</div>
            <p style={{fontSize:13.5,color:TX3,lineHeight:1.85,maxWidth:220,marginBottom:28}}>Quiet Collector Luxury.<br/>Präzise Preise. Edle Tools.<br/>Für ernsthafte Sammler.</p>
            <div style={{display:"flex",gap:8}}>
              {["𝕏","in","⬡"].map(s=>(
                <a key={s} href="#" style={{width:34,height:34,borderRadius:10,border:`1px solid ${BR1}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:TX3,textDecoration:"none"}}>{s}</a>
              ))}
            </div>
          </div>
          {[
            {t:"Plattform",links:[{h:"/preischeck",l:"Preischeck"},{h:"/scanner",l:"KI-Scanner"},{h:"/portfolio",l:"Portfolio"},{h:"/fantasy",l:"Fantasy League"},{h:"/forum",l:"Forum"}]},
            {t:"Community",links:[{h:"/leaderboard",l:"Leaderboard"},{h:"/forum",l:"Diskussionen"},{h:"#",l:"Discord"},{h:"#",l:"Blog"}]},
            {t:"Legal",links:[{h:"/impressum",l:"Impressum"},{h:"/datenschutz",l:"Datenschutz"},{h:"/agb",l:"AGB"},{h:"/dashboard/premium",l:"Premium ✦"}]},
          ].map(col=>(
            <div key={col.t}>
              <div style={{fontSize:9.5,fontWeight:600,letterSpacing:".16em",textTransform:"uppercase",color:TX3,marginBottom:18}}>{col.t}</div>
              <div style={{display:"flex",flexDirection:"column",gap:11}}>
                {col.links.map(l=>(
                  <Link key={l.h} href={l.h} style={{fontSize:13.5,color:TX2,textDecoration:"none"}}>{l.l}</Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{borderTop:`1px solid ${BR1}`,paddingTop:24,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
          <span style={{fontSize:12,color:TX3}}>© 2026 PokéDax · Quiet Collector Luxury · Nicht offiziell</span>
          <span style={{fontSize:12,color:TX3}}>Mit Präzision entwickelt · Deutschland</span>
        </div>
      </div>
    </footer>
  );
}
