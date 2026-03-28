# Stripe apiVersion fix
$root = "C:\Users\lenovo\pokedax\pokedax\pokedax"
$enc  = New-Object System.Text.UTF8Encoding $true
Write-Host "Stripe apiVersion fix..." -ForegroundColor Cyan

$checkoutRoute = @'
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

'@
[System.IO.File]::WriteAllText("$root\src\app\api\stripe\checkout\route.ts", $checkoutRoute, $enc)
Write-Host "  OK: route.ts" -ForegroundColor Green

$webhookRoute = @'
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

// Supabase Admin Client (Service Role - bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const body      = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook signature failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {

      // ── Zahlung erfolgreich → Premium aktivieren ──
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const userId     = session.metadata?.user_id;

        if (userId) {
          // Abo-Ende ermitteln
          let premiumUntil: string | null = null;
          if (session.subscription) {
            const sub = await stripe.subscriptions.retrieve(
              session.subscription as string
            );
            premiumUntil = new Date(
              sub.current_period_end * 1000
            ).toISOString();
          }

          await supabase.from("profiles").update({
            is_premium:          true,
            premium_until:       premiumUntil,
            stripe_customer_id:  customerId,
          }).eq("id", userId);

          console.log(`✓ Premium aktiviert für User ${userId}`);
        }
        break;
      }

      // ── Abo erneuert → Datum verlängern ──
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        if (invoice.subscription) {
          const sub = await stripe.subscriptions.retrieve(
            invoice.subscription as string
          );
          const premiumUntil = new Date(
            sub.current_period_end * 1000
          ).toISOString();

          await supabase.from("profiles").update({
            is_premium:    true,
            premium_until: premiumUntil,
          }).eq("stripe_customer_id", customerId);

          console.log(`✓ Premium verlängert für Customer ${customerId}`);
        }
        break;
      }

      // ── Zahlung fehlgeschlagen ──
      case "invoice.payment_failed": {
        const invoice    = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // Noch nicht sofort deaktivieren — Stripe versucht es mehrmals
        console.log(`⚠ Zahlung fehlgeschlagen für Customer ${customerId}`);
        break;
      }

      // ── Abo gekündigt / abgelaufen → Premium deaktivieren ──
      case "customer.subscription.deleted": {
        const sub        = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        await supabase.from("profiles").update({
          is_premium:    false,
          premium_until: null,
        }).eq("stripe_customer_id", customerId);

        console.log(`✓ Premium deaktiviert für Customer ${customerId}`);
        break;
      }

      // ── Abo pausiert ──
      case "customer.subscription.paused": {
        const sub        = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        await supabase.from("profiles").update({
          is_premium: false,
        }).eq("stripe_customer_id", customerId);
        break;
      }

      default:
        console.log(`Unhandled event: ${event.type}`);
    }
  } catch (err: any) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

'@
[System.IO.File]::WriteAllText("$root\src\app\api\webhooks\stripe\route.ts", $webhookRoute, $enc)
Write-Host "  OK: route.ts" -ForegroundColor Green

Write-Host "Fertig! GitHub -> Commit & Push" -ForegroundColor Cyan
