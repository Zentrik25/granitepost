import Link from 'next/link'
import type { Category } from '@/types'

interface CategoryBreadcrumbProps {
  parent: Category
  current: Category
}

/**
 * Breadcrumb trail for subcategory pages.
 * Renders: News › Politics › Elections
 * Server component — no JS needed.
 */
export function CategoryBreadcrumb({ parent, current }: CategoryBreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-gray-500">
      <Link href="/" className="hover:text-granite-primary transition-colors">
        News
      </Link>
      <span aria-hidden="true" className="text-gray-300">
        ›
      </span>
      <Link
        href={`/category/${parent.slug}`}
        className="hover:text-granite-primary transition-colors"
      >
        {parent.name}
      </Link>
      <span aria-hidden="true" className="text-gray-300">
        ›
      </span>
      <span className="font-semibold text-gray-800" aria-current="page">
        {current.name}
      </span>
    </nav>
  )
}
