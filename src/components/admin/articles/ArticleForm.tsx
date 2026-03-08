'use client'

import { useActionState, useState } from 'react'
import type { Article } from '@/types'
import type { ActionResult } from '@/lib/admin/articles/validation'
import type { CategoryOption, TagOption } from '@/lib/admin/articles/queries'
import type { createArticleAction } from '@/app/(admin)/admin/articles/actions'

type SaveAction = typeof createArticleAction

interface Props {
  saveAction: SaveAction
  article?: Article
  selectedTagIds?: string[]
  categories: CategoryOption[]
  tags: TagOption[]
  mode: 'create' | 'edit'
}

const STATUSES = ['DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED'] as const
const INITIAL: ActionResult = { success: false }

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null
  return <p className="text-xs text-red-600 mt-1">{errors[0]}</p>
}

export function ArticleForm({
  saveAction,
  article,
  selectedTagIds = [],
  categories,
  tags,
  mode,
}: Props) {
  const [state, formAction, isPending] = useActionState(saveAction, INITIAL)

  const [title, setTitle] = useState(article?.title ?? '')
  const [slug, setSlug] = useState(article?.slug ?? '')
  const [isBreaking, setIsBreaking] = useState(article?.is_breaking ?? false)
  const [isFeatured, setIsFeatured] = useState(article?.is_featured ?? false)
  const [pickedTags, setPickedTags] = useState<Set<string>>(new Set(selectedTagIds))

  function handleTitleChange(val: string) {
    setTitle(val)
    if (mode === 'create') setSlug(slugify(val))
  }

  function toggleTag(id: string) {
    setPickedTags((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const fe = state.fieldErrors

  return (
    <form action={formAction} className="space-y-6 max-w-4xl" noValidate>
      {!isPending && state.error && (
        <div role="alert" className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
          {state.error}
        </div>
      )}
      {!isPending && state.success && (
        <div role="status" className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3">
          Saved successfully.
        </div>
      )}

      <section className="bg-white border border-brand-border p-6 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-brand-muted">Content</h2>

        <div>
          <label htmlFor="af-title" className="block text-xs font-semibold mb-1">
            Title <span className="text-brand-red">*</span>
          </label>
          <input
            id="af-title"
            name="title"
            type="text"
            required
            maxLength={300}
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
          />
          <FieldError errors={fe?.title} />
        </div>

        <div>
          <label htmlFor="af-slug" className="block text-xs font-semibold mb-1">
            Slug <span className="text-brand-red">*</span>
          </label>
          <input
            id="af-slug"
            name="slug"
            type="text"
            required
            maxLength={300}
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase())}
            className="w-full border border-brand-border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-red"
          />
          <FieldError errors={fe?.slug} />
        </div>

        <div>
          <label htmlFor="af-excerpt" className="block text-xs font-semibold mb-1">Excerpt</label>
          <textarea
            id="af-excerpt"
            name="excerpt"
            maxLength={1000}
            rows={3}
            defaultValue={article?.excerpt ?? ''}
            className="w-full border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red resize-y"
          />
          <FieldError errors={fe?.excerpt} />
        </div>

        <div>
          <label htmlFor="af-body" className="block text-xs font-semibold mb-1">
            Body <span className="text-brand-red">*</span>
          </label>
          <textarea
            id="af-body"
            name="body_html"
            rows={28}
            defaultValue={article?.body_html ?? ''}
            placeholder="Write the article here. Separate paragraphs with a blank line."
            className="w-full border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red resize-y"
          />
          <p className="mt-1 text-xs text-brand-muted">
            Plain text is allowed. Paragraphs will be formatted automatically when saved.
          </p>
          <FieldError errors={fe?.body_html} />
        </div>
      </section>

      <section className="bg-white border border-brand-border p-6 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-brand-muted">Publish</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="af-status" className="block text-xs font-semibold mb-1">Status</label>
            <select
              id="af-status"
              name="status"
              defaultValue={article?.status ?? 'DRAFT'}
              className="w-full border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <FieldError errors={fe?.status} />
          </div>

          <div>
            <label htmlFor="af-category" className="block text-xs font-semibold mb-1">Category</label>
            <select
              id="af-category"
              name="category_id"
              defaultValue={article?.category_id ?? ''}
              className="w-full border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
            >
              <option value="">— No category —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <FieldError errors={fe?.category_id} />
          </div>
        </div>

        <div>
          <label htmlFor="af-rank" className="block text-xs font-semibold mb-1">
            Featured rank{' '}
            <span className="font-normal text-brand-muted">(1 = hero; blank = not featured)</span>
          </label>
          <input
            id="af-rank"
            name="featured_rank"
            type="number"
            min={1}
            max={100}
            defaultValue={article?.featured_rank ?? ''}
            className="w-32 border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
          />
          <FieldError errors={fe?.featured_rank} />
        </div>

        <div className="flex flex-wrap gap-6 items-start">
          <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              name="is_featured"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-4 h-4 accent-brand-red"
            />
            Featured (hero carousel)
          </label>

          <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              name="is_breaking"
              checked={isBreaking}
              onChange={(e) => setIsBreaking(e.target.checked)}
              className="w-4 h-4 accent-brand-red"
            />
            Breaking news
          </label>

          {isBreaking && (
            <div>
              <label htmlFor="af-expires" className="block text-xs font-semibold mb-1">
                Breaking expires at <span className="text-brand-red">*</span>
              </label>
              <input
                id="af-expires"
                name="breaking_expires_at"
                type="datetime-local"
                defaultValue={
                  article?.breaking_expires_at
                    ? article.breaking_expires_at.slice(0, 16)
                    : ''
                }
                className="border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
              />
              <FieldError errors={fe?.breaking_expires_at} />
            </div>
          )}
        </div>
      </section>

      <section className="bg-white border border-brand-border p-6">
        <h2 className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-3">Tags</h2>
        {tags.length === 0 ? (
          <p className="text-xs text-brand-muted">No tags yet — create them in the Tags section.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
              const picked = pickedTags.has(tag.id)
              return (
                <label
                  key={tag.id}
                  className={`text-xs px-3 py-1 border cursor-pointer transition-colors ${
                    picked
                      ? 'bg-brand-red text-white border-brand-red'
                      : 'border-brand-border hover:border-brand-dark'
                  }`}
                >
                  <input
                    type="checkbox"
                    name="tag_ids"
                    value={tag.id}
                    checked={picked}
                    onChange={() => toggleTag(tag.id)}
                    className="sr-only"
                  />
                  {tag.name}
                </label>
              )
            })}
          </div>
        )}
      </section>

      <section className="bg-white border border-brand-border p-6 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-brand-muted">Hero Image</h2>

        {[
          { id: 'af-hero-url', name: 'hero_image_url', label: 'Image URL', type: 'url' },
          { id: 'af-hero-alt', name: 'hero_image_alt', label: 'Alt text', type: 'text' },
          { id: 'af-hero-cap', name: 'hero_image_caption', label: 'Caption', type: 'text' },
          { id: 'af-hero-cred', name: 'hero_image_credit', label: 'Credit (photographer / agency)', type: 'text' },
        ].map(({ id, name, label, type }) => (
          <div key={name}>
            <label htmlFor={id} className="block text-xs font-semibold mb-1">{label}</label>
            <input
              id={id}
              name={name}
              type={type}
              defaultValue={(article as Record<string, unknown>)?.[name] as string ?? ''}
              className="w-full border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
            />
            <FieldError errors={(fe as Record<string, string[]> | undefined)?.[name]} />
          </div>
        ))}
      </section>

      <section className="bg-white border border-brand-border p-6 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-brand-muted">SEO / Open Graph</h2>

        <div>
          <label htmlFor="af-og-title" className="block text-xs font-semibold mb-1">
            OG Title <span className="font-normal text-brand-muted">(blank = article title)</span>
          </label>
          <input
            id="af-og-title"
            name="og_title"
            type="text"
            maxLength={300}
            defaultValue={article?.og_title ?? ''}
            className="w-full border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
          />
          <FieldError errors={fe?.og_title} />
        </div>

        <div>
          <label htmlFor="af-og-desc" className="block text-xs font-semibold mb-1">
            OG Description <span className="font-normal text-brand-muted">(blank = excerpt)</span>
          </label>
          <textarea
            id="af-og-desc"
            name="og_description"
            rows={3}
            maxLength={1000}
            defaultValue={article?.og_description ?? ''}
            className="w-full border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red resize-y"
          />
          <FieldError errors={fe?.og_description} />
        </div>

        <div>
          <label htmlFor="af-og-img" className="block text-xs font-semibold mb-1">
            OG Image URL <span className="font-normal text-brand-muted">(≥1200 px wide, 16:9)</span>
          </label>
          <input
            id="af-og-img"
            name="og_image_url"
            type="url"
            defaultValue={article?.og_image_url ?? ''}
            className="w-full border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
          />
          <FieldError errors={fe?.og_image_url} />
        </div>

        <div>
          <label htmlFor="af-canonical" className="block text-xs font-semibold mb-1">
            Canonical URL <span className="font-normal text-brand-muted">(blank = default)</span>
          </label>
          <input
            id="af-canonical"
            name="canonical_url"
            type="url"
            defaultValue={article?.canonical_url ?? ''}
            className="w-full border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
          />
          <FieldError errors={fe?.canonical_url} />
        </div>
      </section>

      <div className="flex flex-wrap gap-3 sticky bottom-0 bg-gray-50 py-4 border-t border-brand-border">
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2.5 bg-brand-red text-white font-bold text-sm hover:bg-red-700 disabled:opacity-60 transition-colors"
        >
          {isPending
            ? 'Saving…'
            : mode === 'create'
              ? 'Create Article'
              : 'Save Changes'}
        </button>
        <a
          href="/admin/articles"
          className="px-6 py-2.5 border border-brand-border text-sm font-semibold hover:bg-brand-gray transition-colors"
        >
          Cancel
        </a>
        {mode === 'edit' && article?.status === 'PUBLISHED' && (
          <a
            href={`/article/${article.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2.5 border border-brand-border text-sm font-semibold hover:bg-brand-gray transition-colors ml-auto"
          >
            View live &rarr;
          </a>
        )}
      </div>
    </form>
  )
}