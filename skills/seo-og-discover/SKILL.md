---
name: seo-og-discover
description: Use when implementing SEO, WhatsApp/Twitter OG previews, canonical URLs, JSON-LD NewsArticle, robots meta for Google Discover, RSS, sitemap.xml, or news-sitemap.xml.
---

## WhatsApp preview requirements
- OG tags must be server-rendered on /article/[slug].
- og:image must be absolute URL and >= 1200px wide.
- Include: og:title, og:description, og:type=article, og:url, og:image (+ width/height), twitter:card=summary_large_image.

## Google/Discover requirements
- Canonical per article.
- JSON-LD NewsArticle with headline, image, datePublished, dateModified, author, publisher, mainEntityOfPage.
- robots meta: max-image-preview:large

## Sitemaps
- /sitemap.xml: all stable URLs.
- /news-sitemap.xml: only PUBLISHED in last 48h.
- /feed.xml RSS: latest PUBLISHED.

## Output
When asked to implement: list exact files under app/ (metadata.ts, route.ts, sitemap.ts patterns), plus tests/check steps.

## References
- references/og-tags-checklist.md
- references/jsonld-newsarticle.md
- references/sitemap-rss.md
Load only when needed.
