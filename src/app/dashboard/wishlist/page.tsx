'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Navbar from '@/components/layout/Navbar'

type Wishlist = { id: string; name: string; is_watchlist: boolean; wishlist_items: { count: number }[] }
type WishItem = { id: string; added_at: string; cards: { id: string; name: string; number: string; image_url: string | null; price_market: number; price_avg7: number | null; sets: { name: string } } }

function fmt(n: number) {
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' '
}

export default function WishlistPage() {
  const [lists,      setLists]      = useState<Wishlist[]>([])
  const [active,     setActive]     = useState<string | null>(null)
  const [items,      setItems]      = useState<WishItem[]>([])
  const [loading,    setLoading]    = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newName,    setNewName]    = useState('')
  const [isWatch,    setIsWatch]    = useState(false)

  useEffect(() => { loadLists() }, [])

  async function loadLists() {
    const res  = await fetch('/api/wishlists')
    const data = await res.json()
    setLists(data.wishlists ?? [])
    setLoading(false)
    if (data.wishlists?.length > 0 && !active) {
      setActive(data.wishlists[0].id)
      loadItems(data.wishlists[0].id)
    }
  }

  async function loadItems(id: string) {
    setActive(id)
    const res  = await fetch('/api/wishlist?id=' + id)
    const data = await res.json()
    setItems(data.items ?? [])
  }

  async function createList() {
    if (!newName.trim()) return
    const res  = await fetch('/api/wishlists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, is_watchlist: isWatch }),
    })
    const data = await res.json()
    if (data.wishlist) {
      setShowCreate(false)
      setNewName('')
      setIsWatch(false)
      loadLists()
    }
  }

  async function deleteItem(wishlist_id: string, card_id: string) {
    await fetch('/api/wishlist', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wishlist_id, card_id }),
    })
    if (active) loadItems(active)
  }

  async function deleteList(id: string) {
    await fetch('/api/wishlists', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setActive(null)
    setItems([])
    loadLists()
  }

  const totalValue = items.reduce((sum, i) => sum + (i.cards?.price_market ?? 0), 0)

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-black text-white">
        <div className="max-w-5xl mx-auto px-4 pt-24 pb-12">

          <div className="mb-8 flex items-center justify-between">
            <div>
              <div className="text-xs text-cyan-400 uppercase tracking-widest mb-1">Dashboard</div>
              <h1 className="text-3xl font-bold">Meine Wishlists</h1>
            </div>
            <button onClick={() => setShowCreate(true)}
              className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              + Neue Liste
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-2">
              {loading ? (
                <div className="text-gray-500 text-sm">Laedt...</div>
              ) : lists.length === 0 ? (
                <div className="text-gray-600 text-sm text-center py-8">
                  Noch keine Listen.<br/>Erstelle deine erste!
                </div>
              ) : lists.map(list => (
                <button key={list.id} onClick={() => loadItems(list.id)}
                  className={'w-full text-left px-4 py-3 rounded-xl border transition-all ' +
                    (active === list.id
                      ? 'border-purple-600 bg-purple-950/30 text-white'
                      : 'border-gray-800 bg-gray-900 text-gray-400 hover:border-gray-600')}>
                  <div className="flex items-center gap-2">
                    <span>{list.is_watchlist ? '' : ''}</span>
                    <span className="font-medium text-sm truncate">{list.name}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5 ml-6">
                    {list.wishlist_items?.[0]?.count ?? 0} Karten
                  </div>
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              {active && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-lg font-bold text-white">
                        {lists.find(l => l.id === active)?.name}
                        {lists.find(l => l.id === active)?.is_watchlist && (
                          <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-cyan-900 text-cyan-300">Beobachtungsliste</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 mt-0.5">
                        Gesamtwert: <span className="text-cyan-400 font-bold">{fmt(totalValue)}</span>
                      </div>
                    </div>
                    <button onClick={() => deleteList(active)}
                      className="text-xs text-red-500 hover:text-red-400 transition-colors">
                      Liste loeschen
                    </button>
                  </div>

                  {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-600 gap-3">
                      <span className="text-4xl"></span>
                      <p>Noch keine Karten in dieser Liste</p>
                      <p className="text-sm">Fuege Karten im Preischeck oder Portfolio hinzu</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {items.map(item => {
                        const card = item.cards
                        const trend = card.price_market && card.price_avg7
                          ? ((card.price_market - card.price_avg7) / card.price_avg7) * 100
                          : null
                        return (
                          <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden group">
                            <div className="relative aspect-[2.5/3.5] bg-gray-800">
                              {card.image_url ? (
                                <Image src={card.image_url} alt={card.name} fill
                                  className="object-contain p-1"
                                  sizes="(max-width: 640px) 50vw, 150px" />
                              ) : (
                                <div className="flex items-center justify-center h-full text-gray-600 text-xs">Kein Bild</div>
                              )}
                            </div>
                            <div className="p-3">
                              <p className="text-white text-xs font-medium truncate">{card.name}</p>
                              <p className="text-gray-500 text-xs truncate">{Array.isArray(card.sets) ? card.sets[0]?.name : card.sets?.name}</p>
                              <div className="mt-1.5 flex items-center justify-between">
                                <span className="text-cyan-400 text-sm font-bold">{fmt(card.price_market)}</span>
                                {trend !== null && (
                                  <span className={`text-xs font-medium ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
                                  </span>
                                )}
                              </div>
                              <button onClick={() => deleteItem(active, card.id)}
                                className="mt-2 w-full text-xs text-red-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                                Entfernen
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Create Modal */}
          {showCreate && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md p-6">
                <h2 className="text-lg font-bold mb-4">Neue Wishlist</h2>
                <input type="text" placeholder="Name der Liste..." value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm mb-3 focus:outline-none focus:border-purple-500"
                />
                <label className="flex items-center gap-2 text-sm text-gray-400 mb-4 cursor-pointer">
                  <input type="checkbox" checked={isWatch} onChange={e => setIsWatch(e.target.checked)}
                    className="rounded" />
                  Als Beobachtungsliste (fuer Preis-Alerts)
                </label>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setShowCreate(false)}
                    className="px-4 py-2 rounded-lg border border-gray-700 text-sm text-gray-400 hover:border-gray-500">
                    Abbrechen
                  </button>
                  <button onClick={createList} disabled={!newName.trim()}
                    className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-sm font-medium">
                    Erstellen
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </>
  )
}