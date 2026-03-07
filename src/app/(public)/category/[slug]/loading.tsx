import { ArticleCardSkeleton } from '@/components/ui/Skeleton'

export default function CategoryLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="animate-pulse border-b-2 border-granite-muted mb-6 pb-3 space-y-2">
        <div className="h-7 w-48 bg-granite-muted rounded-sm" />
        <div className="h-3 w-64 bg-granite-muted rounded-sm" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <ArticleCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}