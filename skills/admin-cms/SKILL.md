---
name: admin-cms
description: Use when building or extending the /admin CMS: auth, RBAC, dashboard analytics, articles CRUD workflow, media library, comments moderation, newsletter subscribers, settings, users/roles, audit logs.
---

## Admin scope
- /admin/login
- /admin dashboard with analytics tiles + charts
- Articles: DRAFT/PUBLISHED/ARCHIVED, featured/breaking controls
- Categories/tags management
- Media library: upload, alt, credits, reuse tracking
- Comments moderation: pending/approved/rejected/spam
- Newsletter: subscribe/unsubscribe token + export
- Settings: SEO defaults, socials, integrations placeholders
- Users/roles + audit logs

## Security rules
- All admin pages must enforce: middleware auth + server-side role checks.
- Never query privileged tables from client without server gate.

## Output
When implementing an admin feature:
1) Route(s)
2) Server data access path (RLS + RPC or server-only privileged action)
3) UI components and forms
4) Audit log event emitted
