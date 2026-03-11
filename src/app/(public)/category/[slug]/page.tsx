import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ArticleCard } from "@/components/ui/ArticleCard"
import { Pagination } from "@/components/ui/Pagination"
import { EmptyState } from "@/components/ui/EmptyState"
import { SubcategoryFilterBar } from "@/components/category/SubcategoryFilterBar"
import { CategoryBreadcrumb } from "@/components/ui/CategoryBreadcrumb"
import {
  getCategoryBySlug,
  getCategoryById,
  getSubcategoriesByParentId,
} from "@/lib/queries/categories"
import { getArticlesByCategory } from "@/lib/queries/articles"
import type { ArticleWithRelations } from "@/types"
import { buildBreadcrumbSchema, buildWebPageSchema, toJsonLd } from "@/lib/seo/schema"

export const revalidate = 120

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://zimbabwenewsonline.com"
const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "Zimbabwe News Online"

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) return {}

  const isSubcategory = !!category.parent_id
  const url = `${siteUrl}/category/${slug}`

  let title = category.seo_title ?? category.name
  let description =
    category.seo_description ??
    category.description ??
    `Latest ${category.name} news from Zimbabwe.`

  if (isSubcategory && category.parent_id) {
    const parent = await getCategoryById(category.parent_id)
    if (parent) {
      title = category.seo_title ?? `${category.name} — ${parent.name}`
      description =
        category.seo_description ??
        category.description ??
        `${category.name} news and updates from Zimbabwe, in the ${parent.name} section.`
    }
  }

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", url, title, description, siteName },
    twitter: { card: "summary", title, description },
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? "1", 10))

  const category = await getCategoryBySlug(slug)
  if (!category) notFound()

  const isSubcategory = !!category.parent_id

  const [result, parent, subcategories] = await Promise.all([
    getArticlesByCategory(slug, page, 12),
    isSubcategory && category.parent_id
      ? getCategoryById(category.parent_id)
      : Promise.resolve(null),
    !isSubcategory
      ? getSubcategoriesByParentId(category.id)
      : Promise.resolve([]),
  ])

  const categoryUrl = `${siteUrl}/category/${slug}`

  const breadcrumbItems =
    isSubcategory && parent
      ? [
          { name: "Home", url: siteUrl },
          { name: parent.name, url: `${siteUrl}/category/${parent.slug}` },
          { name: category.name, url: categoryUrl },
        ]
      : [
          { name: "Home", url: siteUrl },
          { name: category.name, url: categoryUrl },
        ]

  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbItems)
  const webPageSchema = buildWebPageSchema({
    name: category.name,
    url: categoryUrl,
    description: category.description,
    siteUrl,
    siteName,
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(webPageSchema) }}
      />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {isSubcategory && parent && (
          <div className="mb-3">
            <CategoryBreadcrumb parent={parent} current={category} />
          </div>
        )}

        <div className="border-b-2 border-granite-primary mb-4 pb-3">
          <h1 className="text-2xl md:text-3xl font-black">{category.name}</h1>
          {category.description && (
            <p className="text-brand-muted text-sm mt-1">{category.description}</p>
          )}
        </div>

        {!isSubcategory && subcategories.length > 0 && (
          <div className="mb-6">
            <SubcategoryFilterBar
              subcategories={subcategories}
              activeSlug={null}
              parentSlug={category.slug}
            />
          </div>
        )}

        {isSubcategory && parent && (
          <SiblingFilterBar
            parentSlug={parent.slug}
            parentId={parent.id}
            activeSlug={category.slug}
          />
        )}

        {result.data.length === 0 ? (
          <EmptyState
            title="No articles yet"
            description={`There are no published articles in ${category.name} yet. Check back soon.`}
            action={{ label: "Back to home", href: "/" }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(result.data as ArticleWithRelations[]).map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}

        <Pagination
          page={page}
          hasMore={result.hasMore}
          buildHref={(p) => `/category/${slug}?page=${p}`}
        />
      </div>
    </>
  )
}

async function SiblingFilterBar({
  parentSlug,
  parentId,
  activeSlug,
}: {
  parentSlug: string
  parentId: string
  activeSlug: string
}) {
  const { getSubcategoriesByParentId: getSubs } = await import("@/lib/queries/categories")
  const siblings = await getSubs(parentId)
  if (siblings.length === 0) return null

  return (
    <div className="mb-6">
      <SubcategoryFilterBar
        subcategories={siblings}
        activeSlug={activeSlug}
        parentSlug={parentSlug}
      />
    </div>
  )
}
