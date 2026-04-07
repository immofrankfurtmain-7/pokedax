import { NextRequest, NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/server";

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    // ── Parse body ─────────────────────────────────────
    const body = await request.json();
    const { imageBase64, mimeType = "image/jpeg" } = body;
    if (!imageBase64) {
      return NextResponse.json({ error: "Kein Bild" }, { status: 400 });
    }

    // ── Scan-Limit für Free-User ────────────────────────
    let scanCount = 0;
    if (user) {
      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      const { count } = await supabase
        .from("scan_logs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", `${today}T00:00:00.000Z`);
      scanCount = count ?? 0;

      // Check premium
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_premium, premium_until")
        .eq("id", user.id)
        .single();

      const isPremium =
        profile?.is_premium === true &&
        (!profile.premium_until || new Date(profile.premium_until) > new Date());

      if (!isPremium && scanCount >= 5) {
        return NextResponse.json(
          { error: "LIMIT_REACHED", scansUsed: scanCount, limit: 5 },
          { status: 429 }
        );
      }
    }

    // ── Gemini Flash Vision ─────────────────────────────
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY fehlt" }, { status: 500 });
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: `You are a Pokémon TCG card identifier. Look at this card image and respond ONLY with a JSON object, nothing else.
Return exactly this structure:
{
  "name": "exact card name as printed (e.g. Charizard ex, Pikachu VMAX, Umbreon ex)",
  "name_de": "German name if different (e.g. Glurak ex, Mewtu ex), or same as name",
  "set_id": "TCGdex set ID if visible (e.g. sv01, sv03, neo4, ecard3), or null",
  "number": "card number if visible (e.g. 006, 107), or null",
  "confidence": 0.95
}
Only output the JSON object, no markdown, no explanation.`
              },
              {
                inline_data: { mime_type: mimeType, data: imageBase64 }
              }
            ]
          }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 200 }
        })
      }
    );

    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      console.error("Gemini error:", err);
      return NextResponse.json({ error: "KI-Fehler" }, { status: 500 });
    }

    const geminiData = await geminiRes.json();
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    // Parse Gemini response
    let cardInfo: { name: string; name_de: string; set_id: string | null; number: string | null; confidence: number };
    try {
      const clean = rawText.replace(/```json|```/g, "").trim();
      cardInfo = JSON.parse(clean);
    } catch {
      console.error("Gemini parse error:", rawText);
      return NextResponse.json({ error: "Karte nicht erkannt" }, { status: 422 });
    }

    // ── Supabase Karten-Lookup ──────────────────────────
    const searchName = cardInfo.name_de || cardInfo.name;

    // Try exact match first, then fuzzy
    let { data: cards } = await supabase
      .from("cards")
      .select("id, name, name_de, set_id, number, price_market, price_low, price_avg7, price_avg30, image_url, rarity")
      .or(`name.ilike.%${searchName}%,name_de.ilike.%${searchName}%`)
      .order("price_market", { ascending: false })
      .limit(5);

    if (!cards || cards.length === 0) {
      // Try with English name
      const { data: fallback } = await supabase
        .from("cards")
        .select("id, name, name_de, set_id, number, price_market, price_low, price_avg7, price_avg30, image_url, rarity")
        .ilike("name", `%${cardInfo.name}%`)
        .order("price_market", { ascending: false })
        .limit(5);
      cards = fallback ?? [];
    }

    const bestMatch = cards?.[0] ?? null;

    // ── Log scan ────────────────────────────────────────
    if (user) {
      await supabase.from("scan_logs").insert({
        user_id:   user.id,
        card_id:   bestMatch?.id ?? null,
        scan_type: "gemini",
      });
    }

    // ── Return result ───────────────────────────────────
    return NextResponse.json({
      gemini:    cardInfo,
      card:      bestMatch,
      matches:   cards ?? [],
      scansUsed: user ? scanCount + 1 : null,
      scansLeft: user ? Math.max(0, 5 - scanCount - 1) : null,
    });

  } catch (err) {
    console.error("Scanner error:", err);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}
