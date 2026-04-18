const fs = require('fs'), path = require('path');
const root = 'C:\\Users\\lenovo\\pokedax\\pokedax\\pokedax';

const forumPath = path.join(root, 'src/app/forum/page.tsx');
let forum = fs.readFileSync(forumPath, 'utf8');

// Fix 1: Simplify select - remove joins that might fail
// Try without the foreign key joins first
forum = forum.replace(
  '.select("id,title,content,upvotes,created_at,card_id,profiles!forum_posts_author_id_fkey(username),forum_categories!forum_posts_category_id_fkey(name,slug),cards!forum_posts_card_id_fkey(name,name_de,image_url)")',
  '.select("id,title,content,upvotes,created_at,card_id,author_id,category_id")'
);

// Fix 2: Remove the profile/category mapping since we're not joining anymore
forum = forum.replace(
  `setPosts((data ?? []).map((p: any) => ({
        ...p,
        profiles:         Array.isArray(p.profiles)         ? p.profiles[0]         : p.profiles,
        forum_categories: Array.isArray(p.forum_categories) ? p.forum_categories[0] : p.forum_categories,
        cards:            Array.isArray(p.cards)            ? p.cards[0]            : p.cards,
      })));`,
  'setPosts(data ?? []);'
);

// Fix 3: Update display to use author_id directly
forum = forum.replace(
  "post.profiles?.username ?? \"Anonym\"",
  "post.author_id?.slice(0,8) ?? \"Anonym\""
);

// Fix 4: Remove WebSocket/realtime to avoid the broken WS connection
forum = forum.replace(
  `    channelRef.current = SB.channel("forum_rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "forum_posts" }, () => loadPosts(catId))
      .subscribe();
    return () => { channelRef.current?.unsubscribe(); };`,
  `    // Realtime disabled - WebSocket key issue
    return () => {};`
);

// Fix 5: Also remove the card/category display that references missing joins
forum = forum.replace(
  `{post.forum_categories && (
                            <span style={{ padding: "2px 10px", borderRadius: 100, background: "rgba(201,166,107,0.08)", color: GD2, fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", border: "1px solid rgba(201,166,107,0.15)", marginBottom: 6, display: "inline-block" }}>
                              {post.forum_categories.name}
                            </span>
                          )}`,
  `{post.category_id && (
                            <span style={{ padding: "2px 10px", borderRadius: 100, background: "rgba(201,166,107,0.08)", color: GD2, fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", border: "1px solid rgba(201,166,107,0.15)", marginBottom: 6, display: "inline-block" }}>
                              {post.category_id}
                            </span>
                          )}`
);

fs.writeFileSync(forumPath, forum, 'utf8');
console.log('Forum fixed!');
console.log('Simple select:', forum.includes('"id,title,content,upvotes,created_at,card_id,author_id,category_id"'));
console.log('No realtime:', forum.includes('Realtime disabled'));
