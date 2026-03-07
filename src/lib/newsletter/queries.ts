import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { NewsletterSubscriber } from '@/types'

// ── Types ─────────────────────────────────────────────────────────────────────

export type SubscriberFilter = 'all' | 'confirmed' | 'unconfirmed' | 'unsubscribed'

export interface AdminSubscribersResult {
  data: NewsletterSubscriber[]
  total: number
}

// ── Public mutations ──────────────────────────────────────────────────────────

/**
 * Subscribe an email address.
 *
 * Uses an optimistic INSERT + conflict handling instead of a SELECT-then-INSERT.
 * New subscribers: 1 query. Already-subscribed: 1 query (insert fails fast).
 * Re-subscribing (was unsubscribed): 2 queries (insert fails, then UPDATE).
 *
 * The previous implementation always ran SELECT first regardless of case,
 * making every new-subscriber path 2 queries instead of 1.
 */
export async function createSubscriber(
  email: string,
  source = 'website'
): Promise<{ created: boolean; error: string | null }> {
  const supabase = await createClient()

  // Fast path: attempt insert directly. Succeeds in O(1) for new subscribers.
  const { error: insertError } = await supabase
    .from('newsletter_subscribers')
    .insert({ email, source, confirmed: false })

  if (!insertError) return { created: true, error: null }

  // 23505 = unique_violation — email already exists.
  const pgCode = (insertError as unknown as { code?: string }).code
  if (pgCode !== '23505') {
    return { created: false, error: insertError.message }
  }

  // Email exists: attempt re-subscribe only if the row is currently unsubscribed.
  // The .not('unsubscribed_at', 'is', null) filter means 0 rows are updated if
  // they are already an active subscriber — preserving the original no-op behaviour.
  const { error: updateError } = await supabase
    .from('newsletter_subscribers')
    .update({ unsubscribed_at: null, subscribed_at: new Date().toISOString() })
    .eq('email', email)
    .not('unsubscribed_at', 'is', null)

  return { created: false, error: updateError?.message ?? null }
}

// ── Admin queries ─────────────────────────────────────────────────────────────

export async function getAdminSubscribers(
  filter: SubscriberFilter = 'all',
  page = 1,
  limit = 50
): Promise<AdminSubscribersResult> {
  const supabase = await createClient()
  const from = (page - 1) * limit

  let query = supabase
    .from('newsletter_subscribers')
    .select('*', { count: 'exact' })
    .order('subscribed_at', { ascending: false })
    .range(from, from + limit - 1)

  if (filter === 'confirmed') query = query.eq('confirmed', true).is('unsubscribed_at', null)
  if (filter === 'unconfirmed') query = query.eq('confirmed', false).is('unsubscribed_at', null)
  if (filter === 'unsubscribed') query = query.not('unsubscribed_at', 'is', null)

  const { data, count } = await query

  return { data: data ?? [], total: count ?? 0 }
}

/**
 * Returns all confirmed, active subscribers for CSV export.
 * Intentionally unbounded — used only behind admin auth.
 */
export async function getSubscribersForExport(): Promise<
  Pick<NewsletterSubscriber, 'email' | 'confirmed' | 'subscribed_at'>[]
> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('newsletter_subscribers')
    .select('email, confirmed, subscribed_at')
    .eq('confirmed', true)
    .is('unsubscribed_at', null)
    .order('subscribed_at', { ascending: false })

  return data ?? []
}