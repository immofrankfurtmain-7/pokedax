import { NextRequest, NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createRouteClient(request);
  const post_id = new URL(request.url).searchParams.get("post_id");
  if (!post_id) return NextResponse.json({ replies: [] });

  const { data, error } = await supabase
    .from("forum_replies")
    .select("id, content, upvotes, created_at, author_id, profiles(username, avatar_url, is_premium)")
    .eq("post_id", post_id)
    .eq("is_deleted", false)
    .order("created_at", { ascending: true });

  if (error) {
    // Table might not exist yet, return empty
    return NextResponse.json({ replies: [] });
  }
  const normalized = (data ?? []).map((r: any) => ({
    ...r,
    profiles: Array.isArray(r.profiles) ? r.profiles[0] : r.profiles,
  }));
  return NextResponse.json({ replies: normalized });
}

export async function POST(request: NextRequest) {
  const supabase = await createRouteClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const { post_id, content } = await request.json();
  if (!post_id || !content?.trim()) return NextResponse.json({ error: "Pflichtfelder fehlen" }, { status: 400 });

  const { data, error } = await supabase
    .from("forum_replies")
    .insert({ post_id, author_id: user.id, content: content.trim(), upvotes: 0, is_deleted: false })
    .select("id, content, upvotes, created_at, author_id, profiles(username, avatar_url, is_premium)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Increment reply_count directly
  const { data: post } = await supabase.from("forum_posts").select("reply_count").eq("id", post_id).single();
  if (post) await supabase.from("forum_posts").update({ reply_count: (post.reply_count ?? 0) + 1 }).eq("id", post_id);

  const reply = { ...data, profiles: Array.isArray((data as any)?.profiles) ? (data as any).profiles[0] : (data as any)?.profiles };
  return NextResponse.json({ reply });
}
