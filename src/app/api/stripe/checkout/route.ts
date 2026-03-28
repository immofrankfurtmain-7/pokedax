import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY fehlt");
  return new Stripe(key, { apiVersion: "2024-06-20" });
}

const PLANS = {
  premium: { name: "PokéDax Premium", price: 799,  interval: "month" as const },
  dealer:  { name: "PokéDax Händler", price: 1999, interval: "month" as const },
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const plan = (body.plan as keyof typeof PLANS) || "premium";
    const planConfig = PLANS[plan] || PLANS.premium;

    const stripe = getStripe();

    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id, username")
      .eq("id", user.id)
      .single();

    // Create or reuse Stripe customer
    let customerId = profile?.stripe_customer_id as string | undefined;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email:    user.email,
        name:     profile?.username || user.email || "Trainer",
        metadata: { user_id: user.id },
      });
      customerId = customer.id;
      await supabase.from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    // Use Price ID from env, or create price on the fly
    const priceId = plan === "dealer"
      ? process.env.STRIPE_PRICE_ID_DEALER
      : process.env.STRIPE_PRICE_ID_PREMIUM;

    let finalPriceId: string;
    if (priceId) {
      finalPriceId = priceId;
    } else {
      const price = await stripe.prices.create({
        currency:     "eur",
        unit_amount:  planConfig.price,
        recurring:    { interval: planConfig.interval },
        product_data: { name: planConfig.name },
      });
      finalPriceId = price.id;
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pokedax2.vercel.app";

    const session = await stripe.checkout.sessions.create({
      customer:   customerId,
      mode:       "subscription",
      line_items: [{ price: finalPriceId, quantity: 1 }],
      metadata:   { user_id: user.id },
      success_url: `${appUrl}/dashboard/premium?success=1`,
      cancel_url:  `${appUrl}/dashboard/premium?canceled=1`,
      locale:      "de",
      payment_method_types: ["card"],
      subscription_data: { metadata: { user_id: user.id } },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });

  } catch (err: any) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: err?.message || "Unbekannter Fehler" },
      { status: 500 }
    );
  }
}
