'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Flame, Plus, Search, ChevronRight, X, ArrowUp, Clock, Tag } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { formatRelativeTime } from '@/lib/utils'

const CATEGORIES = [
  { id:'marktplatz',      name:'Marktplatz',        emoji:'ðŸª', color:'#ff5500', grad:'linear-gradient(135deg,#ff5500,#cc2200)', glow:'rgba(255,85,0,0.55)',   type:'Fire',      posts:1240 },
  { id:'preisdiskussion', name:'Preisdiskussion',   emoji:'ðŸ“ˆ', color:'#FFD700', grad:'linear-gradient(135deg,#FFD700,#cc8800)', glow:'rgba(255,215,0,0.55)',  type:'Lightning', posts:876  },
  { id:'fake-check',      name:'Fake-Check',        emoji:'ðŸ”', color:'#cc44ff', grad:'linear-gradient(135deg,#cc44ff,#7700cc)', glow:'rgba(204,68,255,0.55)', type:'Psychic',   posts:334  },
  { id:'neuigkeiten',     name:'Neuigkeiten',       emoji:'ðŸ“°', color:'#00aaff', grad:'linear-gradient(135deg,#00aaff,#0055cc)', glow:'rgba(0,170,255,0.55)',  type:'Water',     posts:512  },
  { id:'einsteiger',      name:'Einsteiger',        emoji:'ðŸŒ±', color:'#00cc66', grad:'linear-gradient(135deg,#00cc66,#007733)', glow:'rgba(0,204,102,0.55)',  type:'Grass',     posts:689  },
  { id:'turniere',        name:'Turniere & Events', emoji:'ðŸ†', color:'#ff9900', grad:'linear-gradient(135deg,#ff9900,#cc5500)', glow:'rgba(255,153,0,0.55)',  type:'Dragon',    posts:201  },
  { id:'premium-lounge',  name:'Premium Lounge',    emoji:'ðŸ’Ž', color:'#FFD700', grad:'linear-gradient(135deg,#FFD700,#aa7700)', glow:'rgba(255,215,0,0.55)',  type:'â­',         posts:89, premium:true },
]

const ALL_POSTS = [
  { id:'1',  catId:'marktplatz',      title:'Glurak ex PSA 10 zu verkaufen â€“ 200â‚¬ VB',                        author:'PokÃ©Trader_Kai',   time:new Date(Date.now()-720000).toISOString(),    replies:8,  upvotes:24, hot:true,  tags:['Verkauf','PSA','Glurak'] },
  { id:'2',  catId:'preisdiskussion', title:'Warum steigt Pikachu alt art gerade so stark?',                  author:'SammelFan_NRW',    time:new Date(Date.now()-2040000).toISOString(),   replies:23, upvotes:51, hot:true,  tags:['Pikachu','Preis','Alt Art'] },
  { id:'3',  catId:'fake-check',      title:'Ist diese Glurak Base Set echt? Bitte checken!',                 author:'Neueinsteiger_Max', time:new Date(Date.now()-3600000).toISOString(),   replies:5,  upvotes:9,  hot:false, tags:['Glurak','Base Set','Fake'] },
  { id:'4',  catId:'neuigkeiten',     title:'Neues Set Scarlet & Violet 9 â€“ alle Infos zu den neuen Karten!', author:'PokÃ©News_DE',      time:new Date(Date.now()-7200000).toISOString(),   replies:41, upvotes:88, hot:true,  tags:['News','SV9','Set'] },
  { id:'5',  catId:'einsteiger',      title:'Wie fange ich am besten mit dem Sammeln an 2026?',               author:'FrischerTrainer',  time:new Date(Date.now()-10800000).toISOString(),  replies:17, upvotes:32, hot:false, tags:['Einsteiger','Tipps'] },
  { id:'6',  catId:'marktplatz',      title:'[Suche] Mewtu Base Set PSA 9 oder besser',                       author:'VintageSammler',   time:new Date(Date.now()-14400000).toISOString(),  replies:12, upvotes:7,  hot:false, tags:['Suche','Mewtwo','Vintage'] },
  { id:'7',  catId:'preisdiskussion', title:'Lohnt sich PSA-Grading noch 2026? Meine Erfahrungen',            author:'GradingPro_DE',    time:new Date(Date.now()-18000000).toISOString(),  replies:34, upvotes:73, hot:true,  tags:['PSA','Grading','Investment'] },
  { id:'8',  catId:'turniere',        title:'Regional Stuttgart 2026 â€“ Anmeldung jetzt offen!',               author:'TurnierOrga',      time:new Date(Date.now()-21600000).toISOString(),  replies:22, upvotes:45, hot:true,  tags:['Turnier','Stuttgart','Event'] },
  { id:'9',  catId:'fake-check',      title:'VerdÃ¤chtige Pikachu Promo â€“ kann das jemand einschÃ¤tzen?',       author:'Sammlerin_Eva',    time:new Date(Date.now()-28800000).toISOString(),  replies:9,  upvotes:14, hot:false, tags:['Pikachu','Promo','Fake'] },
  { id:'10', catId:'einsteiger',      title:'Welche Sets sind fÃ¼r Einsteiger 2026 am empfehlenswertesten?',   author:'NeuerSammler22',   time:new Date(Date.now()-36000000).toISOString(),  replies:11, upvotes:21, hot:false, tags:['Einsteiger','Sets'] },
  { id:'11', catId:'neuigkeiten',     title:'Cardmarket Ã¤ndert GebÃ¼hrenstruktur â€“ was bedeutet das fÃ¼r uns?', author:'TCG_Reporter',     time:new Date(Date.now()-43200000).toISOString(),  replies:28, upvotes:62, hot:true,  tags:['Cardmarket','GebÃ¼hren','News'] },
  { id:'12', catId:'marktplatz',      title:'Biete: VollstÃ¤ndiges Paldeas Schicksale Set NM',                 author:'SetKollektionÃ¤r',  time:new Date(Date.now()-50400000).toISOString(),  replies:6,  upvotes:18, hot:false, tags:['Verkauf','Set','Paldeas'] },
]

