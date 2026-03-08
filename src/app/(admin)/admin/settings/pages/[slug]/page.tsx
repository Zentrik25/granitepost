import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireAuth } from '@/lib/auth/guards'
import { getSitePage } from '@/lib/queries/site-pages'
import { SitePageEditor } from '@/components/admin/SitePageEditor'
import { updateSitePage } from './actions'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  return { title: `Edit ${slug} — Admin` }
}

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}
      strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
      <path d="M19 12H5 M12 19l-7-7 7-7" />
    </svg>
  )
}

export default async function AdminSitePageEditorPage({ params }: Props) {
  const { slug } = await params

  const [, page] = await Promise.all([
    requireAuth(),
    getSitePage(slug),
  ])

  if (!page) notFound()

  // Bind the slug into the action so the client component only passes formData
  const boundAction = updateSitePage.bind(null, slug)

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/settings/pages"
          className="inline-flex items-center gap-1.5 text-sm text-brand-muted hover:text-brand-primary transition-colors group"
        >
          <BackIcon />
          CMS Pages
        </Link>
        <span className="text-brand-border">/</span>
        <span className="text-sm font-semibold text-brand-primary">{page.title}</span>
      </div>

      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-black text-brand-primary leading-tight">{page.title}</h1>
        <p className="text-xs font-mono text-brand-muted mt-0.5">/{page.slug}</p>
      </div>

      <SitePageEditor page={page} saveAction={boundAction} />
    </div>
  )
}
