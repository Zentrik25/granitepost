import Link from 'next/link'

interface CategoryBadgeProps {
  name: string
  /** If provided, wraps the badge in a Link */
  href?: string
  /**
   * default  — blue gradient pill (for light backgrounds)
   * accent   — yellow gradient pill (e.g. breaking news)
   * overlay  — blue gradient with semi-opaque bg (for use on dark image overlays)
   */
  variant?: 'default' | 'accent' | 'overlay'
  size?: 'sm' | 'md'
  className?: string
}

const base =
  'inline-flex items-center font-bold uppercase tracking-wide rounded-full transition-all duration-150 select-none'

const variants = {
  default:
    'bg-granite-gradient text-white hover:brightness-110 shadow-sm',
  accent:
    'bg-granite-accent-gradient text-granite-primary hover:brightness-105 shadow-sm',
  overlay:
    'bg-granite-primary/90 text-white hover:bg-granite-primary backdrop-blur-sm shadow-sm',
}

const sizes = {
  sm: 'text-[10px] px-2.5 py-0.5',
  md: 'text-xs px-3 py-1',
}

export function CategoryBadge({
  name,
  href,
  variant = 'default',
  size = 'sm',
  className = '',
}: CategoryBadgeProps) {
  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`

  if (href) {
    return (
      <Link href={href} className={classes}>
        {name}
      </Link>
    )
  }

  return <span className={classes}>{name}</span>
}