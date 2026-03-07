'use server'

import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/lib/auth/guards'
import { moderateComment, bulkModerateComments } from '@/lib/comments/queries'
import { moderationStatusSchema } from '@/lib/comments/validation'
import type { CommentStatus } from '@/types'

export interface ModerationResult {
  success: boolean
  error?: string
}

// ── Single comment ─────────────────────────────────────────────────────────────

export async function moderateCommentAction(
  commentId: string,
  status: CommentStatus
): Promise<ModerationResult> {
  const parsed = moderationStatusSchema.safeParse(status)
  if (!parsed.success) return { success: false, error: 'Invalid status' }

  const { user } = await requireAuth()

  const { error } = await moderateComment(commentId, parsed.data, user.id)
  if (error) return { success: false, error }

  revalidatePath('/admin/comments')
  return { success: true }
}

// ── Bulk ───────────────────────────────────────────────────────────────────────

export async function bulkModerateAction(
  commentIds: string[],
  status: CommentStatus
): Promise<ModerationResult> {
  if (!commentIds.length) return { success: false, error: 'No comments selected' }

  const parsed = moderationStatusSchema.safeParse(status)
  if (!parsed.success) return { success: false, error: 'Invalid status' }

  const { user } = await requireAuth()

  const { error } = await bulkModerateComments(commentIds, parsed.data, user.id)
  if (error) return { success: false, error }

  revalidatePath('/admin/comments')
  return { success: true }
}