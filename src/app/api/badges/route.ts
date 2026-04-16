import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Badge thresholds
const BADGE_RULES = [
  { key: "badge_first_scan",     label: "Erster Scan",        icon: "⊙", check: async (uid:string) => {
    const {count} = await supabase.from("scan_logs").select("id",{count:"exact",head:true}).eq("user_id",uid);
    return (count??0) >= 1;
  }},
  { key: "badge_collector_100",  label: "100 Karten",         icon: "◈", check: async (uid:string) => {
    const {count} = await supabase.from("user_collection").select("id",{count:"exact",head:true}).eq("user_id",uid);
    return (count??0) >= 100;
  }},
  { key: "badge_first_trade",    label: "Erster Trade",       icon: "◉", check: async (uid:string) => {
    const {count} = await supabase.from("escrow_transactions").select("id",{count:"exact",head:true}).eq("seller_id",uid).eq("status","released");
    return (count??0) >= 1;
  }},
  { key: "badge_forum_10",       label: "Forum-Aktiv",        icon: "💬", check: async (uid:string) => {
    const {count} = await supabase.from("forum_posts").select("id",{count:"exact",head:true}).eq("author_id",uid);
    return (count??0) >= 10;
  }},
];

export async function POST(request: NextRequest) {
  const { user_id } = await request.json();
  if (!user_id) return NextResponse.json({ error: "user_id required" }, { status: 400 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user_id)
    .single();

  if (!profile) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const awarded: string[] = [];

  for (const rule of BADGE_RULES) {
    try {
      const earned = await rule.check(user_id);
      if (earned) {
        // Award badge - add to profiles badges JSONB column if not exists
        const { data: existing } = await supabase
          .from("user_badges")
          .select("id")
          .eq("user_id", user_id)
          .eq("badge_key", rule.key)
          .single();

        if (!existing) {
          await supabase.from("user_badges").insert({
            user_id, badge_key: rule.key,
            label: rule.label, icon: rule.icon,
            awarded_at: new Date().toISOString(),
          });
          awarded.push(rule.key);
        }
      }
    } catch(e) { console.error("Badge check error:", e); }
  }

  return NextResponse.json({ awarded, checked: BADGE_RULES.length });
}

export async function GET(request: NextRequest) {
  const user_id = new URL(request.url).searchParams.get("user_id");
  if (!user_id) return NextResponse.json({ badges: [] });

  const { data } = await supabase
    .from("user_badges")
    .select("badge_key, label, icon, awarded_at")
    .eq("user_id", user_id)
    .order("awarded_at", { ascending: false });

  return NextResponse.json({ badges: data ?? [] });
}
