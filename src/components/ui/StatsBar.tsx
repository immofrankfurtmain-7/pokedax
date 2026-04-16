"use client";

import { useEffect, useState, useRef } from "react";

interface Stats {
  cards_count: number;
  users_count: number;
  forum_posts: number;
  scans_today: number;
}

function useCountUp(target: number, duration = 1500) {
  const [current, setCurrent] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (target === 0) return;
    const start    = performance.now();
    const startVal = 0;

    function tick(now: number) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(startVal + (target - startVal) * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return current;
}

function StatItem({
  value, label, delay = 0
}: { value: number; label: string; delay?: number }) {
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  const count = useCountUp(started ? value : 0, 1800);

  return (
    <div style={{
      flex: "1 1 120px", padding: "18px 16px", textAlign: "center",
      borderRight: "1px solid rgba(255,255,255,0.07)",
    }}>
      <div style={{
        fontFamily: "Poppins, sans-serif", fontWeight: 900, fontSize: 22,
        color: "#F8FAFC", letterSpacing: "-0.02em",
      }}>
        {count.toLocaleString("de-DE")}
      </div>
      <div style={{
        fontSize: 10, fontWeight: 600, color: "#475569",
        textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 3,
      }}>
        {label}
      </div>
    </div>
  );
}

export default function StatsBar() {
  const [stats,   setStats]   = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then(r => r.json())
      .then(d => { setStats(d); setLoading(false); })
      .catch(() => {
        // Fallback
        setStats({ cards_count: 22271, users_count: 0, forum_posts: 0, scans_today: 0 });
        setLoading(false);
      });
  }, []);

  const ITEMS = stats ? [
    { value: stats.cards_count, label: "Karten in DB"   },
    { value: stats.users_count, label: "Aktive Nutzer"  },
    { value: stats.scans_today, label: "Scans heute"    },
    { value: stats.forum_posts, label: "Forum-Posts"    },
  ] : [
    { value: 0, label: "Karten in DB"  },
    { value: 0, label: "Aktive Nutzer" },
    { value: 0, label: "Scans heute"   },
    { value: 0, label: "Forum-Posts"   },
  ];

  return (
    <div style={{
      display: "flex", flexWrap: "wrap", justifyContent: "center",
      border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16,
      overflow: "hidden", background: "rgba(17,17,17,0.85)",
      maxWidth: 640, margin: "0 auto",
    }}>
      {ITEMS.map((item, i) => (
        <div key={item.label} style={{
          flex: "1 1 120px", padding: "18px 16px", textAlign: "center",
          borderRight: i < ITEMS.length - 1 ? "1px solid rgba(255,255,255,0.07)" : "none",
        }}>
          {loading ? (
            <div style={{ height: 22, width: 60, borderRadius: 4, background: "rgba(255,255,255,0.08)", margin: "0 auto 6px", animation: "pulse 1.5s infinite" }} />
          ) : (
            <StatItem value={item.value} label={item.label} delay={i * 150} />
          )}
          {loading && (
            <div style={{ fontSize: 10, fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {item.label}
            </div>
          )}
        </div>
      ))}
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </div>
  );
}
