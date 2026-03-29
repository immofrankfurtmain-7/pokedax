import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json().catch(() => ({}));
    const { card_id, scan_type = "manual" } = body;

    await supabase.from("scan_logs").insert({
      user_id:   user?.id || null,
      card_id:   card_id  || null,
      scan_type,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false });
  }
}
