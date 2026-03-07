'use client'

import { useState, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import type { Media } from '@/types'

interface MediaLibraryProps {
  items: Media[]
  page: number
  hasMore: boolean
  total: number
}

export function MediaLibrary({ items, page, hasMore, total }: MediaLibraryProps) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [selected, setSelected] = useState<Media | null>(null)

  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
  const MAX_BYTES = 10 * 1024 * 1024 // 10 MB

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Only JPEG, PNG, WebP, and AVIF images are allowed.')
      return
    }
    if (file.size > MAX_BYTES) {
      setError('File must be under 10 MB.')
      return
    }

    setError(null)
    setUploading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Not authenticated.'); setUploading(false); return }

    const ext = file.name.split('.').pop()
    const storagePath = `media/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error: uploadErr } = await supabase.storage
      .from('media')
      .upload(storagePath, file, { contentType: file.type, upsert: false })

    if (uploadErr) { setError(uploadErr.message); setUploading(false); return }

    const { data: publicUrlData } = supabase.storage
      .from('media')
      .getPublicUrl(storagePath)

    await supabase.from('media').insert({
      filename: file.name,
      storage_path: storagePath,
      url: publicUrlData.publicUrl,
      mime_type: file.type,
      media_type: 'IMAGE',
      size_bytes: file.size,
      uploaded_by: user.id,
    })

    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
    startTransition(() => router.refresh())
  }

  async function handleDelete(item: Media) {
    if (!confirm(`Delete "${item.filename}"?`)) return
    const supabase = createClient()
    await supabase.storage.from('media').remove([item.storage_path])
    await supabase.from('media').delete().eq('id', item.id)
    setSelected(null)
    startTransition(() => router.refresh())
  }

  return (
    <div>
      {/* Upload zone */}
      <div className="mb-6 bg-white border-2 border-dashed border-brand-border p-6 text-center">
        <p className="text-sm text-brand-muted mb-3">
          Upload images (JPEG, PNG, WebP, AVIF · max 10 MB)
        </p>
        {error && <p className="text-xs text-brand-red mb-3">{error}</p>}
        <label className="cursor-pointer inline-block px-5 py-2.5 bg-brand-red text-white text-sm font-bold hover:bg-red-700 transition-colors">
          {uploading ? 'Uploading…' : 'Choose File'}
          <input
            ref={fileRef}
            type="file"
            accept={ALLOWED_TYPES.join(',')}
            className="sr-only"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
        <p className="text-xs text-brand-muted mt-2">{total} files in library</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grid */}
        <div className="lg:col-span-2">
          {items.length === 0 ? (
            <p className="text-brand-muted text-sm">No media uploaded yet.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelected(item)}
                  className={`relative aspect-square overflow-hidden bg-brand-gray border-2 transition-colors ${
                    selected?.id === item.id ? 'border-brand-red' : 'border-transparent'
                  }`}
                >
                  <Image
                    src={item.url}
                    alt={item.alt_text ?? item.filename}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 33vw"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Pagination */}
          {(hasMore || page > 1) && (
            <div className="flex gap-3 mt-4">
              {page > 1 && (
                <a href={`/admin/media?page=${page - 1}`} className="px-4 py-2 border border-brand-border text-sm font-semibold hover:bg-brand-gray">
                  &larr; Previous
                </a>
              )}
              {hasMore && (
                <a href={`/admin/media?page=${page + 1}`} className="px-4 py-2 border border-brand-border text-sm font-semibold hover:bg-brand-gray">
                  Next &rarr;
                </a>
              )}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="lg:col-span-1">
            <div className="bg-white border border-brand-border p-4 sticky top-32">
              <div className="relative aspect-video w-full mb-3 bg-brand-gray">
                <Image src={selected.url} alt={selected.alt_text ?? selected.filename} fill className="object-contain" />
              </div>
              <p className="text-xs font-semibold truncate mb-1">{selected.filename}</p>
              <p className="text-xs text-brand-muted mb-3">
                {(selected.size_bytes / 1024).toFixed(1)} KB
                {selected.width && selected.height ? ` · ${selected.width}×${selected.height}` : ''}
              </p>
              <div className="mb-3">
                <label className="block text-xs font-semibold mb-1">Public URL</label>
                <input
                  readOnly
                  value={selected.url}
                  className="w-full border border-brand-border px-2 py-1.5 text-xs font-mono focus:outline-none"
                  onFocus={(e) => e.target.select()}
                />
              </div>
              <button
                onClick={() => handleDelete(selected)}
                disabled={isPending}
                className="w-full py-2 text-xs font-bold text-brand-red border border-brand-red hover:bg-red-50 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
