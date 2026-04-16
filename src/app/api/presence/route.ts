import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ ok: false })

  await supabase.from('profiles')
    .update({ last_seen: new Date().toISOString(), is_online: true })
    .eq('id', user.id)

  return NextResponse.json({ ok: true })
}

export async function GET() {
  const supabase = await createClient()
  const since = new Date(Date.now() - 5 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, forum_role, badge_champion, badge_elite4, badge_gym_leader, badge_trainer, badge_verified_seller, last_seen')
    .gte('last_seen', since)
    .order('last_seen', { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ users: data ?? [] })
}