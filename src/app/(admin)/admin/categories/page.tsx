import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { CategoryManager } from '@/components/admin/CategoryManager'

export const metadata: Metadata = { title: 'Categories — Admin' }
export const revalidate = 60

export default async function AdminCategoriesPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, description, parent_id, display_order, seo_title, seo_description, is_active, created_at, updated_at')
    .order('display_order', { ascending: true })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black">Categories</h1>
      <CategoryManager categories={categories ?? []} />
    </div>
  )
}
