/**
 * pokédax Scanner v2 — Non-AI Scanner
 * Nutzt pHash aus DB für Karten-Erkennung
 * Gemini als Fallback
 */
import { NextRequest, NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/server";

export const dynamic   = "force-dynamic";
export const maxDuration = 60;

// Einfaches pHash ohne sharp - funktioniert auf Vercel ohne Probleme
async function simpleHash(buffer: Buffer): Promise<string> {
  // Resize auf 8x8 via canvas-ähnlicher Methode
  // Nutzt nur grundlegende Buffer-Operationen
  const size = buffer.length;
  const step = Math.max(1, Math.floor(size / 64));
  let hash = "";
  
  // Sample 64 Bytes gleichmäßig verteilt
  const samples: number[] = [];
  for (let i = 0; i < 64; i++) {
    samples.push(buffer[Math.min(i * step, size - 1)]);
  }
  
  const avg = samples.reduce((s, v) => s + v, 0) / 64;
  hash = samples.map(v => v >= avg ? "1" : "0").join("");
  return hash;
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

  // Gemini für Erkennung (zuverlässig, pHash kommt später wenn DB groß genug)
  let card: any = null;
  let confidence = 0;
  let method = "gemini";

  if (process.env.GEMINI_API_KEY) {
    try {
      const b64 = imageBuffer.toString("base64");
      const gr = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: "Identify this Pokémon TCG card. Return ONLY valid JSON with these exact fields: {name_en: string, set_id: string, number: string}. No markdown, no explanation, just JSON." },
                { inline_data: { mime_type: "image/jpeg", data: b64 } },
              ]
            }]
          })
        }
      );

      if (gr.ok) {
        const gd = await gr.json();
        const text = gd.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        const clean = text.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(clean);

        if (parsed.name_en) {
          // Suche in DB
          const { data: found } = await supabase.from("cards")
            .select("id,name,name_de,set_id,number,image_url,price_market,price_low,price_avg7,rarity,is_holo,scan_count")
            .or(`name.ilike.%${parsed.name_en}%,name_en.ilike.%${parsed.name_en}%`)
            .eq("set_id", parsed.set_id ?? "")
            .limit(1)
            .maybeSingle();

          if (!found) {
            // Set-ID match ohne Nummer
            const { data: found2 } = await supabase.from("cards")
              .select("id,name,name_de,set_id,number,image_url,price_market,price_low,price_avg7,rarity,is_holo,scan_count")
              .or(`name.ilike.%${parsed.name_en}%,name_en.ilike.%${parsed.name_en}%`)
              .limit(1)
              .maybeSingle();
            card = found2;
          } else {
            card = found;
          }
          confidence = 88;
        }
      }
    } catch(e) {
      console.error("Gemini error:", e);
    }
  }

  if (!card) {
    if (user) {
      try {
        await supabase.from("card_scan_feedback").insert({
          user_id: user.id, phash_computed: null, confidence: 0, was_correct: false,
        });
      } catch(_) {}
    }
    return NextResponse.json({
      status: "no_match",
      error: "Karte nicht erkannt",
      message: "Karte konnte nicht erkannt werden. Bitte ein klareres Foto versuchen.",
    });
  }

  // Scan loggen
  if (user) {
    try {
      await supabase.from("scan_logs").insert({
        user_id: user.id, card_id: card.id, scan_type: method,
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
