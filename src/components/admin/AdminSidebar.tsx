'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { UserRole } from '@/types'

interface AdminSidebarProps {
  role: UserRole
}

// ── Minimal SVG icon helper ────────────────────────────────────────────────────

function Icon({ d, className = 'w-4 h-4' }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={d} />
    </svg>
  )
}

const ICONS: Record<string, string> = {
  dashboard:  'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10',
  articles:   'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
  categories: 'M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z',
  tags:       'M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z M7 7h.01',
  media:      'M4 16l4.586-4.586a2 2 0 012.828 0L16 16 M14 14l1.586-1.586a2 2 0 012.828 0L20 14 M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z M9 10a1 1 0 100-2 1 1 0 000 2z',
  comments:   'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z',
  newsletter: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6',
  analytics:  'M18 20V10 M12 20V4 M6 20v-6',
  settings:   'M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z',
  external:   'M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6 M15 3h6v6 M10 14L21 3',
}

// ── Nav items ─────────────────────────────────────────────────────────────────

const navItems: { label: string; href: string; icon: string; roles: UserRole[] }[] = [
  { label: 'Dashboard',  href: '/admin',            icon: 'dashboard',   roles: ['ADMIN', 'EDITOR', 'AUTHOR', 'MODERATOR'] },
  { label: 'Articles',   href: '/admin/articles',   icon: 'articles',    roles: ['ADMIN', 'EDITOR', 'AUTHOR'] },
  { label: 'Categories', href: '/admin/categories',    icon: 'categories',  roles: ['ADMIN', 'EDITOR'] },
  { label: 'Subcategories', href: '/admin/subcategories', icon: 'categories', roles: ['ADMIN', 'EDITOR'] },
  { label: 'Tags',       href: '/admin/tags',          icon: 'tags',        roles: ['ADMIN', 'EDITOR', 'AUTHOR'] },
  { label: 'Media',      href: '/admin/media',       icon: 'media',       roles: ['ADMIN', 'EDITOR', 'AUTHOR'] },
  { label: 'Comments',   href: '/admin/comments',    icon: 'comments',    roles: ['ADMIN', 'EDITOR', 'MODERATOR'] },
  { label: 'Newsletter', href: '/admin/newsletter',  icon: 'newsletter',  roles: ['ADMIN', 'EDITOR'] },
  { label: 'Analytics',  href: '/admin/analytics',   icon: 'analytics',   roles: ['ADMIN', 'EDITOR'] },
  { label: 'Settings',   href: '/admin/settings',    icon: 'settings',    roles: ['ADMIN'] },
]

const ROLE_PILL: Record<UserRole, string> = {
  ADMIN:     'bg-granite-accent/25 text-granite-accent border border-granite-accent/30',
  EDITOR:    'bg-blue-400/20 text-blue-200 border border-blue-400/25',
  AUTHOR:    'bg-emerald-400/20 text-emerald-200 border border-emerald-400/25',
  MODERATOR: 'bg-purple-400/20 text-purple-200 border border-purple-400/25',
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

export function AdminSidebar({ role }: AdminSidebarProps) {
  const pathname = usePathname()
  const visible = navItems.filter((item) => item.roles.includes(role))

  function isActive(href: string) {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
    <aside
      className="flex w-60 flex-shrink-0 flex-col h-full overflow-y-auto"
      style={{ background: 'linear-gradient(165deg, #060f1e 0%, #0d1e50 50%, #142B6F 100%)' }}
    >
      {/* Brand */}
      <div className="px-5 pt-6 pb-5 flex-shrink-0">
        <Link href="/admin" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md"
            style={{ background: 'linear-gradient(135deg, #FFD601 0%, #F5C800 100%)' }}>
            <span className="text-granite-primary font-black text-xs leading-none">GP</span>
          </div>
          <div className="min-w-0">
            <p className="text-white font-black text-sm tracking-tight leading-none truncate">
              Granite Post
            </p>
            <p className="text-slate-500 text-[10px] mt-0.5 leading-none">Admin CMS</p>
          </div>
        </Link>

        <div className="mt-4">
          <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${ROLE_PILL[role]}`}>
            {role}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-white/8 flex-shrink-0" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5" aria-label="Admin navigation">
        {visible.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                active
                  ? 'bg-white/14 text-white'
                  : 'text-slate-400 hover:bg-white/6 hover:text-slate-200'
              }`}
            >
              {/* Left accent bar for active */}
              {active && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-granite-accent"
                  aria-hidden="true"
                />
              )}
              <Icon
                d={ICONS[item.icon]}
                className={`w-4 h-4 flex-shrink-0 transition-colors ${
                  active ? 'text-granite-accent' : 'text-slate-600 group-hover:text-slate-400'
                }`}
              />
              <span className="truncate flex-1">{item.label}</span>
              {active && (
                <span className="w-1.5 h-1.5 rounded-full bg-granite-accent flex-shrink-0" aria-hidden="true" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Divider */}
      <div className="mx-4 h-px bg-white/8 flex-shrink-0" />

      {/* View site */}
      <div className="px-3 py-3 flex-shrink-0">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-500 hover:text-slate-200 hover:bg-white/6 transition-all duration-150 group"
        >
          <Icon d={ICONS.external} className="w-3.5 h-3.5 flex-shrink-0 group-hover:text-slate-400 transition-colors" />
          <span>View site</span>
        </Link>
      </div>
    </aside>
  )
}