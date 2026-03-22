// src/lib/tcgdex.ts
// TCGdex API Client – Karten & Preise

const BASE_URL = 'https://api.tcgdex.net/v2/en'

export interface TcgSet {
  id: string
  name: string
  serie?: { id: string; name: string }
  cardCount?: { total: number; official: number }
  releaseDate?: string
  logo?: string
  symbol?: string
}

export interface TcgCard {
  id: string
  localId: string
  name: string
  image?: string
  rarity?: string
  types?: string[]
  supertype?: string
  set: { id: string; name: string }
  variants?: {
    normal?: boolean
    reverse?: boolean
    holo?: boolean
    firstEdition?: boolean
  }
}

export interface TcgCardWithPrices extends TcgCard {
  pricing?: {
    cardmarket?: {
      updatedAt?: string
      prices?: {
        averageSellPrice?: number
        lowPrice?: number
        trendPrice?: number
        germanProLow?: number
        suggestedPrice?: number
        reverseHoloSell?: number
        reverseHoloLow?: number
        reverseHoloTrend?: number
        lowPriceExPlus?: number
        avg1?: number
        avg7?: number
        avg30?: number
        reverseHoloAvg1?: number
        reverseHoloAvg7?: number
        reverseHoloAvg30?: number
      }
    }
  }
}

// Alle Sets laden
export async function fetchAllSets(): Promise<TcgSet[]> {
  const res = await fetch(`${BASE_URL}/sets`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`TCGdex Sets Error: ${res.status}`)
  return res.json()
}

// Ein Set mit allen Karten laden
export async function fetchSetWithCards(setId: string): Promise<TcgSet & { cards: TcgCard[] }> {
  const res = await fetch(`${BASE_URL}/sets/${setId}`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`TCGdex Set Error: ${res.status}`)
  return res.json()
}

// Eine einzelne Karte mit Preisen laden
export async function fetchCard(cardId: string): Promise<TcgCardWithPrices> {
  const res = await fetch(`${BASE_URL}/cards/${cardId}`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`TCGdex Card Error: ${res.status}`)
  return res.json()
}

// Bild-URL für eine Karte bauen
export function getCardImageUrl(card: TcgCard, quality: 'low' | 'high' = 'low'): string {
  if (card.image) {
    return `${card.image}/${quality}.webp`
  }
  return '/placeholder-card.png'
}

// Preis aus TCGdex-Antwort extrahieren (EUR)
export function extractPrices(card: TcgCardWithPrices) {
  const cm = card.pricing?.cardmarket?.prices
  if (!cm) return null
  return {
    price_low:        cm.lowPrice ?? null,
    price_mid:        cm.avg7 ?? null,
    price_high:       cm.avg30 ?? null,
    price_market:     cm.averageSellPrice ?? null,
    price_foil_low:   cm.reverseHoloLow ?? null,
    price_foil_mid:   cm.reverseHoloAvg7 ?? null,
    price_foil_high:  cm.reverseHoloAvg30 ?? null,
    price_foil_market:cm.reverseHoloSell ?? null,
  }
}
