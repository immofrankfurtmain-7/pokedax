import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  // Verify cron secret
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get unnotified matches with user emails
  const { data: matches } = await supabase
    .from("wishlist_matches")
    .select(`
      id, wishlist_user_id, listing_id,
      marketplace_listings!wishlist_matches_listing_id_fkey(
        price, condition,
        cards!marketplace_listings_card_id_fkey(name, name_de)
      ),
      profiles!wishlist_matches_wishlist_user_id_fkey(username)
    `)
    .is("notified_at", null)
    .eq("dismissed", false)
    .limit(50);

  if (!matches?.length) return NextResponse.json({ sent: 0 });

  // Get emails separately (auth.users not directly joinable)
  let sent = 0;
  for (const match of matches) {
    try {
      const { data: authUser } = await supabase.auth.admin.getUserById(
        match.wishlist_user_id
      );
      const email = authUser?.user?.email;
      if (!email) continue;

      const listing = (match as any).marketplace_listings;
      const card    = listing?.cards;
      const cardName = card?.name_de || card?.name || "Unbekannte Karte";
      const price   = listing?.price?.toLocaleString("de-DE", { minimumFractionDigits: 2 }) + " €";

      // Send via Resend
      if (process.env.RESEND_API_KEY) {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "pokédax <matches@pokedax.de>",
            to: email,
            subject: `✦ ${cardName} ist verfügbar — ${price}`,
            html: `
              <div style="background:#09090b;color:#ededf2;padding:32px;font-family:Inter,sans-serif;max-width:520px;margin:0 auto;border-radius:16px">
                <div style="font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#62626f;margin-bottom:16px">pokédax · Wishlist Match</div>
                <h1 style="font-size:24px;font-weight:300;letter-spacing:-.03em;margin:0 0 8px">Deine Karte ist verfügbar</h1>
                <p style="color:#a4a4b4;margin:0 0 24px">${cardName} wird jetzt für <strong style="color:#D4A843">${price}</strong> angeboten · Kondition: ${listing?.condition ?? "NM"}</p>
                <a href="https://pokedax.de/marketplace/matches" style="display:inline-block;background:#D4A843;color:#09090b;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:500;font-size:14px">Match ansehen →</a>
                <p style="font-size:11px;color:#62626f;margin-top:24px">pokédax · <a href="https://pokedax.de/settings" style="color:#62626f">Benachrichtigungen verwalten</a></p>
              </div>
            `,
          }),
        });
      }

      // Mark as notified
      await supabase
        .from("wishlist_matches")
        .update({ notified_at: new Date().toISOString() })
        .eq("id", match.id);

      sent++;
    } catch (e) {
      console.error("Notify error:", e);
    }
  }

  return NextResponse.json({ sent });
}
