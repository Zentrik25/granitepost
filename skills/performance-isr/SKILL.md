---
name: performance-isr
description: Use when optimizing performance: ISR revalidate strategy, caching queries, image optimization standards, and fast BBC-style page composition.
---

## ISR rules
- Homepage: revalidate (e.g., 60-180s)
- Category: revalidate (e.g., 120-300s)
- Article: revalidate (e.g., 300s) + on-demand revalidate hook later

## Images
- Use next/image everywhere.
- Enforce 16:9 for hero.
- OG image must be >=1200px wide.

## Output
- Specify where caching happens (fetch cache tags / revalidateTag / stable query funcs).
- Keep pages server-first; avoid unnecessary client hydration.
