-- Allow authenticated members to persist onboarding completion.
-- Keep RLS as the row-level boundary; members can only update their own profile.
grant update (onboarding_completed_at) on table public.profiles to authenticated;
