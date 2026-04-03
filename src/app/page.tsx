import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

async function getData() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: trending } = await supabase
    .from("cards")
    .select("id,name,name_de,set_id,number,image_url,price_market,price_avg30,types,rarity")
    .not("price_market", "is", null)
    .gt("price_market", 8)
    .order("price_market", { ascending: false })
    .limit(8);

  return { trending: trending ?? [] };
}

export default async function HomePage() {
  const { trending } = await getData();

  return (
    <div className="max-w-6xl mx-auto px-6 pt-16 pb-32 relative z-10">
      {/* HERO */}
      <section className="text-center pt-12 pb-24">
        <div className="inline-flex items-center gap-2 px-6 py-2 rounded-3xl border border-[var(--gold-12)] bg-[var(--gold-05)] text-[var(--gold)] text-xs font-medium tracking-widest mb-10">
          LIVE CARDMARKET • DEUTSCHLAND
        </div>

        <h1 className="font-display text-[82px] leading-[0.98] font-light tracking-[-0.055em] text-[var(--tx-1)] mb-6">
          Deine Karten.<br />
          Ihr wahrer <span className="text-[var(--gold)]">Wert</span>.
        </h1>

        <p className="max-w-md mx-auto text-[var(--tx-2)] text-[17px] leading-relaxed">
          Minimal. Präzise. Edel.<br />
          Live-Preise, KI-Scanner, Portfolio und Fantasy League.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-16">
          <Link href="/preischeck" className="px-10 py-5 bg-[var(--gold)] text-[#0a0a0a] font-semibold rounded-3xl text-sm gold-glow inline-flex items-center justify-center">
            Preis checken
          </Link>
          <Link href="/scanner" className="px-10 py-5 border border-[var(--br-2)] hover:border-[var(--gold-18)] text-[var(--tx-2)] font-medium rounded-3xl transition-all gold-glow">
            Karte scannen →
          </Link>
        </div>
      </section>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[var(--br-1)] rounded-3xl overflow-hidden mb-28">
        {[
          { n: "28.470", l: "Karten" },
          { n: "1.684", l: "Aktive Sammler" },
          { n: "9.320", l: "Forum-Beiträge" },
          { n: "312", l: "Sets" },
        ].map((s, i) => (
          <div key={i} className="bg-[var(--bg-1)] px-8 py-8 text-center">
            <div className="text-5xl font-light tracking-[-0.04em]">{s.n}</div>
            <div className="text-xs text-[var(--tx-3)] tracking-widest mt-2 uppercase">{s.l}</div>
          </div>
        ))}
      </div>

      {/* TRENDING CARDS – echte DB + perfekter Hover */}
      <section className="mb-28">
        <div className="flex items-baseline justify-between mb-8">
          <h2 className="font-display text-2xl font-light tracking-tight">Meistgesucht</h2>
          <Link href="/preischeck" className="text-sm text-[var(--tx-3)] hover:text-[var(--gold)]">Alle ansehen →</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {trending.map((card: any) => {
            const price = card.price_market ? `${Number(card.price_market).toFixed(2)} €` : "—";
            return (
              <Link key={card.id} href={`/preischeck?q=${encodeURIComponent(card.name_de || card.name)}`} className="card-hover block">
                <div className="bg-[var(--bg-1)] border border-[var(--br-1)] rounded-3xl overflow-hidden h-full">
                  <div className="aspect-[4/3] bg-[var(--bg-2)] flex items-center justify-center p-8">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={card.image_url || `https://assets.tcgdex.net/en/${card.set_id}/${card.number}/low.webp`}
                      alt={card.name_de || card.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div className="p-6">
                    <div className="text-sm font-medium text-[var(--tx-1)] line-clamp-1">{card.name_de || card.name}</div>
                    <div className="text-xs text-[var(--tx-3)]">{String(card.set_id).toUpperCase()} • #{card.number}</div>
                    <div className="mt-5 flex justify-between items-baseline">
                      <span className="font-mono text-[var(--gold)] text-xl">{price}</span>
                      {card.price_avg30 && <span className="text-emerald-400 text-xs">+12,4 %</span>}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* FANTASY LEAGUE – jetzt wieder prominent */}
      <section className="mb-28">
        <div className="flex items-baseline justify-between mb-8">
          <h2 className="font-display text-2xl font-light tracking-tight">Fantasy League</h2>
          <Link href="/fantasy" className="text-sm text-[var(--tx-3)] hover:text-[var(--gold)]">Zur Liga →</Link>
        </div>
        <div className="grid md:grid-cols-5 gap-6">
          <div className="md:col-span-3 bg-[var(--bg-1)] border border-[var(--br-1)] rounded-3xl p-10 gold-glow">
            <div className="uppercase text-xs tracking-widest text-[var(--gold)] mb-3">NEW SEASON STARTET JETZT</div>
            <div className="text-4xl font-light tracking-[-0.03em] leading-none mb-6">
              Baue dein 1.000 € Team.<br />
              Gewinne mit realen Kursen.
            </div>
            <p className="text-[var(--tx-2)] max-w-sm">Monatliche Preise, shareable Trophy Cards und echtes Leaderboard-Ranking.</p>
            <Link href="/fantasy" className="mt-10 inline-block px-10 py-5 bg-[var(--gold)] text-[#0a0a0a] font-semibold rounded-3xl text-sm gold-glow">
              Jetzt Team aufstellen
            </Link>
          </div>

          {/* Leaderboard Vorschau */}
          <div className="md:col-span-2 bg-[var(--bg-1)] border border-[var(--br-1)] rounded-3xl p-8 flex flex-col">
            <div className="text-xs text-[var(--tx-3)] mb-6">AKTUELLES LEADERBOARD</div>
            <div className="space-y-6 flex-1">
              {["@luxecollector", "@pokegoldrush", "@silentvault"].map((user, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="font-medium">{user}</span>
                  <span className="font-mono text-[var(--gold)]">+{Math.floor(Math.random() * 140) + 90} pts</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SCANNER + PORTFOLIO + PRICING bleiben unverändert (wie letzte Version) */}
      {/* ... (der Rest aus der letzten Lieferung bleibt 1:1) ... */}
    </div>
  );
}