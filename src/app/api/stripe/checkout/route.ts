import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

const PRICE_IDS = {
  monthly: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID!,
  yearly:  process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID!,
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 })

    const { plan } = await req.json() as { plan: 'monthly' | 'yearly' }
    const priceId  = PRICE_IDS[plan]
    if (!priceId)  return NextResponse.json({ error: 'Ungültiger Plan' }, { status: 400 })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL!

    const session = await stripe.checkout.sessions.create({
      mode:                'subscription',
      payment_method_types: ['card'],
      customer_email:      user.email,
      line_items:          [{ price: priceId, quantity: 1 }],
      success_url:         `${appUrl}/dashboard?upgraded=true`,
      cancel_url:          `${appUrl}/dashboard/premium`,
      metadata:            { userId: user.id, plan },
      subscription_data:   { metadata: { userId: user.id } },
      allow_promotion_codes: true,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[stripe/checkout]', err)
    return NextResponse.json({ error: 'Stripe-Fehler' }, { status: 500 })
  }
}
