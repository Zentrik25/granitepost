import type { Metadata } from 'next'
import { ArticleForm } from '@/components/admin/articles/ArticleForm'
import { getCategoriesForForm, getAuthorsForForm, getTopStorySlots } from '@/lib/admin/articles/queries'
import { createArticleAction } from '@/app/(admin)/admin/articles/actions'
import { requireAuth } from '@/lib/auth/guards'

export const metadata: Metadata = { title: 'New Article — Admin' }

export default async function NewArticlePage() {
  const [{ user, role }, categories, authors, topStorySlots] = await Promise.all([
    requireAuth(),
    getCategoriesForForm(),
    getAuthorsForForm(),
    getTopStorySlots(),
  ])

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black">New Article</h1>
      <ArticleForm
        saveAction={createArticleAction}
        categories={categories}
        authors={authors}
        topStorySlots={topStorySlots}
        currentUserId={user.id}
        userRole={role}
        mode="create"
      />
    </div>
  )
}
