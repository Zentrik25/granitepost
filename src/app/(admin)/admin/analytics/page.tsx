import type { Metadata } from 'next'
import { requireAuth } from '@/lib/auth/guards'
import {
  getViewsSummary,
  getTopArticlesByViews,
  getViewsChartData,
} from '@/lib/admin/analytics/queries'
import { RANGE_LABELS } from '@/lib/admin/analytics/types'
import { ViewsChart } from '@/components/admin/analytics/ViewsChart'
import { TopArticlesTable } from '@/components/admin/analytics/TopArticlesTable'

export const metadata: Metadata = { title: 'Analytics — Admin' }
export const revalidate = 60

export default async function AdminAnalyticsPage() {
  await requireAuth()

  // 3 queries in parallel instead of the previous 4 (summary was 3 queries itself).
  // chartData30d already contains the last 7 days — slice instead of a second query.
  const [summary, topArticles, chartData30d] = await Promise.all([
    getViewsSummary(),
    getTopArticlesByViews('last30Days', 20),
    getViewsChartData('last30Days'),
  ])

  const chartData7d = chartData30d.slice(-7)

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-black">Analytics</h1>

      {/* ── Summary cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label={`Views — ${RANGE_LABELS.today}`}
          value={summary.today}
        />
        <StatCard
          label={`Views — ${RANGE_LABELS.last7Days}`}
          value={summary.last7Days}
        />
        <StatCard
          label={`Views — ${RANGE_LABELS.last30Days}`}
          value={summary.last30Days}
        />
      </div>

      {/* ── 30-day chart ──────────────────────────────────────────────── */}
      <ViewsChart
        data={chartData30d}
        label="Daily Views — Last 30 Days"
      />

      {/* ── 7-day chart ───────────────────────────────────────────────── */}
      <ViewsChart
        data={chartData7d}
        label="Daily Views — Last 7 Days"
      />

      {/* ── Top articles ──────────────────────────────────────────────── */}
      <TopArticlesTable
        articles={topArticles}
        label={`Top Articles — ${RANGE_LABELS.last30Days}`}
      />
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border border-brand-border p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted mb-1">
        {label}
      </p>
      <p className="text-3xl font-black text-brand-dark tabular-nums">
        {value.toLocaleString()}
      </p>
    </div>
  )
}