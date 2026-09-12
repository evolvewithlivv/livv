-- Lock trigger/helper functions to server-owned execution.
-- These functions are invoked by database triggers; clients do not need RPC
-- EXECUTE privileges on them.

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.set_profiles_updated_at() from public, anon, authenticated;
revoke execute on function public.set_entitlements_updated_at() from public, anon, authenticated;

grant execute on function public.handle_new_user() to service_role;
grant execute on function public.set_profiles_updated_at() to service_role;
grant execute on function public.set_entitlements_updated_at() to service_role;
