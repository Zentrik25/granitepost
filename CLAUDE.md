# CLAUDE.md — Zimbabwe News Online

## Role
You are a Staff Engineer + Architect building a production-grade Zimbabwe news platform with BBC-style information architecture, strong SEO, secure admin CMS, and clean long-term maintainability.

## Stack (LOCKED)
- Next.js 15+ App Router
- TypeScript
- Tailwind CSS
- Supabase: Postgres, Auth, Storage, RLS
- Hosting: Vercel + Cloudflare

## Product scope (current phase)
Build a production-grade editorial news platform without AI features, scraping, queues, cron workers, or background automation in this phase.

## Non-negotiables
- Server-rendered article pages with working Open Graph and Twitter card metadata for WhatsApp previews
- Canonical URLs
- JSON-LD NewsArticle on article pages
- robots metadata appropriate for indexing and Discover eligibility
- RSS feed
- sitemap.xml
- news-sitemap.xml covering recent published articles
- Strict RLS on all tables
- RBAC roles: ADMIN, EDITOR, AUTHOR, MODERATOR
- Public side must only expose PUBLISHED content
- Admin area protected by middleware and server-side authorization checks
- No service role key in client code or browser-exposed envs
- No fake demo data unless explicitly requested for local-only development

## Architecture rules
- Use App Router route groups for `(public)` and `(admin)`
- Prefer Server Components by default
- Use Client Components only where interactivity requires them
- Keep mutations behind secure server actions or protected route handlers
- Centralize Supabase clients and auth helpers under `/lib/supabase/*`
- Centralize read queries under `/lib/queries/*`
- Centralize validation schemas under `/lib/validation/*`
- Centralize role and permission logic under `/lib/auth/*`
- Keep metadata generation close to routes where possible
- Use `next/image` consistently
- Hero/news images must support 16:9 rendering
- Article OG images must be at least 1200px wide
- Use ISR/revalidation intentionally for homepage, category, and article pages

## Domain model expectations
Core entities should be designed explicitly and consistently:
- profiles/users
- roles
- articles
- article_revisions or editorial history
- categories
- tags
- article_tags
- media_assets
- comments
- moderation actions
- newsletters or subscribers
- audit_logs
- homepage featured placements / editorial ordering

Do not invent new domain entities casually. Reuse and extend the core model deliberately.

## Database rules
- Any schema change must include migration SQL
- Any access-sensitive table must include RLS policies
- Add indexes for critical lookups and joins
- Document foreign keys and delete/update behavior
- Call out breaking changes explicitly
- Prefer additive schema evolution over destructive changes
- Keep local seeds separate from production assumptions

## Admin CMS rules
- Support clear editorial states such as DRAFT, REVIEW, PUBLISHED, ARCHIVED if included
- Publishing permissions must follow role rules
- Slugs must be unique and stable
- Media uploads must be validated
- Admin analytics, comments moderation, newsletters, and settings should be organized as separate admin modules
- Audit important admin actions

## Security rules
- Validate all input at boundaries
- Enforce authorization on the server, never only in UI
- Add rate limiting where abuse is plausible
- Add deduplication/idempotency where repeated submissions are possible
- Record audit logs for security-sensitive or editorially important actions
- Never leak private admin data to public queries
- Never trust client-provided role information

## SEO rules
- Every indexable public route must have canonical metadata
- Article pages must include NewsArticle structured data
- Category and tag pages must have indexability considered intentionally
- Sitemap output must include only canonical public URLs
- News sitemap must only include eligible recent published content
- Ensure metadata is generated server-side and matches route content

## Engineering discipline
For any non-trivial task:
1. Start with a short implementation plan
2. List files to create or modify
3. Explain dependencies or schema impact
4. Write code
5. Verify correctness before declaring complete

Do not jump into code for multi-step architecture work without a plan.

## Completion checklist
Before marking work complete, verify:
- TypeScript consistency
- imports and file paths
- server/client boundary correctness
- auth and authorization logic
- schema/query compatibility
- metadata/SEO requirements
- no fake placeholders unless explicitly noted
- no insecure env usage
- no broken public/admin separation

## Output format
When asked to build a feature, respond with:
1. Files to create/change
2. Plan
3. Implementation
4. Security checks
5. SEO checks
6. Any migration or environment notes