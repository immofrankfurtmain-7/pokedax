import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import type Stripe from 'stripe'

export async function POST(req: Request) {
  const body      = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('[webhook] signature check failed', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = await createClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.CheckoutSession
      const userId  = session.metadata?.userId
      if (userId) {
        await supabase.from('profiles').update({
          is_premium:        true,
          stripe_customer_id: session.customer as string,
          premium_until:     new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString(),
        }).eq('id', userId)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const sub    = event.data.object as Stripe.Subscription
      const userId = sub.metadata?.userId
      if (userId) {
        await supabase.from('profiles').update({
          is_premium:    false,
          premium_until: null,
        }).eq('id', userId)
      }
      break
    }

    case 'invoice.payment_succeeded': {
      const invoice  = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string
      if (customerId) {
        await supabase.from('profiles').update({
          premium_until: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString(),
        }).eq('stripe_customer_id', customerId)
      }
      break
    }

    case 'invoice.payment_failed': {
      const invoice    = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string
      console.warn('[webhook] Payment failed for customer:', customerId)
      // Could send notification email here
      break
    }
  }

  return NextResponse.json({ received: true })
}
