'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'

type Category = Database['public']['Tables']['categories']['Row']

interface SubcategoryManagerProps {
  categories: Category[]
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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

      if (err) {
        setError(err.message)
        return
      }

      resetForm()
      router.refresh()
    })
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this subcategory? Articles assigned to it will lose this subcategory.')) {
      return
    }

    const supabase = createClient()
    const { error: err } = await supabase.from('categories').delete().eq('id', id)

    if (err) {
      setError(err.message)
      return
    }

    router.refresh()
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-bold text-gray-800">
            {editing ? 'Edit Subcategory' : 'New Subcategory'}
          </h2>

          {error && (
            <p className="mb-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">
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
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                Name *
              </label>
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
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                Slug *
              </label>
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
                className="flex-1 rounded-lg bg-granite-primary py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110 disabled:opacity-50"
              >
                {isPending ? 'Saving…' : editing ? 'Save Changes' : 'Add Subcategory'}
              </button>

              {editing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm transition-colors hover:bg-gray-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-3.5">
            <h2 className="text-sm font-bold text-gray-800">
              Subcategories{' '}
              <span className="font-normal text-gray-400">({subcategories.length})</span>
            </h2>
          </div>

          {subcategories.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-gray-400">
              No subcategories yet. Add one using the form.
            </p>
          ) : (
            <ul className="divide-y divide-gray-50">
              {topLevel.map((parent) => {
                const subs = subcategories.filter((s) => s.parent_id === parent.id)
                if (subs.length === 0) return null

                return (
                  <li key={parent.id}>
                    <div className="bg-gray-50 px-5 py-2">
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                        {parent.name}
                      </p>
                    </div>

                    <ul className="divide-y divide-gray-50">
                      {subs.map((sub) => (
                        <li
                          key={sub.id}
                          className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-blue-50/30"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-800">{sub.name}</p>
                            <p className="font-mono text-xs text-gray-400">
                              /category/{sub.slug}
                            </p>
                          </div>

                          <div className="ml-4 flex flex-shrink-0 items-center gap-2">
                            <button
                              type="button"
                              onClick={() => startEdit(sub)}
                              className="rounded px-2 py-1 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-800"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(sub.id)}
                              className="rounded px-2 py-1 text-xs font-semibold text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
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