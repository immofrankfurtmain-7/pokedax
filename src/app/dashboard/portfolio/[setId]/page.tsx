// src/app/dashboard/portfolio/[setId]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CardGrid from '@/components/portfolio/CardGrid'

export const dynamic = 'force-dynamic'

interface Props {
  params: { setId: string }
}

export default async function SetDetailPage({ params }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { setId } = params

  // Set-Info laden
  const { data: set } = await supabase
    .from('sets')
    .select('*')
    .eq('id', setId)
    .single()

  if (!set) redirect('/dashboard/portfolio')

  // Alle Karten des Sets laden
  const { data: cards } = await supabase
    .from('cards')
    .select('id, name, number, rarity, types, image_url, price_market')
    .eq('set_id', setId)
    .order('number', { ascending: true })

  // Eigene Sammlung für dieses Set laden
  const cardIds = (cards || []).map(c => c.id)
  const { data: collection } = await supabase
    .from('user_collection')
    .select('card_id')
    .eq('user_id', user.id)
    .in('card_id', cardIds)

  const ownedIds = new Set(collection?.map(c => c.card_id) || [])
  const owned = ownedIds.size
  const total = cards?.length || 0
  const completion = total ? Math.round((owned / total) * 100) : 0

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="mb-6">
        <a href="/dashboard/portfolio" className="text-gray-400 hover:text-yellow-400 text-sm mb-3 inline-block">
          ← Zurück zur Übersicht
        </a>
        <div className="flex items-center gap-4">
          {set.logo_url && (
            <img src={set.logo_url} alt={set.name} className="h-12 object-contain" />
          )}
          <div>
            <h1 className="text-2xl font-bold text-yellow-400">{set.name}</h1>
            <p className="text-gray-400 text-sm">{set.series} · {set.total} Karten</p>
          </div>
        </div>

        {/* Fortschrittsbalken */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-400 mb-1">
            <span>{owned} / {total} Karten</span>
            <span>{completion}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div
              className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>
      </div>

      {/* Karten Grid */}
      <CardGrid
        cards={(cards || []).map(card => ({
          ...card,
          owned: ownedIds.has(card.id)
        }))}
        userId={user.id}
        setId={setId}
      />
    </div>
  )
}
