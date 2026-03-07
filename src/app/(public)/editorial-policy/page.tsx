import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Editorial Policy',
  description: 'The editorial standards and values that guide Zimbabwe News Online journalism.',
}

export default function EditorialPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-black mb-2 border-b-2 border-brand-red pb-3">
        Editorial Policy
      </h1>

      <div className="mt-6 space-y-6 text-sm leading-relaxed text-brand-dark">
        <section>
          <h2 className="text-lg font-bold mb-2">1. Independence and Impartiality</h2>
          <p>
            Zimbabwe News Online operates independently of any political party, government body,
            or commercial interest. Our reporting is guided solely by the public interest.
            We do not accept direction on editorial content from advertisers or sponsors.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">2. Accuracy and Verification</h2>
          <p>
            All factual claims are verified against at least two independent sources before
            publication where possible. When we are unable to verify a claim, we say so
            explicitly. We distinguish clearly between news reporting, analysis, and opinion.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">3. Fairness and Right of Reply</h2>
          <p>
            Individuals or organisations criticised in our reporting are given a reasonable
            opportunity to respond before publication. We represent all significant viewpoints
            in contested issues.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">4. Corrections and Transparency</h2>
          <p>
            Errors are corrected promptly and transparently. Corrections are published on the
            original article and, where significant, noted on our{' '}
            <a href="/corrections" className="text-brand-red hover:underline">
              Corrections page
            </a>.
            We do not remove published articles without clear public interest justification.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">5. Sources and Anonymity</h2>
          <p>
            We protect the identity of confidential sources. We use anonymous sources only
            when necessary and when the information cannot be obtained any other way. The
            reason for anonymity is always explained to readers.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">6. Conflicts of Interest</h2>
          <p>
            Journalists declare any personal or financial interest in stories they cover.
            We do not accept gifts, hospitality, or payments that could influence coverage.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">7. Sensitivity and Harm</h2>
          <p>
            We report on sensitive topics including death, crime, and disaster with care and
            respect for those affected. We follow guidelines on suicide reporting set by
            recognised mental health organisations.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">8. Contact</h2>
          <p>
            Editorial concerns should be directed to{' '}
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
