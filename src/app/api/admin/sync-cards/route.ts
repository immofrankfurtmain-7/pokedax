// src/app/api/admin/sync-cards/route.ts
export const dynamic = 'force-dynamic'
export const maxDuration = 300

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))
const BASE_URL = 'https://api.tcgdex.net/v2/en'

export async function GET(req: Request) {
  const secret = req.headers.get('x-admin-secret')
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { searchParams } = new URL(req.url)
  const setId = searchParams.get('setId')

  if (!setId) {
    return NextResponse.json({ error: 'setId required' }, { status: 400 })
  }

  try {
    // Set-Daten laden (enthält alle Karten direkt)
    const res = await fetch(`${BASE_URL}/sets/${setId}`, { cache: 'no-store' })
    if (!res.ok) {
      return NextResponse.json({ error: `Set ${setId} not found` }, { status: 404 })
    }
    const setData = await res.json()

    // Set speichern
    await supabase.from('sets').upsert({
      id:           setData.id,
      name:         setData.name,
      series:       setData.serie?.name ?? null,
      total:        setData.cardCount?.total ?? null,
      release_date: setData.releaseDate ?? null,
      symbol_url:   setData.symbol ?? null,
      logo_url:     setData.logo ?? null,
      updated_at:   new Date().toISOString(),
    })

    if (!setData.cards?.length) {
      return NextResponse.json({ success: true, sets: 1, cards: 0 })
    }

    // Alle Karten des Sets in einem Batch speichern
    const cards = setData.cards.map((card: any) => ({
      id:         `${setId}-${card.localId}`,
      set_id:     setId,
      name:       card.name,
      number:     card.localId,
      rarity:     card.rarity ?? null,
      types:      card.types ?? [],
      supertype:  card.supertype ?? null,
      image_url:  card.image ? `${card.image}/low.webp` : null,
      updated_at: new Date().toISOString(),
    }))

    // In Batches von 100 in Supabase speichern
    const batchSize = 100
    let saved = 0
    for (let i = 0; i < cards.length; i += batchSize) {
      const batch = cards.slice(i, i + batchSize)
      await supabase.from('cards').upsert(batch)
      saved += batch.length
      await sleep(100)
    }

    return NextResponse.json({
      success: true,
      sets:    1,
      cards:   saved,
    })

  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
