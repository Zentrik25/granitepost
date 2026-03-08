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
    <div className="rounded-xl overflow-hidden shadow-md" style={{ background: '#1C2B3A' }}>
      {/* Header */}
      <div className="px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#F0A318' }}>
          Newsletter
        </p>
        <h3 className="font-black text-base text-white leading-snug">
          Zimbabwe news in your inbox
        </h3>
        <p className="text-xs mt-1.5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
          Get the biggest stories delivered daily. Unsubscribe at any time.
        </p>
      </div>

      {/* Form body */}
      <div className="px-5 py-4">
        {state === 'success' ? (
          <p className="text-sm text-green-300 bg-green-900/30 border border-green-700/40 rounded-lg px-3 py-2">
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
              className="w-full rounded-lg text-sm px-3 py-2 bg-transparent text-white placeholder:text-white/40 focus:outline-none disabled:opacity-50 transition-colors"
              style={{ border: '1px solid #2E4A62' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#F0A318' }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#2E4A62' }}
            />
            {state === 'error' && (
              <p className="text-xs text-red-400">{message}</p>
            )}
            <button
              type="submit"
              disabled={state === 'submitting'}
              className="w-full text-white text-sm font-bold rounded-lg py-2.5 hover:brightness-110 active:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:ring-offset-2 focus:ring-offset-transparent shadow-sm"
              style={{ background: 'linear-gradient(90deg, #C8820A, #F0A318)' }}
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