'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'

type Category = Database['public']['Tables']['categories']['Row']

interface CategoryManagerProps {
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

export function CategoryManager({ categories }: CategoryManagerProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [editing, setEditing] = useState<Category | null>(null)

  function resetForm() {
    setName('')
    setSlug('')
    setDescription('')
    setEditing(null)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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

      if (err) {
        setError(err.message)
        return
      }

      resetForm()
      router.refresh()
    })
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this category? Articles will be uncategorised.')) return

    const supabase = createClient()
    const { error: err } = await supabase.from('categories').delete().eq('id', id)

    if (err) {
      setError(err.message)
      return
    }

    router.refresh()
  }

  function startEdit(cat: Category) {
    setEditing(cat)
    setName(cat.name)
    setSlug(cat.slug)
    setDescription(cat.description ?? '')
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-bold text-gray-800">
            {editing ? 'Edit Category' : 'New Category'}
          </h2>

          {error && (
            <p className="mb-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                Name *
              </label>
              <input
                type="text"
                value={name}
                required
                onChange={(e) => {
                  setName(e.target.value)
                  if (!editing) setSlug(slugify(e.target.value))
                }}
                className={INPUT}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                Slug *
              </label>
              <input
                type="text"
                value={slug}
                required
                onChange={(e) => setSlug(e.target.value)}
                className={INPUT}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                Description
              </label>
              <textarea
                value={description}
                rows={2}
                onChange={(e) => setDescription(e.target.value)}
                className={`${INPUT} resize-none`}
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={isPending}
                className="rounded-lg px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:brightness-110 active:brightness-95 disabled:opacity-60"
                style={{
                  background: 'linear-gradient(135deg, #142B6F 0%, #0D1E50 100%)',
                }}
              >
                {isPending ? 'Saving…' : editing ? 'Update' : 'Create'}
              </button>

              {editing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50"
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
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Name
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Slug
                </th>
                <th className="px-5 py-3" />
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {categories.map((cat) => (
                <tr key={cat.id} className="transition-colors hover:bg-blue-50/20">
                  <td className="px-5 py-3.5 font-medium text-gray-800">{cat.name}</td>
                  <td className="px-5 py-3.5 font-mono text-xs text-gray-400">
                    {cat.slug}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => startEdit(cat)}
                        className="text-xs font-semibold text-granite-primary hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(cat.id)}
                        className="text-xs text-gray-400 transition-colors hover:text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {categories.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-5 py-10 text-center text-gray-400">
                    No categories yet.
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