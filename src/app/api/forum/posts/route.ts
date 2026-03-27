import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const limit = parseInt(searchParams.get("limit") || "20");
  const sort = searchParams.get("sort") || "recent"; // "recent" | "hot"

  let query = supabase
    .from("forum_posts")
    .select(
      `id, title, category_id, author_id, reply_count, upvotes,
       view_count, is_pinned, is_locked, is_hot, tags, created_at,
       profiles(username, avatar_url, forum_role, post_count,
         badge_trainer, badge_gym_leader, badge_elite4, badge_champion, is_premium)`
    )
    .eq("is_deleted", false)
    .limit(limit);

  if (category) {
    query = query.eq("category_id", category);
  }

  if (sort === "hot") {
    query = query.order("is_hot", { ascending: false }).order("upvotes", { ascending: false });
  } else {
    query = query.order("is_pinned", { ascending: false }).order("created_at", { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ posts: data });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });
  }

  // Check if banned
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_banned, forum_role")
    .eq("id", user.id)
    .single();

  if (profile?.is_banned) {
    return NextResponse.json({ error: "Du bist gesperrt." }, { status: 403 });
  }

  const body = await request.json();
  const { category_id, title, content, tags } = body;

  if (!category_id || !title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "Pflichtfelder fehlen" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("forum_posts")
    .insert({
      category_id,
      author_id: user.id,
      title: title.trim(),
      content: content.trim(),
      tags: tags || [],
      upvotes: 0,
      reply_count: 0,
      view_count: 0,
      is_pinned: false,
      is_locked: false,
      is_deleted: false,
      is_hot: false,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ post: data });
}
