const fs = require('fs'), path = require('path');
const f = path.join('C:\\Users\\lenovo\\pokedax\\pokedax\\pokedax', 'src/app/forum/page.tsx');
let c = fs.readFileSync(f, 'utf8');

// Fix 1: Insert uses correct columns
// Replace all insert attempts with single correct one
const oldAttempts = c.slice(c.indexOf('// Only use category_id'), c.indexOf('let e: any = null;') + 'let e: any = null;'.length);

const newInsert = `// Use correct DB schema: author_id, content, category_id
      const validCatId = catId && catId.length > 10 ? catId : null;
      let e: any = null;
      const { error: insertErr } = await SB.from("forum_posts").insert({
        author_id:   session.user.id,
        title:       title.trim(),
        content:     body.trim() || null,
        category_id: validCatId,
        upvotes:     0,
        is_deleted:  false,
      });
      e = insertErr;`;

c = c.replace(oldAttempts, newInsert);

// Fix 2: Select uses correct columns
c = c.replace(
  'id,title,upvotes,created_at,card_id,',
  'id,title,content,upvotes,created_at,card_id,'
);
c = c.replace(
  'profiles!forum_posts_user_id_fkey(username)',
  'profiles!forum_posts_author_id_fkey(username)'
);

// Fix 3: Display content not body
c = c.replace(/post\.body \|\| post\.content/g, 'post.content');
c = c.replace(/\(post\.body \|\| post\.content\) &&/g, 'post.content &&');

// Fix 4: attempts loop - remove it
const loopStart = c.indexOf('for (const attempt of attempts)');
const loopEnd   = c.indexOf('if (e) { setError', loopStart);
if (loopStart > 0 && loopEnd > 0) {
  const loopBlock = c.slice(loopStart, loopEnd);
  c = c.replace(loopBlock, '');
}

fs.writeFileSync(f, c, 'utf8');
console.log('Forum fixed!');
console.log('Has author_id:', c.includes('author_id'));
console.log('Has old user_id insert:', c.includes("user_id: session.user.id"));
console.log('Has correct profile join:', c.includes('author_id_fkey'));
