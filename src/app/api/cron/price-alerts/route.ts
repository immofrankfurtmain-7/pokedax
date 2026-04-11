import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/cron/price-alerts — runs daily
export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get all active alerts where current price <= target
  const { data: alerts } = await sb
    .from("price_alerts")
    .select(`
      id, user_id, target_price,
      cards!price_alerts_card_id_fkey(id, name, name_de, price_market, image_url)
    `)
    .eq("is_active", true)
    .eq("notified", false);

  let triggered = 0;
  for (const alert of alerts ?? []) {
    const card = (alert as any).cards;
    if (!card?.price_market) continue;
    if (card.price_market > alert.target_price) continue;

    // Price is at or below target — notify!
    try {
      const { data: authUser } = await sb.auth.admin.getUserById(alert.user_id);
      const email = authUser?.user?.email;

      if (email && process.env.RESEND_API_KEY) {
        const cardName = card.name_de || card.name;
        const price = card.price_market.toLocaleString("de-DE", { minimumFractionDigits: 2 });
        const target = alert.target_price.toLocaleString("de-DE", { minimumFractionDigits: 2 });

        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.RESEND_API_KEY}` },
          body: JSON.stringify({
            from: "pokédax <alerts@pokedax.de>",
            to: email,
            subject: `🔔 Preisalarm: ${cardName} jetzt ${price} €`,
            html: `<div style="background:#09090b;color:#ededf2;padding:32px;font-family:Inter,sans-serif;max-width:520px;margin:0 auto;border-radius:16px">
              <div style="font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#62626f;margin-bottom:16px">pokédax · Preisalarm</div>
              <h1 style="font-size:22px;font-weight:300;margin:0 0 8px">${cardName}</h1>
              <p style="color:#a4a4b4;margin:0 0 6px">Aktueller Preis: <strong style="color:#D4A843">${price} €</strong></p>
              <p style="color:#62626f;margin:0 0 24px;font-size:12px">Dein Zielpreis war: ${target} €</p>
              <a href="https://pokedax.de/preischeck/${card.id}" style="display:inline-block;background:#D4A843;color:#09090b;padding:12px 24px;border-radius:10px;text-decoration:none;font-size:14px">Karte ansehen →</a>
            </div>`,
          }),
        });
      }

      // Mark as notified
      await sb.from("price_alerts").update({ notified: true, triggered_at: new Date().toISOString() }).eq("id", alert.id);
      triggered++;
    } catch(e) { console.error(e); }
  }

  return NextResponse.json({ triggered, checked: alerts?.length ?? 0 });
}
