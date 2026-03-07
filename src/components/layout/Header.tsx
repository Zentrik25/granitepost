import Link from 'next/link'
import type { Category } from '@/types'
import type { SiteSettings } from '@/lib/settings/queries'
import { MobileNav } from '@/components/ui/MobileNav'

interface HeaderProps {
  categories: Category[]
  settings: SiteSettings
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  )
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
        clipRule="evenodd"
      />
    </svg>
  )
}

export function Header({ categories, settings }: HeaderProps) {
  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <header className="bg-granite-gradient sticky top-0 z-50 shadow-lg">
      {/* ── Top bar: current date (left) + WhatsApp (right) ── */}
      <div className="bg-black/20 text-white text-xs py-1.5">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <time
            dateTime={new Date().toISOString().slice(0, 10)}
            className="font-medium tracking-wide"
          >
            {today}
          </time>

          {settings.whatsapp_url ? (
            <a
              href={settings.whatsapp_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-granite-accent transition-colors"
              aria-label="Join us on WhatsApp"
            >
              <WhatsAppIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-semibold">WhatsApp</span>
            </a>
          ) : null}
        </div>
      </div>

      {/* ── Logo row: site name (left) + Search + mobile menu (right) ── */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {/* Mobile hamburger via client component */}
          <MobileNav categories={categories} siteName={settings.site_name} />
          <Link href="/" className="flex flex-col shrink-0">
            <span className="text-2xl md:text-3xl font-black tracking-tight text-white">
              {settings.site_name}
            </span>
            <span className="text-xs text-white/60 hidden sm:block">Breaking News &amp; In-depth Coverage</span>
          </Link>
        </div>

        {/* Search — visible md+ screens */}
        <form
          action="/search"
          method="GET"
          role="search"
          className="hidden md:flex items-center"
        >
          <input
            type="search"
            name="q"
            placeholder="Search…"
            aria-label="Search articles"
            className="bg-white/10 border border-white/30 text-white placeholder:text-white/50 px-3 py-1.5 text-sm w-52 focus:outline-none focus:ring-2 focus:ring-granite-accent focus:border-granite-accent rounded-l-full"
          />
          <button
            type="submit"
            aria-label="Submit search"
            className="px-3 py-1.5 bg-granite-accent text-granite-primary hover:bg-yellow-300 transition-colors border border-granite-accent font-semibold rounded-r-full"
          >
            <SearchIcon className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* ── Category nav ── */}
      <nav className="border-t border-white/20" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto">
          <ul className="flex gap-0 text-sm font-semibold whitespace-nowrap text-white">
            <li>
              <Link
                href="/"
                className="inline-block px-3 py-2.5 hover:text-granite-accent transition-colors border-b-2 border-transparent hover:border-granite-accent"
              >
                Home
              </Link>
            </li>
            {categories.slice(0, 8).map((cat) => (
              <li key={cat.id}>
                <Link
                  href={`/category/${cat.slug}`}
                  className="inline-block px-3 py-2.5 hover:text-granite-accent transition-colors border-b-2 border-transparent hover:border-granite-accent"
                >
                  {cat.name}
                </Link>
              </li>
            ))}
            {/* Mobile: search link at end */}
            <li className="md:hidden ml-auto">
              <Link
                href="/search"
                className="inline-flex items-center px-3 py-2.5 text-white/70 hover:text-granite-accent transition-colors"
                aria-label="Search articles"
              >
                <SearchIcon className="w-4 h-4" />
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  )
}
