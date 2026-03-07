import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { MediaLibrary } from '@/components/admin/MediaLibrary'

export const metadata: Metadata = { title: 'Media Library — Admin' }
export const revalidate = 60

interface Props {
  searchParams: Promise<{ page?: string }>
}

export default async function AdminMediaPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1', 10))
  const limit = 24
  const from = (page - 1) * limit

  const supabase = await createClient()

  // Fetch one extra row so we can detect whether another page exists
  const { data: media, error } = await supabase
    .from('media')
    .select('*')
    .order('created_at', { ascending: false })
    .range(from, from + limit)

  if (error) {
    console.error('Failed to load media:', error)
  }

  const hasMore = (media?.length ?? 0) > limit
  const items = (media ?? []).slice(0, limit)

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black">Media Library</h1>
      <MediaLibrary
        items={items}
        page={page}
        hasMore={hasMore}
        total={items.length}
      />
    </div>
  )
}