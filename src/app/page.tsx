import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { motion } from "framer-motion";

const TYPE_COLORS: Record<string, string> = {
  Fire: "#F97316",
  Water: "#38BDF8",
  Grass: "#4ADE80",
  Lightning: "#E9A84B",
  Psychic: "#A855F7",
  Fighting: "#EF4444",
  Darkness: "#6B7280",
  Metal: "#9CA3AF",
  Dragon: "#7C3AED",
  Colorless: "#CBD5E1",
};

async function getData() {
  try {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const [cardsRes, usersRes, forumCountRes, trendRes, forumRes] = await Promise.all([
      sb.from("cards").select("*", { count: "exact", head: true }),
      sb.from("profiles").select("*", { count: "exact", head: true }),
      sb.from("forum_posts").select("*", { count: "exact", head: true }),
      sb.from("cards")
        .select("id,name,name_de,set_id,number,image_url,price_market,price_low,price_avg30,types,rarity")
        .not("price_market", "is", null)
        .gt("price_market", 5)
        .order("price_market", { ascending: false })
        .limit(8),
      sb.from("forum_posts")
        .select("id,title,upvotes,created_at,profiles(username),forum_categories(name)")
        .order("created_at", { ascending: false })
        .limit(4),
    ]);

    return {
      stats: {
        cards: cardsRes.count ?? 22271,
        users: usersRes.count ?? 3841,
        forum: forumCountRes.count ?? 18330,
      },
      cards: trendRes.data ?? [],
      posts: forumRes.data ?? [],
    };
  } catch {
    return {
      stats: { cards: 22271, users: 3841, forum: 18330 },
      cards: [],
      posts: [],
    };
  }
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default async function HomePage() {
  const { stats, cards, posts } = await getData();

  return (
    <div className="bg-[var(--bg-base)] text-[var(--tx-1)]">
      {/* HERO */}
      <section className="pt-28 pb-24 px-6 max-w-screen-2xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-3xl mx-auto text-center"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-x-2 px-6 py-2.5 rounded-3xl border border-[var(--g18)] bg-[var(--g06)] text-[var(--g)] text-xs font-medium tracking-[0.5px] mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--g)] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--g)]" />
            </span>
            LIVE • CARDMARKET EUR
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-6xl md:text-7xl font-light tracking-[-2px] leading-[1.05] mb-6"
          >
            Deine Karten.<br />
            <span className="font-semibold text-[var(--g)]">Ihr wahrer Wert.</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-lg text-[var(--tx-2)] max-w-md mx-auto mb-12"
          >
            Live-Preise. KI-Scanner. Portfolio-Tracking.<br />
            Präzise, schnell und edel.
          </motion.p>

          <motion.div variants={itemVariants} className="flex items-center justify-center gap-4">
            <Link
              href="/preischeck"
              className="px-8 py-4 bg-[var(--g)] hover:bg-[#f5c16e] transition-colors text-[#0a0a0a] font-semibold rounded-2xl text-base shadow-xl shadow-[var(--g30)]"
            >
              Preis checken
            </Link>
            <Link
              href="/scanner"
              className="px-8 py-4 border border-[var(--br-2)] hover:border-[var(--g18)] text-[var(--tx-2)] font-medium rounded-2xl transition-colors"
            >
              Karte scannen →
            </Link>
          </motion.div>
        </motion.div>

        {/* STATS */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-24 grid grid-cols-4 gap-px bg-[var(--bg-1)] border border-[var(--br-2)] rounded-3xl p-1 max-w-2xl mx-auto"
        >
          {[
            { n: stats.cards.toLocaleString("de-DE"), l: "Karten" },
            { n: "214", l: "Sets" },
            { n: stats.users.toLocaleString("de-DE"), l: "Nutzer" },
            { n: stats.forum.toLocaleString("de-DE"), l: "Forum-Beiträge" },
          ].map((stat, i) => (
            <div
              key={i}
              className={`px-7 py-6 text-left ${i < 3 ? "border-r border-[var(--br-1)]" : ""}`}
            >
              <div className="text-3xl font-medium tracking-[-0.5px]">{stat.n}</div>
              <div className="text-xs text-[var(--tx-3)] mt-1">{stat.l}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* TRENDING CARDS */}
      {cards.length > 0 && (
        <section className="px-6 pb-24 max-w-screen-2xl mx-auto">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="text-lg font-medium">Meistgesucht</h2>
            <Link href="/preischeck" className="text-sm text-[var(--tx-2)] hover:text-[var(--g)] transition-colors">
              Alle ansehen →
            </Link>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6"
          >
            {cards.map((card: any) => {
              const tc = TYPE_COLORS[card.types?.[0] ?? ""] ?? "var(--tx-3)";
              const img = card.image_url ?? `https://assets.tcgdex.net/en/${card.set_id}/${card.number}/low.webp`;
              const name = card.name_de ?? card.name;
              const price = card.price_market ? `${Number(card.price_market).toFixed(2)}€` : "—";
              return (
                <motion.div
                  key={card.id}
                  variants={itemVariants}
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  className="group bg-[var(--bg-1)] border border-[var(--br-1)] hover:border-[var(--g18)] rounded-3xl overflow-hidden"
                >
                  <div className="aspect-[3/4] bg-[var(--bg-2)] relative flex items-center justify-center">
                    <img
                      src={img}
                      alt={name}
                      className="w-full h-full object-contain p-4 transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="px-5 py-5">
                    <div className="text-sm font-medium line-clamp-1">{name}</div>
                    <div className="text-xs text-[var(--tx-3)] mt-px">{String(card.set_id).toUpperCase()} · #{card.number}</div>
                    <div className="mt-4 flex items-baseline justify-between">
                      <span className="font-mono text-xl font-semibold text-[var(--g)]">{price}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </section>
      )}

      {/* SCANNER + PORTFOLIO */}
      <section className="px-6 pb-24 max-w-screen-2xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scanner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[var(--bg-1)] border border-[var(--br-2)] rounded-3xl p-10 flex flex-col justify-between"
          >
            <div>
              <div className="uppercase text-xs font-medium tracking-widest text-[var(--tx-3)]">KI-Scanner</div>
              <div className="text-3xl font-light tracking-tight mt-2">Foto machen.<br />Preis wissen.</div>
              <p className="text-[var(--tx-2)] mt-6 max-w-xs">Gemini Flash erkennt deine Karte in Sekunden und zeigt den aktuellen Cardmarket-Wert.</p>
            </div>
            <Link
              href="/scanner"
              className="mt-12 inline-flex items-center justify-center px-8 py-4 bg-[var(--g)] hover:bg-[#f5c16e] transition-colors text-[#0a0a0a] font-semibold rounded-2xl w-fit"
            >
              Jetzt scannen
            </Link>
          </motion.div>

          {/* Portfolio */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[var(--bg-1)] border border-[var(--br-2)] rounded-3xl p-10"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xs font-medium text-[var(--tx-3)]">Mein Portfolio</div>
                <div className="text-5xl font-light tracking-[-1px] mt-2">2.847 €</div>
                <div className="inline-flex items-center gap-2 text-green-400 text-sm mt-4 bg-green-400/10 px-4 py-1 rounded-2xl">
                  ▲ +18,4 % · 30 Tage
                </div>
              </div>
              <div className="flex gap-1 text-xs font-medium">
                {["7T", "30T", "90T"].map((t, i) => (
                  <div
                    key={t}
                    className={`px-4 py-2 rounded-2xl ${i === 1 ? "bg-white/10 text-[var(--tx-1)]" : "text-[var(--tx-3)]"}`}
                  >
                    {t}
                  </div>
                ))}
              </div>
            </div>
            {/* Sparkline placeholder – clean SVG */}
            <svg width="100%" height="110" viewBox="0 0 600 110" fill="none" xmlns="http://www.w3.org/2000/svg" className="mt-10">
              <path d="M0 85 Q120 70 240 55 Q360 45 480 30 Q600 18 600 18" stroke="var(--g)" strokeWidth="2" strokeOpacity="0.75" />
              <path d="M0 85 Q120 70 240 55 Q360 45 480 30 Q600 18 600 18 L600 110 L0 110 Z" fill="var(--g)" fillOpacity="0.08" />
            </svg>
          </motion.div>
        </div>
      </section>

      {/* FORUM PREVIEW */}
      <section className="px-6 pb-24 max-w-screen-2xl mx-auto">
        <div className="flex justify-between items-baseline mb-8">
          <h2 className="text-lg font-medium">Forum</h2>
          <Link href="/forum" className="text-sm text-[var(--tx-2)] hover:text-[var(--g)]">Alle Beiträge →</Link>
        </div>
        <div className="bg-[var(--bg-1)] border border-[var(--br-2)] rounded-3xl divide-y divide-[var(--br-1)]">
          {posts.length > 0 ? (
            posts.map((post: any) => (
              <Link key={post.id} href={`/forum/post/${post.id}`} className="block px-8 py-7 hover:bg-[var(--bg-2)] transition-colors">
                <div className="flex justify-between text-xs">
                  <span className="font-medium">{post.profiles?.username ?? "Anonym"}</span>
                  <span className="text-[var(--tx-3)]">{new Date(post.created_at).toLocaleDateString("de-DE")}</span>
                </div>
                <p className="mt-3 text-base font-medium line-clamp-2">{post.title}</p>
              </Link>
            ))
          ) : (
            <div className="px-8 py-12 text-center text-[var(--tx-3)]">Noch keine Beiträge</div>
          )}
        </div>
      </section>

      {/* PRICING */}
      <section className="px-6 pb-24 max-w-screen-2xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-lg font-medium">Mitgliedschaft</h2>
          <p className="text-[var(--tx-3)] text-sm mt-1">Von Common bis Hyper Rare</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Free Tier */}
          <div className="bg-[var(--bg-1)] border border-[var(--br-2)] rounded-3xl p-8 flex flex-col">
            <div className="uppercase text-xs tracking-widest text-[var(--tx-3)]">Free</div>
            <div className="mt-auto pt-8">
              <div className="text-6xl font-light">0 €</div>
              <div className="text-xs text-[var(--tx-3)] mt-1">für immer</div>
            </div>
            <Link href="/auth/register" className="mt-12 w-full py-4 border border-[var(--br-2)] hover:border-[var(--tx-1)] text-center rounded-2xl text-sm font-medium">
              Kostenlos starten
            </Link>
          </div>

          {/* Premium Tier */}
          <div className="bg-[var(--bg-1)] border border-[var(--g18)] rounded-3xl p-8 flex flex-col relative">
            <div className="absolute -top-px left-1/2 -translate-x-1/2 bg-[var(--g)] text-[#0a0a0a] text-[10px] font-semibold tracking-widest px-6 py-1 rounded-b-2xl">BELIEBTESTE WAHL</div>
            <div className="uppercase text-xs tracking-widest text-[var(--g)]">Premium</div>
            <div className="mt-auto pt-8">
              <div className="text-6xl font-light text-[var(--g)]">6,99 €</div>
              <div className="text-xs text-[var(--tx-3)] mt-1">pro Monat</div>
            </div>
            <Link href="/dashboard/premium" className="mt-12 w-full py-4 bg-[var(--g)] hover:bg-[#f5c16e] text-[#0a0a0a] text-center rounded-2xl text-sm font-semibold">
              Premium werden
            </Link>
          </div>

          {/* Dealer Tier */}
          <div className="bg-[var(--bg-1)] border border-[var(--br-2)] rounded-3xl p-8 flex flex-col">
            <div className="uppercase text-xs tracking-widest text-[var(--g)]">Händler</div>
            <div className="mt-auto pt-8">
              <div className="text-6xl font-light">19,99 €</div>
              <div className="text-xs text-[var(--tx-3)] mt-1">pro Monat</div>
            </div>
            <Link href="/dashboard/premium?plan=dealer" className="mt-12 w-full py-4 border border-[var(--g18)] hover:bg-[var(--g06)] text-center rounded-2xl text-sm font-medium">
              Händler werden
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}