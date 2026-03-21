'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Upload, X, ChevronRight, Zap } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { formatCurrency } from '@/lib/utils'
import { SIGNAL_LABELS, SIGNAL_COLORS } from '@/lib/pokemon-api'

const SCAN_STEPS = [
  'Kartenbild wird analysiert…',
  'Pokémon wird identifiziert…',
  'Cardmarket wird abgefragt…',
  'Empfehlung wird berechnet…',
]

const MOCK_RESULT = {
  name: 'Glurak ex', set: 'Karmesin & Purpur', number: 'SV006',
  condition: 'NearMint', confidence: 94,
  price: 189.90, low: 155, high: 220, change7d: 12.4,
  signal: 'buy' as const,
  img: 'https://images.pokemontcg.io/sv1/6_hires.png',
  rec: 'Starke Nachfrage durch Turnierspieler. Preis steigt seit 3 Wochen – jetzt kaufen.',
}

function PokeballSpinner() {
  return (
    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.75, ease:'linear' }}>
      <svg viewBox="0 0 60 60" className="w-12 h-12">
        <circle cx="30" cy="30" r="28" fill="white" stroke="rgba(0,0,0,0.15)" strokeWidth="1"/>
        <path d="M2.5 30 Q2.5 3 30 3 Q57.5 3 57.5 30" fill="#CC0000"/>
        <line x1="2.5" y1="30" x2="57.5" y2="30" stroke="rgba(0,0,0,0.3)" strokeWidth="2.5"/>
        <circle cx="30" cy="30" r="9"   fill="white" stroke="rgba(0,0,0,0.2)" strokeWidth="2.5"/>
        <circle cx="30" cy="30" r="4.5" fill="rgba(245,245,245,0.9)"/>
      </svg>
    </motion.div>
  )
}

