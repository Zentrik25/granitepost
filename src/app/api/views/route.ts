import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/utils/rate-limit'

// ── Cookie deduplication ──────────────────────────────────────────────────────
// Cookie name: "avd"  (article view dedupe)
// Value format: "uuid1:expiresMs|uuid2:expiresMs|…"
// One counted view per article per device per 6-hour window.

const COOKIE_NAME = 'avd'
const DEDUPE_WINDOW_MS = 6 * 60 * 60 * 1_000 // 6 h
const MAX_ENTRIES = 40

function parseViewCookie(raw: string): Map<string, number> {
  const map = new Map<string, number>()
  const now = Date.now()
  for (const entry of raw.split('|')) {
    const sep = entry.lastIndexOf(':')
    if (sep === -1) continue
    const id = entry.slice(0, sep)
    const exp = parseInt(entry.slice(sep + 1), 10)
    if (id && !isNaN(exp) && exp > now) map.set(id, exp)
  }
  return map
}

function serializeViewCookie(map: Map<string, number>): string {
  return Array.from(map.entries())
    .map(([id, exp]) => `${id}:${exp}`)
    .join('|')
}

// ── Validation ────────────────────────────────────────────────────────────────

const bodySchema = z.object({
  // Zod v4: use .min(1) + .refine for UUID validation instead of deprecated .uuid()
  articleId: z
    .string()
    .min(1, 'articleId is required')
    .refine(
      (v) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v),
      { message: 'articleId must be a valid UUID' }
    ),
})

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // Rate limit by IP — 10 req / 60 s
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const { allowed } = rateLimit(`view:${ip}`, 10, 60_000)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  // Parse + validate body
  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(raw)
  if (!parsed.success) {
    // Zod v4: use .issues instead of .errors
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid request' },
      { status: 400 }
    )
  }

  const { articleId } = parsed.data

  // Cookie-based deduplication
  const cookieRaw = request.cookies.get(COOKIE_NAME)?.value ?? ''
  const viewed = parseViewCookie(cookieRaw)

  if (viewed.has(articleId)) {
    return NextResponse.json({ ok: true, counted: false })
  }

  // Verify the article is published before counting
  const supabase = await createClient()

  const { data: article } = await supabase
    .from('articles')
    .select('id')
    .eq('id', articleId)
    .eq('status', 'PUBLISHED')
    .single()

  if (!article) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Atomic increment via RPC (increments view_count + upserts article_views_daily)
  const { error: rpcError } = await supabase.rpc('record_article_view', {
    p_article_id: articleId,
  })

  if (rpcError) {
    console.error('[views] RPC error:', rpcError.message)
    return NextResponse.json({ error: 'Failed to record view' }, { status: 500 })
  }

  // Update dedup cookie — add this article, prune expired + over-cap entries
  viewed.set(articleId, Date.now() + DEDUPE_WINDOW_MS)

  if (viewed.size > MAX_ENTRIES) {
    const sorted = Array.from(viewed.entries()).sort((a, b) => b[1] - a[1])
    viewed.clear()
    for (const [k, v] of sorted.slice(0, MAX_ENTRIES)) viewed.set(k, v)
  }

  const response = NextResponse.json({ ok: true, counted: true })
  response.cookies.set(COOKIE_NAME, serializeViewCookie(viewed), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: Math.ceil(DEDUPE_WINDOW_MS / 1_000),
  })

  return response
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}