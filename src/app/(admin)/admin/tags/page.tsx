import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { TagManager } from '@/components/admin/TagManager'

export const metadata: Metadata = { title: 'Tags — Admin' }
export const revalidate = 60

export default async function AdminTagsPage() {
  const supabase = await createClient()
  const { data: tags } = await supabase
    .from('tags')
    .select('id, name, slug, created_at')
    .order('name', { ascending: true })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black">Tags</h1>
      <TagManager tags={tags ?? []} />
    </div>
  )
}
