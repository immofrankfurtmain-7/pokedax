/**
 * pokédax Scanner — Gemini + eigene DB
 * Gemini erkennt den Namen, DB liefert alle Daten
 */
import { NextRequest, NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/server";

export const dynamic   = "force-dynamic";
export const maxDuration = 60;

const SELECT = "id,name,name_de,name_en,set_id,number,image_url,price_market,price_low,price_avg7,price_avg30,rarity,is_holo,scan_count,hp,types";

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

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "Scanner nicht konfiguriert" }, { status: 503 });
  }

  // Gemini erkennt die Karte
  let parsed: any = null;
  try {
    const b64 = imageBuffer.toString("base64");
    const gr = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite-preview-06-17:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: `Du bist der weltbeste Pokémon-TCG-Experte mit über 20 Jahren Erfahrung. Analysiere das Foto einer echten physischen Pokémon-Sammelkarte extrem genau.

Gehe Schritt für Schritt vor:
1. Identifiziere das Pokémon und das Artwork.
2. Erkenne den Set-Code (unten auf der Karte, z.B. SVI, PAF, sv07, base1).
3. Erkenne die Kartennummer (unten, z.B. 025/165 oder 027/091).
4. Bestimme Sprache und Holo-Status.

Gib AUSSCHLIESSLICH ein gültiges JSON zurück. Kein Markdown, keine Einleitung:
{"name_en":"Lapras ex","name_de":"Lapras ex","number":"27","set_code":"sv04.5","language":"de","is_holo":false,"confidence":0.95}

Regeln:
- set_code ist der kurze Code exakt wie auf der Karte
- number ohne führende Nullen (027 → 27)
- Bei Unsicherheit confidence unter 0.85` },
              { inline_data: { mime_type: "image/jpeg", data: b64 } },
            ]
          }]
        })
      }
    );
    if (gr.ok) {
      const gd = await gr.json();
      const text = (gd.candidates?.[0]?.content?.parts?.[0]?.text ?? "").trim();
      parsed = JSON.parse(text.replace(/\`\`\`json|\`\`\`/g, "").trim());
    }
  } catch(e: any) {
    console.error("Gemini error:", e?.message ?? e);
    return NextResponse.json({ 
      error: "Erkennungsfehler", 
      message: "Scanner konnte Karte nicht analysieren. Bitte erneut versuchen.",
      debug: e?.message ?? String(e)
    });
  }

  if (!parsed?.name_en) {
    return NextResponse.json({ status: "no_match", error: "Karte nicht erkannt", message: "Bitte klareres Foto versuchen." });
  }

  const name     = parsed.name_en.trim();
  const nameDe   = (parsed.name_de ?? "").trim();
  const num      = (parsed.number ?? "").replace(/^0+/, "");
  const setCode  = (parsed.set_code ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
  let card: any  = null;
  let confidence = 0;

  // 6-stufige Suche — von präzise bis fuzzy
  const searches = [
    // 1. Name + Nummer + Set
    ...(name && num && setCode ? [async () => {
      const {data} = await supabase.from("cards").select(SELECT)
        .ilike("name", name).eq("number", num).ilike("set_id", `%${setCode}%`)
        .limit(1).maybeSingle();
      return data ? [data, 98] : null;
    }] : []),
    // 2. Name + Nummer
    ...(name && num ? [async () => {
      const {data} = await supabase.from("cards").select(SELECT)
        .ilike("name", name).eq("number", num)
        .order("data_quality_score", {ascending: false}).limit(1).maybeSingle();
      return data ? [data, 93] : null;
    }] : []),
    // 3. Name + Set
    ...(name && setCode ? [async () => {
      const {data} = await supabase.from("cards").select(SELECT)
        .ilike("name", name).ilike("set_id", `%${setCode}%`)
        .order("data_quality_score", {ascending: false}).limit(1).maybeSingle();
      return data ? [data, 88] : null;
    }] : []),
    // 4. Nur Name
    ...(name ? [async () => {
      const {data} = await supabase.from("cards").select(SELECT)
        .ilike("name", `%${name}%`)
        .order("data_quality_score", {ascending: false}).limit(1).maybeSingle();
      return data ? [data, 80] : null;
    }] : []),
    // 5. Deutschen Namen
    ...(nameDe ? [async () => {
      const {data} = await supabase.from("cards").select(SELECT)
        .ilike("name_de", `%${nameDe}%`)
        .order("data_quality_score", {ascending: false}).limit(1).maybeSingle();
      return data ? [data, 75] : null;
    }] : []),
  ];

  for (const search of searches) {
    const result = await search();
    if (result) {
      card       = result[0];
      confidence = result[1] as number;
      break;
    }
  }

  if (!card) {
    return NextResponse.json({
      status: "no_match",
      error: "Karte nicht erkannt",
      message: `"${name}" erkannt aber nicht in der Datenbank gefunden.`,
      gemini_result: parsed,
    });
  }

  // Scan loggen
  if (user) {
    try {
      await supabase.from("scan_logs").insert({
        user_id: user.id, card_id: card.id, scan_type: "gemini",
      });
    } catch(_) {}
  }

  return NextResponse.json({
    status: "match",
    card: {
      id:           card.id,
      name:         card.name_de ?? card.name,
      name_en:      card.name_en ?? card.name,
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
    method: "gemini+db",
    scansUsed: null,
  });
}
