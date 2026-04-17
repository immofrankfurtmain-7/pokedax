"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const SB = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"portfolio"|"trades"|"scans">("portfolio");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        if (tab === "trades") {
          const { data } = await SB.from("seller_stats")
            .select("user_id,total_sales,total_volume,avg_rating,profiles!seller_stats_user_id_fkey(username,avatar_url)")
            .order("total_volume", { ascending: false }).limit(20);
          setLeaders((data ?? []).map((d:any) => ({ ...d, profiles: Array.isArray(d.profiles)?d.profiles[0]:d.profiles })));
        } else if (tab === "scans") {
          const { data } = await SB.from("profiles")
            .select("id,username,scan_count").order("scan_count", { ascending: false }).limit(20);
          setLeaders(data ?? []);
        } else {
          const { data } = await SB.from("profiles")
            .select("id,username,avatar_url").limit(20);
          setLeaders(data ?? []);
        }
      } catch {}
      setLoading(false);
    }
    load();
  }, [tab]);

  const medals = ["🥇","🥈","🥉"];

  return (
    <div style={{ background:"#0A0A0A", minHeight:"100vh", color:"#EDE9E0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;700&display=swap');
        .ph { font-family:'Playfair Display',serif; letter-spacing:-0.05em; }
        .tab-btn { padding:10px 24px; border-radius:100px; border:1px solid transparent; font-size:13px; cursor:pointer; transition:all 0.2s; background:transparent; }
        .tab-btn.active { background:rgba(201,166,107,0.1); border-color:rgba(201,166,107,0.3); color:#C9A66B; font-weight:600; }
        .tab-btn:not(.active) { color:rgba(237,233,224,0.5); }
        .tab-btn:not(.active):hover { color:#EDE9E0; }
        .leader-row { display:flex; align-items:center; gap:16px; padding:16px 24px; background:#111111; border:1px solid rgba(255,255,255,0.06); border-radius:16px; transition:border-color 0.2s; }
        .leader-row:hover { border-color:rgba(201,166,107,0.2); }
        .leader-row.top3 { border-color:rgba(201,166,107,0.2); background:linear-gradient(135deg,rgba(201,166,107,0.06),#111111); }
        @keyframes skeleton { 0%,100%{opacity:.3} 50%{opacity:.6} }
      `}</style>

      <div style={{ maxWidth:800, margin:"0 auto", padding:"clamp(60px,8vw,100px) clamp(20px,4vw,48px)" }}>
        <div style={{ marginBottom:48 }}>
          <div style={{ fontSize:11, fontWeight:600, letterSpacing:"0.16em", textTransform:"uppercase", color:"rgba(201,166,107,0.7)", marginBottom:16 }}>Hall of Fame</div>
          <h1 className="ph" style={{ fontSize:"clamp(40px,6vw,72px)", fontWeight:500, color:"#EDE9E0", lineHeight:1 }}>
            Leaderboard
          </h1>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:8, marginBottom:40, flexWrap:"wrap" }}>
          {[["portfolio","Portfolio"],["trades","Händler"],["scans","Scanner"]].map(([v,l]) => (
            <button key={v} className={`tab-btn${tab===v?" active":""}`} onClick={() => setTab(v as any)}>{l}</button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {Array.from({length:8}).map((_,i) => (
              <div key={i} style={{ height:72, background:"#111", borderRadius:16, opacity:0.4, animation:"skeleton 1.5s ease-in-out infinite" }}/>
            ))}
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {leaders.map((l, i) => {
              const username = l.username || l.profiles?.username || "Anonym";
              const isTop3 = i < 3;
              return (
                <Link key={l.id||l.user_id||i} href={`/profil/${username}`} style={{ textDecoration:"none" }}>
                  <div className={`leader-row${isTop3?" top3":""}`}>
                    <div style={{ fontSize:isTop3?24:16, width:36, textAlign:"center", flexShrink:0 }}>
                      {isTop3 ? medals[i] : <span style={{ fontFamily:"monospace", color:"rgba(201,166,107,0.4)", fontSize:13 }}>#{i+1}</span>}
                    </div>
                    <div style={{ width:40, height:40, borderRadius:"50%", background:"rgba(201,166,107,0.1)", border:"1px solid rgba(201,166,107,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:700, color:"#C9A66B", flexShrink:0 }}>
                      {username[0]?.toUpperCase()}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:15, fontWeight:600, color:"#EDE9E0" }}>@{username}</div>
                      {tab==="trades" && l.total_volume && (
                        <div style={{ fontSize:12, color:"rgba(237,233,224,0.5)" }}>{l.total_sales} Verkäufe · {l.total_volume?.toFixed(0)} €</div>
                      )}
                      {tab==="scans" && l.scan_count && (
                        <div style={{ fontSize:12, color:"rgba(237,233,224,0.5)" }}>{l.scan_count} Scans</div>
                      )}
                    </div>
                    {isTop3 && (
                      <div style={{ fontSize:11, color:"#C9A66B", fontWeight:600, letterSpacing:"0.1em" }}>
                        {i===0?"CHAMPION":i===1?"VIZE":"BRONZE"}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
