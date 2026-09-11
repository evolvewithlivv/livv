-- Security hardening for the A3-1 profiles table.
-- The client may edit profile presentation fields, but never payment/cache or server-owned fields.
-- The auth.users trigger remains the only bootstrap writer for new rows.

revoke insert on public.profiles from public, anon, authenticated;
revoke update on public.profiles from public, anon, authenticated;

grant update (
  username,
  display_name,
  bio,
  photo_url,
  accent,
  appearance
) on public.profiles to authenticated;

-- No client grant for id, tier, embers, created_at, or updated_at.
-- Anonymous sessions are represented by the authenticated role in Supabase.
