'use client'

import type { ViewsChartPoint } from '@/lib/admin/analytics/types'

interface Props {
  data: ViewsChartPoint[]
  label?: string
}

// Pure SVG bar chart — no external dependencies.
// viewBox is fixed; width="100%" makes it responsive.

const W = 800
const H = 260
const PAD = { top: 20, right: 20, bottom: 52, left: 56 }
const CHART_W = W - PAD.left - PAD.right
const CHART_H = H - PAD.top - PAD.bottom
const GRID_LINES = 4

function niceMax(raw: number): number {
  if (raw === 0) return 10
  const magnitude = Math.pow(10, Math.floor(Math.log10(raw)))
  const normalized = raw / magnitude
  const nice = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10
  return nice * magnitude
}

export function ViewsChart({ data, label = 'Views Over Time' }: Props) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <p className="text-sm font-bold text-gray-800 mb-4">{label}</p>
        <p className="text-gray-400 text-sm text-center py-12">No data for this period.</p>
      </div>
    )
  }

  const maxVal = niceMax(Math.max(...data.map((d) => d.views)))
  const barCount = data.length
  const barSlotW = CHART_W / barCount
  const barW = Math.max(2, barSlotW * 0.7)
  const barGap = (barSlotW - barW) / 2

  // Show every Nth x-axis label to prevent crowding
  const labelEvery = barCount <= 7 ? 1 : barCount <= 14 ? 2 : barCount <= 30 ? 5 : 7

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-6">
      <p className="text-sm font-bold text-gray-800 mb-4">{label}</p>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        aria-label={label}
        role="img"
        style={{ display: 'block' }}
      >
        {/* Grid lines + y-axis labels */}
        {Array.from({ length: GRID_LINES + 1 }, (_, i) => {
          const frac = i / GRID_LINES
          const yVal = Math.round(maxVal * frac)
          const yPx = PAD.top + CHART_H - frac * CHART_H
          return (
            <g key={i}>
              <line
                x1={PAD.left}
                x2={PAD.left + CHART_W}
                y1={yPx}
                y2={yPx}
                stroke="#e5e7eb"
                strokeWidth={1}
              />
              <text
                x={PAD.left - 6}
                y={yPx}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize={11}
                fill="#9ca3af"
              >
                {yVal.toLocaleString()}
              </text>
            </g>
          )
        })}

        {/* Bars + x-axis labels */}
        {data.map((point, i) => {
          const barH = maxVal === 0 ? 0 : (point.views / maxVal) * CHART_H
          const x = PAD.left + i * barSlotW + barGap
          const y = PAD.top + CHART_H - barH
          const showLabel = i % labelEvery === 0 || i === barCount - 1

          return (
            <g key={point.day}>
              {/* Bar */}
              <rect
                x={x}
                y={y}
                width={barW}
                height={Math.max(0, barH)}
                fill="#dc2626"
                rx={2}
                opacity={0.85}
              >
                <title>{`${point.label}: ${point.views.toLocaleString()} views`}</title>
              </rect>

              {/* Value label on hover-friendly tall bars */}
              {barH > 24 && (
                <text
                  x={x + barW / 2}
                  y={y + 14}
                  textAnchor="middle"
                  fontSize={10}
                  fill="white"
                  fontWeight={600}
                >
                  {point.views > 999
                    ? `${(point.views / 1000).toFixed(1)}k`
                    : point.views}
                </text>
              )}

              {/* X-axis label */}
              {showLabel && (
                <text
                  x={x + barW / 2}
                  y={PAD.top + CHART_H + 16}
                  textAnchor="middle"
                  fontSize={10}
                  fill="#6b7280"
                >
                  {point.label}
                </text>
              )}
            </g>
          )
        })}

        {/* X-axis baseline */}
        <line
          x1={PAD.left}
          x2={PAD.left + CHART_W}
          y1={PAD.top + CHART_H}
          y2={PAD.top + CHART_H}
          stroke="#d1d5db"
          strokeWidth={1}
        />
      </svg>
    </div>
  )
}