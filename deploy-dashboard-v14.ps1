# PokeDax Dashboard Redesign v14
$root = "C:\Users\lenovo\pokedax\pokedax\pokedax"
$enc  = New-Object System.Text.UTF8Encoding $true
Write-Host "PokeDax Dashboard v14..." -ForegroundColor Cyan

$dirs = @(
  "$root\src\app\dashboard",
  "$root\src\components\ui",
  "$root\src\components\layout",
  "$root\src\components\forum",
  "$root\src\app"
)
foreach ($d in $dirs) {
  if (-not (Test-Path -LiteralPath $d)) { New-Item -ItemType Directory -Path $d -Force | Out-Null }
}


$dashboardPage = @'
import { createClient } from '@/lib/supabase/server'
import { Star, TrendingUp, TrendingDown, ArrowRight, Heart, LayoutDashboard, Folder, List, Bell, Crown } from 'lucide-react'
import Link from 'next/link'
import AvatarUpload from '@/components/ui/AvatarUpload'
import DashboardSparkline from '@/components/ui/DashboardSparkline'

export const dynamic = 'force-dynamic'

const NAV_LINKS = [
  { href: '/dashboard',           label: 'Dashboard', active: true  },
  { href: '/dashboard/portfolio', label: 'Portfolio',  active: false },
  { href: '/dashboard/wishlist',  label: 'Wishlists',  active: false },
  { href: '/dashboard/alerts',    label: 'Alerts',     active: false },
  { href: '/dashboard/premium',   label: 'Premium',    active: false, gold: true },
]

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user!.id).single()

  const { data: collectionWithPrices } = await supabase
    .from('user_collection')
    .select(`
      quantity, is_foil,
      cards (
        id, name, number, set_id, rarity, image_url,
        price_market, price_foil_market,
        price_avg1, price_avg7, price_avg30,
        price_foil_avg1, price_foil_avg7, price_foil_avg30
      )
    `)
    .eq('user_id', user!.id)

  // Wishlist preview
  const { data: wishlists } = await supabase
    .from('wishlists')
    .select('id, name, is_watchlist')
    .eq('user_id', user!.id)
    .limit(3)

  const { data: wishlistItems } = await supabase
    .from('wishlist_items')
    .select('wishlist_id, cards(id, name, image_url, price_market)')
    .in('wishlist_id', (wishlists || []).map(w => w.id))
    .limit(6)

  const portfolioValue = collectionWithPrices?.reduce((sum, item) => {
    const card = item.cards as any
    const price = item.is_foil
      ? (card?.price_foil_market ?? card?.price_market ?? 0)
      : (card?.price_market ?? 0)
    return sum + (price * (item.quantity ?? 1))
  }, 0) ?? 0

  const collectionCards = (collectionWithPrices ?? []).map(item => {
    const card = item.cards as any
    const isFoil = item.is_foil
    return {
      id:          card?.id ?? '',
      name:        card?.name ?? '',
      number:      card?.number ?? '',
      set_id:      card?.set_id ?? '',
      rarity:      card?.rarity ?? null,
      image_url:   card?.image_url ?? null,
      quantity:    item.quantity ?? 1,
      is_foil:     isFoil,
      price_market: isFoil ? (card?.price_foil_market ?? card?.price_market ?? null) : (card?.price_market ?? null),
      price_avg1:  isFoil ? (card?.price_foil_avg1  ?? card?.price_avg1  ?? null) : (card?.price_avg1  ?? null),
      price_avg7:  isFoil ? (card?.price_foil_avg7  ?? card?.price_avg7  ?? null) : (card?.price_avg7  ?? null),
      price_avg30: isFoil ? (card?.price_foil_avg30 ?? card?.price_avg30 ?? null) : (card?.price_avg30 ?? null),
    }
  })

  // Top 5 Karten nach Wert
  const topCards = [...collectionCards]
    .filter(c => c.price_market && c.price_market > 0)
    .sort((a, b) => (b.price_market! * b.quantity) - (a.price_market! * a.quantity))
    .slice(0, 5)

  // Sparkline data from avg30 → avg7 → avg1 trend
  const sparklineData = collectionCards
    .filter(c => c.price_avg30 && c.price_avg7 && c.price_avg1)
    .slice(0, 10)
    .map(c => ({
      avg30: (c.price_avg30! * c.quantity),
      avg7:  (c.price_avg7!  * c.quantity),
      avg1:  (c.price_avg1!  * c.quantity),
    }))
    .reduce(
      (acc, c) => ({
        avg30: acc.avg30 + c.avg30,
        avg7:  acc.avg7  + c.avg7,
        avg1:  acc.avg1  + c.avg1,
      }),
      { avg30: 0, avg7: 0, avg1: 0 }
    )

  const portfolioChange7d = sparklineData.avg7 > 0 && sparklineData.avg30 > 0
    ? ((sparklineData.avg7 - sparklineData.avg30) / sparklineData.avg30) * 100
    : 0

  const totalCards = collectionCards.length
  const isPremium  = profile?.is_premium ?? false
  const username   = profile?.username ?? user!.email?.split('@')[0] ?? 'Trainer'
  const roleColor  = profile?.forum_role === 'admin' ? '#EE1515'
    : profile?.forum_role === 'moderator' ? '#00E5FF'
    : isPremium ? '#FACC15'
    : 'rgba(255,255,255,0.4)'

  return (
    <div style={{ background: '#0A0A0A', minHeight: '100vh', color: 'white' }}>
      {/* Red top accent */}
      <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, #EE1515 30%, #EE1515 70%, transparent)' }} />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px' }}>

        {/* Sub-nav */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 28, flexWrap: 'wrap' }}>
          {NAV_LINKS.map(l => (
            <Link key={l.href} href={l.href} style={{
              padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              textDecoration: 'none',
              background: l.active ? '#EE1515' : l.gold ? 'rgba(250,204,21,0.08)' : 'rgba(255,255,255,0.04)',
              border: l.active ? 'none' : l.gold ? '1px solid rgba(250,204,21,0.25)' : '1px solid rgba(255,255,255,0.1)',
              color: l.active ? 'white' : l.gold ? '#FACC15' : 'rgba(255,255,255,0.5)',
            }}>{l.label}</Link>
          ))}
        </div>

        {/* ── HERO ROW: Avatar + Portfolio Value ── */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20,
        }} className="dashboard-hero-grid">

          {/* User card */}
          <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 20, padding: '24px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <AvatarUpload userId={user!.id} avatarUrl={profile?.avatar_url} username={username} size="lg" />
              <div>
                <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 22, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 2 }}>
                  Hey, <span style={{ color: '#EE1515' }}>{username}</span> 👋
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>{user!.email}</p>
                {isPremium ? (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 8, padding: '3px 10px', borderRadius: 20, background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.3)' }}>
                    <Star size={10} style={{ color: '#FACC15' }} />
                    <span style={{ fontSize: 10, fontWeight: 800, color: '#FACC15', letterSpacing: '0.08em' }}>PREMIUM AKTIV</span>
                  </div>
                ) : (
                  <Link href="/dashboard/premium" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 8, padding: '3px 10px', borderRadius: 20, background: 'rgba(250,204,21,0.06)', border: '1px solid rgba(250,204,21,0.15)', textDecoration: 'none', fontSize: 10, fontWeight: 700, color: '#FACC15' }}>
                    <Crown size={10} /> Premium freischalten
                  </Link>
                )}
              </div>
            </div>

            {/* Quick stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { label: 'Karten', value: totalCards.toString() },
                { label: 'Forum Posts', value: (profile?.post_count ?? 0).toString() },
              ].map(s => (
                <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '10px 14px' }}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>{s.label}</div>
                  <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 22, fontWeight: 900, color: 'white' }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Portfolio value card */}
          <div style={{
            background: portfolioChange7d >= 0
              ? 'linear-gradient(135deg, rgba(34,197,94,0.06), rgba(255,255,255,0.02))'
              : 'linear-gradient(135deg, rgba(238,21,21,0.06), rgba(255,255,255,0.02))',
            border: `1px solid ${portfolioChange7d >= 0 ? 'rgba(34,197,94,0.2)' : 'rgba(238,21,21,0.2)'}`,
            borderRadius: 20, padding: '24px', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 8 }}>
              Portfolio-Wert
            </div>
            <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 40, fontWeight: 900, letterSpacing: '-0.03em', color: 'white', lineHeight: 1, marginBottom: 6 }}>
              {portfolioValue.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€
            </div>

            {/* 7d change */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
              {portfolioChange7d >= 0
                ? <TrendingUp size={14} style={{ color: '#22C55E' }} />
                : <TrendingDown size={14} style={{ color: '#EE1515' }} />
              }
              <span style={{ fontSize: 13, fontWeight: 700, color: portfolioChange7d >= 0 ? '#22C55E' : '#EE1515' }}>
                {portfolioChange7d >= 0 ? '+' : ''}{portfolioChange7d.toFixed(1)}% (7 Tage)
              </span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
                · {totalCards} Karten
              </span>
            </div>

            {/* Sparkline */}
            <DashboardSparkline
              avg30={sparklineData.avg30}
              avg7={sparklineData.avg7}
              avg1={sparklineData.avg1}
              positive={portfolioChange7d >= 0}
            />

            <Link href="/dashboard/portfolio" style={{
              display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 12,
              fontSize: 12, fontWeight: 600, color: portfolioChange7d >= 0 ? '#22C55E' : '#EE1515',
              textDecoration: 'none',
            }}>
              Portfolio öffnen <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        {/* ── TOP KARTEN + WISHLIST ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="dashboard-bottom-grid">

          {/* Top Karten */}
          <div style={{
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 20, overflow: 'hidden',
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <TrendingUp size={14} style={{ color: '#EE1515' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Top Karten</span>
              </div>
              <Link href="/dashboard/portfolio" style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>Alle →</Link>
            </div>

            {topCards.length === 0 ? (
              <div style={{ padding: '32px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 36, marginBottom: 10, opacity: 0.2 }}>🃏</div>
                <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>Noch keine Karten im Portfolio</p>
                <Link href="/dashboard/portfolio" style={{ display: 'inline-block', marginTop: 12, padding: '7px 16px', borderRadius: 8, background: 'rgba(238,21,21,0.1)', border: '1px solid rgba(238,21,21,0.2)', color: '#EE1515', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                  Portfolio aufbauen →
                </Link>
              </div>
            ) : (
              <div>
                {topCards.map((card, i) => {
                  const change = card.price_avg7 && card.price_avg30 && card.price_avg30 > 0
                    ? ((card.price_avg7 - card.price_avg30) / card.price_avg30) * 100
                    : null
                  const totalVal = (card.price_market ?? 0) * card.quantity
                  return (
                    <div key={card.id} style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px',
                      borderBottom: i < topCards.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    }}>
                      {/* Rank */}
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.2)', minWidth: 16, textAlign: 'center' }}>#{i + 1}</span>

                      {/* Image */}
                      <div style={{ width: 32, height: 44, borderRadius: 4, overflow: 'hidden', background: 'rgba(255,255,255,0.05)', flexShrink: 0 }}>
                        {card.image_url && (
                          <img src={card.image_url} alt={card.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        )}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.name}</p>
                        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{card.set_id?.toUpperCase()} · ×{card.quantity}</p>
                      </div>

                      {/* Value + trend */}
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 14, fontWeight: 800, color: '#00E5FF' }}>
                          {totalVal.toFixed(2)}€
                        </p>
                        {change !== null && (
                          <p style={{ fontSize: 10, fontWeight: 700, color: change >= 0 ? '#22C55E' : '#EE1515' }}>
                            {change >= 0 ? '↑' : '↓'}{Math.abs(change).toFixed(1)}%
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Wishlist Preview */}
          <div style={{
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 20, overflow: 'hidden',
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Heart size={14} style={{ color: '#EE1515' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Wishlist</span>
              </div>
              <Link href="/dashboard/wishlist" style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>Alle →</Link>
            </div>

            {!wishlists || wishlists.length === 0 ? (
              <div style={{ padding: '32px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 36, marginBottom: 10, opacity: 0.2 }}>💝</div>
                <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>Noch keine Wishlists erstellt</p>
                <Link href="/dashboard/wishlist" style={{ display: 'inline-block', marginTop: 12, padding: '7px 16px', borderRadius: 8, background: 'rgba(238,21,21,0.1)', border: '1px solid rgba(238,21,21,0.2)', color: '#EE1515', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                  Wishlist erstellen →
                </Link>
              </div>
            ) : (
              <div style={{ padding: '12px 20px' }}>
                {(wishlists || []).map(wl => {
                  const items = (wishlistItems || []).filter(i => i.wishlist_id === wl.id)
                  return (
                    <div key={wl.id} style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>{wl.name}</span>
                          {wl.is_watchlist && (
                            <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.25)', color: '#00E5FF' }}>WATCH</span>
                          )}
                        </div>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>{items.length} Karten</span>
                      </div>

                      {/* Card thumbnails */}
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {items.slice(0, 4).map(item => {
                          const card = item.cards as any
                          return (
                            <div key={card?.id} style={{
                              width: 36, height: 50, borderRadius: 4, overflow: 'hidden',
                              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                              flexShrink: 0,
                            }}>
                              {card?.image_url && (
                                <img src={card.image_url} alt={card.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                              )}
                            </div>
                          )
                        })}
                        {items.length > 4 && (
                          <div style={{
                            width: 36, height: 50, borderRadius: 4,
                            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)',
                          }}>+{items.length - 4}</div>
                        )}
                      </div>
                    </div>
                  )
                })}
                <Link href="/dashboard/wishlist" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                  padding: '8px 0', borderRadius: 8, marginTop: 4,
                  background: 'rgba(238,21,21,0.06)', border: '1px solid rgba(238,21,21,0.15)',
                  color: '#EE1515', fontSize: 12, fontWeight: 600, textDecoration: 'none',
                }}>
                  Alle Wishlists <ArrowRight size={12} />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .dashboard-hero-grid { grid-template-columns: 1fr !important; }
          .dashboard-bottom-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

'@
[System.IO.File]::WriteAllText("$root\src\app\dashboard\page.tsx", $dashboardPage, $enc)
Write-Host "  OK: page.tsx" -ForegroundColor Green

$dashSparkline = @'
"use client";

interface Props {
  avg30: number;
  avg7:  number;
  avg1:  number;
  positive: boolean;
}

export default function DashboardSparkline({ avg30, avg7, avg1, positive }: Props) {
  const color = positive ? '#22C55E' : '#EE1515';
  const glow  = positive ? 'rgba(34,197,94,0.3)' : 'rgba(238,21,21,0.3)';

  // 3 data points: 30d ago, 7d ago, today
  // Normalize to 0–40 range for SVG height
  const values = [avg30, avg7, avg1];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = values.map((v, i) => ({
    x: i * 110 + 10, // 10, 120, 230
    y: 40 - ((v - min) / range) * 36, // invert Y, 4px padding
  }));

  const pathD = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');

  // Area fill path
  const areaD = `${pathD} L ${points[points.length - 1].x} 44 L ${points[0].x} 44 Z`;

  const labels = ['30T', '7T', 'Heute'];

  return (
    <div style={{ position: 'relative' }}>
      <svg
        viewBox="0 0 250 50"
        width="100%"
        height="52"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <linearGradient id={`sg-${positive}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Area */}
        <path d={areaD} fill={`url(#sg-${positive})`} />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: `drop-shadow(0 0 4px ${glow})` }}
        />

        {/* Dots */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={i === 2 ? 4 : 3}
            fill={i === 2 ? color : 'rgba(255,255,255,0.15)'}
            stroke={color}
            strokeWidth="1.5"
            style={{ filter: i === 2 ? `drop-shadow(0 0 6px ${glow})` : 'none' }}
          />
        ))}

        {/* Labels */}
        {points.map((p, i) => (
          <text
            key={i}
            x={p.x}
            y={48}
            textAnchor="middle"
            fontSize="8"
            fill="rgba(255,255,255,0.25)"
            fontFamily="Inter, sans-serif"
            fontWeight="600"
          >
            {labels[i]}
          </text>
        ))}
      </svg>
    </div>
  );
}

'@
[System.IO.File]::WriteAllText("$root\src\components\ui\DashboardSparkline.tsx", $dashSparkline, $enc)
Write-Host "  OK: DashboardSparkline.tsx" -ForegroundColor Green

$floatingPikachu = @'
"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";

interface PikachuState {
  visible: boolean;
  side: "left" | "right";
  bottom: number;
}

export default function FloatingPikachu() {
  const [state, setState] = useState<PikachuState>({
    visible: false,
    side: "left",
    bottom: 120,
  });

  const showPikachu = useCallback(() => {
    const side = Math.random() > 0.5 ? "left" : "right";
    const bottom = Math.floor(Math.random() * 200) + 80; // 80–280px from bottom

    setState({ visible: true, side, bottom });

    // Hide after 4 seconds
    setTimeout(() => {
      setState(prev => ({ ...prev, visible: false }));
    }, 4000);
  }, []);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const schedule = () => {
      const delay = Math.floor(Math.random() * 30000) + 30000; // 30–60s
      timeout = setTimeout(() => {
        showPikachu();
        schedule(); // schedule next appearance
      }, delay);
    };

    // First appearance after 5s so page has loaded
    timeout = setTimeout(() => {
      showPikachu();
      schedule();
    }, 5000);

    return () => clearTimeout(timeout);
  }, [showPikachu]);

  const isLeft  = state.side === "left";
  const isRight = state.side === "right";

  return (
    <>
      {/* Left Pikachu */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          left: 0,
          bottom: state.bottom,
          zIndex: 10,
          pointerEvents: "none",
          transform: state.visible && isLeft ? "translateX(0)" : "translateX(-110%)",
          transition: state.visible && isLeft
            ? "transform 0.6s cubic-bezier(0.34,1.56,0.64,1)"
            : "transform 0.5s cubic-bezier(0.4,0,1,1)",
          width: 80,
        }}
      >
        <div style={{
          animation: state.visible && isLeft ? "pikachu-bounce 0.5s ease infinite alternate" : "none",
        }}>
          <Image
            src="/pikachu-left.svg"
            alt=""
            width={80}
            height={80}
            style={{ width: "100%", height: "auto", filter: "drop-shadow(0 4px 12px rgba(250,204,21,0.4))" }}
          />
        </div>
      </div>

      {/* Right Pikachu */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          right: 0,
          bottom: state.bottom,
          zIndex: 10,
          pointerEvents: "none",
          transform: state.visible && isRight ? "translateX(0)" : "translateX(110%)",
          transition: state.visible && isRight
            ? "transform 0.6s cubic-bezier(0.34,1.56,0.64,1)"
            : "transform 0.5s cubic-bezier(0.4,0,1,1)",
          width: 80,
        }}
      >
        <div style={{
          animation: state.visible && isRight ? "pikachu-bounce 0.5s ease infinite alternate" : "none",
        }}>
          <Image
            src="/pikachu-right.svg"
            alt=""
            width={80}
            height={80}
            style={{ width: "100%", height: "auto", filter: "drop-shadow(0 4px 12px rgba(250,204,21,0.4))" }}
          />
        </div>
      </div>

      <style>{`
        @keyframes pikachu-bounce {
          from { transform: translateY(0); }
          to   { transform: translateY(-8px); }
        }
      `}</style>
    </>
  );
}

'@
[System.IO.File]::WriteAllText("$root\src\components\ui\FloatingPikachu.tsx", $floatingPikachu, $enc)
Write-Host "  OK: FloatingPikachu.tsx" -ForegroundColor Green

$globalsCSS = @'
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800;900&family=Inter:wght@400;500;600&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* Core Brand */
  --red: #EE1515;
  --red-glow: rgba(238, 21, 21, 0.15);
  --red-border: rgba(238, 21, 21, 0.3);
  --gold: #FACC15;
  --gold2: #f59e0b;

  /* Backgrounds */
  --bg: #0A0A0A;
  --bg2: #111111;
  --bg3: #181818;
  --bg4: #1f1f1f;

  /* Text */
  --text: #F8FAFC;
  --text2: #94A3B8;
  --text3: #475569;

  /* Borders */
  --border: rgba(255,255,255,0.07);
  --border2: rgba(255,255,255,0.12);
  --border3: rgba(255,255,255,0.2);

  /* Accents */
  --cyan: #00E5FF;
  --green: #22C55E;
  --purple: #A855F7;

  /* TCG Type Colors */
  --type-fire: #F97316;
  --type-water: #3B82F6;
  --type-grass: #22C55E;
  --type-lightning: #FACC15;
  --type-psychic: #A855F7;
  --type-fighting: #EF4444;
  --type-darkness: #6B7280;
  --type-metal: #9CA3AF;
  --type-dragon: #7C3AED;
  --type-fairy: #EC4899;

  /* Spacing (8px grid) */
  --sp1: 8px;
  --sp2: 16px;
  --sp3: 24px;
  --sp4: 32px;
  --sp5: 40px;
  --sp6: 48px;

  /* Radius */
  --r: 8px;
  --r2: 12px;
  --r3: 16px;
  --r4: 20px;
  --r5: 24px;
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  background: var(--bg);
  color: var(--text);
  font-family: 'Inter', -apple-system, sans-serif;
  font-size: 15px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, h4, h5 {
  font-family: 'Poppins', sans-serif;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.1;
}

/* ── Scrollbar ── */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: var(--bg2); }
::-webkit-scrollbar-thumb { background: var(--bg4); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--border3); }

/* ── Selection ── */
::selection { background: var(--red-glow); color: var(--text); }

/* ── Focus ── */
:focus-visible { outline: 2px solid var(--red); outline-offset: 2px; }

/* ── Pikachu Floaters ── */
.pikachu-left {
  position: fixed;
  left: 0;
  bottom: 80px;
  z-index: 10;
  width: 80px;
  opacity: 0.7;
  pointer-events: none;
  animation: pikachu-float 4s ease-in-out infinite;
}
.pikachu-right {
  position: fixed;
  right: 0;
  bottom: 80px;
  z-index: 10;
  width: 80px;
  opacity: 0.7;
  pointer-events: none;
  animation: pikachu-float 4s ease-in-out infinite 2s;
  transform: scaleX(-1);
}
@keyframes pikachu-float {
  0%, 100% { transform: translateY(0) scaleX(var(--flip, 1)); }
  50% { transform: translateY(-12px) scaleX(var(--flip, 1)); }
}
.pikachu-right { --flip: -1; }

/* ── Bottom Nav Mobile ── */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 50;
  background: rgba(10,10,10,0.97);
  border-top: 1px solid var(--border2);
  backdrop-filter: blur(20px);
  display: none;
  padding-bottom: env(safe-area-inset-bottom);
}
@media (max-width: 768px) {
  .bottom-nav { display: flex; }
  body { padding-bottom: 64px; }
  .pikachu-left, .pikachu-right { bottom: 72px; width: 60px; }
}
.bottom-nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 4px;
  cursor: pointer;
  text-decoration: none;
  color: var(--text3);
  transition: color 0.15s;
  gap: 3px;
}
.bottom-nav-item.active { color: var(--red); }
.bottom-nav-item svg { width: 20px; height: 20px; }
.bottom-nav-label { font-size: 10px; font-weight: 500; }

/* ── TCG Card Holo ── */
.holo-card {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1);
  cursor: pointer;
}
.holo-card:hover { transform: translateY(-6px) scale(1.02); }
.holo-shimmer {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.3s;
  background: linear-gradient(
    125deg,
    transparent 20%,
    rgba(255,255,255,0.06) 40%,
    rgba(255,255,255,0.12) 50%,
    rgba(255,255,255,0.06) 60%,
    transparent 80%
  );
  pointer-events: none;
  z-index: 2;
}
.holo-card:hover .holo-shimmer { opacity: 1; }

/* ── Section Labels ── */
.section-eyebrow {
  font-size: 10px;
  font-weight: 700;
  color: var(--red);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  margin-bottom: 6px;
}

/* ── Buttons ── */
.btn-primary {
  background: var(--red);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
}
.btn-primary:hover {
  transform: scale(1.03);
  box-shadow: 0 0 24px rgba(238,21,21,0.4);
}

.btn-outline {
  background: transparent;
  color: var(--text);
  border: 1px solid var(--border3);
  border-radius: 12px;
  padding: 12px 24px;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}
.btn-outline:hover {
  border-color: var(--border3);
  background: var(--bg2);
}

/* ── Inputs ── */
input, textarea, select {
  background: var(--bg2);
  color: var(--text);
  border: 1px solid var(--border2);
  border-radius: 12px;
  font-family: 'Inter', sans-serif;
  transition: border-color 0.15s;
}
input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: var(--red);
}

/* ── Animations ── */
@keyframes fade-up {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: none; }
}
.animate-fade-up { animation: fade-up 0.4s ease forwards; }

@keyframes pulse-dot {
  0%,100% { opacity: 1; }
  50%      { opacity: 0.3; }
}
.live-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--red);
  animation: pulse-dot 2s infinite;
  display: inline-block;
}

/* ── Glassmorphism cards ── */
.glass-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--border2);
  border-radius: 16px;
  backdrop-filter: blur(12px);
}
.glass-card:hover {
  border-color: var(--border3);
}

/* ── Price highlight ── */
.price-up   { color: #22C55E; }
.price-down { color: #EF4444; }
.price-main { font-family: 'Poppins', sans-serif; font-weight: 800; color: var(--cyan); }

/* ── Forum post row ── */
.forum-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 10px;
  background: rgba(255,255,255,0.02);
  border: 1px solid var(--border);
  margin-bottom: 6px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  text-decoration: none;
  color: inherit;
}
.forum-row:hover {
  border-color: var(--border2);
  background: rgba(255,255,255,0.04);
}

/* ── Utility ── */
.text-gradient-red {
  background: linear-gradient(135deg, var(--red), #ff6b6b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.text-gradient-gold {
  background: linear-gradient(135deg, var(--gold), var(--gold2));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.text-gradient-hero {
  background: linear-gradient(135deg, #ffffff 0%, #F8FAFC 60%, #CBD5E1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* ── Hero radial bg ── */
.hero-bg {
  background:
    radial-gradient(ellipse 80% 50% at 50% -10%, rgba(238,21,21,0.08), transparent),
    radial-gradient(ellipse 40% 30% at 80% 80%, rgba(250,204,21,0.04), transparent),
    var(--bg);
}

/* ── Sticky header blur ── */
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 40;
  background: rgba(10,10,10,0.94);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
}

/* hide pikachu on very small screens */
@media (max-width: 400px) {
  .pikachu-left, .pikachu-right { display: none; }
}

'@
[System.IO.File]::WriteAllText("$root\src\app\globals.css", $globalsCSS, $enc)
Write-Host "  OK: globals.css" -ForegroundColor Green

$navbarNew = @'
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Search, LayoutDashboard, MessageSquare, Gamepad2, Zap,
  Menu, X, ChevronRight, LogOut, Home, Crown,
  Shield, Star, Camera
} from "lucide-react";

const NAV = [
  { href: "/",           label: "Start",      icon: Home,           color: "#EE1515" },
  { href: "/preischeck", label: "Preischeck", icon: Search,         color: "#00E5FF" },
  { href: "/dashboard",  label: "Dashboard",  icon: LayoutDashboard,color: "#A855F7" },
  { href: "/forum",      label: "Forum",      icon: MessageSquare,  color: "#22C55E" },
  { href: "/spiel",      label: "Spiel",      icon: Gamepad2,       color: "#FACC15" },
  { href: "/scanner",    label: "Scanner",    icon: Camera,         color: "#F97316" },
];

const BOTTOM_NAV = [
  { href: "/",           label: "Start",    icon: Home          },
  { href: "/preischeck", label: "Preise",   icon: Search        },
  { href: "/scanner",    label: "Scanner",  icon: Camera        },
  { href: "/forum",      label: "Forum",    icon: MessageSquare },
  { href: "/dashboard",  label: "Profil",   icon: LayoutDashboard },
];

export default function Navbar() {
  const pathname = usePathname();
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser]       = useState<any>(null);
  const [open, setOpen]       = useState(false);
  const drawerRef             = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sb = createClient();
    sb.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) sb.from("profiles").select("username,avatar_url,forum_role,is_premium,badge_champion,badge_elite4,badge_gym_leader,badge_trainer").eq("id", user.id).single().then(({ data }) => setProfile(data));
    });
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (open && drawerRef.current && !drawerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname?.startsWith(href);

  const roleColor = profile?.forum_role === "admin" ? "#EE1515"
    : profile?.forum_role === "moderator" ? "#00E5FF"
    : profile?.is_premium ? "#FACC15"
    : "rgba(255,255,255,0.4)";

  const badgeLabel = profile?.badge_champion ? "Champion"
    : profile?.badge_elite4 ? "Top Vier"
    : profile?.badge_gym_leader ? "Arenaleiter"
    : profile?.badge_trainer ? "Trainer"
    : null;

  async function signOut() {
    await createClient().auth.signOut();
    window.location.href = "/";
  }

  return (
    <>
      {/* ── Top Navbar ── */}
      <nav className="sticky-header" style={{ height: 56 }}>
        {/* Red top line */}
        <div style={{ height: 2, background: "linear-gradient(90deg, transparent, #EE1515 30%, #EE1515 70%, transparent)" }} />

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px", height: 54, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <div style={{
              width: 30, height: 30, borderRadius: "50%",
              background: "linear-gradient(135deg, #FACC15, #f59e0b)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 900, color: "#000",
              boxShadow: "0 0 12px rgba(250,204,21,0.3)",
            }}>◎</div>
            <span style={{
              fontFamily: "Poppins, sans-serif", fontWeight: 900, fontSize: 17,
              background: "linear-gradient(135deg, #FACC15, #f59e0b)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              letterSpacing: "-0.02em",
            }}>POKÉDAX</span>
          </Link>

          {/* Desktop Links */}
          <div style={{ display: "flex", gap: 2 }} className="hidden-mobile">
            {NAV.map(({ href, label, icon: Icon, color }) => {
              const active = isActive(href);
              return (
                <Link key={href} href={href} style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "6px 12px", borderRadius: 8,
                  fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 500,
                  color: active ? color : "rgba(255,255,255,0.5)",
                  background: active ? `${color}15` : "transparent",
                  border: `1px solid ${active ? color + "30" : "transparent"}`,
                  textDecoration: "none",
                  transition: "all .15s",
                }}>
                  <Icon size={14} />
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Right: User + Hamburger */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Desktop user */}
            {user && profile ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }} className="hidden-mobile">
                <div style={{ position: "relative" }}>
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.username}
                      style={{ width: 30, height: 30, borderRadius: "50%", objectFit: "cover", border: `2px solid ${roleColor}` }} />
                  ) : (
                    <div style={{
                      width: 30, height: 30, borderRadius: "50%",
                      background: `${roleColor}20`, border: `2px solid ${roleColor}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 700, fontSize: 12, color: roleColor,
                    }}>{profile.username?.[0]?.toUpperCase()}</div>
                  )}
                </div>
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600, color: roleColor }}>
                  {profile.username}
                </span>
                <button onClick={signOut} title="Ausloggen"
                  style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", padding: 4, display: "flex" }}>
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 6 }} className="hidden-mobile">
                <Link href="/auth/login" style={{
                  padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 500,
                  color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.12)",
                  textDecoration: "none",
                }}>Login</Link>
                <Link href="/auth/register" style={{
                  padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 700,
                  color: "white", background: "#EE1515", border: "none", textDecoration: "none",
                  fontFamily: "Poppins, sans-serif",
                }}>Registrieren</Link>
              </div>
            )}

            {/* Hamburger */}
            <button onClick={() => setOpen(!open)}
              style={{
                width: 36, height: 36, borderRadius: 8,
                background: open ? "rgba(238,21,21,0.1)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${open ? "rgba(238,21,21,0.3)" : "rgba(255,255,255,0.1)"}`,
                color: open ? "#EE1515" : "rgba(255,255,255,0.6)",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              }}
              aria-label="Menü öffnen"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Overlay ── */}
      {open && (
        <div onClick={() => setOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", zIndex: 48 }} />
      )}

      {/* ── Drawer ── */}
      <div ref={drawerRef} style={{
        position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 49,
        width: 290,
        background: "linear-gradient(180deg, #111111 0%, #0A0A0A 100%)",
        borderLeft: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "-24px 0 60px rgba(0,0,0,0.9)",
        transform: open ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
        display: "flex", flexDirection: "column",
        overflowY: "auto",
      }}>
        {/* Red top line */}
        <div style={{ height: 2, background: "linear-gradient(90deg, transparent, #EE1515, transparent)", flexShrink: 0 }} />

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
          <span style={{
            fontFamily: "Poppins, sans-serif", fontWeight: 900, fontSize: 17,
            background: "linear-gradient(135deg, #FACC15, #f59e0b)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>POKÉDAX</span>
          <button onClick={() => setOpen(false)}
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", display: "flex" }}>
            <X size={20} />
          </button>
        </div>

        {/* User block */}
        {user && profile ? (
          <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.username}
                  style={{ width: 40, height: 40, borderRadius: "50%", border: `2px solid ${roleColor}` }} />
              ) : (
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: `${roleColor}20`, border: `2px solid ${roleColor}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700, fontSize: 16, color: roleColor,
                }}>{profile.username?.[0]?.toUpperCase()}</div>
              )}
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: "#F8FAFC" }}>{profile.username}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: roleColor, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {profile.forum_role === "admin" ? "Admin"
                    : profile.forum_role === "moderator" ? "Moderator"
                    : profile.is_premium ? "⭐ Premium"
                    : badgeLabel || "Trainer"}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
            <Link href="/auth/login" onClick={() => setOpen(false)} style={{
              display: "block", textAlign: "center", padding: "9px 0", borderRadius: 10,
              fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.6)",
              border: "1px solid rgba(255,255,255,0.12)", textDecoration: "none",
            }}>Login</Link>
            <Link href="/auth/register" onClick={() => setOpen(false)} style={{
              display: "block", textAlign: "center", padding: "9px 0", borderRadius: 10,
              fontSize: 14, fontWeight: 700, color: "white",
              background: "#EE1515", textDecoration: "none", fontFamily: "Poppins, sans-serif",
            }}>Registrieren</Link>
          </div>
        )}

        {/* Nav Links */}
        <div style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.2)", letterSpacing: "0.2em", textTransform: "uppercase", padding: "4px 8px 10px" }}>
            Navigation
          </div>
          {NAV.map(({ href, label, icon: Icon, color }) => {
            const active = isActive(href);
            return (
              <Link key={href} href={href} onClick={() => setOpen(false)} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "11px 10px", borderRadius: 10, marginBottom: 2,
                background: active ? `${color}15` : "transparent",
                border: `1px solid ${active ? color + "25" : "transparent"}`,
                color: active ? color : "rgba(255,255,255,0.6)",
                textDecoration: "none", transition: "all .15s",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Icon size={16} />
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: active ? 600 : 400 }}>{label}</span>
                </div>
                <ChevronRight size={14} style={{ color: "rgba(255,255,255,0.2)" }} />
              </Link>
            );
          })}

          {/* Premium upsell */}
          {!profile?.is_premium && (
            <Link href="/dashboard/premium" onClick={() => setOpen(false)} style={{
              display: "block", margin: "12px 0 0", padding: "12px 10px", borderRadius: 10,
              background: "rgba(250,204,21,0.08)", border: "1px solid rgba(250,204,21,0.2)",
              textDecoration: "none",
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#FACC15", marginBottom: 2 }}>👑 Premium · 7,99€/Mo</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Unlimitierter Scanner + mehr</div>
            </Link>
          )}
        </div>

        {/* Sign out */}
        {user && (
          <div style={{ padding: "12px 10px", borderTop: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
            <button onClick={signOut} style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "10px", borderRadius: 10, cursor: "pointer",
              background: "rgba(238,21,21,0.06)", border: "1px solid rgba(238,21,21,0.15)",
              color: "rgba(238,21,21,0.7)", fontSize: 13, fontFamily: "Inter, sans-serif",
            }}>
              <LogOut size={14} />
              Ausloggen
            </button>
          </div>
        )}
      </div>

      {/* ── Bottom Navigation (Mobile only) ── */}
      <nav className="bottom-nav">
        {BOTTOM_NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href} className={`bottom-nav-item${active ? " active" : ""}`}>
              <Icon size={20} />
              <span className="bottom-nav-label">{label}</span>
            </Link>
          );
        })}
      </nav>

      <style>{`
        @media (min-width: 769px) { .hidden-mobile { display: flex !important; } }
        @media (max-width: 768px) { .hidden-mobile { display: none !important; } }
      `}</style>
    </>
  );
}

'@
[System.IO.File]::WriteAllText("$root\src\components\layout\Navbar.tsx", $navbarNew, $enc)
Write-Host "  OK: Navbar.tsx" -ForegroundColor Green

$rootLayout = @'
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FloatingPikachu from "@/components/ui/FloatingPikachu";

export const metadata: Metadata = {
  title: "PokéDax – Deutschlands #1 Pokémon TCG Plattform",
  description: "Live Cardmarket EUR Preise, KI-Scanner, Portfolio und Community. Deutschlands größte Pokémon TCG Plattform.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        <Navbar />

        <FloatingPikachu />

        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}

'@
[System.IO.File]::WriteAllText("$root\src\app\layout.tsx", $rootLayout, $enc)
Write-Host "  OK: layout.tsx" -ForegroundColor Green

$homePage = @'
import Link from "next/link";
import { Search, Camera, TrendingUp, ArrowRight } from "lucide-react";
import TrendingGrid from "@/components/cards/TrendingGrid";
import ForumSection from "@/components/forum/ForumSection";
import PremiumSection from "@/components/premium/PremiumSection";
import OnlineUsers from "@/components/ui/OnlineUsers";
import type { TrendingCard } from "@/types";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("cards")
    .select("id,name,set_id,number,rarity,types,image_url,price_market,price_low,price_high,price_avg7,price_avg30")
    .not("price_market", "is", null)
    .order("price_market", { ascending: false })
    .limit(8);

  const trendingCards: TrendingCard[] = (rows || []).map((row, i) => {
    const change7d = row.price_avg7 && row.price_avg30 && row.price_avg30 > 0
      ? Math.round(((row.price_avg7 - row.price_avg30) / row.price_avg30) * 1000) / 10
      : 0;
    const signal: "buy" | "sell" | "hold" = change7d >= 3 ? "buy" : change7d <= -3 ? "sell" : "hold";
    return {
      rank: i + 1,
      rankChange: 0,
      card: {
        id: row.id,
        name: row.name,
        number: row.number || "",
        rarity: row.rarity || "",
        types: row.types || [],
        images: {
          small: row.image_url || `https://assets.tcgdex.net/en/${row.set_id}/${row.number}/low.webp`,
          large: row.image_url || `https://assets.tcgdex.net/en/${row.set_id}/${row.number}/high.webp`,
        },
        set: { id: row.set_id || "", name: row.set_id?.toUpperCase() || "" },
      },
      price: {
        price:    row.price_market || 0,
        low:      row.price_low    || 0,
        high:     row.price_high   || 0,
        change7d,
        signal,
      },
    } as TrendingCard;
  });

  return (
    <div style={{ background: "#0A0A0A", minHeight: "100vh" }}>

      {/* ── HERO ── */}
      <section style={{
        background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(238,21,21,0.09), transparent), radial-gradient(ellipse 40% 30% at 80% 90%, rgba(250,204,21,0.04), transparent), #0A0A0A",
        padding: "72px 20px 60px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Live badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          padding: "5px 14px", borderRadius: 20,
          background: "rgba(238,21,21,0.1)", border: "1px solid rgba(238,21,21,0.25)",
          marginBottom: 22,
        }}>
          <span className="live-dot" />
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 700, color: "#EE1515", letterSpacing: "0.06em" }}>
            LIVE · CARDMARKET EUR-PREISE
          </span>
        </div>

        <h1 style={{ fontSize: "clamp(36px, 7vw, 64px)", fontFamily: "Poppins, sans-serif", fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1.05, marginBottom: 18 }}>
          <span style={{ color: "#F8FAFC" }}>Pokémon TCG</span>
          <br />
          <span style={{ background: "linear-gradient(135deg, #EE1515, #ff6b6b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Preis-Check DE
          </span>
        </h1>

        <p style={{ fontSize: 15, color: "#94A3B8", maxWidth: 480, margin: "0 auto 32px", lineHeight: 1.65 }}>
          Scanne deine Karte und erhalte sofort den aktuellen Marktwert mit Kauf-/Verkaufsempfehlung – direkt von Cardmarket.
        </p>

        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 48 }}>
          <Link href="/preischeck" className="btn-primary" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Search size={16} />
            Preis checken
          </Link>
          <Link href="/scanner" className="btn-outline" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Camera size={16} />
            Karte scannen
          </Link>
        </div>

        {/* Stats bar */}
        <div style={{
          display: "flex", flexWrap: "wrap", justifyContent: "center",
          border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16,
          overflow: "hidden", background: "#111111",
          maxWidth: 640, margin: "0 auto",
        }}>
          {[
            { val: "98.420", label: "Karten in DB" },
            { val: "2.841",  label: "Aktive Nutzer" },
            { val: "1.247",  label: "Scans heute"   },
            { val: "18.330", label: "Forum-Posts"   },
          ].map((s, i, arr) => (
            <div key={s.label} style={{
              flex: "1 1 120px", padding: "18px 16px", textAlign: "center",
              borderRight: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.07)" : "none",
            }}>
              <div style={{ fontFamily: "Poppins, sans-serif", fontWeight: 900, fontSize: 22, color: "#F8FAFC" }}>
                {s.val}
              </div>
              <div style={{ fontSize: 10, fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 3 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Feature pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 24 }}>
          {["Live-Preise von Cardmarket", "KI-Karten-Scanner", "Fake-Check & Grading", "Realtime Preis-Alerts"].map(f => (
            <span key={f} style={{
              padding: "5px 12px", borderRadius: 20,
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
              fontSize: 12, color: "#94A3B8",
            }}>✓ {f}</span>
          ))}
        </div>
      </section>

      {/* ── TRENDING CARDS ── */}
      <section style={{ padding: "48px 20px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <div className="section-eyebrow" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <TrendingUp size={12} />
              Trending jetzt
            </div>
            <h2 style={{ fontFamily: "Poppins, sans-serif", fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 800, color: "#F8FAFC", letterSpacing: "-0.02em" }}>
              Meistgesuchte Karten
            </h2>
          </div>
          <Link href="/preischeck" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "#475569", textDecoration: "none" }}>
            Alle ansehen <ArrowRight size={14} />
          </Link>
        </div>
        <TrendingGrid cards={trendingCards} />
      </section>

      {/* ── FORUM SECTION ── */}
      <ForumSection />

      {/* ── ONLINE USERS ── */}
      <section style={{ padding: "0 20px 48px", maxWidth: 1200, margin: "0 auto" }}>
        <OnlineUsers />
      </section>

      {/* ── PREMIUM ── */}
      <PremiumSection />
    </div>
  );
}

