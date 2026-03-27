'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'

type Card = {
  id: string
  name: string
  number: string
  set_id: string
  image_url: string | null
  price_market: number
  sets: { name: string }
}

type HS = { score: number; date: string }

function fmt(n: number) {
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' '
}

const MEDALS = ['','','']

export default function SpielPage() {
  const [cardA,     setCardA]     = useState<Card | null>(null)
  const [cardB,     setCardB]     = useState<Card | null>(null)
  const [revealed,  setRevealed]  = useState(false)
  const [result,    setResult]    = useState<'correct'|'wrong'|null>(null)
  const [score,     setScore]     = useState(0)
  const [streak,    setStreak]    = useState(0)
  const [best,      setBest]      = useState(0)
  const [total,     setTotal]     = useState(0)
  const [loading,   setLoading]   = useState(true)
  const [highscores,setHighscores]= useState<HS[]>([])

  const loadCards = useCallback(async () => {
    setLoading(true)
    setRevealed(false)
    setResult(null)
    const res  = await fetch('/api/spiel')
    const data = await res.json()
    if (data.cardA && data.cardB) {
      setCardA(data.cardA)
      setCardB(data.cardB)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadCards()
    try {
      const saved = localStorage.getItem('pokedax_hs')
      if (saved) setHighscores(JSON.parse(saved))
    } catch {}
  }, [loadCards])

  function saveScore(s: number) {
    if (s === 0) return
    const now  = new Date().toLocaleDateString('de-DE')
    const next = [...highscores, { score: s, date: now }]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
    setHighscores(next)
    try { localStorage.setItem('pokedax_hs', JSON.stringify(next)) } catch {}
  }

  function guess(side: 'A' | 'B') {
    if (!cardA || !cardB || revealed) return
    setRevealed(true)
    setTotal(t => t + 1)

    const correct =
      (side === 'A' && cardA.price_market >= cardB.price_market) ||
      (side === 'B' && cardB.price_market >= cardA.price_market)

    if (correct) {
      setResult('correct')
      setScore(s => s + 1)
      setStreak(s => {
        const next = s + 1
        setBest(b => Math.max(b, next))
        return next
      })
    } else {
      setResult('wrong')
      saveScore(streak)
      setStreak(0)
    }
  }

  function next() { loadCards() }

  const typeColor = '#4B0082'

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 pt-24 pb-12">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-xs text-cyan-400 uppercase tracking-widest mb-2">PokeDax Mini-Game</div>
            <h1 className="text-4xl font-black mb-1" style={{ background:'linear-gradient(90deg,#a855f7,#06b6d4)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              Welche ist mehr wert?
            </h1>
            <p className="text-gray-400 text-sm">Tippe die teurere Karte  echte Cardmarket-Preise</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mb-8">
            {[
              { label: 'Richtig', val: score, color: '#22c55e' },
              { label: 'Serie',   val: streak, color: '#a855f7' },
              { label: 'Rekord',  val: best,   color: '#eab308' },
              { label: 'Gespielt',val: total,  color: '#06b6d4' },
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
                <div className="text-4xl mb-3 animate-spin"></div>
                <p>Karten werden geladen...</p>
              </div>
            </div>
          ) : cardA && cardB ? (
            <>
              {/* Cards */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {([['A', cardA], ['B', cardB]] as ['A'|'B', Card][]).map(([side, card]) => {
                  const isCorrect = revealed && result === 'correct' && (
                    (side === 'A' && cardA.price_market >= cardB.price_market) ||
                    (side === 'B' && cardB.price_market >= cardA.price_market)
                  )
                  const isWrong = revealed && result === 'wrong' && (
                    (side === 'A' && cardA.price_market < cardB.price_market) ||
                    (side === 'B' && cardB.price_market < cardA.price_market)
                  )
                  const isHigher = revealed && (
                    (side === 'A' && cardA.price_market >= cardB.price_market) ||
                    (side === 'B' && cardB.price_market >= cardA.price_market)
                  )

                  return (
                    <button
                      key={side}
                      onClick={() => guess(side)}
                      disabled={revealed}
                      className="relative rounded-2xl overflow-hidden border-2 transition-all duration-300 text-left group disabled:cursor-default"
                      style={{
                        borderColor: isCorrect ? '#22c55e' : isWrong ? '#ef4444' : 'rgba(255,255,255,0.08)',
                        background: isCorrect ? 'rgba(34,197,94,0.08)' : isWrong ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.03)',
                      }}>

                      {/* Holo shimmer */}
                      {!revealed && (
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
                          style={{ background:'linear-gradient(110deg,transparent 30%,rgba(168,85,247,0.06) 50%,transparent 70%)' }}/>
                      )}

                      {/* Winner crown */}
                      {isHigher && revealed && (
                        <div className="absolute top-3 right-3 z-20 text-xl">
                          {result === 'correct' ? '' : ''}
                        </div>
                      )}

                      <div className="p-5">
                        {/* Card image */}
                        <div className="relative w-full mb-4 flex justify-center">
                          <div className="relative" style={{ width: 140, height: 196 }}>
                            {card.image_url ? (
                              <Image
                                src={card.image_url}
                                alt={card.name}
                                fill
                                className="object-contain rounded-lg"
                                style={{
                                  filter: revealed && isHigher ? 'drop-shadow(0 0 12px rgba(168,85,247,0.6))' : 'none',
                                  transition: 'filter .3s'
                                }}
                                sizes="140px"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center text-gray-600 text-sm">
                                Kein Bild
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Card info */}
                        <div className="text-center">
                          <p className="font-bold text-white text-base leading-tight mb-0.5">{card.name}</p>
                          <p className="text-xs text-gray-500 mb-3">{card.sets?.name}  #{card.number}</p>

                          {/* Price  revealed for A always, B only after guess */}
                          {(side === 'A' || revealed) ? (
                            <div className="text-2xl font-black" style={{ color: isHigher && revealed ? '#22c55e' : '#06b6d4' }}>
                              {fmt(card.price_market)}
                            </div>
                          ) : (
                            <div className="text-2xl font-black text-gray-600 select-none">??? </div>
                          )}
                        </div>
                      </div>

                      {/* Click hint */}
                      {!revealed && (
                        <div className="absolute bottom-0 inset-x-0 py-2 text-center text-xs text-purple-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-purple-950/40">
                          Hier tippen
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* VS divider */}
              {!revealed && (
                <div className="text-center mb-4">
                  <span className="inline-block px-4 py-1 rounded-full bg-gray-900 border border-gray-700 text-gray-400 text-sm font-medium">
                    VS
                  </span>
                </div>
              )}

              {/* Feedback */}
              {revealed && (
                <div className="text-center mb-4">
                  <div className={`inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-bold mb-3 ${
                    result === 'correct'
                      ? 'bg-green-900/40 border border-green-700 text-green-300'
                      : 'bg-red-900/40 border border-red-700 text-red-300'
                  }`}>
                    {result === 'correct' ? (
                      <><span className="text-lg"></span> Richtig! Serie: {streak}</>
                    ) : (
                      <><span className="text-lg"></span> Falsch! Serie war: {streak === 0 ? (best > 0 ? best : 0) : streak}</>
                    )}
                  </div>
                  <div>
                    <button onClick={next}
                      className="px-8 py-3 rounded-xl font-bold text-white transition-all hover:scale-105"
                      style={{ background:'linear-gradient(135deg,#7c3aed,#0891b2)' }}>
                      Naechste Runde
                    </button>
                  </div>
                </div>
              )}

              {/* Buttons if not revealed */}
              {!revealed && (
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => guess('A')}
                    className="py-3 rounded-xl border border-purple-700 text-purple-300 bg-purple-950/30 hover:bg-purple-900/40 font-medium text-sm transition-all">
                    Linke Karte ist teurer
                  </button>
                  <button onClick={() => guess('B')}
                    className="py-3 rounded-xl border border-cyan-700 text-cyan-300 bg-cyan-950/30 hover:bg-cyan-900/40 font-medium text-sm transition-all">
                    Rechte Karte ist teurer
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 text-gray-500">
              <p className="mb-4">Keine Karten gefunden</p>
              <button onClick={loadCards} className="px-4 py-2 bg-gray-800 rounded-lg text-sm">Nochmal versuchen</button>
            </div>
          )}

          {/* Highscores */}
          <div className="mt-12 bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="text-xs text-yellow-400 uppercase tracking-widest mb-4">Top 10 Highscores</div>
            {highscores.length === 0 ? (
              <p className="text-gray-600 text-sm text-center py-4">Noch keine Scores  spiel los!</p>
            ) : (
              <div className="space-y-2">
                {highscores.map((h, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-lg w-6 text-center">
                        {MEDALS[i] ?? <span className="text-gray-500 text-sm font-medium">{i + 1}.</span>}
                      </span>
                      <span className="text-white font-medium">{h.score} richtig in Serie</span>
                    </div>
                    <span className="text-xs text-gray-500">{h.date}</span>
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