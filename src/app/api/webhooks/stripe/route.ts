import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    const Stripe = (await import('stripe')).default
    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
      apiVersion: '2024-11-20.acacia' as never,
    })

    let event: ReturnType<typeof stripeInstance.webhooks.constructEvent>
    try {
      event = stripeInstance.webhooks.constructEvent(
        body, signature, process.env.STRIPE_WEBHOOK_SECRET ?? ''
      )
    } catch (err) {
      console.error('[webhook] signature check failed', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const supabase = await createClient()
    const obj = event.data.object as Record<string, unknown>

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
        const customerId = obj.customer as string
        if (customerId) {
          await supabase.from('profiles').update({
            premium_until: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString(),
          }).eq('stripe_customer_id', customerId)
        }
        break
      }
      case 'invoice.payment_failed': {
        console.warn('[webhook] Payment failed:', obj.customer)
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[webhook] error', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}