CREATE EXTENSION IF NOT EXISTS "pgcrypto";

ALTER TABLE budgets
  DROP CONSTRAINT IF EXISTS budgets_user_month_category_uniq;

DROP INDEX IF EXISTS budgets_user_month_category_uniq;

ALTER TABLE budgets
  ADD CONSTRAINT budgets_user_month_category_uniq
  UNIQUE NULLS NOT DISTINCT (user_id, month, category_id);

CREATE INDEX IF NOT EXISTS idx_transactions_user_date
  ON transactions(user_id, occurred_on DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_transactions_user_type_category_date
  ON transactions(user_id, type, category_id, occurred_on DESC)
  WHERE deleted_at IS NULL;
