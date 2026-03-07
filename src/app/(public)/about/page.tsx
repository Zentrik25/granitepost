import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Zimbabwe News Online is your trusted source for breaking news and in-depth reporting from Zimbabwe and across Africa.',
}

export default function AboutPage() {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? 'Zimbabwe News Online'

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-black mb-2 border-b-2 border-brand-red pb-3">About Us</h1>

      <div className="prose prose-sm max-w-none mt-6 space-y-5 text-brand-dark leading-relaxed">
        <p>
          <strong>{siteName}</strong> is an independent digital news platform dedicated to delivering
          accurate, timely, and impartial reporting on events in Zimbabwe and across the African continent.
        </p>
        <p>
          Founded with the mission of keeping Zimbabweans at home and in the diaspora informed,
          we cover politics, business, sport, health, technology, entertainment, and more.
        </p>
        <h2 className="text-xl font-bold mt-8">Our Mission</h2>
        <p>
          To be Zimbabwe&apos;s most trusted digital news platform — holding power to account,
          amplifying community voices, and delivering journalism that matters.
        </p>
        <h2 className="text-xl font-bold mt-8">Editorial Standards</h2>
        <p>
          We follow rigorous editorial standards. All stories are verified before publication.
          Corrections are issued promptly and transparently. Read our{' '}
          <a href="/editorial-policy" className="text-brand-red hover:underline">
            Editorial Policy
          </a>{' '}
          for more detail.
        </p>
        <h2 className="text-xl font-bold mt-8">Contact</h2>
        <p>
          To reach the newsroom, visit our{' '}
          <a href="/contact" className="text-brand-red hover:underline">
            Contact page
          </a>.
        </p>
      </div>
    </div>
  )
}
