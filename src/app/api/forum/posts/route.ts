import { NextRequest, NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createRouteClient(request);
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "48");
  const sort  = searchParams.get("sort") || "recent";

  let query = supabase.from("forum_posts")
    .select("id,title,category_id,author_id,reply_count,upvotes,view_count,is_pinned,is_locked,is_hot,tags,created_at,profiles(username,avatar_url,is_premium),forum_categories(name)")
    .eq("is_deleted", false).limit(limit);

  if (sort === "hot") query = query.order("upvotes", { ascending: false });
  else query = query.order("is_pinned",{ascending:false}).order("created_at",{ascending:false});

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ posts: data });
}

export async function POST(request: NextRequest) {
  const supabase = await createRouteClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });

  const { category_id, title, content, tags, card_id } = await request.json();
  if (!category_id || !title?.trim() || !content?.trim())
    return NextResponse.json({ error: "Pflichtfelder fehlen" }, { status: 400 });

  const { data, error } = await supabase.from("forum_posts")
    .insert({ category_id, author_id: user.id, title: title.trim(), content: content.trim(), card_id: card_id ?? null,
      tags: tags || [], upvotes: 0, reply_count: 0, view_count: 0,
      is_pinned: false, is_locked: false, is_deleted: false, is_hot: false })
    .select("id").single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ post: data });
}
