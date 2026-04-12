/**
 * pokédax Scanner v3 — OCR-basiert, keine KI, keine Kosten
 * 
 * Tesseract.js liest im Browser den Kartentext (Name, Nummer, Set-Code)
 * Diese API-Route sucht dann in der eigenen DB.
 */
import { NextRequest, NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/server";

export const dynamic   = "force-dynamic";
export const maxDuration = 30;

const SELECT = "id,name,name_de,set_id,number,image_url,price_market,price_low,price_avg7,rarity,is_holo,scan_count,hp,types";

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

  // OCR-Daten empfangen
  const body = await request.json().catch(() => ({}));
  const ocrName   = (body.ocr_name   ?? "").trim();
  const ocrNumber = (body.ocr_number ?? "").replace(/^0+/, "").trim();
  const ocrSet    = (body.ocr_set    ?? "").toLowerCase().trim();
  const ocrText   = (body.ocr_text   ?? "").toLowerCase();

  if (!ocrName && !ocrNumber) {
    return NextResponse.json({
      status: "no_match",
      error: "Karte nicht erkannt",
      message: "Kein Text auf der Karte erkannt. Bitte bessere Beleuchtung.",
    });
  }

  let card: any = null;
  let confidence = 0;

  // ── Suche 1: Name + Nummer + Set (präziseste) ─────────────
  if (!card && ocrName && ocrNumber && ocrSet) {
    const { data } = await supabase.from("cards").select(SELECT)
      .ilike("name", `%${ocrName}%`)
      .eq("number", ocrNumber)
      .ilike("set_id", `%${ocrSet}%`)
      .limit(1).maybeSingle();
    if (data) { card = data; confidence = 98; }
  }

  // ── Suche 2: Name + Nummer ─────────────────────────────────
  if (!card && ocrName && ocrNumber) {
    const { data } = await supabase.from("cards").select(SELECT)
      .ilike("name", `%${ocrName}%`)
      .eq("number", ocrNumber)
      .order("data_quality_score", { ascending: false })
      .limit(1).maybeSingle();
    if (data) { card = data; confidence = 93; }
  }

  // ── Suche 3: Name + Set ─────────────────────────────────────
  if (!card && ocrName && ocrSet) {
    const { data } = await supabase.from("cards").select(SELECT)
      .ilike("name", `%${ocrName}%`)
      .ilike("set_id", `%${ocrSet}%`)
      .order("data_quality_score", { ascending: false })
      .limit(1).maybeSingle();
    if (data) { card = data; confidence = 88; }
  }

  // ── Suche 4: Nur Nummer + Set ──────────────────────────────
  if (!card && ocrNumber && ocrSet) {
    const { data } = await supabase.from("cards").select(SELECT)
      .eq("number", ocrNumber)
      .ilike("set_id", `%${ocrSet}%`)
      .order("data_quality_score", { ascending: false })
      .limit(1).maybeSingle();
    if (data) { card = data; confidence = 85; }
  }

  // ── Suche 5: Nur Name (fuzzy) ──────────────────────────────
  if (!card && ocrName) {
    const { data } = await supabase.from("cards").select(SELECT)
      .ilike("name", `%${ocrName}%`)
      .order("data_quality_score", { ascending: false })
      .limit(1).maybeSingle();
    if (data) { card = data; confidence = 75; }
  }

  // ── Suche 6: Deutschen Namen versuchen ─────────────────────
  if (!card && ocrName) {
    const { data } = await supabase.from("cards").select(SELECT)
      .ilike("name_de", `%${ocrName}%`)
      .order("data_quality_score", { ascending: false })
      .limit(1).maybeSingle();
    if (data) { card = data; confidence = 72; }
  }

  if (!card) {
    return NextResponse.json({
      status: "no_match",
      error: "Karte nicht erkannt",
      message: `Karte mit Name "${ocrName}" (Nr. ${ocrNumber}) nicht gefunden.`,
      ocr_debug: { name: ocrName, number: ocrNumber, set: ocrSet },
    });
  }

  // Scan loggen
  if (user) {
    try {
      await supabase.from("scan_logs").insert({
        user_id: user.id, card_id: card.id, scan_type: "ocr",
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
      hp:           card.hp,
      scan_count:   (card.scan_count ?? 0) + 1,
    },
    confidence,
    method: "ocr",
    ocr_debug: { name: ocrName, number: ocrNumber, set: ocrSet },
    scansUsed: null,
  });
}