'@
[System.IO.File]::WriteAllText("$root\src\app\page.tsx", $homePage, $enc)
Write-Host "  OK: page.tsx" -ForegroundColor Green

$forumSectionNew = @'
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare, Flame, ArrowRight } from "lucide-react";

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  post_count: number;
}

interface Post {
  id: string;
  title: string;
  category_id: string;
  reply_count: number;
  upvotes: number;
  is_hot: boolean;
  created_at: string;
  profiles: { username: string };
}

const CAT = {
  marktplatz:   { gradient: "linear-gradient(135deg, #1a0533 0%, #2d0a52 50%, #1a0533 100%)", border: "rgba(168,85,247,0.6)",  glow: "rgba(168,85,247,0.25)", type: "Psychic",   rarity: "Rare Holo",    dots: 4 },
  preise:       { gradient: "linear-gradient(135deg, #001a2e 0%, #003366 50%, #001a2e 100%)", border: "rgba(0,229,255,0.6)",   glow: "rgba(0,229,255,0.25)",  type: "Water",     rarity: "Uncommon",     dots: 2 },
  "fake-check": { gradient: "linear-gradient(135deg, #1a0a00 0%, #3d1a00 50%, #1a0a00 100%)", border: "rgba(249,115,22,0.6)",  glow: "rgba(249,115,22,0.25)", type: "Fire",      rarity: "Rare",         dots: 3 },
  news:         { gradient: "linear-gradient(135deg, #00150a 0%, #003320 50%, #00150a 100%)", border: "rgba(34,197,94,0.6)",   glow: "rgba(34,197,94,0.25)",  type: "Grass",     rarity: "Common",       dots: 1 },
  einsteiger:   { gradient: "linear-gradient(135deg, #1a1a00 0%, #333300 50%, #1a1a00 100%)", border: "rgba(250,204,21,0.6)",  glow: "rgba(250,204,21,0.25)", type: "Lightning", rarity: "Common",       dots: 1 },
  turniere:     { gradient: "linear-gradient(135deg, #1a0000 0%, #330000 50%, #1a0000 100%)", border: "rgba(238,21,21,0.6)",   glow: "rgba(238,21,21,0.25)",  type: "Fighting",  rarity: "Rare Holo EX", dots: 5 },
  premium:      { gradient: "linear-gradient(135deg, #0a0014 0%, #1a003d 50%, #0a0014 100%)", border: "rgba(250,204,21,0.8)",  glow: "rgba(250,204,21,0.3)",  type: "Dragon",    rarity: "Ultra Rare",   dots: 6 },
};

