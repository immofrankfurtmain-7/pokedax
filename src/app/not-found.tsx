"use client";
import Link from "next/link";
export default function NotFound() {
  return(
    <div style={{minHeight:"70vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 24px",textAlign:"center"}}>
      <div style={{marginBottom:24,animation:"spin 3s linear infinite",filter:"drop-shadow(0 0 16px rgba(233,168,75,0.25))"}}>
        <svg width="64" height="64" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="30" fill="#EE1515"/>
          <path d="M2 32 A30 30 0 0 1 62 32 Z" fill="white"/>
          <rect x="2" y="29" width="60" height="6" fill="#111"/>
          <circle cx="32" cy="32" r="10" fill="#111"/>
          <circle cx="32" cy="32" r="6" fill="white"/>
        </svg>
      </div>
      <h1 style={{fontSize:26,fontWeight:500,letterSpacing:"-.03em",marginBottom:8,color:"#EDEAF6"}}>Diese Seite ist entwischt!</h1>
      <p style={{fontSize:13,color:"#8A89A8",marginBottom:28,maxWidth:300,lineHeight:1.65}}>Der Wildpokémon-Detektor zeigt nichts an. Diese Seite existiert nicht — oder ist gerade auf der Flucht.</p>
      <div style={{display:"flex",gap:8}}>
        <Link href="/" style={{padding:"10px 22px",borderRadius:10,background:"#E9A84B",color:"#09070E",fontSize:13,fontWeight:600,textDecoration:"none"}}>Startseite</Link>
        <Link href="/preischeck" style={{padding:"10px 22px",borderRadius:10,border:"1px solid rgba(255,255,255,0.125)",color:"#8A89A8",fontSize:13,textDecoration:"none"}}>Preischeck</Link>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
