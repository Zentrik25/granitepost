import { z } from 'zod'

export const commentSchema = z.object({
  articleId: z
    .string()
    .min(1, 'Article ID is required')
    .refine(
      (v) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v),
      { message: 'Invalid article ID' }
    ),
  authorName: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less')
    .trim(),
  authorEmail: z
    .string()
    .min(1, 'Email is required')
    .max(254, 'Email too long')
    .trim()
    .toLowerCase()
    .refine((v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), { message: 'Invalid email address' }),
  body: z
    .string()
    .min(3, 'Comment must be at least 3 characters')
    .max(2000, 'Comment must be 2000 characters or less')
    .trim()
    .refine((v) => v.trim().length > 0, { message: 'Comment cannot be blank' }),
  parentId: z
    .string()
    .refine(
      (v) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v),
      { message: 'Invalid parent ID' }
    )
    .optional()
    .or(z.literal('')),
})

export type CommentInput = z.infer<typeof commentSchema>

export const moderationStatusSchema = z.enum(['APPROVED', 'REJECTED', 'SPAM', 'DELETED'])
export type ModerationStatus = z.infer<typeof moderationStatusSchema>