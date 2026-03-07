---
name: code-style
description: Use when writing or refactoring code to match project conventions: Next.js App Router patterns, TypeScript strict typing, Tailwind, and repository structure.
---

## Standards
- TypeScript strict; no any.
- Server components by default; client components only when needed.
- All DB access through /lib/db and /lib/queries.
- Use feature folders under /components (public/*, admin/*).
- Prefer small, composable components; no monolith pages.
