import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Admin-only: requires ADMIN_SECRET header
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TCGDEX_BASE = "https://api.tcgdex.net/v2/en";

interface TCGdexCard {
  id:       string;
  name:     string;
  image?:   string;
  types?:   string[];
  rarity?:  string;
  hp?:      number;
  category: string;
  variants?: { holo: boolean; reverse: boolean; normal: boolean };
}

async function fetchCardFromTCGdex(setId: string, localId: string): Promise<TCGdexCard | null> {
  try {
    const res = await fetch(`${TCGDEX_BASE}/sets/${setId}/${localId}`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  // Auth check
  const secret = request.headers.get("x-admin-secret");
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { offset = 0, limit = 50 } = await request.json().catch(() => ({}));

  // Fetch cards that are missing types or rarity
  const { data: cards, error } = await supabase
    .from("cards")
    .select("id, set_id, number, types, rarity, image_url")
    .or("types.is.null,rarity.is.null")
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!cards || cards.length === 0) {
    return NextResponse.json({ message: "Alle Karten haben bereits Types/Rarity", updated: 0 });
  }

  let updated = 0;
  let failed  = 0;
  const results: string[] = [];

  for (const card of cards) {
    const setId   = card.set_id;
    const localId = card.number;
    if (!setId || !localId) { failed++; continue; }

    const tcg = await fetchCardFromTCGdex(setId, localId);
    if (!tcg) {
      // Try alternative format: some cards use number without leading zeros
      const altId = String(parseInt(localId) || localId);
      const tcg2  = altId !== localId ? await fetchCardFromTCGdex(setId, altId) : null;
      if (!tcg2) { failed++; continue; }
      Object.assign(tcg || {}, tcg2);
    }

    if (!tcg) { failed++; continue; }

    const updates: Record<string, unknown> = {};

    if (!card.types && tcg.types && tcg.types.length > 0) {
      updates.types = tcg.types;
    }
    if (!card.rarity && tcg.rarity) {
      updates.rarity = tcg.rarity;
    }
    if (!card.image_url && tcg.image) {
      updates.image_url = `${tcg.image}/low.webp`;
    }

    if (Object.keys(updates).length > 0) {
      await supabase.from("cards").update(updates).eq("id", card.id);
      updated++;
      results.push(`✓ ${card.id}: ${JSON.stringify(updates)}`);
    }

    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 100));
  }

  return NextResponse.json({
    total:    cards.length,
    updated,
    failed,
    offset,
    limit,
    results:  results.slice(0, 20), // first 20 for logging
    nextOffset: offset + limit,
    hasMore: cards.length === limit,
  });
}

// GET: stats on how many cards need updating
export async function GET(request: NextRequest) {
  const secret = request.headers.get("x-admin-secret");
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [missingTypes, missingRarity, missingImages, total] = await Promise.all([
    supabase.from("cards").select("*", { count: "exact", head: true }).is("types", null),
    supabase.from("cards").select("*", { count: "exact", head: true }).is("rarity", null),
    supabase.from("cards").select("*", { count: "exact", head: true }).is("image_url", null),
    supabase.from("cards").select("*", { count: "exact", head: true }),
  ]);

  return NextResponse.json({
    total:         total.count,
    missingTypes:  missingTypes.count,
    missingRarity: missingRarity.count,
    missingImages: missingImages.count,
  });
}
