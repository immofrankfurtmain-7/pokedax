import type { PokemonCard, TrendingCard, CardPrice } from '@/types'

const API_BASE = 'https://api.pokemontcg.io/v2'
const API_KEY  = process.env.POKEMON_TCG_API_KEY || ''

const headers: HeadersInit = API_KEY ? { 'X-Api-Key': API_KEY } : {}

// ── FETCH CARD BY ID ──────────────────────────────────────────────────────────
export async function getCard(id: string): Promise<PokemonCard | null> {
  try {
    const res = await fetch(`${API_BASE}/cards/${id}`, { headers, next: { revalidate: 3600 } })
    if (!res.ok) return null
    const json = await res.json()
    return json.data as PokemonCard
  } catch { return null }
}

// ── SEARCH CARDS ──────────────────────────────────────────────────────────────
export async function searchCards(query: string, page = 1, pageSize = 20): Promise<{ data: PokemonCard[]; total: number }> {
  try {
    const q = encodeURIComponent(`name:"${query}*"`)
    const res = await fetch(`${API_BASE}/cards?q=${q}&page=${page}&pageSize=${pageSize}&orderBy=-set.releaseDate`, {
      headers, next: { revalidate: 1800 }
    })
    if (!res.ok) return { data: [], total: 0 }
    const json = await res.json()
    return { data: json.data as PokemonCard[], total: json.totalCount }
  } catch { return { data: [], total: 0 } }
}

// ── GET SET CARDS ──────────────────────────────────────────────────────────────
export async function getSetCards(setId: string): Promise<PokemonCard[]> {
  try {
    const res = await fetch(`${API_BASE}/cards?q=set.id:${setId}&pageSize=250`, {
      headers, next: { revalidate: 7200 }
    })
    if (!res.ok) return []
    const json = await res.json()
    return json.data as PokemonCard[]
  } catch { return [] }
}

// ── GET TRENDING CARDS (curated popular list) ──────────────────────────────────
export async function getTrendingCards(): Promise<TrendingCard[]> {
  const trendingIds = [
    'sv1-6',       // Charizard ex
    'sv4pt5-86',   // Pikachu ex alt art
    'swsh11-71',   // Mewtwo V
    'sv1-63',      // Gengar ex
    'base1-4',     // Charizard Base Set
    'swsh5-49',    // Lapras V alt art
    'sv3pt5-200',  // Iono alt art
    'sv4-198',     // Arven alt art
  ]

  const cards = await Promise.all(trendingIds.map(id => getCard(id)))
  const valid = cards.filter(Boolean) as PokemonCard[]

  return valid.map((card, i) => ({
    card,
    price: getMockPrice(card, i),
    rank: i + 1,
    rankChange: Math.floor(Math.random() * 5) - 2,
  }))
}

// ── GET SETS ──────────────────────────────────────────────────────────────────
export async function getSets() {
  try {
    const res = await fetch(`${API_BASE}/sets?orderBy=-releaseDate&pageSize=20`, {
      headers, next: { revalidate: 86400 }
    })
    if (!res.ok) return []
    const json = await res.json()
    return json.data
  } catch { return [] }
}

// ── MOCK PRICE (replace with real Cardmarket API) ─────────────────────────────
function getMockPrice(card: PokemonCard, index: number): CardPrice {
  const basePrices = [189.90, 44.50, 12.80, 28.40, 1250, 67.20, 89.90, 34.50]
  const changes    = [12.4,   5.2,  -2.1,   1.8,   8.9, -1.5,  3.2,  -0.8]
  const signals: CardPrice['signal'][] = ['buy','buy','sell','hold','buy','hold','buy','hold']

  const price = basePrices[index] ?? 25
  const change = changes[index] ?? 0

  return {
    cardId:    card.id,
    price,
    low:       price * 0.82,
    high:      price * 1.18,
    avg7:      price * 0.97,
    avg30:     price * 0.94,
    trend:     price * 0.95,
    change7d:  change,
    signal:    signals[index] ?? 'hold',
    updatedAt: new Date().toISOString(),
  }
}

// ── PRICE SIGNAL ──────────────────────────────────────────────────────────────
export function getPriceSignal(change7d: number, avg7: number, avg30: number): CardPrice['signal'] {
  if (change7d > 5 && avg7 > avg30) return 'buy'
  if (change7d < -3) return 'sell'
  return 'hold'
}

export const SIGNAL_LABELS = { buy: 'KAUFEN', sell: 'VERKAUFEN', hold: 'HALTEN' }
export const SIGNAL_COLORS = { buy: '#00e676', sell: '#ff5252', hold: '#FFD700' }

// ── TYPE COLORS ───────────────────────────────────────────────────────────────
export const TYPE_CONFIG: Record<string, { color: string; grad: string; glow: string }> = {
  Fire:      { color:'#ff5500', grad:'linear-gradient(135deg,#ff5500,#ff2200)', glow:'rgba(255,85,0,0.5)' },
  Water:     { color:'#00aaff', grad:'linear-gradient(135deg,#00aaff,#0055ff)', glow:'rgba(0,170,255,0.5)' },
  Lightning: { color:'#FFD700', grad:'linear-gradient(135deg,#FFD700,#ff9500)', glow:'rgba(255,215,0,0.5)' },
  Psychic:   { color:'#cc44ff', grad:'linear-gradient(135deg,#cc44ff,#7700cc)', glow:'rgba(204,68,255,0.5)' },
  Grass:     { color:'#00cc66', grad:'linear-gradient(135deg,#00cc66,#007733)', glow:'rgba(0,204,102,0.5)' },
  Fighting:  { color:'#cc6633', grad:'linear-gradient(135deg,#cc6633,#993300)', glow:'rgba(204,102,51,0.5)' },
  Dragon:    { color:'#ff9900', grad:'linear-gradient(135deg,#ff9900,#cc5500)', glow:'rgba(255,153,0,0.5)' },
  Darkness:  { color:'#6666aa', grad:'linear-gradient(135deg,#6666aa,#333366)', glow:'rgba(102,102,170,0.5)' },
  Metal:     { color:'#aaaacc', grad:'linear-gradient(135deg,#aaaacc,#666688)', glow:'rgba(170,170,204,0.4)' },
  Colorless: { color:'#aaaaaa', grad:'linear-gradient(135deg,#aaaaaa,#666666)', glow:'rgba(170,170,170,0.4)' },
  default:   { color:'#8888aa', grad:'linear-gradient(135deg,#8888aa,#555577)', glow:'rgba(136,136,170,0.4)' },
}

export function getTypeConfig(types?: string[]) {
  if (!types?.length) return TYPE_CONFIG.default
  return TYPE_CONFIG[types[0]] ?? TYPE_CONFIG.default
}

// ── FORMAT PRICE ──────────────────────────────────────────────────────────────
export function formatPrice(price: number): string {
  return price >= 1000
    ? price.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : price.toFixed(2)
}

// ── RARITY DOTS ──────────────────────────────────────────────────────────────
export const RARITY_LEVEL: Record<string, number> = {
  'Common': 1, 'Uncommon': 2, 'Rare': 3, 'Rare Holo': 4,
  'Rare Ultra': 5, 'Rare Secret': 5, 'Special Illustration Rare': 5,
  'Illustration Rare': 4, 'Hyper Rare': 5,
}
