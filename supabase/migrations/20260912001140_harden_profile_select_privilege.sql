-- Profiles are owned by the authenticated LIVV member. Anonymous API access
-- is not needed for profile reads because the app establishes an auth session.
revoke select on table public.profiles from public, anon;
grant select on table public.profiles to authenticated;
