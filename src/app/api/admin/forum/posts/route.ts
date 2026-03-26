import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function isMod(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data } = await supabase.from('profiles').select('forum_role').eq('id', user.id).single()
  return data?.forum_role === 'moderator' || data?.forum_role === 'admin'
}

export async function GET(request: Request) {
  const supabase = await createClient()
  if (!await isMod(supabase)) return NextResponse.json({ error: 'Kein Zugriff' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const page   = parseInt(searchParams.get('page') ?? '1')
  const limit  = 25
  const offset = (page - 1) * limit

  const { data, count, error } = await supabase
    .from('forum_posts')
    .select('id, title, created_at, is_deleted, is_pinned, is_locked, reply_count, upvotes, category_id, author_id, profiles!author_id(username, forum_role, is_banned)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ posts: data ?? [], total: count ?? 0, pages: Math.ceil((count ?? 0) / limit) })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  if (!await isMod(supabase)) return NextResponse.json({ error: 'Kein Zugriff' }, { status: 403 })

  const { id, action } = await request.json()
  if (!id || !action) return NextResponse.json({ error: 'id und action erforderlich' }, { status: 400 })

  const updates: Record<string, any> = {
    pin:    { is_pinned:  true  },
    unpin:  { is_pinned:  false },
    lock:   { is_locked:  true  },
    unlock: { is_locked:  false },
    delete: { is_deleted: true  },
    restore:{ is_deleted: false },
  }

  if (!updates[action]) return NextResponse.json({ error: 'Unbekannte Aktion' }, { status: 400 })

  const { error } = await supabase.from('forum_posts').update(updates[action]).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}