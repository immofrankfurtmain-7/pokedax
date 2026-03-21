'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Plus, Tag, MessageSquare, X, Check, ChevronRight, Filter } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

const MOCK_LISTINGS = [
  {
    id: 1, cardName: 'Glurak ex', set: 'Karmesin & Purpur', condition: 'NearMint',
    askPrice: 185, seller: 'PokéTrader_Kai', sellerRating: 4.9,
    img: 'https://images.pokemontcg.io/sv1/6_hires.png',
    desc: 'Top Zustand, keine Knicke, wird in Sleeve geliefert.',
    offers: 3, isVerified: true, createdAt: '2026-03-19',
  },
  {
    id: 2, cardName: 'Pikachu ex Alt Art', set: 'Paldeas Schicksale', condition: 'Mint',
    askPrice: 42, seller: 'SammelFan_NRW', sellerRating: 4.7,
    img: 'https://images.pokemontcg.io/sv4pt5/86_hires.png',
    desc: 'Direkt aus dem Booster, sofort eingesleevt.',
    offers: 1, isVerified: false, createdAt: '2026-03-20',
  },
  {
    id: 3, cardName: 'Glurak 1st Ed.', set: 'Basis-Set 1999', condition: 'Good',
    askPrice: 1100, seller: 'VintageSammler', sellerRating: 5.0,
    img: 'https://images.pokemontcg.io/base1/4_hires.png',
    desc: 'Original Base Set Glurak aus 1999. Leichte Gebrauchsspuren, sehr seltenes Stück.',
    offers: 7, isVerified: true, createdAt: '2026-03-18',
  },
  {
    id: 4, cardName: 'Lapras V Alt Art', set: 'Kampfstile', condition: 'Excellent',
    askPrice: 65, seller: 'TCG_Profi', sellerRating: 4.8,
    img: 'https://images.pokemontcg.io/swsh5/49_hires.png',
    desc: 'Schöne Alt Art in gutem Zustand.',
    offers: 0, isVerified: true, createdAt: '2026-03-21',
  },
]

const CONDITIONS = ['Alle', 'PSA10', 'PSA9', 'Mint', 'NearMint', 'Excellent', 'Good']

function ListingCard({ listing, onClick }: { listing: typeof MOCK_LISTINGS[0]; onClick: () => void }) {
  const [imgErr, setImgErr] = useState(false)
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type:'spring', stiffness:300, damping:20 }}
      onClick={onClick}
      className="bg-white/2 border border-white/6 rounded-2xl overflow-hidden cursor-pointer hover:bg-white/4 hover:border-violet-800/25 transition-all group"
    >
      {/* Card image */}
      <div className="relative bg-white/3 aspect-[3/2] flex items-center justify-center overflow-hidden">
        {!imgErr
          ? <img src={listing.img} alt={listing.cardName} className="h-full object-contain group-hover:scale-105 transition-transform duration-300" onError={() => setImgErr(true)}/>
          : <div className="text-5xl">✨</div>
        }
        <div className="absolute top-2 right-2">
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white/60 border border-white/10">{listing.condition}</span>
        </div>
        {listing.isVerified && (
          <div className="absolute top-2 left-2">
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-violet-900/80 border border-violet-600/40 text-violet-300">✓ Verified</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="text-sm font-bold text-white/88 mb-0.5 truncate">{listing.cardName}</div>
        <div className="text-[10px] text-white/30 font-medium mb-3">{listing.set}</div>

        <div className="flex items-center justify-between">
          <div className="text-xl font-black text-white">{formatCurrency(listing.askPrice)}</div>
          <div className="text-[10px] text-white/35 flex items-center gap-1">
            <MessageSquare size={9}/>
            {listing.offers} {listing.offers === 1 ? 'Angebot' : 'Angebote'}
          </div>
        </div>

        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/5">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-600 to-purple-500 flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0">
            {listing.seller[0].toUpperCase()}
          </div>
          <span className="text-[10px] text-white/40 font-medium truncate">{listing.seller}</span>
          <span className="ml-auto text-[10px] font-bold text-yellow-400">★ {listing.sellerRating}</span>
        </div>
      </div>
    </motion.div>
  )
}

