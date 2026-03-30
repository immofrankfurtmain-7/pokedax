import Link from "next/link";
export default function Footer() {
  const T1="#EDEAF6",T2="#8A89A8",T3="#454462";
  const B1="#0C0C1A",BR1="rgba(255,255,255,0.048)";
  return(
    <footer style={{background:B1,borderTop:`1px solid ${BR1}`,padding:"40px 24px 32px",marginTop:40}}>
      <div style={{maxWidth:1100,margin:"0 auto"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:40,marginBottom:32}}>
          <div>
            <div style={{fontSize:14.5,fontWeight:500,letterSpacing:"-.02em",color:T1,marginBottom:8}}>PokéDax</div>
            <p style={{fontSize:12,color:T3,lineHeight:1.7,maxWidth:220}}>Deutschlands #1 Pokémon TCG Plattform. Live-Preise · KI-Scanner · Community.</p>
          </div>
          <div>
            <div style={{fontSize:9,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:T3,marginBottom:12}}>Plattform</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {[{h:"/",l:"Start"},{h:"/preischeck",l:"Preischeck"},{h:"/scanner",l:"Scanner"},{h:"/forum",l:"Forum"},{h:"/dashboard",l:"Dashboard"},{h:"/spiel",l:"Spiel"}].map(l=>(
                <Link key={l.h} href={l.h} style={{fontSize:12,color:T2,textDecoration:"none"}}>{l.l}</Link>
              ))}
            </div>
          </div>
          <div>
            <div style={{fontSize:9,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:T3,marginBottom:12}}>Rechtliches</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {[{h:"/datenschutz",l:"Datenschutz"},{h:"/impressum",l:"Impressum"},{h:"/dashboard/premium",l:"Premium"}].map(l=>(
                <Link key={l.h} href={l.h} style={{fontSize:12,color:T2,textDecoration:"none"}}>{l.l}</Link>
              ))}
            </div>
          </div>
        </div>
        <div style={{borderTop:`1px solid ${BR1}`,paddingTop:20,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:11,color:T3}}>© 2026 PokéDax · Nicht offiziell · Nicht affiliiert mit The Pokémon Company</span>
          <span style={{fontSize:11,color:T3}}>Made with ♥ für Pokémon-Sammler in D/A/CH</span>
        </div>
      </div>
    </footer>
  );
}
