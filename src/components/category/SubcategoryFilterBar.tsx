import Link from 'next/link'
import type { Category } from '@/types'

interface SubcategoryFilterBarProps {
  /** All direct children of the parent category. */
  subcategories: Category[]
  /** Slug of the currently active subcategory, or null when viewing the parent (all). */
  activeSlug: string | null
  /** Slug of the parent category — used for the "All" pill link. */
  parentSlug: string
}

/**
 * Horizontal scrollable pill strip for subcategory filtering.
 * Server component — all interactivity is plain anchor navigation.
 * Active state is derived from the current route slug passed by the page.
 */
export function SubcategoryFilterBar({
  subcategories,
  activeSlug,
  parentSlug,
}: SubcategoryFilterBarProps) {
  if (subcategories.length === 0) return null

  const allActive = activeSlug === null

  return (
    <nav
      aria-label="Filter by subcategory"
      className="w-full overflow-x-auto scrollbar-hide"
    >
      <ul className="flex gap-2 py-1 w-max min-w-full">
        {/* "All" pill — links back to the parent category */}
        <li>
          <Link
            href={`/category/${parentSlug}`}
            aria-current={allActive ? 'page' : undefined}
            className={`
              inline-flex items-center whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-semibold
              transition-colors duration-150
              ${
                allActive
                  ? 'border-granite-primary bg-granite-primary text-white'
                  : 'border-gray-300 bg-white text-gray-600 hover:border-granite-primary hover:text-granite-primary'
              }
            `}
          >
            All
          </Link>
        </li>

        {subcategories.map((sub) => {
          const isActive = activeSlug === sub.slug
          return (
            <li key={sub.id}>
              <Link
                href={`/category/${sub.slug}`}
                aria-current={isActive ? 'page' : undefined}
                className={`
                  inline-flex items-center whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-semibold
                  transition-colors duration-150
                  ${
                    isActive
                      ? 'border-granite-primary bg-granite-primary text-white'
                      : 'border-gray-300 bg-white text-gray-600 hover:border-granite-primary hover:text-granite-primary'
                  }
                `}
              >
                {sub.name}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
