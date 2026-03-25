import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query   = searchParams.get('q') ?? ''
  const setId   = searchParams.get('set') ?? ''
  const rarity  = searchParams.get('rarity') ?? ''
  const type    = searchParams.get('type') ?? ''
  const sortBy  = searchParams.get('sort') ?? 'price_market'
  const sortDir = searchParams.get('dir') ?? 'desc'
  const page    = parseInt(searchParams.get('page') ?? '1')
  const limit   = 20
  const offset  = (page - 1) * limit
  const supabase = await createClient()

  let dbQuery = supabase
    .from('cards')
    .select(
      'id, name, number, rarity, types, image_url, price_market, price_avg1, price_avg7, price_avg30, set_id, sets!inner(id, name, series)',
      { count: 'exact' }
    )

  if (query.trim()) dbQuery = dbQuery.ilike('name', '%' + query.trim() + '%')
  if (setId)  dbQuery = dbQuery.eq('set_id', setId)
  if (rarity) dbQuery = dbQuery.eq('rarity', rarity)
  if (type)   dbQuery = dbQuery.contains('types', [type])

  const validSorts: Record<string, string> = {
    price_market: 'price_market',
    price_avg7:   'price_avg7',
    trend:        'price_avg1',
    name:         'name',
  }
  const sortColumn = validSorts[sortBy] ?? 'price_market'

  dbQuery = dbQuery
    .order(sortColumn, { ascending: sortDir === 'asc', nullsFirst: false })
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
