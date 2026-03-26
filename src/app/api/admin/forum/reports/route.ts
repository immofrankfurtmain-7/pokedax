import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
    .from('forum_reports')
    .select('id, reason, status, created_at, reporter_id, post_id, reply_id, profiles!reporter_id(username), forum_posts!post_id(title, is_deleted)')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ reports: data ?? [] })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  if (!await isMod(supabase)) return NextResponse.json({ error: 'Kein Zugriff' }, { status: 403 })

  const { id, status } = await request.json()
  const { error } = await supabase.from('forum_reports').update({ status }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}