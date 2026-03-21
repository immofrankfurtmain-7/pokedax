// ── useUser ───────────────────────────────────────────────────────────────────
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export function useUser() {
  const [user,    setUser]    = useState<User | null>(null)
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      if (data.user) {
        supabase.from('profiles').select('*').eq('id', data.user.id).single()
          .then(({ data: p }) => { setProfile(p); setLoading(false) })
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) setProfile(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const isPremium = Boolean(profile?.is_premium)
  const username  = (profile?.username as string | undefined) ?? user?.email?.split('@')[0] ?? ''

  return { user, profile, loading, isPremium, username }
}

// ── usePortfolio ──────────────────────────────────────────────────────────────
export function usePortfolio(userId: string | undefined) {
  const [cards,   setCards]   = useState<unknown[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetch = useCallback(async () => {
    if (!userId) { setLoading(false); return }
    setLoading(true)
    const { data } = await supabase
      .from('portfolio_cards')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    setCards(data ?? [])
    setLoading(false)
  }, [userId, supabase])

  useEffect(() => { fetch() }, [fetch])

  const addCard = async (card: Record<string, unknown>) => {
    if (!userId) return
    await supabase.from('portfolio_cards').insert({ ...card, user_id: userId })
    fetch()
  }

  const removeCard = async (id: string) => {
    await supabase.from('portfolio_cards').delete().eq('id', id)
    setCards(prev => (prev as { id: string }[]).filter(c => c.id !== id))
  }

  const totalValue = (cards as { current_price?: number; quantity?: number }[])
    .reduce((sum, c) => sum + (c.current_price ?? 0) * (c.quantity ?? 1), 0)

  return { cards, loading, addCard, removeCard, totalValue, refetch: fetch }
}

// ── useAlerts ─────────────────────────────────────────────────────────────────
export function useAlerts(userId: string | undefined) {
  const [alerts,  setAlerts]  = useState<unknown[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!userId) { setLoading(false); return }

    supabase.from('price_alerts').select('*').eq('user_id', userId).order('created_at', { ascending: false })
      .then(({ data }) => { setAlerts(data ?? []); setLoading(false) })

    // Realtime subscription for triggered alerts
    const channel = supabase
      .channel(`alerts:${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'price_alerts', filter: `user_id=eq.${userId}` },
        payload => {
          if (payload.eventType === 'UPDATE') {
            setAlerts(prev => (prev as { id: string }[]).map(a => a.id === (payload.new as { id: string }).id ? payload.new : a))
          } else if (payload.eventType === 'INSERT') {
            setAlerts(prev => [payload.new, ...prev])
          } else if (payload.eventType === 'DELETE') {
            setAlerts(prev => (prev as { id: string }[]).filter(a => a.id !== (payload.old as { id: string }).id))
          }
        })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId, supabase])

  const createAlert = async (alert: Record<string, unknown>) => {
    if (!userId) return
    await supabase.from('price_alerts').insert({ ...alert, user_id: userId })
  }

  const toggleAlert = async (id: string, isActive: boolean) => {
    await supabase.from('price_alerts').update({ is_active: !isActive }).eq('id', id)
    setAlerts(prev => (prev as { id: string; is_active: boolean }[]).map(a => a.id === id ? { ...a, is_active: !isActive } : a))
  }

  const deleteAlert = async (id: string) => {
    await supabase.from('price_alerts').delete().eq('id', id)
    setAlerts(prev => (prev as { id: string }[]).filter(a => a.id !== id))
  }

  return { alerts, loading, createAlert, toggleAlert, deleteAlert }
}

// ── useListings ───────────────────────────────────────────────────────────────
export function useListings(filter?: { sellerId?: string; status?: string }) {
  const [listings, setListings] = useState<unknown[]>([])
  const [loading,  setLoading]  = useState(true)
  const supabase = createClient()

  useEffect(() => {
    let query = supabase.from('listings').select('*, profiles(username, is_premium)')

    if (filter?.status)   query = query.eq('status', filter.status)
    else                  query = query.eq('status', 'active')
    if (filter?.sellerId) query = query.eq('seller_id', filter.sellerId)

    query.order('created_at', { ascending: false }).then(({ data }) => {
      setListings(data ?? [])
      setLoading(false)
    })
  }, [filter?.sellerId, filter?.status, supabase])

  const createListing = async (listing: Record<string, unknown>, userId: string) => {
    const { data } = await supabase.from('listings').insert({ ...listing, seller_id: userId, status: 'active' }).select().single()
    if (data) setListings(prev => [data, ...prev])
    return data
  }

  const removeListing = async (id: string) => {
    await supabase.from('listings').update({ status: 'removed' }).eq('id', id)
    setListings(prev => (prev as { id: string }[]).filter(l => l.id !== id))
  }

  return { listings, loading, createListing, removeListing }
}

// ── useRealtimePrices ─────────────────────────────────────────────────────────
export function useRealtimePrices(cardIds: string[]) {
  const [prices, setPrices] = useState<Record<string, unknown>>({})
  const supabase = createClient()

  useEffect(() => {
    if (!cardIds.length) return

    // Initial fetch
    supabase.from('card_prices').select('*').in('card_id', cardIds)
      .then(({ data }) => {
        const map: Record<string, unknown> = {}
        data?.forEach(p => { map[p.card_id] = p })
        setPrices(map)
      })

    // Realtime
    const channel = supabase
      .channel('price_updates')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'card_prices' }, payload => {
        const updated = payload.new as { card_id: string }
        setPrices(prev => ({ ...prev, [updated.card_id]: updated }))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [JSON.stringify(cardIds), supabase])

  return prices
}

// ── useSetProgress ────────────────────────────────────────────────────────────
export function useSetProgress(userId: string | undefined, setId: string) {
  const [progress, setProgress] = useState<{ owned: string[]; total: number }>({ owned: [], total: 0 })
  const supabase = createClient()

  useEffect(() => {
    if (!userId || !setId) return

    supabase.from('portfolio_cards')
      .select('card_id')
      .eq('user_id', userId)
      .then(({ data }) => {
        const owned = (data ?? []).map((c: { card_id: string }) => c.card_id)
        setProgress(prev => ({ ...prev, owned }))
      })
  }, [userId, setId, supabase])

  const pct = progress.total > 0 ? Math.round((progress.owned.length / progress.total) * 100) : 0

  return { ...progress, pct }
}
