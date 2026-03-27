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
