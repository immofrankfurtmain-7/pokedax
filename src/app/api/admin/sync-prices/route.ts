// src/app/api/admin/sync-prices/route.ts
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
  const setId       = searchParams.get('setId')
  const limitParam  = searchParams.get('limit')
  const offsetParam = searchParams.get('offset')

  if (!setId) {
    return NextResponse.json({ error: 'setId required' }, { status: 400 })
  }

  const limit  = limitParam  ? parseInt(limitParam)  : 50
  const offset = offsetParam ? parseInt(offsetParam) : 0

  try {
    // Karten aus DB laden
    const { data: cards, error } = await supabase
      .from('cards')
      .select('id, number')
      .eq('set_id', setId)
      .order('number')
      .range(offset, offset + limit - 1)

    if (error) throw error
    if (!cards?.length) {
      return NextResponse.json({ success: true, updated: 0, hasMore: false, message: 'No cards found' })
    }

    let updated = 0
    let failed  = 0

    for (const card of cards) {
      try {
        // Korrekte URL: setId-localId (z.B. base1-4)
        const res = await fetch(
          `${BASE_URL}/cards/${setId}-${card.number}`,
          { cache: 'no-store' }
        )

        if (!res.ok) {
          failed++
          await sleep(200)
          continue
        }

        const data = await res.json()

        // Cardmarket Preise (EUR)
        const cm = data.pricing?.cardmarket

        await supabase
          .from('cards')
          .update({
            price_low:         cm?.low           ?? null,
            price_mid:         cm?.avg           ?? null,
            price_high:        cm?.trend         ?? null,
            price_market:      cm?.avg           ?? null,
            price_foil_low:    cm?.['low-holo']  ?? null,
            price_foil_mid:    cm?.['avg-holo']  ?? null,
            price_foil_high:   cm?.['trend-holo'] ?? null,
            price_foil_market: cm?.['avg-holo']  ?? null,
            updated_at:        new Date().toISOString(),
          })
          .eq('id', card.id)

        updated++
        await sleep(250)

      } catch {
        failed++
        await sleep(500)
      }
    }

    return NextResponse.json({
      success: true,
      setId,
      offset,
      limit,
      updated,
      failed,
      hasMore: cards.length === limit,
    })

  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
