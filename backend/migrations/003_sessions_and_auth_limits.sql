-- Step 5 - persistent session revocation and database-backed authorization endpoint throttling.
-- Additive migration: does not alter transaction/analytics contracts or drop user data.
CREATE TABLE IF NOT EXISTS auth_sessions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id ON auth_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_active ON auth_sessions(id, user_id) WHERE revoked_at IS NULL;
CREATE TABLE IF NOT EXISTS auth_rate_limits (
  bucket_key CHAR(64) PRIMARY KEY,
  hits INTEGER NOT NULL DEFAULT 0,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_auth_rate_limits_window ON auth_rate_limits(window_start);
-- Ops: periodically purge expired sessions and old rate limit buckets;
-- see scripts/ops/cleanup_auth_data.mjs (run with DATABASE_URL; no user records removed).
