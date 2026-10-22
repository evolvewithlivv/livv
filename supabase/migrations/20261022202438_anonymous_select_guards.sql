-- LR-08 and LR-09. Anonymous sessions use the authenticated role.
-- Crew SELECT policies keep the membership predicate read from pg_policies
-- on 2026-10-22 and add the same is_anonymous guard profiles already use.
-- (select auth.uid()) is the statement-stable form of auth.uid().
-- Idempotent: each policy is dropped and recreated.

drop policy if exists "entitlements_select_own" on public.entitlements;
create policy "entitlements_select_own" on public.entitlements
  for select to authenticated
  using (
    (select auth.uid()) = user_id
    and coalesce((select (auth.jwt() ->> 'is_anonymous')::boolean), false) = false
  );

-- Fresh replay names this policy "members can read own pack purchases".
-- Production already uses pack_purchases_select_own. Drop both so the
-- unguarded policy cannot remain OR-ed with the guarded one.
drop policy if exists "members can read own pack purchases" on public.pack_purchases;
drop policy if exists "pack_purchases_select_own" on public.pack_purchases;
create policy "pack_purchases_select_own" on public.pack_purchases
  for select to authenticated
  using (
    (select auth.uid()) = user_id
    and coalesce((select (auth.jwt() ->> 'is_anonymous')::boolean), false) = false
  );

drop policy if exists "Crew members can view their active crews" on public.crews;
create policy "Crew members can view their active crews" on public.crews
  for select to authenticated
  using (
    exists (
      select 1 from public.crew_members m
      where m.crew_id = crews.id
        and m.user_id = (select auth.uid())
        and m.status = 'active'
    )
    and coalesce((select (auth.jwt() ->> 'is_anonymous')::boolean), false) = false
  );

drop policy if exists "Members can view own membership" on public.crew_members;
create policy "Members can view own membership" on public.crew_members
  for select to authenticated
  using (
    user_id = (select auth.uid())
    and coalesce((select (auth.jwt() ->> 'is_anonymous')::boolean), false) = false
  );

drop policy if exists "Members can view crew challenges" on public.crew_challenges;
create policy "Members can view crew challenges" on public.crew_challenges
  for select to authenticated
  using (
    crew_id is not null
    and exists (
      select 1 from public.crew_members m
      where m.crew_id = crew_challenges.crew_id
        and m.user_id = (select auth.uid())
        and m.status = 'active'
    )
    and coalesce((select (auth.jwt() ->> 'is_anonymous')::boolean), false) = false
  );

drop policy if exists "Crew members can read updates" on public.crew_updates;
create policy "Crew members can read updates" on public.crew_updates
  for select to authenticated
  using (
    exists (
      select 1 from public.crew_members m
      where m.crew_id = crew_updates.crew_id
        and m.user_id = (select auth.uid())
        and m.status = 'active'
    )
    and coalesce((select (auth.jwt() ->> 'is_anonymous')::boolean), false) = false
  );

drop policy if exists "Crew members can read encouragements" on public.crew_encouragements;
create policy "Crew members can read encouragements" on public.crew_encouragements
  for select to authenticated
  using (
    exists (
      select 1
      from public.crew_updates u
      join public.crew_members m on m.crew_id = u.crew_id
      where u.id = crew_encouragements.update_id
        and m.user_id = (select auth.uid())
        and m.status = 'active'
    )
    and coalesce((select (auth.jwt() ->> 'is_anonymous')::boolean), false) = false
  );

-- Rollback (previous predicates, without the anonymous guard):
-- drop policy if exists "entitlements_select_own" on public.entitlements;
-- create policy "entitlements_select_own" on public.entitlements
--   for select to authenticated using ((select auth.uid()) = user_id);
-- drop policy if exists "pack_purchases_select_own" on public.pack_purchases;
-- create policy "pack_purchases_select_own" on public.pack_purchases
--   for select to authenticated using ((select auth.uid()) = user_id);
-- drop policy if exists "Crew members can view their active crews" on public.crews;
-- create policy "Crew members can view their active crews" on public.crews
--   for select to authenticated using (
--     exists (select 1 from public.crew_members m where m.crew_id = crews.id and m.user_id = auth.uid() and m.status = 'active')
--   );
-- drop policy if exists "Members can view own membership" on public.crew_members;
-- create policy "Members can view own membership" on public.crew_members
--   for select to authenticated using (user_id = auth.uid());
-- drop policy if exists "Members can view crew challenges" on public.crew_challenges;
-- create policy "Members can view crew challenges" on public.crew_challenges
--   for select to authenticated using (
--     crew_id is not null and exists (select 1 from public.crew_members m where m.crew_id = crew_challenges.crew_id and m.user_id = auth.uid() and m.status = 'active')
--   );
-- drop policy if exists "Crew members can read updates" on public.crew_updates;
-- create policy "Crew members can read updates" on public.crew_updates
--   for select to authenticated using (
--     exists (select 1 from public.crew_members m where m.crew_id = crew_updates.crew_id and m.user_id = auth.uid() and m.status = 'active')
--   );
-- drop policy if exists "Crew members can read encouragements" on public.crew_encouragements;
-- create policy "Crew members can read encouragements" on public.crew_encouragements
--   for select to authenticated using (
--     exists (select 1 from public.crew_updates u join public.crew_members m on m.crew_id = u.crew_id where u.id = crew_encouragements.update_id and m.user_id = auth.uid() and m.status = 'active')
--   );
