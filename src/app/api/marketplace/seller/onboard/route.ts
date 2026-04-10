import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createRouteClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

// POST /api/marketplace/seller/onboard
// Creates or retrieves Stripe Connect Express account for seller
export async function POST(request: NextRequest) {
  const supabase = await createRouteClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  // Check premium
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_premium, stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (!profile?.is_premium) {
    return NextResponse.json({ error: "Premium erforderlich" }, { status: 403 });
  }

  // Check if seller already has Connect account
  const { data: stats } = await supabase
    .from("seller_stats")
    .select("stripe_account_id")
    .eq("user_id", user.id)
    .single();

  let accountId = stats?.stripe_account_id;

  if (!accountId) {
    // Create new Express account
    const account = await stripe.accounts.create({
      type: "express",
      country: "DE",
      email: user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: "individual",
      settings: {
        payouts: { schedule: { interval: "weekly", weekly_anchor: "monday" } },
      },
    });
    accountId = account.id;

    // Save to seller_stats
    await supabase.from("seller_stats").upsert({
      user_id: user.id,
      stripe_account_id: accountId,
      is_verified: false,
    });
  }

  // Create onboarding link
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://pokedax.de";
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${appUrl}/dashboard?onboard=refresh`,
    return_url:  `${appUrl}/dashboard?onboard=success`,
    type: "account_onboarding",
  });

  return NextResponse.json({ url: accountLink.url });
}

// GET /api/marketplace/seller/onboard — check onboarding status
export async function GET(request: NextRequest) {
  const supabase = await createRouteClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ready: false });

  const { data: stats } = await supabase
    .from("seller_stats")
    .select("stripe_account_id, is_verified")
    .eq("user_id", user.id)
    .single();

  if (!stats?.stripe_account_id) return NextResponse.json({ ready: false, needs_onboard: true });

  try {
    const account = await stripe.accounts.retrieve(stats.stripe_account_id);
    const ready = account.charges_enabled && account.payouts_enabled;

    if (ready && !stats.is_verified) {
      await supabase.from("seller_stats")
        .update({ is_verified: true })
        .eq("user_id", user.id);
    }

    return NextResponse.json({
      ready,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      account_id: stats.stripe_account_id,
    });
  } catch {
    return NextResponse.json({ ready: false, error: "Account nicht gefunden" });
  }
}
