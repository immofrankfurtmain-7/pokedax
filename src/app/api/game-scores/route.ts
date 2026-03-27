import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('game_scores')
    .select('id, username, score, created_at')
    .order('score', { ascending: false })
    .limit(10)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ scores: data ?? [] })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nicht eingeloggt' }, { status: 401 })

  const { score } = await request.json()
  if (!score || score < 1) return NextResponse.json({ error: 'Score zu niedrig' }, { status: 400 })

  const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).single()
  const username = profile?.username ?? 'Unbekannt'

  const { data: existing } = await supabase
    .from('game_scores')
    .select('id, score')
    .eq('user_id', user.id)
    .order('score', { ascending: false })
    .limit(1)
    .single()

  if (existing && existing.score >= score) {
    return NextResponse.json({ saved: false, message: 'Kein neuer Rekord' })
  }

  const { error } = await supabase.from('game_scores').insert({ user_id: user.id, username, score })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ saved: true })
}