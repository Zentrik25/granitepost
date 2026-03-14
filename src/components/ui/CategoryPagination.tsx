import Link from 'next/link'

export function CategoryPagination({
  currentPage,
  totalPages,
  slug,
}: {
  currentPage: number
  totalPages: number
  slug: string
}) {
  if (totalPages <= 1) return null
  return (
    <nav aria-label="Category pagination" className="flex items-center justify-center gap-3 py-8 text-sm font-medium">
      {currentPage > 1 && (
        <Link
          href={`/category/${slug}?page=${currentPage - 1}`}
          rel="prev"
          className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          ← Previous
        </Link>
      )}
      <span className="text-gray-500">Page {currentPage} of {totalPages}</span>
      {currentPage < totalPages && (
        <Link
          href={`/category/${slug}?page=${currentPage + 1}`}
          rel="next"
          className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Next →
        </Link>
      )}
    </nav>
  )
}
