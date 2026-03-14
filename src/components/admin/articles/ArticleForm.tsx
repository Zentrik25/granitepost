'use client'

import { useActionState, useState } from 'react'
import dynamic from 'next/dynamic'
import type { Database } from '@/types/database'
import type { ActionResult } from '@/lib/admin/articles/validation'
import type { CategoryOption, AuthorOption } from '@/lib/admin/articles/queries'

const RichTextEditor = dynamic(
  () => import('./RichTextEditor').then((m) => m.RichTextEditor),
  {
    ssr: false,
    loading: () => (
      <div className="border border-brand-border bg-gray-50 min-h-[420px] flex items-center justify-center text-sm text-gray-400">
        Loading editor…
      </div>
    ),
  }
)

type ArticleRow = Database['public']['Tables']['articles']['Row']
type Article = ArticleRow & { is_featured?: boolean | null; top_story_rank?: number | null }

type SaveAction = (state: ActionResult, formData: FormData) => Promise<ActionResult>

interface Props {
  saveAction: SaveAction
  article?: Article
  selectedTagNames?: string
  categories: CategoryOption[]
  authors: AuthorOption[]
  currentUserId: string
  userRole: string
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
  return <p className="mt-1 text-xs text-red-600">{errors[0]}</p>
}

export function ArticleForm({
  saveAction,
  article,
  selectedTagNames = '',
  categories,
  authors,
  currentUserId,
  userRole,
  mode,
}: Props) {
  const [state, formAction, isPending] = useActionState(saveAction, INITIAL)
  const [title, setTitle] = useState(article?.title ?? '')
  const [slug, setSlug] = useState(article?.slug ?? '')
  const [isBreaking, setIsBreaking] = useState(article?.is_breaking ?? false)
  const [isFeatured, setIsFeatured] = useState(article?.is_featured ?? false)
  const [isTopStory, setIsTopStory] = useState(article?.top_story_rank != null)

  const fe = state.fieldErrors as Record<string, string[] | undefined> | undefined

  function handleTitleChange(val: string) {
    setTitle(val)
    if (mode === 'create') setSlug(slugify(val))
  }

  return (
    <form action={formAction} className="max-w-4xl space-y-6" noValidate>
      {!isPending && state.error && (
        <div role="alert" className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}
      {!isPending && state.success && (
        <div role="status" className="border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          Saved successfully.
        </div>
      )}

      {/* Content */}
      <section className="space-y-4 border border-brand-border bg-white p-6">
        <h2 className="text-xs font-bold uppercase tracking-widest text-brand-muted">Content</h2>

        <div>
          <label htmlFor="af-title" className="mb-1 block text-xs font-semibold">
            Title <span className="text-brand-red">*</span>
          </label>
          <input
            id="af-title" name="title" type="text" required maxLength={300}
            value={title} onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
          />
          <FieldError errors={fe?.title} />
        </div>

        <div>
          <label htmlFor="af-slug" className="mb-1 block text-xs font-semibold">
            Slug <span className="text-brand-red">*</span>
          </label>
          <input
            id="af-slug" name="slug" type="text" required maxLength={300}
            value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase())}
            className="w-full border border-brand-border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-red"
          />
          <FieldError errors={fe?.slug} />
        </div>

        <div>
          <label htmlFor="af-excerpt" className="mb-1 block text-xs font-semibold">Excerpt</label>
          <textarea
            id="af-excerpt" name="excerpt" maxLength={1000} rows={3}
            defaultValue={article?.excerpt ?? ''}
            className="w-full resize-y border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
          />
          <FieldError errors={fe?.excerpt} />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold">
            Body <span className="text-brand-red">*</span>
          </label>
          <RichTextEditor defaultValue={article?.body_html ?? ''} name="body_html" />
          <FieldError errors={fe?.body_html} />
        </div>
      </section>

      {/* Publish */}
      <section className="space-y-4 border border-brand-border bg-white p-6">
        <h2 className="text-xs font-bold uppercase tracking-widest text-brand-muted">Publish</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="af-status" className="mb-1 block text-xs font-semibold">Status</label>
            <select
              id="af-status" name="status" defaultValue={article?.status ?? 'DRAFT'}
              className="w-full border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
            >
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <FieldError errors={fe?.status} />
          </div>

          <div>
            <label htmlFor="af-category" className="mb-1 block text-xs font-semibold">Category</label>
            <select
              id="af-category" name="category_id" defaultValue={article?.category_id ?? ''}
              className="w-full border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
            >
              <option value="">— No category —</option>
              {(() => {
                const parents = categories.filter((c) => !c.parent_id)
                const childrenOf = (pid: string) => categories.filter((c) => c.parent_id === pid)
                const orphans = categories.filter(
                  (c) => c.parent_id && !categories.find((p) => p.id === c.parent_id)
                )
                return (
                  <>
                    {parents.map((parent) => {
                      const subs = childrenOf(parent.id)
                      return subs.length > 0 ? (
                        <optgroup key={parent.id} label={parent.name}>
                          <option value={parent.id}>{parent.name} (all)</option>
                          {subs.map((sub) => (
                            <option key={sub.id} value={sub.id}>{'  '}{sub.name}</option>
                          ))}
                        </optgroup>
                      ) : (
                        <option key={parent.id} value={parent.id}>{parent.name}</option>
                      )
                    })}
                    {orphans.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </>
                )
              })()}
            </select>
            <FieldError errors={fe?.category_id} />
          </div>
        </div>

        <div>
          <label htmlFor="af-author" className="mb-1 block text-xs font-semibold">
            Author <span className="text-brand-red">*</span>
          </label>
          {userRole === 'AUTHOR' ? (
            <>
              <input type="hidden" name="author_id" value={currentUserId} />
              <p className="text-sm text-brand-muted">
                {authors.find((a) => a.id === currentUserId)?.full_name ?? 'You'}
              </p>
            </>
          ) : (
            <select
              id="af-author" name="author_id" defaultValue={article?.author_id ?? currentUserId}
              className="w-full border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
            >
              <option value="">— Unassigned —</option>
              {authors.map((a) => (
                <option key={a.id} value={a.id}>{a.full_name ?? a.id}</option>
              ))}
            </select>
          )}
          <FieldError errors={fe?.author_id} />
        </div>

        <div>
          <label htmlFor="af-rank" className="mb-1 block text-xs font-semibold">
            Featured rank{' '}
            <span className="font-normal text-brand-muted">(1 = hero; blank = not featured)</span>
          </label>
          <input
            id="af-rank" name="featured_rank" type="number" min={1} max={100}
            defaultValue={article?.featured_rank ?? ''}
            className="w-32 border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
          />
          <FieldError errors={fe?.featured_rank} />
        </div>

        <div className="space-y-2">
          <label className="flex cursor-pointer select-none items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox" name="is_top_story"
              checked={isTopStory} onChange={(e) => setIsTopStory(e.target.checked)}
              className="h-4 w-4 accent-brand-red"
            />
            Pin as Top Story
          </label>
          {isTopStory && (
            <div>
              <label htmlFor="af-top-story-rank" className="mb-1 block text-xs font-semibold">
                Rank slot{' '}
                <span className="font-normal text-brand-muted">(1 = highest priority, 6 = lowest)</span>
              </label>
              <select
                id="af-top-story-rank" name="top_story_rank"
                defaultValue={article?.top_story_rank ?? 1}
                className="w-32 border border-brand-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
              >
                {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>Slot {n}</option>)}
              </select>
              <FieldError errors={fe?.top_story_rank} />
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-start gap-6">
          <label className="flex cursor-pointer select-none items-center gap-2 text-sm">
            <input
              type="checkbox" name="is_featured"
              checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)}
              className="h-4 w-4 accent-brand-red"
            />
            Featured (hero carousel)
          </label>
          <label className="flex cursor-pointer select-none items-center gap-2 text-sm">
            <input
              type="checkbox" name="is_breaking"
              checked={isBreaking} onChange={(e) => setIsBreaking(e.target.checked)}
              className="h-4 w-4 accent-brand-red"
            />
            Breaking news
          </label>
          {isBreaking && (
            <div>
              <label htmlFor="af-expires" className="mb-1 block text-xs font-semibold">
                Breaking expires at <span className="text-brand-red">*</span>
              </label>
              <input
                id="af-expires" name="breaking_expires_at" type="datetime-local"
                defaultValue={article?.breaking_expires_at ? article.breaking_expires_at.slice(0, 16) : ''}
                className="border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
              />
              <FieldError errors={fe?.breaking_expires_at} />
            </div>
          )}
        </div>
      </section>

      {/* Tags */}
      <section className="border border-brand-border bg-white p-6">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-brand-muted">Tags</h2>
        <label htmlFor="af-tags" className="mb-1 block text-xs font-semibold">
          Tag names{' '}
          <span className="font-normal text-brand-muted">(comma-separated)</span>
        </label>
        <input
          id="af-tags"
          name="tag_names"
          type="text"
          defaultValue={selectedTagNames}
          placeholder="politics, elections, harare, zimbabwe"
          className="w-full border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
        />
        <p className="mt-1 text-xs text-brand-muted">
          Type or paste comma-separated tag names. New tags are created automatically.
        </p>
      </section>

      {/* Hero Image */}
      <section className="space-y-4 border border-brand-border bg-white p-6">
        <h2 className="text-xs font-bold uppercase tracking-widest text-brand-muted">Hero Image</h2>
        {[
          { id: 'af-hero-url',  name: 'hero_image_url',     label: 'Image URL',                      type: 'url'  },
          { id: 'af-hero-alt',  name: 'hero_image_alt',     label: 'Alt text',                       type: 'text' },
          { id: 'af-hero-cap',  name: 'hero_image_caption', label: 'Caption',                        type: 'text' },
          { id: 'af-hero-cred', name: 'hero_image_credit',  label: 'Credit (photographer / agency)', type: 'text' },
        ].map(({ id, name, label, type }) => (
          <div key={name}>
            <label htmlFor={id} className="mb-1 block text-xs font-semibold">{label}</label>
            <input
              id={id} name={name} type={type}
              defaultValue={String((article as Record<string, unknown> | undefined)?.[name] ?? '')}
              className="w-full border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
            />
            <FieldError errors={fe?.[name]} />
          </div>
        ))}
      </section>

      {/* SEO */}
      <section className="space-y-4 border border-brand-border bg-white p-6">
        <h2 className="text-xs font-bold uppercase tracking-widest text-brand-muted">SEO / Open Graph</h2>
        <div>
          <label htmlFor="af-og-title" className="mb-1 block text-xs font-semibold">
            OG Title <span className="font-normal text-brand-muted">(blank = article title)</span>
          </label>
          <input id="af-og-title" name="og_title" type="text" maxLength={300}
            defaultValue={article?.og_title ?? ''}
            className="w-full border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red" />
          <FieldError errors={fe?.og_title} />
        </div>
        <div>
          <label htmlFor="af-og-desc" className="mb-1 block text-xs font-semibold">
            OG Description <span className="font-normal text-brand-muted">(blank = excerpt)</span>
          </label>
          <textarea id="af-og-desc" name="og_description" rows={3} maxLength={1000}
            defaultValue={article?.og_description ?? ''}
            className="w-full resize-y border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red" />
          <FieldError errors={fe?.og_description} />
        </div>
        <div>
          <label htmlFor="af-og-img" className="mb-1 block text-xs font-semibold">
            OG Image URL <span className="font-normal text-brand-muted">(≥1200 px wide, 16:9)</span>
          </label>
          <input id="af-og-img" name="og_image_url" type="url"
            defaultValue={article?.og_image_url ?? ''}
            className="w-full border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red" />
          <FieldError errors={fe?.og_image_url} />
        </div>
        <div>
          <label htmlFor="af-canonical" className="mb-1 block text-xs font-semibold">
            Canonical URL <span className="font-normal text-brand-muted">(blank = default)</span>
          </label>
          <input id="af-canonical" name="canonical_url" type="url"
            defaultValue={article?.canonical_url ?? ''}
            className="w-full border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red" />
          <FieldError errors={fe?.canonical_url} />
        </div>
      </section>

      {/* Submit */}
      <div className="sticky bottom-0 flex flex-wrap gap-3 border-t border-brand-border bg-gray-50 py-4">
        <button type="submit" disabled={isPending}
          className="bg-brand-red px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-60">
          {isPending ? 'Saving…' : mode === 'create' ? 'Create Article' : 'Save Changes'}
        </button>
        <a href="/admin/articles"
          className="border border-brand-border px-6 py-2.5 text-sm font-semibold transition-colors hover:bg-brand-gray">
          Cancel
        </a>
        {mode === 'edit' && article?.status === 'PUBLISHED' && (
          <a href={`/article/${article.slug}`} target="_blank" rel="noopener noreferrer"
            className="ml-auto border border-brand-border px-6 py-2.5 text-sm font-semibold transition-colors hover:bg-brand-gray">
            View live →
          </a>
        )}
      </div>
    </form>
  )
}
