import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ profile: null })
  const { data } = await supabase
    .from('profiles')
    .select('id, username, forum_role, post_count, badge_champion, badge_elite4, badge_gym_leader, badge_trainer, badge_verified_seller, is_banned')
    .eq('id', user.id)
    .single()
  return NextResponse.json({ profile: data })
}