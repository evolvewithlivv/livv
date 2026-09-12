-- Defense-in-depth privilege hardening for client-facing LIVV tables.
-- RLS remains the authorization boundary; these grants remove unnecessary
-- table-level capabilities even if a policy is ever changed accidentally.

-- Server-owned billing data: clients may only read their own entitlement row
-- through the existing RLS SELECT policy.
revoke all on table public.entitlements from public, anon, authenticated;
grant select on table public.entitlements to authenticated;

-- Server-owned webhook idempotency log: no client table privileges.
revoke all on table public.stripe_webhook_events from public, anon, authenticated;

-- Profile presentation data: clients can read their own profile and update only
-- the explicitly granted presentation columns from the existing hardening migration.
revoke insert, delete, truncate, references, trigger on table public.profiles from public, anon, authenticated;
revoke update on table public.profiles from public, anon, authenticated;
grant select on table public.profiles to authenticated;
grant update (username, display_name, bio, photo_url, accent, appearance)
  on table public.profiles to authenticated;
