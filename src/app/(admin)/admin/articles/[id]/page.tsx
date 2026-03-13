import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { requireAuth } from '@/lib/auth/guards'
import {
  getArticleForEdit,
  getArticleTagIds,
  getCategoriesForForm,
  getTagsForForm,
  getAuthorsForForm,
} from '@/lib/admin/articles/queries'
import { updateArticleAction } from '@/app/(admin)/admin/articles/actions'
import { ArticleForm } from '@/components/admin/articles/ArticleForm'
import { ArticleStatusActions } from '@/components/admin/articles/ArticleStatusActions'

export const metadata: Metadata = { title: 'Edit Article — Admin' }

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditArticlePage({ params }: Props) {
  const { id } = await params

  const [{ user, role }, article, tagIds, categories, tags, authors] = await Promise.all([
    requireAuth(),
    getArticleForEdit(id),
    getArticleTagIds(id),
    getCategoriesForForm(),
    getTagsForForm(),
    getAuthorsForForm(),
  ])

  if (!article) notFound()

  const boundSave = updateArticleAction.bind(null, id)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black">Edit Article</h1>
          <p className="text-xs font-mono text-brand-muted mt-0.5">{article.slug}</p>
        </div>

        <ArticleStatusActions
          articleId={article.id}
          currentStatus={article.status}
          role={role}
        />
      </div>

      <ArticleForm
        saveAction={boundSave}
        article={article}
        selectedTagIds={tagIds}
        categories={categories}
        tags={tags}
        authors={authors}
        currentUserId={user.id}
        userRole={role}
        mode="edit"
      />
    </div>
  )
}
