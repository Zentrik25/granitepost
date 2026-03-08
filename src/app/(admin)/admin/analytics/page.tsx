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

  const [summary, topArticles, chartData30d] = await Promise.all([
    getViewsSummary(),
    getTopArticlesByViews('last30Days', 20),
    getViewsChartData('last30Days'),
  ])

  const chartData7d = chartData30d.slice(-7)

  return (
    <div className="space-y-8 max-w-[1400px]">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-black text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">Traffic overview for your newsroom</p>
      </div>

      {/* ── KPI cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Today"
          sublabel={RANGE_LABELS.today}
          value={summary.today}
          icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          gradient="linear-gradient(145deg, #142B6F 0%, #1a3a8f 100%)"
          glow="rgba(20,43,111,0.3)"
        />
        <StatCard
          label="Last 7 Days"
          sublabel={RANGE_LABELS.last7Days}
          value={summary.last7Days}
          icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          gradient="linear-gradient(145deg, #5b21b6 0%, #7c3aed 100%)"
          glow="rgba(91,33,182,0.3)"
        />
        <StatCard
          label="Last 30 Days"
          sublabel={RANGE_LABELS.last30Days}
          value={summary.last30Days}
          icon="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          gradient="linear-gradient(145deg, #065f46 0%, #047857 100%)"
          glow="rgba(6,95,70,0.3)"
        />
      </div>

      {/* ── Charts ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ViewsChart data={chartData30d} label="Daily Views — Last 30 Days" />
        <ViewsChart data={chartData7d} label="Daily Views — Last 7 Days" />
      </div>

      {/* ── Top articles ────────────────────────────────────────────────── */}
      <TopArticlesTable
        articles={topArticles}
        label={`Top Articles — ${RANGE_LABELS.last30Days}`}
      />
    </div>
  )
}

function StatCard({
  label,
  sublabel,
  value,
  icon,
  gradient,
  glow,
}: {
  label: string
  sublabel: string
  value: number
  icon: string
  gradient: string
  glow: string
}) {
  const display =
    value >= 1_000_000
      ? `${(value / 1_000_000).toFixed(1)}M`
      : value >= 1_000
        ? `${(value / 1_000).toFixed(1)}k`
        : value.toLocaleString()

  return (
    <div
      className="relative rounded-2xl p-5 overflow-hidden flex flex-col gap-3"
      style={{
        background: gradient,
        boxShadow: `0 4px 24px -4px ${glow}, 0 1px 4px rgba(0,0,0,0.12)`,
      }}
    >
      {/* Faint background icon */}
      <div className="absolute -right-3 -bottom-3 opacity-10 pointer-events-none" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-20 h-20 text-white">
          <path d={icon} />
        </svg>
      </div>

      {/* Icon badge */}
      <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.75}
          strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]" aria-hidden="true">
          <path d={icon} />
        </svg>
      </div>

      {/* Value + labels */}
      <div className="relative z-10">
        <p className="text-[28px] font-black text-white leading-none tracking-tight tabular-nums">
          {display}
        </p>
        <p className="text-xs font-semibold text-white/65 mt-1.5 uppercase tracking-wide leading-none">
          {label}
        </p>
        <p className="text-[11px] text-white/40 mt-0.5">{sublabel}</p>
      </div>
    </div>
  )
}