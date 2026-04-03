export const dynamic = "force-dynamic";
import Link from "next/link";
export const metadata = { title:"Datenschutz" };
const TX1="#f0f0f5",TX2="#a8a8b8",TX3="#6b6b7a";
const BG1="#111113",BR2="rgba(255,255,255,0.085)";
export default function DatenschutzPage() {
  const sections=[
    {h:"Verantwortlicher",t:"PokéDax, Musterstraße 12, 80331 München. hello@pokedax.de"},
    {h:"Erhobene Daten",t:"E-Mail, Benutzername, Scan-Verlauf, Wunschliste, Sammlung."},
    {h:"Zweck",t:"Bereitstellung des PokéDax-Services."},
    {h:"Speicherung",t:"EU-Server (Supabase). Passwörter als bcrypt-Hash."},
    {h:"Weitergabe",t:"Keine Weitergabe an Dritte."},
    {h:"Ihre Rechte",t:"Auskunft, Berichtigung, Löschung (Art. 15-18 DSGVO). Anfragen: hello@pokedax.de"},
    {h:"Cookies",t:"Nur technisch notwendige Session-Cookies. Kein Tracking."},
  ] as const;
  return(
    <div style={{minHeight:"80vh",color:TX1}}>
      <div style={{maxWidth:680,margin:"0 auto",padding:"52px 28px"}}>
        <h1 style={{fontSize:24,fontWeight:300,letterSpacing:"-.04em",marginBottom:6,fontFamily:"var(--font-display)"}}>Datenschutz</h1>
        <p style={{fontSize:12.5,color:TX3,marginBottom:32}}>Gemäß DSGVO · Stand 2026</p>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {sections.map(s=>(
            <div key={s.h} style={{background:BG1,border:`1px solid ${BR2}`,borderRadius:14,padding:"18px 22px"}}>
              <div style={{fontSize:10.5,fontWeight:600,letterSpacing:".08em",textTransform:"uppercase",color:TX3,marginBottom:8}}>{s.h}</div>
              <div style={{fontSize:13.5,color:TX2,lineHeight:1.78}}>{s.t}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}