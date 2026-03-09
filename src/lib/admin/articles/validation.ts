import { z } from 'zod'

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const articleInputSchema = z
  .object({
    title: z.string().min(1, 'Title is required').max(300, 'Title must be 300 characters or less').trim(),
    slug: z
      .string()
      .min(1, 'Slug is required')
      .max(300, 'Slug must be 300 characters or less')
      .regex(SLUG_RE, 'Slug must be lowercase letters, numbers, and hyphens only'),
    excerpt: z.string().max(1000, 'Excerpt must be 1000 characters or less').trim().optional().or(z.literal('')),
    body_html: z.string().trim().optional().or(z.literal('')),
    category_id: z.string().uuid('Invalid category').optional().or(z.literal('')),
    hero_image_url: z
      .string()
      .refine((v) => !v || /^https?:\/\//.test(v), { message: 'Must be a valid URL' })
      .optional()
      .or(z.literal('')),
    hero_image_alt: z.string().max(300).trim().optional().or(z.literal('')),
    hero_image_caption: z.string().max(500).trim().optional().or(z.literal('')),
    hero_image_credit: z.string().max(300).trim().optional().or(z.literal('')),
    og_title: z.string().max(300).trim().optional().or(z.literal('')),
    og_description: z.string().max(1000).trim().optional().or(z.literal('')),
    og_image_url: z
      .string()
      .refine((v) => !v || /^https?:\/\//.test(v), { message: 'Must be a valid URL' })
      .optional()
      .or(z.literal('')),
    canonical_url: z
      .string()
      .refine((v) => !v || /^https?:\/\//.test(v), { message: 'Must be a valid URL' })
      .optional()
      .or(z.literal('')),
    is_featured: z.boolean().default(false),
    is_breaking: z.boolean().default(false),
    breaking_expires_at: z
      .string()
      .refine((v) => !v || !isNaN(Date.parse(v)), { message: 'Invalid date/time.' })
      .optional()
      .or(z.literal('')),
    featured_rank: z.coerce
      .number()
      .int('Must be a whole number')
      .min(1, 'Must be at least 1')
      .max(100, 'Must be 100 or less')
      .nullable()
      .optional(),
    top_story_rank: z.coerce
      .number()
      .int('Must be a whole number')
      .min(1, 'Must be at least 1')
      .max(6, 'Must be 6 or less')
      .nullable()
      .optional(),
    tag_ids: z.array(z.string().uuid()).default([]),
    status: z.enum(['DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  })
  .superRefine((data, ctx) => {
    if (data.status === 'PUBLISHED') {
      if (!data.body_html?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['body_html'],
          message: 'Article body is required to publish.',
        })
      }
      if (data.is_breaking) {
        if (!data.breaking_expires_at) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['breaking_expires_at'],
            message: 'Breaking expiry date/time is required when publishing a breaking article.',
          })
        } else if (new Date(data.breaking_expires_at) <= new Date()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['breaking_expires_at'],
            message: 'Breaking expiry must be set to a future date/time.',
          })
        }
      }
    }
  })

export type ArticleFormInput = z.infer<typeof articleInputSchema>

export interface ActionResult {
  success: boolean
  error?: string
  fieldErrors?: Partial<Record<keyof ArticleFormInput | '_form', string[]>>
  articleId?: string
}

// Role permission helpers — pure functions, no DB access, used server-side only
export function roleCanPublish(role: string): boolean {
  return role === 'ADMIN' || role === 'EDITOR'
}

export function roleCanEdit(role: string): boolean {
  return role === 'ADMIN' || role === 'EDITOR' || role === 'AUTHOR'
}

export function roleCanArchive(role: string): boolean {
  return role === 'ADMIN' || role === 'EDITOR'
}
