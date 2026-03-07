import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'Terms and conditions for using Zimbabwe News Online.',
}

export default function TermsPage() {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? 'Zimbabwe News Online'

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-black mb-2 border-b-2 border-brand-red pb-3">
        Terms of Use
      </h1>
      <p className="text-xs text-brand-muted mt-2">Last updated: January 2025</p>

      <div className="mt-6 space-y-6 text-sm leading-relaxed text-brand-dark">
        <section>
          <h2 className="text-lg font-bold mb-2">1. Acceptance of Terms</h2>
          <p>
            By accessing or using {siteName}, you agree to be bound by these Terms of Use
            and our Privacy Policy. If you do not agree, please do not use this site.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">2. Content and Copyright</h2>
          <p>
            All content published on this site, including articles, photographs, graphics, and
            video, is the copyright of {siteName} or its content partners unless otherwise
            stated. You may not reproduce, distribute, or republish our content without
            prior written permission.
          </p>
          <p className="mt-2">
            You may share links to our articles and quote brief excerpts with appropriate
            attribution.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">3. User Comments</h2>
          <p>
            By submitting a comment, you grant us the right to publish and moderate it.
            You must not post content that is defamatory, abusive, illegal, or in breach
            of any third-party rights. We reserve the right to remove any comment without notice.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">4. Disclaimer</h2>
          <p>
            While we strive for accuracy, we make no warranties about the completeness
            or reliability of information on this site. We are not liable for any loss
            arising from reliance on our content.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">5. External Links</h2>
          <p>
            This site may contain links to external websites. We are not responsible for
            the content or privacy practices of those sites.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">6. Changes to These Terms</h2>
          <p>
            We may update these terms at any time. Continued use of the site constitutes
            acceptance of any revised terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">7. Contact</h2>
          <p>
            For questions about these terms, contact us at{' '}
            <a
              href="mailto:legal@zimbabwenewsonline.com"
              className="text-brand-red hover:underline"
            >
              legal@zimbabwenewsonline.com
            </a>.
          </p>
        </section>
      </div>
    </div>
  )
}
