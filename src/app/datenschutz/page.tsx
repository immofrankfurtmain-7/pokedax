"use client";
const TX1="#ededf2",TX2="#a4a4b4",TX3="#62626f";
export default function DatenschutzPage() {
  return (
    <div style={{color:TX1,minHeight:"80vh",maxWidth:720,margin:"0 auto",padding:"clamp(52px,7vw,80px) clamp(16px,3vw,28px)"}}>
      <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(26px,4vw,40px)",fontWeight:200,letterSpacing:"-.04em",marginBottom:24}}>Datenschutz</h1>
      <div style={{fontSize:13,color:TX2,lineHeight:1.8}}>
        <p style={{marginBottom:16}}>Der Schutz Ihrer persönlichen Daten ist uns wichtig. Diese Datenschutzerklärung informiert Sie über die Verarbeitung personenbezogener Daten auf pokédax.</p>
        <h2 style={{fontSize:16,fontWeight:400,color:TX1,marginBottom:8,marginTop:20}}>Verantwortlicher</h2>
        <p style={{marginBottom:16}}>Verantwortlich für die Datenverarbeitung ist der Betreiber von pokédax.</p>
        <h2 style={{fontSize:16,fontWeight:400,color:TX1,marginBottom:8,marginTop:20}}>Datenerhebung</h2>
        <p style={{marginBottom:16}}>Wir erheben nur Daten die für den Betrieb der Plattform notwendig sind: E-Mail-Adresse, Nutzername, Sammlungsdaten und Transaktionsdaten.</p>
        <h2 style={{fontSize:16,fontWeight:400,color:TX1,marginBottom:8,marginTop:20}}>Cookies</h2>
        <p style={{marginBottom:16}}>Wir verwenden technisch notwendige Cookies für die Authentifizierung.</p>
        <h2 style={{fontSize:16,fontWeight:400,color:TX1,marginBottom:8,marginTop:20}}>Kontakt</h2>
        <p>Bei Fragen zum Datenschutz kontaktieren Sie uns über das Impressum.</p>
      </div>
    </div>
  );
}
