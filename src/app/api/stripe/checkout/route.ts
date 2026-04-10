import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createRouteClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

export async function POST(request: NextRequest) {
  const supabase = await createRouteClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://pokedax.de";
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: process.env.STRIPE_PRICE_ID_PREMIUM!, quantity: 1 }],
    success_url: `${appUrl}/dashboard?checkout=success`,
    cancel_url:  `${appUrl}/dashboard/premium`,
    customer_email: user.email,
    metadata: { user_id: user.id },
  });
  return NextResponse.json({ url: session.url });
}