export default function ForumSection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [hotPosts,   setHotPosts]   = useState<Post[]>([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/forum/categories").then(r => r.json()),
      fetch("/api/forum/posts?sort=hot&limit=5").then(r => r.json()),
    ]).then(([c, p]) => {
      setCategories(c.categories || []);
      setHotPosts(p.posts || []);
      setLoading(false);
    });
  }, []);

  return (
    <section style={{ padding: "0 20px 48px", background: "linear-gradient(180deg, transparent, rgba(238,21,21,0.03), transparent)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <div className="section-eyebrow">Community</div>
            <h2 style={{ fontFamily: "Poppins, sans-serif", fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 800, color: "#F8FAFC", letterSpacing: "-0.02em" }}>
              Forum
            </h2>
          </div>
          <Link href="/forum" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "#475569", textDecoration: "none" }}>
            Alle Kategorien <ArrowRight size={14} />
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 24 }}>

          {/* TCG Holo Karten Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 12 }}>
            {loading
              ? Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} style={{ borderRadius: 12, background: "rgba(255,255,255,0.04)", aspectRatio: "2.5/3.5", animation: "pulse 1.5s infinite" }} />
                ))
              : categories.map(cat => {
                  const s = CAT[cat.id as keyof typeof CAT] || CAT.news;
                  return (
                    <Link key={cat.id} href={`/forum?category=${cat.id}`} style={{ display: "block", textDecoration: "none" }}
                      className="holo-card">
                      <div style={{
                        background: s.gradient,
                        border: `1px solid ${s.border}`,
                        borderRadius: 12,
                        boxShadow: `0 0 20px ${s.glow}, inset 0 0 40px rgba(0,0,0,0.3)`,
                        aspectRatio: "2.5/3.5",
                        display: "flex", flexDirection: "column",
                        position: "relative", overflow: "hidden",
                      }}>
                        <div className="holo-shimmer" />

                        {/* Top bar */}
                        <div style={{ padding: "6px 8px 4px", borderBottom: `1px solid ${s.border}40`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ color: s.border, fontSize: 8, fontWeight: 700, letterSpacing: "0.05em" }}>{s.type}</span>
                          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 8 }}>HP {Math.floor((cat.post_count || 0) / 10) + 60}</span>
                        </div>

                        {/* Icon */}
                        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <div style={{
                            width: 52, height: 52, borderRadius: "50%",
                            background: `radial-gradient(circle, ${s.glow} 0%, transparent 70%)`,
                            border: `1px solid ${s.border}50`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 24,
                          }}>{cat.icon}</div>
                        </div>

                        {/* Name */}
                        <div style={{ padding: "0 6px 4px", textAlign: "center" }}>
                          <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: 10, color: "white", textShadow: `0 0 8px ${s.glow}`, letterSpacing: "0.03em" }}>
                            {cat.name}
                          </p>
                        </div>

                        {/* Divider */}
                        <div style={{ margin: "0 6px", height: 1, background: `${s.border}40` }} />

                        {/* Posts */}
                        <div style={{ padding: "4px 8px 4px" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(0,0,0,0.3)", padding: "3px 6px", borderRadius: 4 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                              <MessageSquare size={8} style={{ color: s.border }} />
                              <span style={{ color: s.border, fontSize: 8, fontWeight: 700 }}>{(cat.post_count || 0).toLocaleString()}</span>
                            </div>
                            <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 8 }}>Posts</span>
                          </div>
                        </div>

                        {/* Rarity dots */}
                        <div style={{ display: "flex", justifyContent: "center", gap: 3, paddingBottom: 6 }}>
                          {Array.from({ length: s.dots }).map((_, i) => (
                            <div key={i} style={{
                              width: i === s.dots - 1 ? 6 : 4,
                              height: i === s.dots - 1 ? 6 : 4,
                              borderRadius: "50%",
                              background: i === s.dots - 1 ? s.border : `${s.border}60`,
                              boxShadow: i === s.dots - 1 ? `0 0 4px ${s.glow}` : "none",
                            }} />
                          ))}
                        </div>

                        {/* Rarity text */}
                        <div style={{ position: "absolute", bottom: 4, left: 0, right: 0, textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 7 }}>
                          {s.rarity}
                        </div>
                      </div>
                    </Link>
                  );
                })}

            {/* New Post CTA */}
            <Link href="/forum/new" style={{ display: "block", textDecoration: "none" }}>
              <div style={{
                border: "1px dashed rgba(255,255,255,0.15)", borderRadius: 12,
                aspectRatio: "2.5/3.5", display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 6,
                background: "rgba(255,255,255,0.01)", transition: "border-color .2s",
              }}>
                <span style={{ fontSize: 22, color: "rgba(255,255,255,0.2)" }}>+</span>
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", textAlign: "center", lineHeight: 1.3 }}>Beitrag erstellen</span>
              </div>
            </Link>
          </div>

          {/* Trending sidebar */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
              <Flame size={13} style={{ color: "#EE1515" }} />
              <span style={{ fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 700, color: "#475569", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                Trending
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} style={{ height: 56, borderRadius: 10, background: "rgba(255,255,255,0.04)" }} />
                  ))
                : hotPosts.map(post => {
                    const s = CAT[post.category_id as keyof typeof CAT] || CAT.news;
                    return (
                      <Link key={post.id} href={`/forum/post/${post.id}`} className="forum-row" style={{ position: "relative", paddingLeft: 18 }}>
                        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: s.border, borderRadius: "10px 0 0 10px" }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: 12, color: "#F8FAFC", lineHeight: 1.35, marginBottom: 3, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                            {post.title}
                          </p>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ color: "#475569", fontSize: 10 }}>{post.profiles?.username}</span>
                            <div style={{ display: "flex", alignItems: "center", gap: 3, color: "#475569", fontSize: 10 }}>
                              <MessageSquare size={9} />
                              {post.reply_count}
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
            </div>
            <Link href="/forum" style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              marginTop: 12, padding: "10px 0", borderRadius: 10,
              background: "rgba(238,21,21,0.06)", border: "1px solid rgba(238,21,21,0.15)",
              color: "#EE1515", fontSize: 13, fontWeight: 600, textDecoration: "none",
            }}>
              Alle Beiträge <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

'@
[System.IO.File]::WriteAllText("$root\src\components\forum\ForumSection.tsx", $forumSectionNew, $enc)
Write-Host "  OK: ForumSection.tsx" -ForegroundColor Green

Write-Host ""
Write-Host "Fertig! Dashboard deployed." -ForegroundColor Cyan
Write-Host "GitHub Desktop -> Commit & Push" -ForegroundColor Yellow
