'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Category } from '@/types'

interface CategoryManagerProps {
  categories: Category[]
}

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-')
}

export function CategoryManager({ categories }: CategoryManagerProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [editing, setEditing] = useState<Category | null>(null)

  function resetForm() {
    setName(''); setSlug(''); setDescription(''); setEditing(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const supabase = createClient()

    startTransition(async () => {
      const payload = {
        name: name.trim(),
        slug: slug.trim() || slugify(name.trim()),
        description: description.trim() || null,
      }

      const { error: err } = editing
        ? await supabase.from('categories').update(payload).eq('id', editing.id)
        : await supabase.from('categories').insert(payload)

      if (err) { setError(err.message); return }
      resetForm()
      router.refresh()
    })
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this category? Articles will be uncategorised.')) return
    const supabase = createClient()
    await supabase.from('categories').delete().eq('id', id)
    router.refresh()
  }

  function startEdit(cat: Category) {
    setEditing(cat); setName(cat.name); setSlug(cat.slug); setDescription(cat.description ?? '')
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form */}
      <div className="lg:col-span-1">
        <div className="bg-white border border-brand-border p-5">
          <h2 className="text-sm font-bold mb-4">{editing ? 'Edit Category' : 'New Category'}</h2>
          {error && <p className="text-xs text-brand-red mb-3">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Name *</label>
              <input
                type="text"
                value={name}
                required
                onChange={(e) => { setName(e.target.value); if (!editing) setSlug(slugify(e.target.value)) }}
                className="w-full border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Slug *</label>
              <input
                type="text"
                value={slug}
                required
                onChange={(e) => setSlug(e.target.value)}
                className="w-full border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Description</label>
              <textarea
                value={description}
                rows={2}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red resize-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-2 bg-brand-red text-white text-sm font-bold hover:bg-red-700 disabled:opacity-60"
              >
                {isPending ? 'Saving…' : editing ? 'Update' : 'Create'}
              </button>
              {editing && (
                <button type="button" onClick={resetForm} className="px-4 py-2 border border-brand-border text-sm">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* List */}
      <div className="lg:col-span-2">
        <div className="bg-white border border-brand-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-brand-gray border-b border-brand-border">
              <tr>
                <th className="text-left px-4 py-2.5 font-semibold">Name</th>
                <th className="text-left px-4 py-2.5 font-semibold">Slug</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-brand-gray/50">
                  <td className="px-4 py-3 font-medium">{cat.name}</td>
                  <td className="px-4 py-3 text-brand-muted font-mono text-xs">{cat.slug}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-3">
                      <button onClick={() => startEdit(cat)} className="text-xs font-semibold text-brand-red hover:underline">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(cat.id)} className="text-xs text-brand-muted hover:text-brand-red">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-brand-muted">No categories yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
