'use client'

import { useState, useEffect } from 'react'

type Wishlist = { id: string; name: string; is_watchlist: boolean }

export default function WishlistButton({ cardId }: { cardId: string }) {
  const [lists,   setLists]   = useState<Wishlist[]>([])
  const [open,    setOpen]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [msg,     setMsg]     = useState('')

  async function loadLists() {
    const res  = await fetch('/api/wishlists')
    const data = await res.json()
    setLists(data.wishlists ?? [])
  }

  async function addToList(wishlist_id: string) {
    setLoading(true)
    const res  = await fetch('/api/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wishlist_id, card_id: cardId }),
    })
    const data = await res.json()
    setMsg(data.error ? data.error : 'Hinzugefuegt!')
    setTimeout(() => { setMsg(''); setOpen(false) }, 1500)
    setLoading(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => { setOpen(!open); if (!open) loadLists() }}
        className="text-xs px-2 py-1 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 transition-colors">
        + Wishlist
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-1 bg-gray-900 border border-gray-700 rounded-xl p-3 min-w-48 z-50 shadow-xl">
          {msg ? (
            <p className="text-xs text-center py-2 text-green-400">{msg}</p>
          ) : lists.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-2">Keine Listen vorhanden</p>
          ) : (
            <div className="space-y-1">
              <p className="text-xs text-gray-500 mb-2">Zu Liste hinzufuegen:</p>
              {lists.map(l => (
                <button key={l.id} onClick={() => addToList(l.id)} disabled={loading}
                  className="w-full text-left text-xs px-2 py-1.5 rounded-lg hover:bg-gray-800 text-white transition-colors flex items-center gap-2">
                  <span>{l.is_watchlist ? '' : ''}</span>
                  {l.name}
                </button>
              ))}
            </div>
          )}
          <button onClick={() => setOpen(false)}
            className="absolute top-2 right-2 text-gray-600 hover:text-gray-400 text-xs">x</button>
        </div>
      )}
    </div>
  )
}