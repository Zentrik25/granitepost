import Link from 'next/link'

interface PaginationProps {
  page: number
  hasMore: boolean
  buildHref: (page: number) => string
}

export function Pagination({ page, hasMore, buildHref }: PaginationProps) {
  if (!hasMore && page <= 1) return null

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-3 mt-10">
      {page > 1 && (
        <Link
          href={buildHref(page - 1)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-granite-gradient text-white text-sm font-semibold shadow-md hover:shadow-lg hover:brightness-110 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </Link>
      )}

      <span className="text-sm text-brand-muted font-medium tabular-nums">
        Page {page}
      </span>

      {hasMore && (
        <Link
          href={buildHref(page + 1)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-granite-gradient text-white text-sm font-semibold shadow-md hover:shadow-lg hover:brightness-110 transition-all"
        >
          Next
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      )}
    </nav>
  )
}