import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { SubcategoryManager } from '@/components/admin/SubcategoryManager'

export const metadata: Metadata = { title: 'Subcategories — Admin' }
export const revalidate = 0

export default async function AdminSubcategoriesPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, description, parent_id, display_order, seo_title, seo_description, is_active, created_at, updated_at')
    .order('display_order', { ascending: true })

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black">Subcategories</h1>
        <p className="text-sm text-gray-500 mt-1">
          Subcategories are categories with a parent. They inherit the parent's URL structure via /category/[slug].
        </p>
      </div>
      <SubcategoryManager categories={categories ?? []} />
    </div>
  )
}
