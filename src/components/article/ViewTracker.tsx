'use client'

import { useEffect, useRef } from 'react'

interface ViewTrackerProps {
  articleId: string
}

// Fires a single POST to /api/views once per article per page load.
// Runs client-side so it doesn't block SSR.
export function ViewTracker({ articleId }: ViewTrackerProps) {
  const tracked = useRef(false)

  useEffect(() => {
    if (tracked.current) return
    tracked.current = true

    fetch('/api/views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ articleId }),
    }).catch(() => {
      // Silently fail — analytics should never break the page
    })
  }, [articleId])

  return null
}
