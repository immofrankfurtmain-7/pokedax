import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  const { data: sets } = await supabase
    .from('sets')
    .select('id, name')
    .order('release_date', { ascending: false })
  return NextResponse.json({ sets: sets ?? [] })
}
