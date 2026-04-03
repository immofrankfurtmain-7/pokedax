"use client";
import { useEffect, useState } from "react";

interface TickerCard { name: string; price: number; change: number; set: string; }

const FALLBACK: TickerCard[] = [
  { name:"Glurak ex",      price:189.90, change:+12.4, set:"SV01"   },
  { name:"Mewtu ex",       price:245.00, change:+5.7,  set:"MEW"    },
  { name:"Umbreon ex",     price:134.50, change:+8.2,  set:"SV08.5" },
  { name:"Pikachu ex",     price:67.20,  change:-3.1,  set:"SV09"   },
  { name:"Lugia ex",       price:312.00, change:+18.3, set:"SV04"   },
  { name:"Gardevoir ex",   price:54.60,  change:+6.9,  set:"SV02"   },
  { name:"Giratina VSTAR", price:76.30,  change:-2.4,  set:"SV00"   },
  { name:"Mew ex",         price:156.80, change:+11.1, set:"MEW"    },
  { name:"Rayquaza ex",    price:98.40,  change:-1.8,  set:"SV07"   },
  { name:"Dragonite ex",   price:312.00, change:+18.3, set:"OBF"    },
];

function Item({ card }: { card: TickerCard }) {
  const up = card.change >= 0;
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:9,
      padding:"0 22px",
      borderRight:"1px solid rgba(233,168,75,0.08)",
      whiteSpace:"nowrap", flexShrink:0,
    }}>
      {/* Name */}
      <span style={{
        fontSize:11, fontWeight:400, letterSpacing:"-.005em",
        color:"rgba(233,168,75,0.85)",
        fontFamily:"var(--font-body)",
      }}>{card.name}</span>
      {/* Set */}
      <span style={{
        fontSize:9, fontWeight:600, letterSpacing:".08em",
        color:"rgba(233,168,75,0.30)",
      }}>{card.set}</span>
      {/* Price */}
      <span style={{
        fontSize:11, fontWeight:500, letterSpacing:"-.01em",
        color:"rgba(233,168,75,0.95)",
        fontFamily:"var(--font-mono)",
      }}>{card.price.toLocaleString("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2})} €</span>
      {/* Change */}
      <span style={{
        fontSize:10, fontWeight:600,
        color: up ? "rgba(233,168,75,0.6)" : "rgba(233,168,75,0.35)",
        letterSpacing:"-.005em",
      }}>
        {up ? "▲" : "▼"} {up ? "+" : ""}{card.change.toFixed(1)} %
      </span>
    </span>
  );
}

export default function PriceTicker() {
  const [cards, setCards] = useState<TickerCard[]>(FALLBACK);

  useEffect(() => {
    fetch("/api/stats/ticker")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.cards?.length) setCards(d.cards); })
      .catch(() => {});
  }, []);

  const items = [...cards, ...cards, ...cards];

  return (
    <div style={{
      height:28, overflow:"hidden",
      background:"rgba(233,168,75,0.02)",
      borderTop:"1px solid rgba(233,168,75,0.06)",
      borderBottom:"1px solid rgba(233,168,75,0.06)",
      borderRadius:"0 0 14px 14px",
      marginTop:1,
      display:"flex", alignItems:"center",
    }}>
      {/* Live badge */}
      <div style={{
        height:"100%", padding:"0 16px", flexShrink:0,
        display:"flex", alignItems:"center", gap:7,
        borderRight:"1px solid rgba(233,168,75,0.1)",
      }}>
        <div style={{
          width:4, height:4, borderRadius:"50%",
          background:"var(--gold)",
          animation:"blink 2s ease-in-out infinite",
        }}/>
        <span style={{
          fontSize:8.5, fontWeight:700, letterSpacing:".15em",
          textTransform:"uppercase", color:"var(--gold)",
        }}>Live</span>
      </div>
      {/* Scrolling track */}
      <div style={{
        display:"flex", overflow:"hidden", flex:1,
        maskImage:"linear-gradient(90deg,transparent 0%,black 3%,black 97%,transparent 100%)",
        WebkitMaskImage:"linear-gradient(90deg,transparent 0%,black 3%,black 97%,transparent 100%)",
      }}>
        <div style={{
          display:"flex",
          animation:"ticker-scroll 36s linear infinite",
        }}>
          {items.map((c,i) => <Item key={i} card={c}/>)}
        </div>
      </div>
    </div>
  );
}
