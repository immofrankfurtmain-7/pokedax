import { createClient } from '@/lib/supabase/server'
import { Star } from 'lucide-react'
import Link from 'next/link'
import AvatarUpload from '@/components/ui/AvatarUpload'
import DashboardCards from '@/components/ui/DashboardCards'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user!.id).single()

  const { data: collectionWithPrices } = await supabase
    .from('user_collection')
    .select(`
      quantity,
      is_foil,
      cards (
        id, name, number, set_id, rarity, image_url,
        price_market, price_foil_market,
        price_avg1, price_avg7, price_avg30,
        price_foil_avg1, price_foil_avg7, price_foil_avg30
      )
    `)
    .eq('user_id', user!.id)

  const portfolioValue = collectionWithPrices?.reduce((sum, item) => {
    const card = item.cards as any
    const price = item.is_foil
      ? (card?.price_foil_market ?? card?.price_market ?? 0)
      : (card?.price_market ?? 0)
    return sum + (price * (item.quantity ?? 1))
  }, 0) ?? 0

  const collectionCards = collectionWithPrices?.map(item => {
    const card = item.cards as any
    const isFoil = item.is_foil
    return {
      id:           card?.id ?? '',
      name:         card?.name ?? '',
      number:       card?.number ?? '',
      set_id:       card?.set_id ?? '',
      rarity:       card?.rarity ?? null,
      image_url:    card?.image_url ?? null,
      price_market: isFoil
        ? (card?.price_foil_market ?? card?.price_market ?? null)
        : (card?.price_market ?? null),
      price_avg1:  isFoil
        ? (card?.price_foil_avg1 ?? card?.price_avg1 ?? null)
        : (card?.price_avg1 ?? null),
      price_avg7:  isFoil
        ? (card?.price_foil_avg7 ?? card?.price_avg7 ?? null)
        : (card?.price_avg7 ?? null),
      price_avg30: isFoil
        ? (card?.price_foil_avg30 ?? card?.price_avg30 ?? null)
        : (card?.price_avg30 ?? null),
    }
  }) ?? []

  const totalCards = collectionCards.length
  const isPremium  = profile?.is_premium ?? false
  const username   = profile?.username ?? user!.email?.split('@')[0] ?? 'Trainer'

  return (
    <div className="p-8"><div className="flex gap-3 mb-6 flex-wrap"><a href="/dashboard" className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium">Dashboard</a><a href="/dashboard/portfolio" className="px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-gray-300 text-sm hover:border-gray-500 transition-colors">Portfolio</a><a href="/dashboard/wishlist" className="px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-gray-300 text-sm hover:border-gray-500 transition-colors">Wishlists</a><a href="/dashboard/alerts" className="px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-gray-300 text-sm hover:border-gray-500 transition-colors">Alerts</a><a href="/dashboard/premium" className="px-4 py-2 rounded-lg bg-gray-900 border border-yellow-700/50 text-yellow-400 text-sm hover:border-yellow-600 transition-colors">Premium</a></div>
      <div className="flex items-center gap-5 mb-10">
        <AvatarUpload userId={user!.id} avatarUrl={profile?.avatar_url} username={username} size="lg"/>
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Hey, <span className="gradient-text">{username}</span> 👋
          </h1>
          <p className="text-white/40 text-sm mt-1 font-normal">{user!.email}</p>
          {isPremium ? (
            <div className="flex items-center gap-1.5 mt-2 px-2 py-1 rounded-full w-fit" style={{ background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)' }}>
              <Star size={11} className="text-yellow-400"/>
              <span className="text-[10px] font-black text-yellow-400 tracking-wider">PREMIUM AKTIV</span>
            </div>
          ) : (
            <Link href="/dashboard/premium" className="inline-flex items-center gap-1.5 mt-2 px-2 py-1 rounded-full text-[10px] font-bold text-violet-400 hover:text-violet-300 transition-colors" style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)' }}>
              <Star size={10}/> Premium freischalten
            </Link>
          )}
        </div>
      </div>

      <DashboardCards
        totalCards={totalCards}
        isPremium={isPremium}
        portfolioValue={portfolioValue}
        collectionCards={collectionCards}
      />

      <div className="mt-8 rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="px-6 py-4 border-b border-white/5">
          <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Letzte Aktivität</span>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-5xl mb-4 opacity-20">⚡</div>
          <div className="text-sm font-medium text-white/30">Noch keine Aktivität</div>
          <div className="text-xs text-white/20 mt-1">Füge Karten zu deinem Portfolio hinzu um zu starten</div>
          <Link href="/dashboard/portfolio" className="mt-5 px-5 py-2 rounded-xl text-xs font-bold text-violet-300 transition-all hover:-translate-y-0.5" style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)' }}>
            Portfolio öffnen →
          </Link>
        </div>
      </div>
    </div>
  )
}
