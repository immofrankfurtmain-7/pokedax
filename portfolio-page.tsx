// src/app/dashboard/portfolio/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SetGrid from '@/components/portfolio/SetGrid'
import CollectionStats from '@/components/portfolio/CollectionStats'

export const dynamic = 'force-dynamic'

export default async function PortfolioPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Alle Sets laden
  const { data: sets } = await supabase
    .from('sets')
    .select('id, name, series, total, logo_url, symbol_url, release_date')
    .order('release_date', { ascending: false })

  // Sammlung des Users laden
  const { data: collection } = await supabase
    .from('user_collection')
    .select('card_id, cards(set_id)')
    .eq('user_id', user.id)

  // Fortschritt pro Set berechnen
  const progressMap: Record<string, number> = {}
  collection?.forEach((item: any) => {
    const setId = item.cards?.set_id
    if (setId) progressMap[setId] = (progressMap[setId] || 0) + 1
  })

  const setsWithProgress = (sets || []).map(set => ({
    ...set,
    owned: progressMap[set.id] || 0,
    completion: set.total ? Math.round(((progressMap[set.id] || 0) / set.total) * 100) : 0
  }))

  const totalCards = collection?.length || 0
  const totalSets = sets?.length || 0
  const completedSets = setsWithProgress.filter(s => s.completion === 100).length

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-yellow-400 mb-1">Meine Sammlung</h1>
        <p className="text-gray-400">Verwalte deine Pokémon TCG Karten</p>
      </div>

      {/* Stats */}
      <CollectionStats
        totalCards={totalCards}
        totalSets={totalSets}
        completedSets={completedSets}
      />

      {/* Set Grid */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-white mb-4">Alle Sets</h2>
        <SetGrid sets={setsWithProgress} />
      </div>
    </div>
  )
}
