/**
 * Cardmarket API Bridge
 * ─────────────────────────────────────────────────────────────────────────────
 * Cardmarket uses OAuth 1.0a for API authentication.
 *
 * SETUP:
 * 1. Register at https://www.cardmarket.com/de/Magic/Account/Request/API
 * 2. Get: App Token, App Secret, Access Token, Access Token Secret
 * 3. Add to .env.local:
 *    CM_APP_TOKEN=...
 *    CM_APP_SECRET=...
 *    CM_ACCESS_TOKEN=...
 *    CM_ACCESS_SECRET=...
 * 4. Commercial plan required: https://www.cardmarket.com/de/Magic/Account/API
 *    (~15€/month for dedicated access)
 */

import crypto from 'crypto'

const CM_BASE = 'https://api.cardmarket.com/ws/v2.0/output.json'

// ── OAuth 1.0a Signature ─────────────────────────────────────────────────────
function buildOAuthHeader(method: string, url: string): string {
  const appToken    = process.env.CM_APP_TOKEN!
  const appSecret   = process.env.CM_APP_SECRET!
  const accessToken  = process.env.CM_ACCESS_TOKEN!
  const accessSecret = process.env.CM_ACCESS_SECRET!

  const timestamp = Math.floor(Date.now() / 1000).toString()
  const nonce     = crypto.randomBytes(16).toString('hex')

  const params: Record<string, string> = {
    oauth_consumer_key:     appToken,
    oauth_token:            accessToken,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp:        timestamp,
    oauth_nonce:            nonce,
    oauth_version:          '1.0',
  }

  // Build base string
  const sortedParams = Object.keys(params).sort().map(k =>
    `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`
  ).join('&')

  const baseString = [method.toUpperCase(), encodeURIComponent(url), encodeURIComponent(sortedParams)].join('&')
  const signingKey = `${encodeURIComponent(appSecret)}&${encodeURIComponent(accessSecret)}`
  const signature  = crypto.createHmac('sha1', signingKey).update(baseString).digest('base64')

  params['oauth_signature'] = signature
  const headerParts = Object.keys(params).map(k => `${k}="${encodeURIComponent(params[k])}"`)
  return `OAuth realm="${url}",${headerParts.join(',')}`
}

async function cmFetch(endpoint: string) {
  const url = `${CM_BASE}${endpoint}`
  const res = await fetch(url, {
    headers: { Authorization: buildOAuthHeader('GET', url) },
    next:    { revalidate: 1800 }, // 30 min cache
  })
  if (!res.ok) throw new Error(`Cardmarket API error: ${res.status}`)
  return res.json()
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Search for a product on Cardmarket
 * @param name Card name (e.g. "Charizard ex")
 */
export async function searchCMProduct(name: string) {
  try {
    const data = await cmFetch(`/products/find?search=${encodeURIComponent(name)}&idGame=3&idLanguage=5`)
    return data.product ?? []
  } catch (err) {
    console.error('[cardmarket] searchProduct error', err)
    return []
  }
}

/**
 * Get price guide for a product
 * @param productId Cardmarket product ID
 */
export async function getCMPriceGuide(productId: number) {
  try {
    const data = await cmFetch(`/products/${productId}`)
    const guide = data.product?.priceGuide ?? {}
    return {
      low:       guide.LOW       ?? 0,
      sell:      guide.SELL      ?? 0,
      avg1:      guide.AVG1      ?? 0,
      avg7:      guide.AVG7      ?? 0,
      avg30:     guide.AVG30     ?? 0,
      foilLow:   guide.LOWFOIL   ?? 0,
      foilSell:  guide.SELLFOIL  ?? 0,
      trendSell: guide.TREND     ?? 0,
    }
  } catch (err) {
    console.error('[cardmarket] getPriceGuide error', err)
    return null
  }
}

/**
 * Get price for a card by searching + fetching the first result
 * Used to populate card_prices table in Supabase
 */
export async function fetchCardPrice(cardName: string, cardId: string) {
  try {
    const products = await searchCMProduct(cardName)
    if (!products.length) return null

    const product  = products[0]
    const guide    = await getCMPriceGuide(product.idProduct)
    if (!guide) return null

    const price     = guide.sell  || guide.avg7  || guide.avg30 || 0
    const low       = guide.low   || price * 0.85
    const high      = price * 1.15
    const change7d  = guide.avg7  && guide.avg30 ? ((guide.avg7 - guide.avg30) / guide.avg30 * 100) : 0
    const signal    = change7d > 5 ? 'buy' : change7d < -3 ? 'sell' : 'hold'

    return {
      card_id:   cardId,
      card_name: cardName,
      price,
      low,
      high,
      avg7:      guide.avg7,
      avg30:     guide.avg30,
      trend:     guide.trendSell,
      change7d:  Math.round(change7d * 10) / 10,
      signal,
      updated_at: new Date().toISOString(),
    }
  } catch (err) {
    console.error('[cardmarket] fetchCardPrice error', err)
    return null
  }
}

// ── Next.js API Route: /api/cardmarket/price ──────────────────────────────────
// Create this file to expose price fetching to the frontend:
//
// src/app/api/cardmarket/price/route.ts
//
// import { NextResponse } from 'next/server'
// import { fetchCardPrice } from '@/lib/cardmarket'
// import { createClient } from '@/lib/supabase/server'
//
// export async function GET(req: Request) {
//   const { searchParams } = new URL(req.url)
//   const cardId   = searchParams.get('cardId') ?? ''
//   const cardName = searchParams.get('cardName') ?? ''
//
//   const price = await fetchCardPrice(cardName, cardId)
//   if (!price) return NextResponse.json({ error: 'Not found' }, { status: 404 })
//
//   // Cache in Supabase
//   const supabase = await createClient()
//   await supabase.from('card_prices').upsert(price, { onConflict: 'card_id' })
//
//   return NextResponse.json(price)
// }
