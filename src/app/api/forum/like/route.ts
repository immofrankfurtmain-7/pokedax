import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nicht eingeloggt' }, { status: 401 })

  const { post_id, reply_id } = await request.json()

  if (post_id) {
    const { data: existing } = await supabase
      .from('forum_likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('post_id', post_id)
      .single()

    if (existing) {
      await supabase.from('forum_likes').delete().eq('id', existing.id)
      await supabase.rpc('decrement_post_likes', { pid: post_id })
      return NextResponse.json({ liked: false })
    }
    await supabase.from('forum_likes').insert({ user_id: user.id, post_id })
    await supabase.rpc('increment_post_likes', { pid: post_id })
    return NextResponse.json({ liked: true })
  }

  if (reply_id) {
    const { data: existing } = await supabase
      .from('forum_likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('reply_id', reply_id)
      .single()

    if (existing) {
      await supabase.from('forum_likes').delete().eq('id', existing.id)
      await supabase.rpc('decrement_reply_likes', { rid: reply_id })
      return NextResponse.json({ liked: false })
    }
    await supabase.from('forum_likes').insert({ user_id: user.id, reply_id })
    await supabase.rpc('increment_reply_likes', { rid: reply_id })
    return NextResponse.json({ liked: true })
  }

  return NextResponse.json({ error: 'post_id oder reply_id erforderlich' }, { status: 400 })
}
