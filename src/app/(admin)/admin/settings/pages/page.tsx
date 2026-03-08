import type { Metadata } from 'next'
import Link from 'next/link'
import { requireAuth } from '@/lib/auth/guards'
import { getAllSitePages } from '@/lib/queries/site-pages'
import { AdminPageHeader, AdminCard } from '@/components/admin/ui/AdminCard'

export const metadata: Metadata = { title: 'Pages — Admin Settings' }
export const revalidate = 60

const PAGE_LABELS: Record<string, string> = {
  about:             'About Us',
  contact:           'Contact Us',
  'editorial-policy': 'Editorial Policy',
  corrections:       'Corrections',
  ownership:         'Ownership',
  'privacy-policy':  'Privacy Policy',
  'terms-of-use':    'Terms of Use',
}

const PAGE_DESC: Record<string, string> = {
  about:             'Who we are, our mission, and editorial standards.',
  contact:           'How readers and partners can reach the newsroom.',
  'editorial-policy': 'Our values, sourcing standards, and editorial independence.',
  corrections:       'How we handle and publish corrections.',
  ownership:         'Ownership structure and funding transparency.',
  'privacy-policy':  'Data collection, cookies, and reader rights.',
  'terms-of-use':    'Terms governing use of the platform.',
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}
      strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

function ExternalIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}
      strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6 M15 3h6v6 M10 14L21 3" />
    </svg>
  )
}

export default async function AdminSettingsPagesPage() {
  await requireAuth()
  const pages = await getAllSitePages()

  // Sort by the known label order
  const ORDER = Object.keys(PAGE_LABELS)
  const sorted = [...pages].sort(
    (a, b) => (ORDER.indexOf(a.slug) ?? 99) - (ORDER.indexOf(b.slug) ?? 99),
  )

  return (
    <div className="space-y-6 max-w-4xl">
      <AdminPageHeader
        title="CMS Pages"
        description="Edit content for static informational pages displayed on the public site."
      />

      <AdminCard padded={false}>
        <ul className="divide-y divide-brand-border">
          {sorted.map((page) => {
            const label = PAGE_LABELS[page.slug] ?? page.title
            const desc  = PAGE_DESC[page.slug] ?? ''
            const updatedAt = new Date(page.updated_at).toLocaleDateString('en-GB', {
              day: 'numeric', month: 'short', year: 'numeric',
            })
            return (
              <li
                key={page.id}
                className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-brand-canvas transition-colors duration-100"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-brand-primary leading-tight">{label}</p>
                  {desc && (
                    <p className="text-xs text-brand-muted mt-0.5 truncate">{desc}</p>
                  )}
                  <p className="text-[10px] text-brand-border mt-1 font-mono">
                    /{page.slug} · updated {updatedAt}
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <a
                    href={`/${page.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-brand-muted hover:text-brand-primary transition-colors"
                    aria-label={`View ${label} on public site`}
                  >
                    <ExternalIcon />
                    <span className="hidden sm:inline">View</span>
                  </a>
                  <Link
                    href={`/admin/settings/pages/${page.slug}`}
                    className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg border border-brand-border text-brand-secondary hover:border-brand-ink hover:text-brand-primary hover:bg-brand-canvas transition-all duration-150"
                  >
                    <EditIcon />
                    Edit
                  </Link>
                </div>
              </li>
            )
          })}

          {sorted.length === 0 && (
            <li className="px-5 py-12 text-center text-sm text-brand-muted">
              No pages found. Run the SQL seed migration to create the default pages.
            </li>
          )}
        </ul>
      </AdminCard>
    </div>
  )
}
