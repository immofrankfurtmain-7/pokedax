'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

type Profile = {
  username: string
  avatar_url: string | null
  forum_role: string
  badge_trainer: boolean
  badge_gym_leader: boolean
  badge_elite4: boolean
  badge_champion: boolean
  badge_verified_seller: boolean
  post_count: number
}

type Reply = {
  id: string
  content: string
  created_at: string
  upvotes: number
  is_deleted: boolean
  author_id: string
  profiles: Profile
}

type Post = {
  id: string
  title: string
  content: string
  created_at: string
  reply_count: number
  upvotes: number
  is_pinned: boolean
  is_locked: boolean
  category_id: string
  author_id: string
  profiles: Profile
  forum_replies: Reply[]
}

function Avatar({ profile }: { profile: Profile }) {
  const ring = profile.badge_champion ? 'border-yellow-500' :
               profile.badge_elite4   ? 'border-purple-500' :
               profile.badge_gym_leader ? 'border-blue-500' : 'border-gray-700'
  return (
    <div className={'w-10 h-10 rounded-full border-2 flex items-center justify-center bg-gray-800 flex-shrink-0 ' + ring}>
      {profile.avatar_url
        ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
        : <span>{profile.badge_champion ? '🏆' : profile.badge_elite4 ? '⭐' : '🎒'}</span>
      }
    </div>
  )
}

function RankLabel({ p }: { p: Profile }) {
  const n = p.post_count
  if (n >= 500) return <span className="text-xs text-yellow-400">Champion</span>
  if (n >= 100) return <span className="text-xs text-purple-400">Top Vier</span>
  if (n >= 25)  return <span className="text-xs text-blue-400">Arenaleiter</span>
  if (n >= 1)   return <span className="text-xs text-green-400">Trainer</span>
  return <span className="text-xs text-gray-500">Newcomer</span>
}

function RoleBadge({ role }: { role: string }) {
  if (role === 'admin')     return <span className="text-xs px-1.5 py-0.5 rounded bg-red-900 text-red-300 ml-1">Admin</span>
  if (role === 'moderator') return <span className="text-xs px-1.5 py-0.5 rounded bg-blue-900 text-blue-300 ml-1">Mod</span>
  return null
}

function timeAgo(date: string) {
  const diff  = Date.now() - new Date(date).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 1)   return 'Gerade eben'
  if (mins < 60)  return 'vor ' + mins + ' Min.'
  if (hours < 24) return 'vor ' + hours + ' Std.'
  return 'vor ' + days + ' Tag' + (days > 1 ? 'en' : '')
}

