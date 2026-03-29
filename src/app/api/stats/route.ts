import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Cache für 5 Minuten - Zahlen müssen nicht live sein
export const revalidate = 300;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Alle Queries parallel
    const [cardsRes, usersRes, forumRes, scansRes] = await Promise.all([
      supabase.from("cards").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("forum_categories").select("post_count"),
      supabase.from("scan_logs")
        .select("*", { count: "exact", head: true })
        .gte("created_at", new Date().toISOString().split("T")[0]), // heute
    ]);

    const forumPosts = (forumRes.data || []).reduce(
      (sum, cat) => sum + (cat.post_count || 0), 0
    );

    return NextResponse.json({
      cards_count: cardsRes.count  || 0,
      users_count: usersRes.count  || 0,
      forum_posts: forumPosts,
      scans_today: scansRes.count  || 0,
    });

  } catch (err) {
    console.error("Stats error:", err);
    // Fallback-Zahlen damit die Seite nicht leer aussieht
    return NextResponse.json({
      cards_count: 22271,
      users_count: 0,
      forum_posts: 0,
      scans_today: 0,
    });
  }
}
