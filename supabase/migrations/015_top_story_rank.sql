-- ── Top Story Rank ─────────────────────────────────────────────────────────
-- Allows editors to manually pin up to 6 articles as Top Stories.
-- NULL  = not a top story (default).
-- 1–6   = ranked position (1 is highest priority).
-- The partial unique index enforces one article per rank slot.

ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS top_story_rank integer
    CHECK (top_story_rank >= 1 AND top_story_rank <= 6);

-- One article per rank slot (NULL values are excluded from uniqueness check)
CREATE UNIQUE INDEX IF NOT EXISTS articles_top_story_rank_unique
  ON articles (top_story_rank)
  WHERE top_story_rank IS NOT NULL;

-- Fast lookup for homepage query
CREATE INDEX IF NOT EXISTS articles_top_story_rank_idx
  ON articles (top_story_rank)
  WHERE top_story_rank IS NOT NULL AND status = 'PUBLISHED';
