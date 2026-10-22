-- LR-02. One SECURITY DEFINER function for account deletion.
-- The function runs as a single transaction. It clears ON DELETE RESTRICT
-- rows (crews.created_by, crew_challenges.created_by, crew_invitations.created_by)
-- and then deletes member_state, entitlements, and profiles.
-- auth.admin.deleteUser runs after this commits, from the edge function,
-- because GoTrue uses another connection and cannot see an uncommitted
-- delete. Pass the returned jsonb as p_restore to undo that transaction
-- when deleteUser fails. crew_audit_events are not deleted; crew_id is set
-- null by the existing FK and restored with the crew.
-- Execute is service_role only. Idempotent: create or replace, then re-grant.

create or replace function public.delete_account_data(
  p_user_id uuid,
  p_restore jsonb default null
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_anonymous boolean;
  v_profile jsonb;
  v_member_state jsonb;
  v_entitlements jsonb;
  v_deleted_crews jsonb := '[]'::jsonb;
  v_deleted_challenges jsonb := '[]'::jsonb;
  v_deleted_invitations jsonb := '[]'::jsonb;
  v_reassigned jsonb := '[]'::jsonb;
  v_crew public.crews%rowtype;
  v_challenge public.crew_challenges%rowtype;
  v_invitation public.crew_invitations%rowtype;
  v_successor uuid;
  v_previous_role text;
  v_role_to_restore text;
  v_other_active boolean;
  v_item jsonb;
begin
  if p_user_id is null or coalesce(auth.role(), '') is distinct from 'service_role' then
    raise exception 'Account deletion is not available.';
  end if;

  if p_restore is not null then
    if jsonb_typeof(p_restore) is distinct from 'object'
       or (p_restore->>'user_id') is distinct from p_user_id::text then
      raise exception 'Account restore payload does not match this user.';
    end if;

    perform 1 from auth.users where id = p_user_id for update;
    if not found then
      raise exception 'Account not found.';
    end if;

    for v_item in
      select value from jsonb_array_elements(coalesce(p_restore->'deleted_crews', '[]'::jsonb))
    loop
      if not exists (
        select 1 from public.crews where id = (v_item->'crew'->>'id')::uuid
      ) then
        insert into public.crews
        select r.* from jsonb_populate_record(null::public.crews, v_item->'crew') as r;

        insert into public.crew_members
        select r.* from jsonb_populate_recordset(null::public.crew_members, coalesce(v_item->'members', '[]'::jsonb)) as r;

        insert into public.crew_invitations
        select r.* from jsonb_populate_recordset(null::public.crew_invitations, coalesce(v_item->'invitations', '[]'::jsonb)) as r;

        insert into public.crew_challenges
        select r.* from jsonb_populate_recordset(null::public.crew_challenges, coalesce(v_item->'challenges', '[]'::jsonb)) as r;

        insert into public.crew_challenge_members
        select r.* from jsonb_populate_recordset(null::public.crew_challenge_members, coalesce(v_item->'challenge_members', '[]'::jsonb)) as r;

        insert into public.crew_completions
        select r.* from jsonb_populate_recordset(null::public.crew_completions, coalesce(v_item->'completions', '[]'::jsonb)) as r;

        insert into public.crew_updates
        select r.* from jsonb_populate_recordset(null::public.crew_updates, coalesce(v_item->'updates', '[]'::jsonb)) as r;

        insert into public.crew_encouragements
        select r.* from jsonb_populate_recordset(null::public.crew_encouragements, coalesce(v_item->'encouragements', '[]'::jsonb)) as r;

        update public.crew_audit_events
        set crew_id = (v_item->'crew'->>'id')::uuid
        where crew_id is null
          and id in (
            select value::bigint
            from jsonb_array_elements_text(coalesce(v_item->'audit_ids', '[]'::jsonb))
          );
      end if;
    end loop;

    for v_item in
      select value from jsonb_array_elements(coalesce(p_restore->'deleted_challenges', '[]'::jsonb))
    loop
      if not exists (
        select 1 from public.crew_challenges where id = (v_item->'challenge'->>'id')::uuid
      ) then
        insert into public.crew_challenges
        select r.* from jsonb_populate_record(null::public.crew_challenges, v_item->'challenge') as r;

        insert into public.crew_challenge_members
        select r.* from jsonb_populate_recordset(null::public.crew_challenge_members, coalesce(v_item->'members', '[]'::jsonb)) as r;

        insert into public.crew_completions
        select r.* from jsonb_populate_recordset(null::public.crew_completions, coalesce(v_item->'completions', '[]'::jsonb)) as r;
      end if;
    end loop;

    for v_item in
      select value from jsonb_array_elements(coalesce(p_restore->'deleted_invitations', '[]'::jsonb))
    loop
      if not exists (
        select 1 from public.crew_invitations where id = (v_item->>'id')::uuid
      ) then
        insert into public.crew_invitations
        select r.* from jsonb_populate_record(null::public.crew_invitations, v_item) as r;
      end if;
    end loop;

    for v_item in
      select value from jsonb_array_elements(coalesce(p_restore->'reassigned', '[]'::jsonb))
    loop
      if v_item->>'relation' = 'crews' then
        update public.crews
        set created_by = (v_item->>'previous_created_by')::uuid
        where id = (v_item->>'id')::uuid
          and created_by = (v_item->>'successor')::uuid;
        if nullif(v_item->>'successor_previous_role', '') is not null then
          update public.crew_members
          set role = v_item->>'successor_previous_role'
          where crew_id = (v_item->>'id')::uuid
            and user_id = (v_item->>'successor')::uuid
            and role = 'owner';
        end if;
      elsif v_item->>'relation' = 'crew_challenges' then
        update public.crew_challenges
        set created_by = (v_item->>'previous_created_by')::uuid
        where id = (v_item->>'id')::uuid
          and created_by = (v_item->>'successor')::uuid;
      elsif v_item->>'relation' = 'crew_invitations' then
        update public.crew_invitations
        set created_by = (v_item->>'previous_created_by')::uuid
        where id = (v_item->>'id')::uuid
          and created_by = (v_item->>'successor')::uuid;
      end if;
    end loop;

    if p_restore->'profile' is not null and jsonb_typeof(p_restore->'profile') = 'object' then
      if (p_restore->'profile'->>'id') is distinct from p_user_id::text then
        raise exception 'Account restore payload does not match this user.';
      end if;
      insert into public.profiles
      select r.* from jsonb_populate_record(null::public.profiles, p_restore->'profile') as r
      on conflict (id) do nothing;
      update public.profiles as p
      set tier = s.tier,
          embers = s.embers
      from jsonb_populate_record(null::public.profiles, p_restore->'profile') as s
      where p.id = p_user_id;
    end if;

    if p_restore->'member_state' is not null and jsonb_typeof(p_restore->'member_state') = 'object' then
      insert into public.member_state
      select r.* from jsonb_populate_record(null::public.member_state, p_restore->'member_state') as r
      on conflict (user_id) do nothing;
    end if;

    if p_restore->'entitlements' is not null and jsonb_typeof(p_restore->'entitlements') = 'object' then
      insert into public.entitlements
      select r.* from jsonb_populate_record(null::public.entitlements, p_restore->'entitlements') as r
      on conflict (user_id) do nothing;
    end if;

    return jsonb_build_object('restored', true, 'user_id', p_user_id);
  end if;

  select coalesce(u.is_anonymous, false)
    into v_anonymous
  from auth.users as u
  where u.id = p_user_id
  for update;

  if not found then
    raise exception 'Account not found.';
  end if;
  if v_anonymous then
    raise exception 'Anonymous accounts cannot be deleted.';
  end if;

  select to_jsonb(p) into v_profile from public.profiles as p where p.id = p_user_id;
  select to_jsonb(m) into v_member_state from public.member_state as m where m.user_id = p_user_id;
  select to_jsonb(e) into v_entitlements from public.entitlements as e where e.user_id = p_user_id;

  for v_crew in
    select *
    from public.crews
    where created_by = p_user_id
    order by id
    for update
  loop
    v_other_active := exists (
      select 1
      from public.crew_members as m
      where m.crew_id = v_crew.id
        and m.user_id <> p_user_id
        and m.status = 'active'
    );

    if not v_other_active then
      v_deleted_crews := v_deleted_crews || jsonb_build_array(jsonb_build_object(
        'crew', to_jsonb(v_crew),
        'members', coalesce((select jsonb_agg(to_jsonb(m)) from public.crew_members as m where m.crew_id = v_crew.id), '[]'::jsonb),
        'invitations', coalesce((select jsonb_agg(to_jsonb(i)) from public.crew_invitations as i where i.crew_id = v_crew.id), '[]'::jsonb),
        'challenges', coalesce((select jsonb_agg(to_jsonb(c)) from public.crew_challenges as c where c.crew_id = v_crew.id), '[]'::jsonb),
        'challenge_members', coalesce((
          select jsonb_agg(to_jsonb(cm))
          from public.crew_challenge_members as cm
          join public.crew_challenges as c on c.id = cm.challenge_id
          where c.crew_id = v_crew.id
        ), '[]'::jsonb),
        'completions', coalesce((
          select jsonb_agg(to_jsonb(cc))
          from public.crew_completions as cc
          join public.crew_challenges as c on c.id = cc.challenge_id
          where c.crew_id = v_crew.id
        ), '[]'::jsonb),
        'updates', coalesce((select jsonb_agg(to_jsonb(u)) from public.crew_updates as u where u.crew_id = v_crew.id), '[]'::jsonb),
        'encouragements', coalesce((
          select jsonb_agg(to_jsonb(en))
          from public.crew_encouragements as en
          join public.crew_updates as u on u.id = en.update_id
          where u.crew_id = v_crew.id
        ), '[]'::jsonb),
        'audit_ids', coalesce((select jsonb_agg(e.id) from public.crew_audit_events as e where e.crew_id = v_crew.id), '[]'::jsonb)
      ));
      delete from public.crews where id = v_crew.id;
    else
      select m.user_id, m.role
        into v_successor, v_previous_role
      from public.crew_members as m
      where m.crew_id = v_crew.id
        and m.user_id <> p_user_id
        and m.status = 'active'
      order by case m.role when 'owner' then 0 when 'admin' then 1 else 2 end,
               m.joined_at,
               m.user_id
      limit 1;

      if v_successor is null then
        raise exception 'Crew ownership could not be reassigned.';
      end if;

      update public.crews
      set created_by = v_successor,
          updated_at = pg_catalog.now()
      where id = v_crew.id;

      v_role_to_restore := null;
      if v_previous_role is distinct from 'owner'
         and not exists (
           select 1
           from public.crew_members as m
           where m.crew_id = v_crew.id
             and m.user_id <> p_user_id
             and m.status = 'active'
             and m.role = 'owner'
         ) then
        update public.crew_members
        set role = 'owner'
        where crew_id = v_crew.id
          and user_id = v_successor;
        v_role_to_restore := v_previous_role;
      end if;

      v_reassigned := v_reassigned || jsonb_build_array(jsonb_build_object(
        'relation', 'crews',
        'id', v_crew.id,
        'previous_created_by', v_crew.created_by,
        'successor', v_successor,
        'successor_previous_role', v_role_to_restore
      ));
    end if;
  end loop;

  for v_challenge in
    select *
    from public.crew_challenges
    where created_by = p_user_id
    order by id
    for update
  loop
    v_other_active := v_challenge.crew_id is not null and exists (
      select 1
      from public.crew_members as m
      where m.crew_id = v_challenge.crew_id
        and m.user_id <> p_user_id
        and m.status = 'active'
    );

    if not v_other_active then
      v_deleted_challenges := v_deleted_challenges || jsonb_build_array(jsonb_build_object(
        'challenge', to_jsonb(v_challenge),
        'members', coalesce((select jsonb_agg(to_jsonb(cm)) from public.crew_challenge_members as cm where cm.challenge_id = v_challenge.id), '[]'::jsonb),
        'completions', coalesce((select jsonb_agg(to_jsonb(cc)) from public.crew_completions as cc where cc.challenge_id = v_challenge.id), '[]'::jsonb)
      ));
      delete from public.crew_challenges where id = v_challenge.id;
    else
      select m.user_id
        into v_successor
      from public.crew_members as m
      where m.crew_id = v_challenge.crew_id
        and m.user_id <> p_user_id
        and m.status = 'active'
      order by case m.role when 'owner' then 0 when 'admin' then 1 else 2 end,
               m.joined_at,
               m.user_id
      limit 1;

      if v_successor is null then
        raise exception 'Crew ownership could not be reassigned.';
      end if;

      update public.crew_challenges
      set created_by = v_successor
      where id = v_challenge.id;

      v_reassigned := v_reassigned || jsonb_build_array(jsonb_build_object(
        'relation', 'crew_challenges',
        'id', v_challenge.id,
        'previous_created_by', v_challenge.created_by,
        'successor', v_successor
      ));
    end if;
  end loop;

  for v_invitation in
    select *
    from public.crew_invitations
    where created_by = p_user_id
    order by id
    for update
  loop
    v_other_active := exists (
      select 1
      from public.crew_members as m
      where m.crew_id = v_invitation.crew_id
        and m.user_id <> p_user_id
        and m.status = 'active'
    );

    if not v_other_active then
      v_deleted_invitations := v_deleted_invitations || jsonb_build_array(to_jsonb(v_invitation));
      delete from public.crew_invitations where id = v_invitation.id;
    else
      select m.user_id
        into v_successor
      from public.crew_members as m
      where m.crew_id = v_invitation.crew_id
        and m.user_id <> p_user_id
        and m.status = 'active'
      order by case m.role when 'owner' then 0 when 'admin' then 1 else 2 end,
               m.joined_at,
               m.user_id
      limit 1;

      if v_successor is null then
        raise exception 'Crew ownership could not be reassigned.';
      end if;

      update public.crew_invitations
      set created_by = v_successor
      where id = v_invitation.id;

      v_reassigned := v_reassigned || jsonb_build_array(jsonb_build_object(
        'relation', 'crew_invitations',
        'id', v_invitation.id,
        'previous_created_by', v_invitation.created_by,
        'successor', v_successor
      ));
    end if;
  end loop;

  delete from public.member_state where user_id = p_user_id;
  delete from public.entitlements where user_id = p_user_id;
  delete from public.profiles where id = p_user_id;

  return jsonb_build_object(
    'user_id', p_user_id,
    'profile', v_profile,
    'member_state', v_member_state,
    'entitlements', v_entitlements,
    'deleted_crews', v_deleted_crews,
    'deleted_challenges', v_deleted_challenges,
    'deleted_invitations', v_deleted_invitations,
    'reassigned', v_reassigned
  );
end;
$$;

revoke all on function public.delete_account_data(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.delete_account_data(uuid, jsonb) to service_role;

comment on function public.delete_account_data(uuid, jsonb) is
  'Service-role account cleanup. Reassigns or deletes RESTRICT crew ownership, then removes member_state, entitlements, and profiles. Pass p_restore to roll those writes back.';

-- Rollback:
-- revoke all on function public.delete_account_data(uuid, jsonb) from service_role;
-- drop function if exists public.delete_account_data(uuid, jsonb);
