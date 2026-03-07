import {
  ArticleCardSkeleton,
  ArticleCardCompactSkeleton,
  HeroSkeleton,
} from '@/components/ui/Skeleton'

export default function HomeLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-10">
      {/* Hero + compact sidebar */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:gap-6">
        <div className="lg:col-span-2">
          <HeroSkeleton />
        </div>
        <div className="border-t lg:border-t-0 lg:border-l border-granite-muted pt-4 lg:pt-0 lg:pl-6 mt-4 lg:mt-0 space-y-0">
          <div className="animate-pulse h-3 w-20 bg-granite-muted rounded-sm mb-2" />
          {Array.from({ length: 5 }).map((_, i) => (
            <ArticleCardCompactSkeleton key={i} />
          ))}
        </div>
      </section>

      {/* Top stories grid */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <ArticleCardSkeleton key={i} />
          ))}
        </div>
      </section>

      {/* Category blocks + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <ArticleCardSkeleton key={i} />
          ))}
        </div>
        <aside className="lg:col-span-1">
          <div className="animate-pulse space-y-3">
            <div className="h-3 w-20 bg-granite-muted rounded-sm mb-4" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="h-6 w-5 bg-granite-muted rounded-sm flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-full bg-granite-muted rounded-sm" />
                  <div className="h-3 w-4/5 bg-granite-muted rounded-sm" />
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* Latest feed */}
      <section>
        <div className="h-3 w-24 bg-granite-muted animate-pulse rounded-sm mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <ArticleCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </div>
  )
}