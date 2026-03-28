'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

type Card = {
  id: string
  name: string
  number: string
  set_id: string
  image_url: string | null
  price_market: number
  sets: { name: string }
}

type Score = { id: string; username: string; score: number; created_at: string }

const MEDALS = ['','','']

function fmt(n: number) {
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' '
}

export default function SpielPage() {
  const [cardA,    setCardA]    = useState<Card | null>(null)
  const [cardB,    setCardB]    = useState<Card | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [result,   setResult]   = useState<'correct'|'wrong'|null>(null)
  const [score,    setScore]    = useState(0)
  const [streak,   setStreak]   = useState(0)
  const [best,     setBest]     = useState(0)
  const [total,    setTotal]    = useState(0)
  const [loading,  setLoading]  = useState(true)
  const [scores,   setScores]   = useState<Score[]>([])
  const [user,     setUser]     = useState<any>(null)
  const [saved,    setSaved]    = useState(false)

  const loadCards = useCallback(async () => {
    setLoading(true)
    setRevealed(false)
    setResult(null)
    setSaved(false)
    const res  = await fetch('/api/spiel')
    const data = await res.json()
    if (data.cardA && data.cardB) { setCardA(data.cardA); setCardB(data.cardB) }
    setLoading(false)
  }, [])

  const loadScores = useCallback(async () => {
    const res  = await fetch('/api/game-scores')
    const data = await res.json()
    setScores(data.scores ?? [])
  }, [])

  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(({ data: { user } }) => setUser(user))
    loadCards()
    loadScores()
  }, [loadCards, loadScores])

  async function saveScore(s: number) {
    if (!user || s < 1 || saved) return
    setSaved(true)
    await fetch('/api/game-scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score: s }),
    })
    loadScores()
  }

  function guess(side: 'A'|'B') {
    if (!cardA || !cardB || revealed) return
    setRevealed(true)
    setTotal(t => t + 1)

    const correct =
      (side === 'A' && cardA.price_market >= cardB.price_market) ||
      (side === 'B' && cardB.price_market >= cardA.price_market)

    if (correct) {
      setResult('correct')
      setScore(s => s + 1)
      setStreak(s => { const n = s + 1; setBest(b => Math.max(b, n)); return n })
    } else {
      setResult('wrong')
      saveScore(streak)
      setStreak(0)
    }
  }

  return (
    <>
      <main className="min-h-screen bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 pt-24 pb-12">

          <div className="text-center mb-8">
            <div className="text-xs text-cyan-400 uppercase tracking-widest mb-2">PokeDax Mini-Game</div>
            <h1 className="text-4xl font-black mb-1" style={{ background:'linear-gradient(90deg,#a855f7,#06b6d4)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              Welche ist mehr wert?
            </h1>
            <p className="text-gray-400 text-sm">Klicke die teurere Karte  echte Cardmarket-Preise</p>
          </div>

          <div className="grid grid-cols-4 gap-3 mb-8">
            {[
              { label:'Richtig', val:score,  color:'#22c55e' },
              { label:'Serie',   val:streak, color:'#a855f7' },
              { label:'Rekord',  val:best,   color:'#eab308' },
              { label:'Runden',  val:total,  color:'#06b6d4' },
            ].map(s => (
              <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
                <div className="text-xs text-gray-500 mb-1">{s.label}</div>
                <div className="text-2xl font-black" style={{ color: s.color }}>{s.val}</div>
              </div>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-32 text-gray-500">
              <div className="text-center">
                <div className="text-4xl mb-3"></div>
                <p>Karten werden geladen...</p>
              </div>
            </div>
          ) : cardA && cardB ? (
            <>
              <div className="grid grid-cols-2 gap-6 mb-6">
                {([['A', cardA],['B', cardB]] as ['A'|'B', Card][]).map(([side, card]) => {
                  const isWinner = revealed && (
                    (side === 'A' && cardA.price_market >= cardB.price_market) ||
                    (side === 'B' && cardB.price_market >= cardA.price_market)
                  )
                  const isLoser = revealed && !isWinner
                  const wasClicked = revealed && result !== null && (
                    (result === 'correct' && isWinner) || (result === 'wrong' && isLoser)
                  )

                  return (
                    <button key={side} onClick={() => guess(side)} disabled={revealed}
                      className="relative rounded-2xl overflow-hidden border-2 transition-all duration-300 group disabled:cursor-default w-full"
                      style={{
                        borderColor: revealed
                          ? isWinner ? '#22c55e' : '#ef4444'
                          : 'rgba(255,255,255,0.1)',
                        background: revealed
                          ? isWinner ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.06)'
                          : 'rgba(255,255,255,0.02)',
                        transform: !revealed ? 'scale(1)' : isWinner ? 'scale(1.02)' : 'scale(0.98)',
                      }}>

                      {!revealed && (
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none"
                          style={{ background:'linear-gradient(135deg,rgba(168,85,247,0.1),rgba(6,182,212,0.1))' }}/>
                      )}

                      {revealed && isWinner && (
                        <div className="absolute top-3 right-3 z-20 text-2xl"></div>
                      )}

                      <div className="p-6 flex flex-col items-center">
                        <div className="relative mb-4" style={{ width:150, height:210 }}>
                          {card.image_url ? (
                            <Image src={card.image_url} alt={card.name} fill
                              className="object-contain rounded-lg"
                              style={{
                                filter: revealed && isWinner
                                  ? 'drop-shadow(0 0 16px rgba(168,85,247,0.7))'
                                  : revealed ? 'brightness(0.6)' : 'none',
                                transition: 'all .3s'
                              }}
                              sizes="150px" />
                          ) : (
                            <div className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center text-gray-600 text-sm">Kein Bild</div>
                          )}

                          {!revealed && (
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="bg-black/60 rounded-full px-4 py-2 text-white text-sm font-bold border border-white/20">
                                Auswaehlen
                              </div>
                            </div>
                          )}
                        </div>

                        <p className="font-bold text-white text-base mb-0.5 text-center">{card.name}</p>
                        <p className="text-xs text-gray-500 mb-3 text-center">{card.sets?.name}  #{card.number}</p>

                        {(side === 'A' || revealed) ? (
                          <div className="text-2xl font-black" style={{ color: revealed && isWinner ? '#22c55e' : revealed ? '#ef4444' : '#06b6d4' }}>
                            {fmt(card.price_market)}
                          </div>
                        ) : (
                          <div className="text-2xl font-black text-gray-600">??? </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>

              {revealed ? (
                <div className="text-center">
                  <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold mb-4 ${
                    result === 'correct'
                      ? 'bg-green-900/40 border border-green-700 text-green-300'
                      : 'bg-red-900/40 border border-red-700 text-red-300'
                  }`}>
                    {result === 'correct'
                      ? 'Richtig! Serie laeuft weiter: ' + streak
                      : 'Falsch! Deine Serie: ' + (best > 0 ? best : 0)}
                  </div>
                  {result === 'wrong' && !user && (
                    <p className="text-xs text-gray-500 mb-3">Einloggen um deinen Score zu speichern!</p>
                  )}
                  <div>
                    <button onClick={loadCards}
                      className="px-8 py-3 rounded-xl font-bold text-white transition-all hover:scale-105 active:scale-95"
                      style={{ background:'linear-gradient(135deg,#7c3aed,#0891b2)' }}>
                      Naechste Runde
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-center text-sm text-gray-600">Klicke direkt auf die Karte die du fuer teurer haeltst</p>
              )}
            </>
          ) : (
            <div className="text-center py-20 text-gray-500">
              <button onClick={loadCards} className="px-4 py-2 bg-gray-800 rounded-lg text-sm">Nochmal versuchen</button>
            </div>
          )}

          {/* Globaler Highscore */}
          <div className="mt-12 bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
              <div className="text-sm font-bold text-yellow-400 uppercase tracking-widest">Globale Bestenliste</div>
              <div className="text-xs text-gray-500">Top 10 aller Zeiten</div>
            </div>
            {scores.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-600 text-sm">Noch keine Scores  sei der Erste!</div>
            ) : (
              <div>
                {scores.map((s, i) => (
                  <div key={s.id ?? i} className={'flex items-center justify-between px-6 py-3 border-b border-gray-800 last:border-0 ' + (i === 0 ? 'bg-yellow-950/20' : '')}>
                    <div className="flex items-center gap-3">
                      <span className="text-lg w-7 text-center">
                        {i < 3 ? MEDALS[i] : <span className="text-gray-500 text-sm">{i + 1}.</span>}
                      </span>
                      <span className={'font-medium ' + (i === 0 ? 'text-yellow-300' : 'text-white')}>{s.username}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={'font-black text-lg ' + (i === 0 ? 'text-yellow-300' : 'text-white')}>{s.score}</span>
                      <span className="text-xs text-gray-500">{new Date(s.created_at).toLocaleDateString('de-DE')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </>
  )
}