import type { Metadata } from 'next'
import Link from 'next/link'
import { getArticlesForAdmin } from '@/lib/admin/articles/queries'
import {
  AdminCard,
  AdminPageHeader,
  AdminStatusBadge,
  AdminTableHead,
  adminTableRowClass,
} from '@/components/admin/ui/AdminCard'

export const metadata: Metadata = { title: 'Articles — Admin' }
export const revalidate = 60

interface Props {
  searchParams: Promise<{ page?: string }>
}

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
    strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
    <path d="M12 5v14 M5 12h14" />
  </svg>
)

export default async function AdminArticlesPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1', 10))
  const result = await getArticlesForAdmin(page, 20)

  return (
    <div className="space-y-6 max-w-6xl">
      <AdminPageHeader
        title="Articles"
        description={`${result.total} total`}
        action={
          <Link
            href="/admin/articles/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-white text-sm font-bold rounded-lg hover:brightness-110 active:brightness-95 transition-all duration-150"
            style={{ background: 'linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%)' }}
          >
            <PlusIcon />
            New Article
          </Link>
        }
      />

      <AdminCard padded={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-border bg-brand-canvas/60">
                <AdminTableHead>Title</AdminTableHead>
                <AdminTableHead>Category</AdminTableHead>
                <AdminTableHead>Status</AdminTableHead>
                <AdminTableHead>Published</AdminTableHead>
                <AdminTableHead><span className="sr-only">Actions</span></AdminTableHead>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {result.data.map((article) => (
                <tr key={article.id} className={adminTableRowClass()}>
                  <td className="px-5 py-3.5 max-w-xs">
                    <span className="font-medium text-brand-primary line-clamp-2 block leading-snug">
                      {article.title}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-brand-muted hidden sm:table-cell">
                    {article.category?.name ?? <span className="text-brand-border">—</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    <AdminStatusBadge status={article.status} />
                  </td>
                  <td className="px-5 py-3.5 text-brand-muted text-xs hidden md:table-cell whitespace-nowrap">
                    {article.published_at
                      ? new Date(article.published_at).toLocaleDateString('en-GB')
                      : <span className="text-brand-border">—</span>}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex justify-end items-center gap-4">
                      {article.status === 'PUBLISHED' && (
                        <a
                          href={`/article/${article.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-brand-muted hover:text-brand-primary transition-colors"
                        >
                          View ↗
                        </a>
                      )}
                      <Link
                        href={`/admin/articles/${article.id}`}
                        className="text-xs font-semibold text-brand-ink hover:underline"
                      >
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {result.data.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-brand-muted">
                    No articles found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </AdminCard>

      {/* Pagination */}
      {(result.hasMore || page > 1) && (
        <div className="flex gap-3">
          {page > 1 && (
            <Link
              href={`/admin/articles?page=${page - 1}`}
              className="px-4 py-2 border border-brand-border rounded-lg text-sm font-semibold text-brand-secondary hover:bg-brand-canvas hover:border-brand-ink transition-colors"
            >
              ← Previous
            </Link>
          )}
          {result.hasMore && (
            <Link
              href={`/admin/articles?page=${page + 1}`}
              className="px-4 py-2 border border-brand-border rounded-lg text-sm font-semibold text-brand-secondary hover:bg-brand-canvas hover:border-brand-ink transition-colors"
            >
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
