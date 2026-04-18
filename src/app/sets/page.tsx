"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const SB = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function SetsPage() {
  const [sets,    setSets]    = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query,   setQuery]   = useState("");

  useEffect(() => {
    SB.from("sets")
      .select("id,name,name_de,series,card_count,release_date,logo_url,image_url,symbol_url")
      .order("release_date", { ascending: false }).limit(300)
      .then(({ data }) => { setSets(data ?? []); setLoading(false); });
  }, []);

  const grouped = sets
    .filter(s => !query || (s.name_de||s.name||"").toLowerCase().includes(query.toLowerCase()) || s.id.toLowerCase().includes(query.toLowerCase()))
    .reduce((acc: Record<string, any[]>, s: any) => {
      const series = s.series || "Sonstige";
      if (!acc[series]) acc[series] = [];
      acc[series].push(s);
      return acc;
    }, {});

  function getSetImage(set: any) {
    if (set.logo_url) return set.logo_url;
    if (set.image_url) return set.image_url;
    // TCGdex fallback
    return `https://assets.tcgdex.net/en/${set.id}/logo.png`;
  }

  return (
    <div style={{ background:"#0A0A0A", minHeight:"100vh", color:"#EDE9E0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;700&display=swap');
        .ph { font-family:'Playfair Display',serif; letter-spacing:-0.05em; }
        .set-card { background:#111111; border:1px solid rgba(255,255,255,0.07); border-radius:20px; overflow:hidden; text-decoration:none; display:block; transition:border-color 0.2s,transform 0.2s; }
        .set-card:hover { border-color:rgba(201,166,107,0.35); transform:translateY(-3px); }
        .search-input { width:100%; max-width:480px; padding:14px 20px 14px 48px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:100px; color:#EDE9E0; font-size:15px; outline:none; font-family:inherit; transition:border-color 0.2s; }
        .search-input:focus { border-color:rgba(201,166,107,0.4); }
        .search-input::placeholder { color:rgba(237,233,224,0.3); }
        @keyframes skeleton { 0%,100%{opacity:.3} 50%{opacity:.6} }
      `}</style>

      <div style={{ maxWidth:1600, margin:"0 auto", padding:"clamp(60px,8vw,100px) clamp(20px,4vw,48px)" }}>

        <div style={{ marginBottom:56 }}>
          <div style={{ fontSize:11, fontWeight:600, letterSpacing:"0.16em", textTransform:"uppercase", color:"rgba(201,166,107,0.7)", marginBottom:16 }}>Datenbank</div>
          <h1 className="ph" style={{ fontSize:"clamp(40px,6vw,80px)", fontWeight:500, color:"#EDE9E0", lineHeight:1, marginBottom:24 }}>
            {loading ? "…" : sets.length} Sets &<br/><span style={{ color:"#C9A66B" }}>Serien</span>
          </h1>
          <div style={{ position:"relative", display:"inline-block" }}>
            <span style={{ position:"absolute", left:18, top:"50%", transform:"translateY(-50%)", fontSize:16, color:"rgba(237,233,224,0.25)" }}>◎</span>
            <input className="search-input" placeholder="Set suchen…" value={query} onChange={e => setQuery(e.target.value)}/>
          </div>
        </div>

        {loading ? (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:12 }}>
            {Array.from({length:12}).map((_,i) => (
              <div key={i} style={{ height:120, background:"#111", borderRadius:20, opacity:0.4, animation:"skeleton 1.5s ease-in-out infinite" }}/>
            ))}
          </div>
        ) : (
          Object.entries(grouped).map(([series, seriesSets]) => (
            <div key={series} style={{ marginBottom:56 }}>
              <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:20 }}>
                <div style={{ fontSize:11, fontWeight:600, letterSpacing:"0.14em", textTransform:"uppercase", color:"rgba(201,166,107,0.7)" }}>{series}</div>
                <div style={{ flex:1, height:1, background:"linear-gradient(90deg,rgba(201,166,107,0.2),transparent)" }}/>
                <div style={{ fontSize:11, color:"rgba(237,233,224,0.3)" }}>{seriesSets.length} Sets</div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:10 }}>
                {seriesSets.map((set: any) => {
                  const imgSrc = getSetImage(set);
                  return (
                    <Link key={set.id} href={`/sets/${set.id}`} className="set-card">
                      {/* Set logo/image */}
                      <div style={{ background:"#1A1A1A", padding:"20px 24px", display:"flex", alignItems:"center", justifyContent:"center", minHeight:80 }}>
                        <img
                          src={imgSrc}
                          alt={set.name_de || set.name}
                          style={{ maxHeight:50, maxWidth:"100%", objectFit:"contain" }}
                          onError={(e) => {
                            const t = e.target as HTMLImageElement;
                            t.style.display = "none";
                            const parent = t.parentElement;
                            if (parent) {
                              parent.innerHTML = `<div style="font-size:9px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#C9A66B;opacity:0.6">${set.id.toUpperCase()}</div>`;
                            }
                          }}
                        />
                      </div>
                      <div style={{ padding:"14px 18px 16px", borderTop:"1px solid rgba(255,255,255,0.05)" }}>
                        <div style={{ fontSize:14, fontWeight:600, color:"#EDE9E0", marginBottom:4, lineHeight:1.3 }}>
                          {set.name_de || set.name}
                        </div>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                          {set.card_count && <div style={{ fontSize:11, color:"rgba(237,233,224,0.4)" }}>{set.card_count} Karten</div>}
                          {set.release_date && <div style={{ fontSize:10, color:"rgba(201,166,107,0.5)" }}>{new Date(set.release_date).getFullYear()}</div>}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
