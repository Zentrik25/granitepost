import Link from 'next/link'

interface EmptyStateProps {
  title: string
  description?: string
  action?: { label: string; href: string }
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-granite-muted flex items-center justify-center mb-5">
        <svg
          className="w-8 h-8 text-granite-primary/40"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
          />
        </svg>
      </div>
      <h2 className="text-lg font-bold text-brand-dark mb-2">{title}</h2>
      {description && (
        <p className="text-sm text-brand-muted max-w-sm leading-relaxed">{description}</p>
      )}
      {action && (
        <Link
          href={action.href}
          className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-granite-gradient text-white text-sm font-semibold shadow-md hover:shadow-lg hover:brightness-110 transition-all"
        >
          {action.label}
        </Link>
      )}
    </div>
  )
}