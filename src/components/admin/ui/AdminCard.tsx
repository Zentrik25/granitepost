import Link from 'next/link'
import type { ReactNode } from 'react'

/**
 * AdminCard — the standard card container for all admin panels.
 *
 * Usage:
 *   <AdminCard>...</AdminCard>
 *   <AdminCard title="Recent Articles" action={<Link href="...">View all</Link>}>
 *     <table>...</table>
 *   </AdminCard>
 *   <AdminCard padded={false}>  ← for tables that need flush edges
 *     <table>...</table>
 *   </AdminCard>
 */
interface AdminCardProps {
  /** Optional card title — renders a header bar above content */
  title?: string
  /** Optional element rendered right-aligned in the header (e.g. a View all link) */
  action?: ReactNode
  /** Add internal padding. Default true. Set false for tables/full-bleed content. */
  padded?: boolean
  children: ReactNode
  className?: string
}

export function AdminCard({
  title,
  action,
  padded = true,
  children,
  className = '',
}: AdminCardProps) {
  return (
    <div
      className={`bg-brand-surface rounded-xl border border-brand-border shadow-sm overflow-hidden ${className}`}
    >
      {(title || action) && (
        <div className="flex items-center justify-between gap-4 px-5 py-3.5 border-b border-brand-border">
          {title && (
            <h2 className="text-sm font-bold text-brand-primary tracking-tight">{title}</h2>
          )}
          {action && (
            <div className="ml-auto text-xs font-semibold text-brand-ink hover:underline">
              {action}
            </div>
          )}
        </div>
      )}
      <div className={padded ? 'p-5' : ''}>{children}</div>
    </div>
  )
}

/**
 * AdminPageHeader — standard page-level heading + optional primary action button.
 *
 * Usage:
 *   <AdminPageHeader
 *     title="Articles"
 *     description="48 total"
 *     action={<Link href="/admin/articles/new">New Article</Link>}
 *   />
 */
interface AdminPageHeaderProps {
  title: string
  description?: string
  action?: ReactNode
}

export function AdminPageHeader({ title, description, action }: AdminPageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-black text-brand-primary leading-tight">{title}</h1>
        {description && (
          <p className="text-sm text-brand-muted mt-0.5">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

/**
 * AdminPrimaryButton — consistent "New / Save" CTA using brand gradient.
 *
 * Usage:
 *   <AdminPrimaryButton href="/admin/articles/new">New Article</AdminPrimaryButton>
 *   <AdminPrimaryButton onClick={handleSave}>Save changes</AdminPrimaryButton>
 */
interface AdminPrimaryButtonProps {
  href?: string
  onClick?: () => void
  type?: 'button' | 'submit'
  children: ReactNode
  icon?: ReactNode
  disabled?: boolean
  className?: string
}

export function AdminPrimaryButton({
  href,
  onClick,
  type = 'button',
  children,
  icon,
  disabled,
  className = '',
}: AdminPrimaryButtonProps) {
  const base =
    'inline-flex items-center gap-2 px-4 py-2.5 text-white text-sm font-bold rounded-lg hover:brightness-110 active:brightness-95 transition-all duration-150 disabled:opacity-60 disabled:pointer-events-none'
  const style = {
    background: 'linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%)',
  }

  if (href) {
    return (
      <Link href={href} className={`${base} ${className}`} style={style}>
        {icon}
        {children}
      </Link>
    )
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${className}`}
      style={style}
    >
      {icon}
      {children}
    </button>
  )
}

/**
 * AdminStatusBadge — consistent status pill across all admin tables.
 */
const STATUS_STYLES: Record<string, string> = {
  PUBLISHED: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  DRAFT:     'bg-brand-canvas text-brand-secondary border border-brand-border',
  REVIEW:    'bg-amber-50 text-amber-700 border border-amber-200',
  ARCHIVED:  'bg-rose-50 text-rose-600 border border-rose-200',
  PENDING:   'bg-amber-50 text-amber-700 border border-amber-200',
  APPROVED:  'bg-emerald-50 text-emerald-700 border border-emerald-200',
  SPAM:      'bg-rose-50 text-rose-600 border border-rose-200',
  DELETED:   'bg-brand-canvas text-brand-muted border border-brand-border',
}

export function AdminStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full ${
        STATUS_STYLES[status] ?? 'bg-brand-canvas text-brand-secondary border border-brand-border'
      }`}
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  )
}

/**
 * AdminTableRow — consistent hover state for admin table rows.
 */
export function adminTableRowClass() {
  return 'hover:bg-brand-canvas transition-colors duration-100'
}

/**
 * AdminTableHead — consistent column header styling.
 */
export function AdminTableHead({ children }: { children: ReactNode }) {
  return (
    <th className="text-left px-5 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wide whitespace-nowrap">
      {children}
    </th>
  )
}
