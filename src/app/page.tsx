// src/app/page.tsx
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

          <h1 className="text-[72px] font-light tracking-[-3.2px] leading-[1.04] mb-8">
            Deine Karten.<br />
            Ihr <span className="font-semibold text-[var(--g)]">wahrer</span> Wert.
          </h1>

          <p className="text-[17px] text-[var(--tx-2)] max-w-md mx-auto leading-relaxed">
            Präzise Live-Preise. KI-Scanner. Intelligentes Portfolio.<br />
            Gebaut für Sammler, die es ernst meinen.
          </p>

          <div className="flex items-center justify-center gap-4 mt-16">
            <Link 
              href="/preischeck" 
              className="px-10 py-5 bg-[var(--g)] text-black font-medium text-lg rounded-3xl hover:scale-105 active:scale-95 transition-transform"
            >
              Preis checken
            </Link>
            <Link 
              href="/scanner" 
              className="px-10 py-5 border border-[var(--br-2)] hover:border-[var(--g)] text-[var(--tx-2)] font-medium text-lg rounded-3xl transition-all"
            >
              Karte scannen →
            </Link>
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

      {/* ELEGANTER LIVE TICKER */}
      <div className="bg-[var(--bg-1)] border-b border-[var(--br-1)] py-3 overflow-hidden">
        <div className="max-w-screen-2xl mx-auto px-10 text-xs text-[var(--g)] flex items-center gap-8 whitespace-nowrap overflow-hidden">
          <span className="font-medium tracking-widest">LIVE</span>
          <span>Charizard ex • 312,80 € • ▲ 4,2 %</span>
          <span>Gardevoir ex • 189,90 € • ▼ 1,8 %</span>
          <span>Pikachu VMAX Rainbow • 142,80 € • ▲ 12,7 %</span>
          <span>Umbreon ex • 134,50 € • ▲ 8,2 %</span>
          <span>Dragonite ex • 98,40 € • ▼ 0,9 %</span>
        </div>
      </div>

      {/* TRENDING */}
      <section className="px-10 pt-20 pb-20 max-w-screen-2xl mx-auto">
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
                className="group bg-[var(--bg-1)] border border-[var(--br-2)] rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-6 hover:border-[var(--g18)] hover:shadow-2xl hover:shadow-[var(--g30)]"
              >
                <div className="aspect-[3/4] bg-[var(--bg-2)] flex items-center justify-center p-8 relative overflow-hidden">
                  <img 
                    src={card.image_url ?? `https://assets.tcgdex.net/en/${card.set_id}/${card.number}/low.webp`} 
                    alt={name} 
                    className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105" 
                  />
                </div>
                <div className="px-6 py-7">
                  <div className="font-medium line-clamp-1">{name}</div>
                  <div className="text-xs text-[var(--tx-3)] mt-px">
                    {String(card.set_id).toUpperCase()} · #{card.number}
                  </div>
                  <div className="price mt-6">{price}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* SCANNER + PORTFOLIO */}
      <section className="px-10 pb-28 grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-screen-2xl mx-auto">
        
        {/* Scanner */}
        <div className="bg-[var(--bg-1)] border border-[var(--br-2)] rounded-3xl p-12 flex flex-col">
          <div className="uppercase text-xs tracking-widest text-[var(--tx-3)]">KI-SCANNER</div>
          <div className="text-4xl font-light tracking-tight mt-6">Foto machen.<br />Preis wissen.</div>
          <p className="text-[var(--tx-2)] mt-8 max-w-xs">Die KI erkennt deine Karte in Sekunden und zeigt den aktuellen Cardmarket-Wert.</p>

          <div className="mt-10 border border-dashed border-[var(--br-2)] rounded-3xl h-64 flex flex-col items-center justify-center gap-4 hover:border-[var(--g18)] transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-[var(--g06)] flex items-center justify-center text-3xl">
              📸
            </div>
            <div className="text-center">
              <div className="text-sm text-[var(--tx-2)]">Foto oder Karte ablegen</div>
              <div className="text-xs text-[var(--tx-3)] mt-1">oder klicken zum Hochladen</div>
            </div>
          </div>

          <Link href="/scanner" className="mt-10 block w-full py-5 bg-[var(--g)] text-black font-medium rounded-3xl text-center">Jetzt scannen</Link>
        </div>

        {/* Portfolio */}
        <div className="bg-[var(--bg-1)] border border-[var(--br-2)] rounded-3xl p-12">
          <div className="text-xs text-[var(--tx-3)]">DEIN PORTFOLIO</div>
          <div className="text-6xl font-light tracking-tighter mt-3">2.847,60 €</div>
          <div className="mt-3 text-emerald-400 text-sm">▲ +18,4 % · 30 Tage</div>

          <div className="mt-12 h-52 flex items-end">
            <svg width="100%" height="140" viewBox="0 0 600 140" fill="none">
              <path d="M0 120 Q80 100 160 95 Q240 70 320 65 Q400 45 480 40 Q560 25 600 20" 
                    stroke="var(--g)" strokeWidth="2.5" strokeOpacity="0.85" fill="none"/>
              <path d="M0 120 Q80 100 160 95 Q240 70 320 65 Q400 45 480 40 Q560 25 600 20 L600 140 L0 140 Z" 
                    fill="var(--g)" fillOpacity="0.08"/>
            </svg>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="px-10 pb-32 max-w-screen-2xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-light tracking-tight">Mitgliedschaft</h2>
          <p className="text-[var(--tx-2)] mt-2">Wähle deine Stufe</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Free */}
          <div className="bg-[var(--bg-1)] border border-[var(--br-2)] rounded-3xl p-10 flex flex-col">
            <div className="uppercase text-xs tracking-widest text-[var(--tx-3)]">Free</div>
            <div className="mt-auto pt-8">
              <div className="text-6xl font-light">0 €</div>
              <div className="text-sm text-[var(--tx-3)] mt-1">für immer</div>
            </div>
            <div className="mt-12 space-y-4 text-sm text-[var(--tx-2)]">
              <div>5 Scans pro Tag</div>
              <div>Basis-Preischeck</div>
              <div>Forum lesen</div>
            </div>
            <Link href="/auth/register" className="mt-12 block w-full py-5 border border-[var(--br-2)] hover:border-[var(--tx-1)] rounded-3xl text-center text-sm font-medium">Kostenlos starten</Link>
          </div>

          {/* Premium */}
          <div className="bg-[var(--bg-1)] border border-[var(--g18)] rounded-3xl p-10 flex flex-col relative scale-[1.03]">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[var(--g)] text-black text-xs font-bold tracking-widest px-8 py-1 rounded-full">BELIEBTESTE WAHL</div>
            
            <div className="uppercase text-xs tracking-widest text-[var(--g)]">Premium</div>
            <div className="mt-auto pt-8">
              <div className="text-6xl font-light text-[var(--g)]">6,99 €</div>
              <div className="text-sm text-[var(--tx-3)] mt-1">pro Monat</div>
            </div>
            <div className="mt-12 space-y-4 text-sm text-[var(--tx-2)]">
              <div>Unlimitierter Scanner</div>
              <div>Portfolio + Charts</div>
              <div>Preis-Alerts</div>
              <div>Exklusiv-Forum</div>
            </div>
            <Link href="/dashboard/premium" className="mt-12 block w-full py-5 bg-[var(--g)] text-black font-medium rounded-3xl text-center">Premium werden</Link>
          </div>

          {/* Händler */}
          <div className="bg-[var(--bg-1)] border border-[var(--br-2)] rounded-3xl p-10 flex flex-col">
            <div className="uppercase text-xs tracking-widest text-[var(--g)]">Händler</div>
            <div className="mt-auto pt-8">
              <div className="text-6xl font-light">19,99 €</div>
              <div className="text-sm text-[var(--tx-3)] mt-1">pro Monat</div>
            </div>
            <div className="mt-12 space-y-4 text-sm text-[var(--tx-2)]">
              <div>Alles aus Premium</div>
              <div>Verified Seller Badge</div>
              <div>Eigene Shop-Seite</div>
              <div>API-Zugang (Beta)</div>
            </div>
            <Link href="/dashboard/premium?plan=dealer" className="mt-12 block w-full py-5 border border-[var(--g18)] hover:bg-[var(--g06)] text-[var(--g)] rounded-3xl text-center">Händler werden</Link>
          </div>
        </div>
      </section>

    </div>
  );
}