import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Corrections',
  description: 'Corrections and clarifications published by Zimbabwe News Online.',
}

export default function CorrectionsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-black mb-2 border-b-2 border-brand-red pb-3">
        Corrections &amp; Clarifications
      </h1>

      <p className="mt-4 text-sm text-brand-muted leading-relaxed">
        We are committed to accuracy and transparency. When we make mistakes, we correct them
        promptly and clearly. Significant corrections are listed here in addition to being
        updated on the original article.
      </p>

      <div className="mt-8">
        <p className="text-sm text-brand-muted italic">
          No corrections have been published yet.
        </p>
      </div>

      <div className="mt-10 bg-brand-gray p-5">
        <h2 className="text-base font-bold mb-2">Request a Correction</h2>
        <p className="text-sm text-brand-muted mb-3">
          If you believe we have published an error, please contact us with the article URL
          and details of the inaccuracy.
        </p>
        <a
          href="mailto:corrections@zimbabwenewsonline.com"
          className="text-sm font-semibold text-brand-red hover:underline"
        >
          corrections@zimbabwenewsonline.com
        </a>
      </div>
    </div>
  )
}
