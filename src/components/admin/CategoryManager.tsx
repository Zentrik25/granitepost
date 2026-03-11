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
  const [parentId, setParentId] = useState<string>('')
  const [editing, setEditing] = useState<Category | null>(null)

  const topLevel = categories.filter((c) => !c.parent_id)
  const childrenOf = (id: string) => categories.filter((c) => c.parent_id === id)

  function resetForm() {
    setName('')
    setSlug('')
    setDescription('')
    setParentId('')
    setEditing(null)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (parentId) {
      const chosenParent = categories.find((c) => c.id === parentId)
      if (chosenParent?.parent_id) {
        setError(
          'Cannot create a subcategory of a subcategory. Select a top-level category as parent.'
        )
        return
      }
    }

    const supabase = createClient()

    startTransition(async () => {
      const payload = {
        name: name.trim(),
        slug: slug.trim() || slugify(name.trim()),
        description: description.trim() || null,
        parent_id: parentId || null,
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

  async function handleDelete(cat: Category) {
    const children = childrenOf(cat.id)
    const hasChildren = children.length > 0
    const childNames = children.map((c) => c.name).join(', ')
    const plural = children.length === 1 ? 'y' : 'ies'
    const confirmMessage = hasChildren
      ? `"${cat.name}" has ${children.length} subcategor${plural} (${childNames}). Deleting it will unlink those subcategories. Articles in "${cat.name}" will be uncategorised. Continue?`
      : `Delete "${cat.name}"? Articles in this category will be uncategorised.`

    if (!confirm(confirmMessage)) return

    const supabase = createClient()
    const { error: err } = await supabase.from('categories').delete().eq('id', cat.id)

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
    setParentId(cat.parent_id ?? '')
  }

  const parentOptions = topLevel.filter((c) => !editing || c.id !== editing.id)

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
                Name <span className="text-red-500">*</span>
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
                Slug <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={slug}
                required
                onChange={(e) => setSlug(e.target.value)}
                className={`${INPUT} font-mono`}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                Parent category
              </label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className={INPUT}
              >
                <option value="">— Top-level (no parent) —</option>
                {parentOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-gray-400">
                Leave blank to create a top-level category.
              </p>
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
                {isPending ? 'Saving\u2026' : editing ? 'Update' : 'Create'}
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
              {topLevel.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-5 py-10 text-center text-gray-400">
                    No categories yet.
                  </td>
                </tr>
              )}

              {topLevel.map((parent) => {
                const subs = childrenOf(parent.id)
                return (
                  <>
                    <tr key={parent.id} className="transition-colors hover:bg-blue-50/20">
                      <td className="px-5 py-3.5 font-semibold text-gray-800">
                        {parent.name}
                        {subs.length > 0 && (
                          <span className="ml-2 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-600">
                            {subs.length} sub
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-gray-400">
                        {parent.slug}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => startEdit(parent)}
                            className="text-xs font-semibold text-granite-primary hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(parent)}
                            className="text-xs text-gray-400 transition-colors hover:text-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>

                    {subs.map((sub) => (
                      <tr
                        key={sub.id}
                        className="bg-gray-50/40 transition-colors hover:bg-blue-50/15"
                      >
                        <td className="py-3 pl-10 pr-5 text-gray-600">
                          <span className="mr-2 text-gray-300">\u21b3</span>
                          {sub.name}
                        </td>
                        <td className="px-5 py-3 font-mono text-xs text-gray-400">
                          {sub.slug}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex justify-end gap-3">
                            <button
                              type="button"
                              onClick={() => startEdit(sub)}
                              className="text-xs font-semibold text-granite-primary hover:underline"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(sub)}
                              className="text-xs text-gray-400 transition-colors hover:text-red-600"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
