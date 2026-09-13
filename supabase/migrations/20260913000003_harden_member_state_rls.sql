-- Member state is permanent-account data, not anonymous-device data.
drop policy if exists "member_state_select_own" on public.member_state;
create policy "member_state_select_own"
  on public.member_state
  for select
  to authenticated
  using (
    (select auth.uid()) = user_id
    and (select (auth.jwt()->>'is_anonymous')::boolean) is false
  );

drop policy if exists "member_state_insert_own" on public.member_state;
create policy "member_state_insert_own"
  on public.member_state
  for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and (select (auth.jwt()->>'is_anonymous')::boolean) is false
  );

drop policy if exists "member_state_update_own" on public.member_state;
create policy "member_state_update_own"
  on public.member_state
  for update
  to authenticated
  using (
    (select auth.uid()) = user_id
    and (select (auth.jwt()->>'is_anonymous')::boolean) is false
  )
  with check (
    (select auth.uid()) = user_id
    and (select (auth.jwt()->>'is_anonymous')::boolean) is false
  );

alter function public.set_member_state_updated_at() set search_path = public;
