-- Allow authenticated members to update their own profile goal.
-- The identity cloud-sync write updates goal alongside other profile fields.
-- Keep this grant column-scoped and preserve profiles_update_own RLS.
grant update (goal) on table public.profiles to authenticated;
