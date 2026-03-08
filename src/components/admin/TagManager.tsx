'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Tag } from '@/types'

interface TagManagerProps {
  tags: Tag[]
}

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-')
}

const INPUT = 'w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-granite-primary/25 focus:border-granite-primary transition-colors bg-white'

export function TagManager({ tags }: TagManagerProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [editing, setEditing] = useState<Tag | null>(null)

  function resetForm() { setName(''); setSlug(''); setEditing(null) }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const supabase = createClient()

    startTransition(async () => {
      const payload = {
        name: name.trim(),
        slug: slug.trim() || slugify(name.trim()),
      }

      const { error: err } = editing
        ? await supabase.from('tags').update(payload).eq('id', editing.id)
        : await supabase.from('tags').insert(payload)

      if (err) { setError(err.message); return }
      resetForm()
      router.refresh()
    })
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this tag? It will be removed from all articles.')) return
    const supabase = createClient()
    await supabase.from('tags').delete().eq('id', id)
    router.refresh()
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form card */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-bold text-gray-800 mb-4">
            {editing ? 'Edit Tag' : 'New Tag'}
          </h2>
          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-3">
              {error}
            </p>
          )}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Name *</label>
              <input
                type="text"
                value={name}
                required
                onChange={(e) => { setName(e.target.value); if (!editing) setSlug(slugify(e.target.value)) }}
                className={INPUT}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Slug *</label>
              <input
                type="text"
                value={slug}
                required
                onChange={(e) => setSlug(e.target.value)}
                className={INPUT}
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-2 text-white text-sm font-bold rounded-lg hover:brightness-110 active:brightness-95 disabled:opacity-60 transition-all shadow-sm"
                style={{ background: 'linear-gradient(135deg, #142B6F 0%, #0D1E50 100%)' }}
              >
                {isPending ? 'Saving…' : editing ? 'Update' : 'Create'}
              </button>
              {editing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* List table */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Slug</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tags.map((tag) => (
                <tr key={tag.id} className="hover:bg-blue-50/20 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-gray-800">
                    <span className="text-gray-400 mr-1">#</span>{tag.name}
                  </td>
                  <td className="px-5 py-3.5 text-gray-400 font-mono text-xs">{tag.slug}</td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => { setEditing(tag); setName(tag.name); setSlug(tag.slug) }}
                        className="text-xs font-semibold text-granite-primary hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(tag.id)}
                        className="text-xs text-gray-400 hover:text-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {tags.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-5 py-10 text-center text-gray-400">
                    No tags yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}