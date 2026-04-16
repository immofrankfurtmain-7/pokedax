import { NextRequest, NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const supabase = await createRouteClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ count: 0, max: 5 });

  const today = new Date().toISOString().split("T")[0];
  const { count } = await supabase.from("scan_logs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", today + "T00:00:00Z");

  const { data: profile } = await supabase.from("profiles")
    .select("is_premium").eq("id", user.id).single();

  return NextResponse.json({ count: count ?? 0, max: profile?.is_premium ? 9999 : 5 });
}
