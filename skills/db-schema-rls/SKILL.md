---
name: db-schema-rls
description: Use when creating or modifying Supabase Postgres schema, indexes, constraints, RLS policies, or RPC functions for analytics/RBAC in the news platform.
allowed-tools: Read, Grep, Glob, Bash
---

## Non-negotiables
- RLS ON for every table.
- Public can read only PUBLISHED articles and related public data.
- Staff writes must be role-gated (ADMIN/EDITOR/AUTHOR/MODERATOR).
- No policy should rely on client-supplied role claims without server verification patterns.

## Required tables
profiles, user_roles, categories, tags, articles, article_tags, media, article_media(optional),
article_views_daily, comments, comment_actions, newsletter_subscribers, site_settings, audit_logs

## Required indexes
- user_roles(user_id)
- articles(status, published_at desc)
- articles(slug unique), categories(slug unique), tags(slug unique)
- comments(status, created_at desc)
- article_views_daily(article_id, day)
- newsletter_subscribers(email unique)

## Required functions
- is_admin / is_editor / is_author / is_moderator
- analytics RPCs: most_read_24h, most_read_7d, views_series(range), top_articles(range)

## Output style
- Provide SQL in a single migration-ready block.
- Provide RLS in a single block.
- Use explicit GRANT/REVOKE only when needed; prefer policies.

## References
Use references/schema.sql, rls.sql, rpc.sql as the baseline. Load only when asked to output full SQL.
