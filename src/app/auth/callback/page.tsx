import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AuthCallbackPage({
  searchParams,
}: {
  searchParams: { code?: string; next?: string; error?: string }
}) {
  if (searchParams.error) {
    redirect('/auth/login?error=' + searchParams.error)
  }

  if (searchParams.code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(searchParams.code)
  }

  redirect(searchParams.next ?? '/dashboard')
}
