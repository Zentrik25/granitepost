import { CategoryBlock } from '@/components/home/CategoryBlock'
import type { CategoryBlockData } from '@/lib/db/queries'

interface Props {
  blocks: CategoryBlockData[]
  limitPerBlock?: number
}

export function CategoryBlocks({ blocks, limitPerBlock = 4 }: Props) {
  if (!blocks.length) return null

  return (
    <div className="space-y-10">
      {blocks.map(({ category, articles }) => (
        <CategoryBlock
          key={category.id}
          category={category}
          articles={articles}
          limit={limitPerBlock}
        />
      ))}
    </div>
  )
}
