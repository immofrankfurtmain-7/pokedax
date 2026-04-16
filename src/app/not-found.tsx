import Link from "next/link";
const G="#E9A84B",TX1="#f0f0f5",TX2="#a8a8b8",TX3="#6b6b7a";
export default function NotFound() {
  return (
    <div style={{minHeight:"70vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 24px",textAlign:"center",color:TX1}}>
      <div style={{fontFamily:"var(--font-display)",fontSize:"clamp(80px,16vw,160px)",fontWeight:300,letterSpacing:"-.08em",color:"rgba(255,255,255,0.04)",lineHeight:1,marginBottom:24,userSelect:"none"}}>404</div>
      <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(26px,3vw,38px)",fontWeight:300,letterSpacing:"-.04em",marginBottom:14,color:TX1}}>Diese Karte ist entwischt.</h1>
      <p style={{fontSize:16,color:TX2,marginBottom:44,maxWidth:360,lineHeight:1.72}}>Diese Seite existiert nicht — oder befindet sich gerade auf einem Turnier irgendwo da draußen.</p>
      <div style={{display:"flex",gap:12,flexWrap:"wrap",justifyContent:"center"}}>
        <Link href="/" className="gold-glow" style={{padding:"15px 32px",borderRadius:22,background:G,color:"#0a0808",fontSize:14,fontWeight:600,textDecoration:"none"}}>Startseite</Link>
        <Link href="/preischeck" className="gold-glow" style={{padding:"15px 32px",borderRadius:22,border:"1px solid rgba(255,255,255,0.12)",color:TX2,fontSize:14,textDecoration:"none"}}>Preischeck</Link>
      </div>
    </div>
  );
}
