import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

async function getData() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const [cardsRes, usersRes, forumCountRes, trendRes] = await Promise.all([
      supabase.from("cards").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("forum_posts").select("*", { count: "exact", head: true }),
      supabase
        .from("cards")
        .select("id,name,name_de,set_id,number,image_url,price_market")
        .not("price_market", "is", null)
        .gt("price_market", 5)
        .order("price_market", { ascending: false })
        .limit(6),
    ]);

    return {
      stats: {
        cards: cardsRes.count ?? 22271,
        users: usersRes.count ?? 3841,
        forum: forumCountRes.count ?? 18330,
      },
      cards: trendRes.data ?? [],
    };
  } catch {
    return {
      stats: { cards: 22271, users: 3841, forum: 18330 },
      cards: [],
    };
  }
}

export default async function HomePage() {
  const { stats, cards } = await getData();

  return (
    <div className="bg-[var(--bg-base)] text-[var(--tx-1)]">
      {/* HERO */}
      <section className="pt-32 pb-28 px-10 max-w-screen-2xl mx-auto">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-3xl border border-[var(--g)]/20 bg-[var(--g)]/5 text-[var(--g)] text-xs font-medium tracking-widest mb-12">
            LIVE • CARDMARKET EUR • DEUTSCHLAND
          </div>

          <h1 className="hero-title mb-8">
            Deine Karten.<br />
            Ihr <span className="font-semibold text-[var(--g)]">wahrer</span> Wert.
          </h1>

          <p className="text-[17px] text-[var(--tx-2)] max-w-md mx-auto leading-relaxed">
            Präzise Live-Preise. KI-Scanner. Intelligentes Portfolio.<br />
            Gebaut für Sammler, die es ernst meinen.
          </p>

          <div className="flex items-center justify-center gap-4 mt-16">
            <Link href="/preischeck" className="px-10 py-5 bg-[var(--g)] text-black font-medium text-lg rounded-3xl hover:scale-105 active:scale-95 transition-transform">Preis checken</Link>
            <Link href="/scanner" className="px-10 py-5 border border-[var(--br-2)] hover:border-[var(--g)] text-[var(--tx-2)] font-medium text-lg rounded-3xl transition-all">Karte scannen →</Link>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="max-w-3xl mx-auto px-10 -mt-8">
        <div className="grid grid-cols-4 bg-[var(--bg-1)] border border-[var(--br-2)] rounded-3xl p-1">
          {[
            { n: stats.cards.toLocaleString("de-DE"), l: "Karten" },
            { n: "214", l: "Sets" },
            { n: stats.users.toLocaleString("de-DE"), l: "Nutzer" },
            { n: stats.forum.toLocaleString("de-DE"), l: "Beiträge" },
          ].map((stat, i) => (
            <div key={i} className={`text-center py-9 ${i < 3 ? "border-r border-[var(--br-1)]" : ""}`}>
              <div className="text-4xl font-medium">{stat.n}</div>
              <div className="text-xs text-[var(--tx-3)] mt-1 tracking-widest">{stat.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* TRENDING */}
      <section className="px-10 pt-28 pb-20 max-w-screen-2xl mx-auto">
        <div className="flex justify-between items-baseline mb-10">
          <h2 className="text-2xl font-light tracking-tight">Meistgesucht</h2>
          <Link href="/preischeck" className="text-sm text-[var(--tx-2)] hover:text-[var(--g)]">Alle ansehen →</Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {cards.map((card: any) => {
            const name = card.name_de ?? card.name;
            const price = card.price_market ? `${Number(card.price_market).toFixed(2)} €` : "—";
            return (
              <Link
                key={card.id}
                href={`/preischeck?q=${encodeURIComponent(name)}`}
                className="card bg-[var(--bg-1)] border border-[var(--br-2)] rounded-3xl overflow-hidden"
              >
                <div className="aspect-[3/4] bg-[var(--bg-2)] flex items-center justify-center p-8">
                  <img src={card.image_url ?? `https://assets.tcgdex.net/en/${card.set_id}/${card.number}/low.webp`} alt={name} className="w-full h-full object-contain" />
                </div>
                <div className="px-6 py-7">
                  <div className="font-medium line-clamp-1">{name}</div>
                  <div className="text-xs text-[var(--tx-3)] mt-px">{String(card.set_id).toUpperCase()} · #{card.number}</div>
                  <div className="price mt-6">{price}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* SCANNER + PORTFOLIO */}
      <section className="px-10 pb-28 grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-screen-2xl mx-auto">
        <div className="bg-[var(--bg-1)] border border-[var(--br-2)] rounded-3xl p-12 flex flex-col">
          <div className="uppercase text-xs tracking-widest text-[var(--tx-3)]">KI-SCANNER</div>
          <div className="text-4xl font-light tracking-tight mt-6">Foto machen.<br />Preis wissen.</div>
          <p className="text-[var(--tx-2)] mt-8 max-w-xs">Die KI erkennt deine Karte in Sekunden und zeigt den aktuellen Cardmarket-Wert.</p>
          <Link href="/scanner" className="mt-auto pt-12 block w-full py-5 bg-[var(--g)] text-black font-medium rounded-3xl text-center">Jetzt scannen</Link>
        </div>

        <div className="bg-[var(--bg-1)] border border-[var(--br-2)] rounded-3xl p-12">
          <div className="text-xs text-[var(--tx-3)]">DEIN PORTFOLIO</div>
          <div className="text-6xl font-light tracking-tighter mt-3">2.847,60 €</div>
          <div className="mt-3 text-emerald-400 text-sm">▲ +18,4 % · 30 Tage</div>
        </div>
      </section>
    </div>
  );
}