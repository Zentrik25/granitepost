'use client'

import { useState } from 'react'

export function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || state === 'loading') return
    setState('loading')
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed')
      setState('success')
      setMessage('Thanks! Check your inbox to confirm.')
      setEmail('')
    } catch (err) {
      setState('error')
      setMessage(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  return (
    <section
      aria-label="Newsletter signup"
      className="rounded-none py-10 px-6 md:px-12 text-center"
      style={{ background: '#1C2B3A' }}
    >
      <p className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">
        Stay Informed
      </p>
      <h2 className="text-2xl md:text-3xl font-black text-white mb-2 leading-tight">
        Zimbabwe&apos;s top stories in your inbox
      </h2>
      <p className="text-sm text-white/60 mb-6 max-w-md mx-auto">
        Get the most important news delivered every morning. No spam, unsubscribe anytime.
      </p>

      {state === 'success' ? (
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-amber-400 bg-amber-400/10 px-5 py-3 rounded-full">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          {message}
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto"
          noValidate
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            aria-label="Email address"
            className="flex-1 h-11 px-4 text-sm rounded-full text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white/10"
            style={{ border: '1px solid #2E4A62' }}
          />
          <button
            type="submit"
            disabled={state === 'loading'}
            className="h-11 px-6 text-sm font-bold rounded-full text-white shrink-0 transition-opacity disabled:opacity-60"
            style={{ background: 'linear-gradient(90deg, #C8820A, #F0A318)' }}
          >
            {state === 'loading' ? 'Sending…' : 'Subscribe'}
          </button>
        </form>
      )}

      {state === 'error' && (
        <p className="mt-3 text-xs text-red-400">{message}</p>
      )}
    </section>
  )
}
