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
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  )
}

export function NavHeader({ categories, settings }: NavHeaderProps) {
  return (
    <header
      className="sticky top-0 z-50 w-full shadow-lg"
      style={{ background: 'linear-gradient(135deg, #0D1117 0%, #1C2B3A 50%, #2E4A62 100%)' }}
    >
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-3">

        {/* Hamburger — mobile only */}
        <HamburgerMenu categories={categories} siteName={settings.site_name} />

        {/* Site identity */}
        <Link href="/" className="flex flex-col leading-none shrink-0 mr-2">
          <span className="text-white font-black text-xl sm:text-2xl md:text-[26px] tracking-tight">
            {settings.site_name}
          </span>
          <span className="hidden sm:block text-[10px] text-white/45 tracking-wide mt-0.5">
            Breaking News &amp; In-depth Coverage
          </span>
        </Link>

        <div className="flex-1" />

        {/* Desktop search */}
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
            className="
              w-40 lg:w-52 h-8 px-3 text-sm rounded-l-full
              bg-white/10 border border-white/25 text-white
              placeholder:text-white/45
              focus:outline-none focus:ring-1 focus:ring-amber-400 focus:border-amber-400
              transition-colors
            "
          />
          <button
            type="submit"
            aria-label="Submit search"
            className="
              h-8 px-3 rounded-r-full
              bg-amber-500 hover:bg-amber-400 active:bg-amber-600
              text-white transition-colors
            "
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden="true">
              <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
            </svg>
          </button>
        </form>

        {/* Mobile search link */}
        <Link
          href="/search"
          className="md:hidden text-white/70 hover:text-white p-1.5 transition-colors"
          aria-label="Search"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" aria-hidden="true">
            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
          </svg>
        </Link>

        {/* WhatsApp */}
        {settings.whatsapp_url && (
          <a
            href={settings.whatsapp_url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Join us on WhatsApp"
            className="
              w-9 h-9 rounded-full shrink-0
              flex items-center justify-center
              bg-[#25D366] hover:bg-[#1ebe57] active:bg-[#18a84b] active:scale-95
              text-white shadow-md transition-all duration-150
            "
          >
            <WhatsAppIcon />
          </a>
        )}
      </div>

      {/* ── Category navigation bar — desktop ───────────────────────────── */}
      <DesktopNav categories={categories} />
    </header>
  )
}
