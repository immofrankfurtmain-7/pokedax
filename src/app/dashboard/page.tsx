"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  TrendingUp, TrendingDown, Heart, Package,
  Bell, Crown, Settings, ExternalLink, Plus
} from "lucide-react";

interface Profile {
  id: string; username: string; avatar_url?: string;
  is_premium: boolean; created_at: string;
}
interface CollectionCard {
  id: string; quantity: number;
  cards: { name: string; name_de?: string; image_url?: string; price_market?: number; set_id: string; number: string; };
}
interface WishlistCard {
  id: string;
  cards: { name: string; name_de?: string; image_url?: string; price_market?: number; set_id: string; number: string; };
}

const STAT_CARDS = [
  { key: "portfolio",  label: "Portfolio-Wert",   color: "#FACC15", icon: <TrendingUp size={18}/> },
  { key: "cards",      label: "Karten",            color: "#00E5FF", icon: <Package size={18}/>    },
  { key: "wishlist",   label: "Wunschliste",       color: "#A855F7", icon: <Heart size={18}/>      },
  { key: "scans",      label: "Scans heute",       color: "#22C55E", icon: <Bell size={18}/>       },
];

export default function DashboardPage() {
  const [profile,    setProfile]    = useState<Profile | null>(null);
  const [collection, setCollection] = useState<CollectionCard[]>([]);
  const [wishlist,   setWishlist]   = useState<WishlistCard[]>([]);
  const [scansToday, setScansToday] = useState(0);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    const sb = createClient();
    sb.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setLoading(false); return; }

      const [profRes, colRes, wishRes, scanRes] = await Promise.all([
        sb.from("profiles").select("*").eq("id", user.id).single(),
        sb.from("user_collection")
          .select("id, quantity, cards(name, name_de, image_url, price_market, set_id, number)")
          .eq("user_id", user.id).limit(12),
        sb.from("user_wishlist")
          .select("id, cards(name, name_de, image_url, price_market, set_id, number)")
          .eq("user_id", user.id).limit(8),
        sb.from("scan_logs")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .gte("created_at", new Date().toISOString().split("T")[0]),
      ]);

      if (profRes.data)  setProfile(profRes.data);
      if (colRes.data)   setCollection(colRes.data as any);
      if (wishRes.data)  setWishlist(wishRes.data as any);
      if (scanRes.count) setScansToday(scanRes.count);
      setLoading(false);
    });
  }, []);

  const portfolioValue = collection.reduce((sum, c) => {
    return sum + (c.cards?.price_market || 0) * (c.quantity || 1);
  }, 0);

  const stats = {
    portfolio: `${portfolioValue.toFixed(0)}€`,
    cards:     collection.length.toString(),
    wishlist:  wishlist.length.toString(),
    scans:     scansToday.toString(),
  };

  const accentColor = profile?.is_premium ? "#FACC15" : "#00E5FF";

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"60vh" }}>
      <div style={{ animation:"spin 1s linear infinite", width:40, height:40 }}>
        <svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#EE1515"/><path d="M2 20 A18 18 0 0 1 38 20Z" fill="white"/><rect x="2" y="18" width="36" height="4" fill="#111"/><circle cx="20" cy="20" r="6" fill="#111"/><circle cx="20" cy="20" r="3.5" fill="white"/></svg>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!profile) return (
    <div style={{ textAlign:"center", padding:"80px 20px", color:"white" }}>
      <p style={{ marginBottom:16, color:"rgba(255,255,255,0.4)" }}>Du bist nicht eingeloggt.</p>
      <Link href="/auth/login" style={{ padding:"10px 24px", borderRadius:12, background:"#EE1515", color:"white", textDecoration:"none", fontWeight:700 }}>Einloggen</Link>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", color:"white" }}>
      <div style={{ height:2, background:`linear-gradient(90deg,transparent,${accentColor},transparent)` }} />
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"32px 20px" }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:32, flexWrap:"wrap", gap:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.username}
                style={{ width:64, height:64, borderRadius:"50%", border:`3px solid ${accentColor}`, boxShadow:`0 0 20px ${accentColor}40` }} />
            ) : (
              <div style={{ width:64, height:64, borderRadius:"50%", background:`${accentColor}20`, border:`3px solid ${accentColor}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, fontWeight:900, color:accentColor, fontFamily:"Poppins,sans-serif" }}>
                {profile.username?.[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <h1 style={{ fontFamily:"Poppins,sans-serif", fontWeight:900, fontSize:24, letterSpacing:"-0.02em", marginBottom:4 }}>
                Hey, {profile.username}! 👋
              </h1>
              <div style={{ display:"flex", gap:8 }}>
                {profile.is_premium && (
                  <span style={{ display:"flex", alignItems:"center", gap:4, padding:"2px 10px", borderRadius:20, background:"rgba(250,204,21,0.15)", border:"1px solid rgba(250,204,21,0.3)", color:"#FACC15", fontSize:11, fontWeight:700 }}>
                    <Crown size={10}/> Premium
                  </span>
                )}
                <Link href={`/profil/${profile.username}`} style={{ display:"flex", alignItems:"center", gap:4, padding:"2px 10px", borderRadius:20, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)", color:"rgba(255,255,255,0.5)", fontSize:11, textDecoration:"none" }}>
                  <ExternalLink size={10}/> Öffentliches Profil
                </Link>
              </div>
            </div>
          </div>
          <Link href="/dashboard/settings" style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:10, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)", color:"rgba(255,255,255,0.6)", fontSize:13, fontWeight:600, textDecoration:"none" }}>
            <Settings size={14}/> Einstellungen
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:12, marginBottom:32 }}>
          {STAT_CARDS.map(s => (
            <div key={s.key} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, padding:"16px 18px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                <div style={{ width:32, height:32, borderRadius:8, background:`${s.color}15`, border:`1px solid ${s.color}25`, display:"flex", alignItems:"center", justifyContent:"center", color:s.color }}>
                  {s.icon}
                </div>
                <span style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,0.35)", textTransform:"uppercase", letterSpacing:"0.08em" }}>{s.label}</span>
              </div>
              <div style={{ fontFamily:"Poppins,sans-serif", fontWeight:900, fontSize:28, color:s.color, letterSpacing:"-0.02em" }}>
                {stats[s.key as keyof typeof stats]}
              </div>
            </div>
          ))}
        </div>

        {/* Premium CTA if not premium */}
        {!profile.is_premium && (
          <div style={{ background:"linear-gradient(135deg,rgba(250,204,21,0.08),rgba(255,255,255,0.02))", border:"1px solid rgba(250,204,21,0.25)", borderRadius:16, padding:"16px 20px", marginBottom:24, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
            <div>
              <p style={{ fontFamily:"Poppins,sans-serif", fontWeight:700, fontSize:15, color:"white", marginBottom:2 }}>Upgrade auf Premium</p>
              <p style={{ fontSize:12, color:"rgba(255,255,255,0.4)" }}>Unlimitierter Scanner, Portfolio-Charts, Preis-Alerts und mehr</p>
            </div>
            <Link href="/dashboard/premium" style={{ padding:"9px 20px", borderRadius:10, background:"linear-gradient(135deg,#FACC15,#f59e0b)", color:"#000", fontFamily:"Poppins,sans-serif", fontWeight:800, fontSize:13, textDecoration:"none", whiteSpace:"nowrap" }}>
              👑 6,99€/Mo
            </Link>
          </div>
        )}

        {/* Collection */}
        <div style={{ marginBottom:28 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
            <h2 style={{ fontFamily:"Poppins,sans-serif", fontWeight:800, fontSize:18, color:"white" }}>
              🃏 Meine Sammlung
            </h2>
            <Link href="/preischeck" style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 12px", borderRadius:8, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.5)", fontSize:12, textDecoration:"none" }}>
              <Plus size={12}/> Karte hinzufügen
            </Link>
          </div>

          {collection.length === 0 ? (
            <div style={{ textAlign:"center", padding:"32px 0", border:"1px dashed rgba(255,255,255,0.1)", borderRadius:16 }}>
              <div style={{ fontSize:36, marginBottom:10 }}>🃏</div>
              <p style={{ color:"rgba(255,255,255,0.3)", fontSize:14 }}>Noch keine Karten in deiner Sammlung</p>
              <Link href="/preischeck" style={{ display:"inline-block", marginTop:12, padding:"8px 20px", borderRadius:10, background:"#EE1515", color:"white", textDecoration:"none", fontSize:13, fontWeight:700 }}>
                Karten suchen
              </Link>
            </div>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(110px,1fr))", gap:10 }}>
              {collection.map(c => {
                const card = c.cards;
                const imgUrl = card?.image_url || `https://assets.tcgdex.net/en/${card?.set_id}/${card?.number}/low.webp`;
                return (
                  <div key={c.id} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, overflow:"hidden" }}>
                    <img src={imgUrl} alt={card?.name_de || card?.name}
                      style={{ width:"100%", aspectRatio:"2.5/3.5", objectFit:"contain", padding:4 }}
                      onError={e => { (e.target as HTMLImageElement).style.opacity="0.2"; }}
                    />
                    <div style={{ padding:"6px 8px" }}>
                      <p style={{ fontSize:10, fontWeight:700, color:"white", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {card?.name_de || card?.name}
                      </p>
                      <div style={{ display:"flex", justifyContent:"space-between" }}>
                        <span style={{ fontSize:9, color:"rgba(255,255,255,0.3)" }}>×{c.quantity}</span>
                        {card?.price_market && <span style={{ fontSize:9, color:"#00E5FF", fontWeight:700 }}>{card.price_market.toFixed(2)}€</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Wishlist */}
        <div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
            <h2 style={{ fontFamily:"Poppins,sans-serif", fontWeight:800, fontSize:18, color:"white" }}>
              ❤️ Wunschliste
            </h2>
          </div>

          {wishlist.length === 0 ? (
            <div style={{ textAlign:"center", padding:"24px 0", border:"1px dashed rgba(255,255,255,0.08)", borderRadius:16 }}>
              <p style={{ color:"rgba(255,255,255,0.25)", fontSize:13 }}>Noch keine Karten auf der Wunschliste</p>
            </div>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(110px,1fr))", gap:10 }}>
              {wishlist.map(w => {
                const card = w.cards;
                const imgUrl = card?.image_url || `https://assets.tcgdex.net/en/${card?.set_id}/${card?.number}/low.webp`;
                return (
                  <div key={w.id} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(168,85,247,0.2)", borderRadius:12, overflow:"hidden" }}>
                    <img src={imgUrl} alt={card?.name}
                      style={{ width:"100%", aspectRatio:"2.5/3.5", objectFit:"contain", padding:4 }}
                      onError={e => { (e.target as HTMLImageElement).style.opacity="0.2"; }}
                    />
                    <div style={{ padding:"6px 8px" }}>
                      <p style={{ fontSize:10, fontWeight:700, color:"white", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {card?.name_de || card?.name}
                      </p>
                      {card?.price_market && <span style={{ fontSize:9, color:"#A855F7", fontWeight:700 }}>{card.price_market.toFixed(2)}€</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
