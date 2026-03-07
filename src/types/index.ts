export * from './database'

// ── Page / component props ────────────────────────────────────────────────────
export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// ── Search ────────────────────────────────────────────────────────────────────
export interface SearchParams {
  query: string
  category?: string
  tag?: string
  page?: number
  limit?: number
}

// ── Navigation ────────────────────────────────────────────────────────────────
export interface NavItem {
  label: string
  href: string
  children?: NavItem[]
}
