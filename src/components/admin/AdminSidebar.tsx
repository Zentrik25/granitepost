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
  { label: 'Categories', href: '/admin/categories', icon: '◈', roles: ['ADMIN', 'EDITOR'] },
  { label: 'Tags', href: '/admin/tags', icon: '#', roles: ['ADMIN', 'EDITOR', 'AUTHOR'] },
  { label: 'Media', href: '/admin/media', icon: '⊞', roles: ['ADMIN', 'EDITOR', 'AUTHOR'] },
  { label: 'Comments', href: '/admin/comments', icon: '✉', roles: ['ADMIN', 'EDITOR', 'MODERATOR'] },
  { label: 'Newsletter', href: '/admin/newsletter', icon: '◎', roles: ['ADMIN', 'EDITOR'] },
  { label: 'Analytics', href: '/admin/analytics', icon: '↗', roles: ['ADMIN', 'EDITOR'] },
  { label: 'Settings', href: '/admin/settings', icon: '⚙', roles: ['ADMIN'] },
]

export function AdminSidebar({ role }: AdminSidebarProps) {
  const visible = navItems.filter((item) => item.roles.includes(role))

  return (
    <aside className="flex w-56 bg-brand-dark text-white flex-shrink-0 flex-col h-full overflow-y-auto">
      <div className="px-4 py-5 border-b border-gray-700 flex-shrink-0">
        <span className="text-sm font-black tracking-tight">GRANITE POST Admin</span>
        <span className="block text-xs text-gray-400 mt-0.5">{role}</span>
      </div>

      <nav className="flex-1 py-4" aria-label="Admin navigation">
        <ul className="space-y-0.5">
          {visible.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
              >
                <span className="text-base w-5 text-center">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="px-4 py-4 border-t border-gray-700 flex-shrink-0">
        <Link
          href="/"
          className="text-xs text-gray-400 hover:text-white transition-colors"
        >
          ← View site
        </Link>
      </div>
    </aside>
  )
}