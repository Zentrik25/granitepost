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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black">Articles</h1>
        <Link
          href="/admin/articles/new"
          className="px-4 py-2 bg-brand-red text-white text-sm font-bold hover:bg-red-700 transition-colors"
        >
          + New Article
        </Link>
      </div>

      <div className="bg-white border border-brand-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-brand-gray border-b border-brand-border">
            <tr>
              <th className="text-left px-4 py-2.5 font-semibold">Title</th>
              <th className="text-left px-4 py-2.5 font-semibold hidden sm:table-cell">Category</th>
              <th className="text-left px-4 py-2.5 font-semibold">Status</th>
              <th className="text-left px-4 py-2.5 font-semibold hidden lg:table-cell">Slug</th>
              <th className="text-left px-4 py-2.5 font-semibold hidden md:table-cell">Rank</th>
              <th className="text-left px-4 py-2.5 font-semibold hidden md:table-cell">Published</th>
              <th className="text-left px-4 py-2.5 font-semibold hidden lg:table-cell">Updated</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {result.data.map((article) => (
              <tr key={article.id} className="hover:bg-brand-gray/50">
                <td className="px-4 py-3 font-medium max-w-xs">
                  <span className="line-clamp-2">{article.title}</span>
                </td>
                <td className="px-4 py-3 text-brand-muted hidden sm:table-cell">
                  {article.category?.name ?? '—'}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={article.status} />
                </td>
                <td className="px-4 py-3 text-brand-muted font-mono text-xs hidden lg:table-cell max-w-[180px]">
                  <span className="line-clamp-1">{article.slug}</span>
                </td>
                <td className="px-4 py-3 text-brand-muted text-center hidden md:table-cell">
                  {article.featured_rank ?? '—'}
                </td>
                <td className="px-4 py-3 text-brand-muted hidden md:table-cell whitespace-nowrap">
                  {article.published_at
                    ? new Date(article.published_at).toLocaleDateString('en-GB')
                    : '—'}
                </td>
                <td className="px-4 py-3 text-brand-muted hidden lg:table-cell whitespace-nowrap">
                  {new Date(article.updated_at).toLocaleDateString('en-GB')}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <div className="flex justify-end gap-3">
                    {article.status === 'PUBLISHED' && (
                      <a
                        href={`/article/${article.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-brand-muted hover:text-brand-dark"
                      >
                        View
                      </a>
                    )}
                    <Link
                      href={`/admin/articles/${article.id}`}
                      className="text-xs font-semibold text-brand-red hover:underline"
                    >
                      Edit
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {result.data.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-brand-muted">
                  No articles found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {(result.hasMore || page > 1) && (
        <div className="flex gap-3">
          {page > 1 && (
            <a
              href={`/admin/articles?page=${page - 1}`}
              className="px-4 py-2 border border-brand-border text-sm font-semibold hover:bg-brand-gray"
            >
              &larr; Previous
            </a>
          )}
          {result.hasMore && (
            <a
              href={`/admin/articles?page=${page + 1}`}
              className="px-4 py-2 border border-brand-border text-sm font-semibold hover:bg-brand-gray"
            >
              Next &rarr;
            </a>
          )}
        </div>
      )}
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