function ListingDetail({ listing, onClose }: { listing: typeof MOCK_LISTINGS[0]; onClose: () => void }) {
  const [offerPrice, setOfferPrice] = useState('')
  const [message,    setMessage]    = useState('')
  const [offered,    setOffered]    = useState(false)
  const [imgErr,     setImgErr]     = useState(false)

  return (
    <motion.div
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity:0, scale:0.95, y:20 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:0.95 }}
        className="bg-[rgba(10,6,24,0.98)] border border-violet-800/30 rounded-2xl w-full max-w-lg shadow-[0_28px_80px_rgba(0,0,0,0.7)] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h3 className="text-base font-black text-white">{listing.cardName}</h3>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors"><X size={18}/></button>
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Image + price */}
          <div className="flex gap-4">
            <div className="w-24 flex-shrink-0 rounded-xl overflow-hidden bg-white/3 aspect-[3/4] flex items-center justify-center">
              {!imgErr
                ? <img src={listing.img} alt="" className="w-full h-full object-contain" onError={() => setImgErr(true)}/>
                : <span className="text-3xl">✨</span>
              }
            </div>
            <div>
              <div className="text-xs text-white/35 mb-1">{listing.set}</div>
              <div className="text-2xl font-black text-white mb-2">{formatCurrency(listing.askPrice)}</div>
              <div className="text-xs text-white/40 mb-3 leading-relaxed">{listing.desc}</div>
              <div className="flex flex-wrap gap-2">
                <span className="text-[9px] font-bold px-2 py-1 rounded-full bg-white/6 text-white/50 border border-white/8">{listing.condition}</span>
                {listing.isVerified && <span className="text-[9px] font-bold px-2 py-1 rounded-full bg-violet-900/60 text-violet-300 border border-violet-600/30">✓ Verified Seller</span>}
              </div>
            </div>
          </div>

          {/* Seller info */}
          <div className="flex items-center gap-3 bg-white/3 border border-white/6 rounded-xl p-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-purple-500 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
              {listing.seller[0].toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-semibold text-white/80">{listing.seller}</div>
              <div className="text-[10px] text-white/35 font-medium">★ {listing.sellerRating} Bewertung · {listing.offers} Angebote erhalten</div>
            </div>
          </div>

          {/* Make offer */}
          {!offered ? (
            <div className="bg-violet-950/30 border border-violet-800/25 rounded-xl p-4 space-y-3">
              <h4 className="text-sm font-bold text-white/80">Angebot machen</h4>
              <input type="number" value={offerPrice} onChange={e => setOfferPrice(e.target.value)}
                placeholder={`Angebotspreis (z.B. ${Math.round(listing.askPrice * 0.9)})`}
                className="w-full bg-white/4 border border-white/9 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/15 transition-all"/>
              <textarea value={message} onChange={e => setMessage(e.target.value)}
                rows={2} placeholder="Nachricht an den Verkäufer (optional)…"
                className="w-full bg-white/4 border border-white/9 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/15 transition-all resize-none"/>
              <div className="flex gap-2">
                <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 text-sm font-semibold hover:text-white hover:border-white/20 transition-all">Abbrechen</button>
                <button onClick={() => setOffered(true)}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 text-white text-sm font-bold shadow-[0_6px_20px_rgba(124,58,237,0.4)] hover:-translate-y-0.5 transition-all">
                  Angebot senden
                </button>
              </div>
            </div>
          ) : (
            <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
              className="flex flex-col items-center gap-3 py-6 text-center">
              <div className="w-12 h-12 rounded-full bg-green-950/60 border border-green-500/40 flex items-center justify-center">
                <Check size={22} className="text-green-400"/>
              </div>
              <div className="text-base font-black text-white">Angebot gesendet!</div>
              <div className="text-sm text-white/45">Der Verkäufer wird benachrichtigt und kann dein Angebot annehmen oder ablehnen.</div>
              <button onClick={onClose} className="mt-2 text-sm text-violet-400 hover:text-violet-300 font-semibold transition-colors">Schließen</button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function MarketplacePage() {
  const [selected,   setSelected]   = useState<typeof MOCK_LISTINGS[0] | null>(null)
  const [condition,  setCondition]  = useState('Alle')
  const [showCreate, setShowCreate] = useState(false)

  const filtered = MOCK_LISTINGS.filter(l => condition === 'Alle' || l.condition === condition)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <div className="text-[11px] font-bold text-violet-400 uppercase tracking-widest mb-1.5">Dashboard</div>
          <h1 className="text-3xl font-black text-white tracking-tight">Marktplatz</h1>
          <p className="text-white/40 text-sm mt-1">Kaufe und verkaufe direkt an andere Sammler</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 text-white text-sm font-bold shadow-[0_6px_20px_rgba(124,58,237,0.4)] hover:shadow-[0_10px_28px_rgba(124,58,237,0.55)] hover:-translate-y-0.5 transition-all">
          <Plus size={15}/> Karte inserieren
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap mb-6">
        <Filter size={13} className="text-white/30"/>
        {CONDITIONS.map(c => (
          <button key={c} onClick={() => setCondition(c)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
              condition === c
                ? 'bg-violet-600/25 text-violet-200 border-violet-600/40'
                : 'bg-white/4 text-white/40 border-white/8 hover:text-white/65 hover:border-white/16'
            }`}>
            {c}
          </button>
        ))}
      </div>

      {/* Listings grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((listing, i) => (
          <motion.div key={listing.id} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay: i * 0.06 }}>
            <ListingCard listing={listing} onClick={() => setSelected(listing)}/>
          </motion.div>
        ))}
      </div>

      {/* Detail modal */}
      <AnimatePresence>
        {selected && <ListingDetail listing={selected} onClose={() => setSelected(null)}/>}
      </AnimatePresence>

      {/* Create listing modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
            onClick={() => setShowCreate(false)}>
            <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.95 }}
              className="bg-[rgba(10,6,24,0.98)] border border-violet-800/30 rounded-2xl w-full max-w-md p-6 shadow-[0_28px_80px_rgba(0,0,0,0.7)]"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-black text-white">Karte inserieren</h3>
                <button onClick={() => setShowCreate(false)} className="text-white/30 hover:text-white transition-colors"><X size={18}/></button>
              </div>
              <div className="space-y-3">
                <input placeholder="Kartenname suchen…" className="w-full bg-white/4 border border-white/9 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/15 transition-all"/>
                <select className="w-full bg-white/4 border border-white/9 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500/60 transition-all">
                  <option value="">Zustand wählen</option>
                  {['PSA10','PSA9','PSA8','Mint','NearMint','Excellent','Good','Poor'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input type="number" placeholder="Verkaufspreis (€)" className="w-full bg-white/4 border border-white/9 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-violet-500/60 transition-all"/>
                <textarea rows={3} placeholder="Beschreibung (Zustand, Besonderheiten…)"
                  className="w-full bg-white/4 border border-white/9 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-violet-500/60 transition-all resize-none"/>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowCreate(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 text-sm font-semibold hover:text-white hover:border-white/20 transition-all">Abbrechen</button>
                <button className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 text-white text-sm font-bold shadow-[0_6px_20px_rgba(124,58,237,0.4)] hover:-translate-y-0.5 transition-all">Inserieren</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
