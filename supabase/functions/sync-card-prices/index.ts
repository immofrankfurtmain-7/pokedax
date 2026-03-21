// supabase/functions/sync-card-prices/index.ts
// Syncs top trending card prices from Cardmarket to Supabase
// Deploy: supabase functions deploy sync-card-prices
// Schedule: every 30 minutes via Supabase Dashboard > Edge Functions > Cron

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL  = Deno.env.get('SUPABASE_URL')!
const SUPABASE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const POKE_API_KEY  = Deno.env.get('POKEMON_TCG_API_KEY') ?? ''

// Cards to keep fresh (expand this list as you grow)
const TRENDING_CARDS = [
  { id: 'sv1-6',      name: 'Charizard ex' },
  { id: 'sv4pt5-86',  name: 'Pikachu ex'   },
  { id: 'swsh11-71',  name: 'Mewtwo V'     },
  { id: 'sv1-63',     name: 'Gengar ex'    },
  { id: 'base1-4',    name: 'Charizard'    },
  { id: 'swsh5-49',   name: 'Lapras V'     },
  { id: 'sv3pt5-200', name: 'Iono'         },
  { id: 'sv4-198',    name: 'Arven'        },
]

serve(async () => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

  let synced = 0
  const errors: string[] = []

  for (const { id, name } of TRENDING_CARDS) {
    try {
      // For now: mock prices with slight random variation
      // In production: call your /api/cardmarket/price endpoint or Cardmarket directly
      const basePrices: Record<string, number> = {
        'sv1-6': 189.90, 'sv4pt5-86': 44.50, 'swsh11-71': 12.80,
        'sv1-63': 28.40, 'base1-4': 1250, 'swsh5-49': 67.20,
        'sv3pt5-200': 89.90, 'sv4-198': 34.50,
      }

      const base     = basePrices[id] ?? 25
      const variance = (Math.random() - 0.5) * 0.04 // ±2%
      const price    = +(base * (1 + variance)).toFixed(2)
      const avg7     = +(base * (1 + (Math.random() - 0.5) * 0.06)).toFixed(2)
      const avg30    = +(base * 0.94).toFixed(2)
      const change7d = +((price - avg30) / avg30 * 100).toFixed(1)
      const signal   = change7d > 5 ? 'buy' : change7d < -3 ? 'sell' : 'hold'

      await supabase.from('card_prices').upsert({
        card_id:    id,
        card_name:  name,
        price,
        low:        +(price * 0.85).toFixed(2),
        high:       +(price * 1.15).toFixed(2),
        avg7,
        avg30,
        trend:      price,
        change7d,
        signal,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'card_id' })

      synced++
    } catch (err) {
      errors.push(`${name}: ${err}`)
    }

    // Rate limiting pause
    await new Promise(r => setTimeout(r, 200))
  }

  const result = { synced, errors, timestamp: new Date().toISOString() }
  console.log('[sync-card-prices]', result)

  return new Response(JSON.stringify(result), {
    status:  200,
    headers: { 'Content-Type': 'application/json' },
  })
})
