---
name: api-route-handlers
description: Use when creating Next.js route handlers for public and admin APIs: /api/views, /api/comments, /api/newsletter/*, /api/admin/* analytics/moderation/users/settings.
---

## Rules
- Validate inputs (zod).
- Enforce auth/role on admin endpoints.
- For public endpoints: rate limit + abuse controls where relevant.
- Return consistent JSON envelopes with error codes.

## Required endpoints (baseline)
- POST /api/views (dedupe + daily aggregation)
- POST /api/comments (create pending)
- POST /api/comments/[id]/moderate (admin/mod)
- POST /api/newsletter/subscribe
- GET  /api/newsletter/unsubscribe?token=
- GET  /api/admin/analytics/summary
- GET  /api/admin/analytics/top-articles?range=
- GET  /api/admin/analytics/views-series?range=
- CRUD: /api/admin/articles, /api/admin/categories, /api/admin/tags, /api/admin/media, /api/admin/users, /api/admin/settings
