/**
 * pokédax Scanner v3 — Art-Crop + aHash (kein Gemini, kein opencv)
 * 
 * Funktioniert weil:
 * 1. User-Foto wird auf Art-Bereich zugeschnitten (sharp)
 * 2. TCGdex-Referenzbild wurde gleich zugeschnitten (rehash_local.js)
 * 3. Beide zeigen nur das Pokémon-Artwork → Hash stimmt überein
 */
import { NextRequest, NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/server";

export const dynamic   = "force-dynamic";
export const maxDuration = 60;

const SELECT = "id,name,name_de,set_id,number,image_url,price_market,price_low,price_avg7,rarity,is_holo,scan_count,hp,types";

// Art-Crop + 256-bit aHash
// Crop: obere 55% der Karte, ohne seitliche Ränder
async function computeArtHash(buffer: Buffer): Promise<string> {
  const sharp = (await import("sharp")).default;
  const meta = await sharp(buffer).metadata();
  const w = meta.width ?? 800;
  const h = meta.height ?? 1100;

  const { data } = await sharp(buffer)
    .extract({
      left:   Math.floor(w * 0.06),
      top:    Math.floor(h * 0.08),
      width:  Math.floor(w * 0.88),
      height: Math.floor(h * 0.50),
    })
    .resize(16, 16, { fit: "fill" })
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
        return NextResponse.json({ error: "Tageslimit erreicht", limit_reached: true }, { status: 429 });
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
      imageBuffer = Buffer.from(b64.replace(/^data:image\/\w+;base64,/, ""), "base64");
    }
  } catch(e) {
    return NextResponse.json({ error: "Bild konnte nicht gelesen werden" }, { status: 400 });
  }

  // Hash berechnen
  let artHash = "";
  try {
    artHash = await computeArtHash(imageBuffer);
  } catch(e) {
    console.error("Hash error:", e);
    return NextResponse.json({ error: "Hash-Fehler", message: "Bildverarbeitung fehlgeschlagen." });
  }

  // DB-Suche via ahash
  let card: any = null;
  let confidence = 0;

  const { data: matches, error: rpcErr } = await supabase.rpc("find_card_by_ahash", {
    query_hash: artHash,
    max_distance: 30,
    result_limit: 5,
  });

  if (rpcErr) console.error("RPC error:", rpcErr.message);

  if (matches && matches.length > 0) {
    const best = matches[0];
    confidence = best.confidence ?? 0;

    if (confidence >= 80) {
      const { data: found } = await supabase.from("cards")
        .select(SELECT).eq("id", best.card_id).single();
      if (found) card = found;

    } else if (confidence >= 65) {
      // Mehrere Kandidaten zur Auswahl
      const ids = matches.slice(0, 3).map((m: any) => m.card_id);
      const { data: candidates } = await supabase.from("cards")
        .select("id,name,name_de,set_id,number,image_url,price_market,rarity")
        .in("id", ids);
      return NextResponse.json({
        status: "confirm",
        candidates: candidates ?? [],
        confidence,
        message: "Welche Karte ist das?",
      });
    }
  }

  if (!card) {
    return NextResponse.json({
      status: "no_match",
      error: "Karte nicht erkannt",
      message: "Karte konnte nicht erkannt werden. Tipp: Karte flach, gutes Licht, gerade von oben.",
      debug_hash: artHash.slice(0, 16),
    });
  }

  // Scan loggen
  if (user) {
    try {
      await supabase.from("scan_logs").insert({
        user_id: user.id, card_id: card.id, scan_type: "ahash",
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
    method: "ahash_artcrop",
    scansUsed: null,
  });
}
