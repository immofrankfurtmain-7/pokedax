'use client'
// src/components/portfolio/CardGrid.tsx

import { useState } from 'react'
import WishlistButton from '@/components/ui/WishlistButton'
import { createClient } from '@/lib/supabase/client'

interface Card {
  id: string
  name: string
  number: string
  rarity?: string
  types?: string[]
  image_url?: string
  price_market?: number
  owned: boolean
}

interface Props {
  cards: Card[]
  userId: string
  setId: string
}

const TYPE_COLORS: Record<string, string> = {
  Fire:       'border-red-500',
  Water:      'border-blue-500',
  Grass:      'border-green-500',
  Lightning:  'border-yellow-400',
  Psychic:    'border-purple-500',
  Fighting:   'border-orange-500',
  Darkness:   'border-gray-600',
  Metal:      'border-gray-400',
  Dragon:     'border-indigo-500',
  Fairy:      'border-pink-400',
  Colorless:  'border-gray-500',
}

export default function CardGrid({ cards: initialCards, userId, setId }: Props) {
  const [cards, setCards] = useState(initialCards)
  const [loading, setLoading] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'owned' | 'missing'>('all')
  const supabase = createClient()

  const toggleCard = async (cardId: string, currentOwned: boolean) => {
    setLoading(cardId)
    try {
      if (currentOwned) {
        await supabase
          .from('user_collection')
          .delete()
          .eq('user_id', userId)
          .eq('card_id', cardId)
      } else {
        await supabase
          .from('user_collection')
          .upsert({ user_id: userId, card_id: cardId, quantity: 1 })
      }
      setCards(prev => prev.map(c =>
        c.id === cardId ? { ...c, owned: !currentOwned } : c
      ))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(null)
    }
  }

  const filtered = cards.filter(card => {
    if (filter === 'owned') return card.owned
    if (filter === 'missing') return !card.owned
    return true
  })

  const owned = cards.filter(c => c.owned).length

  return (
    <div>
      {/* Filter Buttons */}
      <div className="flex gap-3 mb-6">
        {(['all', 'owned', 'missing'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === f
                ? 'bg-yellow-400 text-black'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {f === 'all'     && `Alle (${cards.length})`}
            {f === 'owned'   && `Vorhanden (${owned})`}
            {f === 'missing' && `Fehlend (${cards.length - owned})`}
          </button>
        ))}
      </div>

      {/* Karten Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
        {filtered.map(card => {
          const typeColor = card.types?.[0] ? TYPE_COLORS[card.types[0]] || 'border-gray-700' : 'border-gray-700'
          const isLoading = loading === card.id

          return (
            <div
              key={card.id}
              onClick={() => !isLoading && toggleCard(card.id, card.owned)}
              className={`
                relative cursor-pointer rounded-xl border-2 overflow-hidden
                transition-all duration-200 group flex flex-col
                ${card.owned
                  ? `${typeColor} opacity-100 shadow-lg`
                  : 'border-gray-800 opacity-40 hover:opacity-70'
                }
                ${isLoading ? 'scale-95' : 'hover:scale-105'}
              `}
            >
              {/* Kartennummer oben links */}
              <div className="absolute top-1 left-1 z-10 bg-black/60 text-gray-300 text-xs px-1.5 py-0.5 rounded font-mono">
                #{card.number}
              </div>

              {/* Owned Badge oben rechts */}
              {card.owned && (
                <div className="absolute top-1 right-1 z-10 bg-yellow-400 text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  ✓
                </div>
              )}

              {/* Karten-Bild */}
              {card.image_url ? (
                <img
                  src={card.image_url}
                  alt={card.name}
                  className="w-full aspect-[2.5/3.5] object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full aspect-[2.5/3.5] bg-gray-800 flex items-center justify-center">
                  <span className="text-gray-600 text-xs text-center p-2">{card.name}</span>
                </div>
              )}

              {/* Name + Preis unter dem Bild */}
              <div className="bg-black/80 px-1.5 py-1 flex flex-col gap-0.5">
                <p className="text-white text-[10px] font-medium leading-tight truncate">
                  {card.name}
                </p>
                {card.price_market ? (
                  <p className="text-yellow-400 text-[10px] font-bold">
                    {card.price_market.toFixed(2)} €
                  </p>
                ) : (
                  <p className="text-gray-600 text-[10px]">kein Preis</p>
                )}
              </div>

              {/* Wishlist */}
              <div className="absolute bottom-8 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20" onClick={e => e.stopPropagation()}>
                <WishlistButton cardId={card.id} />
              </div>
              {/* Wishlist */}
              <div className="absolute bottom-8 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20" onClick={e => e.stopPropagation()}>
                <WishlistButton cardId={card.id} />
              </div>
              {/* Loading Overlay */}
              {isLoading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
