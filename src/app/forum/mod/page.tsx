'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type ModPost = {
  id: string
  title: string
  created_at: string
  is_deleted: boolean
  is_pinned: boolean
  is_locked: boolean
  reply_count: number
  upvotes: number
  category_id: string
  profiles: { username: string; forum_role: string; is_banned: boolean }
}

type Report = {
  id: string
  reason: string
  status: string
  created_at: string
  post_id: string | null
  reply_id: string | null
  profiles: { username: string }
  forum_posts: { title: string; is_deleted: boolean } | null
}

type ModUser = {
  id: string
  username: string
  forum_role: string
  post_count: number
  is_banned: boolean
  banned_reason: string | null
  badge_verified_seller: boolean
  badge_champion: boolean
}

function timeAgo(date: string) {
  const diff  = Date.now() - new Date(date).getTime()
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (hours < 24) return 'vor ' + hours + ' Std.'
  return 'vor ' + days + ' Tag' + (days > 1 ? 'en' : '')
}

export default function ModPage() {
  const [tab,     setTab]     = useState<'posts'|'reports'|'users'>('reports')
  const [posts,   setPosts]   = useState<ModPost[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [users,   setUsers]   = useState<ModUser[]>([])
  const [loading, setLoading] = useState(false)
  const [user,    setUser]    = useState<any>(null)
  const [banTarget,  setBanTarget]  = useState<ModUser | null>(null)
  const [banReason,  setBanReason]  = useState('')
  const [roleTarget, setRoleTarget] = useState<ModUser | null>(null)
  const [newRole,    setNewRole]    = useState('member')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetch('/api/auth/user').then(r => r.json()).then(d => setUser(d.user))
    loadData('reports')
  }, [])

  async function loadData(t: string) {
    setLoading(true)
    if (t === 'posts') {
      const r = await fetch('/api/admin/forum/posts')
      const d = await r.json()
      setPosts(d.posts ?? [])
    } else if (t === 'reports') {
      const r = await fetch('/api/admin/forum/reports')
      const d = await r.json()
      setReports(d.reports ?? [])
    } else if (t === 'users') {
      const r = await fetch('/api/admin/forum/users')
      const d = await r.json()
      setUsers(d.users ?? [])
    }
    setLoading(false)
  }

  function switchTab(t: 'posts'|'reports'|'users') {
    setTab(t)
    loadData(t)
  }

  async function postAction(id: string, action: string) {
    await fetch('/api/admin/forum/posts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action }),
    })
    setMsg('Aktion ausgefuehrt!')
    setTimeout(() => setMsg(''), 2000)
    loadData('posts')
  }

  async function resolveReport(id: string, status: string) {
    await fetch('/api/admin/forum/reports', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    setMsg('Meldung bearbeitet!')
    setTimeout(() => setMsg(''), 2000)
    loadData('reports')
  }

  async function userAction(id: string, action: string, extra?: any) {
    await fetch('/api/admin/forum/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action, ...extra }),
    })
    setMsg('User aktualisiert!')
    setTimeout(() => setMsg(''), 2000)
    loadData('users')
  }

  const openReports = reports.filter(r => r.status === 'open')

  return (
    <>
      <main className="min-h-screen bg-black text-white">
        <div className="max-w-5xl mx-auto px-4 py-8">

          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="text-xs text-red-400 uppercase tracking-widest mb-1">Moderations-Panel</div>
              <h1 className="text-2xl font-bold">Mod-Bereich</h1>
            </div>
            <Link href="/forum" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
              Zurueck zum Forum
            </Link>
          </div>

          {msg && (
            <div className="mb-4 px-4 py-2 bg-green-900/50 border border-green-700 rounded-lg text-green-300 text-sm">
              {msg}
            </div>
          )}

          <div className="flex gap-2 mb-6">
            {(['reports','posts','users'] as const).map(t => (
              <button key={t} onClick={() => switchTab(t)}
                className={'px-4 py-2 rounded-lg text-sm font-medium transition-colors ' +
                  (tab === t ? 'bg-red-700 text-white' : 'bg-gray-900 border border-gray-700 text-gray-400 hover:border-gray-500')}>
                {t === 'reports' && 'Meldungen ' + (openReports.length > 0 ? '(' + openReports.length + ')' : '')}
                {t === 'posts'   && 'Alle Posts'}
                {t === 'users'   && 'User'}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-500">Laedt...</div>
          ) : (
            <>
              {/* MELDUNGEN */}
              {tab === 'reports' && (
                <div className="space-y-3">
                  {reports.length === 0 && (
                    <div className="text-center py-12 text-gray-500">Keine Meldungen</div>
                  )}
                  {reports.map(r => (
                    <div key={r.id} className={'p-4 rounded-xl border ' +
                      (r.status === 'open' ? 'border-red-800 bg-red-950/20' : 'border-gray-800 bg-gray-900 opacity-60')}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={'text-xs px-2 py-0.5 rounded-full font-medium ' +
                              (r.status === 'open' ? 'bg-red-900 text-red-300' : 'bg-gray-700 text-gray-400')}>
                              {r.status === 'open' ? 'Offen' : r.status === 'resolved' ? 'Erledigt' : 'Abgewiesen'}
                            </span>
                            <span className="text-xs text-gray-500">{timeAgo(r.created_at)}</span>
                          </div>
                          <p className="text-sm text-white font-medium mb-1">
                            Grund: {r.reason}
                          </p>
                          <p className="text-xs text-gray-500">
                            Gemeldet von: {r.profiles?.username} {' '}
                            Post: {r.forum_posts?.title ?? 'Antwort'}
                          </p>
                        </div>
                        {r.status === 'open' && (
                          <div className="flex gap-2 flex-shrink-0">
                            <button onClick={() => resolveReport(r.id, 'resolved')}
                              className="text-xs px-3 py-1.5 rounded-lg bg-green-900/50 border border-green-700 text-green-300 hover:bg-green-900 transition-colors">
                              Erledigt
                            </button>
                            <button onClick={() => resolveReport(r.id, 'dismissed')}
                              className="text-xs px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:bg-gray-700 transition-colors">
                              Abweisen
                            </button>
                            {r.post_id && (
                              <Link href={'/forum/post/' + r.post_id}
                                className="text-xs px-3 py-1.5 rounded-lg bg-blue-900/50 border border-blue-700 text-blue-300 hover:bg-blue-900 transition-colors">
                                Post anzeigen
                              </Link>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* POSTS */}
              {tab === 'posts' && (
                <div className="space-y-2">
                  {posts.map(post => (
                    <div key={post.id} className={'p-4 rounded-xl border ' +
                      (post.is_deleted ? 'border-red-900 bg-red-950/10 opacity-60' : 'border-gray-800 bg-gray-900')}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            {post.is_pinned  && <span className="text-xs px-1.5 py-0.5 rounded bg-purple-900 text-purple-300">Angepinnt</span>}
                            {post.is_locked  && <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-900 text-yellow-300">Gesperrt</span>}
                            {post.is_deleted && <span className="text-xs px-1.5 py-0.5 rounded bg-red-900 text-red-300">Geloescht</span>}
                          </div>
                          <p className="text-sm text-white font-medium truncate">{post.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            von {post.profiles?.username}  {post.reply_count} Antworten  {post.upvotes} Likes  {timeAgo(post.created_at)}
                          </p>
                        </div>
                        <div className="flex gap-1.5 flex-shrink-0 flex-wrap justify-end">
                          <button onClick={() => postAction(post.id, post.is_pinned ? 'unpin' : 'pin')}
                            className="text-xs px-2 py-1 rounded bg-purple-900/50 border border-purple-700 text-purple-300 hover:bg-purple-900 transition-colors">
                            {post.is_pinned ? 'Unpin' : 'Pin'}
                          </button>
                          <button onClick={() => postAction(post.id, post.is_locked ? 'unlock' : 'lock')}
                            className="text-xs px-2 py-1 rounded bg-yellow-900/50 border border-yellow-700 text-yellow-300 hover:bg-yellow-900 transition-colors">
                            {post.is_locked ? 'Entsperren' : 'Sperren'}
                          </button>
                          <button onClick={() => postAction(post.id, post.is_deleted ? 'restore' : 'delete')}
                            className={'text-xs px-2 py-1 rounded border transition-colors ' +
                              (post.is_deleted
                                ? 'bg-green-900/50 border-green-700 text-green-300 hover:bg-green-900'
                                : 'bg-red-900/50 border-red-700 text-red-300 hover:bg-red-900')}>
                            {post.is_deleted ? 'Wiederherstellen' : 'Loeschen'}
                          </button>
                          <Link href={'/forum/post/' + post.id}
                            className="text-xs px-2 py-1 rounded bg-gray-800 border border-gray-700 text-gray-400 hover:bg-gray-700 transition-colors">
                            Ansehen
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* USER */}
              {tab === 'users' && (
                <div className="space-y-2">
                  {users.map(u => (
                    <div key={u.id} className={'p-4 rounded-xl border ' +
                      (u.is_banned ? 'border-red-800 bg-red-950/20' : 'border-gray-800 bg-gray-900')}>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-white">{u.username}</span>
                            {u.forum_role === 'admin' && <span className="text-xs px-1.5 py-0.5 rounded bg-red-900 text-red-300">Admin</span>}
                            {u.forum_role === 'moderator' && <span className="text-xs px-1.5 py-0.5 rounded bg-blue-900 text-blue-300">Mod</span>}
                            {u.badge_verified_seller && <span className="text-xs"></span>}
                            {u.badge_champion && <span className="text-xs"></span>}
                            {u.is_banned && <span className="text-xs px-1.5 py-0.5 rounded bg-red-900 text-red-300">Gesperrt</span>}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {u.post_count} Posts
                            {u.is_banned && u.banned_reason && '  Grund: ' + u.banned_reason}
                          </p>
                        </div>
                        <div className="flex gap-1.5 flex-shrink-0 flex-wrap justify-end">
                          <button onClick={() => { setRoleTarget(u); setNewRole(u.forum_role) }}
                            className="text-xs px-2 py-1 rounded bg-blue-900/50 border border-blue-700 text-blue-300 hover:bg-blue-900 transition-colors">
                            Rolle
                          </button>
                          <button onClick={() => userAction(u.id, 'toggle_seller')}
                            className="text-xs px-2 py-1 rounded bg-gray-800 border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors">
                            {u.badge_verified_seller ? 'Seller entfernen' : 'Seller vergeben'}
                          </button>
                          <button onClick={() => u.is_banned ? userAction(u.id, 'unban') : setBanTarget(u)}
                            className={'text-xs px-2 py-1 rounded border transition-colors ' +
                              (u.is_banned
                                ? 'bg-green-900/50 border-green-700 text-green-300 hover:bg-green-900'
                                : 'bg-red-900/50 border-red-700 text-red-300 hover:bg-red-900')}>
                            {u.is_banned ? 'Entsperren' : 'Sperren'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Ban Modal */}
          {banTarget && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-900 border border-red-800 rounded-2xl w-full max-w-md p-6">
                <h2 className="text-lg font-bold mb-1">User sperren</h2>
                <p className="text-gray-400 text-sm mb-4">{banTarget.username} wird gesperrt und kann nicht mehr posten.</p>
                <textarea value={banReason} onChange={e => setBanReason(e.target.value)}
                  placeholder="Grund fuer die Sperrung..."
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-red-500 resize-none mb-4"
                />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setBanTarget(null)}
                    className="px-4 py-2 rounded-lg border border-gray-700 text-sm text-gray-400 hover:border-gray-500">
                    Abbrechen
                  </button>
                  <button onClick={() => { userAction(banTarget.id, 'ban', { reason: banReason }); setBanTarget(null); setBanReason('') }}
                    disabled={!banReason.trim()}
                    className="px-4 py-2 rounded-lg bg-red-700 hover:bg-red-600 disabled:opacity-40 text-white text-sm font-medium">
                    Sperren
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Rolle Modal */}
          {roleTarget && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-900 border border-blue-800 rounded-2xl w-full max-w-md p-6">
                <h2 className="text-lg font-bold mb-1">Rolle aendern</h2>
                <p className="text-gray-400 text-sm mb-4">{roleTarget.username}</p>
                <select value={newRole} onChange={e => setNewRole(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm mb-4 focus:outline-none focus:border-blue-500">
                  <option value="member">Member</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setRoleTarget(null)}
                    className="px-4 py-2 rounded-lg border border-gray-700 text-sm text-gray-400 hover:border-gray-500">
                    Abbrechen
                  </button>
                  <button onClick={() => { userAction(roleTarget.id, 'set_role', { role: newRole }); setRoleTarget(null) }}
                    className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-600 text-white text-sm font-medium">
                    Speichern
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </>
  )
}