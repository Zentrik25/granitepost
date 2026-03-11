-- ============================================================
-- 017_category_depth_constraint.sql
-- Enforce maximum one level of subcategory nesting.
-- Prevents creating a subcategory of a subcategory (grandchildren).
-- Depends on: 002_taxonomy.sql (categories table)
-- ============================================================

CREATE OR REPLACE FUNCTION check_category_depth()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.parent_id IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM categories WHERE id = NEW.parent_id AND parent_id IS NOT NULL
    ) THEN
      RAISE EXCEPTION
        'Category nesting is limited to one level. '
        'Cannot create a subcategory of an existing subcategory (id: %).',
        NEW.parent_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_categories_depth_check
  BEFORE INSERT OR UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION check_category_depth();
