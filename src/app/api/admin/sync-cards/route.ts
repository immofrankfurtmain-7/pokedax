import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
export async function GET(request: NextRequest) {
  const secret = request.headers.get("x-admin-secret");
  if (secret !== process.env.ADMIN_SECRET) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: sets } = await supabase.from("sets").select("id").limit(5);
  let total = 0;
  for (const set of sets ?? []) {
    const r = await fetch(`https://api.tcgdex.net/v2/de/sets/${set.id}`);
    const data = await r.json();
    const cards = (data.cards ?? []).map((c: any) => ({ id: `${set.id}-${c.localId}`, name: c.name, set_id: set.id, number: c.localId, image_url: c.image ? `${c.image}/high.webp` : null }));
    if (cards.length) { await supabase.from("cards").upsert(cards, { onConflict: "id" }); total += cards.length; }
  }
  return NextResponse.json({ synced: total });
}
