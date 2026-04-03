import Link from "next/link";
const G="#E9A84B", TX1="#f0f0f5", TX2="#a8a8b8";
export default function NotFound() {
  return(
    <div style={{minHeight:"70vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 24px",textAlign:"center",color:TX1}}>
      <div style={{marginBottom:24}}>
        <svg width="56" height="56" viewBox="0 0 64 64" style={{opacity:.6}}>
          <circle cx="32" cy="32" r="30" fill="#1a1a1f"/>
          <circle cx="32" cy="32" r="30" fill="none" stroke={G} strokeWidth="1.5" opacity=".4"/>
          <path d="M6 32 A26 26 0 0 1 58 32" fill="none" stroke={G} strokeWidth="2" opacity=".7"/>
          <line x1="6" y1="32" x2="58" y2="32" stroke={G} strokeWidth="1" opacity=".3"/>
          <circle cx="32" cy="32" r="8" fill="none" stroke={G} strokeWidth="1.5" opacity=".7"/>
          <circle cx="32" cy="32" r="3" fill={G}/>
        </svg>
      </div>
      <h1 style={{fontSize:26,fontWeight:300,letterSpacing:"-.04em",marginBottom:8,fontFamily:"var(--font-display)"}}>Diese Karte ist entwischt.</h1>
      <p style={{fontSize:13.5,color:TX2,marginBottom:28,maxWidth:300,lineHeight:1.7}}>Diese Seite existiert nicht — oder ist gerade auf der Flucht.</p>
      <div style={{display:"flex",gap:8}}>
        <Link href="/" style={{padding:"10px 24px",borderRadius:11,background:G,color:"#0a0808",fontSize:13,fontWeight:600,textDecoration:"none"}}>Startseite</Link>
        <Link href="/preischeck" style={{padding:"10px 24px",borderRadius:11,border:"1px solid rgba(255,255,255,0.13)",color:TX2,fontSize:13,textDecoration:"none"}}>Preischeck</Link>
      </div>
    </div>
  );
}
