'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Category } from '@/types'

interface MobileNavProps {
  categories: Category[]
  siteName: string
}

export function MobileNav({ categories, siteName }: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => { setOpen(false) }, [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-white hover:text-granite-accent transition-colors"
        aria-label="Open navigation menu"
        aria-expanded={open}
        aria-controls="mobile-nav-drawer"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <nav
        id="mobile-nav-drawer"
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-granite-gradient shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden flex flex-col ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Mobile navigation"
        aria-hidden={!open}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/20">
          <Link href="/" className="text-lg font-black text-white tracking-tight">
            {siteName}
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg text-white/70 hover:text-granite-accent hover:bg-white/10 transition-colors"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <div className="flex-1 overflow-y-auto py-4">
          <p className="px-5 pb-2 text-xs font-bold uppercase tracking-widest text-granite-accent">
            Sections
          </p>
          <ul>
            <li>
              <Link
                href="/"
                className="block px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10 hover:text-granite-accent transition-colors rounded-lg mx-2"
              >
                Home
              </Link>
            </li>
            {categories.map((cat) => (
              <li key={cat.id}>
                <Link
                  href={`/category/${cat.slug}`}
                  className="block px-5 py-2.5 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-granite-accent transition-colors rounded-lg mx-2"
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>

          <div className="border-t border-white/20 mt-4 pt-4 px-2">
            <p className="px-3 pb-2 text-xs font-bold uppercase tracking-widest text-granite-accent">
              More
            </p>
            {[
              { href: '/search', label: 'Search' },
              { href: '/about', label: 'About Us' },
              { href: '/contact', label: 'Contact' },
              { href: '/editorial-policy', label: 'Editorial Policy' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="block px-3 py-2 text-sm text-white/70 hover:text-granite-accent transition-colors rounded-lg"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </>
  )
}