'use client'

import { useState, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'

type Media = Database['public']['Tables']['media']['Row']

interface MediaLibraryProps {
  items: Media[]
  page: number
  hasMore: boolean
  total: number
}

export function MediaLibrary({
  items,
  page,
  hasMore,
  total,
}: MediaLibraryProps) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [selected, setSelected] = useState<Media | null>(null)

  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
  const MAX_BYTES = 10 * 1024 * 1024

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

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError('Not authenticated.')
      setUploading(false)
      return
    }

    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'bin'
    const storagePath = `media/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${ext}`

    const { error: uploadErr } = await supabase.storage
      .from('media')
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadErr) {
      setError(uploadErr.message)
      setUploading(false)
      return
    }

    const { data: publicUrlData } = supabase.storage
      .from('media')
      .getPublicUrl(storagePath)

    const { error: insertErr } = await supabase.from('media').insert({
      filename: file.name,
      storage_path: storagePath,
      url: publicUrlData.publicUrl,
      mime_type: file.type,
      media_type: 'IMAGE',
      size_bytes: file.size,
      uploaded_by: user.id,
    })

    if (insertErr) {
      setError(insertErr.message)
      setUploading(false)
      return
    }

    setUploading(false)

    if (fileRef.current) {
      fileRef.current.value = ''
    }

    startTransition(() => router.refresh())
  }

  async function handleDelete(item: Media) {
    if (!confirm(`Delete "${item.filename}"?`)) return

    const supabase = createClient()

    const { error: storageErr } = await supabase.storage
      .from('media')
      .remove([item.storage_path])

    if (storageErr) {
      setError(storageErr.message)
      return
    }

    const { error: dbErr } = await supabase
      .from('media')
      .delete()
      .eq('id', item.id)

    if (dbErr) {
      setError(dbErr.message)
      return
    }

    setSelected(null)
    startTransition(() => router.refresh())
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white p-8 text-center transition-colors hover:border-granite-primary/50">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-50">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-gray-400"
              aria-hidden="true"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M17 8l-5-5-5 5 M12 3v12" />
            </svg>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700">Upload an image</p>
            <p className="mt-0.5 text-xs text-gray-400">
              JPEG, PNG, WebP, AVIF · max 10 MB
            </p>
          </div>

          {error && (
            <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">
              {error}
            </p>
          )}

          <label className="cursor-pointer">
            <span
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all ${
                uploading
                  ? 'cursor-not-allowed opacity-60'
                  : 'hover:brightness-110 active:brightness-95'
              }`}
              style={{
                background: uploading
                  ? '#6b7280'
                  : 'linear-gradient(135deg, #142B6F 0%, #0D1E50 100%)',
              }}
            >
              {uploading ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                    />
                  </svg>
                  Uploading…
                </>
              ) : (
                <>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
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

          <p className="text-xs text-gray-400">
            {total} {total === 1 ? 'file' : 'files'} in library
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {items.length === 0 ? (
            <div className="rounded-xl border border-gray-100 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-50">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-7 w-7 text-gray-300"
                  aria-hidden="true"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>

              <p className="text-sm font-semibold text-gray-500">
                No media uploaded yet
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Upload your first image to get started
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelected(item)}
                  className={`group relative aspect-square overflow-hidden rounded-xl border-2 bg-gray-100 transition-all duration-150 ${
                    selected?.id === item.id
                      ? 'scale-[0.98] border-granite-primary shadow-md'
                      : 'border-transparent hover:border-gray-200 hover:shadow-md'
                  }`}
                >
                  <Image
                    src={item.url}
                    alt={item.alt_text ?? item.filename}
                    fill
                    className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, 33vw"
                  />

                  {selected?.id === item.id && (
                    <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-granite-primary shadow-sm">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      >
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}

                  <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <p className="truncate text-[10px] font-medium text-white">
                      {item.filename}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {(hasMore || page > 1) && (
            <div className="mt-4 flex gap-3">
              {page > 1 && (
                <a
                  href={`/admin/media?page=${page - 1}`}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50"
                >
                  ← Previous
                </a>
              )}

              {hasMore && (
                <a
                  href={`/admin/media?page=${page + 1}`}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50"
                >
                  Next →
                </a>
              )}
            </div>
          )}
        </div>

        {selected && (
          <div className="lg:col-span-1">
            <div className="sticky top-32 space-y-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-50">
                <Image
                  src={selected.url}
                  alt={selected.alt_text ?? selected.filename}
                  fill
                  className="object-contain"
                />
              </div>

              <div className="space-y-1">
                <p className="truncate text-xs font-semibold text-gray-800">
                  {selected.filename}
                </p>
                <p className="text-xs text-gray-400">
                  {(selected.size_bytes / 1024).toFixed(1)} KB
                  {selected.width && selected.height
                    ? ` · ${selected.width}×${selected.height}`
                    : ''}
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                  Public URL
                </label>
                <input
                  readOnly
                  value={selected.url}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-granite-primary/25"
                  onFocus={(e) => e.target.select()}
                />
              </div>

              <button
                type="button"
                onClick={() => handleDelete(selected)}
                disabled={isPending}
                className="w-full rounded-lg border border-red-200 py-2 text-xs font-bold text-red-600 transition-colors hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
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