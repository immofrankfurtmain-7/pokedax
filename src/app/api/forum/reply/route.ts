import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nicht eingeloggt' }, { status: 401 })

  const { post_id, content } = await request.json()
  if (!post_id || !content?.trim())
    return NextResponse.json({ error: 'post_id und content erforderlich' }, { status: 400 })

  const { data, error } = await supabase
    .from('forum_replies')
    .insert({ post_id, content: content.trim(), author_id: user.id })
    .select('id, content, created_at, upvotes, author_id, profiles!author_id(username, avatar_url, forum_role, badge_trainer, badge_gym_leader, badge_elite4, badge_champion, post_count)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ reply: data })
}
