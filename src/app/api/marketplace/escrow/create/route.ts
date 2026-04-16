import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createRouteClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

const LAUNCH_END = new Date("2026-07-01");

function calcFees(price: number, isPremium: boolean) {
  const isLaunch = new Date() < LAUNCH_END;
  const escrowFee   = Math.round(price * 0.01 * 100) / 100;
  const provisionRate = (!isLaunch && price > 5) ? (isPremium ? 0.03 : 0.05) : 0;
  const platformFee  = Math.round(price * provisionRate * 100) / 100;
  const sellerPayout = Math.round((price - platformFee) * 100) / 100;
  const buyerTotal   = Math.round((price + escrowFee) * 100) / 100;
  return { escrowFee, platformFee, sellerPayout, buyerTotal, provisionRate, isLaunch };
}

// POST /api/marketplace/escrow/create
export async function POST(request: NextRequest) {
  const supabase = await createRouteClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const { listing_id, offered_price } = await request.json();
  if (!listing_id || !offered_price) {
    return NextResponse.json({ error: "listing_id und offered_price erforderlich" }, { status: 400 });
  }

  // Load listing + seller data
  const { data: listing } = await supabase
    .from("marketplace_listings")
    .select(`
      id, card_id, price, seller_id, status,
      seller_stats!marketplace_listings_seller_id_fkey(stripe_account_id, is_verified)
    `)
    .eq("id", listing_id)
    .single();

  if (!listing) return NextResponse.json({ error: "Inserat nicht gefunden" }, { status: 404 });
  if (listing.status !== "active") return NextResponse.json({ error: "Inserat nicht mehr verfügbar" }, { status: 400 });
  if (listing.seller_id === user.id) return NextResponse.json({ error: "Eigenes Inserat" }, { status: 400 });

  const sellerStats = (listing as any).seller_stats;
  if (!sellerStats?.stripe_account_id || !sellerStats?.is_verified) {
    return NextResponse.json({ error: "Seller nicht verifiziert" }, { status: 400 });
  }

  // Buyer premium check
  const { data: buyerProfile } = await supabase
    .from("profiles")
    .select("is_premium")
    .eq("id", user.id)
    .single();

  const fees = calcFees(offered_price, buyerProfile?.is_premium ?? false);

  // Create Stripe PaymentIntent with Connect
  const pi = await stripe.paymentIntents.create({
    amount: Math.round(fees.buyerTotal * 100),
    currency: "eur",
    application_fee_amount: Math.round((fees.platformFee + fees.escrowFee) * 100),
    transfer_data: { destination: sellerStats.stripe_account_id },
    capture_method: "automatic",
    metadata: {
      listing_id,
      buyer_id: user.id,
      seller_id: listing.seller_id,
    },
  });

  // Create escrow record
  const autoRelease = new Date();
  autoRelease.setDate(autoRelease.getDate() + 14);

  const { data: escrow } = await supabase
    .from("escrow_transactions")
    .insert({
      buyer_id:       user.id,
      seller_id:      listing.seller_id,
      gross_amount:   fees.buyerTotal,
      seller_payout:  fees.sellerPayout,
      platform_fee:   fees.platformFee,
      escrow_fee:     fees.escrowFee,
      stripe_pi_id:   pi.id,
      status:         "pending",
      auto_release_at: autoRelease.toISOString(),
    })
    .select()
    .single();

  // Reserve listing
  await supabase
    .from("marketplace_listings")
    .update({ status: "reserved" })
    .eq("id", listing_id);

  return NextResponse.json({
    client_secret: pi.client_secret,
    escrow_id: escrow?.id,
    fees,
  });
}
