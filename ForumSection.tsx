'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Flame, ChevronRight, Plus } from 'lucide-react'
import Link from 'next/link'
import { formatRelativeTime } from '@/lib/utils'

const CATEGORIES = [
  { id:'marktplatz',      name:'Marktplatz',      emoji:'🏪', type:'Fire',      color:'#ff5500', grad:'linear-gradient(135deg,#ff5500,#cc2200)', glow:'rgba(255,85,0,0.6)',    posts:1240,
    topics:[{title:'Glurak ex PSA 10 – 200€ VB', user:'PokéTrader_Kai', replies:8, hot:true, time:new Date(Date.now()-720000).toISOString()},{title:'Suche: Mewtu Base Set PSA 9', user:'VintageSammler', replies:12, hot:false, time:new Date(Date.now()-14400000).toISOString()}] },
  { id:'preisdiskussion', name:'Preisdiskussion',  emoji:'📈', type:'Lightning', color:'#FFD700', grad:'linear-gradient(135deg,#FFD700,#cc8800)', glow:'rgba(255,215,0,0.6)',   posts:876,
    topics:[{title:'Pikachu alt art steigt wieder!', user:'SammelFan_NRW', replies:23, hot:true, time:new Date(Date.now()-2040000).toISOString()},{title:'Lohnt PSA-Grading 2026?', user:'GradingPro_DE', replies:34, hot:true, time:new Date(Date.now()-18000000).toISOString()}] },
  { id:'fake-check',      name:'Fake-Check',       emoji:'🔍', type:'Psychic',   color:'#cc44ff', grad:'linear-gradient(135deg,#cc44ff,#7700cc)', glow:'rgba(204,68,255,0.6)', posts:334,
    topics:[{title:'Glurak Base Set echt?', user:'Neueinsteiger_Max', replies:5, hot:false, time:new Date(Date.now()-3600000).toISOString()},{title:'Verdächtige Pikachu Promo', user:'Sammlerin_Eva', replies:9, hot:false, time:new Date(Date.now()-7200000).toISOString()}] },
  { id:'neuigkeiten',     name:'Neuigkeiten',      emoji:'📰', type:'Water',     color:'#00aaff', grad:'linear-gradient(135deg,#00aaff,#0055cc)', glow:'rgba(0,170,255,0.6)',   posts:512,
    topics:[{title:'SV9 – alle Infos!', user:'PokéNews_DE', replies:41, hot:true, time:new Date(Date.now()-7200000).toISOString()},{title:'Cardmarket neue Gebühren 2026', user:'TCG_Reporter', replies:28, hot:true, time:new Date(Date.now()-10800000).toISOString()}] },
  { id:'einsteiger',      name:'Einsteiger',       emoji:'🌱', type:'Grass',     color:'#00cc66', grad:'linear-gradient(135deg,#00cc66,#007733)', glow:'rgba(0,204,102,0.6)',   posts:689,
    topics:[{title:'Wie fange ich an?', user:'FrischerTrainer', replies:17, hot:false, time:new Date(Date.now()-10800000).toISOString()},{title:'Welche Sets für Einsteiger?', user:'NeuerSammler22', replies:11, hot:false, time:new Date(Date.now()-14400000).toISOString()}] },
  { id:'turniere',        name:'Turniere',         emoji:'🏆', type:'Dragon',    color:'#ff9900', grad:'linear-gradient(135deg,#ff9900,#cc5500)', glow:'rgba(255,153,0,0.6)',   posts:201,
    topics:[{title:'Regional Stuttgart 2026!', user:'TurnierOrga', replies:22, hot:true, time:new Date(Date.now()-18000000).toISOString()},{title:'Mein erstes Turnier', user:'TrainerMax', replies:7, hot:false, time:new Date(Date.now()-21600000).toISOString()}] },
]

