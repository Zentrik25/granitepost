'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'

type Article = Database['public']['Tables']['articles']['Row']

interface Category {
  id: string
  name: string
}

interface Tag {
  id: string
  name: string
}

interface ArticleEditorProps {
  article?: Article
  selectedTagIds?: string[]
  categories: Category[]
  tags: Tag[]
  mode: 'create' | 'edit'
}

const STATUSES = ['DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED'] as const
type ArticleStatus = (typeof STATUSES)[number]

export function ArticleEditor({
  article,
  selectedTagIds = [],
  categories,
  tags,
  mode,
}: ArticleEditorProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [form, setForm] = useState({
    title: article?.title ?? '',
    slug: article?.slug ?? '',
    excerpt: article?.excerpt ?? '',
    body_html: article?.body_html ?? '',
    status: (article?.status as ArticleStatus | null) ?? 'DRAFT',
    category_id: article?.category_id ?? '',
    hero_image_url: article?.hero_image_url ?? '',
    hero_image_alt: article?.hero_image_alt ?? '',
    hero_image_caption: article?.hero_image_caption ?? '',
    hero_image_credit: article?.hero_image_credit ?? '',
    og_title: article?.og_title ?? '',
    og_description: article?.og_description ?? '',
    og_image_url: article?.og_image_url ?? '',
    canonical_url: article?.canonical_url ?? '',
    is_breaking: article?.is_breaking ?? false,
    breaking_expires_at: article?.breaking_expires_at ?? '',
    featured_rank: article?.featured_rank?.toString() ?? '',
  })

  const [pickedTags, setPickedTags] = useState<string[]>(selectedTagIds)

  function slugify(text: string) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  function handleTitleChange(val: string) {
    setForm((f) => ({
      ...f,
      title: val,
      slug: mode === 'create' ? slugify(val) : f.slug,
    }))
  }

  function toggleTag(id: string) {
    setPickedTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError('Not authenticated.')
      return
    }

    startTransition(async () => {
      const payload = {
        ...form,
        category_id: form.category_id || null,
        hero_image_url: form.hero_image_url || null,
        hero_image_alt: form.hero_image_alt || null,
        hero_image_caption: form.hero_image_caption || null,
        hero_image_credit: form.hero_image_credit || null,
        og_title: form.og_title || null,
        og_description: form.og_description || null,
        og_image_url: form.og_image_url || null,
        canonical_url: form.canonical_url || null,
        breaking_expires_at: form.breaking_expires_at || null,
        featured_rank: form.featured_rank ? parseInt(form.featured_rank, 10) : null,
        published_at:
          form.status === 'PUBLISHED' && !article?.published_at
            ? new Date().toISOString()
            : article?.published_at ?? null,
      }

      let articleId: string

      if (mode === 'create') {
        const { data, error: err } = await supabase
          .from('articles')
          .insert({ ...payload, author_id: user.id })
          .select('id')
          .single()

        if (err || !data) {
          setError(err?.message ?? 'Failed to create article.')
          return
        }

        articleId = data.id
      } else {
        if (!article?.id) {
          setError('Missing article id.')
          return
        }

        const { error: err } = await supabase
          .from('articles')
          .update(payload)
          .eq('id', article.id)

        if (err) {
          setError(err.message)
          return
        }

        articleId = article.id
      }

      const { error: deleteTagsError } = await supabase
        .from('article_tags')
        .delete()
        .eq('article_id', articleId)

      if (deleteTagsError) {
        setError(deleteTagsError.message)
        return
      }

      if (pickedTags.length > 0) {
        const { error: insertTagsError } = await supabase
          .from('article_tags')
          .insert(
            pickedTags.map((tag_id) => ({
              article_id: articleId,
              tag_id,
            }))
          )

        if (insertTagsError) {
          setError(insertTagsError.message)
          return
        }
      }

      setSuccess(mode === 'create' ? 'Article created.' : 'Article saved.')

      if (mode === 'create') {
        router.push(`/admin/articles/${articleId}`)
        return
      }

      router.refresh()
    })
  }

  const field = (
    label: string,
    key: keyof typeof form,
    type: 'text' | 'textarea' | 'url' = 'text',
    required = false
  ) => (
    <div>
      <label className="block text-xs font-semibold mb-1">
        {label} {required && <span className="text-brand-red">*</span>}
      </label>

      {type === 'textarea' ? (
        <textarea
          value={String(form[key] ?? '')}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
          rows={3}
          required={required}
          className="w-full border border-brand-border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-red resize-y"
        />
      ) : (
        <input
          type={type}
          value={String(form[key] ?? '')}
          onChange={(e) =>
            key === 'title'
              ? handleTitleChange(e.target.value)
              : setForm((f) => ({ ...f, [key]: e.target.value }))
          }
          required={required}
          className="w-full border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
        />
      )}
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3">
          {success}
        </div>
      )}

      <div className="bg-white border border-brand-border p-6 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wide text-brand-muted">
          Content
        </h2>

        {field('Title', 'title', 'text', true)}
        {field('Slug', 'slug', 'text', true)}
        {field('Excerpt', 'excerpt', 'textarea')}

        <div>
          <label className="block text-xs font-semibold mb-1">
            Body (HTML) <span className="text-brand-red">*</span>
          </label>
          <textarea
            value={form.body_html}
            onChange={(e) => setForm((f) => ({ ...f, body_html: e.target.value }))}
            rows={25}
            required
            placeholder="<p>Article content...</p>"
            className="w-full border border-brand-border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-red resize-y"
          />
        </div>
      </div>

      <div className="bg-white border border-brand-border p-6 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wide text-brand-muted">
          Publish
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  status: e.target.value as ArticleStatus,
                }))
              }
              className="w-full border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Category</label>
            <select
              value={form.category_id}
              onChange={(e) =>
                setForm((f) => ({ ...f, category_id: e.target.value }))
              }
              className="w-full border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
            >
              <option value="">— No category —</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_breaking}
              onChange={(e) =>
                setForm((f) => ({ ...f, is_breaking: e.target.checked }))
              }
              className="w-4 h-4 accent-brand-red"
            />
            Breaking news
          </label>

          {form.is_breaking && (
            <div>
              <label className="block text-xs font-semibold mb-1">
                Breaking expires at
              </label>
              <input
                type="datetime-local"
                value={form.breaking_expires_at}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    breaking_expires_at: e.target.value,
                  }))
                }
                className="border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1">
            Featured rank (lower = higher priority; blank = not featured)
          </label>
          <input
            type="number"
            min={1}
            value={form.featured_rank}
            onChange={(e) =>
              setForm((f) => ({ ...f, featured_rank: e.target.value }))
            }
            placeholder="e.g. 1 = hero"
            className="w-40 border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
          />
        </div>
      </div>

      <div className="bg-white border border-brand-border p-6">
        <h2 className="text-sm font-bold uppercase tracking-wide text-brand-muted mb-3">
          Tags
        </h2>

        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.id)}
              className={`text-xs px-3 py-1 border transition-colors ${
                pickedTags.includes(tag.id)
                  ? 'bg-brand-red text-white border-brand-red'
                  : 'border-brand-border hover:border-brand-dark'
              }`}
            >
              {tag.name}
            </button>
          ))}

          {tags.length === 0 && (
            <p className="text-xs text-brand-muted">
              No tags yet — create them in the Tags section.
            </p>
          )}
        </div>
      </div>

      <div className="bg-white border border-brand-border p-6 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wide text-brand-muted">
          Hero Image
        </h2>

        {field('Image URL', 'hero_image_url', 'url')}
        {field('Alt Text', 'hero_image_alt')}
        {field('Caption', 'hero_image_caption')}
        {field('Credit (photographer / agency)', 'hero_image_credit')}
      </div>

      <div className="bg-white border border-brand-border p-6 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wide text-brand-muted">
          SEO / Open Graph
        </h2>

        {field('OG Title (leave blank to use article title)', 'og_title')}
        {field('OG Description (leave blank to use excerpt)', 'og_description', 'textarea')}
        {field('OG Image URL (>=1200px wide, 16:9)', 'og_image_url', 'url')}
        {field('Canonical URL (leave blank to use default)', 'canonical_url', 'url')}
      </div>

      <div className="flex gap-3 sticky bottom-0 bg-gray-50 py-4">
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2.5 bg-brand-red text-white font-bold text-sm hover:bg-red-700 disabled:opacity-60 transition-colors"
        >
          {isPending ? 'Saving…' : mode === 'create' ? 'Create Article' : 'Save Changes'}
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
            rel="noreferrer"
            className="px-6 py-2.5 border border-brand-border text-sm font-semibold hover:bg-brand-gray transition-colors ml-auto"
          >
            View live &rarr;
          </a>
        )}
      </div>
    </form>
  )
}