import 'server-only'
import { createClient, createPublicClient } from '@/lib/supabase/server'
import type { Comment } from '@/types'

export async function getApprovedComments(articleId: string): Promise<Comment[]> {
  const supabase = createPublicClient()
  const { data } = await supabase
    .from('comments')
    .select('*')
    .eq('article_id', articleId)
    .eq('status', 'APPROVED')
    .order('created_at', { ascending: true })

  return data ?? []
}

export async function getPendingComments(page = 1, limit = 50) {
  const supabase = await createClient()
  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, count } = await supabase
    .from('comments')
    .select('*, article:articles(id, title, slug)', { count: 'exact' })
    .eq('status', 'PENDING')
    .order('created_at', { ascending: false })
    .range(from, to)

  return { data: data ?? [], total: count ?? 0 }
}
