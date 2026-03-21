'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, BellOff, Plus, X, TrendingUp, TrendingDown, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'

type AlertCondition = 'above' | 'below'

interface AlertItem {
  id: number
  cardName: string
  cardImg: string
  currentPrice: number
  targetPrice: number
  condition: AlertCondition
  isActive: boolean
  triggered?: boolean
}

const MOCK_ALERTS: AlertItem[] = [
  { id:1, cardName:'Glurak ex',    cardImg:'https://images.pokemontcg.io/sv1/6_hires.png',     currentPrice:189.90, targetPrice:200, condition:'above', isActive:true },
  { id:2, cardName:'Pikachu ex',   cardImg:'https://images.pokemontcg.io/sv4pt5/86_hires.png', currentPrice:44.50,  targetPrice:40,  condition:'below', isActive:true },
  { id:3, cardName:'Mewtwo V',     cardImg:'https://images.pokemontcg.io/swsh11/71_hires.png', currentPrice:12.80,  targetPrice:15,  condition:'above', isActive:false },
]

function AlertCard({ alert, onToggle, onDelete }: { alert: AlertItem; onToggle: (id:number) => void; onDelete: (id:number) => void }) {
  const [imgErr, setImgErr] = useState(false)
  const isUp   = alert.condition === 'above'
  const condColor = isUp ? '#00e676' : '#ff5252'
  const priceDiff = alert.targetPrice - alert.currentPrice
  const pct = ((priceDiff / alert.currentPrice) * 100).toFixed(1)

  return (
    <motion.div layout
      initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, x:-20 }}
      className={`flex items-center gap-4 bg-white/2 border rounded-2xl px-5 py-4 transition-all ${
        alert.isActive ? 'border-white/7 hover:border-violet-800/30' : 'border-white/4 opacity-55'
      }`}
    >
      {/* Card image */}
      <div className="w-10 h-14 rounded-lg overflow-hidden bg-white/3 flex items-center justify-center flex-shrink-0">
        {!imgErr
          ? <img src={alert.cardImg} alt={alert.cardName} className="w-full h-full object-contain" onError={() => setImgErr(true)}/>
          : <span className="text-xl">🃏</span>
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-white/85 truncate">{alert.cardName}</div>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="text-xs text-white/40 font-medium">Aktuell: <span className="text-white/70 font-bold">{formatCurrency(alert.currentPrice)}</span></span>
          <div className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background:`${condColor}14`, color:condColor, border:`1px solid ${condColor}28` }}>
            {isUp ? <TrendingUp size={9}/> : <TrendingDown size={9}/>}
            Alert wenn {isUp ? '>' : '<'} {formatCurrency(alert.targetPrice)}
          </div>
          <span className="text-[10px] text-white/30 font-medium">
            ({isUp ? '+' : ''}{pct}% vom Preis)
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button onClick={() => onToggle(alert.id)}
          className={`p-2 rounded-xl border transition-all ${
            alert.isActive
              ? 'bg-violet-950/40 border-violet-700/30 text-violet-300 hover:border-violet-600/50'
              : 'bg-white/4 border-white/8 text-white/30 hover:text-white/60'
          }`}
          title={alert.isActive ? 'Alert deaktivieren' : 'Alert aktivieren'}>
          {alert.isActive ? <Bell size={14}/> : <BellOff size={14}/>}
        </button>
        <button onClick={() => onDelete(alert.id)}
          className="p-2 rounded-xl border border-white/6 text-white/25 hover:border-red-500/30 hover:text-red-400 transition-all">
          <X size={14}/>
        </button>
      </div>
    </motion.div>
  )
}

