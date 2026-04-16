import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  const randomOffset = Math.floor(Math.random() * 500)

  const { data, error } = await supabase
    .from('cards')
    .select('id, name, number, set_id, image_url, price_market, sets!inner(name)')
    .not('price_market', 'is', null)
    .not('image_url', 'is', null)
    .gt('price_market', 0.5)
    .range(randomOffset, randomOffset + 49)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const cards = (data ?? []).filter(c => c.price_market > 0)
  if (cards.length < 2) return NextResponse.json({ error: 'Nicht genug Karten' }, { status: 500 })

  const shuffled = cards.sort(() => Math.random() - 0.5)
  const a = shuffled[0]
  const b = shuffled.find(c =>
    c.id !== a.id &&
    Math.abs(c.price_market - a.price_market) > 0.5
  )

  if (!b) return NextResponse.json({ error: 'Nicht genug verschiedene Preise' }, { status: 500 })

  return NextResponse.json({ cardA: a, cardB: b })
}