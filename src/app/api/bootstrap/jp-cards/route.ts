"use server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const TCGDEX_BASE = "https://api.tcgdex.net/v2";
const JP_SETS = ["sv1s","sv2a","sv3a","sv4a","sv4k","sv5a","sv5k","sv6","sv6a","sv7","sv8","sv8a",
  "s1a","s1h","s2a","s3a","s4","s4a","s5a","s6a","s7d","s7r","s8","s8a","s9","s9a","s10","s10a","s10b","s11","s11a","s12"];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get("secret") !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = parseInt(searchParams.get("limit") ?? "5");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  let totalCards = 0, totalSets = 0;
  const setsToProcess = JP_SETS.slice(0, limit);

  for (const setId of setsToProcess) {
    try {
      // Fetch set info
      const setRes = await fetch(`${TCGDEX_BASE}/en/sets/${setId}`, {
        headers: { "User-Agent": "pokedax/1.0" }
      });
      if (!setRes.ok) continue;
      const setData = await setRes.json();

      // Upsert set
      await supabase.from("sets").upsert({
        id:           setId,
        name:         setData.name,
        name_de:      setData.name,
        series:       setData.serie?.name ?? "Japanese",
        card_count:   setData.cardCount ?? setData.cards?.length ?? 0,
        release_date: setData.releaseDate ?? null,
        logo_url:     setData.logo ?? null,
        image_url:    setData.logo ?? null,
        language:     "ja",
      }, { onConflict: "id" });

      totalSets++;

      // Fetch cards
      if (!setData.cards?.length) continue;
      const cards = setData.cards.slice(0, 200);

      for (let i = 0; i < cards.length; i += 50) {
        const chunk = cards.slice(i, i + 50);
        const rows = chunk.map((c: any) => ({
          id:        `${setId}-${c.localId}`,
          set_id:    setId,
          name:      c.name,
          name_de:   c.name,
          number:    String(c.localId),
          image_url: c.image ? `${c.image}/high.webp` : null,
          language:  "ja",
          category:  c.category ?? "Pokemon",
        }));
        await supabase.from("cards").upsert(rows, { onConflict: "id" });
        totalCards += rows.length;
      }
    } catch (err) {
      console.error(`Error processing ${setId}:`, err);
    }
  }

  return NextResponse.json({ totalSets, totalCards, setsProcessed: setsToProcess });
}
