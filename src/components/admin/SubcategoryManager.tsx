'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Category } from '@/types'

interface SubcategoryManagerProps {
  /** All categories (parents and subcategories) */
  categories: Category[]
}

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-')
}

const INPUT =
  'w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-granite-primary/25 focus:border-granite-primary transition-colors bg-white'

export function SubcategoryManager({ categories }: SubcategoryManagerProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [parentId, setParentId] = useState('')
  const [editing, setEditing] = useState<Category | null>(null)

  const topLevel = categories.filter((c) => !c.parent_id)
  const subcategories = categories.filter((c) => !!c.parent_id)

  function resetForm() {
    setName('')
    setSlug('')
    setParentId('')
    setEditing(null)
    setError(null)
  }

  function startEdit(cat: Category) {
    setEditing(cat)
    setName(cat.name)
    setSlug(cat.slug)
    setParentId(cat.parent_id ?? '')
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (!parentId) {
      setError('Please select a parent category.')
      return
    }

    const supabase = createClient()
    const payload = {
      name: name.trim(),
      slug: slug.trim() || slugify(name.trim()),
      parent_id: parentId,
    }

    startTransition(async () => {
      const { error: err } = editing
        ? await supabase.from('categories').update(payload).eq('id', editing.id)
        : await supabase.from('categories').insert(payload)

      if (err) { setError(err.message); return }
      resetForm()
      router.refresh()
    })
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this subcategory? Articles assigned to it will lose this subcategory.')) return
    const supabase = createClient()
    await supabase.from('categories').delete().eq('id', id)
    router.refresh()
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-bold text-gray-800 mb-4">
            {editing ? 'Edit Subcategory' : 'New Subcategory'}
          </h2>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-3">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Parent Category *
              </label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                required
                className={INPUT}
              >
                <option value="">— Select parent —</option>
                {topLevel.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Name *</label>
              <input
                type="text"
                required
                maxLength={100}
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (!editing) setSlug(slugify(e.target.value))
                }}
                className={INPUT}
                placeholder="e.g. Elections"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Slug *</label>
              <input
                type="text"
                required
                maxLength={100}
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase())}
                className={`${INPUT} font-mono`}
                placeholder="e.g. elections"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 py-2.5 bg-granite-primary text-white text-sm font-semibold rounded-lg hover:brightness-110 disabled:opacity-50 transition-all"
              >
                {isPending ? 'Saving…' : editing ? 'Save Changes' : 'Add Subcategory'}
              </button>
              {editing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2.5 border border-gray-200 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* List */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-800">
              Subcategories <span className="text-gray-400 font-normal">({subcategories.length})</span>
            </h2>
          </div>

          {subcategories.length === 0 ? (
            <p className="px-5 py-10 text-sm text-gray-400 text-center">
              No subcategories yet. Add one using the form.
            </p>
          ) : (
            <ul className="divide-y divide-gray-50">
              {/* Group by parent */}
              {topLevel.map((parent) => {
                const subs = subcategories.filter((s) => s.parent_id === parent.id)
                if (subs.length === 0) return null
                return (
                  <li key={parent.id}>
                    <div className="px-5 py-2 bg-gray-50">
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                        {parent.name}
                      </p>
                    </div>
                    <ul className="divide-y divide-gray-50">
                      {subs.map((sub) => (
                        <li
                          key={sub.id}
                          className="flex items-center justify-between px-5 py-3 hover:bg-blue-50/30 transition-colors"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-800">{sub.name}</p>
                            <p className="text-xs text-gray-400 font-mono">/category/{sub.slug}</p>
                          </div>
                          <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                            <button
                              onClick={() => startEdit(sub)}
                              className="text-xs font-semibold text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(sub.id)}
                              className="text-xs font-semibold text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
