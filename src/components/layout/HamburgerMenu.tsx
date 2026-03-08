'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { NavCategory } from '@/lib/queries/navigation'

interface HamburgerMenuProps {
  categories: NavCategory[]
  siteName: string
}

export function HamburgerMenu({ categories, siteName }: HamburgerMenuProps) {
  const [open, setOpen] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const pathname = usePathname()
  const closeRef = useRef<HTMLButtonElement>(null)

  // Close on route change
  useEffect(() => { setOpen(false) }, [pathname])

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Focus close button when menu opens
  useEffect(() => {
    if (open) closeRef.current?.focus()
  }, [open])

  function toggle(id: string) {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <>
      {/* Hamburger button — mobile only */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden p-2 text-white hover:text-amber-400 transition-colors rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls="hamburger-drawer"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/70 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Full-screen drawer */}
      <div
        id="hamburger-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`
          fixed inset-y-0 left-0 z-50 w-[85vw] max-w-sm
          flex flex-col
          md:hidden
          transform transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ background: 'linear-gradient(160deg, #0D1117 0%, #1C2B3A 60%, #2E4A62 100%)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 flex-shrink-0">
          <Link
            href="/"
            aria-label={siteName}
            onClick={() => setOpen(false)}
            className="flex items-baseline gap-0 leading-none select-none"
          >
            <span className="text-[12px] font-bold tracking-[0.22em] uppercase text-white mr-1.5 mb-px">
              The
            </span>
            <span
              className="text-[22px] font-bold text-white leading-none"
              style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
            >
              Granite
            </span>
            <span className="text-[12px] font-bold tracking-[0.22em] uppercase text-white ml-1.5 mb-px">
              Post
            </span>
          </Link>
          <button
            ref={closeRef}
            onClick={() => setOpen(false)}
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto pb-8">

          {/* Home link */}
          <div className="px-3 pt-4 pb-2">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-white font-semibold text-[15px] hover:bg-white/8 transition-colors"
            >
              <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.75L12 3l9 6.75V21a1 1 0 01-1 1H4a1 1 0 01-1-1V9.75z" />
              </svg>
              Home
            </Link>
          </div>

          {/* Category section label */}
          <p className="px-7 pt-2 pb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-amber-400/80">
            Sections
          </p>

          {/* Categories */}
          <ul className="px-3 space-y-0.5">
            {categories.map((cat) => {
              const isExpanded = expandedId === cat.id
              const hasSubs = cat.children.length > 0

              return (
                <li key={cat.id}>
                  {hasSubs ? (
                    <>
                      {/* Accordion header */}
                      <div className="flex items-stretch rounded-xl overflow-hidden">
                        <Link
                          href={`/category/${cat.slug}`}
                          onClick={() => setOpen(false)}
                          className="flex-1 px-4 py-3 text-[15px] font-medium text-white/85 hover:text-white hover:bg-white/8 transition-colors"
                        >
                          {cat.name}
                        </Link>
                        <button
                          onClick={() => toggle(cat.id)}
                          className="px-3 text-white/50 hover:text-amber-400 hover:bg-white/8 transition-colors"
                          aria-label={isExpanded ? `Collapse ${cat.name}` : `Expand ${cat.name}`}
                          aria-expanded={isExpanded}
                        >
                          <svg
                            className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.5}
                            aria-hidden="true"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>

                      {/* Subcategories — smooth height animation */}
                      <div
                        className="overflow-hidden transition-all duration-250 ease-in-out"
                        style={{ maxHeight: isExpanded ? `${cat.children.length * 52}px` : '0px' }}
                        aria-hidden={!isExpanded}
                      >
                        <ul className="ml-4 pl-3 border-l border-white/12 py-1 space-y-0.5">
                          {cat.children.map((child) => (
                            <li key={child.id}>
                              <Link
                                href={`/category/${child.slug}`}
                                onClick={() => setOpen(false)}
                                className="block px-3 py-2.5 text-[14px] text-white/60 hover:text-amber-400 hover:bg-white/5 rounded-lg transition-colors"
                              >
                                {child.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  ) : (
                    <Link
                      href={`/category/${cat.slug}`}
                      onClick={() => setOpen(false)}
                      className="block px-4 py-3 text-[15px] font-medium text-white/85 hover:text-white hover:bg-white/8 transition-colors rounded-xl"
                    >
                      {cat.name}
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>

          {/* Utility links */}
          <div className="mx-3 mt-6 pt-6 border-t border-white/10">
            <p className="px-4 pb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-amber-400/80">
              More
            </p>
            {[
              { href: '/search', label: 'Search Articles' },
              { href: '/about', label: 'About Us' },
              { href: '/contact', label: 'Contact' },
              { href: '/editorial-policy', label: 'Editorial Policy' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-[14px] text-white/55 hover:text-white hover:bg-white/8 rounded-xl transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
