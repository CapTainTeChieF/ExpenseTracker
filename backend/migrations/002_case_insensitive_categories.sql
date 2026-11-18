-- Iteration 2: prevent duplicate category labels differing only by case.
-- If a pre-existing user already has both "Food" and "food", resolve duplicates
-- before running this migration. The migration script rolls back on failure.
CREATE UNIQUE INDEX IF NOT EXISTS uq_categories_user_kind_lower_name
ON categories (user_id, kind, LOWER(name));
