'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/guards'

export async function updateSitePage(
  slug: string,
  _prevState: { error: string | null; success: boolean },
  formData: FormData,
): Promise<{ error: string | null; success: boolean }> {
  const { role } = await requireAuth()
  if (role !== 'ADMIN' && role !== 'EDITOR') {
    return { error: 'Unauthorized: admin or editor role required.', success: false }
  }

  const title = (formData.get('title') as string | null)?.trim()
  const meta_description = (formData.get('meta_description') as string | null)?.trim() || null
  const content_html = (formData.get('content_html') as string | null) ?? ''

  if (!title) return { error: 'Title is required.', success: false }

  const supabase = await createClient()
  const { error } = await supabase
    .from('site_pages')
    .update({ title, meta_description, content_html, updated_at: new Date().toISOString() })
    .eq('slug', slug)

  if (error) return { error: error.message, success: false }

  // Revalidate the public page and the admin list
  revalidatePath(`/${slug}`)
  revalidatePath('/admin/settings/pages')

  return { error: null, success: true }
}
