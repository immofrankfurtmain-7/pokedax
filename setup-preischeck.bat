@echo off
chcp 65001 >nul 2>&1
setlocal enabledelayedexpansion

echo.
echo ================================================
echo   PokeDax - Preischeck Setup
echo ================================================
echo.

set "ROOT=%~dp0"
echo Hauptordner: %ROOT%
echo.

REM PowerShell nutzen um Dateien zu schreiben (kein Python noetig)
echo Starte Setup via PowerShell...
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command "
$root = '%ROOT%'.TrimEnd('\')
$ErrorActionPreference = 'Stop'

function Write-File($rel, $content) {
    $full = Join-Path $root $rel
    $dir  = Split-Path $full -Parent
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    [System.IO.File]::WriteAllText($full, $content, [System.Text.Encoding]::UTF8)
    Write-Host ('  OK  ' + $rel)
}

# ── 1. useDebounce.ts ─────────────────────────────────────────────────────
Write-File 'src\hooks\useDebounce.ts' @'
import { useState, useEffect } from ''react''

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debouncedValue
}
'@

# ── 2. api/cards/sets/route.ts ────────────────────────────────────────────
Write-File 'src\app\api\cards\sets\route.ts' @'
import { NextResponse } from ''next/server''
import { createClient } from ''@/lib/supabase/server''

export async function GET() {
  const supabase = createClient()
  const { data: sets } = await supabase
    .from(''sets'')
    .select(''id, name'')
    .order(''release_date'', { ascending: false })
  return NextResponse.json({ sets: sets ?? [] })
}
'@

# ── 3. api/cards/search/route.ts ──────────────────────────────────────────
Write-File 'src\app\api\cards\search\route.ts' @'
import { NextResponse } from ''next/server''
import { createClient } from ''@/lib/supabase/server''

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query   = searchParams.get(''q'') ?? ''''
  const setId   = searchParams.get(''set'') ?? ''''
  const rarity  = searchParams.get(''rarity'') ?? ''''
  const type    = searchParams.get(''type'') ?? ''''
  const sortBy  = searchParams.get(''sort'') ?? ''price_market''
  const sortDir = searchParams.get(''dir'') ?? ''desc''
  const page    = parseInt(searchParams.get(''page'') ?? ''1'')
  const limit   = 20
  const offset  = (page - 1) * limit
  const supabase = createClient()

  let dbQuery = supabase
    .from(''cards'')
    .select(
      ''id, name, number, rarity, types, image_url, price_market, price_avg1, price_avg7, price_avg30, set_id, sets!inner(id, name, series)'',
      { count: ''exact'' }
    )

  if (query.trim()) dbQuery = dbQuery.ilike(''name'', `%${query.trim()}%`)
  if (setId)  dbQuery = dbQuery.eq(''set_id'', setId)
  if (rarity) dbQuery = dbQuery.eq(''rarity'', rarity)
  if (type)   dbQuery = dbQuery.contains(''types'', [type])

  const validSorts: Record<string, string> = {
    price_market: ''price_market'',
    price_avg7:   ''price_avg7'',
    trend:        ''price_avg1'',
    name:         ''name'',
  }
  const sortColumn = validSorts[sortBy] ?? ''price_market''
  dbQuery = dbQuery
    .order(sortColumn, { ascending: sortDir === ''asc'', nullsFirst: false })
    .range(offset, offset + limit - 1)

  const { data: cards, count, error } = await dbQuery
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const cardsWithTrend = cards?.map(card => {
    const trend = card.price_market && card.price_avg7
      ? ((card.price_market - card.price_avg7) / card.price_avg7) * 100
      : null
    return { ...card, trend }
  })

  return NextResponse.json({
    cards: cardsWithTrend ?? [],
    total: count ?? 0,
    page,
    pages: Math.ceil((count ?? 0) / limit),
  })
}
'@

# ── 4. preischeck/page.tsx ────────────────────────────────────────────────
Write-File 'src\app\preischeck\page.tsx' @'
''use client''

import { useState, useEffect, useCallback } from ''react''
import Image from ''next/image''
import { useDebounce } from ''@/hooks/useDebounce''

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

const TYPES    = [''Fire'',''Water'',''Grass'',''Lightning'',''Psychic'',''Fighting'',''Darkness'',''Metal'',''Dragon'',''Colorless'']
const RARITIES = [''Common'',''Uncommon'',''Rare'',''Rare Holo'',''Rare Ultra'',''Rare Secret'',''Amazing Rare'',''Radiant Rare'']
const SORTS    = [
  { value: ''price_market'',     label: ''Preis \u2193'' },
  { value: ''price_market|asc'', label: ''Preis \u2191'' },
  { value: ''trend'',            label: ''Trend \u2193'' },
  { value: ''name|asc'',         label: ''Name A\u2013Z'' },
]