export default function AlertsPage() {
  const [alerts,      setAlerts]      = useState<AlertItem[]>(MOCK_ALERTS)
  const [showCreate,  setShowCreate]  = useState(false)
  const [newCard,     setNewCard]     = useState('')
  const [newPrice,    setNewPrice]    = useState('')
  const [newCond,     setNewCond]     = useState<AlertCondition>('below')
  const [liveStatus,  setLiveStatus]  = useState('Verbunden')

  // Supabase Realtime subscription for price updates
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('price_alerts')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'card_prices' }, payload => {
        console.log('Price update:', payload)
        // Check if any alert should trigger
        setAlerts(prev => prev.map(a => {
          const newPrice = payload.new.price as number
          if (a.cardName === payload.new.card_name) {
            const triggered = a.condition === 'above' ? newPrice >= a.targetPrice : newPrice <= a.targetPrice
            if (triggered && a.isActive) return { ...a, triggered: true }
          }
          return a
        }))
      })
      .subscribe(status => {
        setLiveStatus(status === 'SUBSCRIBED' ? 'Live' : 'Verbinde…')
      })

    return () => { supabase.removeChannel(channel) }
  }, [])

  const toggle = (id: number) => setAlerts(prev => prev.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a))
  const remove = (id: number) => setAlerts(prev => prev.filter(a => a.id !== id))

  const addAlert = () => {
    if (!newCard || !newPrice) return
    setAlerts(prev => [...prev, {
      id: Date.now(), cardName: newCard, cardImg: '',
      currentPrice: 0, targetPrice: parseFloat(newPrice),
      condition: newCond, isActive: true,
    }])
    setNewCard(''); setNewPrice(''); setShowCreate(false)
  }

  const activeCount = alerts.filter(a => a.isActive).length

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <div className="text-[11px] font-bold text-violet-400 uppercase tracking-widest mb-1.5">Dashboard</div>
          <h1 className="text-3xl font-black text-white tracking-tight">Preis-Alerts</h1>
          <p className="text-white/40 text-sm mt-1">Erhalte Echtzeit-Benachrichtigungen bei Preisänderungen</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 text-white text-sm font-bold shadow-[0_6px_20px_rgba(124,58,237,0.4)] hover:shadow-[0_10px_28px_rgba(124,58,237,0.55)] hover:-translate-y-0.5 transition-all">
          <Plus size={15}/> Alert erstellen
        </button>
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-6 mb-6 bg-white/2 border border-white/6 rounded-2xl px-5 py-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="live-dot"/>
          <span className="text-xs font-semibold text-white/50">Realtime: <span className="text-green-400">{liveStatus}</span></span>
        </div>
        <div className="flex items-center gap-2">
          <Bell size={12} className="text-violet-400"/>
          <span className="text-xs font-semibold text-white/50">{activeCount} aktive Alerts</span>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Zap size={12} className="text-yellow-400"/>
          <span className="text-xs text-white/35">Benachrichtigung per E-Mail + In-App</span>
        </div>
      </div>

      {/* Alerts list */}
      <div className="space-y-3">
        <AnimatePresence>
          {alerts.length > 0
            ? alerts.map(a => <AlertCard key={a.id} alert={a} onToggle={toggle} onDelete={remove}/>)
            : (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
                className="text-center py-16">
                <div className="text-5xl mb-4 opacity-25">🔔</div>
                <div className="text-sm font-medium text-white/30">Noch keine Alerts erstellt</div>
                <div className="text-xs text-white/20 mt-1">Klicke „Alert erstellen" um loszulegen</div>
              </motion.div>
            )
          }
        </AnimatePresence>
      </div>

      {/* Create modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
            onClick={() => setShowCreate(false)}>
            <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.95 }}
              className="bg-[rgba(10,6,24,0.98)] border border-violet-800/30 rounded-2xl w-full max-w-sm p-6"
              onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-black text-white mb-4">Alert erstellen</h3>
              <div className="space-y-3">
                <input value={newCard} onChange={e => setNewCard(e.target.value)}
                  placeholder="Kartenname (z.B. Glurak ex)"
                  className="w-full bg-white/4 border border-white/9 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/15 transition-all"/>
                <div className="flex gap-2">
                  <button onClick={() => setNewCond('below')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${newCond==='below' ? 'bg-red-950/40 border-red-600/40 text-red-300' : 'bg-white/4 border-white/8 text-white/40'}`}>
                    ↓ Preis fällt unter
                  </button>
                  <button onClick={() => setNewCond('above')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${newCond==='above' ? 'bg-green-950/40 border-green-600/40 text-green-300' : 'bg-white/4 border-white/8 text-white/40'}`}>
                    ↑ Preis steigt über
                  </button>
                </div>
                <input type="number" value={newPrice} onChange={e => setNewPrice(e.target.value)}
                  placeholder="Zielpreis in € (z.B. 150)"
                  className="w-full bg-white/4 border border-white/9 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/15 transition-all"/>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowCreate(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 text-sm font-semibold hover:text-white hover:border-white/20 transition-all">Abbrechen</button>
                <button onClick={addAlert} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 text-white text-sm font-bold shadow-[0_6px_20px_rgba(124,58,237,0.4)] hover:-translate-y-0.5 transition-all">Alert speichern</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
