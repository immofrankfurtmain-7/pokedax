import Link from "next/link";
const G="#E9A84B",TX1="#f0f0f5",TX2="#a8a8b8",TX3="#6b6b7a";
const BG1="#111113",BR1="rgba(255,255,255,0.06)";
export default function Footer() {
  return (
    <footer style={{marginTop:160,borderTop:`1px solid ${BR1}`}}>
      <div style={{maxWidth:1200,margin:"0 auto",padding:"80px 24px 56px"}}>
        <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:56,marginBottom:64}}>
          <div>
            <div style={{fontFamily:"var(--font-display)",fontSize:22,fontWeight:300,letterSpacing:"-.09em",color:TX1,marginBottom:16}}>pokédax</div>
            <p style={{fontSize:13.5,color:TX3,lineHeight:1.85,maxWidth:240,marginBottom:28}}>Quiet Collector Luxury.<br/>Präzise Preise. Edle Tools.<br/>Für ernsthafte Sammler.</p>
            <div style={{display:"flex",gap:10}}>
              {["𝕏","in","⬡"].map(s=>(
                <a key={s} href="#" style={{width:36,height:36,borderRadius:11,border:`1px solid ${BR1}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:TX3,textDecoration:"none"}}>{s}</a>
              ))}
            </div>
          </div>
          {[
            {t:"Plattform",links:[{h:"/preischeck",l:"Preischeck"},{h:"/scanner",l:"KI-Scanner"},{h:"/portfolio",l:"Portfolio"},{h:"/fantasy",l:"Fantasy League"},{h:"/forum",l:"Forum"}]},
            {t:"Community",links:[{h:"/leaderboard",l:"Leaderboard"},{h:"/forum",l:"Diskussionen"},{h:"#",l:"Discord"},{h:"#",l:"Blog"}]},
            {t:"Legal",links:[{h:"/impressum",l:"Impressum"},{h:"/datenschutz",l:"Datenschutz"},{h:"/agb",l:"AGB"},{h:"/dashboard/premium",l:"Premium ✦"}]},
          ].map(col=>(
            <div key={col.t}>
              <div style={{fontSize:10,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:TX3,marginBottom:18}}>{col.t}</div>
              <div style={{display:"flex",flexDirection:"column",gap:11}}>
                {col.links.map(l=>(
                  <Link key={l.h} href={l.h} style={{fontSize:14,color:TX2,textDecoration:"none",transition:"color .2s"}}>{l.l}</Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{borderTop:`1px solid ${BR1}`,paddingTop:28,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
          <span style={{fontSize:11.5,color:TX3}}>© 2026 PokéDax · Quiet Collector Luxury · Nicht offiziell</span>
          <span style={{fontSize:11.5,color:TX3}}>Mit Präzision entwickelt · Deutschland</span>
        </div>
      </div>
    </footer>
  );
}
