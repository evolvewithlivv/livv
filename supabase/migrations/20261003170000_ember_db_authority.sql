-- V1 Ember policy: the database derives award amounts from the validated action/size.
-- The server remains the only caller; the amount is no longer a function argument.

drop function if exists public.grant_embers(uuid, text, integer);

create or replace function public.grant_embers(
  p_user_id uuid,
  p_event_key text,
  p_action text,
  p_size text default null
)
returns table(awarded integer, total integer, tier text, multiplier integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_awarded integer := 0;
  v_total integer := 0;
  v_awards_today integer := 0;
  v_base_amount integer;
  v_action text := lower(trim(coalesce(p_action, '')));
  v_size text := lower(trim(coalesce(p_size, 'standard')));
begin
  if p_user_id is null then raise exception 'user id required'; end if;
  if p_event_key is null or length(trim(p_event_key)) < 12 or length(p_event_key) > 120 then
    raise exception 'invalid event key';
  end if;

  if v_action not in ('checkin','workout','objective','custom') then
    raise exception 'invalid ember action';
  end if;

  if v_action = 'checkin' then
    v_base_amount := 6;
  elsif v_action = 'workout' then
    v_base_amount := 10;
  elsif v_action = 'objective' then
    v_base_amount := 4;
  else
    if v_size = 'small' then
      v_base_amount := 4;
    elsif v_size = 'standard' then
      v_base_amount := 6;
    elsif v_size = 'major' then
      v_base_amount := 12;
    else
      raise exception 'invalid ember size';
    end if;
  end if;

  select count(*)::integer into v_awards_today
  from private.ember_awards
  where user_id = p_user_id
    and created_at >= date_trunc('day', now())
    and created_at < date_trunc('day', now()) + interval '1 day';

  if v_awards_today >= 20 then raise exception 'daily ember award limit reached'; end if;

  insert into private.ember_awards (user_id,event_key,base_amount,multiplier,awarded_amount)
  values (p_user_id,trim(p_event_key),v_base_amount,1,v_base_amount)
  on conflict (event_key) do nothing;

  if found then
    v_awarded := v_base_amount;
    update public.profiles
      set embers = greatest(0, coalesce(embers,0) + v_awarded), updated_at = now()
    where id = p_user_id
    returning embers into v_total;
  else
    select coalesce(p.embers,0) into v_total
    from public.profiles p where p.id = p_user_id;
  end if;

  if v_total is null then raise exception 'profile not found'; end if;
  return query select v_awarded,v_total,'spark',1;
end;
$$;

revoke execute on function public.grant_embers(uuid, text, text, text) from public, anon, authenticated;
grant execute on function public.grant_embers(uuid, text, text, text) to service_role;
