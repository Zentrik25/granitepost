import type { ReactNode } from 'react'

interface SectionDividerProps {
  /** Section label text */
  label: string
  /** Tailwind gradient classes e.g. "from-red-900 via-red-800 to-red-700" */
  gradient: string
  /** Use white rules and lighter treatment for dark-background sections */
  dark?: boolean
  /** Optional right-side slot — used for "See all →" links */
  endSlot?: ReactNode
  className?: string
}

/**
 * Full-width editorial divider with a centered gradient label.
 * The label pill sits on the horizontal rule line.
 *
 * Pattern:
 *   ─────────── [ SECTION NAME ] ─────────────  [endSlot]
 */
export function SectionDivider({
  label,
  gradient,
  dark = false,
  endSlot,
  className = '',
}: SectionDividerProps) {
  const rule = dark ? 'bg-white/20' : 'bg-gray-200'

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Centered label between two rules */}
      <div className="flex flex-1 items-center">
        <div className={`h-px flex-1 ${rule}`} />
        <h2
          className={`mx-4 bg-gradient-to-r ${gradient} px-5 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-white`}
        >
          {label}
        </h2>
        <div className={`h-px flex-1 ${rule}`} />
      </div>

      {/* Right-side slot e.g. "See all →" */}
      {endSlot}
    </div>
  )
}
