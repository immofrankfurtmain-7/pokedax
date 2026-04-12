/**
 * pokédax Scanner v2 — Eigene pHash Erkennung
 * Kein Gemini, kein externes API.
 * Nutzt nur die eigene Datenbank mit 21.618 Hashes.
 * 
 * Algorithmus: dHash (schnell, kein DCT nötig, funktioniert auf Vercel)
 * Fallback: Name-Suche wenn Hash-Distanz zu groß
 */
import { NextRequest, NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/server";

export const dynamic   = "force-dynamic";
export const maxDuration = 60;

// dHash — 8x8 Differenz-Hash, schnell und robust
// Kein DCT, kein großes Matrix-Produkt → läuft problemlos auf Vercel
async function computeDhash(buffer: Buffer): Promise<string> {
  // Dynamischer Import von sharp (ExternalPackage in next.config)
  const sharp = (await import("sharp")).default;
  
  // 9x8 = 72 Pixel → 64 horizontale Differenzen
  const { data } = await sharp(buffer)
    .resize(9, 8, { fit: "fill" })
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const px = Array.from(data as Uint8Array);
  let hash = "";
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      hash += px[row * 9 + col] > px[row * 9 + col + 1] ? "1" : "0";
    }
  }
  return hash;
}

// aHash — 8x8 Durchschnitts-Hash, noch einfacher
async function computeAhash(buffer: Buffer): Promise<string> {
  const sharp = (await import("sharp")).default;
  const { data } = await sharp(buffer)
    .resize(8, 8, { fit: "fill" })
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const px = Array.from(data as Uint8Array);
  const avg = px.reduce((s, v) => s + v, 0) / px.length;
  return px.map(v => v >= avg ? "1" : "0").join("");
}

function hammingDistance(h1: string, h2: string): number {
  if (!h1 || !h2 || h1.length !== h2.length) return 999;
  let d = 0;
  for (let i = 0; i < h1.length; i++) if (h1[i] !== h2[i]) d++;
  return d;
}

export async function POST(request: NextRequest) {
  const supabase = await createRouteClient(request);
  const { data: { user } } = await supabase.auth.getUser();

  // Rate-Limit
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
        return NextResponse.json({
          error: "Tageslimit erreicht", limit_reached: true
        }, { status: 429 });
      }
    }
  }

  // Bild empfangen
  let imageBuffer: Buffer;
  try {
    const ct = request.headers.get("content-type") ?? "";
    if (ct.includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("image") as File | null;
      if (!file) return NextResponse.json({ error: "Kein Bild" }, { status: 400 });
      imageBuffer = Buffer.from(await file.arrayBuffer());
    } else {
      const body = await request.json();
      const b64 = body.image_base64 || body.imageBase64;
      if (!b64) return NextResponse.json({ error: "Kein Bild" }, { status: 400 });
      imageBuffer = Buffer.from(
        b64.replace(/^data:image\/\w+;base64,/, ""), "base64"
      );
    }
  } catch(e) {
    return NextResponse.json({ error: "Bild konnte nicht gelesen werden" }, { status: 400 });
  }

  let card: any = null;
  let confidence = 0;
  let method = "phash";
  let queryHash = "";

  // ── Phase 1: dHash berechnen + DB-Suche ────────────────────
  try {
    const dhash = await computeDhash(imageBuffer);
    queryHash = dhash;

    // DB-Suche via SQL Hamming-Distance Funktion
    const { data: matches } = await supabase.rpc("find_card_by_hash", {
      query_hash: dhash,
      max_distance: 12,
      result_limit: 5,
    });

    if (matches && matches.length > 0) {
      const best = matches[0];
      const dist = best.distance ?? 999;
      confidence = Math.round((1 - dist / 64) * 100);

      if (confidence >= 85) {
        // Sehr sicherer Match
        const { data: found } = await supabase.from("cards")
          .select("id,name,name_de,set_id,number,image_url,price_market,price_low,price_avg7,rarity,is_holo,scan_count,data_quality_score")
          .eq("id", best.card_id)
          .single();
        if (found) { card = found; method = "dhash_high"; }

      } else if (confidence >= 70) {
        // Mittlerer Konfidenz — Top 3 zur Bestätigung
        const cardIds = matches.slice(0, 3).map((m: any) => m.card_id);
        const { data: candidates } = await supabase.from("cards")
          .select("id,name,name_de,set_id,number,image_url,price_market,rarity")
          .in("id", cardIds);
        return NextResponse.json({
          status: "confirm",
          candidates: candidates ?? [],
          confidence,
          message: "Bitte die richtige Karte bestätigen",
        });
      }
    }
  } catch(e) {
    console.error("dHash error:", e);
  }

  // ── Phase 2: aHash als Fallback ─────────────────────────────
  if (!card) {
    try {
      const ahash = await computeAhash(imageBuffer);
      const { data: matches2 } = await supabase.rpc("find_card_by_hash", {
        query_hash: ahash,
        max_distance: 10,
        result_limit: 3,
      });

      if (matches2 && matches2.length > 0 && matches2[0].distance <= 8) {
        const { data: found } = await supabase.from("cards")
          .select("id,name,name_de,set_id,number,image_url,price_market,price_low,price_avg7,rarity,is_holo,scan_count")
          .eq("id", matches2[0].card_id)
          .single();
        if (found) { card = found; confidence = Math.round((1 - matches2[0].distance / 64) * 100); method = "ahash"; }
      }
    } catch(e) {}
  }

  // ── Phase 3: Kein Match ────────────────────────────────────
  if (!card) {
    try {
      await supabase.from("card_scan_feedback").insert({
        user_id: user?.id ?? null,
        phash_computed: queryHash,
        confidence: 0,
        was_correct: false,
      });
    } catch(_) {}

    return NextResponse.json({
      status: "no_match",
      error: "Karte nicht erkannt",
      message: "Karte konnte nicht erkannt werden. Bitte ein klareres Foto versuchen.",
      hint: "Tipp: Karte flach auf hellen Untergrund legen, gerade von oben fotografieren.",
    });
  }

  // ── Self-Improving: Scan loggen ────────────────────────────
  if (user) {
    try {
      await supabase.from("scan_logs").insert({
        user_id: user.id, card_id: card.id, scan_type: method,
      });
      await supabase.from("card_scan_feedback").insert({
        user_id: user.id, card_id: card.id,
        phash_computed: queryHash, confidence, was_correct: true,
      });
    } catch(_) {}
  }

  return NextResponse.json({
    status: "match",
    card: {
      id:           card.id,
      name:         card.name_de ?? card.name,
      name_en:      card.name,
      set_id:       card.set_id,
      number:       card.number,
      image_url:    card.image_url,
      price_market: card.price_market,
      price_low:    card.price_low,
      rarity:       card.rarity,
      scan_count:   (card.scan_count ?? 0) + 1,
    },
    confidence,
    method,
    scansUsed: null,
  });
}
