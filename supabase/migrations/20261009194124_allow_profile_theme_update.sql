-- Allow authenticated users to update their own theme preference.
-- The profile hydrator updates theme alongside other presentation fields.
-- Without this column grant, PostgreSQL rejects the entire UPDATE statement.
-- Keep the existing profiles_update_own RLS policy in force; do not grant
-- broad table-level UPDATE or INSERT privileges.
grant update (theme) on table public.profiles to authenticated;
