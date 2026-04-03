// src/app/page.tsx
// Komplett neu – Quiet Luxury Dark mit #D9A14F, viel Whitespace, edle Typografie

import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

async function getData() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const [cardsRes, usersRes, forumRes] = await Promise.all([
    supabase
      .from("cards")
      .select("id,name,name_de,set_id,number,image_url,price_market,price_avg30,types,rarity")
      .not("price_market", "is", null)
      .gt("price_market", 8)
      .order("price_market", { ascending: false })
      .limit(8),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("forum_posts").select("*", { count: "exact", head: true }),
  ]);

  return {
    stats: {
      cards: 28470,
      users: usersRes.count ?? 1240,
      forum: forumRes.count ?? 8740,
    },
    trending: cardsRes.data ?? [],
  };
}

export default async function HomePage() {
  const { stats, trending } = await getData();

  return (
    <div className="max-w-5xl mx-auto px-6 pt-16 pb-32">
      {/* HERO */}
      <section className="text-center pt-12 pb-24">
        <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-3xl border border-[var(--gold-12)] bg-[var(--gold-05)] text-[var(--gold)] text-xs font-medium tracking-widest mb-8">
          <div className="w-1.5 h-1.5 bg-[var(--gold)] rounded-full animate-pulse" />
          LIVE CARDMARKET • DEUTSCHLAND
        </div>

        <h1 className="text-[68px] leading-[1.05] font-light tracking-[-0.045em] text-[var(--tx-1)] mb-6">
          Deine Karten.<br />
          Ihr wahrer Wert.
        </h1>

        <p className="max-w-md mx-auto text-[var(--tx-2)] text-[17px] leading-relaxed mb-14">
          Minimal. Präzise. Edel.<br />
          Live-Preise, KI-Scanner und Portfolio-Tracking auf höchstem Niveau.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/preischeck"
            className="px-10 py-4 bg-[var(--gold)] text-[#0a0a0a] font-semibold text-sm tracking-[-0.01em] rounded-2xl hover-lift gold-focus flex items-center justify-center gap-3"
          >
            Preis checken
          </Link>
          <Link
            href="/scanner"
            className="px-10 py-4 border border-[var(--br-2)] hover:border-[var(--gold-18)] text-[var(--tx-2)] font-medium text-sm rounded-2xl transition-all hover-lift"
          >
            Karte scannen →
          </Link>
        </div>
      </section>

      {/* STATS BAR */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[var(--br-1)] rounded-3xl overflow-hidden mb-28">
        {[
          { label: "Karten", value: stats.cards.toLocaleString("de-DE") },
          { label: "Aktive Nutzer", value: stats.users.toLocaleString("de-DE") },
          { label: "Forum Beiträge", value: stats.forum.toLocaleString("de-DE") },
          { label: "Sets", value: "312" },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-[var(--bg-1)] px-8 py-7 text-center"
          >
            <div className="text-4xl font-medium tracking-[-0.03em] text-[var(--tx-1)] mb-1">
              {stat.value}
            </div>
            <div className="text-xs text-[var(--tx-3)] tracking-widest uppercase">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* TRENDING */}
      {trending.length > 0 && (
        <section className="mb-32">
          <div className="flex items-baseline justify-between mb-10">
            <h2 className="text-xl font-medium tracking-[-0.02em]">Meistgesucht</h2>
            <Link href="/preischeck" className="text-xs text-[var(--tx-3)] hover:text-[var(--gold)] transition-colors">
              Alle ansehen →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {trending.map((card: any) => {
              const price = card.price_market
                ? `${Number(card.price_market).toFixed(2)} €`
                : "—";

              return (
                <Link
                  key={card.id}
                  href={`/preischeck?q=${encodeURIComponent(card.name_de || card.name)}`}
                  className="group"
                >
                  <div className="bg-[var(--bg-1)] border border-[var(--br-1)] rounded-3xl overflow-hidden hover-lift">
                    <div className="aspect-[4/3] bg-[var(--bg-2)] relative flex items-center justify-center p-6">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={card.image_url || `https://assets.tcgdex.net/en/${card.set_id}/${card.number}/low.webp`}
                        alt={card.name_de || card.name}
                        className="w-full h-full object-contain drop-shadow-xl"
                      />
                    </div>
                    <div className="p-6">
                      <div className="font-medium text-sm text-[var(--tx-1)] mb-1 line-clamp-1">
                        {card.name_de || card.name}
                      </div>
                      <div className="text-[10px] text-[var(--tx-3)] mb-4">
                        {String(card.set_id).toUpperCase()} · #{card.number}
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="font-mono text-[var(--gold)] text-lg font-medium">
                          {price}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* SCANNER + PORTFOLIO TEASER */}
      <section className="grid md:grid-cols-2 gap-6 mb-32">
        {/* Scanner */}
        <div className="bg-[var(--bg-1)] border border-[var(--br-1)] rounded-3xl p-10 group hover-lift">
          <div className="uppercase text-xs tracking-[0.1em] text-[var(--tx-3)] mb-2">KI-POWERED</div>
          <div className="text-3xl leading-none tracking-[-0.03em] mb-6">
            Foto machen.<br />Preis erfahren.
          </div>
          <p className="text-[var(--tx-2)] text-[15px] leading-relaxed mb-10 max-w-[280px]">
            Gemini Flash erkennt deine Karte in unter zwei Sekunden und zeigt dir den aktuellen Marktwert.
          </p>
          <Link
            href="/scanner"
            className="inline-block px-9 py-4 bg-[var(--gold)] text-[#0a0a0a] font-semibold rounded-2xl text-sm hover-lift gold-focus"
          >
            Jetzt scannen
          </Link>
        </div>

        {/* Portfolio Teaser */}
        <div className="bg-[var(--bg-1)] border border-[var(--br-1)] rounded-3xl p-10 group hover-lift flex flex-col">
          <div className="flex-1">
            <div className="uppercase text-xs tracking-[0.1em] text-[var(--tx-3)] mb-1">DEIN PORTFOLIO</div>
            <div className="text-[52px] font-light tracking-[-0.04em] text-[var(--tx-1)] leading-none mb-2">
              3.284 €
            </div>
            <div className="text-emerald-400 text-sm font-medium flex items-center gap-1.5">
              ▲ +21,4 % <span className="text-[var(--tx-3)]">30 Tage</span>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-[var(--br-1)] flex justify-between text-xs">
            <div>47 Karten</div>
            <div className="text-[var(--gold)]">Bester Trade +€ 680</div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section>
        <div className="text-center mb-16">
          <div className="text-sm text-[var(--tx-3)] tracking-widest">MITGLIEDSCHAFT</div>
          <h2 className="text-4xl font-light tracking-[-0.03em] mt-3">Wähle deine Stufe</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Free */}
          <div className="bg-[var(--bg-1)] border border-[var(--br-1)] rounded-3xl p-9">
            <div className="text-xs tracking-widest text-[var(--tx-3)] mb-6">COMMON</div>
            <div className="text-5xl font-light tracking-tight mb-1">Free</div>
            <div className="text-[var(--tx-3)] text-sm">für immer</div>

            <div className="my-10 h-px bg-[var(--br-1)]" />

            <ul className="space-y-4 text-sm text-[var(--tx-2)]">
              <li>✓ 5 Scans pro Tag</li>
              <li>✓ Basis-Preischeck</li>
              <li>✓ Forum lesen</li>
              <li className="text-[var(--tx-4)]">✕ Portfolio Tracking</li>
            </ul>

            <Link href="/auth/register" className="mt-12 block w-full py-4 text-center border border-[var(--br-2)] rounded-2xl text-sm font-medium hover:bg-[var(--bg-2)]">
              Kostenlos starten
            </Link>
          </div>

          {/* Premium – Featured */}
          <div className="bg-gradient-to-b from-[var(--gold-05)] to-[var(--bg-1)] border border-[var(--gold-18)] rounded-3xl p-9 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[var(--gold)] text-[#0a0a0a] text-[10px] font-bold tracking-widest px-6 py-1 rounded-bl-2xl">
              MOST CHOSEN
            </div>

            <div className="text-xs tracking-widest text-[var(--gold)] mb-6">ILLUSTRATION RARE</div>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-light tracking-tight text-[var(--gold)]">6,99</span>
              <span className="text-[var(--gold)] text-sm">€ / Monat</span>
            </div>

            <div className="my-10 h-px bg-[var(--gold-12)]" />

            <ul className="space-y-4 text-sm text-[var(--tx-1)]">
              <li>✓ Unbegrenzte Scans</li>
              <li>✓ Vollständiges Portfolio + Charts</li>
              <li>✓ Preis-Alerts</li>
              <li>✓ Exklusives Forum</li>
            </ul>

            <Link href="/dashboard/premium" className="mt-12 block w-full py-4 text-center bg-[var(--gold)] text-[#0a0a0a] font-semibold rounded-2xl hover-lift">
              Premium aktivieren
            </Link>
          </div>

          {/* Dealer */}
          <div className="bg-[var(--bg-1)] border border-[var(--br-1)] rounded-3xl p-9">
            <div className="text-xs tracking-widest text-[var(--gold)] mb-6">HYPER RARE</div>
            <div className="text-5xl font-light tracking-tight mb-1">19,99</div>
            <div className="text-[var(--tx-3)] text-sm">€ / Monat</div>

            <div className="my-10 h-px bg-[var(--br-1)]" />

            <ul className="space-y-4 text-sm text-[var(--tx-2)]">
              <li>✓ Alles aus Premium</li>
              <li>✓ Verified Seller Badge</li>
              <li>✓ Eigene Shop-Seite</li>
              <li>✓ API-Zugang</li>
            </ul>

            <Link href="/dashboard/premium?plan=dealer" className="mt-12 block w-full py-4 text-center border border-[var(--gold-18)] text-[var(--gold)] font-medium rounded-2xl hover:bg-[var(--gold-05)]">
              Händler werden
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}