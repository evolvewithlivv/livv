-- LR-01. Direct PATCH /rest/v1/profiles must not skip the 30-day cooldown.
-- Signed-in username changes go through public.change_username.
-- Idempotent: revoking a missing column privilege is a no-op.

revoke update (username) on public.profiles from authenticated;

-- Rollback:
-- grant update (username) on public.profiles to authenticated;
