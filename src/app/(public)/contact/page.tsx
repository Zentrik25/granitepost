import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contact the Zimbabwe News Online newsroom.',
}

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-black mb-2 border-b-2 border-brand-red pb-3">Contact Us</h1>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact info */}
        <div className="space-y-5">
          <div>
            <h2 className="text-base font-bold mb-1">Newsroom</h2>
            <p className="text-sm text-brand-muted">
              For news tips, press releases, and story pitches:
            </p>
            <a
              href="mailto:newsroom@zimbabwenewsonline.com"
              className="text-sm text-brand-red hover:underline"
            >
              newsroom@zimbabwenewsonline.com
            </a>
          </div>
          <div>
            <h2 className="text-base font-bold mb-1">Editorial Complaints</h2>
            <p className="text-sm text-brand-muted">
              To raise a concern about an article or our editorial standards:
            </p>
            <a
              href="mailto:editor@zimbabwenewsonline.com"
              className="text-sm text-brand-red hover:underline"
            >
              editor@zimbabwenewsonline.com
            </a>
          </div>
          <div>
            <h2 className="text-base font-bold mb-1">Advertising</h2>
            <p className="text-sm text-brand-muted">For advertising and partnership enquiries:</p>
            <a
              href="mailto:ads@zimbabwenewsonline.com"
              className="text-sm text-brand-red hover:underline"
            >
              ads@zimbabwenewsonline.com
            </a>
          </div>
          <div>
            <h2 className="text-base font-bold mb-1">Corrections</h2>
            <p className="text-sm text-brand-muted">
              To request a correction, visit our{' '}
              <a href="/corrections" className="text-brand-red hover:underline">
                Corrections page
              </a>.
            </p>
          </div>
        </div>

        {/* Simple contact form placeholder */}
        <div className="bg-brand-gray p-6">
          <h2 className="text-base font-bold mb-4">Send a Message</h2>
          <form className="space-y-3" action="#" method="POST">
            <div>
              <label htmlFor="name" className="block text-xs font-semibold mb-1">
                Your Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red bg-white"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-xs font-semibold mb-1">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red bg-white"
              />
            </div>
            <div>
              <label htmlFor="subject" className="block text-xs font-semibold mb-1">
                Subject
              </label>
              <input
                id="subject"
                name="subject"
                type="text"
                required
                className="w-full border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red bg-white"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-xs font-semibold mb-1">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                className="w-full border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red bg-white resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-brand-red text-white py-2.5 text-sm font-bold hover:bg-red-700 transition-colors"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
