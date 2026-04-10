import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/cron/escrow-release — runs every 4 hours
export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: overdue } = await supabase
    .from("escrow_transactions")
    .select("*")
    .eq("status", "shipped")
    .lt("auto_release_at", new Date().toISOString())
    .limit(20);

  let released = 0;
  for (const escrow of overdue ?? []) {
    try {
      await supabase.from("escrow_transactions").update({
        status: "released",
        released_at: new Date().toISOString(),
      }).eq("id", escrow.id);

      await supabase.from("seller_stats").update({
        total_sales:  (escrow as any).total_sales ?? 0 + 1,
        total_volume: (escrow as any).total_volume ?? 0 + escrow.seller_payout,
      }).eq("user_id", escrow.seller_id);

      await supabase.from("marketplace_transactions").insert({
        escrow_id: escrow.id,
        event_type: "auto_released",
        amount: escrow.seller_payout,
      });
      released++;
    } catch (e) { console.error(e); }
  }

  return NextResponse.json({ released, checked: overdue?.length ?? 0 });
}
