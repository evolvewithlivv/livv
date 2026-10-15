-- LIVV launch hardening reconciliation: make production auth policy scope explicit and
-- restore migration-tracked defense-in-depth for private limiter state.

alter table public.profiles enable row level security;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

create policy "profiles_insert_own" on public.profiles
for insert to authenticated
with check (
  (select auth.uid()) = id
  and coalesce((select (auth.jwt() ->> 'is_anonymous')::boolean), false) = false
);

create policy "profiles_select_own" on public.profiles
for select to authenticated
using (
  (select auth.uid()) = id
  and coalesce((select (auth.jwt() ->> 'is_anonymous')::boolean), false) = false
);

create policy "profiles_update_own" on public.profiles
for update to authenticated
using (
  (select auth.uid()) = id
  and coalesce((select (auth.jwt() ->> 'is_anonymous')::boolean), false) = false
)
with check (
  (select auth.uid()) = id
  and coalesce((select (auth.jwt() ->> 'is_anonymous')::boolean), false) = false
);

alter table private.evala_rate_limits enable row level security;
revoke all on table private.evala_rate_limits from public, anon, authenticated;

alter table public.stripe_webhook_events enable row level security;
revoke all on table public.stripe_webhook_events from public, anon, authenticated;


-- Performance reconciliation: keep auth context stable for each statement.
drop policy if exists "member_state_select_own" on public.member_state;
create policy "member_state_select_own" on public.member_state for select to authenticated using (
  (select auth.uid()) = user_id and coalesce((select (auth.jwt() ->> 'is_anonymous')::boolean), false) = false
);
drop policy if exists "member_state_insert_own" on public.member_state;
create policy "member_state_insert_own" on public.member_state for insert to authenticated with check (
  (select auth.uid()) = user_id and coalesce((select (auth.jwt() ->> 'is_anonymous')::boolean), false) = false
);
drop policy if exists "member_state_update_own" on public.member_state;
create policy "member_state_update_own" on public.member_state for update to authenticated using (
  (select auth.uid()) = user_id and coalesce((select (auth.jwt() ->> 'is_anonymous')::boolean), false) = false
) with check (
  (select auth.uid()) = user_id and coalesce((select (auth.jwt() ->> 'is_anonymous')::boolean), false) = false
);
