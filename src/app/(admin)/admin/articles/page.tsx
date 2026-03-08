import type { Metadata } from 'next'
import Link from 'next/link'
import { getArticlesForAdmin } from '@/lib/admin/articles/queries'

export const metadata: Metadata = { title: 'Articles — Admin' }
export const revalidate = 60

interface Props {
  searchParams: Promise<{ page?: string }>
}

export default async function AdminArticlesPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1', 10))
  const result = await getArticlesForAdmin(page, 20)

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Articles</h1>
          <p className="text-sm text-gray-500 mt-0.5">{result.total} total</p>
        </div>
        <Link
          href="/admin/articles/new"
          className="flex items-center gap-2 px-4 py-2.5 text-white text-sm font-bold rounded-xl hover:brightness-110 active:brightness-95 transition-all shadow-sm"
          style={{ background: 'linear-gradient(135deg, #142B6F 0%, #0D1E50 100%)' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
            strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
            <path d="M12 5v14 M5 12h14" />
          </svg>
          New Article
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Title</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Category</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Slug</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Published</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {result.data.map((article) => (
              <tr key={article.id} className="hover:bg-blue-50/20 transition-colors">
                <td className="px-5 py-3.5">
                  <span className="font-medium text-gray-800 line-clamp-2 block max-w-xs">{article.title}</span>
                </td>
                <td className="px-5 py-3.5 text-gray-500 hidden sm:table-cell">
                  {article.category?.name ?? <span className="text-gray-300">—</span>}
                </td>
                <td className="px-5 py-3.5">
                  <StatusBadge status={article.status} />
                </td>
                <td className="px-5 py-3.5 text-gray-400 font-mono text-xs hidden lg:table-cell max-w-[180px]">
                  <span className="line-clamp-1">{article.slug}</span>
                </td>
                <td className="px-5 py-3.5 text-gray-400 text-xs hidden md:table-cell whitespace-nowrap">
                  {article.published_at
                    ? new Date(article.published_at).toLocaleDateString('en-GB')
                    : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <div className="flex justify-end items-center gap-3">
                    {article.status === 'PUBLISHED' && (
                      <a
                        href={`/article/${article.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        View ↗
                      </a>
                    )}
                    <Link
                      href={`/admin/articles/${article.id}`}
                      className="text-xs font-semibold text-granite-primary hover:underline"
                    >
                      Edit
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {result.data.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-gray-400">
                  No articles found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {(result.hasMore || page > 1) && (
        <div className="flex gap-3">
          {page > 1 && (
            <a
              href={`/admin/articles?page=${page - 1}`}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              ← Previous
            </a>
          )}
          {result.hasMore && (
            <a
              href={`/admin/articles?page=${page + 1}`}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              Next →
            </a>
          )}
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
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