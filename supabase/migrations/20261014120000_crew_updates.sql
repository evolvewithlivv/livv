-- LIVV Crew growth updates. Shared writes remain server-authoritative.
-- Do not apply to production without explicit approval.

create table if not exists public.crew_updates (
  id uuid primary key default gen_random_uuid(),
  crew_id uuid not null references public.crews(id) on delete cascade,
  author_user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null default 'growth' check (kind in ('growth','goal','support')),
  body text not null check (char_length(trim(body)) between 1 and 800),
  created_at timestamptz not null default now()
);
create index if not exists crew_updates_crew_created_idx
  on public.crew_updates(crew_id, created_at desc);
create index if not exists crew_updates_author_idx
  on public.crew_updates(author_user_id, created_at desc);

create table if not exists public.crew_encouragements (
  update_id uuid not null references public.crew_updates(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (update_id, user_id)
);
create index if not exists crew_encouragements_user_idx
  on public.crew_encouragements(user_id, created_at desc);

alter table public.crew_updates enable row level security;
alter table public.crew_encouragements enable row level security;

-- No direct client writes. Trusted API routes use service role after membership checks.
revoke all on public.crew_updates, public.crew_encouragements from anon, authenticated;
revoke insert, update, delete on public.crew_updates, public.crew_encouragements from anon, authenticated;

-- Members may read updates in crews they belong to (optional; server still preferred).
drop policy if exists "Crew members can read updates" on public.crew_updates;
create policy "Crew members can read updates" on public.crew_updates
for select to authenticated using (
  exists (
    select 1 from public.crew_members m
    where m.crew_id = crew_updates.crew_id
      and m.user_id = auth.uid()
      and m.status = 'active'
  )
);

drop policy if exists "Crew members can read encouragements" on public.crew_encouragements;
create policy "Crew members can read encouragements" on public.crew_encouragements
for select to authenticated using (
  exists (
    select 1
    from public.crew_updates u
    join public.crew_members m on m.crew_id = u.crew_id
    where u.id = crew_encouragements.update_id
      and m.user_id = auth.uid()
      and m.status = 'active'
  )
);

grant select on public.crew_updates, public.crew_encouragements to authenticated;

comment on table public.crew_updates is 'Member growth posts, goals, and support asks. Body only; no media in v1.';
comment on table public.crew_encouragements is 'Lightweight encouragement on a growth update. One per member per update.';
