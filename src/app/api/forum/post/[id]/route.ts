import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('forum_posts')
    .select(
      'id, title, content, created_at, reply_count, upvotes, view_count, is_pinned, is_locked, is_deleted, category_id, author_id, profiles!author_id(username, avatar_url, forum_role, badge_trainer, badge_gym_leader, badge_elite4, badge_champion, badge_verified_seller, post_count), forum_replies(id, content, created_at, upvotes, is_deleted, author_id, profiles!author_id(username, avatar_url, forum_role, badge_trainer, badge_gym_leader, badge_elite4, badge_champion, badge_verified_seller, post_count))'
    )
    .eq('id', params.id)
    .eq('is_deleted', false)
    .order('created_at', { referencedTable: 'forum_replies', ascending: true })
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabase
    .from('forum_posts')
    .update({ view_count: (data.view_count ?? 0) + 1 })
    .eq('id', params.id)

  return NextResponse.json({ post: data })
}