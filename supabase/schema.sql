-- LIVV Supabase schema index
-- -----------------------------------------------------------------------------
-- A3-1 (current): identity only — see migrations/a3_1_identity_profiles.sql
-- Apply that file in the Supabase SQL Editor for Anonymous Auth readiness.
--
-- Deferred (do not apply for A3-1):
--   records, pack_state, subscriptions — later sync / billing batches
--
-- Dashboard (manual, not SQL):
--   Authentication → Providers → Anonymous → Enable
-- -----------------------------------------------------------------------------

-- Re-export of A3-1 for convenience (same as migrations/a3_1_identity_profiles.sql).
-- Prefer running the migration file so history stays clear.

\i migrations/a3_1_identity_profiles.sql
