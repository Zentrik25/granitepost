import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { Comment, CommentStatus } from '@/types'

// ── Types ─────────────────────────────────────────────────────────────────────

export type CommentWithArticle = Comment & {
  article: { id: string; title: string; slug: string } | null
}

export interface AdminCommentsResult {
  data: CommentWithArticle[]
  total: number
}

// ── Public queries ────────────────────────────────────────────────────────────

/** Approved, top-level comments for a published article (public side). */
export async function getApprovedComments(articleId: string): Promise<Comment[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('comments')
    .select('*')
    .eq('article_id', articleId)
    .eq('status', 'APPROVED' as CommentStatus)
    .order('created_at', { ascending: true })

  return data ?? []
}

// ── Admin queries ─────────────────────────────────────────────────────────────

/** Paginated list of comments filtered by status for admin moderation. */
export async function getAdminComments(
  status: CommentStatus = 'PENDING',
  page = 1,
  limit = 30
): Promise<AdminCommentsResult> {
  const supabase = await createClient()
  const from = (page - 1) * limit

  const { data, count } = await supabase
    .from('comments')
    .select(
      'id, article_id, parent_id, author_name, author_email, body, status, created_at, updated_at, moderated_at, moderation_note, article:articles(id, title, slug)',
      { count: 'exact' }
    )
    .eq('status', status)
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1)

  return {
    data: (data as unknown as CommentWithArticle[]) ?? [],
    total: count ?? 0,
  }
}

// ── Mutations (admin-only; call only from server actions) ─────────────────────

/**
 * Set comment status and record the moderator in one round trip.
 *
 * The previous implementation fetched the current status first (2 round trips).
 * We now detect "not found" via { count: 'exact' } on the UPDATE instead.
 *
 * The comment_moderation_log table has an `action` column (text), not
 * `old_status`/`new_status` columns — the previous insert was silently failing.
 * Fixed to use the correct schema.
 */
export async function moderateComment(
  commentId: string,
  newStatus: CommentStatus,
  moderatorId: string,
  note?: string
): Promise<{ error: string | null }> {
  const supabase = await createClient()

  const { error, count } = await supabase
    .from('comments')
    .update(
      {
        status: newStatus,
        moderated_by: moderatorId,
        moderated_at: new Date().toISOString(),
        moderation_note: note ?? null,
        updated_at: new Date().toISOString(),
      },
      { count: 'exact' }
    )
    .eq('id', commentId)

  if (error) return { error: error.message }
  if (count === 0) return { error: 'Comment not found' }

  // Log the moderation action — uses the correct 'action' column.
  await supabase.from('comment_moderation_log').insert({
    comment_id: commentId,
    moderator_id: moderatorId,
    action: newStatus,
    note: note ?? null,
  })

  return { error: null }
}

/**
 * Bulk-moderate a list of comment IDs to the same status.
 * Returns the count of successfully updated rows and any error.
 */
export async function bulkModerateComments(
  commentIds: string[],
  newStatus: CommentStatus,
  moderatorId: string
): Promise<{ updated: number; error: string | null }> {
  if (commentIds.length === 0) return { updated: 0, error: null }

  const supabase = await createClient()

  const { error, count } = await supabase
    .from('comments')
    .update(
      {
        status: newStatus,
        moderated_by: moderatorId,
        moderated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { count: 'exact' }
    )
    .in('id', commentIds)

  if (error) return { updated: 0, error: error.message }

  // Bulk log entries — correct 'action' column, best-effort.
  const logRows = commentIds.map((id) => ({
    comment_id: id,
    moderator_id: moderatorId,
    action: newStatus,
    note: `Bulk action: ${newStatus}`,
  }))
  await supabase.from('comment_moderation_log').insert(logRows)

  return { updated: count ?? commentIds.length, error: null }
}