function fmt(n: number | null) {
  if (!n) return ''\u2013''
  return n.toLocaleString(''de-DE'', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '' \u20ac''
}

function TrendBadge({ trend }: { trend: number | null }) {
  if (trend === null) return null
  const up = trend > 0
  return (
    <span className={`text-xs font-medium ${up ? ''text-green-400'' : ''text-red-400''}`}>
      {up ? ''\u2191'' : ''\u2193''} {Math.abs(trend).toFixed(1)}%
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
  const [query,   setQuery]   = useState('''')
  const [setId,   setSetId]   = useState('''')
  const [rarity,  setRarity]  = useState('''')
  const [type,    setType]    = useState('''')
  const [sort,    setSort]    = useState(''price_market'')
  const [page,    setPage]    = useState(1)
  const [cards,   setCards]   = useState<Card[]>([])
  const [total,   setTotal]   = useState(0)
  const [pages,   setPages]   = useState(0)
  const [loading, setLoading] = useState(false)
  const [sets,    setSets]    = useState<{ id: string; name: string }[]>([])

  const debouncedQuery = useDebounce(query, 350)

  useEffect(() => {
    fetch(''/api/cards/sets'')
      .then(r => r.json())
      .then(d => setSets(d.sets ?? []))
  }, [])

  const fetchCards = useCallback(async () => {
    setLoading(true)
    const [sortBy, sortDir] = sort.includes(''|'') ? sort.split(''|'') : [sort, ''desc'']
    const params = new URLSearchParams({
      q: debouncedQuery, set: setId, rarity, type,
      sort: sortBy, dir: sortDir ?? ''desc'', page: String(page),
    })
    const res  = await fetch(`/api/cards/search?${params}`)
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
        <div className="text-xs text-cyan-400 uppercase tracking-widest mb-1">Live von Cardmarket \u00b7 EUR</div>
        <h1 className="text-3xl font-bold">Preischeck</h1>
        <p className="text-gray-400 mt-1">
          {total.toLocaleString(''de-DE'')} Karten \u00b7 Live-Preise \u00b7 Kauf-/Verkaufsempfehlung
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <input
          type="text" placeholder="Kartenname suchen..." value={query}
          onChange={e => setQuery(e.target.value)}
          className="col-span-1 sm:col-span-2 lg:col-span-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 text-sm"
        />
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
        {['''', ...RARITIES].map(r => (
          <button key={r || ''all''} onClick={() => setRarity(r)}
            className={[
              ''text-xs px-3 py-1 rounded-full border transition-colors'',
              rarity === r
                ? (r === '''' ? ''bg-cyan-500 border-cyan-500 text-black'' : ''bg-purple-600 border-purple-600 text-white'')
                : ''border-gray-700 text-gray-400 hover:border-gray-500''
            ].join('' '')}>
            {r || ''Alle''}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-500">L\u00e4dt\u2026</div>
      ) : cards.length === 0 ? (
        <div className="flex items-center justify-center py-20 text-gray-500">Keine Karten gefunden</div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
            {cards.map(card => (
              <div key={card.id}
                className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-purple-600 transition-colors group cursor-pointer">
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
                  <p className="text-gray-500 text-xs truncate">{card.sets?.name} \u00b7 #{card.number}</p>
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
                \u2190 Zur\u00fcck
              </button>
              <span className="text-gray-500 text-sm">Seite {page} von {pages}</span>
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
                className="px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-sm text-gray-400 disabled:opacity-40 hover:border-gray-500 transition-colors">
                Weiter \u2192
              </button>
            </div>
          )}
        </>
      )}
    </main>
  )
}
'@

# ── 5. SQL Index Datei ────────────────────────────────────────────────────
Write-File 'supabase-preischeck-indexes.sql' @'
-- Einmalig im Supabase SQL Editor ausfuehren!
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS cards_name_trgm_idx ON cards USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS cards_set_id_idx ON cards (set_id);
CREATE INDEX IF NOT EXISTS cards_price_market_idx ON cards (price_market DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS cards_rarity_idx ON cards (rarity);
'@

Write-Host ''
Write-Host '================================================'
Write-Host '  Alle 5 Dateien erfolgreich angelegt!'
Write-Host '================================================'
"

if %errorlevel% neq 0 (
    echo.
    echo ================================================
    echo   FEHLER! Siehe Meldung oben.
    echo ================================================
    echo.
    pause
    exit /b 1
)

echo.
echo Naechste Schritte:
echo   1. supabase-preischeck-indexes.sql im Supabase SQL Editor ausfuehren
echo   2. GitHub Desktop - Commit + Push
echo   3. Vercel deployt automatisch
echo.
pause
