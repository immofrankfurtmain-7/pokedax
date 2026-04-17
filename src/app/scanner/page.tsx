"use client";
import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const GOLD = "#C9A66B";
const BG   = "#0A0A0A";
const BG2  = "#111111";
const BG3  = "#1A1A1A";
const TX   = "#EDE9E0";
const TX2  = "rgba(237,233,224,0.7)";
const GD2  = "rgba(201,166,107,0.7)";
const GD3  = "rgba(201,166,107,0.25)";
const GD4  = "rgba(201,166,107,0.1)";

const SB = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ScanResult {
  status: string;
  card?: {
    id: string; name: string; name_en: string; set_id: string;
    number: string; image_url: string | null; price_market: number | null;
    price_low: number | null; rarity: string | null; hp: string | null; scan_count: number;
  };
  confidence: number;
  error?: string; message?: string;
}

interface WishlistMatch {
  id: string;
  max_price: number | null;
  profiles: { username: string } | null;
}

export default function ScannerPage() {
  const [preview,  setPreview]  = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result,   setResult]   = useState<ScanResult | null>(null);
  const [matches,  setMatches]  = useState<WishlistMatch[]>([]);
  const [error,    setError]    = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [added,    setAdded]    = useState(false);
  const [scanCount, setScanCount] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setError(null); setResult(null); setAdded(false); setMatches([]);
    setScanning(true);

    const reader = new FileReader();
    reader.onload = e => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    const base64 = await new Promise<string>((res, rej) => {
      const r = new FileReader();
      r.onload  = () => res((r.result as string).split(",")[1]);
      r.onerror = rej;
      r.readAsDataURL(file);
    });

    try {
      const { data: { session } } = await SB.auth.getSession();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (session?.access_token) headers["Authorization"] = `Bearer ${session.access_token}`;

      // Check scan count for free users
      if (session?.user) {
        const today = new Date().toISOString().split("T")[0];
        const { count } = await SB.from("scan_logs")
          .select("id", { count: "exact", head: true })
          .eq("user_id", session.user.id)
          .gte("created_at", today + "T00:00:00Z");
        setScanCount(count ?? 0);
      }

      const res = await fetch("/api/scanner/scan", {
        method: "POST", headers,
        body: JSON.stringify({ imageBase64: base64, mimeType: file.type || "image/jpeg" }),
      });
      const data: ScanResult = await res.json();

      if (res.status === 429) {
        setError("Tageslimit von 5 Scans erreicht. Upgrade auf Premium für unlimitierte Scans.");
      } else if (!res.ok || data.error) {
        setError(data.message ?? "Karte konnte nicht erkannt werden. Bitte klareres Foto versuchen.");
      } else {
        setResult(data);
        // Check wishlist matches
        if (data.card?.id) {
          const { data: wm } = await SB
            .from("user_wishlist")
            .select("id, max_price, profiles!user_wishlist_user_id_fkey(username)")
            .eq("card_id", data.card.id)
            .limit(5);
          if (wm?.length) {
            setMatches(wm.map((m: any) => ({
              ...m,
              profiles: Array.isArray(m.profiles) ? m.profiles[0] : m.profiles,
            })));
          }
        }
      }
    } catch {
      setError("Verbindungsfehler. Bitte erneut versuchen.");
    }
    setScanning(false);
  }, []);

  async function addToPortfolio() {
    if (!result?.card) return;
    try {
      const { data: { user } } = await SB.auth.getUser();
      if (!user) { window.location.href = "/auth/login"; return; }
      await SB.from("user_collection").upsert(
        { user_id: user.id, card_id: result.card.id, quantity: 1, condition: "NM" },
        { onConflict: "user_id,card_id" }
      );
      setAdded(true);
    } catch { setError("Fehler beim Hinzufügen zum Portfolio."); }
  }

  const card   = result?.card;
  const imgSrc = card?.image_url
    ? (card.image_url.includes(".") ? card.image_url : card.image_url + "/high.webp")
    : null;

  return (
    <div style={{ background: BG, minHeight: "100vh", color: TX }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;700&family=Instrument+Sans:wght@400;500;600&display=swap');
        .ph { font-family: 'Playfair Display', serif; letter-spacing: -0.05em; }
        .upload-zone { border: 1.5px dashed rgba(201,166,107,0.3); border-radius: 20px; transition: border-color 0.2s, background 0.2s; cursor: pointer; }
        .upload-zone:hover, .upload-zone.drag { border-color: #C9A66B; background: rgba(201,166,107,0.04); }
        .btn-gold { display:inline-flex; align-items:center; gap:8px; padding:14px 28px; background:#C9A66B; color:#0A0A0A; border-radius:100px; border:none; font-size:14px; font-weight:600; cursor:pointer; text-decoration:none; transition:transform 0.2s,box-shadow 0.2s; }
        .btn-gold:hover { transform:scale(1.03); box-shadow:0 8px 32px rgba(201,166,107,0.35); }
        .btn-outline { display:inline-flex; align-items:center; gap:8px; padding:13px 24px; border:1px solid rgba(201,166,107,0.4); color:#C9A66B; border-radius:100px; background:transparent; font-size:14px; cursor:pointer; text-decoration:none; transition:all 0.2s; }
        .btn-outline:hover { background:#C9A66B; color:#0A0A0A; }
        .match-card { background:#111111; border:1px solid rgba(201,166,107,0.2); border-radius:16px; padding:16px 20px; display:flex; align-items:center; justify-content:space-between; gap:12px; transition:border-color 0.2s; }
        .match-card:hover { border-color:rgba(201,166,107,0.4); }
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both; }
        .scan-line { position:absolute; left:0; right:0; height:2px; background:linear-gradient(90deg,transparent,rgba(201,166,107,0.6),transparent); animation:scanMove 1.5s ease-in-out infinite; }
        @keyframes scanMove { 0%{top:10%} 100%{top:90%} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(60px,8vw,100px) clamp(20px,4vw,48px)" }}>

        {/* Header */}
        <div style={{ marginBottom: 64 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: GD2, marginBottom: 16 }}>
            KI-Scanner
          </div>
          <h1 className="ph" style={{ fontSize: "clamp(40px,6vw,80px)", fontWeight: 500, color: TX, marginBottom: 16, lineHeight: 1 }}>
            Karte fotografieren.<br/><span style={{ color: GOLD }}>Wert sofort sehen.</span>
          </h1>
          <p style={{ fontSize: 16, color: TX2, maxWidth: 480 }}>
            Powered by Gemini AI · Erkennt jede Pokémon-Karte in Sekunden
          </p>
          {scanCount !== null && scanCount >= 3 && (
            <div style={{ marginTop: 16, padding: "10px 18px", background: "rgba(201,166,107,0.08)", border: "1px solid rgba(201,166,107,0.2)", borderRadius: 100, display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, color: GOLD }}>
              ✦ {5 - scanCount} von 5 Gratis-Scans übrig · <Link href="/dashboard/premium" style={{ color: GOLD, fontWeight: 600 }}>Premium für ∞</Link>
            </div>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: card ? "1fr 1fr" : "1fr", gap: 48, maxWidth: card ? "100%" : 560, alignItems: "start" }}>

          {/* Upload Zone */}
          <div>
            <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }}
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />

            <div
              className={`upload-zone${dragging ? " drag" : ""}`}
              onClick={() => !scanning && inputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); e.dataTransfer.files[0] && handleFile(e.dataTransfer.files[0]); }}
              style={{
                aspectRatio: preview ? "3/4" : "4/3",
                display: "flex", alignItems: "center", justifyContent: "center",
                overflow: "hidden", position: "relative",
                background: preview ? "transparent" : BG2,
              }}
            >
              {preview ? (
                <img src={preview} alt="Vorschau" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              ) : (
                <div style={{ textAlign: "center", padding: 40 }}>
                  <div style={{ fontSize: 56, color: GOLD, opacity: 0.3, marginBottom: 20 }}>⊙</div>
                  <div style={{ fontSize: 17, fontWeight: 500, color: TX, marginBottom: 8 }}>Karte hochladen</div>
                  <div style={{ fontSize: 13, color: TX2 }}>Drag & Drop oder klicken</div>
                  <div style={{ fontSize: 11, color: "rgba(237,233,224,0.4)", marginTop: 8 }}>JPG, PNG, HEIC</div>
                </div>
              )}

              {/* Scanning overlay */}
              {scanning && (
                <div style={{ position: "absolute", inset: 0, background: "rgba(10,10,10,0.85)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
                  <div className="scan-line"/>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", border: "2px solid rgba(201,166,107,0.2)", borderTopColor: GOLD, animation: "spin 0.8s linear infinite" }}/>
                  <div style={{ fontSize: 14, color: GD2, letterSpacing: "0.1em" }}>Analysiere Karte…</div>
                </div>
              )}
            </div>

            <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
              <button onClick={() => inputRef.current?.click()} disabled={scanning} className="btn-gold"
                style={{ flex: 1, justifyContent: "center", opacity: scanning ? 0.5 : 1 }}>
                {scanning ? "Analysiere…" : preview ? "Neues Foto" : "Foto auswählen"}
              </button>
              {preview && !scanning && (
                <button onClick={() => { setPreview(null); setResult(null); setError(null); setMatches([]); }}
                  className="btn-outline" style={{ padding: "13px 20px" }}>✕</button>
              )}
            </div>

            {error && (
              <div style={{ marginTop: 16, padding: "14px 18px", background: "rgba(220,74,90,0.08)", border: "1px solid rgba(220,74,90,0.2)", borderRadius: 12, fontSize: 13, color: "#dc4a5a" }}>
                {error}
              </div>
            )}
          </div>

          {/* Result */}
          {card && (
            <div className="fade-up">
              {/* Card display */}
              <div style={{
                background: BG2, borderRadius: 24, overflow: "hidden",
                border: "1px solid rgba(201,166,107,0.2)",
                boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
                marginBottom: 28,
              }}>
                {/* Image */}
                <div style={{ background: BG3, padding: "24px 24px 0", display: "flex", justifyContent: "center" }}>
                  <div style={{ width: "60%", aspectRatio: "3/4", position: "relative" }}>
                    {imgSrc ? (
                      <img src={imgSrc} alt={card.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, opacity: 0.2 }}>◎</div>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div style={{ padding: "24px 28px 28px" }}>
                  {/* Confidence badge */}
                  <div style={{ marginBottom: 12 }}>
                    <span style={{ padding: "3px 12px", borderRadius: 100, background: "rgba(201,166,107,0.1)", color: GOLD, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", border: "1px solid rgba(201,166,107,0.2)" }}>
                      ✓ ERKANNT · {result?.confidence ?? 0}% Konfidenz
                    </span>
                  </div>

                  <h2 className="ph" style={{ fontSize: "clamp(22px,3vw,32px)", fontWeight: 500, color: TX, marginBottom: 6 }}>
                    {card.name}
                  </h2>
                  <div style={{ fontSize: 12, color: TX2, marginBottom: 20, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    {card.set_id?.toUpperCase()} · #{card.number}{card.rarity ? ` · ${card.rarity}` : ""}
                  </div>

                  {card.price_market && (
                    <div style={{ marginBottom: 24 }}>
                      <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: GD2, marginBottom: 6 }}>Marktwert</div>
                      <div className="ph" style={{ fontSize: "clamp(32px,4vw,48px)", fontWeight: 500, color: GOLD, lineHeight: 1 }}>
                        {card.price_market.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €
                      </div>
                      {card.price_low && (
                        <div style={{ fontSize: 13, color: TX2, marginTop: 4 }}>
                          Ab {card.price_low.toLocaleString("de-DE", { minimumFractionDigits: 2 })} € verfügbar
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <Link href={`/preischeck/${card.id}`} className="btn-gold" style={{ justifyContent: "center" }}>
                      Kartendetails ansehen
                    </Link>
                    <button onClick={addToPortfolio} disabled={added} style={{
                      padding: "13px 24px", borderRadius: 100, border: "1px solid rgba(201,166,107,0.3)",
                      background: added ? "rgba(201,166,107,0.1)" : "transparent",
                      color: added ? GOLD : TX2, fontSize: 14, cursor: added ? "default" : "pointer",
                      transition: "all 0.2s",
                    }}>
                      {added ? "✓ Portfolio hinzugefügt" : "+ Zu meiner Sammlung"}
                    </button>
                    <Link href={`/marketplace?sell=${card.id}`} style={{
                      padding: "13px 24px", borderRadius: 100, border: "1px solid rgba(255,255,255,0.1)",
                      color: TX2, fontSize: 14, textDecoration: "none", textAlign: "center",
                      transition: "all 0.2s",
                    }}>
                      Auf Marktplatz inserieren →
                    </Link>
                  </div>
                </div>
              </div>

              {/* Wishlist Matches */}
              {matches.length > 0 && (
                <div style={{ background: BG2, borderRadius: 20, border: "1px solid rgba(201,166,107,0.3)", overflow: "hidden", boxShadow: "0 0 0 1px rgba(201,166,107,0.1)" }}>
                  {/* Top gold line */}
                  <div style={{ height: 1, background: "linear-gradient(90deg,transparent,rgba(201,166,107,0.5),transparent)" }}/>
                  <div style={{ padding: "20px 24px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                      <span style={{ fontSize: 18, color: GOLD }}>✦</span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: TX }}>
                          {matches.length} {matches.length === 1 ? "Sammler sucht" : "Sammler suchen"} diese Karte!
                        </div>
                        <div style={{ fontSize: 12, color: TX2 }}>Direkt verkaufen zum Wunschpreis</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {matches.map(m => (
                        <div key={m.id} className="match-card">
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: TX }}>@{m.profiles?.username ?? "Sammler"}</div>
                            {m.max_price && (
                              <div style={{ fontSize: 12, color: GD2 }}>
                                Zahlt bis {m.max_price.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €
                              </div>
                            )}
                          </div>
                          <Link href={`/marketplace?sell=${card.id}`} className="btn-gold" style={{ padding: "10px 20px", fontSize: 13 }}>
                            Verkaufen ✦
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
