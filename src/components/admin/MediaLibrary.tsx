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
    <div className="space-y-6">
      {/* Upload zone */}
      <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 hover:border-granite-primary/50 transition-colors p-8 text-center">
        <div className="flex flex-col items-center gap-3">
          {/* Upload icon */}
          <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}
              strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-gray-400" aria-hidden="true">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M17 8l-5-5-5 5 M12 3v12" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700">Upload an image</p>
            <p className="text-xs text-gray-400 mt-0.5">JPEG, PNG, WebP, AVIF · max 10 MB</p>
          </div>
          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <label className="cursor-pointer">
            <span
              className={`inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-bold rounded-xl transition-all shadow-sm ${
                uploading
                  ? 'opacity-60 cursor-not-allowed'
                  : 'hover:brightness-110 active:brightness-95'
              }`}
              style={{ background: uploading ? '#6b7280' : 'linear-gradient(135deg, #142B6F 0%, #0D1E50 100%)' }}
            >
              {uploading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                  </svg>
                  Uploading…
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
                    strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
                    <path d="M12 5v14 M5 12h14" />
                  </svg>
                  Choose File
                </>
              )}
            </span>
            <input
              ref={fileRef}
              type="file"
              accept={ALLOWED_TYPES.join(',')}
              className="sr-only"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
          <p className="text-xs text-gray-400">{total} {total === 1 ? 'file' : 'files'} in library</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Media grid */}
        <div className="lg:col-span-2">
          {items.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
              <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
                  strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-gray-300" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-500">No media uploaded yet</p>
              <p className="text-xs text-gray-400 mt-1">Upload your first image to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelected(item)}
                  className={`group relative aspect-square overflow-hidden rounded-xl bg-gray-100 border-2 transition-all duration-150 ${
                    selected?.id === item.id
                      ? 'border-granite-primary shadow-md scale-[0.98]'
                      : 'border-transparent hover:border-gray-200 hover:shadow-md'
                  }`}
                >
                  <Image
                    src={item.url}
                    alt={item.alt_text ?? item.filename}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
                    sizes="(max-width: 640px) 50vw, 33vw"
                  />
                  {/* Selection tick */}
                  {selected?.id === item.id && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-granite-primary flex items-center justify-center shadow-sm">
                      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  {/* Hover filename overlay */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent py-2 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <p className="text-white text-[10px] font-medium truncate">{item.filename}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Pagination */}
          {(hasMore || page > 1) && (
            <div className="flex gap-3 mt-4">
              {page > 1 && (
                <a
                  href={`/admin/media?page=${page - 1}`}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                >
                  ← Previous
                </a>
              )}
              {hasMore && (
                <a
                  href={`/admin/media?page=${page + 1}`}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                >
                  Next →
                </a>
              )}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sticky top-32 space-y-4">
              {/* Preview */}
              <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-gray-50">
                <Image
                  src={selected.url}
                  alt={selected.alt_text ?? selected.filename}
                  fill
                  className="object-contain"
                />
              </div>

              {/* Meta */}
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-800 truncate">{selected.filename}</p>
                <p className="text-xs text-gray-400">
                  {(selected.size_bytes / 1024).toFixed(1)} KB
                  {selected.width && selected.height ? ` · ${selected.width}×${selected.height}` : ''}
                </p>
              </div>

              {/* URL copy */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Public URL</label>
                <input
                  readOnly
                  value={selected.url}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-granite-primary/25 bg-gray-50"
                  onFocus={(e) => e.target.select()}
                />
              </div>

              {/* Delete */}
              <button
                onClick={() => handleDelete(selected)}
                disabled={isPending}
                className="w-full py-2 text-xs font-bold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Delete Image
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}