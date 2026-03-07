import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/utils/rate-limit'

// POST /api/newsletter/subscribe
// Body: { email: string }
// Rate limited: 3 req / 10 min per IP
export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const { allowed } = rateLimit(`newsletter:${ip}`, 3, 10 * 60_000)

  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429, headers: { 'Retry-After': '600' } })
  }

  let body: { email?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const email = body.email?.trim().toLowerCase()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'A valid email is required.' }, { status: 422 })
  }

  const supabase = await createClient()

  // Check if already subscribed
  const { data: existing } = await supabase
    .from('newsletter_subscribers')
    .select('id, confirmed, unsubscribed_at')
    .eq('email', email)
    .single()

  if (existing) {
    if (existing.confirmed && !existing.unsubscribed_at) {
      return NextResponse.json({ message: 'Already subscribed.' })
    }
    // Re-subscribe (reset unsubscribed_at)
    await supabase
      .from('newsletter_subscribers')
      .update({ unsubscribed_at: null, confirmed: false })
      .eq('id', existing.id)
    return NextResponse.json({ message: 'Welcome back! Please check your email to confirm.' })
  }

  const { error } = await supabase.from('newsletter_subscribers').insert({ email })

  if (error) {
    if (error.code === '23505') {
      // Unique constraint — race condition
      return NextResponse.json({ message: 'Already subscribed.' })
    }
    return NextResponse.json({ error: 'Failed to subscribe.' }, { status: 500 })
  }

  return NextResponse.json(
    { message: 'Subscribed! Please check your email to confirm.' },
    { status: 201 }
  )
}
