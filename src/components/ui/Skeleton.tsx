function SkeletonBox({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-granite-muted rounded-sm ${className ?? ''}`} />
  )
}

export function ArticleCardSkeleton() {
  return (
    <div>
      <SkeletonBox className="aspect-[16/9] w-full mb-3" />
      <SkeletonBox className="h-3 w-16 mb-2" />
      <SkeletonBox className="h-4 w-full mb-1.5" />
      <SkeletonBox className="h-4 w-4/5 mb-1.5" />
      <SkeletonBox className="h-3 w-24 mt-2" />
    </div>
  )
}

export function ArticleCardCompactSkeleton() {
  return (
    <div className="flex gap-3 py-3 border-b border-granite-muted last:border-0">
      <SkeletonBox className="w-20 h-16 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <SkeletonBox className="h-3 w-16" />
        <SkeletonBox className="h-4 w-full" />
        <SkeletonBox className="h-4 w-3/4" />
      </div>
    </div>
  )
}

export function HeroSkeleton() {
  return (
    <div className="animate-pulse">
      <SkeletonBox className="aspect-[16/9] w-full" />
    </div>
  )
}

export function ArticleBodySkeleton() {
  return (
    <div className="animate-pulse space-y-4 mt-6">
      <SkeletonBox className="h-8 w-3/4 mb-2" />
      <SkeletonBox className="h-8 w-full mb-6" />
      <SkeletonBox className="aspect-[16/9] w-full mb-6" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <SkeletonBox className="h-4 w-full" />
          <SkeletonBox className="h-4 w-full" />
          <SkeletonBox className="h-4 w-5/6" />
        </div>
      ))}
    </div>
  )
}

export function SidebarSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      <SkeletonBox className="h-4 w-24 mb-4" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-3 items-start">
          <SkeletonBox className="h-6 w-5 flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <SkeletonBox className="h-3.5 w-full" />
            <SkeletonBox className="h-3.5 w-4/5" />
          </div>
        </div>
      ))}
    </div>
  )
}