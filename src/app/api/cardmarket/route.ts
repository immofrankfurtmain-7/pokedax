import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Cardmarket API credentials - set in .env.local
const CM_APP_TOKEN     = process.env.CARDMARKET_APP_TOKEN
const CM_APP_SECRET    = process.env.CARDMARKET_APP_SECRET
const CM_ACCESS_TOKEN  = process.env.CARDMARKET_ACCESS_TOKEN
const CM_ACCESS_SECRET = process.env.CARDMARKET_ACCESS_SECRET

// ── OAuth 1.0a signature (Cardmarket uses this) ───────────────────────────
function buildOAuthHeader(url: string, method: string): string {
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const nonce     = Math.random().toString(36).substring(2)

  const params = {
    oauth_consumer_key:     CM_APP_TOKEN ?? '',
    oauth_nonce:            nonce,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp:        timestamp,
    oauth_token:            CM_ACCESS_TOKEN ?? '',
    oauth_version:          '1.0',
  }

  // Build the auth header string (simplified – production needs full HMAC-SHA1)
  const headerParts = Object.entries(params).map(([k, v]) => `${k}="${encodeURIComponent(v)}"`)
  return `OAuth realm="${url}", ${headerParts.join(', ')}`
}

// ── Fetch price from Cardmarket ───────────────────────────────────────────
async function fetchCardmarketPrice(cardName: string): Promise<{
  price:    number
  low:      number
  trend:    number
  avg1:     number
  avg7:     number
  avg30:    number
} | null> {
  if (!CM_APP_TOKEN) {
    // Return null if not configured – UI will fall back to mock data
    return null
  }

  try {
    const encodedName = encodeURIComponent(cardName)
    const url = `https://api.cardmarket.com/ws/v2.0/products/singles/pokemon?search=${encodedName}&exact=false`
    const authHeader = buildOAuthHeader(url, 'GET')

    const res = await fetch(url, {
      headers: { Authorization: authHeader },
      next:    { revalidate: 3600 },
    })

    if (!res.ok) return null
    const json = await res.json()

    const product = json.product?.[0]
    if (!product) return null

    return {
      price: product.priceGuide?.TREND ?? 0,
      low:   product.priceGuide?.LOW ?? 0,
      trend: product.priceGuide?.TREND ?? 0,
      avg1:  product.priceGuide?.AVG1 ?? 0,
      avg7:  product.priceGuide?.AVG7 ?? 0,
      avg30: product.priceGuide?.AVG30 ?? 0,
    }
  } catch (err) {
    console.error('[cardmarket] fetch error:', err)
    return null
  }
}

// ── API Route ─────────────────────────────────────────────────────────────
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const cardName = searchParams.get('name')
  const cardId   = searchParams.get('cardId')

  if (!cardName) {
    return NextResponse.json({ error: 'name parameter required' }, { status: 400 })
  }

  // Try cache first
  const supabase = await createClient()
  const { data: cached } = await supabase
    .from('card_prices')
    .select('*')
    .eq('card_id', cardId ?? cardName)
    .single()

  // Return cache if fresh (< 2 hours)
  if (cached) {
    const age = Date.now() - new Date(cached.updated_at).getTime()
    if (age < 2 * 60 * 60 * 1000) {
      return NextResponse.json({ data: cached, source: 'cache' })
    }
  }

  // Fetch from Cardmarket
  const cmData = await fetchCardmarketPrice(cardName)

  if (cmData) {
    // Determine signal
    let signal: 'buy' | 'sell' | 'hold' = 'hold'
    const change7d = cmData.avg7 > 0 ? ((cmData.price - cmData.avg7) / cmData.avg7) * 100 : 0
    if (change7d > 5  && cmData.price > cmData.avg30) signal = 'buy'
    if (change7d < -3 && cmData.price < cmData.avg30) signal = 'sell'

    const priceData = {
      card_id:    cardId ?? cardName,
      card_name:  cardName,
      price:      cmData.price,
      low:        cmData.low,
      high:       cmData.price * 1.2,  // estimate
      avg7:       cmData.avg7,
      avg30:      cmData.avg30,
      trend:      cmData.trend,
      change7d:   parseFloat(change7d.toFixed(2)),
      signal,
      updated_at: new Date().toISOString(),
    }

    // Upsert to cache
    await supabase.from('card_prices').upsert(priceData, { onConflict: 'card_id' })

    return NextResponse.json({ data: priceData, source: 'cardmarket' })
  }

  // Fall back to cached (even if stale) or mock
  if (cached) return NextResponse.json({ data: cached, source: 'cache_stale' })

  return NextResponse.json({ error: 'Price not available', data: null }, { status: 404 })
}