type SortMode = 'hot' | 'new' | 'top'
type Post     = typeof ALL_POSTS[0]
type Cat      = typeof CATEGORIES[0]

// â”€â”€ Category Card (TCG-Karten-Style) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function CategoryCard({ cat, isActive, onClick }: { cat: Cat; isActive: boolean; onClick: () => void }) {
  return (
    <motion.div
      className="cursor-pointer"
      whileHover={{ y: -10, rotate: -1, scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={onClick}
    >
      <div className="relative rounded-[18px] overflow-hidden bg-[linear-gradient(160deg,rgba(18,12,40,0.97),rgba(8,4,20,0.99))] transition-all duration-300"
        style={isActive ? { boxShadow: `0 0 0 2px ${cat.color}, 0 12px 30px ${cat.glow}` } : {}}>

        {/* Colored border */}
        <div className="absolute inset-0 rounded-[18px] pointer-events-none z-30 transition-all"
          style={{ border: `3px solid ${cat.color}`, boxShadow: isActive ? `inset 0 0 16px ${cat.glow}` : 'none' }}/>

        {/* Holo shimmer on hover */}
        <div className="absolute inset-0 rounded-[18px] pointer-events-none z-20 opacity-0 group-hover:opacity-100"
          style={{ background:`linear-gradient(110deg,transparent 28%,rgba(255,255,255,0.04) 40%,${cat.color}12 48%,transparent 62%)` }}/>

        {/* Top stripe */}
        <div className="h-[6px]" style={{ background: cat.grad }}/>

        {/* Type badge + posts */}
        <div className="flex justify-between items-center px-3 pt-2.5 pb-1">
          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border"
            style={{ color: cat.color, background: `${cat.color}15`, borderColor: `${cat.color}44` }}>
            {cat.type}
          </span>
          <span className="text-[10px] font-bold text-white/22">{cat.posts.toLocaleString('de-DE')}</span>
        </div>

        {/* Emoji */}
        <div className="flex items-center justify-center py-3">
          <span className="text-5xl leading-none select-none" style={{ filter: `drop-shadow(0 4px 14px ${cat.glow})` }}>
            {cat.emoji}
          </span>
        </div>

        {/* Category name */}
        <div className="px-3 pb-3.5 font-display text-[17px] tracking-wider text-white leading-tight text-center"
          style={{ textShadow: '0 2px 10px rgba(0,0,0,0.7)' }}>
          {cat.name}
        </div>
      </div>
    </motion.div>
  )
}

// â”€â”€ Post Row â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function PostRow({ post, catColor, catEmoji, catName, onOpen }: {
  post: Post; catColor: string; catEmoji: string; catName: string; onOpen: () => void
}) {
  const [voted, setVoted] = useState(false)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="group flex items-start gap-4 bg-white/2 border border-white/5 rounded-2xl px-5 py-4 hover:bg-white/[0.035] hover:border-violet-800/22 hover:translate-x-0.5 transition-all cursor-pointer"
      onClick={onOpen}
    >
      {/* Upvote column */}
      <button
        onClick={e => { e.stopPropagation(); setVoted(!voted) }}
        className={`flex flex-col items-center gap-0.5 flex-shrink-0 mt-0.5 transition-all ${voted ? 'text-violet-400' : 'text-white/20 hover:text-white/50'}`}
      >
        <ArrowUp size={14}/>
        <span className="text-[10px] font-bold leading-none">{post.upvotes + (voted ? 1 : 0)}</span>
      </button>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 flex-wrap mb-1.5">
          <span className="text-[9px] font-black px-2 py-0.5 rounded-full flex-shrink-0 tracking-wider uppercase"
            style={{ background:`${catColor}14`, color:catColor, border:`1px solid ${catColor}28` }}>
            {catEmoji} {catName}
          </span>
          {post.hot && (
            <span className="flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-red-950/60 border border-red-500/30 text-red-400 hot-badge flex-shrink-0">
              <Flame size={7}/> HOT
            </span>
          )}
        </div>

        <h3 className="text-[13.5px] font-semibold text-white/88 leading-snug group-hover:text-white transition-colors mb-1.5">
          {post.title}
        </h3>

        <div className="flex items-center gap-3 flex-wrap text-[10px] text-white/28 font-medium">
          <span>{post.author}</span>
          <span>Â·</span>
          <span className="flex items-center gap-1"><Clock size={9}/>{formatRelativeTime(post.time)}</span>
          <span>Â·</span>
          <span className="flex items-center gap-1"><MessageSquare size={9}/>{post.replies} Antworten</span>
        </div>

        {post.tags.length > 0 && (
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {post.tags.map(tag => (
              <span key={tag} className="flex items-center gap-0.5 text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-white/4 border border-white/6 text-white/28">
                <Tag size={7}/> {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <ChevronRight size={13} className="text-white/18 group-hover:text-white/45 flex-shrink-0 mt-1 transition-colors"/>
    </motion.div>
  )
}

// â”€â”€ Create Post Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function CreatePostModal({ onClose }: { onClose: () => void }) {
  const [title,   setTitle]   = useState('')
  const [content, setContent] = useState('')
  const [catId,   setCatId]   = useState(CATEGORIES[0].id)
  const [tags,    setTags]    = useState('')
  const [done,    setDone]    = useState(false)

  if (done) return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
        className="bg-[rgba(10,6,24,0.98)] border border-violet-800/30 rounded-2xl p-8 max-w-sm w-full text-center">
        <div className="text-5xl mb-4">ðŸŽ‰</div>
        <h3 className="text-xl font-black text-white mb-2">Beitrag erstellt!</h3>
        <p className="text-sm text-white/45 mb-6">Dein Beitrag ist jetzt sichtbar fÃ¼r die Community.</p>
        <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 text-white text-sm font-bold">SchlieÃŸen</button>
      </motion.div>
    </div>
  )

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md" onClick={onClose}>
      <motion.div
        initial={{ opacity:0, scale:0.95, y:20 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:0.95 }}
        className="bg-[rgba(10,6,24,0.98)] border border-violet-800/30 rounded-2xl w-full max-w-lg shadow-[0_28px_80px_rgba(0,0,0,0.75)] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h3 className="text-base font-black text-white">Neuen Beitrag erstellen</h3>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors"><X size={18}/></button>
        </div>

        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Category selector */}
          <div>
            <label className="text-[10px] font-semibold text-white/28 uppercase tracking-widest block mb-2">Kategorie</label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.filter(c => !c.premium).map(cat => (
                <button key={cat.id} onClick={() => setCatId(cat.id)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-left"
                  style={catId === cat.id
                    ? { background:`${cat.color}18`, color:cat.color, borderColor:`${cat.color}44` }
                    : { background:'rgba(255,255,255,0.03)', color:'rgba(255,255,255,0.45)', borderColor:'rgba(255,255,255,0.08)' }}>
                  <span>{cat.emoji}</span> {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-[10px] font-semibold text-white/28 uppercase tracking-widest block mb-1.5">Titel</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Worum geht es in deinem Beitrag?" maxLength={120}
              className="w-full bg-white/4 border border-white/9 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/22 outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/12 transition-all"/>
            <div className="text-right text-[10px] text-white/20 mt-1">{title.length}/120</div>
          </div>

          {/* Content */}
          <div>
            <label className="text-[10px] font-semibold text-white/28 uppercase tracking-widest block mb-1.5">Inhalt</label>
            <textarea value={content} onChange={e => setContent(e.target.value)}
              rows={5} placeholder="Beschreibe dein Anliegen, deine Frage oder deinen Beitrag ausfÃ¼hrlichâ€¦"
              className="w-full bg-white/4 border border-white/9 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/22 outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/12 transition-all resize-none"/>
          </div>

          {/* Tags */}
          <div>
            <label className="text-[10px] font-semibold text-white/28 uppercase tracking-widest block mb-1.5">Tags (kommagetrennt)</label>
            <input value={tags} onChange={e => setTags(e.target.value)}
              placeholder="z.B. Glurak, PSA, Vintage"
              className="w-full bg-white/4 border border-white/9 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/22 outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/12 transition-all"/>
          </div>

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 text-sm font-semibold hover:text-white hover:border-white/20 transition-all">Abbrechen</button>
            <button disabled={!title.trim() || !content.trim()} onClick={() => setDone(true)}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 text-white text-sm font-bold shadow-[0_6px_20px_rgba(124,58,237,0.4)] hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none transition-all">
              VerÃ¶ffentlichen
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// â”€â”€ Post Detail Drawer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function PostDetail({ post, cat, onClose }: { post: Post; cat: Cat; onClose: () => void }) {
  const [reply,   setReply]   = useState('')
  const [replies, setReplies] = useState([
    { author:'PokÃ©Expert_DE', time:new Date(Date.now()-300000).toISOString(),  content:'Super interessante Frage! Ich denke der Grund liegt vor allem daran, dass die Turniersaison beginnt und viele Spieler die Karte brauchen.',    upvotes:12 },
    { author:'SammelFan_NRW', time:new Date(Date.now()-600000).toISOString(),  content:'Stimme zu â€“ hab das auch beobachtet. Cardmarket-Trend zeigt +15% in der letzten Woche. Jetzt verkaufen wÃ¤re aus meiner Sicht klug.', upvotes:8 },
    { author:'VintageSammler', time:new Date(Date.now()-900000).toISOString(), content:'Interessant, ich warte noch etwas ab. Der Peak kÃ¶nnte noch hÃ¶her gehen wenn die neuen Turnierdecks verÃ¶ffentlicht werden.',                  upvotes:5 },
  ])

  const addReply = () => {
    if (!reply.trim()) return
    setReplies(p => [...p, { author:'Du', time:new Date().toISOString(), content:reply, upvotes:0 }])
    setReply('')
  }

  return (
    <div className="fixed inset-0 z-[500] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md" onClick={onClose}>
      <motion.div
        initial={{ opacity:0, y:50 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:50 }}
        className="bg-[rgba(8,4,20,0.99)] border border-violet-800/25 rounded-t-3xl sm:rounded-2xl w-full max-w-2xl shadow-[0_28px_80px_rgba(0,0,0,0.8)] overflow-hidden max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-white/5 flex-shrink-0">
          <span className="text-[9px] font-black px-2.5 py-1 rounded-full tracking-wider uppercase"
            style={{ background:`${cat.color}18`, color:cat.color, border:`1px solid ${cat.color}28` }}>
            {cat.emoji} {cat.name}
          </span>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors"><X size={18}/></button>
        </div>

        {/* Body (scrollable) */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Post content */}
          <div>
            <h2 className="text-xl font-black text-white mb-2 leading-tight">{post.title}</h2>
            <div className="flex gap-3 text-[11px] text-white/28 mb-4 flex-wrap">
              <span className="font-semibold text-white/50">{post.author}</span>
              <span>Â·</span>
              <span>{formatRelativeTime(post.time)}</span>
              <span>Â·</span>
              <span>{post.upvotes} Upvotes</span>
            </div>
            <p className="text-sm text-white/58 leading-relaxed font-normal">
              Hier stÃ¼nde der vollstÃ¤ndige Beitragsinhalt aus der Supabase-Datenbank. Mit echtem Backend kannst du hier Markdown-Inhalte rendern, Kartenbilder einbetten, Code-BlÃ¶cke, Links und alles weitere unterstÃ¼tzen.
            </p>
            <div className="flex gap-1.5 mt-3 flex-wrap">
              {post.tags.map(tag => (
                <span key={tag} className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-white/4 border border-white/7 text-white/28">#{tag}</span>
              ))}
            </div>
          </div>

          {/* Replies */}
          <div>
            <div className="text-[10px] font-bold text-white/35 uppercase tracking-widest mb-4">{replies.length} Antworten</div>
            <div className="space-y-3">
              {replies.map((r, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-purple-500 flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0 mt-0.5">
                    {r.author[0].toUpperCase()}
                  </div>
                  <div className="flex-1 bg-white/3 border border-white/5 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-xs font-bold text-white/80">{r.author}</span>
                      <span className="text-[10px] text-white/25">{formatRelativeTime(r.time)}</span>
                    </div>
                    <p className="text-sm text-white/55 leading-relaxed font-normal">{r.content}</p>
                    <div className="flex items-center gap-1.5 mt-2.5">
                      <button className="flex items-center gap-1 text-white/20 hover:text-violet-400 transition-colors">
                        <ArrowUp size={11}/>
                        <span className="text-[10px] font-semibold">{r.upvotes}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reply input */}
        <div className="px-6 py-4 border-t border-white/5 flex-shrink-0 flex gap-3 bg-[rgba(4,2,14,0.6)]">
          <input
            value={reply} onChange={e => setReply(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addReply() } }}
            placeholder="Antwort schreibenâ€¦ (Enter zum Senden)"
            className="flex-1 bg-white/4 border border-white/9 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/22 outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/12 transition-all"
          />
          <button onClick={addReply} disabled={!reply.trim()}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 text-white text-sm font-bold disabled:opacity-35 disabled:cursor-not-allowed hover:-translate-y-0.5 transition-all flex-shrink-0">
            Senden
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// â”€â”€ MAIN PAGE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function ForumPage() {
  const [activeCat,  setActiveCat]  = useState<string | null>(null)
  const [sortMode,   setSortMode]   = useState<SortMode>('hot')
  const [search,     setSearch]     = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [openPost,   setOpenPost]   = useState<Post | null>(null)

  const cat = activeCat ? CATEGORIES.find(c => c.id === activeCat) : null

  const filtered = ALL_POSTS
    .filter(p => {
      if (activeCat && p.catId !== activeCat) return false
      if (search) {
        const q = search.toLowerCase()
        if (!p.title.toLowerCase().includes(q) && !p.tags.some(t => t.toLowerCase().includes(q)) && !p.author.toLowerCase().includes(q)) return false
      }
      return true
    })
    .sort((a, b) => {
      if (sortMode === 'hot') return (b.upvotes + b.replies * 2) - (a.upvotes + a.replies * 2)
      if (sortMode === 'new') return new Date(b.time).getTime() - new Date(a.time).getTime()
      return b.upvotes - a.upvotes // top
    })

  return (
    <main className="min-h-screen">
      <Navbar/>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} className="mb-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="text-[11px] font-bold text-violet-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <MessageSquare size={12}/> Community
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight">Forum</h1>
              <p className="text-white/40 text-sm mt-1 font-normal">
                {ALL_POSTS.length.toLocaleString('de-DE')} BeitrÃ¤ge Â·{' '}
                <span className="text-green-400 font-semibold">247 online</span>
              </p>
            </div>
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 text-white text-sm font-bold shadow-[0_6px_20px_rgba(124,58,237,0.4)] hover:shadow-[0_10px_28px_rgba(124,58,237,0.55)] hover:-translate-y-0.5 transition-all">
              <Plus size={15}/> Neuer Beitrag
            </button>
          </div>
        </motion.div>

        {/* TCG Category Cards */}
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-10">
          {CATEGORIES.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay: i * 0.05 }}>
              <CategoryCard cat={c} isActive={activeCat === c.id} onClick={() => setActiveCat(activeCat === c.id ? null : c.id)}/>
            </motion.div>
          ))}
        </div>

        {/* Search + sort bar */}
        <div className="flex flex-wrap gap-3 mb-5 items-center">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"/>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="BeitrÃ¤ge, Tags, Autoren suchenâ€¦"
              className="w-full bg-white/4 border border-white/9 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/22 outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/10 transition-all"/>
          </div>

          <div className="flex gap-1 bg-white/4 border border-white/8 rounded-xl p-1">
            {([['hot','ðŸ”¥ Hot'],['new','âœ¨ Neu'],['top','â­ Top']] as [SortMode,string][]).map(([mode, label]) => (
              <button key={mode} onClick={() => setSortMode(mode)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${sortMode === mode ? 'bg-violet-600/35 text-violet-200 border border-violet-600/30' : 'text-white/35 hover:text-white/65'}`}>
                {label}
              </button>
            ))}
          </div>

          {cat && (
            <div className="flex items-center gap-2 rounded-full px-3 py-1.5 border text-xs font-semibold"
              style={{ background:`${cat.color}14`, borderColor:`${cat.color}44`, color:cat.color }}>
              {cat.emoji} {cat.name}
              <button onClick={() => setActiveCat(null)} className="ml-1 opacity-70 hover:opacity-100 text-sm leading-none">Ã—</button>
            </div>
          )}
        </div>

        <div className="text-xs text-white/25 font-medium mb-4">
          {filtered.length} Beitrag{filtered.length !== 1 ? 'e' : ''}{search ? ` fÃ¼r â€ž${search}"` : ''}
        </div>

        {/* Posts */}
        <div className="space-y-2.5">
          <AnimatePresence mode="popLayout">
            {filtered.length > 0
              ? filtered.map(post => {
                  const postCat = CATEGORIES.find(c => c.id === post.catId) ?? CATEGORIES[0]
                  return (
                    <PostRow
                      key={post.id} post={post}
                      catColor={postCat.color} catEmoji={postCat.emoji} catName={postCat.name}
                      onOpen={() => setOpenPost(post)}
                    />
                  )
                })
              : (
                <motion.div key="empty" initial={{ opacity:0 }} animate={{ opacity:1 }} className="text-center py-16">
                  <div className="text-5xl mb-4 opacity-25">ðŸ’¬</div>
                  <div className="text-sm font-medium text-white/30">Keine BeitrÃ¤ge gefunden</div>
                  <button onClick={() => { setSearch(''); setActiveCat(null) }}
                    className="mt-3 text-xs text-violet-400 hover:text-violet-300 font-semibold transition-colors">
                    Filter zurÃ¼cksetzen
                  </button>
                </motion.div>
              )
            }
          </AnimatePresence>
        </div>
      </div>

      <Footer/>

      <AnimatePresence>
        {showCreate && <CreatePostModal onClose={() => setShowCreate(false)}/>}
        {openPost && (() => {
          const postCat = CATEGORIES.find(c => c.id === openPost.catId) ?? CATEGORIES[0]
          return <PostDetail post={openPost} cat={postCat} onClose={() => setOpenPost(null)}/>
        })()}
      </AnimatePresence>
    </main>
  )
}

