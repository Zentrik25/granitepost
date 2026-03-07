import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type {
  AnalyticsRange,
  TopArticleViews,
  ViewsChartPoint,
  ViewsSummary,
} from './types'

// ── Date helpers ──────────────────────────────────────────────────────────────

/** Returns YYYY-MM-DD in UTC for an offset of `daysAgo` days before today. */
function utcDateStr(daysAgo = 0): string {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - daysAgo)
  return d.toISOString().slice(0, 10)
}

/** All dates in [startInclusive … today] as YYYY-MM-DD, ascending. */
function dateRange(days: number): string[] {
  const dates: string[] = []
  for (let i = days - 1; i >= 0; i--) {
    dates.push(utcDateStr(i))
  }
  return dates
}

/** Short label for a YYYY-MM-DD date, e.g. "15 Jan". */
function shortLabel(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })
}

// ── Views summary (single query) ──────────────────────────────────────────────

/**
 * Fetches one 30-day window from article_views_daily and computes today,
 * last-7-days, and last-30-days totals in a single JavaScript pass.
 * Previously made 3 separate DB calls with 3 separate clients.
 */
export async function getViewsSummary(): Promise<ViewsSummary> {
  const supabase = await createClient()
  const since30 = utcDateStr(29)
  const since7 = utcDateStr(6)
  const today = utcDateStr(0)

  const { data } = await supabase
    .from('article_views_daily')
    .select('day, view_count')
    .gte('day', since30)

  let todayTotal = 0
  let last7Total = 0
  let last30Total = 0

  for (const row of data ?? []) {
    const views = row.view_count ?? 0
    last30Total += views
    if (row.day >= since7) last7Total += views
    if (row.day === today) todayTotal += views
  }

  return { today: todayTotal, last7Days: last7Total, last30Days: last30Total }
}

// ── Top articles ──────────────────────────────────────────────────────────────

export async function getTopArticlesByViews(
  range: AnalyticsRange,
  limit = 20
): Promise<TopArticleViews[]> {
  const supabase = await createClient()
  const days = range === 'today' ? 1 : range === 'last7Days' ? 7 : 30

  const { data, error } = await supabase.rpc('top_articles', {
    p_days: days,
    p_limit: limit,
  })

  if (error || !data) return []
  return data as TopArticleViews[]
}

// ── Chart data ────────────────────────────────────────────────────────────────

/**
 * Returns one ViewsChartPoint per calendar day in the window, ascending,
 * with zero-filled entries for days with no recorded views.
 *
 * Callers rendering both a 30-day and 7-day chart should call this once for
 * 'last30Days' and slice the last 7 entries — avoids a second DB query.
 */
export async function getViewsChartData(range: AnalyticsRange): Promise<ViewsChartPoint[]> {
  const supabase = await createClient()
  const days = range === 'today' ? 1 : range === 'last7Days' ? 7 : 30
  const since = utcDateStr(days - 1)

  const { data } = await supabase
    .from('article_views_daily')
    .select('day, view_count')
    .gte('day', since)
    .order('day', { ascending: true })

  // Aggregate: sum all articles per day
  const totals = new Map<string, number>()
  for (const row of data ?? []) {
    totals.set(row.day, (totals.get(row.day) ?? 0) + (row.view_count ?? 0))
  }

  // Fill every day in range (zero for missing days)
  return dateRange(days).map((day) => ({
    day,
    label: shortLabel(day),
    views: totals.get(day) ?? 0,
  }))
}