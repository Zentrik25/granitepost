-- Migration 013: Add is_featured flag to articles
-- Articles where is_featured = true appear in the hero carousel on the homepage.

ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;

-- Index for fast hero query
CREATE INDEX IF NOT EXISTS idx_articles_is_featured
  ON articles (is_featured, published_at DESC)
  WHERE is_featured = true AND status = 'PUBLISHED';

-- RLS: public read already covered by existing policy on articles.
-- Admin/Editor/Author can update is_featured via existing UPDATE policy.