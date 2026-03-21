import { NextResponse } from 'next/server'
import { fetchCardPrice } from '@/lib/cardmarket'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const cardId   = searchParams.get('cardId')   ?? ''
  const cardName = searchParams.get('cardName') ?? ''

  if (!cardId || !cardName) {
    return NextResponse.json({ error: 'cardId and cardName required' }, { status: 400 })
  }

  try {
    // Check Supabase cache first (30 min freshness)
    const supabase = await createClient()
    const { data: cached } = await supabase
      .from('card_prices')
      .select('*')
      .eq('card_id', cardId)
      .single()

    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()
    if (cached && cached.updated_at > thirtyMinsAgo) {
      return NextResponse.json(cached)
    }

    // Fetch fresh from Cardmarket
    const price = await fetchCardPrice(cardName, cardId)
    if (!price) return NextResponse.json({ error: 'Price not found' }, { status: 404 })

    // Upsert into Supabase cache
    await supabase.from('card_prices').upsert(price, { onConflict: 'card_id' })

    return NextResponse.json(price, {
      headers: { 'Cache-Control': 's-maxage=1800, stale-while-revalidate=3600' },
    })
  } catch (err) {
    console.error('[api/cardmarket/price]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// Batch price update (called by cron)
export async function POST(req: Request) {
  const { cardIds } = await req.json() as { cardIds: { id: string; name: string }[] }
  if (!Array.isArray(cardIds)) return NextResponse.json({ error: 'cardIds array required' }, { status: 400 })

  const supabase = await createClient()
  const results  = []

  for (const { id, name } of cardIds.slice(0, 20)) { // max 20 per call
    const price = await fetchCardPrice(name, id)
    if (price) {
      await supabase.from('card_prices').upsert(price, { onConflict: 'card_id' })
      results.push({ id, success: true })
    } else {
      results.push({ id, success: false })
    }
    await new Promise(r => setTimeout(r, 300)) // rate limit: 3/sec
  }

  return NextResponse.json({ updated: results.filter(r => r.success).length, results })
}
