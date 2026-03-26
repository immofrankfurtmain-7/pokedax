import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') ?? ''
  const page     = parseInt(searchParams.get('page') ?? '1')
  const limit    = 20
  const offset   = (page - 1) * limit
  const supabase = await createClient()

  let q = supabase
    .from('forum_posts')
    .select(
      'id, title, content, created_at, view_count, reply_count, upvotes, is_pinned, is_locked, is_deleted, category_id, author_id, profiles!author_id(username, avatar_url, forum_role, badge_trainer, badge_gym_leader, badge_elite4, badge_champion, badge_verified_seller, post_count)',
      { count: 'exact' }
    )
    .eq('is_deleted', false)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (category) q = q.eq('category_id', category)

  const { data, count, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({
    posts: data ?? [],
    total: count ?? 0,
    pages: Math.ceil((count ?? 0) / limit),
  })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nicht eingeloggt' }, { status: 401 })

  const { title, content, category_id } = await request.json()
  if (!title?.trim() || !content?.trim() || !category_id)
    return NextResponse.json({ error: 'Titel, Inhalt und Kategorie erforderlich' }, { status: 400 })

  const { data, error } = await supabase
    .from('forum_posts')
    .insert({ title: title.trim(), content: content.trim(), category_id, author_id: user.id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ post: data })
}
