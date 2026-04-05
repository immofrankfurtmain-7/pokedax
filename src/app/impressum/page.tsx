export const dynamic = "force-dynamic";
export const metadata = { title:"Impressum" };
const TX1="#f0f0f5",TX2="#a8a8b8",TX3="#6b6b7a";
const BG1="#111113",BR1="rgba(255,255,255,0.06)",BR2="rgba(255,255,255,0.10)";
const G="#E9A84B";
export default function ImpressumPage() {
  return (
    <div style={{minHeight:"80vh",color:TX1}}>
      <div style={{maxWidth:720,margin:"0 auto",padding:"clamp(40px,8vw,80px) clamp(16px,4vw,24px)"}}>
        <div style={{marginBottom:48}}>
          <div style={{fontSize:10,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:G,marginBottom:16}}>Rechtliches</div>
          <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(36px,5vw,52px)",fontWeight:300,letterSpacing:"-.06em",color:TX1,marginBottom:8}}>Impressum</h1>
          <p style={{fontSize:14,color:TX3}}>Angaben gemäß § 5 TMG</p>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {[
            {
              h:"Verantwortlicher",
              content:(
                <div style={{fontSize:15,color:TX2,lineHeight:1.85}}>
                  <strong style={{color:TX1,display:"block",marginBottom:4}}>Damir Babic</strong>
                  Ricarda-Huch-Str. 15<br/>
                  60431 Frankfurt am Main<br/>
                  Deutschland
                </div>
              ),
            },
            {
              h:"Kontakt",
              content:(
                <div style={{fontSize:15,color:TX2,lineHeight:1.85}}>
                  E-Mail: <a href="mailto:hello@pokedax.de" style={{color:G,textDecoration:"none"}}>hello@pokedax.de</a><br/>
                  Website: <a href="https://pokedax2.vercel.app" style={{color:G,textDecoration:"none"}}>pokedax2.vercel.app</a>
                </div>
              ),
            },
            {
              h:"Haftungsausschluss",
              content:<p style={{fontSize:15,color:TX2,lineHeight:1.85}}>PokéDax ist kein offizielles Produkt von The Pokémon Company International. Alle Pokémon-Namen, Marken und zugehörige Zeichen sind Eigentum ihrer jeweiligen Inhaber. Diese Plattform dient ausschließlich informativen Zwecken und ist nicht offiziell mit The Pokémon Company verbunden.</p>,
            },
            {
              h:"Datenquelle",
              content:<p style={{fontSize:15,color:TX2,lineHeight:1.85}}>Preisdaten stammen von Cardmarket (cardmarket.com). Karteninformationen von TCGdex. Alle Preise sind unverbindliche Richtwerte und können von tatsächlichen Marktpreisen abweichen.</p>,
            },
            {
              h:"Streitschlichtung",
              content:<p style={{fontSize:15,color:TX2,lineHeight:1.85}}>Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: <a href="https://ec.europa.eu/consumers/odr" style={{color:G,textDecoration:"none"}}>ec.europa.eu/consumers/odr</a>. Wir sind nicht verpflichtet noch bereit, an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>,
            },
          ].map(s=>(
            <div key={s.h} style={{background:BG1,border:`1px solid ${BR2}`,borderRadius:22,padding:"clamp(18px,3vw,28px) clamp(20px,3vw,32px)"}}>
              <div style={{fontSize:10,fontWeight:600,letterSpacing:".12em",textTransform:"uppercase",color:TX3,marginBottom:14}}>{s.h}</div>
              {s.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
