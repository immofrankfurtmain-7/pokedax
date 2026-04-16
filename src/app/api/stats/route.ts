import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
export const dynamic = "force-dynamic";
export const revalidate = 300;
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
export async function GET() {
  const [cards, sets, users] = await Promise.all([
    supabase.from("cards").select("id",{count:"exact",head:true}),
    supabase.from("sets").select("id",{count:"exact",head:true}),
    supabase.from("profiles").select("id",{count:"exact",head:true}),
  ]);
  return NextResponse.json({ cards: cards.count??0, sets: sets.count??0, users: users.count??0 });
}
