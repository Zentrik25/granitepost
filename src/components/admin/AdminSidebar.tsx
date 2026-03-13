import Link from 'next/link'
import type { UserRole } from '@/types'

interface AdminSidebarProps {
  role: UserRole
}

const navItems: {
  label: string
  href: string
  icon: string
  roles: UserRole[]
}[] = [
  { label: 'Dashboard', href: '/admin', icon: '▣', roles: ['ADMIN', 'EDITOR', 'AUTHOR', 'MODERATOR'] },
  { label: 'Articles', href: '/admin/articles', icon: '✎', roles: ['ADMIN', 'EDITOR', 'AUTHOR'] },
  { label: 'Authors', href: '/admin/authors', icon: '✦', roles: ['ADMIN', 'EDITOR', 'AUTHOR'] },
  { label: 'Categories', href: '/admin/categories', icon: '◈', roles: ['ADMIN', 'EDITOR'] },
  { label: 'Tags', href: '/admin/tags', icon: '#', roles: ['ADMIN', 'EDITOR', 'AUTHOR'] },
  { label: 'Media', href: '/admin/media', icon: '⊞', roles: ['ADMIN', 'EDITOR', 'AUTHOR'] },
  { label: 'Comments', href: '/admin/comments', icon: '✉', roles: ['ADMIN', 'EDITOR', 'MODERATOR'] },
  { label: 'Newsletter', href: '/admin/newsletter', icon: '◎', roles: ['ADMIN', 'EDITOR'] },
  { label: 'Analytics', href: '/admin/analytics', icon: '↗', roles: ['ADMIN', 'EDITOR'] },
  { label: 'Settings', href: '/admin/settings', icon: '⚙', roles: ['ADMIN'] },
]

export function AdminSidebar({ role }: AdminSidebarProps) {
  const visibleItems = navItems.filter((item) => item.roles.includes(role))

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-white/10 bg-brand-dark text-white md:w-64">
      <div className="border-b border-white/10 px-4 py-5">
        <div className="text-sm font-black tracking-tight">GRANITE POST Admin</div>
        <div className="mt-1 text-xs text-gray-400">{role}</div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4" aria-label="Admin navigation">
        <ul className="space-y-1">
          {visibleItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                <span className="w-5 text-center text-base">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-white/10 px-4 py-4">
        <Link href="/" className="text-xs text-gray-400 transition-colors hover:text-white">
          ← View site
        </Link>
      </div>
    </aside>
  )
}