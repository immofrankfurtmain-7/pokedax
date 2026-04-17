"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const GOLD = "#C9A66B";
const BG   = "#0A0A0A";
const BG2  = "#111111";
const BG3  = "#1A1A1A";
const TX   = "#EDE9E0";
const TX2  = "rgba(237,233,224,0.7)";
const GD2  = "rgba(201,166,107,0.7)";

const SB = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function FantasyPage() {
  const [user,    setUser]    = useState<any>(null);
  const [teams,   setTeams]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [email,   setEmail]   = useState("");
  const [done,    setDone]    = useState(false);

  useEffect(() => {
    SB.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        SB.from("fantasy_teams")
          .select("id,name,total_score,rank,created_at,fantasy_picks(id,card_id,cards(name,name_de,image_url,price_market))")
          .eq("user_id", user.id)
          .order("total_score", { ascending: false })
          .then(({ data }) => { setTeams(data ?? []); setLoading(false); });
      } else {
        setLoading(false);
      }
    });
  }, []);

  return (
    <div style={{ background: BG, minHeight: "100vh", color: TX }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;700&family=Instrument+Sans:wght@400;500;600&display=swap');
        .ph { font-family:'Playfair Display',serif; letter-spacing:-0.05em; }
        .btn-gold { display:inline-flex; align-items:center; gap:8px; padding:16px 36px; background:#C9A66B; color:#0A0A0A; border-radius:100px; border:none; font-size:15px; font-weight:700; cursor:pointer; text-decoration:none; transition:transform 0.2s,box-shadow 0.2s; }
        .btn-gold:hover { transform:scale(1.03); box-shadow:0 12px 40px rgba(201,166,107,0.35); }
        .btn-outline { display:inline-flex; align-items:center; gap:8px; padding:15px 32px; border:1px solid rgba(201,166,107,0.4); color:#C9A66B; border-radius:100px; background:transparent; font-size:15px; cursor:pointer; text-decoration:none; transition:all 0.2s; }
        .btn-outline:hover { background:#C9A66B; color:#0A0A0A; }
        .feature-card { background:#111111; border:1px solid rgba(255,255,255,0.07); border-radius:20px; padding:28px; transition:border-color 0.2s,transform 0.2s; }
        .feature-card:hover { border-color:rgba(201,166,107,0.2); transform:translateY(-2px); }
        .email-input { flex:1; min-width:220px; padding:18px 28px; background:rgba(255,255,255,0.04); border:1px solid rgba(201,166,107,0.3); border-radius:100px; color:#EDE9E0; font-size:15px; outline:none; font-family:inherit; transition:border-color 0.2s; }
        .email-input:focus { border-color:#C9A66B; }
        .email-input::placeholder { color:rgba(237,233,224,0.3); }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        .float { animation:float 4s ease-in-out infinite; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation:fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) both; }
        .team-card { background:#111111; border:1px solid rgba(201,166,107,0.15); border-radius:20px; padding:24px; transition:border-color 0.2s; }
        .team-card:hover { border-color:rgba(201,166,107,0.3); }
        .pick-img { width:56px; height:78px; border-radius:8px; background:#1A1A1A; overflow:hidden; border:1px solid rgba(255,255,255,0.06); flex-shrink:0; }
      `}</style>

      {/* Hero */}
      <div style={{ textAlign: "center", padding: "clamp(80px,12vw,140px) clamp(20px,4vw,48px) clamp(60px,8vw,100px)", position: "relative", overflow: "hidden" }}>
        {/* Glow */}
        <div style={{ position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)", width: 800, height: 400, background: "radial-gradient(ellipse,rgba(201,166,107,0.07),transparent 70%)", pointerEvents: "none" }}/>

        {/* Trophy */}
        <div className="float" style={{ fontSize: 80, marginBottom: 32, lineHeight: 1 }}>🏆</div>

        <div className="fade-up" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 20px", background: "rgba(201,166,107,0.1)", border: "1px solid rgba(201,166,107,0.25)", borderRadius: 100, fontSize: 12, fontWeight: 700, color: GOLD, marginBottom: 24, letterSpacing: "0.12em", textTransform: "uppercase" }}>
          ✦ COMING SOON
        </div>

        <h1 className="ph fade-up" style={{ fontSize: "clamp(48px,8vw,100px)", fontWeight: 500, color: TX, lineHeight: 0.95, marginBottom: 24, animationDelay: "0.1s" }}>
          Fantasy<br/><span style={{ color: GOLD }}>League</span>
        </h1>

        <p className="fade-up" style={{ fontSize: "clamp(16px,1.8vw,20px)", color: TX2, maxWidth: 520, margin: "0 auto 48px", lineHeight: 1.8, animationDelay: "0.2s" }}>
          Stelle ein Team aus deinen wertvollsten Pokémon TCG Karten zusammen.<br/>
          Tritt gegen andere Sammler an. Gewinne echte Preise.
        </p>

        {/* Email signup */}
        <div className="fade-up" style={{ maxWidth: 520, margin: "0 auto", animationDelay: "0.3s" }}>
          {done ? (
            <div style={{ padding: "20px 32px", background: "rgba(201,166,107,0.08)", border: "1px solid rgba(201,166,107,0.25)", borderRadius: 100, fontSize: 15, color: GOLD, fontWeight: 600 }}>
              ✦ Du bist auf der Warteliste! Wir melden uns.
            </div>
          ) : (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <input className="email-input" type="email" placeholder="Deine E-Mail für Early Access" value={email} onChange={e => setEmail(e.target.value)}/>
              <button onClick={() => { if (email) setDone(true); }} className="btn-gold">
                Early Access ✦
              </button>
            </div>
          )}
          <p style={{ fontSize: 12, color: "rgba(201,166,107,0.4)", marginTop: 12 }}>
            Kein Spam. Nur Early Access wenn die Liga startet.
          </p>
        </div>
      </div>

      {/* How it works */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(20px,4vw,48px) clamp(60px,8vw,100px)" }}>
        <div style={{ width: "100%", height: 1, background: "linear-gradient(90deg,transparent,rgba(201,166,107,0.2),transparent)", marginBottom: 64 }}/>

        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: GD2, marginBottom: 16 }}>Spielprinzip</div>
          <h2 className="ph" style={{ fontSize: "clamp(32px,4vw,52px)", fontWeight: 500, color: TX }}>So funktioniert es</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16, marginBottom: 64 }}>
          {[
            { step: "01", icon: "◈", title: "Team zusammenstellen", desc: "Wähle 5 Pokémon TCG Karten aus deiner Sammlung oder dem Marktplatz. Budget: 500 €." },
            { step: "02", icon: "▲", title: "Punkte sammeln",        desc: "Karten bringen Punkte basierend auf Preissteigerung, Seltenheit und Community-Beliebtheit." },
            { step: "03", icon: "✦", title: "Rangliste erklimmen",   desc: "Wöchentliche Auswertung. Top 10 gewinnen Preise — Karten, Credits und mehr." },
          ].map(({ step, icon, title, desc }) => (
            <div key={step} className="feature-card">
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(201,166,107,0.4)", letterSpacing: "0.1em", marginTop: 4, flexShrink: 0, width: 24 }}>{step}</div>
                <div>
                  <div style={{ fontSize: 24, color: GOLD, marginBottom: 12 }}>{icon}</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: TX, marginBottom: 8 }}>{title}</div>
                  <div style={{ fontSize: 14, color: TX2, lineHeight: 1.7 }}>{desc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Prizes */}
        <div style={{ background: BG2, borderRadius: 32, padding: "clamp(40px,5vw,64px)", border: "1px solid rgba(201,166,107,0.15)", position: "relative", overflow: "hidden", marginBottom: 64 }}>
          <div style={{ position: "absolute", top: 0, left: "15%", right: "15%", height: 1, background: "linear-gradient(90deg,transparent,rgba(201,166,107,0.4),transparent)" }}/>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: GD2, marginBottom: 16 }}>Preise</div>
            <h2 className="ph" style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 500, color: TX }}>Jeden Monat zu gewinnen</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, overflow: "hidden", borderRadius: 16, border: "1px solid rgba(201,166,107,0.1)" }}>
            {[
              { place: "🥇", rank: "1. Platz", prize: "100 €", sub: "pokédax Credits", bg: "rgba(201,166,107,0.1)" },
              { place: "🥈", rank: "2. Platz", prize: "50 €",  sub: "pokédax Credits", bg: "rgba(255,255,255,0.04)" },
              { place: "🥉", rank: "3. Platz", prize: "25 €",  sub: "pokédax Credits", bg: "rgba(255,255,255,0.03)" },
            ].map(({ place, rank, prize, sub, bg }) => (
              <div key={rank} style={{ background: bg, padding: "28px 20px", textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{place}</div>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: GD2, marginBottom: 4 }}>{rank}</div>
                <div className="ph" style={{ fontSize: 28, fontWeight: 500, color: GOLD, marginBottom: 4 }}>{prize}</div>
                <div style={{ fontSize: 12, color: TX2 }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* My teams (if logged in) */}
        {user && !loading && teams.length > 0 && (
          <div>
            <div style={{ width: "100%", height: 1, background: "linear-gradient(90deg,transparent,rgba(201,166,107,0.2),transparent)", marginBottom: 40 }}/>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: GD2, marginBottom: 20 }}>Deine Teams</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {teams.map((team: any) => {
                const picks = team.fantasy_picks ?? [];
                return (
                  <div key={team.id} className="team-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 600, color: TX }}>{team.name}</div>
                        <div style={{ fontSize: 12, color: GD2 }}>Rang #{team.rank ?? "–"} · {team.total_score ?? 0} Punkte</div>
                      </div>
                      <div className="ph" style={{ fontSize: 28, fontWeight: 500, color: GOLD }}>{team.total_score ?? 0} pts</div>
                    </div>
                    {picks.length > 0 && (
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {picks.slice(0,5).map((p: any) => {
                          const card = Array.isArray(p.cards) ? p.cards[0] : p.cards;
                          const img  = card?.image_url?.includes(".") ? card.image_url : (card?.image_url ? card.image_url + "/low.webp" : null);
                          return (
                            <div key={p.id} className="pick-img">
                              {img && <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }}/>}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <div style={{ textAlign: "center", marginTop: 64 }}>
          {!done ? (
            <>
              <p style={{ fontSize: 16, color: TX2, marginBottom: 24 }}>Sei dabei wenn die Fantasy League startet.</p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <button onClick={() => setDone(true)} className="btn-gold">Early Access sichern ✦</button>
                <Link href="/preischeck" className="btn-outline">Karten entdecken</Link>
              </div>
            </>
          ) : (
            <div style={{ fontSize: 18, color: GOLD, fontWeight: 600 }}>✦ Du bist dabei! Wir melden uns bald.</div>
          )}
        </div>
      </div>
    </div>
  );
}
