export type AnalyticsRange = 'today' | 'last7Days' | 'last30Days'

export const RANGE_DAYS: Record<AnalyticsRange, number> = {
  today: 1,
  last7Days: 7,
  last30Days: 30,
}

export const RANGE_LABELS: Record<AnalyticsRange, string> = {
  today: 'Today',
  last7Days: 'Last 7 Days',
  last30Days: 'Last 30 Days',
}

export interface ViewsSummary {
  today: number
  last7Days: number
  last30Days: number
}

export interface TopArticleViews {
  article_id: string
  title: string
  slug: string
  category_name: string | null
  hero_image_url: string | null
  total_views: number
  published_at: string | null
}

export interface ViewsChartPoint {
  /** ISO date string YYYY-MM-DD */
  day: string
  /** Formatted label for x-axis */
  label: string
  views: number
}