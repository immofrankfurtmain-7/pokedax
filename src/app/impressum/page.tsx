export default function ImpressumPage() {
  const T1="#EDEAF6",T2="#8A89A8",T3="#454462";
  const B2="#101020",BR2="rgba(255,255,255,0.080)";
  return(
    <div style={{minHeight:"80vh",color:T1}}>
      <div style={{maxWidth:680,margin:"0 auto",padding:"48px 24px"}}>
        <h1 style={{fontSize:22,fontWeight:500,letterSpacing:"-.03em",marginBottom:6}}>Impressum</h1>
        <p style={{fontSize:12,color:T3,marginBottom:32}}>Angaben gemäß § 5 TMG</p>
        <div style={{background:B2,border:`1px solid ${BR2}`,borderRadius:16,padding:"24px 28px",display:"flex",flexDirection:"column",gap:20}}>
          {[
            {h:"Verantwortlich",t:"PokéDax\nMaximilian Mustermann\nMusterstraße 1\n12345 Berlin\nDeutschland"},
            {h:"Kontakt",t:"E-Mail: kontakt@pokedax.de\nWebsite: https://pokedax2.vercel.app"},
            {h:"Haftungsausschluss",t:"PokéDax ist kein offizielles Produkt von The Pokémon Company. Alle Pokémon-Namen und -Marken sind Eigentum ihrer jeweiligen Inhaber. Diese Plattform dient ausschließlich informativen Zwecken."},
            {h:"Datenquelle",t:"Preisdaten werden von Cardmarket (cardmarket.com) bezogen. Karten-Informationen stammen von TCGdex. Alle Preise sind unverbindliche Richtwerte."},
          ].map(s=>(
            <div key={s.h}>
              <div style={{fontSize:11,fontWeight:600,letterSpacing:".08em",textTransform:"uppercase",color:T3,marginBottom:8}}>{s.h}</div>
              <div style={{fontSize:13,color:T2,lineHeight:1.75,whiteSpace:"pre-line"}}>{s.t}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