export default function ScannerPage() {
  const [tab,      setTab]      = useState<'camera' | 'upload'>('camera')
  const [camOn,    setCamOn]    = useState(false)
  const [scanning, setScanning] = useState(false)
  const [step,     setStep]     = useState('')
  const [result,   setResult]   = useState<typeof MOCK_RESULT | null>(null)
  const [conf,     setConf]     = useState(0)
  const [preview,  setPreview]  = useState<string | null>(null)

  const videoRef  = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileRef   = useRef<HTMLInputElement>(null)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } } })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setCamOn(true)
    } catch { alert('Kamerazugriff verweigert – bitte im Browser erlauben.') }
  }
  const stopCamera = () => { streamRef.current?.getTracks().forEach(t => t.stop()); setCamOn(false) }

  const doScan = () => {
    setResult(null); setScanning(true); setConf(0)
    SCAN_STEPS.forEach((s, i) => setTimeout(() => setStep(s), i * 700))
    setTimeout(() => { setScanning(false); setResult(MOCK_RESULT); setTimeout(() => setConf(MOCK_RESULT.confidence), 200) }, 3200)
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => { setPreview(ev.target?.result as string); doScan() }
    reader.readAsDataURL(file)
  }

  useEffect(() => () => stopCamera(), [])

  const signalColor = SIGNAL_COLORS[MOCK_RESULT.signal]

  return (
    <main className="min-h-screen">
      <Navbar/>
      <div className="max-w-lg mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-8">
          <div className="text-[11px] font-bold text-violet-400 uppercase tracking-widest mb-2">KI-Scanner</div>
          <h1 className="text-3xl font-black text-white tracking-tight">Karte scannen</h1>
          <p className="text-white/40 text-sm mt-1">KI erkennt deine Karte – sofort Preis + Empfehlung</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/4 border border-white/8 rounded-xl p-1 mb-5">
          {([['camera','📷 Kamera'],['upload','🖼️ Foto hochladen']] as const).map(([id,lbl]) => (
            <button key={id} onClick={() => { setTab(id); setResult(null); setPreview(null); if(id==='camera'&&camOn) stopCamera() }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${tab===id ? 'bg-violet-600/30 text-violet-200 border border-violet-600/30' : 'text-white/35 hover:text-white/65'}`}>
              {lbl}
            </button>
          ))}
        </div>

        {/* Camera */}
        {tab === 'camera' && (
          <>
            <div className="relative rounded-2xl overflow-hidden bg-black border border-white/10" style={{ aspectRatio:'3/4', maxHeight:320 }}>
              {!camOn
                ? <div className="absolute inset-0 flex flex-col items-center justify-center text-white/30 gap-3">
                    <Camera size={40} opacity={0.35}/><div className="text-sm">Kamera nicht aktiv</div>
                  </div>
                : <>
                    <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover"/>
                    {/* Scanner overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-[62%] bg-transparent border-[1.5px] border-violet-400/75 rounded-2xl relative" style={{ aspectRatio:'2.5/3.5', boxShadow:'0 0 0 2000px rgba(0,0,0,0.58)' }}>
                        <div className="scan-beam"/>
                        {/* Corner brackets */}
                        {[['top-0','left-0','borderTop','borderLeft'],['top-0','right-0','borderTop','borderRight'],['bottom-0','left-0','borderBottom','borderLeft'],['bottom-0','right-0','borderBottom','borderRight']].map(([t,l,b1,b2], i) => (
                          <div key={i} className={`absolute ${t} ${l} w-5 h-5`} style={{ [b1]:'2.5px solid #a78bfa', [b2]:'2.5px solid #a78bfa' }}/>
                        ))}
                      </div>
                    </div>
                  </>
              }
            </div>
            <div className="flex gap-3 mt-4">
              {!camOn
                ? <button onClick={startCamera} className="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-violet-600 to-purple-500 text-white shadow-[0_6px_20px_rgba(124,58,237,0.4)] hover:-translate-y-0.5 transition-all">Kamera starten</button>
                : <>
                    <button onClick={doScan} disabled={scanning} className="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-violet-600 to-purple-500 text-white shadow-[0_6px_20px_rgba(124,58,237,0.4)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all">📸 Jetzt scannen</button>
                    <button onClick={stopCamera} className="px-4 py-3 rounded-xl border border-white/10 bg-white/4 text-white/50 hover:text-white hover:border-white/20 transition-all">Stopp</button>
                  </>
              }
            </div>
          </>
        )}

        {/* Upload */}
        {tab === 'upload' && (
          <>
            <div onClick={() => fileRef.current?.click()} className="border border-dashed border-violet-700/35 rounded-2xl p-10 text-center cursor-pointer bg-violet-950/10 hover:border-violet-600/55 hover:bg-violet-950/25 transition-all">
              {preview
                ? <img src={preview} alt="" className="max-h-52 mx-auto rounded-xl object-contain"/>
                : <><Upload size={36} className="mx-auto mb-3 text-white/25"/><div className="text-sm font-medium text-white/40">Foto aus Galerie wählen</div><div className="text-xs text-white/22 mt-1">JPG, PNG · max. 10 MB</div></>
              }
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile}/>
            <button onClick={() => fileRef.current?.click()} className="w-full mt-3 py-3 rounded-xl font-bold bg-gradient-to-r from-violet-600 to-purple-500 text-white shadow-[0_6px_20px_rgba(124,58,237,0.4)] hover:-translate-y-0.5 transition-all">Datei auswählen</button>
          </>
        )}

        {/* Scanning */}
        {scanning && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="flex flex-col items-center gap-4 py-10">
            <PokeballSpinner/>
            <div className="text-sm font-medium text-white/45">{step}</div>
          </motion.div>
        )}

        {/* Result */}
        <AnimatePresence>
          {result && !scanning && (
            <motion.div
              initial={{ opacity:0, y:12, scale:0.98 }} animate={{ opacity:1, y:0, scale:1 }}
              className="mt-5 bg-[rgba(10,6,24,0.95)] border border-violet-800/25 rounded-2xl overflow-hidden backdrop-blur-2xl shadow-[0_24px_80px_rgba(0,0,0,0.5)]"
            >
              {/* Card image + info */}
              <div className="flex gap-4 p-5">
                <img src={result.img} alt={result.name} className="w-20 rounded-xl flex-shrink-0 object-contain" style={{ aspectRatio:'3/4' }}/>
                <div>
                  <div className="text-lg font-black text-white leading-tight">{result.name}</div>
                  <div className="text-xs text-white/32 mb-2 font-medium">{result.set} · {result.number} · {result.condition}</div>
                  <div className="text-3xl font-black text-white tracking-tight">{formatCurrency(result.price)}</div>
                  <span className="inline-block mt-1.5 text-[9px] font-black px-2 py-1 rounded-full tracking-wider"
                    style={{ background:`${signalColor}18`, color:signalColor, border:`1px solid ${signalColor}44` }}>
                    {SIGNAL_LABELS[result.signal]}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 px-5 pb-4">
                {[['30T Min',formatCurrency(result.low),''],['30T Max',formatCurrency(result.high),''],['7T Trend',`${result.change7d>=0?'+':''}${result.change7d}%`,result.change7d>=0?'#00e676':'#ff5252']].map(([l,v,c]) => (
                  <div key={l} className="bg-white/3 border border-white/6 rounded-xl p-2.5 text-center">
                    <div className="text-[9px] font-semibold text-white/28 uppercase tracking-widest">{l}</div>
                    <div className="text-sm font-black mt-0.5" style={{ color: c || 'white' }}>{v}</div>
                  </div>
                ))}
              </div>

              {/* Confidence */}
              <div className="px-5 pb-4">
                <div className="flex justify-between text-[10px] font-semibold mb-1.5">
                  <span className="text-white/28 uppercase tracking-widest">KI-Treffsicherheit</span>
                  <span className="text-violet-300 font-bold">{conf}%</span>
                </div>
                <div className="h-1.5 bg-white/6 rounded-full overflow-hidden">
                  <motion.div className="h-full rounded-full bg-gradient-to-r from-violet-600 via-purple-500 to-cyan-400"
                    initial={{ width:0 }} animate={{ width:`${conf}%` }} transition={{ duration:1, ease:'easeOut' }}/>
                </div>
              </div>

              {/* Recommendation */}
              <div className="px-5 pb-4">
                <div className="rounded-xl p-3 text-sm font-normal text-white/55 leading-relaxed"
                  style={{ background:`${signalColor}08`, border:`1px solid ${signalColor}22` }}>
                  <span className="font-bold tracking-wide" style={{ color:signalColor }}>{SIGNAL_LABELS[result.signal]} · </span>
                  {result.rec}
                </div>
              </div>

              {/* CTA */}
              <div className="px-5 pb-5">
                <a href={`https://www.cardmarket.com/de/Pokemon/Cards?searchString=${encodeURIComponent(result.name)}`}
                  target="_blank" rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-violet-950/50 border border-violet-700/30 text-violet-300 text-sm font-semibold hover:border-violet-600/50 hover:bg-violet-950/70 hover:-translate-y-0.5 transition-all">
                  Auf Cardmarket ansehen <ChevronRight size={14}/>
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pro Scanner upsell */}
        {result && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}
            className="mt-4 flex items-center gap-3 bg-gradient-to-r from-violet-950/50 to-purple-950/40 border border-violet-800/25 rounded-2xl px-4 py-3">
            <Zap size={16} className="text-yellow-400 flex-shrink-0"/>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white/70">Pro-Scanner freischalten</div>
              <div className="text-[10px] text-white/38">Condition-Erkennung, Alt-Art-Detection, unlimitiert</div>
            </div>
            <a href="/dashboard/premium" className="text-[10px] font-bold text-yellow-400 hover:text-yellow-300 whitespace-nowrap flex-shrink-0">Premium ↗</a>
          </motion.div>
        )}
      </div>
      <Footer/>
    </main>
  )
}
