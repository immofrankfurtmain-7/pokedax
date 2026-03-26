'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'

type Category = {
  id: string
  name: string
  icon: string
  color: string
  post_count: number
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
  profiles: {
    username: string
    forum_role: string
    badge_champion: boolean
    badge_elite4: boolean
    badge_gym_leader: boolean
    badge_trainer: boolean
    badge_verified_seller: boolean
    post_count: number
  }
}

const CAT_ICONS: Record<string, string> = {
  marktplatz:    '',
  preise:        '',
  'fake-check':  '',
  news:          '',
  einsteiger:    '',
  turniere:      '',
  premium:       '',
}

const CAT_COLORS: Record<string, string> = {
  marktplatz:    '#FF6B35',
  preise:        '##4ECDC4',
  'fake-check':  '#9B59B6',
  news:          '#E74C3C',
  einsteiger:    '#2ECC71',
  turniere:      '#F39C12',
  premium:       '#8E44AD',
}

function RoleBadge({ role }: { role: string }) {
  if (role === 'admin')     return <span className="text-xs px-1.5 py-0.5 rounded bg-red-900 text-red-300 font-medium">Admin</span>
  if (role === 'moderator') return <span className="text-xs px-1.5 py-0.5 rounded bg-blue-900 text-blue-300 font-medium">Mod</span>
  return null
}

function timeAgo(date: string) {
  const diff  = Date.now() - new Date(date).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  < 1)  return 'Gerade eben'
  if (mins  < 60) return 'vor ' + mins + ' Min.'
  if (hours < 24) return 'vor ' + hours + ' Std.'
  return 'vor ' + days + ' Tag' + (days > 1 ? 'en' : '')
}

