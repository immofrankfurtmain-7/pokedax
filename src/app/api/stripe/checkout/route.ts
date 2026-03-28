import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

const PLANS = {
  premium: {
    name: "PokéDax Premium",
    price: 799, // 7,99€ in Cent
    interval: "month" as const,
  },
  dealer: {
    name: "PokéDax Händler",
    price: 1999, // 19,99€ in Cent
    interval: "month" as const,
  },
};

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });
  }

  const { plan = "premium" } = await request.json();
  const planConfig = PLANS[plan as keyof typeof PLANS] || PLANS.premium;

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id, username, email")
    .eq("id", user.id)
    .single();

  // Create or reuse Stripe customer
  let customerId = profile?.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name:  profile?.username || user.email,
      metadata: { user_id: user.id },
    });
    customerId = customer.id;

    await supabase.from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);
  }

  // Create price on the fly (or use existing Price ID from env)
  const priceId = plan === "dealer"
    ? process.env.STRIPE_PRICE_ID_DEALER
    : process.env.STRIPE_PRICE_ID_PREMIUM;

  let price: Stripe.Price;
  if (priceId) {
    price = await stripe.prices.retrieve(priceId);
  } else {
    // Create inline price (fallback if no Price ID configured)
    price = await stripe.prices.create({
      currency:     "eur",
      unit_amount:  planConfig.price,
      recurring:    { interval: planConfig.interval },
      product_data: { name: planConfig.name },
    });
  }

  const session = await stripe.checkout.sessions.create({
    customer:   customerId,
    mode:       "subscription",
    line_items: [{ price: price.id, quantity: 1 }],
    metadata:   { user_id: user.id },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/premium?success=1`,
    cancel_url:  `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/premium?canceled=1`,
    locale:      "de",
    payment_method_types: ["card", "sepa_debit"],
    subscription_data: {
      metadata: { user_id: user.id },
    },
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: session.url });
}
