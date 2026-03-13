'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/guards'
import {
  articleInputSchema,
  roleCanPublish,
  roleCanEdit,
  roleCanArchive,
  type ActionResult,
  type ArticleFormInput,
} from '@/lib/admin/articles/validation'
import { syncArticleTags } from '@/lib/admin/articles/queries'

function normalizeBodyHtml(input: unknown): string {
  const value = String(input ?? '').trim()
  if (!value) return ''

  // If it already looks like HTML, keep it as-is
  if (/<[a-z][\s\S]*>/i.test(value)) {
    return value
  }

  // Convert plain text into paragraph HTML
  return value
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, '<br />')}</p>`)
    .join('\n')
}

// ── Form data → raw object ────────────────────────────────────────────────────

function parseFormData(formData: FormData): Record<string, unknown> {
  const tagIds = formData.getAll('tag_ids').filter(Boolean) as string[]
  const breakingRaw = (formData.get('breaking_expires_at') as string | null) ?? ''
  const featuredRaw = (formData.get('featured_rank') as string | null) ?? ''
  const isBreaking = formData.get('is_breaking') === 'on'
  const isFeatured = formData.get('is_featured') === 'on'
  const isTopStory = formData.get('is_top_story') === 'on'
  const topStoryRaw = (formData.get('top_story_rank') as string | null) ?? ''

  return {
    title: formData.get('title') ?? '',
    slug: ((formData.get('slug') as string) ?? '').toLowerCase().trim(),
    excerpt: formData.get('excerpt') ?? '',
    body_html: normalizeBodyHtml(formData.get('body_html')),
    category_id: formData.get('category_id') ?? '',
    hero_image_url: formData.get('hero_image_url') ?? '',
    hero_image_alt: formData.get('hero_image_alt') ?? '',
    hero_image_caption: formData.get('hero_image_caption') ?? '',
    hero_image_credit: formData.get('hero_image_credit') ?? '',
    og_title: formData.get('og_title') ?? '',
    og_description: formData.get('og_description') ?? '',
    og_image_url: formData.get('og_image_url') ?? '',
    canonical_url: formData.get('canonical_url') ?? '',
    is_featured: isFeatured,
    is_breaking: isBreaking,
    breaking_expires_at: breakingRaw ? new Date(breakingRaw).toISOString() : '',
    featured_rank: featuredRaw ? Number(featuredRaw) : null,
    top_story_rank: isTopStory && topStoryRaw ? Number(topStoryRaw) : null,
    tag_ids: tagIds,
    author_id: (formData.get('author_id') as string | null) ?? '',
    status: formData.get('status') ?? 'DRAFT',
  }
}

function toFieldErrors(
  flat: Partial<Record<string, string[]>>
): ActionResult['fieldErrors'] {
  return flat as ActionResult['fieldErrors']
}

// ── DB payload builder ────────────────────────────────────────────────────────

function buildDbPayload(input: ArticleFormInput) {
  return {
    title: input.title,
    slug: input.slug,
    excerpt: input.excerpt || null,
    body_html: input.body_html || '',
    category_id: input.category_id || null,
    hero_image_url: input.hero_image_url || null,
    hero_image_alt: input.hero_image_alt || null,
    hero_image_caption: input.hero_image_caption || null,
    hero_image_credit: input.hero_image_credit || null,
    og_title: input.og_title || null,
    og_description: input.og_description || null,
    og_image_url: input.og_image_url || null,
    canonical_url: input.canonical_url || null,
    is_featured: input.is_featured,
    is_breaking: input.is_breaking,
    breaking_expires_at: input.breaking_expires_at || null,
    featured_rank: input.featured_rank ?? null,
    top_story_rank: input.top_story_rank ?? null,
    status: input.status,
  }
}

// ── createArticleAction ───────────────────────────────────────────────────────

export async function createArticleAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const { user, role } = await requireAuth()

  if (!roleCanEdit(role)) {
    return { success: false, error: 'Unauthorized.' }
  }

  const raw = parseFormData(formData)

  // Authors cannot self-publish — demote to REVIEW
  if (raw.status === 'PUBLISHED' && !roleCanPublish(role)) {
    raw.status = 'REVIEW'
  }

  const parsed = articleInputSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: toFieldErrors(parsed.error.flatten().fieldErrors),
    }
  }

  const supabase = await createClient()

  // Slug uniqueness check
  const { data: existing } = await supabase
    .from('articles')
    .select('id')
    .eq('slug', parsed.data.slug)
    .maybeSingle()

  if (existing) {
    return { success: false, fieldErrors: { slug: ['This slug is already in use.'] } }
  }

  // Clear rank from any other article that currently holds the same slot
  if (parsed.data.top_story_rank != null) {
    await supabase
      .from('articles')
      .update({ top_story_rank: null })
      .eq('top_story_rank', parsed.data.top_story_rank)
  }

  // AUTHOR role is locked to their own profile; ADMIN/EDITOR may assign any author
  const authorId =
    role === 'AUTHOR' || !parsed.data.author_id
      ? user.id
      : parsed.data.author_id

  const { data: article, error } = await supabase
    .from('articles')
    .insert({
      ...buildDbPayload(parsed.data),
      author_id: authorId,
      published_at: parsed.data.status === 'PUBLISHED' ? new Date().toISOString() : null,
    })
    .select('id, slug')
    .single()

  if (error || !article) {
    return { success: false, error: error?.message ?? 'Failed to create article.' }
  }

  await syncArticleTags(supabase, article.id, parsed.data.tag_ids)

  if (parsed.data.status === 'PUBLISHED') {
    revalidatePath('/', 'page')
    revalidatePath(`/article/${article.slug}`, 'page')
  }
  revalidatePath('/admin/articles', 'page')

  redirect(`/admin/articles/${article.id}`)
}

// ── updateArticleAction ───────────────────────────────────────────────────────

export async function updateArticleAction(
  id: string,
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const { user, role } = await requireAuth()

  if (!roleCanEdit(role)) {
    return { success: false, error: 'Unauthorized.' }
  }

  const supabase = await createClient()

  // Fetch current article — verify existence and enforce author ownership
  const { data: current, error: fetchErr } = await supabase
    .from('articles')
    .select('id, slug, status, author_id, published_at')
    .eq('id', id)
    .single()

  if (fetchErr || !current) {
    return { success: false, error: 'Article not found.' }
  }

  if (role === 'AUTHOR') {
    if (current.author_id !== user.id) {
      return { success: false, error: 'You may only edit your own articles.' }
    }
    if (current.status === 'PUBLISHED' || current.status === 'ARCHIVED') {
      return { success: false, error: 'Published or archived articles cannot be edited.' }
    }
  }

  const raw = parseFormData(formData)

  // Authors cannot self-publish — demote to REVIEW
  if (raw.status === 'PUBLISHED' && !roleCanPublish(role)) {
    raw.status = 'REVIEW'
  }

  const parsed = articleInputSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: toFieldErrors(parsed.error.flatten().fieldErrors),
    }
  }

  // Slug uniqueness — only check when slug has changed
  if (parsed.data.slug !== current.slug) {
    const { data: conflict } = await supabase
      .from('articles')
      .select('id')
      .eq('slug', parsed.data.slug)
      .neq('id', id)
      .maybeSingle()

    if (conflict) {
      return { success: false, fieldErrors: { slug: ['This slug is already in use.'] } }
    }
  }

  // Clear rank from any other article that currently holds the same slot
  if (parsed.data.top_story_rank != null) {
    await supabase
      .from('articles')
      .update({ top_story_rank: null })
      .eq('top_story_rank', parsed.data.top_story_rank)
      .neq('id', id)
  }

  // ADMIN/EDITOR may reassign author; AUTHOR role cannot change author_id
  const authorId =
    role !== 'AUTHOR' && parsed.data.author_id
      ? parsed.data.author_id
      : undefined

  const { error: updateErr } = await supabase
    .from('articles')
    .update({
      ...buildDbPayload(parsed.data),
      ...(authorId ? { author_id: authorId } : {}),
      // Set published_at only on first publish
      published_at:
        parsed.data.status === 'PUBLISHED' && !current.published_at
          ? new Date().toISOString()
          : current.published_at,
    })
    .eq('id', id)

  if (updateErr) {
    return { success: false, error: updateErr.message }
  }

  await syncArticleTags(supabase, id, parsed.data.tag_ids)

  // Revalidate affected public paths
  revalidatePath(`/article/${current.slug}`, 'page')
  if (parsed.data.slug !== current.slug) {
    revalidatePath(`/article/${parsed.data.slug}`, 'page')
  }
  if (parsed.data.status === 'PUBLISHED' || current.status === 'PUBLISHED') {
    revalidatePath('/', 'page')
  }
  revalidatePath('/admin/articles', 'page')

  return { success: true }
}

// ── publishArticleAction ──────────────────────────────────────────────────────

export async function publishArticleAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const { role } = await requireAuth()

  if (!roleCanPublish(role)) {
    return { success: false, error: 'You do not have permission to publish articles.' }
  }

  const id = formData.get('id') as string
  if (!id) return { success: false, error: 'Missing article ID.' }

  const supabase = await createClient()

  const { data: article, error: fetchErr } = await supabase
    .from('articles')
    .select('id, slug, status, body_html, is_breaking, breaking_expires_at, author_id')
    .eq('id', id)
    .single()

  if (fetchErr || !article) {
    return { success: false, error: 'Article not found.' }
  }

  if (article.status === 'PUBLISHED') {
    return { success: false, error: 'Article is already published.' }
  }

  if (!article.body_html?.trim()) {
    return { success: false, error: 'Article body is required before publishing.' }
  }

  if (!article.author_id) {
    return { success: false, error: 'An author must be assigned before publishing.' }
  }

  if (article.is_breaking) {
    if (!article.breaking_expires_at) {
      return {
        success: false,
        error: 'A breaking expiry date/time is required to publish this breaking article.',
      }
    }
    if (new Date(article.breaking_expires_at) <= new Date()) {
      return { success: false, error: 'Breaking expiry must be set to a future date/time.' }
    }
  }

  const prevStatus = article.status

  const { error: updateErr } = await supabase
    .from('articles')
    .update({
      status: 'PUBLISHED',
      published_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (updateErr) {
    return { success: false, error: updateErr.message }
  }

  await supabase.rpc('insert_audit_log', {
    p_action: 'article.published',
    p_target_table: 'articles',
    p_target_id: id,
    p_old_values: { status: prevStatus },
    p_new_values: { status: 'PUBLISHED' },
  })

  revalidatePath(`/article/${article.slug}`, 'page')
  revalidatePath('/', 'page')
  revalidatePath('/admin/articles', 'page')

  return { success: true }
}

// ── archiveArticleAction ──────────────────────────────────────────────────────

export async function archiveArticleAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const { role } = await requireAuth()

  if (!roleCanArchive(role)) {
    return { success: false, error: 'You do not have permission to archive articles.' }
  }

  const id = formData.get('id') as string
  if (!id) return { success: false, error: 'Missing article ID.' }

  const supabase = await createClient()

  const { data: article, error: fetchErr } = await supabase
    .from('articles')
    .select('id, slug, status')
    .eq('id', id)
    .single()

  if (fetchErr || !article) {
    return { success: false, error: 'Article not found.' }
  }

  if (article.status === 'ARCHIVED') {
    return { success: false, error: 'Article is already archived.' }
  }

  const { error: updateErr } = await supabase
    .from('articles')
    .update({ status: 'ARCHIVED' })
    .eq('id', id)

  if (updateErr) {
    return { success: false, error: updateErr.message }
  }

  revalidatePath(`/article/${article.slug}`, 'page')
  revalidatePath('/', 'page')
  revalidatePath('/admin/articles', 'page')

  return { success: true }
}