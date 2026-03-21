'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, ChevronRight, Flame } from 'lucide-react'
import Link from 'next/link'
import { formatRelativeTime } from '@/lib/utils'

const FORUM_CATEGORIES = [
  {
    id: 'marktplatz', name: 'Marktplatz', emoji: '🏪', type: 'Fire', color: '#ff5500',
    grad: 'linear-gradient(135deg,#ff5500,#cc2200)', glow: 'rgba(255,85,0,0.55)',
    posts: 1240,
    topics: [
      { title: 'Glurak ex PSA 10 – 200€ VB', user: 'PokéTrader_Kai', replies: 8, hot: true, time: new Date(Date.now()-720000).toISOString() },
      { title: 'Suche: Mewtu Base Set PSA 9 oder besser', user: 'VintageSammler', replies: 12, hot: false, time: new Date(Date.now()-14400000).toISOString() },
    ],
  },
  {
    id: 'preisdiskussion', name: 'Preisdiskussion', emoji: '📈', type: 'Lightning', color: '#FFD700',
    grad: 'linear-gradient(135deg,#FFD700,#cc8800)', glow: 'rgba(255,215,0,0.55)',
    posts: 876,
    topics: [
      { title: 'Warum steigt Pikachu alt art gerade so stark?', user: 'SammelFan_NRW', replies: 23, hot: true, time: new Date(Date.now()-2040000).toISOString() },
      { title: 'Lohnt sich PSA-Grading noch 2026?', user: 'GradingPro_DE', replies: 34, hot: true, time: new Date(Date.now()-18000000).toISOString() },
    ],
  },
  {
    id: 'fake-check', name: 'Fake-Check', emoji: '🔍', type: 'Psychic', color: '#cc44ff',
    grad: 'linear-gradient(135deg,#cc44ff,#7700cc)', glow: 'rgba(204,68,255,0.55)',
    posts: 334,
    topics: [
      { title: 'Ist diese Glurak Base Set echt?', user: 'Neueinsteiger_Max', replies: 5, hot: false, time: new Date(Date.now()-3600000).toISOString() },
      { title: 'Verdächtige Pikachu Promo – bitte checken!', user: 'Sammlerin_Eva', replies: 9, hot: false, time: new Date(Date.now()-7200000).toISOString() },
    ],
  },
  {
    id: 'neuigkeiten', name: 'Neuigkeiten', emoji: '📰', type: 'Water', color: '#00aaff',
    grad: 'linear-gradient(135deg,#00aaff,#0055cc)', glow: 'rgba(0,170,255,0.55)',
    posts: 512,
    topics: [
      { title: 'Neues Set Scarlet & Violet 9 – alle Infos!', user: 'PokéNews_DE', replies: 41, hot: true, time: new Date(Date.now()-7200000).toISOString() },
      { title: 'Cardmarket ändert Gebührenstruktur 2026', user: 'TCG_Reporter', replies: 28, hot: true, time: new Date(Date.now()-10800000).toISOString() },
    ],
  },
  {
    id: 'einsteiger', name: 'Einsteiger', emoji: '🌱', type: 'Grass', color: '#00cc66',
    grad: 'linear-gradient(135deg,#00cc66,#007733)', glow: 'rgba(0,204,102,0.55)',
    posts: 689,
    topics: [
      { title: 'Wie fange ich am besten mit dem Sammeln an?', user: 'FrischerTrainer', replies: 17, hot: false, time: new Date(Date.now()-10800000).toISOString() },
      { title: 'Welche Sets sind für Einsteiger empfehlenswert?', user: 'NeuerSammler22', replies: 11, hot: false, time: new Date(Date.now()-14400000).toISOString() },
    ],
  },
  {
    id: 'turniere', name: 'Turniere & Events', emoji: '🏆', type: 'Dragon', color: '#ff9900',
    grad: 'linear-gradient(135deg,#ff9900,#cc5500)', glow: 'rgba(255,153,0,0.55)',
    posts: 201,
    topics: [
      { title: 'Regional Stuttgart 2026 – Anmeldung offen!', user: 'TurnierOrga', replies: 22, hot: true, time: new Date(Date.now()-18000000).toISOString() },
      { title: 'Mein erstes Turnier – Erfahrungsbericht', user: 'TrainerMax', replies: 7, hot: false, time: new Date(Date.now()-21600000).toISOString() },
    ],
  },
]

