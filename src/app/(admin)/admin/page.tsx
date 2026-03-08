import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard — Admin' }

async function getDashboardStats(supabase: Awaited<ReturnType<typeof createClient>>) {
  const [articles, comments, subscribers] = await Promise.all([
    supabase.from('articles').select('status', { count: 'exact', head: true }),
    supabase.from('comments').select('status', { count: 'exact', head: true }).eq('status', 'PENDING'),
    supabase.from('newsletter_subscribers').select('id', { count: 'exact', head: true }).eq('confirmed', true),
  ])
  return {
    totalArticles: articles.count ?? 0,
    pendingComments: comments.count ?? 0,
    subscribers: subscribers.count ?? 0,
  }
}

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [stats, recentResult] = await Promise.all([
    getDashboardStats(supabase),
    supabase
      .from('articles')
      .select('id, title, slug, status, published_at, updated_at')
      .order('updated_at', { ascending: false })
      .limit(10),
  ])

  const recentArticles = recentResult.data

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-black text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of your newsroom</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Articles"
          value={stats.totalArticles}
          icon="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8"
          gradient="linear-gradient(135deg, #142B6F 0%, #0D1E50 100%)"
        />
        <StatCard
          label="Pending Comments"
          value={stats.pendingComments}
          icon="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
          gradient="linear-gradient(135deg, #d97706 0%, #b45309 100%)"
          accent
        />
        <StatCard
          label="Subscribers"
          value={stats.subscribers}
          icon="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6"
          gradient="linear-gradient(135deg, #059669 0%, #047857 100%)"
        />
      </div>

      {/* Recent articles */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-800">Recent Articles</h2>
          <Link
            href="/admin/articles"
            className="text-xs font-semibold text-granite-primary hover:underline"
          >
            View all →
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Title</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Updated</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(recentArticles ?? []).map((article) => (
                <tr key={article.id} className="hover:bg-blue-50/20 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-gray-800 line-clamp-1 max-w-xs">{article.title}</td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={article.status} />
                  </td>
                  <td className="px-5 py-3.5 text-gray-400 text-xs hidden md:table-cell">
                    {new Date(article.updated_at).toLocaleDateString('en-GB')}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      href={`/admin/articles/${article.id}`}
                      className="text-xs font-semibold text-granite-primary hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
              {(recentArticles ?? []).length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-gray-400">
                    No articles yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  gradient,
  accent = false,
}: {
  label: string
  value: number
  icon: string
  gradient: string
  accent?: boolean
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
        style={{ background: gradient }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.75}
          strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
          <path d={icon} />
        </svg>
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
        <p className={`text-3xl font-black leading-none ${accent ? 'text-amber-600' : 'text-gray-900'}`}>
          {value.toLocaleString()}
        </p>
      </div>
    </div>
  )
}

// ── Status badge ──────────────────────────────────────────────────────────────

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PUBLISHED: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    DRAFT:     'bg-slate-100 text-slate-600 border border-slate-200',
    REVIEW:    'bg-amber-50 text-amber-700 border border-amber-200',
    ARCHIVED:  'bg-rose-50 text-rose-600 border border-rose-200',
  }
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full ${styles[status] ?? 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  )
}