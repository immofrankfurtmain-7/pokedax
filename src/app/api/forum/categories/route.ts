import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("forum_categories")
    .select("id, name, color")
    .order("name");
  if (error) return NextResponse.json({ categories: [] });
  return NextResponse.json({ categories: data ?? [] });
}
