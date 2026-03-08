import Link from 'next/link'
import type { NavCategory } from '@/lib/queries/navigation'

interface DesktopNavProps {
  categories: NavCategory[]
}

/**
 * Desktop category navigation.
 * Pure server component — dropdowns use CSS group-hover only, zero JS.
 * Hover a top-level category → subcategory dropdown appears beneath it.
 */
export function DesktopNav({ categories }: DesktopNavProps) {
  return (
    <nav
      className="hidden md:block border-t border-white/15"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4">
        <ul className="flex items-stretch overflow-x-auto scrollbar-hide">
          <li>
            <Link
              href="/"
              className="inline-flex items-center h-10 px-3 text-[13px] font-semibold text-white/80 hover:text-white hover:border-b-2 hover:border-accent-amber-lt transition-colors whitespace-nowrap"
            >
              Home
            </Link>
          </li>

          {categories.map((cat) => (
            <li key={cat.id} className="relative group">
              {/* Top-level link */}
              <Link
                href={`/category/${cat.slug}`}
                className="inline-flex items-center gap-1 h-10 px-3 text-[13px] font-semibold text-white/80 hover:text-white hover:border-b-2 hover:border-accent-amber-lt transition-colors whitespace-nowrap"
              >
                {cat.name}
                {cat.children.length > 0 && (
                  <svg
                    className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </Link>

              {/* Subcategory dropdown — CSS only, group-hover */}
              {cat.children.length > 0 && (
                <div
                  className="
                    absolute top-full left-0 z-50
                    hidden group-hover:block
                    bg-white border border-gray-100 shadow-xl
                    rounded-b-lg min-w-[180px] py-1
                  "
                  role="menu"
                  aria-label={`${cat.name} subcategories`}
                >
                  {cat.children.map((child) => (
                    <Link
                      key={child.id}
                      href={`/category/${child.slug}`}
                      role="menuitem"
                      className="
                        block px-4 py-2.5 text-sm text-gray-700
                        hover:bg-gray-50 hover:text-gray-900
                        transition-colors whitespace-nowrap
                        border-l-2 border-transparent hover:border-amber-500
                      "
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
