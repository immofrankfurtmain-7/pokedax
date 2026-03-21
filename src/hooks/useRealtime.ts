'use client'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// ── Realtime price updates ─────────────────────────────────────────────────
export function useLivePrice(cardId: string) {
  const [price,     setPrice]     = useState<number | null>(null)
  const [change,    setChange]    = useState<number | null>(null)
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // Initial fetch
    supabase
      .from('card_prices')
      .select('price, change7d, updated_at')
      .eq('card_id', cardId)
      .single()
      .then(({ data }) => {
        if (data) {
          setPrice(data.price)
          setChange(data.change7d)
          setUpdatedAt(data.updated_at)
        }
      })

    // Realtime subscription
    const channel = supabase
      .channel(`price:${cardId}`)
      .on('postgres_changes', {
        event:  'UPDATE',
        schema: 'public',
        table:  'card_prices',
        filter: `card_id=eq.${cardId}`,
      }, payload => {
        setPrice(payload.new.price)
        setChange(payload.new.change7d)
        setUpdatedAt(payload.new.updated_at)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [cardId])

  return { price, change, updatedAt }
}

// ── Realtime chat for marketplace ──────────────────────────────────────────
export interface ChatMessage {
  id:          string
  sender_id:   string
  content:     string
  created_at:  string
}

export function useMarketplaceChat(listingId: string, userId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading,  setLoading]  = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Load history
    supabase
      .from('chat_messages')
      .select('id, sender_id, content, created_at')
      .eq('listing_id', listingId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setMessages(data ?? [])
        setLoading(false)
      })

    // Realtime new messages
    const channel = supabase
      .channel(`chat:${listingId}`)
      .on('postgres_changes', {
        event:  'INSERT',
        schema: 'public',
        table:  'chat_messages',
        filter: `listing_id=eq.${listingId}`,
      }, payload => {
        setMessages(prev => [...prev, payload.new as ChatMessage])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [listingId])

  const sendMessage = useCallback(async (content: string) => {
    await supabase.from('chat_messages').insert({
      listing_id:  listingId,
      sender_id:   userId,
      // receiver_id needs to be set based on the listing seller
      content,
    })
  }, [listingId, userId])

  return { messages, loading, sendMessage }
}

// ── Realtime alert triggers ────────────────────────────────────────────────
export function usePriceAlertTriggers(userId: string, onTriggered: (cardName: string, price: number) => void) {
  const supabase = createClient()

  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel(`alerts:${userId}`)
      .on('postgres_changes', {
        event:  'UPDATE',
        schema: 'public',
        table:  'price_alerts',
        filter: `user_id=eq.${userId}`,
      }, payload => {
        if (payload.new.triggered_at && !payload.old.triggered_at) {
          onTriggered(payload.new.card_name, payload.new.target_price)
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])
}

// ── Portfolio value live updates ───────────────────────────────────────────
export function usePortfolioValue(userId: string) {
  const [totalValue, setTotalValue] = useState<number | null>(null)
  const [loading,    setLoading]    = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!userId) return

    // Fetch portfolio + current prices
    const fetchValue = async () => {
      const { data: cards } = await supabase
        .from('portfolio_cards')
        .select('card_id, quantity')
        .eq('user_id', userId)

      if (!cards?.length) { setLoading(false); return }

      const cardIds = cards.map(c => c.card_id)
      const { data: prices } = await supabase
        .from('card_prices')
        .select('card_id, price')
        .in('card_id', cardIds)

      const priceMap = Object.fromEntries((prices ?? []).map(p => [p.card_id, p.price]))
      const total    = cards.reduce((sum, c) => sum + (priceMap[c.card_id] ?? 0) * c.quantity, 0)
      setTotalValue(total)
      setLoading(false)
    }

    fetchValue()

    // Update when prices change
    const channel = supabase
      .channel(`portfolio_prices:${userId}`)
      .on('postgres_changes', { event:'UPDATE', schema:'public', table:'card_prices' }, () => {
        fetchValue()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  return { totalValue, loading }
}
