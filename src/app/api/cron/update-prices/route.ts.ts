// src/app/api/cron/update-prices/route.ts
// Täglicher Preis-Update via Vercel Cron
// Läuft täglich um 3:00 Uhr nachts

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { fetchCard, extractPrices } from '@/lib/tcgdex'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

export async function GET(req: Request) {
  // Vercel Cron authentifizieren
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  let updated = 0
  let errors = 0

  try {
    // Alle Karten-IDs aus Supabase laden
    const { data: cards, error } = await supabase
      .from('cards')
      .select('id')
      .order('updated_at', { ascending: true }) // älteste zuerst

    if (error) throw error
    if (!cards?.length) return NextResponse.json({ message: 'Keine Karten gefunden' })

    console.log(`🔄 Aktualisiere Preise für ${cards.length} Karten...`)

    // In Batches verarbeiten
    const batchSize = 10
    for (let i = 0; i < cards.length; i += batchSize) {
      const batch = cards.slice(i, i + batchSize)

      await Promise.all(batch.map(async ({ id }) => {
        try {
          const card = await fetchCard(id)
          const prices = extractPrices(card)
          if (!prices) return

          await supabase
            .from('cards')
            .update({ ...prices, updated_at: new Date().toISOString() })
            .eq('id', id)

          updated++
        } catch {
          errors++
        }
      }))

      await sleep(200)
    }

    return NextResponse.json({ success: true, updated, errors })

  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
