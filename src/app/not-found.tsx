import Link from "next/link";
const G="#E9A84B",TX1="#f0f0f5",TX2="#a8a8b8";
export default function NotFound() {
  return (
    <div style={{minHeight:"70vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 24px",textAlign:"center",color:TX1}}>
      <div style={{fontFamily:"var(--font-display)",fontSize:"clamp(72px,12vw,140px)",fontWeight:300,letterSpacing:"-.08em",color:"rgba(255,255,255,0.05)",lineHeight:1,marginBottom:32}}>404</div>
      <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(24px,3vw,36px)",fontWeight:300,letterSpacing:"-.04em",marginBottom:14}}>Diese Karte ist entwischt.</h1>
      <p style={{fontSize:16,color:TX2,marginBottom:36,maxWidth:320,lineHeight:1.7}}>Diese Seite existiert nicht — vielleicht hilft der Preischeck?</p>
      <div style={{display:"flex",gap:12}}>
        <Link href="/" className="gold-glow" style={{padding:"14px 28px",borderRadius:20,background:G,color:"#0a0808",fontSize:14,fontWeight:600,textDecoration:"none"}}>Startseite</Link>
        <Link href="/preischeck" className="gold-glow" style={{padding:"14px 28px",borderRadius:20,border:"1px solid rgba(255,255,255,0.15)",color:TX2,fontSize:14,textDecoration:"none"}}>Preischeck</Link>
      </div>
    </div>
  );
}
