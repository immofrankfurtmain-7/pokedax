const fs = require('fs'), path = require('path');
const root = 'C:\\Users\\lenovo\\pokedax\\pokedax\\pokedax';

// ── 1. FORUM: Fix categories ──
const forumPath = path.join(root, 'src/app/forum/page.tsx');
let forum = fs.readFileSync(forumPath, 'utf8');

// The real categories from DB have string IDs like "marktplatz"
// Remove the null-id fallback categories entirely - show nothing if DB empty
// Also remove the filter so ALL cats show (including string IDs)
forum = forum.replace(
  'cats.filter(c => c.id).map((cat: any) => (',
  'cats.filter((c: any) => c.id !== null && c.id !== undefined).map((cat: any) => ('
);

// Fix the sidebar category buttons too (same filter issue)
forum = forum.replace(
  '{cats.map((cat: any) => (',
  '{cats.filter((c: any) => c.id).map((cat: any) => ('
);

// Fix: use real DB categories as fallback with actual IDs
forum = forum.replace(
  `setCats([
            { id: null, name: "Allgemein",  icon: "💬" },
            { id: null, name: "Preise",     icon: "📈" },
            { id: null, name: "Suche/Biete",icon: "🔄" },
            { id: null, name: "Neuheiten",  icon: "✨" },
            { id: null, name: "Grading",    icon: "🏆" },
          ]);`,
  `setCats([
            { id: "einsteiger", name: "Einsteiger",       icon: "💬" },
            { id: "preise",     name: "Preisdiskussion",  icon: "📈" },
            { id: "marktplatz", name: "Marktplatz",       icon: "🔄" },
            { id: "news",       name: "Neuigkeiten",      icon: "✨" },
            { id: "turniere",   name: "Turniere & Events",icon: "🏆" },
            { id: "fake-check", name: "Fake-Check",       icon: "🔍" },
            { id: "premium",    name: "Premium Lounge",   icon: "✦"  },
          ]);`
);

// Fix: default selected category in modal
forum = forum.replace(
  'useState<string|null>("einsteiger")',
  'useState<string>("einsteiger")'
);

// Fix: posts not showing - the select might fail silently
// Add error logging
forum = forum.replace(
  '    } catch {}\n    setLoading(false);',
  '    } catch(err) { console.error("Forum load error:", err); }\n    setLoading(false);'
);

fs.writeFileSync(forumPath, forum, 'utf8');
console.log('Forum fixed');
console.log('Has real cat IDs:', forum.includes('"marktplatz"'));

// ── 2. MARKETPLACE: Fix card search dropdown z-index ──
const mpPath = path.join(root, 'src/app/marketplace/page.tsx');
let mp = fs.readFileSync(mpPath, 'utf8');

// Fix dropdown z-index and ensure it's above modal
mp = mp.replace(
  'position: "absolute", top: "100%", left: 0, right: 0, zIndex: 10,',
  'position: "absolute", top: "100%", left: 0, right: 0, zIndex: 9999,'
);

// Also check if results state is being set correctly
// The issue might be that card state prevents dropdown from showing
// Fix: show results even after card is selected (for changing card)
mp = mp.replace(
  'results.length > 0 && !card && (',
  'results.length > 0 && ('
);

fs.writeFileSync(mpPath, mp, 'utf8');
console.log('Marketplace fixed');
console.log('Has z-index 9999:', mp.includes('zIndex: 9999'));
console.log('Dropdown always shows:', mp.includes('results.length > 0 && ('));
