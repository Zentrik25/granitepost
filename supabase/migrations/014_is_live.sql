-- Migration 014: Add is_live flag to articles
-- When is_live = true the article shows a live badge in the Latest Updates section.

ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS is_live boolean NOT NULL DEFAULT false;

-- Index for Latest Updates query (updated_at DESC with is_live prioritised)
CREATE INDEX IF NOT EXISTS idx_articles_updated_at
  ON articles (updated_at DESC)
  WHERE status = 'PUBLISHED';
