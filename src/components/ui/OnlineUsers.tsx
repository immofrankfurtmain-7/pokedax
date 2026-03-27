'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

type OnlineUser = {
  id: string
  username: string
  avatar_url: string | null
  forum_role: string
  badge_champion: boolean
  badge_elite4: boolean
  badge_gym_leader: boolean
  badge_trainer: boolean
  badge_verified_seller: boolean
  last_seen: string
}

function RoleColor(role: string) {
  if (role === 'admin')     return '#ef4444'
  if (role === 'moderator') return '#3b82f6'
  return '#6b7280'
}

function TopBadge(u: OnlineUser) {
  if (u.badge_champion) return ''
  if (u.badge_elite4)   return ''
  if (u.badge_gym_leader) return ''
  if (u.badge_trainer)  return ''
  return null
}

export default function OnlineUsers() {
  const [users, setUsers] = useState<OnlineUser[]>([])

  useEffect(() => {
    const sb = createClient()

    async function ping() {
      const { data: { user } } = await sb.auth.getUser()
      if (user) {
        await fetch('/api/presence', { method: 'POST' })
      }
    }

    async function load() {
      const res  = await fetch('/api/presence')
      const data = await res.json()
      setUsers(data.users ?? [])
    }

    ping()
    load()

    const interval = setInterval(() => { ping(); load() }, 60000)
    return () => clearInterval(interval)
  }, [])

  if (users.length === 0) return null

  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
          <span className="text-sm font-medium text-gray-400 uppercase tracking-widest">
            {users.length} Trainer gerade online
          </span>
        </div>

        <div className="flex flex-wrap gap-3">
          {users.map(u => {
            const badge = TopBadge(u)
            const roleColor = RoleColor(u.forum_role)
            return (
              <div key={u.id}
                className="group flex items-center gap-2.5 bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-full px-3 py-1.5 transition-all cursor-default"
                style={{ borderColor: u.forum_role !== 'member' ? roleColor + '44' : undefined }}>

                <div className="relative">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 overflow-hidden"
                    style={{ background: u.forum_role !== 'member' ? roleColor + '33' : 'rgba(255,255,255,0.05)', color: u.forum_role !== 'member' ? roleColor : '#9ca3af' }}>
                    {u.avatar_url
                      ? <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                      : u.username[0]?.toUpperCase()
                    }
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-black"></div>
                </div>

                <span className="text-sm font-medium text-white">{u.username}</span>

                {badge && <span className="text-sm" style={{ fontSize: 14 }}>{badge}</span>}

                {u.forum_role === 'admin' && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full font-medium" style={{ background: '#ef444422', color: '#ef4444' }}>Admin</span>
                )}
                {u.forum_role === 'moderator' && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full font-medium" style={{ background: '#3b82f622', color: '#3b82f6' }}>Mod</span>
                )}
                {u.badge_verified_seller && (
                  <span className="text-sm" style={{ fontSize: 14 }}></span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}