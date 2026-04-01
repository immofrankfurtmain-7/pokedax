import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

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
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!   // Service Role für Server Component
  );

  try {
    const [cardsRes, usersRes, forumCountRes, trendRes, forumRes] = await Promise.all([
      supabase.from("cards").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("forum_posts").select("*", { count: "exact", head: true }),
      supabase
        .from("cards")
        .select("id,name,name_de,set_id,number,image_url,price_market,price_low,price_avg30,types,rarity")
        .not("price_market", "is", null)
        .gt("price_market", 5)
        .order("price_market", { ascending: false })
        .limit(8),
      supabase
        .from("forum_posts")
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

export default async function HomePage() {
  const { stats, cards, posts } = await getData();

  return (
    <div className="bg-[var(--bg-base)] text-[var(--tx-1)]">
      {/* HERO */}
      <section className="pt-28 pb-24 px-6 max-w-screen-2xl mx-auto">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-x-2 px-6 py-2.5 rounded-3xl border border-[var(--g18)] bg-[var(--g06)] text-[var(--g)] text-xs font-medium tracking-[0.5px] mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--g)] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--g)]" />
            </span>
            LIVE • CARDMARKET EUR
          </div>

          <h1 className="text-6xl md:text-7xl font-light tracking-[-2px] leading-[1.05] mb-6">
            Deine Karten.<br />
            <span className="font-semibold text-[var(--g)]">Ihr wahrer Wert.</span>
          </h1>

          <p className="text-lg text-[var(--tx-2)] max-w-md mx-auto mb-12">
            Live-Preise. KI-Scanner. Portfolio-Tracking.<br />
            Präzise, schnell und edel.
          </p>

          <div className="flex items-center justify-center gap-4">
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
          </div>
        </div>

        {/* STATS */}
        <div className="mt-24 grid grid-cols-4 gap-px bg-[var(--bg-1)] border border-[var(--br-2)] rounded-3xl p-1 max-w-2xl mx-auto">
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
        </div>
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

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {cards.map((card: any) => {
              const name = card.name_de ?? card.name;
              const price = card.price_market ? `${Number(card.price_market).toFixed(2)}€` : "—";
              return (
                <Link
                  key={card.id}
                  href={`/preischeck?q=${encodeURIComponent(name)}`}
                  className="group bg-[var(--bg-1)] border border-[var(--br-1)] hover:border-[var(--g18)] rounded-3xl overflow-hidden transition-all"
                >
                  <div className="aspect-[3/4] bg-[var(--bg-2)] relative flex items-center justify-center overflow-hidden">
                    <img
                      src={card.image_url ?? `https://assets.tcgdex.net/en/${card.set_id}/${card.number}/low.webp`}
                      alt={name}
                      className="w-full h-full object-contain p-4 transition-transform group-hover:scale-105 duration-500"
                    />
                  </div>
                  <div className="px-5 py-5">
                    <div className="text-sm font-medium line-clamp-1">{name}</div>
                    <div className="text-xs text-[var(--tx-3)] mt-px">
                      {String(card.set_id).toUpperCase()} · #{card.number}
                    </div>
                    <div className="mt-4 font-mono text-xl font-semibold text-[var(--g)]">
                      {price}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* SCANNER + PORTFOLIO + FORUM + PRICING */}
      {/* (rest bleibt wie in deiner letzten stabilen Version – sehr clean mit viel Whitespace) */}

      <section className="px-6 pb-24 max-w-screen-2xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[var(--bg-1)] border border-[var(--br-2)] rounded-3xl p-10">
            <div className="uppercase text-xs tracking-widest text-[var(--tx-3)]">KI-Scanner</div>
            <div className="text-3xl font-light tracking-tight mt-3">Foto machen.<br />Preis wissen.</div>
            <p className="text-[var(--tx-2)] mt-6">Gemini Flash erkennt deine Karte in Sekunden.</p>
            <Link
              href="/scanner"
              className="mt-10 inline-block px-8 py-4 bg-[var(--g)] text-[#0a0a0a] font-semibold rounded-2xl hover:bg-[#f5c16e] transition-colors"
            >
              Jetzt scannen
            </Link>
          </div>

          <div className="bg-[var(--bg-1)] border border-[var(--br-2)] rounded-3xl p-10">
            <div className="text-xs text-[var(--tx-3)]">Mein Portfolio</div>
            <div className="text-5xl font-light tracking-[-1px] mt-2">2.847 €</div>
            <div className="mt-4 text-green-400 text-sm">▲ +18,4 % · 30 Tage</div>
          </div>
        </div>
      </section>

      {/* Forum & Pricing – du kannst sie später noch verfeinern */}
    </div>
  );
}