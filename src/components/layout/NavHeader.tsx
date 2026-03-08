import Link from 'next/link'
import type { NavCategory } from '@/lib/queries/navigation'
import type { SiteSettings } from '@/lib/settings/queries'
import { DesktopNav } from '@/components/layout/DesktopNav'
import { HamburgerMenu } from '@/components/layout/HamburgerMenu'

interface NavHeaderProps {
  categories: NavCategory[]
  settings: SiteSettings
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden="true">
      <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
    </svg>
  )
}

/** Formats today's date as "Thu, 3 Mar 2026" */
function getTodayLabel() {
  return new Date().toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/** Newspaper-style masthead: THE  Granite  POST — centred absolutely in the bar */
function Masthead({ name }: { name: string }) {
  return (
    <Link
      href="/"
      aria-label={name}
      className="absolute left-1/2 -translate-x-1/2 flex items-baseline gap-0 leading-none select-none"
    >
      <span className="text-[13px] font-bold tracking-[0.22em] uppercase text-white mr-1.5 mb-px">
        The
      </span>
      <span
        className="text-[26px] sm:text-[28px] font-bold text-white leading-none"
        style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
      >
        Granite
      </span>
      <span className="text-[13px] font-bold tracking-[0.22em] uppercase text-white ml-1.5 mb-px">
        Post
      </span>
    </Link>
  )
}

export function NavHeader({ categories, settings }: NavHeaderProps) {
  const today = getTodayLabel()

  return (
    <header
      className="sticky top-0 z-50 w-full shadow-lg"
      style={{ background: 'linear-gradient(135deg, #0D1117 0%, #1C2B3A 50%, #2E4A62 100%)' }}
    >
      {/* ── Utility bar ─────────────────────────────────────────────────── */}
      <div className="border-b border-white/10" style={{ background: 'rgba(0,0,0,0.25)' }}>
        <div className="max-w-7xl mx-auto px-4 h-8 flex items-center justify-between gap-4">

          {/* Date — left */}
          <time
            dateTime={new Date().toISOString().slice(0, 10)}
            className="text-[11px] font-medium tracking-wide text-white/55 uppercase"
          >
            {today}
          </time>

          {/* WhatsApp — right, rounded-lg square button */}
          {settings.whatsapp_url && (
            <a
              href={settings.whatsapp_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Join us on WhatsApp"
              className="flex items-center gap-1.5 h-6 px-2.5 rounded-md text-white text-[11px] font-semibold transition-all duration-150 hover:brightness-110 active:scale-95"
              style={{ background: '#25D366' }}
            >
              <WhatsAppIcon />
              <span className="hidden sm:inline tracking-wide">WhatsApp</span>
            </a>
          )}
        </div>
      </div>

      {/* ── Main brand bar ───────────────────────────────────────────────── */}
      <div className="relative max-w-7xl mx-auto px-4 h-14 flex items-center gap-3">

        {/* Hamburger — mobile only */}
        <HamburgerMenu categories={categories} siteName={settings.site_name} />

        {/* Masthead — centred */}
        <Masthead name={settings.site_name} />

        <div className="flex-1" />

        {/* Search — desktop pill */}
        <form
          action="/search"
          method="GET"
          role="search"
          className="hidden md:flex items-center gap-0 group"
        >
          <input
            type="search"
            name="q"
            placeholder="Search stories…"
            aria-label="Search articles"
            className="
              w-44 lg:w-56 h-9 pl-4 pr-2 text-[13px] rounded-l-full
              bg-white/8 border border-white/15 border-r-0 text-white
              placeholder:text-white/35
              focus:outline-none focus:bg-white/14 focus:border-white/35
              transition-all duration-200
            "
          />
          <button
            type="submit"
            aria-label="Submit search"
            className="
              h-9 w-10 rounded-r-full shrink-0
              flex items-center justify-center
              bg-white/8 border border-white/15 border-l-0
              text-white/60 hover:text-white hover:bg-white/14
              transition-all duration-200
            "
          >
            <SearchIcon />
          </button>
        </form>

        {/* Search — mobile icon button */}
        <Link
          href="/search"
          aria-label="Search"
          className="
            md:hidden w-9 h-9 rounded-lg shrink-0
            flex items-center justify-center
            bg-white/8 border border-white/15
            text-white/70 hover:text-white hover:bg-white/14
            transition-all duration-150
          "
        >
          <SearchIcon />
        </Link>
      </div>

      {/* ── Category navigation bar — desktop ───────────────────────────── */}
      <DesktopNav categories={categories} />
    </header>
  )
}
