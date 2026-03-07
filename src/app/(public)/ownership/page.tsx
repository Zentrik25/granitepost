import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ownership & Funding',
  description: 'Transparency about who owns and funds Zimbabwe News Online.',
}

export default function OwnershipPage() {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? 'Zimbabwe News Online'

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-black mb-2 border-b-2 border-brand-red pb-3">
        Ownership &amp; Funding
      </h1>

      <p className="mt-4 text-sm text-brand-muted leading-relaxed">
        {siteName} is committed to transparency about its ownership structure and sources
        of funding. This page is updated whenever there is a material change.
      </p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-brand-dark">
        <section>
          <h2 className="text-lg font-bold mb-2">Ownership</h2>
          <p>
            {siteName} is independently owned and operated. Details of the company
            registration and directorship are available upon request.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">Editorial Independence</h2>
          <p>
            Our editorial decisions are made entirely by our journalists and editors.
            No owner, advertiser, or funder has any influence over what we publish or
            how we cover any story.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">Sources of Funding</h2>
          <ul className="list-disc list-outside ml-5 space-y-2">
            <li>
              <strong>Advertising:</strong> Display advertising sold directly and via
              advertising networks. Advertisers have no editorial influence.
            </li>
            <li>
              <strong>Sponsored content:</strong> Where content is sponsored, it is
              clearly labelled as such and kept separate from editorial content.
            </li>
            <li>
              <strong>Newsletter subscriptions:</strong> Revenue from our newsletter
              programme.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">Conflicts of Interest</h2>
          <p>
            We maintain a register of potential conflicts of interest for editorial
            staff. Any material conflict is disclosed in relevant coverage.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">Contact</h2>
          <p>
            Questions about ownership or funding should be directed to{' '}
            <a
              href="mailto:editor@zimbabwenewsonline.com"
              className="text-brand-red hover:underline"
            >
              editor@zimbabwenewsonline.com
            </a>.
          </p>
        </section>
      </div>
    </div>
  )
}
