import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createRouteClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

// POST /api/marketplace/escrow/update
// Actions: ship, confirm, dispute
export async function POST(request: NextRequest) {
  const supabase = await createRouteClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const { escrow_id, action, tracking_number, dispute_reason } = await request.json();

  const { data: escrow } = await supabase
    .from("escrow_transactions")
    .select("*")
    .eq("id", escrow_id)
    .single();

  if (!escrow) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });

  switch (action) {
    case "ship": {
      if (escrow.seller_id !== user.id) return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
      if (escrow.status !== "paid") return NextResponse.json({ error: "Zahlung nicht eingegangen" }, { status: 400 });
      await supabase.from("escrow_transactions").update({
        status: "shipped",
        shipped_at: new Date().toISOString(),
        tracking_number: tracking_number ?? null,
      }).eq("id", escrow_id);
      return NextResponse.json({ ok: true, status: "shipped" });
    }

    case "confirm": {
      if (escrow.buyer_id !== user.id) return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
      if (escrow.status !== "shipped") return NextResponse.json({ error: "Noch nicht versendet" }, { status: 400 });
      await releaseEscrow(supabase, escrow);
      return NextResponse.json({ ok: true, status: "released" });
    }

    case "dispute": {
      if (escrow.buyer_id !== user.id) return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
      await supabase.from("escrow_transactions").update({
        status: "disputed",
        dispute_reason: dispute_reason ?? "Kein Grund angegeben",
      }).eq("id", escrow_id);
      return NextResponse.json({ ok: true, status: "disputed" });
    }

    default:
      return NextResponse.json({ error: "Unbekannte Aktion" }, { status: 400 });
  }
}

async function releaseEscrow(supabase: any, escrow: any) {
  // Transfer funds to seller via Stripe
  try {
    await stripe.transfers.create({
      amount: Math.round(escrow.seller_payout * 100),
      currency: "eur",
      destination: escrow.stripe_seller_account ?? "",
      transfer_group: escrow.id,
    });
  } catch (e) {
    console.error("Stripe transfer error:", e);
  }

  await supabase.from("escrow_transactions").update({
    status: "released",
    received_at: new Date().toISOString(),
    released_at: new Date().toISOString(),
  }).eq("id", escrow.id);

  // Update seller stats
  await supabase.rpc("update_seller_stats", {
    p_seller_id: escrow.seller_id,
    p_amount: escrow.seller_payout,
  }).catch(() => {});

  // Fallback: manual update
  const { data: stats } = await supabase
    .from("seller_stats")
    .select("total_sales, total_volume")
    .eq("user_id", escrow.seller_id)
    .single();

  if (stats) {
    await supabase.from("seller_stats").update({
      total_sales:  (stats.total_sales ?? 0) + 1,
      total_volume: (stats.total_volume ?? 0) + escrow.seller_payout,
    }).eq("user_id", escrow.seller_id);
  }

  // Log transaction
  await supabase.from("marketplace_transactions").insert({
    escrow_id: escrow.id,
    event_type: "funds_released",
    amount: escrow.seller_payout,
  });
}
