import Link from "next/link";
export const metadata = { title:"Impressum" };
const TX1="#f0f0f5",TX2="#a8a8b8",TX3="#6b6b7a";
const BG1="#111113",BR2="rgba(255,255,255,0.085)";
export default function ImpressumPage() {
  return(
    <div style={{minHeight:"80vh",color:TX1}}>
      <div style={{maxWidth:680,margin:"0 auto",padding:"52px 28px"}}>
        <h1 style={{fontSize:24,fontWeight:300,letterSpacing:"-.04em",marginBottom:6,fontFamily:"var(--font-display)"}}>Impressum</h1>
        <p style={{fontSize:12.5,color:TX3,marginBottom:32}}>Angaben gemäß § 5 TMG</p>
        <div style={{background:BG1,border:`1px solid ${BR2}`,borderRadius:18,padding:"28px 32px",display:"flex",flexDirection:"column",gap:22}}>
          {[
            {h:"Verantwortlich",t:"PokéDax\nMusterstraße 12\n80331 München"},
            {h:"Kontakt",t:"E-Mail: hello@pokedax.de\nWebsite: https://pokedax2.vercel.app"},
            {h:"Haftungsausschluss",t:"PokéDax ist kein offizielles Produkt von The Pokémon Company. Alle Pokémon-Namen und Marken sind Eigentum ihrer Inhaber. Diese Plattform dient ausschließlich informativen Zwecken."},
            {h:"Datenquelle",t:"Preisdaten von Cardmarket (cardmarket.com). Karteninformationen von TCGdex. Alle Preise sind unverbindliche Richtwerte."},
          ].map(s=>(
            <div key={s.h}>
              <div style={{fontSize:10.5,fontWeight:600,letterSpacing:".08em",textTransform:"uppercase",color:TX3,marginBottom:8}}>{s.h}</div>
              <div style={{fontSize:13.5,color:TX2,lineHeight:1.78,whiteSpace:"pre-line"}}>{s.t}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}