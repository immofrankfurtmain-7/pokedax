# Relativer Pfad - Script sucht die Datei ab dem Ordner wo es ausgefuehrt wird
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$file = Join-Path $scriptDir "src\app\api\webhooks\stripe\route.ts"

if (-not (Test-Path $file)) {
    Write-Host "[FEHLER] Datei nicht gefunden: $file"
    Write-Host "Bitte das Script direkt im pokedax/ Ordner ausfuehren."
    exit 1
}

$content = @'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')
    if (!signature) return NextResponse.json({ error: 'No signature' }, { status: 400 })

    const Stripe = (await import('stripe')).default
    const s = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
      apiVersion: '2024-11-20.acacia' as never,
    })

    let event: ReturnType<typeof s.webhooks.constructEvent>
    try {
      event = s.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET ?? '')
    } catch {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const supabase = await createClient()
    const obj = event.data.object as unknown as Record<string, unknown>

    switch (event.type) {
      case 'checkout.session.completed': {
        const userId = (obj.metadata as Record<string, string> | null)?.userId
        if (userId) {
          await supabase.from('profiles').update({
            is_premium:         true,
            stripe_customer_id: obj.customer as string,
            premium_until:      new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString(),
          }).eq('id', userId)
        }
        break
      }
      case 'customer.subscription.deleted': {
        const userId = (obj.metadata as Record<string, string> | null)?.userId
        if (userId) {
          await supabase.from('profiles').update({
            is_premium:    false,
            premium_until: null,
          }).eq('id', userId)
        }
        break
      }
      case 'invoice.payment_succeeded': {
        const cid = obj.customer as string
        if (cid) {
          await supabase.from('profiles').update({
            premium_until: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString(),
          }).eq('stripe_customer_id', cid)
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[webhook]', err)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
'@

Set-Content -Path $file -Value $content -Encoding UTF8
Write-Host "[OK] Datei geaendert: $file"
