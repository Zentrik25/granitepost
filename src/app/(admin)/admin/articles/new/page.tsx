import type { Metadata } from 'next'
import { ArticleForm } from '@/components/admin/articles/ArticleForm'
import { getCategoriesForForm, getTagsForForm } from '@/lib/admin/articles/queries'
import { createArticleAction } from '@/app/(admin)/admin/articles/actions'

export const metadata: Metadata = { title: 'New Article — Admin' }

export default async function NewArticlePage() {
  const [categories, tags] = await Promise.all([
    getCategoriesForForm(),
    getTagsForForm(),
  ])

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black">New Article</h1>
      <ArticleForm
        saveAction={createArticleAction}
        categories={categories}
        tags={tags}
        mode="create"
      />
    </div>
  )
}
