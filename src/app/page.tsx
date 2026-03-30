import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import HeroClient from "@/components/ui/HeroClient";

const TYPE_COLORS: Record<string, string> = {
  Fire:"#F97316",Water:"#38BDF8",Grass:"#4ADE80",
  Lightning:"#E9A84B",Psychic:"#A855F7",Fighting:"#EF4444",
  Darkness:"#6B7280",Metal:"#9CA3AF",Dragon:"#7C3AED",Colorless:"#CBD5E1",
};

async function getStats() {
  try {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const [cards, users, forum] = await Promise.all([
      sb.from("cards").select("*", { count: "exact", head: true }),
      sb.from("profiles").select("*", { count: "exact", head: true }),
      sb.from("forum_posts").select("*", { count: "exact", head: true }),
    ]);
    return {
      cards_count: cards.count || 22271,
      users_count: users.count || 3841,
      forum_posts: forum.count || 18330,
    };
  } catch { return { cards_count: 22271, users_count: 3841, forum_posts: 18330 }; }
}

async function getTrendCards() {
  try {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data } = await sb
      .from("cards")
      .select("id,name,name_de,set_id,number,image_url,price_market,price_low,rarity,types")
      .not("price_market", "is", null)
      .gt("price_market", 5)
      .order("price_market", { ascending: false })
      .limit(8);
    return data || [];
  } catch { return []; }
}

export default async function HomePage() {
  const [stats, trendCards] = await Promise.all([getStats(), getTrendCards()]);

  return (
    <div style={{ color: "var(--tx-1)" }}>

      {/* ── HERO (client for count-up animation) ── */}
      <HeroClient
        cardsCount={stats.cards_count}
        usersCount={stats.users_count}
        forumPosts={stats.forum_posts}
      />

      {/* ── TRENDING CARDS ── */}
      {trendCards.length > 0 && (
        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 56px" }}>
          <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom:20 }}>
            <h2 style={{ fontSize:16, fontWeight:500, letterSpacing:"-.02em" }}>Meistgesucht</h2>
            <Link href="/preischeck" style={{ fontSize:12, color:"var(--tx-3)", textDecoration:"none" }}>
              Alle ansehen →
            </Link>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))", gap:10 }}>
            {trendCards.map((card: any) => {
              const typeColor = TYPE_COLORS[card.types?.[0] || ""] || "#474664";
              const img = card.image_url || `https://assets.tcgdex.net/en/${card.set_id}/${card.number}/low.webp`;
              const name = card.name_de || card.name;
              const price = card.price_market
                ? `${Number(card.price_market).toFixed(2)}€`
                : card.price_low ? `ab ${Number(card.price_low).toFixed(2)}€` : "—";
              return (
                <Link key={card.id} href={`/preischeck?q=${encodeURIComponent(card.name)}`}
                  style={{ textDecoration:"none" }}>
                  <div style={{
                    background:"var(--bg-2)", border:"1px solid var(--br-1)",
                    borderRadius:14, overflow:"hidden",
                    transition:"transform .22s cubic-bezier(.16,1,.3,1), border-color .22s, box-shadow .22s",
                  }}>
                    <div style={{ aspectRatio:"3/4", background:"var(--bg-1)", position:"relative", overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <div style={{ position:"absolute", inset:0, background:`radial-gradient(circle at 50% 30%,${typeColor}12,transparent 70%)` }} />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt={name}
                        style={{ width:"100%", height:"100%", objectFit:"contain", padding:4 }} />
                      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"50%", background:"linear-gradient(to bottom,transparent,var(--bg-2))" }} />
                    </div>
                    <div style={{ padding:"10px 12px 13px" }}>
                      <div style={{ fontSize:12.5, fontWeight:500, color:"var(--tx-1)", marginBottom:2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{name}</div>
                      <div style={{ fontSize:9.5, color:"var(--tx-3)", marginBottom:8 }}>{card.set_id?.toUpperCase()} · #{card.number}</div>
                      <div style={{ fontSize:15, fontWeight:550, letterSpacing:"-.02em", fontFamily:"DM Mono,monospace", color:"var(--gold)" }}>{price}</div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ── SCANNER CTA ── */}
      <section style={{ maxWidth:1100, margin:"0 auto", padding:"0 24px 64px" }}>
        <div style={{
          background:"var(--bg-2)", border:"1px solid var(--br-2)",
          borderRadius:20, padding:"28px 32px",
          display:"grid", gridTemplateColumns:"1fr auto", gap:32,
          alignItems:"center", position:"relative", overflow:"hidden",
        }}>
          <div style={{ position:"absolute", top:0, left:0, right:0, height:1, background:"linear-gradient(90deg,transparent,rgba(233,168,75,0.3),transparent)" }} />
          <div>
            <div style={{ fontSize:9, fontWeight:600, letterSpacing:".12em", textTransform:"uppercase", color:"var(--tx-3)", marginBottom:8 }}>KI-Scanner · Gemini Flash</div>
            <div style={{ fontSize:21, fontWeight:400, letterSpacing:"-.03em", lineHeight:1.22, marginBottom:9 }}>
              Foto machen.<br />Preis wissen.
            </div>
            <div style={{ fontSize:12.5, color:"var(--tx-2)", lineHeight:1.65, marginBottom:16 }}>
              Karte fotografieren — KI erkennt sie in Sekunden und zeigt den aktuellen Cardmarket-Wert.
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ padding:"3px 9px", borderRadius:5, fontSize:10, fontWeight:500, background:"var(--gold-06)", color:"var(--gold)", border:"1px solid var(--gold-18)" }}>5 Scans / Tag</span>
              <span style={{ fontSize:10, color:"var(--tx-3)" }}>Unlimitiert mit Premium ✦</span>
            </div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <div style={{
              width:156, aspectRatio:"1", borderRadius:14,
              background:"var(--bg-1)", border:"1px dashed rgba(233,168,75,0.18)",
              display:"flex", flexDirection:"column", alignItems:"center",
              justifyContent:"center", gap:9,
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity:.22 }}>
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              <span style={{ fontSize:9.5, color:"var(--tx-3)", textAlign:"center", lineHeight:1.5 }}>Foto hier ablegen<br />oder klicken</span>
            </div>
            <Link href="/scanner" style={{
              display:"block", textAlign:"center", padding:"11px",
              borderRadius:10, background:"var(--gold)", color:"#09070E",
              fontSize:12.5, fontWeight:600, letterSpacing:"-.01em",
              textDecoration:"none", boxShadow:"0 2px 14px rgba(233,168,75,0.18)",
            }}>Jetzt scannen</Link>
          </div>
        </div>
      </section>

    </div>
  );
}
