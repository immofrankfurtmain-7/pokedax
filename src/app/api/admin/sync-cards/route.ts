// src/app/api/admin/sync-cards/route.ts
// Einmaliger Import aller Karten von TCGdex → Supabase
// Aufruf: GET /api/admin/sync-cards
// Header: x-admin-secret: <ADMIN_SECRET aus .env.local>
export const dynamic = 'force-dynamic'
export const maxDuration = 300

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { fetchAllSets, fetchSetWithCards, fetchCard, getCardImageUrl, extractPrices } from '@/lib/tcgdex'



// Hilfsfunktion: kurz warten (Rate Limiting vermeiden)
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

export async function GET(req: Request) {
  // Sicherheit: nur mit Secret aufrufbar
  const secret = req.headers.get('x-admin-secret')
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const results = { sets: 0, cards: 0, errors: [] as string[] }

  try {
    // 1. Alle Sets laden
    console.log('📦 Lade alle Sets...')
    const sets = await fetchAllSets()
    console.log(`✅ ${sets.length} Sets gefunden`)

    for (const set of sets) {
      try {
        // 2. Set in Supabase speichern
        await supabase.from('sets').upsert({
          id:           set.id,
          name:         set.name,
          series:       set.serie?.name ?? null,
          total:        set.cardCount?.total ?? null,
          release_date: set.releaseDate ?? null,
          symbol_url:   set.symbol ? `https://assets.tcgdex.net/univ/set-symbols/${set.id}.png` : null,
          logo_url:     set.logo   ? `https://assets.tcgdex.net/univ/logos/${set.id}.png` : null,
          updated_at:   new Date().toISOString(),
        })
        results.sets++

        // 3. Karten des Sets laden
        const setData = await fetchSetWithCards(set.id)
        if (!setData.cards?.length) continue

        // 4. Jede Karte einzeln mit Preisen laden & speichern
        // In Batches von 10 um Rate Limits zu vermeiden
        const batchSize = 10
        for (let i = 0; i < setData.cards.length; i += batchSize) {
          const batch = setData.cards.slice(i, i + batchSize)

          await Promise.all(batch.map(async (card) => {
            try {
              // Karte mit Preisen laden
              const fullCard = await fetchCard(card.id)
              const prices = extractPrices(fullCard)

              await supabase.from('cards').upsert({
                id:         fullCard.id,
                set_id:     set.id,
                name:       fullCard.name,
                number:     fullCard.localId,
                rarity:     fullCard.rarity ?? null,
                types:      fullCard.types ?? [],
                supertype:  fullCard.supertype ?? null,
                image_url:  getCardImageUrl(fullCard, 'low'),
                ...( prices ?? {} ),
                updated_at: new Date().toISOString(),
              })
              results.cards++
            } catch (e) {
              results.errors.push(`Card ${card.id}: ${String(e)}`)
            }
          }))

          // 200ms Pause zwischen Batches
          await sleep(200)
        }

        console.log(`✅ Set ${set.name}: ${setData.cards.length} Karten`)
        // 500ms Pause zwischen Sets
        await sleep(500)

      } catch (e) {
        results.errors.push(`Set ${set.id}: ${String(e)}`)
      }
    }

    return NextResponse.json({
      success: true,
      sets:    results.sets,
      cards:   results.cards,
      errors:  results.errors.length,
      first_errors: results.errors.slice(0, 5),
    })

  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
