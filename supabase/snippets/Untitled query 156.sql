-- ============================================================
-- 011_optimize_most_read_rpcs.sql
-- Rewrite most_read_24h and most_read_7d to drive from
-- article_views_daily instead of scanning all published articles.
--
-- Old approach: FROM articles LEFT JOIN article_views_daily
--   → full scan of every published article, GROUP BY all of them,
--     then filter/sort. Cost grows O(total articles).
--
-- New approach: FROM article_views_daily JOIN articles
--   → only rows with actual views in the window are processed.
--     Cost grows O(active articles in window), not total articles.
--     Articles with zero views in the period are correctly absent.
-- ============================================================

CREATE OR REPLACE FUNCTION most_read_24h(p_limit int DEFAULT 5)
RETURNS TABLE (
  article_id     uuid,
  title          text,
  slug           text,
  hero_image_url text,
  total_views    bigint
)
LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT
    a.id           AS article_id,
    a.title,
    a.slug,
    a.hero_image_url,
    SUM(v.view_count) AS total_views
  FROM article_views_daily v
  JOIN articles a ON a.id = v.article_id
  WHERE v.day >= current_date - INTERVAL '1 day'
    AND a.status = 'PUBLISHED'
  GROUP BY a.id, a.title, a.slug, a.hero_image_url
  ORDER BY total_views DESC, a.published_at DESC
  LIMIT p_limit;
$$;

CREATE OR REPLACE FUNCTION most_read_7d(p_limit int DEFAULT 10)
RETURNS TABLE (
  article_id     uuid,
  title          text,
  slug           text,
  hero_image_url text,
  total_views    bigint
)
LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT
    a.id           AS article_id,
    a.title,
    a.slug,
    a.hero_image_url,
    SUM(v.view_count) AS total_views
  FROM article_views_daily v
  JOIN articles a ON a.id = v.article_id
  WHERE v.day >= current_date - INTERVAL '7 days'
    AND a.status = 'PUBLISHED'
  GROUP BY a.id, a.title, a.slug, a.hero_image_url
  ORDER BY total_views DESC, a.published_at DESC
  LIMIT p_limit;
$$;

-- Grants unchanged — these are public RPCs.
GRANT EXECUTE ON FUNCTION most_read_24h(int) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION most_read_7d(int)  TO anon, authenticated;