export default function ForumPage() {
  const router = useRouter()
  const [categories,  setCategories]  = useState<Category[]>([])
  const [posts,       setPosts]       = useState<Post[]>([])
  const [activeTab,   setActiveTab]   = useState('alle')
  const [showNewPost, setShowNewPost] = useState(false)
  const [newTitle,    setNewTitle]    = useState('')
  const [newContent,  setNewContent]  = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [submitting,  setSubmitting]  = useState(false)
  const [user,        setUser]        = useState<any>(null)
  const [profile,     setProfile]     = useState<any>(null)
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    fetch('/api/auth/user').then(r => r.json()).then(d => { setUser(d.user); if(d.user) fetch('/api/forum/profile').then(r=>r.json()).then(p=>setProfile(p.profile)) }).catch(() => {})
    fetch('/api/forum/categories').then(r => r.json()).then(d => setCategories(d.categories ?? []))
    loadPosts('')
  }, [])

  async function loadPosts(category: string) {
    setLoading(true)
    const params = category ? '?category=' + category : ''
    const res  = await fetch('/api/forum/posts' + params)
    const data = await res.json()
    setPosts(data.posts ?? [])
    setLoading(false)
  }

  function switchTab(id: string) {
    setActiveTab(id)
    loadPosts(id === 'alle' ? '' : id)
  }

  async function submitPost() {
    if (!newTitle.trim() || !newContent.trim() || !newCategory) return
    setSubmitting(true)
    const res  = await fetch('/api/forum/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle, content: newContent, category_id: newCategory }),
    })
    const data = await res.json()
    if (data.post) {
      setShowNewPost(false)
      setNewTitle('')
      setNewContent('')
      setNewCategory('')
      router.push('/forum/post/' + data.post.id)
    }
    setSubmitting(false)
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-black text-white">
        <div className="max-w-5xl mx-auto px-4 py-8">

          <div className="mb-8 flex items-start justify-between">
            <div>
              <div className="text-xs text-purple-400 uppercase tracking-widest mb-1">Community</div>
              <h1 className="text-3xl font-bold">Forum</h1>
              <p className="text-gray-400 mt-1">Deutschlands aktivste Pokemon TCG Community</p>
            </div>
            <button onClick={() => setShowNewPost(true)}
              className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              + Neuer Beitrag</button>{(profile?.forum_role === 'moderator' || profile?.forum_role === 'admin') && (<Link href="/forum/mod" className="bg-red-800 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors ml-2">Mod-Panel</Link>)}<span style={{display:'none'}}>
            </button>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-7 gap-3 mb-8">
            {categories.map(cat => (
              <button key={cat.id} onClick={() => switchTab(activeTab === cat.id ? 'alle' : cat.id)}
                className="relative rounded-xl overflow-hidden border-2 p-3 text-center transition-all"
                style={{
                  borderColor: activeTab === cat.id ? (CAT_COLORS[cat.id] ?? '#8B5CF6') : 'rgba(255,255,255,0.08)',
                  background:  activeTab === cat.id ? (CAT_COLORS[cat.id] ?? '#8B5CF6') + '22' : 'rgba(255,255,255,0.03)',
                }}>
                <div className="text-3xl mb-1">{CAT_ICONS[cat.id] ?? ''}</div>
                <div className="text-xs font-medium text-white leading-tight">{cat.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">{(cat.post_count ?? 0).toLocaleString('de-DE')}</div>
              </button>
            ))}
          </div>

          <div className="flex gap-2 flex-wrap mb-6">
            <button onClick={() => switchTab('alle')}
              className={'text-sm px-4 py-2 rounded-full border transition-colors ' +
                (activeTab === 'alle' ? 'bg-white text-black border-white' : 'border-gray-700 text-gray-400 hover:border-gray-500')}>
              Alle
            </button>
            {categories.map(cat => (
              <button key={cat.id} onClick={() => switchTab(cat.id)}
                className={'text-sm px-3 py-1.5 rounded-full border transition-colors ' +
                  (activeTab === cat.id ? 'bg-white text-black border-white' : 'border-gray-700 text-gray-400 hover:border-gray-500')}>
                {cat.name}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-500">Laedt...</div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-3">
              <div className="text-4xl"></div>
              <p>Noch keine Beitraege. Sei der Erste!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {posts.map(post => (
                <Link key={post.id} href={'/forum/post/' + post.id}>
                  <div className={'p-4 rounded-xl border transition-all cursor-pointer mb-2 ' +
                    (post.is_pinned
                      ? 'border-purple-700 bg-purple-950/30 hover:border-purple-500'
                      : 'border-gray-800 bg-gray-900 hover:border-gray-600')}>
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {post.is_pinned && <span className="text-xs px-1.5 py-0.5 rounded bg-purple-900 text-purple-300">Angepinnt</span>}
                          {post.is_locked && <span className="text-xs px-1.5 py-0.5 rounded bg-gray-700 text-gray-400">Gesperrt</span>}
                          <span className="text-xs px-1.5 py-0.5 rounded bg-gray-800 text-gray-300">
                            {CAT_ICONS[post.category_id] ?? ''} {categories.find(c => c.id === post.category_id)?.name ?? post.category_id}
                          </span>
                        </div>
                        <h3 className="font-medium text-white text-sm leading-snug truncate">{post.title}</h3>
                        <p className="text-gray-500 text-xs mt-1 line-clamp-1">{post.content}</p>
                      </div>
                      <div className="text-right flex-shrink-0 text-xs text-gray-500 space-y-1">
                        <div>{timeAgo(post.created_at)}</div>
                        <div className="flex items-center gap-2 justify-end">
                          <span>{post.reply_count} Antworten</span>
                          <span>{post.upvotes} Likes</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
                      <span>von</span>
                      <span className="text-gray-300 font-medium">{post.profiles?.username ?? 'Unbekannt'}</span>
                      <RoleBadge role={post.profiles?.forum_role ?? 'member'} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {showNewPost && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg p-6">
                <h2 className="text-lg font-bold mb-4">Neuer Beitrag</h2>
                <select value={newCategory} onChange={e => setNewCategory(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm mb-3 focus:outline-none focus:border-purple-500">
                  <option value="">Kategorie waehlen...</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{CAT_ICONS[c.id] ?? ''} {c.name}</option>
                  ))}
                </select>
                <input type="text" placeholder="Titel..." value={newTitle}
                  onChange={e => setNewTitle(e.target.value)} maxLength={120}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm mb-3 focus:outline-none focus:border-purple-500"
                />
                <textarea placeholder="Was moechtest du schreiben?" value={newContent}
                  onChange={e => setNewContent(e.target.value)} rows={5}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm mb-4 focus:outline-none focus:border-purple-500 resize-none"
                />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setShowNewPost(false)}
                    className="px-4 py-2 rounded-lg border border-gray-700 text-sm text-gray-400 hover:border-gray-500 transition-colors">
                    Abbrechen
                  </button>
                  <button onClick={submitPost}
                    disabled={submitting || !newTitle.trim() || !newContent.trim() || !newCategory}
                    className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-sm font-medium transition-colors">
                    {submitting ? 'Wird gesendet...' : 'Veroeffentlichen'}
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