export default function DatenschutzPage() {
  const T1="#EDEAF6",T2="#8A89A8",T3="#454462";
  const B2="#101020",BR2="rgba(255,255,255,0.080)";
  const sections=[
    {h:"Verantwortlicher",t:"PokéDax, Musterstraße 1, 12345 Berlin. kontakt@pokedax.de"},
    {h:"Erhobene Daten",t:"Bei der Registrierung erheben wir: E-Mail-Adresse und Benutzername. Bei der Nutzung werden gespeichert: Scan-Verlauf, Wunschliste und Sammlung. Diese Daten sind notwendig für die Bereitstellung unseres Services."},
    {h:"Zweck der Verarbeitung",t:"Die erhobenen Daten dienen ausschließlich der Bereitstellung des PokéDax-Services: Preischeck, Portfolio-Tracking, Scanner-Funktion und Community-Forum."},
    {h:"Speicherung",t:"Daten werden in Supabase (EU-Server) gespeichert. Passwörter werden ausschließlich als bcrypt-Hash gespeichert. Wir haben keinen Zugriff auf Klartext-Passwörter."},
    {h:"Weitergabe an Dritte",t:"Wir geben keine personenbezogenen Daten an Dritte weiter. Preisdaten werden von Cardmarket (externe API) bezogen — dabei werden keine Nutzerdaten übermittelt."},
    {h:"Ihre Rechte",t:"Sie haben das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung Ihrer Daten (Art. 15–18 DSGVO). Anfragen richten Sie bitte an: kontakt@pokedax.de"},
    {h:"Cookies",t:"PokéDax verwendet ausschließlich technisch notwendige Cookies für die Authentifizierung. Es werden keine Tracking- oder Marketing-Cookies eingesetzt."},
    {h:"Kontakt Datenschutz",t:"Bei Fragen zum Datenschutz: kontakt@pokedax.de"},
  ];
  return(
    <div style={{minHeight:"80vh",color:T1}}>
      <div style={{maxWidth:680,margin:"0 auto",padding:"48px 24px"}}>
        <h1 style={{fontSize:22,fontWeight:500,letterSpacing:"-.03em",marginBottom:6}}>Datenschutzerklärung</h1>
        <p style={{fontSize:12,color:T3,marginBottom:32}}>Gemäß DSGVO · Stand: 2026</p>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {sections.map(s=>(
            <div key={s.h} style={{background:B2,border:`1px solid ${BR2}`,borderRadius:14,padding:"18px 22px"}}>
              <div style={{fontSize:11,fontWeight:600,letterSpacing:".08em",textTransform:"uppercase",color:T3,marginBottom:8}}>{s.h}</div>
              <div style={{fontSize:13,color:T2,lineHeight:1.75}}>{s.t}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