function CategoryCard({ cat, isActive, onClick }: { cat: typeof FORUM_CATEGORIES[0]; isActive: boolean; onClick: () => void }) {
  const hasHot = cat.topics.some(t => t.hot)
  return (
    <motion.div
      className="forum-cat-card cursor-pointer"
      style={{ '--cat-color': cat.color, '--cat-glow': cat.glow } as React.CSSProperties}
      whileHover={{ y: -12, rotate: -1, scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={onClick}
    >
      <div className={`relative rounded-[18px] overflow-hidden bg-[linear-gradient(160deg,rgba(18,12,40,0.97),rgba(8,4,20,0.99))] transition-all duration-300 ${isActive ? 'ring-2' : ''}`}
        style={isActive ? { ringColor: cat.color, boxShadow: `0 0 24px ${cat.glow}` } : {}}>

        {/* Holo foil */}
        <div className="absolute inset-0 z-20 pointer-events-none rounded-[18px] opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: `linear-gradient(110deg,transparent 28%,rgba(255,255,255,0.04) 38%,${cat.color}18 46%,rgba(255,255,255,0.03) 55%,transparent 70%)` }}/>

        {/* Colored border */}
        <div className="forum-cat-border" style={{ borderColor: cat.color }}/>

        {/* Top stripe */}
        <div className="h-[6px] w-full" style={{ background: cat.grad }}/>

        {/* Header */}
        <div className="flex justify-between items-center px-3.5 pt-2.5 pb-1">
          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border"
            style={{ color: cat.color, background: `${cat.color}15`, borderColor: `${cat.color}44` }}>
            {cat.type}
          </span>
          <span className="text-[10px] font-bold text-white/25">{cat.posts.toLocaleString('de-DE')}</span>
        </div>

        {/* Icon */}
        <div className="flex items-center justify-center py-3 relative">
          <span className="text-5xl leading-none" style={{ filter: `drop-shadow(0 4px 14px ${cat.glow})` }}>
            {cat.emoji}
          </span>
          {hasHot && (
            <span className="absolute top-2 right-3 flex items-center gap-1 bg-red-950/60 border border-red-500/40 rounded-lg px-1.5 py-0.5 text-[8px] font-black text-red-400 hot-badge">
              <Flame size={8}/> HOT
            </span>
          )}
        </div>

        {/* Name */}
        <div className="px-3.5 pb-1 font-display text-xl tracking-wider text-white"
          style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
          {cat.name}
        </div>

        {/* Divider */}
        <div className="mx-3.5 my-2 h-px" style={{ background: `linear-gradient(90deg,transparent,${cat.color}44,transparent)` }}/>

        {/* Recent topics */}
        <div className="px-3.5 pb-3.5 space-y-1.5">
          {cat.topics.map((topic, i) => (
            <div key={i} className="flex items-start gap-1.5">
              <div className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0" style={{ background: cat.color, opacity: 0.7 }}/>
              <div className="text-[10px] text-white/50 font-medium leading-tight line-clamp-2">{topic.title}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default function ForumSection() {
  const [activeCat, setActiveCat] = useState<string | null>(null)
  const cat = activeCat ? FORUM_CATEGORIES.find(c => c.id === activeCat) : null
  const allPosts = FORUM_CATEGORIES.flatMap(c => c.topics.map(t => ({ ...t, cat: c.name, color: c.color })))
  const posts = cat ? cat.topics.map(t => ({ ...t, cat: cat.name, color: cat.color })) : allPosts

  return (
    <section className="relative z-10 py-20 px-6 bg-gradient-to-b from-transparent via-violet-950/5 to-transparent">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-violet-400 uppercase tracking-widest mb-2">
              <MessageSquare size={13}/>
              Community
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">Forum</h2>
            <p className="text-sm text-white/35 font-normal mt-1">Deutschlands aktivste Pokémon-Karten-Community</p>
          </div>
          <Link href="/forum" className="text-sm font-semibold text-violet-300 hover:text-violet-200 transition-colors flex items-center gap-1">
            Zum Forum <ChevronRight size={15}/>
          </Link>
        </div>

        {/* Category cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {FORUM_CATEGORIES.map(c => (
            <CategoryCard
              key={c.id} cat={c}
              isActive={activeCat === c.id}
              onClick={() => setActiveCat(activeCat === c.id ? null : c.id)}
            />
          ))}
        </div>

        {/* Filter badge */}
        <AnimatePresence>
          {cat && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-3 mb-4 flex-wrap"
            >
              <div className="flex items-center gap-2 rounded-full px-3 py-1.5 border text-sm font-semibold"
                style={{ background: `${cat.color}14`, borderColor: `${cat.color}44`, color: cat.color }}>
                <span>{cat.emoji}</span> {cat.name}
              </div>
              <button onClick={() => setActiveCat(null)}
                className="text-xs text-white/40 hover:text-white/70 border border-white/10 rounded-full px-3 py-1.5 hover:border-white/20 transition-all">
                × Filter entfernen
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Posts list */}
        <div className="space-y-2.5">
          <div className="text-sm font-semibold text-white/60 mb-4">
            {cat ? `${cat.emoji} ${cat.name}` : 'Alle neuesten Beiträge'}
          </div>
          {posts.slice(0, 6).map((post, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group flex items-start gap-3 bg-white/2 border border-white/5 rounded-2xl px-5 py-4 hover:bg-white/4 hover:border-violet-800/25 hover:translate-x-1 transition-all cursor-pointer"
            >
              <span className="text-[9px] font-black px-2.5 py-1 rounded-full flex-shrink-0 mt-0.5 tracking-wider uppercase"
                style={{ background: `${post.color}14`, color: post.color, border: `1px solid ${post.color}28` }}>
                {post.cat}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white/88 leading-snug group-hover:text-white transition-colors">
                  {post.title}
                  {post.hot && (
                    <span className="ml-2 inline-flex items-center gap-0.5 text-[8px] font-black px-1.5 py-0.5 rounded-full bg-red-950/60 border border-red-500/30 text-red-400 hot-badge">
                      <Flame size={7}/> HOT
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-white/28 mt-1 font-normal">
                  {post.user} · {formatRelativeTime(post.time)} · {post.replies} Antworten
                </div>
              </div>
              <ChevronRight size={14} className="text-white/20 group-hover:text-white/50 flex-shrink-0 mt-0.5 transition-colors"/>
            </motion.div>
          ))}
        </div>

        {/* New post button */}
        <div className="mt-6">
          <Link href="/forum"
            className="block w-full py-3.5 rounded-2xl border border-dashed border-violet-700/30 bg-violet-950/10 text-center text-sm font-semibold text-violet-400 hover:border-violet-600/50 hover:bg-violet-950/25 transition-all">
            + Neuen Beitrag erstellen
          </Link>
        </div>
      </div>
    </section>
  )
}
