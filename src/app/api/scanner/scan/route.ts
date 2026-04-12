/**
 * pokédax Scanner v2 — Non-AI, pHash-basiert
 * POST /api/scanner/scan
 * 
 * Ersetzt Gemini AI für 95% aller Scans.
 * Gemini bleibt als Fallback bei niedrigem Konfidenz.
 */
import { NextRequest, NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/server";
import { computePhash, computeDhash, imageQualityScore, normalizeCardImage, hammingDistance, hashConfidence } from "@/lib/phash";

export const dynamic   = "force-dynamic";
export const maxDuration = 60;

// Konfidenz-Schwellen
const HIGH   = 90; // Direkt akzeptieren
const MEDIUM = 70; // User bestätigen
const LOW    = 50; // Gemini Fallback

export async function POST(request: NextRequest) {
  const supabase = await createRouteClient(request);
  const { data: { user } } = await supabase.auth.getUser();

  // Rate-Limit prüfen
  if (user) {
    const { data: profile } = await supabase
      .from("profiles").select("is_premium").eq("id", user.id).single();
    if (!profile?.is_premium) {
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

  // Bild empfangen
  let imageBuffer: Buffer;
  const ct = request.headers.get("content-type") ?? "";

  if (ct.includes("multipart/form-data")) {
    const form = await request.formData();
    const file = form.get("image") as File | null;
    if (!file) return NextResponse.json({ error: "Kein Bild" }, { status: 400 });
    imageBuffer = Buffer.from(await file.arrayBuffer());
  } else {
    const { image_base64 } = await request.json();
    if (!image_base64) return NextResponse.json({ error: "Kein Bild" }, { status: 400 });
    imageBuffer = Buffer.from(image_base64.replace(/^data:image\/\w+;base64,/, ""), "base64");
  }

  // Bild normalisieren
  const normalized = await normalizeCardImage(imageBuffer);
  const [phash, dhash, quality] = await Promise.all([
    computePhash(normalized),
    computeDhash(normalized),
    imageQualityScore(normalized),
  ]);

  // Datenbank-Suche via Hamming-Distance
  const { data: matches } = await supabase.rpc("find_card_by_hash", {
    query_hash: phash,
    max_distance: 10,
    result_limit: 5,
  });

  let card: any = null;
  let confidence = 0;
  let method = "phash";

  if (matches?.length > 0) {
    const best = matches[0];
    confidence = best.confidence;

    if (confidence >= HIGH) {
      const { data } = await supabase.from("cards").select("*").eq("id", best.card_id).single();
      card = data;
    } else if (confidence >= MEDIUM) {
      // Top 3 zur Bestätigung zurückgeben
      const { data: candidates } = await supabase.from("cards")
        .select("id,name,name_de,set_id,number,image_url,price_market,rarity")
        .in("id", matches.slice(0, 3).map((m: any) => m.card_id));
      return NextResponse.json({
        status: "confirm",
        candidates,
        confidence,
        message: "Bitte die richtige Karte bestätigen",
      });
    }
  }

  // Gemini Fallback bei niedrigem Konfidenz
  if (!card && process.env.GEMINI_API_KEY) {
    method = "gemini_fallback";
    const b64 = normalized.toString("base64");
    try {
      const gr = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: "Identify this Pokémon TCG card. Return ONLY JSON: {name_en, set_id, number}. No explanation." },
                { inline_data: { mime_type: "image/webp", data: b64 } },
              ]
            }]
          })
        }
      );
      if (gr.ok) {
        const gd = await gr.json();
        const text = gd.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
        const { data: found } = await supabase.from("cards")
          .select("*")
          .or(`name.ilike.%${parsed.name_en}%,name_de.ilike.%${parsed.name_en}%`)
          .limit(1).single();
        if (found) { card = found; confidence = 82; }
      }
    } catch (_) {}
  }

  if (!card) {
    if (user) {
      await supabase.from("card_scan_feedback").insert({
        user_id: user.id, phash_computed: phash, confidence: 0, was_correct: false,
      });
    }
    return NextResponse.json({
      status: "no_match",
      message: "Karte nicht erkannt. Tipp: Karte gerade ausrichten, gutes Licht.",
      quality,
    });
  }

  // Self-Improving: besseres Referenzbild speichern
  if (user && quality > (card.data_quality_score ?? 0)) {
    try {
      const fileName = `cards/${card.id}/${Date.now()}.webp`;
      const { data: up } = await supabase.storage
        .from("card-images")
        .upload(fileName, normalized, { contentType: "image/webp", upsert: false });

      if (up) {
        const { data: { publicUrl } } = supabase.storage
          .from("card-images").getPublicUrl(fileName);
        await supabase.from("cards").update({
          reference_image_url: publicUrl,
          phash, dhash,
          data_quality_score: quality,
          last_verified_at: new Date().toISOString(),
        }).eq("id", card.id);
      }
    } catch (_) {}
  }

  // Scan loggen (Trigger erhöht scan_count automatisch)
  if (user) {
    await supabase.from("scan_logs").insert({
      user_id: user.id, card_id: card.id, scan_type: method,
    });
    await supabase.from("card_scan_feedback").insert({
      user_id: user.id, card_id: card.id,
      phash_computed: phash, confidence, was_correct: true,
    });
  }

  return NextResponse.json({
    status: "match",
    card: {
      id: card.id,
      name: card.name_de ?? card.name,
      name_en: card.name_en ?? card.name,
      set_id: card.set_id,
      number: card.number,
      image_url: card.reference_image_url ?? card.image_url,
      price_market: card.price_market,
      price_low: card.price_low,
      rarity: card.rarity,
      scan_count: (card.scan_count ?? 0) + 1,
    },
    confidence,
    method,
    quality,
  });
}
