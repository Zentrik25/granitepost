import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'

// POST /api/revalidate?secret=xxx&path=/article/my-slug
// Used by Supabase webhooks or admin triggers to invalidate ISR cache
export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')

  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
  }

  const path = request.nextUrl.searchParams.get('path')
  const tag = request.nextUrl.searchParams.get('tag')

  if (path) {
    revalidatePath(path)
    return NextResponse.json({ revalidated: true, path })
  }

  if (tag) {
    revalidateTag(tag)
    return NextResponse.json({ revalidated: true, tag })
  }

  return NextResponse.json({ error: 'path or tag required' }, { status: 400 })
}
