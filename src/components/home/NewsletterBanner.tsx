'use client'

import { useState } from 'react'

type State = 'idle' | 'submitting' | 'success' | 'error'

export function NewsletterBanner() {
  const [state, setState] = useState<State>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setState('submitting')
    setMessage('')

    const email = (new FormData(e.currentTarget).get('email') as string).trim()

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const json = await res.json()
      if (!res.ok) {
        setState('error')
        setMessage(json.error ?? 'Failed to subscribe.')
      } else {
        setState('success')
        setMessage(json.message ?? 'Subscribed! Check your email to confirm.')
      }
    } catch {
      setState('error')
      setMessage('Network error. Please try again.')
    }
  }

  return (
    <section
      aria-label="Newsletter signup"
      className="relative overflow-hidden rounded-2xl"
      style={{ background: 'linear-gradient(135deg, #142B6F 0%, #0D1E50 100%)' }}
    >
      {/* Decorative background shape */}
      <div
        className="absolute -right-16 -top-16 w-64 h-64 rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #ffffff 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center px-6 py-8 md:px-10 md:py-10">
        {/* Copy */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-yellow-300 mb-2">
            Free Newsletter
          </p>
          <h2 className="text-2xl md:text-3xl font-black text-white leading-tight mb-3">
            Get Zimbabwe's biggest stories in your inbox
          </h2>
          <p className="text-sm text-white/65 leading-relaxed">
            Daily briefings on politics, business, sport, and entertainment. Join thousands of readers. Unsubscribe anytime.
          </p>
        </div>

        {/* Form */}
        <div>
          {state === 'success' ? (
            <div className="flex items-start gap-3 bg-white/10 rounded-xl px-5 py-4 border border-white/20">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-green-300 flex-shrink-0 mt-0.5" aria-hidden="true">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-white/90 leading-relaxed">{message}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex gap-2">
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="your@email.com"
                  disabled={state === 'submitting'}
                  className="flex-1 min-w-0 bg-white/10 border border-white/25 rounded-xl px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white/50 disabled:opacity-50 transition-colors"
                />
                <button
                  type="submit"
                  disabled={state === 'submitting'}
                  className="shrink-0 px-5 py-3 bg-white text-granite-primary text-sm font-bold rounded-xl hover:bg-gray-100 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 shadow-sm"
                >
                  {state === 'submitting' ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                      </svg>
                      <span className="hidden sm:inline">Subscribing…</span>
                    </span>
                  ) : 'Subscribe'}
                </button>
              </div>
              {state === 'error' && (
                <p className="text-xs text-red-300">{message}</p>
              )}
              <p className="text-xs text-white/40">
                No spam. Unsubscribe at any time.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}