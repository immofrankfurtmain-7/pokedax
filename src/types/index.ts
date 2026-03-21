// ── POKEMON TYPES ──────────────────────────────────────────────────────────────

export interface PokemonCard {
  id: string
  name: string
  supertype: string
  subtypes?: string[]
  hp?: string
  types?: string[]
  set: {
    id: string
    name: string
    series: string
    printedTotal: number
    total: number
    releaseDate: string
    images: { symbol: string; logo: string }
  }
  number: string
  artist?: string
  rarity?: string
  images: {
    small: string
    large: string
  }
  cardmarket?: {
    prices: {
      averageSellPrice?: number
      lowPrice?: number
      trendPrice?: number
      avg1?: number
      avg7?: number
      avg30?: number
    }
  }
}

export interface CardPrice {
  cardId: string
  price: number
  low: number
  high: number
  avg7: number
  avg30: number
  trend: number
  change7d: number
  signal: 'buy' | 'sell' | 'hold'
  updatedAt: string
}

export type SignalType = 'buy' | 'sell' | 'hold'
export type PokemonType = 'fire' | 'water' | 'electric' | 'psychic' | 'grass' | 'fighting' | 'dragon' | 'dark' | 'normal' | 'metal' | 'colorless'
export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Rare Holo' | 'Rare Ultra' | 'Rare Secret' | 'Special Illustration Rare'

// ── USER / AUTH TYPES ───────────────────────────────────────────────────────────

export interface UserProfile {
  id: string
  email: string
  username: string
  avatarUrl?: string
  isPremium: boolean
  premiumUntil?: string
  stripeCustomerId?: string
  createdAt: string
}

// ── PORTFOLIO TYPES ─────────────────────────────────────────────────────────────

export interface PortfolioCard {
  id: string
  userId: string
  cardId: string
  card?: PokemonCard
  condition: CardCondition
  quantity: number
  purchasePrice?: number
  purchaseDate?: string
  notes?: string
  forSale: boolean
  askPrice?: number
  createdAt: string
}

export type CardCondition = 'PSA10' | 'PSA9' | 'PSA8' | 'Mint' | 'NearMint' | 'Excellent' | 'Good' | 'Poor'

export interface PortfolioStats {
  totalCards: number
  totalValue: number
  totalCost: number
  gainLoss: number
  gainLossPercent: number
  topCard: { name: string; value: number } | null
}

// ── SET TRACKER ─────────────────────────────────────────────────────────────────

export interface SetProgress {
  setId: string
  setName: string
  totalCards: number
  ownedCards: number
  percentComplete: number
  setValue: number
  ownedValue: number
  missingCards: string[]
  coverImage?: string
}

// ── MARKETPLACE ─────────────────────────────────────────────────────────────────

export interface Listing {
  id: string
  sellerId: string
  seller?: UserProfile
  cardId: string
  card?: PokemonCard
  condition: CardCondition
  askPrice: number
  description?: string
  images?: string[]
  status: 'active' | 'sold' | 'removed'
  offers: Offer[]
  createdAt: string
}

export interface Offer {
  id: string
  listingId: string
  buyerId: string
  buyer?: UserProfile
  offerPrice: number
  message?: string
  status: 'pending' | 'accepted' | 'declined' | 'withdrawn'
  createdAt: string
}

export interface ChatMessage {
  id: string
  listingId: string
  senderId: string
  receiverId: string
  content: string
  createdAt: string
}

// ── FORUM TYPES ─────────────────────────────────────────────────────────────────

export interface ForumCategory {
  id: string
  name: string
  description: string
  emoji: string
  color: string
  gradient: string
  borderGlow: string
  pokemonType: string
  postCount: number
  isPremium: boolean
  recentPosts: ForumPost[]
}

export interface ForumPost {
  id: string
  categoryId: string
  category?: ForumCategory
  authorId: string
  author?: UserProfile
  title: string
  content: string
  tags?: string[]
  upvotes: number
  replyCount: number
  isPinned: boolean
  isHot: boolean
  createdAt: string
  updatedAt: string
}

export interface ForumReply {
  id: string
  postId: string
  authorId: string
  author?: UserProfile
  content: string
  upvotes: number
  createdAt: string
}

// ── ALERTS ─────────────────────────────────────────────────────────────────────

export interface PriceAlert {
  id: string
  userId: string
  cardId: string
  card?: PokemonCard
  targetPrice: number
  condition: 'above' | 'below'
  isActive: boolean
  triggeredAt?: string
  createdAt: string
}

// ── SCANNER ────────────────────────────────────────────────────────────────────

export interface ScanResult {
  cardId: string
  card: PokemonCard
  confidence: number
  condition?: CardCondition
  price: CardPrice
  similarCards?: PokemonCard[]
}

// ── TRENDING ───────────────────────────────────────────────────────────────────

export interface TrendingCard {
  card: PokemonCard
  price: CardPrice
  rank: number
  rankChange: number
}

// ── API RESPONSES ──────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}
