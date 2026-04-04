"use client";
import { useState, useRef } from "react";
import Link from "next/link";

const G="#E9A84B",G18="rgba(233,168,75,0.18)",G08="rgba(233,168,75,0.08)";
const BG1="#111113",BR1="rgba(255,255,255,0.06)",BR2="rgba(255,255,255,0.10)";
const TX1="#f0f0f5",TX2="#a8a8b8",TX3="#6b6b7a",GREEN="#4BBF82";

interface ScanResult { name:string; set:string; price:string; confidence:number; }

export default function ScannerPage() {
  const [dragging, setDragging] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [result,   setResult]   = useState<ScanResult|null>(null);
  const [preview,  setPreview]  = useState<string|null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    const url = URL.createObjectURL(file);
    setPreview(url);
    setResult(null);
    setScanning(true);
    setTimeout(()=>{
      setScanning(false);
      setResult({name:"Glurak ex",set:"Obsidian Flames · #234",price:"184,50 €",confidence:97});
    },2200);
  }

  return (
    <div style={{color:TX1,minHeight:"80vh"}}>
      <div style={{maxWidth:1100,margin:"0 auto",padding:"80px 24px"}}>

        {/* Header */}
        <div style={{textAlign:"center",marginBottom:72}}>
          <div style={{fontSize:10,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:G,marginBottom:24}}>KI-Scanner</div>
          <h1 style={{
            fontFamily:"var(--font-display)",
            fontSize:"clamp(40px,6.5vw,72px)",
            fontWeight:300,letterSpacing:"-.085em",lineHeight:1.0,
            marginBottom:20,color:TX1,
          }}>Foto machen.<br/><span style={{color:G}}>Preis wissen.</span></h1>
          <p style={{fontSize:"clamp(16px,1.8vw,22px)",color:TX2,maxWidth:500,margin:"0 auto",lineHeight:1.65}}>
            Halte deine Karte vor die Kamera. In Sekunden erhältst du den aktuellen Marktwert von Cardmarket.
          </p>
        </div>

        {/* Main card */}
        <div style={{
          background:BG1,border:`1px solid ${BR2}`,borderRadius:32,
          overflow:"hidden",position:"relative",
        }}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,rgba(233,168,75,0.4),transparent)`}}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",minHeight:480}}>

            {/* Upload side */}
            <div style={{padding:"clamp(32px,5vw,64px)",display:"flex",flexDirection:"column",justifyContent:"center",borderRight:`1px solid ${BR1}`}}>
              <input ref={inputRef} type="file" accept="image/*" style={{display:"none"}}
                onChange={e=>e.target.files?.[0]&&handleFile(e.target.files[0])}/>
              <div
                onClick={()=>inputRef.current?.click()}
                onDragOver={e=>{e.preventDefault();setDragging(true);}}
                onDragLeave={()=>setDragging(false)}
                onDrop={e=>{e.preventDefault();setDragging(false);e.dataTransfer.files[0]&&handleFile(e.dataTransfer.files[0]);}}
                style={{
                  borderRadius:22,border:`1.5px dashed ${dragging?"rgba(233,168,75,0.5)":BR2}`,
                  background:dragging?"rgba(233,168,75,0.03)":"rgba(0,0,0,0.2)",
                  display:"flex",flexDirection:"column",alignItems:"center",
                  justifyContent:"center",gap:16,cursor:"pointer",
                  aspectRatio:"4/3",marginBottom:24,
                  transition:"all .3s var(--ease)",
                  overflow:"hidden",position:"relative",
                }}>
                {preview ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={preview} alt="Vorschau" style={{width:"100%",height:"100%",objectFit:"contain",padding:12}}/>
                ) : (
                  <>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={TX3} strokeWidth="1.2" style={{opacity:.35}}>
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                    <div style={{textAlign:"center"}}>
                      <div style={{fontSize:16,color:TX2,marginBottom:4,fontWeight:400}}>Karte hier ablegen</div>
                      <div style={{fontSize:13,color:TX3}}>oder klicken zum Hochladen</div>
                      <div style={{fontSize:11,color:TX3,marginTop:8,padding:"3px 12px",borderRadius:8,background:"rgba(255,255,255,0.04)",display:"inline-block"}}>JPG · PNG · WEBP · max 10 MB</div>
                    </div>
                  </>
                )}
              </div>
              <button onClick={()=>!scanning&&inputRef.current?.click()} className="gold-glow" style={{
                width:"100%",padding:"18px",borderRadius:20,
                background:scanning?G08:G,
                color:scanning?"#E9A84B":"#0a0808",
                fontSize:16,fontWeight:600,border:scanning?`1px solid ${G18}`:"none",
                cursor:scanning?"wait":"pointer",letterSpacing:"-.01em",
                transition:"all .3s",
              }}>
                {scanning ? "Erkennt Karte…" : "Jetzt scannen"}
              </button>
              <div style={{textAlign:"center",marginTop:14,fontSize:13,color:TX3}}>
                5 / 5 Scans heute ·{" "}
                <Link href="/dashboard/premium" style={{color:G,textDecoration:"none"}}>Unlimitiert mit Premium ✦</Link>
              </div>
            </div>

            {/* Result side */}
            <div style={{padding:"clamp(32px,5vw,64px)",display:"flex",flexDirection:"column",justifyContent:"center"}}>
              {scanning ? (
                <div style={{textAlign:"center"}}>
                  <div style={{
                    width:64,height:64,borderRadius:"50%",
                    border:`2px solid ${G18}`,borderTopColor:G,
                    margin:"0 auto 24px",
                    animation:"spin 0.8s linear infinite",
                  }}/>
                  <div style={{fontSize:16,color:TX2}}>KI analysiert deine Karte…</div>
                  <div style={{fontSize:13,color:TX3,marginTop:8}}>Abgleich mit 22.000+ Karten</div>
                </div>
              ) : result ? (
                <div>
                  <div style={{fontSize:10,fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:GREEN,marginBottom:20,display:"flex",alignItems:"center",gap:8}}>
                    <span style={{width:6,height:6,borderRadius:"50%",background:GREEN,display:"inline-block"}}/>
                    Erkannt · {result.confidence}% Konfidenz
                  </div>
                  <div style={{fontFamily:"var(--font-display)",fontSize:"clamp(28px,3.5vw,44px)",fontWeight:300,letterSpacing:"-.04em",color:TX1,marginBottom:10,lineHeight:1.1}}>{result.name}</div>
                  <div style={{fontSize:15,color:TX2,marginBottom:32}}>{result.set}</div>
                  <div style={{fontFamily:"'DM Mono',monospace",fontSize:"clamp(44px,5vw,64px)",fontWeight:400,color:G,letterSpacing:"-.04em",lineHeight:1,marginBottom:32}}>{result.price}</div>
                  <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                    <Link href={`/preischeck?q=${encodeURIComponent(result.name)}`} className="gold-glow" style={{padding:"12px 24px",borderRadius:16,background:G,color:"#0a0808",fontSize:14,fontWeight:600,textDecoration:"none"}}>Preishistorie ansehen</Link>
                    <button onClick={()=>{setResult(null);setPreview(null);}} style={{padding:"12px 24px",borderRadius:16,background:"transparent",color:TX2,fontSize:14,border:`1px solid ${BR2}`,cursor:"pointer"}}>Neue Karte</button>
                  </div>
                </div>
              ) : (
                <div style={{textAlign:"center"}}>
                  <div style={{fontSize:52,marginBottom:16,opacity:.2}}>📸</div>
                  <div style={{fontSize:16,color:TX3,lineHeight:1.7}}>Lade eine Karte hoch<br/>um den Preis zu sehen</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
