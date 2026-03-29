import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 3600;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { data, error } = await supabase
    .from("sets")
    .select("id, name, name_de, series, total, release_date")
    .order("release_date", { ascending: false });

  if (error) return NextResponse.json({ sets: [] });

  // Show DE name if available
  const sets = (data || []).map(s => ({
    id:   s.id,
    name: s.name_de || s.name,
    name_en: s.name,
    name_de: s.name_de,
    serie: s.series,
    total: s.total,
  }));

  return NextResponse.json({ sets });
}
