'use client'

import { useState } from 'react'

type State = 'idle' | 'submitting' | 'success' | 'error'

export function NewsletterForm() {
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
    <div className="rounded-xl overflow-hidden shadow-md">
      {/* Card header — gradient */}
      <div className="bg-granite-gradient px-5 py-4">
        <p className="text-xs font-bold uppercase tracking-widest text-granite-accent mb-1">
          Newsletter
        </p>
        <h3 className="font-black text-base text-white leading-snug">
          Zimbabwe news in your inbox
        </h3>
      </div>

      {/* Card body */}
      <div className="bg-white px-5 py-4 border border-t-0 border-granite-muted rounded-b-xl">
        <p className="text-xs text-gray-500 mb-4 leading-relaxed">
          Get the biggest stories delivered daily. Unsubscribe at any time.
        </p>

        {state === 'success' ? (
          <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            {message}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-2.5">
            <input
              name="email"
              type="email"
              required
              placeholder="your@email.com"
              disabled={state === 'submitting'}
              className="w-full border border-granite-muted rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-granite-primary/40 focus:border-granite-primary disabled:opacity-50 transition-colors"
            />
            {state === 'error' && (
              <p className="text-xs text-red-600">{message}</p>
            )}
            <button
              type="submit"
              disabled={state === 'submitting'}
              className="w-full bg-granite-gradient text-white text-sm font-semibold rounded-lg py-2.5 hover:brightness-110 active:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-granite-primary/50 focus:ring-offset-2"
            >
              {state === 'submitting' ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                  </svg>
                  Subscribing…
                </span>
              ) : 'Subscribe Free'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}