/**
 * pokédax Scanner v2 — Non-AI, Hash-basierter Scanner
 * POST /api/scanner/scan
 *
 * Flow:
 * 1. User-Foto empfangen
 * 2. Bild normalisieren (sharp)
 * 3. pHash + dHash berechnen
 * 4. Suche in DB via find_card_by_hash() SQL-Funktion
 * 5. Falls kein Match: Gemini als Fallback (falls aktiviert)
 * 6. DB aktualisieren (scan_count, ggf. besseres Referenzbild)
 * 7. Rückgabe: Karte + Konfidenz + Preis
 */

import { NextRequest, NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/server";
import { computePhash, computeDhash, imageQualityScore, normalizeCardImage } from "@/lib/phash";

export const dynamic  = "force-dynamic";
export const maxDuration = 30;

// Konfidenz-Schwellen
const THRESHOLD_HIGH   = 90; // Sicher → direkt zurückgeben
const THRESHOLD_MEDIUM = 70; // Wahrscheinlich → mit Bestätigung
const THRESHOLD_LOW    = 50; // Unsicher → Gemini Fallback
const MAX_HASH_DIST    = 10; // Maximale Hamming-Distance

export async function POST(request: NextRequest) {
  const supabase = await createRouteClient(request);
  const { data: { user } } = await supabase.auth.getUser();

  // Rate limit check
  if (user) {
    const { data: profile } = await supabase
      .from("profiles").select("is_premium").eq("id", user.id).single();
    const isPremium = profile?.is_premium ?? false;

    if (!isPremium) {
      const today = new Date().toISOString().split("T")[0];
      const { count } = await supabase.from("scan_logs")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", today + "T00:00:00Z");
      if ((count ?? 0) >= 5) {
        return NextResponse.json({ error: "Tageslimit erreicht", limit_reached: true }, { status: 429 });
      }
    }
  }

  // Parse image from request
  let imageBuffer: Buffer;
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const file = form.get("image") as File | null;
    if (!file) return NextResponse.json({ error: "Kein Bild" }, { status: 400 });
    imageBuffer = Buffer.from(await file.arrayBuffer());
  } else if (contentType.includes("application/json")) {
    const { image_base64, image_url } = await request.json();
    if (image_url) {
      const res = await fetch(image_url);
      imageBuffer = Buffer.from(await res.arrayBuffer());
    } else if (image_base64) {
      const base64Data = image_base64.replace(/^data:image\/\w+;base64,/, "");
      imageBuffer = Buffer.from(base64Data, "base64");
    } else {
      return NextResponse.json({ error: "Kein Bild" }, { status: 400 });
    }
  } else {
    return NextResponse.json({ error: "Ungültiger Content-Type" }, { status: 400 });
  }

  // ── Phase 1: Bildnormalisierung ───────────────────────────
  const normalizedBuffer = await normalizeCardImage(imageBuffer);
  const [phash, dhash, quality] = await Promise.all([
    computePhash(normalizedBuffer),
    computeDhash(normalizedBuffer),
    imageQualityScore(normalizedBuffer),
  ]);

  // ── Phase 2: Datenbanksuche via Hamming-Distance ──────────
  const { data: dbMatches, error: dbError } = await supabase.rpc("find_card_by_hash", {
    query_hash: phash,
    max_distance: MAX_HASH_DIST,
    result_limit: 5,
  });

  let matchedCard: any = null;
  let confidence = 0;
  let matchMethod = "none";

  if (dbMatches?.length > 0) {
    const best = dbMatches[0];
    confidence = best.confidence;
    matchMethod = "phash";

    if (confidence >= THRESHOLD_HIGH) {
      // High confidence — accept immediately
      const { data: card } = await supabase.from("cards")
        .select("*").eq("id", best.card_id).single();
      matchedCard = card;
    } else if (confidence >= THRESHOLD_MEDIUM) {
      // Medium — return top 3 for user confirmation
      const cardIds = dbMatches.slice(0, 3).map((m: any) => m.card_id);
      const { data: cards } = await supabase.from("cards")
        .select("id,name,name_de,set_id,number,image_url,price_market,rarity")
        .in("id", cardIds);
      return NextResponse.json({
        status: "confirm",
        candidates: cards,
        confidence,
        phash_computed: phash,
        message: "Bitte die richtige Karte bestätigen",
      });
    }
  }

  // ── Phase 3: Gemini Fallback (wenn Hash-Matching versagt) ─
  if (!matchedCard && process.env.GEMINI_API_KEY) {
    matchMethod = "gemini_fallback";
    const base64 = normalizedBuffer.toString("base64");
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: "Identify this Pokémon TCG card. Return ONLY JSON: {name_en, set_id, number, is_holo, variant}. No explanation." },
              { inline_data: { mime_type: "image/jpeg", data: base64 } },
            ]
          }]
        })
      }
    );

    if (geminiRes.ok) {
      const geminiData = await geminiRes.json();
      const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      try {
        const clean = text.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(clean);

        // Search DB by name + set
        const { data: found } = await supabase.from("cards")
          .select("*")
          .or(`name.ilike.%${parsed.name_en}%,name_de.ilike.%${parsed.name_en}%`)
          .limit(3);

        if (found?.length) {
          matchedCard = found[0];
          confidence = 85;
        }
      } catch(e) {}
    }
  }

  // ── Phase 4: Kein Match → neue Variante vorschlagen ───────
  if (!matchedCard) {
    // Log für spätere manuelle Überprüfung
    if (user) {
      await supabase.from("card_scan_feedback").insert({
        user_id: user.id,
        phash_computed: phash,
        confidence: 0,
        was_correct: false,
      });
    }
    return NextResponse.json({
      status: "no_match",
      phash_computed: phash,
      image_quality: quality,
      message: "Karte nicht erkannt. Möchtest du sie manuell hinzufügen?",
    });
  }

  // ── Phase 5: Self-Improving — DB verbessern ───────────────
  if (matchedCard && user) {
    // Neues Referenzbild wenn Qualität besser als aktuell
    if (quality > (matchedCard.data_quality_score ?? 0)) {
      // Upload des normalisierten Bildes zu Supabase Storage
      const fileName = `cards/${matchedCard.id}/${Date.now()}.jpg`;
      const { data: uploadData } = await supabase.storage
        .from("card-images")
        .upload(fileName, normalizedBuffer, { contentType: "image/jpeg", upsert: false });

      if (uploadData) {
        const { data: { publicUrl } } = supabase.storage
          .from("card-images").getPublicUrl(fileName);

        // Update Referenzbild + Hash
        await supabase.from("cards").update({
          reference_image_url: publicUrl,
          phash,
          dhash,
          data_quality_score: quality,
          last_verified_at: new Date().toISOString(),
        }).eq("id", matchedCard.id);
      }
    }

    // Scan loggen (Trigger updatet scan_count automatisch)
    await supabase.from("scan_logs").insert({
      user_id: user.id,
      card_id: matchedCard.id,
      scan_type: matchMethod,
    });

    // Feedback loggen
    await supabase.from("card_scan_feedback").insert({
      user_id: user.id,
      card_id: matchedCard.id,
      phash_computed: phash,
      confidence,
      was_correct: true,
    });

    // Badge-Check: Erster Scan
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/badges`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.id }),
    }).catch(() => {});
  }

  // ── Response ──────────────────────────────────────────────
  return NextResponse.json({
    status: "match",
    card: {
      id:            matchedCard.id,
      name:          matchedCard.name_de ?? matchedCard.name,
      name_en:       matchedCard.name,
      set_id:        matchedCard.set_id,
      number:        matchedCard.number,
      image_url:     matchedCard.image_url,
      price_market:  matchedCard.price_market,
      price_low:     matchedCard.price_low,
      rarity:        matchedCard.rarity,
      is_holo:       matchedCard.is_holo,
      scan_count:    (matchedCard.scan_count ?? 0) + 1,
    },
    confidence,
    match_method:   matchMethod,
    image_quality:  quality,
    scan_count:     matchedCard.scan_count ?? 0,
  });
}
