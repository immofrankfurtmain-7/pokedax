import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
export async function GET(request: NextRequest) {
  const secret = request.headers.get("x-admin-secret");
  if (secret !== process.env.ADMIN_SECRET) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const r = await fetch("https://api.tcgdex.net/v2/de/sets");
  const sets = await r.json();
  const rows = sets.map((s: any) => ({ id: s.id, name: s.name, series: s.serie?.name, total: s.total, release_date: s.releaseDate, symbol_url: s.symbol, logo_url: s.logo }));
  const { error } = await supabase.from("sets").upsert(rows, { onConflict: "id" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ synced: rows.length });
}
