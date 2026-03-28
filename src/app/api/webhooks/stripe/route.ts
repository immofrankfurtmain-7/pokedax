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
