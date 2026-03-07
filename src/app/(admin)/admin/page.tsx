import { createClient } from '@/lib/supabase/server'
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

  // Stats and recent articles are independent — run in parallel.
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
    <div className="space-y-6">
      <h1 className="text-2xl font-black">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Articles" value={stats.totalArticles} />
        <StatCard label="Pending Comments" value={stats.pendingComments} accent />
        <StatCard label="Newsletter Subscribers" value={stats.subscribers} />
      </div>

      {/* Recent articles */}
      <section>
        <h2 className="text-base font-bold mb-3">Recent Articles</h2>
        <div className="bg-white border border-brand-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-brand-gray border-b border-brand-border">
              <tr>
                <th className="text-left px-4 py-2.5 font-semibold">Title</th>
                <th className="text-left px-4 py-2.5 font-semibold">Status</th>
                <th className="text-left px-4 py-2.5 font-semibold hidden md:table-cell">Updated</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {(recentArticles ?? []).map((article) => (
                <tr key={article.id} className="hover:bg-brand-gray/50">
                  <td className="px-4 py-3 font-medium line-clamp-1 max-w-xs">{article.title}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={article.status} />
                  </td>
                  <td className="px-4 py-3 text-brand-muted hidden md:table-cell">
                    {new Date(article.updated_at).toLocaleDateString('en-GB')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <a
                      href={`/admin/articles/${article.id}`}
                      className="text-xs font-semibold text-brand-red hover:underline"
                    >
                      Edit
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function StatCard({
  label,
  value,
  accent = false,
}: {
  label: string
  value: number
  accent?: boolean
}) {
  return (
    <div className={`bg-white border p-5 ${accent ? 'border-brand-red' : 'border-brand-border'}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted mb-1">{label}</p>
      <p className={`text-3xl font-black ${accent ? 'text-brand-red' : 'text-brand-dark'}`}>{value}</p>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colours: Record<string, string> = {
    PUBLISHED: 'bg-green-100 text-green-800',
    DRAFT: 'bg-gray-100 text-gray-700',
    REVIEW: 'bg-yellow-100 text-yellow-800',
    ARCHIVED: 'bg-red-100 text-red-700',
  }
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 ${colours[status] ?? 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  )
}