function CategoryCard({ cat, isActive, onClick }: { cat: typeof CATEGORIES[0]; isActive: boolean; onClick: () => void }) {
  const hasHot = cat.topics.some(t => t.hot)

  return (
    <motion.div
      className="cursor-pointer"
      style={{ '--cat-color': cat.color, '--cat-glow': cat.glow } as React.CSSProperties}
      whileHover={{ y: -10, rotate: -0.8, scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type:'spring', stiffness:320, damping:22 }}
      onClick={onClick}
    >
      {/* Fixed height card */}
      <div
        className="relative rounded-[18px] overflow-hidden bg-[linear-gradient(160deg,rgba(18,12,40,0.97),rgba(8,4,20,0.99))] transition-all duration-300 flex flex-col"
        style={{
          height: '220px',
          boxShadow: isActive ? `0 0 28px ${cat.glow}, 0 0 0 2.5px ${cat.color}` : `0 0 0 2px ${cat.color}88`,
        }}
      >
        {/* Top stripe */}
        <div className="h-[5px] w-full flex-shrink-0" style={{ background: cat.grad }}/>

        {/* Header */}
        <div className="flex justify-between items-center px-3 pt-2 pb-0 flex-shrink-0">
          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border"
            style={{ color:cat.color, background:`${cat.color}14`, borderColor:`${cat.color}40` }}>
            {cat.type}
          </span>
          <span className="text-[9px] font-semibold text-white/25">{cat.posts.toLocaleString('de-DE')}</span>
        </div>

        {/* Icon – fixed size */}
        <div className="flex items-center justify-center flex-shrink-0 py-2 relative">
          <span className="text-[44px] leading-none select-none" style={{ filter:`drop-shadow(0 3px 12px ${cat.glow})` }}>
            {cat.emoji}
          </span>
          {hasHot && (
            <span className="absolute top-1 right-3 flex items-center gap-0.5 bg-red-950/70 border border-red-500/40 rounded-md px-1.5 py-0.5 text-[8px] font-black text-red-400">
              <Flame size={7}/> HOT
            </span>
          )}
        </div>

        {/* Name */}
        <div className="px-3 pb-1 font-display text-[18px] tracking-wide text-white flex-shrink-0 leading-tight"
          style={{ textShadow:'0 2px 8px rgba(0,0,0,0.7)' }}>
          {cat.name}
        </div>

        {/* Divider */}
        <div className="mx-3 mb-2 h-px flex-shrink-0" style={{ background:`linear-gradient(90deg,transparent,${cat.color}44,transparent)` }}/>

        {/* Recent posts – fills remaining space */}
        <div className="px-3 pb-3 flex-1 overflow-hidden space-y-1.5">
          {cat.topics.slice(0,2).map((topic, i) => (
            <div key={i} className="flex items-start gap-1.5">
              <div className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0" style={{ background:cat.color, opacity:0.7 }}/>
              <div className="text-[9px] text-white/45 font-medium leading-tight line-clamp-2 overflow-hidden">{topic.title}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default function ForumSection() {
  const [activeCat, setActiveCat] = useState<string | null>(null)
  const cat = CATEGORIES.find(c => c.id === activeCat)
  const allPosts = CATEGORIES.flatMap(c => c.topics.map(t => ({ ...t, catName:c.name, color:c.color })))
  const posts = cat ? cat.topics.map(t => ({ ...t, catName:cat.name, color:cat.color })) : allPosts

  return (
    <section className="relative z-10 py-20 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-violet-400 uppercase tracking-widest mb-2">
              <MessageSquare size={13}/> Community
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">Forum</h2>
            <p className="text-sm text-white/35 font-normal mt-1">Deutschlands aktivste Pokémon-Karten-Community</p>
          </div>
          <Link href="/forum" className="text-sm font-semibold text-violet-300 hover:text-violet-200 transition-colors flex items-center gap-1">
            Zum Forum <ChevronRight size={15}/>
          </Link>
        </div>

        {/* Category cards – uniform grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {CATEGORIES.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.05 }}>
              <CategoryCard
                cat={c}
                isActive={activeCat === c.id}
                onClick={() => setActiveCat(activeCat === c.id ? null : c.id)}
              />
            </motion.div>
          ))}
        </div>

        {/* Active filter tag */}
        <AnimatePresence>
          {cat && (
            <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
              className="flex items-center gap-3 mb-4 flex-wrap">
              <div className="flex items-center gap-2 rounded-full px-3 py-1.5 border text-sm font-semibold"
                style={{ background:`${cat.color}14`, borderColor:`${cat.color}44`, color:cat.color }}>
                <span>{cat.emoji}</span> {cat.name}
              </div>
              <button onClick={() => setActiveCat(null)}
                className="text-xs text-white/40 hover:text-white/70 border border-white/10 rounded-full px-3 py-1.5 hover:border-white/20 transition-all">
                × Filter entfernen
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Posts */}
        <div className="space-y-2.5">
          <div className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">
            {cat ? `${cat.emoji} ${cat.name}` : 'Neueste Beiträge'}
          </div>
          {posts.slice(0,6).map((post, i) => (
            <motion.div key={i}
              initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.04 }}
              className="group flex items-start gap-3 bg-white/2 border border-white/5 rounded-2xl px-5 py-4 hover:bg-white/4 hover:border-violet-800/22 hover:translate-x-0.5 transition-all cursor-pointer"
            >
              <span className="text-[9px] font-black px-2.5 py-1 rounded-full flex-shrink-0 mt-0.5 uppercase tracking-wider"
                style={{ background:`${post.color}14`, color:post.color, border:`1px solid ${post.color}28` }}>
                {post.catName}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white/88 leading-snug group-hover:text-white transition-colors">
                  {post.title}
                  {post.hot && (
                    <span className="ml-2 inline-flex items-center gap-0.5 text-[8px] font-black px-1.5 py-0.5 rounded-full bg-red-950/60 border border-red-500/28 text-red-400">
                      <Flame size={7}/> HOT
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-white/28 mt-1 font-normal">
                  {post.user} · {formatRelativeTime(post.time)} · {post.replies} Antworten
                </div>
              </div>
              <ChevronRight size={13} className="text-white/18 group-hover:text-white/45 flex-shrink-0 mt-1 transition-colors"/>
            </motion.div>
          ))}
        </div>

        {/* New post button */}
        <div className="mt-5">
          <Link href="/forum"
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl border border-dashed border-violet-700/30 bg-violet-950/10 text-sm font-semibold text-violet-400 hover:border-violet-600/50 hover:bg-violet-950/25 transition-all">
            <Plus size={15}/> Neuen Beitrag erstellen
          </Link>
        </div>
      </div>
    </section>
  )
}
