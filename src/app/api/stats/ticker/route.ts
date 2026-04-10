import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
export const revalidate = 300;
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
export async function GET() {
  const { data } = await supabase.from("cards").select("name,name_de,price_market,price_avg7")
    .not("price_market","is",null).not("price_avg7","is",null).order("price_market",{ascending:false}).limit(20);
  const items = (data??[]).map(c=>({
    name: c.name_de||c.name,
    price: c.price_market,
    change: c.price_avg7 ? Math.round((c.price_market-c.price_avg7)/c.price_avg7*1000)/10 : 0,
  }));
  return NextResponse.json({ items });
}
