'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useDebounce } from '@/hooks/useDebounce'

type Card = {
  id: string
  name: string
  number: string
  rarity: string
  types: string[]
  image_url: string
  price_market: number | null
  price_avg7: number | null
  price_avg30: number | null
  trend: number | null
  set_id: string
  sets: { id: string; name: string; series: string }
}

const TYPES    = ['Fire','Water','Grass','Lightning','Psychic','Fighting','Darkness','Metal','Dragon','Colorless']
const RARITIES = ['Common','Uncommon','Rare','Rare Holo','Rare Ultra','Rare Secret','Amazing Rare','Radiant Rare']
const SORTS    = [
  { value: 'price_market',     label: 'Preis ' },
  { value: 'price_market|asc', label: 'Preis ' },
  { value: 'trend',            label: 'Trend ' },
  { value: 'name|asc',         label: 'Name AZ' },
]

function fmt(n: number | null) {
  if (!n) return ''
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' '
}

function TrendBadge({ trend }: { trend: number | null }) {
  if (trend === null) return null
  const up = trend > 0
  return (
    <span className={	ext-xs font-medium +(up ? 'text-green-400' : 'text-red-400')}>
      {up ? '' : ''} {Math.abs(trend).toFixed(1)}%
    </span>
  )
}

function Signal({ trend }: { trend: number | null }) {
  if (trend === null) return null
  if (trend > 3)  return <span className="text-xs px-2 py-0.5 rounded-full bg-green-900/60 text-green-300">KAUFEN</span>
  if (trend < -3) return <span className="text-xs px-2 py-0.5 rounded-full bg-red-900/60 text-red-300">VERKAUFEN</span>
  return <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-900/60 text-yellow-300">HALTEN</span>
}

export default function PreischeckPage() {
  const [query,   setQuery]   = useState('')
  const [setId,   setSetId]   = useState('')
  const [rarity,  setRarity]  = useState('')
  const [type,    setType]    = useState('')
  const [sort,    setSort]    = useState('price_market')
  const [page,    setPage]    = useState(1)
  const [cards,   setCards]   = useState<Card[]>([])
  const [total,   setTotal]   = useState(0)
  const [pages,   setPages]   = useState(0)
  const [loading, setLoading] = useState(false)
  const [sets,    setSets]    = useState<{ id: string; name: string }[]>([])

  const debouncedQuery = useDebounce(query, 350)

  useEffect(() => {
    fetch('/api/cards/sets')
      .then(r => r.json())
      .then(d => setSets(d.sets ?? []))
  }, [])

  const fetchCards = useCallback(async () => {
    setLoading(true)
    const [sortBy, sortDir] = sort.includes('|') ? sort.split('|') : [sort, 'desc']
    const params = new URLSearchParams({
      q: debouncedQuery, set: setId, rarity, type,
      sort: sortBy, dir: sortDir ?? 'desc', page: String(page),
    })
    const res  = await fetch('/api/cards/search?'+params)
    const data = await res.json()
    setCards(data.cards ?? [])
    setTotal(data.total ?? 0)
    setPages(data.pages ?? 0)
    setLoading(false)
  }, [debouncedQuery, setId, rarity, type, sort, page])

  useEffect(() => { fetchCards() }, [fetchCards])
  useEffect(() => { setPage(1) }, [debouncedQuery, setId, rarity, type, sort])

  return (
    <main className="min-h-screen bg-black text-white px-4 py-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="text-xs text-cyan-400 uppercase tracking-widest mb-1">Live von Cardmarket  EUR</div>
        <h1 className="text-3xl font-bold">Preischeck</h1>
        <p className="text-gray-400 mt-1">{total.toLocaleString('de-DE')} Karten  Live-Preise</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <input type="text" placeholder="Kartenname suchen..." value={query}
          onChange={e => setQuery(e.target.value)}
          className="col-span-1 sm:col-span-2 lg:col-span-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 text-sm" />
        <select value={setId} onChange={e => setSetId(e.target.value)}
          className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500 text-sm">
          <option value="">Alle Sets</option>
          {sets.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select value={type} onChange={e => setType(e.target.value)}
          className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500 text-sm">
          <option value="">Alle Typen</option>
          {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={sort} onChange={e => setSort(e.target.value)}
          className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500 text-sm">
          {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>
      <div className="flex gap-2 flex-wrap mb-6">
        {['', ...RARITIES].map(r => (
          <button key={r || 'all'} onClick={() => setRarity(r)}
            className={['text-xs px-3 py-1 rounded-full border transition-colors',
              rarity === r ? (r === '' ? 'bg-cyan-500 border-cyan-500 text-black' : 'bg-purple-600 border-purple-600 text-white')
              : 'border-gray-700 text-gray-400 hover:border-gray-500'].join(' ')}>
            {r || 'Alle'}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-500">Lädt</div>
      ) : cards.length === 0 ? (
        <div className="flex items-center justify-center py-20 text-gray-500">Keine Karten gefunden</div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
            {cards.map(card => (
              <div key={card.id} className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-purple-600 transition-colors group cursor-pointer">
                <div className="relative aspect-[2.5/3.5] bg-gray-800">
                  {card.image_url ? (
                    <Image src={card.image_url} alt={card.name} fill
                      className="object-contain p-1 group-hover:scale-105 transition-transform"
                      sizes="(max-width: 640px) 50vw, 200px" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-600 text-xs">Kein Bild</div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-white text-xs font-medium truncate">{card.name}</p>
                  <p className="text-gray-500 text-xs truncate">{card.sets?.name}  #{card.number}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-cyan-400 text-sm font-bold">{fmt(card.price_market)}</span>
                    <TrendBadge trend={card.trend} />
                  </div>
                  <div className="mt-1.5"><Signal trend={card.trend} /></div>
                </div>
              </div>
            ))}
          </div>
          {pages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-sm text-gray-400 disabled:opacity-40 hover:border-gray-500 transition-colors">
                 Zurück
              </button>
              <span className="text-gray-500 text-sm">Seite {page} von {pages}</span>
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
                className="px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-sm text-gray-400 disabled:opacity-40 hover:border-gray-500 transition-colors">
                Weiter 
              </button>
            </div>
          )}
        </>
      )}
    </main>
  )
}
