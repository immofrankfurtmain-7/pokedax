// supabase/functions/check-price-alerts/index.ts
// Deploy with: supabase functions deploy check-price-alerts
// Trigger: cron every 15 minutes via pg_cron or Supabase Dashboard

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const SUPABASE_URL   = Deno.env.get('SUPABASE_URL')!
const SUPABASE_KEY   = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async () => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

  // 1. Get all active alerts
  const { data: alerts } = await supabase
    .from('price_alerts')
    .select('*, profiles(email, username)')
    .eq('is_active', true)
    .is('triggered_at', null)

  if (!alerts?.length) return new Response('No active alerts', { status: 200 })

  // 2. Get current prices for alert card IDs
  const cardIds = [...new Set(alerts.map((a: { card_id: string }) => a.card_id))]
  const { data: prices } = await supabase
    .from('card_prices')
    .select('card_id, price')
    .in('card_id', cardIds)

  const priceMap: Record<string, number> = {}
  prices?.forEach((p: { card_id: string; price: number }) => { priceMap[p.card_id] = p.price })

  // 3. Check each alert
  const triggered: string[] = []

  for (const alert of alerts as {
    id: string; card_id: string; card_name: string; target_price: number
    condition: 'above' | 'below'; profiles: { email: string; username: string }
  }[]) {
    const currentPrice = priceMap[alert.card_id]
    if (!currentPrice) continue

    const shouldTrigger =
      (alert.condition === 'above' && currentPrice >= alert.target_price) ||
      (alert.condition === 'below' && currentPrice <= alert.target_price)

    if (!shouldTrigger) continue

    triggered.push(alert.id)

    // 4. Send email via Resend
    const direction = alert.condition === 'above' ? 'über' : 'unter'
    const emoji     = alert.condition === 'above' ? '📈' : '📉'

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from:    'PokeDax <alerts@pokedax.de>',
        to:      [alert.profiles.email],
        subject: `${emoji} Preis-Alert: ${alert.card_name} ist jetzt ${currentPrice.toFixed(2)}€`,
        html: `
          <div style="font-family:Inter,sans-serif;background:#04020e;color:#e8e8f0;max-width:500px;margin:0 auto;border-radius:16px;overflow:hidden">
            <div style="background:linear-gradient(135deg,#4B0082,#7c3aed);padding:24px;text-align:center">
              <div style="font-size:40px;margin-bottom:8px">${emoji}</div>
              <div style="font-family:Georgia,serif;font-size:24px;font-weight:900;color:#FFD700;letter-spacing:2px">POKÉDAX</div>
            </div>
            <div style="padding:28px">
              <h2 style="margin:0 0 8px;font-size:20px;font-weight:800;color:white">Dein Preis-Alert wurde ausgelöst!</h2>
              <p style="margin:0 0 20px;color:rgba(255,255,255,0.55);font-size:14px">Hallo ${alert.profiles.username},</p>
              <div style="background:rgba(124,58,237,0.12);border:1px solid rgba(124,58,237,0.3);border-radius:12px;padding:20px;margin-bottom:20px">
                <div style="font-size:18px;font-weight:800;color:white;margin-bottom:4px">${alert.card_name}</div>
                <div style="font-size:32px;font-weight:900;color:white;margin:8px 0">${currentPrice.toFixed(2)} €</div>
                <div style="font-size:13px;color:rgba(255,255,255,0.5)">
                  Preis ist ${direction} deinem Zielpreis von <strong style="color:white">${alert.target_price.toFixed(2)} €</strong>
                </div>
              </div>
              <a href="https://pokedax.de/preischeck"
                style="display:block;text-align:center;background:linear-gradient(135deg,#7c3aed,#a855f7);color:white;padding:14px;border-radius:12px;font-weight:700;text-decoration:none;font-size:14px">
                Karte auf PokeDax ansehen →
              </a>
              <p style="margin:20px 0 0;color:rgba(255,255,255,0.3);font-size:11px;text-align:center">
                Dieser Alert wird deaktiviert. Du kannst neue Alerts auf <a href="https://pokedax.de/dashboard/alerts" style="color:#a78bfa">pokedax.de</a> erstellen.
              </p>
            </div>
          </div>
        `,
      }),
    })
  }

  // 5. Mark triggered alerts
  if (triggered.length > 0) {
    await supabase.from('price_alerts').update({
      is_active:    false,
      triggered_at: new Date().toISOString(),
    }).in('id', triggered)
  }

  return new Response(
    JSON.stringify({ checked: alerts.length, triggered: triggered.length }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
})
