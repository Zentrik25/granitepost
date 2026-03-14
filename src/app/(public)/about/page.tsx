import type { Metadata } from 'next'
import { getSitePage } from '@/lib/queries/site-pages'
import { SITE_URL } from '@/lib/constants'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Granite Post is your trusted source for breaking news and in-depth reporting from Zimbabwe and across Africa.',
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: 'About Us | The Granite Post',
    description:
      'Granite Post is your trusted source for breaking news and in-depth reporting from Zimbabwe and across Africa.',
    url: `${SITE_URL}/about`,
    type: 'website',
  },
}

export default async function AboutPage() {
  const page = await getSitePage('about')

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <header className="mb-8 pb-4 border-b-2 border-brand-ink">
        <h1 className="text-3xl md:text-4xl font-black text-brand-primary leading-tight">
          About Us
        </h1>
        <p className="text-brand-muted mt-2 text-base leading-relaxed">
          Granite Post is your trusted source for breaking news and in-depth reporting from Zimbabwe
          and across Africa.
        </p>
      </header>

      {page?.content_html && (
        <article
          className="
            prose prose-sm md:prose-base max-w-none
            prose-headings:font-bold prose-headings:text-brand-primary prose-headings:leading-tight
            prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3
            prose-h3:text-base prose-h3:mt-6 prose-h3:mb-2
            prose-p:text-brand-secondary prose-p:leading-relaxed prose-p:my-4
            prose-a:text-amber-700 prose-a:underline prose-a:underline-offset-2 hover:prose-a:text-amber-900
            prose-strong:text-brand-primary
            prose-ul:my-4 prose-ul:pl-6 prose-ul:list-disc
            prose-li:my-1 prose-li:text-brand-secondary
          "
          dangerouslySetInnerHTML={{ __html: page.content_html }}
        />
      )}

      {/* ── Editorial Team ──────────────────────────────────────────────────────
          TODO: Replace placeholder names/emails below with real staff details.
      ──────────────────────────────────────────────────────────────────────── */}
      <section className="mt-12 pt-8 border-t border-brand-border">
        <h2 className="text-xl font-bold text-brand-primary mb-6">Our Editorial Team</h2>

        <div className="space-y-8">
          {/* TODO: Replace with real Editor-in-Chief details */}
          <div className="flex flex-col gap-1">
            <p className="text-[11px] font-black uppercase tracking-widest text-amber-700">
              Editor-in-Chief
            </p>
            <h3 className="text-base font-bold text-brand-primary">Tariro Chavanduka</h3>
            <p className="text-sm text-brand-secondary leading-relaxed">
              Tariro has over a decade of experience covering Zimbabwean politics and economics.
              She leads the newsroom with a commitment to accuracy, fairness, and editorial
              independence.
            </p>
            <a
              href="mailto:editor@thegranite.co.zw"
              className="text-sm text-amber-700 hover:underline mt-1"
            >
              editor@thegranite.co.zw
            </a>
          </div>

          {/* TODO: Replace with real Managing Editor details */}
          <div className="flex flex-col gap-1">
            <p className="text-[11px] font-black uppercase tracking-widest text-amber-700">
              Managing Editor
            </p>
            <h3 className="text-base font-bold text-brand-primary">Granite Post Reporter</h3>
            <p className="text-sm text-brand-secondary leading-relaxed">
              Our managing editor oversees daily news operations, coordinates coverage across
              sections, and maintains The Granite Post's editorial standards.
            </p>
            <a
              href="mailto:newsroom@thegranite.co.zw"
              className="text-sm text-amber-700 hover:underline mt-1"
            >
              newsroom@thegranite.co.zw
            </a>
          </div>
        </div>
      </section>

      <footer className="mt-10 pt-6 border-t border-brand-border text-xs text-brand-muted">
        {page?.updated_at && (
          <>
            Last updated:{' '}
            <time dateTime={page.updated_at}>
              {new Date(page.updated_at).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </time>
          </>
        )}
      </footer>
    </div>
  )
}
