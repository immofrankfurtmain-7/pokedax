import Link from "next/link";
const G="#E9A84B",TX1="#f0f0f5",TX2="#a8a8b8",TX3="#6b6b7a";
const BG1="#111113",BR1="rgba(255,255,255,0.06)";
export default function Footer() {
  return (
    <footer style={{borderTop:`1px solid ${BR1}`,marginTop:40}}>
      <div style={{maxWidth:1080,margin:"0 auto",padding:"64px 28px 40px"}}>
        <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:48,marginBottom:56}}>
          <div>
            <div style={{fontSize:20,fontWeight:300,letterSpacing:"-.055em",color:G,marginBottom:14,fontFamily:"var(--font-display)"}}>pokédax</div>
            <p style={{fontSize:13,color:TX3,lineHeight:1.8,maxWidth:240,marginBottom:24}}>
              Quiet Collector Luxury.<br/>
              Präzise Preise. Edle Tools.<br/>
              Für ernsthafte Sammler.
            </p>
            <div style={{display:"flex",gap:10}}>
              {["𝕏","in","⬡"].map(s=>(
                <a key={s} href="#" style={{
                  width:34,height:34,borderRadius:10,
                  border:`1px solid ${BR1}`,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:13,color:TX3,textDecoration:"none",
                  transition:"color .2s,border-color .2s",
                }}>{s}</a>
              ))}
            </div>
          </div>
          {[
            {t:"Plattform",links:[{h:"/preischeck",l:"Preischeck"},{h:"/scanner",l:"KI-Scanner"},{h:"/portfolio",l:"Portfolio"},{h:"/fantasy",l:"Fantasy League"},{h:"/forum",l:"Forum"}]},
            {t:"Community",links:[{h:"/leaderboard",l:"Leaderboard"},{h:"/forum",l:"Diskussionen"},{h:"#",l:"Discord"},{h:"#",l:"Blog"}]},
            {t:"Legal",links:[{h:"/impressum",l:"Impressum"},{h:"/datenschutz",l:"Datenschutz"},{h:"/agb",l:"AGB"},{h:"/dashboard/premium",l:"Premium ✦"}]},
          ].map(col=>(
            <div key={col.t}>
              <div style={{fontSize:9.5,fontWeight:600,letterSpacing:".12em",textTransform:"uppercase",color:TX3,marginBottom:16}}>{col.t}</div>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {col.links.map(l=>(
                  <Link key={l.h} href={l.h} style={{fontSize:13.5,color:TX2,textDecoration:"none",transition:"color .15s"}}>{l.l}</Link>
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
