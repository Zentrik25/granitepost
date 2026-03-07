import { ArticleBodySkeleton, SidebarSkeleton } from '@/components/ui/Skeleton'

export default function ArticleLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Article column */}
        <div className="lg:col-span-3">
          {/* Breadcrumb */}
          <div className="animate-pulse flex gap-2 mb-4">
            <div className="h-3 w-10 bg-granite-muted rounded-sm" />
            <div className="h-3 w-3 bg-granite-muted rounded-sm" />
            <div className="h-3 w-20 bg-granite-muted rounded-sm" />
          </div>
          {/* Category badge */}
          <div className="animate-pulse h-5 w-16 bg-granite-muted rounded-sm mb-3" />
          <ArticleBodySkeleton />
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="sticky top-32 space-y-6">
            <SidebarSkeleton />
          </div>
        </aside>
      </div>
    </div>
  )
}