export default function PostPage() {
  const { id }   = useParams()
  const [post,         setPost]         = useState<Post | null>(null)
  const [loading,      setLoading]      = useState(true)
  const [reply,        setReply]        = useState('')
  const [submitting,   setSubmitting]   = useState(false)
  const [user,         setUser]         = useState<any>(null)
  const [likedPost,    setLikedPost]    = useState(false)
  const [likedReplies, setLikedReplies] = useState<Set<string>>(new Set())
  const [reportTarget, setReportTarget] = useState<{type: 'post'|'reply', id: string} | null>(null)
  const [reportReason, setReportReason] = useState('')

  useEffect(() => {
    fetch('/api/auth/user').then(r => r.json()).then(d => setUser(d.user)).catch(() => {})
    loadPost()
  }, [id])

  async function loadPost() {
    setLoading(true)
    const res  = await fetch('/api/forum/post/' + id)
    const data = await res.json()
    setPost(data.post)
    setLoading(false)
  }

  async function submitReply() {
    if (!reply.trim()) return
    setSubmitting(true)
    await fetch('/api/forum/reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_id: id, content: reply }),
    })
    setReply('')
    await loadPost()
    setSubmitting(false)
  }

  async function toggleLike(post_id?: string, reply_id?: string) {
    if (!user) return
    await fetch('/api/forum/like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_id: post_id ?? null, reply_id: reply_id ?? null }),
    })
    if (post_id) setLikedPost(p => !p)
    if (reply_id) setLikedReplies(prev => {
      const next = new Set(prev)
      next.has(reply_id) ? next.delete(reply_id) : next.add(reply_id)
      return next
    })
    loadPost()
  }

  async function submitReport() {
    if (!reportTarget || !reportReason.trim()) return
    await fetch('/api/forum/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        post_id:  reportTarget.type === 'post'  ? reportTarget.id : null,
        reply_id: reportTarget.type === 'reply' ? reportTarget.id : null,
        reason: reportReason,
      }),
    })
    setReportTarget(null)
    setReportReason('')
    alert('Meldung gesendet. Danke!')
  }

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-gray-500">
      Laedt...
    </div>
  )
  if (!post) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-gray-500">
      Post nicht gefunden
    </div>
  )

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-4 py-8">

        <Link href="/forum" className="text-sm text-gray-500 hover:text-gray-300 transition-colors mb-6 inline-block">
          zurueck zum Forum
        </Link>

        {/* Haupt-Post */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-4">
          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center gap-1 pt-1">
              <Avatar profile={post.profiles} />
              <RankLabel p={post.profiles} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-medium text-white">{post.profiles?.username}</span>
                <RoleBadge role={post.profiles?.forum_role} />
                {post.profiles?.badge_champion       && <span title="Champion">🏆</span>}
                {post.profiles?.badge_elite4         && <span title="Top Vier">⭐</span>}
                {post.profiles?.badge_verified_seller && <span title="Haendler">✅</span>}
                <span className="text-gray-500 text-xs">{timeAgo(post.created_at)}</span>
              </div>
              <h1 className="text-xl font-bold mb-3">{post.title}</h1>
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap text-sm">{post.content}</p>
              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={() => toggleLike(post.id)}
                  className={'flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors ' +
                    (likedPost ? 'bg-red-900/50 text-red-400' : 'bg-gray-800 text-gray-400 hover:bg-gray-700')}>
                  {likedPost ? 'Gefaellt mir' : 'Gefaellt mir'} {post.upvotes}
                </button>
                <span className="text-gray-600 text-sm">{post.reply_count} Antworten</span>
                {user && (
                  <button
                    onClick={() => setReportTarget({ type: 'post', id: post.id })}
                    className="ml-auto text-xs text-gray-600 hover:text-red-400 transition-colors">
                    Melden
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Antworten */}
        {post.forum_replies?.filter(r => !r.is_deleted).map((r, i) => (
          <div key={r.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-3">
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center gap-1 pt-1">
                <Avatar profile={r.profiles} />
                <RankLabel p={r.profiles} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-medium text-white text-sm">{r.profiles?.username}</span>
                  <RoleBadge role={r.profiles?.forum_role} />
                  {r.profiles?.badge_champion       && <span title="Champion">🏆</span>}
                  {r.profiles?.badge_verified_seller && <span title="Haendler">✅</span>}
                  <span className="text-gray-500 text-xs">{timeAgo(r.created_at)}</span>
                  <span className="text-gray-700 text-xs">#{i + 1}</span>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{r.content}</p>
                <div className="mt-2 flex items-center gap-3">
                  <button
                    onClick={() => toggleLike(undefined, r.id)}
                    className={'flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors ' +
                      (likedReplies.has(r.id) ? 'bg-red-900/50 text-red-400' : 'bg-gray-800 text-gray-500 hover:bg-gray-700')}>
                    {r.upvotes} Gefaellt mir
                  </button>
                  {user && (
                    <button
                      onClick={() => setReportTarget({ type: 'reply', id: r.id })}
                      className="ml-auto text-xs text-gray-600 hover:text-red-400 transition-colors">
                      Melden
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Antwort-Box */}
        {user && !post.is_locked ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mt-4">
            <h3 className="text-sm font-medium mb-3 text-gray-300">Antworten</h3>
            <textarea
              value={reply}
              onChange={e => setReply(e.target.value)}
              placeholder="Deine Antwort..."
              rows={4}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500 resize-none mb-3"
            />
            <div className="flex justify-end">
              <button
                onClick={submitReply}
                disabled={submitting || !reply.trim()}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-lg text-sm font-medium transition-colors">
                {submitting ? 'Sendet...' : 'Antworten'}
              </button>
            </div>
          </div>
        ) : !user ? (
          <div className="text-center py-8 text-gray-500 text-sm mt-4">
            <Link href="/auth/login" className="text-purple-400 hover:underline">Einloggen</Link> um zu antworten
          </div>
        ) : (
          <div className="text-center py-4 text-gray-600 text-sm mt-4">Gesperrt</div>
        )}

        {/* Melde-Modal */}
        {reportTarget && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md p-6">
              <h2 className="text-lg font-bold mb-1">Beitrag melden</h2>
              <p className="text-gray-400 text-sm mb-4">Warum moechtest du diesen Beitrag melden?</p>
              <textarea
                value={reportReason}
                onChange={e => setReportReason(e.target.value)}
                placeholder="Grund..."
                rows={3}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-red-500 resize-none mb-4"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setReportTarget(null)}
                  className="px-4 py-2 rounded-lg border border-gray-700 text-sm text-gray-400 hover:border-gray-500">
                  Abbrechen
                </button>
                <button
                  onClick={submitReport}
                  disabled={!reportReason.trim()}
                  className="px-4 py-2 rounded-lg bg-red-700 hover:bg-red-600 disabled:opacity-40 text-white text-sm font-medium">
                  Melden
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  )
}