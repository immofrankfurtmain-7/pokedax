import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const EN = "https://api.tcgdex.net/v2/en";
const DE = "https://api.tcgdex.net/v2/de";

const RARITY_MAP: Record<string, string> = {
  "Common":"common","Uncommon":"uncommon","Rare":"rare",
  "Rare Holo":"rare-holo","Rare Holo EX":"rare-holo","Rare Holo GX":"rare-holo",
  "Rare Holo V":"rare-holo","Rare Holo VMAX":"rare-holo","Rare Holo VSTAR":"rare-holo",
  "Double Rare":"double-rare","Illustration Rare":"illustration-rare",
  "Special Illustration Rare":"special-illustration-rare",
  "Hyper Rare":"hyper-rare","Ultra Rare":"ultra-rare","Secret Rare":"secret-rare",
  "Shiny Rare":"shiny-rare","Shiny Rare V":"shiny-rare-v",
  "Radiant Rare":"radiant-rare","Amazing Rare":"amazing-rare",
  "Rainbow Rare":"rainbow-rare","Gold Rare":"hyper-rare",
  "ACE SPEC Rare":"ace-spec","Promo":"promo","Classic Collection":"rare-holo",
};

async function fetchCard(base: string, setId: string, localId: string) {
  try {
    const r = await fetch(`${base}/sets/${setId}/${localId}`, { next: { revalidate: 86400 } });
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
}

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-admin-secret");
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { offset = 0, limit = 30 } = await request.json().catch(() => ({}));

  const { data: cards, error } = await supabase
    .from("cards")
    .select("id, set_id, number, types, rarity, image_url, name_de, hp, category")
    .or("types.is.null,rarity.is.null,name_de.is.null,hp.is.null")
    .range(offset, offset + limit - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!cards?.length) return NextResponse.json({ message: "Alle Karten aktuell", updated: 0, hasMore: false });

  let updated = 0, failed = 0;
  const log: string[] = [];

  for (const card of cards) {
    const { set_id, number } = card;
    if (!set_id || !number) { failed++; continue; }

    const [en, de] = await Promise.all([
      fetchCard(EN, set_id, number),
      fetchCard(DE, set_id, number),
    ]);

    const altNum = String(parseInt(number) || number);
    const [en2, de2] = (!en && !de && altNum !== number)
      ? await Promise.all([fetchCard(EN, set_id, altNum), fetchCard(DE, set_id, altNum)])
      : [null, null];

    const enData = en || en2;
    const deData = de || de2;

    if (!enData && !deData) { failed++; continue; }

    const updates: Record<string, unknown> = {};

    if (enData) {
      if (!card.types && enData.types?.length)  updates.types       = enData.types;
      if (!card.rarity && enData.rarity)        updates.rarity      = enData.rarity;
      if (!card.hp && enData.hp)                updates.hp          = enData.hp;
      if (!card.category && enData.category)    updates.category    = enData.category;
      if (enData.stage)                         updates.stage       = enData.stage;
      if (enData.illustrator)                   updates.illustrator = enData.illustrator;
      if (enData.regulationMark)                updates.regulation_mark = enData.regulationMark;
      if (enData.dexIDs?.[0])                   updates.pokedex_id  = enData.dexIDs[0];
      if (enData.retreat)                       updates.retreat_cost = enData.retreat;
      if (enData.variants) {
        updates.is_holo          = !!enData.variants.holo;
        updates.is_reverse_holo  = !!enData.variants.reverse;
        updates.is_first_edition = !!enData.variants.firstEdition;
      }
      if (!card.image_url && enData.image) updates.image_url = `${enData.image}/low.webp`;
      if (enData.rarity && RARITY_MAP[enData.rarity]) updates.rarity_id = RARITY_MAP[enData.rarity];
    }

    if (deData) {
      if (!card.name_de && deData.name)   updates.name_de        = deData.name;
      if (deData.description)             updates.description_de = deData.description;
    }

    if (Object.keys(updates).length > 0) {
      const { error: ue } = await supabase.from("cards").update(updates).eq("id", card.id);
      if (!ue) { updated++; log.push(`✓ ${card.id}: ${Object.keys(updates).join(", ")}`); }
      else     { failed++;  log.push(`✗ ${card.id}: ${ue.message}`); }
    }

    await new Promise(r => setTimeout(r, 120));
  }

  return NextResponse.json({
    total: cards.length, updated, failed,
    offset, limit, nextOffset: offset + limit,
    hasMore: cards.length === limit,
    log: log.slice(0, 25),
  });
}

export async function GET(request: NextRequest) {
  const secret = request.headers.get("x-admin-secret");
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [total, missingTypes, missingRarity, missingImage, missingDe, missingHp] = await Promise.all([
    supabase.from("cards").select("*", { count: "exact", head: true }),
    supabase.from("cards").select("*", { count: "exact", head: true }).is("types", null),
    supabase.from("cards").select("*", { count: "exact", head: true }).is("rarity", null),
    supabase.from("cards").select("*", { count: "exact", head: true }).is("image_url", null),
    supabase.from("cards").select("*", { count: "exact", head: true }).is("name_de", null),
    supabase.from("cards").select("*", { count: "exact", head: true }).is("hp", null),
  ]);

  return NextResponse.json({
    total: total.count, missingTypes: missingTypes.count,
    missingRarity: missingRarity.count, missingImages: missingImage.count,
    missingNameDe: missingDe.count, missingHp: missingHp.count,
    completePct: total.count
      ? Math.round((1 - (missingTypes.count||0) / (total.count||1)) * 100) : 0,
  });
}
