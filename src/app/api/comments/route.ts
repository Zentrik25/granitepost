import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/utils/rate-limit'
import crypto from 'crypto'

// POST /api/comments
// Body: { articleId, authorName, authorEmail, body, parentId? }
// Rate limited: 3 req / 5 min per IP
export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const { allowed } = rateLimit(`comment:${ip}`, 3, 5 * 60_000)

  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait before commenting again.' },
      { status: 429, headers: { 'Retry-After': '300' } }
    )
  }

  let body: {
    articleId?: string
    authorName?: string
    authorEmail?: string
    body?: string
    parentId?: string
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { articleId, authorName, authorEmail, body: commentBody, parentId } = body

  // Validate required fields
  if (!articleId || !authorName?.trim() || !authorEmail?.trim() || !commentBody?.trim()) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 422 })
  }

  // Basic email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authorEmail.trim())) {
    return NextResponse.json({ error: 'Invalid email address.' }, { status: 422 })
  }

  // Minimum body length
  if (commentBody.trim().length < 10) {
    return NextResponse.json({ error: 'Comment too short (min 10 characters).' }, { status: 422 })
  }

  // Maximum body length
  if (commentBody.trim().length > 2000) {
    return NextResponse.json({ error: 'Comment too long (max 2000 characters).' }, { status: 422 })
  }

  // Link spam cap — max 2 URLs
  const linkCount = (commentBody.match(/https?:\/\//gi) ?? []).length
  if (linkCount > 2) {
    return NextResponse.json({ error: 'Comments may not contain more than 2 links.' }, { status: 422 })
  }

  const supabase = await createClient()

  // Verify article exists and is published
  const { data: article } = await supabase
    .from('articles')
    .select('id')
    .eq('id', articleId)
    .eq('status', 'PUBLISHED')
    .single()

  if (!article) {
    return NextResponse.json({ error: 'Article not found.' }, { status: 404 })
  }

  // Hash email for IP tracking (SHA256)
  const ipHash = crypto
    .createHash('sha256')
    .update(ip + authorEmail.toLowerCase().trim())
    .digest('hex')

  const { error } = await supabase.from('comments').insert({
    article_id: articleId,
    author_name: authorName.trim().slice(0, 100),
    author_email: authorEmail.trim().toLowerCase(),
    body: commentBody.trim(),
    status: 'PENDING',
    parent_id: parentId ?? null,
    ip_hash: ipHash,
  })

  if (error) {
    return NextResponse.json({ error: 'Failed to submit comment.' }, { status: 500 })
  }

  return NextResponse.json(
    { message: 'Comment submitted and awaiting moderation.' },
    { status: 201 }
  )
}
