'use server'

import { revalidatePath } from 'next/cache'
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/guards'
import { z } from 'zod'

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const profileSchema = z.object({
  full_name: z.string().min(1, 'Name is required').max(200).trim(),
  slug: z
    .string()
    .max(200)
    .regex(SLUG_RE, 'Slug must be lowercase letters, numbers, and hyphens only')
    .optional()
    .or(z.literal('')),
  title: z.string().max(200).trim().optional().or(z.literal('')),
  bio: z.string().max(2000).trim().optional().or(z.literal('')),
  twitter_handle: z.string().max(100).trim().optional().or(z.literal('')),
  avatar_url: z
    .string()
    .refine((v) => !v || /^https?:\/\//.test(v), { message: 'Must be a valid URL' })
    .optional()
    .or(z.literal('')),
})

export interface ProfileActionResult {
  success: boolean
  error?: string
  fieldErrors?: Partial<Record<string, string[]>>
}

export async function updateProfileAction(
  profileId: string,
  _prevState: ProfileActionResult,
  formData: FormData
): Promise<ProfileActionResult> {
  const { user, role } = await requireAuth()

  // Only ADMIN can edit any profile; others can only edit their own
  if (role !== 'ADMIN' && user.id !== profileId) {
    return { success: false, error: 'You can only edit your own profile.' }
  }

  const raw = {
    full_name: formData.get('full_name') ?? '',
    slug: (formData.get('slug') as string | null) ?? '',
    title: (formData.get('title') as string | null) ?? '',
    bio: (formData.get('bio') as string | null) ?? '',
    twitter_handle: (formData.get('twitter_handle') as string | null) ?? '',
    avatar_url: (formData.get('avatar_url') as string | null) ?? '',
  }

  const parsed = profileSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Partial<Record<string, string[]>>,
    }
  }

  // Use service role to bypass RLS for profile updates.
  // Authorization is already enforced above (own profile or ADMIN only).
  const supabase = createServiceRoleSupabaseClient()

  // Slug uniqueness check (ignore blank slugs)
  if (parsed.data.slug) {
    const { data: conflict } = await supabase
      .from('profiles')
      .select('id')
      .eq('slug', parsed.data.slug)
      .neq('id', profileId)
      .maybeSingle()

    if (conflict) {
      return { success: false, fieldErrors: { slug: ['This slug is already in use.'] } }
    }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: parsed.data.full_name,
      slug: parsed.data.slug || null,
      title: parsed.data.title || null,
      bio: parsed.data.bio || null,
      twitter_handle: parsed.data.twitter_handle || null,
      avatar_url: parsed.data.avatar_url || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', profileId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/authors', 'page')
  if (parsed.data.slug) {
    revalidatePath(`/author/${parsed.data.slug}`, 'page')
  }

  return { success: true }
}
