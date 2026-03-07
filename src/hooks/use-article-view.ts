'use client'

import { useEffect, useRef } from 'react'

// Tracks a single article view via POST /api/views.
// Fires once per component mount; silently fails on error.
export function useArticleView(articleId: string) {
  const tracked = useRef(false)

  useEffect(() => {
    if (tracked.current) return
    tracked.current = true

    fetch('/api/views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ articleId }),
    }).catch(() => {
      // Analytics should never break the page
    })
  }, [articleId])
}
