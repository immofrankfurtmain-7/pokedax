'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Camera, Loader2 } from 'lucide-react'

interface AvatarUploadProps {
  userId:    string
  avatarUrl?: string | null
  username:  string
  onUpload?: (url: string) => void
  size?: 'sm' | 'md' | 'lg'
}

export default function AvatarUpload({ userId, avatarUrl, username, onUpload, size = 'md' }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview,   setPreview]   = useState<string|null>(avatarUrl ?? null)
  const [error,     setError]     = useState<string|null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const sizes = { sm:'w-10 h-10', md:'w-16 h-16', lg:'w-24 h-24' }
  const textSizes = { sm:'text-sm', md:'text-xl', lg:'text-3xl' }

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError('Max 5 MB'); return }

    setUploading(true); setError(null)

    // Preview
    const reader = new FileReader()
    reader.onload = ev => setPreview(ev.target?.result as string)
    reader.readAsDataURL(file)

    try {
      const ext  = file.name.split('.').pop()
      const path = `${userId}/avatar.${ext}`

      const { error: upErr } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true })

      if (upErr) throw upErr

      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      const url = `${data.publicUrl}?t=${Date.now()}`

      await supabase.from('profiles').update({ avatar_url: url }).eq('id', userId)
      onUpload?.(url)
    } catch (err) {
      console.error(err)
      setError('Upload fehlgeschlagen')
      setPreview(avatarUrl ?? null)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className={`relative ${sizes[size]} rounded-full overflow-hidden border-2 border-violet-700/40 hover:border-violet-500 transition-all group flex-shrink-0`}
      >
        {preview
          ? <img src={preview} alt={username} className="w-full h-full object-cover"/>
          : <div className={`w-full h-full bg-gradient-to-br from-violet-600 to-purple-500 flex items-center justify-center ${textSizes[size]} font-bold text-white`}>
              {username[0]?.toUpperCase()}
            </div>
        }
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          {uploading
            ? <Loader2 size={size === 'lg' ? 20 : 14} className="text-white animate-spin"/>
            : <Camera size={size === 'lg' ? 20 : 14} className="text-white"/>
          }
        </div>
      </button>

      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
        className="hidden" onChange={handleFile}/>

      {error && <p className="text-xs text-red-400 font-medium">{error}</p>}
      {size === 'lg' && !uploading && (
        <button onClick={() => fileRef.current?.click()}
          className="text-xs text-violet-400 hover:text-violet-300 font-semibold transition-colors">
          Foto ändern
        </button>
      )}
    </div>
  )
}
