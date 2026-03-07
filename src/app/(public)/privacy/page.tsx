import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Zimbabwe News Online collects, uses, and protects your personal information.',
}

export default function PrivacyPage() {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? 'Zimbabwe News Online'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://zimbabwenewsonline.com'

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-black mb-2 border-b-2 border-brand-red pb-3">
        Privacy Policy
      </h1>
      <p className="text-xs text-brand-muted mt-2">Last updated: January 2025</p>

      <div className="mt-6 space-y-6 text-sm leading-relaxed text-brand-dark">
        <section>
          <h2 className="text-lg font-bold mb-2">1. Who We Are</h2>
          <p>
            {siteName} (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) operates the
            website at <span className="text-brand-red">{siteUrl}</span>. We are the data
            controller for the personal information we collect.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">2. Information We Collect</h2>
          <ul className="list-disc list-outside ml-5 space-y-1">
            <li>
              <strong>Newsletter subscriptions:</strong> Your email address when you subscribe.
            </li>
            <li>
              <strong>Comments:</strong> Your name, email address, and comment text.
            </li>
            <li>
              <strong>Usage data:</strong> Pages viewed, referral source, device type, and
              anonymised IP address via our analytics system.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">3. How We Use Your Information</h2>
          <ul className="list-disc list-outside ml-5 space-y-1">
            <li>To send you newsletters you have opted into.</li>
            <li>To moderate and publish comments you submit.</li>
            <li>To understand how our content is read and improve our service.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">4. Data Retention</h2>
          <p>
            Newsletter subscriptions are retained until you unsubscribe. Comments are retained
            unless you request deletion. Usage analytics are aggregated and anonymised.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">5. Your Rights</h2>
          <p>
            You have the right to access, correct, or delete your personal data. To exercise
            any of these rights, email{' '}
            <a
              href="mailto:privacy@zimbabwenewsonline.com"
              className="text-brand-red hover:underline"
            >
              privacy@zimbabwenewsonline.com
            </a>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">6. Cookies</h2>
          <p>
            We use only essential cookies required for site functionality and authentication.
            We do not use advertising or tracking cookies.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">7. Third-Party Services</h2>
          <p>
            We use Supabase for database and authentication, and Vercel for hosting.
            These services have their own privacy policies. We do not sell your data to
            any third party.
          </p>
        </section>
      </div>
    </div>
  )
}
