import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nicht eingeloggt' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id erforderlich' }, { status: 400 })

  const { data, error } = await supabase
    .from('wishlist_items')
    .select('id, added_at, cards!inner(id, name, number, set_id, image_url, price_market, price_avg7, sets!inner(name))')
    .eq('wishlist_id', id)
    .order('added_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ items: data ?? [] })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nicht eingeloggt' }, { status: 401 })

  const { wishlist_id, card_id } = await request.json()
  if (!wishlist_id || !card_id) return NextResponse.json({ error: 'wishlist_id und card_id erforderlich' }, { status: 400 })

  const { data: wl } = await supabase.from('wishlists').select('id').eq('id', wishlist_id).eq('user_id', user.id).single()
  if (!wl) return NextResponse.json({ error: 'Wishlist nicht gefunden' }, { status: 404 })

  const { error } = await supabase.from('wishlist_items').insert({ wishlist_id, card_id })
  if (error && error.code === '23505') return NextResponse.json({ error: 'Karte bereits in Liste' }, { status: 409 })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nicht eingeloggt' }, { status: 401 })

  const { wishlist_id, card_id } = await request.json()
  const { error } = await supabase
    .from('wishlist_items')
    .delete()
    .eq('wishlist_id', wishlist_id)
    .eq('card_id', card_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}