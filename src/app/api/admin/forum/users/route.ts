import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function isAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data } = await supabase.from('profiles').select('forum_role').eq('id', user.id).single()
  return data?.forum_role === 'admin'
}

async function isMod(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data } = await supabase.from('profiles').select('forum_role').eq('id', user.id).single()
  return data?.forum_role === 'moderator' || data?.forum_role === 'admin'
}

export async function GET() {
  const supabase = await createClient()
  if (!await isMod(supabase)) return NextResponse.json({ error: 'Kein Zugriff' }, { status: 403 })

  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, forum_role, post_count, is_banned, banned_reason, joined_at, badge_champion, badge_elite4, badge_gym_leader, badge_trainer, badge_verified_seller')
    .order('post_count', { ascending: false })
    .limit(100)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ users: data ?? [] })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { id, action, role, reason } = await request.json()

  if (action === 'set_role') {
    if (!await isAdmin(supabase)) return NextResponse.json({ error: 'Nur Admins duerfen Rollen vergeben' }, { status: 403 })
    const { error } = await supabase.from('profiles').update({ forum_role: role }).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  if (action === 'ban') {
    if (!await isMod(supabase)) return NextResponse.json({ error: 'Kein Zugriff' }, { status: 403 })
    const { error } = await supabase.from('profiles').update({
      is_banned: true, banned_reason: reason ?? 'Verstos gegen Regeln', banned_at: new Date().toISOString()
    }).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  if (action === 'unban') {
    if (!await isMod(supabase)) return NextResponse.json({ error: 'Kein Zugriff' }, { status: 403 })
    const { error } = await supabase.from('profiles').update({
      is_banned: false, banned_reason: null, banned_at: null
    }).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  if (action === 'toggle_seller') {
    if (!await isMod(supabase)) return NextResponse.json({ error: 'Kein Zugriff' }, { status: 403 })
    const { data: profile } = await supabase.from('profiles').select('badge_verified_seller').eq('id', id).single()
    const { error } = await supabase.from('profiles').update({
      badge_verified_seller: !profile?.badge_verified_seller
    }).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Unbekannte Aktion' }, { status: 400 })
}